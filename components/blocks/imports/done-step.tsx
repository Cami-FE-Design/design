"use client"

// Step 5 — the outcome summary. Faithful port of cami-business `DoneStep`
// (product branch). Note what is missing and what the redesign has to add: the
// rejected rows are a bare count with no way to act on them, and nothing points
// at the products that came in needing attention.

import { ArrowRightIcon, CheckCircle2Icon, DownloadIcon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PRODUCT_IMPORT_CONFIG } from "@/lib/imports/config"
import type { ProductImportApplySummary } from "@/lib/imports/types"

const PRODUCT_LABELS: Record<keyof ProductImportApplySummary, string> = {
  processed: "Rows processed",
  succeeded: "Succeeded",
  failed: "Failed",
  created: "Products created",
  updated: "Products updated",
  flagged: "Flagged",
  skipped: "Skipped",
  rejectedCount: "Rejected",
  brandsCreated: "Brands created",
  categoriesCreated: "Categories created",
  suppliersCreated: "Suppliers created",
}

/** Production renders only the counts the backend actually returned. */
const SHOWN_KEYS: (keyof ProductImportApplySummary)[] = [
  "created",
  "updated",
  "flagged",
  "skipped",
  "rejectedCount",
  "failed",
  "brandsCreated",
  "categoriesCreated",
  "suppliersCreated",
]

type Props = {
  summary: ProductImportApplySummary
  onImportAnother: () => void
}

export function DoneStep({ summary, onImportAnother }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2Icon className="size-7 text-emerald-600" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium">Import complete</h2>
        <p className="text-sm text-muted-foreground">
          Your products import finished. Download the per-row outcome report for the full breakdown.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {SHOWN_KEYS.map((key) => (
          <div
            key={key}
            className="rounded-lg border border-border/60 bg-card px-3 py-2.5 text-start"
          >
            <p className="text-2xl font-semibold tabular-nums">{summary[key]}</p>
            <p className="text-xs text-muted-foreground">{PRODUCT_LABELS[key]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" disabled>
          <DownloadIcon />
          Download outcome report
        </Button>
        <Button variant="outline" onClick={onImportAnother}>
          <RotateCcwIcon />
          Import another file
        </Button>
        <Button asChild>
          <Link href={PRODUCT_IMPORT_CONFIG.routes.list}>
            Go to {PRODUCT_IMPORT_CONFIG.plural}
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </div>
  )
}
