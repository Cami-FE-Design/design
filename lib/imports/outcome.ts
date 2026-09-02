// Turns one preview row into the sentence the redesigned table shows in its
// "What happens" column, and rolls the whole preview up into the counts the
// outcome strip and the confirm button need (DSG-80 phase 2).
//
// This is the fix for spec defect D2: the as-built table shows how *many* issues
// a row has and makes the operator expand it to find out what they are. Here the
// cell says what will happen, in words, and expanding is optional.

import { fieldLabel } from "./config"
import { STATUS_COPY } from "./copy"
import { primaryBlockingIssue, skipReason } from "./issues"
import type {
  ConfirmOverrides,
  FieldChanges,
  ProductImportPreview,
  ProductImportPreviewRow,
} from "./types"

export type OutcomeTone = "good" | "neutral" | "warn" | "bad"

export type RowOutcome = {
  /**
   * The plain-English sentence for the cell — empty when the status badge has
   * already said everything. "Will be added" in the badge *and* in the cell was
   * the same two words twice on 83 consecutive rows.
   */
  text: string
  tone: OutcomeTone
}

/** `quantity and supply price` — the fields a change set touches, as a phrase. */
function describeFields(changes: FieldChanges | undefined): string {
  const keys = Object.keys(changes ?? {})
  if (keys.length === 0) return ""
  const labels = keys.map((k) => fieldLabel(k).toLowerCase())
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`
}

/** True when this row's SKU was invented by Cami rather than supplied. */
function hasGeneratedSku(row: ProductImportPreviewRow): boolean {
  return (row.warnings ?? []).some((w) => w.includes("placeholder SKU was generated"))
}

export function rowOutcome(
  row: ProductImportPreviewRow,
  preview: ProductImportPreview,
  override: { importWithoutDuplicate?: boolean } = {},
): RowOutcome {
  switch (row.status) {
    case "reject": {
      if (override.importWithoutDuplicate) {
        return { text: "Added without its barcode", tone: "warn" }
      }
      const issue = primaryBlockingIssue(row)
      return { text: issue ? issue.rowLabel : STATUS_COPY.reject.label, tone: "bad" }
    }
    case "create":
      // A plain new product needs no sentence — the badge said it. The one
      // thing worth flagging is a SKU the operator did not choose.
      return hasGeneratedSku(row)
        ? { text: "Using a SKU we made up — replace it when you can", tone: "warn" }
        : { text: "", tone: "good" }
    case "update": {
      const fields = describeFields(row.product.autoChanges)
      return { text: fields ? `We'll update ${fields}` : "", tone: "good" }
    }
    case "flag": {
      const fields = describeFields(row.product.flaggedChanges)
      const auto = describeFields(row.product.autoChanges)
      const held = fields ? `Waiting for your OK on ${fields}` : "Waiting for your OK"
      return { text: auto ? `${held} · we'll update ${auto} either way` : held, tone: "warn" }
    }
    case "noop":
      return { text: "", tone: "neutral" }
    case "skip":
      return { text: skipReason(preview), tone: "neutral" }
    default:
      return { text: "", tone: "neutral" }
  }
}

export type ReviewCounts = {
  total: number
  added: number
  updated: number
  needsOk: number
  upToDate: number
  leftOut: number
  blocked: number
  /** Blocked rows the operator chose to import anyway (barcode rescue). */
  rescued: number
  /** Blocked rows that *could* be rescued, whether or not they have been. */
  rescuable: number
  /** Rows that will actually be written on confirm. */
  willImport: number
  /** Rows that will be left behind on confirm. */
  willSkip: number
}

export function reviewCounts(
  preview: ProductImportPreview,
  overrides: ConfirmOverrides = {},
): ReviewCounts {
  const rows = preview.rows
  const count = (status: ProductImportPreviewRow["status"]) =>
    rows.filter((r) => r.status === status).length

  const blocked = count("reject")
  const rescuable = rows.filter(
    (r) => r.status === "reject" && (r.duplicateConflictFields?.length ?? 0) > 0,
  ).length
  const rescued = Object.values(overrides).filter((o) => o.importWithoutDuplicate === true).length

  const added = count("create")
  const updated = count("update")
  const needsOk = count("flag")

  return {
    total: rows.length,
    added,
    updated,
    needsOk,
    upToDate: count("noop"),
    leftOut: count("skip"),
    blocked,
    rescued,
    rescuable,
    // A flagged row still writes its automatic changes, so it counts as importing.
    willImport: added + updated + needsOk + rescued,
    willSkip: blocked - rescued,
  }
}

/** Rows carrying a Cami-generated SKU — the follow-up PRD-63 creates. */
export function placeholderSkuRows(preview: ProductImportPreview): number[] {
  return preview.rows
    .filter((r) => (r.warnings ?? []).some((w) => w.includes("placeholder SKU was generated")))
    .map((r) => r.rowNumber)
}
