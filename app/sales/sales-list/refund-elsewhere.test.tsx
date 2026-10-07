import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/sales/sales-list",
  useSearchParams: () => new URLSearchParams(),
}))

import { MOCK_SALES, SaleDetailDialog } from "@/app/sales/sales-list/page"
import { LocationsProvider } from "@/lib/locations/store"
import { paymentsElsewhere, paymentsFor } from "@/lib/sales/payments"

// Sale 18 is a JVC sale whose deposit was taken at Jumeirah. Refunding or
// voiding a payment collected at a location the viewer does not hold is refused
// (LOCATION_ACCESS_DENIED), so a viewer holding JVC alone is not offered it.
const SALE = MOCK_SALES.find((s) => s.id === 18)!

function renderAs(grants: "all" | string[]) {
  return render(
    <LocationsProvider persist={false} initialGrants={grants}>
      <SaleDetailDialog sale={SALE} onOpenChange={() => {}} onViewProfile={() => {}} />
    </LocationsProvider>,
  )
}

function openQuickActions() {
  const trigger = screen.getByRole("button", { name: "Quick actions" })
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: "mouse" })
}

describe("a payment taken at another location", () => {
  it("is found by the location that collected it", () => {
    const elsewhere = paymentsElsewhere(paymentsFor(SALE), new Set(["shampooch-jvc"]))
    expect(elsewhere.map((p) => p.locationId)).toEqual(["shampooch-jumeirah"])
    expect(
      paymentsElsewhere(paymentsFor(SALE), new Set(["shampooch-jvc", "shampooch-jumeirah"])),
    ).toHaveLength(0)
  })

  it("names a location only on the payment taken away from the sale's", () => {
    renderAs("all")
    expect(screen.getByText(/· Shampooch Jumeirah$/)).toBeDefined()
    expect(screen.queryByText(/Front Desk|Mobile Grooming/)).toBeNull()
    // The sale's own location sits once, in the header.
    expect(screen.getAllByText("Shampooch JVC")).toHaveLength(1)
  })

  it("still names the other location for a viewer who holds one", () => {
    renderAs(["shampooch-jvc"])
    expect(screen.getByText(/· Shampooch Jumeirah$/)).toBeDefined()
  })

  it("offers no void to a viewer who does not hold it, and keeps refund for the rest", () => {
    renderAs(["shampooch-jvc"])
    openQuickActions()
    expect(screen.queryByText("Void sale")).toBeNull()
    expect(screen.getByText("Refund sale")).toBeDefined()
  })

  it("offers void to a viewer who holds both locations", () => {
    renderAs("all")
    openQuickActions()
    expect(screen.getByText("Void sale")).toBeDefined()
  })
})
