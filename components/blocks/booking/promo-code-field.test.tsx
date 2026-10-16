import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { PromoCodeField } from "@/components/blocks/booking/promo-code-field"
import { bookingPromoLines } from "@/lib/booking"
import { MOCK_DEALS } from "@/lib/deals/mock"
import { evaluateBookingCode } from "@/lib/deals/online"

/** The flow's half: holds the applied code and re-checks it, as BookingFlow does. */
function Harness({ serviceIds }: { serviceIds: string[] }) {
  const [code, setCode] = useState<string | null>(null)
  const check = (c: string) =>
    evaluateBookingCode(c, {
      deals: MOCK_DEALS,
      locationId: "shampooch-jvc",
      locationName: "Shampooch JVC",
      todayIso: "2026-08-24",
      lines: bookingPromoLines(serviceIds),
      clientHasRedeemed: () => false,
    })
  return (
    <PromoCodeField
      applied={code ? { code, result: check(code) } : null}
      onApply={(c) => {
        const result = check(c)
        if (result.ok) setCode(result.promo.code)
        return result
      }}
      onRemove={() => setCode(null)}
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

  it("takes one code per booking, with no way to add a second", async () => {
    render(<Harness serviceIds={["full-groom", "teeth"]} />)
    await enter("SPA20")
    await screen.findByText(/SPA20/)
    expect(screen.queryByRole("button", { name: /another code/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Have a promo code?" })).not.toBeInTheDocument()
  })

  it("shows the code as checking while the booking is re-checked", () => {
    render(
      <PromoCodeField
        applied={{
          code: "SPA20",
          result: { ok: false, refusal: { kind: "not-found", message: "" } },
        }}
        onApply={() => ({ ok: false, refusal: { kind: "not-found", message: "" } })}
        onRemove={() => {}}
        rechecking
      />,
    )
    expect(screen.getByText("checking")).toBeInTheDocument()
    // No amount and no remove until the answer is back.
    expect(screen.queryByRole("button", { name: "Remove SPA20" })).not.toBeInTheDocument()
  })

  it("goes back to an empty field when the code is removed", async () => {
    render(<Harness serviceIds={["full-groom"]} />)
    await enter("WELCOME15")
    await userEvent.click(await screen.findByRole("button", { name: "Remove WELCOME15" }))
    expect(screen.getByLabelText("Promo code")).toHaveValue("")
  })
})
