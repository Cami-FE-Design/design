import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"
import type { AllocatedSession } from "@/lib/packages/allocate"
import { CartContent } from "./cart-summary"
import { totals } from "./mock"
import type { CartLine } from "./types"

/**
 * What a session-covered line looks like at the till (KC1.5, SCR-13).
 *
 * Rewritten 22 Sep 2026 against `cami-business`'s own coverage effect, which
 * this repo had backwards. Two different lines both wear the chip and they are
 * priced differently, which is what the first cut collapsed into one rule:
 *
 * - A line the **allocation** covers in this cart is set to `priceMinor: 0`
 *   with its real price parked in `originalPriceMinor` — on the LINE, not at
 *   render, which is what lets every total downstream stay a plain sum of the
 *   lines. The built sheet says it plainly: "that zero is a display device, not
 *   a price anyone typed", and losing the coverage restores it from that field.
 * - A line **reopened from a saved sale** keeps its gross price, because there
 *   the package was already recorded as a payment rather than a line discount.
 *
 * So the chip is the marker of coverage, and the price says which of the two
 * this line is.
 */

const SERVICE: CartLine = {
  uid: "l1",
  kind: "service",
  name: "Blow dry",
  priceMinor: 12000,
  durationMin: 45,
  qty: 1,
  sourceId: "blow-dry",
}

const SESSION: AllocatedSession = {
  colour: "#9b8bd6",
  sessionsRemaining: 3,
  sessionsTotal: 4,
  customerPackageId: "cp-1",
}

/** The same line after a session paid for it, as the cart stores it. */
const COVERED: CartLine = { ...SERVICE, priceMinor: 0, originalPriceMinor: 12000 }

function renderCart(line: CartLine, coverage?: Map<string, AllocatedSession>) {
  // The row's edit/remove controls are tooltipped, and a tooltip outside its
  // provider throws before anything renders. The app mounts one at the root.
  render(
    <TooltipProvider>
      <CartContent
        lines={[line]}
        hasClient
        onRemove={() => {}}
        onSetQty={() => {}}
        coverage={coverage}
      />
    </TooltipProvider>,
  )
}

describe("a line a session paid for", () => {
  it("reads zero, with what it was worth struck beneath it", () => {
    renderCart(COVERED, new Map([["l1", SESSION]]))
    expect(screen.getByText("AED 0")).toBeInTheDocument()
    expect(screen.getByText("AED 120")).toBeInTheDocument()
  })

  it("counts the sessions left, because that is what a client asks at the counter", () => {
    renderCart(COVERED, new Map([["l1", SESSION]]))
    expect(screen.getByText("3/4 Sessions Remaining")).toBeInTheDocument()
  })

  it("says Unlimited rather than a count for an uncapped package", () => {
    renderCart(
      COVERED,
      new Map([["l1", { ...SESSION, sessionsRemaining: null, sessionsTotal: null }]]),
    )
    expect(screen.getByText("Unlimited")).toBeInTheDocument()
  })

  it("charges in full, and wears no chip, when no session covered it", () => {
    renderCart(SERVICE)
    expect(screen.getByText("AED 120")).toBeInTheDocument()
    expect(screen.queryByText("AED 0")).not.toBeInTheDocument()
    expect(screen.queryByText(/Sessions Remaining/)).not.toBeInTheDocument()
  })
})

/**
 * The footer knows nothing about packages, and that is the fix.
 *
 * It used to be told: first as a tender, then as a named deduction. Both worked
 * for the Payment step and neither reached the Cart step's own footer, which
 * sums the lines itself — so the line read AED 0 and To pay asked for the full
 * price two inches below it. The built cart does not have the problem because
 * the zero is on the LINE, so every total is a plain sum. These assert that.
 */
describe("what the totals make of a covered line", () => {
  it("bills nothing for it", () => {
    expect(totals([COVERED]).totalMinor).toBe(0)
  })

  it("still bills the lines beside it", () => {
    const other: CartLine = { ...SERVICE, uid: "l2", priceMinor: 6000 }
    expect(totals([COVERED, other]).totalMinor).toBe(6000)
  })

  it("bills it in full once the coverage is gone", () => {
    // Losing a session restores the price from `originalPriceMinor` rather than
    // from a second copy held somewhere else.
    const restored: CartLine = { ...SERVICE, priceMinor: COVERED.originalPriceMinor ?? 0 }
    expect(totals([restored]).totalMinor).toBe(12000)
  })
})
