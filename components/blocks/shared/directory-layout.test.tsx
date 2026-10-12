import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DirectoryLayout } from "@/components/blocks/shared/directory-layout"

// The sidebar is read from the page, so a section added to /playground or
// /screens is listed without anyone remembering to list it.

function page() {
  return render(
    <DirectoryLayout searchPlaceholder="Search">
      <div id="lane-a" data-nav-lane="a" data-nav-label="Primitives">
        <section
          id="button"
          data-nav-section
          data-nav-title="Button"
          data-search="Variants and sizes"
        >
          Button demo
        </section>
        <section id="badge" data-nav-section data-nav-title="Badge" data-search="Status pills">
          Badge demo
        </section>
      </div>
      <div id="lane-b" data-nav-lane="b" data-nav-label="Business">
        <section id="sales" data-nav-section data-nav-title="Sales">
          <ul>
            <li data-search="/sales/sales-list Sales list">sales list row</li>
            <li data-search="/sales/daily-summary Daily summary">daily summary row</li>
          </ul>
        </section>
      </div>
    </DirectoryLayout>,
  )
}

const nav = () => screen.getByRole("navigation", { name: "Sections" })

describe("the directory sidebar", () => {
  it("lists every lane, and a lane's sections once it is opened", () => {
    page()
    expect(nav().textContent).toContain("Primitives")
    expect(nav().textContent).toContain("Business")
    expect(nav().textContent).not.toContain("Button")
    fireEvent.click(screen.getByRole("button", { name: /Primitives/ }))
    expect(nav().textContent).toContain("Button")
    expect(nav().textContent).toContain("Badge")
  })

  it("drops ticket references from the sidebar label but keeps them on hover", () => {
    render(
      <DirectoryLayout searchPlaceholder="Search">
        <div id="lane-a" data-nav-lane="a" data-nav-label="Business">
          <section id="money" data-nav-section data-nav-title="Money — account summary (DSG-77)">
            demo
          </section>
        </div>
      </DirectoryLayout>,
    )
    fireEvent.click(screen.getByRole("button", { name: /Business/ }))
    const link = screen.getByRole("link", { name: "Money — account summary" })
    expect(link.getAttribute("title")).toBe("Money — account summary (DSG-77)")
  })

  it("narrows to the sections a search matches, on title or description", () => {
    page()
    fireEvent.change(screen.getAllByRole("searchbox")[0], { target: { value: "pills" } })
    expect(screen.getByText("Badge demo").style.display).toBe("")
    expect(screen.getByText("Button demo").style.display).toBe("none")
    expect(nav().textContent).not.toContain("Button")
    expect(screen.getByText(/1 section matches/)).toBeTruthy()
  })

  it("narrows a section to its matching rows, and hides a lane left empty", () => {
    page()
    fireEvent.change(screen.getAllByRole("searchbox")[0], { target: { value: "daily" } })
    expect(screen.getByText("daily summary row").style.display).toBe("")
    expect(screen.getByText("sales list row").style.display).toBe("none")
    expect(document.getElementById("lane-a")?.style.display).toBe("none")
  })

  it("says so when nothing matches, and Escape brings everything back", () => {
    page()
    const box = screen.getAllByRole("searchbox")[0]
    fireEvent.change(box, { target: { value: "zzz" } })
    expect(screen.getByText(/Nothing matches/)).toBeTruthy()
    fireEvent.keyDown(box, { key: "Escape" })
    expect(screen.getByText("Button demo").style.display).toBe("")
  })
})
