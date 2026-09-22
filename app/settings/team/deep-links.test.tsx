import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import TeamSettingsPage from "@/app/settings/team/page"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * A review link has to open the thing it names.
 *
 * `/settings/team` carries two facts a multi-location review asks about — the
 * role × location grant (SCR-03) and which services a person performs at each
 * branch (DW2.1) — and both live inside a dialog. A link that lands on the
 * roster leaves the reader to guess which of five rows to open and which item
 * in its menu, which is how a linked fact goes unlooked-at.
 *
 * So `?access=<id>` opens the grants dialog and `?services=<id>` opens that
 * member's editor on Services. `?member=<id>` already opened the detail view;
 * these are the same idea one level in.
 */

const searchParams = { value: new URLSearchParams() }

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
  usePathname: () => "/settings/team",
  useSearchParams: () => searchParams.value,
}))

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

// AppShell's topbar is tooltipped, and a tooltip outside its provider throws
// before anything renders. The app mounts one at the root.
function openWith(query: string) {
  searchParams.value = new URLSearchParams(query)
  render(
    <TooltipProvider>
      <TeamSettingsPage />
    </TooltipProvider>,
  )
}

describe("team settings deep links", () => {
  it("opens the grants dialog on ?access=", async () => {
    openWith("access=m_aziz")
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("opens the member editor on ?services=, on the Services section", async () => {
    // Beth works two sites, so the branch dimension is on screen for her — the
    // whole reason the link exists. It stays off for somebody holding one.
    openWith("services=m_beth")
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(await screen.findByText(/Same services at every location/)).toBeInTheDocument()
  })

  it("opens nothing at all without a parameter", () => {
    openWith("")
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
