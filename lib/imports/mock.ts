// Mock import previews for the design-repo replication of the product import
// wizard (DSG-80 phase 1). There is no backend here, so these stand in for the
// analyse job's preview JSON and the apply job's result summary.
//
// The default scenario reproduces Aya's migration from the Slack thread
// row-for-row — 100 rows, 83 created, 17 rejected for a missing SKU, the same
// brand and category lists — so the team recognises the screen immediately.
// Every other scenario exists because the as-built UI has states that are
// otherwise unreachable without a server (all-rejected, already-up-to-date,
// rescuable barcode duplicates, header mismatch, a failed job).
//
// Deterministic by construction: no Math.random, no Date.now.

import type {
  ProductImportApplySummary,
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductRowStatus,
} from "./types"

// ─── Backend sentences, reproduced verbatim ───────────────────────────────────
// These are the strings the backend sends and the UI renders unchanged. They are
// the exact copy Maaz called unreadable, so phase 1 must not soften them.

const ERR_SKU_REQUIRED = "SKU is required — every product must have a unique SKU."
const ERR_NAME_REQUIRED = "Product name is required."
const ERR_PRICE_INVALID = "Retail Price could not be read as a number."
const ERR_DUPLICATE_BARCODE =
  "Barcode duplicates another row in this file that refers to a different product."
const WARN_SUPPLY_PRICE_BLANK =
  "Supply Price is blank — margin reports will be unavailable for this product."
const WARN_BARCODE_BLANK =
  "Barcode is blank — barcode scanning at POS will not work for this product."
const WARN_PLACEHOLDER_SKU =
  "SKU was blank — a placeholder SKU was generated. Replace it with your own code."

// ─── Dictionary entries from Aya's file (per the screenshot) ──────────────────

const AYA_BRANDS = [
  "Acana",
  "Applaws",
  "Cosmo",
  "Eurolitter",
  "Farmina",
  "Hills Science Diet",
  "Orijen",
  "Pedigree",
  "Purina Pro Plan",
  "Royal Canin",
  "Sheba",
  "Whiskas",
  "Ziwipeak",
]

const AYA_CATEGORIES = [
  "Accessories",
  "Add On",
  "Beauty",
  "Cat Food",
  "Cat Litter",
  "Day Care",
  "Dog Food",
  "Grooming",
  "Groupon",
  "Package",
  "Pets Bed",
  "Pick Up",
  "Promotion",
  "Wipes",
]

/**
 * The 17 rows that failed in Aya's import, keyed by the row number the preview
 * reported. Every one is a service or package — exactly the pattern behind the
 * leakage: service-like products have no SKU to give. The first seven names and
 * row numbers are the ones legible in the screenshot.
 */
const AYA_REJECTED: { rowNumber: number; name: string }[] = [
  { rowNumber: 5, name: "Grooming Package 6 Sessions" },
  { rowNumber: 7, name: "Day Care Monthly Package" },
  { rowNumber: 8, name: "Sharing Little Loft 6W" },
  { rowNumber: 12, name: "Pick Up Service" },
  { rowNumber: 24, name: "Groupon Deal Grooming Package" },
  { rowNumber: 30, name: "Promo Bath & Blow Big" },
  { rowNumber: 36, name: "Teeth Brushing" },
  { rowNumber: 41, name: "Full Groom Medium Dog" },
  { rowNumber: 47, name: "Nail Clipping Add On" },
  { rowNumber: 53, name: "Ear Cleaning Add On" },
  { rowNumber: 58, name: "Day Care Half Day" },
  { rowNumber: 62, name: "Groupon Deal Bath & Blow" },
  { rowNumber: 69, name: "Promo Full Groom Small Dog" },
  { rowNumber: 74, name: "Drop Off Service" },
  { rowNumber: 81, name: "Grooming Package 12 Sessions" },
  { rowNumber: 88, name: "Boarding Little Loft 2W" },
  { rowNumber: 95, name: "De-shedding Treatment" },
]

