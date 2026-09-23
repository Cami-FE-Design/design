import { describe, expect, it } from "vitest"

import { refusalMessage, refuseCharge } from "@/lib/terminals/charge-at-branch"

/**
 * GNK §15: "If a sale from one branch is sent to a machine linked to a
 * different branch, we propose to block it with a clear message, so money is
 * never recorded against the wrong branch."
 *
 * The checkout grid already offers only this branch's machines. These assert
 * the refusal behind it, for the one path the grid cannot cover: §15 lets the
 * merchant move a machine to another branch, and a draft sale reopened after
 * that move is holding one that was right when it was chosen.
 */

const name = (id: string) => (id === "shampooch-jvc" ? "Shampooch JVC" : "Shampooch Jumeirah")

describe("charging a sale on a card machine", () => {
  it("allows a machine at the sale's own branch", () => {
    expect(refuseCharge({ locationId: "shampooch-jvc" }, "shampooch-jvc", true)).toBeNull()
  })

  it("refuses one at another branch", () => {
    expect(refuseCharge({ locationId: "shampooch-jumeirah" }, "shampooch-jvc", true)).toEqual({
      machineLocationId: "shampooch-jumeirah",
      saleLocationId: "shampooch-jvc",
    })
  })

  it("has nothing to refuse in a single-branch business", () => {
    // There is no wrong branch to land on, and a rule that fires anyway is a
    // rule a single-site merchant has to be taught for no reason (DW1.2).
    expect(refuseCharge({ locationId: "shampooch-jvc" }, "shampooch-jvc", false)).toBeNull()
  })

  it("leaves a sale with no branch to the rule that already covers it", () => {
    // R11 shuts the sale itself; a second sentence about machines would be a
    // second answer to one question.
    expect(refuseCharge({ locationId: "shampooch-jvc" }, null, true)).toBeNull()
  })
})

describe("what it says", () => {
  const refusal = { machineLocationId: "shampooch-jumeirah", saleLocationId: "shampooch-jvc" }

  it("names both branches rather than saying wrong location", () => {
    const msg = refusalMessage(refusal, name)
    expect(msg).toContain("Shampooch Jumeirah")
    expect(msg).toContain("Shampooch JVC")
  })

  it("gives a way out, since the client is standing there either way", () => {
    expect(refusalMessage(refusal, name)).toMatch(/take the payment another way/)
  })
})
