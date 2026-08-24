// Pins the money model to the rules that make the screens correct (DSG-73 §2).
//
// The first test here is the whole point of the pack. Fresha's account summary
// and wallet header disagree by 9.3x because nothing forced the breakdown to
// arrive at the headline. This asserts it does — for the blended view and for
// each rail on its own, so whichever way D6 lands the arithmetic is already
// proven.

import { describe, expect, it } from "vitest"
import { formatMoney } from "./format"
import {
  filterActivity,
  findTx,
  groupByDay,
  paginateDays,
  payoutContents,
  payoutReconciles,
  relatedTxs,
  summarize,
  summarizeByRail,
} from "./ledger"
import { MONEY_TXS, PAYOUT_MINIMUM_MINOR, PAYOUTS, periodBounds, TODAY_ISO } from "./mock"
import type { MoneyTx } from "./types"

const MTD = periodBounds("month-to-date")
const LAST_MONTH = periodBounds("last-month")
const ALL = { fromIso: "2026-07-01", toIso: TODAY_ISO }

describe("the breakdown arrives at the headline", () => {
  for (const [label, period] of [
    ["month to date", MTD],
    ["last month", LAST_MONTH],
    ["both months", ALL],
  ] as const) {
    it(`ties on the blended view — ${label}`, () => {
      const s = summarize(MONEY_TXS, period)
      expect(
        s.openingMinor +
          s.moneyIn.totalMinor +
          s.deductions.totalMinor +
          s.adjustments.totalMinor +
          s.payouts.totalMinor,
      ).toBe(s.heldMinor)
    })

    it(`ties on each rail, and the rails sum to the blend — ${label}`, () => {
      const blended = summarize(MONEY_TXS, period)
      const byRail = summarizeByRail(MONEY_TXS, period)

      for (const rail of ["online", "terminal"] as const) {
        const s = byRail[rail]
        expect(
          s.openingMinor +
            s.moneyIn.totalMinor +
            s.deductions.totalMinor +
            s.adjustments.totalMinor +
            s.payouts.totalMinor,
        ).toBe(s.heldMinor)
      }

      // No money belongs to neither rail, and none is counted twice.
      expect(byRail.online.heldMinor + byRail.terminal.heldMinor).toBe(blended.heldMinor)
    })
  }

  it("never reports a negative held balance on a rail — money cannot be owed backwards", () => {
    // The defect that made this model grow an opening balance. A payout inside
    // the period can carry money earned before it, so a period-scoped balance
    // with no opening figure goes negative. Held is a point-in-time figure and
    // has to stay one.
    for (const period of [MTD, LAST_MONTH, ALL]) {
      const byRail = summarizeByRail(MONEY_TXS, period)
      expect(byRail.online.heldMinor).toBeGreaterThanOrEqual(0)
      expect(byRail.terminal.heldMinor).toBeGreaterThanOrEqual(0)
      expect(summarize(MONEY_TXS, period).heldMinor).toBeGreaterThanOrEqual(0)
    }
  })

  it("closes at the same balance whichever period you ask for", () => {
    // Month-to-date and both-months end on the same day, so they must agree on
    // what is held right now even though their flows differ completely.
    expect(summarize(MONEY_TXS, MTD).heldMinor).toBe(summarize(MONEY_TXS, ALL).heldMinor)
  })

  it("subtotals are the sum of their own lines, not separately maintained", () => {
    const s = summarize(MONEY_TXS, ALL)
    expect(s.moneyIn.salesMinor + s.moneyIn.tipsMinor + s.moneyIn.depositsMinor).toBe(
      s.moneyIn.totalMinor,
    )
    expect(
      s.deductions.camiFeeMinor + s.deductions.messagingMinor + s.deductions.refundsMinor,
    ).toBe(s.deductions.totalMinor)
  })

  it("deductions and payouts are negative, so the reconciliation is a plain sum", () => {
    const s = summarize(MONEY_TXS, ALL)
    expect(s.deductions.totalMinor).toBeLessThan(0)
    expect(s.payouts.totalMinor).toBeLessThan(0)
  })

  it("has no subscription line to omit — the OS is free (INV-P4)", () => {
    // A structural assertion: the deductions block has exactly three lines, and
    // 73% of Fresha's deductions were things Cami does not sell (spec §2.2).
    const s = summarize(MONEY_TXS, ALL)
    expect(Object.keys(s.deductions).sort()).toEqual([
      "camiFeeMinor",
      "messagingMinor",
      "refundsMinor",
      "totalMinor",
    ])
  })
})

