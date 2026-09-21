import { describe, expect, it } from "vitest"

import { MOCK_BOOKINGS, MOCK_STAFF } from "@/app/appointments/mock"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { BRANCH_STOCK } from "@/lib/inventory/mock"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LOCATION_TAX_OVERRIDES } from "@/lib/locations/tax-identity"
import { BRANCH_WHATSAPP } from "@/lib/locations/whatsapp"
import { summarizeByLocation } from "@/lib/money/by-location"
import { MONEY_TXS, periodBounds } from "@/lib/money/mock"
import { DEMO_TERMINALS } from "@/lib/terminals/store"

/**
 * Every seeded surface reaches every trading branch.
 *
 * ## Why this is one test and not nine
 *
 * The same defect kept arriving in different fixtures, and it is invisible from
 * the inside: nothing throws, no figure is wrong, every total sums. The only
 * evidence is a branch that never appears — and absence is what no assertion
 * was ever looking at. It was found each time by someone opening a screen and
 * asking why five branches were empty, which is not a way to find defects.
 *
 * Instances, all of them shipped and all of them silent:
 *
 * - `locationFor()` was indexed by the per-day row counter, which never passed
 *   6, so the back half of its weighting was unreachable and five of seven
 *   branches could not receive a transaction in any period.
 * - `BRANCH_STOCK` held rows for two live branches, so `stockForProduct()`
 *   backfilled zero at the other five and every product read as out of stock
 *   there — five false alarms on every product.
 * - `LOCATION_TAX_OVERRIDES` gave two branches a receipt prefix, so seven
 *   traded under one shared "SHP" — the exact thing a per-branch prefix exists
 *   to prevent (R23).
 * - Al Reem had no staff, and a booking resolves its branch through whoever
 *   performs it, so that branch could not take a booking at all.
 * - `DEMO_TERMINALS` covered two branches, so seven grouped rows were empty
 *   and "no card machine here" was indistinguishable from "this demo did not
 *   bother".
 *
 * ## The rule
 *
 * A **live** branch appears everywhere. A **suspended** one is allowed to be
 * absent from anything forward-looking — it takes no sales, holds no new stock,
 * gets no new bookings — but keeps whatever history it has. Adding branch ten
 * to `NINE_BRANCH_ESTATE` will fail this file until it is seeded, which is the
 * point: the estate is the contract, and a fixture that quietly covers two of
 * it is a screen that lies.
 */

const LIVE = NINE_BRANCH_ESTATE.filter((l) => l.status === "live").map((l) => l.id)

/** Live branches this fixture never mentions. */
function missing(seen: Iterable<string>): string[] {
  const set = new Set(seen)
  return LIVE.filter((id) => !set.has(id))
}

describe("every live branch is in every fixture", () => {
  it("takes money", () => {
    const byLocation = summarizeByLocation(
      MONEY_TXS,
      periodBounds("month-to-date"),
      NINE_BRANCH_ESTATE.map((l) => l.id),
    )
    expect(missing(byLocation.rows.map((r) => r.locationId))).toEqual([])
  })

  it("rings up sales", () => {
    expect(missing(MOCK_SALES.map((s) => s.locationId))).toEqual([])
  })

  it("has a team, so it can take a booking at all", () => {
    expect(missing(MOCK_STAFF.flatMap((s) => s.locationIds ?? []))).toEqual([])
  })

  it("has bookings on the calendar", () => {
    expect(missing(MOCK_BOOKINGS.map((b) => b.locationId))).toEqual([])
  })

  it("holds stock, so a product is not falsely out everywhere", () => {
    expect(missing(BRANCH_STOCK.map((r) => r.locationId))).toEqual([])
  })

  it("has a card machine", () => {
    expect(missing(DEMO_TERMINALS.map((t) => t.locationId))).toEqual([])
  })

  it("has a WhatsApp number of its own (R21)", () => {
    expect(missing(BRANCH_WHATSAPP.map((b) => b.locationId))).toEqual([])
  })

  it("issues receipts under a prefix nobody else uses (R23)", () => {
    const prefixes = Object.values(LOCATION_TAX_OVERRIDES)
      .map((o) => o.receiptPrefix)
      .filter((p): p is string => Boolean(p))
    expect(missing(Object.keys(LOCATION_TAX_OVERRIDES))).toEqual([])
    expect(new Set(prefixes).size).toBe(prefixes.length)
  })
})
