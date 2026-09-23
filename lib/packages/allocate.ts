/**
 * Spending a client's package sessions across a cart, the way the product does.
 *
 * ## Ported, not invented
 *
 * `cami-business`'s `src/lib/membership.ts` already decides this, and three
 * screens call it — the new-sale sheet, the sales appointment sheet and the
 * add-appointment sheet. The rules below are its rules, with its reasoning kept
 * where it explains a shape that looks arbitrary otherwise.
 *
 * This repo had modelled the same job as a panel with an **Apply** button per
 * line, off the `/merchant/customer-packages/eligibility` contract. That
 * endpoint is real and its four verdicts are real — and no screen in either
 * repo calls it. What the product actually ships is this: coverage is worked
 * out from the client's packages in the browser, applied on its own, and shown
 * as a chip on the line. An operator never presses Apply, so a panel that asks
 * them to is a different product.
 *
 * ## Finite sessions, first fit
 *
 * A package with two sessions covers every service it names, so asking "does
 * this package cover this service" marks three lines as covered and charges
 * nothing for any of them. The question that pays the bill is "is there a
 * session left", and that is what `allocate` answers: one session per line, in
 * cart order, and a line that finds nothing left stays at full price.
 *
 * Order is the caller's, so removing a line re-runs the allocation and a line
 * that missed out inherits the freed session.
 */

import type { CustomerPackageSummary } from "@/lib/packages/customer-packages"

/** What a line won when a session was allocated to it. */
export type AllocatedSession = {
  /** The package's colour, for the chip. */
  colour: string
  /** `null` means unlimited — the chip reads "Unlimited" rather than a count. */
  sessionsRemaining: number | null
  sessionsTotal: number | null
  /**
   * The ledger row to debit — the client's copy of the package, not the catalog
   * one. The built product sends this to the API so the server books the same
   * allocation the screen showed rather than deriving its own.
   */
  customerPackageId: string
}

export type AllocationItem = {
  /** Stable id of the line competing for a session. */
  uid: string
  /** Catalog id — `serviceId` or `serviceId::variantId`. */
  catalogId: string
  /**
   * The package to try FIRST for this line, when one is already committed to it.
   *
   * The built product's field, and it only ever REORDERS the candidates — it
   * never widens them, so a package that cannot fund the line is still passed
   * over. Without it, a client holding two packages can watch the funding
   * package change under a line they did not touch, because adding or removing
   * a different line re-runs the whole allocation in order.
   */
  preferPackageId?: string
}

/**
 * Whether a package can pay for anything right now.
 *
 * Three independent reasons it cannot, and they are not interchangeable: a
 * cancelled package, one with no sessions left, and one past its date are three
 * different sentences to say to a client.
 */
export function isPackageUsable(pkg: CustomerPackageSummary, now: Date): boolean {
  if (pkg.status !== "active") return false
  if (pkg.sessionType === "limited" && (pkg.sessionsRemaining ?? 0) <= 0) return false
  if (pkg.expiresAt && new Date(pkg.expiresAt) <= now) return false
  return true
}

export type ServiceCoverage = {
  colour: string
  sessionsRemaining: number | null
  sessionsTotal: number | null
  customerPackageId: string
}

/** Catalog id → coverage, for every usable package the client holds. */
export function buildCoveredServiceMap(
  packages: CustomerPackageSummary[],
  now: Date = new Date(),
): Map<string, ServiceCoverage> {
  const map = new Map<string, ServiceCoverage>()
  for (const pkg of packages) {
    if (!isPackageUsable(pkg, now)) continue
    for (const svc of pkg.services) {
      map.set(svc, {
        colour: pkg.colour,
        sessionsRemaining: pkg.sessionType === "unlimited" ? null : (pkg.sessionsRemaining ?? 0),
        sessionsTotal: pkg.sessionType === "unlimited" ? null : (pkg.sessionsTotal ?? 0),
        customerPackageId: pkg.id,
      })
    }
  }
  return map
}

/**
 * The coverage for a catalog id, or nothing.
 *
 * Three passes, and the third is why `strict` exists — the built product's own
 * distinction, kept because getting it wrong spends a session the client never
 * bought:
 *
 * 1. Exact — the same id on both sides.
 * 2. Variant → base — the line is a variant and the package names the whole
 *    service. It covers every variant, so this holds under `strict`.
 * 3. Base → variant — the line is the base service and the package names one
 *    variant. That is a **hint** for a picker row ("a package applies to
 *    something under this"), never an entitlement: a package sold for variant A
 *    must not comp a booking of variant B. `strict` skips it, and pricing and
 *    allocation always pass `strict`.
 */
