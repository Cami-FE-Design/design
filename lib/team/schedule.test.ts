import { describe, expect, it } from "vitest"
import { slotRefusal } from "@/lib/locations/cross-branch-availability"
import {
  dayCell,
  formatHours,
  fullDayLeave,
  MIN_SHIFT_GAP_MINUTES,
  subtractIntervals,
  validDayWindows,
  workingMinutes,
} from "@/lib/team/shifts"
import { ROSTER_BLOCKS, ROSTER_LEAVES, ROSTER_MEMBERS, ROSTER_SHIFTS } from "@/lib/team/shifts-mock"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"

const cellFor = (memberId: string, locationId: string, day: string) =>
  dayCell(ROSTER_SHIFTS, ROSTER_LEAVES, ROSTER_BLOCKS, memberId, locationId, day)

describe("dayCell", () => {
  it("takes the shift windows from this branch only", () => {
    // Lena works JVC 09:00–13:00 and Jumeirah 15:00–20:00 on the same Tuesday.
    expect(cellFor("lena", JVC, "tue").windows).toEqual([{ start: "09:00", end: "13:00" }])
    expect(cellFor("lena", JUMEIRAH, "tue").windows).toEqual([{ start: "15:00", end: "20:00" }])
  })

  it("carries leave to every branch, because away is away", () => {
    // Lena is due at both branches that Thursday and is entered as off at JVC.
    // DW2.2 lists time off as per-branch, but it is accepted on "another
    // branch's *roster change* never affects mine" — and an absence is not a
    // roster change. Scoped to JVC, this leave would leave Jumeirah free to
    // roster and sell her on a day she is away.
    const jvc = cellFor("lena", JVC, "thu")
    const jumeirah = cellFor("lena", JUMEIRAH, "thu")
    expect(fullDayLeave(jvc)?.type).toBe("Annual leave")
    expect(jvc.notWorking).toBe(true)
    expect(fullDayLeave(jumeirah)?.type).toBe("Annual leave")
    expect(jumeirah.notWorking).toBe(true)
  })

  it("still takes shifts from this branch alone", () => {
    // The half of DW2.2 that stands: a rota is the branch's. Only the absence
    // crosses, so a leave made person-level must not quietly make shifts one.
    expect(cellFor("lena", JVC, "tue").windows).toEqual([{ start: "09:00", end: "13:00" }])
    expect(cellFor("lena", JUMEIRAH, "tue").windows).toEqual([{ start: "15:00", end: "20:00" }])
  })

  it("keeps a block time at its own branch", () => {
    // Sara's lunch is seeded at JVC, and she also works Jumeirah that day.
    expect(cellFor("sara", JVC, "wed").blocks.map((b) => b.title)).toEqual(["Lunch"])
    expect(cellFor("sara", JUMEIRAH, "wed").blocks).toEqual([])
  })

  it("marks a day with no window here as not working", () => {
    expect(cellFor("lena", JVC, "wed").notWorking).toBe(true)
    expect(cellFor("lena", JVC, "tue").notWorking).toBe(false)
  })

  it("sorts split shifts by time", () => {
    // Omar's Tuesday at Jumeirah is 09:00–12:00 and 16:00–20:00.
    expect(cellFor("omar", JUMEIRAH, "tue").windows.map((w) => w.start)).toEqual(["09:00", "16:00"])
  })
})

describe("subtractIntervals", () => {
  it("splits a window around a cut in the middle", () => {
    expect(
      subtractIntervals({ start: "09:00", end: "17:00" }, [{ start: "12:00", end: "13:00" }]),
    ).toEqual([
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" },
    ])
  })

  it("shortens rather than splits when the cut reaches an edge", () => {
    expect(
      subtractIntervals({ start: "09:00", end: "17:00" }, [{ start: "09:00", end: "11:00" }]),
    ).toEqual([{ start: "11:00", end: "17:00" }])
  })

  it("leaves a window alone when the cut misses it", () => {
    expect(
      subtractIntervals({ start: "09:00", end: "12:00" }, [{ start: "14:00", end: "15:00" }]),
    ).toEqual([{ start: "09:00", end: "12:00" }])
  })

  it("removes a window the cut swallows whole", () => {
    expect(
      subtractIntervals({ start: "10:00", end: "11:00" }, [{ start: "09:00", end: "17:00" }]),
    ).toEqual([])
  })
})

