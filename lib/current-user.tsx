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
import { resolveMemberId, TEAM_MEMBERS } from "@/lib/team/mock"

const STORAGE_KEY = "cami-current-user"

export type CurrentUser = {
  /**
   * Which roster row this profile IS.
   *
   * The profile used to match nobody: a name and an email with no team member
   * behind them, which is why nothing could resolve the signed-in person's role
   * or the branches they hold. Every permission rule in the repo was therefore
   * written and left unwired, and SU2.3 — revoking a branch narrows every
   * surface at once — could be reasoned about and not shown.
   *
   * Pointing at a row is the whole fix. The profile fields below stay editable
   * (they are the ones My profile writes); the role and the grants are read
   * from the roster, because they are the owner's to set, not the user's.
   */
  memberId: string
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
  // The owner, because that is who reviews this prototype and the one role that
  // is never refused anything. Switch it with `setMemberId` to read a screen as
  // somebody else. Name, email and mobile are his roster row's
  // (lib/team/mock.ts), so My profile and Team settings show one person.
  memberId: "maz-khan",
  firstName: "Maz",
  lastName: "Khan",
  email: "maaz@getcami.io",
  phoneCode: "+971",
  phone: "50 963 6445",
  country: "United Arab Emirates",
  birthDay: "14",
  birthMonth: "Apr",
  birthYear: "1992",
  jobTitle: "Manager",
  calendarColor: "indigo",
}

/**
 * The profile this file shipped before it was the owner's row: Michelle You,
 * who is Cami HQ's admin, not anyone at the business. A browser that saved it
 * unedited gets the owner's profile instead; one somebody edited is theirs and
 * stays as it is.
 */
function isRetiredDefault(saved: Partial<CurrentUser>): boolean {
  return (
    saved.firstName === "Michelle" &&
    saved.lastName === "You" &&
    saved.email === "michelle.h.you@gmail.com"
  )
}

/** A saved profile, brought up to the current ids and defaults. */
function fromSaved(saved: Partial<CurrentUser>): CurrentUser {
  if (isRetiredDefault(saved)) return DEFAULT_CURRENT_USER
  const user = { ...DEFAULT_CURRENT_USER, ...saved }
  return { ...user, memberId: resolveMemberId(user.memberId) }
}

/** The signed-in person as the permission rules need them (R04). */
export type SignedInActor = {
  memberId: string
  name: string
  roleId: string
  /** "all" for an owner — every branch, including ones added later (R24). */
  grants: "all" | ReadonlyArray<string>
}

type CurrentUserValue = {
  user: CurrentUser
  /** Role and branches, read off the roster row this profile points at. */
  actor: SignedInActor
  /** Sign in as a different team member. A demo control, not a product action. */
  setMemberId: (memberId: string) => void
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
        setUser(fromSaved(parsed.user))
        // A retired profile's pending change was to Michelle's email, not his.
        setPending(isRetiredDefault(parsed.user) ? {} : (parsed.pending ?? {}))
      } else {
        setUser(fromSaved(parsed))
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

    const member = TEAM_MEMBERS.find((m) => m.id === user.memberId)

    return {
      user,
      /**
       * Read off the roster, never off the profile.
       *
       * A person cannot promote themselves by editing My profile, and the
       * `jobTitle` field there is a label they type — it has never decided
       * anything. Falls back to the owner when the id names nobody, because a
       * prototype that silently locks itself out of every screen is worse than
       * one that is too permissive.
       */
      actor: {
        memberId: user.memberId,
        name: member?.name ?? `${user.firstName} ${user.lastName}`,
        roleId: member?.roleId ?? "owner",
        grants: member?.locationGrants ?? "all",
      },
      setMemberId: (memberId) => apply({ memberId }),
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
    // Outside a provider the owner is the honest default: a surface rendered in
    // isolation should draw its controls, not hide them behind a role nobody
    // set.
    actor: { memberId: "maz-khan", name: "Maz Khan", roleId: "owner", grants: "all" },
    setMemberId: () => {},
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
// The signed-in person is on that roster too, so their own row is skipped:
// going back to your own email is not taking somebody else's.

export function isEmailTaken(email: string, selfMemberId?: string): boolean {
  const normalized = email.trim().toLowerCase()
  return TEAM_MEMBERS.some((m) => m.id !== selfMemberId && m.email.toLowerCase() === normalized)
}

export function isPhoneTaken(code: string, number: string, selfMemberId?: string): boolean {
  const digits = `${code}${number}`.replace(/\D/g, "")
  if (!digits) return false
  return TEAM_MEMBERS.some(
    (m) => m.id !== selfMemberId && (m.phone ?? "").replace(/\D/g, "") === digits,
  )
}
