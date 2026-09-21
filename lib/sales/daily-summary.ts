/**
 * The end-of-day view, per branch and as a business total (R09, R18, RP-A1).
 *
 * ## Why this is derived rather than drawn
 *
 * This is the PRD's first user story — "an EOD view per branch and a business
 * total in one place, so I stop calling each location" — and the one BG-05
 * times. The page was two cards of figures typed to match a Figma frame, with
 * no branch anywhere on it: the owner of nine branches got one merged number,
 * which is the outcome the story names as the failure ("a single number
 * destroys the job").
 *
 * Two static cards could have had a third, derived one bolted beside them, and
 * that is the defect DSG-73 exists to avoid: a headline and a breakdown from
 * two different sources, disagreeing in front of the person reconciling a till.
 * So the whole page comes from the sales log instead, and the breakdown is the
 * same arithmetic as the total.
 *
 * ## Bounded before it sums
 *
 * `allowed` bounds the rows before anything is added up (G7, R18), so a manager
 * granted one branch reads their own day, correctly labelled as theirs, rather
 * than a business figure built from branches they cannot open.
 *
 * ## What has no source, and says so
 *
 * The built summary carries rows this prototype's `Sale` has no field for —
 * products, add-ons, shipping, memberships, late-cancellation and no-show fees.
 * They stay in the table at zero rather than being dropped: an operator who
 * knows the shape of this report reads a missing row as a broken report, and
 * "we took nothing in add-ons today" is a different statement from "add-ons are
 * not counted here".
 */

import type { Sale } from "@/app/sales/sales-list/page"

