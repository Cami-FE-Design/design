/**
 * Where a promotion runs (DW3.4, R04, R24).
 *
 * ## The story
 *
 * "As an owner, I want to run a promotion across my whole chain or scope it to
 * one branch, so that a business-wide campaign and a local offer can coexist."
 * A quiet branch discounting to fill a Tuesday, and a chain-wide January offer,
 * are both real and must not be the same object.
 *
 * ## Why this is a type and not a checkbox
 *
 * The dev repo is building the promotions UI on `promotion-discount-ui`, and
 * its `PromotionAvailability` already carries the axis — `allVenues` plus
 * `venues`. Its mapper then does this:
 *
 *     locationIds: promotion.availability.allVenues ? [] : promotion.availability.venues
 *
 * So there, **empty means all**. Everywhere in this product empty means
 * **none** — R24 is explicit: "an empty scope never resolves to all Locations",
 * and the whole of SU2.2 is a member with no branches seeing nothing. Two
 * opposite readings of one shape, in one product, is how a promotion meant for
 * one branch ends up running at nine — and how a chain-wide one silently runs
 * nowhere.
 *
 * Multi-location had not started when that mapper was written, which is exactly
 * why it reads that way. So this states the rule as a type that cannot express
 * the ambiguity: "everywhere" is a named case, and a list is always the list.
 */

import type { Location } from "@/lib/locations/types"

export type PromotionScope =
  /**
   * The whole chain, including branches opened after the promotion was made —
   * which is a different promise from "the nine that exist today", and the one
   * an owner means by a January offer.
   */
  | { kind: "estate" }
  /** Exactly these, and never an empty list — see `isRunnable`. */
  | { kind: "branches"; locationIds: ReadonlyArray<string> }

/**
 * Whether this promotion can run at all.
 *
 * A branch-scoped promotion with an empty list is not "everywhere", it is a
 * promotion nobody can use — a saveable, silent mistake. It is named here so a
 * form can refuse it rather than storing something that reads as chain-wide to
 * the next person who opens it.
 */
export function isRunnable(scope: PromotionScope): boolean {
  return scope.kind === "estate" || scope.locationIds.length > 0
}

/** Does this promotion apply at this branch? */
export function runsAt(scope: PromotionScope, locationId: string): boolean {
  if (scope.kind === "estate") return true
  return scope.locationIds.includes(locationId)
}

/**
 * The branches it actually reaches, bounded by what the reader holds (R18).
 *
 * A manager granted one branch asking "what is running here" must not be told
 * about the other eight a chain-wide offer also covers.
 */
export function reaches(
  scope: PromotionScope,
  granted: ReadonlyArray<Location>,
): ReadonlyArray<Location> {
  if (scope.kind === "estate") return granted
  return granted.filter((l) => scope.locationIds.includes(l.id))
}

/**
 * One line for a list row.
 *
 * "All locations" and "9 locations" are different claims, and only the first
 * survives a tenth branch opening — the same distinction the branch switcher
 * and the team grants both make, said the same way so an owner learns it once.
 */
export function describeScope(scope: PromotionScope, locationName: (id: string) => string): string {
  if (scope.kind === "estate") return "All locations"
  if (scope.locationIds.length === 0) return "No locations — this cannot run"
  if (scope.locationIds.length === 1) return locationName(scope.locationIds[0]!)
  if (scope.locationIds.length === 2) {
    return scope.locationIds.map(locationName).join(" and ")
  }
  return `${scope.locationIds.length} locations`
}

/**
 * Read a scope out of the dev repo's shape, without inheriting its ambiguity.
 *
 * Kept here rather than at the call site because the conversion is the whole
 * point: `allVenues` decides, and the list is only consulted when it does not.
 * An empty list with `allVenues: false` comes back as branches-with-nothing,
 * which `isRunnable` then refuses — rather than quietly becoming the estate.
 */
export function fromAvailability(availability: {
  allVenues: boolean
  venues: ReadonlyArray<string>
}): PromotionScope {
  if (availability.allVenues) return { kind: "estate" }
  return { kind: "branches", locationIds: availability.venues }
}
