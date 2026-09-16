"use client"

// The theme a merchant has actually chosen, per venue.
//
// Without this, the Branding panel had a Save that did nothing: the selection
// lived in local state and the theme itself came from a hardcoded map, so a
// merchant could pick Cool sage, save, open their card and still see gold. A
// prototype that contradicts itself one click later is worse than one with no
// Save at all.
//
// Same shape as lib/demo-business: provider, localStorage, default on the
// server so the first client render matches and hydration stays quiet. Pure
// presentation — no backend.
//
// Keyed by slug because a theme belongs to a venue, and the demo has several.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import {
  type CustomerCardTheme,
  DEFAULT_THEME_BY_SLUG,
  getCustomerCardTheme,
  venueForBusinessName,
} from "@/lib/customer-card/theme"

const STORAGE_KEY = "cami-customer-card-themes"

type ThemeMap = Readonly<Record<string, string>>

type CardThemeValue = {
  /** The venue's chosen theme id, or the seeded default when it has none. */
  themeFor: (slug: string) => string | undefined
  setTheme: (slug: string, themeId: string) => void
  reset: () => void
}

const CardThemeContext = createContext<CardThemeValue | null>(null)

export function CustomerCardThemeProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<ThemeMap>({})

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") setSaved(parsed as ThemeMap)
    } catch {
      // A corrupt value is not worth a crash on a demo surface; the seeded
      // defaults are a perfectly good place to land.
    }
  }, [])

  const setTheme = useCallback((slug: string, themeId: string) => {
    setSaved((current) => {
      const next = { ...current, [slug]: themeId }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSaved({})
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo<CardThemeValue>(
    () => ({
      themeFor: (slug) => saved[slug] ?? DEFAULT_THEME_BY_SLUG[slug],
      setTheme,
      reset,
    }),
    [saved, setTheme, reset],
  )

  return <CardThemeContext.Provider value={value}>{children}</CardThemeContext.Provider>
}

/**
 * Read the chosen theme. Falls back to the seeded defaults outside a provider,
 * so a surface rendered in isolation (playground, tests) still gets a venue's
 * intended palette rather than nothing.
 */
export function useCustomerCardTheme(): CardThemeValue {
  const ctx = useContext(CardThemeContext)
  if (ctx) return ctx
  return {
    themeFor: (slug) => DEFAULT_THEME_BY_SLUG[slug],
    setTheme: () => {},
    reset: () => {},
  }
}

/**
 * The theme a surface should actually render, resolved once.
 *
 * Both the card and the preview pill need this answer, and when they worked it
 * out separately they disagreed the moment a merchant saved: the card came back
 * in the new palette while the pill still named the old one, because one read
 * the store and the other had been handed a value computed on the server. One
 * function, two callers, nothing to drift.
 *
 * `?theme=` wins over the saved choice so a reviewer can walk all five without
 * touching what the merchant set.
 */
export function useResolvedCardTheme(slug: string, override?: string | null): CustomerCardTheme {
  const { themeFor } = useCustomerCardTheme()
  return getCustomerCardTheme(slug, override ?? themeFor(slug))
}

/**
 * Branding for a surface that knows a business name and nothing else — the
 * message previews.
 *
 * Goes through the store, not the seeded map. A plain function only ever saw
 * the default, so saving a new palette changed the card and left the message on
 * the old one — which breaks the single promise this panel makes: one palette,
 * everywhere a client sees you.
 */
export function useVenueBranding(businessName: string): {
  logoUrl?: string
  theme: CustomerCardTheme
} {
  const venue = venueForBusinessName(businessName)
  const theme = useResolvedCardTheme(venue?.slug ?? "")
  return { logoUrl: venue?.logoUrl, theme }
}
