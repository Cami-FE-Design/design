import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MoneyByLocationView } from "@/components/blocks/money/money-by-location"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"
import type { MoneyTx } from "@/lib/money/types"

// A transaction points at a branch by id and the name is resolved where it is
// printed, so a branch renamed in Settings is renamed everywhere it appears.
// Every place that prints one has to do that resolving — and the quiet-branch
// list has two of them, one sentence for three or fewer and a list beyond that.
// Only the sentence was converted, so the list printed "shampooch-al-quoz" at
// an operator. With nine branches granted, more than three quiet ones is the
// ordinary case, which made the unconverted half the half that usually runs.

const filter = { fromIso: "2026-08-01", toIso: "2026-08-31" }

function sale(locationId: string, aed: number): MoneyTx {
  return {
    id: `tx-${locationId}`,
    kind: "sale",
    rail: "terminal",
    amountMinor: aed * 100,
    at: "2026-08-10T10:00:00+04:00",
    locationId,
    confirmation: "confirmed",
  }
}

function renderWithEstate(txs: MoneyTx[]) {
  return render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
      <MoneyByLocationView txs={txs} filter={filter} />
    </LocationsProvider>,
  )
}

/** Any raw branch id that leaked to the screen — they are slugs, names are not. */
function slugsOnScreen() {
  return (document.body.textContent ?? "").match(/\bshampooch-[a-z-]+\b/g) ?? []
}

describe("money by location names its branches", () => {
  it("resolves names in the quiet list, not just the quiet sentence", () => {
    // One branch takes money; the other eight are quiet, so the list renders
    // rather than the sentence.
    renderWithEstate([sale("shampooch-jvc", 400)])

    expect(screen.getByText(/No takings this period at \d+ locations:/)).toBeDefined()
    expect(slugsOnScreen()).toEqual([])
  })

  it("resolves names in the quiet sentence too", () => {
    // Enough branches trading that three or fewer are quiet, which is the other
    // half of the same decision.
    const trading = NINE_BRANCH_ESTATE.filter((l) => l.status === "live")
    expect(trading.length).toBeGreaterThan(3)
    renderWithEstate(trading.slice(0, trading.length - 1).map((l) => sale(l.id, 200)))

    expect(slugsOnScreen()).toEqual([])
  })

  it("names the branches that did take money", () => {
    renderWithEstate([sale("shampooch-jvc", 400)])

    const jvc = NINE_BRANCH_ESTATE.find((l) => l.id === "shampooch-jvc")
    expect(jvc).toBeDefined()
    expect(screen.getAllByText(jvc!.name).length).toBeGreaterThan(0)
  })
})
