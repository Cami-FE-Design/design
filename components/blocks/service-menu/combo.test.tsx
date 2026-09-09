import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  MOCK_SERVICE_CATALOG,
  type MockServiceCatalogItem,
  serviceItemLabel,
} from "@/app/appointments/mock"
import {
  bundleDiscounts,
  comboCartLines,
  grossTotalMinor,
  SERVICES,
} from "@/app/sales/new-sale/mock"
import { expandCombo } from "@/components/blocks/new-appointment-sheet"
import { bookingLines, serviceTotals } from "@/lib/booking"
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
              scheduleType: "sequence",
              comboPriceType: "service",
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

describe("adding a combo to the POS cart", () => {
  const combo = SERVICES.find((s) => s.id === "nails-and-style-combo")
  if (!combo) throw new Error("POS combo seed missing")

  let seq = 0
  const lines = comboCartLines(combo, SERVICES, (prefix) => `${prefix}-${++seq}`)

  it("adds a line per component, named after the combo", () => {
    expect(lines.map((l) => l.name)).toEqual([
      "Nails & Style Combo - Biab with Nail Extensions",
      "Nails & Style Combo - Blow Dry & Style",
    ])
  })

  it("charges the combo's price, not the sum of the parts", () => {
    expect(lines.reduce((sum, l) => sum + l.priceMinor, 0)).toBe(combo.priceMinor)
    expect(grossTotalMinor(lines)).toBe(50500)
  })

  it("names the saving once per discounted line", () => {
    const discounts = bundleDiscounts(lines)
    expect(discounts).toHaveLength(2)
    expect(discounts.reduce((sum, d) => sum + d.amountMinor, 0)).toBe(
      grossTotalMinor(lines) - combo.priceMinor,
    )
  })
})

describe("a parallel combo", () => {
  // "Booked in parallel" means different team members work at once, so the
  // components share one start time instead of queueing.
  const parallelCombo: MockServiceCatalogItem = {
    id: "parallel-combo",
    category: "grooming",
    name: "Parallel Combo",
    durationMin: 60,
    priceMinor: 20000,
    isCombo: true,
    comboScheduleType: "parallel",
    componentNames: ["Wash & Blow Dry SM", "Nails Clip"],
  }

  it("starts every component together", () => {
    const rows = expandCombo(parallelCombo, MOCK_SERVICE_CATALOG, { startTime: "10:00" })
    expect(rows.map((r) => r.startTime)).toEqual(["10:00", "10:00"])
  })
})

describe("a combo booked by a pet parent", () => {
  // The public flow books a combo as the services it bundles, so the summary
  // reads the same as the staff side.
  it("expands into component lines, priced to the combo's total", () => {
    const lines = bookingLines(["groom-and-nails-combo"])
    expect(lines.map((l) => l.name)).toEqual([
      "Full groom & nails - Full groom",
      "Full groom & nails - Nail trim",
    ])
    expect(lines.reduce((sum, l) => sum + l.priceAed, 0)).toBe(270)
    // Each line says what it would cost alone.
    expect(lines.map((l) => l.listPriceAed)).toEqual([260, 35])
  })

  it("counts the components but keeps the combo's own duration and price", () => {
    const totals = serviceTotals(["groom-and-nails-combo"])
    expect(totals.count).toBe(2)
    expect(totals.durationMinutes).toBe(135)
    expect(totals.priceAed).toBe(270)
  })

  it("leaves a plain service as one line", () => {
    expect(bookingLines(["full-groom"])).toHaveLength(1)
  })
})
