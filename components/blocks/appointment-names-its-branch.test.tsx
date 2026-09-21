import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// The sheet reads the router to keep a deposit's pay link on the current path.
// Nothing here exercises navigation, so it is stubbed rather than provided.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}))

import { MOCK_BOOKINGS } from "@/app/appointments/mock"
import { AppointmentQuickPanel } from "@/components/blocks/appointment-popover"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LocationsProvider } from "@/lib/locations/store"
import { ServiceCatalogProvider } from "@/lib/service-catalog/store"

// An appointment is a write, so it names a branch — and every surface that
// reads one has to say which. Three of them did not: the calendar tile's
// popover, and the sheet in edit flow, carried no branch at all, while the
// detail sheet buried it as the third item of a comma list at 70% opacity.
//
// Staff do not settle it. Lena Petrov works JVC *and* Jumeirah, so a name in
// the tile answers when and who and never where.

const BRANCH_ID = "shampooch-jumeirah"
const BRANCH_NAME = "Shampooch Jumeirah"

function withLocations(ui: React.ReactNode) {
  return render(
    <LocationsProvider persist={false}>
      {/* The sheet reads the service catalog on mount and carries tooltips; the
          popover needs neither. One wrapper for both keeps the cases
          comparable — what is being asserted is identical either way. */}
      <ServiceCatalogProvider>
        <TooltipProvider>{ui}</TooltipProvider>
      </ServiceCatalogProvider>
    </LocationsProvider>,
  )
}

describe("an appointment names its branch wherever it is read", () => {
  it("names it on the tile's popover", () => {
    const booking = MOCK_BOOKINGS.find((b) => b.locationId === BRANCH_ID)
    expect(booking).toBeDefined()

    withLocations(<AppointmentQuickPanel booking={booking!} />)

    const branch = screen.getByText(BRANCH_NAME)
    expect(branch).toBeDefined()
    // Its own line above the client, not a third thing crammed into the 320px
    // status bar beside the time range.
    expect(branch.closest('[data-slot="appointment-branch"]')).not.toBeNull()
  })

  it("names it on the sheet in edit flow", () => {
    withLocations(
      <NewAppointmentSheet
        open
        onOpenChange={() => {}}
        date="2026-05-13"
        flow="edit"
        initialStatus="booked"
        existingLocationId={BRANCH_ID}
      />,
    )

    expect(screen.getByText(BRANCH_NAME)).toBeDefined()
  })

  it("says nothing about branches in create flow's header, where it is asked instead", () => {
    withLocations(
      <NewAppointmentSheet open onOpenChange={() => {}} date="2026-05-13" flow="create" />,
    )

    // Create resolves its own target through WriteTargetLocation, which asks.
    // Stating one in the header too would be the same question answered twice,
    // in two places, with nothing saying which wins.
    expect(screen.getByText("Location")).toBeDefined()
  })
})
