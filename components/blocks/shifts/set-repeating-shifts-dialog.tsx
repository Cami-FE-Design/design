"use client"

/**
 * A repeating rota for one person at one branch (SCR-10, R11, DW2.3).
 *
 * ## A takeover, because it is a week
 *
 * The built screen is a full-page takeover: Close and Save in the bar, the
 * member on the left with the schedule type and the dates, seven days on the
 * right. It is not a modal, and squeezing a week of shifts into one is how it
 * ends up unreadable. `FullScreenEditDialog` is this repo's version of that
 * frame, so the shape is borrowed rather than approximated.
 *
 * ## Per branch, because a pattern is a place
 *
 * The built dialog writes `POST /merchant/team-members/{id}/shifts/repeat` with
 * an interval and a week of windows, under the active venue. Somebody who works
 * Marina mornings and JLT evenings has **two** patterns, not one split between
 * them, so the branch is named here and this writes only to it — the other
 * branch's pattern is a separate rule and stays untouched.
 *
 * ## A day is ticked or it is not
 *
 * The built rows lead with a checkbox, and that is a better model than "a day
 * with no rows": unticking keeps the hours you had while you decide, so a mind
 * changed twice costs nothing.
 */

import { CirclePlusIcon, InfoIcon, TrashIcon, TriangleAlertIcon } from "lucide-react"
import { useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatTime12h, WEEK_DAYS } from "@/lib/locations/hours"
import {
  dayWindowProblem,
  formatHours,
  ROTA_PROBLEM_MESSAGE,
  type ShiftTime,
} from "@/lib/team/shifts"
import { cn } from "@/lib/utils"

/** The repo's form-field footprint, as `add-team-member-dialog` sets it. */
const FIELD = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const TIMES: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  return `${String(h).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`
})

const INTERVALS = [
  { value: "1", label: "Every week" },
  { value: "2", label: "Every 2 weeks" },
  { value: "3", label: "Every 3 weeks" },
  { value: "4", label: "Every 4 weeks" },
] as const

