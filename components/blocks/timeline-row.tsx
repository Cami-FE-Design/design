import type * as React from "react"

import { cn } from "@/lib/utils"

type TimelineRowProps = {
  /**
   * Leading slot rendered to the left of the connector — typically a date
   * block (`<TimelineDate>`). Optional; omit for an icon-less timeline.
   */
  leading?: React.ReactNode
  /** Hide the connector below the dot — use for the last row in the list. */
  isLast?: boolean
  /** Card content rendered to the right of the connector. */
  children: React.ReactNode
  className?: string
}

/**
 * Vertical timeline row used by Appointments / Visit history. Date / leading
 * slot on the left, a thin connector with a small dot in the middle, and
 * card content on the right. Layout is inspired by Luma's event list.
 *
 * Render the rows inside a `<ul>` (or any flow container) and pass `isLast`
 * on the final one to drop the trailing connector.
 */
export function TimelineRow({ leading, isLast, children, className }: TimelineRowProps) {
  // pb-6 lives on the leading + content cells (not the row) so the connector
  // cell auto-stretches to include that padding area — keeps the dashed line
  // continuous between rows instead of breaking at row boundaries.
  //
  // Drop the leading date column entirely when there's no `leading` (e.g. the
  // gift-card activity timeline, which groups by a month header instead of a
  // per-row date) so cards aren't pushed right by an empty 72px gutter.
  const hasLeading = leading != null
  return (
    <li
      data-slot="timeline-row"
      className={cn(
        "grid gap-3",
        hasLeading ? "grid-cols-[72px_16px_minmax(0,1fr)]" : "grid-cols-[16px_minmax(0,1fr)]",
        className,
      )}
    >
      {hasLeading ? <div className={cn("pt-4 text-sm", !isLast && "pb-6")}>{leading}</div> : null}
      <div className="relative flex justify-center">
        <div className="absolute inset-y-0 border-l border-border border-dashed" />
        <div className="relative mt-5 size-2 shrink-0 -translate-x-[0.5px] rounded-full bg-cami-violet-9 ring-2 ring-card" />
      </div>
      <div className={cn("min-w-0", !isLast && "pb-6")}>{children}</div>
    </li>
  )
}

type TimelineDateProps = {
  /** Day + month, e.g. "May 22". */
  dayMonth: string
  /** Optional weekday, e.g. "Friday". */
  weekday?: string
  className?: string
}

/**
 * Standard date block for the `leading` slot of `<TimelineRow>`. Day + month
 * on the first line, weekday muted below.
 */
export function TimelineDate({ dayMonth, weekday, className }: TimelineDateProps) {
  return (
    <div className={cn("flex flex-col leading-tight", className)}>
      <span className="font-semibold">{dayMonth}</span>
      {weekday ? <span className="text-xs text-muted-foreground">{weekday}</span> : null}
    </div>
  )
}
