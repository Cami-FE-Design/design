import { describe, expect, it } from "vitest"
import { cardIconsFor, fitCardIcons } from "@/lib/appointments/card-icons"
import type { MockBooking } from "@/lib/appointments/mock"

const base: MockBooking = {
  id: "t-1",
  staffId: "demo",
  locationId: "shampooch-jvc",
  start: "10:00",
  durationMin: 15,
  status: "booked",
  serviceCategory: "grooming",
  serviceName: "Nails Clip",
  clientName: "Tom Cassidy",
  priceMinor: 3000,
}

describe("cardIconsFor", () => {
  it("shows nothing for a plain booked appointment", () => {
    expect(cardIconsFor(base, { hasNote: false })).toEqual([])
  })

  it("shows payment and source together: they answer different questions", () => {
    const booking = { ...base, bookedOnline: true, saleStatus: "partially_paid" as const }
    expect(cardIconsFor(booking, { hasNote: false })).toEqual(["sale-partial", "online"])
  })

  it("lets the sale replace the deposit, never both", () => {
    expect(cardIconsFor({ ...base, hasDeposit: true }, { hasNote: false })).toEqual(["deposit"])
    expect(
      cardIconsFor({ ...base, hasDeposit: true, saleStatus: "paid" }, { hasNote: false }),
    ).toEqual(["sale-paid"])
  })

  it("puts the status last, since the card colour already says it", () => {
    const booking = {
      ...base,
      status: "confirmed" as const,
      requestedStaff: true,
      needsPickup: true,
      packageRedeemed: true,
    }
    expect(cardIconsFor(booking, { hasNote: true })).toEqual([
      "requested",
      "pickup",
      "note",
      "package",
      "confirmed",
    ])
  })

  it("gives booked and completed no status icon", () => {
    expect(cardIconsFor({ ...base, status: "completed" }, { hasNote: false })).toEqual([])
    expect(
      cardIconsFor({ ...base, status: "completed", saleStatus: "paid" }, { hasNote: false }),
    ).toEqual(["sale-paid"])
  })
})

describe("fitCardIcons", () => {
  it("shows every icon when there is room", () => {
    expect(fitCardIcons(3, 5)).toEqual({ shown: 3, more: 0 })
  })

  it("keeps one space for the count when icons overflow", () => {
    expect(fitCardIcons(5, 3)).toEqual({ shown: 2, more: 3 })
  })

  it("shows only the first icon when there is room for one", () => {
    expect(fitCardIcons(4, 1)).toEqual({ shown: 1, more: 0 })
  })

  it("shows nothing when there is no room", () => {
    expect(fitCardIcons(4, 0)).toEqual({ shown: 0, more: 0 })
  })
})
