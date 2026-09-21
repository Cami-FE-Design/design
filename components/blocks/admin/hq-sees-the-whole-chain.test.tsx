import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BusinessLocationsSection } from "@/components/blocks/admin/business-locations-section"
import { findBusinessBySlug } from "@/lib/admin-businesses"

/**
 * HQ sees the whole chain, not a third of it (SCR-16, HQ1.2).
 *
 * The section handed `LocationsProvider` the partner's nine grants and no
 * estate, so the provider fell back to the three-branch demo estate and nine
 * ids resolved against three. The tab counted nine — it reads the admin record
 * — while the panel under it listed three and the money roll-up summed those
 * three. Two numbers for one chain, on the screen whose entire premise is that
 * "viewing from HQ shows the same per-branch breakdown and roll-up an owner
 * would see".
 *
 * Nothing threw and the three branches shown were real, which is why it read as
 * a design decision rather than a defect.
 */

describe("the chain view holds the partner's whole estate", () => {
  const shampooch = findBusinessBySlug("shampooch")!

  it("lists every branch the partner record claims", () => {
    render(<BusinessLocationsSection business={shampooch} />)
    const claimed = shampooch.locationIds?.length ?? 0
    expect(claimed).toBeGreaterThan(3)
    expect(screen.getByRole("heading", { name: `${claimed} locations` })).toBeInTheDocument()
  })

  it("names the branches an owner would see, not the demo three", async () => {
    render(<BusinessLocationsSection business={shampooch} />)
    // The list is short by default — nine two-line cards push the money roll-up
    // off the bottom of the dialog — so the branches past the fourth are behind
    // the counted toggle. Al Reem exists only in the nine-branch estate: against
    // the three-branch fallback it is absent however much you expand.
    expect(screen.queryByText("Shampooch Al Reem")).not.toBeInTheDocument()
    for (const button of screen.getAllByRole("button", { name: /Show \d+ more location/ })) {
      await userEvent.click(button)
    }
    // Twice over: once in the branch list, once in the money roll-up. That is
    // the point — both halves read the same estate now.
    expect(screen.getAllByText("Shampooch Al Reem").length).toBeGreaterThan(1)
  })

  it("keeps the list short until asked, so the roll-up stays on screen", () => {
    render(<BusinessLocationsSection business={shampooch} />)
    const claimed = shampooch.locationIds?.length ?? 0
    expect(
      screen.getAllByRole("button", { name: /Show \d+ more location/ }).length,
    ).toBeGreaterThan(0)
    // The heading still states the truth, so a short list reads as a choice
    // rather than as the whole account.
    expect(screen.getByRole("heading", { name: `${claimed} locations` })).toBeInTheDocument()
  })

  it("says the same thing in the heading and in the count beneath it", () => {
    render(<BusinessLocationsSection business={shampooch} />)
    const claimed = shampooch.locationIds?.length ?? 0
    // "N trading, M not" has to add up to the heading, or the panel disagrees
    // with itself in front of an Account Manager.
    const summary = screen.getByText(/trading/)
    const [, trading, notTrading] = summary.textContent!.match(/(\d+) trading, (\d+) not/)!
    expect(Number(trading) + Number(notTrading)).toBe(claimed)
  })

  it("shows no chain view for a partner trading from one address (G3)", () => {
    const single = findBusinessBySlug("velvet-paw")!
    render(<BusinessLocationsSection business={single} />)
    expect(screen.getByText(/trades from one location/)).toBeInTheDocument()
  })
})
