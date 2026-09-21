import { describe, expect, it } from "vitest"
import { idsWithin, locationsForBusiness } from "@/lib/locations/from-business"
import { getPublicBusinessBySlug } from "@/lib/public-business"

const shampooch = getPublicBusinessBySlug("shampooch")!
const sota = getPublicBusinessBySlug("sota")!
const purrPalace = getPublicBusinessBySlug("purr-palace")!

describe("locationsForBusiness", () => {
  it("gives each business its own branches, and nobody else's", () => {
    // The whole point: signing into Sota must not leave Shampooch's estate on
    // screen under a Sota heading.
    const sotaIds = locationsForBusiness(sota).map((l) => l.id)
    const shampoochIds = locationsForBusiness(shampooch).map((l) => l.id)
    expect(sotaIds.some((id) => shampoochIds.includes(id))).toBe(false)
  })

  it("uses the authored estate where there is one", () => {
    const estate = locationsForBusiness(shampooch)
    const alQuoz = estate.find((l) => l.id === "shampooch-al-quoz")
    // Suspended, a timezone override, a mall's public name — facts no public
    // record carries and no rule could invent.
    expect(alQuoz?.status).toBe("suspended")
    expect(estate.find((l) => l.id === "shampooch-al-majaz")?.timezone).toBeTruthy()
    expect(estate.find((l) => l.id === "shampooch-downtown-dubai")?.publicName).toBe(
      "The Dubai Mall",
    )
  })

  it("derives an estate for a business nobody authored one for", () => {
    const [marina] = locationsForBusiness(sota)
    expect(marina?.id).toBe("sota")
    // The business, then what tells its branches apart — how every other
    // estate in this repo reads.
    expect(marina?.name).toBe("Sota Dubai Marina")
    expect(marina?.status).toBe("live")
  })

  it("takes from the business exactly what a branch never carries", () => {
    const [marina] = locationsForBusiness(sota)
    expect(marina?.email).toBe(sota.email)
    expect(marina?.invoicing.companyName).toBe(sota.businessName)
    expect(marina?.businessType).toEqual([...sota.categories])
  })

  it("leaves the timezone unset, so a derived branch inherits (R19)", () => {
    // Writing today's business default would freeze the branch at it: the
    // business moves and this one silently does not.
    expect(locationsForBusiness(sota)[0]?.timezone).toBeUndefined()
  })

  it("never invents a map pin", () => {
    // A plausible pin on the wrong building is worse than an empty map — the
    // address still reads either way.
    expect(locationsForBusiness(sota)[0]?.mapPin).toBeNull()
  })

  it("reads an unpublished branch as paused, not archived", () => {
    // A branch kept off the public surfaces is still trading for the operator;
    // archived is the end of a branch's life (R12, SU1.5).
    const derived = locationsForBusiness({
      ...sota,
      branches: [{ id: "x", slug: "x", name: "Somewhere", isPublished: false }],
    })
    expect(derived[0]?.status).toBe("suspended")
  })

  it("holds for a single-branch business without a special case", () => {
    expect(locationsForBusiness(purrPalace)).toHaveLength(1)
  })
})

describe("idsWithin", () => {
  it("drops ids belonging to a business you have left", () => {
    // A scope pointing at shampooch-jvc while signed into Sota empties every
    // screen, and nothing on them says why.
    const estate = locationsForBusiness(sota)
    expect(idsWithin(estate, ["shampooch-jvc", "sota"])).toEqual(["sota"])
  })

  it("keeps what still resolves, rather than clearing on any mismatch", () => {
    // So switching away and back leaves the session's scope where it was.
    const estate = locationsForBusiness(shampooch)
    expect(idsWithin(estate, ["shampooch-jvc", "shampooch-jumeirah"])).toHaveLength(2)
  })

  it("is empty when nothing survives", () => {
    expect(idsWithin(locationsForBusiness(sota), ["shampooch-jvc"])).toEqual([])
  })
})
