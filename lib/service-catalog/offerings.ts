/**
 * Location offerings — a service's per-branch configuration (R06, SCR-09).
 *
 * The distinction the whole feature rests on: a **service definition** is
 * business-shared, a **location offering** is per branch. One catalog, many
 * offerings. A branch that charges more does not get a second Dog Wash; it
 * gets an override on one field of the shared one.
 *
 * ## Nothing like this exists in the product yet
 *
 * `cami-business`'s service catalog carries a single `priceType`, `price` and
 * `duration` per service, business-level, with no venue dimension and no
 * inheritance. So this is a proposal rather than a mirror, and the shape is
 * chosen to match the precedence law the platform already follows: INV-13
 * nearest-wins. The location value resolves ahead of the business value for
 * every field, limits included.
 *
 * ## Why overrides are sparse rather than a full copy per branch
 *
 * "Raising the business default leaves an overridden branch price untouched"
 * (DW3.1) only works if the branch stores *what it deliberately differs on*,
 * not a snapshot of everything. Copy the whole service per branch and a
 * business-wide price change silently stops reaching nine branches — which is
 * the exact failure the requirement is written against.
 *
 * A field absent from `overrides` is inherited, and inherited means *live*: it
 * follows the business default from now on. That is also why reset is a
 * deletion of the key rather than a write of the current default.
 *
 * ## Snapshotting is somewhere else, on purpose
 *
 * The resolved price and duration are snapshotted at book or sell time (R06,
 * INV-12), so a later default change never rewrites a past appointment or an
 * issued receipt. That happens where the booking and the sale are made. This
 * module only answers "what does this branch charge today".
 */

import type { PriceType } from "@/lib/service-catalog/types"

/** The fields a branch may differ on. Add one here and the UI picks it up. */
export type OverridableField = "priceType" | "price" | "duration"

export const OVERRIDABLE_FIELDS: {
  field: OverridableField
  label: string
}[] = [
  { field: "priceType", label: "Price type" },
  { field: "price", label: "Price" },
  { field: "duration", label: "Duration" },
]

export type OfferingOverrides = {
  priceType?: PriceType
  price?: number
  duration?: number
}

export type LocationOffering = {
  serviceId: string
  locationId: string
  /**
   * Whether the branch offers this service at all (DW3.3). Separate from
   * overrides: a branch with no groomer turns Dog Wash off without touching
   * the business-wide definition or any other branch.
   */
  enabled: boolean
  overrides: OfferingOverrides
}

/** What a service is worth at a branch, and which values are the branch's own. */
export type ResolvedOffering = {
  enabled: boolean
  priceType: PriceType
  price: number
  duration: number
  /** Per field, whether the value came from the branch or the business (R06). */
  source: Record<OverridableField, "location" | "business">
}

export type ServiceDefaults = {
  priceType: PriceType
  price: number
  duration: number
}

const OFFERING_KEY_SEPARATOR = "::"

/** Offerings are keyed by the pair, since neither id alone identifies one. */
export function offeringKey(serviceId: string, locationId: string): string {
  return `${serviceId}${OFFERING_KEY_SEPARATOR}${locationId}`
}

/**
 * Resolve a service at one branch. Nearest wins, per field (INV-13).
 *
 * A missing offering resolves to the business values and `enabled: true` — a
 * branch that has never been configured offers the business menu, which is
 * what makes adding branch N cost nothing (R02). Turning a service *off*
 * somewhere is a decision, so it has to be recorded; leaving it alone is not.
 */
export function resolveOffering(
  defaults: ServiceDefaults,
  offering: LocationOffering | undefined,
): ResolvedOffering {
  const overrides = offering?.overrides ?? {}
  return {
    enabled: offering?.enabled ?? true,
    priceType: overrides.priceType ?? defaults.priceType,
    price: overrides.price ?? defaults.price,
    duration: overrides.duration ?? defaults.duration,
    source: {
      priceType: overrides.priceType === undefined ? "business" : "location",
      price: overrides.price === undefined ? "business" : "location",
      duration: overrides.duration === undefined ? "business" : "location",
    },
  }
}

/** How many fields this branch deliberately differs on. Drives the "2 overrides" summary. */
export function overrideCount(offering: LocationOffering | undefined): number {
  if (!offering) return 0
  return OVERRIDABLE_FIELDS.filter(({ field }) => offering.overrides[field] !== undefined).length
}

/**
 * Return the branch to inheriting one field (DW3.2): "resetting one field
 * reverts only that field".
 *
 * It deletes the key rather than writing today's business value, which is the
 * difference between inheriting and coincidentally matching. Write the value
 * and the branch stops following the default the moment it changes again.
 */
export function resetField(offering: LocationOffering, field: OverridableField): LocationOffering {
  const overrides = { ...offering.overrides }
  delete overrides[field]
  return { ...offering, overrides }
}

/**
 * The chain's per-branch offering, seeded.
 *
 * This is the one place a branch's deviation from the business menu lives. It
 * used to be written twice: once here as form state on the service sheet, and
 * once by hand in lib/public-business.ts as a filter-and-map over the branch's
 * service list. Two hand-maintained copies of "Jumeirah charges more and does
 * not do daycare" is exactly the drift R06 exists to prevent — the client-facing
 * price could disagree with the operator-facing one and nobody would notice.
 *
 * Keyed by catalog ids (lib/booking.ts), which the operator's service sheet now
 * reads too — lib/service-catalog/mock-data.ts derives its services from the
 * same catalog rather than holding a second one. An override made in the sheet
 * lands on the id the client page and the booking flow look up, which is what
 * makes these seeded rows and a fresh edit the same kind of thing.
 */
