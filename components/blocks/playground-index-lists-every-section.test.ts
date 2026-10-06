import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// The index at the top of /playground is a hand-kept list (LANES), separate
// from the <Section>s it links to. It drifted: renamed sections left dead
// links and new ones never got listed. Reading the source keeps this fast —
// rendering the whole showcase in jsdom is not needed to compare two lists.

const source = readFileSync(path.join(__dirname, "playground-showcase.tsx"), "utf8")

/** lane id → section titles, in the order they render. */
function renderedSections(): Record<string, string[]> {
  const re = /<Lane\s+id="([^"]+)"|<Section\b[^>]*?title=(?:"([^"]+)"|\{"([^"]+)"\}|\{`([^`]+)`\})/g
  const out: Record<string, string[]> = {}
  let lane = ""
  for (const m of source.matchAll(re)) {
    if (m[1]) {
      lane = m[1]
      out[lane] = []
    } else {
      out[lane].push(m[2] ?? m[3] ?? m[4])
    }
  }
  return out
}

/** lane id → section titles, as the index lists them. */
function indexedSections(): Record<string, string[]> {
  const block = source.slice(source.indexOf("const LANES"), source.indexOf("function Lane("))
  const out: Record<string, string[]> = {}
  let lane = ""
  for (const line of block.split("\n")) {
    const id = line.match(/^\s+id: "([^"]+)",$/)
    if (id) {
      lane = id[1]
      out[lane] = []
      continue
    }
    const title = line.match(/^\s+"([^"]+)",$/)
    if (title && lane) out[lane].push(title[1])
  }
  return out
}

describe("the playground index", () => {
  it("finds sections to compare against", () => {
    expect(Object.values(renderedSections()).flat().length).toBeGreaterThan(50)
  })

  it("lists every section, under the lane it renders in, in render order", () => {
    expect(indexedSections()).toEqual(renderedSections())
  })
})
