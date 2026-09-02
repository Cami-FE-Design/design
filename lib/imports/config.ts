// Static metadata for the product import wizard — the design-repo counterpart
// of cami-business `src/modules/import-export/config.ts`.
//
// DSG-80 is scoped to products only, but the shape stays entity-keyed so adding
// clients/pets later is a config entry rather than a rewrite. Copy strings are
// reproduced verbatim from production: they are the subject of the review, not
// the place to quietly improve things. See docs/specs/DSG-80-product-import.md §5.

import type { ProductImportMode, ProductMatchedBy, ProductRowStatus } from "./types"

export type ImportModeOption = {
  value: ProductImportMode
  label: string
  hint: string
}

export const PRODUCT_IMPORT_MODES: ImportModeOption[] = [
  {
    value: "UPSERT",
    label: "Update & create",
    hint: "Update matches, create new rows (default).",
  },
  {
    value: "STOCK_SYNC",
    label: "Stock sync only",
    hint: "Only adjust stock for existing products.",
  },
  {
    value: "CREATE_ONLY",
    label: "Create only",
    hint: "Create new products; skip existing matches.",
  },
  {
    value: "UPDATE_ONLY",
    label: "Update only",
    hint: "Update existing matches; skip new rows.",
  },
]

export const PRODUCT_IMPORT_CONFIG = {
  singular: "product",
  plural: "products",
  Plural: "Products",
  routes: {
    list: "/products",
    import: "/products/import",
  },
  importModes: PRODUCT_IMPORT_MODES,
  /** Products are the only entity offering the price-change threshold. */
  showPriceThreshold: true,
  maxFileSizeMb: 10,
  maxRows: 1000,
  templatePaths: {
    csv: "/templates/product-template.csv",
    xlsx: "/templates/product-template.xlsx",
  },
} as const

/** Default for the price-change threshold input, matching the backend default. */
export const DEFAULT_PRICE_THRESHOLD = 30

/** The row statuses products can produce, in the order the filter shows them. */
export const PRODUCT_STATUSES: ProductRowStatus[] = [
  "create",
  "update",
  "flag",
  "noop",
  "skip",
  "reject",
]

export const STATUS_LABELS: Record<ProductRowStatus, string> = {
  create: "Create",
  update: "Update",
  flag: "Needs review",
  noop: "No change",
  skip: "Skipped",
  reject: "Rejected",
}

/** Labels for the "New dictionary entries will be created" panel. */
export const LOOKUP_LABELS: Record<string, string> = {
  brands: "Brands",
  categories: "Categories",
  suppliers: "Suppliers",
}

/** Labels for the per-row flagged-change approval switches. */
export const PRODUCT_OVERRIDE_LABELS: Record<string, string> = {
  name: "Apply name change",
  retailPrice: "Apply retail-price change",
  tax: "Apply tax change",
  barcode: "Apply barcode change",
  sku: "Apply SKU change",
}

/** Field labels for the before → after diff table. Mirrors the product form. */
export const PRODUCT_FIELD_LABELS: Record<string, string> = {
  name: "Product name",
  barcode: "Product barcode",
  sku: "SKU",
  retailPrice: "Retail price",
  supplyPrice: "Supply price",
  tax: "Tax",
  quantity: "Quantity",
  brand: "Brand",
  category: "Category",
  supplier: "Supplier",
}

export const fieldLabel = (key: string): string => PRODUCT_FIELD_LABELS[key] ?? key

/** How the backend matched the row, shown as a small badge beside the name. */
export const MATCHED_BY_LABELS: Record<NonNullable<ProductMatchedBy>, string> = {
  product_id: "by ID",
  sku: "by SKU",
  barcode: "by barcode",
  name: "by name",
}

/**
 * `grid-template-columns` shared by the preview header and every row so the
 * columns stay aligned: # · Status · Product · Match · Issues · Changes.
 */
export const PREVIEW_GRID_TEMPLATE = "2.5rem 5.5rem 1fr 7rem 8rem 8rem"
