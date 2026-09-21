import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CustomerCardSettingsPanel } from "@/components/blocks/customer-card-settings-panel"
import { getCustomerCard, previewCardSlugForBusiness } from "@/lib/customer-card/mock"
import { getCustomerCardTheme } from "@/lib/customer-card/theme"
import { getPublicBusiness } from "@/lib/public-business"

// Branding belongs to the business, not to any one of its addresses: a chain
// sets one palette and every branch's card carries it. Both halves of that were
// broken once the public model grew branches — the panel resolved to the chain
// and then asked for the chain's *card*, which does not exist, so the preview
// rendered as an empty box; and the palette was keyed per branch, so the nine
// Shampooch branches were nine separate settings nobody could reach.

describe("branding is the business's, not a branch's", () => {
  it("previews a real card for a chain, whose own slug has none", () => {
    // The shape of the bug: the chain resolves to a picker, so it has no card.
    expect(getPublicBusiness("shampooch")).toBeUndefined()
    expect(getCustomerCard("shampooch")).toBeUndefined()

    // ...and the panel still has something to show, by standing a branch in.
    const previewSlug = previewCardSlugForBusiness("shampooch")
    expect(previewSlug).toBeDefined()
    expect(getPublicBusiness(previewSlug!)).toBeDefined()
    expect(getCustomerCard(previewSlug!)).toBeDefined()
  })

  it("resolves the same palette whichever branch asks", () => {
    const atBusiness = getCustomerCardTheme("shampooch").id
    const atBranch = getCustomerCardTheme("shampooch-jvc").id
    const atOtherBranch = getCustomerCardTheme("shampooch-jumeirah").id

    expect(atBranch).toBe(atBusiness)
    expect(atOtherBranch).toBe(atBusiness)
    // The seed, not the generic default — a chain whose seed was keyed to one
    // branch left its other branches falling through to whatever was last in
    // the list.
    expect(atBusiness).toBe("violet")
  })

  it("renders the preview card, not an empty box", () => {
    render(<CustomerCardSettingsPanel />)

    expect(screen.getByText("Preview")).toBeDefined()
    // Five themes to choose from, and a card actually drawn beside them. The
    // regression looked like a working panel: heading, label and all five rows
    // rendered, and only the card was missing.
    expect(screen.getAllByRole("radio")).toHaveLength(5)

    const scaledCard = document.querySelector('[class*="zoom"]')
    expect(scaledCard).not.toBeNull()
    expect(scaledCard!.innerHTML.length).toBeGreaterThan(0)
  })
})
