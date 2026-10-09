import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { CurrentUserProvider, isEmailTaken, isPhoneTaken, useCurrentUser } from "@/lib/current-user"

/**
 * The signed-in profile is the owner's roster row, and a browser that saved
 * the profile before it was keeps working: an old member id resolves to the
 * new one, and the retired default (Michelle You, who is Cami HQ, not anyone
 * at the business) gives way to the owner's.
 */

function Probe() {
  const { user, actor } = useCurrentUser()
  return (
    <p>
      {user.firstName} {user.lastName} · {user.memberId} · {actor.roleId}
    </p>
  )
}

function renderWithSaved(saved: unknown) {
  window.localStorage.setItem("cami-current-user", JSON.stringify(saved))
  render(
    <CurrentUserProvider>
      <Probe />
    </CurrentUserProvider>,
  )
}

afterEach(() => window.localStorage.clear())

describe("the signed-in profile", () => {
  it("is the owner's row by default", () => {
    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>,
    )
    expect(screen.getByText("Maz Khan · maz-khan · owner")).toBeInTheDocument()
  })

  it("replaces the retired default profile with the owner's", async () => {
    renderWithSaved({
      user: {
        memberId: "m_owner",
        firstName: "Michelle",
        lastName: "You",
        email: "michelle.h.you@gmail.com",
      },
      pending: { email: "new@example.com" },
    })
    expect(await screen.findByText("Maz Khan · maz-khan · owner")).toBeInTheDocument()
  })

  it("keeps a profile somebody edited, on the member's current id", async () => {
    renderWithSaved({
      user: { memberId: "m_aziz", firstName: "Zee", lastName: "Rahman", email: "zee@example.com" },
      pending: {},
    })
    expect(await screen.findByText("Zee Rahman · aziz-rahman · manager")).toBeInTheDocument()
  })
})

describe("duplicate contact checks", () => {
  it("treats another member's email and mobile as taken", () => {
    expect(isEmailTaken("AZIZ@getcami.io", "maz-khan")).toBe(true)
    expect(isPhoneTaken("+971", "50 118 2204", "maz-khan")).toBe(true)
  })

  it("does not count the signed-in member's own row", () => {
    expect(isEmailTaken("maaz@getcami.io", "maz-khan")).toBe(false)
    expect(isPhoneTaken("+971", "50 963 6445", "maz-khan")).toBe(false)
  })
})
