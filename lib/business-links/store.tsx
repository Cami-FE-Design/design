"use client"

// React provider for the merchant's Google review link. PRD-168.
//
// Same shape as lib/demo-business and lib/comms/store: React context +
// localStorage, with an inert default outside a provider so isolated surfaces
// (playground, tests) still render. Pure helpers live in links.ts.
//
// Why only this one link has state, when Business details shows five:
// business-profile-form.tsx says form wiring is "intentionally absent during
// design iteration", and that is still the right call for Facebook, X, Instagram
// and Website — nothing in the product reads them. The Google review link is
// different: whether it is set decides whether a line of the Thank You message
// sends, and two surfaces (the template editor's notice, the preview) have to
// agree about it. A fifth static string could not do that.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-business-links-v1"

/**
 * Unset by default, and deliberately so. Every merchant starts here, which is
 * why the empty state matters more than the field does — see the spec.
 */
const DEFAULT_LINK = ""

type BusinessLinksValue = {
  /** The merchant's Google review link. Empty string → not set. */
  googleReviewLink: string
  setGoogleReviewLink: (link: string) => void
  reset: () => void
}

const BusinessLinksContext = createContext<BusinessLinksValue | null>(null)

export function BusinessLinksProvider({ children }: { children: React.ReactNode }) {
  // Start empty so server and first client render match; hydrate in an effect.
  const [googleReviewLink, setLink] = useState(DEFAULT_LINK)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setLink(saved)
    } catch {
      // Storage unavailable — the session still works, nothing is persisted.
    }
  }, [])

  const value = useMemo<BusinessLinksValue>(
    () => ({
      googleReviewLink,
      setGoogleReviewLink: (next) => {
        const trimmed = next.trim()
        setLink(trimmed)
        try {
          if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed)
          else window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
      reset: () => {
        setLink(DEFAULT_LINK)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }),
    [googleReviewLink],
  )

  return <BusinessLinksContext.Provider value={value}>{children}</BusinessLinksContext.Provider>
}

/**
 * Read the merchant's external links. Returns an inert default outside a
 * provider so any surface rendered in isolation still works — the link reads as
 * unset and writes are no-ops.
 */
export function useBusinessLinks(): BusinessLinksValue {
  const ctx = useContext(BusinessLinksContext)
  if (ctx) return ctx
  return { googleReviewLink: DEFAULT_LINK, setGoogleReviewLink: () => {}, reset: () => {} }
}
