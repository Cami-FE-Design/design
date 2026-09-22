/**
 * The catalogue the scope picker chooses from (DW3.4).
 *
 * Built off the POS catalogue the cart already sells from, rather than a second
 * list written for this screen. A promotion that names a service the till has
 * never heard of is the kind of thing nobody notices until a client is standing
 * there, and two lists drift apart the moment one is edited.
 *
 * Combos are left out on purpose, which is the convention the built product
 * draws too: a combo is priced as a whole and discounted as a whole, never as a
 * promotion target of its own.
 */

import { MOCK_PACKAGES } from "@/app/catalogs/packages/page"
import { PRODUCTS, SERVICE_CATEGORIES, SERVICES } from "@/app/sales/new-sale/mock"
import type { ScopeKind } from "@/lib/deals/wizard"

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

function aed(minor: number): string {
  return `AED ${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

function serviceGroups(): ScopePickerGroup[] {
  return SERVICE_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.label,
    items: SERVICES.filter((s) => s.categoryId === cat.id && !s.isCombo).map((s) => ({
      id: s.id,
      name: s.name,
      subtitle: s.durationMin ? `${s.durationMin} min` : undefined,
      priceLabel: aed(s.priceMinor),
    })),
  })).filter((g) => g.items.length > 0)
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
        priceLabel: aed(p.priceMinor),
      })),
    },
  ]
}

function packageGroups(): ScopePickerGroup[] {
  return [
    {
      id: "packages",
      name: "",
      items: MOCK_PACKAGES.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        subtitle: pkg.sessions,
        priceLabel: aed(pkg.price * 100),
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
