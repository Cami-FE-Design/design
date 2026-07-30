"use client"

// Mock signed-in Pet Business user. Backs the "My profile" settings panel and
// the topbar avatar/profile menu, so a profile edit propagates everywhere the
// current user is shown. Persisted to localStorage so it survives navigation
// and reload mid-demo. Pure presentation — no backend, no auth.
//
// Contact changes follow DSG-63: name saves directly, but a new mobile number
// must be confirmed by OTP and a new email by a confirmation link. Until
// confirmed they live in `pending` (cancellable), and values already used by
// another team member are rejected up front.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { TEAM_MEMBERS } from "@/lib/team/mock"

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

/** Contact changes awaiting verification (email link / phone OTP). */
export type PendingContact = {
  email?: string
  phone?: { code: string; number: string }
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
  pending: PendingContact
  updateUser: (patch: Partial<CurrentUser>) => void
  /** Start an email change — held in `pending` until the link is "clicked". */
  requestEmailChange: (email: string) => void
  confirmEmailChange: () => void
  cancelEmailChange: () => void
  /** Start a phone change — held in `pending` until the OTP is entered. */
  requestPhoneChange: (code: string, number: string) => void
  confirmPhoneChange: () => void
  cancelPhoneChange: () => void
  reset: () => void
}

const CurrentUserContext = createContext<CurrentUserValue | null>(null)

type Stored = { user: CurrentUser; pending: PendingContact }

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [user, setUser] = useState<CurrentUser>(DEFAULT_CURRENT_USER)
  const [pending, setPending] = useState<PendingContact>({})

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      // Older saves were the flat user object; current shape is {user, pending}.
      if (parsed.user) {
        setUser({ ...DEFAULT_CURRENT_USER, ...parsed.user })
        setPending(parsed.pending ?? {})
      } else {
        setUser({ ...DEFAULT_CURRENT_USER, ...parsed })
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<CurrentUserValue>(() => {
    function persist(nextUser: CurrentUser, nextPending: PendingContact) {
      const stored: Stored = { user: nextUser, pending: nextPending }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    }
    function apply(userPatch: Partial<CurrentUser>, pendingPatch?: Partial<PendingContact>) {
      setUser((currUser) => {
        const nextUser = { ...currUser, ...userPatch }
        setPending((currPending) => {
          const nextPending = { ...currPending, ...pendingPatch }
          if (pendingPatch && "email" in pendingPatch && pendingPatch.email === undefined)
            delete nextPending.email
          if (pendingPatch && "phone" in pendingPatch && pendingPatch.phone === undefined)
            delete nextPending.phone
          persist(nextUser, nextPending)
          return nextPending
        })
        return nextUser
      })
    }

    return {
      user,
      pending,
      updateUser: (patch) => apply(patch),
      requestEmailChange: (email) => apply({}, { email: email.trim() }),
      confirmEmailChange: () => {
        if (pending.email) apply({ email: pending.email }, { email: undefined })
      },
      cancelEmailChange: () => apply({}, { email: undefined }),
      requestPhoneChange: (code, number) => apply({}, { phone: { code, number: number.trim() } }),
      confirmPhoneChange: () => {
        if (pending.phone)
          apply(
            { phoneCode: pending.phone.code, phone: pending.phone.number },
            { phone: undefined },
          )
      },
      cancelPhoneChange: () => apply({}, { phone: undefined }),
      reset: () => {
        setUser(DEFAULT_CURRENT_USER)
        setPending({})
        window.localStorage.removeItem(STORAGE_KEY)
      },
    }
  }, [user, pending])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

/**
 * Read the mock current user. Returns the default outside a provider so any
 * surface rendered in isolation (tests, playground) still works.
 */
export function useCurrentUser(): CurrentUserValue {
  const ctx = useContext(CurrentUserContext)
  if (ctx) return ctx
  return {
    user: DEFAULT_CURRENT_USER,
    pending: {},
    updateUser: () => {},
    requestEmailChange: () => {},
    confirmEmailChange: () => {},
    cancelEmailChange: () => {},
    requestPhoneChange: () => {},
    confirmPhoneChange: () => {},
    cancelPhoneChange: () => {},
    reset: () => {},
  }
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

// DSG-63 duplicate handling: a change is blocked when the value is already
// used by someone else on Cami. The team roster stands in for "everyone".

export function isEmailTaken(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return TEAM_MEMBERS.some((m) => m.email.toLowerCase() === normalized)
}

export function isPhoneTaken(code: string, number: string): boolean {
  const digits = `${code}${number}`.replace(/\D/g, "")
  if (!digits) return false
  return TEAM_MEMBERS.some((m) => (m.phone ?? "").replace(/\D/g, "") === digits)
}
