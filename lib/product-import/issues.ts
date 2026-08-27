// Issue vocabulary + grouping for the redesigned import review (DSG-80 phase 2).
//
// Two jobs:
//
// 1. **The copy shim.** Row-level rejection sentences arrive from the backend as
//    finished prose and are rendered verbatim in production, which means the
//    frontend cannot make them non-technical (spec §2.4, Q1). Until the backend
//    returns stable per-row codes, this file matches the known sentences and
//    substitutes operator copy. Anything unmatched falls through with the
//    backend's own sentence intact — a gap must look like a gap, never get
//    swallowed. `unmappedSentences()` exists so the playground can show which
//    strings are still unowned.
//
// 2. **Grouping.** The whole complaint in the thread is that 17 rows shared one
//    cause and the UI made you open all 17 to find out. Rows are collapsed by
//    cause here so the review screen can state it once.

import type { ProductImportPreview, ProductImportPreviewRow } from "./types"

export type IssueSeverity = "blocking" | "advisory"

export type IssueDefinition = {
  code: string
  severity: IssueSeverity
  /**
   * How much this costs the operator, high to low. Advisories are ranked by it
   * rather than by row count: a code Cami invented matters more than a blank
   * supply price even when it touches a third as many rows.
   */
  weight: number
  /** Summary-line heading. Plain English, states the rule not the field name. */
  title: string
  /** Short form for a table cell or chip. */
  rowLabel: string
  /** One sentence on what it means for the operator. */
  detail: string
  /** What to do about it, when there is something to do. */
  fix?: string
}

const DEFINITIONS: IssueDefinition[] = [
  {
    code: "SKU_REQUIRED",
    severity: "blocking",
    weight: 10,
    title: "These products have no SKU",
    rowLabel: "No SKU",
    detail:
      "A SKU is the product's own code. Cami needs one to tell your products apart and to match them the next time you import.",
    fix: "Add a code in the SKU column for these rows, then upload the file again.",
  },
  {
    code: "NAME_REQUIRED",
    severity: "blocking",
    weight: 10,
    title: "These rows have no product name",
    rowLabel: "No name",
    detail: "A product cannot be saved without a name.",
    fix: "Fill in the Product Name column for these rows.",
  },
  {
    code: "PRICE_NOT_A_NUMBER",
    severity: "blocking",
    weight: 10,
    title: "The retail price could not be read",
    rowLabel: "Price unreadable",
    detail:
      "Something in the Retail Price column isn't a plain number — usually a currency symbol, a space, or a comma.",
    fix: "Write prices as plain numbers, like 149 or 149.50.",
  },
  {
    code: "DUPLICATE_BARCODE",
    severity: "blocking",
    weight: 10,
    title: "Two rows share the same barcode",
    rowLabel: "Barcode used twice",
    detail:
      "A barcode can only belong to one product. These rows use a barcode that another row in the same file already claimed.",
    fix: "Give each product its own barcode, or import these without one using the switch on the row.",
  },
  {
    code: "SUPPLY_PRICE_BLANK",
    severity: "advisory",
    weight: 2,
    title: "Supply price is blank",
    rowLabel: "No supply price",
    detail:
      "They import fine, but margin and profit reports stay empty until you add what you paid.",
  },
  {
    code: "BARCODE_BLANK",
    severity: "advisory",
    weight: 1,
    title: "Barcode is blank",
    rowLabel: "No barcode",
    detail: "They import fine, but you won't be able to scan them at the till.",
    fix: "You can add barcodes later from the product page.",
  },
  {
    code: "PLACEHOLDER_SKU",
    severity: "advisory",
    weight: 5,
    title: "We created a SKU for these products",
    rowLabel: "SKU we made up",
    detail:
      "They arrived with no SKU, so Cami made a code up. Replace it with your own when you can.",
  },
]

const BY_CODE = new Map(DEFINITIONS.map((d) => [d.code, d]))

/**
 * Substring matchers against the backend's sentences. Ordered — first hit wins.
 * Deliberately loose (matching the distinctive middle of each sentence) so small
 * backend wording edits don't silently drop a mapping.
 */
const MATCHERS: { code: string; match: string }[] = [
  { code: "SKU_REQUIRED", match: "SKU is required" },
  { code: "PLACEHOLDER_SKU", match: "placeholder SKU was generated" },
  { code: "NAME_REQUIRED", match: "Product name is required" },
  { code: "PRICE_NOT_A_NUMBER", match: "could not be read as a number" },
  { code: "DUPLICATE_BARCODE", match: "Barcode duplicates another row" },
  { code: "SUPPLY_PRICE_BLANK", match: "Supply Price is blank" },
  { code: "BARCODE_BLANK", match: "Barcode is blank" },
]

/**
 * Resolve one backend sentence to a definition. Unmatched sentences become a
 * synthetic definition carrying the backend's own words — visibly untranslated
 * rather than hidden.
 */
