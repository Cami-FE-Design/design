"use client"

// Reusable date-range picker with presets (Today / Last 7 / Month to date / …)
// plus a two-month calendar and manual start/end inputs. Adapted from the
// inline picker in app/sales/sales-list; shared here so every report toolbar
// uses the same control.

import { CalendarIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"

export type DateRange = { from: Date; to: Date }

export type PresetKey =
  | "today"
  | "yesterday"
  | "last-7"
  | "last-30"
  | "last-90"
  | "last-month"
  | "week-to-date"
  | "month-to-date"
  | "quarter-to-date"
  | "year-to-date"
  | "custom"

const PRESETS: Array<{ key: PresetKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last-7", label: "Last 7 days" },
  { key: "last-30", label: "Last 30 days" },
  { key: "last-90", label: "Last 90 days" },
  { key: "last-month", label: "Last month" },
  { key: "week-to-date", label: "Week to date" },
  { key: "month-to-date", label: "Month to date" },
  { key: "quarter-to-date", label: "Quarter to date" },
  { key: "year-to-date", label: "Year to date" },
]

function startOfDay(d: Date) {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function addDays(d: Date, days: number) {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

function toIso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseIso(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split("-").map(Number)
  const out = new Date(y, m - 1, d)
  return Number.isNaN(out.getTime()) ? null : out
}

export function rangeForPreset(key: PresetKey, today: Date): DateRange {
  const t = startOfDay(today)
  switch (key) {
    case "today":
      return { from: t, to: t }
    case "yesterday": {
      const y = addDays(t, -1)
      return { from: y, to: y }
    }
    case "last-7":
      return { from: addDays(t, -6), to: t }
    case "last-30":
      return { from: addDays(t, -29), to: t }
    case "last-90":
      return { from: addDays(t, -89), to: t }
    case "last-month": {
      const from = new Date(t.getFullYear(), t.getMonth() - 1, 1)
      const to = new Date(t.getFullYear(), t.getMonth(), 0)
      return { from, to }
    }
    case "week-to-date": {
      // Week starts Monday.
      const dow = (t.getDay() + 6) % 7
      return { from: addDays(t, -dow), to: t }
    }
    case "month-to-date":
      return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }
    case "quarter-to-date": {
      const qStart = Math.floor(t.getMonth() / 3) * 3
      return { from: new Date(t.getFullYear(), qStart, 1), to: t }
    }
    case "year-to-date":
      return { from: new Date(t.getFullYear(), 0, 1), to: t }
    case "custom":
      return { from: t, to: t }
  }
}

/** Sensible default applied to a fresh report view. */
export function defaultRange(today: Date): DateRange {
  return rangeForPreset("month-to-date", today)
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function inferPreset(range: DateRange, today: Date): PresetKey {
  for (const p of PRESETS) {
    const candidate = rangeForPreset(p.key, today)
    if (sameDay(candidate.from, range.from) && sameDay(candidate.to, range.to)) {
      return p.key
    }
  }
  return "custom"
}

type DateRangePopoverProps = {
  value: DateRange
  onChange: (next: DateRange) => void
  today: Date
}

export function DateRangePopover({ value, onChange, today }: DateRangePopoverProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)
  const [preset, setPreset] = useState<PresetKey>(() => inferPreset(value, today))
  const [fromText, setFromText] = useState(() => toIso(value.from))
  const [toText, setToText] = useState(() => toIso(value.to))

  // Reset editing state when the popover opens so it starts from the applied
  // range, not the last in-flight edit.
  useEffect(() => {
    if (!open) return
    setDraft(value)
    setPreset(inferPreset(value, today))
    setFromText(toIso(value.from))
    setToText(toIso(value.to))
  }, [open, value, today])

  function commitDraft(next: DateRange) {
    setDraft(next)
    setFromText(toIso(next.from))
    setToText(toIso(next.to))
    setPreset(inferPreset(next, today))
  }

  function handlePreset(key: PresetKey) {
    setPreset(key)
    if (key === "custom") return
    commitDraft(rangeForPreset(key, today))
  }

  function apply() {
    onChange(draft)
    setOpen(false)
  }

  const label = useMemo(() => {
    const matched = PRESETS.find((p) => p.key === inferPreset(value, today))
    if (matched) return matched.label
    return `${formatDate(value.from)} – ${formatDate(value.to)}`
  }, [value, today])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {label}
          <CalendarIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Date range</span>
            <Select value={preset} onValueChange={(v) => handlePreset(v as PresetKey)}>
              <SelectTrigger className="data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Starting</span>
              <Input
                value={fromText}
                onChange={(e) => {
                  const next = e.target.value
                  setFromText(next)
                  const parsed = parseIso(next)
                  if (parsed) {
                    setDraft((d) => ({ from: parsed, to: parsed > d.to ? parsed : d.to }))
                    setPreset("custom")
                  }
                }}
                aria-label="Starting date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Ending</span>
              <Input
                value={toText}
                onChange={(e) => {
                  const next = e.target.value
                  setToText(next)
                  const parsed = parseIso(next)
                  if (parsed) {
                    setDraft((d) => ({ from: parsed < d.from ? parsed : d.from, to: parsed }))
                    setPreset("custom")
                  }
                }}
                aria-label="Ending date"
              />
            </div>
          </div>

          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: draft.from, to: draft.to }}
            onSelect={(r) => {
              if (!r?.from) return
              const from = startOfDay(r.from)
              const to = startOfDay(r.to ?? r.from)
              commitDraft({ from, to })
            }}
            defaultMonth={draft.from}
            weekStartsOn={1}
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" radius="full" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button radius="full" size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
