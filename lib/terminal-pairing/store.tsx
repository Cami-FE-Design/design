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

// v3 adds PairedTerminal.status. Bumped rather than migrated because the demo
// state is disposable — but readSaved() also normalises rows, so a stale shape
// can't render as a half-broken terminal if a key ever gets reused.
const STORAGE_KEY = "cami-terminal-pairing-v3"

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

/** Active sessions, not rows — expired ones are still in the list. */
export function activeCount(terminals: PairedTerminal[]): number {
  return terminals.filter((t) => t.status === "active").length
}

export function locationName(locationId: string): string {
  return TERMINAL_LOCATIONS.find((l) => l.id === locationId)?.name ?? "Unassigned"
}

export type PairedTerminal = {
  /** Device ID, printed on the device. Immutable — it survives renames, and
   *  it's how a merchant matches a row to the hardware in front of them.
   *  Backend: being added (confirmed). */
  id: string
  /** Merchant-set label. Every terminal gets a readable default at pair time
   *  ("Terminal 3"), so there is never an unnamed row and never a row headed
   *  by a serial number nobody can read across a counter. */
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
   * Pairing-session state. Expired sessions stay in the list rather than
   * dropping off, so the merchant can see which devices need re-pairing —
   * regenerating the PIN expires every active session at once.
   *
   * Backend DOES need to store this. (An earlier revision of this file argued
   * the list was active-only and status could be derived; that was wrong once
   * expired sessions became visible.)
   */
  status: "active" | "expired"
  /**
   * Connectivity — has the device checked in within ONLINE_THRESHOLD_MINUTES.
   * Independent of `status`, not nested under it: a powered-on terminal with a
   * dead session still reaches the server, which is how it knows to prompt for
   * re-pairing. Expired + Online is the common case right after a regenerate
   * and means the device is sitting there ready; Expired + Offline means
   * someone has to go find it first.
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

// Terminals arrive named by device ID; most are renamed here so the default
// view shows the managed end state rather than an all-IDs list. Covers the
// full matrix — session active/expired crossed with online/offline, plus a
// never-renamed row. Three are active, so the PIN card reads "3 terminals
// currently paired" against five rows: the count is sessions, not rows.
export const DEMO_TERMINALS: PairedTerminal[] = [
  {
    id: "T-4F91-88C2",
    name: "Front desk",
    locationId: "shampooch-jvc",
    lastSeenAt: "just now",
    status: "active",
    online: true,
  },
  {
    id: "T-7A03-D514",
    name: "Grooming counter",
    locationId: "shampooch-jvc",
    lastSeenAt: "2 min ago",
    status: "active",
    online: true,
  },
  // Never renamed — still carrying the default it was given at pair time.
  {
    id: "T-2C67-0B9E",
    name: "Terminal 3",
    locationId: "shampooch-marina",
    lastSeenAt: "yesterday, 6:42 PM",
    status: "active",
    online: false,
  },
  // Expired but powered on and reachable — the common case right after a
  // regenerate. Walk over and re-pair it.
  {
    id: "T-9B15-3E7A",
    name: "Back office",
    locationId: "shampooch-marina",
    lastSeenAt: "1 min ago",
    status: "expired",
    online: true,
  },
  // Expired and unreachable — find it first, then re-pair.
  {
    id: "T-5D28-C160",
    name: "Mobile unit",
    locationId: "shampooch-marina",
    lastSeenAt: "3 Jul",
    status: "expired",
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

/**
 * Default label for a newly paired terminal. Numbered by pairing order, taking
 * the highest existing "Terminal N" so removing one doesn't hand its number to
 * the next device and produce two rows with the same name.
 */
function nextDefaultName(terminals: PairedTerminal[]): string {
  const numbered = terminals.map((t) => Number(/^Terminal (\d+)$/.exec(t.name)?.[1] ?? 0))
  return `Terminal ${Math.max(terminals.length, ...numbered) + 1}`
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
  /**
   * Active sessions only, derived — never stored separately. Expired rows are
   * still in `terminals`, so counting rows would overstate what's actually
   * able to take payments.
   */
  pairedTerminals: number
  /** First-time generation from the empty state. Returns the new PIN. */
  generatePin: () => string
  /**
   * Regenerate: issues a new PIN and expires every active terminal session.
   * The rows stay, flipped to expired, so the merchant can see exactly which
   * devices need re-pairing rather than facing an empty list. Returns the new
   * PIN and how many sessions were signed out, for the success message.
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
  /**
   * Drop one terminal without touching the PIN or the others. Removes the row
   * outright rather than expiring it: an expired session is something the
   * system did and the merchant still needs to act on, whereas unpairing is
   * the merchant saying "take this off my list".
   */
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
    const saved = JSON.parse(raw) as Partial<TerminalPairingState>
    const merged = { ...DEFAULT_TERMINAL_PAIRING, ...saved }
    // The spread above is shallow, so a saved `terminals` array replaces the
    // default wholesale — including rows written before a field existed. Fill
    // the gaps rather than letting an undefined `status` render as neither
    // active nor expired, which silently zeroes the paired count.
    return {
      ...merged,
      terminals: merged.terminals.map((t) => ({
        ...t,
        status: t.status ?? "active",
        online: t.online ?? false,
      })),
    }
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
      pairedTerminals: state.terminals.filter((t) => t.status === "active").length,
      generatePin: () => {
        const pin = randomPin()
        // Nothing was paired before the first PIN existed.
        persist({ pin, terminals: [] })
        return pin
      },
      regeneratePin: () => {
        const pin = randomPin()
        const active = state.terminals.filter((t) => t.status === "active")
        persist({
          pin,
          // Expiring a session doesn't power the device off — connectivity is
          // untouched, so a terminal that's on stays Online and reads as ready
          // to re-pair.
          terminals: state.terminals.map((t) =>
            t.status === "active" ? { ...t, status: "expired" } : t,
          ),
        })
        return { pin, signedOut: active.length }
      },
      pairTerminal: (base = state.terminals) => {
        // Re-pairing a device that expired reactivates its row rather than
        // adding a second one — and keeps the name the merchant gave it, which
        // is the whole reason expired rows stay visible.
        const expired = base.find((t) => t.status === "expired")
        if (expired) {
          const terminal: PairedTerminal = {
            ...expired,
            status: "active",
            online: true,
            lastSeenAt: "just now",
          }
          persist({ ...state, terminals: base.map((t) => (t.id === expired.id ? terminal : t)) })
          return terminal
        }
        const id = randomDeviceId()
        const terminal: PairedTerminal = {
          id,
          // Readable from the moment it pairs; renaming is an improvement, not
          // a repair.
          name: nextDefaultName(base),
          // Comes with the pairing; the demo device pairs at the first location.
          locationId: TERMINAL_LOCATIONS[0].id,
          lastSeenAt: "just now",
          status: "active",
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
    pairedTerminals: activeCount(DEFAULT_TERMINAL_PAIRING.terminals),
    generatePin: () => DEFAULT_TERMINAL_PAIRING.pin ?? "",
    regeneratePin: () => ({
      pin: DEFAULT_TERMINAL_PAIRING.pin ?? "",
      signedOut: activeCount(DEFAULT_TERMINAL_PAIRING.terminals),
    }),
    pairTerminal: () => DEFAULT_TERMINAL_PAIRING.terminals[0],
    renameTerminal: () => {},
    unpairTerminal: () => {},
    clearPin: () => {},
    reset: () => {},
  }
}
