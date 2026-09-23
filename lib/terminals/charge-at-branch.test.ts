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

  it("refuses a sale that names no branch at all", () => {
    // Sending to a machine is not Save. The machine books the money at its own
    // branch while the sale belongs nowhere — §15's own outcome by another
    // road, and a charge is the last place to find that out.
    expect(refuseCharge({ locationId: "shampooch-jvc" }, null, true)).toEqual({
      machineLocationId: "shampooch-jvc",
      saleLocationId: null,
    })
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

  it("says something else when the sale has no branch", () => {
    const msg = refusalMessage(
      { machineLocationId: "shampooch-jumeirah", saleLocationId: null },
      name,
    )
    expect(msg).toContain("no location yet")
    expect(msg).toContain("Shampooch Jumeirah")
    expect(msg).toMatch(/Choose the sale's location first/)
  })
})
