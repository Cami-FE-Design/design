import { describe, expect, it } from "vitest"

import { isUnassigned, machinesForSale, merchantMachines } from "@/lib/terminals/at-checkout"
import { DEMO_TERMINALS, UNASSIGNED_DEMO_TERMINAL } from "@/lib/terminals/store"

/**
 * A card machine with no location at checkout. At a single-location business
 * it is that location's machine; a chain never offers it, because its payments
 * would be booked at no location.
 */

const estate = [UNASSIGNED_DEMO_TERMINAL, ...DEMO_TERMINALS]

describe("a card machine with no location at checkout", () => {
  it("is what the demo's no-location machine is", () => {
    expect(isUnassigned(UNASSIGNED_DEMO_TERMINAL)).toBe(true)
    expect(DEMO_TERMINALS.some(isUnassigned)).toBe(false)
  })

  it("is offered at a single-location business, which is unchanged", () => {
    expect(machinesForSale(estate, null, false)).toEqual(estate)
    expect(machinesForSale(estate, "shampooch-jvc", false)).toEqual(estate)
  })

  it("is not offered to a chain's sale at a named location", () => {
    const offered = machinesForSale(estate, "shampooch-jvc", true)
    expect(offered.length).toBeGreaterThan(0)
    expect(offered.every((t) => t.locationId === "shampooch-jvc")).toBe(true)
  })

  it("is not offered to a chain before the sale names its location", () => {
    const offered = machinesForSale(estate, null, true)
    expect(offered).not.toContain(UNASSIGNED_DEMO_TERMINAL)
    expect(offered).toHaveLength(DEMO_TERMINALS.length)
  })

  it("is not offered to a chain in the moved-machine review state either", () => {
    const offered = machinesForSale(estate, "shampooch-jvc", true, { keepPlaced: true })
    expect(offered).not.toContain(UNASSIGNED_DEMO_TERMINAL)
    // That state keeps machines from other locations on purpose.
    expect(offered).toHaveLength(DEMO_TERMINALS.length)
  })

  it("is offered to a chain once it has a location", () => {
    const placed = { ...UNASSIGNED_DEMO_TERMINAL, locationId: "shampooch-jvc" }
    expect(machinesForSale([placed], "shampooch-jvc", true)).toEqual([placed])
  })
})

describe("the machines a merchant has", () => {
  it("counts machines at a held location and machines with no location", () => {
    const held = ["shampooch-jvc"]
    const mine = merchantMachines(estate, held)
    expect(mine).toContain(UNASSIGNED_DEMO_TERMINAL)
    expect(
      mine.filter((t) => !isUnassigned(t)).every((t) => t.locationId === "shampooch-jvc"),
    ).toBe(true)
  })

  it("is not empty for a store holding only no-location machines", () => {
    expect(merchantMachines([UNASSIGNED_DEMO_TERMINAL], ["shampooch-jvc"])).toEqual([
      UNASSIGNED_DEMO_TERMINAL,
    ])
  })

  it("leaves out machines at a location the person does not hold", () => {
    expect(merchantMachines(DEMO_TERMINALS, ["nowhere"])).toEqual([])
  })
})
