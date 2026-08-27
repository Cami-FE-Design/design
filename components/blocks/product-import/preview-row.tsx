"use client"

// One row of the import preview, plus its expanded detail. Faithful port of
// cami-business `PreviewRow` (product branch) for DSG-80 phase 1 — including
// the parts the redesign will change: the Issues column shows counts rather
// than reasons (D2), and the reason itself is only reachable behind the
// "View changes" chevron (D1, D4).

import { AlertCircleIcon, AlertTriangleIcon, ChevronDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  fieldLabel,
  MATCHED_BY_LABELS,
  PREVIEW_GRID_TEMPLATE,
  PRODUCT_OVERRIDE_LABELS,
} from "@/lib/product-import/config"
import type {
  ProductImportPreviewRow,
  ProductRowStatus,
  RowOverride,
} from "@/lib/product-import/types"
import { cn } from "@/lib/utils"
import { RowDiffTable } from "./row-diff-table"

// Raw Tailwind palette, exactly as production has it. Off the cami scales on
// purpose — this is spec defect D12, and phase 2 replaces it with tokens.
const STATUS_BADGE: Record<ProductRowStatus, { label: string; className: string }> = {
  create: { label: "Create", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  update: { label: "Update", className: "border-blue-200 bg-blue-50 text-blue-700" },
  flag: { label: "Needs review", className: "border-amber-200 bg-amber-50 text-amber-700" },
  noop: { label: "No change", className: "border-border bg-muted text-muted-foreground" },
  skip: { label: "Skipped", className: "border-border bg-muted text-muted-foreground" },
  reject: {
    label: "Rejected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
}

type Props = {
  row: ProductImportPreviewRow
  expanded: boolean
  onToggleExpand: () => void
  override: RowOverride
  onOverrideChange: (next: RowOverride) => void
}

export function PreviewRow({ row, expanded, onToggleExpand, override, onOverrideChange }: Props) {
  const isReject = row.status === "reject"
  // A reject caused by an in-file barcode clash is the one rejection the
  // operator can undo in place: import the row minus the colliding barcode.
  const dupFields = row.duplicateConflictFields ?? []
  const isRescuableReject = isReject && dupFields.length > 0
  const rescued = override.importWithoutDuplicate === true
  const dupList = dupFields.join(" and ")

  const warnings = row.warnings ?? []
  const errors = row.errors ?? []
  const hasWarnings = warnings.length > 0
  const hasErrors = errors.length > 0
  const showError = isReject || hasErrors

  const { autoChanges, flaggedChanges } = row.product
  const flaggedKeys = flaggedChanges ? Object.keys(flaggedChanges) : []
  const status = STATUS_BADGE[row.status]
  const matchedBy = row.product.matchedBy ? MATCHED_BY_LABELS[row.product.matchedBy] : null

  const secondary = row.product.sku
    ? `SKU ${row.product.sku}`
    : row.product.barcode
      ? `Barcode ${row.product.barcode}`
      : "—"

  const hasDetails =
    Boolean(autoChanges) || Boolean(flaggedChanges) || isReject || hasErrors || hasWarnings

  return (
    <div className="border-b border-border/40">
      <div
        className="grid items-center gap-3 px-3 py-2.5 text-sm"
        style={{ gridTemplateColumns: PREVIEW_GRID_TEMPLATE }}
      >
        <span className="text-xs text-muted-foreground">#{row.rowNumber}</span>

        <Badge variant="outline" size="md" className={cn("justify-start", status.className)}>
          {status.label}
        </Badge>

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{row.product.name ?? "—"}</span>
          <span className="truncate text-xs text-muted-foreground">{secondary}</span>
        </div>

        <div className="flex min-w-0 flex-col items-start">
          <Badge variant="outline" size="sm" className="justify-start font-normal">
            {matchedBy ?? "New"}
          </Badge>
        </div>

        {/* Counts, not reasons — the defect at the heart of the ticket. */}
        <div className="flex flex-col items-center gap-1 text-center">
          {showError && (
            <Badge variant="destructive" size="sm" className="gap-1">
              <AlertCircleIcon />
              {errors.length > 0
                ? `${errors.length} Error${errors.length > 1 ? "s" : ""}`
                : "Error"}
            </Badge>
          )}
          {hasWarnings && (
            <Badge variant="warning" size="sm" className="gap-1">
              <AlertTriangleIcon />
              {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
            </Badge>
          )}
          {!showError && !hasWarnings && <span className="text-xs text-muted-foreground">—</span>}
        </div>

        <button
          type="button"
          aria-label={expanded ? "Hide changes" : "View changes"}
          aria-expanded={expanded}
          disabled={!hasDetails}
          onClick={onToggleExpand}
          className="flex items-center justify-self-end gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          View changes
          <ChevronDownIcon
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Duplicate rescue — import the row without the colliding barcode. */}
      {isRescuableReject && (
        <div className="flex flex-col gap-2 border-t border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <p className="text-[11px] font-medium text-destructive">
            This row&apos;s {dupList} duplicates another record in your file. Import it without the{" "}
            {dupList}, or leave it skipped.
          </p>
          <label
            htmlFor={`rescue-${row.rowNumber}`}
            className="flex w-fit items-center gap-2 text-xs"
          >
            <Switch
              id={`rescue-${row.rowNumber}`}
              checked={rescued}
              onCheckedChange={(v) => onOverrideChange({ ...override, importWithoutDuplicate: v })}
            />
            Import without {dupList}
          </label>
        </div>
      )}

      {/* Per-field approval switches for withheld changes (default off). */}
      {!isReject && flaggedKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-3 pb-2.5">
          {flaggedKeys.map((key) => (
            <label
              key={key}
              htmlFor={`override-${key}-${row.rowNumber}`}
              className="flex items-center gap-2 text-xs"
            >
              <Switch
                id={`override-${key}-${row.rowNumber}`}
                checked={Boolean(override[key as keyof RowOverride])}
                onCheckedChange={(v) => onOverrideChange({ ...override, [key]: v })}
              />
              {PRODUCT_OVERRIDE_LABELS[key] ?? `Apply ${fieldLabel(key)} change`}
            </label>
          ))}
        </div>
      )}

      {expanded && (
        <div className="flex flex-col gap-3 bg-muted/20 px-3 py-3">
          {isReject && (
            <p className="text-xs font-medium text-destructive">
              {rescued
                ? `This row will be imported without the conflicting ${dupList}.`
                : "This row was rejected and will be skipped."}
            </p>
          )}
          {hasErrors && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {isReject ? "Why this row was rejected" : "Errors"}
              </span>
              <ul className="flex flex-col gap-1">
                {errors.map((e) => (
                  <li key={e} className="flex items-start gap-1.5 text-xs text-destructive">
                    <AlertCircleIcon className="mt-0.5 size-3 shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasWarnings && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Warnings</span>
              <ul className="flex flex-col gap-1">
                {warnings.map((w) => (
                  <li key={w} className="flex items-start gap-1.5 text-xs text-amber-700">
                    <AlertTriangleIcon className="mt-0.5 size-3 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {autoChanges && Object.keys(autoChanges).length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Will apply automatically
              </span>
              <RowDiffTable changes={autoChanges} />
            </div>
          )}
          {flaggedChanges && Object.keys(flaggedChanges).length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Needs your approval (toggle above to apply)
              </span>
              <RowDiffTable changes={flaggedChanges} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