describe("tax figures (06 §4, G4, EC-39)", () => {
  it("keeps taxable gross and amount due as different numbers when a tip exists", () => {
    const s = summarize(MONEY_TXS, ALL)
    expect(s.moneyIn.tipsMinor).toBeGreaterThan(0)
    expect(s.tax.amountDueMinor).toBe(s.tax.taxableGrossMinor + s.moneyIn.tipsMinor)
    expect(s.tax.amountDueMinor).not.toBe(s.tax.taxableGrossMinor)
  })

  it("derives VAT from the tax-inclusive gross rather than appending it", () => {
    const s = summarize(MONEY_TXS, ALL)
    expect(s.tax.vatOnSalesMinor).toBe(Math.round((s.tax.taxableGrossMinor * 5) / 105))
    expect(s.tax.vatOnSalesMinor).toBeLessThan(s.tax.taxableGrossMinor)
  })

  it("states VAT on Cami's own fee — Cami charges a UAE business (INV-P9)", () => {
    const s = summarize(MONEY_TXS, ALL)
    expect(s.tax.vatOnCamiFeeMinor).toBeGreaterThan(0)
  })
})

describe("payouts", () => {
  it("every sent payout arrives at the sum of what it carried (SET-C4, SET-D4)", () => {
    const sent = PAYOUTS.filter((p) => p.status !== "held-below-minimum")
    expect(sent.length).toBeGreaterThan(0)
    for (const payout of sent) {
      expect(payoutReconciles(payoutContents(MONEY_TXS, payout))).toBe(true)
    }
  })

  it("a failed payout keeps its row, and the retry is a separate one (INV-01, SET-C6)", () => {
    const failed = PAYOUTS.find((p) => p.status === "failed")
    expect(failed).toBeDefined()
    if (!failed) return

    expect(failed.failureReason).toBeTruthy()
    // Nothing was mutated: no arrival was promised, and the money came back as
    // its own row rather than by editing the payout.
    expect(failed.arrivesAt).toBeUndefined()
    const reversal = MONEY_TXS.find((t) => t.reversesPayoutId === failed.id)
    expect(reversal?.kind).toBe("adjustment")
    expect(reversal?.amountMinor).toBe(failed.amountMinor)
    // A reversal is not contents: the drill-in still arrives at the payout
    // figure, not twice it.
    expect(payoutReconciles(payoutContents(MONEY_TXS, failed))).toBe(true)

    const retry = PAYOUTS.find((p) => p.retryOfPayoutId === failed.id)
    expect(retry?.id).not.toBe(failed.id)
    expect(retry?.amountMinor).toBe(failed.amountMinor)
  })

  it("holds below the minimum instead of sending, and says so (SET-X9)", () => {
    const held = PAYOUTS.filter((p) => p.status === "held-below-minimum")
    expect(held.length).toBeGreaterThan(0)
    for (const p of held) {
      expect(p.amountMinor).toBeLessThan(PAYOUT_MINIMUM_MINOR)
      // Nothing left, so nothing may claim an arrival date.
      expect(p.arrivesAt).toBeUndefined()
    }
  })
})

describe("split custody is present in the data, not just the copy", () => {
  it("runs both rails, with money on each", () => {
    const byRail = summarizeByRail(MONEY_TXS, ALL)
    expect(byRail.online.moneyIn.totalMinor).toBeGreaterThan(0)
    expect(byRail.terminal.moneyIn.totalMinor).toBeGreaterThan(0)
  })

  it("carries terminal rows the gateway has only reported, not confirmed (SET-C9)", () => {
    const reported = MONEY_TXS.filter((t) => t.confirmation === "reported")
    expect(reported.length).toBeGreaterThan(0)
    // Only the terminal rail can be in this state — online money is Cami's own.
    expect(reported.every((t) => t.rail === "terminal")).toBe(true)
  })

  it("pairs every fee with the payment that caused it (T5-3, T3-4)", () => {
    const fees = MONEY_TXS.filter((t) => t.kind === "cami-fee")
    expect(fees.length).toBeGreaterThan(0)
    const ids = new Set(MONEY_TXS.map((t) => t.id))
    for (const fee of fees) {
      expect(fee.causedByTxId).toBeTruthy()
      expect(ids.has(fee.causedByTxId ?? "")).toBe(true)
    }
  })
})

