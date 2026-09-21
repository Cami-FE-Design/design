import { describe, expect, it } from "vitest"

import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { summarizeByLocation } from "@/lib/money/by-location"
import { summarize } from "@/lib/money/ledger"
import { BUSINESS_WIDE, MONEY_TXS, periodBounds } from "@/lib/money/mock"

/**
 * Every trading branch is actually in the ledger.
 *
 * `locationFor()` weights the estate across an 18-entry table, and it was fed
 * the per-day row index — which a day of 3–7 rows never pushes past 6. The
 * table's back half was therefore unreachable: five of the seven trading
 * branches, and both other businesses, could not receive a single transaction
 * in any period. Money by branch showed four rows and five permanently quiet
 * ones, which reads as a slow month rather than as missing data, and Purr
 * Palace's own money surfaces were empty for the same reason.
 *
 * Nothing caught it because every figure was correct: the totals summed, the
 * grant bound held, the quiet-branch list worked exactly as designed. The only
 * evidence was branches that never appeared, and absence is what no assertion
 * was looking at — so it is what this one looks at.
 */

const BOUNDS = periodBounds("month-to-date")

describe("the seeded ledger reaches every branch", () => {
  const live = NINE_BRANCH_ESTATE.filter((l) => l.status === "live")

  it("gives every live branch takings in the current period", () => {
    const byLocation = summarizeByLocation(
      MONEY_TXS,
      BOUNDS,
      NINE_BRANCH_ESTATE.map((l) => l.id),
    )
    const trading = new Set(byLocation.rows.map((r) => r.locationId))
    expect([...live].filter((l) => !trading.has(l.id)).map((l) => l.id)).toEqual([])
  })

  it("leaves the suspended branches quiet, because a suspended branch takes nothing", () => {
    const byLocation = summarizeByLocation(
      MONEY_TXS,
      BOUNDS,
      NINE_BRANCH_ESTATE.map((l) => l.id),
    )
    const suspended = NINE_BRANCH_ESTATE.filter((l) => l.status !== "live").map((l) => l.id)
    expect([...byLocation.quietLocations].sort()).toEqual([...suspended].sort())
  })

  it("holds one business's money, because a payout is one business's", () => {
    // A payout is business-wide (GP1.4) and so survives the grant bound, while
    // the takings behind it do not. Another business's rows in this ledger
    // therefore made Shampooch subtract payouts carrying money it never took,
    // and report a negative balance held.
    for (const id of ["purr-palace", "sota"]) {
      expect(MONEY_TXS.some((t) => t.locationId === id)).toBe(false)
    }
  })

  it("never reports a negative balance held", () => {
    const shampooch = MONEY_TXS.filter(
      (t) => t.locationId === BUSINESS_WIDE || live.some((l) => l.id === t.locationId),
    )
    expect(summarize(shampooch, BOUNDS).heldMinor).toBeGreaterThan(0)
  })

  it("keeps the flagship the busiest without starving the tail", () => {
    const counts = new Map<string, number>()
    for (const t of MONEY_TXS) counts.set(t.locationId, (counts.get(t.locationId) ?? 0) + 1)
    const flagship = counts.get("shampooch-jvc") ?? 0
    // A chain where every branch takes the same is a chain SCR-15 has nothing
    // to show — the job is spotting the branch having a bad day.
    for (const l of live) {
      if (l.id === "shampooch-jvc") continue
      const n = counts.get(l.id) ?? 0
      expect(n).toBeGreaterThan(0)
      expect(n).toBeLessThan(flagship)
    }
  })

  it("does not attribute every messaging charge to one branch", () => {
    const branches = new Set(
      MONEY_TXS.filter((t) => t.kind === "messaging").map((t) => t.locationId),
    )
    expect(branches.size).toBeGreaterThan(1)
  })
})
