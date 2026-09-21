import { describe, expect, it } from "vitest"

import { locationContact, NINE_BRANCH_ESTATE, publicLabel } from "@/lib/locations/mock"

describe("locationContact — the public name (D3)", () => {
  it("uses the area when that is what the branch is called", () => {
    // The ordinary case, and why district was the whole rule to begin with.
    expect(locationContact("shampooch-jvc")?.name).toBe("JVC")
  })

  it("uses the branch's own public name when the area is not its label", () => {
    // Chaps & Co's real shape: a branch inside a mall is called by the mall.
    // Deriving from the district would render this "Shampooch Downtown Dubai".
    const mall = NINE_BRANCH_ESTATE.find((l) => l.publicName === "The Dubai Mall")
    expect(mall).toBeDefined()
    // The district is a real and different fact, which is the point.
    expect(mall?.location.district).toBe("Downtown Dubai")
    expect(publicLabel(mall!)).toBe("The Dubai Mall")
  })

  it("never uses the operator-facing name, which carries the brand", () => {
    // The page composes the brand back on, so "Shampooch JVC" would read
    // "Shampooch Shampooch JVC".
    expect(locationContact("shampooch-jvc")?.name).not.toContain("Shampooch")
  })
})
