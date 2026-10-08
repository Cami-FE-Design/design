"use client"

import { CalendarIcon } from "lucide-react"
import { useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  /** ISO `YYYY-MM-DD` string, or empty when unset. */
  value: string
  onChange: (next: string) => void
  placeholder?: string
  /** Disable dates after this Date (e.g. `new Date()` for "no future"). */
  disableAfter?: Date
  /** Disable dates before this Date. */
  disableBefore?: Date
  id?: string
  className?: string
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toIso(date: Date): string {
  // Local-date safe: YYYY-MM-DD without timezone shift.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Date picker shaped like an `<Input>` (h-12, rounded-2xl, bg-input). Opens a
 * themed Calendar popover. Use anywhere a date input is needed in a form.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disableAfter,
  disableBefore,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseDate(value)
  const display = selected ? formatDisplay(selected) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3 text-sm font-medium text-foreground outline-none transition-[color,box-shadow,background-color] focus-visible:ring-3 focus-visible:ring-ring/30",
            !display && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{display ?? placeholder}</span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) onChange(toIso(d))
            else onChange("")
            setOpen(false)
          }}
          captionLayout="dropdown"
          disabled={(date) => {
            if (disableAfter && date > disableAfter) return true
            if (disableBefore && date < disableBefore) return true
            return false
          }}
          defaultMonth={selected ?? disableAfter ?? new Date()}
          startMonth={new Date(1990, 0)}
          endMonth={disableAfter ?? new Date(new Date().getFullYear() + 5, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}
