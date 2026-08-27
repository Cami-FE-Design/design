"use client"

// The Review step's ledger entries (DSG-80).
//
// Replaces the as-built screen's six identical KPI cards, where "17 Rejected"
// looked exactly as important as "83 To create" (defect D15). Fixed order, zeros
// dropped: what will be written, then what will not, then what could not. The
// blocked count is last and tinted — it is stated here for completeness, but the
// issue summary below is where it can be acted on.

import { OUTCOME_LABELS } from "@/lib/product-import/copy"
import type { ReviewCounts } from "@/lib/product-import/outcome"
import { CountLedger, type LedgerEntry } from "./count-ledger"

export function OutcomeStrip({ counts }: { counts: ReviewCounts }) {
  const entries: LedgerEntry[] = [
    { value: counts.added, label: OUTCOME_LABELS.added },
    { value: counts.updated, label: OUTCOME_LABELS.updated },
    { value: counts.needsOk, label: OUTCOME_LABELS.needsOk, tone: "text-cami-yellow-11" },
    { value: counts.upToDate, label: OUTCOME_LABELS.upToDate },
    { value: counts.leftOut, label: OUTCOME_LABELS.leftOut },
    { value: counts.willSkip, label: OUTCOME_LABELS.cantImport, tone: "text-destructive" },
  ]

  return <CountLedger entries={entries} />
}
