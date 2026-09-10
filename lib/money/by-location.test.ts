import { describe, expect, it } from "vitest"

import { hasActivity, shareOfRollUp, summarizeByLocation } from "@/lib/money/by-location"
import type { MoneyTx } from "@/lib/money/types"

const filter = { fromIso: "2026-08-01", toIso: "2026-08-31" }

let seq = 0
function sale(locationName: string, aed: number, day = "2026-08-10"): MoneyTx {
  seq += 1
  return {
    id: `tx-${seq}`,
    kind: "sale",
    rail: "terminal",
    amountMinor: aed * 100,
    at: `${day}T10:00:00+04:00`,
    locationName,
    confirmation: "confirmed",
  }
}

describe("summarizeByLocation", () => {
  it("keeps every branch as its own row and sums the total from them", () => {
    // KH1.1: side by side, never merged. The total is a consequence of the
    // rows, which is also what stops the two disagreeing.
    const txs = [sale("JVC", 100), sale("Jumeirah", 60), sale("JVC", 40)]
    const out = summarizeByLocation(txs, filter, ["JVC", "Jumeirah"])

    // Order is asserted separately; this case is about the rows existing and
    // the total being their sum.
    expect(out.rows.map((r) => r.locationName).sort()).toEqual(["JVC", "Jumeirah"])
    const jvc = out.rows.find((r) => r.locationName === "JVC")
    expect(jvc?.summary.moneyIn.totalMinor).toBe(14_000)
    expect(out.rollUp.moneyIn.totalMinor).toBe(20_000)
    expect(out.rows.reduce((sum, r) => sum + r.summary.moneyIn.totalMinor, 0)).toBe(
      out.rollUp.moneyIn.totalMinor,
    )
  })

  it("orders the rows by takings, biggest first", () => {
    // The screen answers "which branch carried the period", and the ordering
    // is what answers it before anyone reads a figure. Alphabetical would put
    // the quietest branch first as often as not.
    const txs = [sale("Alpha", 10), sale("Zulu", 900), sale("Mike", 400)]
    const out = summarizeByLocation(txs, filter, ["Alpha", "Zulu", "Mike"])
    expect(out.rows.map((r) => r.locationName)).toEqual(["Zulu", "Mike", "Alpha"])
  })

  it("breaks a tie on name, so the order does not shuffle between renders", () => {
    const txs = [sale("Bravo", 100), sale("Alpha", 100)]
    const out = summarizeByLocation(txs, filter, ["Bravo", "Alpha"])
    expect(out.rows.map((r) => r.locationName)).toEqual(["Alpha", "Bravo"])
  })

  it("never returns a branch outside the granted set", () => {
    // R18 / KH1.2: "run a report on everything" is bounded to the caller's
    // grant. This is the leak BG-06 makes a hard gate, so it is a bound before
    // anything is summed rather than a filter afterwards.
    const txs = [sale("JVC", 100), sale("Jumeirah", 500)]
    const out = summarizeByLocation(txs, filter, ["JVC"])

    expect(out.rows.map((r) => r.locationName)).toEqual(["JVC"])
    // The roll-up must not include the branch the caller cannot see, or the
    // total leaks the number the rows withheld.
    expect(out.rollUp.moneyIn.totalMinor).toBe(10_000)
  })

  it("gives a one-branch manager their own number as the roll-up", () => {
    // KH1.3: "all my branches" means exactly my one branch, correctly labelled
    // as mine — not an error and not everyone else's figures.
    const txs = [sale("Jumeirah", 60), sale("JVC", 100)]
    const out = summarizeByLocation(txs, filter, ["Jumeirah"])

    expect(out.rows).toHaveLength(1)
    expect(out.rollUp.moneyIn.totalMinor).toBe(out.rows[0].summary.moneyIn.totalMinor)
  })

  it("names a granted branch with no takings instead of dropping it", () => {
    // "Nothing at Al Quoz today" and "Al Quoz is missing from this report" are
    // different answers, and an owner needs the first.
    const out = summarizeByLocation([sale("JVC", 100)], filter, ["JVC", "Al Quoz"])
    expect(out.rows.map((r) => r.locationName)).toEqual(["JVC"])
    expect(out.quietLocations).toEqual(["Al Quoz"])
  })

  it("treats a branch whose only activity predates the period as quiet", () => {
    const txs = [sale("JVC", 100), sale("Jumeirah", 80, "2026-07-02")]
    const out = summarizeByLocation(txs, filter, ["JVC", "Jumeirah"])
    expect(out.rows.map((r) => r.locationName)).toEqual(["JVC"])
    expect(out.quietLocations).toEqual(["Jumeirah"])
  })

  it("returns no rows, and no total, when the caller is granted nothing", () => {
    // R24 read through reporting: an empty grant is no access, never all.
    const out = summarizeByLocation([sale("JVC", 100)], filter, [])
    expect(out.rows).toEqual([])
    expect(out.rollUp.moneyIn.totalMinor).toBe(0)
    expect(out.quietLocations).toEqual([])
  })
})

describe("shareOfRollUp", () => {
  it("is the branch's part of the total", () => {
    const out = summarizeByLocation([sale("JVC", 75), sale("Jumeirah", 25)], filter, [
      "JVC",
      "Jumeirah",
    ])
    const jvc = out.rows.find((r) => r.locationName === "JVC")!
    expect(shareOfRollUp(jvc, out.rollUp)).toBeCloseTo(0.75)
  })

  it("returns 0 rather than dividing by an empty period", () => {
    // Dividing by an empty period would give Infinity or NaN, which would
    // render as a nonsense percentage; 0 is honest.
    const out = summarizeByLocation([], filter, ["JVC"])
    expect(shareOfRollUp({ locationName: "JVC", summary: out.rollUp }, out.rollUp)).toBe(0)
  })
})

describe("hasActivity", () => {
  it("counts a branch that only received a payout as having traded", () => {
    const out = summarizeByLocation([sale("JVC", 100)], filter, ["JVC"])
    expect(hasActivity(out.rows[0].summary)).toBe(true)
    const empty = summarizeByLocation([], filter, ["JVC"])
    expect(hasActivity(empty.rollUp)).toBe(false)
  })
})
