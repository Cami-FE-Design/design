import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ImportScenarioId } from "@/lib/product-import/mock"
import { applySummaryFor, getScenario } from "@/lib/product-import/mock"
import { placeholderSkuRows } from "@/lib/product-import/outcome"
import { DonePanel } from "./done-panel"

describe("the Done step keeps the same skeleton as Review", () => {
  const scenarios: ImportScenarioId[] = [
    "aya-migration",
    "mixed",
    "duplicate-barcodes",
    "up-to-date",
    "placeholder-skus",
  ]

  function renderDone(id: ImportScenarioId) {
    const preview = getScenario(id).preview
    if (!preview) throw new Error(`scenario ${id} has no preview`)
    return render(
      <DonePanel
        summary={applySummaryFor(preview)}
        preview={preview}
        placeholderSkuCount={placeholderSkuRows(preview).length}
        onImportAnother={vi.fn()}
      />,
    )
  }

  for (const id of scenarios) {
    it(`renders a headline and a ledger for "${id}"`, () => {
      // Regression: the ledger used to be lookup-only, so an import that created
      // no brands or categories showed no counts card at all.
      const { container, unmount } = renderDone(id)
      expect(container.querySelector("h2")).toBeTruthy()
      expect(container.querySelector(".tabular-nums")).toBeTruthy()
      unmount()
    })
  }

  it("does not claim the catalogue is up to date when rows were left behind", () => {
    const { unmount } = renderDone("aya-migration")
    expect(screen.queryByText(/catalogue is up to date/i)).toBeNull()
    expect(screen.getByText(/still needs your attention/i)).toBeTruthy()
    unmount()
  })

  it("says so plainly when nothing was left behind", () => {
    // "mixed" has two rejects of its own, so the clean case is the file that
    // matched the catalogue outright.
    const { unmount } = renderDone("up-to-date")
    expect(screen.getByText(/catalogue is up to date/i)).toBeTruthy()
    unmount()
  })

  it("names why rows were left behind instead of only counting them", () => {
    const { unmount } = renderDone("aya-migration")
    expect(screen.getByText("17 rows were left behind")).toBeTruthy()
    expect(screen.getByText("These products have no SKU")).toBeTruthy()
    // No row-filter links here — there is no table left to filter.
    expect(screen.queryByText("Show these rows")).toBeNull()
    unmount()
  })
})
