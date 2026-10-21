// One vocabulary for a card machine's state (BUG-65), read the same at checkout
// and in Settings > Payments > Terminals.
//
// The report behind it: staff went to take a card and the terminal "sometimes
// shows, sometimes not". Sessions end after 24 hours by design, checkout gave no
// sign of it, and Settings called the state "No sessions", which support read as
// the machine being switched off. So the labels say what happened to the
// machine, and each one that blocks a sale carries the fix in counter words.

import type { TerminalStatus } from "@/lib/terminals/store"

export const TERMINAL_STATUS_LABEL: Record<TerminalStatus, string> = {
  disabled: "Disabled",
  locked: "Locked",
  "not-paired": "Not paired",
  active: "Ready",
  "no-sessions": "Signed out",
}

/** The label, plus the lockout countdown when there is one: "Locked · 12 min". */
export function terminalStatusText(status: TerminalStatus, lockedFor: string | null): string {
  const label = TERMINAL_STATUS_LABEL[status]
  return status === "locked" && lockedFor ? `${label} · ${lockedFor}` : label
}

/**
 * What gets a machine back to Ready, short enough for one line. Written for
 * whoever is at the counter, since that is who reads it at checkout. Signed out
 * leads the order because it is the one every merchant hits once a day.
 */
const FIXES: [Exclude<TerminalStatus, "active">, string][] = [
  ["no-sessions", "Enter the PIN on the device to sign back in."],
  ["locked", "Too many wrong PINs. Wait, or unlock it in Settings."],
  ["disabled", "Enable it in Settings."],
  ["not-paired", "Enter the pairing code on the device."],
]

/** The fix for one machine, or null when it is Ready. */
export function terminalFix(status: TerminalStatus): string | null {
  return FIXES.find(([s]) => s === status)?.[1] ?? null
}

/**
 * One "Label: fix" line per state present, in a fixed order. For the tile grid,
 * where a tile has room for its status and nothing more. Ready needs none.
 */
export function terminalFixes(statuses: readonly TerminalStatus[]): string[] {
  return FIXES.filter(([status]) => statuses.includes(status)).map(
    ([status, fix]) => `${TERMINAL_STATUS_LABEL[status]}: ${fix[0].toLowerCase()}${fix.slice(1)}`,
  )
}
