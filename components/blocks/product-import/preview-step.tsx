"use client"

// Step 3 — the review screen from Aya's screenshot. Faithful port of
// cami-business `PreviewStep` (product branch). Every piece of copy here is
// production copy, including the phrases the ticket exists to replace
// ("Skipped by mode", "New dictionary entries will be created").
//
// Deliberate deviations from production, both fixes to bugs rather than design
// changes: the row list is not virtualized (this repo renders 100 mock rows
// directly, which also avoids the row-overlap bug D5), and the confirm footer
// sits in normal flow.

import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SegmentedToggle, type SegmentedToggleOption } from "@/components/ui/segmented-toggle"
import {
  LOOKUP_LABELS,
  PREVIEW_GRID_TEMPLATE,
  PRODUCT_IMPORT_CONFIG,
  PRODUCT_STATUSES,
  STATUS_LABELS,
} from "@/lib/product-import/config"
import type {
  ConfirmOverrides,
  ProductImportPreview,
  ProductRowStatus,
} from "@/lib/product-import/types"
import { PreviewRow } from "./preview-row"

type StatusFilter = "all" | ProductRowStatus

type Props = {
  preview: ProductImportPreview
  onConfirm: (overrides: ConfirmOverrides) => void
  onCancel: () => void
}

/** The six KPI cards, in production's order. */
function buildKpis(preview: ProductImportPreview) {
  return [
    { label: "To create", value: preview.toCreate },
    { label: "To update", value: preview.toUpdate },
    { label: "Needs review", value: preview.toFlag },
    { label: "No change", value: preview.noChange },
    { label: "Skipped by mode", value: preview.skippedByMode },
    { label: "Rejected", value: preview.rejectedCount },
  ]
}

export function PreviewStep({ preview, onConfirm, onCancel }: Props) {
  const rows = preview.rows
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [overrides, setOverrides] = useState<ConfirmOverrides>({})

  const counts = useMemo(() => {
    const c: Record<ProductRowStatus, number> = {
      create: 0,
      update: 0,
      flag: 0,
      noop: 0,
      skip: 0,
      reject: 0,
    }
    for (const r of rows) c[r.status] += 1
    return c
  }, [rows])

  const filteredRows = useMemo(
    () => (statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter)),
    [rows, statusFilter],
  )

  // Rejects flagged with an in-file duplicate are operator-rescuable.
  const rescuableRejectCount = useMemo(
    () =>
      rows.filter((r) => r.status === "reject" && (r.duplicateConflictFields?.length ?? 0) > 0)
        .length,
    [rows],
  )
  const rescuedCount = useMemo(
    () => Object.values(overrides).filter((o) => o.importWithoutDuplicate === true).length,
    [overrides],
  )

  // Rows that actually write: create + update + flag (its auto-changes) + any
  // reject the operator rescued. noop/skip/unrescued reject write nothing.
  const importableCount = counts.create + counts.update + counts.flag + rescuedCount
  const allRejected = rows.length > 0 && counts.reject === rows.length

  const outcome: "actionable" | "up-to-date" | "all-rejected" =
    importableCount > 0 || rescuableRejectCount > 0
      ? "actionable"
      : allRejected
        ? "all-rejected"
        : "up-to-date"

  const lookupEntries = Object.entries(preview.lookupsToCreate).filter(
    ([, list]) => list.length > 0,
  )

  const filterOptions = [
    { value: "all", label: `All (${rows.length})` },
    ...PRODUCT_STATUSES.map((s) => ({
      value: s,
      label: `${STATUS_LABELS[s]} (${counts[s]})`,
    })),
  ] as [
    SegmentedToggleOption<StatusFilter>,
    SegmentedToggleOption<StatusFilter>,
    ...SegmentedToggleOption<StatusFilter>[],
  ]

  const toggleExpand = (rowNumber: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      {outcome === "actionable" && (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Review before importing</h2>
          <p className="text-sm text-muted-foreground">
            {preview.rowCount} rows analyzed · {preview.normalizedCount} approved. Nothing has been
            created yet.
          </p>
        </div>
      )}

      {outcome === "up-to-date" && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5">
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-medium text-emerald-900">
              Your data is already up to date
            </h2>
            <p className="text-sm text-emerald-800/80">
              All {rows.length} rows match what&apos;s already in your account — there&apos;s
              nothing to import.
              {counts.reject > 0 &&
                ` ${counts.reject} ${counts.reject === 1 ? "row was" : "rows were"} rejected and skipped.`}
            </p>
          </div>
        </div>
      )}

      {outcome === "all-rejected" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3.5">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-medium text-amber-900">
              Nothing to import — every row was rejected
            </h2>
            <p className="text-sm text-amber-800/80">
              Fix the errors in your file and re-upload. Expand any row below to see why it was
              rejected.
            </p>
          </div>
        </div>
      )}

      {/* KPI header — six equal cards, no hierarchy (defect D15). */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {buildKpis(preview).map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <p className="text-2xl font-semibold tabular-nums">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Lookups the import will auto-create. "Dictionary" is internal
          vocabulary reaching the operator (defect D9). */}
      {lookupEntries.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            New dictionary entries will be created
          </p>
          <div className="flex flex-col gap-1.5">
            {lookupEntries.map(([key, list]) => (
              <div key={key} className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-amber-900">
                  {LOOKUP_LABELS[key] ?? key}:
                </span>
                {list.map((name) => (
                  <Badge
                    key={name}
                    variant="outline"
                    size="sm"
                    className="border-amber-300 bg-white/60 text-amber-800"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax rates the file referenced that don't resolve to a configured tax. */}
      {preview.taxesUnresolved.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">Unresolved tax rates</p>
          <p className="text-xs text-amber-800/80">
            These rows reference a tax rate that doesn&apos;t match a configured tax — tax will be
            left unchanged for them:{" "}
            {preview.taxesUnresolved.map((t) => `row ${t.row} (${t.rate}%)`).join(", ")}.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <SegmentedToggle
          ariaLabel="Filter rows by status"
          options={filterOptions}
          value={statusFilter}
          onValueChange={setStatusFilter}
        />
      </div>

      {/* Row table — inner scroll inside a scrolling page (defect D16). */}
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div
          className="grid gap-3 border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-medium text-muted-foreground"
          style={{ gridTemplateColumns: PREVIEW_GRID_TEMPLATE }}
        >
          <span>#</span>
          <span>Status</span>
          <span>Product</span>
          <span>Match</span>
          <span className="text-center">Issues</span>
          <span className="text-end">Changes</span>
        </div>
        {filteredRows.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            No rows match this filter.
          </p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto">
            {filteredRows.map((row) => (
              <PreviewRow
                key={row.rowNumber}
                row={row}
                expanded={expanded.has(row.rowNumber)}
                onToggleExpand={() => toggleExpand(row.rowNumber)}
                override={overrides[row.rowNumber] ?? {}}
                onOverrideChange={(next) =>
                  setOverrides((prev) => ({ ...prev, [row.rowNumber]: next }))
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-3">
        <div className="flex w-full items-center justify-between gap-3">
          {outcome === "actionable" ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="cursor-pointer text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {importableCount} {importableCount === 1 ? "row" : "rows"} will be imported
                  {counts.reject - rescuedCount > 0 &&
                    ` · ${counts.reject - rescuedCount} rejected`}
                </span>
                <Button onClick={() => onConfirm(overrides)}>Confirm &amp; import</Button>
              </div>
            </>
          ) : (
            <div className="ms-auto">
              <Button onClick={onCancel}>Back to {PRODUCT_IMPORT_CONFIG.plural}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
