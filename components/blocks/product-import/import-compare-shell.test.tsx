import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// The shell derives everything from the query string. Tests drive it by setting
// the URL and letting the mocked hooks read it back, which is the same path the
// /screens links take.
const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/products/import",
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

const { ProductImportCompareShell } = await import("./import-compare-shell")

function openAt(search: string) {
  window.history.replaceState(null, "", `/products/import${search}`)
  return render(<ProductImportCompareShell />)
}

describe("the compare bar reads its state from the URL", () => {
  beforeEach(() => {
    replace.mockClear()
    window.history.replaceState(null, "", "/products/import")
  })

  it("opens the redesign by default", () => {
    const { unmount } = openAt("")
    expect(screen.getByText("Bring your products into Cami")).toBeTruthy()
    // The as-built wording must not be on screen.
    expect(screen.queryByText("Upload your file")).toBeNull()
    unmount()
  })

  it("opens the as-built flow with ?view=as-built", () => {
    const { unmount } = openAt("?view=as-built")
    // Production's own copy, which the redesign replaced.
    expect(screen.getByText("Upload your file")).toBeTruthy()
    expect(screen.getByText("Import mode")).toBeTruthy()
    unmount()
  })

  it("selects a named scenario with ?scenario=", () => {
    const { unmount } = openAt("?scenario=placeholder-skus")
    expect(screen.getByText("After PRD-63 (placeholder SKUs)")).toBeTruthy()
    unmount()
  })

  it("falls back to the default when the scenario id is unknown", () => {
    const { unmount } = openAt("?scenario=not-a-real-scenario")
    expect(screen.getByText("Aya's migration (the reported case)")).toBeTruthy()
    unmount()
  })

  it("lands straight on the review step with ?at=review", () => {
    const { unmount } = openAt("?at=review")
    expect(screen.getByText(/products are ready to import$/)).toBeTruthy()
    unmount()
  })

  it("reads a combination, so a review link can name its case", () => {
    const { unmount } = openAt("?scenario=placeholder-skus&at=review")
    expect(screen.getByText("All 100 products are ready to import")).toBeTruthy()
    unmount()
  })
})

describe("every /screens link lands on the screen its note describes", () => {
  // The point of these links is that a reviewer clicks one and sees the thing
  // being described. Two of them used to land on the upload step regardless of
  // scenario, so they looked identical however different the note was.
  const links = [
    { search: "", expect: "Bring your products into Cami" },
    { search: "?at=review", expect: "83 of 100 products are ready to import" },
    {
      search: "?scenario=placeholder-skus&at=review",
      expect: "All 100 products are ready to import",
    },
    { search: "?view=as-built&at=review", expect: "Review before importing" },
  ]

  for (const link of links) {
    it(`"${link.search || "(no query)"}" shows "${link.expect}"`, () => {
      const { unmount } = openAt(link.search)
      expect(screen.getByText(link.expect)).toBeTruthy()
      unmount()
    })
  }

  it("no two of them land on the same screen", () => {
    const headings = links.map((link) => {
      const { container, unmount } = openAt(link.search)
      const text = container.querySelector("h2")?.textContent ?? ""
      unmount()
      return text
    })
    expect(new Set(headings).size).toBe(headings.length)
  })
})
