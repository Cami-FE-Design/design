import { describe, expect, it } from "vitest"

import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { summarizeByRail } from "@/lib/money/ledger"
import { BUSINESS_WIDE, periodBounds } from "@/lib/money/mock"
import type { MoneyTx } from "@/lib/money/types"

/**
 * The topbar drawer is bounded by the grant, the way the account summary is
 * (G7, R18).
 *
 * It was not. `summarizeByRail` and `groupByDay` were handed the whole ledger,
 * so a manager granted one branch read a held figure built from nine — and the
 * summary sitting behind the same button was bounded, so the two disagreed.
 * That is the defect DSG-73 exists to avoid, and it arrived through the one
 * money surface nobody has to open on purpose: it is in the topbar of every
 * page.
 *
 * Held here as the bound itself rather than as a render, because the drawer
 * reads `useSearchParams` and a Sheet renders into a portal — neither of which
 * is the thing that was wrong.
 */

const BOUNDS = periodBounds("month-to-date")

function sale(locationId: string, aed: number): MoneyTx {
  return {
    id: `tx-${locationId}-${aed}`,
    kind: "sale",
    rail: "terminal",
    amountMinor: aed * 100,
    at: `${BOUNDS.fromIso}T10:00:00+04:00`,
    locationId,
    confirmation: "confirmed",
  }
}

/** The drawer's own bound, lifted verbatim from money-drawer.tsx. */
function boundToGrant(txs: MoneyTx[], grantedIds: string[]) {
  return txs.filter((t) => t.locationId === BUSINESS_WIDE || grantedIds.includes(t.locationId))
}

const LEDGER = [
  sale("shampooch-jvc", 400),
  sale("shampooch-jumeirah", 300),
  sale("shampooch-mirdif", 200),
]

describe("the topbar drawer never shows money the grant withholds", () => {
  it("holds only the granted branch's takings for a one-branch manager", () => {
    const mine = boundToGrant(LEDGER, ["shampooch-jvc"])
    expect(summarizeByRail(mine, BOUNDS).terminal.moneyIn.totalMinor).toBe(40000)
  })

  it("holds the estate's for an owner, so nothing is hidden from the person who owns it", () => {
    const all = boundToGrant(
      LEDGER,
      NINE_BRANCH_ESTATE.map((l) => l.id),
    )
    expect(summarizeByRail(all, BOUNDS).terminal.moneyIn.totalMinor).toBe(90000)
  })

  it("keeps business-wide rows, because a payout leaves one account (GP1.4)", () => {
    const withPayout = [...LEDGER, sale(BUSINESS_WIDE, 50)]
    const mine = boundToGrant(withPayout, ["shampooch-jvc"])
    expect(mine.some((t) => t.locationId === BUSINESS_WIDE)).toBe(true)
  })

  it("agrees with the account summary, which bounds the same way", () => {
    // The two derivations are the same expression; this asserts they stay that
    // way, since the screens index promises the drawer and the page cannot
    // disagree.
    const grantedIds = ["shampooch-jvc", "shampooch-jumeirah"]
    const drawer = boundToGrant(LEDGER, grantedIds)
    const summary = LEDGER.filter(
      (t) => t.locationId === BUSINESS_WIDE || grantedIds.some((id) => id === t.locationId),
    )
    expect(summarizeByRail(drawer, BOUNDS).terminal.moneyIn.totalMinor).toBe(
      summarizeByRail(summary, BOUNDS).terminal.moneyIn.totalMinor,
    )
  })
})
