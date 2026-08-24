// Pins the billing details rules (DSG-74).
//
// Small surface, large blast radius: these four values are printed on every tax
// invoice the merchant sends and every invoice Cami sends them.

import { describe, expect, it } from "vitest"
import { addressToLines } from "@/lib/address"
import { INVOICE_FIXTURES } from "@/lib/invoice/mock"
import { documentTitle, showsLineTaxColumns } from "@/lib/invoice/totals"
import {
  canIssueTaxInvoice,
  DEMO_BILLING_DETAILS,
  DEMO_BILLING_DETAILS_EMPTY,
  DEMO_BILLING_DETAILS_NO_TRN,
  issuerFrom,
  missingFields,
} from "./billing-details"

describe("a missing field is a state, not a blank (T1-1)", () => {
  it("names what is missing, in the order to ask for it", () => {
    expect(missingFields(DEMO_BILLING_DETAILS)).toEqual([])
    expect(missingFields(DEMO_BILLING_DETAILS_NO_TRN)).toEqual(["TRN"])
    expect(missingFields(DEMO_BILLING_DETAILS_EMPTY)).toEqual([
      "Legal name",
      "TRN",
      "Registered address",
    ])
  })
})

describe("what a missing TRN actually costs", () => {
  it("blocks a compliant tax invoice", () => {
    expect(canIssueTaxInvoice(DEMO_BILLING_DETAILS)).toBe(true)
    expect(canIssueTaxInvoice(DEMO_BILLING_DETAILS_NO_TRN)).toBe(false)
    expect(canIssueTaxInvoice(DEMO_BILLING_DETAILS_EMPTY)).toBe(false)
  })

  it("changes the document itself, not just a settings row", () => {
    // The consequence the screen claims, checked against DSG-72's own gate: no
    // TRN means a plain invoice, with no tax wording and no tax columns.
    const completed = INVOICE_FIXTURES.completed.doc
    const plain = { ...completed, type: "plain" as const }
    expect(documentTitle(plain)).toBe("Invoice")
    expect(showsLineTaxColumns(plain)).toBe(false)

    expect(documentTitle(completed)).toBe("Tax Invoice")
  })
})

describe("the invoice document's issuer comes from here (the wiring point)", () => {
  it("produces exactly the shape the document needs", () => {
    const issuer = issuerFrom(DEMO_BILLING_DETAILS)
    expect(issuer.legalName).toBe(DEMO_BILLING_DETAILS.legalName)
    expect(issuer.trn).toBe(DEMO_BILLING_DETAILS.trn)
    expect(issuer.addressLines).toEqual(addressToLines(DEMO_BILLING_DETAILS.address))
    // The trading name is a separate field — a document that prints the trading
    // name where the legal name belongs is not a valid tax invoice.
    expect(issuer.tradingName).toBe(DEMO_BILLING_DETAILS.tradingName)
    expect(issuer.legalName).not.toBe(issuer.tradingName)
  })

  it("carries no TRN through when there is none, rather than an empty string", () => {
    // An empty string would make the document think it has a TRN and render a
    // tax invoice with a blank registration number on it.
    expect(issuerFrom(DEMO_BILLING_DETAILS_NO_TRN).trn).toBeUndefined()
  })
})

describe("attribution (T1-3, INV-08)", () => {
  it("records who last changed the legal identity, and when", () => {
    expect(DEMO_BILLING_DETAILS.updatedBy).toBeTruthy()
    expect(DEMO_BILLING_DETAILS.updatedAtIso).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
