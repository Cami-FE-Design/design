/**
 * Which clients hold a package, and on what terms (KC1.5, SCR-13).
 *
 * ## Why this had to exist before the panel could be hosted
 *
 * The redemption panel, the eligibility verdicts and the branch check were all
 * built and unit-tested, and the only way to open any of them was the
 * playground — which built an entitlement inline for the demo. Nothing said
 * which *client* held a package, so checkout had nothing to look up and the
 * rule could not reach the one screen it exists for: a receptionist with the
 * client in front of them.
 *
 * ## The terms travel with the package, not with the branch
 *
 * A package is sold against one specific priced service at one branch, and what
 * it was sold on is frozen onto it — `soldPriceMinor` and `soldDurationMin` are
 * the terms that day, not a pointer to today's price list. That is the whole
 * reason a mismatch is possible: the branch in front of you may since have
 * moved its price, or may not run the service at all.
 *
 * Gift cards and memberships are deliberately not here. They travel across the
 * estate; a package does not, and that difference is the one KC1.5 turns on.
 */

import type { PackageEntitlement } from "@/lib/service-catalog/package-branch-check"

/**
 * Seeded per client, and deliberately uneven.
 *
 * Three cases, because one is not a test: a package bought at the branch you
 * are standing in (nothing to warn about), one bought elsewhere at a different
 * price (warn, never block), and one bought for a service the branch in front
 * of you does not run at all — the strongest form of the rule, where the client
 * is still honoured.
 *
 * Keyed on clients *and* services the till can actually reach. The first seed
 * named clients from the client record's fixtures and services from the booking
 * catalogue — neither of which the cart's own pickers have ever heard of, so
 * the panel was correct, tested, and impossible to open.
 */
const CLIENT_PACKAGES: Record<string, PackageEntitlement> = {
  // Bought at JVC, on JVC's terms. Redeeming at JVC is the quiet case.
  "aaishah-vaza": {
    packageId: "pkg-groom4",
    serviceId: "blow-dry",
    soldAtLocationId: "shampooch-jvc",
    soldPriceMinor: 12000,
    soldDurationMin: 45,
    remainingSessions: 3,
  },
  // Bought at JVC and redeemed anywhere else: Jumeirah charges more for the
  // same blow dry, so the figures differ and reception decides in front of the
  // client.
  "abbey-mcdermaid": {
    packageId: "pkg-groom4",
    serviceId: "blow-dry",
    soldAtLocationId: "shampooch-jvc",
    soldPriceMinor: 12000,
    soldDurationMin: 45,
    remainingSessions: 1,
  },
  // Deep tissue is turned off at Mirdif entirely, so this is "we don't do that
  // here" rather than "it costs more here" — a different conversation, and the
  // one the panel orders ahead of a price difference.
  "abbie-connelly": {
    packageId: "pkg-daycare",
    serviceId: "deep-tissue",
    soldAtLocationId: "shampooch-jvc",
    soldPriceMinor: 32000,
    soldDurationMin: 90,
    remainingSessions: 2,
  },
}

/** The package this client holds, or nothing. */
export function packageFor(clientId: string | undefined): PackageEntitlement | undefined {
  if (!clientId) return undefined
  return CLIENT_PACKAGES[clientId]
}

/** Whether anybody's package could apply to this service. */
export function packageCovers(
  entitlement: PackageEntitlement | undefined,
  serviceId: string,
): boolean {
  return entitlement?.serviceId === serviceId
}
