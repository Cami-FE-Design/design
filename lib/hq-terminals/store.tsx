"use client"

// Cami's terminal fleet (DSG-82).
// Spec: docs/specs/DSG-82-hq-terminal-management.md
//
// Cami buys the card machines and leases them out, so a terminal is an asset HQ
// owns and *assigns*, not a device a merchant registered. That is the whole
// model: a unit exists before any merchant has it, it goes out to one Partner
// at a time, and it comes back. The merchant's own pairing (code + PIN, DSG-62)
// happens on the unit after it arrives, and is the merchant's business.
//
// The list is therefore flat and HQ-wide, keyed by nothing: `merchantId` is a
// field on the unit, and null means it is on the shelf. A Partner's terminals
// are a filter over the fleet, not a separate collection — the reverse lookup
// ("who has TRM-9F2W6C?") is the one support actually starts from.
//
// Deliberately NOT wired to lib/terminals/store.tsx. That store is the demo
// merchant's own localStorage; joining them would make an HQ screen change
// because a reviewer clicked something on a merchant route, which reads as a
// bug even when it is deliberate. Two mocks, joined by the real API later.
//
// Shape follows lib/hq-camipay/store.tsx: context + localStorage, with an inert
// default outside a provider so isolated surfaces (playground) still render.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cami-hq-terminals-v2"

/** What Cami stocks. Model is a fact about the unit, not the merchant. */
export const TERMINAL_MODELS = ["NeoPay N5", "NeoPay N86", "PAX A920"] as const
export type TerminalModel = (typeof TERMINAL_MODELS)[number]

/**
 * One physical unit Cami owns. Two identifiers on purpose:
 *
 * - `serial` is printed on the back of the device. It is what a courier note,
 *   a lease schedule and a repair ticket carry, and it never changes.
 * - `id` is the pairing code the merchant types into the device once (DSG-62),
 *   `TRM-7Q4K2M`. It travels with the unit, so it survives a reassignment.
 *
 * No `pin`: that is the merchant's sign-in credential for their own staff, and
 * a reveal button on an HQ screen would make every support call an invitation
 * to read it out.
 */
export type HqTerminal = {
  id: string
  serial: string
  model: TerminalModel
  /** Which Partner has the unit. `null` means it is in stock at HQ. */
  merchantId: string | null
  /** When it was assigned and shipped out, `null` while in stock. */
  assignedAt: string | null
  /** Set once it comes back to HQ. A returned unit holds its history. */
  returnedAt: string | null
  /**
   * Pulled out of service by HQ — dead screen, failed card reader. Kept as a
   * state rather than a deletion, because a leased unit written off is a thing
   * finance asks about later.
   */
  faulty: boolean
  /** Merchant-set device name, `null` until the merchant names it. */
  name: string | null
  /** Merchant-set location, `null` until the unit is set up. */
  location: string | null
  /** When the device first connected using its code, `null` if never. */
  pairedAt: string | null
  lastSeenAt: string | null
  /** Live staff sign-ins on this device right now. */
  liveSessions: number
  /** Set while the device has locked itself out on failed PINs (DSG-62). */
  lockedFor: string | null
  /** HQ block on this one unit. `null` means it is not blocked. */
  blocked: { at: string; by: string } | null
}

export type HqTerminalsState = {
  /** The whole fleet, assigned and not. */
  terminals: HqTerminal[]
}

/**
 * First match wins, and the order is the order support cares about: where the
 * unit physically is, then whether HQ has stopped it, then what the device is
 * doing.
 */
export type HqTerminalStatus =
  | "faulty"
  | "returned"
  | "in-stock"
  | "blocked"
  | "locked"
  | "not-paired"
  | "active"
  | "no-sessions"

export function hqTerminalStatus(terminal: HqTerminal): HqTerminalStatus {
  if (terminal.faulty) return "faulty"
  if (terminal.returnedAt) return "returned"
  if (!terminal.merchantId) return "in-stock"
  if (terminal.blocked) return "blocked"
  if (terminal.lockedFor) return "locked"
  if (!terminal.pairedAt) return "not-paired"
  return terminal.liveSessions > 0 ? "active" : "no-sessions"
}

/* -------------------------------------------------------------------------- */
/* Mock data                                                                  */
/* -------------------------------------------------------------------------- */

