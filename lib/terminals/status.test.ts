import { describe, expect, it } from "vitest"

import {
  TERMINAL_STATUS_LABEL,
  terminalFix,
  terminalFixes,
  terminalStatusText,
} from "@/lib/terminals/status"

/**
 * BUG-65. Checkout and Settings read one vocabulary, and every state that
 * blocks a sale says how to clear it.
 */

describe("terminal status words", () => {
  it("says Signed out where Settings used to say No sessions", () => {
    expect(TERMINAL_STATUS_LABEL["no-sessions"]).toBe("Signed out")
    expect(TERMINAL_STATUS_LABEL.active).toBe("Ready")
  })

  it("carries the lockout countdown only on Locked", () => {
    expect(terminalStatusText("locked", "12 min")).toBe("Locked · 12 min")
    expect(terminalStatusText("locked", null)).toBe("Locked")
    expect(terminalStatusText("no-sessions", "12 min")).toBe("Signed out")
  })
})

describe("terminal fixes", () => {
  it("gives Ready no fix", () => {
    expect(terminalFixes(["active", "active"])).toEqual([])
    expect(terminalFix("active")).toBeNull()
  })

  it("gives one machine its fix as a sentence of its own", () => {
    expect(terminalFix("no-sessions")).toBe("Enter the PIN on the device to sign back in.")
  })

  it("gives one line per state present, signed out first", () => {
    const fixes = terminalFixes(["not-paired", "active", "no-sessions", "no-sessions"])
    expect(fixes).toHaveLength(2)
    expect(fixes[0]).toMatch(/^Signed out: enter the PIN on the device/)
    expect(fixes[1]).toMatch(/^Not paired: enter the pairing code/)
  })
})
