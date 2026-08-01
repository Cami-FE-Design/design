"use client"

// Merchant-level terminal pairing PIN (DSG-62). One 6-digit PIN per merchant,
// shared across every terminal at every location — it gates pairing/session
// creation only, never in-app actions like refunds or voids. Regenerating
// revokes all active terminal sessions. Same pattern as
// lib/payment-policy/store.tsx: React context + localStorage persistence,
// with an inert default returned outside a provider so isolated surfaces
// (playground, tests) still render.
//
// DSG-62 follow-up (docs/specs/DSG-62-terminal-management.md): paired
// terminals are a real list, not a count, so each one can be named, assigned
// to a location, and unpaired on its own. The paired count is derived from
// that list — the list and the PIN card's "N terminals currently paired" can
// no longer disagree.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-terminal-pairing-v2"

/**
 * Demo locations. Two, not one, because location assignment is meaningless
 * for a single-location merchant. Known gap (see spec): this does not read
 * from location-form.tsx's LOCATIONS, nor follow the demo business rename in
 * lib/demo-business.tsx. Collapse into one locations source when it exists.
 */
export const TERMINAL_LOCATIONS: { id: string; name: string }[] = [
  { id: "shampooch-jvc", name: "Shampooch JVC" },
  { id: "shampooch-marina", name: "Shampooch Marina" },
]

export function locationName(locationId: string): string {
  return TERMINAL_LOCATIONS.find((l) => l.id === locationId)?.name ?? "Unassigned"
}

export type PairedTerminal = {
  /** Device ID, printed on the device. Immutable — it survives renames, and
   *  it's how a merchant matches a row to the hardware in front of them.
   *  Backend: being added (confirmed). */
  id: string
  /** Merchant-set label. Defaults to the device ID at pair time, so there is
   *  never an "unnamed terminal" branch in the UI. */
  name: string
  /**
   * Set by the pairing, not by the merchant — a terminal belongs to wherever
   * it was paired. Displayed on the row, never editable in the dashboard.
   */
  locationId: string
  /**
   * Backend field: `lastSeenAt`. Demo values are pre-formatted for display;
   * the real API returns a timestamp that this layer formats.
   */
  lastSeenAt: string
  /**
   * Connectivity, NOT a pairing-session state — this list only ever contains
   * active sessions, so a session-status enum would be constant. Derived from
   * `lastSeenAt`: online when the terminal has checked in within
   * ONLINE_THRESHOLD_MINUTES. Backend does not need to store this.
   */
  online: boolean
}

/** How recent `lastSeenAt` must be for a terminal to read as Online. */
export const ONLINE_THRESHOLD_MINUTES = 5

export type TerminalPairingState = {
  /** Current pairing PIN; null when the merchant hasn't generated one yet. */
  pin: string | null
  /** Currently paired terminals across all locations (demo data). */
  terminals: PairedTerminal[]
}

// Terminals arrive named by device ID; the first two are renamed here so the
// default view shows the managed end state rather than an all-IDs list.
export const DEMO_TERMINALS: PairedTerminal[] = [
  {
    id: "T-4F91-88C2",
    name: "Front desk",
    locationId: "shampooch-jvc",
    lastSeenAt: "just now",
    online: true,
  },
  {
    id: "T-7A03-D514",
    name: "Grooming counter",
    locationId: "shampooch-jvc",
    lastSeenAt: "2 min ago",
    online: true,
  },
  {
    id: "T-2C67-0B9E",
    name: "T-2C67-0B9E",
    locationId: "shampooch-marina",
    lastSeenAt: "yesterday, 6:42 PM",
    online: false,
  },
]

// Populated default so the active state shows first; the panel's demo toggle
// flips through empty/locked/error (mirrors the gift-cards convention).
export const DEFAULT_TERMINAL_PAIRING: TerminalPairingState = {
  pin: "482913",
  terminals: DEMO_TERMINALS,
}

function randomPin(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("")
}

/** Device IDs look like T-4F91-88C2 — two uppercase hex groups. */
function randomDeviceId(): string {
  const group = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0")
  return `T-${group()}-${group()}`
}

type TerminalPairingValue = TerminalPairingState & {
  /** Derived from terminals.length — never stored separately. */
  pairedTerminals: number
  /** First-time generation from the empty state. Returns the new PIN. */
  generatePin: () => string
  /**
   * Regenerate: issues a new PIN and revokes every active terminal session
   * (the terminal list empties). Returns the new PIN and how many sessions
   * were signed out, for the success message.
   */
  regeneratePin: () => { pin: string; signedOut: number }
  /**
   * Demo-only: stand in for someone typing the PIN into a physical terminal.
   * There is no dashboard-side "add terminal" action by design — pairing
   * starts on the device — so this is the prototype's only way to show the
   * empty list becoming a populated one. Same convention as the
   * "Demo: open confirmation link" control in edit-my-profile-dialog.tsx,
   * which stands in for a click in an email client.
   *
   * @param base List to append to. Defaults to the store's own, but the panel
   * passes the list currently on screen so pairing from a demo override (an
   * empty list, say) lands on what the reviewer is looking at rather than
   * resurrecting the stored one.
   */
  pairTerminal: (base?: PairedTerminal[]) => PairedTerminal
  /**
   * Rename a terminal. Neither the device ID nor the location is editable —
   * the ID is the hardware's, and the location arrives with the pairing.
   */
  renameTerminal: (id: string, name: string) => void
  /** Drop one terminal without touching the PIN or the others. */
  unpairTerminal: (id: string) => void
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
      pairedTerminals: state.terminals.length,
      generatePin: () => {
        const pin = randomPin()
        // Nothing was paired before the first PIN existed.
        persist({ pin, terminals: [] })
        return pin
      },
      regeneratePin: () => {
        const pin = randomPin()
        const signedOut = state.terminals.length
        persist({ pin, terminals: [] })
        return { pin, signedOut }
      },
      pairTerminal: (base = state.terminals) => {
        // A freshly paired terminal is unnamed, so its name is its device ID —
        // which is exactly the state the rename affordance exists for.
        const id = randomDeviceId()
        const terminal: PairedTerminal = {
          id,
          name: id,
          // Comes with the pairing; the demo device pairs at the first location.
          locationId: TERMINAL_LOCATIONS[0].id,
          lastSeenAt: "just now",
          online: true,
        }
        persist({ ...state, terminals: [...base, terminal] })
        return terminal
      },
      renameTerminal: (id, name) =>
        persist({
          ...state,
          terminals: state.terminals.map((t) => (t.id === id ? { ...t, name } : t)),
        }),
      unpairTerminal: (id) =>
        persist({ ...state, terminals: state.terminals.filter((t) => t.id !== id) }),
      clearPin: () => persist({ pin: null, terminals: [] }),
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
    pairedTerminals: DEFAULT_TERMINAL_PAIRING.terminals.length,
    generatePin: () => DEFAULT_TERMINAL_PAIRING.pin ?? "",
    regeneratePin: () => ({
      pin: DEFAULT_TERMINAL_PAIRING.pin ?? "",
      signedOut: DEFAULT_TERMINAL_PAIRING.terminals.length,
    }),
    pairTerminal: () => DEFAULT_TERMINAL_PAIRING.terminals[0],
    renameTerminal: () => {},
    unpairTerminal: () => {},
    clearPin: () => {},
    reset: () => {},
  }
}
