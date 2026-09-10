"use client"

/**
 * The branch settings that resolve from a business default (R23, R25, INV-12,
 * INV-13, G5).
 *
 * ## Why one provider for three panels
 *
 * Tax identity, receipt sequencing and tipping are three cards on one tab, and
 * all three answer the same question: does this branch differ from the business,
 * and on what. Three providers would make that one question three subscriptions
 * and let two of them disagree about which branch is open.
 *
 * ## Why they were unwired until now
 *
 * These were the last dialogs whose Save closed and changed nothing. Not an
 * oversight of the same kind as the profile tabs — those wrote a field, while
 * these write *an override*, which needs somewhere for "no opinion" to live.
 * `undefined` is that place: a field absent from the overrides map inherits, and
 * Reset deletes the key rather than writing today's business value into it. Copy
 * the value in and the branch stops following a later change, silently — which
 * is G5's failure mode, not its behaviour.
 *
 * ## What is stored
 *
 * Only deviations, and only for branches that have one. A branch that inherits
 * everything holds no row at all, which is what keeps "9 branches inherit" a
 * fact about the data rather than a count of rows that say nothing.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  applyTaxOverride,
  BUSINESS_TAX_IDENTITY,
  LOCATION_TAX_OVERRIDES,
  type ResolvedTaxIdentity,
  resolveTaxIdentity,
  type TaxIdentityField,
  type TaxIdentityOverrides,
} from "@/lib/locations/tax-identity"
import {
  BRANCH_TIPPING,
  type BranchTipping,
  BUSINESS_TIPPING,
  resolveTipping,
  type TippingSettings,
} from "@/lib/locations/tipping"

const STORAGE_KEY = "cami-branch-settings"

/**
 * The next number each branch's receipt sequence will print (R25). Not an
 * override — every branch has its own sequence, there is no business-level
 * "next receipt number" to inherit. It lives here because it is edited in the
 * same dialog as the prefix, which is inherited.
 */
const SEEDED_SEQUENCES: Record<string, number> = {
  "shampooch-jvc": 21857,
  "shampooch-jumeirah": 4192,
}

/** The sequence a branch starts at when nothing has been issued yet. */
const FIRST_RECEIPT = 1

type Stored = {
  tax: Record<string, TaxIdentityOverrides>
  sequences: Record<string, number>
  tipping: Record<string, BranchTipping>
}

type BranchSettingsValue = {
  /** Tax identity for one branch, resolved, with the source of every field. */
  taxFor: (locationId: string) => ResolvedTaxIdentity
  /** Set one field on one branch. `undefined` is Reset — back to inheriting. */
  setTaxField: (locationId: string, field: TaxIdentityField, value: string | undefined) => void
  /** The raw overrides, for the "N fields set" count. */
  taxOverridesFor: (locationId: string) => TaxIdentityOverrides | undefined

  /** The next receipt number this branch will print (R25). */
  sequenceFor: (locationId: string) => number
  setSequence: (locationId: string, next: number) => void

  tippingFor: (locationId: string) => { mode: "workspace" | "custom"; settings: TippingSettings }
  /**
   * Follow the business default again, discarding this branch's own settings.
   * Not named `use*`: it is an action, and the prefix makes both the linter and
   * a reader treat it as a hook.
   */
  followWorkspaceTipping: (locationId: string) => void
  setCustomTipping: (locationId: string, settings: TippingSettings) => void
}

const BranchSettingsContext = createContext<BranchSettingsValue | null>(null)

const SEED: Stored = {
  tax: LOCATION_TAX_OVERRIDES,
  sequences: SEEDED_SEQUENCES,
  tipping: BRANCH_TIPPING,
}

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Stored>
    if (!parsed || typeof parsed !== "object") return null
    return {
      tax: parsed.tax ?? {},
      sequences: parsed.sequences ?? {},
      tipping: parsed.tipping ?? {},
    }
  } catch {
    return null
  }
}

export function BranchSettingsProvider({
  children,
  persist = true,
}: {
  children: React.ReactNode
  /** False for a showcase, so a demo edit is not written over the real one. */
  persist?: boolean
}) {
  // Seeded, then hydrated in an effect so server and first client render agree.
  const [stored, setStored] = useState<Stored>(SEED)

  useEffect(() => {
    if (!persist) return
    const saved = readStored()
    if (saved) setStored(saved)
  }, [persist])

  const write = useCallback(
    (mutate: (current: Stored) => Stored) => {
      setStored((current) => {
        const next = mutate(current)
        if (persist) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    },
    [persist],
  )

  const value = useMemo<BranchSettingsValue>(
    () => ({
      taxFor: (locationId) => resolveTaxIdentity(BUSINESS_TAX_IDENTITY, stored.tax[locationId]),
      taxOverridesFor: (locationId) => stored.tax[locationId],

      // The two rules that matter here — Reset deletes the key, and an empty
      // branch holds no row — live in tax-identity.ts where they are tested.
      setTaxField: (locationId, field, fieldValue) =>
        write((current) => ({
          ...current,
          tax: applyTaxOverride(current.tax, locationId, field, fieldValue),
        })),

      sequenceFor: (locationId) => stored.sequences[locationId] ?? FIRST_RECEIPT,
      setSequence: (locationId, next) =>
        write((current) => ({
          ...current,
          sequences: { ...current.sequences, [locationId]: next },
        })),

      tippingFor: (locationId) => resolveTipping(stored.tipping[locationId]),
      followWorkspaceTipping: (locationId) =>
        write((current) => {
          const tipping = { ...current.tipping }
          delete tipping[locationId]
          return { ...current, tipping }
        }),
      setCustomTipping: (locationId, settings) =>
        write((current) => ({
          ...current,
          tipping: { ...current.tipping, [locationId]: { mode: "custom", settings } },
        })),
    }),
    [stored, write],
  )

  return <BranchSettingsContext.Provider value={value}>{children}</BranchSettingsContext.Provider>
}

/**
 * Works outside a provider, on the seed, so a surface rendered in isolation
 * still resolves a coherent branch — the same shape `useLocations` uses. Writes
 * are no-ops there rather than throwing: a showcase that renders a dialog is not
 * a bug.
 */
export function useBranchSettings(): BranchSettingsValue {
  const ctx = useContext(BranchSettingsContext)
  if (ctx) return ctx
  return {
    taxFor: (locationId) => resolveTaxIdentity(BUSINESS_TAX_IDENTITY, SEED.tax[locationId]),
    taxOverridesFor: (locationId) => SEED.tax[locationId],
    setTaxField: () => {},
    sequenceFor: (locationId) => SEED.sequences[locationId] ?? FIRST_RECEIPT,
    setSequence: () => {},
    tippingFor: (locationId) => resolveTipping(SEED.tipping[locationId]),
    followWorkspaceTipping: () => {},
    setCustomTipping: () => {},
  }
}

export { BUSINESS_TIPPING }
