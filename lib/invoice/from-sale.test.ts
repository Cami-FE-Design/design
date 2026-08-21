// The Sale → invoice document bridge (DSG-72).
//
// These guard the seam where the sales listing meets the document. The balance
// cases matter most: `Sale.tipsMinor` sits outside `Sale.grossMinor`, so tenders
// have to settle against amount due or a completed sale with a tip renders as
// still owing money.

import { describe, expect, it } from "vitest"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { invoiceFromSale } from "./from-sale"
import { documentTitle, formatInvoiceAmount, invoiceTotals } from "./totals"

const saleById = (id: number) => {
  const sale = MOCK_SALES.find((s) => s.id === id)
  if (!sale) throw new Error(`no mock sale ${id}`)
  return sale
}

describe("every mock sale produces a coherent document", () => {
  it.each(
    MOCK_SALES.map((s) => [s.id, s.status] as const),
  )("sale %i (%s) is fully headed", (id) => {
    const doc = invoiceFromSale(saleById(id))
    // The whole point of the ticket: name, registered address and TRN present,
    // and titled as a tax document rather than "Sale 22" (§0.0).
    expect(doc.issuer.trn).toBeTruthy()
    expect(doc.issuer.addressLines.length).toBeGreaterThan(0)
    expect(doc.lines.length).toBeGreaterThan(0)
    expect(["Tax Invoice", "Credit Note"]).toContain(documentTitle(doc))
  })
})

describe("sale 16 — completed, and the only mock row carrying a tip", () => {
  const doc = invoiceFromSale(saleById(16))
  const t = invoiceTotals(doc)

  it("keeps the tip out of the VAT base", () => {
    // Gross 5400 is the taxable gross; the 1000 tip is not part of it.
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 54.00")
    expect(formatInvoiceAmount(t.vatMinor)).toBe("AED 2.57")
    expect(formatInvoiceAmount(t.tipMinor)).toBe("AED 10.00")
  })

  it("settles to zero, because tenders cover amount due and not just gross", () => {
    expect(formatInvoiceAmount(t.amountDueMinor)).toBe("AED 64.00")
    expect(t.collectedMinor).toBe(t.amountDueMinor)
    expect(t.balanceMinor).toBe(0)
  })

  it("renders as a split tender, deposit dated before the sale", () => {
    expect(doc.tenders).toHaveLength(2)
    const deposit = doc.tenders[1]
    expect(deposit.at.getTime()).toBeLessThan(doc.issuedAt.getTime())
  })
})

describe("sale 15 — part paid", () => {
  const t = invoiceTotals(invoiceFromSale(saleById(15)))

  it("leaves the uncollected remainder as the balance", () => {
    expect(t.balanceMinor).toBeGreaterThan(0)
    expect(t.collectedMinor + t.balanceMinor).toBe(t.amountDueMinor)
  })
})

describe("sale 14 — unpaid", () => {
  const doc = invoiceFromSale(saleById(14))
  const t = invoiceTotals(doc)

  it("has no tenders, and owes the whole amount", () => {
    expect(doc.tenders).toHaveLength(0)
    expect(t.collectedMinor).toBe(0)
    expect(t.balanceMinor).toBe(t.amountDueMinor)
  })
})

describe("sale 13 — refunded becomes a credit note", () => {
  const doc = invoiceFromSale(saleById(13))
  const t = invoiceTotals(doc)

  it("is a credit note, not a negative tax invoice (§2.2)", () => {
    expect(doc.kind).toBe("credit-note")
    expect(documentTitle(doc)).toBe("Credit Note")
    expect(doc.status).toBe("issued")
  })

  it("omits the reference when no coherent original exists", () => {
    // Sale 13 refunds AED 18.00 and no completed sale matches it. The old
    // `id - 1` assumption cited sale 12 — which is VOIDED. A credit note names a
    // specific invoice, so naming the wrong one is worse than naming none.
    expect(doc.refundOf).toBeUndefined()
  })

  it("reverses the tax, which the benchmark omits entirely (§0.4 gap 1)", () => {
    expect(t.vatMinor).toBeLessThan(0)
    expect(t.totalInclVatMinor).toBeLessThan(0)
  })

  it("settles against the refund tender", () => {
    expect(t.balanceMinor).toBe(0)
  })
})

describe("sale 12 — voided", () => {
  const doc = invoiceFromSale(saleById(12))
  const t = invoiceTotals(doc)

  it("carries a void timestamp, so the subtitle and watermark render (§6)", () => {
    expect(doc.voidedAt).toBeDefined()
  })

  it("voids same-calendar-day (business-rules-v2 rule 12)", () => {
    expect(doc.voidedAt?.toDateString()).toBe(doc.issuedAt.toDateString())
  })

  it("still reads as fully paid — which is exactly why it needs a watermark", () => {
    expect(t.balanceMinor).toBe(0)
  })
})

describe("sale 20 — a refund paired with the sale it reverses", () => {
  const doc = invoiceFromSale(saleById(20))
  const t = invoiceTotals(doc)

  it("cites the originating invoice", () => {
    // Mirrors production's shape: adjacent numbers, same amount, and the
    // original left `completed` (live Sale 241 -> Refund 242, spec 0.6).
    expect(doc.refundOf?.number).toBe("00019")
  })

  it("leaves the original sale completed", () => {
    expect(saleById(19).status).toBe("completed")
  })

  it("reverses the same amount the sale charged", () => {
    const original = invoiceTotals(invoiceFromSale(saleById(19)))
    expect(t.totalInclVatMinor).toBe(-original.totalInclVatMinor)
    expect(t.vatMinor).toBe(-original.vatMinor)
  })

  it("settles to zero", () => {
    expect(t.balanceMinor).toBe(0)
  })
})

describe("a refunded sale must not print as settled (§2.2)", () => {
  it("carries a refunded-to-date figure on the original invoice", () => {
    // Sale 19 was fully refunded by sale 20. The invoice keeps its number and
    // stays `completed`, so this figure is the only thing on the document that
    // admits the money went back. Production omits it from the PDF entirely.
    const doc = invoiceFromSale(saleById(19))
    expect(doc.refundedToDateMinor).toBe(190000)
  })

  it("leaves it absent on a sale nothing was refunded against", () => {
    expect(invoiceFromSale(saleById(16)).refundedToDateMinor).toBeUndefined()
  })

  it("puts the reason on the credit note, not on the invoice", () => {
    expect(invoiceFromSale(saleById(20)).refundReason).toBeTruthy()
    expect(invoiceFromSale(saleById(19)).refundReason).toBeUndefined()
  })
})
