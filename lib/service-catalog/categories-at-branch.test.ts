import { describe, expect, it } from "vitest"

import {
  categoryServicesAtBranch,
  emptyCategoriesAtBranch,
  servicesAtBranch,
} from "@/lib/service-catalog/categories-at-branch"
import type { LocationOffering } from "@/lib/service-catalog/offerings"

/**
 * GNK §4: one category list for the whole business, and "a branch sees, inside
 * each category, only the services it has turned on".
 *
 * The case the rule creates, and the one their document asks about: a category
 * with three services, all three off at one branch.
 */

const SERVICES = [
  { id: "spa-1", categoryId: "spa" },
  { id: "spa-2", categoryId: "spa" },
  { id: "spa-3", categoryId: "spa" },
  { id: "bath-small", categoryId: "grooming" },
]

const CATEGORIES = ["spa", "grooming", "retail"]

/** JBR has no spa room, so all three are off there. */
const OFFERINGS: LocationOffering[] = ["spa-1", "spa-2", "spa-3"].map((serviceId) => ({
  serviceId,
  locationId: "jbr",
  enabled: false,
  overrides: {},
}))

describe("what a branch offers", () => {
  it("runs the whole business menu at a branch nobody has configured", () => {
    // Unconfigured means offered, which is what makes adding branch N cost
    // nothing — the opposite default would make every new branch sell nothing.
    expect(servicesAtBranch(SERVICES, "marina", OFFERINGS)).toHaveLength(4)
  })

  it("drops the ones this branch turned off", () => {
    expect(servicesAtBranch(SERVICES, "jbr", OFFERINGS).map((s) => s.id)).toEqual(["bath-small"])
  })
})

describe("a category at one branch", () => {
  it("holds what that branch offers inside it", () => {
    expect(categoryServicesAtBranch(SERVICES, "spa", "marina", OFFERINGS)).toHaveLength(3)
  })

  it("can hold nothing, which is the case GNK asks about", () => {
    expect(categoryServicesAtBranch(SERVICES, "spa", "jbr", OFFERINGS)).toHaveLength(0)
  })
})

describe("which categories a branch has emptied", () => {
  it("names the one it emptied, not counts them", () => {
    expect(emptyCategoriesAtBranch(SERVICES, CATEGORIES, "jbr", OFFERINGS)).toEqual(["spa"])
  })

  it("names none where nothing was turned off", () => {
    expect(emptyCategoriesAtBranch(SERVICES, CATEGORIES, "marina", OFFERINGS)).toEqual([])
  })

  it("leaves out a category that is empty for everyone", () => {
    // "Retail" has no services at all. That is a catalog to tidy, not a branch
    // that turned something off, and reporting it as the second sends an owner
    // looking for a switch nobody flipped.
    expect(emptyCategoriesAtBranch(SERVICES, CATEGORIES, "jbr", OFFERINGS)).not.toContain("retail")
  })
})
