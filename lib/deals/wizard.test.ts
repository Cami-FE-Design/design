import { describe, expect, it } from "vitest"
import { MOCK_DEALS } from "@/lib/deals/mock"
import {
  createEmptyDealDraft,
  DEAL_WIZARD_STEPS,
  type DealWizardDraft,
  dealToWizardDraft,
  draftToDeal,
  stepBlocker,
} from "@/lib/deals/wizard"

/**
 * The wizard's rules (DW3.4, R24).
 *
 * Five steps against the built product's four. The added one is **locations**,
 * and it is this ticket: the built wizard creates every deal with
 * `locationIds: []`, which its own mapper reads as every venue — so a
 * chain-wide offer and a deal nobody scoped save as the same row.
 */

const TODAY = "2026-08-24"

const draft = (over: Partial<DealWizardDraft> = {}): DealWizardDraft => ({
  ...createEmptyDealDraft(TODAY),
  name: "Spring refresh",
  discountValue: "15",
  ...over,
})

describe("the steps", () => {
  it("asks where it runs before who sells it", () => {
    // Reach is a decision about money. Confirming it on the way out, after the
    // team roster, is how it becomes a formality nobody reads.
    expect(DEAL_WIZARD_STEPS).toEqual(["type", "details", "limits", "locations", "team"])
  })

  it("starts a new deal chain-wide, never on an empty branch list", () => {
    // The only safe default: an empty list means "nowhere" here and
    // "everywhere" across the seam, so it is not a state to start in.
    expect(createEmptyDealDraft(TODAY).scope).toEqual({ kind: "estate" })
  })
})

describe("the details step names what is missing", () => {
  it("asks for a name", () => {
    expect(stepBlocker("details", draft({ name: "  " }))).toBe("Give the deal a name.")
  })

  it("asks for a discount value", () => {
    expect(stepBlocker("details", draft({ discountValue: "" }))).toBe("Enter a discount value.")
  })

  it("refuses a percentage over 100", () => {
    expect(stepBlocker("details", draft({ discountValue: "150" }))).toBe(
      "A percentage discount cannot exceed 100%.",
    )
  })

  it("takes the same 150 as a fixed amount, because AED 150 off is ordinary", () => {
    expect(
      stepBlocker("details", draft({ discountKind: "fixed", discountValue: "150" })),
    ).toBeNull()
  })

  it("refuses an end before the start", () => {
    expect(stepBlocker("details", draft({ startDate: "2026-08-01", endDate: "2026-07-01" }))).toBe(
      "An end date cannot precede the start.",
    )
  })

  it("refuses a deal that comes off nothing", () => {
    // The same empty set R24 refuses on the location axis: a deal applying to
    // no kind of line is not a broad deal, it never fires.
    expect(
      stepBlocker(
        "details",
        draft({
          applicability: {
            services: { mode: "none", ids: [] },
            products: { mode: "none", ids: [] },
            packages: { mode: "none", ids: [] },
            giftCardsInStore: false,
          },
        }),
      ),
    ).toBe("Choose at least one thing for this deal to come off.")
  })
})

describe("the limits step refuses a switch with no number behind it", () => {
  it("asks for the total", () => {
    expect(
      stepBlocker(
        "limits",
        draft({ limits: { ...createEmptyDealDraft(TODAY).limits, totalUsesEnabled: true } }),
      ),
    ).toBe("Enter how many uses in total, or switch the limit off.")
  })

  it("asks for the minimum spend", () => {
    expect(
      stepBlocker(
        "limits",
        draft({
          limits: { ...createEmptyDealDraft(TODAY).limits, minimumPurchaseEnabled: true },
        }),
      ),
    ).toBe("Enter a minimum spend, or switch the limit off.")
  })
})

describe("the locations step is the one this ticket added", () => {
  it("refuses an empty branch list, and says what it would mean", () => {
    expect(stepBlocker("locations", draft({ scope: { kind: "branches", locationIds: [] } }))).toBe(
      "Choose at least one location. A deal with none runs nowhere.",
    )
  })

  it("passes one branch", () => {
    expect(
      stepBlocker("locations", draft({ scope: { kind: "branches", locationIds: ["x"] } })),
    ).toBeNull()
  })

  it("passes a chain-wide deal", () => {
    expect(stepBlocker("locations", draft({ scope: { kind: "estate" } }))).toBeNull()
  })
})

describe("turning the draft into a deal", () => {
  it("keeps the kind and the value apart", () => {
    const deal = draftToDeal(draft({ discountKind: "fixed", discountValue: "30" }), TODAY)
    expect(deal.discountKind).toBe("fixed")
    expect(deal.discountValue).toBe(30)
  })

  it("upper-cases the discount code, as the field does while you type", () => {
    expect(draftToDeal(draft({ discountCode: " summer10 " }), TODAY).discountCode).toBe("SUMMER10")
  })

  it("derives the status from the dates rather than trusting a stored one", () => {
    expect(draftToDeal(draft({ startDate: "2026-12-01" }), TODAY).status).toBe("scheduled")
  })

  it("does not restart a deal somebody switched off, just because it was re-dated", () => {
    // `statusFor` lets a stored inactive win, and editing dates is the commonest
    // reason to reopen a stopped deal.
    const stopped = { ...MOCK_DEALS[0], status: "inactive" as const }
    expect(draftToDeal(dealToWizardDraft(stopped), TODAY, stopped).status).toBe("inactive")
  })

  it("keeps an edited deal's id, history and figures", () => {
    const existing = MOCK_DEALS[0]
    const next = draftToDeal({ ...dealToWizardDraft(existing), name: "Renamed" }, TODAY, existing)
    expect(next.id).toBe(existing.id)
    expect(next.name).toBe("Renamed")
    expect(next.redemptions).toBe(existing.redemptions)
    expect(next.totalSalesMinor).toBe(existing.totalSalesMinor)
    expect(next.createdAt).toBe(existing.createdAt)
  })

  it("round-trips a deal's scope through the draft untouched", () => {
    const mirdif = MOCK_DEALS.find((d) => d.id === "mirdif-tuesdays")
    if (!mirdif) throw new Error("fixture missing")
    expect(draftToDeal(dealToWizardDraft(mirdif), TODAY, mirdif).scope).toEqual(mirdif.scope)
  })
})
