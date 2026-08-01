"use client"

// Terminal registration, PINs, and sessions (DSG-62).
// Spec: docs/specs/DSG-62-terminal-registration.md
//
// Replaces the merchant-level shared-PIN model. Terminals are registered from
// the dashboard, each gets its own immutable code and its own PIN, and a
// sign-in creates a 24-hour session. The three things that model buys:
// revoking one device without touching the others, a lockout scoped to the
// device that was fumbled, and a session list you can end one row at a time.
//
// Same shape as lib/payment-policy/store.tsx: React context + localStorage,
// with an inert default returned outside a provider so isolated surfaces
// (playground, tests) still render.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-terminals-v5"

/** A session runs 24 hours from sign-in. Open question 4: fixed or per-merchant. */
export const SESSION_HOURS = 24

/**
 * Demo locations. Known gap: this doesn't read from location-form.tsx's
 * LOCATIONS, nor follow the demo business rename in lib/demo-business.tsx.
 * Collapse into one locations source when that source exists.
 */
export const TERMINAL_LOCATIONS: { id: string; name: string }[] = [
  { id: "downtown-clinic", name: "Downtown Clinic" },
  { id: "field-team", name: "Field team" },
]

export function locationName(locationId: string): string {
  return TERMINAL_LOCATIONS.find((l) => l.id === locationId)?.name ?? "Unknown location"
}

export type Terminal = {
  /**
   * Generated at registration, immutable. Typed into the device ONCE to pair
   * the hardware to this business — not part of signing in. Not a secret: it
   * stays readable on the row so a device can be re-paired later.
   */
  id: string
  /** Merchant-set, required at registration. */
  name: string
  /**
   * Merchant-set and required — a card machine physically sits somewhere, and
   * the location is what tells two identical tablets apart. Editable after
   * registration, because a device moves counters.
   */
  locationId: string
  /**
   * The sign-in PIN, readable. Issued with the terminal and retrievable from
   * the row whenever staff need to sign a device in — deliberately NOT a
   * write-once secret. Anyone who can open Payment settings can read it, which
   * is the same trade the shared-PIN card made before this.
   */
  pin: string
  /**
   * When the device first connected using its code, or null if it never has.
   * A registered-but-unpaired terminal is a real state: the merchant has
   * created it in the dashboard and nobody has walked over to the hardware yet.
   */
  pairedAt: string | null
  /** Demo-formatted countdown while locked out, null otherwise. */
  lockedFor: string | null
  lastSeenAt: string | null
}

/**
 * One staff sign-in on one terminal. A session belongs to a *device*, not a
 * person — the PIN is shared by whoever works that counter, so the identifying
 * details are hardware and network facts rather than a name. That is also why
 * they are worth showing: "Pixel Tablet on 196.20.14.9" is how a merchant
 * recognises a sign-in they didn't expect.
 */
export type TerminalSession = {
  id: string
  terminalId: string
  /** Hardware the app is running on, e.g. "Galaxy Tab A9". */
  device: string
  /** App build and OS, e.g. "Cami POS 1.4.0 · Android 14". */
  app: string
  ip: string
  /** Demo values are pre-formatted; the real API returns timestamps. */
  startedAt: string
  expiresAt: string
  lastSeenAt: string
  status: "live" | "expired" | "signed-out"
}

/**
 * One value per row, first match wins. There is no "needs PIN": a terminal is
 * issued its code and PIN together at registration, so the only setup step
 * that can be outstanding is whether the device has connected yet.
 */
export type TerminalStatus = "locked" | "not-paired" | "active" | "no-sessions"

export function terminalStatus(terminal: Terminal, sessions: TerminalSession[]): TerminalStatus {
  if (terminal.lockedFor) return "locked"
  if (!terminal.pairedAt) return "not-paired"
  return liveSessions(sessions, terminal.id).length > 0 ? "active" : "no-sessions"
}

export function liveSessions(sessions: TerminalSession[], terminalId?: string): TerminalSession[] {
  return sessions.filter(
    (s) => s.status === "live" && (terminalId === undefined || s.terminalId === terminalId),
  )
}

export type TerminalsState = {
  terminals: Terminal[]
  sessions: TerminalSession[]
}

// Nothing is capped: a merchant can register as many terminals as they have
// hardware for, and each holds as many concurrent sessions as staff open.
// In practice it is one or two devices, which is why the listing has no search
// or pagination — a "usually small" assumption rather than a guarantee, so
// revisit if a real merchant ever runs a long list.
//
// The default demo shows the typical two; the four below cover every status
// and are reachable from the panel's demo toggle.
export const DEMO_TERMINALS: Terminal[] = [
  // Fully set up and in use.
  {
    id: "TRM-7Q4K2M",
    name: "Front Desk Register",
    locationId: "downtown-clinic",
    pairedAt: "Jul 28",
    pin: "482915",
    lockedFor: null,
    lastSeenAt: "3 min ago",
  },
  // Paired and ready, but nobody is signed in right now.
  {
    id: "TRM-3H8N5P",
    name: "Grooming Counter",
    locationId: "downtown-clinic",
    pairedAt: "Jul 30",
    pin: "730164",
    lockedFor: null,
    lastSeenAt: "1 hr ago",
  },
  // Registered in the dashboard, never connected. The code exists; nobody has
  // walked over to the device and typed it in yet.
  {
    id: "TRM-9F2W6C",
    name: "Mobile Grooming Van",
    locationId: "field-team",
    pairedAt: null,
    pin: "915302",
    lockedFor: null,
    lastSeenAt: null,
  },
  // Locked out by repeated failed PIN entries on the device itself. Scoped to
  // this terminal — under the old shared-PIN model this blocked every device
  // at every location.
  {
    id: "TRM-2B7X4V",
    name: "Reception iPad",
    locationId: "downtown-clinic",
    pairedAt: "Jul 22",
    pin: "268471",
    lockedFor: "12 min",
    lastSeenAt: "26 min ago",
  },
]

