// Derivation for the merchant money surfaces (DSG-73 §4).
//
// Everything a money screen prints comes from here. No screen computes its own
// figure, and nothing in `MoneySummary` is stored — that is the structural fix
// for the defect in spec §2.1, where a headline and its own breakdown disagreed
// by 9.3x because each was maintained separately.
//
// Pure functions, no React, no store. Testable in isolation, and the test
// (ledger.test.ts) asserts the reconciliation ties on every fixture and filter.

import { VAT_RATE, vatOf } from "@/lib/invoice/totals"
import type { CamiPayRail, MoneySummary, MoneyTx, MoneyTxKind, Payout } from "./types"

/** Inclusive on both ends. Dates, not timestamps — a period is whole days. */
export function inPeriod(tx: MoneyTx, fromIso: string, toIso: string): boolean {
  const day = tx.at.slice(0, 10)
  return day >= fromIso && day <= toIso
}

export type PeriodFilter = {
  fromIso: string
  toIso: string
  /** Null spans every rail — the blended view (D6, variant A). */
  rail?: CamiPayRail | null
}

function sumOf(txs: ReadonlyArray<MoneyTx>, kind: MoneyTxKind): number {
  return txs.filter((t) => t.kind === kind).reduce((sum, t) => sum + t.amountMinor, 0)
}

function countOf(txs: ReadonlyArray<MoneyTx>, kind: MoneyTxKind): number {
  return txs.filter((t) => t.kind === kind).length
}

/**
 * The reconciliation for one period and (optionally) one rail.
 *
 * Read the return statement as the screen reads: what was already held, plus
 * money in, minus what Cami took, plus or minus corrections, minus what went to
 * the bank, equals what is still held. `heldMinor` is that sum and nothing else
 * — there is no path by which it can be set to a number the rows do not produce.
 */
export function summarize(txs: ReadonlyArray<MoneyTx>, filter: PeriodFilter): MoneySummary {
  const { fromIso, toIso, rail = null } = filter

  const onRail = (t: MoneyTx) => rail === null || t.rail === rail
  const scoped = txs.filter((t) => inPeriod(t, fromIso, toIso) && onRail(t))

  // Everything that had already happened when the period opened. Without this
  // the reconciliation is not a reconciliation — see `openingMinor`.
  const openingMinor = txs
    .filter((t) => onRail(t) && t.at.slice(0, 10) < fromIso)
    .reduce((sum, t) => sum + t.amountMinor, 0)

  const salesMinor = sumOf(scoped, "sale")
  const tipsMinor = sumOf(scoped, "tip")
  const depositsMinor = sumOf(scoped, "deposit")
  const moneyInTotal = salesMinor + tipsMinor + depositsMinor

  // Already negative on the transaction — a fee row IS a negative amount, so
  // nothing here flips a sign. See the sign convention on `MoneySummary`.
  const camiFeeMinor = sumOf(scoped, "cami-fee")
  const messagingMinor = sumOf(scoped, "messaging")
  const refundsMinor = sumOf(scoped, "refund")
  const deductionsTotal = camiFeeMinor + messagingMinor + refundsMinor

  const adjustmentsTotal = sumOf(scoped, "adjustment")
  const payoutsTotal = sumOf(scoped, "payout")

  // Tips are outside the tax base (06 §4, INV-M5), so taxable gross is sales
  // alone. Both figures render even when they are equal — collapsing them when
  // they match is exactly how EC-39 comes back.
  const taxableGrossMinor = salesMinor
  const amountDueMinor = salesMinor + tipsMinor

  return {
    period: { fromIso, toIso },
    rail,
    openingMinor,
    moneyIn: { salesMinor, tipsMinor, depositsMinor, totalMinor: moneyInTotal },
    deductions: {
      camiFeeMinor,
      messagingMinor,
      refundsMinor,
      totalMinor: deductionsTotal,
    },
    adjustments: { totalMinor: adjustmentsTotal, count: countOf(scoped, "adjustment") },
    payouts: { totalMinor: payoutsTotal, count: countOf(scoped, "payout") },
    heldMinor: openingMinor + moneyInTotal + deductionsTotal + adjustmentsTotal + payoutsTotal,
    tax: {
      taxableGrossMinor,
      amountDueMinor,
      vatOnSalesMinor: vatOf(taxableGrossMinor, VAT_RATE),
      // Cami charges a UAE business, so Cami's own fee carries VAT (INV-P9).
      // Computed on the magnitude — VAT on a fee is a positive figure the
      // merchant can reclaim, not a negative one.
      vatOnCamiFeeMinor: vatOf(Math.abs(camiFeeMinor), VAT_RATE),
    },
  }
}

/**
 * One summary per rail, for the two-rail layout (D6, variant B).
 *
 * Both variants read the same function with a different filter, so whichever
 * D6 picks at design review, no arithmetic changes — only the layout does.
 */
export function summarizeByRail(
  txs: ReadonlyArray<MoneyTx>,
  filter: Omit<PeriodFilter, "rail">,
): Record<CamiPayRail, MoneySummary> {
  return {
    online: summarize(txs, { ...filter, rail: "online" }),
    terminal: summarize(txs, { ...filter, rail: "terminal" }),
  }
}

/* -------------------------------------------------------------------------- */
/* Activity feed                                                              */
/* -------------------------------------------------------------------------- */

