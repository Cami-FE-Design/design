// Customer-facing pay-page snapshot (PRO-396 / PRO-594 payment link landing).
//
// The operator finishes a sale in /sales/new-sale and sends a payment link over
// WhatsApp/email. The link resolves to /[slug]/pay/[token]; the token encodes
// the sale id. The customer opens it on their own phone and pays. No login.
//
// Money model inherits PRO-395 exactly: prices are tax-inclusive, stored in fils
// (minor units), VAT back-calculated. Tip is added on top of the tax-inclusive
// total. Reuse the money helpers from the operator cart — do not fork them.

import { formatAedDecimal, VAT_RATE } from "@/app/sales/new-sale/mock"

export { formatAedDecimal, VAT_RATE }

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckoutLineKind = "service" | "product"

export type CheckoutLine = {
  id: string
  kind: CheckoutLineKind
  name: string
  /** Shown only when the business manages pets (hasPets). "Full groom — Bella". */
  petName?: string
  /** Team member who performed the service. Omitted for products. */
  staff?: string
  qty: number
  /** Tax-inclusive line price, fils. */
  priceMinor: number
}

/** Lightweight package upsell surfaced inline. Not the focal action. */
export type CheckoutMembershipOffer = {
  id: string
  name: string
  /** What the customer saves on *this* bill by joining. */
  saveMinor: number
  /** Recurring term copy, e.g. "AED 149 / month". */
  termLabel: string
}

export type CheckoutStatus = "unpaid" | "paid" | "expired"

/** Payer the operator attached when building the sale. Prefilled, editable. */
export type CheckoutPayer = {
  name: string
  email?: string
  photoUrl?: string
}

/** A card the payer used before, shown as a selectable chip (Luma pattern). */
export type CheckoutSavedCard = {
  brand: "visa" | "mastercard" | "amex"
  last4: string
}

export type CheckoutSale = {
  id: string
  businessSlug: string
  status: CheckoutStatus
  /** Drives pet-name attribution on service lines. See project_cami_business_types. */
  hasPets: boolean
  /** When the sale happened — shown in the compact business row. */
  whenLabel?: string
  lines: ReadonlyArray<CheckoutLine>
  payer?: CheckoutPayer
  savedCard?: CheckoutSavedCard
  membership?: CheckoutMembershipOffer
  /** Already-settled amount, fils. Non-zero → "Left to pay" framing. */
  paidMinor?: number
}

// ─── Money ────────────────────────────────────────────────────────────────────

export type CheckoutTotals = {
  /** Tax-inclusive sum of lines, fils. */
  totalMinor: number
  /** Back-calculated ex-VAT subtotal. */
  subtotalMinor: number
  /** VAT = total − subtotal (rounding-safe). */
  taxMinor: number
}

export function checkoutTotals(lines: ReadonlyArray<CheckoutLine>): CheckoutTotals {
  const totalMinor = lines.reduce((sum, l) => sum + l.priceMinor * l.qty, 0)
  const subtotalMinor = Math.round(totalMinor / (1 + VAT_RATE))
  return { totalMinor, subtotalMinor, taxMinor: totalMinor - subtotalMinor }
}

/**
 * Tip presets as fixed AED amounts (fils). Calmer than %-of-bill for a
 * grooming/vet brand. 0 = "No tip". One amount is flagged "Most common" as a
 * soft social-proof nudge (qlub pattern).
 */
export const TIP_AMOUNTS = [0, 500, 1000, 1500] as const

/** The preset that carries the "Most common" pill. */
export const TIP_MOST_COMMON_MINOR = 1000

// ─── Mock snapshot (resolved from a token in production) ──────────────────────

export const MOCK_SALE: CheckoutSale = {
  id: "sale_2",
  businessSlug: "sota",
  status: "unpaid",
  hasPets: true,
  whenLabel: "Today, 5:00 PM",
  paidMinor: 0,
  payer: {
    name: "Michelle You",
    email: "michelle@ce-creates.com",
  },
  savedCard: { brand: "mastercard", last4: "3884" },
  lines: [
    {
      id: "l1",
      kind: "service",
      name: "Full groom",
      petName: "Bella",
      staff: "Lena",
      qty: 1,
      priceMinor: 16_000,
    },
    {
      id: "l2",
      kind: "service",
      name: "Nail trim",
      petName: "Bella",
      staff: "Lena",
      qty: 1,
      priceMinor: 3_500,
    },
    {
      id: "l3",
      kind: "product",
      name: "Detangling spray",
      qty: 1,
      priceMinor: 4_500,
    },
  ],
  membership: {
    id: "groom-club",
    name: "Grooming Club",
    saveMinor: 2_000,
    termLabel: "AED 149 / month",
  },
}

/** Resolve a signed token to a sale snapshot. Mock: token suffix swaps state. */
export function resolveSale(token: string): CheckoutSale {
  if (token.endsWith("-paid")) return { ...MOCK_SALE, status: "paid" }
  if (token.endsWith("-expired")) return { ...MOCK_SALE, status: "expired" }
  return MOCK_SALE
}
