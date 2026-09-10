"use client"

/**
 * SCR-15 · Money by branch (R09, R18, KH1.1–KH1.3).
 *
 * The screen KH1.1 asks for, and the one the obvious implementation gets
 * wrong: "the roll-up shows a per-location breakdown **side by side, not a
 * merged total**. A single number destroys the job." An owner asking how the
 * day went across nine branches is asking *which branch* had a bad one, and a
 * total cannot answer that — so they go back to phoning each branch, which is
 * exactly what BG-05 measures.
 *
 * The total is therefore rendered as what it is: the sum of the rows above it,
 * placed after them and labelled as derived. Not a headline with a breakdown
 * hidden underneath.
 *
 * Three things this component does not do, each on purpose:
 *
 * - **It does not filter.** The rows it receives are already bounded by the
 *   caller's granted set (R18, KH1.2). A filter narrows a wider result; this
 *   never has the wider result.
 * - **It does not hide a single-branch case.** A manager granted one branch
 *   sees one row and a total equal to it — their real number, correctly
 *   labelled as theirs (KH1.3), rather than an error or a hidden section.
 * - **It does not break out payouts per branch.** UAE v0 settles per business
 *   into one account (GP1.4), so a payout is not a branch row. Attributing it
 *   would double-count against takings already attributed on the sale. The
 *   footnote says so rather than leaving a suspicious gap.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { formatAed } from "@/lib/format"
import { useLocations } from "@/lib/locations/store"
import { type MoneyByLocation, shareOfRollUp, summarizeByLocation } from "@/lib/money/by-location"
import type { PeriodFilter } from "@/lib/money/ledger"
import type { MoneyTx } from "@/lib/money/types"
import { cn } from "@/lib/utils"

function aed(minor: number): string {
  return formatAed(Math.round(minor / 100))
}

export function MoneyByLocationView({
  txs,
  filter,
  className,
  loading = false,
}: {
  txs: ReadonlyArray<MoneyTx>
  filter: PeriodFilter
  className?: string
  /**
   * Waiting on the roll-up.
   *
   * This is the one multi-location surface with a loading state worth drawing.
   * It is a query bounded by the grant that sums a row per branch, and at nine
   * branches it is the one the product has a budget for — `PRD-78` is an E2E
   * whose whole subject is that this query stays inside it. Every other branch
   * surface reads data it already has.
   */
  loading?: boolean
}) {
  // The granted set, not the estate: this is where R18's bound comes from, and
  // it is read rather than passed so no caller can widen it by accident.
  const { granted, scopedLocations, isMultiLocation } = useLocations()
  const allowed = (scopedLocations.length > 0 ? scopedLocations : granted).map((l) => l.name)
  const data = summarizeByLocation(txs, filter, allowed)

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Money by location</h2>
        <p className="text-sm text-muted-foreground">
          {isMultiLocation
            ? "Each location's own takings, biggest first, and the business total summed from them."
            : "Your location's takings for this period."}
        </p>
      </div>

      {loading ? <RowsSkeleton count={allowed.length} /> : <Rows data={data} />}

      <p className="text-xs text-muted-foreground">
        Fees and refunds sit with the location that took the payment. Payouts are business-level in
        this market — one account for the whole business — so they are not broken out per location.
      </p>
    </section>
  )
}

/**
 * The shape the answer will have, not a spinner.
 *
 * One placeholder per branch in scope, because that count is known before the
 * money is — an owner on nine branches should see nine rows coming rather than
 * a spinner that could resolve to anything. The total row is included for the
 * same reason: it is always there, so its absence would read as movement.
 */
function RowsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading money by location">
      {Array.from({ length: Math.max(count, 1) }, (_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
          key={index}
          className="flex flex-col gap-2 rounded-2xl border border-border/60 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
      {/* The total row too: it is always present, so leaving it out would read
          as the layout moving rather than filling. */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  )
}

function Rows({ data }: { data: MoneyByLocation }) {
  if (data.rows.length === 0) {
    return (
      <p className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
        No takings at any of your locations in this period.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {data.rows.map((row) => {
        const share = shareOfRollUp(row, data.rollUp)
        return (
          <div
            key={row.locationName}
            className="flex flex-col gap-2 rounded-2xl border border-border/60 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-foreground">
                {row.locationName}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                {/* The share as a figure, not a bar. A bar with no scale reads
                    as decoration, and at nine branches nine of them are a
                    texture rather than a comparison — the ordering above
                    already carries "who carried the period". */}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(share * 100)}%
                </span>
                <span className="font-heading text-lg font-semibold text-foreground">
                  {aed(row.summary.moneyIn.totalMinor)}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                Sales <span className="text-foreground">{aed(row.summary.moneyIn.salesMinor)}</span>
              </span>
              <span>
                Tips <span className="text-foreground">{aed(row.summary.moneyIn.tipsMinor)}</span>
              </span>
              <span>
                Fees{" "}
                <span className="text-foreground">{aed(row.summary.deductions.camiFeeMinor)}</span>
              </span>
              <span>
                Refunds{" "}
                <span className="text-foreground">{aed(row.summary.deductions.refundsMinor)}</span>
              </span>
            </div>
          </div>
        )
      })}

      {/* After the rows, and named as a sum. The order is the argument.
          Absent when there is one row: "Business total — the sum of 1 location"
          restates the row directly above it, and worse, it tells a manager
          granted one branch that their branch is the business. Their number is
          right; the label was not. */}
      {data.rows.length > 1 ? (
        <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-muted/30 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Business total — the sum of {data.rows.length} locations
          </span>
          <span className="shrink-0 font-heading text-lg font-semibold text-foreground">
            {aed(data.rollUp.moneyIn.totalMinor)}
          </span>
        </div>
      ) : null}

      {/* Named, not dropped. "Nothing at Al Quoz today" and "Al Quoz is missing
          from this report" are different answers to an owner.
          Named in a sentence up to three, and counted above a list after that:
          at nine branches this read "No takings this period at Shampooch Al
          Majaz, Shampooch Al Quoz, Shampooch Al Reem, Shampooch Business Bay,
          Shampooch Dubai Marina, Shampooch Mirdif, Shampooch Yas Island." —
          the count is the fact, and seven names inside one sentence hide it. */}
      {data.quietLocations.length > 0 ? (
        data.quietLocations.length <= 3 ? (
          <p className="text-xs text-muted-foreground">
            No takings this period at {data.quietLocations.join(", ")}.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              No takings this period at {data.quietLocations.length} locations:
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {data.quietLocations.map((name) => (
                <li key={name} className="text-xs text-muted-foreground">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </div>
  )
}
