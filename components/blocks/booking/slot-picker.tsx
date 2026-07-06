import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { BOOKING_DAYS, SLOT_GROUPS } from "@/lib/booking"
import { cn } from "@/lib/utils"

// Shared day + time pickers used by the booking flow and the reschedule view.
// Month label is static in the mock; a real calendar derives it from the range.
const MONTH_LABEL = "July 2026"

export function DayPicker({ dayId, onDay }: { dayId: string; onDay: (id: string) => void }) {
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
        {BOOKING_DAYS.map((d) => {
          const active = d.id === dayId
          return (
            <button
              key={d.id}
              type="button"
              disabled={d.full}
              onClick={() => onDay(d.id)}
              aria-pressed={active}
              aria-label={`${d.label ?? d.weekday} ${d.dayNum}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border font-semibold text-sm tabular-nums transition-colors",
                  d.full
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
                  d.full
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

export function TimeList({ time, onTime }: { time: string | null; onTime: (t: string) => void }) {
  // Flat list of bookable slots — taken ones are simply not offered.
  const slots = SLOT_GROUPS.flatMap((g) => g.times).filter((s) => !s.taken)

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
