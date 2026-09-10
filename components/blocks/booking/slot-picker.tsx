import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { BOOKING_DAYS, type BookingDay, SLOT_GROUPS, type SlotGroup } from "@/lib/booking"
import { cn } from "@/lib/utils"

// Shared day + time pickers used by the booking flow and the reschedule view.
// Month label is static in the mock; a real calendar derives it from the range.
const MONTH_LABEL = "July 2026"

export function DayPicker({
  dayId,
  onDay,
  days = BOOKING_DAYS,
}: {
  dayId: string
  onDay: (id: string) => void
  /**
   * The week to offer. Defaults to the business's; a branch's flow passes its
   * own, where a day it does not open is `closed` rather than `full`.
   */
  days?: ReadonlyArray<BookingDay>
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground text-sm">{MONTH_LABEL}</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            aria-label="Previous week"
            className="flex size-7 items-center justify-center rounded-full hover:bg-muted/60"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next week"
            className="flex size-7 items-center justify-center rounded-full hover:bg-muted/60"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const active = d.id === dayId
          // Both states disable the chip; only one of them is worth coming back
          // for, which is why the label says which it is.
          const unavailable = d.full || d.closed
          return (
            <button
              key={d.id}
              type="button"
              disabled={unavailable}
              onClick={() => onDay(d.id)}
              aria-pressed={active}
              aria-label={`${d.label ?? d.weekday} ${d.dayNum}${
                d.closed ? " — closed" : d.full ? " — fully booked" : ""
              }`}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border font-semibold text-sm tabular-nums transition-colors",
                  unavailable
                    ? "border-transparent text-muted-foreground/40"
                    : active
                      ? "border-cami-violet-9 bg-cami-violet-9 text-white"
                      : "border-border/70 text-foreground hover:bg-muted/40",
                )}
              >
                {d.dayNum}
              </span>
              <span
                className={cn(
                  "text-xs",
                  unavailable
                    ? "text-muted-foreground/40"
                    : active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {d.weekday}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TimeList({
  time,
  onTime,
  groups = SLOT_GROUPS,
}: {
  time: string | null
  onTime: (t: string) => void
  /** The slots to offer. A branch's flow passes its own, generated from its hours. */
  groups?: ReadonlyArray<SlotGroup>
}) {
  // Flat list of bookable slots — taken ones are simply not offered.
  const slots = groups.flatMap((g) => g.times).filter((s) => !s.taken)

  // A closed day has no slots at all, and saying so beats an empty list under a
  // heading that promises times.
  if (slots.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-medium text-muted-foreground text-xs">Available times</span>
        <p className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
          Nothing free on this day. Pick another one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-muted-foreground text-xs">Available times</span>
      <div className="flex flex-col gap-2.5">
        {slots.map((slot) => {
          const active = slot.time === time
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onTime(slot.time)}
              aria-pressed={active}
              className={cn(
                "w-full rounded-2xl border px-4 py-3.5 text-left font-medium text-sm tabular-nums transition-colors",
                active
                  ? "border-cami-violet-8 bg-cami-violet-3 text-cami-violet-12"
                  : "border-border/60 text-foreground hover:bg-muted/40",
              )}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
