import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { ImportScenarioId } from "@/lib/imports/mock"
import { getScenario } from "@/lib/imports/mock"
import { ReviewPanel } from "./review-panel"

function renderScenario(id: ImportScenarioId) {
  const preview = getScenario(id).preview
  if (!preview) throw new Error(`scenario ${id} has no preview`)
  return render(<ReviewPanel preview={preview} onConfirm={vi.fn()} onCancel={vi.fn()} />)
}

describe("the review screen keeps one skeleton across outcomes", () => {
  // The complaint that prompted this: three scenarios produced three different
  // page compositions — a card here, a tinted notice there, nothing somewhere
  // else. Headline, ledger and table must be present in every case.
  const scenarios: ImportScenarioId[] = [
    "aya-migration",
    "mixed",
    "duplicate-barcodes",
    "all-rejected",
    "up-to-date",
    "placeholder-skus",
  ]

  for (const id of scenarios) {
    it(`renders a headline, a ledger and a table for "${id}"`, () => {
      const { container, unmount } = renderScenario(id)

      // Headline: always an h2, never a tinted notice box.
      expect(container.querySelector("h2")).toBeTruthy()

      // Ledger: always present, always at least one count.
      const ledger = container.querySelector(".tabular-nums")
      expect(ledger).toBeTruthy()

      // Table toolbar: always present, so the frame never changes shape.
      expect(screen.getByText(/^(All \d+ rows?|\d+ of \d+ rows?( need you .*)?)$/i)).toBeTruthy()

      // Table header, sticky so it survives a long scroll.
      const header = container.querySelector(".sticky.top-0")
      expect(header).toBeTruthy()
      expect(header?.textContent).toContain("Details")

      unmount()
    })
  }
})

describe("the review screen opens on the rows that need a decision", () => {
  it("shows Aya's 17 blocked rows, not all 100, and says so", () => {
    const { unmount } = renderScenario("aya-migration")
    expect(screen.getByText(/17 of 100 rows need you/)).toBeTruthy()
    expect(screen.getByRole("button", { name: "Needs you (17)" })).toBeTruthy()
    unmount()
  })

  it("opens on every row when nothing needs a decision", () => {
    const { unmount } = renderScenario("up-to-date")
    expect(screen.getByText(/^All \d+ rows?$/)).toBeTruthy()
    unmount()
  })
})

describe("the status filter only appears when it can do something", () => {
  it("is absent when every row shares one status", () => {
    const { unmount } = renderScenario("all-rejected")
    expect(screen.queryByText("Filter rows")).toBeNull()
    unmount()
  })

  it("is present when several statuses are in the file", () => {
    const { unmount } = renderScenario("mixed")
    expect(screen.getByText("Filter rows")).toBeTruthy()
    unmount()
  })
})

describe("lookups are grouped so a brand is distinguishable from a category", () => {
  it("names each kind, and omits a kind with nothing in it", () => {
    const { unmount } = renderScenario("aya-migration")
    // Aya's file creates 13 brands and 14 categories, and no suppliers.
    expect(screen.getByText("Brands")).toBeTruthy()
    expect(screen.getByText("Categories")).toBeTruthy()
    expect(screen.queryByText("Suppliers")).toBeNull()
    unmount()
  })

  it("caps long lists and offers the rest", () => {
    const { unmount } = renderScenario("aya-migration")
    // 13 brands, 5 shown, so the line carries a +8 and one Show all.
    expect(screen.getByText(/Acana, Applaws, Cosmo, Eurolitter, Farmina \+8/)).toBeTruthy()
    expect(screen.getByText("Show all")).toBeTruthy()
    unmount()
  })

  it("shows every name without a Show all when nothing is capped", () => {
    const { unmount } = renderScenario("mixed")
    // 2 brands, 2 categories, 1 supplier — all under the cap.
    expect(screen.getByText("Suppliers")).toBeTruthy()
    expect(screen.queryByText("Show all")).toBeNull()
    unmount()
  })
})

describe("unresolved tax rates join the advisories", () => {
  it("does not get a notice block of its own", () => {
    const { unmount } = renderScenario("mixed")
    // One "worth knowing" heading covering warnings and tax alike.
    expect(screen.getAllByText("Worth knowing before you import")).toHaveLength(1)
    expect(screen.getByText("We didn't recognise a tax rate")).toBeTruthy()
    unmount()
  })
})

describe("a plain new product's outcome cell stays empty", () => {
  it("never repeats its own status badge", async () => {
    const { unmount } = renderScenario("aya-migration")
    // The screen opens on the 17 rows that need a decision, so the create rows
    // are reached through the filter.
    await userEvent.click(screen.getByRole("button", { name: "Everything (100)" }))
    // "Will be added" is the badge label; it must appear once per create row,
    // not twice (badge + outcome cell).
    const badges = screen.getAllByText("Will be added")
    expect(badges).toHaveLength(83)
    unmount()
  })
})

describe("the action bar sits outside the scroll area", () => {
  it("is a sibling of the scrolling body, not an overlay on top of it", () => {
    // Regression: as a sticky overlay the confirm bar had z-index:auto and lost
    // to the status filter's `relative z-[1]` segments, which painted through it
    // and over the Import button. Pinned by the flex column instead, it cannot
    // overlap the content at all — so the structure is what gets asserted.
    const { container, unmount } = renderScenario("aya-migration")

    const scrollBody = container.querySelector(".overflow-y-auto")
    expect(scrollBody).toBeTruthy()

    const importButton = screen.getByRole("button", { name: /^Import \d+ products?$/ })
    expect(scrollBody?.contains(importButton)).toBe(false)

    // The table's column header sticks to the top of that scroll area.
    const header = container.querySelector(".sticky.top-0")
    expect(header).toBeTruthy()
    expect(scrollBody?.contains(header as Node)).toBe(true)
    unmount()
  })
})

describe("there is exactly one scroll area, and the header cannot gap", () => {
  it("does not nest a second scroll container inside the panel body", () => {
    // Regression: the table used to scroll inside the already-scrolling panel
    // body, putting two scrollbars side by side.
    const { container, unmount } = renderScenario("aya-migration")
    expect(container.querySelectorAll(".overflow-y-auto")).toHaveLength(1)
    unmount()
  })

  it("gives the sticky header square edges and a solid background", () => {
    // Regression: inside a rounded, fully bordered box the sticky header left
    // gaps at the corners as the box scrolled past it — it read as breaking up.
    const { container, unmount } = renderScenario("aya-migration")
    const header = container.querySelector(".sticky.top-0")
    expect(header).toBeTruthy()
    expect(header?.className).not.toMatch(/rounded/)
    expect(header?.className).toMatch(/bg-sand-3/)

    const band = header?.parentElement
    expect(band?.className).not.toMatch(/rounded/)
    unmount()
  })
})
