import { describe, expect, it } from "vitest"

import {
  aggregateSessionCoverage,
  allocatePackageSessions,
  buildCoveredServiceMap,
  expiredWithSessionsLeft,
  formatSessionsRemaining,
  getServiceCoverage,
  isPackageUsable,
} from "@/lib/packages/allocate"
import type { CustomerPackageSummary } from "@/lib/packages/customer-packages"

/**
 * The allocation is the built product's, so these assert its behaviour rather
 * than a design of ours — most of all the three things a "does this package
 * cover this service" check gets wrong: finite sessions, a package sold for one
 * variant, and a package that is out of time rather than out of sessions.
 */

const NOW = new Date("2026-09-22T10:00:00Z")

function pkg(over: Partial<CustomerPackageSummary> = {}): CustomerPackageSummary {
  return {
    id: "cp-1",
    packageId: "pkg-groom4",
    code: "BB5-0001",
    name: "Blow dry × 4",
    status: "active",
    sessionType: "limited",
    sessionsRemaining: 2,
    sessionsTotal: 4,
    services: ["blow-dry"],
    colour: "#9b8bd6",
    soldAtLocationId: "shampooch-jvc",
    soldTerms: { "blow-dry": { priceMinor: 12000, durationMin: 45 } },
    ...over,
  }
}

describe("whether a package can pay for anything", () => {
  it("takes a cancelled one out", () => {
    expect(isPackageUsable(pkg({ status: "cancelled" }), NOW)).toBe(false)
  })

  it("takes one with no sessions left out", () => {
    expect(isPackageUsable(pkg({ sessionsRemaining: 0 }), NOW)).toBe(false)
  })

  it("takes an expired one out even with sessions on it", () => {
    expect(isPackageUsable(pkg({ sessionsRemaining: 3, expiresAt: "2026-01-31" }), NOW)).toBe(false)
  })

  it("leaves an unlimited one in, which carries no session count at all", () => {
    const unlimited = pkg({
      sessionType: "unlimited",
      sessionsRemaining: null,
      sessionsTotal: null,
    })
    expect(isPackageUsable(unlimited, NOW)).toBe(true)
  })
})

describe("which catalog ids a package covers", () => {
  it("covers every variant when it names the whole service", () => {
    const map = buildCoveredServiceMap([pkg({ services: ["blow-dry"] })], NOW)
    expect(getServiceCoverage("blow-dry::long", map, { strict: true })).not.toBeNull()
  })

  it("does not comp another variant when it names one", () => {
    const map = buildCoveredServiceMap([pkg({ services: ["blow-dry::short"] })], NOW)
    expect(getServiceCoverage("blow-dry::long", map, { strict: true })).toBeNull()
  })

  it("still hints on the base row, which is what a picker wants", () => {
    const map = buildCoveredServiceMap([pkg({ services: ["blow-dry::short"] })], NOW)
    expect(getServiceCoverage("blow-dry", map)).not.toBeNull()
    // …and never where it decides money.
    expect(getServiceCoverage("blow-dry", map, { strict: true })).toBeNull()
  })
})

