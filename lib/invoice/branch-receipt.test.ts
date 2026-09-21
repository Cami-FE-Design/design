import { describe, expect, it } from "vitest"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { invoiceFromSale } from "@/lib/invoice/from-sale"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { BUSINESS_TAX_IDENTITY } from "@/lib/locations/tax-identity"

const saleAt = (locationId: string) => {
  const sale = MOCK_SALES.find((s) => s.locationId === locationId)
  if (!sale) throw new Error(`no seeded sale at ${locationId}`)
  return sale
}

describe("a receipt carries its own branch's identity (G6, R23, R25)", () => {
  it("prefixes the number with the branch's own prefix", () => {
    // Two branches issuing their nth receipt on the same day must not produce
    // the same number — the whole reason the sequence is not one business-wide
    // counter.
    expect(invoiceFromSale(saleAt("shampooch-jvc")).number).toMatch(/^JVC-\d{6}$/)
    expect(invoiceFromSale(saleAt("shampooch-jumeirah")).number).toMatch(/^JUM-\d{6}$/)
  })

  it("falls back to the business prefix where a branch has not overridden one", () => {
    // Adding branch N costs nothing (R02): an unconfigured branch trades under
    // the business identity rather than waiting to be set up.
    //
    // A branch id that is deliberately not in the estate, because every seeded
    // branch now carries its own prefix — seven of them shared the business
    // default before, which is the one thing a per-branch prefix exists to
    // prevent. The rule being asserted is about a branch nobody has configured
    // yet, so the fixture has to be one.
    // Built rather than looked up: every branch in the estate now has a prefix,
    // so a tenth branch — one nobody has configured — is what this rule is
    // about, and the seed has none by definition.
    const doc = invoiceFromSale({ ...saleAt("shampooch-jvc"), locationId: "shampooch-branch-ten" })
    expect(doc.number.startsWith(`${BUSINESS_TAX_IDENTITY.receiptPrefix}-`)).toBe(true)
  })

  it("gives every seeded branch a prefix of its own", () => {
    // Two receipts from two branches have to be tellable apart by an
    // accountant holding both (R23). Seven branches under one "SHP" is not a
    // differentiated receipt, it is a business-wide one with extra steps.
    const anySale = saleAt("shampooch-jvc")
    const prefixes = NINE_BRANCH_ESTATE.map(
      (l) => invoiceFromSale({ ...anySale, locationId: l.id }).number.split("-")[0],
    )
    expect(new Set(prefixes).size).toBe(NINE_BRANCH_ESTATE.length)
  })

  it("issues under the branch's own legal entity when it has one", () => {
    // Jumeirah is separately registered. A receipt naming the group's entity
    // would be wrong on the one document that has to be right.
    expect(invoiceFromSale(saleAt("shampooch-jumeirah")).issuer.legalName).toBe(
      "Shampooch Jumeirah LLC",
    )
    expect(invoiceFromSale(saleAt("shampooch-jumeirah")).issuer.trn).toBe("100998877600001")
  })

  it("inherits the business entity everywhere else, per field", () => {
    // JVC overrides only its prefix, so its legal name and TRN still follow the
    // business — inheritance is per field, not per branch (R23, G5's shape).
    const jvc = invoiceFromSale(saleAt("shampooch-jvc"))
    expect(jvc.issuer.legalName).toBe(BUSINESS_TAX_IDENTITY.legalName)
    expect(jvc.issuer.trn).toBe(BUSINESS_TAX_IDENTITY.trn)
    expect(jvc.number.startsWith("JVC-")).toBe(true)
  })

  it("gives two branches different numbers for the same sale id", () => {
    const a = { ...saleAt("shampooch-jvc"), id: 4242, locationId: "shampooch-jvc" }
    const b = { ...a, locationId: "shampooch-jumeirah" }
    expect(invoiceFromSale(a).number).not.toBe(invoiceFromSale(b).number)
  })

  it("never leaves a seeded sale without a branch", () => {
    // A sale with no branch can carry neither a sequence nor a tax identity,
    // which are the two things a receipt legally needs.
    expect(MOCK_SALES.every((s) => s.locationId.length > 0)).toBe(true)
  })
})
