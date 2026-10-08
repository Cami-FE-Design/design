import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsIcon } from "lucide-react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { TerminalsPanel } from "@/components/blocks/settings/terminals-panel"
import { UNASSIGNED_DEMO_TERMINAL } from "@/lib/terminals/store"

/** P1.8.3: a machine with no location says so and can be given one. */

beforeAll(() => {
  // jsdom has no Pointer Events; Radix's Select calls these to open.
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

function renderPanel() {
  return render(
    <TerminalsPanel
      onBack={() => {}}
      breadcrumbRoot={{ label: "Payments", icon: SettingsIcon }}
      initialState="full"
    />,
  )
}

function rowOf(name: string) {
  const row = screen.getByText(name).closest("li")
  if (!row) throw new Error(`no row for ${name}`)
  return row
}

describe("card machines with no location", () => {
  it("read No location in one list, with a Set location button", () => {
    renderPanel()
    expect(screen.queryByRole("heading", { level: 4 })).not.toBeInTheDocument()
    expect(screen.getAllByRole("list")).toHaveLength(1)

    const row = rowOf(UNASSIGNED_DEMO_TERMINAL.name)
    expect(within(row).getByText(/No location/)).toBeInTheDocument()
    expect(within(row).getByRole("button", { name: "Set location" })).toBeInTheDocument()
  })

  it("move into place from the demo list once a location is set", async () => {
    renderPanel()
    await userEvent.click(screen.getByRole("button", { name: "Set location" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveTextContent("Set location")

    await userEvent.click(within(dialog).getByRole("combobox"))
    const [first] = await screen.findAllByRole("option")
    const chosen = first.textContent ?? ""
    await userEvent.click(first)
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Save" }))

    const row = rowOf(UNASSIGNED_DEMO_TERMINAL.name)
    expect(within(row).queryByText(/No location/)).not.toBeInTheDocument()
    expect(within(row).getByText(new RegExp(chosen))).toBeInTheDocument()
    expect(within(row).queryByRole("button", { name: "Set location" })).not.toBeInTheDocument()
  })

  it("leave placed machines a Change location menu item, opening on where they are", async () => {
    renderPanel()
    const [manage] = screen.getAllByRole("button", { name: /^Manage / })
    await userEvent.click(manage)
    await userEvent.click(await screen.findByRole("menuitem", { name: "Change location" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveTextContent("Change location")
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeEnabled()
  })
})
