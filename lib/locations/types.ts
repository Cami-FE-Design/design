import type { WeekSchedule } from "@/lib/locations/hours"

/**
 * The Location domain, shaped to the blueprint's three data-ownership planes
 * (Multi-Location Blueprint §02). Read that section before adding a field here,
 * because which plane a field belongs to decides its behaviour, not its type:
 *
 * - Business-shared    defined once, read everywhere. Country, currency, client
 *                      and staff identity, catalog definitions, stored value.
 *                      NOT in this file — a Location never owns them.
 * - Location-config    every branch's own settings. Profile, address, hours,
 *                      timezone, tax identity, receipt sequence. This is the
 *                      `Location` type below.
 * - Location-operational  never locationless. Appointments, sales, receipts,
 *                      stock movements. Those types live with their own modules
 *                      and carry a `locationId` — they are not modelled here.
 *
 * Why the business name is not derived into a location name: business identity
 * and location profile sit on different planes, so renaming the business does
 * not rename its branches. That is the answer to the gap `lib/terminals/store.tsx`
 * used to carry a TODO about.
 */

export type LocationAddress = {
  address: string
  aptSuite: string
  district: string
  city: string
  state: string
  postcode: string
  country: string
}

/**
 * Tax Identity (R23). Resolves from a Business default with a per-Location
 * override of each field. Whatever resolves here is copied onto the Receipt at
 * sale completion and never changes afterward, so editing this never rewrites
 * an issued receipt (INV-12).
 *
 * Per-location tax identity ships in v0 — the blueprint still lists this as an
 * open decision (§07 "Receipt numbering & tax identity"), but the PRD's own
 * corrections table settled it on 17 Aug: the system register was right.
 */
export type Invoicing = {
  sameAsLocation: boolean
  companyName: string
  address: string
  aptSuite: string
  city: string
  state: string
  postcode: string
  vatNumber: string
  invoiceNote: string
}

/**
 * A location's lifecycle state (R01, R12), and it is the built product's.
 *
 * `cami-business` exposes one endpoint — `PATCH /merchant/venues/{id}/state`
 * — with four transitions over three states:
 *
 *     suspend    active → suspended    (reason required; archived → 409)
 *     unsuspend  suspended → previous  (reason optional)
 *     archive    active → archived     (reason required; suspended → 409)
 *     restore    archived → previous   (reason optional)
 *
 * - `live`       trading. The as-built calls this `active`; the word here is
 *                the one the UI says, and the mapping is one to one.
 * - `suspended`  public booking page hidden and calendar disabled. Bookings,
 *                services and staff assignments stay intact (SU1.5).
 * - `archived`   accepts no new operational write. History, receipts, reports
 *                and issued stored value stay readable, and it is never
 *                deleted (R12). **Restorable**, because the built product has a
 *                `restore` transition and R12 forbids deletion, not recovery.
 *
 * There is no fourth state. An earlier version of this file had a `draft` —
 * "created is not the same as trading" — which is nowhere in R01, nowhere in
 * the PRD, and nowhere in the built product. It cost every surface a branch it
 * did not need and produced a real defect: the service catalog told a draft
 * branch its menu would apply "when it reopens", to a branch that had never
 * opened. A new venue is created active, as the as-built creates it.
 */
export type LocationStatus = "live" | "suspended" | "archived"

export type Location = {
  id: string
  name: string
  slug: string
  phone: string
  email: string
  location: LocationAddress
  mapPin: { lat: number; lng: number } | null
  businessType: string[]
  invoicing: Invoicing
  status: LocationStatus
  /**
   * This branch's opening hours (R01). Its own, not the business's — a chain
   * whose branches all keep the same hours is the exception, not the model.
   * Read together with `timezone` below; see lib/locations/hours.ts.
   */
  hours: WeekSchedule
  /**
   * This branch's own IANA zone, when it has one (R19).
   *
   * Absent is inheritance, not a blank: the branch follows
   * `BUSINESS_TIMEZONE` and keeps following it when the business moves. Read it
   * through `resolveTimezone` rather than directly — the value and where it
   * came from are both needed, because "same as the business" and "deliberately
   * Dubai" look identical once resolved and behave differently the day the
   * default changes.
   *
   * Time is stored in UTC; this governs schedules, availability, display and
   * date bucketing for the branch.
   */
  timezone?: string
  /**
   * What a client is shown this branch as, when the area is not what it is
   * called (D3, answered 15 Sep by Chaps & Co's own site).
   *
   * Their branches are "Bloomingdale's" and "Dubai Design District" — and
   * Bloomingdale's is a store inside Dubai Mall, whose district is Downtown
   * Dubai. Deriving the public label from `location.district` would have
   * rendered it "Chaps & Co Downtown Dubai", which is neither what they call it
   * nor what a client searches for. Fresha lists the same branch as
   * "Chaps & Co - Bloomingdale's" with Downtown Dubai as a separate line, which
   * is the shape: the name and the area are two facts.
   *
   * Absent means the area *is* the label, which is the ordinary case and what
   * all three seeded Shampooch branches are.
   */
  publicName?: string
  ownerName: string
  ownerEmail: string
  photoUrl: string
}

/**
 * The active Location Scope of a session (R03). One location, a named subset,
 * or every location the user is granted.
 *
 * `all` means "every location I am granted", never "every location that exists"
 * — an all-branch query aggregates an authorized set, never an unfiltered one
 * (blueprint §02 invariants). A user granted one branch who picks `all` gets
 * exactly that one branch, correctly labelled as theirs (KH1.3).
 */
export type LocationScope =
  | { kind: "all" }
  | { kind: "one"; locationId: string }
  | { kind: "subset"; locationIds: string[] }

/** True when this status accepts new operational writes (R12). */
export function acceptsWrites(status: LocationStatus): boolean {
  return status === "live"
}

/** True when this location's public booking page is reachable (SU1.5, R15). */
export function isPubliclyBookable(status: LocationStatus): boolean {
  return status === "live"
}
