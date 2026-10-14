/**
 * The draft a deal is built from, and the steps that collect it (DW3.4).
 *
 * `deal-wizard.types.ts` on the dev repo's `promotion-discount-ui`, with one
 * step added.
 *
 * The built wizard runs details → limits and creates every deal with
 * `locationIds: []`. Under its own mapper that empty array means *every venue*,
 * so a chain-wide offer and a deal nobody scoped are the same saved row — the
 * reading R24 forbids. So a **locations** step follows limits.
 */

import {
  DEFAULT_DEAL_APPLICABILITY,
  DEFAULT_DEAL_LIMITS,
  type Deal,
  type DealApplicability,
  type DealLimits,
  type DealType,
  type DiscountKind,
  statusFor,
} from "@/lib/deals/mock"
import type { PromotionScope } from "@/lib/locations/promotion-scope"

export type ScopeKind = "services" | "products" | "packages"

export type DealWizardStepId = "details" | "limits" | "locations"

/**
 * The built product's two steps, then locations.
 *
 * It also has `type` and `team` steps, filtered out of its flow: every deal is
 * created as a Promotion, and the Promotions API has no per-team-member scoping
 * yet. They stay out here too.
 */
export const DEAL_WIZARD_STEPS: DealWizardStepId[] = ["details", "limits", "locations"]

export type DealWizardDraft = {
  type: DealType
  name: string
  description: string
  discountKind: DiscountKind
  /** A string, so the field can be empty — a number state forces a 0 into it. */
  discountValue: string
  discountCode: string
  startDate: string
  endDate: string
  enableAtPointOfSale: boolean
  bookingRedeemable: boolean
  applicability: DealApplicability
  limits: DealLimits
  scope: PromotionScope
  teamMemberIds: string[]
}

export function createEmptyDealDraft(todayIso: string): DealWizardDraft {
  return {
    type: "promotion",
    name: "",
    description: "",
    discountKind: "percentage",
    discountValue: "",
    discountCode: "",
    startDate: todayIso,
    endDate: "",
    enableAtPointOfSale: true,
    // Staff-only until somebody decides to hand the code out (D10).
    bookingRedeemable: false,
    applicability: DEFAULT_DEAL_APPLICABILITY,
    limits: DEFAULT_DEAL_LIMITS,
    // A new deal starts chain-wide, which is the commonest case and the only
    // safe default: the alternative — an empty branch list — is the shape that
    // means "nowhere" here and "everywhere" across the seam.
    scope: { kind: "estate" },
    teamMemberIds: [],
  }
}

/** Prefills the wizard from an existing deal, for editing. */
export function dealToWizardDraft(deal: Deal): DealWizardDraft {
  return {
    type: deal.type,
    name: deal.name,
    description: deal.description,
    discountKind: deal.discountKind,
    discountValue: String(deal.discountValue),
    discountCode: deal.discountCode,
    startDate: deal.startDate,
    endDate: deal.endDate ?? "",
    enableAtPointOfSale: deal.enableAtPointOfSale,
    bookingRedeemable: deal.bookingRedeemable,
    applicability: deal.applicability,
    limits: deal.limits,
    scope: deal.scope,
    teamMemberIds: [...deal.teamMemberIds],
  }
}

/**
 * What is wrong with the code, if anything (DZ-200 D10, and the dev repo's
 * 3–20 character rule).
 *
 * Optional for a deal only the team applies; required the moment clients may
 * enter it online, because a booking-page promotion with no code is one nobody
 * can reach.
 */
export function discountCodeError(code: string, bookingRedeemable: boolean): string | null {
  const trimmed = code.trim()
  if (trimmed.length === 0) {
    return bookingRedeemable ? "Add a code for clients to enter when they book." : null
  }
  if (trimmed.length < 3 || trimmed.length > 20) {
    return "Discount code must be between 3 and 20 characters."
  }
  return null
}

/**
 * Whether the minimum purchase is below a fixed discount
 * (`minPurchaseBelowFixedDiscount` on the dev repo). A AED 50 discount on a
 * AED 30 minimum would take more off than the client has to spend.
 */
