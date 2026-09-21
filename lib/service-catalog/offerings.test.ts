import { describe, expect, it } from "vitest"

import {
  type LocationOffering,
  overrideCount,
  resetField,
  resolveOffering,
  type ServiceDefaults,
} from "@/lib/service-catalog/offerings"

/** Dog Wash, the example every requirement and story uses. */
const defaults: ServiceDefaults = { priceType: "Fixed", price: 60, duration: 45 }

function offering(overrides: LocationOffering["overrides"], enabled = true): LocationOffering {
  return { serviceId: "dog-wash", locationId: "jumeirah", enabled, overrides }
}

describe("resolveOffering", () => {
  it("gives an unconfigured branch the business values, and offers the service", () => {
    // A branch nobody has touched offers the business menu — that is what
    // makes adding branch N cost nothing (R02).
    const resolved = resolveOffering(defaults, undefined)
    expect(resolved).toMatchObject({ enabled: true, price: 60, duration: 45 })
    expect(resolved.source).toEqual({
      priceType: "business",
      price: "business",
      duration: "business",
    })
  })

  it("resolves the location value ahead of the business value, per field", () => {
    // INV-13 nearest-wins. Price is the branch's, duration still the
    // business's, and the source map says which is which (R06).
    const resolved = resolveOffering(defaults, offering({ price: 75 }))
    expect(resolved.price).toBe(75)
    expect(resolved.duration).toBe(45)
    expect(resolved.source.price).toBe("location")
    expect(resolved.source.duration).toBe("business")
  })

  it("treats a branch price of 0 as an override, not as absent", () => {
    // `??` rather than `||`: zero is a real price a branch can set, and
    // falling back to 60 here would charge a client for a comped wash.
    const resolved = resolveOffering(defaults, offering({ price: 0 }))
    expect(resolved.price).toBe(0)
    expect(resolved.source.price).toBe("location")
  })

  it("keeps a disabled branch out without touching its overrides", () => {
    // DW3.3: off at one branch, and the definition and other branches are
    // untouched. The override survives so re-enabling restores the decision.
    const resolved = resolveOffering(defaults, offering({ price: 75 }, false))
    expect(resolved.enabled).toBe(false)
    expect(resolved.price).toBe(75)
  })
})

describe("a business default change", () => {
  it("reaches inherited fields and leaves an overridden field alone", () => {
    // DW3.1, the whole point: raise the default to 65 / 50 and the branch that
    // deliberately charges 75 stays at 75, while its inherited duration
    // follows to 50.
    const branch = offering({ price: 75 })
    const before = resolveOffering(defaults, branch)
    expect(before).toMatchObject({ price: 75, duration: 45 })

    const raised: ServiceDefaults = { priceType: "Fixed", price: 65, duration: 50 }
    const after = resolveOffering(raised, branch)
    expect(after).toMatchObject({ price: 75, duration: 50 })
  })
})

describe("resetField", () => {
  it("reverts only the named field", () => {
    // DW3.2: "resetting one field reverts only that field".
    const branch = offering({ price: 75, duration: 60 })
    const reset = resetField(branch, "price")
    const resolved = resolveOffering(defaults, reset)
    expect(resolved.price).toBe(60)
    expect(resolved.duration).toBe(60)
    expect(resolved.source).toMatchObject({ price: "business", duration: "location" })
  })

  it("restores inheriting rather than freezing today's default", () => {
    // The difference between inheriting and coincidentally matching: after a
    // reset the branch has to follow the next default change too.
    const reset = resetField(offering({ price: 75 }), "price")
    const raised: ServiceDefaults = { priceType: "Fixed", price: 65, duration: 45 }
    expect(resolveOffering(raised, reset).price).toBe(65)
  })

  it("is a no-op on a field that was already inherited", () => {
    const branch = offering({ price: 75 })
    expect(resetField(branch, "duration")).toEqual(branch)
  })
})

describe("overrideCount", () => {
  it("counts only deliberate differences", () => {
    expect(overrideCount(undefined)).toBe(0)
    expect(overrideCount(offering({}))).toBe(0)
    expect(overrideCount(offering({ price: 75 }))).toBe(1)
    expect(overrideCount(offering({ price: 75, duration: 60 }))).toBe(2)
  })

  it("does not count a field cleared back to inheriting", () => {
    expect(overrideCount(resetField(offering({ price: 75 }), "price"))).toBe(0)
  })
})
