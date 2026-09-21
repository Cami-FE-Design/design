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
 * ## Blocked, and where the block lives
 *
 * Whether an overlapping booking is refused or merely warned was open; Maaz
 * settled it on a call on 15 Sep: **blocked**. The refusal itself is in
 * `lib/locations/cross-branch-availability`, where a slot is offered — this
 * module describes who works when, and the schedule grid shows the clash so a
 * manager can fix the rota. A conflict is named here and refused there.
 *
 * ## A branch holds its own shifts and block times. An absence is the person's
 *
 * DW2.2 is P0 and lists assignment, schedules, time off and capability together
 * as per-branch — but it is accepted on "another branch's **roster change**
 * never affects mine", and an absence is not a roster change. Scoped to its own
 * branch, a leave at JVC would leave the same person bookable at Jumeirah on a
 * day they are out of the country: a failure nobody would defend, protecting
 * nothing anybody asked for.
 *
 * So the line runs between the two. A **shift** is the branch's, and a manager
 * at one branch neither sees nor changes another's rota — which is the half of
 * DW2.2 that does the work. A **leave** is the person's and reaches every
 * branch they are rostered at. A **block time** is a hole in one branch's day,
 * so it stays put.
 *
 * `Leave.locationId` survives as provenance: somebody entered and approved it
 * somewhere, and that is worth being able to say. Nothing scopes off it.
 *
 * ## Two different overlaps, and only one of them is ours
 *
 * ADR-023 / INV-B7 is about **appointments**: staff booking from Cami Business
 * may double-book one person's calendar, ungated and trust-based. That is
 * untouched here and has nothing to do with a rota.
 *
 * A **shift** is the opposite. The built product's shift dialog refuses two
 * windows that overlap at one branch, refuses a duplicate, refuses a window
 * that overlaps a leave, and requires at least `MIN_SHIFT_GAP_MINUTES` between
 * windows — so an overlapping rota at one branch is a state nobody can create.
 *
 * Which is exactly why the cross-branch case needs a check of its own. Each
 * branch's rota is written under its own venue, and nothing compares two of
 * them, so the one overlap the product cannot refuse today is the one that
 * spans branches — the gap multi-location opens and DW2.4 closes.
 * `overlapsAcrossBranches` compares the branch as well as the time, so a
 * same-branch pair is never reported even if one ever reached the data.
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

// ─── The day cell ─────────────────────────────────────────────────────────────
// What one person's one day at one branch actually contains. The as-built grid
// draws exactly these four things (`DayCellData` in the dev repo: windows,
// leaves, blocks, notWorking), so the model here is that shape rather than a
// simplification we would have to unpick later.

/**
 * Time off, held by a **branch** (DW2.2, SCR-10).
 *
 * The PRD is explicit and P0: "set my branch's schedules and time off
 * separately from other branches", with the acceptance that "another branch's
 * roster change never affects mine". SCR-10 lists time off alongside
 * assignment and schedules as per-branch. The document is the authority here;
 * the built dialog's lack of a location field is a single-venue product having
 * nothing to choose between, not a decision about estates.
 *
 * **An absence, though, is the person's.** Somebody on annual leave is on leave
 * everywhere, so the leave closes every branch they are rostered at. Scoping it
 * to the branch that filed it would let an estate book a person who is out of
 * the country — and DW2.2's acceptance is about a *roster change*, which an
 * absence is not. `locationId` stays as provenance: who entered it, and where.
 *
 * `fullDay` is not derivable from the hours: "out all day" and "out 09:00 to
 * 17:00" look identical on a nine-to-five rota and mean different things the
 * moment a shift moves. The built product carries the flag for the same reason.
 */
export type Leave = {
  id: string
  memberId: string
  /**
   * Which branch filed it — provenance, not scope.
   *
   * DW2.2 lists time off among the per-branch facts, but the criterion it is
   * accepted on says "another branch's **roster change** never affects mine",
   * and an absence is not a roster change. Read the requirement the other way
   * and an estate can sell somebody who is out of the country: their leave at
   * JVC leaves them bookable at Jumeirah, which is a failure nobody would
   * defend, protecting nothing anybody asked for.
   *
   * So a **shift** is a branch's and a **leave** is the person's. The branch is
   * kept because somebody entered and approved it there, and that is worth
   * being able to say — but nothing scopes off it.
   */
  locationId: string
  /** What kind, in the operator's own words: "Annual leave", "Sick leave". */
  type: string
  day: string
  start: string
  end: string
  fullDay: boolean
  /**
   * Every week, not just this one. The as-built leave carries `isRepeat`,
   * `repeatType` and `repeatUntil`; this repo shows one week, so the useful
   * half is whether the entry survives paging forward.
   */
  repeats?: boolean
  /**
   * Signed off, or still a request. `ApiLeaveSchema.status` carries this and
   * the built dialog has the checkbox.
   *
   * **Pending leave still blocks booking here**, and that is a choice: booking
   * somebody who then goes away leaves a client at the door with nobody there,
   * while holding a slot that is later released costs an hour somebody can
   * resell. Nobody has ruled on it — flagged in the spec, not settled here.
   */
  approved?: boolean
  /** The operator's own note, ≤100 characters, as the built dialog allows. */
  note?: string
}

