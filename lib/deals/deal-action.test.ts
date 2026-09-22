import { describe, expect, it } from "vitest"

import { dealAction } from "@/lib/deals/mock"

/**
 * What the row menu offers, and what it says when it cannot (DW3.4).
 *
 * This exists because eyeballing it shipped a lie. "Activate · its dates have
 * passed" appeared on a deal starting 10 Aug with today at 24 Aug — its dates
 * had not passed at all; it had no location. Two different blockers had been
 * folded into one flag, and the sentence was wrong for the commoner of them.
 *
 * So the reason is the thing under test. A disabled item that does not say why
 * is a control the reader has to guess at, and a disabled item that says the
 * wrong why is worse than one that says nothing.
 */

const TODAY = "2026-08-24"

describe("a deal that is running, or about to", () => {
  it("offers to stop a running one", () => {
    expect(dealAction("active", true, "2026-09-30", TODAY)).toEqual({ kind: "stop" })
  })

  it("offers to stop one that has not started yet", () => {
    // "Activate" on a deal that begins next month reads as though something
    // were broken — it is already going to run.
    expect(dealAction("scheduled", true, null, TODAY)).toEqual({ kind: "stop" })
  })
})

describe("a stopped deal, and why it may not restart", () => {
  it("can be activated when its dates still allow it", () => {
    expect(dealAction("inactive", true, "2026-12-31", TODAY)).toEqual({ kind: "activate" })
  })

  it("can be activated when it has no end at all", () => {
    expect(dealAction("inactive", true, null, TODAY)).toEqual({ kind: "activate" })
  })

  it("blocks on the location when it reaches nobody — whatever its dates say", () => {
    // The case that was mislabelled: dates wide open, no branch chosen.
    expect(dealAction("inactive", false, null, TODAY)).toEqual({
      kind: "blocked",
      reason: "choose a location first",
    })
    expect(dealAction("inactive", false, "2026-12-31", TODAY)).toEqual({
      kind: "blocked",
      reason: "choose a location first",
    })
  })

  it("blocks on the dates once they really have passed", () => {
    expect(dealAction("inactive", true, "2026-04-12", TODAY)).toEqual({
      kind: "blocked",
      reason: "its dates have passed",
    })
  })

  it("names the location first when both are wrong", () => {
    // A location is the thing you can fix without re-planning the campaign, so
    // it is the one worth saying.
    expect(dealAction("inactive", false, "2026-04-12", TODAY)).toEqual({
      kind: "blocked",
      reason: "choose a location first",
    })
  })
})

describe("archived is not a dead end", () => {
  it("offers to restore, and restoring means stopped rather than running", () => {
    // Whoever archived it did not ask for it to start selling again.
    expect(dealAction("archived", true, null, TODAY)).toEqual({ kind: "restore" })
  })

  it("says the same for an archived deal with no locations", () => {
    expect(dealAction("archived", false, null, TODAY)).toEqual({ kind: "restore" })
  })
})
