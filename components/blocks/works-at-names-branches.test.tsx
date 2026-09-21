import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { TeamMemberDetailDialog } from "@/components/blocks/team-member-detail-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { type LocationGrants, LocationsProvider } from "@/lib/locations/store"

/**
 * "Works at" names branches, not the business (R04, R05, SCR-03).
 *
 * The card read the business name with "Default workspace" underneath it —
 * the business-as-location conflation this slice deleted from the topbar, the
 * estate and the money, left standing on the one card whose heading is
 * literally "Works at". An owner checking which branches somebody covers was
 * told the name of their own company.
 *
 * Nothing threw, and "Shampooch / Default workspace" is a plausible-looking
 * card, which is why it survived every pass until somebody opened it.
 */

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

function open(locationGrants: LocationGrants, estate = NINE_BRANCH_ESTATE) {
  // The KPI cards above this one are tooltipped, and a tooltip outside its
  // provider throws before anything renders. The app mounts one at the root.
  render(
    <TooltipProvider>
      <LocationsProvider persist={false} initialLocations={estate}>
        <TeamMemberDetailDialog
          open
          onOpenChange={() => {}}
          member={{
            id: "m1",
            name: "Sara Park",
            email: "sara@getcami.io",
            roleId: "staff",
            status: "active",
            locationGrants,
          }}
        />
      </LocationsProvider>
    </TooltipProvider>,
  )
}

describe("the Works at card", () => {
  it("names the branches they hold", () => {
    open(["shampooch-jvc", "shampooch-jumeirah"])
    expect(screen.getByText("Shampooch JVC")).toBeInTheDocument()
    expect(screen.getByText("Shampooch Jumeirah")).toBeInTheDocument()
  })

  it("never names the business as though it were a place", () => {
    open(["shampooch-jvc"])
    expect(screen.queryByText("Default workspace")).not.toBeInTheDocument()
  })

  it("shows only what they hold, not the estate", () => {
    open(["shampooch-jvc"])
    expect(screen.queryByText("Shampooch Mirdif")).not.toBeInTheDocument()
  })

  it("keeps an owner's grant as a named set rather than a list of nine", () => {
    // Ticking every branch today and holding the estate are different claims,
    // and the second is the one an owner has.
    open("all")
    expect(screen.getByText(/Every location, including any added later/)).toBeInTheDocument()
  })

  it("says an empty grant out loud, because it must never read as all (R24)", () => {
    open([])
    expect(screen.getByText(/No locations yet/)).toBeInTheDocument()
  })

  it("is absent for a single-branch business, where there is nothing to tell apart", () => {
    open(["shampooch-jvc"], NINE_BRANCH_ESTATE.slice(0, 1))
    expect(screen.queryByText("Works at")).not.toBeInTheDocument()
  })
})
