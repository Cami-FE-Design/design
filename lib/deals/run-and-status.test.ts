import { describe, expect, it } from "vitest"

import { describeRun, statusFor } from "@/lib/deals/mock"

/**
 * When a deal runs, and what that makes its status (DW3.4).
 *
 * Both were strings on the row with nothing setting them: a deal created on the
 * screen said "Not scheduled yet" for ever, and its status was whatever the
 * create path typed in. Stored rather than derived, a status drifts — a deal
 * whose end date passed keeps reading Live until somebody edits it, which is
 * exactly the row an owner trusts and should not.
 */

const TODAY = "2026-04-15"

describe("the Runs sentence", () => {
  it("reads as a range when it has both ends", () => {
    expect(describeRun("2026-04-01", "2026-04-30")).toBe("1 Apr – 30 Apr")
  })

  it("says ongoing rather than leaving the end blank", () => {
    // An open end is a decision, not a missing field.
    expect(describeRun("2026-04-01", "")).toBe("From 1 Apr, ongoing")
  })

  it("says so when there is no start at all", () => {
    expect(describeRun("", "")).toBe("Not scheduled yet")
  })
})

describe("the status is derived, never typed", () => {
  it("is live between its dates", () => {
    expect(statusFor("2026-04-01", "2026-04-30", TODAY)).toBe("live")
  })

  it("is live with no end, because nothing has stopped it", () => {
    expect(statusFor("2026-04-01", "", TODAY)).toBe("live")
  })

  it("is scheduled before it starts", () => {
    expect(statusFor("2026-05-01", "2026-05-31", TODAY)).toBe("scheduled")
  })

  it("is ended the day after it finishes, without anyone editing it", () => {
    expect(statusFor("2026-03-01", "2026-03-31", TODAY)).toBe("ended")
  })

  it("is scheduled while it has no start", () => {
    expect(statusFor("", "", TODAY)).toBe("scheduled")
  })
})
