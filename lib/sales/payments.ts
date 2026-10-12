import type { Sale } from "@/lib/sales/mock"
// The payments on a sale, each with the location that collected it.
//
// A sale belongs to one location (R11), but its payments need not: a deposit
// taken at one location and the balance at another is an ordinary booking. The
// location on the payment is what a refund or void of that payment is checked
// against (LOCATION_ACCESS_DENIED). The receipt names it only when it differs
// from the sale's own location.

export type SalePaymentKind = "cash" | "card" | "camipay"

export type SalePayment = {
  id: string
  kind: SalePaymentKind
  /** In fils. */
  amountMinor: number
  at: Date
  /** The location that collected it. */
  locationId: string
}

/**
 * What was paid on a sale that carries no payment records, by status. Mirrors
 * the sale detail's demo numbers so the two cannot disagree:
 *   completed → paid with AED 5 change over
 *   part-paid → ~80% paid
 *   refunded  → paid in full before the refund
 *   unpaid / voided → nothing
 */
export function demoPaidMinor(sale: Pick<Sale, "status" | "grossMinor">): number {
  const gross = Math.abs(sale.grossMinor)
  if (sale.status === "completed") return gross + 500
  if (sale.status === "part-paid") return Math.round(gross * 0.8)
  if (sale.status === "refunded") return gross
  return 0
}

/**
 * The sale's payments. Its own records when it has them; otherwise the one
 * payment the demo numbers imply, collected where the sale was made.
 */
export function paymentsFor(sale: Sale): SalePayment[] {
  if (sale.payments) return sale.payments
  const amountMinor = demoPaidMinor(sale)
  if (amountMinor <= 0 || sale.status === "voided") return []
  return [
    {
      id: "p1",
      kind: sale.camipay ? "camipay" : "cash",
      amountMinor,
      at: sale.saleAt,
      locationId: sale.locationId,
    },
  ]
}

/**
 * The payments taken at a location the viewer does not hold.
 *
 * Refunding or voiding one of these is refused (LOCATION_ACCESS_DENIED), so the
 * action is not offered for it.
 */
export function paymentsElsewhere(
  payments: ReadonlyArray<SalePayment>,
  heldLocationIds: ReadonlySet<string>,
): SalePayment[] {
  return payments.filter((p) => !heldLocationIds.has(p.locationId))
}