describe("spending the sessions", () => {
  it("covers as many lines as there are sessions, and no more", () => {
    const { byUid } = allocatePackageSessions(
      [
        { uid: "a", catalogId: "blow-dry" },
        { uid: "b", catalogId: "blow-dry" },
        { uid: "c", catalogId: "blow-dry" },
      ],
      [pkg({ sessionsRemaining: 2 })],
      NOW,
    )
    expect([...byUid.keys()]).toEqual(["a", "b"])
  })

  it("counts down across the lines rather than repeating one number", () => {
    const { byUid } = allocatePackageSessions(
      [
        { uid: "a", catalogId: "blow-dry" },
        { uid: "b", catalogId: "blow-dry" },
      ],
      [pkg({ sessionsRemaining: 4, sessionsTotal: 4 })],
      NOW,
    )
    expect(byUid.get("a")?.sessionsRemaining).toBe(3)
    expect(byUid.get("b")?.sessionsRemaining).toBe(2)
  })

  it("reaches for a second package once the first is spent", () => {
    const { byUid } = allocatePackageSessions(
      [
        { uid: "a", catalogId: "blow-dry" },
        { uid: "b", catalogId: "blow-dry" },
      ],
      [
        pkg({ id: "cp-1", sessionsRemaining: 1 }),
        pkg({ id: "cp-2", sessionsRemaining: 1, colour: "#4f9e8f" }),
      ],
      NOW,
    )
    expect(byUid.get("a")?.customerPackageId).toBe("cp-1")
    expect(byUid.get("b")?.customerPackageId).toBe("cp-2")
  })

  it("keeps a line on the package that funded it before", () => {
    // Without the hint, removing an unrelated line re-runs the allocation in
    // order and can move this one onto a different package — a different colour
    // and count against a service nobody touched.
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 2 }),
      pkg({ id: "cp-2", sessionsRemaining: 2, colour: "#4f9e8f" }),
    ]
    const { byUid } = allocatePackageSessions(
      [{ uid: "a", catalogId: "blow-dry", preferPackageId: "cp-2" }],
      held,
      NOW,
    )
    expect(byUid.get("a")?.customerPackageId).toBe("cp-2")
  })

  it("falls back to list order when the preferred package cannot fund it", () => {
    // The hint reorders candidates; it never widens them.
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 2 }),
      pkg({ id: "cp-2", sessionsRemaining: 0 }),
    ]
    const { byUid } = allocatePackageSessions(
      [{ uid: "a", catalogId: "blow-dry", preferPackageId: "cp-2" }],
      held,
      NOW,
    )
    expect(byUid.get("a")?.customerPackageId).toBe("cp-1")
  })

  it("never runs an unlimited package out", () => {
    const { byUid } = allocatePackageSessions(
      Array.from({ length: 5 }, (_, i) => ({ uid: `l${i}`, catalogId: "deep-tissue" })),
      [
        pkg({
          services: ["deep-tissue"],
          sessionType: "unlimited",
          sessionsRemaining: null,
          sessionsTotal: null,
        }),
      ],
      NOW,
    )
    expect(byUid.size).toBe(5)
    expect(byUid.get("l4")?.sessionsRemaining).toBeNull()
  })

  it("funds nothing from an expired package, whatever its sessions say", () => {
    const { byUid } = allocatePackageSessions(
      [{ uid: "a", catalogId: "blow-dry" }],
      [pkg({ sessionsRemaining: 3, expiresAt: "2026-01-31" })],
      NOW,
    )
    expect(byUid.size).toBe(0)
  })

  it("offers the picker what is left rather than what it started with", () => {
    const { availableCoveredMap } = allocatePackageSessions(
      [{ uid: "a", catalogId: "blow-dry" }],
      [pkg({ sessionsRemaining: 2, sessionsTotal: 4 })],
      NOW,
    )
    expect(availableCoveredMap.get("blow-dry")?.sessionsRemaining).toBe(1)
  })

  it("drops a package out of the picker once the cart has spent it", () => {
    const { availableCoveredMap } = allocatePackageSessions(
      [{ uid: "a", catalogId: "blow-dry" }],
      [pkg({ sessionsRemaining: 1 })],
      NOW,
    )
    expect(availableCoveredMap.has("blow-dry")).toBe(false)
  })
})

describe("how the chip reads", () => {
  it("counts a limited package", () => {
    expect(formatSessionsRemaining({ sessionsRemaining: 3, sessionsTotal: 4 })).toBe(
      "3/4 Sessions Remaining",
    )
  })

  it("says Unlimited rather than a count", () => {
    expect(formatSessionsRemaining({ sessionsRemaining: null, sessionsTotal: null })).toBe(
      "Unlimited",
    )
  })
})

/**
 * The chip reads the client's whole balance, not the package that funded the
 * line — the built product's rule, and the one that stops a client with two
 * packages reading a count off the one they were not asking about.
 */
