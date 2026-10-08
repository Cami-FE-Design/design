import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ProductBranchStock } from "@/components/blocks/products/product-branch-stock"
import { TeamAccessDialog } from "@/components/blocks/team/team-access-dialog"
import { LocationsProvider } from "@/lib/locations/store"
import { TEAM_MEMBERS } from "@/lib/team/mock"

// PRD-169's Done-means includes loading and error. The two that carry a rule:
// stock must not show a total it could not add up (G7), and team access must
// neither say no location is selected before the grant has loaded (R24) nor save over it.

const PRODUCT = { id: "p2", name: "Furminator Deshedding Tool", trackStock: true }

function withLocations(ui: React.ReactNode) {
  return render(<LocationsProvider persist={false}>{ui}</LocationsProvider>)
}

describe("stock by location before it has loaded", () => {
  it("is ready by default, as every route renders it", () => {
    withLocations(<ProductBranchStock product={PRODUCT} />)
    expect(screen.queryByRole("status")).toBeNull()
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("says it is loading", () => {
    withLocations(<ProductBranchStock product={PRODUCT} status="loading" />)
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe("Loading stock by location")
  })

  it("fails whole, with a way back, and shows no figure at all", () => {
    const onRetry = vi.fn()
    const { container } = withLocations(
      <ProductBranchStock product={PRODUCT} status="error" onRetry={onRetry} />,
    )
    expect(screen.getByRole("alert").textContent).toContain("Couldn’t load stock by location.")
    expect(container.textContent).not.toMatch(/\d/)
    screen.getByRole("button", { name: "Try again" }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

describe("team access before the grant has loaded", () => {
  const ahmed = TEAM_MEMBERS.find((m) => m.id === "m_ahmed")!

  for (const status of ["loading", "error"] as const) {
    it(`never asks for a location and will not save while ${status}`, () => {
      withLocations(
        <TeamAccessDialog
          open
          onOpenChange={vi.fn()}
          member={ahmed}
          onSave={vi.fn()}
          status={status}
        />,
      )
      expect(screen.queryByText(/Pick at least one location/)).toBeNull()
      expect((screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement).disabled).toBe(
        true,
      )
    })
  }

  it("asks for a location once the empty grant has loaded", () => {
    withLocations(<TeamAccessDialog open onOpenChange={vi.fn()} member={ahmed} onSave={vi.fn()} />)
    expect(screen.getByText(/Pick at least one location/)).toBeDefined()
  })
})
