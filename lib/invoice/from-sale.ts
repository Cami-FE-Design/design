// Bridge from a `Sale` row to the invoice document (DSG-72).
//
// The sale detail dialog shows a receipt; this produces the FTA-presentable
// document for the same sale, so "Share invoice" / "Print" / "Download PDF" open
// something real instead of a placeholder.
//
// `Sale` carries neither a line-item array nor a tender array — the dialog
// synthesises both from status for the demo. This does the same, from the same
// status rules, so the receipt and the invoice never tell different stories about
// one sale. Real sales arrive with their own lines and payment records, and this
// file is the seam where that swap happens.

import { MOCK_SALES, type Sale } from "@/app/sales/sales-list/page"
import type {
  InvoiceDocument,
  InvoiceIssuer,
  InvoiceLine,
  InvoiceStatus,
  InvoiceTender,
} from "./types"

/**
 * The issuing business. Legal name, registered address and TRN all come from
 * invoicing settings in production — PRD-9 owns the fields, this is the shape
 * the document needs from them.
 *
 * Deliberately Pet Loft Dubai with a TRN attached: the live output in §0.0 is
 * this business with no address and no TRN, so seeing the same name fully headed
 * is the before/after the ticket is about.
 */
const PET_LOFT: InvoiceIssuer = {
  legalName: "Pet Loft Pet Care Services L.L.C.",
  tradingName: "Pet Loft Dubai",
  addressLines: ["Shop 4, Marina Tower", "Al Marsa Street", "Dubai Marina, Dubai"],
  trn: "100518274600003",
  phone: "+971 50 873 9874",
}

const FOOTER_NOTE = "Thank you. Please retain this invoice for your records."

/**
 * How much was collected, by status. Settles against AMOUNT DUE, not the taxable
 * gross — `Sale.tipsMinor` sits outside `Sale.grossMinor`, so tendering only the
 * gross would leave a completed sale with a tip showing an outstanding balance.
 *
 * Mirrors the sale detail dialog's demo derivation so the two surfaces agree:
 *   completed → paid in full, by split tender
 *   part-paid → ~80% collected
 *   unpaid    → nothing collected
 *   voided    → paid in full (this is the point: a voided invoice reads
 *               legitimate, which is why it gets a watermark, §6)
 */
function tendersFor(sale: Sale, amountDueMinor: number): InvoiceTender[] {
  const method = sale.camipay ? "CamiPay" : "Card"

  switch (sale.status) {
    case "completed": {
      // Split tender, because a deposit-then-balance shape is the one thing the
      // benchmark gets unambiguously right and it needs a screen (§0.3).
      const deposit = Math.round(amountDueMinor * 0.25)
      const depositAt = new Date(sale.saleAt)
      depositAt.setDate(depositAt.getDate() - 1)
      return [
        { id: "t1", method, amountMinor: amountDueMinor - deposit, at: sale.saleAt },
        { id: "t2", method: "Deposit · Card", amountMinor: deposit, at: depositAt },
      ]
    }
    case "part-paid":
      return [{ id: "t1", method, amountMinor: Math.round(amountDueMinor * 0.8), at: sale.saleAt }]
    case "voided":
      return [{ id: "t1", method, amountMinor: amountDueMinor, at: sale.saleAt }]
    case "refunded":
      return [
        {
          id: "t1",
          method: `Refund to ${method}`,
          amountMinor: -amountDueMinor,
          at: sale.saleAt,
        },
      ]
    default:
      // Unpaid. No tenders at all — the block still renders, stating the
      // absence rather than leaving a gap (§0.4 gap 5).
      return []
  }
}

/**
 * The line items. A gift-card sale is NOT taxable — no tax at issuance, tax at
 * redemption (INV-P8) — and carries its code and expiry as the sub-label, which
 * is what the reference does right (§0.3).
 */
function linesFor(sale: Sale, grossMinor: number): InvoiceLine[] {
  if (sale.giftCard) {
    return [
      {
        id: "l1",
        description: `AED ${sale.giftCard.valueAed.toLocaleString("en-US")} - Gift Card`,
        subLabel: `Code: ${sale.giftCard.code}`,
        qty: 1,
        unitGrossMinor: grossMinor,
        lineGrossMinor: grossMinor,
        taxable: false,
      },
    ]
  }

  // Gross 0 with a tip is a package or voucher redemption: the service was
  // covered, so the line goes to zero gross with the covering instrument named.
  // A redemption is neither a discount nor a tender (§3, 06 §1), so nothing
  // appears in the tender block for it — only the tip is actually collected.
  // `Sale` carries no retail value for a covered line, so the struck-through
  // retail figure only appears on the ?state=zero-value-tip fixture.
  if (grossMinor === 0) {
    return [
      {
        id: "l1",
        description: "Full Groom",
        subLabel: "Covered by Customer Package",
        qty: 1,
        unitGrossMinor: 0,
        lineGrossMinor: 0,
        taxable: true,
        zeroReason: { label: "Covered by Customer Package" },
      },
    ]
  }

  const time = sale.saleAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const day = sale.saleAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return [
    {
      id: "l1",
      description: "Full Groom",
      // The line sub-label carries the date of supply, doing that job without a
      // dedicated row (§0.3).
      subLabel: `${time.toLowerCase().replace(" ", "")}, ${day}`,
      qty: 1,
      unitGrossMinor: grossMinor,
      lineGrossMinor: grossMinor,
      taxable: true,
    },
  ]
}

