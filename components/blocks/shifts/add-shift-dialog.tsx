"use client"

/**
 * One person's shifts for one day at one branch (SCR-10, R11, DW2.3).
 *
 * ## The branch is in the title, not implied
 *
 * The built dialog says "Lena's shift Tue, September 15" and gets the venue
 * from the page, because there is only one. Here there can be several on screen
 * at once, so the branch is named — a dialog that wrote to a branch the
 * operator had to infer from which grid they clicked is the R11 mistake in its
 * smallest form.
 *
 * ## The rules are the product's, not this screen's
 *
 * Overlap, duplicate, a window that ends before it starts, less than half an
 * hour between windows, a window across time off — all five are refused where a
 * shift is written today. They are restated in `dayWindowProblem` so a demo
 * cannot teach a rota the product would reject.
 *
 * One message at a time, in the order the built dialog uses. An operator fixing
 * a rota needs the next thing to fix, and a duplicate reported as an overlap
 * sends them to change a time that was right.
 */

import { PlusCircleIcon, TrashIcon, TriangleAlertIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatTime12h } from "@/lib/locations/hours"
import {
  dayWindowProblem,
  formatHours,
  ROTA_PROBLEM_MESSAGE,
  type ShiftTime,
} from "@/lib/team/shifts"
import { cn } from "@/lib/utils"

/** Half-hour steps, the granularity the built rota is written at. */
/**
 * The repo's form-field footprint.
 *
 * `Input` and `Textarea` already ship it (h-12, rounded-2xl, bg-input, px-4);
 * only `SelectTrigger` defaults smaller and half-opacity, so it is the one that
 * needs saying. Same constant `add-team-member-dialog` uses, so a dropdown and
 * a text field in the same form are the same object.
 */
const FIELD = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const TIMES: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? "00" : "30"
  return `${String(h).padStart(2, "0")}:${m}`
})

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function minutesToTime(total: number): string {
  const capped = Math.min(23 * 60 + 30, total)
  return `${String(Math.floor(capped / 60)).padStart(2, "0")}:${String(capped % 60).padStart(2, "0")}`
}

