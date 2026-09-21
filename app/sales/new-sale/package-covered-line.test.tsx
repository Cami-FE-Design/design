import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"
import { CartContent, CheckoutFooter } from "./cart-summary"
import type { CartLine } from "./types"

/**
 * What a redeemed package looks like at the till (KC1.5, SCR-13).
 *
 * The rule was already arithmetic in `package-pays.test.ts`; this is the half
 * of it the operator actually sees. Both halves exist because the first cut got
 * each of them wrong in the opposite direction: the line was rewritten to AED 0
 * *and* the footer ignored the package entirely, so the sale showed no money
 * against a line that had been paid for, and a Left to pay the flow itself
 * disagreed with.
 *
 * Confirmed against the built cart (`new-sale/cart-summary.tsx` in
 * cami-business): "A line reopened from a saved sale keeps its gross price —
 * the package was recorded as a payment, not a line discount." The chip is the
 * marker; the price is not the marker.
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

function renderCart(covered: string[]) {
  // The row's edit/remove controls are tooltipped, and a tooltip outside its
  // provider throws before anything renders. The app mounts one at the root.
  render(
    <TooltipProvider>
      <CartContent
        lines={[SERVICE]}
        hasClient
        onRemove={() => {}}
        onSetQty={() => {}}
        packageCovered={covered}
      />
    </TooltipProvider>,
  )
}

describe("a package-covered line", () => {
  it("keeps its own price, because the package paid rather than discounted", () => {
    renderCart(["l1"])
    expect(screen.getByText("AED 120")).toBeInTheDocument()
    expect(screen.queryByText("AED 0")).not.toBeInTheDocument()
  })

  it("says so with a chip, so zero-looking and already-paid-for stay different facts", () => {
    renderCart(["l1"])
    expect(screen.getByText("Included in package")).toBeInTheDocument()
  })

  it("wears no chip while nothing is applied", () => {
    renderCart([])
    expect(screen.queryByText("Included in package")).not.toBeInTheDocument()
  })
})

function renderFooter(packagePaidMinor: number) {
  render(
    <CheckoutFooter
      baseMinor={12000}
      tipMinor={0}
      ctaLabel="Pay now"
      onCta={() => {}}
      onAddTip={() => {}}
      onAddCartDiscount={() => {}}
      onAddSaleNote={() => {}}
      onSaveDraft={() => {}}
      onCancelSale={() => {}}
      packagePaidMinor={packagePaidMinor}
    />,
  )
}

describe("the checkout footer counts the package as a tender", () => {
  it("names it beside the cash and the card, so the money is not just gone", () => {
    renderFooter(12000)
    expect(screen.getByText("Package")).toBeInTheDocument()
    expect(screen.getByText("- AED 120.00")).toBeInTheDocument()
  })

  it("settles the sale it fully covers", () => {
    renderFooter(12000)
    expect(screen.getByText("Full payment added")).toBeInTheDocument()
  })

  it("leaves the rest to pay when it covers part", () => {
    renderFooter(5000)
    expect(screen.getByText("Left to pay · AED 70.00")).toBeInTheDocument()
  })

  it("shows no breakdown at all when nothing has been taken", () => {
    renderFooter(0)
    expect(screen.queryByText("Package")).not.toBeInTheDocument()
  })
})
