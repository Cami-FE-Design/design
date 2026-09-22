/**
 * Stock, per branch, with the business quantity derived (R16, E09, DW4.1, DW4.2).
 *
 * ## The requirement, exactly
 *
 * R16: "Stock quantity, reorder configuration, movements, depletion, and
 * adjustments resolve per Location while the Business quantity is **derived**
 * from its Locations and **never stored independently**."
 *
 * That last clause is the whole design. A stored business total is a second
 * number that can disagree with the branches, and DW4.2 is written about
 * exactly that: "the business-wide stock total always equals the sum of every
 * branch, so that I never reconcile it by hand". So there is no field for it
 * here — `businessQuantity()` is a function over the branch balances, and there
 * is no path by which it can be set.
 *
 * ## Shape taken from the built product, not invented
 *
 * `cami-business`'s `Product` already ships `trackStock`, `currentStock`,
 * `lowStockLevel`, `reorderQty` and `lowStockNotif`, and the Products list
 * renders "Unlimited" and "-2 in stock" today. What is missing there is the
 * location dimension, not the concept — so these are the same field names with
 * a `locationId`, rather than a parallel model.
 *
 * Two behaviours copied deliberately from the as-built rather than tidied:
 *
 * - **`trackStock: false` means Unlimited**, not zero. A shampoo bottle counted
 *   and a service consumable that is never counted are different things, and
 *   showing the second as "0 in stock" reads as an outage.
 * - **A balance can go negative.** The shipped list shows `-2 in stock`, which
 *   is what happens when a sale is rung up before a delivery is received. It is
 *   surfaced as a problem, not clamped away — clamping loses the fact that two
 *   were sold that nobody has booked in.
 *
 * ## Out of scope, and said so in the PRD
 *
 * Cross-branch transfer and a central warehouse. Per-branch stock is the v0
 * model, confirmed at the 2026-09-02 workshop: "we can just assign essentially
 * in each location the stock". Both are future backlog, so nothing here offers
 * to move stock between branches.
 */

/** One branch's balance and its own reorder configuration (R16). */
export type BranchStock = {
  productId: string
  locationId: string
  /** On hand at this branch. Negative is a real state — see the module note. */
  quantity: number
  /**
   * At or below this, the branch is low. Per branch on purpose: R16 puts
   * reorder configuration on the Location, and a busy branch and a quiet one
   * do not reorder at the same threshold. Undefined means nobody has set one.
   */
  lowStockLevel?: number
  /** How many to order when it runs low. Per branch for the same reason. */
  reorderQty?: number
}

/** What the stock surfaces need from a product, without importing the table's type. */
export type StockedProduct = {
  id: string
  name: string
  /** False is Unlimited — the product is not counted at all. */
  trackStock: boolean
}

export type BranchStockLevel = "ok" | "low" | "out" | "negative"

/**
 * Which of the four states a balance is in.
 *
 * `out` and `negative` are separate. Zero means the shelf is empty; below zero
 * means the count itself is wrong, and the fix is a stock take rather than a
 * reorder. Collapsing them would send a manager to the wrong action.
 */
export function stockLevel(stock: BranchStock): BranchStockLevel {
  if (stock.quantity < 0) return "negative"
  if (stock.quantity === 0) return "out"
  if (stock.lowStockLevel !== undefined && stock.quantity <= stock.lowStockLevel) return "low"
  return "ok"
}

/** Every branch's row for one product, in the order the branches were given. */
export function stockForProduct(
  all: ReadonlyArray<BranchStock>,
  productId: string,
  locationIds: ReadonlyArray<string>,
): BranchStock[] {
  return locationIds.map(
    (locationId) =>
      all.find((row) => row.productId === productId && row.locationId === locationId) ?? {
        productId,
        locationId,
        // No row is not an error: a branch that has never received this product
        // has none of it. Zero, not undefined, so it sums and sorts.
        quantity: 0,
      },
  )
}

/**
 * The business quantity (R16, DW4.2).
 *
 * Derived, always, and bounded by the branches passed in — which is how R18's
 * grant works on this surface too: a manager granted one branch gets that
 * branch's number, correctly labelled as theirs, not a business total they are
 * not entitled to.
 */
export function businessQuantity(
  all: ReadonlyArray<BranchStock>,
  productId: string,
  locationIds: ReadonlyArray<string>,
): number {
  return stockForProduct(all, productId, locationIds).reduce((sum, row) => sum + row.quantity, 0)
}

/** Branches that need attention for this product, worst first. */
export function needsAttention(rows: ReadonlyArray<BranchStock>): BranchStock[] {
  const rank: Record<BranchStockLevel, number> = { negative: 0, out: 1, low: 2, ok: 3 }
  return rows
    .filter((row) => stockLevel(row) !== "ok")
    .sort((a, b) => rank[stockLevel(a)] - rank[stockLevel(b)])
}

