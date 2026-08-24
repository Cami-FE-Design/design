// Cami's own tax invoice for a fee period — DSG-76 T3-2, T3-8.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// This is the one document in the product where Cami is the SUPPLIER and the
// merchant is the customer. Cami charges a UAE business, so it is a tax invoice
// and it carries VAT (INV-P9) — the merchant reclaims that VAT, so getting it
// wrong costs them money, not just tidiness.
//
// It renders through the DSG-72 invoice document rather than a second renderer.
// Two documents claiming to be tax invoices with different layouts and different
// rounding is exactly the drift that spec §2.1 is about, one level up.
//
// Note what is NOT on it: any subscription or plan line. The OS is free
// (INV-P4, ADR-001), and a slot for it here would be the first place one
// appeared.

import type { InvoiceDocument, InvoiceLine } from "@/lib/invoice/types"
import type { FeePeriod } from "./fees"

/** Cami's own legal identity as the supplier of the fee. */
export const CAMI_ISSUER = {
  legalName: "Cami Technologies FZ-LLC",
  tradingName: "Cami",
  addressLines: ["Office 1204, Boulevard Plaza Tower 1", "Downtown Dubai", "Dubai, UAE"],
  trn: "100482913700003",
  email: "billing@getcami.com",
} as const

export type FeeInvoiceRecipient = {
  legalName: string
  addressLines: ReadonlyArray<string>
  /** Absent → the merchant cannot reclaim the VAT, and the screen has to say so. */
  trn?: string
}

/**
 * Build the tax invoice for one closed fee period.
 *
 * The lines are the STATEMENT's subtotals, not one line per fee: a month with
 * 400 fees produces a 400-page invoice otherwise, and the itemisation already
 * exists as the downloadable fee activity (T3-2). Both documents come from the
 * same `FeePeriod`, so they cannot disagree about the total.
 */
export function feeInvoiceOf(
  period: FeePeriod,
  recipient: FeeInvoiceRecipient,
  options: { number: string; issuedAtIso: string },
): InvoiceDocument {
  const lines: InvoiceLine[] = []

  // Processing margin per rail, then usage — NOT `period.byRail`, which counts
  // usage inside whichever rail it was billed on. Adding usage on top of that
  // would invoice it twice, and the two documents for the period would disagree
  // about what the merchant owes.
  const processing = (rail: "online" | "terminal") =>
    period.lines.filter((l) => !l.usage && l.rail === rail).reduce((sum, l) => sum + l.feeMinor, 0)

  const online = processing("online")
  const terminal = processing("terminal")

  if (online > 0) lines.push(feeLine("fee-online", "Cami fee — online payments", online))
  if (terminal > 0) {
    lines.push(feeLine("fee-terminal", "Cami fee — card machine payments", terminal))
  }
  if (period.usageMinor > 0) {
    lines.push(feeLine("fee-usage", "Messaging and add-on usage", period.usageMinor))
  }

  return {
    kind: "invoice",
    // Full, not simplified: the recipient is a registered business and needs
    // the supplier's TRN and its own on the document to reclaim the VAT.
    type: recipient.trn ? "tax-full" : "tax-simplified",
    status: "completed",
    number: options.number,
    issuedAt: new Date(options.issuedAtIso),
    issuer: { ...CAMI_ISSUER, addressLines: [...CAMI_ISSUER.addressLines] },
    recipient: {
      name: recipient.legalName,
      addressLines: recipient.addressLines,
      trn: recipient.trn,
    },
    lines,
    // Already collected — deducted before the payout went out, which is the
    // point of showing this as settled rather than as a bill to pay.
    tenders: [
      {
        id: "t-deducted",
        method: "Deducted from your payouts",
        amountMinor: period.feeTotalMinor,
        at: new Date(options.issuedAtIso),
      },
    ],
    // Always present, always zero here. Cami's fee has no tip, and the field is
    // what keeps `Total (incl. VAT)` and `Amount due` as two rows (EC-39).
    tipMinor: 0,
    vatRate: 0.05,
    footerNote: `Fees for ${period.label}. The itemised breakdown is available as a separate download.`,
  }
}

/** Fee amounts are stored VAT-inclusive, like every other price in Cami (06 §4). */
function feeLine(id: string, description: string, grossMinor: number): InvoiceLine {
  return {
    id,
    description,
    qty: 1,
    unitGrossMinor: grossMinor,
    lineGrossMinor: grossMinor,
    taxable: true,
  }
}
