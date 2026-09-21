/**
 * Redeeming a package at a branch that prices its service differently
 * (R08, KC1.5, SCR-13).
 *
 * ## Warn, never block
 *
 * This rule was corrected on 2026-09-03, from Maaz's live walkthrough of Chaps
 * & Co's real Fresha account, and the earlier version had it backwards. Gift
 * cards and memberships travel freely across branches. **Packages do not**: a
 * package is sold against one specific priced service, and if that service is
 * priced or configured differently at another branch it is technically a
 * different service.
 *
 * The tempting design is to block the redemption. Businesses running this
 * today already work around it by hand — a 100% discount, or a gift-card
 * credit — so blocking does not prevent the outcome, it just makes reception
 * do it the slow way in front of the client. The product law Maaz and Faisal
 * converged on is therefore: **warn, never block.** Checkout must never refuse
 * the sale; staff decide case by case, the same way they already do for an
 * expired voucher.
 *
 * The blueprint still says a package "can only be redeemed there" (§07). That
 * is the superseded version.
 *
 * ## The decision is recorded, which is the other half
 *
 * A warning nobody can audit is a warning that costs the business money
 * quietly. Staff already discount to zero and comp friends (EC-4), so the
 * point of recording is not suspicion — it is that an owner reading a branch's
 * numbers can see why a package redeemed below its value, rather than finding
 * an unexplained hole at month end.
 */

export type PackageMismatch =
  /** Same service, same price, same duration. Nothing to say. */
  | { kind: "match" }
  /** Priced differently here. The commonest case, and the one KC1.5 is about. */
  | { kind: "priceDiffers"; soldAtMinor: number; hereMinor: number }
  /** Configured differently — a different duration is a different service. */
  | { kind: "durationDiffers"; soldAtMin: number; hereMin: number }
  /** The branch does not offer the service at all (DW3.3). */
  | { kind: "notOfferedHere" }

export type PackageEntitlement = {
  packageId: string
  serviceId: string
  /** The branch the package was sold at, and the terms it was sold on. */
  soldAtLocationId: string
  soldPriceMinor: number
  soldDurationMin: number
  remainingSessions: number
}

export type BranchServiceTerms = {
  offered: boolean
  priceMinor: number
  durationMin: number
}

/**
 * Compare what the package was sold on against what this branch offers.
 *
 * Order matters: not offered at all is reported ahead of a price difference,
 * because it is a different conversation with the client — "we don't do that
 * here" rather than "it costs more here".
 */
export function checkPackageAtBranch(
  entitlement: PackageEntitlement,
  here: BranchServiceTerms,
): PackageMismatch {
  if (!here.offered) return { kind: "notOfferedHere" }
  if (here.priceMinor !== entitlement.soldPriceMinor) {
    return {
      kind: "priceDiffers",
      soldAtMinor: entitlement.soldPriceMinor,
      hereMinor: here.priceMinor,
    }
  }
  if (here.durationMin !== entitlement.soldDurationMin) {
    return {
      kind: "durationDiffers",
      soldAtMin: entitlement.soldDurationMin,
      hereMin: here.durationMin,
    }
  }
  return { kind: "match" }
}

/**
 * Always true, and deliberately a function rather than an omission.
 *
 * Somebody reading this module needs to see that completion is not conditional
 * on the mismatch — the whole correction was that checkout does not refuse. A
 * missing check is ambiguous; this is a statement.
 */
export function canCompleteSale(_mismatch: PackageMismatch): true {
  return true
}

/** True when the sale needs the staff decision written down (KC1.5). */
export function needsRecordedDecision(mismatch: PackageMismatch): boolean {
  return mismatch.kind !== "match"
}
