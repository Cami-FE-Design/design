import { describe, expect, it } from "vitest"

import {
  applyTaxOverride,
  BUSINESS_TAX_IDENTITY,
  resolveTaxIdentity,
  type TaxIdentityOverrides,
} from "@/lib/locations/tax-identity"
import {
  BRANCH_TIPPING,
  BUSINESS_TIPPING,
  describeTipBase,
  describeTipChannels,
  formatTipValues,
  resolveTipping,
  TIP_CART_ITEMS,
} from "@/lib/locations/tipping"

describe("resolveTipping", () => {
  it("follows the business when the branch has said nothing", () => {
    const resolved = resolveTipping(undefined)
    expect(resolved.mode).toBe("workspace")
    // Not a copy — the same object, so a later change to the default is followed.
    expect(resolved.settings).toBe(BUSINESS_TIPPING)
  })

  it("uses the branch's own once it is custom", () => {
    const resolved = resolveTipping(BRANCH_TIPPING["shampooch-al-quoz"])
    expect(resolved.mode).toBe("custom")
    expect(resolved.settings.values).toEqual([5, 10, 15])
    expect(resolved.settings.atPointOfSale).toBe(false)
  })

  it("seeds one branch differing, so 'workspace' on the others means something", () => {
    const custom = Object.values(BRANCH_TIPPING).filter((b) => b.mode === "custom")
    expect(custom.length).toBeGreaterThan(0)
  })
})

describe("the tipping summary says what is on, not that something is", () => {
  it("names the channels when only some are on", () => {
    expect(describeTipChannels(BUSINESS_TIPPING)).toBe("All options enabled")
    expect(describeTipChannels({ ...BUSINESS_TIPPING, atPointOfSale: false, online: false })).toBe(
      "terminals only",
    )
    expect(
      describeTipChannels({
        ...BUSINESS_TIPPING,
        atPointOfSale: false,
        onTerminals: false,
        online: false,
      }),
    ).toBe("Tipping off everywhere")
  })

  it("names the cart lines rather than counting them", () => {
    expect(describeTipBase(BUSINESS_TIPPING)).toBe("All items included")
    // "1 of 5 item types" would not tell an operator whether products are in it.
    expect(describeTipBase({ ...BUSINESS_TIPPING, cartItems: ["services"] })).toBe("Services only")
    expect(describeTipBase({ ...BUSINESS_TIPPING, cartItems: [] })).toBe("Nothing included")
  })

  it("keeps the tip values in the order a client sees them", () => {
    expect(formatTipValues([10, 18, 25])).toBe("10% · 18% · 25%")
  })

  it("covers every cart item the dialog offers", () => {
    for (const item of TIP_CART_ITEMS) {
      expect(BUSINESS_TIPPING.cartItems).toContain(item.id)
    }
  })
})

describe("applyTaxOverride", () => {
  const jvc = "shampooch-jvc"

  it("sets a field on a branch that had none", () => {
    const next = applyTaxOverride({}, jvc, "receiptPrefix", "JVC")
    expect(next[jvc]).toEqual({ receiptPrefix: "JVC" })
  })

  it("deletes the key on reset rather than writing the business value", () => {
    const start: Record<string, TaxIdentityOverrides> = {
      [jvc]: { receiptPrefix: "JVC", trn: "999" },
    }
    const next = applyTaxOverride(start, jvc, "receiptPrefix", undefined)
    expect(next[jvc]).toEqual({ trn: "999" })
    // The whole point: the field resolves to the business again, and follows it.
    expect(resolveTaxIdentity(BUSINESS_TAX_IDENTITY, next[jvc]).source.receiptPrefix).toBe(
      "business",
    )
  })

  it("drops the branch entirely once nothing is overridden", () => {
    const start: Record<string, TaxIdentityOverrides> = { [jvc]: { receiptPrefix: "JVC" } }
    const next = applyTaxOverride(start, jvc, "receiptPrefix", undefined)
    // Not an empty object — no row at all, so "inherits everything" is a fact
    // about the data rather than a count of rows that say nothing.
    expect(jvc in next).toBe(false)
  })

  it("leaves every other branch alone", () => {
    const start: Record<string, TaxIdentityOverrides> = {
      [jvc]: { receiptPrefix: "JVC" },
      "shampooch-jumeirah": { receiptPrefix: "JUM", trn: "100" },
    }
    const next = applyTaxOverride(start, jvc, "trn", "555")
    expect(next["shampooch-jumeirah"]).toEqual(start["shampooch-jumeirah"])
  })

  it("does not mutate what it was given", () => {
    const start: Record<string, TaxIdentityOverrides> = { [jvc]: { receiptPrefix: "JVC" } }
    applyTaxOverride(start, jvc, "trn", "555")
    expect(start[jvc]).toEqual({ receiptPrefix: "JVC" })
  })
})
