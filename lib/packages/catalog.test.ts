import { describe, expect, it } from "vitest"

import { type Package, priceLabel, sessionsLabel } from "@/lib/packages/catalog"
import { PACKAGES, packageById } from "@/lib/packages/mock"

function pkg(over: Partial<Package> = {}): Package {
  return {
    id: "p",
    name: "P",
    description: null,
    services: ["bath-small"],
    sessionType: "limited",
    sessionCount: 6,
    payment: "one-time",
    validFor: "12m",
    price: 45000,
    frequency: null,
    recurringPrice: null,
    length: null,
    taxRate: null,
    colour: "#6aa3e0",
    onlineSales: true,
    onlineRedemption: true,
    terms: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...over,
  }
}

describe("how a package reads", () => {
  it("counts its sessions", () => {
    expect(sessionsLabel(pkg({ sessionCount: 6 }))).toBe("6 sessions")
    expect(sessionsLabel(pkg({ sessionCount: 1 }))).toBe("1 session")
  })

  it("says Unlimited rather than a count when there is no cap", () => {
    expect(sessionsLabel(pkg({ sessionType: "unlimited", sessionCount: null }))).toBe("Unlimited")
  })

  it("prints a one-time price as one figure", () => {
    expect(priceLabel(pkg())).toEqual({ amountMinor: 45000, suffix: "" })
  })

  it("prints a recurring one the way it is charged, not as a single price", () => {
    const club = pkg({
      payment: "recurring",
      price: null,
      recurringPrice: 18000,
      frequency: "monthly",
    })
    expect(priceLabel(club)).toEqual({ amountMinor: 18000, suffix: "/ monthly" })
  })
})

describe("the seeded catalog", () => {
  it("carries a recurring package, which the old model could not express", () => {
    const club = packageById("grooming-club")
    expect(club?.payment).toBe("recurring")
    expect(club?.price).toBeNull()
  })

  it("carries an unlimited one", () => {
    expect(packageById("spa-day-unlimited")?.sessionType).toBe("unlimited")
  })

  it("covers more than one service somewhere, so coverage is a set", () => {
    expect(PACKAGES.some((p) => p.services.length > 1)).toBe(true)
  })

  it("names the branch every sale was made at, so the list can be bounded", () => {
    const rows = PACKAGES.flatMap((p) => p.sales ?? [])
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.soldAtLocationId.length > 0)).toBe(true)
  })
})
