/**
 * Tipping, per branch, with a business default (R06's inheritance shape applied
 * to a settings block rather than to a service).
 *
 * ## Why this is a block override and the tax identity is per field
 *
 * `tax-identity.ts` resolves field by field, because a branch genuinely differs
 * on one field at a time — its receipt prefix while sharing a legal entity. Tip
 * settings are not like that. An operator does not want this branch's tip
 * percentages with the business's cart rules; they want "this branch tips
 * differently", and then they configure it. The dialog already said so before
 * anything was wired: its first control is "Workspace defaults" or "Custom for
 * this location".
 *
 * So the stored shape is a mode plus, when custom, one whole set of settings.
 * Field-level inheritance here would produce states nobody asked for and a
 * screen that has to explain six independent markers.
 */

export type TipCartItem = "services" | "addons" | "products" | "memberships" | "gift-cards"

export const TIP_CART_ITEMS: ReadonlyArray<{ id: TipCartItem; label: string }> = [
  { id: "services", label: "Services" },
  { id: "addons", label: "Service add-ons" },
  { id: "products", label: "Products" },
  { id: "memberships", label: "Memberships" },
  { id: "gift-cards", label: "Gift cards" },
]

export type TippingSettings = {
  /** Percentages offered at checkout, in the order a client sees them. */
  values: ReadonlyArray<number>
  atPointOfSale: boolean
  onTerminals: boolean
  online: boolean
  /** Which cart lines form the base a tip is calculated on. */
  cartItems: ReadonlyArray<TipCartItem>
  serviceCharges: "included" | "excluded"
  discounts: "included" | "excluded"
}

/**
 * `"workspace"` is not "no settings" — it is a live reference. Change the
 * business default and every branch on `"workspace"` follows, which is the whole
 * of G5 ("inherited means live") said about this block.
 */
export type TippingMode = "workspace" | "custom"

export type BranchTipping = { mode: "workspace" } | { mode: "custom"; settings: TippingSettings }

export const BUSINESS_TIPPING: TippingSettings = {
  values: [10, 18, 25, 35, 45],
  atPointOfSale: true,
  onTerminals: true,
  online: true,
  cartItems: ["services", "addons", "products", "memberships", "gift-cards"],
  serviceCharges: "included",
  discounts: "included",
}

/**
 * Seeded so the panel shows both states side by side. Al Quoz is boarding and
 * daycare — a stay is not a service a groomer is tipped for at a counter, so it
 * takes card tips only and on a shorter scale. One branch differing is what
 * makes "Workspace defaults" on the other two mean something.
 */
export const BRANCH_TIPPING: Record<string, BranchTipping> = {
  "shampooch-al-quoz": {
    mode: "custom",
    settings: {
      ...BUSINESS_TIPPING,
      values: [5, 10, 15],
      atPointOfSale: false,
      online: false,
      cartItems: ["services"],
    },
  },
}

export function resolveTipping(branch: BranchTipping | undefined): {
  mode: TippingMode
  settings: TippingSettings
} {
  if (branch?.mode === "custom") return { mode: "custom", settings: branch.settings }
  return { mode: "workspace", settings: BUSINESS_TIPPING }
}

/** `10% · 18% · 25%` — the summary line, in the order a client sees them. */
export function formatTipValues(values: ReadonlyArray<number>): string {
  return values.map((value) => `${value}%`).join(" · ")
}

/**
 * What the tip base includes, as a sentence rather than a count. "3 of 5 item
 * types" tells an operator nothing about whether products are in it.
 */
export function describeTipBase(settings: TippingSettings): string {
  if (settings.cartItems.length === TIP_CART_ITEMS.length) return "All items included"
  if (settings.cartItems.length === 0) return "Nothing included"
  const included = TIP_CART_ITEMS.filter((item) => settings.cartItems.includes(item.id))
  return `${included.map((item) => item.label).join(", ")} only`
}

/** Which channels offer a tip, so the summary does not just say "enabled". */
export function describeTipChannels(settings: TippingSettings): string {
  const on = [
    settings.atPointOfSale && "Point of Sale",
    settings.onTerminals && "terminals",
    settings.online && "online",
  ].filter(Boolean) as string[]
  if (on.length === 3) return "All options enabled"
  if (on.length === 0) return "Tipping off everywhere"
  return `${on.join(", ")} only`
}
