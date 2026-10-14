/**
 * A promotion code entered on the public booking page (DZ-352, DZ-200 §5.4B).
 *
 * The till's side of promotions is `dealsAtTill` + `limitBlock`: a staff member
 * picks from a list, and a limit greys a row with the reason beside it. Online
 * there is no list. A client types a code, and the answer is either the
 * discount or one sentence saying why not — so this returns exactly that.
 *
 * ## The rules, all from DZ-200
 *
 * - Only promotions switched on for the booking page are found (D10). A staff
 *   code typed online is "not found", never "staff only" — the error should
 *   not advertise a discount the business keeps behind the counter.
 * - Per line, never the total (§5.2). A code that covers grooming leaves the
 *   nail trim in the same booking at full price.
 * - One code per online booking (Michelle on PRD-191, 14 Oct). Several codes
 *   and a different promotion per item stay staff-side, at the calendar's
 *   checkout.
 * - Combos are never discounted. A combo is already priced as a bundle, and
 *   the promotion catalogue leaves them out for that reason (see
 *   `lib/deals/catalogue.ts`).
 * - Minimum spend counts the lines the code applies to, before the discount
 *   (D5). A nail trim does not unlock a grooming code.
 * - One use per client is checked against the verified phone (§5.3), which is
 *   why the field sits on the review step, after OTP.
 * - A fixed amount never takes a line below zero (§6.4); 100% is allowed and
 *   leaves an AED 0 booking (§6.5).
 * - Prices are VAT-inclusive and so is the discount; VAT is worked out on what
 *   is left (§6.2).
 *
 * Money is in fils here, so a 15% discount on AED 35 is AED 5.25 and not a
 * rounded guess.
 */

import { type Deal, statusFor } from "@/lib/deals/mock"
import { formatDate } from "@/lib/format"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { isRunnable, runsAt } from "@/lib/locations/promotion-scope"
import { formatMoney } from "@/lib/money/format"

/** One line of the booking, as the code sees it. */
export type BookingPromoLine = {
  id: string
  /** The catalogue service this line books — what a deal's scope names. */
  serviceId: string
  /** VAT-inclusive, in fils. */
  priceMinor: number
  kind: "service" | "package"
  /** Set when the line is a share of a combo, which no code discounts. */
  comboName?: string
}

export type AppliedBookingPromo = {
  deal: Deal
  /** As the business wrote it, not as the client typed it. */
  code: string
  /** Discount per line id, in fils. Only lines the code took money off. */
  lineDiscounts: Record<string, number>
  discountMinor: number
  /** How many of the booking's lines it covers — "applies to 1 of 2". */
  coveredLines: number
  totalLines: number
}

export type BookingPromoRefusal = {
  kind:
    | "not-found"
    | "inactive"
    | "scheduled"
    | "expired"
    | "wrong-branch"
    | "fully-redeemed"
    | "already-used"
    | "combo-only"
    | "not-applicable"
    | "minimum-spend"
    | "check-failed"
  message: string
  detail?: string
}

export type BookingPromoResult =
  | { ok: true; promo: AppliedBookingPromo }
  | { ok: false; refusal: BookingPromoRefusal }

