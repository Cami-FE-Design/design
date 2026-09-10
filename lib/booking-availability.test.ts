import { describe, expect, it } from "vitest"

import {
  BOOKING_DAYS,
  BOOKING_STAFF,
  bookingDaysForLocation,
  bookingStaffForLocation,
  slotGroupsForLocation,
} from "@/lib/booking"
import {
  CLOSED_DAY,
  openFor,
  openForShifts,
  WEEK_DAYS,
  type WeekSchedule,
} from "@/lib/locations/hours"
import { locationHours } from "@/lib/locations/mock"

const dayOf = (weekDay: string) => BOOKING_DAYS.find((d) => d.weekDay === weekDay)!

/** Weekdays 9–7, Sunday closed — JVC's week. */
const WEEKDAYS_ONLY: WeekSchedule = Object.fromEntries(
  WEEK_DAYS.map(({ id }) => [id, id === "sun" ? CLOSED_DAY : openFor("09:00", "19:00")]),
) as WeekSchedule

/** Shuts over the middle of the day — Al Quoz's. */
const SPLIT: WeekSchedule = Object.fromEntries(
  WEEK_DAYS.map(({ id }) => [
    id,
    openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" }),
  ]),
) as WeekSchedule

describe("bookingDaysForLocation", () => {
  it("marks a day the branch does not open as closed, not full", () => {
    const sunday = bookingDaysForLocation(WEEKDAYS_ONLY).find((d) => d.weekDay === "sun")!
    expect(sunday.closed).toBe(true)
    // "Fully booked" invites a client back to a day that will never have a slot.
    expect(sunday.full).toBe(false)
  })

  it("opens a day the business week had shut, when the branch trades then", () => {
    const sevenDays: WeekSchedule = Object.fromEntries(
      WEEK_DAYS.map(({ id }) => [id, openFor("09:00", "20:00")]),
    ) as WeekSchedule
    const saturday = bookingDaysForLocation(sevenDays).find((d) => d.weekDay === "sat")!
    // The static week seeds Saturday as full; a seven-day branch is not shut.
    expect(saturday.closed).toBeUndefined()
  })

  it("falls back to the business week when no branch is given", () => {
    expect(bookingDaysForLocation(undefined)).toBe(BOOKING_DAYS)
  })
})

describe("slotGroupsForLocation", () => {
  it("offers nothing on a closed day", () => {
    expect(slotGroupsForLocation(WEEKDAYS_ONLY, dayOf("sun"))).toEqual([])
  })

  it("skips the midday gap rather than filtering it afterwards", () => {
    const times = slotGroupsForLocation(SPLIT, dayOf("tue")).flatMap((g) =>
      g.times.map((t) => t.time),
    )
    expect(times).toContain("12:30pm")
    expect(times).not.toContain("1:30pm")
    expect(times).not.toContain("3pm")
    expect(times).toContain("4pm")
  })

  it("stops half an hour before closing, because a slot at closing time is not one", () => {
    const times = slotGroupsForLocation(WEEKDAYS_ONLY, dayOf("tue")).flatMap((g) =>
      g.times.map((t) => t.time),
    )
    expect(times).toContain("6:30pm")
    expect(times).not.toContain("7pm")
    expect(times[0]).toBe("9am")
  })

  it("is deterministic, so a demo does not reshuffle between renders", () => {
    const once = slotGroupsForLocation(WEEKDAYS_ONLY, dayOf("tue"))
    const twice = slotGroupsForLocation(WEEKDAYS_ONLY, dayOf("tue"))
    expect(once).toEqual(twice)
  })

  it("leaves every open day something bookable", () => {
    for (const { id } of WEEK_DAYS) {
      if (id === "sun") continue
      const free = slotGroupsForLocation(WEEKDAYS_ONLY, dayOf(id)).flatMap((g) =>
        g.times.filter((t) => !t.taken),
      )
      expect(free.length).toBeGreaterThan(0)
    }
  })

  it("groups by part of day, and drops a part with nothing in it", () => {
    const labels = slotGroupsForLocation(SPLIT, dayOf("tue")).map((g) => g.label)
    expect(labels).toEqual(["Morning", "Afternoon", "Evening"])
    const morningOnly = slotGroupsForLocation(
      { ...WEEKDAYS_ONLY, tue: openFor("09:00", "11:00") },
      dayOf("tue"),
    )
    expect(morningOnly.map((g) => g.label)).toEqual(["Morning"])
  })
})

describe("bookingStaffForLocation", () => {
  it("offers only the people who work at that branch", () => {
    const jvc = bookingStaffForLocation("shampooch-jvc").map((s) => s.id)
    expect(jvc).toContain("mariam")
    // Al Quoz only.
    expect(jvc).not.toContain("diana")
    expect(jvc.length).toBeLessThan(BOOKING_STAFF.length)
  })

  it("keeps someone who covers two branches on both", () => {
    for (const branch of ["shampooch-jvc", "shampooch-jumeirah"]) {
      expect(bookingStaffForLocation(branch).map((s) => s.id)).toContain("lena")
    }
  })

  it("leaves a business-wide surface with the whole roster", () => {
    expect(bookingStaffForLocation()).toBe(BOOKING_STAFF)
  })

  it("leaves no live branch without anyone to book", () => {
    for (const branch of ["shampooch-jvc", "shampooch-jumeirah", "shampooch-al-quoz"]) {
      expect(bookingStaffForLocation(branch).length).toBeGreaterThan(0)
    }
  })
})

describe("the seeded branches differ, which is the point", () => {
  it("gives JVC and Jumeirah different weeks and different slots", () => {
    const jvc = locationHours("shampooch-jvc")!
    const jumeirah = locationHours("shampooch-jumeirah")!

    expect(bookingDaysForLocation(jvc).find((d) => d.weekDay === "sun")?.closed).toBe(true)
    expect(
      bookingDaysForLocation(jumeirah).find((d) => d.weekDay === "sun")?.closed,
    ).toBeUndefined()

    const lastOf = (hours: WeekSchedule) => {
      const times = slotGroupsForLocation(hours, dayOf("fri")).flatMap((g) => g.times)
      return times[times.length - 1]?.time
    }
    expect(lastOf(jvc)).not.toBe(lastOf(jumeirah))
  })
})
