/**
 * A branch's own deposit percentage (DW3.5, R06, INV-13).
 *
 * ## Why a branch needs its own
 *
 * The story is an owner's: "set a branch's own deposit percentage separate from
 * the business default, so that a branch needing a different rule is not stuck
 * with the business-wide one." The case is concrete — a branch with a no-show
 * problem, or one doing long boarding stays where a 20% deposit is a different
 * amount of money from 20% of a nail trim.
 *
 * ## Nearest wins, and inherited means live
 *
 * The same rule the service catalogue runs on (INV-13): the branch value
 * resolves ahead of the business value, and a branch that has not overridden
 * *follows* the business rather than holding a copy of today's number. Raising
 * the business default to 25% moves every inheriting branch and leaves the one
 * that deliberately differs alone — which is the whole point of an override,
 * and the thing a snapshot would quietly break.
 *
 * Modelled on `tipping.ts` deliberately, rather than inventing a second shape
 * for the same idea. Two per-branch overrides that read differently are two
 * things for an operator to learn where there is one rule.
 */

export type DepositMode = "workspace" | "custom"

export type DepositSettings = {
  /** Percentage of the booking taken upfront. */
  percent: number
  /** Below this, no deposit is asked for at all. `0` means always. */
  minBookingAed: number
  refundRule: "non-refundable" | "refundable-24h" | "refundable-48h"
}

export type BranchDeposit = { mode: "workspace" } | { mode: "custom"; settings: DepositSettings }

export const BUSINESS_DEPOSIT: DepositSettings = {
  percent: 20,
  minBookingAed: 150,
  refundRule: "refundable-24h",
}

/**
 * Seeded so the panel shows both states at once.
 *
 * Al Quoz is boarding and daycare: a stay runs for days and costs multiples of
 * a groom, so 20% of it is a large sum to take upfront and a large sum to
 * refund. It takes half, and only on the longer bookings. One branch differing
 * is what makes "Business default" on the other eight mean anything.
 */
export const BRANCH_DEPOSIT: Record<string, BranchDeposit> = {
  "shampooch-al-quoz": {
    mode: "custom",
    settings: { percent: 10, minBookingAed: 400, refundRule: "refundable-48h" },
  },
}

export function resolveDeposit(branch: BranchDeposit | undefined): {
  mode: DepositMode
  settings: DepositSettings
} {
  if (branch?.mode === "custom") return { mode: "custom", settings: branch.settings }
  return { mode: "workspace", settings: BUSINESS_DEPOSIT }
}

const REFUND_LABEL: Record<DepositSettings["refundRule"], string> = {
  "non-refundable": "Non-refundable",
  "refundable-24h": "Refundable up to 24 hours before",
  "refundable-48h": "Refundable up to 48 hours before",
}

/** One line an owner can read without opening the branch. */
export function describeDeposit(settings: DepositSettings): string {
  const floor =
    settings.minBookingAed > 0
      ? ` on bookings over AED ${settings.minBookingAed.toLocaleString("en-US")}`
      : ""
  return `${settings.percent}%${floor} · ${REFUND_LABEL[settings.refundRule]}`
}

/**
 * Which branches differ from the business default.
 *
 * Named rather than counted: "2 locations differ" sends an owner hunting, and
 * the thing they want to know is *which* — the same reason the money roll-up
 * names its quiet branches instead of dropping them.
 */
export function branchesOverriding(
  overrides: Record<string, BranchDeposit>,
  locationIds: ReadonlyArray<string>,
): string[] {
  return locationIds.filter((id) => overrides[id]?.mode === "custom")
}
