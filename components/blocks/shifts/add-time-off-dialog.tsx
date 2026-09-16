"use client"

/**
 * Time off (SCR-10, DW2.3).
 *
 * ## Away is away, at every branch
 *
 * DW2.2 lists time off among the per-branch facts, but the criterion it is
 * accepted on is "another branch's **roster change** never affects mine" — and
 * an absence is not a roster change. Read it the other way and an estate can
 * sell somebody who is out of the country, because their leave at one branch
 * leaves them bookable at the next.
 *
 * So the line is drawn between the two: a **shift** belongs to a branch, an
 * **absence** belongs to the person. The branch is still recorded, because
 * somebody entered and approved it there and that is worth being able to say —
 * but nothing scopes off it, and the helper line names every branch the leave
 * will reach rather than leaving it to be discovered on another grid.
 *
 * ## The booking rule is quoted, not invented
 *
 * "Online bookings cannot be placed during time off" is the built dialog's own
 * sentence, and it needs no qualifier here.
 */

import { CalendarOffIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { formatTime12h, WEEK_DAYS } from "@/lib/locations/hours"
import { formatHours, type Leave } from "@/lib/team/shifts"
import { cn } from "@/lib/utils"

/** The types the built product ships. Not a free-text field. */
export const TIME_OFF_TYPES = [
  "Annual leave",
  "Sick leave",
  "Training",
  "Other absence reasons",
] as const

/** The repo's form-field footprint, as `add-team-member-dialog` sets it. */
const FIELD = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const TIMES: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  return `${String(h).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`
})

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function AddTimeOffDialog({
  open,
  onOpenChange,
  members,
  defaultMemberId,
  defaultDay,
  locationId,
  locationName,
  locationChoices,
  alsoWorksAt,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: ReadonlyArray<{ id: string; name: string }>
  defaultMemberId?: string
  defaultDay?: string
  /** The branch this time off belongs to. A branch's own, per DW2.2. */
  locationId: string
  locationName: string
  /**
   * The branches to choose between, when there is a choice to make.
   *
   * On a branch's own grid there is none — you are already in one, and a picker
   * would invite writing somewhere you are not looking. Opened from the team
   * list there is no branch in view at all, so the one thing the record cannot
   * do without has to be asked for.
   */
  locationChoices?: ReadonlyArray<{ id: string; name: string }>
  /**
   * The other branches this person works, if any. Named so the cost of a
   * per-branch leave is visible before saving rather than discovered when
   * somebody is booked at a branch they are away from.
   */
  alsoWorksAt: (memberId: string) => string[]
  onAdd: (leave: Omit<Leave, "id">) => void
}) {
  const [memberId, setMemberId] = useState(defaultMemberId ?? members[0]?.id ?? "")
  const [type, setType] = useState<string>(TIME_OFF_TYPES[0])
  const [day, setDay] = useState(defaultDay ?? "mon")
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:00")
  const [fullDay, setFullDay] = useState(true)
  const [note, setNote] = useState("")
  // The picked branch when there is a choice, the given one when there is not.
  const [pickedId, setPickedId] = useState(locationId)
  const [repeat, setRepeat] = useState(false)
  const [approved, setApproved] = useState(false)

  const [openedWith, setOpenedWith] = useState<string | undefined>(defaultMemberId)
  if (open && openedWith !== defaultMemberId) {
    setOpenedWith(defaultMemberId)
    if (defaultMemberId) setMemberId(defaultMemberId)
    if (defaultDay) setDay(defaultDay)
    setPickedId(locationId)
  }

  const choices = locationChoices ?? []
  const activeId = choices.length > 1 ? pickedId : locationId
  const activeName =
    choices.length > 1
      ? (choices.find((l) => l.id === activeId)?.name ?? locationName)
      : locationName

  const elsewhere = alsoWorksAt(memberId)
  const firstName = members.find((m) => m.id === memberId)?.name.split(" ")[0] ?? "they"
  const badWindow = !fullDay && toMinutes(end) <= toMinutes(start)
  const minutes = fullDay ? 0 : Math.max(0, toMinutes(end) - toMinutes(start))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 px-6 pt-8 pb-6 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add time off</DialogTitle>
          <DialogDescription>Book a day or part of a day away from work.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Two up, the way the built dialog reads: who and what kind are one
              question, and stacking them makes a short form feel long. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Team member</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className={cn(FIELD, "w-full")}>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className={cn(FIELD, "w-full")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OFF_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Said before saving, not discovered afterwards on another grid.
              This is the one line the built dialog has no need for, because it
              has one location to land at. */}
          {/* Helper text, not a box. In a form, a filled rounded rectangle
              means "field", and a notice wearing that shape reads as one more
              input you failed to fill in. */}
          <p className="-mt-2 flex items-start gap-1.5 text-muted-foreground text-xs leading-5">
            <CalendarOffIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {elsewhere.length > 0 ? (
                <>
                  {/* Named rather than implied. Somebody entering leave at one
                      branch is entitled to know it reaches the others before
                      they save, not after a manager elsewhere finds a hole. */}
                  Applies everywhere {firstName} works —{" "}
                  <span className="text-foreground">
                    {activeName} and {elsewhere.join(", ")}
                  </span>
                  .
                </>
              ) : (
                <>
                  Applies wherever {firstName} works. Recorded at{" "}
                  <span className="text-foreground">{activeName}</span>.
                </>
              )}
            </span>
          </p>

          <div
            className={cn("grid gap-2", fullDay ? "sm:grid-cols-1" : "sm:grid-cols-[2fr_1fr_1fr]")}
          >
            {choices.length > 1 ? (
              <div className="flex flex-col gap-2 sm:col-span-full">
                {/* Provenance, not scope — who entered it and where. The leave
                    itself reaches every branch either way. */}
                <Label>Recorded at</Label>
                <Select value={activeId} onValueChange={setPickedId}>
                  <SelectTrigger className={cn(FIELD, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {choices.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label>Start date</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className={cn(FIELD, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.long}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex flex-col gap-2", fullDay && "hidden")}>
              <Label>Start time</Label>
              <Select value={start} onValueChange={setStart}>
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
            <div className={cn("flex flex-col gap-2", fullDay && "hidden")}>
              <Label>End time</Label>
              <Select value={end} onValueChange={setEnd}>
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
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="time-off-all-day"
                checked={fullDay}
                onCheckedChange={(v) => setFullDay(v === true)}
              />
              {/* Not derivable from the hours: "out all day" and "out nine to
                  five" look identical on a nine-to-five rota and stop being the
                  same the moment a shift moves. */}
              <Label htmlFor="time-off-all-day" className="cursor-pointer">
                All day
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="time-off-repeat"
                checked={repeat}
                onCheckedChange={(v) => setRepeat(v === true)}
              />
              <Label htmlFor="time-off-repeat" className="cursor-pointer">
                Repeat
              </Label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <span className="text-muted-foreground text-xs">{note.length}/100</span>
            </div>
            <Textarea
              value={note}
              maxLength={100}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add description or note (optional)"
              className="min-h-24"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="time-off-approved"
                checked={approved}
                onCheckedChange={(v) => setApproved(v === true)}
              />
              <Label htmlFor="time-off-approved" className="cursor-pointer">
                Approved
              </Label>
            </div>
            <span className="font-medium text-foreground text-sm">
              Time off total: {fullDay ? "All day" : formatHours(minutes)}
            </span>
          </div>

          <p className="text-muted-foreground text-sm">
            Online bookings cannot be placed during time off.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            radius="full"
            disabled={badWindow || !memberId || !activeId}
            onClick={() => {
              onAdd({
                memberId,
                locationId: activeId,
                type,
                day,
                start: fullDay ? "00:00" : start,
                end: fullDay ? "23:30" : end,
                fullDay,
                repeats: repeat,
                approved,
                note: note.trim() || undefined,
              })
              onOpenChange(false)
            }}
          >
            Add time off
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
