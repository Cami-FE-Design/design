"use client"

/**
 * Where a service's per-branch configuration actually lives (R06, SCR-09).
 *
 * ## Why this exists, and what it fixes
 *
 * The Locations section on the service sheet held its offerings in local form
 * state, initialised to `[]`. So turning a service off at two branches, saving,
 * and reopening the service showed all three branches on again: the decision
 * was never written anywhere and the section always started blank. Worse than
 * unpersisted — the screen looked like it worked and silently dropped what the
 * operator had said.
 *
 * The offerings are the catalog's data, not the form's, which is also why the
 * public page can resolve a branch's menu from them
 * (lib/public-offering.ts). One source, read by the operator and the client.
 *
 * ## Sparse, still
 *
 * Only branches that deviate are stored — see lib/service-catalog/offerings.ts
 * for why a full copy per branch breaks DW3.1. Writing an offering that says
 * nothing (enabled, no overrides) removes it instead.
 *
 * Persisted so a demo survives navigation, the same way lib/locations/store.tsx
 * keeps the active scope.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { LOCATION_OFFERINGS, type LocationOffering } from "@/lib/service-catalog/offerings"

const STORAGE_KEY = "cami-location-offerings"

type OfferingsValue = {
  /** Every stored offering, across every service. */
  offerings: LocationOffering[]
  /** The offerings for one service. Empty means every branch inherits. */
  offeringsFor: (serviceId: string) => LocationOffering[]
  /**
   * Replace one service's offerings wholesale. The sheet edits a service at a
   * time, so a per-service replace is the honest granularity — a merge would
   * leave a branch the operator just turned back to inheriting still stored.
   */
  setOfferingsFor: (serviceId: string, next: LocationOffering[]) => void
}

const OfferingsContext = createContext<OfferingsValue | null>(null)

function readStored(): LocationOffering[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LocationOffering[]) : null
  } catch {
    return null
  }
}

export function LocationOfferingsProvider({ children }: { children: React.ReactNode }) {
  // Seeded, then hydrated in an effect so server and first client render agree.
  const [offerings, setOfferings] = useState<LocationOffering[]>(LOCATION_OFFERINGS)

  useEffect(() => {
    const saved = readStored()
    if (saved) setOfferings(saved)
  }, [])

  const setOfferingsFor = useCallback((serviceId: string, next: LocationOffering[]) => {
    setOfferings((prev) => {
      const others = prev.filter((o) => o.serviceId !== serviceId)
      const merged = [...others, ...next]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      return merged
    })
  }, [])

  const value = useMemo<OfferingsValue>(
    () => ({
      offerings,
      offeringsFor: (serviceId) => offerings.filter((o) => o.serviceId === serviceId),
      setOfferingsFor,
    }),
    [offerings, setOfferingsFor],
  )

  return <OfferingsContext.Provider value={value}>{children}</OfferingsContext.Provider>
}

/**
 * Read the per-branch offerings. Works outside a provider so a surface
 * rendered in isolation still resolves the seed rather than nothing.
 */
export function useLocationOfferings(): OfferingsValue {
  const ctx = useContext(OfferingsContext)
  if (ctx) return ctx
  return {
    offerings: LOCATION_OFFERINGS,
    offeringsFor: (serviceId) => LOCATION_OFFERINGS.filter((o) => o.serviceId === serviceId),
    setOfferingsFor: () => {},
  }
}
