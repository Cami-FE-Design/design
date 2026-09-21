import { describe, expect, it } from "vitest"

import {
  BUSINESS_TAX_IDENTITY,
  formatReceiptNumber,
  LOCATION_TAX_OVERRIDES,
  resolveTaxIdentity,
  type TaxIdentity,
  taxOverrideCount,
} from "@/lib/locations/tax-identity"

const businessDefault: TaxIdentity = {
  legalName: "Shampooch Trading LLC",
  trn: "100123456700003",
  invoiceAddress: "Office 504, JLT",
  receiptPrefix: "SHP",
  servicesVatRate: "VAT (5%)",
  productsVatRate: "VAT (5%)",
}

describe("resolveTaxIdentity", () => {
  it("gives an unconfigured branch the business identity on every field", () => {
    const { value, source } = resolveTaxIdentity(businessDefault, undefined)
    expect(value).toEqual(businessDefault)
    expect(Object.values(source).every((s) => s === "business")).toBe(true)
  })

  it("resolves the branch value ahead of the business value, per field", () => {
    // The common case: one legal entity, receipts differentiated by prefix.
    const { value, source } = resolveTaxIdentity(businessDefault, { receiptPrefix: "JVC" })
    expect(value.receiptPrefix).toBe("JVC")
    expect(value.legalName).toBe(businessDefault.legalName)
    expect(source.receiptPrefix).toBe("location")
    expect(source.legalName).toBe("business")
  })

  it("supports a branch that is genuinely its own fiscal identity", () => {
    // "Let's keep this flexible. It will allow us to add unique tax numbers /
    // VAT" — a branch can be a separate registered company (R23).
    const { value, source } = resolveTaxIdentity(businessDefault, {
      legalName: "Shampooch Jumeirah LLC",
      trn: "100998877600001",
    })
    expect(value.legalName).toBe("Shampooch Jumeirah LLC")
    expect(value.trn).toBe("100998877600001")
    expect(source.trn).toBe("location")
    // Still inherits what it did not override.
    expect(value.invoiceAddress).toBe(businessDefault.invoiceAddress)
  })

  it("does not let an explicitly-undefined override blank a default", () => {
    // `{...defaults, ...overrides}` would, and the difference between "no
    // opinion" and "empty" matters on a field that prints on a VAT invoice.
    const { value, source } = resolveTaxIdentity(businessDefault, { trn: undefined })
    expect(value.trn).toBe(businessDefault.trn)
    expect(source.trn).toBe("business")
  })

  it("follows a changed business default on inherited fields only", () => {
    const overrides = { receiptPrefix: "JVC" }
    const raised: TaxIdentity = { ...businessDefault, servicesVatRate: "VAT (7.5%)" }
    const { value } = resolveTaxIdentity(raised, overrides)
    expect(value.servicesVatRate).toBe("VAT (7.5%)")
    expect(value.receiptPrefix).toBe("JVC")
  })
})

describe("taxOverrideCount", () => {
  it("counts only fields the branch holds its own value for", () => {
    expect(taxOverrideCount(undefined)).toBe(0)
    expect(taxOverrideCount({})).toBe(0)
    expect(taxOverrideCount({ receiptPrefix: "JVC" })).toBe(1)
    expect(taxOverrideCount(LOCATION_TAX_OVERRIDES["shampooch-jumeirah"])).toBe(3)
  })
})

describe("formatReceiptNumber", () => {
  it("prints the prefix and a padded sequence", () => {
    // The prefix is the whole point of a per-branch sequence: two branches at
    // 21857 do not collide because the printed number differs (R23, R25).
    expect(formatReceiptNumber("JVC", 21857)).toBe("JVC-021857")
    expect(formatReceiptNumber("JUM", 21857)).toBe("JUM-021857")
    expect(formatReceiptNumber("JVC", 1)).toBe("JVC-000001")
  })
})

describe("the seeded estate", () => {
  it("has one branch following the business entity and one that is separate", () => {
    // Both cases on screen at once, which is what the "keep it flexible"
    // decision exists to support.
    const jvc = resolveTaxIdentity(BUSINESS_TAX_IDENTITY, LOCATION_TAX_OVERRIDES["shampooch-jvc"])
    const jum = resolveTaxIdentity(
      BUSINESS_TAX_IDENTITY,
      LOCATION_TAX_OVERRIDES["shampooch-jumeirah"],
    )
    expect(jvc.source.trn).toBe("business")
    expect(jum.source.trn).toBe("location")
    expect(jvc.value.receiptPrefix).not.toBe(jum.value.receiptPrefix)
  })
})
