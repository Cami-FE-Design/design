"use client"

import {
  BuildingIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  PlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { BoardingDetailSheet } from "@/components/blocks/boarding/booking-detail-sheet"
import { NewBoardingSheet } from "@/components/blocks/boarding/new-boarding-sheet"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  BOARDING_FACILITIES,
  BOARDING_ROOMS,
  BOARDING_STAYS,
  type BoardingStay,
  stayBarSpan,
  stayNights,
  TODAY_ISO,
  WEEK_DAYS,
  WEEK_RANGE_LABEL,
} from "@/lib/boarding-mock"
import { colorClasses } from "@/lib/scheduling-mock"
import { cn } from "@/lib/utils"

const LABEL_COL = "220px"
const ROW_HEIGHT = 56

type CalView = "day" | "week" | "month"
type StatusFilter = "all" | "booked" | "checked-in" | "checked-out"

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All statuses",
  booked: "Not arrived",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
}

// ─── Stay bar ──────────────────────────────────────────────────────────────────

function StayBar({
  stay,
  colorSuffix,
  onOpen,
}: {
  stay: BoardingStay
  colorSuffix: string
  onOpen: (stay: BoardingStay) => void
}) {
  const span = stayBarSpan(stay)
  if (!span) return null
  const c = colorClasses(colorSuffix)
  const nights = stayNights(stay)
  const dimmed = stay.status === "checked-out" || stay.status === "cancelled"

  return (
    <button
      type="button"
      onClick={() => onOpen(stay)}
      className={cn(
        "absolute top-1.5 bottom-1.5 flex items-center gap-2 overflow-hidden rounded-lg border pl-2 pr-3 text-left transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring",
        c.bg,
        c.border,
        dimmed && "opacity-60",
      )}
      style={{
        left: `calc(${(span.start / WEEK_DAYS.length) * 100}% + 4px)`,
        width: `calc(${(span.span / WEEK_DAYS.length) * 100}% - 8px)`,
      }}
    >
      <span aria-hidden className={cn("h-full w-1 shrink-0 rounded-full", c.dot)} />
      <Avatar
        size="xs"
        fallback="species"
        species={stay.petSpecies}
        name={stay.petName}
        hashSeed={stay.id}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn("truncate text-xs font-semibold", c.text)}>{stay.petName}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 truncate text-[11px]",
            c.text,
            "opacity-80",
          )}
        >
          <MoonIcon className="size-3" />
          {nights} {nights === 1 ? "Night" : "Nights"}
        </span>
      </span>
    </button>
  )
}

// ─── Resource row (7 day cells + absolutely-positioned bars) ───────────────────

function ResourceRow({
  label,
  sublabel,
  stays,
  colorSuffix,
  onOpen,
}: {
  label: string
  sublabel: string
  stays: BoardingStay[]
  colorSuffix: string
  onOpen: (stay: BoardingStay) => void
}) {
  return (
    <div
      className="grid border-b border-border/60"
      style={{ gridTemplateColumns: `${LABEL_COL} 1fr`, minHeight: ROW_HEIGHT }}
    >
      <div className="flex flex-col justify-center border-r border-border/60 px-4 leading-tight">
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
        <span className="truncate text-xs text-muted-foreground">{sublabel}</span>
      </div>
      <div className="relative">
        {/* day gridlines */}
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${WEEK_DAYS.length}, 1fr)` }}
          aria-hidden
        >
          {WEEK_DAYS.map((d) => (
            <div
              key={d.iso}
              className={cn(
                "border-r border-border/40",
                d.iso === TODAY_ISO && "bg-cami-yellow-3/30",
              )}
            />
          ))}
        </div>
        {stays.map((s) => (
          <StayBar key={s.id} stay={s} colorSuffix={colorSuffix} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BoardingCalendarPage() {
  const [view, setView] = useState<CalView>("week")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [selected, setSelected] = useState<BoardingStay | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const openStay = (stay: BoardingStay) => {
    setSelected(stay)
    setSheetOpen(true)
  }

  const visibleStays = useMemo(
    () =>
      BOARDING_STAYS.filter((s) => {
        if (statusFilter !== "all" && s.status !== statusFilter) return false
        return true
      }),
    [statusFilter],
  )

  const facilities = useMemo(
    () => BOARDING_FACILITIES.filter((f) => facilityFilter === "all" || f.id === facilityFilter),
    [facilityFilter],
  )

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
                <Button variant="ghost" size="icon-sm" radius="full" aria-label="Previous week">
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="min-w-[132px] text-center text-sm font-medium text-foreground">
                  {WEEK_RANGE_LABEL}
                </span>
                <Button variant="ghost" size="icon-sm" radius="full" aria-label="Next week">
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Right: filters + view + add */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5">
                <MoonIcon className="size-3.5" />
                Boarding
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
                    <BuildingIcon className="size-3.5" />
                    {facilityFilter === "all"
                      ? "All Facilities"
                      : BOARDING_FACILITIES.find((f) => f.id === facilityFilter)?.name}
                    <ChevronDownIcon className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuCheckboxItem
                    checked={facilityFilter === "all"}
                    onCheckedChange={() => setFacilityFilter("all")}
                  >
                    All Facilities
                  </DropdownMenuCheckboxItem>
                  {BOARDING_FACILITIES.map((f) => (
                    <DropdownMenuCheckboxItem
                      key={f.id}
                      checked={facilityFilter === f.id}
                      onCheckedChange={() => setFacilityFilter(f.id)}
                    >
                      {f.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <SegmentedToggle
                value={view}
                onValueChange={setView}
                options={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week", activeTone: "primary" },
                  { value: "month", label: "Month" },
                ]}
                ariaLabel="Calendar range"
              />

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
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Day header */}
            <div
              className="sticky top-0 z-10 grid border-b border-border bg-background"
              style={{ gridTemplateColumns: `${LABEL_COL} 1fr` }}
            >
              <div className="border-r border-border/60" />
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${WEEK_DAYS.length}, 1fr)` }}
              >
                {WEEK_DAYS.map((d) => {
                  const isToday = d.iso === TODAY_ISO
                  return (
                    <div
                      key={d.iso}
                      className="flex flex-col items-center gap-1 border-r border-border/40 py-2"
                    >
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {d.weekday}
                      </span>
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-foreground",
                          isToday && "bg-cami-yellow-9 text-cami-yellow-12",
                        )}
                      >
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Facility groups */}
            {facilities.map((facility) => {
              const rooms = BOARDING_ROOMS.filter((r) => r.facilityId === facility.id)
              const unassigned = visibleStays.filter(
                (s) => s.roomId === null && s.facilityId === facility.id,
              )
              return (
                <div key={facility.id}>
                  <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2">
                    <BuildingIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {facility.name}
                    </span>
                  </div>

                  <ResourceRow
                    label="Unassigned"
                    sublabel={facility.name}
                    stays={unassigned}
                    colorSuffix="sage"
                    onOpen={openStay}
                  />

                  {rooms.map((room) => (
                    <ResourceRow
                      key={room.id}
                      label={room.name}
                      sublabel={facility.name}
                      stays={visibleStays.filter((s) => s.roomId === room.id)}
                      colorSuffix={room.color}
                      onOpen={openStay}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </AppShell>

      <BoardingDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} stay={selected} />
      <NewBoardingSheet open={createOpen} onOpenChange={setCreateOpen} date={TODAY_ISO} />
    </>
  )
}
