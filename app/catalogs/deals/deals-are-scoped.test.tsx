import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

// AppShell's sidebar and topbar read the router. Nothing here exercises
// navigation, so it is stubbed rather than provided.
//
// Assertions below count matches rather than expecting exactly one. That began
// as a workaround — AppShell rendered its children twice, once per breakpoint —
// and the shell renders once now, so the counts are simply tolerant rather than
// necessary.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/catalogs/deals",
  useSearchParams: () => new URLSearchParams(),
}))

import DealsPage from "@/app/catalogs/deals/page"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { type LocationGrants, LocationsProvider } from "@/lib/locations/store"

/**
 * The Deals list is bounded, and says where each deal runs (DW3.4, R18, R24).
 *
 * The rule had a type and a playground row and no screen, which is the shape of
 * a rule nobody can review. These assert the three things the screen exists to
 * get right: a deal scoped elsewhere is not yours to read, "all locations" is a
 * named set rather than today's nine, and a deal with nothing chosen says it
 * cannot run instead of passing as chain-wide.
 */

// AppShell's topbar is tooltipped, and a tooltip outside its provider throws
// before anything renders. The app mounts one at the root.
function open(grants: LocationGrants) {
  render(
    <TooltipProvider>
      <LocationsProvider
        persist={false}
        initialLocations={NINE_BRANCH_ESTATE}
        initialGrants={grants}
      >
        <DealsPage />
      </LocationsProvider>
    </TooltipProvider>,
  )
}

describe("what an owner sees", () => {
  it("lists the chain-wide deal as a named set, not a count of today's branches", () => {
    open("all")
    expect(screen.getAllByText("Summer groom offer").length).toBeGreaterThan(0)
    expect(screen.getAllByText("All locations").length).toBeGreaterThan(0)
  })

  it("names a few branches rather than counting them, until there are too many", () => {
    open("all")
    // Three is where a list stops being readable and a count starts being the
    // more useful fact.
    expect(screen.getAllByText("3 locations").length).toBeGreaterThan(0)
  })

  it("says a deal with nothing chosen cannot run, rather than letting it pass as chain-wide", () => {
    open("all")
    // Two lines in the Locations column, matching the shape of the rows above
    // it: the claim, then what follows from it.
    expect(screen.getAllByText("No locations").length).toBeGreaterThan(0)
    expect(screen.getAllByText("cannot run").length).toBeGreaterThan(0)
  })
})

describe("what a one-branch manager sees", () => {
  it("is shown a deal that reaches their branch", () => {
    open(["shampooch-mirdif"])
    expect(screen.getAllByText("Mirdif Tuesdays").length).toBeGreaterThan(0)
    // A chain-wide deal does run at their branch, so it belongs to them too.
    expect(screen.getAllByText("Summer groom offer").length).toBeGreaterThan(0)
  })

  it("is not shown a deal scoped to branches they do not hold", () => {
    open(["shampooch-mirdif"])
    expect(screen.queryByText("Abu Dhabi launch")).not.toBeInTheDocument()
  })

  it("is told what a chain-wide deal reaches OF THEIRS, not the chain's nine", () => {
    // Two of nine, because at one branch `isMultiLocation` is false and the
    // Locations column is absent entirely — the same rule that hides the
    // switcher from a single-branch reader (DW1.2). An area manager on two is
    // the case where the count has something to say.
    open(["shampooch-mirdif", "shampooch-jvc"])
    expect(screen.getAllByText(/including 2 of yours/).length).toBeGreaterThan(0)
  })

  it("shows no Locations column to somebody holding a single branch", () => {
    open(["shampooch-mirdif"])
    expect(screen.queryByRole("columnheader", { name: "Locations" })).not.toBeInTheDocument()
  })
})

describe("a single-branch business", () => {
  it("has no Locations column, because there is nothing to tell apart", () => {
    render(
      <TooltipProvider>
        <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE.slice(0, 1)}>
          <DealsPage />
        </LocationsProvider>
      </TooltipProvider>,
    )
    expect(screen.queryByRole("columnheader", { name: "Locations" })).not.toBeInTheDocument()
  })
})

describe("the row menu only offers what it can do", () => {
  it("does not let you activate a deal whose dates have passed", async () => {
    // It offered "Activate", did nothing when pressed, and left the reader to
    // guess why: the dates decide, so a stored active resolves straight back.
    // Spring refresh starts 10 Aug with today at 24 Aug — its dates are wide
    // open. What stops it is having no location, and the menu said the
    // opposite until the two blockers stopped sharing a flag.
    open("all")
    await userEvent.click(screen.getAllByRole("button", { name: /Options for Spring refresh/ })[0]!)
    const item = screen.getByRole("menuitem", { name: /Activate/ })
    expect(item).toHaveAttribute("aria-disabled", "true")
    expect(item).toHaveTextContent("choose a location first")
  })

  it("offers Activate on a deal somebody stopped mid-run", async () => {
    open("all")
    await userEvent.click(screen.getAllByRole("button", { name: /Options for Refer a friend/ })[0]!)
    expect(screen.getByRole("menuitem", { name: "Activate" })).toBeInTheDocument()
  })

  it("actually changes the row when you stop a running deal", async () => {
    // "Nothing changes when I press it" was the whole complaint.
    open("all")
    const before = screen.queryAllByText("Active").length
    await userEvent.click(
      screen.getAllByRole("button", { name: /Options for Summer groom offer/ })[0]!,
    )
    await userEvent.click(screen.getByRole("menuitem", { name: "Deactivate" }))
    expect(screen.queryAllByText("Active").length).toBeLessThan(before)
  })

  it("does not leave an archived deal with an empty menu", async () => {
    open("all")
    await userEvent.click(screen.getAllByRole("button", { name: /Options for Eid weekend/ })[0]!)
    expect(screen.getByRole("menuitem", { name: "Restore" })).toBeInTheDocument()
  })
})
