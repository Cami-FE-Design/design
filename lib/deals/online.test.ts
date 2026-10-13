import { describe, expect, it } from "vitest"

import { bookingPromoLines, resolveBooking } from "@/lib/booking"
import { MOCK_DEALS } from "@/lib/deals/mock"
import {
  type BookingPromoContext,
  branchTakesCodes,
  dealsForBranch,
  evaluateBookingCode,
} from "@/lib/deals/online"
import { getPublicBusiness } from "@/lib/public-business"

const TODAY = "2026-08-24"
const JVC = "shampooch-jvc"

function ctx(serviceIds: string[], overrides: Partial<BookingPromoContext> = {}) {
  return {
    deals: MOCK_DEALS,
    locationId: JVC,
    locationName: "Shampooch JVC",
    todayIso: TODAY,
    lines: bookingPromoLines(serviceIds),
    clientHasRedeemed: () => false,
    ...overrides,
  }
}

function refusal(code: string, serviceIds: string[], overrides?: Partial<BookingPromoContext>) {
  const result = evaluateBookingCode(code, ctx(serviceIds, overrides))
  if (result.ok) throw new Error(`${code} applied`)
  return result.refusal
}

describe("evaluateBookingCode", () => {
  it("takes a percentage off every line it covers, ignoring case", () => {
    const result = evaluateBookingCode(" welcome15 ", ctx(["full-groom", "nail-trim"]))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // 15% of AED 260 and of AED 35, per line.
    expect(result.promo.lineDiscounts).toEqual({ "full-groom": 3900, "nail-trim": 525 })
    expect(result.promo.discountMinor).toBe(4425)
    expect(result.promo.code).toBe("WELCOME15")
  })

  it("covers only the services in its scope, and says how many", () => {
    const result = evaluateBookingCode("SPA20", ctx(["full-groom", "teeth"]))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.promo.lineDiscounts).toEqual({ teeth: 800 })
    expect(result.promo.coveredLines).toBe(1)
    expect(result.promo.totalLines).toBe(2)
  })

  it("never discounts a combo", () => {
    expect(refusal("WELCOME15", ["groom-and-nails-combo"]).kind).toBe("combo-only")
    // Alongside a plain service, the combo's lines are simply left out.
    const result = evaluateBookingCode("WELCOME15", ctx(["groom-and-nails-combo", "teeth"]))
    expect(result.ok && Object.keys(result.promo.lineDiscounts)).toEqual(["teeth"])
  })

  it("counts minimum spend on the lines it covers, before the discount", () => {
    const short = refusal("GROOM50", ["full-groom", "nail-trim"])
    expect(short.kind).toBe("minimum-spend")
    expect(short.detail).toBe("AED 40.00 more to go.")
    expect(evaluateBookingCode("GROOM50", ctx(["full-groom", "breed-cut"])).ok).toBe(true)
  })

  it("caps a 100% code at the line, leaving an AED 0 booking", () => {
    const result = evaluateBookingCode("NAILFREE", ctx(["nail-trim"]))
    expect(result.ok && result.promo.discountMinor).toBe(3500)
  })

  it("shares a fixed amount across the lines it covers and never more", () => {
    const result = evaluateBookingCode("GROOM50", ctx(["full-groom", "breed-cut"]))
    if (!result.ok) throw new Error("refused")
    expect(result.promo.discountMinor).toBe(5000)
    expect(
      result.promo.lineDiscounts["full-groom"]! + result.promo.lineDiscounts["breed-cut"]!,
    ).toBe(5000)
  })

  it("does not find a code the team keeps for the till", () => {
    expect(refusal("TEACH10", ["full-groom"]).kind).toBe("not-found")
    expect(refusal("NOPE", ["full-groom"]).kind).toBe("not-found")
  })

  it("names each reason a real code is refused", () => {
    expect(refusal("JULY10", ["full-groom"]).message).toBe("This code expired on 31 Jul 2026.")
    expect(refusal("FRIEND25", ["full-groom"]).kind).toBe("inactive")
    expect(refusal("FIRST50", ["full-groom"]).kind).toBe("fully-redeemed")
    expect(refusal("ALQUOZ30", ["full-groom"]).message).toBe(
      "This code can't be used at Shampooch JVC.",
    )
    expect(
      refusal("WELCOME15", ["full-groom"], { clientHasRedeemed: (id) => id === "welcome-online" })
        .kind,
    ).toBe("already-used")
  })

  it("refuses a code that starts later", () => {
    expect(refusal("WELCOME15", ["full-groom"], { todayIso: "2026-07-15" }).kind).toBe("scheduled")
  })
})

describe("which branches see codes", () => {
  it("keeps Shampooch's promotions to Shampooch's branches", () => {
    expect(dealsForBranch(MOCK_DEALS, JVC)).toHaveLength(MOCK_DEALS.length)
    expect(dealsForBranch(MOCK_DEALS, "purr-palace")).toEqual([])
    expect(dealsForBranch(MOCK_DEALS, undefined)).toEqual([])
  })

  it("offers the field only where a code could apply today", () => {
    expect(branchTakesCodes(MOCK_DEALS, JVC, TODAY)).toBe(true)
    expect(
      branchTakesCodes(
        MOCK_DEALS.filter((d) => d.discountCode === "TEACH10"),
        JVC,
        TODAY,
      ),
    ).toBe(false)
  })
})

describe("a booking made with a code", () => {
  it("carries the code to Manage booking, and only on a branch that runs it", () => {
    const jvc = getPublicBusiness("shampooch-jvc")!
    expect(resolveBooking(jvc, "CAMI-3208-promo").promo).toEqual({
      code: "WELCOME15",
      name: "Welcome offer",
      discountMinor: 3900,
    })
    expect(resolveBooking(jvc, "CAMI-3208").promo).toBeUndefined()
    expect(
      resolveBooking(getPublicBusiness("purr-palace")!, "CAMI-3208-promo").promo,
    ).toBeUndefined()
  })
})
