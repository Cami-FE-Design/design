// Invoices and fees — DSG-76.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// What Cami charged, per period, itemised down to the sale that caused it.
//
// Cami's version of this screen is a different document from Fresha's. Theirs
// bills subscription plus fees, and subscription is 58% of it (spec §2.2).
// Cami's carries processing margin and messaging or add-on usage only — the OS
// is free (INV-P4, ADR-001) — so this module has no concept of a plan charge to
// leave room for.
//
// Two rules the derivation exists to hold:
//
//   1. EVERY FEE TRACES TO ITS CAUSE (T3-4). A fee with no visible reason reads
//      as skimming, and the merchant has no way to check it. Each line carries
//      the payment it came from and the reference on that payment.
//   2. THE RATE COMES FROM THE TRANSACTION (T3-6, SET-C2). A line renders the
//      rate snapshotted at capture, never the current rate card, so a
//      renegotiation cannot restate a statement the merchant already filed.

import { type CamiPayRate, computeFee, formatRate } from "@/lib/hq-camipay/store"
import { VAT_RATE, vatOf } from "@/lib/invoice/totals"
import type { CamiPayRail, MoneyTx } from "./types"

/**
 * How Cami collects its take on the terminal rail — decision **D1**, open.
 *
 * Both outcomes are built because the rail is the majority of a Tier 1
 * merchant's money, so this is not a corner.
 *
 * Note it does NOT appear in `feePeriods`. Under either outcome a terminal fee
 * is Cami's fee, charged at the same rate, belonging to the same period — what
 * changes is only how it is collected and therefore what the screen SAYS about
 * it. Threading it through the arithmetic would imply the two outcomes produce
 * different money, and they do not.
 */
export type TerminalFeeModel =
  /** The gateway deducts Cami's fee and remits it. Terminal fees are a reported line. */
  | "gateway-deducts"
  /** Cami invoices the merchant for terminal fees. They are a payable. */
  | "cami-invoices"

export type FeeLine = {
  id: string
  at: string
  rail: CamiPayRail
  /** The payment this fee was charged on. */
  baseAmountMinor: number
  /** Positive magnitude, fils. Fee rows are negative in the ledger. */
  feeMinor: number
  /** The rate as it stood at capture, never the current one. */
  rate: CamiPayRate | null
  /** `3% + AED 0.75` — rendered from the snapshot, so a statement never re-rates. */
  rateLabel: string
  reference?: { label: string; href?: string }
  /** True when the fee is not processing margin — messaging or add-on usage. */
  usage: boolean
  description: string
}

export type FeePeriodStatus =
  /** Closed. Both documents are downloadable. */
  | "available"
  /** The current month. Fees are still accruing, so nothing is issued yet. */
  | "pending"

export type FeePeriod = {
  /** `2026-08` */
  key: string
  /** `August 2026` */
  label: string
  status: FeePeriodStatus
  /** When the documents for a pending period become available. */
  availableOnIso?: string
  lines: FeeLine[]
  /** Positive magnitude. What Cami charged in this period. */
  feeTotalMinor: number
  /** Processing margin only. */
  processingMinor: number
  /** Messaging and add-on usage. */
  usageMinor: number
  /** Per rail, so the terminal card can be shown or explained away (T3-7). */
  byRail: Record<CamiPayRail, number>
  /**
   * VAT contained in Cami's fee. Cami charges a UAE business, so Cami's own fee
   * invoice is a tax invoice (INV-P9, T3-8).
   */
  vatMinor: number
}

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function periodLabel(key: string): string {
  const [year, month] = key.split("-")
  return `${MONTH_LONG[Number(month) - 1]} ${year}`
}

/** The 3rd of the following month, matching the benchmark's issue cadence. */
function availableOn(key: string): string {
  const [year, month] = key.split("-").map(Number)
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  return `${next.y}-${String(next.m).padStart(2, "0")}-03`
}

function lineOf(tx: MoneyTx, base: MoneyTx | undefined): FeeLine {
  const usage = tx.kind === "messaging"
  const rate = tx.rateSnapshot ?? null

  return {
    id: tx.id,
    at: tx.at,
    rail: tx.rail,
    baseAmountMinor: base?.amountMinor ?? 0,
    feeMinor: Math.abs(tx.amountMinor),
    rate,
    // No rate on a usage charge: messaging is billed per send, not as a
    // percentage of anything. Saying "0%" would be worse than saying nothing.
    rateLabel: usage ? "Per message" : rate ? formatRate(rate) : "—",
    reference: tx.reference,
    usage,
    description: usage
      ? (tx.note ?? "Messaging and add-on usage")
      : tx.rail === "terminal"
        ? "Card machine payment"
        : "Online payment",
  }
}

/**
 * Group every fee into the month it belongs to, newest first (T3-1).
 *
 * `todayIso` decides which period is still open. The current month is `pending`
 * — fees are still accruing, so issuing a document would issue a wrong one
 * (T3-3). Fresha does this well and it is copied deliberately.
 */
export function feePeriods(txs: ReadonlyArray<MoneyTx>, todayIso: string): FeePeriod[] {
  const currentKey = todayIso.slice(0, 7)
  const byId = new Map(txs.map((t) => [t.id, t]))
  const buckets = new Map<string, FeeLine[]>()

  for (const tx of txs) {
    if (tx.kind !== "cami-fee" && tx.kind !== "messaging") continue
    const key = tx.at.slice(0, 7)
    const line = lineOf(tx, byId.get(tx.causedByTxId ?? ""))
    const bucket = buckets.get(key)
    if (bucket) bucket.push(line)
    else buckets.set(key, [line])
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, lines]) => {
      const sorted = [...lines].sort((a, b) => (a.at < b.at ? 1 : -1))
      const feeTotalMinor = sorted.reduce((sum, l) => sum + l.feeMinor, 0)
      const usageMinor = sorted.filter((l) => l.usage).reduce((sum, l) => sum + l.feeMinor, 0)

      return {
        key,
        label: periodLabel(key),
        status: key === currentKey ? ("pending" as const) : ("available" as const),
        availableOnIso: key === currentKey ? availableOn(key) : undefined,
        lines: sorted,
        feeTotalMinor,
        processingMinor: feeTotalMinor - usageMinor,
        usageMinor,
        byRail: {
          online: sorted.filter((l) => l.rail === "online").reduce((sum, l) => sum + l.feeMinor, 0),
          terminal: sorted
            .filter((l) => l.rail === "terminal")
            .reduce((sum, l) => sum + l.feeMinor, 0),
        },
        // Derived from a tax-inclusive figure, never appended (06 §4).
        vatMinor: vatOf(feeTotalMinor, VAT_RATE),
      }
    })
    .filter((period) => period.lines.length > 0 || period.status === "pending")
}

/**
 * Re-derive a fee from its snapshotted rate, so the screen can show the working
 * (`3% of AED 120.00 + AED 0.75`) rather than a number the merchant has to take
 * on faith (`JOB-OWN-PAY2`).
 *
 * Returns null when there is nothing to show working for — a usage charge is
 * not a percentage of anything.
 */
export function explainFeeLine(line: FeeLine): string | null {
  if (line.usage || !line.rate || line.baseAmountMinor === 0) return null
  const { fixedApplied } = computeFee(line.rate, line.baseAmountMinor)
  const pct = `${line.rate.percent}% of ${(line.baseAmountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  if (!fixedApplied) return pct
  return `${pct} + ${(line.rate.fixedMinor / 100).toFixed(2)}`
}
