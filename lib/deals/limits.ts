/**
 * Whether this cart may actually take this deal (DW3.4).
 *
 * `dealsAtTill` answers "does this offer run here, today, on a line of this
 * kind". That is the *location* half and it was all this repo had — the limits
 * an owner sets in the wizard were collected, stored, printed on the detail
 * view and then ignored by the one screen that spends money. A minimum spend
 * nobody checks is a field that lies to whoever filled it in.
 *
 * ## Why these say no out loud rather than hiding the row
 *
 * A deal scoped to another branch is **not shown**, because it is that branch's
 * decision and there is nothing for a receptionist to judge. A limit is the
 * opposite: the offer is this client's to ask for and the reason it will not
 * apply is about *this cart* — spend AED 40 more, or the client has had it
 * before. Hiding it turns an answerable question into a mystery at the counter,
 * so it stays in the list, disabled, with the reason beside it.
 */

import type { Deal } from "@/lib/deals/mock"

/** What the till knows about the cart when it asks. */
export type TillContext = {
  /** The cart's total before this deal, in fils. */
  cartTotalMinor: number
  /**
   * How many times this deal has been redeemed by the client attached to the
   * cart. `null` for a walk-in, which is not the same as zero — nobody can say
   * whether an unnamed client has had it before.
   */
  clientRedemptions: number | null
  /** How many times it has been redeemed in total, across the estate. */
  totalRedemptions: number
}

export type LimitBlock = { reason: string; detail?: string }

/**
 * Why this deal cannot be taken on this cart, or `null` if it can.
 *
 * Order matters: the cheapest thing to fix is named first. A client who is AED
 * 40 short can be told to add a product; one who has already used a
 * once-per-client offer cannot do anything about it, and being told the harder
 * fact first is no help.
 */
export function limitBlock(deal: Deal, ctx: TillContext): LimitBlock | null {
  const { limits } = deal

  if (limits.minimumPurchaseEnabled && limits.minimumPurchaseAmount != null) {
    const minMinor = Math.round(limits.minimumPurchaseAmount * 100)
    if (ctx.cartTotalMinor < minMinor) {
      const shortMinor = minMinor - ctx.cartTotalMinor
      return {
        reason: `Spend AED ${(minMinor / 100).toLocaleString("en-US")} to use this`,
        // The gap, not just the threshold. "Minimum AED 150" makes an operator
        // do the subtraction; this is the number they would have worked out.
        detail: `AED ${(shortMinor / 100).toFixed(2)} more to go`,
      }
    }
  }

  if (limits.totalUsesEnabled && limits.totalUses != null) {
    if (ctx.totalRedemptions >= limits.totalUses) {
      return {
        reason: "Fully redeemed",
        detail: `All ${limits.totalUses.toLocaleString("en-US")} uses have gone`,
      }
    }
  }

  if (limits.oneUsePerClient) {
    // A walk-in has no history to check. The built product cannot answer this
    // either; what it must not do is quietly pass, so the cart says which of
    // the two it is and lets the offer through — a named client is the case the
    // limit was written for.
    if (ctx.clientRedemptions != null && ctx.clientRedemptions > 0) {
      return {
        reason: "This client has already used it",
        detail: "One use per client",
      }
    }
  }

  return null
}

/**
 * The limits an owner set, written out for the detail view and the wizard's
 * summary — "One use per client · 500 total uses · min. AED 150".
 *
 * Returns an empty array when nothing was limited, so a caller can say
 * "Unlimited" once rather than printing three rows of "No".
 */
export function describeLimits(deal: Deal): string[] {
  const out: string[] = []
  if (deal.limits.oneUsePerClient) out.push("One use per client")
  if (deal.limits.totalUsesEnabled && deal.limits.totalUses != null) {
    out.push(`${deal.limits.totalUses.toLocaleString("en-US")} total uses`)
  }
  if (deal.limits.minimumPurchaseEnabled && deal.limits.minimumPurchaseAmount != null) {
    out.push(`min. AED ${deal.limits.minimumPurchaseAmount.toLocaleString("en-US")}`)
  }
  return out
}
