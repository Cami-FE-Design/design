import { describe, expect, it } from "vitest"
import {
  addDaysIso,
  formatClock,
  formatDate,
  formatDurationCompact,
  formatDurationLong,
  formatLongDate,
  formatTime,
  formatWeekdayDate,
  initialOf,
  minutesOfDay,
  splitName,
  toDayIso,
} from "@/lib/format"
import { slugify } from "@/lib/utils"

// Each of these replaced several copies written out on separate screens. The
// outputs are pinned so the screens keep reading the way they did.

describe("dates", () => {
  const tue = new Date(2026, 6, 14, 13, 39)

  it("formats a day, a time and a long day", () => {
    expect(formatDate(tue)).toBe("14 Jul 2026")
    expect(formatTime(tue)).toBe("1:39pm")
    expect(formatLongDate(tue)).toBe("Tuesday, 14 Jul 2026")
    expect(formatWeekdayDate(tue)).toBe("Tue, 14 Jul")
  })

  it("reads a YYYY-MM-DD day as local midnight", () => {
    expect(formatLongDate("2026-07-14")).toBe("Tuesday, 14 Jul 2026")
    expect(formatWeekdayDate("2026-07-14")).toBe("Tue, 14 Jul")
  })

  it("turns a Date into a day key and steps it", () => {
    expect(toDayIso(tue)).toBe("2026-07-14")
    expect(addDaysIso("2026-07-30", 3)).toBe("2026-08-02")
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28")
  })
})

describe("slot times", () => {
  it("reads HH:MM as a 12-hour clock and as minutes", () => {
    expect(formatClock("09:30")).toBe("9:30AM")
    expect(formatClock("12:00")).toBe("12:00PM")
    expect(formatClock("00:15")).toBe("12:15AM")
    expect(minutesOfDay("09:30")).toBe(570)
  })
})

describe("durations", () => {
  it("has a compact and a spelled-out form", () => {
    expect(formatDurationCompact(45)).toBe("45min")
    expect(formatDurationCompact(90)).toBe("1h 30min")
    expect(formatDurationCompact(120)).toBe("2h")
    expect(formatDurationLong(45)).toBe("45 min")
    expect(formatDurationLong(90)).toBe("1 hr 30 min")
  })
})

describe("names", () => {
  it("takes an initial and splits a full name", () => {
    expect(initialOf(" michelle")).toBe("M")
    expect(initialOf(undefined)).toBe("")
    expect(splitName("Michelle H. You")).toEqual({ firstName: "Michelle", lastName: "H. You" })
    expect(slugify("Shampooch JVC!")).toBe("shampooch-jvc")
  })
})
