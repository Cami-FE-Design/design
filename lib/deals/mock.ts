/**
 * Promotions, and the branches each one runs at (DW3.4, R04, R18, R24).
 *
 * The shape here is the dev repo's `src/types/deal.ts` on `promotion-discount-ui`,
 * reduced to the fields this prototype puts on screen — not a parallel model.
 * Where a field exists there it is spelled the same way here, so a reviewer can
 * hold the two side by side.
 *
 * The rule about *where* a deal runs lives in `lib/locations/promotion-scope.ts`;
 * this is the seed the screen reads, shaped so every state that carries a rule
 * is on screen without anyone having to click:
 *
 * - one chain-wide offer, which is a *named* set and not "the nine that exist
 *   today" — the distinction that survives a tenth branch opening;
 * - one that runs at a single branch, which is the whole reason DW3.4 exists;
 * - one at a named few, so "3 locations" is on screen next to "All locations";
 * - one saved with nothing chosen, because that is the state the dev repo's
 *   `locationIds: []` would read as chain-wide and R24 says is nobody at all.
 */

import { formatAed } from "@/lib/format"
import type { PromotionScope } from "@/lib/locations/promotion-scope"

/**
 * The as-built statuses, read off `src/types/deal.ts` on the dev repo's
 * `promotion-discount-ui`.
 *
 * **inactive** is a deal switched off by hand; **expired** is one whose end
 * date has passed. The built mapper keeps the two apart so the badge says what
 * actually happened, and an expired deal cannot be activated again. **archived**
 * is what the list's Delete leaves behind.
 */
export type DealStatus = "active" | "scheduled" | "inactive" | "expired" | "archived"

/**
 * What kind of offer this is (`DealTypeSchema`).
 *
 * Three, and they differ in how a client reaches them rather than in what they
 * take off: a promotion is quoted by code, a flash sale is simply on, and a
 * last-minute offer fires only close to the appointment. The arithmetic is the
 * same for all three, which is why the type sits beside the discount rather
 * than inside it.
 */
export type DealType = "promotion" | "flash-sale" | "last-minute-offer"

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  promotion: "Promotion",
  "flash-sale": "Flash sale",
  "last-minute-offer": "Last-minute offer",
}

/**
 * How the discount is expressed (`DiscountKindSchema`).
 *
 * This was a free-text "Offer" field — the owner typed "20% off grooming" and a
 * regex downstream tried to work out what came off. Two things wrong with that,
 * and the second is the serious one: nobody filling the form can tell whether
 * the number they type is a percentage or an amount, and neither can the till.
 * "15 off" is AED 15 or 15%, and the same string means both.
 */
export type DiscountKind = "percentage" | "fixed"

/**
 * What a deal discounts (`DealScope` / `DealApplicability` on the dev repo).
 *
 * `all` and `none` are both real and are not an empty list: a chain-wide sale is
 * `all` and stays true as the catalogue grows, while a services-only offer is
 * `none` for products rather than an empty set that could be read either way.
 * It is R24's lesson one axis over, and the built product reaches the same
 * conclusion independently.
 *
 * `selected` narrows to an explicit id set, chosen in the wizard's catalogue
 * picker (`DealScopePickerDialog`). Ticking every box there stores `all`, not
 * the ids — so the offer keeps covering the catalogue as it grows.
 */
export type DealScopeMode = "all" | "none" | "selected"
export type DealResourceScope = { mode: DealScopeMode; ids: string[] }

export type DealApplicability = {
  services: DealResourceScope
  products: DealResourceScope
  packages: DealResourceScope
  /**
   * Whether the offer comes off a gift card bought in store.
   *
   * The built product has no backend field for it yet, so its mapper always
   * reads false and the summaries leave gift cards out (DZ-200 lists gift cards
   * as out of scope). Off everywhere here too; the flag stays so the till's
   * gift-card line has something to ask.
   */
  giftCardsInStore: boolean
}

/**
 * How often the offer may be taken (`DealLimitsSchema`).
 *
 * The till does not enforce these yet — see `dealsAtTill`, which bounds by
 * branch, date and kind only. They are collected and shown because a deal
 * created without them is a deal with no ceiling, and "unlimited" should be a
 * decision somebody made rather than a field that was never on the form.
 */