export const LOCATION_OFFERINGS: LocationOffering[] = [
  {
    // The busy branch charges more for the same wash — 145 against the
    // business's 120. Duration is still the business's, which is what a
    // per-field override means in practice.
    //
    // This said 75 while the comment and the spec both said "charges more", so
    // the seed was arguing with itself and the screen showed the branch as
    // cheaper.
    serviceId: "bath-small",
    locationId: "shampooch-jumeirah",
    enabled: true,
    overrides: { price: 145 },
  },
  {
    // No space for daycare here, so it is not offered — and therefore not
    // listed on this branch's public page (DW3.3, R15).
    serviceId: "daycare-day",
    locationId: "shampooch-jumeirah",
    enabled: false,
    overrides: {},
  },

  // ── The rest of the estate ─────────────────────────────────────────────────
  //
  // Two configured branches out of nine meant almost nothing was turned off
  // anywhere, so every screen that exists to show a branch differing showed
  // nothing differing. A reviewer cannot judge "not at this branch" from a seed
  // where every branch runs everything.
  //
  // Each line below is a reason a real branch would differ — a room it does not
  // have, equipment it does not own, a market that pays more — rather than
  // variety for its own sake. Branches not listed inherit the whole business
  // menu, which is the ordinary case and has to stay visible too.

  {
    // A mall unit: no kennels, so nothing overnight and nothing all-day.
    serviceId: "daycare-day",
    locationId: "shampooch-downtown-dubai",
    enabled: false,
    overrides: {},
  },
  {
    serviceId: "boarding",
    locationId: "shampooch-downtown-dubai",
    enabled: false,
    overrides: {},
  },
  {
    // Mall rent, and the footfall to carry it.
    serviceId: "full-groom",
    locationId: "shampooch-downtown-dubai",
    enabled: true,
    overrides: { price: 260 },
  },
  {
    // No dental chair at the marina unit.
    serviceId: "scale",
    locationId: "shampooch-dubai-marina",
    enabled: false,
    overrides: {},
  },
  {
    // Longer slot here: one bather, and the room doubles as the dryer room.
    serviceId: "bath-large",
    locationId: "shampooch-dubai-marina",
    enabled: true,
    overrides: { duration: 90 },
  },
  {
    // Cat-only room is Mirdif's alone, so the cat groom is cheaper where it is
    // routine and unchanged everywhere else.
    serviceId: "cat-groom",
    locationId: "shampooch-mirdif",
    enabled: true,
    overrides: { price: 150 },
  },
  {
    serviceId: "medicated",
    locationId: "shampooch-mirdif",
    enabled: false,
    overrides: {},
  },
  {
    // Abu Dhabi opened without the spa fit-out; the treatments wait for it.
    serviceId: "facial",
    locationId: "shampooch-al-reem",
    enabled: false,
    overrides: {},
  },
  {
    serviceId: "spa-pamper-combo",
    locationId: "shampooch-al-reem",
    enabled: false,
    overrides: {},
  },
  {
    // Sharjah prices below Dubai, which is the market rather than a discount.
    serviceId: "full-groom",
    locationId: "shampooch-al-majaz",
    enabled: true,
    overrides: { price: 190 },
  },
  {
    serviceId: "deshed",
    locationId: "shampooch-al-majaz",
    enabled: false,
    overrides: {},
  },

  // ── The till's own catalogue ────────────────────────────────────────────────
  //
  // The sale flow sells from a different service list than the booking flow, so
  // a package redeemed at the counter is measured against these. Without them
  // every branch resolved to the business defaults and the mismatch the panel
  // exists to show could never occur.
  {
    // Jumeirah charges more for the same blow dry — the price-difference case.
    serviceId: "blow-dry",
    locationId: "shampooch-jumeirah",
    enabled: true,
    overrides: { price: 145 },
  },
  {
    // No massage room at Mirdif: "we don't do that here", which the panel puts
    // ahead of a price difference because it is a different conversation.
    serviceId: "deep-tissue",
    locationId: "shampooch-mirdif",
    enabled: false,
    overrides: {},
  },
]

/** The offering for one service at one branch, or undefined when it inherits. */
export function findOffering(
  serviceId: string,
  locationId: string,
  offerings: ReadonlyArray<LocationOffering> = LOCATION_OFFERINGS,
): LocationOffering | undefined {
  return offerings.find((o) => o.serviceId === serviceId && o.locationId === locationId)
}

/**
 * Whether this branch offers this service at all (DW3.3).
 *
 * Unconfigured means offered: a branch that has never been touched runs the
 * business menu, which is what makes adding branch N cost nothing (R02).
 * Turning a service *off* is a decision and has to be recorded; leaving it
 * alone is not.
 */
export function isOfferedAt(
  serviceId: string,
  locationId: string,
  offerings: ReadonlyArray<LocationOffering> = LOCATION_OFFERINGS,
): boolean {
  return findOffering(serviceId, locationId, offerings)?.enabled ?? true
}

/**
 * The branches that do offer a service, out of the ones given.
 *
 * For the sentence an operator needs when the branch in hand does not do it.
 * The client's own booking page hides a service its branch has turned off —
 * there is nothing a client can do with it — but reception is the person who
 * can say "not here, but Jumeirah does it", and hiding it leaves them to find
 * that out by telephone. Same reading as KC1.5: tell them, do not block them.
 */
export function locationsOffering(
  serviceId: string,
  locationIds: ReadonlyArray<string>,
  offerings: ReadonlyArray<LocationOffering> = LOCATION_OFFERINGS,
): string[] {
  return locationIds.filter((id) => isOfferedAt(serviceId, id, offerings))
}
