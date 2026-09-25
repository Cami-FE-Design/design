import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"

// The screen reads its state from the query string. Tests open it at a URL,
// the same links /screens carries, and drive it from there.
const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/messages/inbox/phase-0",
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

const { InboxPhase0Screen } = await import("./inbox-phase-0-screen")

function openAt(search: string) {
  window.history.replaceState(null, "", `/messages/inbox/phase-0${search}`)
  // The app shell's sidebar needs the provider the root layout gives it.
  return render(
    <TooltipProvider>
      <InboxPhase0Screen />
    </TooltipProvider>,
  )
}

describe("Inbox Phase 0 — identity (IX-C3, IX-C4)", () => {
  beforeEach(() => replace.mockClear())

  it("matches a number that is on two records: shows both, I pick, and the match is recorded", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("?c=unmatched-closed")
    await user.click(screen.getByRole("button", { name: /Match to client/ }))
    expect(screen.getByText("This number is on 2 client records. Pick the right one.")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: /Khalid Omar/ }))
    expect(screen.getByText("This number is already on their record.")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Match" }))
    expect(screen.getByText("Matched to Khalid Omar by Queenie")).toBeTruthy()
    // Everything written before the match is still there (IX-C3 row 3).
    expect(
      within(screen.getByRole("log")).getByText("Hi, what are your prices for a full groom?"),
    ).toBeTruthy()
    unmount()
  })

  it("re-matches: both changes are kept, with who", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("")
    expect(screen.getByText("Linked to Layla Haddad automatically by Cami")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: /Change the match/ }))
    await user.type(screen.getByPlaceholderText("Name, phone, email or pet"), "Rana")
    await user.click(screen.getByRole("button", { name: /Rana Haddad/ }))
    // A different number on the record: Keep is the default (Michelle's open call).
    expect(screen.getByText("Their record has a different number:")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Match" }))
    expect(
      screen.getByText("Match changed from Layla Haddad to Rana Haddad by Queenie"),
    ).toBeTruthy()
    expect(screen.getByText("Linked to Layla Haddad automatically by Cami")).toBeTruthy()
    unmount()
  })

  it("adds a client with the name from the message, marked as a guess", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("?c=unmatched-fatima")
    await user.click(screen.getByRole("button", { name: /Add new client/ }))
    const dialog = screen.getByRole("dialog")
    expect((within(dialog).getByLabelText("First name") as HTMLInputElement).value).toBe("Fatima")
    expect(within(dialog).getByText("Guessed from their message — check it")).toBeTruthy()
    await user.click(within(dialog).getByRole("button", { name: "Save client" }))
    expect(screen.getByText("Fatima added as a new client by Queenie")).toBeTruthy()
    // IX-C6 row 5: a clean empty panel once the visits read answers.
    expect(await screen.findByText("New client")).toBeTruthy()
    unmount()
  })

  it("never makes up a name: with none known, it asks once and waits", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("?c=unmatched-saturday")
    await user.click(screen.getByRole("button", { name: /Add new client/ }))
    const dialog = screen.getByRole("dialog")
    expect((within(dialog).getByLabelText("First name") as HTMLInputElement).value).toBe("")
    expect(
      within(dialog).getByRole("button", { name: "Save client" }).hasAttribute("disabled"),
    ).toBe(true)
    await user.click(within(dialog).getByRole("button", { name: "Ask for their name" }))
    expect(screen.getByText("Waiting for their name")).toBeTruthy()
    // Asked once: opening the form again offers no second question.
    await user.click(screen.getByRole("button", { name: /Add new client/ }))
    expect(
      within(screen.getByRole("dialog")).queryByRole("button", { name: "Ask for their name" }),
    ).toBeNull()
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }))
    expect(within(screen.getByRole("log")).getByText(/Could you tell us your name/)).toBeTruthy()
    // The client answers with a name: the pane says so and offers it, as a guess.
    await user.click(screen.getByRole("button", { name: /Design repo/ }))
    await user.click(screen.getByRole("button", { name: "Client writes now" }))
    expect(screen.getByText("They replied")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Add Rana" }))
    expect(
      (within(screen.getByRole("dialog")).getByLabelText("First name") as HTMLInputElement).value,
    ).toBe("Rana")
    unmount()
  })

  it("won't create a second client on a number that is already one — offers Match", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("?c=unmatched-closed")
    await user.click(screen.getByRole("button", { name: /Add new client/ }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("This number is on 2 clients")).toBeTruthy()
    expect(within(dialog).queryByRole("button", { name: "Save client" })).toBeNull()
    unmount()
  })
})

describe("Inbox Phase 0 — media (IX-A6)", () => {
  it("blocks a file WhatsApp rejects, with the reason", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { container, unmount } = openAt("")
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, new File(["x"], "photos.zip", { type: "application/zip" }))
    expect(screen.getByText("WhatsApp doesn't accept this type of file (.zip)")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Send" }).hasAttribute("disabled")).toBe(true)
    unmount()
  })

  it("shows the client's photo and video, each opening full size", () => {
    const { unmount } = openAt("?c=omar")
    expect(
      screen.getAllByRole("button", { name: /Photo · Open full size|Video · Open full size/ })
        .length,
    ).toBeGreaterThan(0)
    unmount()
  })
})

describe("Inbox Phase 0 — access (T1 states)", () => {
  it("read only: the chat reads, nothing can be sent or changed", () => {
    const { unmount } = openAt("?state=read-only&c=unmatched-saturday")
    expect(screen.getByText("You can read this chat, but not reply")).toBeTruthy()
    expect(screen.queryByPlaceholderText("Write a message")).toBeNull()
    expect(screen.queryByRole("button", { name: /Match to client/ })).toBeNull()
    unmount()
  })
})
