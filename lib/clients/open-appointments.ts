/**
 * Does this client already have an appointment somewhere in the business?
 * (R13, EC-1, CL-A1 / RC-B1.)
 *
 * ## The story this closes
 *
 * "As a receptionist I want to see that this client already has an appointment
 * somewhere in the business, so that I do not double-book them. **Done when:**
 * date, location and service of visits at any location are readable, with an
 * identical field set for every location outside my scope. **Duplicate caught
 * before booking.**"
 *
 * The readable half was built — SCR-07 put a client's visits across the estate
 * on the client record. What was missing is the half the story is actually
 * named after: the record answers the question only if reception thinks to go
 * and ask it, and somebody mid-booking does not. So the check belongs where the
 * booking is made, and it has to arrive unprompted.
 *
 * ## Why it warns and never blocks
 *
 * Two appointments on one day is often correct — two pets, a second service, a
 * partner's booking on the same account. The receptionist has the client in
 * front of them and the system does not, which is the same shape as KC1.5's
 * package mismatch: state both facts, let the person decide. Blocking here
 * would turn a real booking away to prevent a clerical error.
 *
 * ## Across the estate, not across the grant
 *
 * The whole point is the branch you cannot see. A duplicate at a branch outside
 * your scope is precisely the one you would otherwise miss, so this reads the
 * client's own history unbounded — which is R13's floor, and the reason R13
 * fixes the field set as *uniform*: date, location and service, whether the
 * visit was yours or not. What a grant narrows is what you may *do* with it.
 */

import { type ClientAppointment, getClientActivity } from "@/lib/clients/activity"

/** Not yet honoured: still to happen, or happening now. */
const OPEN_STATUSES: ReadonlyArray<ClientAppointment["status"]> = [
  "booked",
  "confirmed",
  "arrived",
  "started",
]

export type OpenAppointment = {
  id: string
  /** e.g. "Friday, May 22" — the date, said the way the client would. */
  when: string
  time: string
  /** Absent for a record from before the estate existed. */
  locationId?: string
  /** The services on it, joined — R13's third readable field. */
  services: string
}

export function openAppointmentsFor(clientId: string | null | undefined): OpenAppointment[] {
  if (!clientId) return []
  return getClientActivity(clientId)
    .appointments.filter((a) => OPEN_STATUSES.includes(a.status))
    .map((a) => ({
      id: a.id,
      when: `${a.weekday}, ${a.dayMonth}`,
      time: a.time,
      locationId: a.locationId,
      services: a.services.map((s) => s.name).join(", "),
    }))
}

/**
 * Whether any of these sit at a branch the booker is not currently working in.
 *
 * It changes the sentence rather than the decision: "already booked here" is a
 * thing reception can see on their own calendar, while "already booked at
 * another branch" is the one they cannot, and is the whole reason this exists.
 */
export function spansOtherBranches(
  open: ReadonlyArray<OpenAppointment>,
  bookingAt: string | null | undefined,
): boolean {
  if (!bookingAt) return false
  return open.some((a) => a.locationId != null && a.locationId !== bookingAt)
}
