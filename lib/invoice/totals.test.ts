// Pins the invoice money derivation to the reference documents (DSG-72 §0.3).
//
// The five Fresha PDFs in docs/specs/assets/ are the fixture data, and their
// printed figures are the expected values here. If one of these fails, the
// derivation drifted away from a real document a client already received.

import { describe, expect, it } from "vitest"
import { INVOICE_FIXTURES } from "./mock"
import { formatInvoiceAmount, invoiceTotals, vatOf } from "./totals"

describe("vatOf — VAT is derived from a tax-inclusive gross, never appended", () => {
  it("matches the reference derivations", () => {
    // 06 §4: gross × 5 / 105. These three are printed on the references.
    expect(vatOf(45000, 0.05)).toBe(2143) // #24683 → AED 21.43
    expect(vatOf(237500, 0.05)).toBe(11310) // #24062 → AED 113.10
    expect(vatOf(20000, 0.05)).toBe(952) // #23812 → AED 9.52
    // Cami today: 220.00 with the tax never rendered (§0.0).
    expect(vatOf(22000, 0.05)).toBe(1048) // → AED 10.48
  })

  it("reverses exactly, so a credit note cancels its invoice", () => {
    // Math.round breaks ties toward +∞, which would refund one fils less VAT
    // than was charged. Half-up on the magnitude keeps the pair symmetric.
    expect(vatOf(-2000, 0.05)).toBe(-vatOf(2000, 0.05))
    expect(vatOf(-2000, 0.05)).toBe(-95) // §3.2 → AED 0.95 reversed
  })
})

describe("#24683 Completed", () => {
  const t = invoiceTotals(INVOICE_FIXTURES.completed.doc)

  it("derives the printed subtotal, VAT and total", () => {
    expect(formatInvoiceAmount(t.subtotalExVatMinor)).toBe("AED 428.57")
    expect(formatInvoiceAmount(t.vatMinor)).toBe("AED 21.43")
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 450.00")
  })

  it("settles to zero across a split tender", () => {
    expect(t.collectedMinor).toBe(45000)
    expect(t.balanceMinor).toBe(0)
  })

  it("keeps amount due equal to taxable gross when there is no tip", () => {
    expect(t.amountDueMinor).toBe(t.totalInclVatMinor)
  })
})

describe("#24062 Part paid", () => {
  const t = invoiceTotals(INVOICE_FIXTURES["part-paid"].doc)

  it("derives the printed discount-aware totals block", () => {
    expect(formatInvoiceAmount(t.itemsTotalMinor)).toBe("AED 2,850.00")
    expect(formatInvoiceAmount(t.cartDiscountMinor)).toBe("AED 475.00")
    expect(formatInvoiceAmount(t.subtotalExVatMinor)).toBe("AED 2,261.90")
    expect(formatInvoiceAmount(t.vatMinor)).toBe("AED 113.10")
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 2,375.00")
  })

  it("leaves the printed balance outstanding", () => {
    expect(formatInvoiceAmount(t.balanceMinor)).toBe("AED 1,025.00")
  })
})

describe("#23812 Unpaid", () => {
  const t = invoiceTotals(INVOICE_FIXTURES.unpaid.doc)

  it("derives the printed totals across two promoted lines", () => {
    expect(formatInvoiceAmount(t.itemsTotalMinor)).toBe("AED 250.00")
    expect(formatInvoiceAmount(t.cartDiscountMinor)).toBe("AED 50.00")
    expect(formatInvoiceAmount(t.subtotalExVatMinor)).toBe("AED 190.48")
    expect(formatInvoiceAmount(t.vatMinor)).toBe("AED 9.52")
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 200.00")
  })

  it("leaves the whole total outstanding with nothing collected", () => {
    expect(t.collectedMinor).toBe(0)
    expect(t.balanceMinor).toBe(t.amountDueMinor)
    expect(formatInvoiceAmount(t.balanceMinor)).toBe("AED 200.00")
  })
})

describe("#22085 Credit note", () => {
  const t = invoiceTotals(INVOICE_FIXTURES["credit-note"].doc)

  it("reverses the VAT the reference omits entirely (§0.4 gap 1)", () => {
    // The compliance defect DSG-72 exists to not inherit: Fresha shows
    // Subtotal −20.00 / Total −20.00 and no VAT row, overstating output tax.
    expect(t.vatMinor).toBe(-95)
    expect(formatInvoiceAmount(t.vatMinor)).toBe("− AED 0.95")
    expect(formatInvoiceAmount(t.subtotalExVatMinor)).toBe("− AED 19.05")
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("− AED 20.00")
  })

  it("settles against the refund tender", () => {
    expect(t.balanceMinor).toBe(0)
  })

  it("still carries tax wording, because a credit note is a tax document", () => {
    expect(t.showTax).toBe(true)
  })
})

describe("#24588 Voided gift card sale", () => {
  const t = invoiceTotals(INVOICE_FIXTURES.voided.doc)

  it("carries no VAT at issuance — tax lands at redemption (INV-P8)", () => {
    expect(t.vatMinor).toBe(0)
    expect(t.showTax).toBe(false)
  })

  it("leaves subtotal equal to total, as the reference does", () => {
    expect(t.subtotalExVatMinor).toBe(t.totalInclVatMinor)
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 1,250.00")
  })

  it("reads as fully paid — which is why the watermark exists (§6)", () => {
    expect(t.balanceMinor).toBe(0)
  })
})