export type DealLimits = {
  oneUsePerClient: boolean
  totalUsesEnabled: boolean
  totalUses: number | null
  minimumPurchaseEnabled: boolean
  /** Whole AED, as the built product collects it. */
  minimumPurchaseAmount: number | null
}

export type Deal = {
  id: string
  type: DealType
  name: string
  description: string
  discountKind: DiscountKind
  /** Percent (1–100) or whole AED, per `discountKind`. */
  discountValue: number
  /** Optional code a client quotes. Empty means the offer needs no code. */
  discountCode: string
  /** Whether the till may offer it at all (`enableAtPointOfSale`). */
  enableAtPointOfSale: boolean
  /**
   * Whether a client may enter `discountCode` on the public booking page
   * (DZ-200 D10, `booking_redeemable`). Off by default: most of what a salon
   * calls a discount — teachers, Emirates staff — is a label the team applies
   * at checkout, not a code to hand out. On makes the code required.
   */
  bookingRedeemable: boolean
  status: DealStatus
  /** ISO date. Required — a deal with no start has nothing to show in the list. */
  startDate: string
  /** ISO date, or null for an offer that runs until it is switched off. */
  endDate: string | null
  /** Where it applies. Never an empty array standing in for "everywhere". */
  scope: PromotionScope
  /** Which kinds of line it takes money off. */
  applicability: DealApplicability
  limits: DealLimits
  /**
   * Which team members may be booked with this offer (`teamMemberIds`).
   *
   * Empty is **everybody**, which is the built product's reading and the one
   * place this repo does not argue with an empty array — a deal nobody may sell
   * is not a state anyone asks for, whereas a deal nobody may sell *anywhere*
   * is exactly the mistake R24 is about. The two empties are not symmetric.
   */
  teamMemberIds: string[]
  /** Redemptions so far, so a branch-scoped deal can be seen to be working. */
  redemptions: number
  /** Gross taken through this deal, in fils — the list's "Total sales". */
  totalSalesMinor: number
  /** Distinct clients who have used it. */
  totalClients: number
  /** ISO timestamp, shown as "Date created" on the detail view. */
  createdAt: string
}

export const DEFAULT_DEAL_APPLICABILITY: DealApplicability = {
  services: { mode: "all", ids: [] },
  products: { mode: "all", ids: [] },
  packages: { mode: "all", ids: [] },
  giftCardsInStore: false,
}

export const DEFAULT_DEAL_LIMITS: DealLimits = {
  oneUsePerClient: false,
  totalUsesEnabled: false,
  totalUses: null,
  minimumPurchaseEnabled: false,
  minimumPurchaseAmount: null,
}

/** Services only — the commonest offer, and the one this fixture uses most. */
const SERVICES_ONLY: DealApplicability = {
  services: { mode: "all", ids: [] },
  products: { mode: "none", ids: [] },
  packages: { mode: "none", ids: [] },
  giftCardsInStore: false,
}

/**
 * Seeded around the demo's today (24 Aug 2026), not around a calendar year.
 *
 * The first cut dated everything Jan–Apr, which is months behind `TODAY_ISO` —
 * so every row resolved to Inactive or Archived and the list had no running
 * deal in it at all. A fixture that cannot show its own main state is not a
 * fixture.
 *
 * Every row is a Promotion with no description and the till switched on: the
 * built product creates only promotions (DZ-200 D1), and its mapper drops the
 * description and always sets `enableAtPointOfSale` (D2, D7).
 */
