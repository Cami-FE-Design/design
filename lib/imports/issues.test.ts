import { describe, expect, it } from "vitest"
import { classify, groupIssues, unmappedSentences } from "./issues"
import { getScenario } from "./mock"
import { placeholderSkuRows, reviewCounts, rowOutcome } from "./outcome"

describe("issue grouping on Aya's migration", () => {
  const preview = getScenario("aya-migration").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("collapses all 17 rejections into one cause", () => {
    const { blocking } = groupIssues(preview.rows)
    expect(blocking).toHaveLength(1)
    expect(blocking[0].definition.code).toBe("SKU_REQUIRED")
    expect(blocking[0].rowNumbers).toHaveLength(17)
  })

  it("states the two repeated warnings once each instead of per row", () => {
    const { advisory } = groupIssues(preview.rows)
    const codes = advisory.map((g) => g.definition.code).sort()
    expect(codes).toEqual(["BARCODE_BLANK", "SUPPLY_PRICE_BLANK"])
    // Every advisory covers many rows — that is the whole point of grouping.
    for (const group of advisory) expect(group.rowNumbers.length).toBeGreaterThan(10)
  })

  it("owns every sentence in the scenario", () => {
    expect(unmappedSentences(preview.rows)).toEqual([])
  })

  it("counts 83 importable and 17 left behind", () => {
    const counts = reviewCounts(preview)
    expect(counts.total).toBe(100)
    expect(counts.willImport).toBe(83)
    expect(counts.willSkip).toBe(17)
  })
})

describe("row outcomes read as sentences, not counts", () => {
  const preview = getScenario("mixed").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("names the blocking cause on a rejected row", () => {
    const row = preview.rows.find((r) => r.status === "reject" && r.errors?.length)
    if (!row) throw new Error("expected a rejected row")
    expect(rowOutcome(row, preview).text).not.toMatch(/error/i)
    expect(rowOutcome(row, preview).tone).toBe("bad")
  })

  it("lists the fields an update touches", () => {
    const row = preview.rows.find((r) => r.status === "update")
    if (!row) throw new Error("expected an update row")
    expect(rowOutcome(row, preview).text).toBe("We'll update quantity and supply price")
  })

  it("explains a skip by the option the operator chose, not by 'mode'", () => {
    const row = preview.rows.find((r) => r.status === "skip")
    if (!row) throw new Error("expected a skipped row")
    const text = rowOutcome(row, preview).text
    expect(text).not.toMatch(/mode/i)
    expect(text).toBe("You chose to add new products only, and this one already exists.")
  })
})

describe("barcode duplicate rescue", () => {
  const preview = getScenario("duplicate-barcodes").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("moves a rescued row from left-behind to importable", () => {
    const row = preview.rows.find((r) => r.duplicateConflictFields?.length)
    if (!row) throw new Error("expected a rescuable row")

    const before = reviewCounts(preview)
    const after = reviewCounts(preview, { [row.rowNumber]: { importWithoutDuplicate: true } })

    expect(after.willImport).toBe(before.willImport + 1)
    expect(after.willSkip).toBe(before.willSkip - 1)
    expect(rowOutcome(row, preview, { importWithoutDuplicate: true }).text).toBe(
      "Added without its barcode",
    )
  })
})

describe("PRD-63 placeholder SKUs", () => {
  const preview = getScenario("placeholder-skus").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("imports all 100 rows and flags the 17 generated SKUs for follow-up", () => {
    const counts = reviewCounts(preview)
    expect(counts.willImport).toBe(100)
    expect(counts.willSkip).toBe(0)
    expect(placeholderSkuRows(preview)).toHaveLength(17)
  })

  it("surfaces the generated SKU on the row itself", () => {
    const rowNumber = placeholderSkuRows(preview)[0]
    const row = preview.rows.find((r) => r.rowNumber === rowNumber)
    if (!row) throw new Error("expected a placeholder row")
    // The generated code itself is shown under the product name, so the outcome
    // cell flags that it is Cami's rather than printing the SKU a second time.
    expect(rowOutcome(row, preview).text).toMatch(/SKU we made up/)
    expect(rowOutcome(row, preview).tone).toBe("warn")
  })
})

describe("unmapped backend sentences", () => {
  it("passes an unknown sentence through instead of swallowing it", () => {
    const sentence = "Some brand-new backend complaint we have never seen."
    const definition = classify(sentence, "blocking")
    expect(definition.code).toContain("UNMAPPED:")
    expect(definition.title).toBe(sentence)
  })
})

describe("no cell repeats what its status badge already says", () => {
  const preview = getScenario("aya-migration").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("leaves a plain new product's outcome cell empty", () => {
    const row = preview.rows.find((r) => r.status === "create" && !(r.warnings ?? []).length)
    if (!row) throw new Error("expected a plain create row")
    expect(rowOutcome(row, preview).text).toBe("")
  })
})

describe("advisory ordering", () => {
  const preview = getScenario("placeholder-skus").preview
  if (!preview) throw new Error("scenario is missing its preview")

  it("ranks a Cami-generated SKU above blank fields that hit more rows", () => {
    const { advisory } = groupIssues(preview.rows)
    expect(advisory[0].definition.code).toBe("PLACEHOLDER_SKU")
    // ...even though it covers fewer rows than the one below it.
    expect(advisory[0].rowNumbers.length).toBeLessThan(advisory[1].rowNumbers.length)
  })
})
