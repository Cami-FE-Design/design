"use client"

import { useEffect, useState } from "react"
import {
  formatDayHours,
  formatTime12h,
  getDayIdFromDate,
  isOpenNow,
  type PublicBusiness,
  WEEK_DAYS,
  type WeekDay,
} from "@/lib/public-business"
import { cn } from "@/lib/utils"

export function PublicHours({ business }: { business: PublicBusiness }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const today: WeekDay | null = now ? getDayIdFromDate(now) : null
  const open = now ? isOpenNow(business.hours, now) : null
  const todaySchedule = today ? business.hours[today] : null

  return (
    <section id="hours" aria-labelledby="hours-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="hours-heading" className="text-base font-semibold text-foreground">
          Hours
        </h2>
        {open !== null && todaySchedule && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className={cn("size-1.5 rounded-full", open ? "bg-cami-green-9" : "bg-sand-9")}
              aria-hidden
            />
            {open && !todaySchedule.closed
              ? `Open until ${formatTime12h(todaySchedule.close)}`
              : todaySchedule.closed
                ? "Closed today"
                : `Opens ${formatTime12h(todaySchedule.open)}`}
          </span>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {WEEK_DAYS.map((day) => {
          const schedule = business.hours[day.id]
          const isToday = today === day.id
          return (
            <li
              key={day.id}
              className="flex items-center justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0"
            >
              <span
                className={cn(isToday ? "font-medium text-foreground" : "text-muted-foreground")}
              >
                {day.long}
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  isToday ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {formatDayHours(schedule)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
