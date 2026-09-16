/**
 * A person cannot be in two places at once (R05, DW2.3, DW2.4).
 *
 * ## The decision, and who made it
 *
 * Whether an overlapping booking across branches is refused or merely warned
 * was open: ADR-023 lets two *appointments* overlap when staff book from Cami
 * Business, and the PRD marks the cross-branch case as needing an extension
 * nobody had written.
 *
 * **Maaz, on a call, 15 Sep: blocked.** Someone committed at one branch is not
 * offered at another for an overlapping time. That is not written down anywhere
 * but here and the ticket yet, which is why it is attributed rather than stated
 * as though it had always been settled. It does match DW2.4's own wording —
 * "is blocked" — and release criterion 12.
 *
 * ## Two different refusals, kept apart
 *
 * A slot can be refused because the person does not work here then (DW2.3), or
 * because they are working *somewhere else* then (DW2.4). They look the same on
 * a grid and are not the same fact: the first is a gap in a roster, the second
 * is a clash between two branches, and only the second is the rule Maaz
 * settled. Collapsing them would leave nobody able to tell whether the estate
 * is under-rostered or double-booked.
 *
 * ## Within a branch nothing changes
 *
 * ADR-023 covers overlapping **appointments** — staff may double-book one
 * person's calendar from Cami Business — and stays untouched. Overlapping
 * **shifts** at one branch are a different thing, and the built rota dialog
 * already refuses them, so they are not this module's business either. Every
 * comparison here tests the branch as well as the time, because the overlap
 * nothing refuses today is the one that spans branches.
 *
 * ## Leave, and a rule the product already states
 *
 * "Online bookings cannot be placed during time off" is the built time-off
 * dialog's own sentence, and its shift dialog refuses a window that overlaps a
 * leave. So leave outranking a rota is not an inference — it is the shipped
 * rule, applied at the branch that holds the leave (DW2.2).
 *
 * ## Who is told why
 *
 * The refusal carries the other branch and the hours, because an operator needs
 * to say "she is at Marina until five, I can do five-thirty". A client is told
 * nothing about the other branch: which branches a person also works at is not
 * a client's business, and BG-06 is the gate that says so. So the client's flow
 * uses this to *drop* a slot, and the operator's surfaces use it to explain one.
 */

import type { SlotGroup } from "@/lib/booking"
import type { Leave, Shift } from "@/lib/team/shifts"

/** Minutes from midnight. Times are `HH:MM` in the branch's own timezone. */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export type SlotRefusal =
  | {
      /** Off that day at this branch — time off is the branch's (DW2.2). */
      reason: "on-leave"
      /** "Annual leave", "Sick leave" — the operator's own word for it. */
      leaveType: string
    }
  | {
      /** Rostered nowhere over this slot — a gap, not a clash (DW2.3). */
      reason: "off-roster"
    }
  | {
      /** Rostered at another branch over this slot (DW2.4, blocked). */
      reason: "other-branch"
      /** The branch they are committed at, so a caller can name it. */
      locationId: string
      /** `HH:MM`, so an operator can say "until five" rather than "unavailable". */
      start: string
      end: string
    }

/**
 * Whether this person's week is modelled at all.
 *
 * Someone with no shifts anywhere is not someone who works nowhere — it is a
 * roster that has not been filled in, which is the ordinary state of a business
 * that has never rostered. Callers fall back to the branch's own hours for
 * those people rather than making them unbookable, the same reading
 * `BookingStaff.locationIds` gets when it is absent.
 */
export function rostered(shifts: ReadonlyArray<Shift>, memberId: string): boolean {
  return shifts.some((shift) => shift.memberId === memberId)
}

/**
 * Why this slot cannot be offered to this person at this branch, or `null` when
 * it can.
 *
 * Returns the refusal rather than a boolean because the reason is the useful
 * part: a missing slot with no sentence attached is what sends reception to the
 * phone.
 */