// Two live sessions on one terminal. Sessions are uncapped — a device holds as
// many concurrent sign-ins as staff open, and they age out on their own.
export const DEMO_SESSIONS: TerminalSession[] = [
  {
    id: "SES-1",
    terminalId: "TRM-7Q4K2M",
    device: "Galaxy Tab A9",
    app: "Cami POS 1.4.0 · Android 14",
    ip: "196.20.14.7",
    startedAt: "Today 09:02",
    expiresAt: "Tomorrow 09:02",
    lastSeenAt: "3 min ago",
    status: "live",
  },
  {
    id: "SES-2",
    terminalId: "TRM-7Q4K2M",
    device: "Pixel Tablet",
    app: "Cami POS 1.4.0 · Android 15",
    ip: "196.20.14.9",
    startedAt: "Today 08:15",
    expiresAt: "Tomorrow 08:15",
    lastSeenAt: "41 min ago",
    status: "live",
  },
  {
    id: "SES-3",
    terminalId: "TRM-2B7X4V",
    device: "iPad (9th gen)",
    app: "Cami POS 1.3.8 · iPadOS 17",
    ip: "196.20.14.4",
    startedAt: "Yesterday 08:22",
    expiresAt: "Expired yesterday",
    lastSeenAt: "Yesterday",
    status: "expired",
  },
]

/** Two terminals at one location, one running and one mid-setup. */
export const TYPICAL_TERMINALS: Terminal[] = DEMO_TERMINALS.slice(0, 2)
export const TYPICAL_SESSIONS: TerminalSession[] = DEMO_SESSIONS.filter((s) =>
  TYPICAL_TERMINALS.some((t) => t.id === s.terminalId),
)

/**
 * Empty by default — a merchant opening this for the first time has no
 * terminals, so that is where the demo should start too. Adding one from the
 * UI persists, and the panel's demo toggle swaps in the populated sets for
 * reviewing the states.
 */
export const DEFAULT_TERMINALS_STATE: TerminalsState = {
  terminals: [],
  sessions: [],
}

/** Demo hardware the "sign in" control cycles through. */
const DEMO_DEVICES = [
  { device: "Galaxy Tab A9", app: "Cami POS 1.4.0 · Android 14" },
  { device: "Pixel Tablet", app: "Cami POS 1.4.0 · Android 15" },
  { device: "iPad (9th gen)", app: "Cami POS 1.4.0 · iPadOS 17" },
]

const CODE_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"

/** Codes look like TRM-7Q4K2M. Ambiguous glyphs (I, O) are out of the alphabet. */
export function generateTerminalCode(): string {
  const body = Array.from(
    { length: 6 },
    () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join("")
  return `TRM-${body}`
}

export function generatePin(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("")
}

type TerminalsValue = TerminalsState & {
  /**
   * Commit a registered terminal. It arrives with both credentials: the code,
   * issued once and never changing, and a first PIN. Both are readable
   * afterwards from the row.
   */
  registerTerminal: (input: { id: string; name: string; locationId: string; pin: string }) => void
  /**
   * Issue a new PIN for one device and end its live sessions. The code is
   * untouched — the device stays paired, staff just sign in with new digits.
   */
  regeneratePin: (terminalId: string) => { pin: string; signedOut: number }
  /**
   * Edit the merchant-set fields. Both are editable after registration — a
   * device gets renamed and it moves counters. The code is not among them: it
   * is what the hardware was paired with, so changing it would orphan it.
   */
  updateTerminal: (terminalId: string, patch: { name: string; locationId: string }) => void
  /** Clear a lockout early. */
  unlockTerminal: (terminalId: string) => void
  /** Drop the terminal and end its sessions. */
  removeTerminal: (terminalId: string) => void
  /** End one session without touching the PIN or the device's other sessions. */
  revokeSession: (sessionId: string) => void
  /** Demo-only: stand in for someone typing the code into the hardware. */
  pairDevice: (terminalId: string) => void
  /** Demo-only: stand in for staff signing in on a device. */
  startSession: (terminalId: string) => void
  reset: () => void
}

const TerminalsContext = createContext<TerminalsValue | null>(null)

function readSaved(): TerminalsState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<TerminalsState>
    // Shallow spread — a saved array replaces the default wholesale, including
    // rows written before a field existed. Fill the gaps rather than letting an
    // undefined field render as a state that doesn't exist.
    return {
      terminals: (saved.terminals ?? DEFAULT_TERMINALS_STATE.terminals).map((t) => ({
        ...t,
        locationId: t.locationId ?? TERMINAL_LOCATIONS[0].id,
        pairedAt: t.pairedAt ?? null,
        pin: t.pin ?? generatePin(),
        lockedFor: t.lockedFor ?? null,
        lastSeenAt: t.lastSeenAt ?? null,
      })),
      sessions: (saved.sessions ?? DEFAULT_TERMINALS_STATE.sessions).map((s) => ({
        ...s,
        status: s.status ?? "live",
        device: s.device ?? "Unknown device",
        app: s.app ?? "Cami POS",
        ip: s.ip ?? "—",
        expiresAt: s.expiresAt ?? "—",
        lastSeenAt: s.lastSeenAt ?? "—",
      })),
    }
  } catch {
    return null
  }
}

