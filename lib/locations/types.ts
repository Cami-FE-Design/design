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
 * A location's lifecycle state (R01, R12).
 *
 * - `draft`      created, not yet trading.
 * - `live`       trading.
 * - `suspended`  public booking page hidden and calendar disabled. Bookings,
 *                services and staff assignments stay intact, and the owner can
 *                re-enable any time. A pause, not a close-out (SU1.5).
 * - `archived`   accepts no new operational write. History, receipts, reports
 *                and issued stored value stay readable, and it is never deleted.
 *                Soft-deletes for 90 days before the slug frees up (SU1.4, R12).
 */
export type LocationStatus = "draft" | "live" | "suspended" | "archived"

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
   * IANA zone. Time is stored in UTC; this governs schedules, availability,
   * display and date bucketing for this branch (R19). Business-default with a
   * per-location override, so a chain spanning timezones still buckets a day
   * the way each branch experiences it.
   */
  timezone: string
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
