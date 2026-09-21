import { describe, expect, it } from "vitest"
import { packageCovers, packageFor } from "@/lib/service-catalog/client-packages"
import { eligibilityFor } from "@/lib/service-catalog/package-eligibility"

describe("a client's package, and what it is worth at the branch in front of you", () => {
  it("finds nothing for a client who holds none, and for no client at all", () => {
    expect(packageFor("nobody-in-particular")).toBeUndefined()
    expect(packageFor(undefined)).toBeUndefined()
  })

  it("keeps the terms the package was sold on, not today's price list", () => {
    // The whole reason a mismatch is possible: the branch may since have moved
    // its price, and the package still owes what it was sold against.
    const held = packageFor("abbey-mcdermaid")!
    expect(held.soldPriceMinor).toBe(12000)
    expect(held.soldAtLocationId).toBe("shampooch-jvc")
  })

  it("only covers the service it was sold against", () => {
    const held = packageFor("aaishah-vaza")!
    expect(packageCovers(held, "blow-dry")).toBe(true)
    expect(packageCovers(held, "deep-tissue")).toBe(false)
  })

  it("says nothing is wrong when the branch's terms match the sale", () => {
    const held = packageFor("aaishah-vaza")!
    const here = { offered: true, priceMinor: 12000, durationMin: 60 }
    expect(eligibilityFor(held.serviceId, held, here).verdict).toBe("covered")
  })

  it("still covers the client where the branch charges more", () => {
    // KC1.5: warn, never block. The redemption completes and the difference is
    // shown, because an operator works around a block by hand anyway.
    const held = packageFor("abbey-mcdermaid")!
    const dearer = { offered: true, priceMinor: 14500, durationMin: 60 }
    expect(eligibilityFor(held.serviceId, held, dearer).verdict).toBe("covered")
  })

  it("still covers the client where the branch does not run the service", () => {
    // The strongest form of the rule: "we don't do that here", and the client
    // is honoured anyway.
    const held = packageFor("abbie-connelly")!
    const absent = { offered: false, priceMinor: 0, durationMin: 0 }
    expect(eligibilityFor(held.serviceId, held, absent).verdict).toBe("covered")
  })

  it("stops covering once the sessions run out", () => {
    const held = packageFor("aaishah-vaza")!
    const here = { offered: true, priceMinor: 12000, durationMin: 60 }
    expect(eligibilityFor(held.serviceId, { ...held, remainingSessions: 0 }, here).verdict).toBe(
      "exhausted",
    )
  })
})