export const MOCK_DEALS: Deal[] = [
  {
    id: "summer-groom",
    type: "promotion",
    name: "Summer groom offer",
    description: "",
    discountKind: "percentage",
    discountValue: 20,
    discountCode: "",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "active",
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    // Named, not enumerated. A branch opened mid-season is in it.
    scope: { kind: "estate" },
    // Grooming, so it takes nothing off a bottle of conditioner.
    applicability: SERVICES_ONLY,
    limits: { ...DEFAULT_DEAL_LIMITS, oneUsePerClient: true },
    teamMemberIds: ["aziz-rahman", "sara-park"],
    redemptions: 148,
    totalSalesMinor: 128400,
    totalClients: 132,
    createdAt: "2026-07-21T09:12:00Z",
  },
  {
    id: "mirdif-tuesdays",
    type: "promotion",
    name: "Mirdif Tuesdays",
    description: "",
    discountKind: "fixed",
    discountValue: 30,
    discountCode: "",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "active",
    startDate: "2026-08-04",
    endDate: "2026-10-27",
    // The case DW3.4 exists for: one quiet branch filling a slow day, without
    // the chain paying for it.
    scope: { kind: "branches", locationIds: ["shampooch-mirdif"] },
    applicability: SERVICES_ONLY,
    limits: { ...DEFAULT_DEAL_LIMITS, minimumPurchaseEnabled: true, minimumPurchaseAmount: 150 },
    teamMemberIds: [],
    redemptions: 22,
    totalSalesMinor: 41800,
    totalClients: 19,
    createdAt: "2026-07-30T14:03:00Z",
  },
  {
    // Stopped by hand while its dates still cover today — the one case where
    // Activate has something to do, and the one a calendar cannot infer.
    id: "referral-bonus",
    type: "promotion",
    name: "Refer a friend",
    description: "",
    discountKind: "fixed",
    discountValue: 25,
    discountCode: "FRIEND25",
    enableAtPointOfSale: true,
    // Handed out by the referring client, so it is entered online — which is
    // also how an online client meets "this code isn't active right now".
    bookingRedeemable: true,
    status: "inactive",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    scope: { kind: "estate" },
    // A referral credit comes off anything.
    applicability: DEFAULT_DEAL_APPLICABILITY,
    limits: { ...DEFAULT_DEAL_LIMITS, oneUsePerClient: true },
    teamMemberIds: [],
    redemptions: 61,
    totalSalesMinor: 105000,
    totalClients: 55,
    createdAt: "2026-06-24T11:40:00Z",
  },
  {
    id: "abu-dhabi-launch",
    type: "promotion",
    name: "Abu Dhabi launch",
    description: "",
    discountKind: "percentage",
    discountValue: 50,
    discountCode: "",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "active",
    startDate: "2026-10-01",
    endDate: null,
    scope: {
      kind: "branches",
      locationIds: ["shampooch-al-reem", "shampooch-downtown-dubai", "shampooch-jumeirah"],
    },
    applicability: {
      services: { mode: "all", ids: [] },
      products: { mode: "none", ids: [] },
      packages: { mode: "all", ids: [] },
      giftCardsInStore: false,
    },
    limits: { ...DEFAULT_DEAL_LIMITS, totalUsesEnabled: true, totalUses: 500 },
    teamMemberIds: [],
    redemptions: 0,
    totalSalesMinor: 0,
    totalClients: 0,
    createdAt: "2026-09-02T08:25:00Z",
  },
  {
    id: "unscoped-draft",
    type: "promotion",
    name: "Spring refresh",
    description: "",
    discountKind: "percentage",
    discountValue: 15,
    discountCode: "",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "active",
    startDate: "2026-08-10",
    endDate: null,
    // Saved with nothing chosen. Under the dev repo's mapper this shape reads
    // as the whole chain; here it runs nowhere and the row says so, which is
    // the difference R24 is about.
    scope: { kind: "branches", locationIds: [] },
    applicability: {
      services: { mode: "all", ids: [] },
      products: { mode: "all", ids: [] },
      packages: { mode: "none", ids: [] },
      giftCardsInStore: false,
    },
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 0,
    totalSalesMinor: 0,
    totalClients: 0,
    createdAt: "2026-08-09T16:55:00Z",
  },
  {
    id: "eid-weekend",
    type: "promotion",
    name: "Eid weekend",
    description: "",
    discountKind: "percentage",
    discountValue: 100,
    discountCode: "",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "archived",
    startDate: "2026-04-05",
    endDate: "2026-04-12",
    scope: { kind: "estate" },
    applicability: SERVICES_ONLY,
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 310,
    totalSalesMinor: 276000,
    totalClients: 241,
    createdAt: "2026-03-28T10:05:00Z",
  },
  // ─── Codes a client can enter on the booking page (DZ-352) ──────────────────
  // One per answer the code field can give, so every state on /shampooch-jvc/book
  // is reachable by typing a code. Service ids are the booking catalogue's.
  {
    // Applies. One use per client, and the demo's returning client (a mobile
    // ending in an even digit) has had it — the "already used" case.
    id: "welcome-online",
    type: "promotion",
    name: "Welcome offer",
    description: "",
    discountKind: "percentage",
    discountValue: 15,
    discountCode: "WELCOME15",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-01",
    endDate: null,
    scope: { kind: "estate" },
    applicability: SERVICES_ONLY,
    limits: { ...DEFAULT_DEAL_LIMITS, oneUsePerClient: true },
    teamMemberIds: [],
    redemptions: 37,
    totalSalesMinor: 902000,
    totalClients: 37,
    createdAt: "2026-07-28T10:00:00Z",
  },
  {
    // Minimum spend, counted on the grooming lines only (D5): a full groom
    // alone is AED 40 short, and adding a nail trim does not close the gap.
    id: "groom-50",
    type: "promotion",
    name: "AED 50 off grooming",
    description: "",
    discountKind: "fixed",
    discountValue: 50,
    discountCode: "GROOM50",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-15",
    endDate: "2026-09-30",
    scope: { kind: "estate" },
    applicability: {
      ...SERVICES_ONLY,
      services: { mode: "selected", ids: ["full-groom", "puppy-groom", "breed-cut", "deshed"] },
    },
    limits: { ...DEFAULT_DEAL_LIMITS, minimumPurchaseEnabled: true, minimumPurchaseAmount: 300 },
    teamMemberIds: [],
    redemptions: 12,
    totalSalesMinor: 390000,
    totalClients: 12,
    createdAt: "2026-08-14T09:30:00Z",
  },
  {
    // Narrow scope: comes off the add-ons and leaves the groom alone, which is
    // the "applies to 1 of 2 services" case.
    id: "spa-20",
    type: "promotion",
    name: "Spa add-ons 20% off",
    description: "",
    discountKind: "percentage",
    discountValue: 20,
    discountCode: "SPA20",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-01",
    endDate: null,
    scope: { kind: "estate" },
    applicability: {
      ...SERVICES_ONLY,
      services: {
        mode: "selected",
        ids: ["nail-trim", "nail-grind", "paw-balm", "teeth", "facial", "cologne", "gland"],
      },
    },
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 64,
    totalSalesMinor: 352000,
    totalClients: 58,
    createdAt: "2026-07-30T12:00:00Z",
  },
  {
    // 100% off one service — booked alone, the total is AED 0 (DZ-200 §6.5).
    id: "free-nail-trim",
    type: "promotion",
    name: "Free nail trim",
    description: "",
    discountKind: "percentage",
    discountValue: 100,
    discountCode: "NAILFREE",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    scope: { kind: "estate" },
    applicability: { ...SERVICES_ONLY, services: { mode: "selected", ids: ["nail-trim"] } },
    limits: { ...DEFAULT_DEAL_LIMITS, oneUsePerClient: true },
    teamMemberIds: [],
    redemptions: 21,
    totalSalesMinor: 0,
    totalClients: 21,
    createdAt: "2026-07-31T08:00:00Z",
  },
  {
    // Another branch's code. Entered at JVC it is refused by name, not as
    // "not found" — the client has the right code at the wrong branch.
    id: "al-quoz-online",
    type: "promotion",
    name: "Al Quoz weekday",
    description: "",
    discountKind: "fixed",
    discountValue: 30,
    discountCode: "ALQUOZ30",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-01",
    endDate: null,
    scope: { kind: "branches", locationIds: ["shampooch-al-quoz"] },
    applicability: SERVICES_ONLY,
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 9,
    totalSalesMinor: 162000,
    totalClients: 9,
    createdAt: "2026-07-29T15:00:00Z",
  },
  {
    // Ended. Its dates are past, so it reads expired rather than inactive.
    id: "july-treat",
    type: "promotion",
    name: "July treat",
    description: "",
    discountKind: "percentage",
    discountValue: 10,
    discountCode: "JULY10",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    scope: { kind: "estate" },
    applicability: SERVICES_ONLY,
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 88,
    totalSalesMinor: 1540000,
    totalClients: 80,
    createdAt: "2026-06-25T10:00:00Z",
  },
  {
    // Total cap reached.
    id: "first-50",
    type: "promotion",
    name: "First 50 bookings",
    description: "",
    discountKind: "percentage",
    discountValue: 25,
    discountCode: "FIRST50",
    enableAtPointOfSale: true,
    bookingRedeemable: true,
    status: "active",
    startDate: "2026-08-01",
    endDate: null,
    scope: { kind: "estate" },
    applicability: SERVICES_ONLY,
    limits: { ...DEFAULT_DEAL_LIMITS, totalUsesEnabled: true, totalUses: 50 },
    teamMemberIds: [],
    redemptions: 50,
    totalSalesMinor: 1100000,
    totalClients: 50,
    createdAt: "2026-07-31T18:00:00Z",
  },
  {
    // Staff-only (D10). It has a code for the till, but typed online it is
    // simply not found — a staff discount is not advertised by its error.
    id: "teachers",
    type: "promotion",
    name: "Teachers",
    description: "",
    discountKind: "percentage",
    discountValue: 10,
    discountCode: "TEACH10",
    enableAtPointOfSale: true,
    bookingRedeemable: false,
    status: "active",
    startDate: "2026-08-01",
    endDate: null,
    scope: { kind: "estate" },
    applicability: SERVICES_ONLY,
    limits: DEFAULT_DEAL_LIMITS,
    teamMemberIds: [],
    redemptions: 26,
    totalSalesMinor: 610000,
    totalClients: 24,
    createdAt: "2026-07-20T09:00:00Z",
  },
]

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  inactive: "Inactive",
  expired: "Expired",
  archived: "Archived",
}

