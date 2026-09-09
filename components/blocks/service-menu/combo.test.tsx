import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  MOCK_SERVICE_CATALOG,
  type MockServiceCatalogItem,
  serviceItemLabel,
} from "@/app/appointments/mock"
import { expandCombo } from "@/components/blocks/new-appointment-sheet"
import { seedCategories, seedServices } from "@/lib/service-catalog/mock-data"
import {
  ServiceCatalogProvider,
  useServiceCatalogMutations,
  useServices,
} from "@/lib/service-catalog/store"
import { ServiceCardInner } from "./ServiceCard"

// PRD-143 — combos share the service list with single services, so the row has
// to say which it is, and saving a combo has to put one in that list.

const combo = seedServices.find((s) => s.id === "svc-8")
const single = seedServices.find((s) => s.id === "svc-1")
if (!combo || !single) throw new Error("seed services missing")

function categoryOf(categoryId: string) {
  const category = seedCategories.find((c) => c.id === categoryId)
  if (!category) throw new Error(`category ${categoryId} missing`)
  return category
}

describe("the service card marks combos", () => {
  it("badges a combo and counts what it bundles", () => {
    render(
      <ServiceCardInner
        service={combo}
        category={categoryOf(combo.categoryId)}
        withHandle={false}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText("Combo")).toBeTruthy()
    // The count sits on the same line as the duration.
    expect(screen.getByText(/2 services/)).toBeTruthy()
  })

  it("leaves a single service unmarked", () => {
    render(
      <ServiceCardInner
        service={single}
        category={categoryOf(single.categoryId)}
        withHandle={false}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByText("Combo")).toBeNull()
  })
})

describe("saving a combo", () => {
  function CreateComboProbe() {
    const { createCombo } = useServiceCatalogMutations()
    const { data: services } = useServices()
    const created = services?.find((s) => s.name === "Test Bundle")
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            createCombo.mutate({
              name: "Test Bundle",
              categoryId: "cat-3",
              priceType: "Fixed",
              price: 60,
              duration: 75,
              components: [
                { id: "svc-6", name: "Classic Manicure" },
                { id: "svc-7", name: "Gel Manicure" },
              ],
            })
          }
        >
          Save combo
        </button>
        {created ? (
          <p>{`stored ${created.serviceType} with ${created.components?.length} components`}</p>
        ) : null}
      </div>
    )
  }

  it("lands in the service list as a combo", async () => {
    render(
      <ServiceCatalogProvider>
        <CreateComboProbe />
      </ServiceCatalogProvider>,
    )
    expect(screen.queryByText(/stored/)).toBeNull()

    screen.getByRole("button", { name: "Save combo" }).click()

    expect(await screen.findByText("stored combo with 2 components")).toBeTruthy()
  })
})

describe("a booked combo line", () => {
  // The as-built calendar and sale sheets name these lines "Combo - Service";
  // the prefix is the marker there, not a badge.
  it("prefixes the combo name", () => {
    expect(
      serviceItemLabel({
        id: "i1",
        name: "Nails Clip",
        priceMinor: 4000,
        durationMin: 15,
        comboName: "Wash & Nails Combo",
      }),
    ).toBe("Wash & Nails Combo - Nails Clip")
  })

  it("leaves a standalone service alone", () => {
    expect(
      serviceItemLabel({ id: "i2", name: "Nails Clip", priceMinor: 4000, durationMin: 15 }),
    ).toBe("Nails Clip")
  })
})

describe("picking a combo on the appointment sheet", () => {
  // Booking a combo books its component services, so the pick expands into a
  // row per component — the same shape the booked appointment shows.
  const combo: MockServiceCatalogItem = {
    id: "wash-and-nails-combo",
    category: "details",
    name: "Wash & Nails Combo",
    durationMin: 60,
    priceMinor: 20000,
    isCombo: true,
    componentNames: ["Wash & Blow Dry SM", "Nails Clip"],
  }

  const rows = expandCombo(combo, MOCK_SERVICE_CATALOG, { startTime: "10:00" })

  it("adds one row per component, named after the combo", () => {
    expect(rows.map((r) => r.catalog.name)).toEqual([
      "Wash & Nails Combo - Wash & Blow Dry SM",
      "Wash & Nails Combo - Nails Clip",
    ])
  })

  it("runs them back-to-back from the combo's start", () => {
    expect(rows.map((r) => r.startTime)).toEqual(["10:00", "10:45"])
  })

  it("splits the combo price across the rows, to the last fils", () => {
    expect(rows.reduce((sum, r) => sum + r.catalog.priceMinor, 0)).toBe(combo.priceMinor)
    // Each row still carries what it costs alone, for the struck-through price.
    expect(rows.map((r) => r.comboOriginalPriceMinor)).toEqual([18000, 4000])
  })

  it("keeps them in one group, so removing one removes the combo", () => {
    const groups = new Set(rows.map((r) => r.comboGroupId))
    expect(groups.size).toBe(1)
    expect([...groups][0]).toBeTruthy()
  })
})
