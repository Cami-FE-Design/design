"use client"

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  HeartIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useId, useState } from "react"

import { formatDuration, MOCK_STAFF, type MockServiceCatalogItem } from "@/app/appointments/mock"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Mirrors SelectedService from new-appointment-sheet.tsx but redeclared here
// to keep this file standalone — the shapes are deliberately the same so
// onSave can return a value the sheet plugs straight back into pets state.
export type EditableService = {
  uid: string
  catalog: MockServiceCatalogItem
  startTime: string
  staffName?: string
  /** Optional discount, in AED minor. Stub for now — not wired into totals. */
  discountMinor?: number
  /** Optional service-price override. Falls back to catalog priceMinor. */
  priceOverrideMinor?: number
}

type EditServicePanelProps = {
  service: EditableService
  onBack: () => void
  onApply: (next: EditableService) => void
  onDelete: () => void
  /** Opens the "Select a service" picker; the parent applies the chosen catalog back. */
  onChangeService: () => void
}

// Match Input's h-12 / rounded-2xl so Select triggers don't look shorter.
// Same pattern used by add-team-member-dialog.tsx, codified in user memory.
const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const DISCOUNT_OPTIONS = [
  { value: "none", label: "No discount" },
  { value: "10pct", label: "10% off" },
  { value: "20pct", label: "20% off" },
  { value: "50pct", label: "50% off" },
  { value: "free", label: "Complimentary" },
]

// Quarter-hour grid from 7am to 7pm, shared with the calendar's day window.
const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = []
  for (let h = 7; h <= 19; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, "0")
      const mm = String(m).padStart(2, "0")
      const value = `${hh}:${mm}`
      const period = h >= 12 ? "pm" : "am"
      const display = ((h + 11) % 12) + 1
      out.push({ value, label: `${display}:${mm}${period}` })
    }
  }
  return out
})()

// Full duration list (matches Fresha's granularity ladder):
//   5min steps up to 2h, then 15min steps to 4h, 30min steps to 8h, 1h steps to 13h.
const DURATION_OPTIONS = (() => {
  const out: { value: number; label: string }[] = []
  for (let m = 5; m <= 120; m += 5) out.push({ value: m, label: formatDuration(m) })
  for (let m = 135; m <= 240; m += 15) out.push({ value: m, label: formatDuration(m) })
  for (let m = 270; m <= 480; m += 30) out.push({ value: m, label: formatDuration(m) })
  for (let m = 540; m <= 780; m += 60) out.push({ value: m, label: formatDuration(m) })
  return out
})()

type ExtraTimeType = "processing" | "blocked" | "extra-servicing"

type ExtraTimeSegment = {
  id: string
  type: ExtraTimeType
  durationMin: number
}

const EXTRA_TIME_META: Record<ExtraTimeType, { label: string; description: string }> = {
  processing: {
    label: "Processing time",
    description:
      "Team member becomes available during processing time. Included in durations shown to clients.",
  },
  blocked: {
    label: "Blocked time",
    description:
      "Team member remains occupied during blocked time. Excluded from durations shown to clients.",
  },
  "extra-servicing": {
    label: "Extra servicing time",
    description:
      "Team member remains occupied during servicing time. Included in durations shown to clients.",
  },
}

const EXTRA_TIME_TYPES: ExtraTimeType[] = ["processing", "blocked", "extra-servicing"]

// Mock shift windows — when a staff member isn't in this map they're treated as
// "not scheduled" for the day. Times use the same HH:mm grid as TIME_OPTIONS.
const STAFF_SHIFTS: Record<string, { start: string; end: string }> = {
  "Aya Hassan": { start: "09:00", end: "17:00" },
  "Lena Petrov": { start: "10:00", end: "18:00" },
  "Priya Nair": { start: "08:00", end: "14:00" },
  "Marco Rossi": { start: "11:00", end: "19:00" },
}

// Mock double-booking set — staff already booked at the selected start time.
const DOUBLE_BOOKED_STAFF = new Set(["Lena Petrov", "Joel Batumbya"])