describe("EC-39 — a tip separates taxable gross from amount due", () => {
  const t = invoiceTotals(INVOICE_FIXTURES.tip.doc)

  it("keeps the tip out of the VAT base", () => {
    const untipped = invoiceTotals(INVOICE_FIXTURES["part-paid"].doc)
    expect(t.vatMinor).toBe(untipped.vatMinor)
    expect(t.totalInclVatMinor).toBe(untipped.totalInclVatMinor)
  })

  it("adds the tip to amount due only", () => {
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 2,375.00")
    expect(formatInvoiceAmount(t.tipMinor)).toBe("AED 100.00")
    expect(formatInvoiceAmount(t.amountDueMinor)).toBe("AED 2,475.00")
    expect(t.amountDueMinor).not.toBe(t.totalInclVatMinor)
  })

  it("bases the balance on amount due, not taxable gross", () => {
    expect(formatInvoiceAmount(t.balanceMinor)).toBe("AED 1,125.00")
  })
})

describe("Cash overtender", () => {
  const t = invoiceTotals(INVOICE_FIXTURES.overtender.doc)

  it("does not count change as collected (INV-M4)", () => {
    expect(t.collectedMinor).toBe(45000)
    expect(t.changeMinor).toBe(5000)
    expect(t.balanceMinor).toBe(0)
  })
})

describe("Zero-value invoice", () => {
  const t = invoiceTotals(INVOICE_FIXTURES["zero-value"].doc)

  it("is a valid, fully itemised invoice at AED 0.00 (INV-09)", () => {
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 0.00")
    expect(t.vatMinor).toBe(0)
    expect(t.balanceMinor).toBe(0)
  })

  it("still shows what the line is worth at full retail", () => {
    expect(formatInvoiceAmount(t.itemsTotalMinor)).toBe("AED 450.00")
  })
})

describe("Invoice with no TRN", () => {
  it("carries no tax wording anywhere (§2.1)", () => {
    expect(invoiceTotals(INVOICE_FIXTURES.plain.doc).showTax).toBe(false)
  })
})

describe("Per-line rounding", () => {
  it("rounds once per line and never at the subtotal", () => {
    // Three lines that each round up. Summing rounded lines (3 × 48 = 144) is
    // the contract; rounding the summed gross would give 143 (06 §7).
    const doc = {
      ...INVOICE_FIXTURES.completed.doc,
      lines: [1, 2, 3].map((i) => ({
        id: `l${i}`,
        description: `Line ${i}`,
        qty: 1,
        unitGrossMinor: 1000,
        lineGrossMinor: 1000,
        taxable: true,
      })),
      tenders: [],
    }
    const t = invoiceTotals(doc)
    expect(vatOf(1000, 0.05)).toBe(48)
    expect(t.vatMinor).toBe(144)
    expect(vatOf(3000, 0.05)).toBe(143)
  })
})

describe("§9 Q6 — a refund reverses the tip too (ruling 2026-08-21)", () => {
  const t = invoiceTotals(INVOICE_FIXTURES["credit-note-tip"].doc)

  it("reverses the tip alongside the taxable amount", () => {
    expect(formatInvoiceAmount(t.tipMinor)).toBe("− AED 5.00")
    expect(formatInvoiceAmount(t.amountDueMinor)).toBe("− AED 25.00")
  })

  it("keeps the reversed VAT on the line only, never on the tip", () => {
    // 0.95 is 5/105 of the 20.00 line. If the tip had leaked into the base this
    // would be 1.19 — the exact error the two-row totals block prevents.
    expect(formatInvoiceAmount(t.vatMinor)).toBe("− AED 0.95")
  })

  it("settles against the combined refund tender", () => {
    expect(t.balanceMinor).toBe(0)
  })
})

describe("§9 Q7 — zero-gross package redemption with a tip (live Sale 387)", () => {
  const t = invoiceTotals(INVOICE_FIXTURES["zero-value-tip"].doc)

  it("names the tip instead of folding it into the total", () => {
    // What live Cami renders today is Subtotal 100.00 / Total 105.00 with no row
    // explaining the 5.00. Because 5% of 100.00 is exactly 5.00, that tip is
    // indistinguishable from VAT on the page.
    expect(formatInvoiceAmount(t.totalInclVatMinor)).toBe("AED 0.00")
    expect(formatInvoiceAmount(t.tipMinor)).toBe("AED 5.00")
    expect(formatInvoiceAmount(t.amountDueMinor)).toBe("AED 5.00")
  })

  it("derives no VAT, because the redeemed line is zero-gross", () => {
    expect(t.vatMinor).toBe(0)
  })

  it("shows what the service was worth at full retail", () => {
    expect(formatInvoiceAmount(t.itemsTotalMinor)).toBe("AED 100.00")
  })

  it("settles with only the tip tendered", () => {
    expect(t.collectedMinor).toBe(500)
    expect(t.balanceMinor).toBe(0)
  })
})
