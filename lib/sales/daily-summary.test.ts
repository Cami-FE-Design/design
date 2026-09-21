import { describe, expect, it } from "vitest"

import type { Sale } from "@/app/sales/sales-list/page"
import { dayIso, latestTradingDay, summarizeDay } from "@/lib/sales/daily-summary"

/**
 * The end-of-day view answers which branch (R09, R18, RP-A1).
 *
 * The page was two cards of constants with no branch anywhere on them, which is
 * the PRD's first user story failing in the exact way the story names: "a
 * single number destroys the job". So the assertions here are about the bound
 * and the breakdown, not about the row labels.
 */

const DAY = "2026-05-25"

function sale(partial: Partial<Sale> & { locationId: string; grossMinor: number }): Sale {
  return {
    id: Math.floor(Math.random() * 1e9),
    client: "Test Client",
    status: "completed",
    saleAt: new Date(`${DAY}T11:00:00`),
    tipsMinor: 0,
    ...partial,
  } as Sale
}

const JVC = "shampooch-jvc"
const JUM = "shampooch-jumeirah"

describe("the daily summary is bounded before it sums", () => {
  const log = [
    sale({ locationId: JVC, grossMinor: 40000 }),
    sale({ locationId: JUM, grossMinor: 25000 }),
  ]

  it("gives a one-branch manager their own day, not the business's", () => {
    const mine = summarizeDay(log, DAY, [JVC])
    expect(mine.rollUpMinor).toBe(40000)
    expect(mine.byLocation).toHaveLength(1)
  })

  it("never leaks a branch the rows withheld", () => {
    const mine = summarizeDay(log, DAY, [JVC])
    expect(mine.byLocation.some((r) => r.locationId === JUM)).toBe(false)
    expect(mine.quietLocations).toEqual([])
  })

  it("rolls up to the sum of its own rows, never a stored total", () => {
    const all = summarizeDay(log, DAY, [JVC, JUM])
    expect(all.rollUpMinor).toBe(all.byLocation.reduce((s, r) => s + r.grossMinor, 0))
    expect(all.rollUpMinor).toBe(65000)
  })

  it("names a granted branch that took nothing rather than dropping it", () => {
    const all = summarizeDay(log, DAY, [JVC, JUM, "shampooch-mirdif"])
    expect(all.quietLocations).toEqual(["shampooch-mirdif"])
  })

  it("orders biggest first, so the ordering carries the answer", () => {
    const all = summarizeDay(log, DAY, [JUM, JVC])
    expect(all.byLocation.map((r) => r.locationId)).toEqual([JVC, JUM])
  })

  it("holds only the day asked for", () => {
    const withYesterday = [
      ...log,
      sale({ locationId: JVC, grossMinor: 99900, saleAt: new Date("2026-05-24T11:00:00") }),
    ]
    expect(summarizeDay(withYesterday, DAY, [JVC, JUM]).rollUpMinor).toBe(65000)
  })
})

describe("the day's figures agree with each other", () => {
  it("takes a refund off the branch row and the transaction total alike", () => {
    const log = [
      sale({ locationId: JVC, grossMinor: 40000 }),
      sale({ locationId: JVC, grossMinor: 15000, status: "refunded" }),
    ]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.byLocation[0]!.grossMinor).toBe(25000)
    expect(day.transactionTotal.grossMinor).toBe(25000)
    expect(day.rollUpMinor).toBe(day.transactionTotal.grossMinor)
  })

  it("keeps a voided sale out of takings without counting it as a refund", () => {
    const log = [
      sale({ locationId: JVC, grossMinor: 40000 }),
      sale({ locationId: JVC, grossMinor: 8000, status: "voided" }),
    ]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.transactionTotal.refundQty).toBe(0)
    expect(day.transactions.find((r) => r.label === "Services")!.salesQty).toBe(1)
  })

  it("separates a sale that happened from cash that moved", () => {
    // An unpaid sale is a transaction and no money in the drawer, which is the
    // whole reason these are two cards.
    const log = [sale({ locationId: JVC, grossMinor: 40000, status: "unpaid" })]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.transactionTotal.grossMinor).toBe(40000)
    expect(day.cash.find((r) => r.label === "Payments collected")!.collectedMinor).toBe(0)
  })

  it("counts a tip as collected without adding it to taxable gross", () => {
    const log = [sale({ locationId: JVC, grossMinor: 40000, tipsMinor: 5000 })]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.transactionTotal.grossMinor).toBe(40000)
    expect(day.cash.find((r) => r.label === "Payments collected")!.collectedMinor).toBe(45000)
    expect(day.cash.find((r) => r.label === "Of which tips")!.collectedMinor).toBe(5000)
  })

  it("keeps a gift card out of takings entirely — it is a liability", () => {
    // Confirmed against the built summary: "gift cards sold are a liability
    // (deferred revenue), shown separately, not included in the Total Sales
    // row." Counting them overstates the day by the card's face value.
    const log = [
      sale({ locationId: JVC, grossMinor: 40000 }),
      sale({
        locationId: JVC,
        grossMinor: 20000,
        giftCard: { cardId: "gc-1", code: "GC-1", status: "Active", valueAed: 200 },
      }),
    ]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.transactionTotal.grossMinor).toBe(40000)
    expect(day.giftCardsSold.grossMinor).toBe(20000)
    // And the branch row counts the same thing the total does.
    expect(day.byLocation[0]!.grossMinor).toBe(40000)
    expect(day.rollUpMinor).toBe(day.transactionTotal.grossMinor)
  })

  it("keeps a gift card out of Services, because it is not one", () => {
    const log = [
      sale({ locationId: JVC, grossMinor: 40000 }),
      sale({
        locationId: JVC,
        grossMinor: 20000,
        giftCard: { cardId: "gc-1", code: "GC-1", status: "Active", valueAed: 200 },
      }),
    ]
    const day = summarizeDay(log, DAY, [JVC])
    expect(day.transactions.find((r) => r.label === "Services")!.salesQty).toBe(1)
    expect(day.giftCardsSold.salesQty).toBe(1)
  })

  it("keeps the rows it has no source for, rather than dropping them", () => {
    // A missing row reads as a broken report; a zero row is a statement.
    const labels = summarizeDay([], DAY, [JVC]).transactions.map((r) => r.label)
    expect(labels).toContain("Memberships")
    expect(labels).toContain("No-show fees")
  })
})

describe("the page lands on a day worth reading", () => {
  it("picks this scope's own last trading day", () => {
    const log = [
      sale({ locationId: JVC, grossMinor: 100, saleAt: new Date("2026-05-20T10:00:00") }),
      sale({ locationId: JUM, grossMinor: 100, saleAt: new Date("2026-06-02T10:00:00") }),
    ]
    expect(dayIso(latestTradingDay(log, [JVC])!)).toBe("2026-05-20")
    expect(dayIso(latestTradingDay(log, [JVC, JUM])!)).toBe("2026-06-02")
  })

  it("has nothing to land on when the scope has never traded", () => {
    expect(latestTradingDay([], [JVC])).toBeNull()
  })
})
