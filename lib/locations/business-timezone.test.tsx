import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { resolveTimezone } from "@/lib/locations/timezone"

// R19's first half: a business default every branch without a zone of its own
// follows. Changing it moves the inheriting branches and leaves the overridden
// ones, and a branch created on the default's own value inherits rather than
// freezing at today's zone.

function estate() {
  return renderHook(() => useLocations(), {
    wrapper: ({ children }) => (
      <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
        {children}
      </LocationsProvider>
    ),
  })
}

describe("the business time zone is a live default", () => {
  it("moves inheriting branches and leaves the ones with their own zone", () => {
    const { result } = estate()
    const inheriting = result.current.locations.find((l) => l.timezone === undefined)!
    const own = result.current.locations.find((l) => l.timezone !== undefined)!

    act(() => result.current.setBusinessTimezone("Asia/Muscat"))

    const zoneOf = (id: string) =>
      resolveTimezone(
        result.current.businessTimezone,
        result.current.locations.find((l) => l.id === id)!.timezone,
      ).value
    expect(zoneOf(inheriting.id)).toBe("Asia/Muscat")
    expect(zoneOf(own.id)).toBe(own.timezone)
  })

  it("creates a branch on the business zone as inheriting, not as a copy", () => {
    const { result } = estate()
    act(() =>
      result.current.addLocations([
        { name: "Shampooch Test", city: "Dubai", timezone: result.current.businessTimezone },
      ]),
    )
    const created = result.current.locations.find((l) => l.name === "Shampooch Test")!
    expect(created.timezone).toBeUndefined()
  })
})
