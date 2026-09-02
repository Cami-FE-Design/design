// Operator-facing copy for the redesigned import flow (DSG-80 phase 2).
//
// Kept in one file on purpose: the copy rewrite is the part of this ticket Maaz
// and Michelle need to read and argue with, and a single file is reviewable in a
// way copy scattered across six components is not. The as-built strings live in
// config.ts — diffing the two files is the whole copy change.
//
// Rules followed here: name the thing that happened, not the mechanism
// ("Left out by your import option", never "Skipped by mode"); never use an
// internal noun ("dictionary", "mode", "lookup", "normalized"); and always say
// what the operator gets or loses.

import type { ProductImportPreview, ProductRowStatus } from "./types"

/** Row-status labels. Replaces STATUS_LABELS / STATUS_BADGE in config.ts. */
export const STATUS_COPY: Record<ProductRowStatus, { label: string; filter: string }> = {
  create: { label: "Will be added", filter: "Adding" },
  update: { label: "Will be updated", filter: "Updating" },
  flag: { label: "Needs your OK", filter: "Needs your OK" },
  noop: { label: "Already up to date", filter: "No change needed" },
  skip: { label: "Left out", filter: "Left out" },
  reject: { label: "Can't import", filter: "Can't import" },
}

/**
 * Client and pet row statuses. `review` is the one products have no equivalent
 * of: a name-only match the operator has to resolve.
 */
export const CLIENT_PET_STATUS_COPY: Record<
  string,
  {
    label: string
    filter: string
    variant: "success" | "primary-soft" | "warning" | "muted" | "destructive"
  }
> = {
  create: { label: "Will be added", filter: "Adding", variant: "success" },
  update: { label: "Will be updated", filter: "Updating", variant: "primary-soft" },
  review: { label: "Who is this?", filter: "Needs your answer", variant: "warning" },
  noop: { label: "Already up to date", filter: "No change needed", variant: "muted" },
  skip: { label: "Left out", filter: "Left out", variant: "muted" },
  reject: { label: "Can't import", filter: "Can't import", variant: "destructive" },
}

/** The order the status filter offers them in. */
export const CLIENT_PET_STATUSES = ["create", "update", "review", "noop", "skip", "reject"] as const

/**
 * Per-field approval switches. The as-built labels say "Apply retail-price
 * change", which describes the mechanism; these say what the operator gets.
 */
export const PRODUCT_OVERRIDE_LABELS: Record<string, string> = {
  name: "Use the new name",
  retailPrice: "Use the new retail price",
  tax: "Use the new tax rate",
  barcode: "Use the new barcode",
  sku: "Use the new SKU",
}

/** What the import option does, in the operator's terms. */
export const IMPORT_MODE_COPY: Record<
  ProductImportPreview["importMode"],
  { label: string; hint: string }
> = {
  UPSERT: {
    label: "Add new products and update the ones I already have",
    hint: "The usual choice. Nothing in your catalogue is removed.",
  },
  CREATE_ONLY: {
    label: "Only add products that are new to me",
    hint: "Anything already in your catalogue is left exactly as it is.",
  },
  UPDATE_ONLY: {
    label: "Only update products I already have",
    hint: "New products in the file are ignored.",
  },
  STOCK_SYNC: {
    label: "Only change stock counts",
    hint: "Prices, names and everything else stay as they are.",
  },
}

/** Upload step. */
export const UPLOAD_COPY = {
  title: (plural: string) => `Bring your ${plural} into Cami`,
  subtitle: (plural: string, maxMb: number, maxRows: number) =>
    `Upload a spreadsheet and we'll check it before anything is saved. Up to ${maxRows.toLocaleString("en-US")} ${plural}, ${maxMb} MB.`,
  dropTitle: "Choose a file, or drag it here",
  dropHint: "Excel (.xlsx) or CSV",
  modeLabel: "What should we do with products you already have?",
  thresholdLabel: "Ask me before raising any price by more than",
  thresholdHint: "We'll hold those rows back so you can approve each one.",
  templateLabel: "Don't have a file yet? Start from our template:",
  submit: "Check my file",
  checking: "Checking…",
} as const

/** The two machine phases, as one line each. */
export const PROGRESS_COPY = {
  checkTitle: "Checking your file",
  checkBody: "We're reading every row. Nothing is saved yet.",
  importTitle: "Adding your products",
  importBody: "Almost done — this usually takes a few seconds.",
  failedRetry: "Try another file",
} as const

