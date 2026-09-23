"use client"

/**
 * The deals the settings panel reads and writes.
 *
 * The dev repo keeps these in react-query, so a deal created on the Deals tab
 * is still there after a detour to Payments. The panel unmounts on every tab
 * switch, so component state would lose it — this module-level list is the
 * prototype's stand-in for that cache.
 */

import { useSyncExternalStore } from "react"

import { type Deal, type DealStatus, MOCK_DEALS } from "@/lib/deals/mock"

let deals: Deal[] = MOCK_DEALS
const listeners = new Set<() => void>()

function emit(next: Deal[]) {
  deals = next
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDeals(): Deal[] {
  return useSyncExternalStore(
    subscribe,
    () => deals,
    () => MOCK_DEALS,
  )
}

export function saveDeal(deal: Deal) {
  emit(
    deals.some((d) => d.id === deal.id)
      ? deals.map((d) => (d.id === deal.id ? deal : d))
      : [deal, ...deals],
  )
}

export function setDealStatus(id: string, status: DealStatus) {
  emit(deals.map((d) => (d.id === id ? { ...d, status } : d)))
}

/**
 * `dealsService.duplicate` on the dev repo: the copy is named "(copy)", never
 * carries the code (codes stay unique) and starts inactive, so the merchant
 * reviews it before it goes live. It keeps the original's locations.
 */
export function duplicateDeal(id: string) {
  const original = deals.find((d) => d.id === id)
  if (!original) return
  saveDeal({
    ...original,
    id: `deal-${Date.now()}`,
    name: `${original.name} (copy)`,
    discountCode: "",
    status: "inactive",
    redemptions: 0,
    totalSalesMinor: 0,
    totalClients: 0,
    createdAt: new Date().toISOString(),
  })
}

/** Test seam: put the seed back between cases. */
export function resetDeals() {
  emit(MOCK_DEALS)
}
