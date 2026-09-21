import type { MockBooking } from "@/app/appointments/mock"

/**
 * The calendar, read through the active location scope (R07, R03, SCR-05).
 *
 * R07 gives an authorized user "one, a subset, or all granted Location
 * calendars", and the shape that satisfies it is *filter plus drill-down*
 * rather than nine columns side by side. A day grid is already staff × time;
 * adding branch as a third axis makes 11 staff columns into 99, and nobody
 * reads that. So all-branches shows how the day is split, and clicking a
 * branch narrows to it.
 *
 * The counts are why the strip exists rather than a plain filter dropdown: an
 * owner opening the calendar on all branches is asking which branch is busy,
 * and a dropdown makes them try each one to find out.
 *
 * ## Filtering here is not authorization
 *
 * `scopedLocationIds` has already been bounded by the caller's grants in
 * lib/locations/store.tsx. This narrows a set the caller may already see; it
 * is not what stops them seeing another branch (blueprint §03 — the switcher
 * is context, not security).
 */

export type LocationDayCount = {
  locationId: string
  bookings: number
  /** Minutes booked, which is what "busy" actually means on a day grid. */
  bookedMinutes: number
}

/** Bookings at the branches currently in scope. Order is preserved. */
export function bookingsInScope(
  bookings: ReadonlyArray<MockBooking>,
  scopedLocationIds: ReadonlyArray<string>,
): MockBooking[] {
  const scope = new Set(scopedLocationIds)
  return bookings.filter((b) => scope.has(b.locationId))
}

/**
 * How the day divides across the branches in scope.
 *
 * Every scoped branch gets a row, including one with nothing booked — a branch
 * with an empty day is information, and dropping it makes an empty day
 * indistinguishable from a branch that is missing from the view.
 */
export function countsByLocation(
  bookings: ReadonlyArray<MockBooking>,
  scopedLocationIds: ReadonlyArray<string>,
): LocationDayCount[] {
  return scopedLocationIds.map((locationId) => {
    const own = bookings.filter((b) => b.locationId === locationId)
    return {
      locationId,
      bookings: own.length,
      bookedMinutes: own.reduce((sum, b) => sum + b.durationMin, 0),
    }
  })
}

/**
 * Whether a booking can be dragged or created in the current view.
 *
 * False whenever the scope spans more than one branch: a create action needs
 * one explicit target, and "all locations" cannot supply one (R11,
 * "all-Locations is read only"). The grid must not resolve it by picking the
 * first branch, so the answer is to ask — which is why this returns a reason
 * rather than a boolean.
 */
export function calendarWriteTarget(
  scopedLocationIds: ReadonlyArray<string>,
): { canWrite: true; locationId: string } | { canWrite: false; reason: "needsOneLocation" } {
  if (scopedLocationIds.length === 1) {
    return { canWrite: true, locationId: scopedLocationIds[0] }
  }
  return { canWrite: false, reason: "needsOneLocation" }
}
