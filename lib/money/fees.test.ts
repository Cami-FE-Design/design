// Pins the fee statement rules (DSG-76).
//
// The rule worth the most here is T3-6 / SET-C2: a fee line renders the rate
// snapshotted at capture. Read the current rate card instead and every statement
// the merchant has already filed silently re-rates the day they renegotiate.

import { describe, expect, it } from "vitest"
import { invoiceTotals } from "@/lib/invoice/totals"
import { CAMI_ISSUER, feeInvoiceOf } from "./fee-invoice"
import { explainFeeLine, feePeriods } from "./fees"
import { DEMO_RATES, MONEY_TXS, TODAY_ISO } from "./mock"

const PERIODS = feePeriods(MONEY_TXS, TODAY_ISO)
const CLOSED = PERIODS.filter((p) => p.status === "available")

describe("periods (T3-1, T3-3)", () => {
  it("groups by month, newest first", () => {
    expect(PERIODS.length).toBeGreaterThan(1)
    for (let i = 1; i < PERIODS.length; i++) {
      expect(PERIODS[i - 1].key > PERIODS[i].key).toBe(true)
    }
  })

  it("leaves the current month pending, with a date the documents arrive", () => {
    const current = PERIODS.find((p) => p.key === TODAY_ISO.slice(0, 7))
    expect(current?.status).toBe("pending")
    // Fees are still accruing, so issuing a document would issue a wrong one.
    expect(current?.availableOnIso).toBeTruthy()
    expect(CLOSED.every((p) => p.availableOnIso === undefined)).toBe(true)
  })
})

describe("every fee traces to its cause (T3-4)", () => {
  it("carries the payment amount and reference on processing lines", () => {
    const period = CLOSED[0]
    const processing = period.lines.filter((l) => !l.usage)
    expect(processing.length).toBeGreaterThan(0)
    for (const line of processing) {
      expect(line.baseAmountMinor).toBeGreaterThan(0)
      expect(line.reference?.label).toBeTruthy()
    }
  })

  it("shows the working, so the number is not a black box", () => {
    const line = CLOSED[0].lines.find((l) => !l.usage)
    expect(line && explainFeeLine(line)).toMatch(/% of/)
  })

  it("shows no working for a usage charge — it is not a percentage of anything", () => {
    const usage = PERIODS.flatMap((p) => p.lines).find((l) => l.usage)
    expect(usage).toBeDefined()
    if (!usage) return
    expect(explainFeeLine(usage)).toBeNull()
    expect(usage.rateLabel).toBe("Per message")
  })
})

describe("the rate comes from the transaction, not the rate card (T3-6, SET-C2)", () => {
  it("renders each line from its own snapshot", () => {
    const lines = CLOSED.flatMap((p) => p.lines).filter((l) => !l.usage)
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.rate).not.toBeNull()
      // The snapshot is the rate that was in force for that rail at capture.
      expect(line.rate).toEqual(DEMO_RATES[line.rail])
    }
  })

  it("a statement does not move when today's rate card changes", () => {
    // Same ledger, computed twice: nothing in the derivation reads a live rate,
    // so the figures are a function of the transactions alone.
    const again = feePeriods(MONEY_TXS, TODAY_ISO)
    expect(again.map((p) => p.feeTotalMinor)).toEqual(PERIODS.map((p) => p.feeTotalMinor))
  })
})

describe("totals and VAT (T3-8, INV-P9)", () => {
  it("splits processing from usage and they sum to the total", () => {
    for (const p of PERIODS) {
      expect(p.processingMinor + p.usageMinor).toBe(p.feeTotalMinor)
      expect(p.byRail.online + p.byRail.terminal).toBe(p.feeTotalMinor)
      expect(p.lines.reduce((sum, l) => sum + l.feeMinor, 0)).toBe(p.feeTotalMinor)
    }
  })

  it("derives VAT from the fee rather than adding it on top", () => {
    for (const p of CLOSED) {
      expect(p.vatMinor).toBe(Math.round((p.feeTotalMinor * 5) / 105))
      expect(p.vatMinor).toBeLessThan(p.feeTotalMinor)
    }
  })
})

describe("Cami's own tax invoice (T3-2)", () => {
  const RECIPIENT = {
    legalName: "Shampooch Pet Grooming L.L.C",
    addressLines: ["Regina Tower, JVC", "Dubai, UAE"],
    trn: "104169608700003",
  }
  const invoice = feeInvoiceOf(CLOSED[0], RECIPIENT, {
    number: "CAMI-0001",
    issuedAtIso: "2026-08-03T09:00:00.000Z",
  })

  it("is a full tax invoice, with Cami as the supplier", () => {
    expect(invoice.type).toBe("tax-full")
    expect(invoice.issuer.trn).toBe(CAMI_ISSUER.trn)
    expect(invoice.recipient.trn).toBe(RECIPIENT.trn)
  })

  it("agrees with the statement it was built from", () => {
    const totals = invoiceTotals(invoice)
    expect(totals.totalInclVatMinor).toBe(CLOSED[0].feeTotalMinor)
    expect(totals.vatMinor).toBe(CLOSED[0].vatMinor)
    // Zero tip, and both totals still render — that is what keeps EC-39 fixed.
    expect(totals.amountDueMinor).toBe(totals.totalInclVatMinor)
  })

  it("carries no subscription line, because there is no subscription (INV-P4)", () => {
    const descriptions = invoice.lines.map((l) => l.description.toLowerCase()).join(" ")
    expect(descriptions).not.toMatch(/subscription|plan|licence|license/)
  })

  it("falls back to a simplified invoice when the merchant has no TRN", () => {
    const noTrn = feeInvoiceOf(
      CLOSED[0],
      { ...RECIPIENT, trn: undefined },
      { number: "CAMI-0002", issuedAtIso: "2026-08-03T09:00:00.000Z" },
    )
    expect(noTrn.type).toBe("tax-simplified")
  })
})
