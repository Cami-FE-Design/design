/**
 * The catalogue the scope picker chooses from (DW3.4).
 *
 * Services come from the business's service menu, the one the booking page,
 * appointments and packages book from, so a promotion narrowed to "Full groom"
 * names the same `full-groom` a client books online (DZ-352). It used to read
 * the till's demo catalogue, a nail salon's, whose ids no booking line could
 * match, so every code narrowed in the wizard was refused online. The till
 * offers a `selected` deal without matching ids (`appliesToLine`), so it is
 * unaffected. Packages come from the same menu's Packages category, for the
 * same reason.
 *
 * Combos are left out on purpose, which is the convention the built product
 * draws too: a combo is priced as a whole and discounted as a whole, never as a
 * promotion target of its own.
 */

import { SERVICE_CATEGORIES } from "@/lib/booking"
import type { ScopeKind } from "@/lib/deals/wizard"
import { formatAed, formatDuration } from "@/lib/format"
import { formatMoney } from "@/lib/money/format"
import { PRODUCTS } from "@/lib/sales/new-sale-mock"

export type ScopePickerItem = {
  id: string
  name: string
  subtitle?: string
  priceLabel?: string
}

export type ScopePickerGroup = {
  id: string
  /** Empty for a flat list — the picker then draws no group header. */
  name: string
  items: ScopePickerItem[]
}

function serviceGroups(): ScopePickerGroup[] {
  // Packages are their own picker; the menu's "Packages" category is not services.
  return SERVICE_CATEGORIES.filter((cat) => cat.id !== "packages")
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: cat.services
        .filter((s) => !s.isCombo)
        .map((s) => ({
          id: s.id,
          name: s.name,
          subtitle: formatDuration(s.durationMinutes),
          priceLabel: formatAed(s.priceAed),
        })),
    }))
    .filter((g) => g.items.length > 0)
}

function productGroups(): ScopePickerGroup[] {
  return [
    {
      id: "products",
      name: "",
      items: PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.size,
        priceLabel: formatMoney(p.priceMinor),
      })),
    },
  ]
}

/** The packages the booking page sells, so a package narrowed here is the one booked online. */
function packageGroups(): ScopePickerGroup[] {
  const menu = SERVICE_CATEGORIES.find((cat) => cat.id === "packages")
  return [
    {
      id: "packages",
      name: "",
      items: (menu?.services ?? []).map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        subtitle: pkg.description,
        priceLabel: formatAed(pkg.priceAed),
      })),
    },
  ]
}

export type ScopePickerConfig = {
  title: string
  searchPlaceholder: string
  allLabel: string
  singular: string
  plural: string
  groups: ScopePickerGroup[]
}

export function scopePickerConfig(kind: ScopeKind): ScopePickerConfig {
  if (kind === "services") {
    return {
      title: "Select services",
      searchPlaceholder: "Search by service name",
      allLabel: "Select all",
      singular: "service",
      plural: "services",
      groups: serviceGroups(),
    }
  }
  if (kind === "products") {
    return {
      title: "Select products",
      searchPlaceholder: "Search by product name",
      allLabel: "All products",
      singular: "product",
      plural: "products",
      groups: productGroups(),
    }
  }
  return {
    title: "Select packages",
    searchPlaceholder: "Search by package name",
    allLabel: "All packages",
    singular: "package",
    plural: "packages",
    groups: packageGroups(),
  }
}

/** Every id in a kind's catalogue — what "all" resolves to when one is ticked. */
export function allIdsFor(kind: ScopeKind): string[] {
  return scopePickerConfig(kind).groups.flatMap((g) => g.items.map((i) => i.id))
}

/**
 * The names behind a chosen id set, for a summary line.
 *
 * Ids are what gets stored and names are what gets read; a detail view printing
 * "3 services" and nothing else makes a merchant reopen the wizard to find out
 * which three.
 */
export function namesFor(kind: ScopeKind, ids: ReadonlyArray<string>): string[] {
  const byId = new Map<string, string>()
  for (const g of scopePickerConfig(kind).groups) {
    for (const i of g.items) byId.set(i.id, i.name)
  }
  return ids.map((id) => byId.get(id)).filter((n): n is string => Boolean(n))
}