// Seeded so every status is reachable without editing data. Partner ids match
// lib/admin-businesses.ts, and the rail flags in lib/hq-camipay/store.tsx —
// Furry Tales has its Terminal rail off, which is why its unit is the one that
// shows a Partner who cannot transact with hardware in hand.
export const DEFAULT_HQ_TERMINALS_STATE: HqTerminalsState = {
  terminals: [
    // Shampooch: the full house — in use, idle, and one shipped but never set up.
    {
      id: "TRM-7Q4K2M",
      serial: "NP5-2419-8830",
      model: "NeoPay N5",
      merchantId: "biz_shampooch",
      assignedAt: "24 Jul 2026",
      returnedAt: null,
      faulty: false,
      name: "Front Desk Register",
      location: "Downtown Clinic",
      pairedAt: "28 Jul 2026",
      lastSeenAt: "3 min ago",
      liveSessions: 2,
      lockedFor: null,
      blocked: null,
    },
    {
      id: "TRM-3H8N5P",
      serial: "NP5-2419-8834",
      model: "NeoPay N5",
      merchantId: "biz_shampooch",
      assignedAt: "24 Jul 2026",
      returnedAt: null,
      faulty: false,
      name: "Grooming Counter",
      location: "Downtown Clinic",
      pairedAt: "30 Jul 2026",
      lastSeenAt: "1 hr ago",
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    // Shipped and signed for, nobody has switched it on. The state a "where is
    // our third machine" call lands in.
    {
      id: "TRM-9F2W6C",
      serial: "PAX-A920-5561",
      model: "PAX A920",
      merchantId: "biz_shampooch",
      assignedAt: "18 Aug 2026",
      returnedAt: null,
      faulty: false,
      name: null,
      location: null,
      pairedAt: null,
      lastSeenAt: null,
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    // Pawhaus: one working, one blocked by HQ.
    {
      id: "TRM-5K1D8T",
      serial: "NP86-3307-1120",
      model: "NeoPay N86",
      merchantId: "biz_pawhaus",
      assignedAt: "16 Mar 2026",
      returnedAt: null,
      faulty: false,
      name: "Reception iPad",
      location: "Al Quoz kennel",
      pairedAt: "20 Mar 2026",
      lastSeenAt: "12 min ago",
      liveSessions: 1,
      lockedFor: null,
      blocked: null,
    },
    {
      id: "TRM-6J3R7Y",
      serial: "NP86-3307-1121",
      model: "NeoPay N86",
      merchantId: "biz_pawhaus",
      assignedAt: "16 Mar 2026",
      returnedAt: null,
      faulty: false,
      name: "Old Lease Unit",
      location: "Al Quoz kennel",
      pairedAt: "22 Mar 2026",
      lastSeenAt: "16 Jul 2026",
      liveSessions: 0,
      lockedFor: null,
      blocked: { at: "16 Jul 2026", by: "Hareem Adil" },
    },
    // Suspended Partner, and the device locked itself out. Two independent
    // reasons the counter is not taking money — the pair support untangles.
    {
      id: "TRM-2B7X4V",
      serial: "NP5-2419-8801",
      model: "NeoPay N5",
      merchantId: "biz_doggos",
      assignedAt: "10 Feb 2026",
      returnedAt: null,
      faulty: false,
      name: "Front Counter",
      location: "Mirdif",
      pairedAt: "14 Feb 2026",
      lastSeenAt: "26 min ago",
      liveSessions: 0,
      lockedFor: "12 min",
      blocked: null,
    },
    // Archived Partner whose Terminal rail is off: hardware in hand, no access.
    {
      id: "TRM-8M4G1Z",
      serial: "NP5-2419-8777",
      model: "NeoPay N5",
      merchantId: "biz_furrytales",
      assignedAt: "04 Jan 2026",
      returnedAt: null,
      faulty: false,
      name: "Salon Register",
      location: "Barsha Heights",
      pairedAt: "08 Jan 2026",
      lastSeenAt: "02 May 2026",
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    // On the shelf, ready to go out. Two models so the assign dialog has a
    // choice worth making.
    {
      id: "TRM-4T6Y9Q",
      serial: "NP5-2419-9014",
      model: "NeoPay N5",
      merchantId: null,
      assignedAt: null,
      returnedAt: null,
      faulty: false,
      name: null,
      location: null,
      pairedAt: null,
      lastSeenAt: null,
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    {
      id: "TRM-1C5V3B",
      serial: "PAX-A920-5570",
      model: "PAX A920",
      merchantId: null,
      assignedAt: null,
      returnedAt: null,
      faulty: false,
      name: null,
      location: null,
      pairedAt: null,
      lastSeenAt: null,
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    // Came back when a Partner closed. Holds who had it, which is the point of
    // keeping the row.
    {
      id: "TRM-7W2E4R",
      serial: "NP86-3307-1004",
      model: "NeoPay N86",
      merchantId: null,
      assignedAt: "12 Nov 2025",
      returnedAt: "06 May 2026",
      faulty: false,
      name: null,
      location: null,
      pairedAt: "15 Nov 2025",
      lastSeenAt: "02 May 2026",
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
    // Written off: card reader dead, back at HQ, not re-assignable.
    {
      id: "TRM-3Z8X1N",
      serial: "NP5-2419-8712",
      model: "NeoPay N5",
      merchantId: null,
      assignedAt: "20 Sep 2025",
      returnedAt: "28 Feb 2026",
      faulty: true,
      name: null,
      location: null,
      pairedAt: "24 Sep 2025",
      lastSeenAt: "26 Feb 2026",
      liveSessions: 0,
      lockedFor: null,
      blocked: null,
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* Read helpers                                                              */
/* -------------------------------------------------------------------------- */

/** One Partner's units. A filter over the fleet, not a separate collection. */
export function merchantTerminals(state: HqTerminalsState, merchantId: string): HqTerminal[] {
  return state.terminals.filter((t) => t.merchantId === merchantId && !t.returnedAt)
}

/** Units on the shelf, assignable. Faulty stock is not offered. */
export function availableTerminals(state: HqTerminalsState): HqTerminal[] {
  return state.terminals.filter((t) => t.merchantId === null && !t.faulty)
}

export function findTerminal(state: HqTerminalsState, id: string): HqTerminal | undefined {
  return state.terminals.find((t) => t.id === id)
}

/** Today, formatted the way the seeded dates are. */
export function hqTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export type HqTerminalsValue = HqTerminalsState & {
  /** Send a unit out to a Partner. The unit keeps its code and serial. */
  assignTerminal: (terminalId: string, merchantId: string) => void
  /**
   * Take a unit back. It leaves the Partner's list, keeps its history, and
   * returns to stock unless it is faulty. Any pairing dies with the assignment,
   * because the next Partner must not inherit a signed-in device.
   */
  returnTerminal: (terminalId: string) => void
  /** Put a returned unit back on the shelf, e.g. after a repair. */
  restockTerminal: (terminalId: string) => void
  /** Written off. Stays in the fleet as a record, never offered for assignment. */
  markFaulty: (terminalId: string) => void
  /**
   * Block one device. Live sessions end with it — leaving a signed-in session
   * running on a device you just blocked is not blocking it.
   */
  blockTerminal: (terminalId: string, by: string) => void
  /** Lift a block. The unit stays paired, so staff can sign in again. */
  allowTerminal: (terminalId: string) => void
  /**
   * End live sessions without blocking — the instrument for "someone left it
   * signed in at the counter". Returns how many were ended, for the toast.
   */
  signOutTerminal: (terminalId: string) => number
  reset: () => void
}

const HqTerminalsContext = createContext<HqTerminalsValue | null>(null)

function readStored(): HqTerminalsState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HqTerminalsState
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.terminals)) return null
    return parsed
  } catch {
    return null
  }
}

export function HqTerminalsProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render agree; hydrate the
  // stored value after mount.
  const [state, setState] = useState<HqTerminalsState>(DEFAULT_HQ_TERMINALS_STATE)

  useEffect(() => {
    const stored = readStored()
    if (stored) setState(stored)
  }, [])

  const value = useMemo<HqTerminalsValue>(() => {
    function persist(next: HqTerminalsState) {
      setState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
    }

    function patch(terminalId: string, patchTerminal: Partial<HqTerminal>) {
      persist({
        terminals: state.terminals.map((t) =>
          t.id === terminalId ? { ...t, ...patchTerminal } : t,
        ),
      })
    }

    return {
      ...state,
      assignTerminal: (terminalId, merchantId) =>
        patch(terminalId, {
          merchantId,
          assignedAt: hqTodayLabel(),
          returnedAt: null,
          blocked: null,
        }),
      // Everything the merchant set dies with the assignment: the name, the
      // location and the pairing belonged to their counter, not to the unit.
      returnTerminal: (terminalId) =>
        patch(terminalId, {
          merchantId: null,
          returnedAt: hqTodayLabel(),
          name: null,
          location: null,
          pairedAt: null,
          liveSessions: 0,
          lockedFor: null,
          blocked: null,
        }),
      restockTerminal: (terminalId) =>
        patch(terminalId, { returnedAt: null, assignedAt: null, lastSeenAt: null }),
      markFaulty: (terminalId) => {
        const terminal = findTerminal(state, terminalId)
        patch(terminalId, {
          faulty: true,
          merchantId: null,
          returnedAt: terminal?.returnedAt ?? hqTodayLabel(),
          name: null,
          location: null,
          pairedAt: null,
          liveSessions: 0,
          lockedFor: null,
          blocked: null,
        })
      },
      blockTerminal: (terminalId, by) =>
        patch(terminalId, { blocked: { at: hqTodayLabel(), by }, liveSessions: 0 }),
      allowTerminal: (terminalId) => patch(terminalId, { blocked: null }),
      signOutTerminal: (terminalId) => {
        const ended = findTerminal(state, terminalId)?.liveSessions ?? 0
        if (ended > 0) patch(terminalId, { liveSessions: 0 })
        return ended
      },
      reset: () => {
        setState(DEFAULT_HQ_TERMINALS_STATE)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [state])

  return <HqTerminalsContext.Provider value={value}>{children}</HqTerminalsContext.Provider>
}

/**
 * Read the fleet. Returns the (inert) default outside a provider so any surface
 * rendered in isolation still works.
 */
export function useHqTerminals(): HqTerminalsValue {
  const ctx = useContext(HqTerminalsContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_HQ_TERMINALS_STATE,
    assignTerminal: () => {},
    returnTerminal: () => {},
    restockTerminal: () => {},
    markFaulty: () => {},
    blockTerminal: () => {},
    allowTerminal: () => {},
    signOutTerminal: () => 0,
    reset: () => {},
  }
}
