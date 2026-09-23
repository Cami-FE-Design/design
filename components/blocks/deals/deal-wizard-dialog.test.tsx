import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { DealWizardDialog } from "@/components/blocks/deals/deal-wizard-dialog"
import { MOCK_DEALS } from "@/lib/deals/mock"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { type LocationGrants, LocationsProvider } from "@/lib/locations/store"

/**
 * Creating a deal, end to end (DW3.4, R24).
 *
 * The dev repo's flow — details → limits — with a locations step after it.
 * Its wizard creates every deal with `locationIds: []`, which its own mapper
 * reads as every venue; these assert that the reach is chosen instead.
 */

const TODAY = "2026-08-24"

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

function open(dealToEdit?: (typeof MOCK_DEALS)[number], grants: LocationGrants = "all") {
  const onSave = vi.fn()
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE} initialGrants={grants}>
      <DealWizardDialog
        open
        onOpenChange={() => {}}
        dealToEdit={dealToEdit}
        todayIso={TODAY}
        onSave={onSave}
      />
    </LocationsProvider>,
  )
  return onSave
}

const cont = () => screen.getByRole("button", { name: "Continue" })

/** Walk from the details step to the named one, filling the minimum on the way. */
async function reach(step: "limits" | "locations") {
  await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
  await userEvent.type(screen.getByLabelText("Discount value"), "15")
  await userEvent.click(cont()) // details → limits
  if (step === "limits") return
  await userEvent.click(cont()) // limits → locations
}

describe("the steps", () => {
  it("opens on details, as the built wizard does, and walks to Create", async () => {
    open()
    expect(screen.getByText("Customize promotion details")).toBeInTheDocument()
    await reach("limits")
    expect(screen.getByText("Set up promotion limits")).toBeInTheDocument()
    await userEvent.click(cont())
    expect(screen.getByText("Select locations")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument()
  })

  it("keeps Continue disabled until the details are complete", async () => {
    open()
    expect(cont()).toBeDisabled()
    await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
    expect(cont()).toBeDisabled()
    await userEvent.type(screen.getByLabelText("Discount value"), "15")
    expect(cont()).toBeEnabled()
  })
})

describe("the discount is a kind and a number", () => {
  it("refuses a percentage over 100, and says so", async () => {
    open()
    await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
    await userEvent.type(screen.getByLabelText("Discount value"), "150")
    expect(screen.getByText("A percentage discount can't exceed 100%.")).toBeInTheDocument()
    expect(cont()).toBeDisabled()
  })

  it("saves the kind and the value apart", async () => {
    const onSave = open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ discountKind: "percentage", discountValue: 15 }),
    )
  })
})

describe("where it runs", () => {
  it("defaults to every location, stored as the named set", async () => {
    const onSave = open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ scope: { kind: "estate" } }))
  })

  it("refuses an empty list rather than reading it as everywhere", async () => {
    open()
    await reach("locations")
    await userEvent.click(screen.getByRole("checkbox", { name: /Select all/ }))
    expect(screen.getByText("Select at least one location.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled()
  })

  it("takes one branch and stores exactly that", async () => {
    const onSave = open()
    await reach("locations")
    await userEvent.click(screen.getByRole("checkbox", { name: /Select all/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: /Shampooch JVC/ }))
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scope: { kind: "branches", locationIds: ["shampooch-jvc"] } }),
    )
  })

  it("ticks every branch in a city with its city's box", async () => {
    const onSave = open()
    await reach("locations")
    await userEvent.click(screen.getByRole("checkbox", { name: /Select all/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: /^Abu Dhabi/ }))
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: { kind: "branches", locationIds: ["shampooch-al-reem", "shampooch-yas-island"] },
      }),
    )
  })

  it("never makes a manager's deal chain-wide, even with every box ticked", async () => {
    // Their Select all is their branches, not the estate (R04).
    const onSave = open(undefined, ["shampooch-jvc"])
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scope: { kind: "branches", locationIds: ["shampooch-jvc"] } }),
    )
  })
})

describe("the confirmation", () => {
  it("prints where the deal runs", async () => {
    open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByText("Your promotion is set!")).toBeInTheDocument()
    const card = screen.getByText("Locations").parentElement as HTMLElement
    expect(within(card).getByText("All locations")).toBeInTheDocument()
  })
})

describe("editing an existing deal", () => {
  it("opens prefilled and saves in place, without a confirmation screen", async () => {
    const existing = MOCK_DEALS[0]
    const onSave = open(existing)
    expect(screen.getByLabelText("Name")).toHaveValue(existing.name)
    await userEvent.click(cont())
    await userEvent.click(cont())
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: existing.id }))
  })
})

describe("what the deal comes off", () => {
  it("opens a catalogue picker per kind", async () => {
    open()
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0])
    expect(await screen.findByText("Select services")).toBeInTheDocument()
  })
})
