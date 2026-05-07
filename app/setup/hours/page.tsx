"use client"

import { useState } from "react"
import { SetupCard, SetupLayout } from "@/components/blocks/setup-shell"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const days = [
  { id: "sun", letter: "S", label: "Sunday" },
  { id: "mon", letter: "M", label: "Monday" },
  { id: "tue", letter: "T", label: "Tuesday" },
  { id: "wed", letter: "W", label: "Wednesday" },
  { id: "thu", letter: "T", label: "Thursday" },
  { id: "fri", letter: "F", label: "Friday" },
  { id: "sat", letter: "S", label: "Saturday" },
] as const

type DayId = (typeof days)[number]["id"]

const times = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
]

const timezones = [
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Singapore",
]

const defaultRange = { from: "9:00 AM", to: "6:00 PM" }
const initialHours: Record<DayId, { from: string; to: string }> = {
  sun: defaultRange,
  mon: defaultRange,
  tue: defaultRange,
  wed: defaultRange,
  thu: defaultRange,
  fri: defaultRange,
  sat: defaultRange,
}

export default function SetupHoursPage() {
  const [selected, setSelected] = useState<DayId[]>(["mon", "tue", "wed", "thu", "fri"])
  const [hours, setHours] = useState(initialHours)
  const [timezone, setTimezone] = useState("Asia/Dubai")

  function toggle(id: DayId) {
    setSelected((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]))
  }

  return (
    <SetupLayout stepIndex={5} prevHref="/setup/invoicing">
      <SetupCard
        title="When you're open"
        description="Select your open days, then set the hours for each."
        ctaHref="/setup/done"
        ctaLabel="Go live"
      >
        <div className="flex flex-col gap-3">
          <Label>Days</Label>
          <div className="flex gap-2">
            {days.map((d) => {
              const isSelected = selected.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d.id)}
                  aria-label={d.label}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isSelected ? "bg-cami-gray-8 text-white" : "bg-sand-3 text-muted-foreground",
                  )}
                >
                  {d.letter}
                </button>
              )
            })}
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="flex flex-col gap-3">
            {days
              .filter((d) => selected.includes(d.id))
              .map((d) => (
                <div key={d.id} className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3">
                  <div className="text-sm">{d.label}</div>
                  <Select
                    value={hours[d.id].from}
                    onValueChange={(v) =>
                      setHours({ ...hours, [d.id]: { ...hours[d.id], from: v } })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {times.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={hours[d.id].to}
                    onValueChange={(v) => setHours({ ...hours, [d.id]: { ...hours[d.id], to: v } })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {times.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="timezone">Time zone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected.length > 0 ? (
          <Button
            type="button"
            variant="link"
            onClick={() => setSelected([])}
            className="self-start"
          >
            Clear business hours
          </Button>
        ) : null}
      </SetupCard>
    </SetupLayout>
  )
}