export type BookingPromoContext = {
  deals: ReadonlyArray<Deal>
  /** The branch the booking is at. A code is checked against this one only. */
  locationId: string
  /** "Shampooch JVC" — named in the wrong-branch answer. */
  locationName: string
  todayIso: string
  lines: ReadonlyArray<BookingPromoLine>
  /** Whether the verified client has redeemed this deal before. */
  clientHasRedeemed: (dealId: string) => boolean
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * The promotions a branch's booking page can see.
 *
 * Every deal in this prototype is Shampooch's — the operator the settings
 * panel belongs to — so a chain-wide code must not turn up at Purr Palace or
 * Sota just because "all locations" matched. Production scopes promotions by
 * business id; this is that boundary for the mocks.
 */
export function dealsForBranch(
  deals: ReadonlyArray<Deal>,
  locationId: string | undefined,
): ReadonlyArray<Deal> {
  if (!locationId) return []
  return NINE_BRANCH_ESTATE.some((l) => l.id === locationId) ? deals : []
}

/**
 * Whether the booking page should offer a code field at all.
 *
 * Only when this branch has a code a client could actually use today. A field
 * that can only ever answer "not found" is a dead end on the last step.
 */
export function branchTakesCodes(
  deals: ReadonlyArray<Deal>,
  locationId: string,
  todayIso: string,
): boolean {
  return deals.some(
    (deal) =>
      deal.bookingRedeemable &&
      deal.discountCode.length > 0 &&
      isRunnable(deal.scope) &&
      runsAt(deal.scope, locationId) &&
      statusFor(deal.status, deal.startDate, deal.endDate, todayIso) === "active",
  )
}

/** Does this deal's catalogue scope name this line? Combos never. */
function covers(deal: Deal, line: BookingPromoLine): boolean {
  if (line.comboName) return false
  const scope = line.kind === "package" ? deal.applicability.packages : deal.applicability.services
  if (scope.mode === "all") return true
  if (scope.mode === "none") return false
  return scope.ids.includes(line.serviceId)
}

/**
 * Split the deal's discount across the lines it covers.
 *
 * A percentage is taken per line and rounded half-up to the fil (§6.2), so
 * the lines always add up to the receipt. A fixed amount is capped at what
 * those lines cost and shared in proportion, the last line taking the
 * remainder.
 */
function discountPerLine(deal: Deal, lines: ReadonlyArray<BookingPromoLine>) {
  const out: Record<string, number> = {}
  if (deal.discountKind === "percentage") {
    const pct = Math.min(100, deal.discountValue)
    for (const line of lines) out[line.id] = Math.round((line.priceMinor * pct) / 100)
    return out
  }
  const subtotal = lines.reduce((n, l) => n + l.priceMinor, 0)
  const total = Math.min(subtotal, Math.round(deal.discountValue * 100))
  let given = 0
  lines.forEach((line, i) => {
    const share =
      i === lines.length - 1
        ? total - given
        : subtotal > 0
          ? Math.round((total * line.priceMinor) / subtotal)
          : 0
    given += share
    out[line.id] = share
  })
  return out
}

/**
 * Check a code against this booking and price it.
 *
 * The order is the order a client can act on: first whether the code exists
 * at all, then whether it is running, then whether it is theirs to use here,
 * and last what in the basket would make it apply.
 */
export function evaluateBookingCode(input: string, ctx: BookingPromoContext): BookingPromoResult {
  const code = normalizeCode(input)
  const matches = ctx.deals.filter(
    (deal) => deal.bookingRedeemable && deal.discountCode.toUpperCase() === code,
  )
  // Codes are unique among active promotions only (D8), so a seasonal code can
  // come back each year. When an old one and a running one share a code, the
  // running one is the one meant.
  const deal =
    matches.find((d) => statusFor(d.status, d.startDate, d.endDate, ctx.todayIso) === "active") ??
    matches[0]

  if (!code || !deal) {
    return refuse("not-found", "We couldn't find that code. Check the spelling and try again.")
  }

  if (deal.endDate && deal.endDate < ctx.todayIso) {
    return refuse("expired", `This code expired on ${formatDate(`${deal.endDate}T00:00:00`)}.`)
  }
  if (deal.status === "inactive" || deal.status === "archived") {
    return refuse("inactive", "This code isn't active right now.")
  }
  if (deal.startDate > ctx.todayIso) {
    return refuse("scheduled", `This code starts on ${formatDate(`${deal.startDate}T00:00:00`)}.`)
  }

  if (!isRunnable(deal.scope) || !runsAt(deal.scope, ctx.locationId)) {
    return refuse("wrong-branch", `This code can't be used at ${ctx.locationName}.`)
  }

  if (
    deal.limits.totalUsesEnabled &&
    deal.limits.totalUses != null &&
    deal.redemptions >= deal.limits.totalUses
  ) {
    return refuse("fully-redeemed", "This code has been fully redeemed.")
  }
  if (deal.limits.oneUsePerClient && ctx.clientHasRedeemed(deal.id)) {
    return refuse("already-used", "You've already used this code.", "It's one use per client.")
  }

  const covered = ctx.lines.filter((line) => covers(deal, line))
  if (covered.length === 0) {
    // Name the combo when that is the only reason. "Doesn't apply to your
    // services" would send the client looking for a service to swap.
    const wouldCoverWithoutCombo = ctx.lines.some(
      (line) => line.comboName && covers(deal, { ...line, comboName: undefined }),
    )
    return wouldCoverWithoutCombo
      ? refuse("combo-only", "Promo codes can't be used on combos.")
      : refuse("not-applicable", "This code doesn't apply to the services you picked.")
  }

  if (deal.limits.minimumPurchaseEnabled && deal.limits.minimumPurchaseAmount != null) {
    const minMinor = Math.round(deal.limits.minimumPurchaseAmount * 100)
    const eligibleMinor = covered.reduce((n, l) => n + l.priceMinor, 0)
    if (eligibleMinor < minMinor) {
      return refuse(
        "minimum-spend",
        `Spend ${formatMoney(minMinor)} on eligible services to use this code.`,
        `${formatMoney(minMinor - eligibleMinor)} more to go.`,
      )
    }
  }

  const lineDiscounts = discountPerLine(deal, covered)
  return {
    ok: true,
    promo: {
      deal,
      code: deal.discountCode,
      lineDiscounts,
      discountMinor: Object.values(lineDiscounts).reduce((n, v) => n + v, 0),
      coveredLines: covered.length,
      totalLines: ctx.lines.length,
    },
  }
}

/**
 * The answer when the code could not be checked at all — the request failed or
 * timed out. Not a verdict on the code, so it says to try again rather than
 * why, and the code stays in the field for the retry.
 */
export const CHECK_FAILED: BookingPromoRefusal = {
  kind: "check-failed",
  message: "We couldn't check this code right now. Try again.",
}

/** The code on the booking and its answer, as the field shows it. */
export type BookingCodeCheck = { code: string; result: BookingPromoResult }

function refuse(
  kind: BookingPromoRefusal["kind"],
  message: string,
  detail?: string,
): BookingPromoResult {
  return { ok: false, refusal: { kind, message, detail } }
}
