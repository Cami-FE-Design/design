import { describe, expect, it } from "vitest"

import {
  attentionNotice,
  type BranchStock,
  businessQuantity,
  canReorder,
  collapseStock,
  formatQuantity,
  needsAttention,
  type StockedProduct,
  stockForProduct,
  stockLevel,
} from "@/lib/inventory/branch-stock"
import { BRANCH_STOCK } from "@/lib/inventory/mock"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"
const AL_QUOZ = "shampooch-al-quoz"
const ALL = [JVC, JUMEIRAH, AL_QUOZ]

const counted: StockedProduct = { id: "p1", name: "Wahl Professional Shampoo", trackStock: true }
const uncounted: StockedProduct = { id: "p9", name: "Service consumable", trackStock: false }

describe("stockLevel", () => {
  const at = (quantity: number, lowStockLevel?: number): BranchStock => ({
    productId: "p1",
    locationId: JVC,
    quantity,
    lowStockLevel,
  })

  it("separates an empty shelf from a wrong count", () => {
    // Zero is a reorder; below zero is a stock take. Collapsing them into one
    // red state sends a manager to the wrong action.
    expect(stockLevel(at(0, 5))).toBe("out")
    expect(stockLevel(at(-2, 5))).toBe("negative")
  })

  it("is low at the threshold, not just below it", () => {
    expect(stockLevel(at(5, 5))).toBe("low")
    expect(stockLevel(at(6, 5))).toBe("ok")
  })

  it("is never low when nobody has set a threshold", () => {
    // Undefined is no opinion, not zero — so this branch can only be empty or
    // negative, never "running low" against a number nobody chose.
    expect(stockLevel(at(1))).toBe("ok")
    expect(stockLevel(at(0))).toBe("out")
  })
})

describe("stockForProduct", () => {
  it("gives a branch with no row a zero rather than dropping it", () => {
    // A branch that never received this product has none of it. Dropping the
    // row would make the estate look smaller than it is.
    const rows = stockForProduct(BRANCH_STOCK, "p4", ALL)
    expect(rows).toHaveLength(3)
    expect(rows.filter((row) => row.quantity === 0)).toHaveLength(2)
  })

  it("returns the rows in the order the branches were given", () => {
    const rows = stockForProduct(BRANCH_STOCK, "p1", [AL_QUOZ, JVC])
    expect(rows.map((row) => row.locationId)).toEqual([AL_QUOZ, JVC])
  })
})

describe("businessQuantity", () => {
  it("is the sum of its branches, and exists nowhere else (R16, DW4.2)", () => {
    const rows = stockForProduct(BRANCH_STOCK, "p1", ALL)
    const bySum = rows.reduce((total, row) => total + row.quantity, 0)
    expect(businessQuantity(BRANCH_STOCK, "p1", ALL)).toBe(bySum)
  })

  it("is bounded by the branches passed in, which is how the grant binds it (R18)", () => {
    const owner = businessQuantity(BRANCH_STOCK, "p1", ALL)
    const manager = businessQuantity(BRANCH_STOCK, "p1", [JUMEIRAH])
    expect(manager).toBeLessThan(owner)
    // A manager's number is their branch's, not a share of the business's.
    expect(manager).toBe(9)
  })

  it("lets a negative branch reduce the total rather than being clamped away", () => {
    // The seeded case: 18 at one branch, -2 at another. The total is 16, and
    // that is the point — a clamp would report 18 and lose the discrepancy.
    expect(businessQuantity(BRANCH_STOCK, "p3", ALL)).toBe(16)
  })

  it("is zero for a product no branch holds, not an error", () => {
    expect(businessQuantity(BRANCH_STOCK, "does-not-exist", ALL)).toBe(0)
  })
})

describe("needsAttention", () => {
  it("puts a wrong count above an empty shelf above a low one", () => {
    const rows: BranchStock[] = [
      { productId: "p1", locationId: "a", quantity: 3, lowStockLevel: 5 },
      { productId: "p1", locationId: "b", quantity: -1 },
      { productId: "p1", locationId: "c", quantity: 0 },
      { productId: "p1", locationId: "d", quantity: 40, lowStockLevel: 5 },
    ]
    expect(needsAttention(rows).map((row) => row.locationId)).toEqual(["b", "c", "a"])
  })

  it("says nothing when every branch is fine", () => {
    expect(needsAttention([{ productId: "p1", locationId: "a", quantity: 40 }])).toEqual([])
  })

  it("finds the one bad branch the business total hides", () => {
    // 18 and -2 sum to a healthy-looking 16, which is exactly why the total is
    // not allowed to be the only thing on screen.
    const rows = stockForProduct(BRANCH_STOCK, "p3", ALL)
    expect(businessQuantity(BRANCH_STOCK, "p3", ALL)).toBeGreaterThan(0)
    expect(needsAttention(rows).length).toBeGreaterThan(0)
  })
})

describe("formatQuantity", () => {
  it("says Unlimited rather than a number for a product nobody counts", () => {
    // "0 in stock" on an uncounted consumable reads as an outage.
    expect(formatQuantity(uncounted, 0)).toBe("Unlimited")
  })

  it("uses the wording the built product uses", () => {
    expect(formatQuantity(counted, 34)).toBe("34 in stock")
    expect(formatQuantity(counted, -2)).toBe("-2 in stock")
  })
})

