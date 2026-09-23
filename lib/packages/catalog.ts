/**
 * A package, in the shape the built product holds one.
 *
 * ## Taken from `cami-business/src/types/packages.ts`
 *
 * This repo modelled a package as seven display fields — a name, a count, a
 * price and a colour — which is enough to draw a card and not enough to answer
 * anything a merchant asks of it. The real one carries the two things the till
 * and the client page both read: what it covers, and how it is paid for.
 *
 * The enums below are the built product's, values included, because a screen
 * that offers "6 months" where the API takes `6m` is a screen that cannot be
 * wired without rewriting it.
 *
 * ## Where multi-location enters, and where it deliberately does not
 *
 * R08: **stored value is business-wide, consumption resolves to one branch.**
 * So a package has no location scope of its own — unlike a deal, which one
 * branch can run alone (DW3.4, R24). A deal is a marketing decision; a package
 * is a prepaid obligation the client bought from the chain, and scoping it
 * after the sale would take back something already paid for.
 *
 * The branch axis shows up in three narrower places instead:
 *
 * - `onlineSales` — a chain's public page picks a branch first (R15, SCR-08),
 *   so "sold online" has to mean "on which branches' pages". One switch for the
 *   business, overridden per branch, the same inherit/override the service
 *   catalogue uses (R06, DW3.2).
 * - `sales[]` — each row names the branch that sold it, so the detail can be
 *   bounded by the reader's grant (R18) rather than showing a manager the
 *   estate's book.
 * - Redemption — handled at the till (`lib/packages/allocate`), where a session
 *   resolves to one branch (R11) and a branch pricing the service differently
 *   warns and still completes (KC1.5).
 */

export type SessionType = "limited" | "unlimited"
export type PaymentType = "one-time" | "recurring"
export type ValidFor = "1m" | "3m" | "6m" | "12m"
export type Frequency = "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly"
export type PackageLength = "until-canceled" | "3m" | "6m" | "9m" | "12m" | "custom"

/** One client's purchase, listed on the package's own detail. */
export type PackageSaleRow = {
  customerPackageId: string
  code: string
  customerId: string
  customerName: string
  status: "active" | "exhausted" | "cancelled"
  sessionsTotal: number | null
  sessionsRemaining: number | null
  sessionsUsed: number | null
  purchasedAt: string
  expiresAt: string | null
  /** Ours (R18): the branch that sold it, so the list can be grant-bounded. */
  soldAtLocationId: string
}

export type Package = {
  id: string
  name: string
  description: string | null
  /** Catalog ids — `serviceId` or `serviceId::variantId`, as coverage reads them. */
  services: string[]
  sessionType: SessionType
  /** `null` for an unlimited package. */
  sessionCount: number | null
  payment: PaymentType
  // One-time only.
  validFor: ValidFor | null
  /** In fils. `null` on a recurring package. */
  price: number | null
  // Recurring only.
  frequency: Frequency | null
  /** In fils, charged every `frequency`. */
  recurringPrice: number | null
  length: PackageLength | null
  taxRate: string | null
  colour: string
  onlineSales: boolean
  onlineRedemption: boolean
  terms: string | null
  createdAt: string
  updatedAt: string
  /** Present on the detail only, never on the list. */
  sales?: PackageSaleRow[]
}

/** How long the package stays usable, in the words a merchant reads. */
export const VALID_FOR_LABEL: Record<ValidFor, string> = {
  "1m": "1 month",
  "3m": "3 months",
  "6m": "6 months",
  "12m": "12 months",
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  weekly: "Weekly",
  "bi-weekly": "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
}

export const LENGTH_LABEL: Record<PackageLength, string> = {
  "until-canceled": "Until cancelled",
  "3m": "3 months",
  "6m": "6 months",
  "9m": "9 months",
  "12m": "12 months",
  custom: "Custom",
}

/** "6 sessions" / "Unlimited" — the sessions cell, and the badge on the card. */
export function sessionsLabel(pkg: Pick<Package, "sessionType" | "sessionCount">): string {
  if (pkg.sessionType === "unlimited") return "Unlimited"
  const n = pkg.sessionCount ?? 0
  return `${n} session${n === 1 ? "" : "s"}`
}

/**
 * What it costs, said the way it is charged.
 *
 * A recurring package has no single price, and printing its per-period figure
 * as if it were one is how a merchant reads AED 120 for something that bills
 * AED 120 every month until cancelled.
 */
export function priceLabel(pkg: Package): { amountMinor: number; suffix: string } {
  if (pkg.payment === "recurring") {
    return {
      amountMinor: pkg.recurringPrice ?? 0,
      suffix: pkg.frequency ? `/ ${FREQUENCY_LABEL[pkg.frequency].toLowerCase()}` : "",
    }
  }
  return { amountMinor: pkg.price ?? 0, suffix: "" }
}
