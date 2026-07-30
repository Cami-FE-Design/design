"use client"

// Mock signed-in Pet Business user. Backs the "My profile" settings panel and
// the topbar avatar/profile menu, so a profile edit propagates everywhere the
// current user is shown. Persisted to localStorage so it survives navigation
// and reload mid-demo. Pure presentation — no backend, no auth.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-current-user"

export type CurrentUser = {
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phone: string
  country: string
  birthDay: string
  birthMonth: string
  birthYear: string
  jobTitle: string
  calendarColor: string
  avatarSrc?: string
}

export const DEFAULT_CURRENT_USER: CurrentUser = {
  firstName: "Michelle",
  lastName: "You",
  email: "michelle.h.you@gmail.com",
  phoneCode: "+971",
  phone: "50 123 7969",
  country: "United Arab Emirates",
  birthDay: "14",
  birthMonth: "Apr",
  birthYear: "1992",
  jobTitle: "Owner",
  calendarColor: "indigo",
}

type CurrentUserValue = {
  user: CurrentUser
  updateUser: (patch: Partial<CurrentUser>) => void
  reset: () => void
}

const CurrentUserContext = createContext<CurrentUserValue | null>(null)

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [user, setUser] = useState<CurrentUser>(DEFAULT_CURRENT_USER)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      setUser({ ...DEFAULT_CURRENT_USER, ...JSON.parse(saved) })
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<CurrentUserValue>(
    () => ({
      user,
      updateUser: (patch) => {
        setUser((curr) => {
          const next = { ...curr, ...patch }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
      },
      reset: () => {
        setUser(DEFAULT_CURRENT_USER)
        window.localStorage.removeItem(STORAGE_KEY)
      },
    }),
    [user],
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

/**
 * Read the mock current user. Returns the default outside a provider so any
 * surface rendered in isolation (tests, playground) still works.
 */
export function useCurrentUser(): CurrentUserValue {
  const ctx = useContext(CurrentUserContext)
  if (ctx) return ctx
  return { user: DEFAULT_CURRENT_USER, updateUser: () => {}, reset: () => {} }
}

/** "michelle.h.you@gmail.com" → "m************u@gmail.com" (DSG-63 masking). */
export function maskEmail(email: string): string {
  const at = email.indexOf("@")
  if (at <= 0) return email
  const local = email.slice(0, at)
  if (local.length <= 2) return `${local.charAt(0)}*${email.slice(at)}`
  return `${local.charAt(0)}${"*".repeat(local.length - 2)}${local.charAt(local.length - 1)}${email.slice(at)}`
}

/** ("+971", "50 123 7969") → "+971 ******7969" (DSG-63 masking). */
export function maskPhone(phoneCode: string, phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return phoneCode
  const visible = digits.slice(-4)
  const hidden = "*".repeat(Math.max(digits.length - visible.length, 3))
  return `${phoneCode} ${hidden}${visible}`
}
