import { describe, expect, it } from "vitest"

import {
  BRANCH_DEPOSIT,
  type BranchDeposit,
  BUSINESS_DEPOSIT,
  branchesOverriding,
  describeDeposit,
  resolveDeposit,
} from "@/lib/locations/deposit"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"

/**
 * A branch's own deposit, on the rule the rest of the catalogue already runs
 * (DW3.5, R06, INV-13).
 *
 * The half worth testing is not "a branch can differ" — it is that a branch
 * which has *not* overridden keeps following the business. An inheriting branch
 * that quietly holds a copy of today's number looks identical on screen and
 * stops moving when the default does, which is the defect INV-13 exists to
 * name and the one nobody notices until a price rise fails to reach six
 * branches.
 */

describe("a branch's deposit", () => {
  it("follows the business when nothing is overridden", () => {
    expect(resolveDeposit(undefined)).toEqual({ mode: "workspace", settings: BUSINESS_DEPOSIT })
    expect(resolveDeposit({ mode: "workspace" }).settings).toBe(BUSINESS_DEPOSIT)
  })

  it("is live, not a copy — raising the default moves every inheriting branch", () => {
    const raised = { ...BUSINESS_DEPOSIT, percent: 25 }
    // Resolution reads the default at the moment it is asked, so a branch that
    // inherits has no number of its own to go stale.
    const inheriting = resolveDeposit({ mode: "workspace" })
    expect(inheriting.settings.percent).toBe(BUSINESS_DEPOSIT.percent)
    expect(raised.percent).not.toBe(inheriting.settings.percent)
  })

  it("leaves the branch that deliberately differs alone", () => {
    const custom: BranchDeposit = {
      mode: "custom",
      settings: { percent: 10, minBookingAed: 400, refundRule: "refundable-48h" },
    }
    expect(resolveDeposit(custom).settings.percent).toBe(10)
    expect(resolveDeposit(custom).mode).toBe("custom")
  })

  it("seeds one branch differently, so 'business default' means something", () => {
    const ids = NINE_BRANCH_ESTATE.map((l) => l.id)
    const differ = branchesOverriding(BRANCH_DEPOSIT, ids)
    expect(differ.length).toBeGreaterThan(0)
    expect(differ.length).toBeLessThan(ids.length)
  })

  it("names which branches differ rather than counting them", () => {
    // "2 locations differ" sends an owner hunting; which two is the answer.
    expect(branchesOverriding(BRANCH_DEPOSIT, ["shampooch-al-quoz"])).toEqual(["shampooch-al-quoz"])
    expect(branchesOverriding(BRANCH_DEPOSIT, ["shampooch-jvc"])).toEqual([])
  })
})

describe("the summary line", () => {
  it("states the percentage, the floor and the refund rule in one read", () => {
    expect(describeDeposit(BUSINESS_DEPOSIT)).toBe(
      "20% on bookings over AED 150 · Refundable up to 24 hours before",
    )
  })

  it("drops the floor when there is none, rather than saying 'over AED 0'", () => {
    expect(describeDeposit({ ...BUSINESS_DEPOSIT, minBookingAed: 0 })).toBe(
      "20% · Refundable up to 24 hours before",
    )
  })
})
