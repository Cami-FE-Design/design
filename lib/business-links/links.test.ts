import { describe, expect, it } from "vitest"
import {
  checkGoogleReviewLink,
  displayGoogleReviewLink,
  hasGoogleReviewLink,
} from "@/lib/business-links/links"

// The distinction these tests exist to protect: a Google *profile* link and a
// Google *review* link are different URLs with very different conversion, and
// telling them apart is the whole point of PRD-168. PILOT-30 was raised because
// the merchant's previous tool got this wrong and ~50 reviews were lost.

describe("checkGoogleReviewLink", () => {
  it("accepts the link Google's 'Ask for reviews' hands out", () => {
    expect(checkGoogleReviewLink("https://g.page/r/CShampoochJVC/review").kind).toBe("review")
  })

  it("accepts a writereview URL with a place id", () => {
    expect(
      checkGoogleReviewLink("https://search.google.com/local/writereview?placeid=ChIJ12345").kind,
    ).toBe("review")
  })

  it("accepts a link pasted without a scheme", () => {
    // Merchants paste bare hostnames far more often than malformed URLs, and
    // refusing this one for want of `https://` would be an error about nothing.
    expect(checkGoogleReviewLink("g.page/r/CShampoochJVC/review").kind).toBe("review")
  })

  it("flags a Maps listing as a listing, not a review link", () => {
    const check = checkGoogleReviewLink("https://www.google.com/maps/place/Shampooch+JVC/@25.05")
    expect(check.kind).toBe("listing")
    expect(check.message).toMatch(/review/i)
  })

  it("flags a bare g.page profile link — the near-miss that looks right", () => {
    // Same hostname as a real review link. Only the /review suffix separates
    // them, which is exactly why this is checked rather than assumed.
    expect(checkGoogleReviewLink("https://g.page/shampooch-jvc").kind).toBe("listing")
  })

  it("flags shortened Maps links", () => {
    expect(checkGoogleReviewLink("https://maps.app.goo.gl/abc123").kind).toBe("listing")
  })

  it("rejects a non-Google URL", () => {
    expect(checkGoogleReviewLink("https://facebook.com/shampooch").kind).toBe("invalid")
  })

  it("rejects something that isn't a URL", () => {
    expect(checkGoogleReviewLink("not a url at all").kind).toBe("invalid")
  })

  it("says nothing about an empty field", () => {
    // Unset is the normal starting state for every merchant, not an error.
    const check = checkGoogleReviewLink("   ")
    expect(check.kind).toBe("empty")
    expect(check.message).toBeNull()
  })
})

describe("hasGoogleReviewLink", () => {
  it.each([
    [undefined, false],
    [null, false],
    ["", false],
    ["   ", false],
    ["https://g.page/r/x/review", true],
  ])("%s → %s", (input, expected) => {
    expect(hasGoogleReviewLink(input)).toBe(expected)
  })
})

describe("displayGoogleReviewLink", () => {
  it("strips the scheme and trailing slash for summary rows", () => {
    expect(displayGoogleReviewLink("https://g.page/r/CShampoochJVC/review/")).toBe(
      "g.page/r/CShampoochJVC/review",
    )
  })

  it("returns null when unset, so the row renders its Add state", () => {
    expect(displayGoogleReviewLink("")).toBeNull()
  })
})