export function getServiceCoverage(
  catalogId: string,
  coveredMap: Map<string, ServiceCoverage>,
  opts: { strict?: boolean } = {},
): ServiceCoverage | null {
  const direct = coveredMap.get(catalogId)
  if (direct) return direct

  if (catalogId.includes("::")) {
    const base = coveredMap.get(catalogId.split("::")[0] ?? "")
    if (base) return base
  } else if (!opts.strict) {
    const prefix = `${catalogId}::`
    for (const [key, coverage] of coveredMap) {
      if (key.startsWith(prefix)) return coverage
    }
  }

  return null
}

export type Allocation = {
  /** Line uid → the session it won. Absent for lines that got none. */
  byUid: Map<string, AllocatedSession>
  /**
   * Coverage restricted to packages with a session still free, for the service
   * picker. Built from the live capacities rather than re-read from the
   * packages, so a row still to be added shows what is actually left to spend
   * rather than the count the cart started with.
   */
  availableCoveredMap: Map<string, ServiceCoverage>
}

/** Spend the client's remaining sessions across `items`, in order. */
export function allocatePackageSessions(
  items: readonly AllocationItem[],
  packages: CustomerPackageSummary[],
  now: Date = new Date(),
): Allocation {
  const usable = packages
    .filter((pkg) => isPackageUsable(pkg, now))
    .map((pkg) => ({
      pkg,
      coveredMap: buildCoveredServiceMap([pkg], now),
      capacity:
        pkg.sessionType === "unlimited" ? Number.POSITIVE_INFINITY : (pkg.sessionsRemaining ?? 0),
      sessionsRemaining: pkg.sessionType === "unlimited" ? null : (pkg.sessionsRemaining ?? 0),
      sessionsTotal: pkg.sessionType === "unlimited" ? null : (pkg.sessionsTotal ?? 0),
    }))

  const byUid = new Map<string, AllocatedSession>()
  // `strict` — this decides what the client is charged and which session is
  // spent, so the base→variant guess must not apply.
  const canFund = (entry: (typeof usable)[number], catalogId: string) =>
    entry.capacity > 0 && getServiceCoverage(catalogId, entry.coveredMap, { strict: true }) !== null

  for (const item of items) {
    const preferred = item.preferPackageId
      ? usable.find(
          (entry) => entry.pkg.id === item.preferPackageId && canFund(entry, item.catalogId),
        )
      : undefined
    // Falls through to list order when the preferred one cannot fund it, so the
    // hint can only reorder candidates, never widen them.
    const match = preferred ?? usable.find((entry) => canFund(entry, item.catalogId))
    if (!match) continue
    match.capacity -= 1
    byUid.set(item.uid, {
      colour: match.pkg.colour,
      // Post-decrement on purpose: a second line funded by the same package has
      // to read one lower than the first. The package's own starting count
      // would show both lines at the same number and hide that each line spends
      // a session of its own.
      sessionsRemaining: match.sessionsRemaining == null ? null : match.capacity,
      sessionsTotal: match.sessionsTotal,
      customerPackageId: match.pkg.id,
    })
  }

  const availableCoveredMap = new Map<string, ServiceCoverage>()
  for (const entry of usable) {
    if (entry.capacity <= 0) continue
    for (const svc of entry.pkg.services) {
      availableCoveredMap.set(svc, {
        colour: entry.pkg.colour,
        sessionsRemaining: entry.sessionsRemaining == null ? null : entry.capacity,
        sessionsTotal: entry.sessionsTotal,
        customerPackageId: entry.pkg.id,
      })
    }
  }

  return { byUid, availableCoveredMap }
}

/** "3/4 Sessions Remaining", or "Unlimited" for an uncapped package. */
export function formatSessionsRemaining(coverage: {
  sessionsRemaining: number | null
  sessionsTotal: number | null
}): string {
  const { sessionsRemaining, sessionsTotal } = coverage
  if (sessionsRemaining == null || sessionsTotal == null) return "Unlimited"
  return `${sessionsRemaining}/${sessionsTotal} Sessions Remaining`
}

