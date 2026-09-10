import { describe, expect, it } from "vitest"

import {
  type BranchServiceTerms,
  canCompleteSale,
  checkPackageAtBranch,
  needsRecordedDecision,
  type PackageEntitlement,
} from "@/lib/service-catalog/package-branch-check"

const entitlement: PackageEntitlement = {
  packageId: "pkg-1",
  serviceId: "bath-small",
  soldAtLocationId: "shampooch-jvc",
  soldPriceMinor: 6_000,
  soldDurationMin: 45,
  remainingSessions: 3,
}

const sameTerms: BranchServiceTerms = { offered: true, priceMinor: 6_000, durationMin: 45 }

describe("checkPackageAtBranch", () => {
  it("says nothing when the branch offers the same service on the same terms", () => {
    expect(checkPackageAtBranch(entitlement, sameTerms)).toEqual({ kind: "match" })
  })

  it("reports a price difference with both figures", () => {
    // Reception has to be able to decide in front of the client, and that
    // needs the numbers rather than "may not apply here".
    expect(checkPackageAtBranch(entitlement, { ...sameTerms, priceMinor: 7_500 })).toEqual({
      kind: "priceDiffers",
      soldAtMinor: 6_000,
      hereMinor: 7_500,
    })
  })

  it("treats a different duration as a different service", () => {
    expect(checkPackageAtBranch(entitlement, { ...sameTerms, durationMin: 60 })).toEqual({
      kind: "durationDiffers",
      soldAtMin: 45,
      hereMin: 60,
    })
  })

  it("reports not-offered ahead of a price difference", () => {
    // Different conversation with the client: "we don't do that here" rather
    // than "it costs more here".
    expect(
      checkPackageAtBranch(entitlement, { offered: false, priceMinor: 7_500, durationMin: 60 }),
    ).toEqual({ kind: "notOfferedHere" })
  })
})

describe("the KC1.5 correction: warn, never block", () => {
  it("completes the sale on every mismatch", () => {
    // The earlier design blocked this, and the blueprint still says a package
    // "can only be redeemed there". Corrected 2026-09-03: operators already
    // work around a block by hand, so blocking only makes them do it slowly in
    // front of the client.
    const mismatches = [
      checkPackageAtBranch(entitlement, sameTerms),
      checkPackageAtBranch(entitlement, { ...sameTerms, priceMinor: 7_500 }),
      checkPackageAtBranch(entitlement, { ...sameTerms, durationMin: 60 }),
      checkPackageAtBranch(entitlement, { offered: false, priceMinor: 0, durationMin: 0 }),
    ]
    for (const mismatch of mismatches) {
      expect(canCompleteSale(mismatch)).toBe(true)
    }
  })

  it("asks for a recorded decision only when the terms actually differ", () => {
    expect(needsRecordedDecision({ kind: "match" })).toBe(false)
    expect(needsRecordedDecision({ kind: "notOfferedHere" })).toBe(true)
    expect(
      needsRecordedDecision({ kind: "priceDiffers", soldAtMinor: 6_000, hereMinor: 7_500 }),
    ).toBe(true)
  })
})
