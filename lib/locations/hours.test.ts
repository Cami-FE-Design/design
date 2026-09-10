import { describe, expect, it } from "vitest"

import {
  CLOSED_DAY,
  closingTime,
  formatDayHours,
  fromPickerTime,
  isOpenNow,
  nextOpeningTime,
  openFor,
  openForShifts,
  sameSchedule,
  toPickerTime,
  WEEK_DAYS,
  type WeekSchedule,
} from "@/lib/locations/hours"

/** A branch that shuts over lunch — the case a single open/close cannot hold. */
const SPLIT = openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" })

function at(hour: number, minute = 0): Date {
  return new Date(2026, 8, 10, hour, minute)
}

const WEEK: WeekSchedule = Object.fromEntries(
  WEEK_DAYS.map(({ id }) => [id, openFor("09:00", "19:00")]),
) as WeekSchedule

describe("formatDayHours", () => {
  it("names a closed day rather than dropping it", () => {
    expect(formatDayHours(CLOSED_DAY)).toBe("Closed")
  })

  it("prints every shift, so a split day is not shown as one long one", () => {
    expect(formatDayHours(SPLIT)).toBe("8am – 1pm, 4pm – 8pm")
  })

  it("keeps the minutes when they are not zero", () => {
    expect(formatDayHours(openFor("09:30", "18:15"))).toBe("9:30am – 6:15pm")
  })
})

describe("isOpenNow", () => {
  it("is shut during the midday gap, not open all day", () => {
    const week = { ...WEEK, thu: SPLIT }
    expect(isOpenNow(week, at(14))).toBe(false)
    expect(isOpenNow(week, at(10))).toBe(true)
    expect(isOpenNow(week, at(17))).toBe(true)
  })

  it("is shut on a closed day", () => {
    expect(isOpenNow({ ...WEEK, thu: CLOSED_DAY }, at(10))).toBe(false)
  })
})

describe("closingTime", () => {
  it("names the close of the shift running now, not the last of the day", () => {
    expect(closingTime(SPLIT, at(12))).toBe("13:00")
  })

  it("is null in the gap, so the caller says closed instead of naming a time", () => {
    expect(closingTime(SPLIT, at(14))).toBeNull()
  })
})

describe("nextOpeningTime", () => {
  it("points at this afternoon's shift, not tomorrow", () => {
    expect(nextOpeningTime(SPLIT, at(14))).toBe("16:00")
  })

  it("is null once the day is over", () => {
    expect(nextOpeningTime(SPLIT, at(21))).toBeNull()
  })
})

describe("sameSchedule", () => {
  it("sees one differing day", () => {
    expect(sameSchedule(WEEK, { ...WEEK, sun: CLOSED_DAY })).toBe(false)
    expect(sameSchedule(WEEK, { ...WEEK })).toBe(true)
  })
})

describe("picker conversions", () => {
  it("round-trips every half hour the editor offers", () => {
    for (let h = 0; h < 24; h++) {
      for (const m of ["00", "30"]) {
        const time = `${String(h).padStart(2, "0")}:${m}`
        expect(fromPickerTime(toPickerTime(time))).toBe(time)
      }
    }
  })

  it("keeps the minutes a display label would drop", () => {
    expect(toPickerTime("09:00")).toBe("9:00 AM")
    expect(toPickerTime("00:30")).toBe("12:30 AM")
    expect(toPickerTime("12:00")).toBe("12:00 PM")
  })

  it("falls back to a valid time rather than storing a broken one", () => {
    expect(fromPickerTime("not a time")).toBe("09:00")
  })
})
