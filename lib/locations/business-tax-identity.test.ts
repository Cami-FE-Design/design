import { describe, expect, it } from "vitest"
import {
  BUSINESS_TAX_IDENTITY,
  businessTaxIdentityFor,
  LOCATION_TAX_OVERRIDES,
  resolveTaxIdentity,
} from "@/lib/locations/tax-identity"

describe("a tax identity belongs to its business, not to the estate", () => {
  it("gives another business its own legal entity and TRN", () => {
    // This read "Shampooch Trading LLC" on Purr Palace's own Invoicing tab —
    // another company's legal identity on the one screen that exists to state
    // one, and on their receipts with it.
    const purr = businessTaxIdentityFor("purr-palace")
    expect(purr.legalName).toBe("Purr Palace Pet Care L.L.C.")
    expect(purr.trn).not.toBe(BUSINESS_TAX_IDENTITY.trn)
    expect(businessTaxIdentityFor("sota").legalName).toBe("Sota Hair Studio L.L.C.")
  })

  it("keeps every Shampooch branch on Shampooch's", () => {
    for (const id of ["shampooch-jvc", "shampooch-mirdif", "shampooch-al-majaz"]) {
      expect(businessTaxIdentityFor(id).legalName).toBe(BUSINESS_TAX_IDENTITY.legalName)
    }
  })

  it("gives each business its own receipt prefix, so two cannot collide", () => {
    const prefixes = ["shampooch-jvc", "purr-palace", "sota"].map(
      (id) => businessTaxIdentityFor(id).receiptPrefix,
    )
    expect(new Set(prefixes).size).toBe(prefixes.length)
  })

  it("still lets a branch override its business's default (R23)", () => {
    // Inheritance is per field: Jumeirah is separately registered, and that has
    // to keep working now the default is resolved rather than constant.
    const resolved = resolveTaxIdentity(
      businessTaxIdentityFor("shampooch-jumeirah"),
      LOCATION_TAX_OVERRIDES["shampooch-jumeirah"],
    )
    expect(resolved.value.legalName).toBe("Shampooch Jumeirah LLC")
    expect(resolved.source.legalName).toBe("location")
    // Untouched fields still say where they came from.
    expect(resolved.source.invoiceAddress).toBe("business")
  })

  it("falls back to the business default for a branch nobody has placed", () => {
    expect(businessTaxIdentityFor("a-branch-that-does-not-exist")).toEqual(BUSINESS_TAX_IDENTITY)
  })
})
