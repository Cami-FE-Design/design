import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { AddTeamMemberDialog } from "@/components/blocks/add-team-member-dialog"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"

/**
 * What a person performs is decided per branch (DW2.1, R05).
 *
 * The Services list was flat — one set for the person, whatever branch they
 * stood in — so a colourist who does colour at Jumeirah and only washes at JVC
 * could not be described. DW2.1 is explicit that an assignment at one branch,
 * "including which services they are enabled to perform there", grants nothing
 * at another, and that half was missing.
 *
 * One list stays the default. Making an owner tick nine identical lists to say
 * "she does the same everywhere" is the setup cost R02 rules out, so the branch
 * dimension only appears when it is asked for — and only for somebody who holds
 * more than one branch, since below that there is nothing to tell apart.
 */

beforeAll(() => {
  // jsdom has no ResizeObserver, and the dialog's scroll area asks for one on
  // mount — nothing to do with what is being asserted here.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

function open(assignedLocationIds: string[]) {
  render(
    <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
      <AddTeamMemberDialog
        open
        onOpenChange={() => {}}
        onAdd={() => {}}
        initialSection="services"
        editing={{ assignedLocationIds }}
      />
    </LocationsProvider>,
  )
}

const SAME = /Same services at every location/

describe("the Services section", () => {
  it("says nothing about branches for somebody who holds one", () => {
    open(["shampooch-jvc"])
    expect(screen.queryByText(SAME)).not.toBeInTheDocument()
  })

  it("offers one list by default, even across several branches", () => {
    open(["shampooch-jvc", "shampooch-jumeirah"])
    const toggle = screen.getByRole("checkbox", { name: SAME })
    expect(toggle).toBeChecked()
    // No branch to pick while one list covers them all.
    expect(screen.queryByRole("button", { name: /Jumeirah/ })).not.toBeInTheDocument()
  })

  it("reveals the branches they hold once the lists differ", async () => {
    open(["shampooch-jvc", "shampooch-jumeirah"])
    await userEvent.click(screen.getByRole("checkbox", { name: SAME }))
    expect(screen.getByRole("button", { name: /JVC/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Jumeirah/ })).toBeInTheDocument()
  })

  it("offers only branches they are assigned to, never the estate", async () => {
    open(["shampooch-jvc", "shampooch-jumeirah"])
    await userEvent.click(screen.getByRole("checkbox", { name: SAME }))
    // Mirdif is in the estate and not in this person's grant, so it has nothing
    // to configure here (R04).
    expect(screen.queryByRole("button", { name: /Mirdif/ })).not.toBeInTheDocument()
  })

  it("names the branch being edited, so a tick is never ambiguous", async () => {
    open(["shampooch-jvc", "shampooch-jumeirah"])
    await userEvent.click(screen.getByRole("checkbox", { name: SAME }))
    expect(screen.getByText(/Choose what they provide at/)).toBeInTheDocument()
  })
})
