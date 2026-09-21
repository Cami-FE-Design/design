import { describe, expect, it } from "vitest"

import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import {
  describeScope,
  fromAvailability,
  isRunnable,
  type PromotionScope,
  reaches,
  runsAt,
} from "@/lib/locations/promotion-scope"

/**
 * Where a promotion runs (DW3.4, R04, R24).
 *
 * The assertions that matter are all about the empty list. The dev repo's
 * mapper reads `allVenues: true` as `locationIds: []`, so there empty means
 * *all*; R24 says an empty scope never resolves to all, and SU2.2 is an entire
 * story about somebody with no branches seeing nothing. One shape, two opposite
 * readings, in one product — which is how a promotion for one branch runs at
 * nine, and a chain-wide one runs nowhere.
 */

const ids = NINE_BRANCH_ESTATE.map((l) => l.id)
const JVC = "shampooch-jvc"
const JUM = "shampooch-jumeirah"

const estate: PromotionScope = { kind: "estate" }
const two: PromotionScope = { kind: "branches", locationIds: [JVC, JUM] }
const none: PromotionScope = { kind: "branches", locationIds: [] }

describe("an empty branch list is not 'everywhere'", () => {
  it("refuses to run, rather than quietly covering the chain", () => {
    expect(isRunnable(none)).toBe(false)
    expect(runsAt(none, JVC)).toBe(false)
  })

  it("says so in words, so a form can stop it being saved", () => {
    expect(describeScope(none, (id) => id)).toBe("No locations — this cannot run")
  })

  it("reads the dev repo's shape without inheriting its ambiguity", () => {
    // allVenues decides; the list is only consulted when it does not.
    expect(fromAvailability({ allVenues: true, venues: [] })).toEqual({ kind: "estate" })
    expect(fromAvailability({ allVenues: true, venues: [JVC] })).toEqual({ kind: "estate" })
    // The case that matters: not-all with nothing chosen stays not-all.
    expect(fromAvailability({ allVenues: false, venues: [] })).toEqual({
      kind: "branches",
      locationIds: [],
    })
    expect(isRunnable(fromAvailability({ allVenues: false, venues: [] }))).toBe(false)
  })
})

describe("the chain-wide case is named, not enumerated", () => {
  it("runs at a branch that did not exist when it was made", () => {
    // "All locations" and "the nine that exist today" are different promises,
    // and only the first survives a tenth branch opening.
    expect(runsAt(estate, "shampooch-branch-ten")).toBe(true)
    expect(runsAt(two, "shampooch-branch-ten")).toBe(false)
  })

  it("reads as a set rather than a count", () => {
    expect(describeScope(estate, (id) => id)).toBe("All locations")
  })
})

describe("a local offer stays local", () => {
  it("runs only where it was scoped", () => {
    expect(runsAt(two, JVC)).toBe(true)
    expect(runsAt(two, "shampooch-mirdif")).toBe(false)
  })

  it("names one or two branches and counts beyond that", () => {
    const name = (id: string) => NINE_BRANCH_ESTATE.find((l) => l.id === id)?.name ?? id
    expect(describeScope({ kind: "branches", locationIds: [JVC] }, name)).toBe("Shampooch JVC")
    expect(describeScope(two, name)).toBe("Shampooch JVC and Shampooch Jumeirah")
    expect(describeScope({ kind: "branches", locationIds: ids }, name)).toBe("9 locations")
  })
})

describe("what a reader is told it reaches is bounded by their grant (R18)", () => {
  const oneBranch = NINE_BRANCH_ESTATE.filter((l) => l.id === JVC)

  it("does not tell a one-branch manager about the other eight", () => {
    expect(reaches(estate, oneBranch).map((l) => l.id)).toEqual([JVC])
  })

  it("gives an owner the whole estate", () => {
    expect(reaches(estate, NINE_BRANCH_ESTATE).length).toBe(NINE_BRANCH_ESTATE.length)
  })

  it("never widens a local offer to a branch the reader holds but it does not cover", () => {
    expect(reaches({ kind: "branches", locationIds: [JUM] }, oneBranch)).toEqual([])
  })
})
