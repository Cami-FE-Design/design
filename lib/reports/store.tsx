"use client"

// Session-scoped state for the Reporting module: favourited reports + the
// data-freshness label. Mock-only (no persistence, no API), mirroring the
// other local providers in this repo.

import { createContext, useContext, useMemo, useState } from "react"

type ReportsContextValue = {
  favourites: string[]
  isFavourite: (id: string) => boolean
  toggleFavourite: (id: string) => void
  /** "Data from X mins ago" freshness stamp shown on every report (PRO-703 §4). */
  freshnessLabel: string
  /**
   * Active index tab, held here (not local page state) so navigating into a
   * report and hitting Back returns to the same tab — the layout keeps this
   * provider mounted across index ↔ detail navigation.
   */
  activeTab: string
  setActiveTab: (tab: string) => void
}

const ReportsContext = createContext<ReportsContextValue | null>(null)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  const value = useMemo<ReportsContextValue>(
    () => ({
      favourites,
      isFavourite: (id) => favourites.includes(id),
      toggleFavourite: (id) =>
        setFavourites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
      // Fixed for the mock so SSR/CSR agree — real data would compute this.
      freshnessLabel: "Data from 3 mins ago",
      activeTab,
      setActiveTab,
    }),
    [favourites, activeTab],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

export function useReports(): ReportsContextValue {
  const ctx = useContext(ReportsContext)
  if (!ctx) {
    throw new Error("Reporting hooks must be used within <ReportsProvider>")
  }
  return ctx
}