/**
 * The quantity cell, as the built product words it.
 *
 * "Unlimited" rather than "Unlimited stock" in a table cell, and the full
 * phrase where there is room — matching `ProductDetailDialog` in cami-business
 * rather than inventing a third wording.
 */
export function formatQuantity(product: StockedProduct, quantity: number): string {
  if (!product.trackStock) return "Unlimited"
  return `${quantity} in stock`
}

/**
 * The sentence above the rows, for the states actually on screen.
 *
 * Two passes of this got it wrong in the same way, so the rule is written down
 * here: **each of the three states has its own action, and the copy may only
 * name an action for a state that is present.**
 *
 * - Below zero is a wrong count. A stock take fixes it; ordering does not.
 * - Out is an empty shelf. Restocking fixes it, and telling the manager to
 *   order "before it runs out" is a week late.
 * - Low is a shelf heading that way, and the only one of the three that has a
 *   reorder point by definition — `stockLevel` cannot return "low" without
 *   one. An out branch usually has none ("Not set"), so a sentence that puts
 *   every attention row "at or below their reorder point" describes a
 *   threshold that does not exist.
 *
 * Hence: one state on screen gets that state's sentence; two or three get a
 * counted breakdown, which cannot silently generalise one state's action to
 * another. Null when nothing needs attention, so the caller renders no notice
 * rather than an empty one.
 */
export function attentionNotice(rows: ReadonlyArray<BranchStock>): string | null {
  const attention = needsAttention(rows)
  if (attention.length === 0) return null

  const tally: Record<Exclude<BranchStockLevel, "ok">, number> = {
    negative: attention.filter((row) => stockLevel(row) === "negative").length,
    out: attention.filter((row) => stockLevel(row) === "out").length,
    low: attention.filter((row) => stockLevel(row) === "low").length,
  }
  const heading =
    attention.length === 1
      ? "1 location needs attention"
      : `${attention.length} locations need attention`

  const present = (["negative", "out", "low"] as const).filter((level) => tally[level] > 0)

  // One state: say it in full, with its action.
  if (present.length === 1) {
    const only = present[0]
    const many = attention.length > 1
    if (only === "negative") {
      return `${heading}. A location below zero has sold more than it received, which a stock take fixes rather than a reorder.`
    }
    if (only === "out") {
      return many
        ? `${heading}. They have run out, so nothing can be sold there until they are restocked.`
        : `${heading}. It has run out, so nothing can be sold there until it is restocked.`
    }
    return many
      ? `${heading}. They are at or below their reorder point, so it is worth ordering before they run out.`
      : `${heading}. It is at or below its reorder point, so it is worth ordering before it runs out.`
  }

  // More than one: a counted breakdown, so no state borrows another's action.
  const clauses = present.map((level) => {
    const n = tally[level]
    if (level === "negative") {
      return `${n} below zero, which a stock take fixes rather than a reorder`
    }
    if (level === "out") return `${n} out of stock`
    return n === 1 ? `${n} at or below its reorder point` : `${n} at or below their reorder point`
  })
  const list =
    clauses.length === 2
      ? `${clauses[0]} and ${clauses[1]}`
      : `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`
  return `${heading}: ${list}.`
}

/**
 * Whether ordering is one of the fixes on screen.
 *
 * A branch below zero is not short of stock — its count is wrong — so offering
 * a purchase order there contradicts the notice sitting above it.
 */
export function canReorder(rows: ReadonlyArray<BranchStock>): boolean {
  return needsAttention(rows).some((row) => {
    const level = stockLevel(row)
    return level === "out" || level === "low"
  })
}

/**
 * How many rows the list shows before the operator asks for the rest.
 *
 * Folding the healthy branches was enough while most branches were healthy. It
 * stops being enough at the shape that prompted this: nine branches, eight of
 * them out of stock, so nothing folded and the card became a scroll of eight
 * identical rows. Twenty branches would make it twenty.
 *
 * So there are two bounds, not one. Healthy rows fold because they are not the
 * job, and the rows that *are* the job are capped too — past five, an eighth
 * "Out of stock, 0" tells the manager nothing the notice above has not already
 * counted, and the branch worth reading first is pushed under the fold by
 * branches that say the same thing. Worst first, so what survives the cap is
 * the wrong count before the empty shelf before the low one.
 */
const COLLAPSE_FROM = 4
const MAX_COLLAPSED = 5

export function collapseStock(rows: ReadonlyArray<BranchStock>): {
  shown: BranchStock[]
  /** How many of `rows` the collapsed view leaves out. Zero means it shows all. */
  hidden: number
} {
  const attention = needsAttention(rows)
  // Under four branches there is nothing worth hiding: folding three rows
  // behind a click is a worse screen than three rows.
  const worthFolding =
    rows.length >= COLLAPSE_FROM &&
    (attention.length < rows.length || attention.length > MAX_COLLAPSED)
  if (!worthFolding) return { shown: [...rows], hidden: 0 }
  const shown = attention.slice(0, MAX_COLLAPSED)
  return { shown, hidden: rows.length - shown.length }
}