describe("what the chip reads", () => {
  it("sums every package the client holds", () => {
    const funding = { customerPackageId: "cp-1", sessionsRemaining: 2 }
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 3, sessionsTotal: 4 }),
      pkg({ id: "cp-2", sessionsRemaining: 5, sessionsTotal: 6 }),
    ]
    // 2 left on the funding one after this line, plus the other's 5, out of 10.
    expect(aggregateSessionCoverage(funding, held)).toEqual({
      sessionsRemaining: 7,
      sessionsTotal: 10,
    })
  })

  it("reads Unlimited when any package the client holds is uncapped", () => {
    const funding = { customerPackageId: "cp-1", sessionsRemaining: 0 }
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 1, sessionsTotal: 4 }),
      pkg({
        id: "cp-2",
        sessionType: "unlimited",
        sessionsRemaining: null,
        sessionsTotal: null,
      }),
    ]
    // A finite count beside an uncapped package would be a number that means
    // nothing — "as many as you like" is the client's real answer.
    expect(aggregateSessionCoverage(funding, held)).toEqual({
      sessionsRemaining: null,
      sessionsTotal: null,
    })
  })

  it("keeps an exhausted package in the total, so the denominator cannot shrink", () => {
    const funding = { customerPackageId: "cp-1", sessionsRemaining: 1 }
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 2, sessionsTotal: 4 }),
      pkg({ id: "cp-2", status: "expired", sessionsRemaining: 0, sessionsTotal: 6 }),
    ]
    expect(aggregateSessionCoverage(funding, held)?.sessionsTotal).toBe(10)
  })

  it("leaves a cancelled one out — it was never theirs to spend", () => {
    const funding = { customerPackageId: "cp-1", sessionsRemaining: 1 }
    const held = [
      pkg({ id: "cp-1", sessionsRemaining: 2, sessionsTotal: 4 }),
      pkg({ id: "cp-2", status: "cancelled", sessionsRemaining: 3, sessionsTotal: 6 }),
    ]
    expect(aggregateSessionCoverage(funding, held)?.sessionsTotal).toBe(4)
  })

  it("says nothing for a line no session covered", () => {
    expect(aggregateSessionCoverage(null, [pkg()])).toBeNull()
  })
})

/**
 * A package that ran out of TIME with sessions still on it — the one case the
 * cart would otherwise pass over in silence.
 */
describe("expired, with sessions still on it", () => {
  const CART = ["blow-dry"]

  it("names one that is out of time but not out of sessions", () => {
    const held = [pkg({ sessionsRemaining: 2, expiresAt: "2026-01-31" })]
    expect(expiredWithSessionsLeft(held, CART, NOW)).toHaveLength(1)
  })

  it("says nothing when the cart holds nothing it would have covered", () => {
    // The point of the notice is the moment the client is charged in full for
    // the thing the package used to cover. On anything else it is noise, and an
    // operator learns to dismiss a notice they never needed.
    const held = [pkg({ sessionsRemaining: 2, expiresAt: "2026-01-31" })]
    expect(expiredWithSessionsLeft(held, ["shampoo-retail"], NOW)).toHaveLength(0)
  })

  it("says nothing on an empty cart", () => {
    const held = [pkg({ sessionsRemaining: 2, expiresAt: "2026-01-31" })]
    expect(expiredWithSessionsLeft(held, [], NOW)).toHaveLength(0)
  })

  it("says nothing about one that simply ran out", () => {
    // It did its job. There is nothing to tell anyone and nothing reception
    // could do about it.
    const held = [pkg({ sessionsRemaining: 0 })]
    expect(expiredWithSessionsLeft(held, CART, NOW)).toHaveLength(0)
  })

  it("says nothing about one still in date", () => {
    const held = [pkg({ sessionsRemaining: 2, expiresAt: "2027-01-31" })]
    expect(expiredWithSessionsLeft(held, CART, NOW)).toHaveLength(0)
  })

  it("leaves a cancelled one out — it was never theirs to spend", () => {
    const held = [pkg({ status: "cancelled", sessionsRemaining: 2, expiresAt: "2026-01-31" })]
    expect(expiredWithSessionsLeft(held, CART, NOW)).toHaveLength(0)
  })
})
