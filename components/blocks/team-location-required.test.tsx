import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import TeamSettingsPage from "@/app/settings/team/page"
import { AddTeamMemberDialog } from "@/components/blocks/add-team-member-dialog"
import { TeamAccessDialog } from "@/components/blocks/team-access-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"
import type { LocationScope } from "@/lib/locations/types"
import { TEAM_MEMBERS } from "@/lib/team/mock"

// Every role but the owner works at a location: the add/edit form and the
// access dialog both enforce it, a new member starts with one location picked,
// and the Team list follows the topbar location switcher.

const toastError = vi.hoisted(() => vi.fn())
vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sonner")>()
  return { ...actual, toast: Object.assign(vi.fn(), actual.toast, { error: toastError }) }
})

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
  usePathname: () => "/settings/team",
  useSearchParams: () => new URLSearchParams(),
}))

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

beforeEach(() => {
  toastError.mockClear()
})

const REQUIRED = "Pick at least one location."
const FIRST = NINE_BRANCH_ESTATE[0]

function openInvite(
  props: Partial<React.ComponentProps<typeof AddTeamMemberDialog>> = {},
  initialScope?: LocationScope,
) {
  const onAdd = vi.fn()
  render(
    <LocationsProvider
      persist={false}
      initialLocations={NINE_BRANCH_ESTATE}
      initialScope={initialScope}
    >
      <AddTeamMemberDialog open onOpenChange={() => {}} onAdd={onAdd} {...props} />
    </LocationsProvider>,
  )
  return onAdd
}

function fillProfile() {
  fireEvent.change(screen.getByLabelText(/First name/), { target: { value: "Sara" } })
  fireEvent.change(screen.getByLabelText(/Last name/), { target: { value: "Khan" } })
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "sara@example.com" } })
}

function saveButton(name: string) {
  return screen.getAllByRole("button", { name })[0]
}

function districtOf(id: string) {
  const l = NINE_BRANCH_ESTATE.find((x) => x.id === id)!
  return l.location.district || l.name
}

describe("inviting a team member", () => {
  it("starts with the first location the viewer holds", async () => {
    const onAdd = openInvite()
    fillProfile()
    await userEvent.click(saveButton("Add"))
    await waitFor(() => expect(onAdd).toHaveBeenCalledOnce())
    expect(onAdd.mock.calls[0][0].assignedLocationIds).toEqual([FIRST.id])
  })

  it("starts with the topbar's location when it names exactly one", async () => {
    const onAdd = openInvite({}, { kind: "one", locationId: "shampooch-jumeirah" })
    fillProfile()
    await userEvent.click(saveButton("Add"))
    await waitFor(() => expect(onAdd).toHaveBeenCalledOnce())
    expect(onAdd.mock.calls[0][0].assignedLocationIds).toEqual(["shampooch-jumeirah"])
  })

  it("will not save with no location: error under Works at, no toast", async () => {
    const onAdd = openInvite()
    fillProfile()
    await userEvent.click(screen.getByRole("button", { name: /^Locations/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: districtOf(FIRST.id) }))
    await userEvent.click(saveButton("Add"))
    expect(await screen.findByText(REQUIRED)).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: "Works at" })).toBeInTheDocument()
    expect(toastError).not.toHaveBeenCalled()
  })

  it("clears the error and saves once a location is picked", async () => {
    const onAdd = openInvite()
    fillProfile()
    await userEvent.click(screen.getByRole("button", { name: /^Locations/ }))
    await userEvent.click(screen.getByRole("checkbox", { name: districtOf(FIRST.id) }))
    await userEvent.click(saveButton("Add"))
    await screen.findByText(REQUIRED)
    await userEvent.click(screen.getByRole("checkbox", { name: "Jumeirah" }))
    await waitFor(() => expect(screen.queryByText(REQUIRED)).not.toBeInTheDocument())
    await userEvent.click(saveButton("Add"))
    await waitFor(() => expect(onAdd).toHaveBeenCalledOnce())
    expect(onAdd.mock.calls[0][0].assignedLocationIds).toEqual(["shampooch-jumeirah"])
  })

  it("does not pre-select when editing someone", async () => {
    const onAdd = openInvite({
      editing: {
        name: "Sara Khan",
        firstName: "Sara",
        lastName: "Khan",
        email: "sara@example.com",
        roleId: "staff",
        assignedLocationIds: [],
      },
    })
    await userEvent.click(saveButton("Save"))
    expect(await screen.findByText(REQUIRED)).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("asks nothing of the owner, who holds every location", async () => {
    const onAdd = openInvite({
      editing: {
        name: "Owner",
        firstName: "Sara",
        lastName: "Khan",
        email: "owner@example.com",
        roleId: "owner",
        assignedLocationIds: [],
      },
    })
    await userEvent.click(saveButton("Save"))
    await waitFor(() => expect(onAdd).toHaveBeenCalledOnce())
    expect(screen.queryByText(REQUIRED)).not.toBeInTheDocument()
  })
})

describe("team access dialog", () => {
  const ahmed = TEAM_MEMBERS.find((m) => m.id === "m_ahmed")!
  const aziz = TEAM_MEMBERS.find((m) => m.id === "m_aziz")!

  function openAccess(member: (typeof TEAM_MEMBERS)[number], onSave = vi.fn()) {
    render(
      <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
        <TeamAccessDialog open onOpenChange={vi.fn()} member={member} onSave={onSave} />
      </LocationsProvider>,
    )
    return onSave
  }

  it("asks for a location and will not confirm with none ticked", () => {
    openAccess(ahmed)
    expect(screen.getByText(REQUIRED)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled()
  })

  it("confirms once a location is ticked", async () => {
    const onSave = openAccess(ahmed)
    await userEvent.click(screen.getByRole("checkbox", { name: "JVC" }))
    expect(screen.queryByText(REQUIRED)).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onSave).toHaveBeenCalledWith("m_ahmed", "receptionist", ["shampooch-jvc"])
  })

  it("says nothing for a member who works somewhere", () => {
    openAccess(aziz)
    expect(screen.queryByText(REQUIRED)).toBeNull()
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled()
  })
})

describe("the Team list follows the topbar location", () => {
  function openList(initialScope: LocationScope, locations = NINE_BRANCH_ESTATE) {
    render(
      <TooltipProvider>
        <LocationsProvider persist={false} initialLocations={locations} initialScope={initialScope}>
          <TeamSettingsPage />
        </LocationsProvider>
      </TooltipProvider>,
    )
    return within(screen.getByRole("table"))
  }

  it("lists who works at the chosen location, and the owner", () => {
    const table = openList({ kind: "one", locationId: "shampooch-jvc" })
    expect(table.getByText("maaz@getcami.io")).toBeInTheDocument()
    expect(table.getByText("sara@getcami.io")).toBeInTheDocument()
    expect(table.getByText("beth@getcami.io")).toBeInTheDocument()
    expect(table.queryByText("aziz@getcami.io")).toBeNull()
    // No grant: listed only at every location.
    expect(table.queryByText("ahmed@getcami.io")).toBeNull()
  })

  it("lists everyone at every location", () => {
    const table = openList({ kind: "all" })
    for (const m of TEAM_MEMBERS) {
      expect(table.getAllByText(m.email).length).toBeGreaterThan(0)
    }
  })

  it("lists everyone in a single-location business", () => {
    const table = openList({ kind: "all" }, [FIRST])
    for (const m of TEAM_MEMBERS) {
      expect(table.getAllByText(m.email).length).toBeGreaterThan(0)
    }
  })
})
