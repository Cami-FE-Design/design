import { render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { AppShell } from "@/components/blocks/app-shell"
import { LocationForm } from "@/components/blocks/location-form"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { type LocationGrants, LocationsProvider, useLocations } from "@/lib/locations/store"

/**
 * The full-page no-access state (P1.4.6).
 *
 * Somebody holding no location sees one state in place of every operational
 * page, but only while multi-location is switched on. A link to a location the
 * person does not hold falls through to the list, like a link to no location.
 * Anybody with access sees the page exactly as before.
 */

const searchParams = { value: new URLSearchParams() }

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
  usePathname: () => "/clients",
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

/** Stands in for HQ turning the multi-location switch off. */
function SwitchOff() {
  const { setEnabled } = useLocations()
  useEffect(() => setEnabled(false), [setEnabled])
  return null
}

function shellFor(grants: LocationGrants, { multiLocation = true } = {}) {
  searchParams.value = new URLSearchParams()
  render(
    <TooltipProvider>
      <LocationsProvider
        persist={false}
        initialLocations={NINE_BRANCH_ESTATE}
        initialGrants={grants}
      >
        {multiLocation ? null : <SwitchOff />}
        <AppShell header={<h1>Clients</h1>}>
          <p>Client list</p>
        </AppShell>
      </LocationsProvider>
    </TooltipProvider>,
  )
}

function locationsPanelFor(grants: LocationGrants, query: string) {
  searchParams.value = new URLSearchParams(query)
  render(
    <TooltipProvider>
      <LocationsProvider
        persist={false}
        initialLocations={NINE_BRANCH_ESTATE}
        initialGrants={grants}
      >
        <LocationForm />
      </LocationsProvider>
    </TooltipProvider>,
  )
}

describe("somebody holding no location", () => {
  it("sees the no-access state in place of the page's header and content", () => {
    shellFor([])
    expect(screen.getByText("You don't have access to any location")).toBeInTheDocument()
    expect(screen.getByText("Ask the account owner to give you access.")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Clients" })).toBeNull()
    expect(screen.queryByText("Client list")).toBeNull()
  })

  it("sees the page as it was when multi-location is off", () => {
    shellFor([], { multiLocation: false })
    expect(screen.getByRole("heading", { name: "Clients" })).toBeInTheDocument()
    expect(screen.getByText("Client list")).toBeInTheDocument()
    expect(screen.queryByText(/You don't have access/)).toBeNull()
  })
})

describe("somebody holding a location", () => {
  it("sees the page as it was", () => {
    shellFor(["shampooch-jumeirah"])
    expect(screen.getByRole("heading", { name: "Clients" })).toBeInTheDocument()
    expect(screen.getByText("Client list")).toBeInTheDocument()
    expect(screen.queryByText(/You don't have access/)).toBeNull()
  })
})

describe("a link to a location", () => {
  it("lands on the list for a location the person does not hold", () => {
    locationsPanelFor(["shampooch-jumeirah"], "loc=shampooch-jvc")
    expect(screen.getByRole("heading", { name: "Locations" })).toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "General" })).toBeNull()
    expect(screen.queryByText(/You don't have access/)).toBeNull()
  })

  it("opens the location for somebody who holds it", () => {
    locationsPanelFor(["shampooch-jvc"], "loc=shampooch-jvc")
    expect(screen.getByRole("tab", { name: "General" })).toBeInTheDocument()
    expect(screen.queryByText(/You don't have access/)).toBeNull()
  })

  it("still lands on the list when the link names no location at all", () => {
    locationsPanelFor("all", "loc=nowhere")
    expect(screen.getByRole("heading", { name: "Locations" })).toBeInTheDocument()
    expect(screen.queryByText(/You don't have access/)).toBeNull()
  })
})
