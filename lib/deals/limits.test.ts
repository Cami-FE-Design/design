import { describe, expect, it } from "vitest"

import { describeLimits, limitBlock } from "@/lib/deals/limits"
import {
  DEFAULT_DEAL_APPLICABILITY,
  DEFAULT_DEAL_LIMITS,
  type Deal,
  type DealLimits,
} from "@/lib/deals/mock"

/**
 * Limits, enforced rather than collected (DW3.4).
 *
 * The wizard has asked for these since the built product's first cut, and the
 * detail view prints them. Nothing checked them: the one screen that spends
 * money offered every running deal whatever its ceiling said, so a minimum
 * spend was a field that lied to whoever filled it in.
 *
 * Note which way these say no. A deal scoped to another branch is **removed**,
 * because it is that branch's decision and there is nothing to judge. A limit
 * **stays and explains**, because the offer is this client's to ask for and
 * "spend AED 40 more" is something the person at the counter can act on.
 */

const deal = (limits: Partial<DealLimits>): Deal => ({
  id: "d",
  type: "promotion",
  name: "Deal",
  description: "",
  discountKind: "percentage",
  discountValue: 20,
  discountCode: "",
  enableAtPointOfSale: true,
  status: "active",
  startDate: "2026-04-01",
  endDate: null,
  scope: { kind: "estate" },
  applicability: DEFAULT_DEAL_APPLICABILITY,
  limits: { ...DEFAULT_DEAL_LIMITS, ...limits },
  teamMemberIds: [],
  redemptions: 0,
  totalSalesMinor: 0,
  totalClients: 0,
  createdAt: "2026-04-01T00:00:00Z",
})

const cart = (over: Partial<Parameters<typeof limitBlock>[1]> = {}) => ({
  cartTotalMinor: 50000,
  clientRedemptions: 0,
  totalRedemptions: 0,
  ...over,
})

describe("a deal with no limits is never blocked", () => {
  it("passes a plain cart", () => {
    expect(limitBlock(deal({}), cart())).toBeNull()
  })
})

describe("minimum purchase", () => {
  const minimum = deal({ minimumPurchaseEnabled: true, minimumPurchaseAmount: 600 })

  it("blocks a cart under the threshold", () => {
    expect(limitBlock(minimum, cart({ cartTotalMinor: 50000 }))?.reason).toBe(
      "Spend AED 600 to use this",
    )
  })

  it("says how much further, not just the threshold", () => {
    // "Minimum AED 600" makes an operator do the subtraction in front of the
    // client. This is the number they would have worked out.
    expect(limitBlock(minimum, cart({ cartTotalMinor: 50000 }))?.detail).toBe(
      "AED 100.00 more to go",
    )
  })

  it("lets a cart exactly on the threshold through", () => {
    expect(limitBlock(minimum, cart({ cartTotalMinor: 60000 }))).toBeNull()
  })
})

describe("total uses", () => {
  const capped = deal({ totalUsesEnabled: true, totalUses: 100 })

  it("blocks once the cap is reached", () => {
    expect(limitBlock(capped, cart({ totalRedemptions: 100 }))?.reason).toBe("Fully redeemed")
  })

  it("allows the last one", () => {
    expect(limitBlock(capped, cart({ totalRedemptions: 99 }))).toBeNull()
  })

  it("counts across every location the deal runs at", () => {
    // A chain-wide cap is a chain-wide cap. Counting per branch would let a
    // 100-use offer go 900 times across nine branches.
    expect(limitBlock(capped, cart({ totalRedemptions: 140 }))?.detail).toBe(
      "All 100 uses have gone",
    )
  })
})

describe("one use per client", () => {
  const once = deal({ oneUsePerClient: true })

  it("blocks a client who has had it", () => {
    expect(limitBlock(once, cart({ clientRedemptions: 1 }))?.reason).toBe(
      "This client has already used it",
    )
  })

  it("allows a client who has not", () => {
    expect(limitBlock(once, cart({ clientRedemptions: 0 }))).toBeNull()
  })

  it("lets a walk-in through, because there is no history to check", () => {
    // `null` is not zero. Nobody can say whether an unnamed client has had this
    // before, and refusing every walk-in on a maybe is worse than the leak.
    expect(limitBlock(once, cart({ clientRedemptions: null }))).toBeNull()
  })
})

describe("when several limits bite, the cheapest to fix is named", () => {
  it("names the spend before the client's history", () => {
    // One of these the client can do something about in the next thirty
    // seconds. Being told the other first is no help.
    const both = deal({
      minimumPurchaseEnabled: true,
      minimumPurchaseAmount: 600,
      oneUsePerClient: true,
    })
    expect(limitBlock(both, cart({ cartTotalMinor: 50000, clientRedemptions: 1 }))?.reason).toBe(
      "Spend AED 600 to use this",
    )
  })
})

describe("writing the limits out", () => {
  it("says nothing when nothing was limited", () => {
    expect(describeLimits(deal({}))).toEqual([])
  })

  it("lists each one that was set", () => {
    expect(
      describeLimits(
        deal({
          oneUsePerClient: true,
          totalUsesEnabled: true,
          totalUses: 500,
          minimumPurchaseEnabled: true,
          minimumPurchaseAmount: 150,
        }),
      ),
    ).toEqual(["One use per client", "500 total uses", "min. AED 150"])
  })
})
