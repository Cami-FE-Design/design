"use client"

/**
 * SCR-05 · The all-branches calendar's branch strip (R07, R11, SCR-05).
 *
 * "Per-branch columns or filter, drill into one." This is the filter half, and
 * it is a filter rather than columns on purpose: a day grid is already staff ×
 * time, so a third axis turns 11 columns into 99 and nobody reads that. The
 * strip shows how the day divides, and clicking a branch narrows the grid to
 * it.
 *
 * The counts are the reason it is a strip and not a dropdown. An owner opening
 * the calendar across branches is asking *which branch is busy*, and a dropdown
 * makes them try each one to find out.
 *
 * It also carries R11's consequence, which is the part that is easy to skip: an
 * all-branches view is **read only** for creating. A new booking needs one
 * explicit branch, and the view cannot supply one, so the strip says so instead
 * of letting the grid quietly resolve it to whichever branch happens to be
 * first.
 */

import { InfoIcon } from "lucide-react"
import type { MockBooking } from "@/app/appointments/mock"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { calendarWriteTarget, countsByLocation } from "@/lib/locations/calendar-scope"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

function hours(minutes: number): string {
  if (minutes === 0) return "nothing booked"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m booked`
  return m === 0 ? `${h}h booked` : `${h}h ${m}m booked`
}

export function BranchDayStrip({
  bookings,
  className,
}: {
  /** The day's bookings across every granted branch, before scoping. */
  bookings: ReadonlyArray<MockBooking>
  className?: string
}) {
  const { granted, scopedLocations, setScope, byId, isMultiLocation } = useLocations()

  // Nothing to divide for a single-branch business (DW1.2).
  if (!isMultiLocation) return null

  const scopedIds = scopedLocations.map((l) => l.id)
  const counts = countsByLocation(
    bookings,
    granted.map((l) => l.id),
  )
  const write = calendarWriteTarget(scopedIds)
  const busiest = Math.max(1, ...counts.map((c) => c.bookedMinutes))

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* A grid, not a wrapped flex row. With `flex-1` the last row stretched
          its one card across the full width — at nine branches Yas Island was
          three times the size of every other branch and read as important. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
        {counts.map((count) => {
          const location = byId(count.locationId)
          if (!location) return null
          const active = scopedIds.includes(count.locationId)
          const isOnlyOne = active && scopedIds.length === 1
          return (
            <button
              key={count.locationId}
              type="button"
              // Clicking the branch you are already alone in returns to all —
              // a toggle, so drilling in and back out is the same gesture.
              onClick={() =>
                isOnlyOne
                  ? setScope({ kind: "all" })
                  : setScope({ kind: "one", locationId: count.locationId })
              }
              aria-pressed={active}
              className={cn(
                "flex min-w-0 flex-col gap-1.5 rounded-2xl border p-3 text-left transition-colors",
                active
                  ? "border-cami-violet-7 bg-cami-violet-2"
                  : "border-border/60 hover:bg-foreground/[0.03]",
              )}
            >
              {/* The branch's own label, not `location.name`. Every name in a
                  chain starts with the business — nine cards reading
                  "Shampooch …" spend their width on the one word that cannot
                  tell them apart, and truncation eats the word that can:
                  "Shampooch Al Quoz" came out as "Shampooch…". Inside the
                  business the prefix is already known. Full name on hover and
                  for a screen reader. */}
              <span className="flex min-w-0 items-center gap-2" title={location.name}>
                <span className="truncate text-sm font-medium text-foreground">
                  {location.location.district || location.name}
                </span>
                <LocationStatusBadge status={location.status} />
              </span>
              <span className="sr-only">{location.name}</span>
              <span className="text-xs text-muted-foreground">
                {count.bookings === 0
                  ? "No appointments"
                  : `${count.bookings} ${count.bookings === 1 ? "appointment" : "appointments"}`}
                <span aria-hidden> · </span>
                {hours(count.bookedMinutes)}
              </span>
              {/* Relative, because "busy" on a day grid is a comparison. */}
              <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-cami-violet-9"
                  style={{ width: `${Math.round((count.bookedMinutes / busiest) * 100)}%` }}
                />
              </span>
            </button>
          )
        })}
      </div>

      {!write.canWrite ? (
        <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            You're looking at {scopedLocations.length} locations. Pick one before creating a booking
            — an appointment belongs to exactly one location, and this view can't choose for you.
          </span>
        </p>
      ) : null}
    </div>
  )
}
