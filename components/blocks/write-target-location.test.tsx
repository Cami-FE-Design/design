import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { WriteTargetLocation } from "@/components/blocks/write-target-location"
import { LocationsProvider } from "@/lib/locations/store"

// A paused branch used to be filtered out of the list and explained in a
// footnote under the field — a rule stated before the operator had asked
// anything, about branches they could not see. It is now listed, badged, and
// answers for itself when picked. The one thing that must not change is R12:
// picking it still cannot produce a write target, because all six callers gate
// Save on the value this control reports.

beforeAll(() => {
  // jsdom implements no Pointer Events, and Radix's Select trigger calls these
  // on the way to opening. Without them the list never opens and every
  // assertion below fails for a reason that has nothing to do with the control.
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

function renderControl() {
  const onChange = vi.fn()
  render(
    <LocationsProvider persist={false}>
      <WriteTargetLocation value={null} onChange={onChange} action="This appointment" />
    </LocationsProvider>,
  )
  return onChange
}

async function openTheList() {
  await userEvent.click(screen.getByRole("combobox"))
  return await screen.findByRole("listbox")
}

/** What the control actually reported as a write target, ignoring its own clears. */
function targetsReported(onChange: ReturnType<typeof vi.fn>) {
  return onChange.mock.calls.map(([id]) => id).filter((id) => typeof id === "string" && id !== "")
}

describe("the branch a write lands on", () => {
  it("lists paused branches instead of hiding them", async () => {
    renderControl()
    const list = await openTheList()

    // The state is on the row, in the badge the rest of the product uses, so it
    // is readable before a click is spent on it.
    expect(within(list).getAllByText("Paused").length).toBeGreaterThan(0)
  })

  it("no longer explains absent branches in a footnote", () => {
    renderControl()

    expect(screen.queryByText(/not listed/)).toBeNull()
  })

  it("reports nothing upward when a paused branch is picked, and says why", async () => {
    const onChange = renderControl()
    const list = await openTheList()

    const pausedRow = within(list).getAllByText("Paused")[0].closest('[role="option"]')
    expect(pausedRow).not.toBeNull()
    // The row reads "<name>Paused" — the badge sits inside it.
    const pausedName = (pausedRow as HTMLElement).textContent?.replace(/Paused$/, "").trim()
    await userEvent.click(pausedRow as HTMLElement)

    // R12, and the whole reason the pick is held locally rather than reported:
    // every caller gates Save on this value, so a paused branch must never
    // arrive as one.
    expect(targetsReported(onChange)).toEqual([])

    // And the operator is told — about the branch they actually chose, naming
    // the write they were in the middle of.
    const notice = screen.getByText(/takes no new entries/)
    expect(notice.textContent).toContain(pausedName)
    expect(notice.textContent).toContain("this appointment")
  })

  it("says what Save is waiting for, once the answer is actually due", async () => {
    render(
      <LocationsProvider persist={false}>
        <WriteTargetLocation
          value={null}
          onChange={vi.fn()}
          action="This sale"
          requiredNote="Choose a location to continue"
          requiredDue
        />
      </LocationsProvider>,
    )

    expect(screen.getByText("Choose a location to continue")).toBeDefined()
  })

  it("stays quiet until it is due — an unstarted sale is not a mistake", async () => {
    // It rendered in destructive red the moment the sheet opened, above a cart
    // with nothing in it: a screen telling the operator off for not having done
    // something yet.
    render(
      <LocationsProvider persist={false}>
        <WriteTargetLocation
          value={null}
          onChange={vi.fn()}
          action="This sale"
          requiredNote="Choose a location to continue"
        />
      </LocationsProvider>,
    )

    expect(screen.queryByText("Choose a location to continue")).toBeNull()
  })

  it("drops that note once a paused branch is picked — one answer, not two", async () => {
    render(
      <LocationsProvider persist={false}>
        <WriteTargetLocation
          value={null}
          onChange={vi.fn()}
          action="This sale"
          requiredNote="Choose a location to continue"
        />
      </LocationsProvider>,
    )
    const list = await openTheList()
    await userEvent.click(within(list).getAllByText("Paused")[0].closest('[role="option"]')!)

    // The paused branch explains itself; "choose a location" underneath would be
    // the same instruction in weaker words.
    expect(screen.getByText(/takes no new entries/)).toBeDefined()
    expect(screen.queryByText("Choose a location to continue")).toBeNull()
  })

  it("reports a trading branch upward as the write target", async () => {
    const onChange = renderControl()
    const list = await openTheList()

    const trading = within(list)
      .getAllByRole("option")
      .find((option) => within(option).queryByText(/^(Paused|Archived)$/) === null)
    expect(trading).toBeDefined()
    await userEvent.click(trading as HTMLElement)

    expect(targetsReported(onChange)).toHaveLength(1)
    expect(screen.queryByText(/takes no new entries/)).toBeNull()
  })
})