function addMinutes(time: string, minutes: number): string {
  const total = Math.min(23 * 60 + 30, toMinutes(time) + minutes)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function totalMinutes(windows: ReadonlyArray<ShiftTime>): number {
  return windows.reduce((sum, w) => sum + Math.max(0, toMinutes(w.end) - toMinutes(w.start)), 0)
}

export function AddShiftDialog({
  open,
  onOpenChange,
  memberName,
  locationName,
  dayLabel,
  windows,
  leaveWindows = [],
  elsewhere = [],
  onSave,
  onDelete,
  onOpenRepeating,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  /** Named, never inferred from which grid was clicked (R11). */
  locationName: string
  dayLabel: string
  windows: ReadonlyArray<ShiftTime>
  /** Time off on this day, which a shift may not run across. */
  leaveWindows?: ReadonlyArray<ShiftTime>
  /**
   * What this person already works at **other** branches that day.
   *
   * The built dialog cannot know this: it writes one venue's day through a
   * venue-scoped call and has nothing to compare against. It is the one check
   * multi-location adds here, and the reason a rota can hold a clash at all.
   */
  elsewhere?: ReadonlyArray<ShiftTime & { locationName: string }>
  onSave: (windows: ShiftTime[]) => void
  onDelete: () => void
  onOpenRepeating?: () => void
}) {
  /**
   * What an empty day opens on.
   *
   * Nine to five, unless we already know they are somewhere else then — in
   * which case it opens after that, with the break the rota requires. Opening
   * a blank Thursday straight into a refusal is a screen telling somebody off
   * for a time it chose itself.
   */
  function opening(): ShiftTime[] {
    if (windows.length > 0) return windows.map((w) => ({ ...w }))
    const busyUntil = elsewhere.reduce((latest, other) => Math.max(latest, toMinutes(other.end)), 0)
    if (busyUntil === 0) return [{ start: "09:00", end: "17:00" }]
    const start = addMinutes(minutesToTime(busyUntil), 30)
    return [{ start, end: addMinutes(start, 60) }]
  }

  const [draft, setDraft] = useState<ShiftTime[]>(opening)
  // Remounting on open is what makes "cancel" mean cancel: the draft starts
  // from what is rostered now, not from whatever was typed and abandoned last
  // time the dialog was open.
  const [openedFor, setOpenedFor] = useState(dayLabel)
  if (open && openedFor !== dayLabel) {
    setOpenedFor(dayLabel)
    setDraft(opening())
  }

  const problem = dayWindowProblem(draft, leaveWindows)

  // Refused, not warned. One person cannot be in two places, Maaz settled that
  // on 15 Sep, and a rota that saved the clash anyway would be writing hours
  // booking will never sell.
  //
  // `elsewhere` only ever holds branches this user is granted, so this refuses
  // exactly what they can see and fix. Somebody granted one branch is never
  // shown the other's rota, never told its name, and is never blocked by a
  // shift they could not have known about — that estate-level clash is the
  // owner's to catch, on the grid, where it is named as a pair.
  const clashes = elsewhere.filter((other) =>
    draft.some(
      (w) => toMinutes(w.start) < toMinutes(other.end) && toMinutes(w.end) > toMinutes(other.start),
    ),
  )
  const firstName = memberName.split(" ")[0] ?? memberName

  function update(index: number, patch: Partial<ShiftTime>) {
    setDraft((current) =>
      current.map((w, i) => {
        if (i !== index) return w
        const next = { ...w, ...patch }
        // Moving the start past the end silently produces a negative shift, so
        // the end follows rather than waiting to be reported as an error.
        if (patch.start && toMinutes(next.end) <= toMinutes(next.start)) {
          next.end = addMinutes(next.start, 60)
        }
        return next
      }),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 px-6 pt-8 pb-6 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {firstName}&apos;s shift · {dayLabel}
          </DialogTitle>
          <DialogDescription>
            At {locationName}. This day only — to set a pattern, use{" "}
            {onOpenRepeating ? (
              <button
                type="button"
                className="text-foreground underline underline-offset-2"
                onClick={() => {
                  onOpenChange(false)
                  onOpenRepeating()
                }}
              >
                repeating shifts
              </button>
            ) : (
              "repeating shifts"
            )}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {leaveWindows.map((leave) => (
            <p
              key={`${leave.start}-${leave.end}`}
              className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
              <span>
                Time off {formatTime12h(leave.start)} – {formatTime12h(leave.end)}. A shift cannot
                run across it, at this location or any other.
              </span>
            </p>
          ))}

          {clashes.map((clash) => (
            <p
              key={`${clash.locationName}-${clash.start}`}
              className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-destructive text-sm leading-5"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                Already at {clash.locationName} {formatTime12h(clash.start)} –{" "}
                {formatTime12h(clash.end)}. One person cannot be in two places, so these hours
                cannot be saved until one of them moves.
              </span>
            </p>
          ))}

          {problem ? (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-destructive text-sm leading-5">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>{ROTA_PROBLEM_MESSAGE[problem]}</span>
            </p>
          ) : null}

          {draft.map((window, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: a window has no id until it is saved
              key={index}
              className="flex items-end gap-3"
            >
              <div className="flex-1">
                {index === 0 ? <Label className="mb-2 block">Start</Label> : null}
                <Select value={window.start} onValueChange={(v) => update(index, { start: v })}>
                  <SelectTrigger className={cn(FIELD, "w-full")}>
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
              </div>
              <div className="flex-1">
                {index === 0 ? <Label className="mb-2 block">End</Label> : null}
                <Select value={window.end} onValueChange={(v) => update(index, { end: v })}>
                  <SelectTrigger className={cn(FIELD, "w-full")}>
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
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove shift ${index + 1}`}
                className="shrink-0"
                disabled={draft.length === 1}
                onClick={() => setDraft((c) => c.filter((_, i) => i !== index))}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              radius="full"
              onClick={() =>
                setDraft((current) => {
                  // A new window starts after the last one plus the break the
                  // product requires, so the common case opens valid.
                  const last = current[current.length - 1]
                  const start = last ? addMinutes(last.end, 30) : "09:00"
                  return [...current, { start, end: addMinutes(start, 60) }]
                })
              }
            >
              <PlusCircleIcon className="size-4" />
              Add another
            </Button>
            <span className="text-muted-foreground text-sm">
              Total{" "}
              <span className="font-medium text-foreground">
                {formatHours(totalMinutes(draft))}
              </span>
            </span>
          </div>
        </div>

        <DialogFooter className="justify-between pt-2 sm:justify-between">
          <Button
            variant="outline"
            radius="full"
            // Destructive, and said in the colour that means it. It stays an
            // outline rather than a filled red button because Save is the
            // action on this dialog — two solid buttons would make clearing a
            // day look like the thing you came to do.
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              onDelete()
              onOpenChange(false)
            }}
          >
            <TrashIcon className="size-4" />
            Clear day
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              radius="full"
              disabled={problem !== null || clashes.length > 0}
              onClick={() => {
                onSave(draft)
                onOpenChange(false)
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
