"use client"

/**
 * The deals the settings panel, the till and the booking page read and write.
 *
 * The dev repo keeps these on the server, so a deal created on the Deals tab
 * is there on the booking page a moment later. Here they live in localStorage,
 * where the rest of the demo keeps its state: Settings and the booking page are
 * separate page loads, and a list held only in memory went back to the seed on
 * the way between them, so a code made in Settings was "not found" online.
 */

import { useSyncExternalStore } from "react"

import { type Deal, type DealStatus, MOCK_DEALS } from "@/lib/deals/mock"
import { readStoredJson, removeStored, writeStoredJson } from "@/lib/storage"

const STORAGE_KEY = "cami.deals.v1"

/** Read lazily, so the server and the first client render both start from the seed. */
let deals: Deal[] | null = null
const listeners = new Set<() => void>()

function current(): Deal[] {
  if (deals === null) {
    const stored = readStoredJson(STORAGE_KEY)
    deals = Array.isArray(stored) ? (stored as Deal[]) : MOCK_DEALS
  }
  return deals
}

function emit(next: Deal[]) {
  deals = next
  writeStoredJson(STORAGE_KEY, next)
  for (const l of listeners) l()
}

/** Another tab saved — the booking page open beside Settings picks it up. */
function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return
  deals = null
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage)
    }
  }
}

export function useDeals(): Deal[] {
  return useSyncExternalStore(subscribe, current, () => MOCK_DEALS)
}

export function saveDeal(deal: Deal) {
  const list = current()
  emit(
    list.some((d) => d.id === deal.id)
      ? list.map((d) => (d.id === deal.id ? deal : d))
      : [deal, ...list],
  )
}

export function setDealStatus(id: string, status: DealStatus) {
  emit(current().map((d) => (d.id === id ? { ...d, status } : d)))
}

/**
 * `dealsService.duplicate` on the dev repo: the copy is named "(copy)", never
 * carries the code (codes stay unique), is not redeemable online until it has
 * one, and otherwise mirrors the original, status included (except that a copy
 * of a deleted deal starts inactive). It keeps the original's locations.
 */
export function duplicateDeal(id: string) {
  const original = current().find((d) => d.id === id)
  if (!original) return
  saveDeal({
    ...original,
    id: `deal-${Date.now()}`,
    name: `${original.name} (copy)`,
    discountCode: "",
    // Online redemption needs a code, and the copy has none.
    bookingRedeemable: false,
    // A copy of a deleted deal is a new deal, not a deleted one.
    status: original.status === "archived" ? "inactive" : original.status,
    redemptions: 0,
    totalSalesMinor: 0,
    totalClients: 0,
    createdAt: new Date().toISOString(),
  })
}

/** Test seam, and the demo's reset: put the seed back and forget saved edits. */
export function resetDeals() {
  deals = MOCK_DEALS
  removeStored(STORAGE_KEY)
  for (const l of listeners) l()
}
