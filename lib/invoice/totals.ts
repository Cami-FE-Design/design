// Money derivation for the invoice document (DSG-72 §3).
//
// Every rule here implements a clause of the Money Composition Contract. The
// short version, because getting any of it wrong is a compliance defect:
//
//   1. Prices are stored VAT-INCLUSIVE. VAT is derived, never appended (06 §4).
//   2. VAT = gross × rate / (1 + rate), rounded once PER LINE, half-up
//      (06 §7, INV-M2). Never round at subtotal, never round twice.
//   3. Taxable gross and amount due are DIFFERENT figures whenever a tip
//      exists, and both always render — even when equal. Collapsing them when
//      they match is exactly how EC-39 comes back.
//   4. Tip is outside the VAT base (INV-M5).
//   5. Gift cards carry no VAT at issuance (INV-P8) — a non-taxable line
//      removes the VAT row, it does not render a zero.
//   6. Change due is not a payment (INV-M4).

import { VAT_RATE } from "@/app/sales/new-sale/mock"
import type { InvoiceDocument, InvoiceLine } from "./types"

export { VAT_RATE }

const CURRENCY = "AED"

/**
 * Half-up rounding on the MAGNITUDE, sign reapplied.
 *
 * `Math.round` breaks ties toward +∞, so `Math.round(-0.5)` is `-0`. On a credit
 * note that means a refunded line could reverse one fils less VAT than the
 * invoice charged, and the two documents would not cancel. Rounding the
 * magnitude makes the reversal exact by construction (§3.2).
 */
function roundHalfUp(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value))
}

/**
 * VAT contained in a tax-inclusive gross. The "of which" figure, not an
 * addition: `220 × 5/105 = 10.48`.
 */
export function vatOf(grossMinor: number, rate: number): number {
  return roundHalfUp((grossMinor * rate) / (1 + rate))
}

/** VAT on one line. Zero — and structurally absent — for non-taxable lines. */
export function lineVat(line: InvoiceLine, rate: number): number {
  if (!line.taxable) return 0
  return vatOf(line.lineGrossMinor, rate)
}

/** Pre-discount gross for a line, used by `Items total (excl. discounts)`. */
export function lineItemsTotal(line: InvoiceLine): number {
  const unit = line.originalUnitGrossMinor ?? line.unitGrossMinor
  return unit * line.qty
}

export type InvoiceTotals = {
  /** Σ line gross BEFORE any discount, tax-inclusive. Live label. */
  itemsTotalMinor: number
  /** Cart-level discount. Hides at zero. */
  cartDiscountMinor: number
  /** Total − VAT. Labelled "Subtotal (excl. VAT)" to kill the vocabulary collision (§3.1). */
  subtotalExVatMinor: number
  /** Σ per-line VAT. Rounded per line, never at this level. */
  vatMinor: number
  /** Taxable gross — what the reference calls "Total". Always renders. */
  totalInclVatMinor: number
  /** Outside the VAT base. */
  tipMinor: number
  /** Taxable gross + tip. Always renders, even when equal to totalInclVat. */
  amountDueMinor: number
  /** Σ tenders, excluding change. */
  collectedMinor: number
  /** Cash overtender handed back. Not collected. */
  changeMinor: number
  /** Amount due − collected. Load-bearing: this IS the payment-state signal. */
  balanceMinor: number
  /**
   * Whether any tax wording appears at all. False on a `plain` (no-TRN)
   * document and on an all-gift-card sale — in both cases the VAT row, the
   * tax columns, and the `(excl./incl. VAT)` qualifiers are absent, not zeroed.
   */
  showTax: boolean
}

export function invoiceTotals(doc: InvoiceDocument): InvoiceTotals {
  const rate = doc.vatRate

  const itemsTotalMinor = doc.lines.reduce((sum, l) => sum + lineItemsTotal(l), 0)
  const cartDiscountMinor = doc.cartDiscount?.amountMinor ?? 0

  // The document total is every line's ALLOCATED gross — including non-taxable
  // gift card lines, which count toward what is owed but not toward the tax base.
  const totalInclVatMinor = doc.lines.reduce((sum, l) => sum + l.lineGrossMinor, 0)

  // Per-line, then summed. A gift-card-only invoice sums to zero here, which is
  // why `Subtotal` and `Total` are equal on one — matching the reference (§0.3).
  const vatMinor = doc.lines.reduce((sum, l) => sum + lineVat(l, rate), 0)

  const subtotalExVatMinor = totalInclVatMinor - vatMinor
  const amountDueMinor = totalInclVatMinor + doc.tipMinor

  // A cash tender row shows what was handed over, which on an overtender is more
  // than the bill. Change is what went back across the counter, so it REDUCES
  // collected rather than sitting beside it — otherwise a AED 500 note against a
  // AED 450 bill reads as 500 collected and a negative balance. Change due is not
  // a payment (§3, INV-M4).
  const changeMinor = doc.tenders
    .filter((t) => t.isChange)
    .reduce((sum, t) => sum + t.amountMinor, 0)
  const tenderedMinor = doc.tenders
    .filter((t) => !t.isChange)
    .reduce((sum, t) => sum + t.amountMinor, 0)
  const collectedMinor = tenderedMinor - changeMinor

  return {
    itemsTotalMinor,
    cartDiscountMinor,
    subtotalExVatMinor,
    vatMinor,
    totalInclVatMinor,
    tipMinor: doc.tipMinor,
    amountDueMinor,
    collectedMinor,
    changeMinor,
    balanceMinor: amountDueMinor - collectedMinor,
    showTax: doc.type !== "plain" && doc.lines.some((l) => l.taxable),
  }
}

// ─── Document type gate ───────────────────────────────────────────────────────

/**
 * The words at the top of the page. "Tax Invoice" needs a TRN; a refund is a
 * credit note and never a negative tax invoice (§2.2, INV-04).
 */
export function documentTitle(doc: InvoiceDocument): string {
  if (doc.kind === "credit-note") return "Credit Note"
  return doc.type === "plain" ? "Invoice" : "Tax Invoice"
}

/**
 * Whether per-line tax rate + tax amount columns render. Required on a full tax
 * invoice, optional on a simplified one, and absent on a plain invoice (§2.1).
 *
 * We show them whenever tax exists: the simplified form is a subset of the full
 * one, so the superset is always sufficient (§2.1 recommendation).
 */
export function showsLineTaxColumns(doc: InvoiceDocument): boolean {
  return doc.type !== "plain" && doc.lines.some((l) => l.taxable)
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Always two decimals on this document — an invoice never shows a rounded
 * whole. Negatives use a true minus sign, not a hyphen, so a credit note reads
 * correctly at print size.
 */
export function formatInvoiceAmount(minor: number): string {
  const abs = Math.abs(minor) / 100
  const body = `${CURRENCY} ${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  return minor < 0 ? `− ${body}` : body
}

/** "5%" — the rate as it appears in the `VAT 5%` label and the tax column. */
export function formatVatRate(rate: number): string {
  return `${(rate * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`
}