/** A day in the branch's own calendar, as `YYYY-MM-DD`. */
export function dayIso(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

export type TransactionRow = {
  label: string
  salesQty: number
  refundQty: number
  grossMinor: number
}

export type CashRow = {
  label: string
  collectedMinor: number
  refundedMinor: number
  emphasis?: boolean
}

export type LocationDay = {
  locationId: string
  salesQty: number
  refundQty: number
  grossMinor: number
  tipsMinor: number
}

export type DailySummary = {
  transactions: TransactionRow[]
  transactionTotal: Omit<TransactionRow, "label">
  /**
   * Sold, not earned.
   *
   * Confirmed against the built summary (`DailySummaryPage.tsx` in
   * cami-business): "gift cards sold are a liability (deferred revenue) — shown
   * separately, not included in the Total Sales row." Our first cut counted
   * them as takings, which overstates the day by the face value of every card
   * sold and makes the till disagree with the books at month close. The money
   * is real and already in the drawer; the *revenue* arrives when the card is
   * redeemed, at whichever branch does the work.
   */
  giftCardsSold: Omit<TransactionRow, "label">
  cash: CashRow[]
  /** One row per granted branch that traded, biggest first. */
  byLocation: LocationDay[]
  /** Granted branches that took nothing today — named, never dropped. */
  quietLocations: string[]
  /** Summed from `byLocation`, never stored separately. */
  rollUpMinor: number
}

/** A sale that took money, as opposed to one that gave it back or was voided. */
function isTaking(sale: Sale): boolean {
  return sale.status !== "refunded" && sale.status !== "voided"
}

export function summarizeDay(
  sales: ReadonlyArray<Sale>,
  day: string,
  /** The caller's granted branch ids. The result never exceeds this (R18). */
  allowed: ReadonlyArray<string>,
): DailySummary {
  const allowedSet = new Set(allowed)
  const rows = sales.filter((s) => allowedSet.has(s.locationId) && dayIso(s.saleAt) === day)

  const giftCards = rows.filter((s) => s.giftCard && isTaking(s))
  const services = rows.filter((s) => !s.giftCard && isTaking(s))
  const refunds = rows.filter((s) => s.status === "refunded")
  const refundedMinor = refunds.reduce((sum, s) => sum + Math.abs(s.grossMinor), 0)

  const transactions: TransactionRow[] = [
    {
      label: "Services",
      salesQty: services.length,
      refundQty: 0,
      grossMinor: services.reduce((sum, s) => sum + s.grossMinor, 0),
    },
    // No field on `Sale` carries these yet. Kept at zero rather than dropped —
    // see the note at the top of this file.
    { label: "Service add-ons", salesQty: 0, refundQty: 0, grossMinor: 0 },
    { label: "Products", salesQty: 0, refundQty: 0, grossMinor: 0 },
    { label: "Shipping", salesQty: 0, refundQty: 0, grossMinor: 0 },
    { label: "Memberships", salesQty: 0, refundQty: 0, grossMinor: 0 },
    { label: "Late cancellation fees", salesQty: 0, refundQty: 0, grossMinor: 0 },
    { label: "No-show fees", salesQty: 0, refundQty: 0, grossMinor: 0 },
    {
      label: "Refund amount",
      salesQty: 0,
      refundQty: refunds.length,
      grossMinor: -refundedMinor,
    },
  ]

  const giftCardsSold = {
    salesQty: giftCards.length,
    refundQty: 0,
    grossMinor: giftCards.reduce((sum, s) => sum + s.grossMinor, 0),
  }

  const transactionTotal = transactions.reduce(
    (acc, row) => ({
      salesQty: acc.salesQty + row.salesQty,
      refundQty: acc.refundQty + row.refundQty,
      grossMinor: acc.grossMinor + row.grossMinor,
    }),
    { salesQty: 0, refundQty: 0, grossMinor: 0 },
  )

  // Settled means the money is in the drawer. An unpaid sale is a transaction
  // that happened and cash that did not move, which is the whole reason these
  // are two cards rather than one.
  const settled = rows.filter((s) => s.status === "completed" || s.status === "part-paid")
  const card = settled.filter((s) => s.camipay)
  const cashTaken = settled.filter((s) => !s.camipay)
  const collectedMinor = settled.reduce((sum, s) => sum + s.grossMinor + s.tipsMinor, 0)
  const refundedCashMinor = refunds
    .filter((s) => !s.camipay)
    .reduce((sum, s) => sum + Math.abs(s.grossMinor), 0)
  const refundedCardMinor = refunds
    .filter((s) => s.camipay)
    .reduce((sum, s) => sum + Math.abs(s.grossMinor), 0)

  const cash: CashRow[] = [
    {
      label: "Cash",
      collectedMinor: cashTaken.reduce((sum, s) => sum + s.grossMinor + s.tipsMinor, 0),
      refundedMinor: -refundedCashMinor,
    },
    {
      label: "Card",
      collectedMinor: card.reduce((sum, s) => sum + s.grossMinor + s.tipsMinor, 0),
      refundedMinor: -refundedCardMinor,
    },
    { label: "Gift card redemptions", collectedMinor: 0, refundedMinor: 0 },
    {
      label: "Payments collected",
      collectedMinor,
      refundedMinor: -refundedMinor,
      emphasis: true,
    },
    {
      label: "Of which tips",
      collectedMinor: settled.reduce((sum, s) => sum + s.tipsMinor, 0),
      refundedMinor: 0,
    },
  ]

  // Side by side, never merged (KH1.1). The question an owner brings to this
  // screen is which branch had a bad day, and a total cannot answer it.
  const byLocation: LocationDay[] = []
  for (const id of allowed) {
    const mine = rows.filter((s) => s.locationId === id)
    if (mine.length === 0) continue
    byLocation.push({
      locationId: id,
      salesQty: mine.filter(isTaking).length,
      refundQty: mine.filter((s) => s.status === "refunded").length,
      // Takings, so a gift card sold here is excluded for the same reason it
      // is excluded from Total Sales — otherwise the branch rows and the total
      // are counting two different things and only one of them is revenue.
      grossMinor: mine.reduce((sum, s) => {
        if (s.giftCard && isTaking(s)) return sum
        return sum + (s.status === "refunded" ? -Math.abs(s.grossMinor) : s.grossMinor)
      }, 0),
      tipsMinor: mine.reduce((sum, s) => sum + s.tipsMinor, 0),
    })
  }
  byLocation.sort((a, b) => b.grossMinor - a.grossMinor)

  return {
    transactions,
    transactionTotal,
    giftCardsSold,
    cash,
    byLocation,
    // "Nothing at Al Quoz today" and "Al Quoz is missing from this report" are
    // different answers, and an owner needs the first.
    quietLocations: allowed.filter((id) => !byLocation.some((r) => r.locationId === id)),
    rollUpMinor: byLocation.reduce((sum, r) => sum + r.grossMinor, 0),
  }
}

/**
 * The most recent day this scope actually traded.
 *
 * The page opened on today, and the seeded log's last sale is months back, so
 * every reviewer met an empty report and no way to tell an empty day from a
 * broken one. Picking the latest day with takings inside the grant means a
 * manager and an owner can land on different days — which is correct: it is
 * each of their own last trading day.
 */
export function latestTradingDay(
  sales: ReadonlyArray<Sale>,
  allowed: ReadonlyArray<string>,
): Date | null {
  const allowedSet = new Set(allowed)
  const mine = sales.filter((s) => allowedSet.has(s.locationId))
  if (mine.length === 0) return null
  return mine.reduce((latest, s) => (s.saleAt > latest ? s.saleAt : latest), mine[0]!.saleAt)
}
