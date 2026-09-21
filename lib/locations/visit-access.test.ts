import { describe, expect, it } from "vitest"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import type { Location } from "@/lib/locations/types"
import {
  branchSpread,
  grantCovers,
  spansBranches,
  visitWriteBlock,
  visitWriteBlockMessage,
} from "@/lib/locations/visit-access"

const byId = (id: string): Location | undefined => NINE_BRANCH_ESTATE.find((l) => l.id === id)

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"
/** Seeded `suspended`, which is what an operator reads as "paused". */
const AL_QUOZ = "shampooch-al-quoz"

describe("grantCovers", () => {
  it("treats 'all' as every branch, including ones added later", () => {
    expect(grantCovers("all", JVC)).toBe(true)
    expect(grantCovers("all", "a-branch-nobody-has-created-yet")).toBe(true)
  })

  it("reads a named set as exactly itself", () => {
    expect(grantCovers([JVC], JVC)).toBe(true)
    expect(grantCovers([JVC], JUMEIRAH)).toBe(false)
  })

  it("never lets an empty grant mean all (R24)", () => {
    expect(grantCovers([], JVC)).toBe(false)
  })
})

describe("visitWriteBlock", () => {
  it("allows writes at a live branch the reader holds", () => {
    expect(visitWriteBlock(byId(JVC), "all", JVC)).toBeNull()
    expect(visitWriteBlock(byId(JVC), [JVC], JVC)).toBeNull()
  })

  it("blocks writes at a branch the reader does not hold, and reads stay open", () => {
    // The point of SCR-07: the row is still rendered, only the actions go.
    expect(visitWriteBlock(byId(JUMEIRAH), [JVC], JUMEIRAH)).toBe("not-granted")
  })

  it("puts the missing grant ahead of the branch's own state", () => {
    // Al Quoz is suspended *and* ungranted here. Saying "paused" would hand a
    // fact about a branch to somebody with no access to it (BG-06).
    expect(visitWriteBlock(byId(AL_QUOZ), [JVC], AL_QUOZ)).toBe("not-granted")
  })

  it("blocks writes at a paused branch the reader does hold (R12)", () => {
    expect(visitWriteBlock(byId(AL_QUOZ), "all", AL_QUOZ)).toBe("suspended")
  })

  it("blocks writes at an archived branch", () => {
    const archived = { ...byId(JUMEIRAH)!, status: "archived" as const }
    expect(visitWriteBlock(archived, "all", JUMEIRAH)).toBe("archived")
  })

  it("keeps a visit whose branch the estate no longer lists", () => {
    // Dropping the row would silently shorten a client's history; the visit
    // happened whatever became of the branch.
    expect(visitWriteBlock(undefined, "all", "shampooch-closed-long-ago")).toBe("unknown-branch")
  })
})

describe("visitWriteBlockMessage", () => {
  it("names the branch, so the reader knows which access is missing", () => {
    expect(visitWriteBlockMessage("not-granted", "Shampooch Jumeirah")).toContain(
      "Shampooch Jumeirah",
    )
  })

  it("tells the reader who can fix it, only when anybody can", () => {
    expect(visitWriteBlockMessage("not-granted", "Shampooch Jumeirah")).toContain("owner")
    // Asking for access to an archived branch would be advice that leads nowhere.
    expect(visitWriteBlockMessage("archived", "Shampooch Jumeirah")).not.toContain("owner")
  })
})

describe("branchSpread", () => {
  it("counts visits per branch, commonest first", () => {
    expect(
      branchSpread([
        { locationId: JVC },
        { locationId: JUMEIRAH },
        { locationId: JVC },
        { locationId: JVC },
      ]),
    ).toEqual([
      { locationId: JVC, count: 3 },
      { locationId: JUMEIRAH, count: 1 },
    ])
  })

  it("keeps ties in the order they arrived, so a spread does not reshuffle", () => {
    expect(branchSpread([{ locationId: JUMEIRAH }, { locationId: JVC }])).toEqual([
      { locationId: JUMEIRAH, count: 1 },
      { locationId: JVC, count: 1 },
    ])
  })

  it("is empty for a client with no visits", () => {
    expect(branchSpread([])).toEqual([])
  })
})

describe("spansBranches", () => {
  it("is false for a client who has only ever used one branch", () => {
    // A chain's client can still have a single-branch history, and a branch
    // stamped on every row of one would be a column of one repeated word.
    expect(spansBranches([{ locationId: JVC }, { locationId: JVC }])).toBe(false)
  })

  it("is true as soon as a second branch appears", () => {
    expect(spansBranches([{ locationId: JVC }, { locationId: JUMEIRAH }])).toBe(true)
  })

  it("is false with no visits at all", () => {
    expect(spansBranches([])).toBe(false)
  })
})