/**
 * A non-bookable hole in one branch's day — a lunch, a team meeting. Display
 * only: it is not leave, the person is at work, and the hours simply cannot be
 * sold.
 */
export type BlockTime = {
  id: string
  memberId: string
  locationId: string
  day: string
  title: string
  start: string
  end: string
}

export type DayCell = {
  /** Shift windows at this branch. Empty means not working here that day. */
  windows: ShiftTime[]
  /** Every leave that day, whether or not it lands inside a shift. */
  leaves: Leave[]
  blocks: BlockTime[]
  /** The whole day is off — no windows, or a full-day leave. */
  notWorking: boolean
}

export function dayCell(
  shifts: ReadonlyArray<Shift>,
  leaves: ReadonlyArray<Leave>,
  blocks: ReadonlyArray<BlockTime>,
  memberId: string,
  locationId: string,
  day: string,
): DayCell {
  const windows = shifts
    .filter((s) => s.memberId === memberId && s.locationId === locationId && s.day === day)
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

  // Deliberately not filtered by branch: somebody away is away, so their leave
  // shows on every branch's grid where they are rostered. A manager who cannot
  // see it would roster over it, which is exactly the hole this closes.
  const onLeave = leaves.filter((l) => l.memberId === memberId && l.day === day)
  const onBlock = blocks
    .filter((b) => b.memberId === memberId && b.locationId === locationId && b.day === day)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

  return {
    windows,
    leaves: onLeave,
    blocks: onBlock,
    notWorking: windows.length === 0 || onLeave.some((l) => l.fullDay),
  }
}

/** The full-day leave on a cell, which takes the cell over when present. */
export function fullDayLeave(cell: DayCell): Leave | undefined {
  return cell.leaves.find((l) => l.fullDay)
}

/**
 * What is left of a window once the intervals inside it are taken out.
 *
 * A half-day's leave in the middle of a shift leaves two workable pieces, not
 * one shorter one, and a grid that drew a single 09:00–17:00 pill over a
 * lunchtime absence would be offering hours nobody is there for.
 */
export function subtractIntervals(
  window: ShiftTime,
  intervals: ReadonlyArray<ShiftTime>,
): ShiftTime[] {
  let pieces: ShiftTime[] = [window]
  const ordered = [...intervals].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

  for (const cut of ordered) {
    const cutFrom = toMinutes(cut.start)
    const cutTo = toMinutes(cut.end)
    pieces = pieces.flatMap((piece) => {
      const from = toMinutes(piece.start)
      const to = toMinutes(piece.end)
      if (to <= cutFrom || from >= cutTo) return [piece]
      const kept: ShiftTime[] = []
      if (from < cutFrom) kept.push({ start: piece.start, end: cut.start })
      if (to > cutTo) kept.push({ start: cut.end, end: piece.end })
      return kept
    })
  }

  return pieces
}

/**
 * Minutes actually worked in a cell.
 *
 * Leave is deducted, because an hours column that counted sick leave as hours
 * worked would be the number nobody can use — the as-built makes the same
 * choice, and for payroll it is the only defensible one. Block times are *not*
 * deducted: a lunch is unsellable, not unworked, and taking it out of an hours
 * total would quietly restate someone's day.
 */
export function workingMinutes(cell: DayCell): number {
  if (cell.leaves.some((l) => l.fullDay)) return 0

  const worked = cell.windows.reduce(
    (total, w) => total + Math.max(0, toMinutes(w.end) - toMinutes(w.start)),
    0,
  )
  const off = cell.leaves.reduce(
    (total, l) => total + Math.max(0, toMinutes(l.end) - toMinutes(l.start)),
    0,
  )
  return Math.max(0, worked - off)
}

/**
 * "40 hr" / "7 hr, 30 min" / "55 min" — the way the built product writes a
 * total, so a rota read here and a rota read there are the same number in the
 * same words.
 */
