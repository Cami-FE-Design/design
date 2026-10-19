import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ClientDetailDialog } from "@/components/blocks/clients/client-detail-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MOCK_CLIENTS } from "@/lib/clients/mock"

/**
 * Client profile notes can be corrected and removed (PILOT-60).
 *
 * Deme saves a client's history before it is finished and has had to redo the
 * whole note. Each note now carries Edit and Delete; Edit changes that note in
 * place, and Delete asks first — from the row and from inside the editor.
 */

const source = MOCK_CLIENTS.find((c) => c.id === "karen-dougall")!
const KAREN = { id: source.id, name: source.name, phone: source.phone, email: source.email }

const AYA = "Always asks for Aya. Do not rebook with anyone else without calling her first."
const WHATSAPP = "Prefers WhatsApp over calls. Never picks up the phone."

function openDocuments() {
  render(
    <TooltipProvider>
      <ClientDetailDialog open onOpenChange={() => {}} client={KAREN} initialTab="documents" />
    </TooltipProvider>,
  )
}

function noteRow(text: string) {
  return screen.getByText(text).closest("li") as HTMLElement
}

describe("editing a client note", () => {
  it("changes only that note, and keeps who wrote it", async () => {
    const user = userEvent.setup()
    openDocuments()
    await user.click(within(noteRow(AYA)).getByRole("button", { name: "Edit note" }))

    const editor = await screen.findByRole("dialog", { name: "Edit note" })
    const field = within(editor).getByRole("textbox")
    expect(field).toHaveProperty("value", AYA)

    // A multiline note, set in one go: typing it key by key is slow enough to
    // time out when the whole suite runs at once.
    fireEvent.change(field, { target: { value: "Always asks for Aya.\nCall before rebooking." } })
    await user.click(within(editor).getByRole("button", { name: "Update" }))

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit note" })).toBeNull())
    const edited = screen.getByText(/Always asks for Aya\.\s+Call before rebooking\./)
    expect(within(edited.closest("li") as HTMLElement).getByText(/by Maz Khan/)).toBeTruthy()
    expect(screen.getByText(WHATSAPP)).toBeTruthy()
    expect(screen.queryByText(AYA)).toBeNull()
  })

  it("won't update a note to blank", async () => {
    const user = userEvent.setup()
    openDocuments()
    await user.click(within(noteRow(AYA)).getByRole("button", { name: "Edit note" }))
    const editor = await screen.findByRole("dialog", { name: "Edit note" })
    fireEvent.change(within(editor).getByRole("textbox"), { target: { value: "   " } })
    expect(within(editor).getByRole("button", { name: "Update" })).toHaveProperty("disabled", true)
  })
})

describe("deleting a client note", () => {
  it("asks first, and Cancel keeps the note", async () => {
    const user = userEvent.setup()
    openDocuments()
    await user.click(within(noteRow(WHATSAPP)).getByRole("button", { name: "Delete note" }))
    const confirm = await screen.findByRole("dialog", { name: "Delete note?" })
    await user.click(within(confirm).getByRole("button", { name: "Cancel" }))
    expect(screen.getByText(WHATSAPP)).toBeTruthy()
  })

  it("removes only that note once confirmed", async () => {
    const user = userEvent.setup()
    openDocuments()
    await user.click(within(noteRow(WHATSAPP)).getByRole("button", { name: "Delete note" }))
    const confirm = await screen.findByRole("dialog", { name: "Delete note?" })
    await user.click(within(confirm).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(screen.queryByText(WHATSAPP)).toBeNull())
    expect(screen.getByText(AYA)).toBeTruthy()
  })

  it("asks first from inside the editor too", async () => {
    const user = userEvent.setup()
    openDocuments()
    await user.click(within(noteRow(WHATSAPP)).getByRole("button", { name: "Edit note" }))
    const editor = await screen.findByRole("dialog", { name: "Edit note" })
    await user.click(within(editor).getByRole("button", { name: "Delete" }))
    expect(await screen.findByRole("dialog", { name: "Delete note?" })).toBeTruthy()
    // Still in the list behind the confirmation (the editor holds a copy too).
    // The list sits under two modals, so it is aria-hidden for now.
    const listed = screen
      .getAllByRole("listitem", { hidden: true })
      .some((li) => li.textContent?.includes(WHATSAPP))
    expect(listed).toBe(true)
  })
})
