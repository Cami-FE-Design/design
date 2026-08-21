// Fixture data for the invoice document screens (DSG-72 §5).
//
// The five base fixtures are the Fresha reference documents from SOTA, digit for
// digit — see docs/specs/assets/. That is deliberate (§5): the screens are meant
// to be comparable to a real document side by side, so the demo shows salon
// services rather than pet grooming. The numbers are the point, not the nouns.
//
// Every derived figure in these fixtures has been checked against the reference
// PDFs: 450 → VAT 21.43, 2,375 → 113.10, 200 → 9.52, gift card → no VAT row.
// If a change here breaks one of those, the change is wrong.
//
// Transcribed from the reference documents field for field — amounts, dates,
// line descriptions, document numbers, and the contact details too. The point of
// §5 is that a reviewer can hold the PDF in docs/specs/assets next to the screen
// and see the same document, and a mismatched phone number breaks that read.
//
// The variant fixtures below the five (tip, zero-value, full type, plain type,
// overflow, multi-page, overtender) are Cami-side states with no reference
// document — every Cami state except Completed is unsampled (§0.5).

import type { InvoiceDocument, InvoiceIssuer, InvoiceLine, InvoiceRecipient } from "./types"

// ─── Issuers ──────────────────────────────────────────────────────────────────

/**
 * SOTA as it appears on the reference documents. The address is pinned to the
 * shorter of the two strings Fresha emits — it drifts between their documents,
 * and a registered address is a legal field that must not (§0.4 gap 15).
 */
const SOTA: InvoiceIssuer = {
  legalName: "Sota Salon",
  addressLines: ["Sota Salon, Regina Tower", "Dubai, دبي"],
  trn: "104169608700003",
  phone: "+971 4 451 7989",
}

/** Same business with a logo, so the logo slot is exercised at all (§0.5). */
const SOTA_WITH_LOGO: InvoiceIssuer = {
  ...SOTA,
  logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Sota%20Salon&backgroundColor=1f2937",
}

/** No TRN → document type is `plain`, and no tax wording renders anywhere (§2.1). */
const SOTA_NO_TRN: InvoiceIssuer = {
  legalName: "Sota Salon",
  addressLines: ["Sota Salon, Regina Tower", "Dubai, دبي"],
  phone: "+971 4 451 7989",
}

/** Overflow case: the name must wrap to two lines max and never reach the meta block (§5). */
const LONG_NAME_ISSUER: InvoiceIssuer = {
  legalName:
    "Sota Salon & Aesthetic Wellness Centre for Hair, Skin and Nail Care (Regina Tower Branch) L.L.C.",
  addressLines: ["Regina Tower, Al Barsha Road", "Al Barsha 1, Dubai, دبي"],
  trn: "104169608700003",
  phone: "+971 4 451 7989",
}

// ─── Recipients ───────────────────────────────────────────────────────────────

const EVGENIA: InvoiceRecipient = {
  name: "Evgenia Nemirova",
  email: "srsbyv8vt7@privaterelay.appleid.com",
  phone: "+971 54 371 7179",
}

const REEM: InvoiceRecipient = {
  name: "Reem Alsuwaidi",
  email: "reem.57@hotmail.com",
  phone: "+971 55 997 3303",
}

/**
 * The emoji is not decoration — it is the fixture for §0.4 gap 16. Merchants use
 * ⭐ as a VIP marker and Fresha renders it as tofu on a legal document.
 */
const KELSEY: InvoiceRecipient = {
  name: "Kelsey Stratford ⭐️",
  phone: "+971 55 152 0010",
}

const MAAZ: InvoiceRecipient = { name: "Maaz Test You", phone: "+971 50 963 6445" }

const SUMMER: InvoiceRecipient = { name: "Summer", phone: "+971 55 512 1493" }

/** Name only — the block collapses to a single line, no empty address/TRN rows (§5). */
const NAME_ONLY: InvoiceRecipient = { name: "Walk-in client" }

/** VAT-registered business client. The only shape that makes the full type reachable (§2.1). */
const REGISTERED_CLIENT: InvoiceRecipient = {
  name: "Marina Pet Boutique L.L.C.",
  addressLines: ["Unit 1204, Marina Plaza", "Dubai Marina, Dubai"],
  trn: "100472913800003",
  email: "accounts@marinapetboutique.ae",
  phone: "+971 4 399 2210",
}

