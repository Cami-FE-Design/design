"use client"

// Merchant-level terminal pairing PIN (DSG-62). One 6-digit PIN per merchant,
// shared across every terminal at every location — it gates pairing/session
// creation only, never in-app actions like refunds or voids. Regenerating
// revokes all active terminal sessions. Same pattern as
// lib/payment-policy/store.tsx: React context + localStorage persistence,
// with an inert default returned outside a provider so isolated surfaces
// (playground, tests) still render.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-terminal-pairing-v1"

export type TerminalPairingState = {
  /** Current pairing PIN; null when the merchant hasn't generated one yet. */
  pin: string | null
  /** Currently paired terminal sessions across all locations (demo count). */
  pairedTerminals: number
}

// Populated default so the active state shows first; the panel's demo toggle
// flips through empty/locked/error (mirrors the gift-cards convention).
export const DEFAULT_TERMINAL_PAIRING: TerminalPairingState = {
  pin: "482913",
  pairedTerminals: 3,
}

function randomPin(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("")
}

type TerminalPairingValue = TerminalPairingState & {
  /** First-time generation from the empty state. Returns the new PIN. */
  generatePin: () => string
  /**
   * Regenerate: issues a new PIN and revokes every active terminal session
   * (pairedTerminals drops to 0). Returns the new PIN and how many sessions
   * were signed out, for the success message.
   */
  regeneratePin: () => { pin: string; signedOut: number }
  /** Demo helper — back to the "no PIN yet" empty state. */
  clearPin: () => void
  reset: () => void
}

const TerminalPairingContext = createContext<TerminalPairingValue | null>(null)

function readSaved(): TerminalPairingState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return { ...DEFAULT_TERMINAL_PAIRING, ...(JSON.parse(raw) as Partial<TerminalPairingState>) }
  } catch {
    return null
  }
}

export function TerminalPairingProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate
  // the saved value in an effect to avoid an SSR mismatch.
  const [state, setState] = useState<TerminalPairingState>(DEFAULT_TERMINAL_PAIRING)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setState(saved)
  }, [])

  const value = useMemo<TerminalPairingValue>(() => {
    const persist = (next: TerminalPairingState) => {
      setState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }

    return {
      ...state,
      generatePin: () => {
        const pin = randomPin()
        // Nothing was paired before the first PIN existed.
        persist({ pin, pairedTerminals: 0 })
        return pin
      },
      regeneratePin: () => {
        const pin = randomPin()
        const signedOut = state.pairedTerminals
        persist({ pin, pairedTerminals: 0 })
        return { pin, signedOut }
      },
      clearPin: () => persist({ pin: null, pairedTerminals: 0 }),
      reset: () => {
        setState(DEFAULT_TERMINAL_PAIRING)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [state])

  return <TerminalPairingContext.Provider value={value}>{children}</TerminalPairingContext.Provider>
}

/**
 * Read the terminal pairing state. Returns the (inert) default outside a
 * provider so any surface rendered in isolation still works.
 */
export function useTerminalPairing(): TerminalPairingValue {
  const ctx = useContext(TerminalPairingContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_TERMINAL_PAIRING,
    generatePin: () => DEFAULT_TERMINAL_PAIRING.pin ?? "",
    regeneratePin: () => ({
      pin: DEFAULT_TERMINAL_PAIRING.pin ?? "",
      signedOut: DEFAULT_TERMINAL_PAIRING.pairedTerminals,
    }),
    clearPin: () => {},
    reset: () => {},
  }
}
