import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RemoveStockDialog } from "@/components/blocks/remove-stock-dialog"
import { quantityAt } from "@/lib/inventory/branch-stock"
import { BRANCH_STOCK } from "@/lib/inventory/mock"
import { BranchStockProvider } from "@/lib/inventory/store"
import { type LocationGrants, LocationsProvider } from "@/lib/locations/store"

// Product p2 has 3 at Shampooch JVC and more across the estate. The chip reads
// the chosen location's count; stock can go negative, so it is not a limit.
const PRODUCT = "p2"
const LOCATION = "shampooch-jvc"
const AT_JVC = quantityAt(BRANCH_STOCK, PRODUCT, LOCATION)

function renderDialog(grants: LocationGrants) {
  return render(
    <LocationsProvider
      persist={false}
      initialGrants={grants}
      initialScope={{ kind: "one", locationId: LOCATION }}
    >
      <BranchStockProvider persist={false}>
        <RemoveStockDialog
          open
          onOpenChange={() => {}}
          productName="Conditioner"
          productId={PRODUCT}
          stockOnHand={99}
        />
      </BranchStockProvider>
    </LocationsProvider>,
  )
}

describe("remove stock reads the chosen location's count", () => {
  it("reads the count at one location", () => {
    expect(AT_JVC).toBe(3)
    expect(quantityAt(BRANCH_STOCK, PRODUCT, "nowhere")).toBe(0)
  })

  it("names the location on a multi-location business", () => {
    renderDialog("all")
    expect(screen.getByText(`${AT_JVC} in stock at Shampooch JVC`)).toBeDefined()
    expect(screen.queryByText("99 in stock")).toBeNull()
  })

  it("shows the count alone with one location", () => {
    renderDialog([LOCATION])
    expect(screen.getByText(`${AT_JVC} in stock`)).toBeDefined()
    expect(screen.queryByText(/in stock at/)).toBeNull()
  })

  it("lets a removal take the count below zero", () => {
    renderDialog("all")
    const save = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: String(AT_JVC + 5) } })
    expect(save.disabled).toBe(false)
  })
})