/** "20%" or "AED 30" — `formatDiscountValue` on the dev repo, with the unit. */
export function formatDiscountValue(deal: Pick<Deal, "discountKind" | "discountValue">): string {
  return deal.discountKind === "percentage"
    ? `${deal.discountValue}%`
    : formatAed(deal.discountValue)
}

function scopeLabel(scope: DealResourceScope, singular: string, plural: string): string {
  if (scope.mode === "all") return `all ${plural}`
  if (scope.mode === "none") return `no ${plural}`
  return scope.ids.length === 1 ? `1 ${singular}` : `${scope.ids.length} ${plural}`
}

/**
 * "all services, no products, all packages".
 *
 * `formatApplicabilitySummary` on the dev repo, same order. It states the
 * negatives out loud rather than listing only what is included: "all services"
 * alone does not tell an owner whether the offer also comes off the shampoo
 * they sell on the way out, and that is the question they have. Gift cards are
 * left out, as they are there: no promotion reaches them yet.
 */
export function formatApplicabilitySummary(a: DealApplicability): string {
  return [
    scopeLabel(a.services, "service", "services"),
    scopeLabel(a.products, "product", "products"),
    scopeLabel(a.packages, "package", "packages"),
  ].join(", ")
}

/** "20% off all services, no products, no packages". */
export function formatDealSummary(deal: Deal): string {
  return `${formatDiscountValue(deal)} off ${formatApplicabilitySummary(deal.applicability)}`
}

