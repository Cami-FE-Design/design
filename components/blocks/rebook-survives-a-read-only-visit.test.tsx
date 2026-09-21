import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MOCK_CLIENTS } from "@/app/clients/mock"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * A visit you cannot act on can still be rebooked (SCR-07, R13, G1).
 *
 * Two tabs disagreed about one visit. On Appointments, a visit at a branch
 * outside the reader's grant lost every action including **Rebook**; on
 * Overview, the same visit kept its Rebook button. One of them had to be wrong.
 *
 * Rebook is the one that stays, because rebooking is not an action on that
 * visit — it starts a new appointment, and a new appointment names its own
 * branch through the write-target control like every other write. Reception at
 * JVC rebooking a client who last came to Jumeirah, into JVC, is the ordinary
 * case; refusing it is the telephone call this feature exists to delete.
 *
 * What stays blocked is anything that acts on the existing record at the branch
 * that holds it — Checkout, View sale.
 */

// The four fields the dialog actually takes, the way /clients passes them —
// the directory fixture carries more, and its tags are looser than the dialog's.
const source = MOCK_CLIENTS.find((c) => c.id === "millie-cassidy")!
const MILLIE = {
  id: source.id,
  name: source.name,
  phone: source.phone,
  email: source.email,
}

function openAs(grants: string[]) {
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE} initialGrants={grants}>
      <ClientDetailDialog open onOpenChange={() => {}} client={MILLIE} initialTab="appointments" />
    </LocationsProvider>,
  )
}

describe("a visit at a branch you do not hold", () => {
  it("says it is read-only, and names the branch", () => {
    openAs(["shampooch-jvc"])
    expect(screen.getAllByText(/Read-only/).length).toBeGreaterThan(0)
  })

  it("still offers Rebook, because that is a new booking and not this one", () => {
    openAs(["shampooch-jvc"])
    expect(screen.getAllByRole("button", { name: "Rebook" }).length).toBeGreaterThan(0)
  })

  it("does not offer the actions that act on the record itself", () => {
    openAs(["shampooch-jvc"])
    // Millie's only bookable-status visit sits at JVC, which this reader holds,
    // so a Checkout here would belong to it — what must not appear is one
    // against a branch they cannot open. Counting is the check: fewer Checkouts
    // than visits.
    const readOnly = screen.getAllByText(/Read-only/).length
    const checkouts = screen.queryAllByRole("button", { name: "Checkout" }).length
    expect(checkouts).toBeLessThan(readOnly + checkouts)
  })

  it("leaves an owner's visits alone — every action, every branch", () => {
    openAs(NINE_BRANCH_ESTATE.map((l) => l.id))
    // Al Quoz is paused, so it still refuses writes even for an owner. Every
    // other visit keeps its actions.
    expect(screen.queryAllByText(/you don't have access to/).length).toBe(0)
  })
})
