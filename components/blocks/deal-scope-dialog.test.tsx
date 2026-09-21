import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DealScopeDialog } from "@/components/blocks/deal-scope-dialog"
import type { Deal } from "@/lib/deals/mock"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * Choosing where a deal runs (DW3.4, R24).
 *
 * Two of these are interaction defects rather than rules, and both were the
 * same mistake: a control that looked like the target and was not. The choice
 * cards were labels pointing at a Radix radio, which renders a <button> — so
 * the whole card was styled clickable and only the 16px dot worked. And Add on
 * the list page was disabled, which on a primary action reads as broken rather
 * than as "not yet".
 */

const EXISTING: Deal = {
  id: "d1",
  name: "January groom offer",
  offer: "20% off",
  status: "active",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  scope: { kind: "estate" },
  redemptions: 4,
}

function open(deal: Deal | null, onSave = vi.fn()) {
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
      <DealScopeDialog open onOpenChange={() => {}} deal={deal} onSave={onSave} />
    </LocationsProvider>,
  )
  return onSave
}

const LOCAL = /Only the locations I choose/

describe("the choice cards", () => {
  it("take a click anywhere on the card, not only on the dot", async () => {
    open(EXISTING)
    await userEvent.click(
      screen.getByText("A local offer, which a location opened later will not join."),
    )
    expect(screen.getByRole("button", { name: LOCAL })).toHaveAttribute("aria-pressed", "true")
  })

  it("reveals the picker only once a local offer is chosen", async () => {
    open(EXISTING)
    expect(screen.queryByText("All locations", { selector: "span" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: LOCAL }))
    expect(screen.getByLabelText("Search locations")).toBeInTheDocument()
  })
})

describe("nothing chosen is refused, not saved", () => {
  it("disables Save while the list is empty", async () => {
    open(EXISTING)
    await userEvent.click(screen.getByRole("button", { name: LOCAL }))
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
    expect(screen.getByText(/does not run everywhere/)).toBeInTheDocument()
  })

  it("enables it as soon as one branch is ticked", async () => {
    const onSave = open(EXISTING)
    await userEvent.click(screen.getByRole("button", { name: LOCAL }))
    // The picker labels rows by district, not by the full branch name — every
    // name in a chain starts with the business, so a column of "Shampooch …"
    // spends its width on the one word that cannot tell them apart.
    await userEvent.click(screen.getByRole("checkbox", { name: "JVC" }))
    const save = screen.getByRole("button", { name: "Save" })
    expect(save).not.toBeDisabled()
    await userEvent.click(save)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: { kind: "branches", locationIds: ["shampooch-jvc"] },
      }),
    )
  })
})

describe("creating one", () => {
  it("asks for a name, an offer and a start, and refuses without them", async () => {
    open(null)
    expect(screen.getByText("New deal")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create deal" })).toBeDisabled()
    await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
    await userEvent.type(screen.getByLabelText("Offer"), "15% off")
    // A deal with no start has nothing to show in Runs, which is the column
    // that could not be filled before dates were asked for.
    expect(screen.getByRole("button", { name: "Create deal" })).toBeDisabled()
    await userEvent.type(screen.getByLabelText("Starts"), "2026-04-01")
    expect(screen.getByRole("button", { name: "Create deal" })).not.toBeDisabled()
  })

  it("refuses an end before the start", async () => {
    open(null)
    await userEvent.type(screen.getByLabelText("Name"), "Spring refresh")
    await userEvent.type(screen.getByLabelText("Offer"), "15% off")
    await userEvent.type(screen.getByLabelText("Starts"), "2026-04-01")
    await userEvent.type(screen.getByLabelText("Ends"), "2026-03-01")
    expect(screen.getByText(/cannot precede the start/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create deal" })).toBeDisabled()
  })

  it("does not ask an existing deal to be renamed", () => {
    open(EXISTING)
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
  })
})