/** Retail products from the same file, cycled to fill the 83 rows that passed. */
const PRODUCT_NAMES = [
  "Acana Pacifica Dog 11.4kg",
  "Applaws Chicken Tin 156g",
  "Royal Canin Kitten Dry 2kg",
  "Orijen Six Fish Cat 1.8kg",
  "Whiskas Tuna Pouch 85g",
  "Sheba Fine Flakes Tray 80g",
  "Pedigree Adult Chicken 3kg",
  "Purina Pro Plan Sensitive 3kg",
  "Hills Science Diet Puppy 2kg",
  "Farmina N&D Ocean Cat 1.5kg",
  "Ziwipeak Air-Dried Lamb 454g",
  "Eurolitter Clumping Litter 10L",
  "Cosmo Cat Scratcher Post",
  "Cosmo Memory Foam Pet Bed M",
  "Applaws Cat Grain Free 350g",
  "Royal Canin Maxi Adult 4kg",
  "Acana Wild Prairie Cat 1.8kg",
  "Orijen Original Dog 2kg",
  "Pedigree Dentastix Large 7pk",
  "Whiskas Dry Adult Ocean 1.1kg",
]

const BARCODE_BASE = 6291041500000

/** One passing row: a new product with a SKU, brand and category resolved. */
function createRow(rowNumber: number, index: number): ProductImportPreviewRow {
  const name = PRODUCT_NAMES[index % PRODUCT_NAMES.length]
  const suffix = String(index + 1).padStart(3, "0")
  // Every third row is missing its supply price, and every fourth its barcode —
  // the two warnings that repeat down the whole file in the screenshot.
  const warnings: string[] = []
  if (index % 3 === 0) warnings.push(WARN_SUPPLY_PRICE_BLANK)
  if (index % 4 === 0) warnings.push(WARN_BARCODE_BLANK)

  return {
    rowNumber,
    status: "create",
    warnings: warnings.length ? warnings : undefined,
    product: {
      matchedProductId: null,
      matchedBy: null,
      name,
      sku: `PRD-${suffix}`,
      barcode: index % 4 === 0 ? null : String(BARCODE_BASE + index),
    },
  }
}

/** One of Aya's failed rows: no SKU, so the row never reaches the catalogue. */
function ayaRejectedRow(entry: { rowNumber: number; name: string }): ProductImportPreviewRow {
  return {
    rowNumber: entry.rowNumber,
    status: "reject",
    errors: [ERR_SKU_REQUIRED],
    // Rejected rows in the screenshot carry "1 Error · 2 Warnings".
    warnings: [WARN_SUPPLY_PRICE_BLANK, WARN_BARCODE_BLANK],
    product: {
      matchedProductId: null,
      matchedBy: null,
      name: entry.name,
      sku: null,
      barcode: null,
    },
  }
}

/** Aya's migration, exactly as the thread reported it. */
function buildAyaPreview(): ProductImportPreview {
  const rejectedByRow = new Map(AYA_REJECTED.map((r) => [r.rowNumber, r]))
  const rows: ProductImportPreviewRow[] = []
  let created = 0

  for (let rowNumber = 2; rows.length < 100; rowNumber += 1) {
    const rejected = rejectedByRow.get(rowNumber)
    if (rejected) {
      rows.push(ayaRejectedRow(rejected))
      continue
    }
    rows.push(createRow(rowNumber, created))
    created += 1
  }

  return {
    importMode: "UPSERT",
    priceChangeThresholdPct: 30,
    rowCount: 100,
    normalizedCount: 83,
    rejectedCount: 17,
    toCreate: 83,
    toUpdate: 0,
    toFlag: 0,
    noChange: 0,
    skippedByMode: 0,
    lookupsToCreate: {
      brands: AYA_BRANDS,
      categories: AYA_CATEGORIES,
      suppliers: [],
    },
    taxesUnresolved: [],
    rows,
  }
}

// ─── Scenario 2: a mixed re-import, exercising every status ───────────────────

