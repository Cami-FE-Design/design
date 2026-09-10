"use client"

/**
 * Which branch is this write landing on (R11, G1).
 *
 * R11: every operational write names one Location, and **there is no default,
 * ever**. The PRD's release criterion is blunter still — "the default-branch
 * fallback removed from the repo rather than flagged off" — and the built
 * product currently derives it from "the first venue of the first staff member
 * who has one" (`useCalendarPage.ts:492`). This control is the shape that
 * replaces that: the branch is resolved when there is only one it can be, and
 * **asked for** when there is more than one.
 *
 * The store has carried `requiresTargetLocation` and `activeLocation` since the
 * scope was built and nothing used them — R11's guard existed in the model and
 * was enforced on no surface. This is where it starts being enforced.
 *
 * Three states, and each is a different sentence rather than a different
 * styling of the same one:
 *
 * - **One branch in scope** — resolved and stated, not offered as a choice. A
 *   select with one option is a question with one answer.
 * - **More than one** — a required choice, and the caller keeps Save disabled
 *   until it is made. This is the whole of "all-locations is read only for
 *   creating": the view can span nine branches, the write cannot.
 * - **None granted** — no write is possible, said plainly (R24).
 *
 * A suspended or archived branch is never a target: it is readable and takes no
 * new writes (R12), so `activeLocation` excludes it and it is absent from the
 * list rather than offered and rejected.
 */

import { MapPinIcon } from "lucide-react"
import { useEffect } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocations } from "@/lib/locations/store"
import { acceptsWrites } from "@/lib/locations/types"

export function WriteTargetLocation({
  value,
  onChange,
  label = "Location",
  /** What the write is, for the copy that asks for a branch. */
  action = "This change",
}: {
  /** The chosen branch, or null while the question is unanswered. */
  value: string | null
  onChange: (locationId: string | null) => void
  label?: string
  action?: string
}) {
  const { scopedLocations, granted, isMultiLocation, hasNoAccess } = useLocations()
  const inScope = (scopedLocations.length > 0 ? scopedLocations : granted).filter((location) =>
    acceptsWrites(location.status),
  )
  const only = inScope.length === 1 ? inScope[0] : undefined
  /** In view but not a target, which is why the counts differ from the read surfaces. */
  const excluded = (scopedLocations.length > 0 ? scopedLocations : granted).length - inScope.length

  // Resolving is a state change, so it happens after render rather than during
  // it. Also clears a choice that has gone out of scope — a branch picked and
  // then scoped away must not stay selected invisibly.
  useEffect(() => {
    if (only) {
      if (value !== only.id) onChange(only.id)
      return
    }
    if (value && !inScope.some((location) => location.id === value)) onChange(null)
  })

  if (hasNoAccess) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-foreground">
        You have no location access, so this cannot be recorded anywhere.
      </p>
    )
  }

  if (inScope.length === 0) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-foreground">
        No location in view is trading, so there is nowhere to record this. A paused or archived
        location keeps its history and takes no new entries.
      </p>
    )
  }

  // Resolved rather than asked. A single-branch business never sees a location
  // question at all, which is DW1.2 applied to a write.
  if (only) {
    return isMultiLocation ? (
      <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
        <MapPinIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-sm text-foreground">
          Recording at <span className="font-medium">{only.name}</span>
        </span>
      </div>
    ) : null
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      <Select value={value ?? ""} onValueChange={onChange}>
        {/* The repo's idiom for a Select that sits among Inputs, not a
            hand-rolled one. `h-12` alone does nothing here — the trigger sets
            its height from `data-[size=default]`, which wins — and the sibling
            fields carry no border, so a default one made this control taller
            and outlined next to them. */}
        <SelectTrigger className="data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium">
          <SelectValue placeholder="Choose a location" />
        </SelectTrigger>
        <SelectContent>
          {inScope.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* No bare count. This said "you are looking at 2" while the card behind
          it said 3 locations — true of both (a paused branch takes no new
          entries, so it is not a target) and impossible to reconcile from the
          outside. The reason, not the number. */}
      <p className="text-xs leading-5 text-muted-foreground">
        {action} belongs to one location, so it cannot be picked for you.
        {excluded > 0
          ? ` ${excluded === 1 ? "One location is" : `${excluded} locations are`} not listed: a paused or archived location keeps its history and takes no new entries.`
          : ""}
      </p>
    </div>
  )
}
