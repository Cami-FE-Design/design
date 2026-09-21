/**
 * Whether a client's package covers a service at this branch (R08, KC1.5).
 *
 * ## The verdicts are the built product's
 *
 * `cami-business` already ships this check —
 * `GET /merchant/customer-packages/eligibility` returns, per service:
 *
 *     verdict: "covered" | "exhausted" | "expired" | "not_covered"
 *     customerPackage: { id, code, sessionsRemaining, sessionsTotal } | null
 *
 * and `POST /merchant/customer-packages/:id/redeem` redeems one session, with
 * `source: "appointment" | "direct"` and `status: "applied" | "reversed"`. The
 * service layer is built; no UI calls it. So the names, the four verdicts and
 * the session counting are taken rather than invented, and what is added here
 * is the one thing the contract has no room for.
 *
 * ## Where the branch belongs, and why it is not a fifth verdict
 *
 * KC1.5: "a clear warning rather than a hard block when a client's package does
 * not match this branch's priced service… checkout still completes, and the
 * staff decision is recorded". **Warn, never block.**
 *
 * That rules out a `not_covered_here` verdict, which is the obvious-looking
 * move: a verdict is what decides whether the package can be applied, so a
 * branch-shaped verdict would block the redemption KC1.5 insists must go
 * through. The mismatch is therefore carried *alongside* a `covered` verdict —
 * the package still covers the service, and the branch difference is extra
 * information for the person standing in front of the client.
 *
 * The blueprint's §07 "can only be redeemed there" is the superseded version;
 * the PRD's correction of 2026-09-03 settled it on warn.
 */

import {
  type BranchServiceTerms,
  checkPackageAtBranch,
  type PackageEntitlement,
  type PackageMismatch,
} from "@/lib/service-catalog/package-branch-check"

/** The as-built's four verdicts, unchanged. */
export type EligibilityVerdict = "covered" | "exhausted" | "expired" | "not_covered"

/** The as-built's package summary, as the eligibility response carries it. */
export type EligibilityPackage = {
  id: string
  code: string
  sessionsRemaining: number | null
  sessionsTotal: number | null
}

export type ServiceEligibility = {
  serviceId: string
  verdict: EligibilityVerdict
  customerPackage: EligibilityPackage | null
  /**
   * Only ever set alongside `covered`, and only when this branch's terms differ
   * from the ones the package was sold on. Never a reason to refuse — see the
   * module note.
   */
  mismatch?: PackageMismatch
}

/**
 * Resolve one service at one branch.
 *
 * The verdict is decided first and on its own terms — exhausted, expired and
 * not covered are facts about the package, and the branch cannot change them.
 * Only a `covered` package gets compared against the branch, because a
 * mismatch on a package that cannot be redeemed anyway is noise.
 */
export function eligibilityFor(
  serviceId: string,
  entitlement: PackageEntitlement | undefined,
  terms: BranchServiceTerms,
  options: { expired?: boolean } = {},
): ServiceEligibility {
  if (!entitlement) return { serviceId, verdict: "not_covered", customerPackage: null }

  const summary: EligibilityPackage = {
    id: entitlement.packageId,
    code: entitlement.packageId.toUpperCase(),
    sessionsRemaining: entitlement.remainingSessions,
    sessionsTotal: null,
  }

  if (options.expired) return { serviceId, verdict: "expired", customerPackage: summary }
  if (entitlement.remainingSessions <= 0) {
    return { serviceId, verdict: "exhausted", customerPackage: summary }
  }

  const mismatch = checkPackageAtBranch(entitlement, terms)
  return {
    serviceId,
    verdict: "covered",
    customerPackage: summary,
    mismatch: mismatch.kind === "match" ? undefined : mismatch,
  }
}

/** True when the package can actually be applied to this line. */
export function canApply(eligibility: ServiceEligibility): boolean {
  // A mismatch is deliberately absent from this condition. KC1.5's whole point
  // is that a branch difference warns and the sale still completes.
  return eligibility.verdict === "covered"
}

/**
 * Why a package cannot be applied, in words a receptionist can repeat to the
 * client. Null when it can.
 */
export function blockedReason(eligibility: ServiceEligibility): string | null {
  switch (eligibility.verdict) {
    case "covered":
      return null
    case "exhausted":
      return "Every session on this package has been used."
    case "expired":
      return "This package has expired."
    case "not_covered":
      return "This client has no package covering this service."
  }
}

/**
 * What redeeming records (R08, INV-01). A redemption belongs to the branch that
 * fulfilled it while the package stays with the business — the stored value is
 * business-wide and the consumption is not.
 */
export type PackageRedemption = {
  packageId: string
  serviceId: string
  /** The branch the session was consumed at. Never the branch it was sold at. */
  fulfilledAtLocationId: string
  /** The as-built's own field: a redemption from a booking or taken directly. */
  source: "appointment" | "direct"
  /**
   * What the operator decided when the terms differed, recorded on the sale
   * (KC1.5). Absent when there was nothing to decide — recording "no mismatch"
   * as a decision would make an ordinary redemption look like an exception.
   */
  decision?: "honoured-sold-price" | "charged-the-difference"
}
