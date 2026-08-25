// Pins the payout destination rules (DSG-75).
//
// These are the highest-severity rules in the pack. A regression here does not
// look like a broken screen — it looks like a merchant's money going to a closed
// account and failing days later, somewhere support cannot see.

import { describe, expect, it } from "vitest"
import {
  commitDestination,
  DEMO_CHANGE_HISTORY,
  DEMO_DESTINATION,
  payoutsPaused,
} from "./bank-account"

const DRAFT = {
  holderName: "Shampooch Pet Grooming L.L.C",
  bankName: "Emirates NBD",
  iban: "AE07 0331 2345 6789 0123 456",
}

const OPTS = { actor: "Omar Haddad", nowIso: "2026-08-24T09:00:00.000Z" }

describe("both-or-neither (SET-B3)", () => {
  it("returns a destination when both systems accept", () => {
    const result = commitDestination(DEMO_DESTINATION, DRAFT, OPTS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.destination.last4).toBe("3456")
  })

  it("returns no destination at all when the gateway refuses", () => {
    const result = commitDestination(DEMO_DESTINATION, DRAFT, {
      ...OPTS,
      simulateGatewayFailure: true,
    })
    expect(result.ok).toBe(false)
    if (result.ok) return

    // There is no half-applied shape to return. The refusal carries which
    // system said no and the promise the screen repeats.
    expect(result.stage).toBe("gateway")
    expect(result.nothingChanged).toBe(true)
    expect("destination" in result).toBe(false)
    expect(result.message).toMatch(/nothing was changed/i)
  })
})

describe("a new account is never born verified (SET-B4)", () => {
  it("does not inherit the previous account's verified state", () => {
    expect(DEMO_DESTINATION.verification).toBe("verified")
    const result = commitDestination(DEMO_DESTINATION, DRAFT, OPTS)
    expect(result.ok && result.destination.verification).toBe("unverified")
  })

  it("pauses payouts on anything that is not verified", () => {
    expect(payoutsPaused(DEMO_DESTINATION)).toBe(false)
    expect(payoutsPaused({ ...DEMO_DESTINATION, verification: "unverified" })).toBe(true)
    expect(payoutsPaused({ ...DEMO_DESTINATION, verification: "pending" })).toBe(true)
    // No destination at all is not a reason to send money somewhere.
    expect(payoutsPaused(null)).toBe(true)
  })

  it("keeps paying both senders into the one account", () => {
    const result = commitDestination(DEMO_DESTINATION, DRAFT, OPTS)
    expect(result.ok && result.destination.receives).toEqual(["online", "terminal"])
  })
})

describe("the destination is only ever masked (SET-A2)", () => {
  it("keeps the last 4 and nothing else from the IBAN", () => {
    const result = commitDestination(null, DRAFT, OPTS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const serialised = JSON.stringify(result.destination)
    expect(serialised).not.toContain("0331")
    expect(serialised).not.toContain(DRAFT.iban.replace(/\s+/g, ""))
    expect(result.destination.last4).toHaveLength(4)
  })
})

describe("change history is a record, not a success log (SET-B5, INV-01)", () => {
  it("keeps failed attempts with their reason", () => {
    const failed = DEMO_CHANGE_HISTORY.filter((c) => c.outcome === "failed")
    expect(failed.length).toBeGreaterThan(0)
    for (const c of failed) expect(c.failureReason).toBeTruthy()
  })

  it("records who and when on every entry", () => {
    for (const c of DEMO_CHANGE_HISTORY) {
      expect(c.actor).toBeTruthy()
      expect(c.atIso).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(c.toLast4).toHaveLength(4)
    }
  })
})
