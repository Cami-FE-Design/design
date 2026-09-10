"use client"

// Demo-only business identity. Lets a presenter rebrand the whole prototype to a
// prospect's salon name on the fly (e.g. "Shampooch" → "SOTA Salon"). Every
// client surface that shows the business/location name reads from here, so one
// edit propagates app-wide. Persisted to localStorage so it survives navigation
// and reload mid-demo. Pure presentation — no backend, no auth.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-demo-business-name"
// The business, not one of its branches. Was "Shampooch JVC", which named a
// branch in the place the brand belongs — the same conflation the topbar's
// fabricated second workspace row had. JVC is one of three locations now, and
// branches live in the LocationSwitcher beside this.
const DEFAULT_NAME = "Shampooch"

type DemoBusinessValue = {
  /** Primary business / location name shown across the app. */
  name: string
  setName: (name: string) => void
  /** Back to the default ("Shampooch"). */
  reset: () => void
}

const DemoBusinessContext = createContext<DemoBusinessValue | null>(null)

export function DemoBusinessProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [name, setNameState] = useState(DEFAULT_NAME)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) setNameState(saved)
  }, [])

  const value = useMemo<DemoBusinessValue>(
    () => ({
      name,
      setName: (next) => {
        const trimmed = next.trim() || DEFAULT_NAME
        setNameState(trimmed)
        window.localStorage.setItem(STORAGE_KEY, trimmed)
      },
      reset: () => {
        setNameState(DEFAULT_NAME)
        window.localStorage.removeItem(STORAGE_KEY)
      },
    }),
    [name],
  )

  return <DemoBusinessContext.Provider value={value}>{children}</DemoBusinessContext.Provider>
}

/**
 * Read the demo business name. Returns the default outside a provider so any
 * surface rendered in isolation (tests, playground) still works.
 */
export function useDemoBusiness(): DemoBusinessValue {
  const ctx = useContext(DemoBusinessContext)
  if (ctx) return ctx
  return { name: DEFAULT_NAME, setName: () => {}, reset: () => {} }
}