/**
 * The date range on a row.
 *
 * Taken from `formatDateRange` in the dev repo's `deals/lib/deal-format.ts` —
 * same collapsing of a range inside one month ("Apr 1 – 30, 2026"), same
 * reading of a null end as an open run — with the collapse extended one step.
 *
 * It prints the year **once** when both ends share it, so a season reads
 * "Aug 1 – Sep 30, 2026" rather than "Aug 1, 2026 – Sep 30, 2026". The second
 * says the same thing sixty pixels wider, and in a six-column table that width
 * is what pushed the row into a horizontal scrollbar and wrapped the dates onto
 * two lines. A year repeated inside one range is noise either way; the only
 * case that needs both is a range that actually crosses a year, and that one
 * still prints them.
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  const start = new Date(`${startDate}T00:00:00`)
  if (!endDate) return start.toLocaleDateString("en-US", opts)
  const end = new Date(`${endDate}T00:00:00`)
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`
  }
  const dayMonth: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  if (start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString("en-US", { month: "short" })
    return `${month} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${start.toLocaleDateString("en-US", dayMonth)} – ${end.toLocaleDateString("en-US", opts)}`
}

/**
 * Whether a deal is running today, derived from its dates.
 *
 * **`inactive` and `archived` are not derivable** — they are things somebody
 * did, not things a date implies, and the built product keeps them as stored
 * state for that reason. A stored `archived` always wins. A deal past its end
 * date is `expired` even if it was also switched off, because nothing can
 * bring it back, which is why the list disables Activate on it. Otherwise a
 * stored `inactive` wins, and the dates decide between `scheduled` and
 * `active`. The booking page's code check reads the same order.
 */
