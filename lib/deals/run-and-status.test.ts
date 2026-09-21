import { describe, expect, it } from "vitest"

import { formatDateRange, statusFor } from "@/lib/deals/mock"

/**
 * A deal's dates and its status, on the built product's shape (DW3.4).
 *
 * The first version of this file invented both: a `runs` string and a
 * `live | scheduled | ended` status, written without reading the dev repo's
 * `promotion-discount-ui` where the whole deals module already exists. Two of
 * those three statuses were wrong, and the date formatting was a second
 * implementation of one that ships.
 *
 * What survives that correction is the one rule worth keeping: a status a
 * calendar can settle is derived, and a status somebody set by hand is not.
 */

const TODAY = "2026-04-15"

describe("the date range, as the built product writes it", () => {
  it("collapses a range inside one month rather than repeating it", () => {
    expect(formatDateRange("2026-04-01", "2026-04-30")).toBe("Apr 1 – 30, 2026")
  })

  it("spells both ends when they span months", () => {
    expect(formatDateRange("2026-03-01", "2026-04-30")).toBe("Mar 1, 2026 – Apr 30, 2026")
  })

  it("shows the start alone for an offer with no end", () => {
    // A null end is "runs until you stop it", which is a decision rather than
    // a missing field — so it reads as one date, not as a broken range.
    expect(formatDateRange("2026-04-01", null)).toBe("Apr 1, 2026")
  })
})

describe("status is derived only where a date can settle it", () => {
  it("is active between its dates", () => {
    expect(statusFor("scheduled", "2026-04-01", "2026-04-30", TODAY)).toBe("active")
  })

  it("is active with no end, because nothing has stopped it", () => {
    expect(statusFor("scheduled", "2026-04-01", null, TODAY)).toBe("active")
  })

  it("is scheduled before it starts, whatever was stored", () => {
    expect(statusFor("active", "2026-05-01", "2026-05-31", TODAY)).toBe("scheduled")
  })

  it("stops being active the day after it ends, with nobody editing it", () => {
    // The row an owner trusts. Stored alone, it would still read Active.
    expect(statusFor("active", "2026-03-01", "2026-03-31", TODAY)).toBe("inactive")
  })
})

describe("what a calendar cannot know, it does not decide", () => {
  it("keeps a deal switched off by hand switched off, even mid-run", () => {
    // Turned off in April while its dates still cover today. Deriving from the
    // dates would switch it back on, which is the opposite of what was asked.
    expect(statusFor("inactive", "2026-04-01", "2026-04-30", TODAY)).toBe("inactive")
  })

  it("keeps an archived deal archived", () => {
    expect(statusFor("archived", "2026-04-01", "2026-04-30", TODAY)).toBe("archived")
  })
})
