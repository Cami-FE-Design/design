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
 * ## Scanning is the default, editing is a mode
 *
 * Seven branches needing attention is seven cards, and with a labelled Low at
 * and Reorder input on each that is a dialog-length scroll whose rows are
 * mostly two empty fields — six "Not set" pairs say nothing about which branch
 * to act on. So a row reads as one line with its thresholds summarised beside
 * it, and the inputs appear only when the operator says they are editing.
 * Setting a reorder point is a deliberate act; finding the branch that ran out
 * is the thing being done every time this card is opened.
 *
 * ## Out of scope, per the PRD
 *
 * Moving stock between branches. Per-branch stock is the v0 model, confirmed at
 * the 2026-09-02 workshop, with cross-branch transfer and a central warehouse
 * in future backlog — so nothing here offers a transfer, and the reorder
 * affordance orders from a supplier rather than borrowing from a sibling.
 */

import { AlertTriangleIcon, PackageIcon } from "lucide-react"
import { useState } from "react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  attentionNotice,
  type BranchStock,
  type BranchStockLevel,
  businessQuantity,
  canReorder,
  collapseStock,
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
  // Above the early return: hooks cannot sit behind a branch.
  const [showAll, setShowAll] = useState(false)
  const [editing, setEditing] = useState(false)
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
  const notice = attentionNotice(rows)
  const total = businessQuantity(stock, product.id, ids)

  // Two bounds, both in the lib so they can be tested: healthy branches fold,
  // and the ones that need attention are capped — see collapseStock.
  const collapsed = collapseStock(rows)
  const shownRows = showAll ? rows : collapsed.shown

  return (
    <div className="flex flex-col gap-3">
      {notice ? (
        <div className="flex items-start gap-3 rounded-xl bg-cami-yellow-2 p-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          {/* Said before the rows, because at nine branches the row that needs
              attention is below the fold. The count, not the names — the rows
              underneath carry those — and the reason named for the states
              actually present, not the worst one imaginable. */}
          <p className="text-sm leading-5 text-foreground">{notice}</p>
        </div>
      ) : null}

      {/* Collapsed to what needs doing, the way per-branch pricing already
          collapses (D5). Nine editable cards is a scroll whose interesting row
          is below the fold — and the job here is spotting the branch that has
          run out, not reading eight that have not. Under four branches nothing
          folds, because hiding three cards behind a click is worse than three
          cards. */}
      {collapsed.hidden > 0 || onThresholds ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {collapsed.hidden > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-sm font-medium text-cami-violet-11 hover:underline"
            >
              {/* "Show only what needs attention" is a promise the collapsed
                  view cannot keep once the cap is what hid the rows — at twenty
                  branches all twenty may need it. */}
              {showAll
                ? attention.length < rows.length
                  ? "Show only what needs attention"
                  : `Show the first ${collapsed.shown.length}`
                : `Show all ${rows.length} locations`}
            </button>
          ) : null}
          {/* One switch for the whole list rather than a control per row:
              thresholds are set in a sitting, and seven disclosure arrows is
              the scroll this was meant to remove. */}
          {onThresholds ? (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-sm font-medium text-cami-violet-11 hover:underline"
            >
              {editing ? "Done" : "Edit reorder points"}
            </button>
          ) : null}
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {shownRows.map((row) => {
          const location = byId(row.locationId)
          const level = stockLevel(row)
          return (
            <li
              key={row.locationId}
              className={cn(
                "flex flex-col rounded-2xl border px-3",
                editing ? "gap-2 py-3" : "gap-0.5 py-2.5",
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
              {/* A branch nobody has configured says so once, rather than
                  twice in the same breath. Worth saying at all: an empty shelf
                  with no reorder point is the reason it was never reported low
                  before it ran out. */}
              {!editing && row.lowStockLevel === undefined && row.reorderQty === undefined ? (
                <span className="text-xs text-muted-foreground">No reorder point set</span>
              ) : (
                <div
                  className={cn(
                    "flex flex-wrap gap-x-4",
                    editing ? "items-end gap-y-3" : "items-baseline gap-y-1",
                  )}
                >
                  <ThresholdField
                    id={`low-${row.locationId}`}
                    label="Low at"
                    value={row.lowStockLevel}
                    onChange={(next) => onThresholds?.(row.locationId, { lowStockLevel: next })}
                    readOnly={!onThresholds || !editing}
                  />
                  <ThresholdField
                    id={`reorder-${row.locationId}`}
                    label="Reorder"
                    value={row.reorderQty}
                    onChange={(next) => onThresholds?.(row.locationId, { reorderQty: next })}
                    readOnly={!onThresholds || !editing}
                  />
                </div>
              )}
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

      {/* Only when ordering is actually one of the fixes. A branch below zero
          is not short of stock — its count is wrong — and the notice above says
          so, so offering a purchase order there argued with itself. */}
      {canReorder(rows) ? (
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