export function TerminalsProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate
  // the saved value in an effect to avoid an SSR mismatch.
  const [state, setState] = useState<TerminalsState>(DEFAULT_TERMINALS_STATE)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setState(saved)
  }, [])

  const value = useMemo<TerminalsValue>(() => {
    const persist = (next: TerminalsState) => {
      setState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }

    /** Live sessions on one device become signed-out. Used by regenerate and remove. */
    const endSessionsFor = (terminalId: string) =>
      state.sessions.map((s) =>
        s.terminalId === terminalId && s.status === "live"
          ? { ...s, status: "signed-out" as const, expiresAt: "Revoked just now" }
          : s,
      )

    return {
      ...state,
      registerTerminal: ({ id, name, locationId, pin }) => {
        persist({
          ...state,
          terminals: [
            ...state.terminals,
            {
              id,
              name,
              locationId,
              pairedAt: null,
              pin,
              lockedFor: null,
              lastSeenAt: null,
            },
          ],
        })
      },
      regeneratePin: (terminalId) => {
        const signedOut = liveSessions(state.sessions, terminalId).length
        const pin = generatePin()
        persist({
          terminals: state.terminals.map((t) =>
            // Regenerating also clears a lockout — the merchant has proven
            // control of the account, and the old PIN it was guarding is gone.
            t.id === terminalId ? { ...t, pin, lockedFor: null } : t,
          ),
          sessions: endSessionsFor(terminalId),
        })
        return { pin, signedOut }
      },
      updateTerminal: (terminalId, patch) =>
        persist({
          ...state,
          terminals: state.terminals.map((t) => (t.id === terminalId ? { ...t, ...patch } : t)),
        }),
      unlockTerminal: (terminalId) =>
        persist({
          ...state,
          terminals: state.terminals.map((t) =>
            t.id === terminalId ? { ...t, lockedFor: null } : t,
          ),
        }),
      removeTerminal: (terminalId) =>
        persist({
          terminals: state.terminals.filter((t) => t.id !== terminalId),
          sessions: state.sessions.filter((s) => s.terminalId !== terminalId),
        }),
      revokeSession: (sessionId) =>
        persist({
          ...state,
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: "signed-out" as const, expiresAt: "Revoked just now" }
              : s,
          ),
        }),
      pairDevice: (terminalId) =>
        persist({
          ...state,
          terminals: state.terminals.map((t) =>
            t.id === terminalId ? { ...t, pairedAt: "just now", lastSeenAt: "just now" } : t,
          ),
        }),
      startSession: (terminalId) =>
        persist({
          terminals: state.terminals.map((t) =>
            t.id === terminalId ? { ...t, lastSeenAt: "just now" } : t,
          ),
          sessions: [
            {
              id: `SES-${state.sessions.length + 1}-${terminalId}`,
              terminalId,
              device: DEMO_DEVICES[state.sessions.length % DEMO_DEVICES.length].device,
              app: DEMO_DEVICES[state.sessions.length % DEMO_DEVICES.length].app,
              ip: `196.20.14.${20 + (state.sessions.length % 40)}`,
              startedAt: "Just now",
              expiresAt: `In ${SESSION_HOURS} hrs`,
              lastSeenAt: "just now",
              status: "live" as const,
            },
            ...state.sessions,
          ],
        }),
      reset: () => {
        setState(DEFAULT_TERMINALS_STATE)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [state])

  return <TerminalsContext.Provider value={value}>{children}</TerminalsContext.Provider>
}

/**
 * Read terminals and sessions. Returns the (inert) default outside a provider
 * so any surface rendered in isolation still works.
 */
export function useTerminals(): TerminalsValue {
  const ctx = useContext(TerminalsContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_TERMINALS_STATE,
    registerTerminal: () => {},
    regeneratePin: () => ({ pin: generatePin(), signedOut: 0 }),
    updateTerminal: () => {},
    unlockTerminal: () => {},
    removeTerminal: () => {},
    revokeSession: () => {},
    pairDevice: () => {},
    startSession: () => {},
    reset: () => {},
  }
}