// ─── Line helpers ─────────────────────────────────────────────────────────────

/** A normal taxable service or product line. */
function taxableLine(
  id: string,
  description: string,
  grossMinor: number,
  opts: { subLabel?: string; qty?: number; originalMinor?: number; discountLabel?: string } = {},
): InvoiceLine {
  const qty = opts.qty ?? 1
  return {
    id,
    description,
    subLabel: opts.subLabel,
    qty,
    unitGrossMinor: grossMinor / qty,
    originalUnitGrossMinor: opts.originalMinor ? opts.originalMinor / qty : undefined,
    discountLabel: opts.discountLabel,
    lineGrossMinor: grossMinor,
    taxable: true,
  }
}

const FOOTER_NOTE = "Thank you. Please retain this invoice for your records."

// ─── The five reference fixtures ──────────────────────────────────────────────

/**
 * #24683 — Completed. Split tender: a 25% deposit captured the day before, then
 * the balance on the day. Both timestamps render (§0.3, INV-B3).
 */
const COMPLETED: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "completed",
  number: "24683",
  issuedAt: new Date(2026, 7, 16, 9, 43),
  issuer: SOTA,
  recipient: EVGENIA,
  lines: [taxableLine("l1", "Cut & Blow Dry", 45000, { subLabel: "9:00am, 16 Aug 2026" })],
  tenders: [
    { id: "t1", method: "Card", amountMinor: 33750, at: new Date(2026, 7, 16, 9, 43) },
    {
      id: "t2",
      method: "Apple Pay Visa *6273",
      amountMinor: 11250,
      at: new Date(2026, 7, 15, 9, 11),
    },
  ],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * #24062 — Part paid. A package benefit with an ad-hoc cart discount. The line
 * shows 2,375.00 over a struck-through 2,850.00, which is why there is no
 * discount column (§0.3).
 */
const PART_PAID: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "part-paid",
  number: "24062",
  issuedAt: new Date(2026, 6, 19, 14, 12),
  issuer: SOTA,
  recipient: REEM,
  lines: [
    taxableLine("l1", "Glass skin 3 + 1", 237500, {
      subLabel: "1 benefit",
      originalMinor: 285000,
      discountLabel: "Cart discount",
    }),
  ],
  cartDiscount: { label: "Cart discount", amountMinor: 47500 },
  tenders: [{ id: "t1", method: "Card", amountMinor: 135000, at: new Date(2026, 6, 19, 14, 12) }],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * #23812 — Unpaid. Two lines under a NAMED promotion, so the discount row is
 * named rather than generic (§3.1). No tenders: the tender block must render an
 * explicit "No payments received" row, not the reference's bare gap (§0.4 gap 5).
 */
const UNPAID: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "unpaid",
  number: "23812",
  issuedAt: new Date(2026, 6, 9, 16, 29),
  issuer: SOTA,
  recipient: KELSEY,
  lines: [
    taxableLine("l1", "Curly/Wave Blow Dry", 17600, {
      subLabel: "6:00pm, 4 Jul 2026",
      originalMinor: 22000,
      discountLabel: "20% off · Promotion (Discount)",
    }),
    taxableLine("l2", "Pin and curl", 2400, {
      subLabel: "7:30pm, 4 Jul 2026",
      originalMinor: 3000,
      discountLabel: "20% off · Promotion (Discount)",
    }),
  ],
  cartDiscount: { label: "20% off · Promotion (Discount)", amountMinor: 5000 },
  tenders: [],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * #22085 — Credit note, refunding #22084.
 *
 * Three deliberate departures from the reference, which are the compliance
 * fixes DSG-72 exists for (§0.4 gaps 1–3):
 *   1. Titled "Credit Note", not "Tax Invoice".
 *   2. The VAT is reversed — AED 0.95 on a 20.00 line. The reference shows none.
 *   3. The reversed LINE is shown, not a lump "Refund Amount".
 *
 * The original #22084 was never sampled (§0.5), so the reversed line's
 * description is fixture data rather than transcribed.
 */
