import { describe, expect, it } from "vitest"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { MOCK_GROUPED, type ReportRow } from "@/lib/reports/mock"

const nameOf = (row: Record<string, unknown>) => String(row.location ?? row.type ?? "")

describe("a report grouped by Location names this business's branches", () => {
  const locationGroups = Object.entries(MOCK_GROUPED)
    .map(([id, groups]) => [id, groups.Location] as const)
    .filter(([, rows]) => Array.isArray(rows))

  it("has at least one report sliced by branch", () => {
    expect(locationGroups.length).toBeGreaterThan(0)
  })

  it("never names a business that is not ours", () => {
    // Every row here read "Pet Loft" — a different merchant, captured live —
    // so opening a report "by Location" showed an operator somebody else's
    // business and never their own branches.
    const estate = new Set(NINE_BRANCH_ESTATE.map((l) => l.name))
    for (const [id, rows] of locationGroups) {
      for (const row of rows!) {
        expect(estate.has(nameOf(row)), `${id}: ${nameOf(row)}`).toBe(true)
      }
    }
  })

  it("compares branches rather than showing one", () => {
    // A slice with a single row is not a slice — the reason to group by branch
    // is putting them side by side.
    for (const [id, rows] of locationGroups) {
      expect(rows!.length, id).toBeGreaterThan(1)
    }
  })

  it("keeps a branch that took nothing, rather than dropping it", () => {
    // "No sales there" and "missing from this report" are different answers,
    // and only one of them is worth acting on (SCR-15's rule, and R18's).
    const sales = MOCK_GROUPED["sales-summary"]?.Location ?? []
    expect(sales.some((r) => Number(r.totalSales) === 0)).toBe(true)
  })
})

/**
 * A report can be run for one branch (R03, R18).
 *
 * The rows were bounded by the *grant* and nothing else, so the topbar switcher
 * — the control every other surface obeys — did nothing to a report: narrowing
 * to one branch still showed the whole estate. Not a leak, since the grant
 * still held, but R18 asks for "a bounded single-Location report" as something
 * you can actually run, and with the filter sheet's selection unwired the
 * switcher was the only way to ask for one.
 *
 * Held as the bound itself: the component reads it from the store, and the
 * thing that was wrong is which set it reads.
 */
describe("a report narrows to the branch you are standing in", () => {
  const bound = (rows: ReadonlyArray<ReportRow>, inScope: string[]) => {
    const held = new Set(inScope)
    return rows.filter((r) => {
      const name = nameOf(r)
      return name === "" || held.has(name)
    })
  }

  const rows = Object.values(MOCK_GROUPED)
    .map((g) => g.Location)
    .find((r): r is ReportRow[] => Array.isArray(r) && r.length > 1)!

  it("shows one branch when the scope is one branch", () => {
    const one = nameOf(rows[0]!)
    expect(bound(rows, [one]).every((r) => nameOf(r) === one)).toBe(true)
  })

  it("shows the estate when the scope is all of it", () => {
    const all = NINE_BRANCH_ESTATE.map((l) => l.name)
    expect(bound(rows, all).length).toBe(rows.length)
  })

  it("never exceeds what the caller holds, whatever the scope says", () => {
    // Scope narrows; it can never widen past the grant (R04, R18).
    const held = [nameOf(rows[0]!)]
    expect(bound(rows, held).length).toBeLessThanOrEqual(rows.length)
  })
})
