import { describe, expect, it } from "vitest"

import type { MockBooking } from "@/app/appointments/mock"
import {
  bookingsInScope,
  calendarWriteTarget,
  countsByLocation,
} from "@/lib/locations/calendar-scope"

let seq = 0
function booking(locationId: string, durationMin = 60): MockBooking {
  seq += 1
  return {
    id: `b-${seq}`,
    staffId: "aya-hassan",
    start: "10:00",
    durationMin,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full groom",
    clientName: "Karen Dougall",
    priceMinor: 12_000,
    locationId,
  }
}

describe("bookingsInScope", () => {
  it("keeps only the branches in scope", () => {
    const bookings = [booking("jvc"), booking("jumeirah"), booking("jvc")]
    expect(bookingsInScope(bookings, ["jvc"])).toHaveLength(2)
    expect(bookingsInScope(bookings, ["jvc", "jumeirah"])).toHaveLength(3)
  })

  it("returns nothing for an empty scope rather than everything", () => {
    // The R24 failure mode in miniature: an empty scope must never widen.
    expect(bookingsInScope([booking("jvc")], [])).toEqual([])
  })
})

describe("countsByLocation", () => {
  it("counts appointments and booked minutes per branch", () => {
    const bookings = [booking("jvc", 60), booking("jvc", 30), booking("jumeirah", 45)]
    const counts = countsByLocation(bookings, ["jvc", "jumeirah"])
    expect(counts).toEqual([
      { locationId: "jvc", bookings: 2, bookedMinutes: 90 },
      { locationId: "jumeirah", bookings: 1, bookedMinutes: 45 },
    ])
  })

  it("keeps a branch with an empty day", () => {
    // An empty day is information. Dropping the row makes it look like the
    // branch is missing from the view instead of quiet.
    const counts = countsByLocation([booking("jvc")], ["jvc", "al-quoz"])
    expect(counts.map((c) => c.locationId)).toEqual(["jvc", "al-quoz"])
    expect(counts[1]).toEqual({ locationId: "al-quoz", bookings: 0, bookedMinutes: 0 })
  })

  it("follows the scope order, so the strip does not reshuffle", () => {
    const counts = countsByLocation([], ["jumeirah", "jvc"])
    expect(counts.map((c) => c.locationId)).toEqual(["jumeirah", "jvc"])
  })
})

describe("calendarWriteTarget", () => {
  it("names the branch a new booking would land on when the scope is one", () => {
    expect(calendarWriteTarget(["jvc"])).toEqual({ canWrite: true, locationId: "jvc" })
  })

  it("refuses to pick a branch when the scope spans several", () => {
    // R11: all-locations is read only, and the view must not resolve a target
    // by picking whichever branch happens to be first.
    expect(calendarWriteTarget(["jvc", "jumeirah"])).toEqual({
      canWrite: false,
      reason: "needsOneLocation",
    })
  })

  it("refuses on an empty scope too", () => {
    expect(calendarWriteTarget([])).toEqual({ canWrite: false, reason: "needsOneLocation" })
  })
})
