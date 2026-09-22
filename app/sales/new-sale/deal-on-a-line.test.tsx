import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { EditLineDialog } from "@/app/sales/new-sale/edit-line-dialog"
import type { CartLine } from "@/app/sales/new-sale/types"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * A deal attaches to a line, and only if it runs at this sale's branch
 * (DW3.4, R11, R18).
 *
 * The first attempt put it in a panel under the cart, which offered a
 * percentage of nothing while the cart was still empty and looked nothing like
 * the built product. `edit-line-dialog.tsx` on the dev repo's
 * `promotion-discount-ui` puts it on the line: a select of eligible
 * promotions, with the discount computed against that line's gross.
 *
 * Note which way round the branch rule works here. A client's package bought
 * elsewhere **warns and still completes** (KC1.5) — they paid for it, and
 * reception can judge. A deal scoped to another branch is that branch's
 * decision about its own diary, so it is never offered and there is nothing to
 * override.
 */

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

const LINE: CartLine = {
  uid: "l1",
  kind: "service",
  name: "Full groom",
  priceMinor: 50000,
  qty: 1,
  sourceId: "full-groom",
}

function open(locationId: string | null) {
  const onApply = vi.fn()
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
      <EditLineDialog
        line={LINE}
        open
        onOpenChange={() => {}}
        onApply={onApply}
        locationId={locationId}
      />
    </LocationsProvider>,
  )
  return onApply
}

async function openDiscounts() {
  await userEvent.click(screen.getByRole("combobox", { name: "Discounts" }))
  return screen.findByRole("listbox")
}

describe("which deals a line may take", () => {
  it("offers the ones running at this sale's branch", async () => {
    open("shampooch-jvc")
    const list = await openDiscounts()
    expect(within(list).getByText(/Summer groom offer/)).toBeInTheDocument()
  })

  it("never offers a deal scoped to another branch", async () => {
    open("shampooch-jvc")
    const list = await openDiscounts()
    expect(within(list).queryByText(/Mirdif Tuesdays/)).not.toBeInTheDocument()
  })

  it("offers that same deal at the branch it belongs to", async () => {
    open("shampooch-mirdif")
    const list = await openDiscounts()
    expect(within(list).getByText(/Mirdif Tuesdays/)).toBeInTheDocument()
  })

  it("offers none at all until the sale has named a branch (R11)", async () => {
    // There is no "all locations" cart. Until the sale says where it lands,
    // the question "which deals apply" has no answer, and guessing one is the
    // failure R11 exists to delete.
    open(null)
    const list = await openDiscounts()
    expect(within(list).getByText("No discount")).toBeInTheDocument()
    expect(within(list).queryByText(/Summer groom offer/)).not.toBeInTheDocument()
  })
})

describe("what it takes off", () => {
  it("computes against this line's gross and reports it", async () => {
    const onApply = open("shampooch-jvc")
    const list = await openDiscounts()
    await userEvent.click(within(list).getByText(/Summer groom offer/))
    // 20% of AED 500.00.
    expect(screen.getByText(/AED 100 off/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    expect(onApply).toHaveBeenCalledWith(
      "l1",
      expect.objectContaining({ dealId: "summer-groom", dealDiscountMinor: 10000 }),
    )
  })
})