/** A refunded sale becomes a credit note; everything else keeps its status (§2.2). */
function statusFor(sale: Sale): InvoiceStatus {
  switch (sale.status) {
    case "refunded":
      return "issued"
    case "completed":
      return "completed"
    case "part-paid":
      return "part-paid"
    case "voided":
      return "voided"
    default:
      return "unpaid"
  }
}

/**
 * The invoice a refund reverses.
 *
 * Production pairs them by adjacent number with the original left `completed`
 * (live Sale 241 → Refund 242, §0.6), so we resolve the real row rather than
 * assuming `id − 1`: that assumption pointed one fixture's credit note at a
 * voided sale and another's at a part-paid one. A credit note cites a specific
 * invoice, and citing the wrong one is worse than citing none — so when no
 * matching original exists the reference is omitted rather than invented.
 */
function originalFor(sale: Sale): { number: string; issuedAt: Date } | undefined {
  const amount = Math.abs(sale.grossMinor)
  const original = MOCK_SALES.find(
    (s) => s.status === "completed" && s.grossMinor === amount && s.id < sale.id,
  )
  if (!original) return undefined
  return { number: String(original.id).padStart(5, "0"), issuedAt: original.saleAt }
}

/**
 * How much of this sale has been refunded, if any.
 *
 * The refund is its own row, so the original has to look its own refunds up. The
 * sale keeps its number and stays `completed` (§2.2), which is exactly why the
 * printed invoice needs this figure — otherwise it circulates looking settled.
 */
function refundedToDateFor(sale: Sale): number | undefined {
  if (sale.status !== "completed") return undefined
  const refunded = MOCK_SALES.filter(
    (s) => s.status === "refunded" && Math.abs(s.grossMinor) === sale.grossMinor && s.id > sale.id,
  ).reduce((sum, s) => sum + Math.abs(s.grossMinor), 0)
  return refunded > 0 ? refunded : undefined
}

export function invoiceFromSale(sale: Sale): InvoiceDocument {
  // Refunded sales carry a negative gross on the row; the document works in
  // positive figures and signs the lines itself.
  const grossMinor = Math.abs(sale.grossMinor)
  const isRefund = sale.status === "refunded"

  // A void is same-calendar-day only (business-rules-v2 rule 12), so the void
  // timestamp sits a few minutes after issue — the shape that makes a voided
  // document dangerous, and the reason for the watermark (§6).
  const voidedAt = new Date(sale.saleAt)
  voidedAt.setMinutes(voidedAt.getMinutes() + 7)

  return {
    kind: isRefund ? "credit-note" : "invoice",
    // Pet Loft has a TRN, and Cami clients are consumers: simplified is the
    // correct default for a consumer-facing service business (§2.1).
    type: "tax-simplified",
    status: statusFor(sale),
    number: String(sale.id).padStart(5, "0"),
    issuedAt: sale.saleAt,
    refundOf: isRefund ? originalFor(sale) : undefined,
    // Production captures a reason and does not print it (§0.6 finding 28).
    refundReason: isRefund ? "Product defect or damage" : undefined,
    refundedToDateMinor: refundedToDateFor(sale),
    voidedAt: sale.status === "voided" ? voidedAt : undefined,
    issuer: PET_LOFT,
    recipient: {
      name: sale.client,
      email: `${sale.client.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    },
    lines: linesFor(sale, isRefund ? -grossMinor : grossMinor).map((l) =>
      isRefund ? { ...l, qty: -l.qty } : l,
    ),
    tenders: tendersFor(sale, grossMinor + sale.tipsMinor),
    // Real tip data off the sale row. Sale 16 carries one, which is what makes
    // the EC-39 split visible on a real record rather than only a fixture.
    tipMinor: sale.tipsMinor,
    vatRate: 0.05,
    footerNote: FOOTER_NOTE,
  }
}
