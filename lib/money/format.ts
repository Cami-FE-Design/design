// Display rules for the merchant money surfaces (DSG-73 §3, G1/G3/G7).
//
// These live here rather than in lib/format.ts on purpose. That file's
// `formatAed` takes WHOLE AED and is what the Reporting module renders; money
// surfaces work in fils and must always show two decimals. Two functions with
// the same name and different units is how a figure quietly loses its fils, so
// the money one is named for what it does and kept next to the model it serves.

import { formatDate } from "@/lib/format"
import type {
  CamiPayRail,
  Custodian,
  MoneyTx,
  MoneyTxKind,
  PayoutStatus,
  SettlementBlock,
} from "./types"
import { custodianLabel, custodianOf } from "./types"

const CURRENCY = "AED"

/**
 * `AED 1,464.09` · `- AED 1,464.09` · `AED 0.00`.
 *
 * Two decimals always — money never trims. Negatives take a leading minus and
 * never parentheses: an accountant reads `(1,464.09)` as a convention, a salon
 * owner reads it as a footnote (G7).
 */
export function formatMoney(minor: number): string {
  const body = `${CURRENCY} ${(Math.abs(minor) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  return minor < 0 ? `- ${body}` : body
}

/** Direction, so a row can be read without parsing the sign (T5-2). */
export function txDirection(tx: MoneyTx): "in" | "out" {
  return tx.amountMinor < 0 ? "out" : "in"
}

const KIND_LABEL: Record<MoneyTxKind, string> = {
  sale: "Sale",
  deposit: "Deposit",
  tip: "Tip",
  refund: "Refund",
  // "Take" and "processing margin" are BRD words. The merchant sees one term.
  "cami-fee": "Cami fee",
  messaging: "Messaging",
  adjustment: "Adjustment",
  payout: "Payout",
}

export function txKindLabel(kind: MoneyTxKind): string {
  return KIND_LABEL[kind]
}

/**
 * Who holds this money, in words. Never inferred from context — with two
 * custodians, "arriving Thursday" means nothing until you know who is sending
 * it (G3).
 */
export function custodianSentence(custodian: Custodian): string {
  return custodian === "cami"
    ? "Held by Cami, paid to your bank by Cami"
    : "Held by NeoPay, paid to your bank by NeoPay"
}

/**
 * The headline's scope, in words (G1). The figure never renders as a bare
 * "Balance" — it says what it is, who has it, and when it leaves.
 */
export function heldHeadline(custodian: Custodian, arrivesAtIso?: string): string {
  const who = custodianLabel(custodian)
  if (!arrivesAtIso) return `Held by ${who}, no payout scheduled yet`
  return `Held by ${who}, arriving ${formatDate(arrivesAtIso)}`
}

const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  paid: "Paid",
  "in-transit": "On the way to your bank",
  failed: "Did not arrive",
  // Skipped is not failed. This copy carries no alarm because nothing is wrong
  // — the money rolled forward and will go out next time (SET-X9).
  "held-below-minimum": "Rolled forward",
}

export function payoutStatusLabel(status: PayoutStatus): string {
  return PAYOUT_STATUS_LABEL[status]
}

/**
 * Why nothing is arriving. Each of these is a banner on the account summary
 * (T4-9), and only two of the four are a problem — the copy has to carry that
 * difference, since a merchant who reads "rolled forward" as an error calls
 * support about money that is fine.
 */
export function settlementBlockCopy(block: SettlementBlock): {
  tone: "warning" | "info"
  title: string
  body: string
} {
  switch (block) {
    case "destination-unverified":
      return {
        tone: "warning",
        title: "Payouts are paused",
        // Never falls back to the old account (SET-B4) — say so, because the
        // merchant's reasonable assumption is that it would.
        body: "Your new bank account has not been verified yet. Payouts stay paused until it is, and they will not be sent to your previous account.",
      }
    case "verification-pending":
      return {
        tone: "info",
        title: "Verifying your bank account",
        body: "Payouts resume as soon as verification finishes.",
      }
    case "not-settle-ready":
      return {
        tone: "warning",
        title: "You are not set up to be paid yet",
        body: "Cami is holding this money. Finish your payout setup and it goes out on the next run.",
      }
    case "below-minimum":
      return {
        tone: "info",
        title: "Rolled forward to the next payout",
        body: "This balance is under your minimum payout amount, so nothing was sent. It goes out with the next one.",
      }
  }
}

/**
 * What the figure counts, and — the part Fresha omits — what it does not
 * (T4-8, SET-D7). Cash and off-rail money are the majority of a lot of
 * merchants' takings, so a card-only figure that does not say so is misread.
 */
export const SCOPE_STATEMENT =
  "Card payments taken through Cami only. Cash and payments taken outside Cami are not included."

/** `Today` · `Yesterday` · `15 Aug 2026`. Anchor passed in, never read from the clock. */
export function formatDayHeading(dayIso: string, todayIso: string): string {
  if (dayIso === todayIso) return "Today"
  const yesterday = new Date(`${todayIso}T00:00:00Z`)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  if (dayIso === yesterday.toISOString().slice(0, 10)) return "Yesterday"
  return formatDate(`${dayIso}T00:00:00Z`)
}

/* -------------------------------------------------------------------------- */
/* Transaction detail                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Where the money came from and where it went (T5-4).
 *
 * Fresha's detail modal carries a From/To pair and it does the right job by
 * accident — with one wallet there is only ever one answer. Cami has two
 * custodians, so "To: Cami" and "To: NeoPay" are different facts and the pair
 * has to be derived from the rail rather than hardcoded (G3, T5-5).
 */
export function fromToOf(
  tx: MoneyTx,
  businessName: string,
  destinationLast4?: string,
): { from: string; to: string } {
  const who = custodianLabel(custodianOf(tx.rail))

  switch (tx.kind) {
    case "sale":
    case "deposit":
    case "tip":
      return { from: tx.client ?? "Client", to: who }
    case "refund":
      return { from: who, to: tx.client ?? "Client" }
    case "cami-fee":
    case "messaging":
      // The one direction where the merchant is paying rather than being paid.
      return { from: businessName, to: "Cami" }
    case "payout":
      return {
        from: who,
        to: destinationLast4 ? `Your bank •••• ${destinationLast4}` : "Your bank",
      }
    case "adjustment":
      // Money coming back to the merchant — a returned payout comes back from
      // whoever tried to send it, and a correction from whoever holds the rail.
      return { from: who, to: businessName }
  }
}

/**
 * How the payment was taken. Named for the merchant's world, not the rail id:
 * they know "at the counter" and "online", not "terminal" and "online".
 */
export function channelLabel(rail: CamiPayRail): string {
  return rail === "terminal" ? "In person, at the counter" : "Online"
}

/** `August 2026` — the billing period a fee or payout belongs to. */
export function billingPeriodOf(isoTimestamp: string): string {
  const d = new Date(isoTimestamp)
  return `${MONTH_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`
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

/**
 * Terminal Phase 1 trusts a device report, so some terminal money is real
 * enough to show and not yet confirmed by the gateway (SET-C9, ADR-014, T5-10).
 * Confirmed rows say nothing — a badge on every row teaches the merchant to
 * ignore badges.
 */
export function confirmationNote(tx: MoneyTx): string | null {
  if (tx.confirmation === "confirmed") return null
  return `Reported by the card machine. ${custodianLabel(custodianOf(tx.rail))} has not confirmed it yet.`
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `2026-08-24` from a Date, read in LOCAL time.
 *
 * The ledger is keyed by day strings and the date picker hands back Date
 * objects. Going through UTC here would move a range by a day for anyone west
 * of Greenwich, which on a month boundary silently drops a day's takings out of
 * the period.
 */
export function toDayIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** The inverse, also local. */
export function fromDayIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}
