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

export type DealStatus = "live" | "scheduled" | "ended"

export type Deal = {
  id: string
  name: string
  /** e.g. "20% off" — the offer as a client would hear it. */
  offer: string
  status: DealStatus
  /** Human date range for the row, not a parsed one: this screen only reads it. */
  runs: string
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
    status: "live",
    runs: "1 – 31 Jan",
    // Named, not enumerated. A branch opened in the middle of January is in it.
    scope: { kind: "estate" },
    redemptions: 148,
  },
  {
    id: "mirdif-tuesdays",
    name: "Mirdif Tuesdays",
    offer: "AED 30 off",
    status: "live",
    runs: "Tuesdays, until 31 Mar",
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
    runs: "Starts 1 Feb",
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
    runs: "Starts 1 Apr",
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
    status: "ended",
    runs: "Ended 12 Apr",
    scope: { kind: "estate" },
    redemptions: 310,
  },
]

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
}
