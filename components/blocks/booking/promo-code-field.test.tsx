import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { PromoCodeField } from "@/components/blocks/booking/promo-code-field"
import { bookingPromoLines } from "@/lib/booking"
import { MOCK_DEALS } from "@/lib/deals/mock"
import {
  type BookingPromoContext,
  evaluateAddedCode,
  evaluateBookingCodes,
} from "@/lib/deals/online"

/** The flow's half: holds the applied codes and re-checks them, as BookingFlow does. */
function Harness({ serviceIds }: { serviceIds: string[] }) {
  const [codes, setCodes] = useState<string[]>([])
  const ctx: BookingPromoContext = {
    deals: MOCK_DEALS,
    locationId: "shampooch-jvc",
    locationName: "Shampooch JVC",
    todayIso: "2026-08-24",
    lines: bookingPromoLines(serviceIds),
    clientHasRedeemed: () => false,
  }
  const checks = evaluateBookingCodes(codes, ctx)
  const taken = new Set(
    checks.flatMap((c) => (c.result.ok ? Object.keys(c.result.promo.lineDiscounts) : [])),
  )
  return (
    <PromoCodeField
      applied={checks}
      canAddAnother={ctx.lines.some((l) => !l.comboName && !taken.has(l.id))}
      onApply={(c) => {
        const result = evaluateAddedCode(c, codes, ctx)
        if (result.ok) setCodes((prev) => [...prev, result.promo.code])
        return result
      }}
      onRemove={(c) => setCodes((prev) => prev.filter((x) => x !== c))}
    />
  )
}

async function enter(code: string) {
  await userEvent.click(screen.getByRole("button", { name: "Have a promo code?" }))
  await userEvent.type(screen.getByLabelText("Promo code"), code)
  await userEvent.click(screen.getByRole("button", { name: "Apply" }))
}

describe("PromoCodeField", () => {
  it("applies a code and shows what it takes off", async () => {
    render(<Harness serviceIds={["full-groom", "nail-trim"]} />)
    await enter("welcome15")
    expect(await screen.findByText("Welcome offer · 15% off")).toBeInTheDocument()
    expect(screen.getByText("- AED 44.25")).toBeInTheDocument()
  })

  it("says why a code is refused, beside the field", async () => {
    render(<Harness serviceIds={["full-groom"]} />)
    await enter("JULY10")
    expect(await screen.findByRole("alert")).toHaveTextContent("This code expired on 31 Jul 2026.")
    expect(screen.getByLabelText("Promo code")).toHaveAttribute("aria-invalid", "true")
  })

  it("takes a second code on the lines the first one left, one promotion per line", async () => {
    render(<Harness serviceIds={["full-groom", "teeth"]} />)
    await enter("SPA20")
    await screen.findByText(/SPA20/)
    await userEvent.click(screen.getByRole("button", { name: "Add another code" }))
    await userEvent.type(screen.getByLabelText("Promo code"), "WELCOME15")
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    // SPA20 took the teeth brushing (AED 8); WELCOME15 takes only the groom: 15% of 260.
    expect(await screen.findByText("- AED 39")).toBeInTheDocument()
    expect(screen.getByText("- AED 8")).toBeInTheDocument()
  })

  it("refuses the same code twice, by name", async () => {
    render(<Harness serviceIds={["full-groom", "teeth"]} />)
    await enter("SPA20")
    await screen.findByText(/SPA20/)
    await userEvent.click(screen.getByRole("button", { name: "Add another code" }))
    await userEvent.type(screen.getByLabelText("Promo code"), "spa20")
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("This code is already applied.")
  })

  it("stops offering another code once every line is discounted", async () => {
    render(<Harness serviceIds={["full-groom"]} />)
    await enter("WELCOME15")
    await screen.findByText(/WELCOME15/)
    expect(screen.queryByRole("button", { name: "Add another code" })).not.toBeInTheDocument()
  })

  it("shows each code as checking while the booking is re-checked", () => {
    render(
      <PromoCodeField
        applied={[
          { code: "SPA20", result: { ok: false, refusal: { kind: "not-found", message: "" } } },
        ]}
        onApply={() => ({ ok: false, refusal: { kind: "not-found", message: "" } })}
        onRemove={() => {}}
        rechecking
      />,
    )
    expect(screen.getByText("checking")).toBeInTheDocument()
    // No amount, no remove, no field until the answer is back.
    expect(screen.queryByRole("button", { name: "Remove SPA20" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add another code" })).not.toBeInTheDocument()
  })

  it("goes back to an empty field when the code is removed", async () => {
    render(<Harness serviceIds={["full-groom"]} />)
    await enter("WELCOME15")
    await userEvent.click(await screen.findByRole("button", { name: "Remove WELCOME15" }))
    expect(screen.getByLabelText("Promo code")).toHaveValue("")
  })
})
