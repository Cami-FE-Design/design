import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

let search = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useSearchParams: () => search,
}))

import { DealsPage } from "@/components/blocks/deals/deals-page"
import { resetDeals } from "@/lib/deals/store"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { type LocationGrants, LocationsProvider } from "@/lib/locations/store"

/**
 * Settings → Marketing → Deals (DW3.4, R18, R24).
 *
 * The dev repo's `DealsPage`, with where each deal runs on its row and the
 * list bounded by the reader's grant.
 */

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  resetDeals()
  search = new URLSearchParams()
})

function open(grants: LocationGrants = "all") {
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE} initialGrants={grants}>
      <DealsPage />
    </LocationsProvider>,
  )
}

describe("the panel", () => {
  it("is headed as the dev repo heads it", () => {
    open()
    expect(screen.getByRole("heading", { name: "Deals" })).toBeInTheDocument()
    expect(screen.getByText("Marketing")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Add deal/ })).toBeInTheDocument()
  })

  it("says where each deal runs on its row", () => {
    open()
    expect(screen.getAllByText("All locations").length).toBeGreaterThan(0)
    expect(screen.getByText("3 locations")).toBeInTheDocument()
    expect(screen.getByText("Shampooch Mirdif")).toBeInTheDocument()
  })

  it("marks a deal with nothing chosen Inactive, rather than passing it as chain-wide", () => {
    open()
    expect(screen.getByText("No locations")).toBeInTheDocument()
  })
})

describe("what a one-branch manager sees", () => {
  it("is shown the deals that reach their branch", () => {
    open(["shampooch-mirdif"])
    expect(screen.getByText("Mirdif Tuesdays")).toBeInTheDocument()
    expect(screen.getByText("Summer groom offer")).toBeInTheDocument()
  })

  it("is not shown a deal scoped to branches they do not hold", () => {
    open(["shampooch-mirdif"])
    expect(screen.queryByText("Abu Dhabi launch")).not.toBeInTheDocument()
  })
})

describe("the detail view", () => {
  it("drills in from a row and back out through the breadcrumb", async () => {
    open()
    await userEvent.click(screen.getByText("Summer groom offer"))
    expect(screen.getByRole("tab", { name: "Availability" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Deals" }))
    expect(screen.getByRole("button", { name: /Add deal/ })).toBeInTheDocument()
  })

  it("opens straight on a deal from ?deal=", () => {
    search = new URLSearchParams("settings=deals&deal=mirdif-tuesdays")
    open()
    expect(screen.getByRole("heading", { name: "Mirdif Tuesdays" })).toBeInTheDocument()
  })

  it("counts the branches on Availability, with a working Edit", async () => {
    search = new URLSearchParams("deal=abu-dhabi-launch")
    open()
    await userEvent.click(screen.getByRole("tab", { name: "Availability" }))
    expect(screen.getByText("3 locations")).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" }).at(-1)!)
    expect(await screen.findByText("Select locations")).toBeInTheDocument()
  })
})

/** The Options button on the row naming this deal. */
function optionsFor(name: string) {
  const row = screen.getByText(name).closest(".group") as HTMLElement
  return within(row).getByRole("button", { name: /Options/ })
}

describe("the row menu", () => {
  it("stops a running deal", async () => {
    open()
    const before = screen.getAllByText("Active").length
    await userEvent.click(optionsFor("Summer groom offer"))
    await userEvent.click(screen.getByRole("menuitem", { name: "Deactivate" }))
    expect(screen.getAllByText("Active").length).toBeLessThan(before)
  })

  it("duplicates a deal as an inactive copy", async () => {
    open()
    await userEvent.click(optionsFor("Summer groom offer"))
    await userEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }))
    expect(screen.getByText(/\(copy\)/)).toBeInTheDocument()
  })

  it("will not activate a deal that reaches nobody", async () => {
    open()
    await userEvent.click(optionsFor("Spring refresh"))
    await userEvent.click(screen.getByRole("menuitem", { name: "Activate" }))
    const row = screen.getByText("Spring refresh").closest(".group") as HTMLElement
    expect(within(row).getByText("Inactive")).toBeInTheDocument()
  })
})