/**
 * What the chip on a covered line reads.
 *
 * Against the client's **whole** balance, not just the package that happened to
 * fund this line — the built product's rule, and the reason it exists: a client
 * holding two packages should read "5/10 → 4/10 → 3/10" as sessions are spent,
 * never "4/5 → 3/5" (the funding package alone) and never a frozen "5/5".
 *
 * Two details that look like bugs and are not:
 *
 * - **Exhausted packages still count toward the total.** A package whose last
 *   session goes flips to exhausted, and dropping it would shrink the
 *   denominator the moment it emptied — landing on a smaller number than the
 *   client actually bought. Only a **cancelled** one is excluded: it was voided,
 *   so it was never theirs to spend.
 * - **Any unlimited package makes the whole chip read "Unlimited".** Summing
 *   finite counts alongside an uncapped one would be a number that means
 *   nothing, and the client's own answer to "how many have I got" is "as many
 *   as you like" while that package is live.
 */
export function aggregateSessionCoverage(
  allocated: Pick<AllocatedSession, "customerPackageId" | "sessionsRemaining"> | null | undefined,
  packages: CustomerPackageSummary[],
): { sessionsRemaining: number | null; sessionsTotal: number | null } | null {
  if (!allocated) return null
  const counted = packages.filter((p) => p.status !== "cancelled")
  if (counted.length === 0) return null
  if (counted.some((p) => p.sessionType === "unlimited")) {
    return { sessionsRemaining: null, sessionsTotal: null }
  }
  const sessionsTotal = counted.reduce((sum, p) => sum + (p.sessionsTotal ?? 0), 0)
  const othersRemaining = counted
    .filter((p) => p.id !== allocated.customerPackageId)
    .reduce((sum, p) => sum + (p.sessionsRemaining ?? 0), 0)
  return {
    sessionsRemaining: (allocated.sessionsRemaining ?? 0) + othersRemaining,
    sessionsTotal,
  }
}

/**
 * Packages that ran out of TIME with sessions still on them, **and that this
 * cart would have used**.
 *
 * The second half is the whole design. Fired on the client alone it is noise: a
 * client buying shampoo does not need to be told about a blow-dry package that
 * lapsed in January, and a notice nobody needs is one an operator learns to
 * dismiss without reading — which costs the next one its audience.
 *
 * Fired against the cart it is the opposite. It appears exactly when the client
 * is about to be charged in full for the thing their package used to cover,
 * which is the moment the client says "I have two left" and reception has
 * nothing to say back. The built product makes the same choice by mounting it on
 * the appointment sheets, where a service is being picked, rather than on a
 * client record.
 *
 * Out of sessions is NOT this. That package did its job; there is nothing to
 * tell anyone and nothing reception could do about it.
 */
export function expiredWithSessionsLeft(
  packages: CustomerPackageSummary[],
  /** Catalog ids in the cart. Nothing is reported for an empty one. */
  catalogIds: ReadonlyArray<string> = [],
  now: Date = new Date(),
): CustomerPackageSummary[] {
  if (catalogIds.length === 0) return []
  return packages.filter((pkg) => {
    if (pkg.status === "cancelled") return false
    if (!pkg.expiresAt) return false
    if (new Date(pkg.expiresAt) > now) return false
    const hasSessions = pkg.sessionType === "unlimited" || (pkg.sessionsRemaining ?? 0) > 0
    if (!hasSessions) return false
    // Would it have paid for something in this cart? Same matching the
    // allocation uses, so the notice and the coverage cannot disagree.
    const covered = buildCoveredServiceMap([{ ...pkg, expiresAt: null }], now)
    return catalogIds.some((id) => getServiceCoverage(id, covered, { strict: true }) !== null)
  })
}

/**
 * {@link aggregateSessionCoverage} for a line that only carries a package id.
 *
 * A sale saved yesterday holds `customerPackageId` and nothing else — the
 * allocation that chose it ran once, at the till, and is not re-run when the
 * sale is reopened. Re-running it would be wrong as well as wasteful: it would
 * spend today's sessions against a sale that already settled, and a package
 * exhausted since would quietly stop explaining a line it did pay for.
 *
 * So the package's own remaining count is looked up first, then summed against
 * the client's others exactly as the live path does. Null when the id names no
 * package the client still holds.
 */
export function aggregateSessionCoverageById(
  customerPackageId: string | null | undefined,
  packages: CustomerPackageSummary[],
): { sessionsRemaining: number | null; sessionsTotal: number | null } | null {
  if (!customerPackageId) return null
  const match = packages.find((p) => p.id === customerPackageId)
  if (!match) return null
  return aggregateSessionCoverage(
    {
      customerPackageId,
      sessionsRemaining: match.sessionType === "unlimited" ? null : (match.sessionsRemaining ?? 0),
    },
    packages,
  )
}
