import { describe, expect, it } from "vitest"
import {
  BUSINESS_TIMEZONE,
  normaliseOverride,
  overriddenCount,
  resolveTimezone,
  timezoneLabel,
} from "@/lib/locations/timezone"

describe("resolveTimezone", () => {
  it("inherits the business default when the branch has no opinion", () => {
    const resolved = resolveTimezone(BUSINESS_TIMEZONE, undefined)
    expect(resolved.value).toBe("Asia/Dubai")
    // Said, not implied: a screen can only write "inherited" if it knows.
    expect(resolved.source).toBe("business")
  })

  it("takes the branch's own zone when it has one", () => {
    const resolved = resolveTimezone("Asia/Dubai", "Asia/Riyadh")
    expect(resolved).toEqual({ value: "Asia/Riyadh", source: "location" })
  })

  it("treats an empty string as no opinion, not as a blank zone", () => {
    // An empty select is somebody clearing a field, and clearing an override
    // means going back to the business — not moving to nowhere.
    expect(resolveTimezone("Asia/Dubai", "").source).toBe("business")
  })

  it("follows the business when the default moves", () => {
    // The whole point of inheritance: one change, and every branch that never
    // had an opinion moves with it.
    expect(resolveTimezone("Europe/London", undefined).value).toBe("Europe/London")
    expect(resolveTimezone("Europe/London", "Asia/Dubai").value).toBe("Asia/Dubai")
  })
})

describe("normaliseOverride", () => {
  it("stores nothing when the pick matches the default", () => {
    // Storing it would freeze the branch at today's default: the business
    // moves and this one silently does not, for a decision nobody made.
    expect(normaliseOverride("Asia/Dubai", "Asia/Dubai")).toBeUndefined()
  })

  it("stores a genuine difference", () => {
    expect(normaliseOverride("Asia/Dubai", "Asia/Karachi")).toBe("Asia/Karachi")
  })
})

describe("overriddenCount", () => {
  it("counts only the branches a business-wide change would miss", () => {
    const estate = [undefined, "Asia/Dubai", "Asia/Riyadh", undefined, "Asia/Karachi"]
    // "Asia/Dubai" here is a stored value equal to the default — it still
    // counts, because it is stored, and that is exactly the state
    // `normaliseOverride` exists to stop anyone creating.
    expect(overriddenCount(estate, "Asia/Dubai")).toBe(3)
    expect(overriddenCount([undefined, undefined], "Asia/Dubai")).toBe(0)
  })
})

describe("timezoneLabel", () => {
  it("names the cities an operator would recognise", () => {
    expect(timezoneLabel("Asia/Dubai")).toContain("Dubai")
    // An unknown zone is shown as itself rather than swallowed: a stale
    // reference should be visible, not silent.
    expect(timezoneLabel("America/Denver")).toBe("America/Denver")
  })
})