describe("workingMinutes", () => {
  it("counts the windows at this branch", () => {
    // 09:00–12:00 plus 16:00–20:00, less the seeded 90-minute sick leave.
    expect(workingMinutes(cellFor("omar", JUMEIRAH, "tue"))).toBe(3 * 60 + 4 * 60 - 90)
  })

  it("is zero on a full day of leave, however many windows are rostered", () => {
    expect(cellFor("lena", JVC, "thu").windows).toHaveLength(1)
    expect(workingMinutes(cellFor("lena", JVC, "thu"))).toBe(0)
  })

  it("keeps block times in, because they are worked and only unsellable", () => {
    // Sara is at JVC 10:00–16:00 on Wednesday with a half-hour lunch.
    expect(workingMinutes(cellFor("sara", JVC, "wed"))).toBe(6 * 60)
  })
})

describe("formatHours", () => {
  it("writes a week the way an operator would", () => {
    expect(formatHours(0)).toBe("0 hr")
    expect(formatHours(45)).toBe("45 min")
    expect(formatHours(8 * 60)).toBe("8 hr")
    expect(formatHours(7 * 60 + 30)).toBe("7 hr, 30 min")
  })
})

describe("leave against booking", () => {
  it("refuses at every branch, not only the one that filed the leave", () => {
    const slot = { start: "10:00", durationMin: 60 }
    const onLeave = { reason: "on-leave", leaveType: "Annual leave" }
    expect(slotRefusal(ROSTER_SHIFTS, "lena", JVC, "thu", slot, ROSTER_LEAVES)).toEqual(onLeave)
    // The branch that did not file it refuses too — otherwise an estate sells
    // somebody who is out of the country, which is the whole point of the rule.
    expect(slotRefusal(ROSTER_SHIFTS, "lena", JUMEIRAH, "thu", slot, ROSTER_LEAVES)).toEqual(
      onLeave,
    )
  })

  it("refuses only the hours a partial leave covers", () => {
    // Omar is out 10:00–11:30 and working either side of it.
    expect(
      slotRefusal(
        ROSTER_SHIFTS,
        "omar",
        JUMEIRAH,
        "tue",
        { start: "10:30", durationMin: 30 },
        ROSTER_LEAVES,
      ),
    ).toEqual({ reason: "on-leave", leaveType: "Sick leave" })
    expect(
      slotRefusal(
        ROSTER_SHIFTS,
        "omar",
        JUMEIRAH,
        "tue",
        { start: "09:00", durationMin: 60 },
        ROSTER_LEAVES,
      ),
    ).toBeNull()
  })

  it("outranks a rota that still shows a window", () => {
    // Without the leave the Thursday window would offer this slot.
    expect(
      slotRefusal(ROSTER_SHIFTS, "lena", JVC, "thu", { start: "10:00", durationMin: 60 }),
    ).toBeNull()
  })
})

describe("the seed is a rota the product would accept", () => {
  it("has no day at one branch the built shift dialog would refuse", () => {
    // Overlapping windows, a duplicate, or less than a half-hour between them
    // are all refused where a shift is written. A demo that showed one would be
    // teaching a rule the product does not have.
    const days = new Set(ROSTER_SHIFTS.map((shift) => shift.day))
    const branches = new Set(ROSTER_SHIFTS.map((shift) => shift.locationId))

    for (const member of ROSTER_MEMBERS) {
      for (const branch of branches) {
        for (const day of days) {
          const windows = ROSTER_SHIFTS.filter(
            (shift) =>
              shift.memberId === member.id && shift.locationId === branch && shift.day === day,
          )
          expect(validDayWindows(windows), `${member.id} / ${branch} / ${day}`).toBe(true)
        }
      }
    }
  })
})

describe("validDayWindows", () => {
  it("refuses two windows that overlap at one branch", () => {
    expect(
      validDayWindows([
        { start: "09:00", end: "14:00" },
        { start: "12:00", end: "18:00" },
      ]),
    ).toBe(false)
  })

  it("refuses a break shorter than the built rota requires", () => {
    expect(MIN_SHIFT_GAP_MINUTES).toBe(30)
    expect(
      validDayWindows([
        { start: "09:00", end: "13:00" },
        { start: "13:15", end: "18:00" },
      ]),
    ).toBe(false)
  })

  it("accepts a split shift with a proper break", () => {
    expect(
      validDayWindows([
        { start: "09:00", end: "13:00" },
        { start: "14:00", end: "18:00" },
      ]),
    ).toBe(true)
  })

  it("refuses a window that ends before it starts", () => {
    expect(validDayWindows([{ start: "14:00", end: "09:00" }])).toBe(false)
  })
})
