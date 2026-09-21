import { describe, expect, it } from "vitest"
import { BOOKING_DAYS, type SlotGroup, slotGroupsForLocation } from "@/lib/booking"
import {
  rostered,
  slotRefusal,
  slotsForStaff,
  worksAt,
} from "@/lib/locations/cross-branch-availability"
import { LOCATIONS } from "@/lib/locations/mock"
import { ROSTER_SHIFTS } from "@/lib/team/shifts-mock"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"

// Lena, Tuesday: JVC 09:00–13:00, then Jumeirah 15:00–20:00.
// Sara, Wednesday: JVC 10:00–16:00 overlapping Jumeirah 14:00–19:00.

describe("slotRefusal", () => {
  it("offers a slot that fits inside the shift at this branch", () => {
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "tue", { start: "10:00", durationMin: 60 }),
    ).toBeNull()
  })

  it("refuses a slot that runs past the end of the shift", () => {
    // 12:30 + 60 ends at 13:30, half an hour after she leaves JVC.
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "tue", { start: "12:30", durationMin: 60 }),
    ).toEqual({ reason: "off-roster" })
  })

  it("names the other branch and its hours when they are committed there", () => {
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "tue", { start: "16:00", durationMin: 60 }),
    ).toEqual({ reason: "other-branch", locationId: JUMEIRAH, start: "15:00", end: "20:00" })
  })

  it("separates a gap in the roster from a clash with another branch", () => {
    // 13:00–15:00 she is nowhere: a gap, and not DW2.4's rule.
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "tue", { start: "13:30", durationMin: 60 }),
    ).toEqual({ reason: "off-roster" })
  })

  it("lets a shift end and another branch's begin at the same minute", () => {
    // Finishing at 13:00 at JVC and starting at 15:00 at Jumeirah is the
    // split-across-branches day DW2.3 exists for, so 12:00–13:00 is fine.
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "tue", { start: "12:00", durationMin: 60 }),
    ).toBeNull()
  })

  it("blocks the overlapping hours when someone is rostered at both branches", () => {
    // Sara, Wednesday: 14:00 onwards is JVC and Jumeirah at once.
    expect(
      slotRefusal(ROSTER_SHIFTS, "sara", JVC, "wed", { start: "14:00", durationMin: 60 }),
    ).toEqual({ reason: "other-branch", locationId: JUMEIRAH, start: "14:00", end: "19:00" })
    // Before the overlap she is only at JVC, and that stays bookable.
    expect(
      slotRefusal(ROSTER_SHIFTS, "sara", JVC, "wed", { start: "11:00", durationMin: 60 }),
    ).toBeNull()
  })

  it("offers inside either window of a split shift at one branch", () => {
    // Mariam, Thursday: JVC 09:00–13:00, a break, then 14:00–18:00.
    expect(
      slotRefusal(ROSTER_SHIFTS, "mariam", JVC, "thu", { start: "10:00", durationMin: 60 }),
    ).toBeNull()
    expect(
      slotRefusal(ROSTER_SHIFTS, "mariam", JVC, "thu", { start: "15:00", durationMin: 60 }),
    ).toBeNull()
  })

  it("refuses the break between two windows of a split shift", () => {
    // 13:00–14:00 is nobody's working hour, and a slot crossing into it runs
    // past the end of the window it starts in.
    expect(
      slotRefusal(ROSTER_SHIFTS, "mariam", JVC, "thu", { start: "12:30", durationMin: 60 }),
    ).toEqual({ reason: "off-roster" })
  })

  it("refuses a day they do not work", () => {
    expect(
      slotRefusal(ROSTER_SHIFTS, "omar", JUMEIRAH, "sun", { start: "10:00", durationMin: 60 }),
    ).toEqual({ reason: "off-roster" })
  })
})

describe("rostered", () => {
  it("is false for someone the roster does not model", () => {
    expect(rostered(ROSTER_SHIFTS, "diana")).toBe(false)
    expect(rostered(ROSTER_SHIFTS, "lena")).toBe(true)
  })
})

describe("worksAt", () => {
  it("answers per branch and per day, not per person", () => {
    expect(worksAt(ROSTER_SHIFTS, "lena", JVC, "tue")).toBe(true)
    expect(worksAt(ROSTER_SHIFTS, "lena", JVC, "wed")).toBe(false)
    expect(worksAt(ROSTER_SHIFTS, "omar", JVC, "tue")).toBe(false)
  })
})

const GRID: ReadonlyArray<SlotGroup> = [
  {
    label: "Morning",
    times: [
      { time: "10:00am", time24: "10:00" },
      { time: "11:00am", time24: "11:00" },
    ],
  },
  {
    label: "Afternoon",
    times: [
      { time: "1:30pm", time24: "13:30" },
      { time: "4:00pm", time24: "16:00" },
    ],
  },
]

describe("slotsForStaff", () => {
  it("keeps only the slots this person can take at this branch", () => {
    const groups = slotsForStaff(GRID, ROSTER_SHIFTS, "lena", JVC, "tue", 60)
    expect(groups.map((g) => g.label)).toEqual(["Morning"])
    expect(groups[0]?.times.map((t) => t.time24)).toEqual(["10:00", "11:00"])
  })

  it("returns the branch's own grid for someone the roster does not model", () => {
    expect(slotsForStaff(GRID, ROSTER_SHIFTS, "diana", JVC, "tue", 60)).toBe(GRID)
  })

  it("empties the grid on a day they are not at this branch", () => {
    expect(slotsForStaff(GRID, ROSTER_SHIFTS, "lena", JVC, "wed", 60)).toEqual([])
  })

  it("narrows further as the appointment gets longer", () => {
    // Sara is at JVC 10:00–16:00 on Wednesday, and due at Jumeirah from 14:00.
    // A half-hour appointment at 13:30 finishes exactly as that starts, so it
    // stands; an hour-long one at the same time runs into the other branch.
    const short = slotsForStaff(GRID, ROSTER_SHIFTS, "sara", JVC, "wed", 30)
    expect(short.flatMap((g) => g.times.map((t) => t.time24))).toEqual(["10:00", "11:00", "13:30"])
    const long = slotsForStaff(GRID, ROSTER_SHIFTS, "sara", JVC, "wed", 60)
    expect(long.flatMap((g) => g.times.map((t) => t.time24))).toEqual(["10:00", "11:00"])
  })
})

// The /screens entry tells a reviewer what to click and what they should see.
// Pinning it here means the note cannot quietly stop being true.
describe("the demo the /screens entry promises", () => {
  it("stops Lena's Tuesday at JVC before her Jumeirah shift", () => {
    const tuesday = BOOKING_DAYS.find((d) => d.weekDay === "tue")!
    const jvcHours = LOCATIONS.find((l) => l.id === JVC)!.hours
    const branch = slotGroupsForLocation(jvcHours, tuesday)
    // JVC trades 09:00–19:00 on a Tuesday, so the branch offers the evening.
    expect(branch.flatMap((g) => g.times).at(-1)?.time24).toBe("18:30")

    // Lena is at JVC until 13:00 and at Jumeirah from 15:00. A two-hour groom
    // has to be finished by one, so nothing is offered after 11:00.
    const hers = slotsForStaff(branch, ROSTER_SHIFTS, "lena", JVC, "tue", 120)
    expect(hers.flatMap((g) => g.times).at(-1)?.time24).toBe("11:00")
    expect(hers.flatMap((g) => g.times).every((t) => t.time24 < "13:00")).toBe(true)
  })
})