describe("the activity feed (DSG-78)", () => {
  it("groups by day, newest first, and every subtotal is its own rows", () => {
    const groups = groupByDay(MONEY_TXS)
    expect(groups.length).toBeGreaterThan(1)
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i - 1].dayIso > groups[i].dayIso).toBe(true)
    }
    for (const g of groups) {
      expect(g.txs.reduce((sum, t) => sum + t.amountMinor, 0)).toBe(g.subtotalMinor)
      expect(g.txs.every((t) => t.at.slice(0, 10) === g.dayIso)).toBe(true)
    }
  })

  it("pages by whole days, so a subtotal never describes rows off screen", () => {
    const groups = groupByDay(MONEY_TXS)
    const page = paginateDays(groups, 7)
    expect(page.groups).toHaveLength(7)
    expect(page.remainingDays).toBe(groups.length - 7)
    // The rows shown under a heading are all the rows that heading counts.
    for (const g of page.groups) {
      expect(g.txs.reduce((sum, t) => sum + t.amountMinor, 0)).toBe(g.subtotalMinor)
    }
  })

  it("filters on the rail axis Fresha has no equivalent of", () => {
    const terminal = filterActivity(MONEY_TXS, { rail: "terminal" })
    expect(terminal.length).toBeGreaterThan(0)
    expect(terminal.every((t) => t.rail === "terminal")).toBe(true)
    // Filtering to zero is reachable and is not the same as having no money.
    expect(filterActivity(MONEY_TXS, { kinds: ["adjustment"], rail: "online" })).toHaveLength(0)
  })

  it("keeps every fee reachable from the payment that caused it", () => {
    const fee = MONEY_TXS.find((t) => t.kind === "cami-fee")
    expect(fee).toBeDefined()
    if (!fee) return
    const payment = findTx(MONEY_TXS, fee.causedByTxId)
    expect(payment).toBeDefined()
    // And back the other way, which is what the detail panel walks.
    expect(relatedTxs(MONEY_TXS, payment as MoneyTx).some((t) => t.id === fee.id)).toBe(true)
  })
})

describe("payout drill-in (T5-7, T5-8)", () => {
  it("shows a refund against money a payout carried, without restating the payout", () => {
    const refund = MONEY_TXS.find(
      (t) => t.kind === "refund" && t.causedByTxId !== undefined && t.payoutId !== undefined,
    )
    expect(refund).toBeDefined()
    if (!refund) return

    const original = findTx(MONEY_TXS, refund.causedByTxId)
    expect(original?.payoutId).toBeTruthy()

    const carrier = PAYOUTS.find((p) => p.id === original?.payoutId)
    expect(carrier).toBeDefined()
    if (!carrier) return

    const contents = payoutContents(MONEY_TXS, carrier)
    // Visible on the payout that carried the original money (SET-E6)...
    expect(contents.laterRefunds.some((r) => r.id === refund.id)).toBe(true)
    // ...and the completed transfer is not restated by it.
    expect(payoutReconciles(contents)).toBe(true)
    expect(contents.txs.some((t) => t.id === refund.id)).toBe(false)
  })

  it("a retry drills into the same money the failed payout tried to send", () => {
    const failed = PAYOUTS.find((p) => p.status === "failed")
    const retry = PAYOUTS.find((p) => p.retryOfPayoutId === failed?.id)
    expect(failed && retry).toBeTruthy()
    if (!failed || !retry) return

    const a = payoutContents(MONEY_TXS, failed)
    const b = payoutContents(MONEY_TXS, retry)
    expect(b.txs.map((t) => t.id)).toEqual(a.txs.map((t) => t.id))
    expect(payoutReconciles(b)).toBe(true)
  })
})

describe("formatMoney (G7)", () => {
  it("always shows two decimals with a thousands separator", () => {
    expect(formatMoney(146409)).toBe("AED 1,464.09")
    expect(formatMoney(0)).toBe("AED 0.00")
    expect(formatMoney(500)).toBe("AED 5.00")
  })

  it("renders negatives with a leading minus, never parentheses", () => {
    expect(formatMoney(-146409)).toBe("- AED 1,464.09")
    expect(formatMoney(-146409)).not.toContain("(")
  })
})
