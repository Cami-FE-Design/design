import { describe, expect, it } from "vitest"

/**
 * The built product's model, read off `packagePayments.ts` in cami-business:
 * the API keeps a covered line at its gross price and books the coverage as a
 * captured `customer_package` payment. The money leaves through the tenders,
 * not by discounting the line.
 *
 * Held here as arithmetic rather than a render test, because the thing that was
 * wrong was arithmetic: applying a package changed no figure on the screen.
 */
const line = (uid: string, priceMinor: number, qty = 1) => ({ uid, priceMinor, qty })

function packagePaidMinor(
  lines: ReadonlyArray<{ uid: string; priceMinor: number; qty: number }>,
  applied: ReadonlyArray<string>,
) {
  return lines
    .filter((l) => applied.includes(l.uid))
    .reduce((sum, l) => sum + l.priceMinor * l.qty, 0)
}

describe("a redeemed package pays, rather than discounting", () => {
  const cart = [line("a", 28500), line("b", 2000), line("c", 12000)]

  it("takes the covered line's full price out of what is left to pay", () => {
    // Apply changed nothing before this: total 425 before, 425 after.
    expect(packagePaidMinor(cart, ["c"])).toBe(12000)
  })

  it("leaves the line's own price alone", () => {
    // Gross, chipped — not rewritten to zero. The receipt has to show what the
    // service costs and, separately, what paid for it.
    const covered = cart.find((l) => l.uid === "c")!
    packagePaidMinor(cart, ["c"])
    expect(covered.priceMinor).toBe(12000)
  })

  it("pays for every unit of a covered line, not one", () => {
    expect(packagePaidMinor([line("d", 5000, 3)], ["d"])).toBe(15000)
  })

  it("pays nothing while nothing is applied", () => {
    expect(packagePaidMinor(cart, [])).toBe(0)
  })

  it("settles the sale when the package covers the whole of it", () => {
    const onlyCovered = [line("c", 12000)]
    const toPay = 12000
    expect(toPay - packagePaidMinor(onlyCovered, ["c"])).toBe(0)
  })
})