function buildMixedPreview(): ProductImportPreview {
  const rows: ProductImportPreviewRow[] = []
  let row = 2

  // Plain new products.
  for (let i = 0; i < 6; i += 1) {
    rows.push(createRow(row, i))
    row += 1
  }

  // Matched and updated automatically — stock and supply price moved.
  for (let i = 0; i < 5; i += 1) {
    rows.push({
      rowNumber: row,
      status: "update",
      product: {
        matchedProductId: `prd-${row}`,
        matchedBy: i % 2 === 0 ? "sku" : "barcode",
        name: PRODUCT_NAMES[(i + 3) % PRODUCT_NAMES.length],
        sku: `PRD-${String(200 + i).padStart(3, "0")}`,
        barcode: String(BARCODE_BASE + 500 + i),
        autoChanges: {
          quantity: { from: 4 + i, to: 18 + i },
          supplyPrice: { from: 42 + i, to: 46 + i },
        },
      },
    })
    row += 1
  }

  // Price jumped past the 30% threshold, so the change is withheld.
  for (let i = 0; i < 3; i += 1) {
    rows.push({
      rowNumber: row,
      status: "flag",
      warnings: [WARN_SUPPLY_PRICE_BLANK],
      product: {
        matchedProductId: `prd-${row}`,
        matchedBy: "sku",
        name: PRODUCT_NAMES[(i + 9) % PRODUCT_NAMES.length],
        sku: `PRD-${String(300 + i).padStart(3, "0")}`,
        barcode: String(BARCODE_BASE + 700 + i),
        autoChanges: {
          quantity: { from: 2, to: 12 + i },
        },
        flaggedChanges: {
          retailPrice: { from: 95 + i * 5, to: 189 + i * 10 },
        },
      },
    })
    row += 1
  }

  // Matched, nothing differs.
  for (let i = 0; i < 4; i += 1) {
    rows.push({
      rowNumber: row,
      status: "noop",
      product: {
        matchedProductId: `prd-${row}`,
        matchedBy: "sku",
        name: PRODUCT_NAMES[(i + 14) % PRODUCT_NAMES.length],
        sku: `PRD-${String(400 + i).padStart(3, "0")}`,
        barcode: String(BARCODE_BASE + 900 + i),
      },
    })
    row += 1
  }

  // Excluded by the chosen import mode.
  for (let i = 0; i < 2; i += 1) {
    rows.push({
      rowNumber: row,
      status: "skip",
      product: {
        matchedProductId: null,
        matchedBy: null,
        name: `Boarding Suite ${i === 0 ? "Weekly" : "Monthly"}`,
        sku: `PRD-${String(500 + i).padStart(3, "0")}`,
        barcode: null,
      },
    })
    row += 1
  }

  // Hard failures the operator has to fix in the sheet.
  rows.push({
    rowNumber: row,
    status: "reject",
    errors: [ERR_NAME_REQUIRED],
    product: { matchedProductId: null, matchedBy: null, name: null, sku: "PRD-601", barcode: null },
  })
  row += 1
  rows.push({
    rowNumber: row,
    status: "reject",
    errors: [ERR_PRICE_INVALID],
    warnings: [WARN_BARCODE_BLANK],
    product: {
      matchedProductId: null,
      matchedBy: null,
      name: "Cosmo Ceramic Bowl Large",
      sku: "PRD-602",
      barcode: null,
    },
  })

  return {
    importMode: "CREATE_ONLY",
    priceChangeThresholdPct: 30,
    rowCount: rows.length,
    normalizedCount: 18,
    rejectedCount: 2,
    toCreate: 6,
    toUpdate: 5,
    toFlag: 3,
    noChange: 4,
    skippedByMode: 2,
    lookupsToCreate: {
      brands: ["Cosmo", "Ziwipeak"],
      categories: ["Boarding", "Add On"],
      suppliers: ["Gulf Pet Supplies"],
    },
    taxesUnresolved: [
      { row: 9, rate: 7.5 },
      { row: 14, rate: 12 },
    ],
    rows,
  }
}

// ─── Scenario 3: rescuable barcode duplicates ────────────────────────────────

