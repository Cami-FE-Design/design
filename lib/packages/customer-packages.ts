/**
 * What a client holds, in the shape the built product holds it.
 *
 * ## Taken from `cami-business`, not designed here
 *
 * `CustomerPackageSummary` in the dev repo is a **ledger row**: the client's
 * own copy of a catalog package, with its remaining sessions, its status, its
 * expiry, and the set of catalog entries it covers. A client holds a list of
 * them. That last part is the piece this repo had wrong — it modelled one
 * package per client, covering one service, which cannot express the case the
 * built product spends most of its code on: two packages, one of them nearly
 * spent, competing for the same line.
 *
 * Catalog ids follow the built product's format, because the coverage lookup
 * depends on it:
 *
 *     "serviceId"             — covers the base service and all its variants
 *     "serviceId::variantId"  — covers only that variant
 *
 * ## The one field that is ours
 *
 * `soldTerms` — what this package was sold against, per service, at the branch
 * that sold it. The built product has no room for it because it has no branches
 * (R08, KC1.5). It is the input to `checkPackageAtBranch`, and it changes
 * nothing about how a session is spent: the branch rule warns, it never blocks.
 */

/** The terms one service was sold on, at the branch that sold the package. */
export type SoldTerms = {
  priceMinor: number
  durationMin: number
}

export type CustomerPackageSummary = {
  /** The ledger row — the client's copy. This is what a redemption debits. */
  id: string
  /** The catalog package it was bought from. Drives the colour. */
  packageId: string
  /**
   * The code printed on the client's copy, e.g. "BB5-0417".
   *
   * What the built product names a package by when it talks to an operator
   * about one — two clients holding "Blow dry × 4" are told apart by this, and
   * it is what a client reads off their own receipt.
   */
  code: string
  name: string
  status: "active" | "expired" | "cancelled"
  /** `unlimited` has no session cap, and reads as "Unlimited" rather than a count. */
  sessionType: "limited" | "unlimited"
  /** `null` for an unlimited package. */
  sessionsRemaining: number | null
  sessionsTotal: number | null
  /** ISO date. A package past it cannot fund anything, whatever its sessions say. */
  expiresAt?: string | null
  /** Catalog ids this package covers — `serviceId` or `serviceId::variantId`. */
  services: string[]
  /** Hex, with the hash. The chip is drawn in it. */
  colour: string
  /** Ours (R08): the branch that sold it, and what it was sold against there. */
  soldAtLocationId: string
  soldTerms: Record<string, SoldTerms>
}

/**
 * The seeded ledger, keyed by client.
 *
 * Every case below exists to make one rule visible on screen, and the branch
 * cases are the ones this initiative added:
 *
 * - **Aaishah** — one package, three sessions, bought and redeemed at JVC. The
 *   quiet case, and the one that has to look unremarkable.
 * - **Abbey** — one session left, bought at JVC. Redeem at Jumeirah and the
 *   price it was sold against is not the price here, which is KC1.5's own
 *   example. Add two covered lines and the second one falls back to full price:
 *   sessions are finite and the allocation says so.
 * - **Abbie** — two packages at once, which is what the allocation exists for.
 *   The daycare one is unlimited; the grooming one has a single session. The
 *   line that gets the session and the line that does not both read correctly.
 * - **Abrar** — an expired package. It funds nothing, and the reason is its date
 *   rather than its sessions, so "you have none left" would be the wrong
 *   sentence. On a client the till's own picker carries, or the case cannot be
 *   reached from the screen it is about.
 */
export const CLIENT_PACKAGES: Record<string, CustomerPackageSummary[]> = {
  "aaishah-vaza": [
    {
      id: "cp-aaishah-1",
      packageId: "pkg-groom4",
      code: "BB5-0417",
      name: "Blow dry × 4",
      status: "active",
      sessionType: "limited",
      sessionsRemaining: 3,
      sessionsTotal: 4,
      services: ["blow-dry"],
      colour: "#9b8bd6",
      soldAtLocationId: "shampooch-jvc",
      soldTerms: { "blow-dry": { priceMinor: 12000, durationMin: 45 } },
    },
  ],
  "abbey-mcdermaid": [
    {
      id: "cp-abbey-1",
      packageId: "pkg-groom4",
      code: "BB5-0418",
      name: "Blow dry × 4",
      status: "active",
      sessionType: "limited",
      sessionsRemaining: 1,
      sessionsTotal: 4,
      services: ["blow-dry"],
      colour: "#9b8bd6",
      soldAtLocationId: "shampooch-jvc",
      soldTerms: { "blow-dry": { priceMinor: 12000, durationMin: 45 } },
    },
  ],
  "abbie-connelly": [
    {
      id: "cp-abbie-1",
      packageId: "pkg-daycare",
      code: "SPA-0007",
      name: "Daycare, unlimited",
      status: "active",
      sessionType: "unlimited",
      sessionsRemaining: null,
      sessionsTotal: null,
      services: ["deep-tissue"],
      colour: "#4f9e8f",
      soldAtLocationId: "shampooch-jvc",
      soldTerms: { "deep-tissue": { priceMinor: 32000, durationMin: 90 } },
    },
    {
      id: "cp-abbie-2",
      packageId: "pkg-groom4",
      code: "BB5-0431",
      name: "Blow dry × 4",
      status: "active",
      sessionType: "limited",
      sessionsRemaining: 1,
      sessionsTotal: 4,
      services: ["blow-dry"],
      colour: "#9b8bd6",
      soldAtLocationId: "shampooch-jvc",
      soldTerms: { "blow-dry": { priceMinor: 12000, durationMin: 45 } },
    },
  ],
  // A client who is actually on the till's own list — the entitlement was on
  // one the POS picker has never heard of, so the case could not be reached.
  "abrar-mohammed": [
    {
      id: "cp-abrar-1",
      packageId: "pkg-groom4",
      code: "BB5-0402",
      name: "Blow dry × 4",
      status: "active",
      sessionType: "limited",
      sessionsRemaining: 2,
      sessionsTotal: 4,
      // Ran out of time, not of sessions. `isPackageUsable` reads the date.
      expiresAt: "2026-01-31",
      services: ["blow-dry"],
      colour: "#9b8bd6",
      soldAtLocationId: "shampooch-jvc",
      soldTerms: { "blow-dry": { priceMinor: 12000, durationMin: 45 } },
    },
  ],
}

/** Every package this client holds, spent or not. Empty for a walk-in. */
export function packagesFor(clientId: string | undefined): CustomerPackageSummary[] {
  if (!clientId) return []
  return CLIENT_PACKAGES[clientId] ?? []
}