export function statusFor(
  stored: DealStatus,
  startDate: string,
  endDate: string | null,
  todayIso: string,
): DealStatus {
  if (stored === "archived") return stored
  if (endDate && endDate < todayIso) return "expired"
  if (stored === "inactive") return stored
  if (!startDate || startDate > todayIso) return "scheduled"
  return "active"
}

/**
 * "All services" / "No products" / "3 packages" — one category's half of
 * `formatApplicabilitySummary`.
 *
 * Split out because the detail view wants a row per category rather than one
 * combined sentence: a merchant checking what an offer covers reads down a
 * list, not across a paragraph.
 */
export function scopeStatusLabel(
  scope: DealResourceScope,
  singular: string,
  plural: string,
): string {
  if (scope.mode === "all") return `All ${plural}`
  if (scope.mode === "none") return `No ${plural}`
  return scope.ids.length === 1 ? `1 ${singular}` : `${scope.ids.length} ${plural}`
}

/**
 * The order the detail view lists categories in: narrowed first, then all,
 * then none.
 *
 * A merchant auditing a promotion cares most about the categories somebody
 * deliberately narrowed — the ones left at their defaults are the unremarkable
 * ones, and burying "3 services" under two rows of "All …" is how a mistake
 * stays hidden.
 */
export function applyToRows(a: DealApplicability): Array<{
  key: "services" | "products" | "packages"
  label: string
  scope: DealResourceScope
  value: string
}> {
  const priority = (s: DealResourceScope) => (s.mode === "selected" ? 0 : s.mode === "all" ? 1 : 2)
  return [
    {
      key: "services" as const,
      label: "Services",
      scope: a.services,
      value: scopeStatusLabel(a.services, "service", "services"),
    },
    {
      key: "products" as const,
      label: "Products",
      scope: a.products,
      value: scopeStatusLabel(a.products, "product", "products"),
    },
    {
      key: "packages" as const,
      label: "Packages",
      scope: a.packages,
      value: scopeStatusLabel(a.packages, "package", "packages"),
    },
  ].sort((x, y) => priority(x.scope) - priority(y.scope))
}

/**
 * "All locations" / "Shampooch JVC" / "3 locations" / "No locations".
 *
 * The Locations line the built Availability tab prints, given something to
 * say. "All locations" is the named set a branch opened later joins; "3
 * locations" is today's three and is not.
 */
export function formatLocations(
  scope: PromotionScope,
  locationName: (id: string) => string,
): string {
  if (scope.kind === "estate") return "All locations"
  if (scope.locationIds.length === 0) return "No locations"
  if (scope.locationIds.length === 1) return locationName(scope.locationIds[0]!)
  return `${scope.locationIds.length} locations`
}

/** A deal that reaches nobody can never read Active, whatever was stored. */
export function resolvedStatus(deal: Deal, todayIso: string): DealStatus {
  const runnable = deal.scope.kind === "estate" || deal.scope.locationIds.length > 0
  return runnable ? statusFor(deal.status, deal.startDate, deal.endDate, todayIso) : "inactive"
}