const ENDS = [
  { value: "never", label: "Never" },
  { value: "date", label: "On a date" },
] as const

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function addMinutes(time: string, minutes: number): string {
  const total = Math.min(23 * 60 + 30, toMinutes(time) + minutes)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function dayMinutes(windows: ReadonlyArray<ShiftTime>): number {
  return windows.reduce((sum, w) => sum + Math.max(0, toMinutes(w.end) - toMinutes(w.start)), 0)
}

export type WeekPattern = ReadonlyArray<{ day: string; windows: ShiftTime[] }>

export function SetRepeatingShiftsDialog({
  open,
  onOpenChange,
  memberName,
  memberRole,
  locationName,
  current,
  effectiveFrom,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  memberRole: string
  /** Which branch this pattern belongs to. Never inferred (R11). */
  locationName: string
  current: WeekPattern
  /** The date the pattern starts from, shown so "from when" is not a guess. */
  effectiveFrom: string
  onSave: (pattern: WeekPattern, intervalWeeks: number) => void
}) {
  const build = () =>
    WEEK_DAYS.map((d) => {
      const windows = (current.find((c) => c.day === d.id)?.windows ?? []).map((w) => ({ ...w }))
      return { day: d.id, on: windows.length > 0, windows }
    })

  const [interval, setInterval] = useState("1")
  const [ends, setEnds] = useState<string>("never")
  const [pattern, setPattern] = useState(build)

  const [openedFor, setOpenedFor] = useState(memberName + locationName)
  if (open && openedFor !== memberName + locationName) {
    setOpenedFor(memberName + locationName)
    setPattern(build())
  }

  // Every ticked day is validated with the same rules a single day gets,
  // because a pattern that wrote an overlapping Tuesday would be a way around
  // the check the day dialog makes.
  const firstProblem = pattern
    .filter((d) => d.on)
    .map((d) => ({ day: d.day, problem: dayWindowProblem(d.windows) }))
    .find((d) => d.problem !== null)

  const weekMinutes = pattern.reduce((total, d) => total + (d.on ? dayMinutes(d.windows) : 0), 0)

  function patch(day: string, next: Partial<{ on: boolean; windows: ShiftTime[] }>) {
    setPattern((current) => current.map((d) => (d.day === day ? { ...d, ...next } : d)))
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Set ${memberName}'s repeating shifts`}
      subtitle={`Set weekly, biweekly or custom shifts at ${locationName}. Saved changes apply to upcoming shifts there — the other locations this person works keep their own pattern.`}
      saveDisabled={firstProblem !== undefined}
      onSave={() => {
        onSave(
          pattern.map((d) => ({ day: d.day, windows: d.on ? d.windows : [] })),
          Number(interval),
        )
        onOpenChange(false)
      }}
      contentClassName="max-w-5xl"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <Avatar name={memberName} size="md" className="shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground text-sm">{memberName}</span>
              <span className="truncate text-muted-foreground text-xs">{memberRole}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Schedule type</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className={cn(FIELD, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Start date</Label>
            {/* Read-only: this repo shows one seeded week, so a date picker
                here would offer a choice nothing downstream can honour. */}
            <p className="flex h-12 items-center rounded-2xl bg-input px-4 font-medium text-sm">
              {effectiveFrom}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ends</Label>
            <Select value={ends} onValueChange={setEnds}>
              <SelectTrigger className={cn(FIELD, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENDS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-muted-foreground text-sm leading-5">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              Team members are not scheduled on this location&apos;s closed periods. Other locations
              close on their own days.
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-semibold text-foreground text-xl">
              {INTERVALS.find((i) => i.value === interval)?.label}
            </h3>
            <p className="text-muted-foreground text-sm">
              {formatHours(weekMinutes)} total at {locationName}
            </p>
          </div>

          {firstProblem?.problem ? (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-destructive text-sm leading-5">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                {WEEK_DAYS.find((d) => d.id === firstProblem.day)?.long}:{" "}
                {ROTA_PROBLEM_MESSAGE[firstProblem.problem]}
              </span>
            </p>
          ) : null}

          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border p-2">
            {pattern.map((d) => {
              const long = WEEK_DAYS.find((w) => w.id === d.day)?.long ?? d.day
              return (
                <div key={d.day} className="flex items-start gap-4 px-2 py-3">
                  <div className="flex w-36 shrink-0 items-start gap-2.5 pt-3">
                    <Checkbox
                      id={`repeat-${d.day}`}
                      checked={d.on}
                      className="mt-0.5"
                      onCheckedChange={(v) =>
                        patch(d.day, {
                          on: v === true,
                          windows:
                            v === true && d.windows.length === 0
                              ? [{ start: "09:00", end: "17:00" }]
                              : d.windows,
                        })
                      }
                    />
                    <Label htmlFor={`repeat-${d.day}`} className="flex cursor-pointer flex-col">
                      <span className="font-medium text-foreground text-sm">{long}</span>
                      <span className="font-normal text-muted-foreground text-xs">
                        {d.on ? formatHours(dayMinutes(d.windows)) : "Not working"}
                      </span>
                    </Label>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {d.on ? (
                      d.windows.map((window, index) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: a window has no id until it is saved
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <Select
                            value={window.start}
                            onValueChange={(v) =>
                              patch(d.day, {
                                windows: d.windows.map((w, i) =>
                                  i === index
                                    ? {
                                        start: v,
                                        end:
                                          toMinutes(w.end) <= toMinutes(v)
                                            ? addMinutes(v, 60)
                                            : w.end,
                                      }
                                    : w,
                                ),
                              })
                            }
                          >
                            <SelectTrigger className={cn(FIELD, "w-32")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {formatTime12h(t)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground text-sm">to</span>
                          <Select
                            value={window.end}
                            onValueChange={(v) =>
                              patch(d.day, {
                                windows: d.windows.map((w, i) =>
                                  i === index ? { ...w, end: v } : w,
                                ),
                              })
                            }
                          >
                            <SelectTrigger className={cn(FIELD, "w-32")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {formatTime12h(t)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Add another ${long} shift`}
                            onClick={() => {
                              const last = d.windows[d.windows.length - 1]
                              const start = last ? addMinutes(last.end, 30) : "09:00"
                              patch(d.day, {
                                windows: [...d.windows, { start, end: addMinutes(start, 60) }],
                              })
                            }}
                          >
                            <CirclePlusIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${long} shift ${index + 1}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              patch(d.day, { windows: d.windows.filter((_, i) => i !== index) })
                            }
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="pt-3 text-muted-foreground text-sm">Not scheduled</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </FullScreenEditDialog>
  )
}