describe("attentionNotice", () => {
  const row = (locationId: string, quantity: number, lowStockLevel?: number): BranchStock => ({
    productId: "p1",
    locationId,
    quantity,
    lowStockLevel,
  })

  it("says nothing when every branch is fine", () => {
    expect(attentionNotice([row("a", 40, 5)])).toBeNull()
  })

  it("does not send a manager to a stock take over a branch that is merely low", () => {
    const notice = attentionNotice([row("a", 3, 5)])
    expect(notice).toContain("1 location needs attention.")
    expect(notice).toContain("reorder point")
    expect(notice).not.toContain("below zero")
  })

  it("names the stock take when a branch is below zero", () => {
    const notice = attentionNotice([row("a", -2)])
    expect(notice).toContain("below zero")
    expect(notice).toContain("stock take")
  })

  it("does not tell a manager to order before a shelf runs out that already has", () => {
    // Six empty branches and one low, which is the screen that caught this:
    // the copy claimed every one of them sat at a reorder point — six have
    // none — and offered to order "before they run out".
    const rows = [
      ...["a", "b", "c", "d", "e", "f"].map((id) => row(id, 0)),
      row("g", 7, 8),
      row("h", 20, 5),
      row("i", 20, 5),
    ]
    const notice = attentionNotice(rows)
    expect(notice).toContain("7 locations need attention")
    expect(notice).toContain("6 out of stock")
    expect(notice).toContain("1 at or below its reorder point")
    expect(notice).not.toContain("before they run out")
  })

  it("never puts an out-of-stock branch at a reorder point it does not have", () => {
    // `stockLevel` cannot return "low" without a threshold, so "at or below
    // their reorder point" is only ever allowed to cover the low ones.
    const notice = attentionNotice([row("a", 0), row("b", 0)])
    expect(notice).toContain("They have run out")
    expect(notice).not.toContain("reorder point")
  })

  it("counts each state separately when all three are on screen", () => {
    const notice = attentionNotice([row("a", -2), row("b", 0), row("c", 3, 5)])
    expect(notice).toBe(
      "3 locations need attention: 1 below zero, which a stock take fixes rather than a reorder, 1 out of stock, and 1 at or below its reorder point.",
    )
  })

  it("reads as one sentence for a single empty branch", () => {
    expect(attentionNotice([row("a", 0)])).toBe(
      "1 location needs attention. It has run out, so nothing can be sold there until it is restocked.",
    )
  })
})

describe("canReorder", () => {
  it("offers ordering for an empty or low branch", () => {
    expect(canReorder([{ productId: "p1", locationId: "a", quantity: 0 }])).toBe(true)
    expect(canReorder([{ productId: "p1", locationId: "a", quantity: 2, lowStockLevel: 5 }])).toBe(
      true,
    )
  })

  it("does not offer ordering as the fix for a count that is wrong", () => {
    expect(canReorder([{ productId: "p1", locationId: "a", quantity: -2 }])).toBe(false)
  })

  it("offers nothing when no branch needs anything", () => {
    expect(canReorder([{ productId: "p1", locationId: "a", quantity: 40 }])).toBe(false)
  })
})

describe("collapseStock", () => {
  const row = (locationId: string, quantity: number, lowStockLevel?: number): BranchStock => ({
    productId: "p1",
    locationId,
    quantity,
    lowStockLevel,
  })

  it("hides nothing at three branches, because three rows beat three behind a click", () => {
    const rows = [row("a", 0), row("b", 0), row("c", 40)]
    expect(collapseStock(rows).shown).toHaveLength(3)
    expect(collapseStock(rows).hidden).toBe(0)
  })

  it("folds the healthy branches away", () => {
    const rows = [row("a", 0), ...["b", "c", "d", "e"].map((id) => row(id, 40))]
    const { shown, hidden } = collapseStock(rows)
    expect(shown.map((r) => r.locationId)).toEqual(["a"])
    expect(hidden).toBe(4)
  })

  it("caps the list when every branch needs attention", () => {
    // Twenty branches, all of them out: folding the healthy ones hides nothing,
    // so without a cap this is a twenty-row scroll.
    const rows = Array.from({ length: 20 }, (_, i) => row(`loc-${i}`, 0))
    const { shown, hidden } = collapseStock(rows)
    expect(shown).toHaveLength(5)
    expect(hidden).toBe(15)
  })

  it("keeps the worst branches when it caps, not the first ones listed", () => {
    // The wrong count is last in location order and must still survive.
    const rows = [
      ...Array.from({ length: 8 }, (_, i) => row(`out-${i}`, 0)),
      row("low", 3, 5),
      row("negative", -2),
    ]
    const shown = collapseStock(rows).shown.map((r) => r.locationId)
    expect(shown[0]).toBe("negative")
    expect(shown).not.toContain("low")
    expect(shown).toHaveLength(5)
  })

  it("shows every row when nothing needs attention at a small chain", () => {
    const rows = [row("a", 40), row("b", 40), row("c", 40)]
    expect(collapseStock(rows).hidden).toBe(0)
  })
})
