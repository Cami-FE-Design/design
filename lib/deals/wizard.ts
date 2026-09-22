/**
 * The draft a deal is built from, and the steps that collect it (DW3.4).
 *
 * `deal-wizard.types.ts` on the dev repo's `promotion-discount-ui`, with one
 * step added and one kept honest.
 *
 * ## The added step, and why it is not optional here
 *
 * The built wizard has four steps — type, details, limits, team — and creates
 * every deal with `locationIds: []`. Under its own mapper that empty array
 * means *every venue*, so a chain-wide offer and a deal nobody scoped are the
 * same saved row. That is precisely the reading R24 forbids, and it is why the
 * Availability tab's Locations row can only ever say "All locations" and its
 * Edit button says editing is coming soon.
 *
 * So there is a **locations** step, and it is not last: a promotion's reach is
 * a decision about money, not a detail to confirm on the way out.
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

export type DealWizardStepId = "type" | "details" | "limits" | "locations" | "team"

/**
 * Every step, in order.
 *
 * The built product filters `type` and `team` out of this list — every deal is
 * created as a Promotion, and the Promotions API has no per-team-member scoping
 * yet, so collecting `teamMemberIds` there would be silently dropped on save.
 * Both steps stay in its codebase behind that filter.
 *
 * This is a prototype and nothing is dropped on save, so all five run. The
 * comment matters more than the list: if this is ever wired to that API, `team`
 * is the one that stops meaning anything.
 */
export const DEAL_WIZARD_STEPS: DealWizardStepId[] = [
  "type",
  "details",
  "limits",
  "locations",
  "team",
]

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
    applicability: deal.applicability,
    limits: deal.limits,
    scope: deal.scope,
    teamMemberIds: [...deal.teamMemberIds],
  }
}

/**
 * Whether this step may be left, and what is missing if not.
 *
 * A reason per step rather than one disabled Continue: the built wizard greys
 * the button out on the details step and says nothing, which on a form of eight
 * fields leaves the reader hunting. Each blocker here names the field.
 */
export function stepBlocker(step: DealWizardStepId, draft: DealWizardDraft): string | null {
  if (step === "details") {
    if (draft.name.trim().length === 0) return "Give the deal a name."
    const value = Number(draft.discountValue)
    if (!Number.isFinite(value) || value <= 0) return "Enter a discount value."
    if (draft.discountKind === "percentage" && value > 100) {
      return "A percentage discount cannot exceed 100%."
    }
    if (draft.startDate.trim().length === 0) return "Give the deal a start date."
    if (draft.endDate && draft.endDate < draft.startDate) {
      return "An end date cannot precede the start."
    }
    const a = draft.applicability
    if (
      a.services.mode === "none" &&
      a.products.mode === "none" &&
      a.packages.mode === "none" &&
      !a.giftCardsInStore
    ) {
      return "Choose at least one thing for this deal to come off."
    }
    return null
  }
  if (step === "limits") {
    if (draft.limits.totalUsesEnabled && !draft.limits.totalUses) {
      return "Enter how many uses in total, or switch the limit off."
    }
    if (draft.limits.minimumPurchaseEnabled && !draft.limits.minimumPurchaseAmount) {
      return "Enter a minimum spend, or switch the limit off."
    }
    return null
  }
  if (step === "locations") {
    // The one rule this repo exists to enforce. An empty branch list is not a
    // broad deal — it is a deal nobody can use, and saving it stores a row
    // whose meaning depends on who reads it (R24).
    if (draft.scope.kind === "branches" && draft.scope.locationIds.length === 0) {
      return "Choose at least one location. A deal with none runs nowhere."
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