function buildDuplicatePreview(): ProductImportPreview {
  const rows: ProductImportPreviewRow[] = [createRow(2, 0), createRow(3, 1), createRow(4, 2)]

  for (let i = 0; i < 3; i += 1) {
    rows.push({
      rowNumber: 5 + i,
      status: "reject",
      errors: [ERR_DUPLICATE_BARCODE],
      duplicateConflictFields: ["barcode"],
      product: {
        matchedProductId: null,
        matchedBy: null,
        name: PRODUCT_NAMES[(i + 5) % PRODUCT_NAMES.length],
        sku: `PRD-${String(700 + i).padStart(3, "0")}`,
        // The same barcode on all three — that is the collision.
        barcode: String(BARCODE_BASE + 111),
      },
    })
  }

  return {
    importMode: "UPSERT",
    priceChangeThresholdPct: 30,
    rowCount: rows.length,
    normalizedCount: 3,
    rejectedCount: 3,
    toCreate: 3,
    toUpdate: 0,
    toFlag: 0,
    noChange: 0,
    skippedByMode: 0,
    lookupsToCreate: { brands: [], categories: [], suppliers: [] },
    taxesUnresolved: [],
    rows,
  }
}

// ─── Scenario 4: nothing survived ────────────────────────────────────────────

function buildAllRejectedPreview(): ProductImportPreview {
  const rows = AYA_REJECTED.slice(0, 8).map(ayaRejectedRow)
  return {
    importMode: "UPSERT",
    priceChangeThresholdPct: 30,
    rowCount: rows.length,
    normalizedCount: 0,
    rejectedCount: rows.length,
    toCreate: 0,
    toUpdate: 0,
    toFlag: 0,
    noChange: 0,
    skippedByMode: 0,
    lookupsToCreate: { brands: [], categories: [], suppliers: [] },
    taxesUnresolved: [],
    rows,
  }
}

// ─── Scenario 5: the file matches the catalogue exactly ──────────────────────

function buildUpToDatePreview(): ProductImportPreview {
  const rows: ProductImportPreviewRow[] = PRODUCT_NAMES.slice(0, 9).map((name, i) => ({
    rowNumber: 2 + i,
    status: "noop" as ProductRowStatus,
    product: {
      matchedProductId: `prd-${i}`,
      matchedBy: "sku",
      name,
      sku: `PRD-${String(i + 1).padStart(3, "0")}`,
      barcode: String(BARCODE_BASE + i),
    },
  }))

  return {
    importMode: "UPSERT",
    priceChangeThresholdPct: 30,
    rowCount: rows.length,
    normalizedCount: rows.length,
    rejectedCount: 0,
    toCreate: 0,
    toUpdate: 0,
    toFlag: 0,
    noChange: rows.length,
    skippedByMode: 0,
    lookupsToCreate: { brands: [], categories: [], suppliers: [] },
    taxesUnresolved: [],
    rows,
  }
}

// ─── Scenario 6: Aya's file after PRD-63 ─────────────────────────────────────
// The same 100 rows, but the 17 that used to be rejected now import with a
// generated placeholder SKU. The as-built UI has nowhere to say so — the rows
// simply look clean, which is the gap the redesign has to close.

function buildPlaceholderSkuPreview(): ProductImportPreview {
  const base = buildAyaPreview()
  let placeholder = 0

  const rows = base.rows.map<ProductImportPreviewRow>((row) => {
    if (row.status !== "reject") return row
    placeholder += 1
    return {
      ...row,
      status: "create",
      errors: undefined,
      warnings: [WARN_PLACEHOLDER_SKU, WARN_SUPPLY_PRICE_BLANK, WARN_BARCODE_BLANK],
      product: {
        ...row.product,
        sku: `CAMI-${String(placeholder).padStart(4, "0")}`,
      },
    }
  })

  return {
    ...base,
    normalizedCount: 100,
    rejectedCount: 0,
    toCreate: 100,
    rows,
  }
}

// ─── Apply summaries ─────────────────────────────────────────────────────────

