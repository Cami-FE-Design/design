// Product bulk-import types — a faithful mirror of the production payload in
// cami-business (`src/types/product-bulk-import.ts`), reduced to the fields the
// UI actually reads. Kept as plain types rather than zod schemas: this repo has
// no backend, so nothing is ever parsed — the mocks in `mock.ts` are the source.
//
// DSG-80 phase 1 replicates the as-built flow, so the names here deliberately
// match production (`flag`, `noop`, `skippedByMode`) even where the wording is
// exactly what the redesign is going to remove. See docs/specs/DSG-80-product-import.md

export type ProductImportMode = "UPSERT" | "STOCK_SYNC" | "CREATE_ONLY" | "UPDATE_ONLY"

/** How a preview row will be treated on confirm. */
export type ProductRowStatus =
  | "create"
  | "update"
  /** Has changes withheld pending per-field operator approval. */
  | "flag"
  /** Matched an existing product, nothing differs. */
  | "noop"
  /** Left out because the chosen import mode excludes it. */
  | "skip"
  /** Cannot be imported at all. */
  | "reject"

/** Which column the backend matched an existing product on. */
export type ProductMatchedBy = "product_id" | "sku" | "barcode" | "name" | null

/** Fields an operator may approve individually on a flagged row. */
export type ProductOverrideField = "name" | "retailPrice" | "tax" | "barcode" | "sku"

/** One field's before → after, as the preview reports it. */
export type FieldChange = {
  from: string | number | null
  to: string | number | null
}

export type FieldChanges = Partial<Record<string, FieldChange>>

export type ProductImportPreviewRow = {
  rowNumber: number
  status: ProductRowStatus
  /** Rejection reasons. Full sentences, owned by the backend, rendered verbatim. */
  errors?: string[]
  /** Non-blocking advisories. Also full backend sentences. */
  warnings?: string[]
  /**
   * Present on a reject caused by an in-file duplicate barcode shared with a
   * different product — marks the row as operator-rescuable.
   */
  duplicateConflictFields?: "barcode"[]
  product: {
    matchedProductId: string | null
    matchedBy: ProductMatchedBy
    name: string | null
    sku: string | null
    barcode: string | null
    /** Applied automatically on confirm — read-only. */
    autoChanges?: FieldChanges
    /** Withheld until the operator approves each field. */
    flaggedChanges?: FieldChanges
  }
}

export type ProductLookupsToCreate = {
  brands: string[]
  categories: string[]
  suppliers: string[]
}

export type TaxUnresolved = {
  row: number
  rate: number
}

export type ProductImportPreview = {
  importMode: ProductImportMode
  priceChangeThresholdPct: number
  rowCount: number
  normalizedCount: number
  rejectedCount: number
  toCreate: number
  toUpdate: number
  toFlag: number
  noChange: number
  skippedByMode: number
  lookupsToCreate: ProductLookupsToCreate
  taxesUnresolved: TaxUnresolved[]
  rows: ProductImportPreviewRow[]
}

/** The apply job's result summary, shown on the Done step. */
export type ProductImportApplySummary = {
  processed: number
  succeeded: number
  failed: number
  created: number
  updated: number
  flagged: number
  skipped: number
  rejectedCount: number
  brandsCreated: number
  categoriesCreated: number
  suppliersCreated: number
}

/** Lifecycle of the analyse job (step 2) and the apply job (step 4). */
export type BulkJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"

/** Per-row override the operator submits with the confirm call. */
export type RowOverride = Partial<Record<ProductOverrideField, boolean>> & {
  /** Import a barcode-duplicate reject without the colliding barcode. */
  importWithoutDuplicate?: boolean
}

export type ConfirmOverrides = Record<number, RowOverride>
