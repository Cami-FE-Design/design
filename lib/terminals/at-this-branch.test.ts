import { describe, expect, it } from "vitest"

import { DEMO_TERMINALS, TYPICAL_TERMINALS } from "@/lib/terminals/store"

/**
 * A sale is offered only the card machines of the branch it names.
 *
 * GNK's §15 states both halves: a card payment is recorded against the branch
 * its machine belongs to, and at checkout staff see only that branch's
 * machines. The first without the second is how money lands at the wrong
 * branch — not through an error, but correctly, by the machine's own rule,
 * while everything on screen looks right. GP1.4 and G7 both depend on it.
 *
 * The filter itself lives in the cart (`cart-flow.tsx`); this asserts the thing
 * it filters on, so a seed that lost its `locationId` fails here rather than in
 * a money report nobody is reading yet.
 */

function machinesAt(locationId: string) {
  return DEMO_TERMINALS.filter((t) => t.locationId === locationId)
}

describe("a card machine belongs to one branch", () => {
  it("names a branch on every registered machine", () => {
    expect(DEMO_TERMINALS.length).toBeGreaterThan(0)
    expect(DEMO_TERMINALS.every((t) => t.locationId.length > 0)).toBe(true)
  })

  it("keeps the estate's machines apart, so scoping them is possible at all", () => {
    const branches = new Set(DEMO_TERMINALS.map((t) => t.locationId))
    expect(branches.size).toBeGreaterThan(1)
  })

  it("holds the single-site demo set at one branch, which is why a chain cannot use it", () => {
    // TYPICAL_TERMINALS is two registers at ONE branch on purpose. Scoped, it
    // would leave every other branch of a chain with no machine — so the cart
    // falls back to the estate-wide set when the business has branches.
    expect(new Set(TYPICAL_TERMINALS.map((t) => t.locationId)).size).toBe(1)
  })

  it("offers a branch its own machines and none of its sister's", () => {
    const jvc = machinesAt("shampooch-jvc")
    expect(jvc.length).toBeGreaterThan(0)
    expect(jvc.every((t) => t.locationId === "shampooch-jvc")).toBe(true)
  })

  it("offers nothing at a branch with no machine of its own", () => {
    // Rather than falling back to another branch's register, which is the
    // failure this whole rule exists to prevent.
    expect(machinesAt("shampooch-al-quoz")).toEqual([])
  })
})