export function minPurchaseBelowFixedDiscount(
  limits: DealLimits,
  fixedDiscountValue: number | null | undefined,
): boolean {
  return (
    limits.minimumPurchaseEnabled &&
    limits.minimumPurchaseAmount != null &&
    fixedDiscountValue != null &&
    fixedDiscountValue > 0 &&
    limits.minimumPurchaseAmount < fixedDiscountValue
  )
}

/**
 * Whether this step may be left, and what is missing if not.
 *
 * The built wizard's `detailsValid` / `limitsValid` gates, one step at a time.
 * The screen disables Continue and shows each error beside its own field.
 */
export function stepBlocker(step: DealWizardStepId, draft: DealWizardDraft): string | null {
  if (step === "details") {
    if (draft.name.trim().length === 0) return "Give the deal a name."
    const value = Number(draft.discountValue)
    if (!Number.isFinite(value) || value <= 0) return "Enter a value greater than 0."
    if (draft.discountKind === "percentage" && value > 100) {
      return "A percentage discount can't exceed 100%."
    }
    const codeError = discountCodeError(draft.discountCode, draft.bookingRedeemable)
    if (codeError) return codeError
    if (draft.startDate.trim().length === 0) return "Give the deal a start date."
    if (draft.endDate && draft.endDate < draft.startDate) {
      return "End date must be on or after the start date."
    }
    const a = draft.applicability
    if (a.services.mode === "none" && a.products.mode === "none" && a.packages.mode === "none") {
      return "Select at least one service, product or package."
    }
    return null
  }
  if (step === "limits") {
    if (draft.limits.totalUsesEnabled && !(draft.limits.totalUses && draft.limits.totalUses > 0)) {
      return "Enter a number greater than 0."
    }
    if (
      draft.limits.minimumPurchaseEnabled &&
      !(draft.limits.minimumPurchaseAmount && draft.limits.minimumPurchaseAmount > 0)
    ) {
      return "Enter an amount greater than 0."
    }
    if (
      minPurchaseBelowFixedDiscount(
        draft.limits,
        draft.discountKind === "fixed" ? Number(draft.discountValue) : null,
      )
    ) {
      return "Minimum purchase amount must be at least the discount value."
    }
    return null
  }
  if (step === "locations") {
    // The one rule this repo exists to enforce. An empty branch list is not a
    // broad deal — it is a deal nobody can use, and saving it stores a row
    // whose meaning depends on who reads it (R24).
    if (draft.scope.kind === "branches" && draft.scope.locationIds.length === 0) {
      return "Select at least one location."
    }
    return null
  }
  return null
}

/** Turn a finished draft into a stored deal. */
export function draftToDeal(draft: DealWizardDraft, todayIso: string, existing?: Deal): Deal {
  const value = Number(draft.discountValue)
  return {
    id: existing?.id ?? `deal-${Date.now()}`,
    type: draft.type,
    name: draft.name.trim(),
    description: draft.description.trim(),
    discountKind: draft.discountKind,
    discountValue: Number.isFinite(value) ? value : 0,
    discountCode: draft.discountCode.trim().toUpperCase(),
    enableAtPointOfSale: draft.enableAtPointOfSale,
    bookingRedeemable: draft.bookingRedeemable,
    // Derived from the dates, never typed in — a deal whose end has passed
    // would otherwise read Active until somebody edited it. An existing deal
    // keeps a status somebody set by hand (`statusFor` lets a stored
    // inactive/archived win), so re-dating one does not quietly restart it.
    status: statusFor(
      existing?.status ?? "scheduled",
      draft.startDate,
      draft.endDate || null,
      todayIso,
    ),
    startDate: draft.startDate,
    endDate: draft.endDate || null,
    scope: draft.scope,
    applicability: draft.applicability,
    limits: draft.limits,
    teamMemberIds: [...draft.teamMemberIds],
    redemptions: existing?.redemptions ?? 0,
    totalSalesMinor: existing?.totalSalesMinor ?? 0,
    totalClients: existing?.totalClients ?? 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
}
