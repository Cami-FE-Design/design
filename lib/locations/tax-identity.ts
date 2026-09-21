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
 *
 * Shampooch's, and only Shampooch's. This was the default for every branch of
 * every business, so Purr Palace's own Invoicing tab read "Shampooch Trading
 * LLC" under its own TRN — another company's legal identity on the one screen
 * that exists to state a legal identity, and on their receipts with it.
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
 * Each seeded business's own default, by the slug its branches carry.
 *
 * A tax identity belongs to the business, not to the estate — which is why it
 * cannot be one constant. The per-branch overrides below still sit on top of
 * whichever of these applies (R23).
 */
const BUSINESS_TAX_IDENTITIES: Record<string, TaxIdentity> = {
  shampooch: BUSINESS_TAX_IDENTITY,
  "purr-palace": {
    legalName: "Purr Palace Pet Care L.L.C.",
    trn: "100774411900002",
    invoiceAddress: "Warehouse 9, Al Quoz Industrial 2, Dubai",
    receiptPrefix: "PPL",
    servicesVatRate: "VAT (5%)",
    productsVatRate: "VAT (5%)",
  },
  sota: {
    legalName: "Sota Hair Studio L.L.C.",
    trn: "100553388700001",
    invoiceAddress: "Marina Promenade, Dubai Marina, Dubai",
    receiptPrefix: "SOTA",
    servicesVatRate: "VAT (5%)",
    productsVatRate: "VAT (5%)",
  },
}

/**
 * The business default behind a branch.
 *
 * Resolved from the branch rather than from whoever is signed in, so it is the
 * same answer on a receipt printed months ago and on the settings tab today —
 * and so the pure invoice path can reach it without a React context.
 */
export function businessTaxIdentityFor(locationId: string): TaxIdentity {
  for (const [slug, identity] of Object.entries(BUSINESS_TAX_IDENTITIES)) {
    if (slug !== "shampooch" && (locationId === slug || locationId.startsWith(`${slug}-`))) {
      return identity
    }
  }
  return BUSINESS_TAX_IDENTITY
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
  /**
   * The rest of the estate carries a prefix too.
   *
   * Only JVC and Jumeirah had one, so the other seven branches fell through to
   * the business default and issued receipts under a single "SHP" — which is
   * the one thing a per-branch prefix exists to prevent. R23's example is
   * "receipts differentiated by prefix while the legal entity stays one", and
   * seven branches sharing a prefix differentiates nothing: an accountant
   * holding two receipts cannot tell which branch either came from.
   *
   * Prefix only. The legal entity and the TRN stay inherited, because they
   * genuinely are one — Jumeirah remains the single branch that is its own
   * fiscal identity, which is the contrast the panel is there to show.
   */
  "shampooch-al-quoz": { receiptPrefix: "QUZ" },
  "shampooch-downtown-dubai": { receiptPrefix: "DTD" },
  "shampooch-dubai-marina": { receiptPrefix: "MAR" },
  "shampooch-mirdif": { receiptPrefix: "MIR" },
  "shampooch-al-reem": { receiptPrefix: "REM" },
  "shampooch-al-majaz": { receiptPrefix: "MAJ" },
  "shampooch-yas-island": { receiptPrefix: "YAS" },
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

/**
 * Set or clear one branch's override, returning the new map for the whole
 * estate (INV-13, G5).
 *
 * Pure, and separate from the store, because the two rules here are the ones
 * worth testing and are easy to get wrong in a reducer:
 *
 * - **Clearing deletes the key.** Writing today's business value in its place
 *   leaves the field looking inherited while no longer following a later change
 *   to the default. That is the one thing "inherited" promises.
 * - **A branch with nothing left holds no row.** Otherwise every branch
 *   accumulates an empty object, and "9 branches inherit everything" stops
 *   being a fact about the data.
 */
export function applyTaxOverride(
  all: Record<string, TaxIdentityOverrides>,
  locationId: string,
  field: TaxIdentityField,
  value: string | undefined,
): Record<string, TaxIdentityOverrides> {
  const branch = { ...(all[locationId] ?? {}) }
  if (value === undefined) delete branch[field]
  else branch[field] = value

  const next = { ...all }
  if (Object.keys(branch).length === 0) delete next[locationId]
  else next[locationId] = branch
  return next
}
