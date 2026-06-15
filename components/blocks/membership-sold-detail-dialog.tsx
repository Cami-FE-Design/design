"use client"

import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CirclePauseIcon,
  CirclePlayIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { membershipColorClass } from "@/components/blocks/memberships-table"
import { MOCK_SERVICES } from "@/components/blocks/select-services-dialog"
import {
  formatAed,
  formatSoldDate,
  type SoldActivityEntry,
  type SoldAppointment,
  type SoldMembership,
  SoldStatusBadge,
} from "@/components/blocks/sold-memberships"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// The demo "today" — new activity entries are stamped with this date.
const TODAY = "2026-06-15"

type ActivityFilter = "all" | "status" | "upcoming" | "past"

type MembershipSoldDetailDialogProps = {
  membership: SoldMembership | null
  onOpenChange: (open: boolean) => void
  /** Pause/resume mutate the row in the parent list so the listing badge stays in sync. */
  onPause: (id: string, entry: SoldActivityEntry) => void
  onResume: (id: string, entry: SoldActivityEntry) => void
}

export function MembershipSoldDetailDialog({
  membership,
  onOpenChange,
  onPause,
  onResume,
}: MembershipSoldDetailDialogProps) {
  const open = membership !== null
  // Hold the last value so the dialog animates out with content still rendered.
  const [last, setLast] = useState<SoldMembership | null>(membership)
  const [filter, setFilter] = useState<ActivityFilter>("all")
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseNote, setPauseNote] = useState("")
  const [servicesOpen, setServicesOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)

  if (membership && membership !== last) {
    setLast(membership)
    setFilter("all")
  }

  const data = membership ?? last
  if (!data) return null

  const isPaused = data.status === "paused"
  // Activity = status-change events; appointments live in their own buckets.
  // "All" merges both; each filter narrows to its slice.
  const upcoming = data.appointments.filter((a) => a.timing === "upcoming")
  const past = data.appointments.filter((a) => a.timing === "past")
  const allCount = data.activity.length + data.appointments.length

  const showActivity = filter === "all" || filter === "status"
  const showUpcoming = filter === "all" || filter === "upcoming"
  const showPast = filter === "all" || filter === "past"

  // Merge the visible slices into one date-sorted list, tagged by type so each
  // renders with the right row component.
  const items = [
    ...(showActivity
      ? data.activity.map((a) => ({ type: "activity" as const, date: a.date, a }))
      : []),
    ...(showUpcoming ? upcoming.map((p) => ({ type: "appt" as const, date: p.date, p })) : []),
    ...(showPast ? past.map((p) => ({ type: "appt" as const, date: p.date, p })) : []),
  ].sort((x, y) => y.date.localeCompare(x.date))

  function handlePause() {
    onPause(data!.id, {
      id: `${data!.id}-${TODAY}-paused`,
      date: TODAY,
      title: "Membership paused",
      subtitle: "Paused by Husain Shabbir",
      kind: "paused",
    })
    setPauseNote("")
    setPauseOpen(false)
  }

  function handleResume() {
    onResume(data!.id, {
      id: `${data!.id}-${TODAY}-resumed`,
      date: TODAY,
      title: "Membership resumed",
      subtitle: "Resumed by Husain Shabbir",
      kind: "resumed",
    })
  }

  const redeemable = MOCK_SERVICES.slice(0, data.serviceCount)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogDescription className="sr-only">
            {data.name} membership purchased by {data.client}
          </DialogDescription>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <DialogHeader className="flex flex-col gap-3 border-b border-border/40 px-8 pt-7 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl text-white",
                      membershipColorClass(data.color),
                    )}
                  >
                    <CalendarClockIcon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  <DialogTitle className="truncate font-heading text-[26px] font-semibold leading-8">
                    {data.name}
                  </DialogTitle>
                  <SoldStatusBadge status={data.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Purchased on {formatSoldDate(data.startDate)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" radius="full">
                      Options
                      <ChevronDownIcon className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {isPaused ? (
                      <DropdownMenuItem onSelect={handleResume}>Resume membership</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onSelect={() => setPauseOpen(true)}>
                        Pause membership
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    radius="full"
                    aria-label="Close"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
            {/* Membership details */}
            <section className="rounded-2xl border border-border/60 bg-card">
              <h3 className="border-b border-border/60 px-6 py-4 font-heading text-lg font-semibold text-foreground">
                Membership details
              </h3>
              <div className="grid grid-cols-1 gap-x-10 gap-y-5 px-6 py-5 sm:grid-cols-2">
                <DetailField label="Sessions monthly">
                  {data.sessionsRemaining === "unlimited"
                    ? "Unlimited"
                    : `${data.sessionsRemaining} / ${data.sessionsTotal === "unlimited" ? "∞" : data.sessionsTotal} remaining`}
                </DetailField>
                <DetailField label="Services">
                  <button
                    type="button"
                    onClick={() => setServicesOpen(true)}
                    className="text-left text-cami-violet-11 hover:underline"
                  >
                    {data.serviceCount} service{data.serviceCount === 1 ? "" : "s"}
                  </button>
                </DetailField>

                <DetailField label="Membership type">{data.type}</DetailField>
                <DetailField label="Expires">
                  {data.endDate ? formatSoldDate(data.endDate) : "Until canceled"}
                </DetailField>

                <DetailField label="Client">
                  <button
                    type="button"
                    onClick={() => setClientOpen(true)}
                    className="text-left text-cami-violet-11 hover:underline"
                  >
                    {data.client}
                  </button>
                </DetailField>
                <DetailField label="Terms & Conditions">
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="text-left text-cami-violet-11 hover:underline"
                  >
                    View memberships Terms &amp; Conditions
                  </button>
                </DetailField>

                <DetailField label="Available for redemption">{data.redemption}</DetailField>
              </div>
            </section>

            {/* Activity log */}
            <section className="rounded-2xl border border-border/60 bg-card">
              <h3 className="border-b border-border/60 px-6 py-4 font-heading text-lg font-semibold text-foreground">
                Activity log
              </h3>
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <FilterPill
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    label={`All (${allCount})`}
                  />
                  <FilterPill
                    active={filter === "status"}
                    onClick={() => setFilter("status")}
                    label={`Status change (${data.activity.length})`}
                  />
                  <FilterPill
                    active={filter === "upcoming"}
                    onClick={() => setFilter("upcoming")}
                    label={`Upcoming appointments (${upcoming.length})`}
                  />
                  <FilterPill
                    active={filter === "past"}
                    onClick={() => setFilter("past")}
                    label={`Past appointments (${past.length})`}
                  />
                </div>

                {items.length === 0 ? (
                  <p className="rounded-xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                    There are no results matching the selected filters. Try changing these to get
                    some results.
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {items.map((item) =>
                      item.type === "activity" ? (
                        <ActivityRow key={item.a.id} entry={item.a} color={data.color} />
                      ) : (
                        <AppointmentRow key={item.p.id} appt={item.p} />
                      ),
                    )}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Pause membership sub-modal ──────────────────────────────────────── */}
      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent className="flex flex-col gap-4 sm:max-w-md">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="font-heading text-2xl font-semibold">
            Pause membership
          </DialogTitle>
          <DialogDescription className="text-base leading-6 text-muted-foreground">
            When you pause {data.client}'s {data.name} membership, they won't be able to redeem it
            in the salon or marketplace.
          </DialogDescription>
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-foreground">Note for client</span>
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </div>
            <Textarea
              placeholder="Leave a note for your client"
              value={pauseNote}
              onChange={(e) => setPauseNote(e.target.value)}
              className="min-h-28"
            />
            <p className="text-xs text-muted-foreground">
              Your note will be sent to {data.client} when you pause their membership.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" radius="full" onClick={handlePause}>
              Pause
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Redeemable services sub-modal ───────────────────────────────────── */}
      <Dialog open={servicesOpen} onOpenChange={setServicesOpen}>
        <DialogContent className="flex flex-col gap-5 sm:max-w-md">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="font-heading text-2xl font-semibold">
            Redeemable services
          </DialogTitle>
          <DialogDescription className="sr-only">
            Services included in this membership.
          </DialogDescription>
          <div className="flex flex-col gap-4">
            {groupByCategory(redeemable).map(([category, services]) => (
              <div key={category} className="flex flex-col gap-2">
                <h4 className="text-base font-semibold text-foreground">{category}</h4>
                {services.map((s) => (
                  <div key={s.id} className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatServiceDuration(s.duration)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {formatAed(s.price)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Terms & Conditions sub-modal ────────────────────────────────────── */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="flex flex-col gap-4 sm:max-w-md">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="font-heading text-2xl font-semibold">
            Terms &amp; Conditions
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            No terms &amp; conditions have been added to this membership.
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* ── Client detail — stacked over the membership modal ───────────────── */}
      <ClientDetailDialog
        open={clientOpen}
        onOpenChange={setClientOpen}
        client={{ id: data.clientId, name: data.client, email: data.clientEmail }}
        hasPets
      />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-cami-violet-9 text-white"
          : "border border-border text-foreground hover:bg-muted/50",
      )}
    >
      {label}
    </button>
  )
}

const ACTIVITY_GLYPH = {
  purchased: CheckCircle2Icon,
  paused: CirclePauseIcon,
  resumed: CirclePlayIcon,
} as const

function ActivityRow({
  entry,
  color,
}: {
  entry: SoldActivityEntry
  color: SoldMembership["color"]
}) {
  const Glyph = ACTIVITY_GLYPH[entry.kind]
  return (
    <li className="flex items-top gap-3 border-b border-border/60 py-3.5 last:border-b-0">
      <span className="relative shrink-0">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-white",
            membershipColorClass(color),
          )}
        >
          <CalendarClockIcon className="size-5" strokeWidth={1.75} />
        </span>
        <Glyph className="-right-0.5 absolute bottom-2.5 size-4 rounded-full bg-background text-cami-violet-11 ring-2 ring-card" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{formatSoldDate(entry.date)}</span>
        <span className="text-sm font-medium text-foreground">{entry.title}</span>
        <span className="text-sm text-muted-foreground">{entry.subtitle}</span>
      </div>
    </li>
  )
}

const APPT_BADGE: Record<SoldAppointment["status"], { label: string; className: string }> = {
  "not-confirmed": { label: "Not confirmed", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  confirmed: { label: "Confirmed", className: "bg-cami-violet-3 text-cami-violet-11" },
  completed: { label: "Completed", className: "bg-cami-green-3 text-cami-green-11" },
  cancelled: { label: "Cancelled", className: "bg-tomato-3 text-tomato-11" },
}

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
]

function ApptDateTile({ date }: { date: string }) {
  const [, m, d] = date.split("-").map(Number)
  return (
    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-border/60 leading-none">
      <span className="text-lg font-semibold text-foreground">{d}</span>
      <span className="mt-0.5 text-[10px] font-medium uppercase text-muted-foreground">
        {MONTHS_SHORT[m - 1]}
      </span>
    </span>
  )
}

function AppointmentRow({ appt }: { appt: SoldAppointment }) {
  const badge = APPT_BADGE[appt.status]
  return (
    <li className="flex items-start gap-3 border-b border-border/60 py-3.5 last:border-b-0">
      <ApptDateTile date={appt.date} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">{appt.title}</span>
        <span className="text-sm text-muted-foreground">{appt.timeLabel}</span>
        <span
          className={cn(
            "mt-0.5 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            badge.className,
          )}
        >
          {badge.label}
        </span>
      </div>
    </li>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function groupByCategory(
  services: (typeof MOCK_SERVICES)[number][],
): Array<[string, (typeof MOCK_SERVICES)[number][]]> {
  const map = new Map<string, (typeof MOCK_SERVICES)[number][]>()
  for (const s of services) {
    const list = map.get(s.category) ?? []
    list.push(s)
    map.set(s.category, list)
  }
  return [...map.entries()]
}

function formatServiceDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr, ${m} min`
}
