import { describe, expect, it } from "vitest"

import { dealDiscountMinor, dealsAtTill } from "@/lib/deals/eligible"
import {
  DEFAULT_DEAL_APPLICABILITY,
  DEFAULT_DEAL_LIMITS,
  type Deal,
  type DealApplicability,
  formatDealSummaryShort,
} from "@/lib/deals/mock"

/**
 * Which deals the till may offer (DW3.4, R11, R18).
 *
 * `/catalogs/deals` settles where an offer applies, and on its own that is a
 * label — the rule exists only once the place that spends money obeys it.
 *
 * The behaviour here is the opposite of the package rule, on purpose. A
 * client's package bought elsewhere warns and still completes (KC1.5): they
 * paid for it and reception can judge. A deal scoped to another branch is not
 * the client's property and there is nothing to judge, so it never appears.
 */

const TODAY = "2026-04-15"

const deal = (over: Partial<Deal>): Deal => ({
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
  endDate: "2026-04-30",
  scope: { kind: "estate" },
  applicability: DEFAULT_DEAL_APPLICABILITY,
  limits: DEFAULT_DEAL_LIMITS,
  teamMemberIds: [],
  redemptions: 0,
  totalSalesMinor: 0,
  totalClients: 0,
  createdAt: "2026-04-01T00:00:00Z",
  ...over,
})

/** Services only — the shape most of these fixtures want. */
const servicesOnly: DealApplicability = {
  services: { mode: "all", ids: [] },
  products: { mode: "none", ids: [] },
  packages: { mode: "none", ids: [] },
  giftCardsInStore: false,
}

describe("a deal has to run at the branch taking the money", () => {
  const mirdifOnly = deal({
    id: "mirdif",
    scope: { kind: "branches", locationIds: ["shampooch-mirdif"] },
  })

  it("is offered at the branch it was scoped to", () => {
    expect(dealsAtTill([mirdifOnly], "shampooch-mirdif", TODAY).map((d) => d.id)).toEqual([
      "mirdif",
    ])
  })

  it("never appears anywhere else — no warning, no override", () => {
    // Mirdif Tuesdays is Mirdif's decision about Mirdif's diary. Offering it at
    // JVC hands away margin nobody agreed to.
    expect(dealsAtTill([mirdifOnly], "shampooch-jvc", TODAY)).toEqual([])
  })

  it("offers a chain-wide deal at every branch, including one opened later", () => {
    const chain = deal({ id: "chain" })
    expect(dealsAtTill([chain], "shampooch-branch-ten", TODAY).map((d) => d.id)).toEqual(["chain"])
  })

  it("offers nothing at all until the sale has named a branch (R11)", () => {
    // A cart with no branch cannot be told which deals apply, and guessing is
    // the failure R11 exists to delete.
    expect(dealsAtTill([deal({})], null, TODAY)).toEqual([])
  })
})

describe("only a deal that is actually running", () => {
  it("skips one that has not started", () => {
    expect(dealsAtTill([deal({ startDate: "2026-05-01", endDate: null })], "x", TODAY)).toEqual([])
  })

  it("skips one whose end has passed, without anyone editing it", () => {
    expect(
      dealsAtTill([deal({ startDate: "2026-03-01", endDate: "2026-03-31" })], "x", TODAY),
    ).toEqual([])
  })

  it("skips one somebody switched off mid-run", () => {
    expect(dealsAtTill([deal({ status: "inactive" })], "x", TODAY)).toEqual([])
  })

  it("skips an archived one", () => {
    expect(dealsAtTill([deal({ status: "archived" })], "x", TODAY)).toEqual([])
  })

  it("skips one scoped to no branch, which cannot be spent anywhere", () => {
    expect(
      dealsAtTill([deal({ scope: { kind: "branches", locationIds: [] } })], "x", TODAY),
    ).toEqual([])
  })
})