export function formatHours(minutes: number): string {
  if (minutes <= 0) return "0 hr"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} hr` : `${h} hr, ${m} min`
}

// ─── Ordering the grid ────────────────────────────────────────────────────────

/**
 * How a manager wants the rows stacked, matching the built product's own list.
 *
 * "Custom" is the merchant's configured order and the default, because a rota
 * is read in the order the team is used to seeing itself — sorting by hours is
 * something you reach for to answer a question, not to work in.
 */
export type ShiftSortOrder =
  | "custom"
  | "hours-desc"
  | "hours-asc"
  | "shifts-desc"
  | "shifts-asc"
  | "az-name"
  | "za-name"
  | "az-surname"
  | "za-surname"

export const SHIFT_SORT_LABELS: Record<ShiftSortOrder, string> = {
  custom: "Custom order",
  "shifts-desc": "Shifts (most first)",
  "shifts-asc": "Shifts (fewest first)",
  "hours-desc": "Hours (most first)",
  "hours-asc": "Hours (fewest first)",
  "az-name": "Name (A-Z)",
  "za-name": "Name (Z-A)",
  "az-surname": "Surname (A-Z)",
  "za-surname": "Surname (Z-A)",
}

function surname(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts.length > 1 ? parts[parts.length - 1] : parts[0]) ?? ""
}

/**
 * Order one branch's rows.
 *
 * Hours and shift counts are **this branch's**, not the person's whole week —
 * the grid is the branch's, and sorting a per-branch table by a business-wide
 * number would put somebody at the top of a rota they barely work.
 */
export function sortShiftRows<T extends { member: RosterMember; cells: DayCell[] }>(
  rows: ReadonlyArray<T>,
  order: ShiftSortOrder,
): T[] {
  const hours = (row: T) => row.cells.reduce((total, cell) => total + workingMinutes(cell), 0)
  const shiftCount = (row: T) => row.cells.reduce((total, cell) => total + cell.windows.length, 0)
  const sorted = [...rows]

  switch (order) {
    case "hours-desc":
      return sorted.sort((a, b) => hours(b) - hours(a))
    case "hours-asc":
      return sorted.sort((a, b) => hours(a) - hours(b))
    case "shifts-desc":
      return sorted.sort((a, b) => shiftCount(b) - shiftCount(a))
    case "shifts-asc":
      return sorted.sort((a, b) => shiftCount(a) - shiftCount(b))
    case "az-name":
      return sorted.sort((a, b) => a.member.name.localeCompare(b.member.name))
    case "za-name":
      return sorted.sort((a, b) => b.member.name.localeCompare(a.member.name))
    case "az-surname":
      return sorted.sort((a, b) => surname(a.member.name).localeCompare(surname(b.member.name)))
    case "za-surname":
      return sorted.sort((a, b) => surname(b.member.name).localeCompare(surname(a.member.name)))
    default:
      // The seed's own order, which is the merchant's configured one.
      return sorted
  }
}

/**
 * The break the built rota requires between two windows on one day.
 *
 * Stated here so a seed cannot drift into a rota the product would refuse. It
 * is not enforced on read — there is no write surface in this repo yet — but a
 * demo that shows an impossible week teaches the wrong rule.
 */
export const MIN_SHIFT_GAP_MINUTES = 30

/**
 * What is wrong with a day's windows at one branch, in the order the built
 * shift dialog reports it, or `null` when the day is fine.
 *
 * One function rather than five booleans, because the dialog shows one message
 * at a time and an operator fixing a rota needs the next thing to fix, not a
 * list. The order matters: a duplicate is also an overlap, and telling somebody
 * their shifts overlap when they have simply entered the same one twice sends
 * them to change a time that was right.
 */
export type RotaProblem = "duplicate" | "overlap" | "too-short" | "gap" | "leave"

export const ROTA_PROBLEM_MESSAGE: Record<RotaProblem, string> = {
  duplicate: "Duplicate shift. Each shift needs its own start and end time.",
  overlap: "Shifts cannot overlap. Adjust the start or end times.",
  "too-short": "A shift has to end after it starts.",
  gap: `There must be at least a ${MIN_SHIFT_GAP_MINUTES} minute gap between shifts.`,
  leave: "A shift cannot overlap time off.",
}

export function dayWindowProblem(
  windows: ReadonlyArray<ShiftTime>,
  leaveWindows: ReadonlyArray<ShiftTime> = [],
): RotaProblem | null {
  const overlaps = (a: ShiftTime, b: ShiftTime) =>
    toMinutes(a.start) < toMinutes(b.end) && toMinutes(a.end) > toMinutes(b.start)

  for (let i = 0; i < windows.length; i++) {
    for (let j = i + 1; j < windows.length; j++) {
      const a = windows[i]!
      const b = windows[j]!
      if (a.start === b.start && a.end === b.end) return "duplicate"
    }
  }

  for (let i = 0; i < windows.length; i++) {
    for (let j = i + 1; j < windows.length; j++) {
      if (overlaps(windows[i]!, windows[j]!)) return "overlap"
    }
  }

  if (windows.some((w) => toMinutes(w.end) <= toMinutes(w.start))) return "too-short"

  const ordered = [...windows].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  for (let i = 0; i < ordered.length - 1; i++) {
    if (toMinutes(ordered[i + 1]!.start) - toMinutes(ordered[i]!.end) < MIN_SHIFT_GAP_MINUTES) {
      return "gap"
    }
  }

  // Leave last, because it is the one problem the operator cannot fix by
  // moving a time — they have to move the leave, and saying so only helps once
  // the shifts themselves make sense.
  if (leaveWindows.some((leave) => windows.some((w) => overlaps(w, leave)))) return "leave"

  return null
}

/** Whether a day's windows at one branch are a rota the product would accept. */
export function validDayWindows(windows: ReadonlyArray<ShiftTime>): boolean {
  return dayWindowProblem(windows) === null
}
