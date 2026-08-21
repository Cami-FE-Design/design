// Document model for the downloadable invoice (DSG-72).
//
// Spec: docs/specs/DSG-72-downloadable-invoice.md. Read §3 before touching any
// money field — the display rules are a contract, not preferences.
//
// This is deliberately NOT an extension of `Sale` (app/sales/sales-list).
// An invoice is a *snapshot*: the issuer's legal name, registered address, TRN
// and the tax rate are frozen as they stood at issue, so a later settings edit
// or a rate change cannot restate a document that already went to a client.
// Same reasoning as the CamiPay rate snapshot on `SaleCamiPay` (PRO-737).
//
// All money is minor units (fils), tax-INCLUSIVE. VAT is derived, never
// appended (§3, 06 §4). There is no ex-VAT price anywhere in this model.

/**
 * Which instrument this is. A refund is a separate, negatively-signed document
 * with its own number — never a mutated or negative tax invoice (§2.2, INV-04).
 */
export type InvoiceDocKind = "invoice" | "credit-note"

/**
 * Three-way, not two-way (§2.1). The ticket's "Tax Invoice vs Invoice" collapses
 * the full and simplified forms, which differ in whether the recipient block and
 * per-line tax columns are *required*.
 *
 * We render the full field set for all three and let optional fields collapse:
 * simplified is a strict subset of full, so a full-shaped document is always
 * legally sufficient and never insufficient.
 */
export type InvoiceType =
  /** Business has a TRN and the recipient's TRN is captured. Recipient + line tax required. */
  | "tax-full"
  /** Business has a TRN, recipient is a consumer. The Cami default. */
  | "tax-simplified"
  /** Business has no TRN. No tax column, no tax summary, no tax wording anywhere. */
  | "plain"

/**
 * Payment state. Carried by the numbers, never a badge chip (§5) — `Balance` is
 * the entire Unpaid / Part paid / Completed signal.
 *
 * `voided` is the one payment-shaped state that needs prose *and* a watermark,
 * because a voided invoice keeps its number and can circulate (§6).
 *
 * Note there is no `refunded`: a refund is a credit note, and the sale it
 * refunds stays `completed` (§2.2). Credit notes are always `issued`.
 */
export type InvoiceStatus = "unpaid" | "part-paid" | "completed" | "voided" | "issued"

// ─── Parties ──────────────────────────────────────────────────────────────────

/** The supplier. Legal name / address / TRN never collapse on a tax invoice (§4 block 2). */
export type InvoiceIssuer = {
  /** Registered legal entity name. Not the trading name. */
  legalName: string
  /** Trading name, shown under the legal name only when it differs. */
  tradingName?: string
  /** Registered address, already formatted into display lines. A legal field — must not drift (§9 Q11). */
  addressLines: ReadonlyArray<string>
  /** Tax Registration Number. Absent → the document is type "plain". */
  trn?: string
  phone?: string
  email?: string
  /** Logo slot collapses when absent; identity text shifts up, no placeholder box (§5). */
  logoUrl?: string
}

/**
 * The recipient. Every field is optional: the block collapses to a single name
 * line for a consumer, and only a captured TRN makes the full type reachable
 * (§4 block 3, §9 Q5).
 *
 * `name` may contain emoji — merchants use ⭐ as a VIP marker. It must not
 * render as tofu on a legal document (§0.4 gap 16).
 */
export type InvoiceRecipient = {
  name: string
  addressLines?: ReadonlyArray<string>
  trn?: string
  email?: string
  phone?: string
}

// ─── Lines ────────────────────────────────────────────────────────────────────

/**
 * Why a line's gross is zero. Package and voucher redemptions still print at
 * full retail description with a zero line total and the covering instrument
 * named — they are neither a discount nor a tender (§3, 06 §1).
 */
export type InvoiceZeroReason = {
  /** e.g. "Covered by Puppy Package". Rendered as the line's sub-label. */
  label: string
}

