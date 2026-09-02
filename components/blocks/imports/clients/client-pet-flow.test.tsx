import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { getClientPetScenario } from "@/lib/imports/client-pet-mock"
import { ClientPetFlow } from "./client-pet-flow"

const scenario = getClientPetScenario("aya-clients")

describe("the flow's start step and its reset are different things", () => {
  it("opens on the step the link names", () => {
    const { unmount } = render(<ClientPetFlow scenario={scenario} startAt="review" />)
    expect(screen.getByText(/clients are ready to import$/)).toBeTruthy()
    unmount()
  })

  it("sends 'Import another file' to Upload even when the link opened on a later step", async () => {
    // Regression: reset returned to `startAt`, so a link carrying ?at=review
    // bounced the operator back into the review of the file they just finished.
    const user = userEvent.setup()
    const { unmount } = render(<ClientPetFlow scenario={scenario} startAt="done" />)

    await user.click(screen.getByRole("button", { name: "Import another file" }))
    expect(screen.getByText(/^Bring your clients into Cami$/)).toBeTruthy()
    unmount()
  })
})
