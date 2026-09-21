/**
 * Promotions, and the branches each one runs at (DW3.4, R04, R18, R24).
 *
 * The rule lives in `lib/locations/promotion-scope.ts`; this is the seed the
 * screen reads, shaped so every state that carries a rule is on screen without
 * anyone having to click:
 *
 * - one chain-wide offer, which is a *named* set and not "the nine that exist
 *   today" — the distinction that survives a tenth branch opening;
 * - one that runs at a single branch, which is the whole reason DW3.4 exists;
 * - one at a named few, so "3 locations" is on screen next to "All locations";
 * - one saved with nothing chosen, because that is the state the dev repo's
 *   `locationIds: []` would read as chain-wide and R24 says is nobody at all.
 */

import type { PromotionScope } from "@/lib/locations/promotion-scope"

/**
 * The as-built statuses, read off `src/types/deal.ts` on the dev repo's
 * `promotion-discount-ui`.
 *
 * Not `live | scheduled | ended`, which is what this file invented before
 * anybody read that branch. Two of those three are wrong: the built product
 * says **active**, and it has **inactive** — a deal switched off by hand, which
 * is a different fact from one whose end date has passed — and **archived**,
 * which `ended` silently merged with it.
 */
export type DealStatus = "active" | "scheduled" | "inactive" | "archived"

export type Deal = {
  id: string
  name: string
  /** e.g. "20% off" — the offer as a client would hear it. */
  offer: string
  status: DealStatus
  /** ISO date. Required — a deal with no start has nothing to show in the list. */
  startDate: string
  /** ISO date, or null for an offer that runs until it is switched off. */
  endDate: string | null
  /** Where it applies. Never an empty array standing in for "everywhere". */
  scope: PromotionScope
  /** Redemptions so far, so a branch-scoped deal can be seen to be working. */
  redemptions: number
}

export const MOCK_DEALS: Deal[] = [
  {
    id: "january-groom",
    name: "January groom offer",
    offer: "20% off grooming",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    // Named, not enumerated. A branch opened in the middle of January is in it.
    scope: { kind: "estate" },
    redemptions: 148,
  },
  {
    id: "mirdif-tuesdays",
    name: "Mirdif Tuesdays",
    offer: "AED 30 off",
    status: "active",
    startDate: "2026-01-06",
    endDate: "2026-03-31",
    // The case DW3.4 exists for: one quiet branch filling a slow day, without
    // the chain paying for it.
    scope: { kind: "branches", locationIds: ["shampooch-mirdif"] },
    redemptions: 22,
  },
  {
    id: "abu-dhabi-launch",
    name: "Abu Dhabi launch",
    offer: "First groom half price",
    status: "scheduled",
    startDate: "2026-02-01",
    endDate: null,
    scope: {
      kind: "branches",
      locationIds: ["shampooch-al-reem", "shampooch-downtown-dubai", "shampooch-jumeirah"],
    },
    redemptions: 0,
  },
  {
    id: "unscoped-draft",
    name: "Spring refresh",
    offer: "15% off",
    status: "scheduled",
    startDate: "2026-04-01",
    endDate: null,
    // Saved with nothing chosen. Under the dev repo's mapper this shape reads
    // as the whole chain; here it runs nowhere and the row says so, which is
    // the difference R24 is about.
    scope: { kind: "branches", locationIds: [] },
    redemptions: 0,
  },
  {
    id: "eid-weekend",
    name: "Eid weekend",
    offer: "Free nail trim",
    status: "archived",
    startDate: "2026-04-05",
    endDate: "2026-04-12",
    scope: { kind: "estate" },
    redemptions: 310,
  },
]

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  inactive: "Inactive",
  archived: "Archived",
}

/**
 * The date range on a row, as the built product formats it.
 *
 * Copied from `formatDateRange` in the dev repo's `deals/lib/deal-format.ts`
 * rather than invented: same collapsing of a range inside one month
 * ("Apr 1 – 30, 2026"), and the same reading of a null end as an open run. This
 * file had its own `runs` string before anybody read that branch, which no
 * amount of care would have kept in step with it.
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  const start = new Date(`${startDate}T00:00:00`)
  if (!endDate) return start.toLocaleDateString("en-US", opts)
  const end = new Date(`${endDate}T00:00:00`)
  const sameYear = start.getFullYear() === end.getFullYear()
  if (sameYear && start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString("en-US", { month: "short" })
    return `${month} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`
}

/**
 * Whether a deal is running today, derived from its dates.
 *
 * Only ever returns `active` or `scheduled`. **`inactive` and `archived` are
 * not derivable** — they are things somebody did, not things a date implies,
 * and the built product keeps them as stored state for that reason. A deal
 * switched off in March and a deal whose season ended in March look identical
 * to a calendar and are different facts to an owner.
 *
 * So a stored `inactive` or `archived` wins, and this only decides between the
 * two that a date can actually settle.
 */
export function statusFor(
  stored: DealStatus,
  startDate: string,
  endDate: string | null,
  todayIso: string,
): DealStatus {
  if (stored === "inactive" || stored === "archived") return stored
  if (!startDate || startDate > todayIso) return "scheduled"
  if (endDate && endDate < todayIso) return "inactive"
  return "active"
}