export type InvoiceLine = {
  id: string
  /** Service or product description, at full retail wording even when redeemed. */
  description: string
  /**
   * Grey sub-label under the description. Carries the date of supply for
   * services ("9:00am, 16 Aug 2026"), the code and expiry for gift cards, or
   * "1 benefit" for a package/membership benefit (§0.3).
   */
  subLabel?: string
  qty: number
  /** Tax-inclusive unit price actually charged, fils. */
  unitGrossMinor: number
  /**
   * Pre-discount unit price, when this line was discounted. Rendered struck
   * through above the charged price — this is why there is no discount column
   * (§0.3). Absent when the line carries no discount.
   */
  originalUnitGrossMinor?: number
  /**
   * What the discount was, named for a promotion and generic for an ad-hoc cart
   * discount: "20% off · Promotion (Discount)" vs "Cart discount". Two different
   * objects, two treatments (§3.1, glossary).
   */
  discountLabel?: string
  /**
   * Tax-inclusive line total AFTER the pro-rata cart-discount allocation, fils.
   * Stored, not re-derived: the fils residue goes to the line with the largest
   * post-discount gross (06 §7), and two systems must agree byte for byte.
   */
  lineGrossMinor: number
  /**
   * Whether this line is in the VAT base. False for gift card sales — no tax at
   * issuance, tax at redemption (INV-P8, ADR-007). A false here removes the VAT
   * row entirely, it does not render a zero (§5).
   */
  taxable: boolean
  /** Set when the line is zero-gross because something else covered it. */
  zeroReason?: InvoiceZeroReason
}

// ─── Tenders ──────────────────────────────────────────────────────────────────

/**
 * How it was paid. Split tender repeats this block, each with its own timestamp
 * — the deposit-then-balance shape the reference gets right (§0.3).
 *
 * A gift card appears here and only here: it is a tender, never a discount, and
 * never reduces taxable gross (§3, 06 §1).
 */
export type InvoiceTender = {
  id: string
  /** Display label, e.g. "Card", "Cash", "Apple Pay Visa *6273", "Gift card". */
  method: string
  amountMinor: number
  /** When this tender was captured. A deposit predates the invoice date (INV-P10). */
  at: Date
  /**
   * Cash overtender. Rendered as a `Change` line that does NOT count toward
   * collected — change due is not a payment (§3, INV-M4).
   */
  isChange?: boolean
}

// ─── Document ─────────────────────────────────────────────────────────────────

export type InvoiceDocument = {
  kind: InvoiceDocKind
  type: InvoiceType
  status: InvoiceStatus

  /** Unique sequential document number, e.g. "24683". Guaranteed by PRD-9. */
  number: string
  /** Date of issue. Always rendered. */
  issuedAt: Date
  /**
   * Date of supply. Rendered only when it differs from issue (§4 block 4) —
   * for a service invoice this is the render date, not the deposit capture date.
   */
  suppliedAt?: Date

  issuer: InvoiceIssuer
  recipient: InvoiceRecipient
  lines: ReadonlyArray<InvoiceLine>
  tenders: ReadonlyArray<InvoiceTender>

  /**
   * Tip, fils. Outside the VAT base (INV-M5) — this is the field that forces
   * `Total (incl. VAT)` and `Amount due` to be two separate rows. Zero is a
   * real value here, not "absent": both rows render either way (EC-39, §3.1).
   */
  tipMinor: number

  /** VAT rate as a fraction, snapshotted at issue. 0.05 in the UAE. */
  vatRate: number

  /**
   * The cart-level discount, when one applies. Line-level discounts live on the
   * lines. Hides at zero (§3.1).
   */
  cartDiscount?: {
    /** "Cart discount" for ad-hoc, or the promotion's name when it has one. */
    label: string
    amountMinor: number
  }

  /** Set on a credit note: which invoice this reverses (§2.2). */
  refundOf?: {
    number: string
    /** "Refund of original invoice #22084" is built from this. */
    issuedAt: Date
  }

  /**
   * Why the refund was issued, e.g. "Product defect or damage". Captured at
   * refund time and shown in-app; production does NOT print it (§0.6 finding 28).
   *
   * We print it, pending §9 Q15: unlike a void reason, which explains an internal
   * decision, a refund reason explains a negative document the client is holding.
   */
  refundReason?: string

  /**
   * Set on an INVOICE that has been refunded. The sale stays `completed` and
   * keeps its number — there is no PartiallyRefunded status (§2.2) — so the only
   * way the document can admit money went back is this figure.
   *
   * Production omits it from the printed invoice (§0.6 finding 29) while showing
   * it in-app, which leaves a fully-paid-looking document in circulation for
   * money that was returned. Same circulation risk the void watermark exists for.
   */
  refundedToDateMinor?: number

  /** Set when voided. Drives both the subtitle and the watermark (§6). */
  voidedAt?: Date

  /**
   * Footer note, from the business's invoicing settings ("Invoice note" in
   * location-form). Optional — the footer still renders the page counter.
   */
  footerNote?: string

  /**
   * ZATCA TLV payload for the QR block. Absent until PRD-9 supplies it; the
   * block's position and dimensions are reserved either way so the layout is
   * never re-cut (§2.3, §4 block 8).
   */
  qrPayload?: string
}
