"use client"

/**
 * SCR-11 · One product's stock, branch by branch (R16, R18, E09, DW4.1, DW4.2).
 *
 * ## Why the total is at the bottom and not the top
 *
 * SCR-11's job is "manager knows what is on their shelf". The rows are the
 * answer; the total is a consequence of them, and putting it first invites the
 * reading a business total cannot support — 18 at one branch and -2 at another
 * sum to a healthy 16, and the -2 is the only row worth acting on. Rows first,
 * then the sum, labelled as a sum. Same argument the money roll-up makes, for
 * the same reason.
 *
 * ## Never stored
 *
 * R16: "the Business quantity is derived from its Locations and never stored
 * independently." So there is no total in the data and no way to set one — the
 * figure below is `businessQuantity()` over the rows above it, which is what
 * makes DW4.2 ("I never reconcile it by hand") true by construction rather than
 * by discipline.
 *
 * ## Empty and negative are different problems
 *
 * Zero means the shelf is empty and the action is a reorder. Below zero means
 * the count is wrong — something was sold that was never booked in — and the
 * action is a stock take. The built product allows negative balances and shows
 * them, so the row says which of the two it is rather than colouring both red
 * and leaving the manager to guess.
 *
 * ## Out of scope, per the PRD
 *
 * Moving stock between branches. Per-branch stock is the v0 model, confirmed at
 * the 2026-09-02 workshop, with cross-branch transfer and a central warehouse
 * in future backlog — so nothing here offers a transfer, and the reorder
 * affordance orders from a supplier rather than borrowing from a sibling.
 */

import { AlertTriangleIcon, PackageIcon } from "lucide-react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type BranchStock,
  type BranchStockLevel,
  businessQuantity,
  needsAttention,
  type StockedProduct,
  stockForProduct,
  stockLevel,
} from "@/lib/inventory/branch-stock"
import { BRANCH_STOCK } from "@/lib/inventory/mock"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

export function ProductBranchStock({
  product,
  stock = BRANCH_STOCK,
  onThresholds,
}: {
  product: StockedProduct
  /** Injectable so a showcase can pin the states without touching the seed. */
  stock?: ReadonlyArray<BranchStock>
  /**
   * Change one branch's reorder configuration. Omitted makes the fields
   * read-only — a card that shows a threshold it cannot change is honest, one
   * that offers an input and drops the value is not.
   */
  onThresholds?: (
    locationId: string,
    patch: { lowStockLevel?: number; reorderQty?: number },
  ) => void
}) {
  // The granted set, not the estate. A branch manager sees their own shelf and
  // no one else's, and the bound is read here rather than passed so no caller
  // can widen it (R18).
  const { granted, scopedLocations, isMultiLocation, byId } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted

  if (!product.trackStock) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
          <PackageIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium leading-5 text-foreground">Unlimited</span>
          <p className="text-sm leading-5 text-muted-foreground">
            This product is not counted, so there is nothing to track per location. Turn stock
            tracking on to give each location its own count.
          </p>
        </div>
      </div>
    )
  }

  const ids = inScope.map((location) => location.id)
  const rows = stockForProduct(stock, product.id, ids)
  const attention = needsAttention(rows)
  const total = businessQuantity(stock, product.id, ids)

  return (
    <div className="flex flex-col gap-3">
      {attention.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl bg-cami-yellow-2 p-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          <p className="text-sm leading-5 text-foreground">
            {/* Said before the rows, because at nine branches the row that
                needs attention is below the fold. The count, not the names —
                the rows underneath carry those. */}
            {attention.length === 1
              ? "1 location needs attention."
              : `${attention.length} locations need attention.`}{" "}
            A location below zero has sold more than it received, which a stock take fixes rather
            than a reorder.
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          const location = byId(row.locationId)
          const level = stockLevel(row)
          return (
            <li
              key={row.locationId}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border p-3",
                level === "negative" ? "border-destructive/40" : "border-border/60",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium leading-5 text-foreground">
                    {location?.name ?? row.locationId}
                  </span>
                  {location ? <LocationStatusBadge status={location.status} /> : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <StockLevelNote level={level} />
                  <span
                    className={cn(
                      "font-heading text-base font-semibold tabular-nums",
                      level === "negative" || level === "out"
                        ? "text-destructive"
                        : "text-foreground",
                    )}
                  >
                    {row.quantity}
                  </span>
                </span>
              </div>

              {/* Per branch, because R16 puts reorder configuration on the
                  location — a busy branch and a quiet one do not reorder at the
                  same threshold, and one shared number would make the busy one
                  run out or the quiet one overstock.
                  Editable here, and only here: the product form used to carry
                  one pair of fields with no location while telling the operator
                  that each location sets its own, which is a claim with nowhere
                  to act on it. */}
              <div className="flex flex-wrap items-end gap-3">
                <ThresholdField
                  id={`low-${row.locationId}`}
                  label="Low at"
                  value={row.lowStockLevel}
                  onChange={(next) => onThresholds?.(row.locationId, { lowStockLevel: next })}
                  readOnly={!onThresholds}
                />
                <ThresholdField
                  id={`reorder-${row.locationId}`}
                  label="Reorder"
                  value={row.reorderQty}
                  onChange={(next) => onThresholds?.(row.locationId, { reorderQty: next })}
                  readOnly={!onThresholds}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {/* After the rows, and named as a sum — the order is the argument. Absent
          below two rows, where it would restate the row above it and tell a
          manager granted one branch that their shelf is the business. */}
      {rows.length > 1 ? (
        <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-muted/30 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Business quantity — the sum of {rows.length} locations
          </span>
          <span className="shrink-0 font-heading text-lg font-semibold tabular-nums text-foreground">
            {total}
          </span>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {isMultiLocation
          ? "A sale, adjustment or delivery changes only the location it happened at. Stock is not moved between locations."
          : "A sale, adjustment or delivery changes this location's count."}
      </p>

      {attention.length > 0 ? (
        <Button type="button" variant="outline" radius="full" className="w-fit">
          {/* Ordering from a supplier, not borrowing from a sibling branch:
              cross-branch transfer is explicitly future backlog. */}
          Create a purchase order
        </Button>
      ) : null}
    </div>
  )
}

/**
 * One threshold, editable in place.
 *
 * Empty is `undefined` rather than 0 — no opinion, not "low at zero" — which is
 * the same distinction the model makes and the reason a branch with no
 * threshold is never reported as low.
 */
function ThresholdField({
  id,
  label,
  value,
  onChange,
  readOnly,
}: {
  id: string
  label: string
  value: number | undefined
  onChange: (next: number | undefined) => void
  readOnly?: boolean
}) {
  if (readOnly) {
    return (
      <span className="text-xs text-muted-foreground">
        {label} <span className="text-foreground">{value ?? "not set"}</span>
      </span>
    )
  }
  return (
    <span className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        placeholder="Not set"
        value={value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="h-9 w-24 rounded-xl px-3 text-sm"
      />
    </span>
  )
}

/** The word for the state, so colour is never the only carrier. */
function StockLevelNote({ level }: { level: BranchStockLevel }) {
  if (level === "ok") return null
  const label =
    level === "negative" ? "Count is wrong" : level === "out" ? "Out of stock" : "Running low"
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        level === "low"
          ? "bg-cami-yellow-3 text-cami-yellow-11"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {label}
    </span>
  )
}
