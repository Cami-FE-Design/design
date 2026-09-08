// Pins the one-way trip from the address record to document lines.
//
// These lines are printed on tax invoices, so the interesting cases are the ones
// where a naive join produces something that reads as a software bug.

import { describe, expect, it } from "vitest"
import {
  addressPlaceRef,
  addressToLine,
  addressToLines,
  EMPTY_ADDRESS,
  hasPrecisePoint,
  isAddressEmpty,
  mapsDirectionsHref,
  mapsSearchHref,
} from "./address"

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

// ─── Navigating to an address (PRD-144) ───────────────────────────────────────
// The pickup address is the one a mobile groomer drives to, so the interesting
// cases are the two ways a link can silently mislead: routing to a stale pin
// after the text changed, and claiming precision it does not have.

const PINNED = {
  ...EMPTY_ADDRESS,
  line: "Apt 1804, Marina Heights Tower, Dubai Marina",
  placeId: "ChIJdemo_marina_heights",
  point: { lat: 25.0805, lng: 55.1403 },
}

describe("hasPrecisePoint", () => {
  it("is false for a typed address", () => {
    expect(hasPrecisePoint(undefined)).toBe(false)
    expect(hasPrecisePoint({})).toBe(false)
  })

  it("accepts either handle on its own", () => {
    expect(hasPrecisePoint({ point: { lat: 25, lng: 55 } })).toBe(true)
    expect(hasPrecisePoint({ placeId: "ChIJx" })).toBe(true)
  })
})

describe("addressPlaceRef", () => {
  it("is undefined for a record that was typed, not picked", () => {
    expect(addressPlaceRef({ ...EMPTY_ADDRESS, line: "Villa 12, Street 4B" })).toBeUndefined()
  })

  it("carries both handles off a picked record", () => {
    expect(addressPlaceRef(PINNED)).toEqual({
      placeId: PINNED.placeId,
      point: PINNED.point,
    })
  })
})

describe("maps links", () => {
  it("routes to the pin, not the text, when there is one", () => {
    const href = mapsDirectionsHref(PINNED.line, addressPlaceRef(PINNED))
    expect(href).toContain("destination=25.0805%2C55.1403")
    expect(href).toContain("destination_place_id=ChIJdemo_marina_heights")
  })

  it("falls back to a text query for a typed address", () => {
    const href = mapsDirectionsHref("Villa 12, Street 4B, Jumeirah 1, Dubai")
    expect(href).toContain("destination=Villa+12%2C+Street+4B%2C+Jumeirah+1%2C+Dubai")
    expect(href).not.toContain("destination_place_id")
  })

  it("keeps query alongside the place id in search mode", () => {
    // query_place_id is ignored by Maps unless `query` is present too.
    const href = mapsSearchHref(PINNED.line, { placeId: "ChIJx" })
    expect(href).toContain("query=Apt+1804")
    expect(href).toContain("query_place_id=ChIJx")
  })

  it("does not carry a pin the address no longer describes", () => {
    // The record after someone edits a picked address by hand: the field clears
    // the refs, so the link degrades to a search of the new text rather than
    // routing to the old building.
    const edited = {
      ...PINNED,
      line: "Apt 2110, some other tower",
      placeId: undefined,
      point: undefined,
    }
    const href = mapsDirectionsHref(edited.line, addressPlaceRef(edited))
    expect(href).toContain("destination=Apt+2110")
    expect(href).not.toContain("25.0805")
  })
})