function summaryFor(preview: ProductImportPreview): ProductImportApplySummary {
  const created = preview.toCreate
  const updated = preview.toUpdate
  const flagged = preview.toFlag
  return {
    processed: preview.rowCount,
    succeeded: created + updated + flagged,
    failed: 0,
    created,
    updated,
    flagged,
    skipped: preview.skippedByMode + preview.noChange,
    rejectedCount: preview.rejectedCount,
    brandsCreated: preview.lookupsToCreate.brands.length,
    categoriesCreated: preview.lookupsToCreate.categories.length,
    suppliersCreated: preview.lookupsToCreate.suppliers.length,
  }
}

// ─── Scenario registry ───────────────────────────────────────────────────────

export type ImportScenarioId =
  | "aya-migration"
  | "mixed"
  | "duplicate-barcodes"
  | "all-rejected"
  | "up-to-date"
  | "placeholder-skus"
  | "header-mismatch"
  | "too-many-rows"
  | "analyze-failed"

export type ImportScenario = {
  id: ImportScenarioId
  label: string
  /** One line explaining what this scenario is here to show. */
  note: string
  /** Blocks on the upload step with this message instead of starting a job. */
  uploadError?: string
  /** The analyse job fails with this message instead of returning a preview. */
  jobError?: string
  preview?: ProductImportPreview
}

export const IMPORT_SCENARIOS: ImportScenario[] = [
  {
    id: "aya-migration",
    label: "Aya's migration (the reported case)",
    note: "100 rows · 83 created · 17 rejected for a missing SKU. The screen from the Slack thread, row for row.",
    preview: buildAyaPreview(),
  },
  {
    id: "mixed",
    label: "Mixed re-import",
    note: "Every row status at once — create, update, needs review, no change, skipped by mode, rejected — plus unresolved tax rates.",
    preview: buildMixedPreview(),
  },
  {
    id: "duplicate-barcodes",
    label: "Duplicate barcodes (rescuable)",
    note: "Three rows share a barcode. Each reject offers 'Import without barcode' — the only rejection the operator can undo in place.",
    preview: buildDuplicatePreview(),
  },
  {
    id: "all-rejected",
    label: "Nothing importable",
    note: "Every row failed. The wizard becomes a dead end with no way to fix and retry except re-editing the sheet.",
    preview: buildAllRejectedPreview(),
  },
  {
    id: "up-to-date",
    label: "Already up to date",
    note: "Every row matches the catalogue. Confirm is hidden and the flow ends in a green notice.",
    preview: buildUpToDatePreview(),
  },
  {
    id: "placeholder-skus",
    label: "After PRD-63 (placeholder SKUs)",
    note: "Aya's file once the backend stops rejecting: all 100 import, 17 carrying a generated SKU. Note the UI has no way to flag them for follow-up.",
    preview: buildPlaceholderSkuPreview(),
  },
  {
    id: "header-mismatch",
    label: "Wrong columns",
    note: "Upload-time failure. The backend names the offending column; the operator never reaches the preview.",
    uploadError:
      'Column 4 should be "Retail Price" but found "Price". Download a fresh template and re-upload.',
  },
  {
    id: "too-many-rows",
    label: "Too many rows",
    note: "Upload-time failure against the 1000-row cap, with the count the file actually had.",
    uploadError:
      "That file has too many rows. The limit is 1,000 rows (this file has 4,312). Split it into smaller files and try again.",
  },
  {
    id: "analyze-failed",
    label: "Analyse job fails",
    note: "The job dies mid-analysis. The only offered recovery is uploading a different file.",
    jobError: "We couldn't read that file: unexpected end of archive. Re-export it and try again.",
  },
]

export const DEFAULT_SCENARIO_ID: ImportScenarioId = "aya-migration"

export function getScenario(id: ImportScenarioId): ImportScenario {
  return IMPORT_SCENARIOS.find((s) => s.id === id) ?? IMPORT_SCENARIOS[0]
}

export { summaryFor as applySummaryFor }
