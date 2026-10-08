import { describe, expect, it } from "vitest"

import {
  BRANCH_DEPOSIT,
  BUSINESS_DEPOSIT,
  branchesOverriding,
  describeDeposit,
  resolveDeposit,
} from "@/lib/locations/deposit"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { BRANCH_WHATSAPP, takesWhatsAppBookings } from "@/lib/locations/whatsapp"

/**
 * The two stories that had a home but no wiring (DW3.5, KC3.1).
 *
 * Both were "the thing this rule modifies exists, and nothing connects it to a
 * branch" — a deposit policy with no per-branch override, and a reminder
 * template with nothing saying which number it leaves from. Asserted here as
 * the facts the two notices are built from, because the notices themselves live
 * inside settings overlays that never reach server-rendered HTML.
 */

describe("DW3.5 — a branch can take a different deposit", () => {
  const ids = NINE_BRANCH_ESTATE.map((l) => l.id)

  it("has at least one branch differing, so 'business default' means something", () => {
    expect(branchesOverriding(BRANCH_DEPOSIT, ids).length).toBeGreaterThan(0)
  })

  it("leaves the rest following the business, and following means live", () => {
    const inheriting = ids.filter((id) => BRANCH_DEPOSIT[id]?.mode !== "custom")
    expect(inheriting.length).toBeGreaterThan(0)
    for (const id of inheriting) {
      expect(resolveDeposit(BRANCH_DEPOSIT[id]).settings).toBe(BUSINESS_DEPOSIT)
    }
  })

  it("gives the owner a sentence per differing branch, not a count", () => {
    for (const id of branchesOverriding(BRANCH_DEPOSIT, ids)) {
      const line = describeDeposit(resolveDeposit(BRANCH_DEPOSIT[id]).settings)
      expect(line).toMatch(/%/)
      expect(line).toMatch(/Refundable|Non-refundable/)
    }
  })
})

describe("KC3.1 — a reminder leaves from the branch's own number", () => {
  it("knows which branches can send at all", () => {
    const sending = BRANCH_WHATSAPP.filter(takesWhatsAppBookings)
    expect(sending.length).toBeGreaterThan(0)
  })

  it("has at least one branch that cannot, so the silence is on screen", () => {
    // A branch with no number sends no WhatsApp reminder — and is never sent
    // from a sister branch's, which is KC2.2 arriving from the other direction.
    // If every branch could send, the notice would have nothing to warn about
    // and the rule would be untested on the one case that matters.
    const silent = BRANCH_WHATSAPP.filter((b) => !takesWhatsAppBookings(b))
    expect(silent.length).toBeGreaterThan(0)
  })

  it("never resolves one branch's number to another", () => {
    const numbers = BRANCH_WHATSAPP.filter(takesWhatsAppBookings).map((b) => b.number)
    expect(new Set(numbers).size).toBe(numbers.length)
  })
})
