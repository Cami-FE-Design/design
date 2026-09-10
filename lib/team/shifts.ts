/**
 * Rosters, per branch, and the one conflict that spans them (R05, E07, DW2.3,
 * DW2.4).
 *
 * ## Two stories, complementary rather than opposed
 *
 * An earlier version of the spec had these as alternatives — "one unified
 * timeline or one roster per branch" — and that framing was the only thing
 * blocking this screen. They fit together:
 *
 * - **DW2.3** puts a roster on **each branch**: "a stylist working Marina
 *   mornings and JLT evenings is scheduled correctly at each", and "booking
 *   only offers them at a branch during their rostered hours there".
 * - **DW2.4** adds a **cross-branch overlap block** on top: "a staff member
 *   never booked at two branches at the same time", while two overlapping
 *   bookings at the *same* branch still go through unchanged.
 *
 * Release criterion 12 states both in one line, so the roster is per branch and
 * the conflict check reaches across them. The built product has already chosen
 * that shape — `ShiftsTable` reads `activeVenueId` and its filter is headed
 * "Team members at {locationName}" — it just does not behave that way yet,
 * because nothing sets the active venue.
 *
 * ## What is still open, and it is not a design question
 *
 * Whether an overlapping booking is **blocked** or **warned** extends ADR-023,
 * which the PRD marks 🔴 as needing an extension. Either way the roster has to
 * *show* the clash, so this module surfaces it and takes no view on what
 * booking does with it. Blocking is an engineering rule; naming the conflict is
 * the screen's job.
 *
 * ## Within a branch, overlap is legal
 *
 * ADR-023 stays unchanged inside one branch: two overlapping bookings there are
 * allowed, and a design that flagged them would be reporting the product's own
 * behaviour as an error. Only cross-branch overlap is a conflict, which is why
 * `overlapsAcrossBranches` compares the branch as well as the time.
 */

/** Minutes from midnight, in the branch's own timezone. */
export type ShiftTime = { start: string; end: string }

export type Shift = {
  id: string
  memberId: string
  locationId: string
  /** Which day of the roster week — the same ids `lib/locations/hours` uses. */
  day: string
} & ShiftTime

export type RosterMember = {
  id: string
  name: string
  role: string
  /**
   * Every branch this person is assigned to (R05, DW2.3). The as-built calls
   * this an assigned location — `TeamMemberDetailAssignedLocation` is
   * `{ id, venueId, venueName }` — so the concept ships, keyed by venue.
   */
  locationIds: ReadonlyArray<string>
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Whether two ranges share any minute. Touching ends do not overlap. */
export function rangesOverlap(a: ShiftTime, b: ShiftTime): boolean {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)
}

/**
 * A shift that clashes with the same person's shift at a **different** branch,
 * on the same day (DW2.4).
 *
 * Returns the pair, because the conflict is not a property of one shift — it is
 * a relationship, and a screen that flagged only one of the two would send the
 * operator to change whichever they happened to be looking at.
 */
export type ShiftClash = { a: Shift; b: Shift }

export function crossBranchClashes(shifts: ReadonlyArray<Shift>): ShiftClash[] {
  const clashes: ShiftClash[] = []
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = shifts[i]!
      const b = shifts[j]!
      if (a.memberId !== b.memberId) continue
      if (a.day !== b.day) continue
      // Same branch, overlapping: legal, and ADR-023 says so. Only a clash
      // when the branches differ.
      if (a.locationId === b.locationId) continue
      if (rangesOverlap(a, b)) clashes.push({ a, b })
    }
  }
  return clashes
}

/** The shift ids caught in any cross-branch clash, for marking a cell. */
export function clashingShiftIds(shifts: ReadonlyArray<Shift>): Set<string> {
  const ids = new Set<string>()
  for (const { a, b } of crossBranchClashes(shifts)) {
    ids.add(a.id)
    ids.add(b.id)
  }
  return ids
}

/**
 * One branch's roster (DW2.3). Filtered by branch, not by member — a person
 * assigned to two branches appears on both, with the hours they actually work
 * at each.
 */
export function shiftsAt(
  shifts: ReadonlyArray<Shift>,
  locationId: string,
  memberId?: string,
): Shift[] {
  return shifts.filter(
    (shift) =>
      shift.locationId === locationId && (memberId === undefined || shift.memberId === memberId),
  )
}

/** Who is rostered at this branch, so a roster lists the people it can book. */
export function membersAt(
  members: ReadonlyArray<RosterMember>,
  locationId: string,
): RosterMember[] {
  return members.filter((member) => member.locationIds.includes(locationId))
}

/**
 * When this person is bookable at this branch on this day (DW2.3's acceptance:
 * "booking only offers them at a branch during their rostered hours there").
 *
 * An empty list is not an error — it means they do not work there that day, and
 * booking offers nothing rather than falling back to the branch's opening
 * hours. Falling back is how a stylist ends up booked on their day off.
 */
export function bookableHours(
  shifts: ReadonlyArray<Shift>,
  memberId: string,
  locationId: string,
  day: string,
): ShiftTime[] {
  return shifts
    .filter(
      (shift) =>
        shift.memberId === memberId && shift.locationId === locationId && shift.day === day,
    )
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
}
