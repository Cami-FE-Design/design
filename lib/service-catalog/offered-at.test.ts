import { describe, expect, it } from "vitest"
import {
  isOfferedAt,
  type LocationOffering,
  locationsOffering,
} from "@/lib/service-catalog/offerings"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"
const MIRDIF = "shampooch-mirdif"

const OFFERINGS: LocationOffering[] = [
  { serviceId: "dog-wash", locationId: JVC, enabled: true, overrides: {} },
  // Turned off deliberately — the branch has no groomer for it.
  { serviceId: "dog-wash", locationId: JUMEIRAH, enabled: false, overrides: {} },
]

describe("isOfferedAt", () => {
  it("reads a branch that has turned the service off", () => {
    expect(isOfferedAt("dog-wash", JUMEIRAH, OFFERINGS)).toBe(false)
  })

  it("offers the business menu where nothing has been configured", () => {
    // Adding branch N must cost nothing (R02): an untouched branch runs the
    // business menu rather than starting empty and waiting to be filled in.
    expect(isOfferedAt("dog-wash", MIRDIF, OFFERINGS)).toBe(true)
    expect(isOfferedAt("a-service-nobody-configured", MIRDIF, OFFERINGS)).toBe(true)
  })

  it("keeps an explicit yes distinct from an absent record", () => {
    expect(isOfferedAt("dog-wash", JVC, OFFERINGS)).toBe(true)
  })
})

describe("locationsOffering", () => {
  it("names the branches that do offer it, for the sentence reception needs", () => {
    expect(locationsOffering("dog-wash", [JVC, JUMEIRAH, MIRDIF], OFFERINGS)).toEqual([JVC, MIRDIF])
  })

  it("is empty when nobody in the given set offers it", () => {
    // Worth saying differently from "not here" — there is no branch to send
    // the client to, so the answer is that the business does not do it.
    expect(locationsOffering("dog-wash", [JUMEIRAH], OFFERINGS)).toEqual([])
  })

  it("only ever answers within the branches it was given", () => {
    // Bounded by the caller's grant (R18): a receptionist must not learn what
    // a branch they cannot see does or does not run.
    expect(locationsOffering("dog-wash", [JVC], OFFERINGS)).toEqual([JVC])
  })
})
