"use client"

// One row of the redesigned review table.
//
// Four columns instead of six: Row · Status · Product · What happens. The
// as-built "Match" column becomes a line of subtext under the product name, and
// the "Issues" count column is gone entirely — the reason itself now occupies
// the last column (defects D2, D4). Expanding is optional and only offered when
// there is a diff or a full backend sentence to read.

import { ChevronDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { fieldLabel, MATCHED_BY_LABELS } from "@/lib/product-import/config"
import { PRODUCT_OVERRIDE_LABELS, REVIEW_COPY, STATUS_COPY } from "@/lib/product-import/copy"
import { rowOutcome } from "@/lib/product-import/outcome"
import type {
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductRowStatus,
  RowOverride,
} from "@/lib/product-import/types"
import { cn } from "@/lib/utils"
import { RowDiffTable } from "../row-diff-table"

/** Cami-token status badges, replacing the raw emerald/amber/blue set (D12). */
const STATUS_BADGE: Record<
  ProductRowStatus,
  { variant: "success" | "primary-soft" | "warning" | "muted" | "destructive" }
> = {
  create: { variant: "success" },
  update: { variant: "primary-soft" },
  flag: { variant: "warning" },
  noop: { variant: "muted" },
  skip: { variant: "muted" },
  reject: { variant: "destructive" },
}

const OUTCOME_TONE = {
  good: "text-foreground",
  neutral: "text-muted-foreground",
  warn: "text-cami-yellow-11",
  bad: "text-destructive",
} as const

export const REVIEW_GRID_TEMPLATE = "3rem 8.5rem minmax(0,1fr) minmax(0,1.1fr) 2.5rem"

type Props = {
  row: ProductImportPreviewRow
  preview: ProductImportPreview
  expanded: boolean
  onToggleExpand: () => void
  override: RowOverride
  onOverrideChange: (next: RowOverride) => void
}

export function ReviewRow({
  row,
  preview,
  expanded,
  onToggleExpand,
  override,
  onOverrideChange,
}: Props) {
  const outcome = rowOutcome(row, preview, override)
  // A rescued reject keeps status "reject" in the payload, but it is going to be
  // imported — leaving the badge on "Can't import" contradicted its own row.
  const rescuedBadge = row.status === "reject" && override.importWithoutDuplicate === true
  const status = rescuedBadge ? { variant: "warning" as const } : STATUS_BADGE[row.status]
  const { autoChanges, flaggedChanges } = row.product
  const flaggedKeys = flaggedChanges ? Object.keys(flaggedChanges) : []

  const isReject = row.status === "reject"
  const dupFields = row.duplicateConflictFields ?? []
  const isRescuableReject = isReject && dupFields.length > 0
  const rescued = override.importWithoutDuplicate === true

  const matchedBy = row.product.matchedBy ? MATCHED_BY_LABELS[row.product.matchedBy] : null
  // The SKU already appears here, so a chip repeating it beside the outcome was
  // the same code printed twice on the same row.
  const identity = [
    row.product.sku ? `SKU ${row.product.sku}` : null,
    matchedBy ? `matched ${matchedBy}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  // Expansion earns its place only when there is more than the cell already says.
  const hasDetails =
    Boolean(autoChanges && Object.keys(autoChanges).length > 0) ||
    flaggedKeys.length > 0 ||
    (row.errors ?? []).length > 0 ||
    (row.warnings ?? []).length > 0

  return (
    <div className="border-b border-border/40">
      <div
        className="grid items-center gap-3 px-3 py-2.5 text-sm"
        style={{ gridTemplateColumns: REVIEW_GRID_TEMPLATE }}
      >
        <span className="text-xs tabular-nums text-muted-foreground">{row.rowNumber}</span>

        <Badge variant={status.variant} size="md" className="justify-start">
          {rescuedBadge ? STATUS_COPY.create.label : STATUS_COPY[row.status].label}
        </Badge>

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{row.product.name ?? "—"}</span>
          {identity && <span className="truncate text-xs text-muted-foreground">{identity}</span>}
        </div>

        {/* The reason, in words — what the as-built screen hid behind a chevron.
            Empty on rows where the badge already said everything. */}
        <div className="flex min-w-0 flex-col">
          {outcome.text && (
            <span className={cn("text-sm leading-5", OUTCOME_TONE[outcome.tone])}>
              {outcome.text}
            </span>
          )}
        </div>

        {hasDetails ? (
          <button
            type="button"
            aria-label={expanded ? "Hide details" : REVIEW_COPY.detailsOpen}
            aria-expanded={expanded}
            onClick={onToggleExpand}
            className="flex size-7 cursor-pointer items-center justify-center justify-self-end rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDownIcon
              className={cn("size-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* The one rejection an operator can undo in place. Inline, because it
          shows on every rescuable row at once — as a tinted panel it stacked
          into a slab down the table. */}
      {isRescuableReject && (
        <label
          htmlFor={`rescue-${row.rowNumber}`}
          className="flex cursor-pointer items-center gap-2 px-3 pb-3 text-sm text-muted-foreground"
        >
          <Switch
            id={`rescue-${row.rowNumber}`}
            checked={rescued}
            onCheckedChange={(v) => onOverrideChange({ ...override, importWithoutDuplicate: v })}
          />
          Add it without a barcode — you can scan one in later
        </label>
      )}

      {/* Per-field approval, default off. */}
      {!isReject && flaggedKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-3 pb-3">
          {flaggedKeys.map((key) => (
            <label
              key={key}
              htmlFor={`approve-${key}-${row.rowNumber}`}
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <Switch
                id={`approve-${key}-${row.rowNumber}`}
                checked={Boolean(override[key as keyof RowOverride])}
                onCheckedChange={(v) => onOverrideChange({ ...override, [key]: v })}
              />
              {PRODUCT_OVERRIDE_LABELS[key] ?? `Apply the new ${fieldLabel(key).toLowerCase()}`}
            </label>
          ))}
        </div>
      )}

      {/* Expanded detail. A translucent grey panel left this text washed out
          and unreadable, so it gets its own solid ground and body-sized copy. */}
      {expanded && (
        <div className="flex flex-col gap-4 border-t border-sand-6 bg-sand-2 px-3 py-3.5">
          {autoChanges && Object.keys(autoChanges).length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {REVIEW_COPY.willApply}
              </span>
              <RowDiffTable changes={autoChanges} />
            </div>
          )}
          {flaggedChanges && Object.keys(flaggedChanges).length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {REVIEW_COPY.needsApproval}
              </span>
              <RowDiffTable changes={flaggedChanges} />
            </div>
          )}
          {/* The backend's own sentences, kept available verbatim. The grouped
              summary above is the operator's route in; this is the audit trail,
              and the place an unmapped sentence stays visible. */}
          {[...(row.errors ?? []), ...(row.warnings ?? [])].length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                What the checker reported
              </span>
              <ul className="flex flex-col gap-1.5">
                {(row.errors ?? []).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm leading-5 text-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                    />
                    {s}
                  </li>
                ))}
                {(row.warnings ?? []).map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cami-yellow-11"
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
