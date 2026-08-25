// Billing details — DSG-74.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The merchant's legal identity, held once, so every document Cami stamps with
// it is stamped correctly: their own tax invoices to clients (DSG-72), Cami's
// fee invoice to them (DSG-76), and their payout documents.
//
// Today those values are a hardcoded constant in lib/invoice/from-sale.ts,
// carrying a comment that says PRD-9 owns the fields. This module is that owner,
// in the shape the invoice document already needs — see `issuerFrom`.
//
// Two rules, and the second is the one that makes this a money record rather
// than a settings form:
//
//   1. A MISSING TRN IS A STATE, NOT A BLANK (T1-1). Without one, the business
//      cannot issue a compliant tax invoice, so the screen says that rather than
//      rendering an empty row.
//   2. CHANGES APPLY FORWARD ONLY (T1-5, INV-01, INV-12). A document already
//      issued keeps the values it was stamped with. Editing this record must
//      never restate a document a client is holding.

import { type AddressParts, addressToLines, EMPTY_ADDRESS, isAddressEmpty } from "@/lib/address"
import type { InvoiceIssuer } from "@/lib/invoice/types"

export type BusinessType = "company" | "sole-establishment" | "freelancer"

export const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  company: "Company (L.L.C.)",
  "sole-establishment": "Sole establishment",
  freelancer: "Freelance permit",
}

export type BillingDetails = {
  businessType: BusinessType
  /** The registered legal entity name, not the trading name. */
  legalName: string
  /** Trading name, when it differs. Shown under the legal name on documents. */
  tradingName?: string
  /**
   * Tax Registration Number. Absent → documents fall back to a plain invoice
   * with no tax wording anywhere (DSG-72 §2.2), which is a real consequence and
   * not a cosmetic gap.
   */
  trn?: string
  /**
   * Registered address, structured rather than pre-rendered. The document wants
   * lines and gets them from `addressToLines`, but the record has to keep the
   * parts: a line array cannot be searched, prefilled from a places result, or
   * asked what city it is in.
   */
  address: AddressParts
  /** INV-08: who last changed the legal identity, and when. */
  updatedAtIso: string
  updatedBy: string
}

/** What is missing, in the order the screen should ask for it. */
export function missingFields(details: BillingDetails): string[] {
  const missing: string[] = []
  if (!details.legalName.trim()) missing.push("Legal name")
  if (!details.trn?.trim()) missing.push("TRN")
  if (isAddressEmpty(details.address)) missing.push("Registered address")
  return missing
}

/**
 * Whether the business can issue a compliant TAX invoice.
 *
 * A business with no TRN is not broken — it is simply not VAT-registered, and
 * its documents are plain invoices. The screen has to carry that difference
 * without implying the merchant did something wrong.
 */
export function canIssueTaxInvoice(details: BillingDetails): boolean {
  return Boolean(details.trn?.trim()) && !isAddressEmpty(details.address)
}

/**
 * The shape the invoice document needs (DSG-72 §4 block 2).
 *
 * This is the wiring point: today `from-sale.ts` holds these values as a
 * constant. Passing them through here instead is what makes a settings edit
 * reach a document — forward only, because the document snapshots what it was
 * given at issue and never reads back.
 */
export function issuerFrom(details: BillingDetails): InvoiceIssuer {
  return {
    legalName: details.legalName,
    tradingName: details.tradingName,
    addressLines: addressToLines(details.address),
    trn: details.trn,
  }
}

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

export const DEMO_BILLING_DETAILS: BillingDetails = {
  businessType: "company",
  legalName: "Shampooch Pet Grooming L.L.C",
  tradingName: "Shampooch JVC",
  trn: "104169608700003",
  address: {
    line: "Regina Tower, Jumeirah Village Circle\nAl Barsha South\nDubai",
    postcode: "",
    country: "United Arab Emirates",
  },
  updatedAtIso: "2026-03-04T09:20:00Z",
  updatedBy: "Omar Haddad",
}

/** The state that blocks a compliant tax invoice (T1-1, states list). */
export const DEMO_BILLING_DETAILS_NO_TRN: BillingDetails = {
  ...DEMO_BILLING_DETAILS,
  trn: undefined,
}

/** A business that has barely started — everything explicit, nothing blank. */
export const DEMO_BILLING_DETAILS_EMPTY: BillingDetails = {
  businessType: "sole-establishment",
  legalName: "",
  trn: undefined,
  address: EMPTY_ADDRESS,
  updatedAtIso: "2026-08-20T08:00:00Z",
  updatedBy: "Omar Haddad",
}
