import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BusinessLocationsSection } from "@/components/blocks/admin/business-locations-section"
import { adminBusinesses, findBusinessBySlug } from "@/lib/admin-businesses"

/**
 * CamiHQ's multi-location switch (P1.2.4 / P1.9.3): on every partner, toggled
 * straight away, and a failed check lists every finding.
 */

describe("the multi-location switch in CamiHQ", () => {
  const shampooch = findBusinessBySlug("shampooch")!

  it("toggles straight away in both directions, with no confirm", async () => {
    render(<BusinessLocationsSection business={shampooch} />)
    const toggle = screen.getByRole("switch", { name: "Multi-location" })
    expect(toggle).toBeChecked()
    expect(screen.getByText(/On since 14 Sep 2026/)).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await userEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("is there for a single-location partner, starting off", async () => {
    const single = adminBusinesses.find((b) => (b.locationIds?.length ?? 0) <= 1)
    expect(single).toBeDefined()
    render(<BusinessLocationsSection business={single!} />)
    const toggle = screen.getByRole("switch", { name: "Multi-location" })
    expect(toggle).not.toBeChecked()

    await userEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it("lists every finding of a failed check and keeps the switch off", async () => {
    render(<BusinessLocationsSection business={shampooch} />)
    await userEvent.click(screen.getByRole("button", { name: "Show the check failing" }))

    expect(screen.getByText("Data check failed. Fix these first:")).toBeInTheDocument()
    const findings = within(screen.getByRole("list", { name: "Data check findings" }))
    expect(findings.getAllByRole("listitem")).toHaveLength(3)
    expect(findings.getByText("12 appointments have no location")).toBeInTheDocument()
    expect(findings.getByText("3 card machines have no location")).toBeInTheDocument()

    const toggle = screen.getByRole("switch", { name: "Multi-location" })
    expect(toggle).not.toBeChecked()
    expect(toggle).toBeDisabled()
  })

  it("puts the switch back how it was when the check passes again", async () => {
    render(<BusinessLocationsSection business={shampooch} />)
    await userEvent.click(screen.getByRole("button", { name: "Show the check failing" }))
    await userEvent.click(screen.getByRole("button", { name: "Show the check passing" }))
    expect(screen.getByRole("switch", { name: "Multi-location" })).toBeChecked()
    expect(screen.getByText(/On since 14 Sep 2026/)).toBeInTheDocument()

    // And an account switched off stays off.
    await userEvent.click(screen.getByRole("switch", { name: "Multi-location" }))
    await userEvent.click(screen.getByRole("button", { name: "Show the check failing" }))
    await userEvent.click(screen.getByRole("button", { name: "Show the check passing" }))
    expect(screen.getByRole("switch", { name: "Multi-location" })).not.toBeChecked()
  })
})