export function slotRefusal(
  shifts: ReadonlyArray<Shift>,
  memberId: string,
  locationId: string,
  day: string,
  slot: { start: string; durationMin: number },
  leaves: ReadonlyArray<Leave> = [],
): SlotRefusal | null {
  const from = toMinutes(slot.start)
  const to = from + slot.durationMin

  // Leave is checked before any shift, and at every branch — not only the one
  // that filed it.
  //
  // DW2.2 lists time off among the per-branch facts, but it is accepted on
  // "another branch's **roster change** never affects mine", and an absence is
  // not a roster change. Scoped to its own branch, a leave at JVC would leave
  // the same person bookable at Jumeirah on the day they are out of the
  // country. A shift stays the branch's; an absence is the person's.
  //
  // It is checked first because a rota that still shows a window here must not
  // outrank it — the mistake a per-venue schedule invites, since the window and
  // the leave arrive in the same call and look like the same kind of thing.
  for (const leave of leaves) {
    if (leave.memberId !== memberId) continue
    if (leave.day !== day) continue
    if (!leave.fullDay && (from >= toMinutes(leave.end) || toMinutes(leave.start) >= to)) continue
    return { reason: "on-leave", leaveType: leave.type }
  }

  // Every shift is scanned before answering. Being rostered here over the slot
  // is not on its own enough to offer it — DW2.4's whole case is someone who is
  // rostered at two branches at once, and answering on the first shift that
  // fits would offer exactly the slot the rule exists to refuse.
  let fits = false
  let elsewhere: SlotRefusal | null = null

  for (const shift of shifts) {
    if (shift.memberId !== memberId) continue
    if (shift.day !== day) continue

    const shiftFrom = toMinutes(shift.start)
    const shiftTo = toMinutes(shift.end)

    if (shift.locationId === locationId) {
      // The whole slot has to fit inside the shift. Half of it inside means the
      // appointment runs past the end of the shift, which is the same as not
      // being there for it.
      if (shiftFrom <= from && to <= shiftTo) fits = true
      continue
    }

    // Touching ends do not overlap: someone finishing at five can start
    // somewhere else at five, and calling that a clash would refuse the
    // split-across-branches day DW2.3 exists to support.
    if (from >= shiftTo || shiftFrom >= to) continue

    elsewhere ??= {
      reason: "other-branch",
      locationId: shift.locationId,
      start: shift.start,
      end: shift.end,
    }
  }

  if (elsewhere) return elsewhere
  return fits ? null : { reason: "off-roster" }
}

/**
 * Whether this person can be offered at this branch on this day at all — used
 * to explain an empty grid rather than leaving it to read as "fully booked".
 */
export function worksAt(
  shifts: ReadonlyArray<Shift>,
  memberId: string,
  locationId: string,
  day: string,
): boolean {
  return shifts.some(
    (shift) => shift.memberId === memberId && shift.locationId === locationId && shift.day === day,
  )
}

/**
 * The day's grid as it stands for one chosen person at one branch.
 *
 * Slots they cannot take are removed rather than greyed, matching how a slot
 * another client already holds is handled — a public flow offers what is
 * bookable and nothing else. The *reason* stays behind in `slotRefusal` for the
 * operator surfaces, because a client has no business learning which other
 * branch someone is at (BG-06).
 *
 * `groups` comes back untouched for "any team member" and for anyone the roster
 * does not model, so this narrows a grid it has evidence for and never empties
 * one on the strength of missing data.
 */
export function slotsForStaff(
  groups: ReadonlyArray<SlotGroup>,
  shifts: ReadonlyArray<Shift>,
  memberId: string,
  locationId: string,
  day: string,
  durationMin: number,
  leaves: ReadonlyArray<Leave> = [],
): ReadonlyArray<SlotGroup> {
  if (!rostered(shifts, memberId)) return groups

  return groups
    .map((group) => ({
      ...group,
      times: group.times.filter(
        (slot) =>
          slotRefusal(
            shifts,
            memberId,
            locationId,
            day,
            { start: slot.time24, durationMin },
            leaves,
          ) === null,
      ),
    }))
    .filter((group) => group.times.length > 0)
}
