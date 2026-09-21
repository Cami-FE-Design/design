import { describe, expect, it } from "vitest"

import type {
  BranchServiceTerms,
  PackageEntitlement,
} from "@/lib/service-catalog/package-branch-check"
import { blockedReason, canApply, eligibilityFor } from "@/lib/service-catalog/package-eligibility"

const entitlement: PackageEntitlement = {
  packageId: "pkg-1",
  serviceId: "bath-small",
  soldAtLocationId: "shampooch-jvc",
  soldPriceMinor: 6000,
  soldDurationMin: 45,
  remainingSessions: 3,
}

const sameTerms: BranchServiceTerms = { offered: true, priceMinor: 6000, durationMin: 45 }
const dearerHere: BranchServiceTerms = { offered: true, priceMinor: 7500, durationMin: 45 }
const notOffered: BranchServiceTerms = { offered: false, priceMinor: 0, durationMin: 0 }

describe("eligibilityFor", () => {
  it("is not_covered when the client holds nothing for it", () => {
    const result = eligibilityFor("bath-small", undefined, sameTerms)
    expect(result.verdict).toBe("not_covered")
    expect(result.customerPackage).toBeNull()
  })

  it("is exhausted at zero sessions, and still names the package", () => {
    const result = eligibilityFor("bath-small", { ...entitlement, remainingSessions: 0 }, sameTerms)
    expect(result.verdict).toBe("exhausted")
    // Named, because "you have no package" and "this one is used up" are
    // different sentences to say to a client.
    expect(result.customerPackage?.id).toBe("pkg-1")
  })

  it("is expired ahead of any branch comparison", () => {
    const result = eligibilityFor("bath-small", entitlement, dearerHere, { expired: true })
    expect(result.verdict).toBe("expired")
    // A mismatch on a package that cannot be redeemed anyway is noise.
    expect(result.mismatch).toBeUndefined()
  })

  it("carries a mismatch alongside covered, never instead of it (KC1.5)", () => {
    const result = eligibilityFor("bath-small", entitlement, dearerHere)
    expect(result.verdict).toBe("covered")
    expect(result.mismatch?.kind).toBe("priceDiffers")
    // The whole point: warn, never block.
    expect(canApply(result)).toBe(true)
    expect(blockedReason(result)).toBeNull()
  })

  it("still allows a redemption where the branch does not offer the service", () => {
    // The strongest form of the same rule. "We don't do that here" is a
    // conversation, not a refusal to honour what the client already paid for.
    const result = eligibilityFor("bath-small", entitlement, notOffered)
    expect(result.verdict).toBe("covered")
    expect(result.mismatch?.kind).toBe("notOfferedHere")
    expect(canApply(result)).toBe(true)
  })

  it("says nothing when the terms match", () => {
    const result = eligibilityFor("bath-small", entitlement, sameTerms)
    expect(result.verdict).toBe("covered")
    expect(result.mismatch).toBeUndefined()
  })
})

describe("blockedReason", () => {
  it("gives a receptionist a sentence for every unusable verdict", () => {
    for (const options of [
      { entitlement: undefined, terms: sameTerms, opts: {} },
      { entitlement: { ...entitlement, remainingSessions: 0 }, terms: sameTerms, opts: {} },
      { entitlement, terms: sameTerms, opts: { expired: true } },
    ]) {
      const result = eligibilityFor("bath-small", options.entitlement, options.terms, options.opts)
      expect(canApply(result)).toBe(false)
      expect(blockedReason(result)).toBeTruthy()
    }
  })
})