export function EditServicePanel({
  service,
  onBack,
  onApply,
  onDelete,
  onChangeService,
}: EditServicePanelProps) {
  const [staffName, setStaffName] = useState(service.staffName ?? "")
  const [preferred, setPreferred] = useState(false)
  const [changeServiceConfirmOpen, setChangeServiceConfirmOpen] = useState(false)
  const [price, setPrice] = useState(
    String((service.priceOverrideMinor ?? service.catalog.priceMinor) / 100),
  )
  const [discount, setDiscount] = useState(service.discountMinor ? "10pct" : "none")
  const [startTime, setStartTime] = useState(service.startTime)
  const [duration, setDuration] = useState(service.catalog.durationMin)
  const [extraTimes, setExtraTimes] = useState<ExtraTimeSegment[]>([])
  const segmentIdPrefix = useId()
  const hasExtraTimes = extraTimes.length > 0

  function addExtraTime(type: ExtraTimeType) {
    setExtraTimes((prev) => [
      ...prev,
      { id: `${segmentIdPrefix}-${prev.length}`, type, durationMin: 10 },
    ])
  }
  function updateExtraTime(id: string, patch: Partial<Omit<ExtraTimeSegment, "id">>) {
    setExtraTimes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function removeExtraTime(id: string) {
    setExtraTimes((prev) => prev.filter((s) => s.id !== id))
  }
  function moveExtraTime(id: string, direction: -1 | 1) {
    setExtraTimes((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const target = idx + direction
      if (idx < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const catalog = service.catalog
  const staffMember = MOCK_STAFF.find((s) => s.name === staffName)
  // Mock provider matrix: only a couple of staff are marked as providing
  // every demo service. Real implementation reads the staff×service matrix.
  const PROVIDERS_BY_DEFAULT = ["Aya Hassan", "Lena Petrov", "Priya Nair", "Marco Rossi"]
  function providesService(staffName: string): boolean {
    return PROVIDERS_BY_DEFAULT.includes(staffName)
  }
  const suitableStaff = MOCK_STAFF.filter((s) => providesService(s.name))
  const notSuitableStaff = MOCK_STAFF.filter((s) => !providesService(s.name))
  const staffProvidesService = staffMember ? providesService(staffMember.name) : true
  const staffDoubleBooked = staffMember ? DOUBLE_BOOKED_STAFF.has(staffMember.name) : false
  const shift = staffMember ? STAFF_SHIFTS[staffMember.name] : null
  const startInShift =
    !staffMember || (!!shift && startTime >= shift.start && startTime < shift.end)
  const staffScheduled = !staffMember || !!shift

  const teamIssues: string[] = []
  if (staffMember && !staffProvidesService) {
    teamIssues.push(`doesn't provide ${catalog.name}`)
  }
  if (staffMember && staffDoubleBooked) {
    teamIssues.push("has another booking at this time")
  }
  const teamWarning =
    staffMember && teamIssues.length > 0 ? `${staffMember.name} ${teamIssues.join(" and ")}` : null
  const hasTeamWarning = teamWarning !== null
  const startWarning = staffMember
    ? !staffScheduled
      ? `${staffMember.name} isn't scheduled to work today`
      : !startInShift
        ? "Not available on this day"
        : null
    : null
  const hasStartWarning = startWarning !== null
  const totalDuration = duration + extraTimes.reduce((sum, segment) => sum + segment.durationMin, 0)

  function handleApply() {
    const priceMinor = Math.round(Number(price) * 100) || catalog.priceMinor
    onApply({
      uid: service.uid,
      catalog: { ...catalog, durationMin: duration },
      startTime,
      staffName: staffName || undefined,
      priceOverrideMinor: priceMinor === catalog.priceMinor ? undefined : priceMinor,
      discountMinor: discount === "none" ? undefined : 0,
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon />
          Back
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-sand-2 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground">
          Edit service
        </h2>

        {/* Service selector — opens the full "Select a service" picker with search. */}
        <button
          type="button"
          onClick={() => setChangeServiceConfirmOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-input px-4 py-3 text-start transition-colors hover:bg-muted/40"
        >
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-base font-semibold leading-tight text-foreground">
              {catalog.name}, {formatDuration(duration)}
            </span>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        {/* Team member + favorite */}
        <div className="flex flex-col gap-2">
          <Label>Team member</Label>
          <div className="flex items-center gap-2">
            <Select
              value={staffName}
              onValueChange={(next) => {
                setStaffName(next)
                if (!next) setPreferred(false)
              }}
            >
              <SelectTrigger className={cn(triggerOverride, "flex-1")}>
                <SelectValue placeholder="Any team member">
                  {staffMember ? (
                    <span className="inline-flex w-full items-center gap-2">
                      <Avatar
                        name={staffMember.name}
                        fallback="initials"
                        size="sm"
                        shape="circle"
                        className="ring-0"
                      />
                      <span className="flex-1 truncate">{staffMember.name}</span>
                    </span>
                  ) : (
                    "Any team member"
                  )}
                </SelectValue>
                {hasTeamWarning ? (
                  <span
                    aria-hidden
                    className="ml-1 inline-block size-2 rounded-full bg-cami-yellow-9"
                  />
                ) : null}
              </SelectTrigger>
              <SelectContent>
                {suitableStaff.length > 0 ? (
                  <SelectGroup>
                    {suitableStaff.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        <span className="inline-flex items-center gap-2">
                          <Avatar name={s.name} fallback="initials" size="sm" shape="circle" />
                          <span>{s.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
                {notSuitableStaff.length > 0 ? (
                  <SelectGroup>
                    <SelectLabel className="text-muted-foreground">Not suitable</SelectLabel>
                    {notSuitableStaff.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="items-center gap-2.5">
                        <Avatar name={s.name} fallback="initials" size="sm" shape="circle" />
                        <div className="flex flex-1 flex-col leading-tight">
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Doesn&rsquo;t provide this service
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xl"
                  radius="full"
                  aria-label={
                    preferred ? "Remove preferred team member" : "Mark preferred team member"
                  }
                  aria-pressed={preferred}
                  disabled={!staffMember}
                  onClick={() => setPreferred((v) => !v)}
                >
                  <HeartIcon
                    className="size-5"
                    aria-hidden
                    fill={preferred && staffMember ? "currentColor" : "none"}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {preferred ? "Preferred team member" : "Mark as preferred"}
              </TooltipContent>
            </Tooltip>
          </div>
          {teamWarning ? (
            <p className="flex items-start gap-1.5 text-xs text-cami-yellow-11">
              <TriangleAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>{teamWarning}</span>
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="service-price">Service price</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                AED
              </span>
              <Input
                id="service-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-14 text-end font-medium tabular-nums"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Discount</Label>
            <Select value={discount} onValueChange={setDiscount}>
              <SelectTrigger className={cn(triggerOverride, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCOUNT_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasExtraTimes ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>Start time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className={cn(triggerOverride, "w-full")}>
                  <SelectValue />
                  {hasStartWarning ? (
                    <span
                      aria-hidden
                      className="ml-1 inline-block size-2 rounded-full bg-cami-yellow-9"
                    />
                  ) : null}
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasStartWarning ? (
                <p className="flex items-start gap-1.5 text-xs text-cami-yellow-11">
                  <TriangleAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden />
                  <span>{startWarning}</span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[1fr_1fr_2rem] gap-3">
                <Label>Duration type</Label>
                <Label>Duration</Label>
                <span />
              </div>

              <div className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3">
                <Select value="servicing" disabled>
                  <SelectTrigger className={cn(triggerOverride, "w-full opacity-60")}>
                    <SelectValue>Servicing time</SelectValue>
                  </SelectTrigger>
                </Select>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger className={cn(triggerOverride, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span />
              </div>

              {extraTimes.map((segment, segmentIdx) => (
                <div key={segment.id} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3">
                  <Select
                    value={segment.type}
                    onValueChange={(v) => updateExtraTime(segment.id, { type: v as ExtraTimeType })}
                  >
                    <SelectTrigger className={cn(triggerOverride, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXTRA_TIME_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {EXTRA_TIME_META[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(segment.durationMin)}
                    onValueChange={(v) => updateExtraTime(segment.id, { durationMin: Number(v) })}
                  >
                    <SelectTrigger className={cn(triggerOverride, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={String(d.value)}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        radius="full"
                        aria-label={`More options for ${EXTRA_TIME_META[segment.type].label}`}
                      >
                        <MoreHorizontalIcon className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => moveExtraTime(segment.id, -1)}
                        disabled={segmentIdx === 0}
                      >
                        <ArrowUpIcon className="size-4" aria-hidden />
                        Move up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => moveExtraTime(segment.id, 1)}
                        disabled={segmentIdx === extraTimes.length - 1}
                      >
                        <ArrowDownIcon className="size-4" aria-hidden />
                        Move down
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => removeExtraTime(segment.id)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Start time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className={cn(triggerOverride, "w-full")}>
                    <SelectValue />
                    {hasStartWarning ? (
                      <span
                        aria-hidden
                        className="ml-1 inline-block size-2 rounded-full bg-cami-yellow-9"
                      />
                    ) : null}
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Duration</Label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger className={cn(triggerOverride, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasStartWarning ? (
              <p className="flex items-start gap-1.5 text-xs text-cami-yellow-11">
                <TriangleAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden />
                <span>Not available on this day</span>
              </p>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" radius="full" size="sm">
                <PlusIcon className="size-4" aria-hidden />
                Add extra time
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {EXTRA_TIME_TYPES.map((t) => (
                <DropdownMenuItem
                  key={t}
                  className="flex-col items-start gap-0.5"
                  onSelect={() => addExtraTime(t)}
                >
                  <span className="font-medium">{EXTRA_TIME_META[t].label}</span>
                  <span className="whitespace-normal text-xs text-muted-foreground">
                    {EXTRA_TIME_META[t].description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums">{formatDuration(totalDuration)}</span>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                radius="full"
                aria-label="More options"
              >
                <MoreHorizontalIcon className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" radius="full" onClick={handleApply} className="flex-1">
            Update
          </Button>
        </div>
      </footer>
      <ConfirmDialog
        open={changeServiceConfirmOpen}
        onOpenChange={setChangeServiceConfirmOpen}
        title="Change service"
        description="Service customizations and add-on selections will be lost. Are you sure you want to proceed?"
        confirmLabel="Update"
        onConfirm={onChangeService}
      />
    </div>
  )
}
