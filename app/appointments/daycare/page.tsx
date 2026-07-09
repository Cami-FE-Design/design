"use client"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PawPrintIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { AppShell } from "@/components/blocks/app-shell"
import { DaycareDetailSheet } from "@/components/blocks/daycare/booking-detail-sheet"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DAY_ISO,
  DAY_START_MIN,
  DAYCARE_SESSIONS,
  DAYCARE_STAFF,
  type DaycareSession,
  type DaycareStatus,
  formatTimeRange,
  hourLabels,
  MONTH_LABEL,
  minutesOf,
  monthGrid,
  PX_PER_MIN,
  sessionCountByDate,
  staffName,
  WEEKDAY_LABELS,
} from "@/lib/daycare-mock"
import { cn } from "@/lib/utils"

const TIME_AXIS = 60
const COL_MIN_WIDTH = 200

type CalView = "day" | "week" | "month"
type StatusFilter = "all" | "booked" | "checked-in" | "checked-out"

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All statuses",
  booked: "Not arrived",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
}

const STATUS_ACCENT: Record<DaycareStatus, { bar: string; text: string; rail: string }> = {
  booked: { bar: "bg-blue-3 border-blue-6", text: "text-blue-12", rail: "bg-blue-9" },
  "checked-in": { bar: "bg-lime-3 border-lime-6", text: "text-lime-12", rail: "bg-lime-9" },
  "checked-out": {
    bar: "bg-cami-gray-4 border-cami-gray-6",
    text: "text-cami-gray-11",
    rail: "bg-cami-gray-8",
  },
  cancelled: { bar: "bg-olive-3 border-olive-6", text: "text-olive-12", rail: "bg-olive-9" },
  "no-show": { bar: "bg-tomato-3 border-tomato-6", text: "text-tomato-12", rail: "bg-tomato-9" },
}

// ─── Day view (staff columns × hourly rows) ────────────────────────────────────

function SessionBlock({
  session,
  onOpen,
}: {
  session: DaycareSession
  onOpen: (s: DaycareSession) => void
}) {
  const top = (minutesOf(session.start) - DAY_START_MIN) * PX_PER_MIN
  const height = session.durationMin * PX_PER_MIN
  const accent = STATUS_ACCENT[session.status]
  return (
    <button
      type="button"
      onClick={() => onOpen(session)}
      className={cn(
        "absolute inset-x-1 flex gap-2 overflow-hidden rounded-lg border p-2 text-left transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring",
        accent.bar,
      )}
      style={{ top, height: Math.max(height, 28) }}
    >
      <span aria-hidden className={cn("w-1 shrink-0 self-stretch rounded-full", accent.rail)} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn("truncate text-xs font-semibold", accent.text)}>{session.petName}</span>
        <span className="truncate text-[11px] text-muted-foreground">{session.clientName}</span>
        <span className="truncate text-[11px] text-muted-foreground">{session.serviceName}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {formatTimeRange(session.start, session.durationMin)}
        </span>
      </span>
    </button>
  )
}

