"use client"

// The Done step (DSG-80).
//
// The as-built version listed nine counts including the zeros and offered a
// report download; it never told the operator that rows had been left behind in
// a way they could act on, and after PRD-63 it says nothing about the products
// that came in with a SKU Cami invented.
//
// Three things this had wrong on its own account, all found in review:
//  - it was centred while Upload and Review are left-aligned;
//  - its counts card was lookup-only and vanished when a file created no brands
//    or categories, so the page had a different skeleton per import;
//  - it claimed "your catalogue is up to date" directly above "17 rows were
//    left behind".
// It now shares the ledger component with Review, keeps one alignment, and only
// claims to be up to date when it is.

import { ArrowRightIcon, CheckCircle2Icon, DownloadIcon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PRODUCT_IMPORT_CONFIG } from "@/lib/product-import/config"
import { DONE_COPY, DONE_LABELS } from "@/lib/product-import/copy"
import { groupIssues } from "@/lib/product-import/issues"
import type { ProductImportApplySummary, ProductImportPreview } from "@/lib/product-import/types"
import { CountLedger, type LedgerEntry } from "./count-ledger"
import { IssueSummary } from "./issue-summary"

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
  const blockingCauses = groupIssues(preview.rows).blocking

  const entries: LedgerEntry[] = [
    { value: summary.created, label: DONE_LABELS.created },
    { value: summary.updated, label: DONE_LABELS.updated },
    { value: summary.flagged, label: DONE_LABELS.flagged, tone: "text-cami-yellow-11" },
    { value: summary.skipped, label: DONE_LABELS.skipped },
    { value: leftBehind, label: DONE_LABELS.rejected, tone: "text-destructive" },
    { value: summary.brandsCreated, label: DONE_LABELS.brands(summary.brandsCreated) },
    { value: summary.categoriesCreated, label: DONE_LABELS.categories(summary.categoriesCreated) },
    { value: summary.suppliersCreated, label: DONE_LABELS.suppliers(summary.suppliersCreated) },
  ]

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
            <CheckCircle2Icon className="size-5" strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {DONE_COPY.title(summary.created, summary.updated)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {leftBehind > 0 || placeholderSkuCount > 0
                ? DONE_COPY.bodyWithLeftovers
                : DONE_COPY.bodyClean}
            </p>
          </div>
        </div>

        <CountLedger entries={entries} />

        {/* The PRD-63 follow-up. Without this the generated SKUs are silent. */}
        {placeholderSkuCount > 0 && (
          <div className="flex flex-col gap-2 rounded-xl bg-cami-yellow-2 p-4">
            <p className="text-sm font-medium text-foreground">
              {DONE_COPY.placeholderTitle(placeholderSkuCount)}
            </p>
            <p className="text-sm text-muted-foreground">{DONE_COPY.placeholderBody}</p>
            <Button variant="outline" size="sm" radius="full" className="w-fit" asChild>
              <Link href="/products?filter=placeholder-sku">{DONE_COPY.reviewPlaceholders}</Link>
            </Button>
          </div>
        )}

        {/* The same grouped causes the Review step showed, so the operator does not
          have to remember why. Row-filter links are dropped — the table is gone. */}
        {leftBehind > 0 && (
          <div className="flex flex-col gap-3">
            <IssueSummary
              groups={blockingCauses}
              severity="blocking"
              title={DONE_COPY.leftBehindTitle(leftBehind)}
              showRowAction={false}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" radius="full">
                <DownloadIcon />
                {DONE_COPY.downloadFailed}
              </Button>
              <span className="text-sm text-muted-foreground">{DONE_COPY.leftBehindBody}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border/60 pt-4">
        <Button variant="ghost" radius="full">
          <DownloadIcon />
          {DONE_COPY.downloadReport}
        </Button>
        <Button variant="outline" radius="full" onClick={onImportAnother}>
          <RotateCcwIcon />
          {DONE_COPY.importAnother}
        </Button>
        <Button radius="full" size="lg" className="ms-auto" asChild>
          <Link href={PRODUCT_IMPORT_CONFIG.routes.list}>
            {DONE_COPY.goToProducts}
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </div>
  )
}
