import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ImportScenarioId } from "@/lib/imports/mock"
import { applySummaryFor, getScenario, IMPORT_SCENARIOS } from "@/lib/imports/mock"
import { placeholderSkuRows } from "@/lib/imports/outcome"
import { DonePanel } from "./done-panel"
import { ProgressPanel } from "./progress-panel"
import { ReviewPanel } from "./review-panel"
import { UploadPanel } from "./upload-panel"

// Every state of the flow, checked against one contract.
//
// This exists because the review of these screens went state by state: a
// screenshot would surface a panel that had been missed — centred while the
// others were left-aligned, or a narrow tinted block where the others had a
// card. Fixing them one at a time meant the next screenshot found the next one.
//
// The contract is what the steps agreed to share:
//  1. the root fills the frame (min-h-0 + flex-1), because the page no longer
//     scrolls and each panel scrolls in its own body;
//  2. the root is not a centred narrow block (no mx-auto), which is what every
//     drifting panel turned out to be;
//  3. a panel with a scrolling body keeps its primary action outside that body,
//     so the action is the panel's real edge rather than an overlay.
//
// Add a state to the flow, add it here.

function withPreview(id: ImportScenarioId) {
  const preview = getScenario(id).preview
  if (!preview) throw new Error(`scenario ${id} has no preview`)
  return preview
}

const PREVIEW_SCENARIOS = IMPORT_SCENARIOS.filter((s) => s.preview).map((s) => s.id)

type Case = {
  name: string
  render: () => ReturnType<typeof render>
  /**
   * The outcome step is short and deliberately does not stretch — stretching it
   * put a large gap between its last block and its footer. It still must not be
   * a centred narrow block.
   */
  fillsFrame?: boolean
}

const CASES: Case[] = [
  {
    name: "upload — waiting for a file",
    render: () => render(<UploadPanel onSubmit={vi.fn()} />),
  },
  {
    name: "upload — the server rejected the file",
    render: () =>
      render(
        <UploadPanel
          serverError='Column 4 should be "Retail Price" but found "Price".'
          onSubmit={vi.fn()}
        />,
      ),
  },
  {
    name: "progress — checking",
    render: () =>
      render(
        <ProgressPanel
          title="Checking your file"
          body="Nothing is saved yet."
          progress={40}
          onRetry={vi.fn()}
        />,
      ),
  },
  {
    name: "progress — the job failed",
    render: () =>
      render(
        <ProgressPanel
          title="Checking your file"
          body="Nothing is saved yet."
          progress={null}
          error="We couldn't read that file: unexpected end of archive."
          onRetry={vi.fn()}
        />,
      ),
  },
  ...PREVIEW_SCENARIOS.map((id) => ({
    name: `review — ${id}`,
    render: () =>
      render(<ReviewPanel preview={withPreview(id)} onConfirm={vi.fn()} onCancel={vi.fn()} />),
  })),
  ...PREVIEW_SCENARIOS.map((id) => ({
    name: `done — ${id}`,
    fillsFrame: false,
    render: () => {
      const preview = withPreview(id)
      return render(
        <DonePanel
          summary={applySummaryFor(preview)}
          preview={preview}
          placeholderSkuCount={placeholderSkuRows(preview).length}
          onImportAnother={vi.fn()}
        />,
      )
    },
  })),
]

describe("every panel state shares one frame", () => {
  for (const testCase of CASES) {
    it(`${testCase.name} sizes itself correctly and is not a centred block`, () => {
      const { container, unmount } = testCase.render()
      const root = container.firstElementChild
      expect(root).toBeTruthy()

      const className = root?.className ?? ""
      // Never a centred narrow block — that is what every drifting panel was.
      expect(className).not.toContain("mx-auto")

      if (testCase.fillsFrame === false) {
        // Flows naturally, so no gap between its content and its footer.
        expect(className).not.toContain("flex-1")
      } else {
        expect(className).toContain("min-h-0")
        expect(className).toContain("flex-1")
      }

      unmount()
    })
  }
})

describe("a scrolling panel keeps its primary action out of the scroll", () => {
  it("Review — the Import button is a sibling of the body, not inside it", () => {
    const { container, unmount } = render(
      <ReviewPanel preview={withPreview("aya-migration")} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    const body = container.querySelector(".overflow-y-auto")
    const action = screen.getByRole("button", { name: /^Import \d+ products?$/ })
    expect(body).toBeTruthy()
    expect(body?.contains(action)).toBe(false)
    unmount()
  })

  it("Done — has no scroll area at all, so nothing can hide inside one", () => {
    const preview = withPreview("aya-migration")
    const { container, unmount } = render(
      <DonePanel
        summary={applySummaryFor(preview)}
        preview={preview}
        placeholderSkuCount={placeholderSkuRows(preview).length}
        onImportAnother={vi.fn()}
      />,
    )
    expect(container.querySelectorAll(".overflow-y-auto")).toHaveLength(0)
    expect(screen.getByRole("link", { name: /Go to my products/ })).toBeTruthy()
    unmount()
  })
})
