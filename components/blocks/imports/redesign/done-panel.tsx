"use client"

// The product import's outcome, built on the shared `OutcomePanel` (DSG-80).
//
// This used to render the whole step itself, which is how it drifted from the
// client one — different actions, different placement for the follow-up. All it
// does now is turn a product summary into the shared panel's inputs.

import { DONE_COPY, DONE_LABELS } from "@/lib/imports/copy"
import { groupIssues } from "@/lib/imports/issues"
import { productLookupGroups } from "@/lib/imports/lookups"
import type { ProductImportApplySummary, ProductImportPreview } from "@/lib/imports/types"
import type { LedgerEntry } from "./count-ledger"
import { OutcomePanel } from "./outcome-panel"

type Props = {
  summary: ProductImportApplySummary
  /** Needed to name *why* rows were left behind, rather than just how many. */
  preview: ProductImportPreview
  /** Rows that came in carrying a Cami-generated SKU (PRD-63 follow-up). */
  placeholderSkuCount: number
  onImportAnother: () => void
}

export function DonePanel({ summary, preview, placeholderSkuCount, onImportAnother }: Props) {
  const leftBehind = summary.rejectedCount

  const entries: LedgerEntry[] = [
    { value: summary.created, label: DONE_LABELS.created },
    { value: summary.updated, label: DONE_LABELS.updated },
    { value: summary.flagged, label: DONE_LABELS.flagged, tone: "text-cami-yellow-11" },
    { value: summary.skipped, label: DONE_LABELS.skipped },
    { value: leftBehind, label: DONE_LABELS.rejected, tone: "text-destructive" },
  ]

  return (
    <OutcomePanel
      title={DONE_COPY.title(summary.created, summary.updated, "product", "products")}
      body={
        leftBehind > 0 || placeholderSkuCount > 0
          ? DONE_COPY.bodyWithLeftovers
          : DONE_COPY.bodyClean("Your catalogue")
      }
      entries={entries}
      leftBehind={leftBehind}
      lookups={productLookupGroups(preview)}
      causes={groupIssues(preview.rows).blocking}
      followUp={
        placeholderSkuCount > 0
          ? {
              title: DONE_COPY.placeholderTitle(placeholderSkuCount),
              body: DONE_COPY.placeholderBody,
              actionLabel: DONE_COPY.reviewPlaceholders,
              href: "/products?filter=placeholder-sku",
            }
          : undefined
      }
      listHref="/products"
      listLabel="products"
      onImportAnother={onImportAnother}
    />
  )
}