const CREDIT_NOTE: InvoiceDocument = {
  kind: "credit-note",
  type: "tax-simplified",
  status: "issued",
  number: "22085",
  issuedAt: new Date(2026, 4, 12, 17, 7),
  refundOf: { number: "22084", issuedAt: new Date(2026, 4, 12, 16, 40) },
  issuer: SOTA,
  recipient: MAAZ,
  lines: [
    {
      id: "l1",
      description: "Fringe trim",
      subLabel: "4:00pm, 12 May 2026",
      qty: -1,
      unitGrossMinor: -2000,
      lineGrossMinor: -2000,
      taxable: true,
    },
  ],
  tenders: [
    {
      id: "t1",
      method: "Refund to Apple Pay Visa *6933",
      amountMinor: -2000,
      at: new Date(2026, 4, 12, 17, 7),
    },
  ],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * #24588 — Voided, 7 minutes after issue. A gift card sale, so there is NO VAT
 * row at all: no tax at issuance, tax at redemption (INV-P8). The reference gets
 * this right and we must not regress it (§5).
 *
 * This is the fixture the watermark exists for. On paper the reference reads as
 * a fully paid AED 1,250 invoice with Balance 0.00 (§6).
 */
const VOIDED: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "voided",
  number: "24588",
  issuedAt: new Date(2026, 7, 13, 12, 37),
  voidedAt: new Date(2026, 7, 13, 12, 44),
  issuer: SOTA,
  recipient: SUMMER,
  lines: [
    {
      id: "l1",
      description: "AED 1,250 - Gift Card",
      subLabel: "Code: FSMWURGW, expires on Aug 13, 2027",
      qty: 1,
      unitGrossMinor: 125000,
      lineGrossMinor: 125000,
      taxable: false,
    },
  ],
  tenders: [{ id: "t1", method: "Card", amountMinor: 125000, at: new Date(2026, 7, 13, 12, 37) }],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

// ─── Cami-side variants (no reference document) ────────────────────────────────

/**
 * The EC-39 fixture, and the reason the totals block has two bottom lines.
 *
 * Part paid with a tip added. Taxable gross stays 2,375.00 and VAT stays 113.10 —
 * the tip does not enter the base — while Amount due becomes 2,475.00. On the
 * reference's single-`Total` layout this document misreports the VAT base (§3.1).
 */
const WITH_TIP: InvoiceDocument = {
  ...PART_PAID,
  number: "24062",
  tipMinor: 10000,
}

/** Full tax invoice: recipient address + TRN present, so per-line tax columns render (§2.1). */
const TAX_FULL: InvoiceDocument = {
  ...COMPLETED,
  type: "tax-full",
  number: "24701",
  recipient: REGISTERED_CLIENT,
  /** Date of supply differs from issue, so the row renders (§4 block 4). */
  suppliedAt: new Date(2026, 7, 14, 9, 0),
  lines: [
    taxableLine("l1", "Full Groom", 22000, { subLabel: "9:00am, 14 Aug 2026" }),
    taxableLine("l2", "Nail Clipping", 4500, { subLabel: "10:30am, 14 Aug 2026", qty: 3 }),
  ],
  tenders: [{ id: "t1", method: "Card", amountMinor: 26500, at: new Date(2026, 7, 16, 9, 43) }],
}

/** No TRN. No tax column, no tax summary, no tax wording anywhere (§5). */
const PLAIN: InvoiceDocument = {
  ...COMPLETED,
  type: "plain",
  number: "24683",
  issuer: SOTA_NO_TRN,
}

/** Simplified with the recipient collapsed to a single name line (§5). */
const RECIPIENT_MINIMAL: InvoiceDocument = {
  ...COMPLETED,
  recipient: NAME_ONLY,
}

/** Logo present, so the identity block's logo slot is exercised (§0.5). */
const WITH_LOGO: InvoiceDocument = {
  ...COMPLETED,
  issuer: SOTA_WITH_LOGO,
}

/**
 * Zero value — a package redemption at AED 0.00. Still fully headed and fully
 * itemised at full retail, with the covering package named. A zero-amount
 * invoice is a valid invoice (INV-09), not an empty document.
 *
 * The redeemed line is neither a discount nor a tender, so it appears in neither
 * the discount row nor the tender block (06 §1).
 */
const ZERO_VALUE: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "completed",
  number: "24712",
  issuedAt: new Date(2026, 7, 18, 11, 5),
  issuer: SOTA,
  recipient: REEM,
  lines: [
    {
      id: "l1",
      description: "Cut & Blow Dry",
      subLabel: "Covered by Glass Skin 3 + 1 package",
      qty: 1,
      unitGrossMinor: 0,
      originalUnitGrossMinor: 45000,
      lineGrossMinor: 0,
      taxable: true,
      zeroReason: { label: "Covered by Glass Skin 3 + 1 package" },
    },
  ],
  tenders: [],
  tipMinor: 0,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * Credit note that reverses a tip as well as the taxable amount.
 *
 * Ruling received 2026-08-21 (Pet Loft developer, via Hussain): a refund returns
 * the tip too, closing §9 Q6. So the tip reverses alongside the line and the
 * refund tender covers both — AED 20.00 of service plus AED 5.00 of tip.
 *
 * Note the tip is still outside the VAT base on the way back out: the reversed
 * VAT is AED 0.95 on the 20.00 line, not on the 25.00 total.
 */
const CREDIT_NOTE_WITH_TIP: InvoiceDocument = {
  ...CREDIT_NOTE,
  number: "22086",
  tipMinor: -500,
  tenders: [
    {
      id: "t1",
      method: "Refund to Apple Pay Visa *6933",
      amountMinor: -2500,
      at: new Date(2026, 4, 12, 17, 7),
    },
  ],
}

/**
 * Zero-gross package redemption WITH a tip — modelled on live Cami Sale 387
 * (20 Aug 2026, Dot Zero 2 → Haroon Zafar), the first Cami sample of this case
 * (closes the tip gap in §0.5).
 *
 * What the live document does, and why this fixture exists: it shows
 * `Subtotal AED 100.00` and `Total AED 105.00` with no row explaining the 5.00.
 * Because 5% of 100.00 is exactly 5.00, the tip is indistinguishable from VAT —
 * so a reader books AED 5.00 of output tax that was never charged, while the
 * 4.76 actually contained in the 100.00 goes unreported. EC-39, in production,
 * with the two defects masking each other.
 *
 * Here the tip is named, sits outside the VAT base, and `Amount due` carries it,
 * so the 100.00 and the 5.00 can never be confused again.
 */
const ZERO_VALUE_WITH_TIP: InvoiceDocument = {
  kind: "invoice",
  type: "tax-simplified",
  status: "completed",
  number: "00387",
  issuedAt: new Date(2026, 7, 20, 19, 53),
  issuer: SOTA,
  recipient: { name: "Haroon Zafar" },
  lines: [
    {
      id: "l1",
      description: "Post Prod Service",
      subLabel: "Covered by Customer Package",
      qty: 1,
      unitGrossMinor: 0,
      originalUnitGrossMinor: 10000,
      lineGrossMinor: 0,
      taxable: true,
      zeroReason: { label: "Covered by Customer Package" },
    },
  ],
  // Only the tip is actually tendered: the package covered the service, and a
  // redemption is neither a discount nor a tender (§3, 06 §1). This is where the
  // design and live Cami diverge — see the spec's open question.
  tenders: [{ id: "t1", method: "Cash", amountMinor: 500, at: new Date(2026, 7, 20, 19, 53) }],
  tipMinor: 500,
  vatRate: 0.05,
  footerNote: FOOTER_NOTE,
}

/**
 * Cash overtender. The Change row does not count toward collected — change due
 * is not a payment (§3, INV-M4), so Balance still lands on 0.00.
 */
const OVERTENDER: InvoiceDocument = {
  ...COMPLETED,
  number: "24699",
  tenders: [
    { id: "t1", method: "Cash", amountMinor: 50000, at: new Date(2026, 7, 16, 9, 43) },
    {
      id: "t2",
      method: "Change",
      amountMinor: 5000,
      at: new Date(2026, 7, 16, 9, 43),
      isChange: true,
    },
  ],
}

/** Overflow: long legal name plus a description that has to wrap in-column (§5). */
const OVERFLOW: InvoiceDocument = {
  ...COMPLETED,
  number: "24705",
  issuer: LONG_NAME_ISSUER,
  lines: [
    taxableLine(
      "l1",
      "Full Groom with de-shedding treatment, hypoallergenic medicated shampoo, blueberry facial, ear cleaning and nail clipping — extra-large breed",
      45000,
      { subLabel: "9:00am, 16 Aug 2026" },
    ),
    taxableLine("l2", "Cut & Blow Dry", 12000, { subLabel: "11:00am, 16 Aug 2026" }),
  ],
  tenders: [{ id: "t1", method: "Card", amountMinor: 57000, at: new Date(2026, 7, 16, 9, 43) }],
}

/**
 * 30 lines, to exercise pagination: repeating identity block and column headers,
 * page N of M, and a totals block that is never orphaned from its lines (§7).
 */
const MULTI_PAGE: InvoiceDocument = (() => {
  const services = [
    "Full Groom",
    "Cut & Blow Dry",
    "Nail Clipping",
    "Ear Cleaning",
    "De-shedding Treatment",
    "Medicated Bath",
  ]
  const lines = Array.from({ length: 30 }, (_, i) =>
    taxableLine(`l${i + 1}`, `${services[i % services.length]} — pet ${i + 1}`, 12000 + i * 500, {
      subLabel: `${8 + (i % 9)}:00am, ${1 + (i % 28)} Aug 2026`,
    }),
  )
  const total = lines.reduce((sum, l) => sum + l.lineGrossMinor, 0)
  return {
    kind: "invoice" as const,
    type: "tax-simplified" as const,
    status: "completed" as const,
    number: "24720",
    issuedAt: new Date(2026, 7, 19, 17, 30),
    issuer: SOTA,
    recipient: REGISTERED_CLIENT,
    lines,
    tenders: [{ id: "t1", method: "Card", amountMinor: total, at: new Date(2026, 7, 19, 17, 30) }],
    tipMinor: 0,
    vatRate: 0.05,
    footerNote: FOOTER_NOTE,
  }
})()

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Every §5 state, keyed by the `?state=` param on /sales/invoice-document.
 * The order here is the order the switcher renders.
 */
export const INVOICE_FIXTURES = {
  completed: { label: "Completed", doc: COMPLETED },
  "part-paid": { label: "Part paid", doc: PART_PAID },
  unpaid: { label: "Unpaid", doc: UNPAID },
  "credit-note": { label: "Credit note (refund)", doc: CREDIT_NOTE },
  voided: { label: "Voided", doc: VOIDED },
  tip: { label: "With tip (EC-39)", doc: WITH_TIP },
  "tax-full": { label: "Tax Invoice, full", doc: TAX_FULL },
  plain: { label: "Invoice, no TRN", doc: PLAIN },
  "recipient-minimal": { label: "Recipient, name only", doc: RECIPIENT_MINIMAL },
  logo: { label: "With logo", doc: WITH_LOGO },
  "zero-value": { label: "Zero value", doc: ZERO_VALUE },
  "zero-value-tip": { label: "Zero value + tip (Sale 387)", doc: ZERO_VALUE_WITH_TIP },
  "credit-note-tip": { label: "Credit note + tip", doc: CREDIT_NOTE_WITH_TIP },
  overtender: { label: "Cash overtender", doc: OVERTENDER },
  overflow: { label: "Overflow", doc: OVERFLOW },
  "multi-page": { label: "Multi-page (30 lines)", doc: MULTI_PAGE },
} as const satisfies Record<string, { label: string; doc: InvoiceDocument }>

export type InvoiceFixtureId = keyof typeof INVOICE_FIXTURES

export const INVOICE_FIXTURE_IDS = Object.keys(INVOICE_FIXTURES) as InvoiceFixtureId[]

export const DEFAULT_INVOICE_FIXTURE: InvoiceFixtureId = "completed"

export function resolveInvoiceFixture(id: string | undefined): InvoiceDocument {
  if (id && id in INVOICE_FIXTURES) {
    return INVOICE_FIXTURES[id as InvoiceFixtureId].doc
  }
  return INVOICE_FIXTURES[DEFAULT_INVOICE_FIXTURE].doc
}
