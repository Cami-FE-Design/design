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

describe("Inbox Phase 0 — templates and failed send", () => {
  it("shows initials on list and client-pane avatars, and none in the thread header", () => {
    const { unmount } = openAt("")
    const layla = screen.getByRole("button", { name: /Layla Haddad/ })
    expect(layla.querySelector("[data-slot=avatar]")?.textContent).toBe("LH")
    const unmatched = screen.getByRole("button", { name: /\+971 55 447 1209/ })
    const dashed = unmatched.querySelector("span.border-dashed")
    expect(dashed?.querySelector("svg")).toBeTruthy()
    expect(dashed?.textContent).toBe("Unmatched")
    expect(unmatched.querySelector(".lucide-user-round-search")).toBeNull()
    const pane = [...document.querySelectorAll("[data-slot=avatar]")].find(
      (el) => el.textContent === "LH" && !layla.contains(el),
    )
    expect(pane).toBeTruthy()
    expect(document.querySelector("header [data-slot=avatar]")).toBeNull()
    unmount()
  })

  it("opens search from the icon and hides it again", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("")
    const list = screen.getByRole("complementary", { name: "Chats" })
    expect(within(list).queryByPlaceholderText("Search chats")).toBeNull()
    expect(screen.getAllByRole("heading", { name: "Inbox" })).toHaveLength(1)
    await user.click(within(list).getByRole("button", { name: "Search" }))
    const field = within(list).getByPlaceholderText("Search chats")
    await user.type(field, "Layla")
    expect(screen.getByRole("button", { name: /Layla Haddad/ })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Omar Khalil/ })).toBeNull()
    await user.click(within(list).getByRole("button", { name: "Clear search" }))
    expect(within(list).queryByPlaceholderText("Search chats")).toBeNull()
    expect(screen.getByRole("button", { name: /Omar Khalil/ })).toBeTruthy()
    await user.click(within(list).getByRole("button", { name: "Search" }))
    expect(within(list).getByPlaceholderText("Search chats")).toBeTruthy()
    await user.click(within(list).getByRole("button", { name: "Search" }))
    expect(within(list).queryByPlaceholderText("Search chats")).toBeNull()
    unmount()
  })

  it("does not treat unread: no count, badge, or bold name", () => {
    const { unmount } = openAt("?c=sara")
    expect(screen.queryByText(/unread/i)).toBeNull()
    const omar = screen.getByRole("button", { name: /Omar Khalil/ })
    const name = omar.querySelector("span.truncate")
    expect(name?.className).toContain("font-medium")
    expect(name?.className).not.toContain("font-bold")
    expect(omar.querySelector(".bg-cami-violet-9")).toBeNull()
    unmount()
  })

  it("sends the no-blank template on an unmatched chat, and still blocks a blank", async () => {
    const user = userEvent.setup()
    const { unmount } = openAt("?c=unmatched-closed")
    await user.click(screen.getByRole("button", { name: "Choose a template" }))
    await user.click(screen.getByRole("button", { name: /Follow-up reply/ }))
    expect(screen.getByRole("button", { name: "Send template" }).hasAttribute("disabled")).toBe(
      true,
    )
    expect(
      screen.getByText("Match this chat to a client first. Cami never guesses a name."),
    ).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Change" }))
    await user.click(screen.getByRole("button", { name: /Thanks, reply here/ }))
    const send = screen.getByRole("button", { name: "Send template" })
    expect(send.hasAttribute("disabled")).toBe(false)
    await user.click(send)
    expect(
      within(screen.getByRole("log")).getByText(
        "Hi, thanks for your message. Reply here and we'll pick up where we left off.",
      ),
    ).toBeTruthy()
    unmount()
  })

  it("marks not sent on the avatar, and leaves unmatched as the dashed person", () => {
    const { unmount } = openAt("?c=noura")
    const noura = screen.getByRole("button", { name: /Noura Saeed/ })
    const icon = noura.querySelector("svg.lucide-circle-alert")
    expect(icon).toBeTruthy()
    const time = [...noura.querySelectorAll("span")].find((el) =>
      /^\d{1,2}:\d{2}$/.test(el.textContent?.trim() ?? ""),
    )
    expect(time?.querySelector("svg")).toBeNull()
    expect(time?.parentElement?.querySelector("svg")).toBeNull()
    expect(noura.querySelector("[dir=auto]")?.textContent).toMatch(/Yes! See you at 6pm/)
    expect(noura.querySelector("[dir=auto]")?.textContent).not.toMatch(/Not sent/)
    const layla = screen.getByRole("button", { name: /Layla Haddad/ })
    expect(layla.querySelector("svg.lucide-circle-alert")).toBeNull()
    const saturday = screen.getByRole("button", { name: /\+971 55 447 1209/ })
    expect(saturday.querySelector("span.border-dashed svg")).toBeTruthy()
    expect(saturday.querySelector("svg.lucide-circle-alert")).toBeNull()
    const pack = screen.getByRole("button", { name: /welcome pack/ })
    expect(pack.querySelector("svg.lucide-file-text")).toBeNull()
    expect(pack.querySelector("svg.lucide-circle-alert")).toBeNull()
    unmount()
  })

  it("keeps the failed reason and drops the red bubble border", () => {
    const { unmount } = openAt("?c=noura")
    expect(screen.getByText(/Not sent · WhatsApp didn't accept it/)).toBeTruthy()
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy()
    expect(document.querySelector(".ring-tomato-7")).toBeNull()
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
