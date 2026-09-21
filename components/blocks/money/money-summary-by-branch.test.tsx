import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MoneySummaryView } from "@/components/blocks/money/money-summary"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"
import type { MoneyTx } from "@/lib/money/types"

/**
 * The owner's own Account summary carries the per-branch breakdown (SCR-15).
 *
 * It did not, and the gap was invisible because every surface involved was
 * built and tested: Activity had a branch filter, `MoneyByLocationView` had
 * nine tests, and the breakdown was mounted at CamiHQ. Nothing was broken —
 * the owner simply had no way to reach the thing HQ's own story promises they
 * can see ("the same breakdown and roll-up an owner sees").
 *
 * So this asserts the mounting rather than the arithmetic, which
 * `lib/money/by-location.test.ts` already holds.
 */

const RANGE = {
  from: new Date("2026-08-01T00:00:00+04:00"),
  to: new Date("2026-08-31T00:00:00+04:00"),
}

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

function renderSummary(estate: typeof NINE_BRANCH_ESTATE) {
  render(
    <LocationsProvider persist={false} initialLocations={estate}>
      <MoneySummaryView
        txs={[sale("shampooch-jvc", 4200), sale("shampooch-jumeirah", 3100)]}
        payouts={[]}
        rails={{ online: true, terminal: true }}
        range={RANGE}
        onRangeChange={() => {}}
        variant="two-rail"
        block={null}
      />
    </LocationsProvider>,
  )
}

describe("the account summary answers which branch", () => {
  it("carries the breakdown, so the roll-up is not the only figure on offer", () => {
    renderSummary(NINE_BRANCH_ESTATE)
    expect(screen.getByRole("heading", { name: "Money by location" })).toBeInTheDocument()
  })

  it("leaves a single-site business alone, the way the HQ tab does", () => {
    renderSummary(NINE_BRANCH_ESTATE.slice(0, 1))
    expect(screen.queryByRole("heading", { name: "Money by location" })).not.toBeInTheDocument()
  })
})
