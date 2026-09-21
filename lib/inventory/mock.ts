import type { BranchStock } from "@/lib/inventory/branch-stock"

/**
 * Per-branch balances, seeded so every state that carries a rule is on screen
 * without anyone having to click (R16).
 *
 * Chosen for the states, not for realism in the totals: an owner reviewing this
 * screen needs to see a negative balance, an empty shelf, a low one, and two
 * branches that disagree about the same product. A seed where every branch had
 * a healthy number would prove nothing.
 */
export const BRANCH_STOCK: BranchStock[] = [
  // Shampoo: the ordinary case, and the reason thresholds are per branch — JVC
  // is busier, so it is low at 12 where Jumeirah is fine at 8.
  { productId: "p1", locationId: "shampooch-jvc", quantity: 34, lowStockLevel: 12, reorderQty: 24 },
  {
    productId: "p1",
    locationId: "shampooch-jumeirah",
    quantity: 9,
    lowStockLevel: 8,
    reorderQty: 12,
  },
  {
    productId: "p1",
    locationId: "shampooch-al-quoz",
    quantity: 6,
    lowStockLevel: 4,
    reorderQty: 6,
  },

  // The deshedding tool: low at one branch, empty at another. Same product, two
  // different problems, which is exactly what a business total would hide.
  { productId: "p2", locationId: "shampooch-jvc", quantity: 3, lowStockLevel: 5, reorderQty: 5 },
  {
    productId: "p2",
    locationId: "shampooch-jumeirah",
    quantity: 0,
    lowStockLevel: 2,
    reorderQty: 4,
  },

  /**
   * A negative balance: two were sold before the delivery was booked in. The
   * built product allows this and shows "-2 in stock", so it is here rather
   * than clamped — the fix is a stock take, not a reorder, and the screen has
   * to be able to say which.
   */
  { productId: "p3", locationId: "shampooch-jvc", quantity: -2, lowStockLevel: 6, reorderQty: 12 },
  {
    productId: "p3",
    locationId: "shampooch-jumeirah",
    quantity: 18,
    lowStockLevel: 6,
    reorderQty: 12,
  },

  // The clipper, at one branch, with a threshold nobody has set. Undefined is
  // not zero: it means no opinion, so this branch is never "low" — only empty
  // or negative.
  { productId: "p4", locationId: "shampooch-jvc", quantity: 21 },

  /**
   * The rest of the estate.
   *
   * `stockForProduct()` backfills a branch with no row as quantity 0, which is
   * the right reading of "never received this product" — but with rows for two
   * live branches out of seven, every product read as out of stock at five of
   * them. The attention list was then five false alarms deep on every product,
   * and the states seeded above — the negative, the empty shelf, the low one —
   * were lost in it.
   *
   * Healthy numbers, deliberately: the alarm states are already made at JVC and
   * Jumeirah above, and an alarm is only legible against branches that are
   * fine. Thresholds vary because a busier branch runs out sooner, which is why
   * R16 puts them on the branch rather than the product.
   */
  {
    productId: "p1",
    locationId: "shampooch-downtown-dubai",
    quantity: 27,
    lowStockLevel: 10,
    reorderQty: 24,
  },
  {
    productId: "p1",
    locationId: "shampooch-dubai-marina",
    quantity: 16,
    lowStockLevel: 6,
    reorderQty: 12,
  },
  {
    productId: "p1",
    locationId: "shampooch-mirdif",
    quantity: 11,
    lowStockLevel: 5,
    reorderQty: 12,
  },
  {
    productId: "p1",
    locationId: "shampooch-al-reem",
    quantity: 14,
    lowStockLevel: 6,
    reorderQty: 12,
  },
  {
    productId: "p1",
    locationId: "shampooch-al-majaz",
    quantity: 8,
    lowStockLevel: 4,
    reorderQty: 8,
  },

  {
    productId: "p2",
    locationId: "shampooch-downtown-dubai",
    quantity: 7,
    lowStockLevel: 3,
    reorderQty: 6,
  },
  {
    productId: "p2",
    locationId: "shampooch-dubai-marina",
    quantity: 5,
    lowStockLevel: 2,
    reorderQty: 4,
  },
  { productId: "p2", locationId: "shampooch-mirdif", quantity: 4, lowStockLevel: 2, reorderQty: 4 },
  {
    productId: "p2",
    locationId: "shampooch-al-reem",
    quantity: 6,
    lowStockLevel: 2,
    reorderQty: 4,
  },
  {
    productId: "p2",
    locationId: "shampooch-al-majaz",
    quantity: 3,
    lowStockLevel: 2,
    reorderQty: 4,
  },

  {
    productId: "p3",
    locationId: "shampooch-downtown-dubai",
    quantity: 22,
    lowStockLevel: 6,
    reorderQty: 12,
  },
  {
    productId: "p3",
    locationId: "shampooch-dubai-marina",
    quantity: 13,
    lowStockLevel: 5,
    reorderQty: 10,
  },
  {
    productId: "p3",
    locationId: "shampooch-mirdif",
    quantity: 9,
    lowStockLevel: 4,
    reorderQty: 10,
  },
  {
    productId: "p3",
    locationId: "shampooch-al-reem",
    quantity: 15,
    lowStockLevel: 5,
    reorderQty: 10,
  },
  {
    productId: "p3",
    locationId: "shampooch-al-majaz",
    quantity: 10,
    lowStockLevel: 4,
    reorderQty: 8,
  },

  // The clipper stays scarce — a piece of equipment, not a consumable, so most
  // branches genuinely hold none. This is the one product where a zero row is
  // the truth rather than a gap, which is why it is worth keeping one.
  { productId: "p4", locationId: "shampooch-downtown-dubai", quantity: 4 },
  { productId: "p4", locationId: "shampooch-al-reem", quantity: 2 },
]