describe("what it takes off", () => {
  // Read off `discountKind` / `discountValue`, not parsed out of a sentence.
  // The field was free text — "15 off" meant AED 15 to one reader and 15% to
  // another, and the regex behind it took nothing off for either.
  it("applies a percentage", () => {
    expect(dealDiscountMinor(deal({ discountKind: "percentage", discountValue: 20 }), 50000)).toBe(
      10000,
    )
  })

  it("applies a flat amount in whole AED", () => {
    expect(dealDiscountMinor(deal({ discountKind: "fixed", discountValue: 30 }), 50000)).toBe(3000)
  })

  it("never takes off more than the line holds", () => {
    // AED 900 off a AED 500 line is AED 500 off, not a line that pays back.
    expect(dealDiscountMinor(deal({ discountKind: "fixed", discountValue: 900 }), 50000)).toBe(
      50000,
    )
  })

  it("caps a percentage at 100, whatever was stored", () => {
    expect(dealDiscountMinor(deal({ discountKind: "percentage", discountValue: 150 }), 50000)).toBe(
      50000,
    )
  })
})

describe("a deal only discounts what it says it does", () => {
  const groomingOnly = deal({ id: "grooming", applicability: servicesOnly })

  it("is offered on a service line", () => {
    expect(dealsAtTill([groomingOnly], "x", TODAY, "service").map((d) => d.id)).toEqual([
      "grooming",
    ])
  })

  it("is not offered on a bottle of conditioner", () => {
    // The screen showed exactly this: "Summer groom offer · 20% off grooming"
    // in the discounts select on a product line.
    expect(dealsAtTill([groomingOnly], "x", TODAY, "product")).toEqual([])
  })

  it("is not offered on a gift card unless the deal says so", () => {
    // Discounting stored value sells AED 100 of credit for AED 80 — a loss
    // booked as a promotion. A good default, and still the merchant's call:
    // the built product keeps `giftCardsInStore` as its own flag.
    expect(dealsAtTill([groomingOnly], "x", TODAY, "gift-card")).toEqual([])
  })

  it("is offered on a gift card when the merchant has allowed it", () => {
    const allowed = deal({ id: "allowed", applicability: DEFAULT_DEAL_APPLICABILITY })
    expect(dealsAtTill([allowed], "x", TODAY, "gift-card").map((d) => d.id)).toEqual(["allowed"])
  })

  it("is offered on nothing at all when the till is switched off for it", () => {
    // Some campaigns are redeemed online, or applied by hand. The list here is
    // the point of sale, and `enableAtPointOfSale` is the built product's
    // switch for exactly that.
    expect(dealsAtTill([deal({ enableAtPointOfSale: false })], "x", TODAY)).toEqual([])
  })

  it("answers 'what runs here at all' when no line kind is asked about", () => {
    expect(dealsAtTill([groomingOnly], "x", TODAY).map((d) => d.id)).toEqual(["grooming"])
  })
})

describe("what a row says an offer comes off", () => {
  // The long form states all four categories including the negatives, which is
  // right on a detail surface and wrong in a table: seventy unbroken characters
  // of mostly "no" is what pushed the list into a horizontal scrollbar.
  const shaped = (over: Partial<Deal["applicability"]>) =>
    deal({
      discountKind: "percentage",
      discountValue: 20,
      applicability: { ...servicesOnly, ...over },
    })

  it("names only what it does come off", () => {
    expect(formatDealSummaryShort(shaped({}))).toBe("20% off services")
  })

  it("lists several", () => {
    expect(formatDealSummaryShort(shaped({ products: { mode: "all", ids: [] } }))).toBe(
      "20% off services, products",
    )
  })

  it("says everything rather than naming all four", () => {
    expect(formatDealSummaryShort(deal({ applicability: DEFAULT_DEAL_APPLICABILITY }))).toBe(
      "20% off everything",
    )
  })

  it("says so when a saved deal comes off nothing", () => {
    // Refused at the wizard now, so this is a row saved before that rule.
    expect(
      formatDealSummaryShort(
        shaped({ services: { mode: "none", ids: [] }, giftCardsInStore: false }),
      ),
    ).toBe("20% off nothing")
  })
})
