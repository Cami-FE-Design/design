/**
 * Tax Identity — a business default with a per-field branch override (R23).
 *
 * The decision this file encodes was reversed once, so it is worth stating
 * plainly: per-location tax identity ships in **v0**, not v-next. The
 * blueprint still lists it as open (§07) and an earlier PRD said "shared tax
 * identity in v0"; both were corrected on 17 Aug in the system register's
 * favour, and confirmed again in `#multi-location` — "let's keep this
 * flexible, it will allow us to add unique tax numbers/VAT". Only **payout
 * grouping** flips on UK entry now.
 *
 * ## Why this is not the same as a service override
 *
 * Structurally it is the same nearest-wins shape as
 * lib/service-catalog/offerings.ts, and deliberately so — one resolution rule
 * for every configurable field (INV-13). What differs is the consequence.
 *
 * A service price override changes what the next sale charges. A tax identity
 * override changes what every **future receipt** says, and an issued receipt
 * must never change (INV-12, R23): the resolved legal name, TRN, invoice
 * address and receipt prefix are copied onto the receipt at sale completion and
 * are permanent from that moment. So the UI's job here is not just to show
 * which value is whose, but to say that editing is forward-only.
 *
 * That is also why receipt numbering is per branch rather than per business:
 * each branch draws from its own sequence, and concurrent sales at one branch
 * must draw contiguous numbers with no gap and no duplicate (R25). A gap is a
 * VAT defect, not a display bug.
 */

/** The fields a branch may hold its own value for. */
export type TaxIdentityField =
  | "legalName"
  | "trn"
  | "invoiceAddress"
  | "receiptPrefix"
  | "servicesVatRate"
  | "productsVatRate"

export const TAX_IDENTITY_LABELS: Record<TaxIdentityField, string> = {
  legalName: "Legal / invoice name",
  trn: "Tax registration number",
  invoiceAddress: "Invoice address",
  receiptPrefix: "Receipt No. prefix",
  servicesVatRate: "Services VAT",
  productsVatRate: "Products VAT",
}

export type TaxIdentity = {
  legalName: string
  trn: string
  invoiceAddress: string
  /** Prefixed onto this branch's receipt numbers, e.g. JVC-021857. */
  receiptPrefix: string
  servicesVatRate: string
  productsVatRate: string
}

export type TaxIdentityOverrides = Partial<TaxIdentity>

export type ResolvedTaxIdentity = {
  value: TaxIdentity
  source: Record<TaxIdentityField, "business" | "location">
}

const FIELDS: TaxIdentityField[] = [
  "legalName",
  "trn",
  "invoiceAddress",
  "receiptPrefix",
  "servicesVatRate",
  "productsVatRate",
]

/**
 * The business default. One legal entity trading as one brand, which is the
 * common case — branches differentiate by receipt prefix and nothing else
 * until a branch is genuinely its own registered company.
 */
export const BUSINESS_TAX_IDENTITY: TaxIdentity = {
  legalName: "Shampooch Trading LLC",
  trn: "100123456700003",
  invoiceAddress: "Office 504, Building 7, JLT, Dubai",
  receiptPrefix: "SHP",
  servicesVatRate: "VAT (5%)",
  productsVatRate: "VAT (5%)",
}

/**
 * Per-branch overrides, seeded to the shape the BRD uses as its example:
 * receipts differentiated by prefix while the legal entity stays one.
 *
 * Jumeirah also carries its own TRN, so the panel shows a branch that is
 * genuinely a separate fiscal identity next to one that is not — the two cases
 * the "keep it flexible" decision exists to support.
 */
export const LOCATION_TAX_OVERRIDES: Record<string, TaxIdentityOverrides> = {
  "shampooch-jvc": { receiptPrefix: "JVC" },
  "shampooch-jumeirah": {
    receiptPrefix: "JUM",
    legalName: "Shampooch Jumeirah LLC",
    trn: "100998877600001",
  },
}

/** Nearest wins, per field (INV-13). */
export function resolveTaxIdentity(
  businessDefault: TaxIdentity,
  overrides: TaxIdentityOverrides | undefined,
): ResolvedTaxIdentity {
  const o = overrides ?? {}
  const value = { ...businessDefault, ...stripUndefined(o) }
  const source = Object.fromEntries(
    FIELDS.map((f) => [f, o[f] === undefined ? "business" : "location"]),
  ) as Record<TaxIdentityField, "business" | "location">
  return { value, source }
}

/**
 * `{...defaults, ...overrides}` would let an explicitly-undefined key blank a
 * default, which is the difference between "no opinion" and "empty".
 */
function stripUndefined(o: TaxIdentityOverrides): TaxIdentityOverrides {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined),
  ) as TaxIdentityOverrides
}

/** How many fields this branch holds its own value for. */
export function taxOverrideCount(overrides: TaxIdentityOverrides | undefined): number {
  if (!overrides) return 0
  return FIELDS.filter((f) => overrides[f] !== undefined).length
}

/** The next receipt number as it will actually be printed, prefix included (R23, R25). */
export function formatReceiptNumber(prefix: string, next: number): string {
  return `${prefix}-${String(next).padStart(6, "0")}`
}
