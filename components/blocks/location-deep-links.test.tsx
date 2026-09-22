import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { LocationForm } from "@/components/blocks/location-form"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * A branch's own facts are two clicks deep, so a link has to make them one.
 *
 * Receipt prefix, tax identity, tipping and deposit all live on one branch's
 * Invoicing tab. A link that lands on the Locations list asks the reader to
 * pick the right branch out of nine and then the right tab out of five, which
 * is how a linked fact goes unlooked-at.
 *
 * `?loc=<id>` opens the branch and `?lt=<tab>` picks its tab. An unknown tab
 * falls back to General rather than rendering nothing, because a typo in a
 * shared link should still land somewhere.
 */

const searchParams = { value: new URLSearchParams() }

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
  usePathname: () => "/shell-demo",
  useSearchParams: () => searchParams.value,
}))

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

function openWith(query: string) {
  searchParams.value = new URLSearchParams(query)
  render(
    <TooltipProvider>
      <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
        <LocationForm />
      </LocationsProvider>
    </TooltipProvider>,
  )
}

describe("the Locations panel's deep links", () => {
  it("lands on the list with no parameter", () => {
    openWith("")
    expect(screen.getByRole("heading", { name: "Locations" })).toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Invoicing" })).toBeNull()
  })

  it("opens one branch on ?loc=", () => {
    openWith("loc=shampooch-jvc")
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("data-state", "active")
  })

  it("opens that branch's Invoicing tab on ?lt=", () => {
    openWith("loc=shampooch-jvc&lt=invoicing")
    expect(screen.getByRole("tab", { name: "Invoicing" })).toHaveAttribute("data-state", "active")
  })

  it("falls back to General when the tab does not exist", () => {
    openWith("loc=shampooch-jvc&lt=nonsense")
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("data-state", "active")
  })
})
