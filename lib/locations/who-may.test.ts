import { describe, expect, it } from "vitest"

import { type Actor, mayChangeBranch, refusalFor } from "@/lib/locations/who-may"

/**
 * GNK §2 and §3, as a table.
 *
 * §2: only the owner creates or suspends a branch, sets access, edits tax
 * details, or assigns a WhatsApp number.
 * §3: the owner and a manager change a branch's service settings; a manager
 * only at the branches they hold.
 */

const owner: Actor = { roleId: "owner", grants: "all" }
const manager: Actor = { roleId: "manager", grants: ["jumeirah"] }
const reception: Actor = { roleId: "receptionist", grants: ["jvc"] }
const staff: Actor = { roleId: "staff", grants: ["jvc"] }

describe("the owner", () => {
  it("may do all of it, at any branch", () => {
    for (const action of [
      "createBranch",
      "changeBranchState",
      "setAccess",
      "editTaxDetails",
      "assignWhatsAppNumber",
      "editServiceSettings",
    ] as const) {
      expect(mayChangeBranch(owner, action, "any-branch").allowed).toBe(true)
    }
  })

  it("holds a branch created tomorrow, because the grant is 'all' and not today's ids", () => {
    expect(mayChangeBranch(owner, "editServiceSettings", "opened-next-month").allowed).toBe(true)
  })
})

describe("a manager", () => {
  it("may change service settings at a branch they hold", () => {
    expect(mayChangeBranch(manager, "editServiceSettings", "jumeirah").allowed).toBe(true)
  })

  it("may not at a branch they do not", () => {
    expect(mayChangeBranch(manager, "editServiceSettings", "jvc")).toEqual({
      allowed: false,
      reason: "branchNotHeld",
    })
  })

  it("may not touch tax details, access or a WhatsApp number even at their own branch", () => {
    for (const action of ["editTaxDetails", "setAccess", "assignWhatsAppNumber"] as const) {
      expect(mayChangeBranch(manager, action, "jumeirah")).toEqual({
        allowed: false,
        reason: "roleCannot",
      })
    }
  })

  it("may not suspend or create a branch", () => {
    expect(mayChangeBranch(manager, "changeBranchState", "jumeirah").allowed).toBe(false)
    expect(mayChangeBranch(manager, "createBranch", "jumeirah").allowed).toBe(false)
  })
})

describe("reception and service staff", () => {
  it("may not change service settings, even at their own branch", () => {
    // §3 names them, so this is an allow-list rather than "anyone who is not
    // reception" — a role added later must not inherit the permission.
    expect(mayChangeBranch(reception, "editServiceSettings", "jvc")).toEqual({
      allowed: false,
      reason: "roleCannot",
    })
    expect(mayChangeBranch(staff, "editServiceSettings", "jvc").allowed).toBe(false)
  })
})

describe("what a refusal says", () => {
  it("keeps the two apart, because they are two different conversations", () => {
    const roleCannot = mayChangeBranch(manager, "editTaxDetails", "jumeirah")
    const notHeld = mayChangeBranch(manager, "editServiceSettings", "jvc")

    expect(refusalFor(roleCannot, "Shampooch Jumeirah")).toBe(
      "Only the account owner can change this.",
    )
    // Naming the branch is the point: "no permission" would send a manager to
    // ask for a role they already have.
    expect(refusalFor(notHeld, "Shampooch JVC")).toContain("Shampooch JVC")
  })

  it("says nothing when it is allowed", () => {
    expect(refusalFor({ allowed: true }, "Shampooch JVC")).toBeNull()
  })
})
