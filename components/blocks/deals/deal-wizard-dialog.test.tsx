import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { DealWizardDialog } from "@/components/blocks/deals/deal-wizard-dialog"
import { MOCK_DEALS } from "@/lib/deals/mock"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * Creating a deal, end to end (DW3.4, R24).
 *
 * The wizard replaces a single dialog that asked for a name, a free-text
 * "Offer", two dates and a scope. Two of those were wrong rather than thin: an
 * owner typing "15 off" could not say whether that was AED or a percentage, and
 * the screen never asked what the offer came off — which is how a grooming deal
 * came to be offered on a bottle of conditioner.
 */

const TODAY = "2026-08-24"

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

function open(dealToEdit: (typeof MOCK_DEALS)[number] | null = null) {
  const onSave = vi.fn()
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
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

/** Walk from the type step to the named one, filling the minimum on the way. */
async function reach(step: "details" | "limits" | "locations" | "team") {
  await userEvent.click(cont()) // type → details
  if (step === "details") return
  await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
  await userEvent.type(screen.getByLabelText("Discount value"), "15")
  await userEvent.click(cont()) // details → limits
  if (step === "limits") return
  await userEvent.click(cont()) // limits → locations
  if (step === "locations") return
  await userEvent.click(cont()) // locations → team
}

describe("the steps", () => {
  it("opens on the type step and walks to Create", async () => {
    open()
    expect(screen.getByText("Select deal type")).toBeInTheDocument()
    await reach("team")
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument()
  })

  it("names what is missing rather than greying Continue in silence", async () => {
    // Eight fields and a disabled button leaves the reader hunting for which
    // one it wants.
    open()
    await reach("details")
    expect(cont()).toBeDisabled()
    expect(screen.getByText("Give the deal a name.")).toBeInTheDocument()
  })
})

describe("the discount is a kind and a number, not a sentence", () => {
  it("shows the unit on the field and switches it", async () => {
    open()
    await reach("details")
    expect(screen.getByPlaceholderText("15")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "AED" }))
    // The placeholder changes with the unit, because "15" reads as a sensible
    // percentage and a strange amount off.
    expect(screen.getByPlaceholderText("30")).toBeInTheDocument()
  })

  it("refuses a percentage over 100, and says so", async () => {
    open()
    await reach("details")
    await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
    await userEvent.type(screen.getByLabelText("Discount value"), "150")
    expect(screen.getAllByText(/cannot exceed 100%/).length).toBeGreaterThan(0)
    expect(cont()).toBeDisabled()
  })

  it("saves the kind and the value apart", async () => {
    const onSave = open()
    await reach("team")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ discountKind: "percentage", discountValue: 15 }),
    )
  })
})

describe("where it runs", () => {
  it("refuses an empty branch list, and says what it would mean", async () => {
    // The whole of R24 on one screen: an empty list is not "everywhere".
    open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: /Only the locations I choose/ }))
    expect(cont()).toBeDisabled()
    // Said twice on purpose: once beside the button that refuses, and once in
    // the block that explains what an empty list would otherwise mean.
    expect(screen.getAllByText(/runs nowhere/).length).toBeGreaterThan(0)
  })

  it("takes one branch and stores it as a named set", async () => {
    const onSave = open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: /Only the locations I choose/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: "JVC" }))
    await userEvent.click(cont())
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: { kind: "branches", locationIds: ["shampooch-jvc"] },
      }),
    )
  })

  it("defaults to every location, including ones opened later", async () => {
    const onSave = open()
    await reach("team")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ scope: { kind: "estate" } }))
  })
})

describe("who can sell it", () => {
  it("flags a team member who works at none of the deal's branches", async () => {
    // Ticking them would build a roster that cannot work — the offer is
    // Mirdif's and they are never at Mirdif.
    open()
    await reach("locations")
    await userEvent.click(screen.getByRole("button", { name: /Only the locations I choose/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: "JVC" }))
    await userEvent.click(cont())
    expect(screen.getAllByText("Not at these locations").length).toBeGreaterThan(0)
  })

  it("reads an empty roster as everybody", async () => {
    open()
    await reach("team")
    expect(screen.getByText("Nobody picked, so everybody can sell it.")).toBeInTheDocument()
  })
})

describe("the confirmation states the reach", () => {
  it("prints where the deal runs — the line the built one cannot", async () => {
    // Its wizard creates every deal with `locationIds: []`, so its success
    // screen has no answer to give.
    open()
    await reach("team")
    await userEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByText("Your deal is set")).toBeInTheDocument()
    expect(screen.getByText("Runs at")).toBeInTheDocument()
  })
})

describe("editing an existing deal", () => {
  it("opens prefilled and saves in place, without a confirmation screen", async () => {
    const existing = MOCK_DEALS[0]
    const onSave = open(existing)
    await userEvent.click(cont())
    expect(screen.getByLabelText("Name")).toHaveValue(existing.name)
    await userEvent.click(cont())
    await userEvent.click(cont())
    await userEvent.click(cont())
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: existing.id }))
  })
})

describe("what the deal comes off", () => {
  it("opens a catalogue picker per kind", async () => {
    open()
    await reach("details")
    const rows = screen.getAllByRole("button", { name: "Edit" })
    await userEvent.click(rows[0])
    expect(await screen.findByText("Select services")).toBeInTheDocument()
  })

  it("stores 'all' when every box is ticked, not the ids", async () => {
    // A service added next month is in an "all" offer and is not in a list of
    // ids — the same distinction the locations step draws.
    open()
    await reach("details")
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0])
    const dialog = await screen.findByText("Select services")
    expect(
      within(dialog.closest("[role=dialog]") as HTMLElement).getByText(
        /All services, including any added later/,
      ),
    ).toBeInTheDocument()
  })
})