function DayView({
  columns,
  sessions,
  onOpen,
}: {
  columns: { id: string | null; name: string }[]
  sessions: DaycareSession[]
  onOpen: (s: DaycareSession) => void
}) {
  const hours = hourLabels()
  const gridHeight = hours.length * 60 * PX_PER_MIN

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: TIME_AXIS + columns.length * COL_MIN_WIDTH }}>
        {/* Column header */}
        <div
          className="sticky top-0 z-10 grid border-b border-border bg-background"
          style={{
            gridTemplateColumns: `${TIME_AXIS}px repeat(${columns.length}, minmax(${COL_MIN_WIDTH}px, 1fr))`,
          }}
        >
          <div />
          {columns.map((col) => (
            <div
              key={col.id ?? "unassigned"}
              className="flex items-center justify-center gap-2 border-l border-border/60 py-3"
            >
              {col.id ? (
                <Avatar size="sm" fallback="initials" name={col.name} hashSeed={col.id} />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UsersIcon className="size-3.5" />
                </span>
              )}
              <span className="text-sm font-medium text-foreground">{col.name}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${TIME_AXIS}px repeat(${columns.length}, minmax(${COL_MIN_WIDTH}px, 1fr))`,
          }}
        >
          {/* Time axis */}
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((h) => (
              <div
                key={h.min}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: h.min * PX_PER_MIN }}
              >
                {h.label}
              </div>
            ))}
          </div>

          {/* Staff columns */}
          {columns.map((col) => (
            <div
              key={col.id ?? "unassigned"}
              className="relative border-l border-border/60"
              style={{ height: gridHeight }}
            >
              {/* hour gridlines */}
              {hours.map((h) => (
                <div
                  key={h.min}
                  className="absolute inset-x-0 border-t border-border/40"
                  style={{ top: h.min * PX_PER_MIN }}
                  aria-hidden
                />
              ))}
              {sessions
                .filter((s) => s.staffId === col.id)
                .map((s) => (
                  <SessionBlock key={s.id} session={s} onOpen={onOpen} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Month view (per-day appointment counts) ───────────────────────────────────

function MonthView({ counts }: { counts: Record<string, number> }) {
  const cells = monthGrid()
  return (
    <div className="flex min-h-full flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
            {w}
          </div>
        ))}
      </div>
      {/* 6 weeks */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {cells.map((cell) => {
          const count = counts[cell.iso] ?? 0
          const isToday = cell.iso === DAY_ISO
          return (
            <div
              key={cell.iso}
              className={cn(
                "flex min-h-[104px] flex-col border-b border-r border-border/60 p-2",
                !cell.inMonth && "bg-muted/20",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center self-start rounded-full text-xs font-medium",
                  cell.inMonth ? "text-foreground" : "text-muted-foreground/50",
                  isToday && "bg-cami-yellow-9 text-cami-yellow-12",
                )}
              >
                {cell.day}
              </span>
              {cell.inMonth && count > 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center leading-tight">
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    {count === 1 ? "Appointment" : "Appointments"}
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DaycareCalendarPage() {
  const [view, setView] = useState<CalView>("day")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [staffIds, setStaffIds] = useState<string[]>(DAYCARE_STAFF.map((s) => s.id))
  const [selected, setSelected] = useState<DaycareSession | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const openSession = (s: DaycareSession) => {
    setSelected(s)
    setSheetOpen(true)
  }

  const daySessions = useMemo(
    () =>
      DAYCARE_SESSIONS.filter((s) => {
        if (s.date !== DAY_ISO) return false
        if (statusFilter !== "all" && s.status !== statusFilter) return false
        // Unassigned always visible; assigned filtered by staff selection.
        if (s.staffId !== null && !staffIds.includes(s.staffId)) return false
        return true
      }),
    [statusFilter, staffIds],
  )

  const columns = useMemo(
    () => [
      { id: null as string | null, name: "Unassigned" },
      ...DAYCARE_STAFF.filter((s) => staffIds.includes(s.id)).map((s) => ({
        id: s.id as string | null,
        name: s.name,
      })),
    ],
    [staffIds],
  )

  const monthCounts = useMemo(
    () =>
      sessionCountByDate(
        DAYCARE_SESSIONS.filter((s) => statusFilter === "all" || s.status === statusFilter),
      ),
    [statusFilter],
  )

  const allStaffSelected = staffIds.length === DAYCARE_STAFF.length
  const toggleStaff = (id: string) =>
    setStaffIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const dateLabel = view === "month" ? MONTH_LABEL : "Jul 8, Wed, 2026"

  return (
    <>
      <AppShell
        headerClassName="min-h-0 p-3"
        header={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {/* Left: date navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" radius="full" className="h-8">
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" radius="full" aria-label="Previous">
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="min-w-[128px] text-center text-sm font-medium text-foreground">
                  {dateLabel}
                </span>
                <Button variant="ghost" size="icon-sm" radius="full" aria-label="Next">
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Right: filters + view + add */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5">
                <PawPrintIcon className="size-3.5" />
                Daycare
                <ChevronDownIcon className="size-3.5 opacity-60" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5">
                    {STATUS_FILTER_LABEL[statusFilter]}
                    <ChevronDownIcon className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {(Object.keys(STATUS_FILTER_LABEL) as StatusFilter[]).map((k) => (
                    <DropdownMenuCheckboxItem
                      key={k}
                      checked={statusFilter === k}
                      onCheckedChange={() => setStatusFilter(k)}
                    >
                      {STATUS_FILTER_LABEL[k]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5">
                    <UsersIcon className="size-3.5" />
                    {allStaffSelected ? "All Staff" : `${staffIds.length} staff`}
                    <ChevronDownIcon className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuCheckboxItem
                    checked={allStaffSelected}
                    onCheckedChange={() =>
                      setStaffIds(allStaffSelected ? [] : DAYCARE_STAFF.map((s) => s.id))
                    }
                  >
                    All Staff
                  </DropdownMenuCheckboxItem>
                  {DAYCARE_STAFF.map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s.id}
                      checked={staffIds.includes(s.id)}
                      onCheckedChange={() => toggleStaff(s.id)}
                    >
                      {s.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    radius="full"
                    className="h-8 gap-1.5 capitalize"
                  >
                    {view}
                    <ChevronDownIcon className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {(["day", "week", "month"] as CalView[]).map((v) => (
                    <DropdownMenuCheckboxItem
                      key={v}
                      checked={view === v}
                      onCheckedChange={() => setView(v)}
                      className="capitalize"
                    >
                      {v}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                radius="full"
                className="h-8 gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon className="size-4" />
                Add
              </Button>
            </div>
          </div>
        }
      >
        {view === "month" ? (
          <MonthView counts={monthCounts} />
        ) : (
          <DayView columns={columns} sessions={daySessions} onOpen={openSession} />
        )}
      </AppShell>

      <DaycareDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} session={selected} />
      <NewAppointmentSheet open={createOpen} onOpenChange={setCreateOpen} date={DAY_ISO} hasPets />
    </>
  )
}
