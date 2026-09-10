import { describe, expect, it } from "vitest"

import {
  bookableHours,
  clashingShiftIds,
  crossBranchClashes,
  membersAt,
  rangesOverlap,
  type Shift,
  shiftsAt,
} from "@/lib/team/shifts"
import { ROSTER_MEMBERS, ROSTER_SHIFTS } from "@/lib/team/shifts-mock"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"

describe("rangesOverlap", () => {
  it("does not count touching ends as an overlap", () => {
    // A shift ending at 13:00 and one starting at 13:00 are back to back, which
    // is how a split day is rostered — flagging it would flag normal work.
    expect(rangesOverlap({ start: "09:00", end: "13:00" }, { start: "13:00", end: "18:00" })).toBe(
      false,
    )
  })

  it("counts a shared minute", () => {
    expect(rangesOverlap({ start: "09:00", end: "13:00" }, { start: "12:59", end: "18:00" })).toBe(
      true,
    )
  })
})

describe("crossBranchClashes", () => {
  it("leaves two branches in one day alone when they do not overlap", () => {
    // Lena: JVC mornings, Jumeirah evenings. This is the arrangement DW2.3 is
    // written for, and flagging it would make the feature unusable.
    const lena = ROSTER_SHIFTS.filter((shift) => shift.memberId === "lena")
    expect(crossBranchClashes(lena)).toEqual([])
  })

  it("finds one person rostered at two branches over the same hours (DW2.4)", () => {
    const sara = ROSTER_SHIFTS.filter((shift) => shift.memberId === "sara")
    const clashes = crossBranchClashes(sara)
    expect(clashes).toHaveLength(1)
    expect([clashes[0]!.a.locationId, clashes[0]!.b.locationId].sort()).toEqual(
      [JVC, JUMEIRAH].sort(),
    )
  })

  it("never flags an overlap inside one branch, which ADR-023 allows", () => {
    // Mariam has two overlapping shifts at JVC. Legal, unchanged, and reporting
    // it would be calling the product's own behaviour an error.
    const mariam = ROSTER_SHIFTS.filter((shift) => shift.memberId === "mariam")
    expect(crossBranchClashes(mariam)).toEqual([])
  })

  it("never compares two different people", () => {
    const shifts: Shift[] = [
      { id: "a", memberId: "one", locationId: JVC, day: "tue", start: "09:00", end: "17:00" },
      { id: "b", memberId: "two", locationId: JUMEIRAH, day: "tue", start: "09:00", end: "17:00" },
    ]
    expect(crossBranchClashes(shifts)).toEqual([])
  })

  it("never compares different days", () => {
    const shifts: Shift[] = [
      { id: "a", memberId: "one", locationId: JVC, day: "tue", start: "09:00", end: "17:00" },
      { id: "b", memberId: "one", locationId: JUMEIRAH, day: "wed", start: "09:00", end: "17:00" },
    ]
    expect(crossBranchClashes(shifts)).toEqual([])
  })

  it("returns the pair, because a clash is a relationship and not one bad shift", () => {
    const ids = clashingShiftIds(ROSTER_SHIFTS)
    expect(ids.has("s3")).toBe(true)
    expect(ids.has("s4")).toBe(true)
    // Nothing else in the seed clashes.
    expect(ids.size).toBe(2)
  })
})

describe("shiftsAt and membersAt", () => {
  it("gives a branch its own roster, and a shared person to both", () => {
    expect(membersAt(ROSTER_MEMBERS, JVC).map((m) => m.id)).toContain("lena")
    expect(membersAt(ROSTER_MEMBERS, JUMEIRAH).map((m) => m.id)).toContain("lena")
    // And keeps a single-branch person off the other one.
    expect(membersAt(ROSTER_MEMBERS, JUMEIRAH).map((m) => m.id)).not.toContain("mariam")
  })

  it("shows the hours actually worked at that branch, not the person's whole day", () => {
    const atJvc = shiftsAt(ROSTER_SHIFTS, JVC, "lena")
    expect(atJvc).toHaveLength(1)
    expect(atJvc[0]!.end).toBe("13:00")
  })
})

describe("bookableHours", () => {
  it("is the rostered hours at that branch, in order", () => {
    const hours = bookableHours(ROSTER_SHIFTS, "omar", JUMEIRAH, "tue")
    expect(hours.map((h) => h.start)).toEqual(["09:00", "16:00"])
  })

  it("is empty on a day they do not work there, rather than the branch's hours", () => {
    // Falling back to opening hours is how a groomer gets booked on their day
    // off at a branch they were not rostered to.
    expect(bookableHours(ROSTER_SHIFTS, "omar", JUMEIRAH, "sun")).toEqual([])
    expect(bookableHours(ROSTER_SHIFTS, "omar", JVC, "tue")).toEqual([])
  })
})
