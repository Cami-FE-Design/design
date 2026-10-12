import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LocationSwitcher } from "@/components/blocks/shell/location-switcher"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider, useLocations } from "@/lib/locations/store"

// "Only" narrows the switcher to one location in a click, instead of
// unticking every other location one by one.

function ScopeLabel() {
  return <span data-testid="scope">{useLocations().scopeLabel}</span>
}

function openMenu() {
  const trigger = screen.getAllByRole("button")[0]
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: "mouse" })
}

describe("Only, beside each location in the switcher", () => {
  it("leaves just that location in view", () => {
    render(
      <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
        <LocationSwitcher />
        <ScopeLabel />
      </LocationsProvider>,
    )
    openMenu()
    const row = screen.getByRole("menuitemcheckbox", { name: /Shampooch Jumeirah/ })
    fireEvent.click(row.querySelector("button") as HTMLButtonElement)
    expect(screen.getByTestId("scope").textContent).toBe("Shampooch Jumeirah")
  })

  it("is not offered on the one location already alone in view", () => {
    render(
      <LocationsProvider
        persist={false}
        initialLocations={NINE_BRANCH_ESTATE}
        initialScope={{ kind: "one", locationId: "shampooch-jvc" }}
      >
        <LocationSwitcher />
      </LocationsProvider>,
    )
    openMenu()
    const row = screen.getByRole("menuitemcheckbox", { name: /Shampooch JVC/ })
    expect(row.querySelector("button")).toBeNull()
  })
})