export type DayGroup = {
  /** `2026-08-15` */
  dayIso: string
  /**
   * Signed net for the day. Fresha shows a daily subtotal and it works
   * (T5-1) — but theirs is money-in only, so a heavy fee day reads as a good
   * one. This is the net, which is the figure that means something.
   */
  subtotalMinor: number
  txs: MoneyTx[]
}

/** Reverse-chronological, grouped by day, newest day first (T5-1). */
export function groupByDay(txs: ReadonlyArray<MoneyTx>): DayGroup[] {
  const byDay = new Map<string, MoneyTx[]>()
  for (const tx of txs) {
    const day = tx.at.slice(0, 10)
    const bucket = byDay.get(day)
    if (bucket) bucket.push(tx)
    else byDay.set(day, [tx])
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([dayIso, dayTxs]) => ({
      dayIso,
      subtotalMinor: dayTxs.reduce((sum, t) => sum + t.amountMinor, 0),
      txs: [...dayTxs].sort((a, b) => (a.at < b.at ? 1 : -1)),
    }))
}

export type ActivityFilter = {
  kinds?: ReadonlyArray<MoneyTxKind>
  /** The axis Fresha has no equivalent of — they run one wallet (spec §2.5). */
  rail?: CamiPayRail | null
  fromIso?: string
  toIso?: string
  locationName?: string
}

export function filterActivity(txs: ReadonlyArray<MoneyTx>, filter: ActivityFilter): MoneyTx[] {
  return txs.filter((tx) => {
    if (filter.kinds?.length && !filter.kinds.includes(tx.kind)) return false
    if (filter.rail && tx.rail !== filter.rail) return false
    if (filter.locationName && tx.locationName !== filter.locationName) return false
    if (filter.fromIso && tx.at.slice(0, 10) < filter.fromIso) return false
    if (filter.toIso && tx.at.slice(0, 10) > filter.toIso) return false
    return true
  })
}

/* -------------------------------------------------------------------------- */
/* Payout drill-in                                                            */
/* -------------------------------------------------------------------------- */

export type PayoutContents = {
  payout: Payout
  /** Every transaction the payout carried, newest first. */
  txs: MoneyTx[]
  /**
   * What the contents actually sum to. Rendered beside `payout.amountMinor` so
   * the drill-in ARRIVES at the payout figure (SET-C4, SET-D4) instead of
   * asserting it. If these two ever differ, the screen should say so rather
   * than pick one.
   */
  contentsTotalMinor: number
  /**
   * Refunds against money THIS payout carried, which went out with a later one
   * (SET-E6, T5-8).
   *
   * Deliberately outside `txs` and outside `contentsTotalMinor`: this payout
   * really did send that money, and folding a later refund into its total would
   * restate a completed transfer. The merchant asking "wasn't part of Tuesday's
   * payout refunded?" gets an answer without the payout figure moving.
   */
  laterRefunds: MoneyTx[]
}

export function payoutContents(txs: ReadonlyArray<MoneyTx>, payout: Payout): PayoutContents {
  const carriesId = payout.carriesPayoutId ?? payout.id
  const carried = txs
    .filter((t) => t.payoutId === carriesId && t.kind !== "payout")
    .sort((a, b) => (a.at < b.at ? 1 : -1))

  const carriedIds = new Set(carried.map((t) => t.id))
  const laterRefunds = txs
    .filter(
      (t) =>
        t.kind === "refund" &&
        t.causedByTxId !== undefined &&
        carriedIds.has(t.causedByTxId) &&
        !carriedIds.has(t.id),
    )
    .sort((a, b) => (a.at < b.at ? 1 : -1))

  return {
    payout,
    txs: carried,
    contentsTotalMinor: carried.reduce((sum, t) => sum + t.amountMinor, 0),
    laterRefunds,
  }
}

/** The row a fee, tip or refund points back at, when it points at one. */
export function findTx(txs: ReadonlyArray<MoneyTx>, id: string | undefined): MoneyTx | undefined {
  return id === undefined ? undefined : txs.find((t) => t.id === id)
}

/**
 * The rows a fee caused-by chain hangs off one payment: its fee, its tip, and
 * any refund against it. Used by the detail panel so a payment and everything
 * Cami did to it are readable in one place (T5-3).
 */
export function relatedTxs(txs: ReadonlyArray<MoneyTx>, tx: MoneyTx): MoneyTx[] {
  return txs
    .filter((t) => t.id !== tx.id && (t.causedByTxId === tx.id || t.id === tx.causedByTxId))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
}

/**
 * Day groups, capped to a whole number of days.
 *
 * Paginating by ROW would cut a day in half and leave its subtotal describing
 * rows the merchant cannot see — a subtotal that does not match what is on
 * screen is worse than no subtotal (T5-1).
 */
export function paginateDays(
  groups: ReadonlyArray<DayGroup>,
  days: number,
): { groups: DayGroup[]; remainingDays: number } {
  return {
    groups: groups.slice(0, days),
    remainingDays: Math.max(0, groups.length - days),
  }
}

/** True when the drill-in reconciles. A false here is a bug worth surfacing. */
export function payoutReconciles(contents: PayoutContents): boolean {
  return contents.contentsTotalMinor === contents.payout.amountMinor
}
