/**
 * Which deals a till may offer (DW3.4, R11, R18).
 *
 * ## The other half of "where a deal runs"
 *
 * `/catalogs/deals` settles where an offer applies. On its own that is a label:
 * the rule only exists once the place that spends money obeys it. The built
 * product asks the server — `promotionService.evaluateCart(lines)` through
 * `useEvaluateDiscountsMutation` in `NewSaleSheet` — and what comes back is
 * "eligible discounts for this cart". Whether that list is bounded by the
 * sale's branch is exactly the question multi-location adds to it.
 *
 * ## It filters, it does not warn
 *
 * This is the opposite of the package rule, and deliberately so. A client's
 * package bought elsewhere **warns and still completes** (KC1.5), because the
 * client paid for it and a receptionist can judge. A deal scoped to another
 * branch is not the client's property and there is nothing to judge: Mirdif
 * Tuesdays is Mirdif's decision about Mirdif's diary, and offering it at JVC
 * would hand away margin nobody agreed to. So it never appears.
 *
 * ## Why the branch, and not the scope alone
 *
 * A sale names one branch before anything is added to it (R11), so the question
 * is always answerable. There is no "all locations" cart.
 */

import { type LimitBlock, limitBlock, type TillContext } from "@/lib/deals/limits"
import type { Deal } from "@/lib/deals/mock"
import { statusFor } from "@/lib/deals/mock"
import { isRunnable, runsAt } from "@/lib/locations/promotion-scope"

/**
 * Deals the till may offer on a sale at this branch, on this day.
 *
 * Three gates, and each removes a different kind of wrong row:
 *
 * - **Runs here.** The multi-location one.
 * - **Running at all.** Scheduled and inactive deals are real records and not
 *   offers; archived ones are history.
 * - **Reaches somebody.** A deal scoped to no branch cannot be spent anywhere,
 *   and would otherwise sit in the list looking spendable.
 */
export function dealsAtTill(
  deals: ReadonlyArray<Deal>,
  locationId: string | null | undefined,
  todayIso: string,
  /**
   * The kind of line this is for. Omit to ask "what runs here at all".
   *
   * Left out of the first cut, which is how a grooming offer came to be
   * offered on a bottle of conditioner: a deal names the kinds of thing it
   * discounts, and a line of another kind is not one of them.
   */
  lineKind?: "service" | "product" | "gift-card",
): Deal[] {
  // No branch, no offer. A cart that has not named its branch cannot be told
  // which deals apply, and guessing is what R11 exists to delete.
  if (!locationId) return []
  return deals.filter((deal) => {
    // Some offers are not the till's to hand out — a campaign redeemed online,
    // or one the team applies by hand. `enableAtPointOfSale` is the built
    // product's switch for exactly that, and this list is the point of sale.
    if (!deal.enableAtPointOfSale) return false
    if (!isRunnable(deal.scope)) return false
    if (!runsAt(deal.scope, locationId)) return false
    if (lineKind && !appliesToLine(deal, lineKind)) return false
    return statusFor(deal.status, deal.startDate, deal.endDate, todayIso) === "active"
  })
}

/**
 * What a deal takes off a line, in fils.
 *
 * Read off `discountKind` / `discountValue`, the way the built product stores
 * it. This used to parse the offer *text* — `/(\d+)\s*%/` against a string an
 * owner had typed — which meant "15 off" silently took nothing, "Free nail
 * trim" silently took nothing, and no screen anywhere said so. A discount is
 * not a sentence; it is a kind and a number, and both are now asked for.
 *
 * A fixed amount is capped at the line: AED 30 off a AED 20 product is AED 20
 * off, never a line that pays the client back.
 */
export function dealDiscountMinor(deal: Deal, baseMinor: number): number {
  if (deal.discountKind === "percentage") {
    return Math.round((baseMinor * Math.min(100, deal.discountValue)) / 100)
  }
  return Math.min(baseMinor, Math.round(deal.discountValue * 100))
}

/**
 * Whether this deal takes money off a line of this kind.
 *
 * `none` is a decision and `all` is a decision; neither is an empty list, which
 * is the same distinction R24 draws about locations one axis over.
 *
 * Gift cards get their own flag rather than a blanket refusal. Discounting
 * stored value sells AED 100 of credit for AED 80 and books the loss as a
 * promotion, which is a good reason for the default to be off on a new offer —
 * but it is the merchant's call, and the built product treats it as one.
 */
export function appliesToLine(deal: Deal, kind: "service" | "product" | "gift-card"): boolean {
  if (kind === "gift-card") return deal.applicability.giftCardsInStore
  const scope = kind === "service" ? deal.applicability.services : deal.applicability.products
  // `selected` narrows to an id set behind a catalogue picker in the built
  // product. Nothing here creates one, so it is honoured as "some of them" —
  // never silently widened to all, which is the failure mode this repo keeps
  // finding on the location axis.
  return scope.mode !== "none" && !(scope.mode === "selected" && scope.ids.length === 0)
}

/**
 * The deals a till may offer, each with the reason it cannot be taken yet.
 *
 * `dealsAtTill` removes what does not belong on this screen at all — another
 * branch's offer, a scheduled one, a grooming deal on a bottle of conditioner.
 * What is left belongs here, and a limit is a different kind of no: the offer
 * is this client's to ask for, and "spend AED 40 more" is an answer somebody at
 * the counter can act on. Hiding those rows turns an answerable question into a
 * mystery, so they stay, disabled, with the reason beside them.
 */
export function offersAtTill(
  deals: ReadonlyArray<Deal>,
  locationId: string | null | undefined,
  todayIso: string,
  lineKind: "service" | "product" | "gift-card" | undefined,
  ctx: TillContext,
): Array<{ deal: Deal; block: LimitBlock | null }> {
  return dealsAtTill(deals, locationId, todayIso, lineKind).map((deal) => ({
    deal,
    block: limitBlock(deal, ctx),
  }))
}
