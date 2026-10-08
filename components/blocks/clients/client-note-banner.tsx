"use client"

import { format } from "date-fns"
import { AlertTriangleIcon } from "lucide-react"
import { type ClientNote, clientNotesFor } from "@/lib/client-notes"
import { cn } from "@/lib/utils"

// Client notes on an appointment surface — Fresha's "Staff Alert" (DZ-209).
// Mirrors the as-built ClientNoteBanner in cami-business, including the reasons
// it settled on this shape, because those were paid for in rejected passes.
//
// A PREVIEW, NOT THE ARCHIVE. That is what the earlier passes kept missing by
// bounding the container instead of the content:
//
//   - It began as an amber slab with a warning triangle, which outweighed the
//     appointment it sat above and marked every client who had ever been
//     annotated as a hazard. What it holds is routine context — packages,
//     preferences, imported history — and `ClientNote` carries no severity
//     field to key urgency off.
//   - Bounding it by note count, then by characters, then by a scrolling fixed
//     height all failed the same way: a small window onto arbitrarily long
//     notes sliced text mid-line at its top edge, put a scrollbar inside a
//     480px sheet, and still could not fit one long note.
//
// So the CONTENT is bounded instead: every note gets at most two lines, at most
// VISIBLE_NOTES notes are shown, and nothing scrolls. The height is
// predictable, nothing is cut mid-glyph, and each note is readable at a glance.
// The full history — and adding, editing, deleting — lives on the client
// profile's Notes section, reachable from the "View profile" pill that already
// sits in the same client row on every surface this renders in.
//
// The DZ-209 icon is a muted outline glyph, NOT the amber treatment that was
// rejected: the ticket asks for something reception can spot in a second, which
// a 14px marker on a plain card does without restating "hazard" on every
// client who has ever been written about.

/**
 * How many notes the preview shows.
 *
 * Two, each at two lines, lands the card near 140px against a ~485px sheet
 * body. This is the block's whole size budget — tune it here and nowhere else.
 */
const VISIBLE_NOTES = 2

/**
 * The glance-surface budget: one note, one line. The calendar popover is 280px
 * wide and read in the second or two a pointer rests on a card; the full
 * two-note preview turned that popover into a second detail sheet.
 */
const COMPACT_NOTES = 1

export function ClientNoteBanner({
  clientId,
  className,
  compact = false,
  hideLabel = false,
}: {
  clientId: string | null | undefined
  className?: string
  /** Trims the preview to a single one-line note for glance surfaces. */
  compact?: boolean
  /**
   * For callers that already put a heading above the card — the appointment
   * detail sheet, whose six sections all carry an `h2` outside their card.
   * Suppresses the internal label; the marker stays, since it identifies the
   * card rather than labelling it.
   */
  hideLabel?: boolean
}) {
  const notes = clientNotesFor(clientId)
  if (notes.length === 0) return null

  const visible = notes.slice(0, compact ? COMPACT_NOTES : VISIBLE_NOTES)
  const remaining = notes.length - visible.length

  return (
    <div
      role="note"
      aria-label="Client notes"
      className={cn(
        // Full: a card, because on the detail sheet every section is one.
        // Compact: no card at all — see the note above this component.
        compact
          ? "flex flex-col gap-0.5"
          : "rounded-2xl border border-border/60 bg-card px-3 py-2.5",
        className,
      )}
    >
      {/* Compact: the label row, matching YOUR PET ADDRESS / SERVICES above and
          below it, with the DZ-209 marker at its end. */}
      {compact && !hideLabel ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Client notes
          </span>
          <AlertTriangleIcon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      ) : null}

      <div className="flex items-start gap-2.5">
        {/* Leading on a full sheet, trailing on a glance card. The icon is the
            same in both places because it says WHAT THIS IS, and that should
            not change between surfaces — only where it sits does. Leading here
            matches the pin on Your Pet Address and the card on Payment policy,
            which both carry an icon inside the card with an h2 above it. */}
        {compact ? null : (
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          {/* Sentence case, told apart from the attribution lines by weight and
              colour rather than by case. Only the full rendering keeps a label
              inside the box; compact puts it on the row above. */}
          {hideLabel || compact ? null : (
            <p className="mb-1.5 text-xs font-semibold text-foreground">Client notes</p>
          )}
          <ul className="flex flex-col divide-y divide-border/60">
            {visible.map((note) => {
              const meta = formatNoteMeta(note)
              return (
                <li
                  key={note.id}
                  className={cn(
                    "flex flex-col gap-0.5 py-1.5 first:pt-0 last:pb-0",
                    compact && "py-0",
                  )}
                >
                  {/* Clamped in CSS so the cut lands on a word with an ellipsis
                      instead of slicing a glyph at a container edge. */}
                  <p
                    className={cn(
                      "leading-snug text-foreground",
                      compact ? "line-clamp-1 text-[11px]" : "line-clamp-2 text-sm",
                    )}
                  >
                    {note.content}
                  </p>
                  {/* Attribution is dropped on a glance surface: it is a second
                      line per note, and who wrote it is a question you ask once
                      you have opened the appointment. */}
                  {meta && !compact ? (
                    <p className="text-xs text-muted-foreground">{meta}</p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          {remaining > 0 ? (
            // Deliberately not a control. The profile is already one click away
            // on the "View profile" action in the same client row, and wiring a
            // second route to it would mean a new callback through every call
            // site for a line nobody has asked to be clickable.
            <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "mt-1.5 text-xs")}>
              {`+${remaining} more on the client profile`}
            </p>
          ) : null}
        </div>

        {/* The marker is above (compact) or leading (full) — never here. */}
      </div>
    </div>
  )
}

/**
 * "Ahsan Khan · 7 Sep, 5:49pm" — author and full timestamp, per note.
 *
 * The time is not optional. An earlier pass showed the day only and dropped
 * repeated attribution lines, which read well in the abstract and failed on
 * real data: four notes by one person on one afternoon collapsed into a single
 * "Ahsan Khan · 7 Sep" with nothing to tell them apart. Karen Dougall's demo
 * notes reproduce exactly that case.
 *
 * The year is kept only when it is not the current one — noise otherwise. Both
 * halves are optional: `authorName` arrives only when the backend enriches the
 * row, and an unparseable `createdAt` contributes nothing.
 */
function formatNoteMeta(note: ClientNote): string {
  const date = new Date(note.createdAt)
  const stamp = Number.isNaN(date.getTime())
    ? ""
    : format(
        date,
        date.getFullYear() === new Date().getFullYear() ? "d MMM, h:mmaaa" : "d MMM yyyy, h:mmaaa",
      )
  return [note.authorName, stamp].filter(Boolean).join(" · ")
}
