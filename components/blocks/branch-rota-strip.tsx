"use client"

/**
 * Which branch's week you are looking at (R03, R07, DW2.3).
 *
 * ## One grid at a time, and the strip is why that is enough
 *
 * Stacking a grid per branch worked at three and stops working at nine: the
 * page becomes a scroll with no end, and nothing on it answers "which branch
 * needs me". It is also the mistake `BranchDayStrip` already names for the
 * calendar — a rota is people × days, so branches are a third axis, and a third
 * axis turns 21 cells into 315.
 *
 * So the estate lives on the strip and the week lives in one grid. The strip
 * carries the comparison that is actually wanted — who is rostered where, how
 * many hours each branch has, which one has nobody — and clicking opens that
 * branch's week. Same shape as the calendar's strip on purpose: an operator
 * should not learn two ways to pick a branch.
 *
 * ## Hours, not just names
 *
 * A row of branch names is a menu; a row of branch names with their week on
 * them is an answer. "Al Quoz, nobody assigned" and "JVC, 3 people, 97 hr" are
 * the two things a manager opening this page is actually checking, and a
 * dropdown would make them try each branch to find out.
 */

import { TriangleAlertIcon } from "lucide-react"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WEEK_DAYS } from "@/lib/locations/hours"
import type { Location } from "@/lib/locations/types"
import {
  type BlockTime,
  crossBranchClashes,
  dayCell,
  type Leave,
  membersAt,
  type RosterMember,
  type Shift,
  workingMinutes,
} from "@/lib/team/shifts"
import { cn } from "@/lib/utils"

export function BranchRotaStrip({
  locations,
  selectedId,
  onSelect,
  members,
  shifts,
  leaves,
  blocks,
}: {
  /** The branches in scope, already bounded by grants (BG-06). */
  locations: ReadonlyArray<Location>
  selectedId: string
  onSelect: (locationId: string) => void
  members: ReadonlyArray<RosterMember>
  shifts: ReadonlyArray<Shift>
  leaves: ReadonlyArray<Leave>
  blocks: ReadonlyArray<BlockTime>
}) {
  // Nothing to choose between for a single-branch business (DW1.2): the strip
  // would be one card that does nothing, which is clutter with a border on it.
  if (locations.length < 2) return null

  const weeks = locations.map((location) => {
    const rostered = membersAt(members, location.id)
    const minutes = rostered.reduce(
      (total, member) =>
        total +
        WEEK_DAYS.reduce(
          (sum, day) =>
            sum + workingMinutes(dayCell(shifts, leaves, blocks, member.id, location.id, day.id)),
          0,
        ),
      0,
    )
    return { location, people: rostered.length, minutes }
  })

  // Which branches hold a clash, so the row answers "where do I need to be"
  // rather than only "where can I go".
  const clashed = new Set<string>()
  for (const clash of crossBranchClashes(shifts)) {
    clashed.add(clash.a.locationId)
    clashed.add(clash.b.locationId)
  }

  return (
    // Short labels only. The ghost variant is the repo's filter-tab idiom and
    // it is built for "All / Active / Archived" — a count, a week's hours and a
    // status badge inside each one made three tabs of three different lengths
    // and lost the shape that makes a tab row readable. The week's numbers live
    // under it, where there is room for them.
    <Tabs value={selectedId} onValueChange={onSelect} className="shrink-0">
      <TabsList variant="ghost" className="flex-wrap justify-start">
        {weeks.map(({ location, people }) => (
          <TabsTrigger key={location.id} value={location.id} title={location.name}>
            {/* The branch's own label, not `location.name`. Every name in a
                chain starts with the business, so nine tabs reading
                "Shampooch …" spend their width on the one word that cannot
                tell them apart. */}
            {location.location.district || location.name}
            <span className="sr-only">{location.name}</span>

            {/* One number, not a sentence. Stripping the tabs to bare names
                left nine identical words and no answer to the question the row
                exists for; a count of people is uniform in width, so it says
                something without making the row ragged. Zero is the one worth
                seeing, so it is not hidden. */}
            <span
              className={cn(
                "font-normal text-xs tabular-nums",
                people === 0 ? "text-cami-yellow-11" : "text-muted-foreground",
              )}
            >
              {people}
            </span>

            {/* A branch that needs attention says so here, rather than only
                once you have opened it. */}
            {clashed.has(location.id) ? (
              <TriangleAlertIcon className="size-3.5 text-cami-yellow-11" aria-hidden />
            ) : null}
            {clashed.has(location.id) ? (
              <span className="sr-only">has a cross-location clash</span>
            ) : null}

            {/* Only when it is not simply live: a badge on every tab is
                decoration, a badge on the one paused branch is information. */}
            {location.status === "live" ? null : <LocationStatusBadge status={location.status} />}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
