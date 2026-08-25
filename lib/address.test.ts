// Pins the one-way trip from the address record to document lines.
//
// These lines are printed on tax invoices, so the interesting cases are the ones
// where a naive join produces something that reads as a software bug.

import { describe, expect, it } from "vitest"
import { addressToLine, addressToLines, EMPTY_ADDRESS, isAddressEmpty } from "./address"

const DUBAI = {
  line: "Regina Tower, Jumeirah Village Circle\nAl Barsha South\nDubai",
  postcode: "",
  country: "United Arab Emirates",
}

describe("addressToLines", () => {
  it("keeps each entered row as its own document line", () => {
    expect(addressToLines(DUBAI)).toEqual([
      "Regina Tower, Jumeirah Village Circle",
      "Al Barsha South",
      "Dubai",
      "United Arab Emirates",
    ])
  })

  it("appends the country, which the form never asks for", () => {
    // It comes from Business details. The document still has to name it.
    expect(addressToLines({ line: "Regina Tower", postcode: "", country: "Saudi Arabia" })).toEqual(
      ["Regina Tower", "Saudi Arabia"],
    )
  })

  it("emits no empty line for a blank row the merchant left in", () => {
    // A gap in the middle of an invoice's issuer block reads as a rendering
    // fault. Trailing newlines are the normal way a textarea ends up with one.
    const lines = addressToLines({ ...DUBAI, line: "Regina Tower\n\n\nDubai\n" })
    expect(lines.every((l) => l.length > 0)).toBe(true)
    expect(lines).toEqual(["Regina Tower", "Dubai", "United Arab Emirates"])
  })

  it("returns nothing renderable for an empty address", () => {
    // Country alone is not an address — but it does carry a default, so the
    // caller has to gate on isAddressEmpty rather than on line count.
    expect(isAddressEmpty(EMPTY_ADDRESS)).toBe(true)
    expect(addressToLine(EMPTY_ADDRESS)).toBe("United Arab Emirates")
  })
})

describe("the postal code", () => {
  it("rides with the last address row rather than taking its own line", () => {
    // "Dubai, 74200" is how it prints. A bare code on its own line reads as a
    // stray field on an invoice.
    expect(addressToLines({ ...DUBAI, postcode: "74200" })).toEqual([
      "Regina Tower, Jumeirah Village Circle",
      "Al Barsha South",
      "Dubai, 74200",
      "United Arab Emirates",
    ])
  })

  it("is absent from the document when the merchant has none", () => {
    // Most UAE addresses have no postal code at all.
    expect(addressToLines(DUBAI).join(" ")).not.toMatch(/,\s*$/)
    expect(addressToLines(DUBAI)).toHaveLength(4)
  })

  it("does not make an empty address non-empty on its own", () => {
    expect(isAddressEmpty({ ...EMPTY_ADDRESS, postcode: "74200" })).toBe(true)
  })
})

describe("isAddressEmpty", () => {
  it("is false once anything has been entered", () => {
    expect(isAddressEmpty(DUBAI)).toBe(false)
  })

  it("treats a country-only record as empty", () => {
    expect(isAddressEmpty({ ...EMPTY_ADDRESS, country: "Saudi Arabia" })).toBe(true)
  })

  it("treats whitespace as empty", () => {
    expect(isAddressEmpty({ line: "  \n ", postcode: "", country: "United Arab Emirates" })).toBe(
      true,
    )
  })
})
