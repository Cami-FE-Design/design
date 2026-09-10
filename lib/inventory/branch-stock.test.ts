import { describe, expect, it } from "vitest"

import {
  type BranchStock,
  businessQuantity,
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