/** Review step. */
export const REVIEW_COPY = {
  /** Headline when there is something to import. */
  headline: (ready: number, total: number, plural: string) =>
    ready === total
      ? `All ${total} ${plural} are ready to import`
      : `${ready} of ${total} ${plural} are ready to import`,
  reassurance: "Nothing is saved until you choose to import.",
  upToDateTitle: "Everything in this file is already in Cami",
  upToDateBody: (rows: number) =>
    `We checked all ${rows} rows and found nothing to change. You can close this and carry on.`,
  allBlockedTitle: "We couldn't import any of these rows",
  allBlockedBody: "Here's what went wrong. Fix it in your file and upload again.",
  blockingTitle: (rows: number) =>
    rows === 1 ? "1 row can't be imported" : `${rows} rows can't be imported`,
  advisoryTitle: "Worth knowing before you import",
  lookupsTitle: (parts: string) => `We'll also add ${parts}`,
  showRows: "Show these rows",
  showAll: "Show all rows",
  downloadFailed: (rows: number) => `Download the ${rows} rows that failed`,
  showingAll: (rows: number) => `All ${rows} ${rows === 1 ? "row" : "rows"}`,
  /** The default view: only the rows the operator has to do something about. */
  needsYou: (rows: number) => `Needs you (${rows})`,
  showingAttention: (shown: number, total: number) =>
    `${shown} of ${total} rows need you — the rest are ready`,
  showingFiltered: (shown: number, total: number) => `${shown} of ${total} rows`,
  tableHeaders: {
    row: "Row",
    status: "Status",
    product: "Product",
    // Not "What happens" — the Status badge already says that, so this column
    // only carries the extra detail (why a row is blocked, which fields an
    // update touches) and is legitimately blank on a plain new product. Naming
    // it for the detail stops 83 empty cells reading as missing data.
    outcome: "Details",
  },
  emptyFilter: "No rows here.",
  detailsOpen: "Details",
  cancel: "Cancel",
  confirm: (rows: number, singular: string, plural: string) =>
    rows === 1 ? `Import 1 ${singular}` : `Import ${rows.toLocaleString("en-US")} ${plural}`,
  leftOutNote: (rows: number) =>
    rows === 1 ? "1 row will be left behind" : `${rows} rows will be left behind`,
  willApply: "We'll change this for you",
  needsApproval: "Waiting for your OK",
} as const

/** Done step. */
export const DONE_COPY = {
  title: (created: number, updated: number, singular: string, plural: string) => {
    if (created > 0 && updated > 0) return `${created} ${plural} added, ${updated} updated`
    if (created > 0) return created === 1 ? `1 ${singular} added` : `${created} ${plural} added`
    if (updated > 0) return updated === 1 ? `1 ${singular} updated` : `${updated} ${plural} updated`
    return "Import finished"
  },
  // "Your catalogue is up to date" sat directly above "17 rows were left
  // behind", which contradicted it. The clean case keeps that line; the case
  // with leftovers says what is actually true.
  bodyClean: (subject: string) => `${subject} is up to date. Here's what changed.`,
  bodyWithLeftovers: "Here's what changed — and what still needs your attention.",
  placeholderTitle: (rows: number) =>
    rows === 1 ? "1 product needs a real SKU" : `${rows} products need a real SKU`,
  placeholderBody:
    "We gave them a temporary code so nothing was lost. Swap in your own codes when you can.",
  reviewPlaceholders: "Review these products",
  leftBehindTitle: (rows: number) =>
    rows === 1 ? "1 row was left behind" : `${rows} rows were left behind`,
  leftBehindBody: "Download them, fix what's below, and import just those.",
  downloadFailed: "Download the rows that failed",
  /** The lists the import created, past tense — the review step says "We'll also add". */
  lookupsTitle: (parts: string) => `We also added ${parts}`,
  downloadReport: "Download the full report",
  importAnother: "Import another file",
  goToList: (plural: string) => `Go to my ${plural}`,
} as const

/**
 * Ledger labels. The card is always present and always the same shape, so each
 * label has to read correctly whether it is the only entry or one of six.
 */
/** Ledger labels for the Done step, where everything is already past tense. */
export const DONE_LABELS = {
  created: "added",
  updated: "updated",
  flagged: "waiting for your OK",
  skipped: "left as they were",
  rejected: "left behind",
  brands: (n: number) => (n === 1 ? "new brand" : "new brands"),
  categories: (n: number) => (n === 1 ? "new category" : "new categories"),
  suppliers: (n: number) => (n === 1 ? "new supplier" : "new suppliers"),
  /** One label for any list an import creates, from `describeNewLists`. */
  newLists: (n: number) => (n === 1 ? "new list" : "new lists"),
} as const

export const OUTCOME_LABELS = {
  added: "will be added",
  /** Clients and pets only — a name-only match nobody can resolve but the operator. */
  pickPerson: "need you to pick a person",
  updated: "will be updated",
  needsOk: "need your OK",
  upToDate: "already up to date",
  leftOut: "left out",
  cantImport: "can't be imported",
} as const

/** Heading for each group of names in the lookups card. */
export const LOOKUP_GROUP_LABELS = {
  brands: "Brands",
  categories: "Categories",
  suppliers: "Suppliers",
} as const

/** `13 new brands and 14 new categories` — for the lookups panel heading. */
export function describeLookups(lookups: ProductImportPreview["lookupsToCreate"]): string {
  const parts: string[] = []
  const push = (count: number, singular: string, plural: string) => {
    if (count > 0) parts.push(`${count} new ${count === 1 ? singular : plural}`)
  }
  push(lookups.brands.length, "brand", "brands")
  push(lookups.categories.length, "category", "categories")
  push(lookups.suppliers.length, "supplier", "suppliers")

  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
}