export function classify(sentence: string, severity: IssueSeverity): IssueDefinition {
  const hit = MATCHERS.find((m) => sentence.includes(m.match))
  const known = hit ? BY_CODE.get(hit.code) : undefined
  if (known) return known
  return {
    code: `UNMAPPED:${sentence}`,
    severity,
    // An unknown sentence is ranked top of its group: it is the one we cannot
    // reason about, so it should not sink out of sight.
    weight: 99,
    title: sentence,
    rowLabel: severity === "blocking" ? "Can't import" : "Heads up",
    detail: sentence,
  }
}

export type IssueGroup = {
  definition: IssueDefinition
  /** Every row this cause applies to, in file order. */
  rowNumbers: number[]
}

export type GroupedIssues = {
  /** Causes that stop a row importing, worst first by row count. */
  blocking: IssueGroup[]
  /** Causes that let a row through but cost the operator something later. */
  advisory: IssueGroup[]
}

/** Collapse every row's errors and warnings into one group per cause. */
export function groupIssues(rows: ProductImportPreviewRow[]): GroupedIssues {
  const groups = new Map<string, IssueGroup>()

  const add = (sentence: string, severity: IssueSeverity, rowNumber: number) => {
    const definition = classify(sentence, severity)
    const existing = groups.get(definition.code)
    if (existing) {
      if (!existing.rowNumbers.includes(rowNumber)) existing.rowNumbers.push(rowNumber)
      return
    }
    groups.set(definition.code, { definition, rowNumbers: [rowNumber] })
  }

  for (const row of rows) {
    for (const e of row.errors ?? []) add(e, "blocking", row.rowNumber)
    for (const w of row.warnings ?? []) add(w, "advisory", row.rowNumber)
  }

  const all = [...groups.values()]
  // Blocking causes are all equally fatal, so row count is the useful order.
  // Advisories are ordered by what they cost, then by reach.
  const byReach = (a: IssueGroup, b: IssueGroup) => b.rowNumbers.length - a.rowNumbers.length
  const byWeight = (a: IssueGroup, b: IssueGroup) =>
    b.definition.weight - a.definition.weight || byReach(a, b)
  return {
    blocking: all.filter((g) => g.definition.severity === "blocking").sort(byReach),
    advisory: all.filter((g) => g.definition.severity === "advisory").sort(byWeight),
  }
}

/** Backend sentences this file does not yet own, for the playground to surface. */
export function unmappedSentences(rows: ProductImportPreviewRow[]): string[] {
  const out = new Set<string>()
  for (const row of rows) {
    for (const s of [...(row.errors ?? []), ...(row.warnings ?? [])]) {
      if (!MATCHERS.some((m) => s.includes(m.match))) out.add(s)
    }
  }
  return [...out]
}

/** The blocking cause to name in a rejected row's cell. */
export function primaryBlockingIssue(row: ProductImportPreviewRow): IssueDefinition | null {
  const first = (row.errors ?? [])[0]
  return first ? classify(first, "blocking") : null
}

/** `rows 5, 7, 8, 12, 24 and 12 more` — enough to locate them without a wall. */
export function describeRows(rowNumbers: number[], limit = 5): string {
  const shown = rowNumbers.slice(0, limit)
  const rest = rowNumbers.length - shown.length
  const list = shown.join(", ")
  const label = rowNumbers.length === 1 ? "row" : "rows"
  return rest > 0 ? `${label} ${list} and ${rest} more` : `${label} ${list}`
}

/**
 * Unresolved tax rates arrive on the preview as their own list rather than as
 * row warnings, and they used to get their own tinted panel — a third notice
 * block competing with the two grouped ones. Modelled as an advisory group, it
 * lands inside the single "worth knowing" block with everything else.
 */
export function taxAdvisoryGroup(preview: ProductImportPreview): IssueGroup | null {
  if (preview.taxesUnresolved.length === 0) return null
  const rates = [...new Set(preview.taxesUnresolved.map((t) => `${t.rate}%`))].join(", ")
  return {
    definition: {
      code: "TAX_UNRESOLVED",
      severity: "advisory",
      weight: 3,
      title: "We didn't recognise a tax rate",
      rowLabel: "Tax not recognised",
      detail: `Your file asks for ${rates}, which doesn't match any tax you have set up. Tax is left as it is on these products.`,
    },
    rowNumbers: preview.taxesUnresolved.map((t) => t.row),
  }
}

/**
 * Why a row was left out, in terms of the option the operator actually chose —
 * the replacement for "Skipped by mode".
 */
export function skipReason(preview: ProductImportPreview): string {
  switch (preview.importMode) {
    case "CREATE_ONLY":
      return "You chose to add new products only, and this one already exists."
    case "UPDATE_ONLY":
      return "You chose to update existing products only, and this one is new."
    case "STOCK_SYNC":
      return "You chose to update stock only, and this product isn't in your catalogue yet."
    default:
      return "Your import option left this row out."
  }
}
