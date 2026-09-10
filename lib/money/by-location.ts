import { type PeriodFilter, summarize } from "@/lib/money/ledger"
import type { MoneySummary, MoneyTx } from "@/lib/money/types"

/**
 * Money, broken out per branch (R09, R18, KH1.1–KH1.3, SCR-15).
 *
 * ## Side by side, never merged
 *
 * KH1.1 is unusually explicit for a story, and the reason is that the obvious
 * implementation destroys the job: "the roll-up shows a per-location breakdown
 * side by side, not a merged total. A single number destroys the job." An owner
 * asking "how did today go" across nine branches is asking which branch had a
 * bad day — one total cannot answer that, and they will go back to phoning each
 * branch, which is the thing BG-05 measures.
 *
 * So the roll-up here is a **consequence** of the rows rather than a figure of
 * its own. It is summed from the branches, never stored and never queried
 * separately, which is also what stops the two disagreeing.
 *
 * ## Bounded by the grant, not filtered by it
 *
 * `allowed` is the caller's granted set, and it bounds the result before
 * anything is summed. "Run a report on everything" can therefore never exceed
 * what the caller holds (R18, KH1.2), and for a manager granted one branch
 * "all my branches" returns exactly that branch, correctly labelled as theirs
 * (KH1.3) — not an error, and not everyone else's numbers.
 *
 * That is a different thing from a UI filter. A filter narrows what is shown
 * from a wider result; this never fetches the wider result at all.
 *
 * ## Attribution is frozen at the event
 *
 * A transaction's location was recorded when it happened and is never
 * recomputed (INV-01, R09). Editing the location set later — renaming a
 * branch, archiving one — cannot move historical money, which is why the rows
 * are grouped by the name stamped on the transaction rather than resolved
 * through today's estate. An archived branch keeps reporting (KH1.5).
 */

export type LocationMoneyRow = {
  locationName: string
  summary: MoneySummary
}

export type MoneyByLocation = {
  /** One row per granted branch that has activity in the period, name-ordered. */
  rows: LocationMoneyRow[]
  /** Summed from `rows`. Derived, never stored. */
  rollUp: MoneySummary
  /**
   * Branches the caller is granted that had no activity in the period. Named
   * rather than dropped: "no sales at Al Quoz today" and "Al Quoz is missing
   * from this report" are different answers, and an owner needs the first.
   */
  quietLocations: string[]
}

export function summarizeByLocation(
  txs: ReadonlyArray<MoneyTx>,
  filter: PeriodFilter,
  /** The caller's granted branch names. The result never exceeds this. */
  allowed: ReadonlyArray<string>,
): MoneyByLocation {
  const allowedSet = new Set(allowed)
  const inScope = txs.filter((t) => allowedSet.has(t.locationName))

  const names = Array.from(new Set(inScope.map((t) => t.locationName)))
  const rows = names
    .map((locationName) => ({
      locationName,
      summary: summarize(
        inScope.filter((t) => t.locationName === locationName),
        filter,
      ),
    }))
    // A branch whose whole activity predates the period contributes an opening
    // balance and nothing else; it belongs in quietLocations, not as a row of
    // zeroes pretending to be a trading day.
    .filter((row) => hasActivity(row.summary))
    // Biggest first, and name as the tie-break so the order is stable. The
    // question this screen answers is which branch carried the period, and an
    // ordered list answers it before anyone reads a number — alphabetical
    // ordering made every reader compare the figures themselves.
    .sort(
      (a, b) =>
        b.summary.moneyIn.totalMinor - a.summary.moneyIn.totalMinor ||
        a.locationName.localeCompare(b.locationName),
    )

  const rollUp = summarize(inScope, filter)
  const loud = new Set(rows.map((r) => r.locationName))
  const quietLocations = allowed.filter((n) => !loud.has(n)).sort()

  return { rows, rollUp, quietLocations }
}

/**
 * Whether a branch actually traded in the period. Payout count matters as well
 * as money in: a branch that took nothing but received a payout had a day.
 */
export function hasActivity(summary: MoneySummary): boolean {
  return summary.moneyIn.totalMinor !== 0 || summary.payouts.count > 0
}

/**
 * The share of the roll-up one branch accounts for, 0–1.
 *
 * Guarded rather than clamped: a period whose roll-up is zero has no shares to
 * compute, and returning 0 is honest where dividing would produce Infinity or
 * NaN and render as a bar of unpredictable width.
 */
export function shareOfRollUp(row: LocationMoneyRow, rollUp: MoneySummary): number {
  if (rollUp.moneyIn.totalMinor === 0) return 0
  return row.summary.moneyIn.totalMinor / rollUp.moneyIn.totalMinor
}
