import { describe, expect, it } from "vitest"
import {
  addDaysIso,
  formatClock,
  formatDate,
  formatDuration,
  formatLongDate,
  formatTime,
  formatTimeAgo,
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

  it("gives the day two digits, as cami-business does", () => {
    expect(formatDate(new Date(2026, 6, 5))).toBe("05 Jul 2026")
    expect(formatLongDate("2026-07-05")).toBe("Sunday, 05 Jul 2026")
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
  it("reads like cami-business on operational screens", () => {
    expect(formatDuration(45)).toBe("45min")
    expect(formatDuration(90)).toBe("1h 30min")
    expect(formatDuration(120)).toBe("2h")
  })
})

describe("time ago", () => {
  const now = new Date(2026, 4, 11, 15, 0)
  const ago = (ms: number) => new Date(now.getTime() - ms)
  const MIN = 60_000

  it("reads a timestamp to the minute, then by calendar day", () => {
    expect(formatTimeAgo(ago(20_000), { now })).toBe("Just now")
    expect(formatTimeAgo(ago(5 * MIN), { now })).toBe("5 min ago")
    expect(formatTimeAgo(ago(3 * 60 * MIN), { now })).toBe("3 hr ago")
    expect(formatTimeAgo(new Date(2026, 4, 10, 9, 0), { now })).toBe("Yesterday")
    expect(formatTimeAgo(new Date(2026, 4, 8), { now })).toBe("3 days ago")
    expect(formatTimeAgo(new Date(2026, 3, 26), { now })).toBe("2 wk ago")
    expect(formatTimeAgo(new Date(2026, 0, 2), { now })).toBe("4 mo ago")
    expect(formatTimeAgo(new Date(2024, 4, 1), { now })).toBe("2 yr ago")
  })

  it("reads a date-only value by day, and says Never when there is none", () => {
    expect(formatTimeAgo("2026-05-11", { now, precision: "day" })).toBe("Today")
    expect(formatTimeAgo("2026-05-10", { now, precision: "day" })).toBe("Yesterday")
    expect(formatTimeAgo("2026-05-20", { now, precision: "day" })).toBe("Today")
    expect(formatTimeAgo(null)).toBe("Never")
    expect(formatTimeAgo(undefined, { precision: "day" })).toBe("Never")
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
