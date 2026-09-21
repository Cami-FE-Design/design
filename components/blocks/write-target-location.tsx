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
 * A suspended or archived branch is listed but cannot be the target: it is
 * readable and takes no new writes (R12). It used to be filtered out and
 * explained in a footnote under the field — a rule stated before the operator
 * had asked anything, about branches they could not see. Now the branch is in
 * the list where they are already looking for it, badged with the state that
 * stops it, and choosing it answers the question it raises at the moment it is
 * raised. Nothing is hidden and nothing is pre-emptively explained.
 *
 * Choosing one reports `null` upward, so it never becomes a write target: the
 * six callers gate Save on this value and none of them has to learn about
 * lifecycle to stay correct.
 */

import { InfoIcon, MapPinIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocations } from "@/lib/locations/store"
import { acceptsWrites } from "@/lib/locations/types"
import { cn } from "@/lib/utils"

export function WriteTargetLocation({
  value,
  onChange,
  label = "Location",
  /**
   * What the write is, named in the sentences that say it cannot land — "no
   * location access, so this sale cannot be recorded anywhere" reads as an
   * answer where "so this cannot be recorded" reads as a riddle.
   */
  action = "This change",
  /**
   * What this control is sitting among.
   *
   * `field` is a form: the dialogs and panels put it beside Inputs, which carry
   * no border and a filled ground, and a bordered control next to them reads as
   * a different kind of thing.
   *
   * `card` is the appointment sheet, where every row is a white bordered card —
   * client, services, pet address — and a grey borderless field in the middle
   * of them looked like a field left over from another screen. The label goes
   * too: nothing else in that column is labelled above itself, because each
   * card already says what it is.
   */
  variant = "field",
  /**
   * What the caller's Save is waiting for, said here rather than wherever that
   * button lives.
   *
   * Passed as a sentence and not a boolean because only the caller knows what
   * the write is — "Choose a location to continue" belongs to a sale, not to
   * this control. Printed only in the state where the question is actually
   * being asked: resolved to a single branch, or absent for a single-branch
   * business, there is nothing outstanding to warn about, and a caller cannot
   * know which of those it is without repeating the logic below.
   */
  requiredNote,
  requiredDue = false,
}: {
  /** The chosen branch, or null while the question is unanswered. */
  value: string | null
  onChange: (locationId: string | null) => void
  label?: string
  action?: string
  variant?: "field" | "card"
  requiredNote?: string
  /**
   * Whether the answer is actually overdue.
   *
   * A required field is not an error until somebody tries to move past it.
   * This rendered in destructive red the moment the sheet opened — before the
   * operator had touched anything, and above a cart with nothing in it — which
   * is a screen telling you off for not having done something yet.
   */
  requiredDue?: boolean
}) {
  const asCard = variant === "card"
  const { scopedLocations, granted, isMultiLocation, hasNoAccess } = useLocations()
  /** Every branch the operator can see here — listed whether or not it can be written to. */
  const inView = scopedLocations.length > 0 ? scopedLocations : granted
  /** The ones that can actually hold the write (R12). */
  const writable = inView.filter((location) => acceptsWrites(location.status))
  const only = writable.length === 1 ? writable[0] : undefined
  /**
   * A branch the operator picked that cannot take the write. Held here rather
   * than reported upward, so the select can show what they chose and say why it
   * does not work, while `value` stays null and Save stays shut.
   */
  const [blockedId, setBlockedId] = useState<string | null>(null)
  const blocked = blockedId ? inView.find((location) => location.id === blockedId) : undefined

  // Resolving is a state change, so it happens after render rather than during
  // it. Also clears a choice that has gone out of scope — a branch picked and
  // then scoped away must not stay selected invisibly, and that goes for a
  // blocked pick too: a branch brought back to trading stops being an answer to
  // a question about why it cannot be used.
  useEffect(() => {
    if (
      blockedId &&
      !inView.some((location) => location.id === blockedId && !acceptsWrites(location.status))
    ) {
      setBlockedId(null)
    }
    if (only) {
      if (value !== only.id) onChange(only.id)
      return
    }
    if (value && !writable.some((location) => location.id === value)) onChange(null)
  })

  function handleChange(nextId: string) {
    const picked = inView.find((location) => location.id === nextId)
    if (picked && !acceptsWrites(picked.status)) {
      // Shown as chosen, reported as nothing. The operator gets an answer
      // instead of an option that silently does not exist.
      setBlockedId(nextId)
      if (value !== null) onChange(null)
      return
    }
    setBlockedId(null)
    onChange(nextId)
  }

  if (hasNoAccess) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-foreground">
        You have no location access, so {action.toLowerCase()} cannot be recorded anywhere.
      </p>
    )
  }

  if (writable.length === 0) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-foreground">
        No location in view is trading, so there is nowhere to record {action.toLowerCase()}. A
        paused or archived location keeps its history and takes no new entries.
      </p>
    )
  }

  // Resolved rather than asked. A single-branch business never sees a location
  // question at all, which is DW1.2 applied to a write.
  if (only) {
    return isMultiLocation ? (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5",
          asCard ? "rounded-2xl border border-border/60 bg-card" : "rounded-xl bg-muted/40",
        )}
      >
        <MapPinIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-sm text-foreground">
          Recording at <span className="font-medium">{only.name}</span>
        </span>
      </div>
    ) : null
  }

  return (
    // The sheet stacks sections — a heading, then the cards it owns — so in
    // `card` the label is that heading and the gap is the sheet's, not a
    // field's. Anywhere else this is a form row and stays one.
    <div className={cn("flex flex-col", asCard ? "gap-3" : "gap-1.5")}>
      {asCard ? (
        <h2 className="text-lg font-semibold leading-7 text-foreground">{label}</h2>
      ) : (
        <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      )}
      <Select value={value ?? blockedId ?? ""} onValueChange={handleChange}>
        {/* The repo's idiom for a Select that sits among Inputs, not a
            hand-rolled one. `h-12` alone does nothing here — the trigger sets
            its height from `data-[size=default]`, which wins.
            Two grounds, because the neighbours differ: among Inputs, which
            carry no border and a filled ground, a bordered control reads as a
            different kind of thing; among the sheet's white cards, a grey
            borderless one reads as a field left behind from another screen. */}
        <SelectTrigger
          className={cn(
            "data-[size=default]:h-12 w-full rounded-2xl px-4 font-medium",
            asCard ? "border border-border/60 bg-card" : "border-0 bg-input",
          )}
        >
          <SelectValue placeholder="Choose a location" />
        </SelectTrigger>
        <SelectContent>
          {/* Every branch in view, trading or not. The badge is the same one
              settings and the switcher use, so "Paused" means the same thing
              here as everywhere else it appears — and the operator sees the
              state before they spend a click on it. */}
          {inView.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <span className="flex items-center gap-2">
                {location.name}
                <LocationStatusBadge status={location.status} />
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Only after they have picked one, and only about the one they picked.
          This was a footnote about branches the operator could not see, sitting
          under a question they had not answered — a rule stated to nobody. The
          answer belongs to the moment the question is asked. */}
      {blocked ? (
        <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5 text-cami-yellow-12">
          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">{blocked.name}</span> is{" "}
            {blocked.status === "archived" ? "archived" : "paused"} — it keeps its history and takes
            no new entries. Pick a trading location to record {action.toLowerCase()}.
          </span>
        </p>
      ) : requiredNote && value === null && requiredDue ? (
        /* Only when nothing is chosen, and never alongside the paused notice:
           a merchant who has just picked a paused branch has been told what is
           wrong with that branch, and "choose a location" underneath it would
           be the same instruction in weaker words. */
        <p className="text-xs leading-5 text-destructive">{requiredNote}</p>
      ) : null}
    </div>
  )
}
