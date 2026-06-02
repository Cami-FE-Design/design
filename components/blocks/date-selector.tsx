"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatLabel(date: Date) {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

type DateSelectorProps = {
  value: Date
  onChange: (next: Date) => void
  className?: string
}

/**
 * Day-stepper pill used at the top of report screens. Prev/Next shift by one
 * day; Today resets to the current day. Date label is read-only — pair with a
 * calendar popover later if a jump-to-date is needed.
 */
export function DateSelector({ value, onChange, className }: DateSelectorProps) {
  const today = startOfDay(new Date())
  const isToday = isSameDay(value, today)
  const [calendarOpen, setCalendarOpen] = useState(false)

  function shift(days: number) {
    const next = new Date(value)
    next.setDate(next.getDate() + days)
    onChange(startOfDay(next))
  }

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-1 rounded-full border border-border bg-background p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        radius="full"
        aria-label="Previous day"
        onClick={() => shift(-1)}
      >
        <ChevronLeftIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant={isToday ? "secondary" : "ghost"}
        size="xs"
        radius="full"
        onClick={() => onChange(today)}
        disabled={isToday}
        className="font-medium disabled:opacity-100"
      >
        Today
      </Button>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            aria-label="Pick a date"
            className="rounded-full px-2 py-1 text-sm font-medium text-foreground tabular-nums outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {formatLabel(value)}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (d) {
                onChange(startOfDay(d))
                setCalendarOpen(false)
              }
            }}
            defaultMonth={value}
          />
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        radius="full"
        aria-label="Next day"
        onClick={() => shift(1)}
      >
        <ChevronRightIcon className="size-3.5" />
      </Button>
    </div>
  )
}
