import { describe, expect, it } from "vitest"

import {
  actsAsChain,
  blockedReason,
  canEnable,
  type MultiLocationEnablement,
  NOT_ENABLED,
} from "@/lib/locations/enablement"

/**
 * GNK §2: "Before any of this appears, Cami HQ turns multi-location on for that
 * business, once its data check has passed."
 *
 * The repo used to answer this from the data — more than one branch meant a
 * chain — which is the ordering backwards, and leaves a half-migrated account
 * showing every chain surface to its merchant with nothing able to stand them
 * down.
 */

const passed: MultiLocationEnablement = { enabled: false, dataCheck: "passed" }
const on: MultiLocationEnablement = {
  enabled: true,
  dataCheck: "passed",
  enabledBy: "Michelle You",
  enabledAt: "2026-09-22",
}

describe("whether HQ may switch it on", () => {
  it("waits for the data check", () => {
    expect(canEnable(NOT_ENABLED)).toBe(false)
    expect(blockedReason(NOT_ENABLED)).toBe("The data check has not run yet.")
  })

  it("names what a failed check found, rather than just failing", () => {
    const failed: MultiLocationEnablement = {
      enabled: false,
      dataCheck: "failed",
      dataCheckNote: "12 appointments with no location",
    }
    expect(canEnable(failed)).toBe(false)
    expect(blockedReason(failed)).toContain("12 appointments with no location")
  })

  it("allows it once the check has passed", () => {
    expect(canEnable(passed)).toBe(true)
    expect(blockedReason(passed)).toBeNull()
  })
})

describe("whether the merchant's surfaces behave as a chain", () => {
  it("stays off until HQ turns it on, however many branches exist", () => {
    // The half-migrated account: rows created, switch untouched.
    expect(actsAsChain(passed, 9)).toBe(false)
  })

  it("stays off for one branch even when HQ has turned it on (DW1.2)", () => {
    expect(actsAsChain(on, 1)).toBe(false)
  })

  it("is on only when both are true", () => {
    expect(actsAsChain(on, 9)).toBe(true)
  })

  it("reads the GRANTED count, so a manager holding one of nine sees nothing to switch", () => {
    expect(actsAsChain(on, 1)).toBe(false)
  })
})
