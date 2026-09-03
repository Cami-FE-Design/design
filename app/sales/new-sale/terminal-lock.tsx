"use client"

import { CreditCardIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatAedDecimal } from "./mock"

// Terminal checkout, locked cart. Same rule PRO-909 set for payment links:
// once the sale is routed to a card machine the cart is frozen, because the
// amount the machine is about to charge and the amount in the cart must not
// drift apart. See ./payment-link-lock.tsx — this is the card-present twin.
//
// It exists because the shipped flow has neither half. Sending to the terminal
// leaves the operator on the payment grid with "To pay" and "Save unpaid" still
// live, and nothing moves when the card clears: the receptionist is looking at
// an unpaid sale that has already been paid. Tapping the tile again is refused
// ("Sale cannot be routed to a collection method in status 'completed'") and
// closing offers to discard a sale that took the money.
//
// The lock is what fixes both. There is one place to be while the machine has
// the sale, and it is the same place the settlement lands.

export type ActiveTerminalCharge = {
  /**
   * What the machine will collect: the whole remaining balance. The terminal
   * settles against the backend's outstanding figure rather than an amount we
   * send it, so this is a display value — it is what the operator was told the
   * client owes at the moment of sending.
   */
  amountMinor: number
  /** The machine the sale was routed to — named on screen, since it was chosen. */
  terminalName: string
  /** Where that machine sits, e.g. "Downtown Clinic". */
  terminalLocation: string
  /** Epoch ms the sale was routed. Not surfaced; kept for the real build. */
  sentAt: number
}

type TerminalLockScreenProps = {
  charge: ActiveTerminalCharge
  /** Payer's first name, for the copy. */
  firstName: string
  /** Pull the sale back off the machine and unlock the payment grid. */
  onCancel: () => void
  /** Demo-only settle, standing in for the terminal's settlement callback. */
  onMarkPaid: () => void
}

export function TerminalLockScreen({
  charge,
  firstName,
  onCancel,
  onMarkPaid,
}: TerminalLockScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col px-6 py-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
          <CreditCardIcon className="size-9" strokeWidth={1.75} />
        </span>

        <div className="flex max-w-sm flex-col gap-1.5">
          <h1 className="text-balance font-heading font-semibold text-2xl text-foreground">
            Sent to {charge.terminalName}
          </h1>
          {/* The device is named because the operator chose it — on a counter
              with three registers, "the card terminal" is not an address. */}
          <p className="text-pretty text-muted-foreground leading-relaxed">
            {firstName} pays {formatAedDecimal(charge.amountMinor)} on this machine at{" "}
            {charge.terminalLocation}. The sale updates itself the moment the card clears — you
            don't need to refresh.
          </p>
        </div>

        <Button variant="ghost" radius="full" className="mt-1" onClick={() => setConfirmOpen(true)}>
          Collect another way
        </Button>
      </div>

      {/* Demo scaffolding. In the real build the terminal's settlement callback
          moves this to the confirmation screen; this stands in so the paid
          outcome is reachable from the prototype. Same weight as the payment
          link's — a muted text link, not a button. */}
      <p className="mx-auto text-center text-muted-foreground/70 text-xs">
        <button
          type="button"
          onClick={onMarkPaid}
          className="underline underline-offset-4 hover:text-muted-foreground"
        >
          Mark as paid
        </button>{" "}
        (for demonstration only)
      </p>

      {/* The one place the operator can lose money: cancelling a charge the
          machine has already taken. The confirm says so plainly rather than
          asking "are you sure" — that is the only reason it exists. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="flex flex-col gap-4 text-left sm:max-w-md">
          <DialogTitle className="font-heading font-semibold text-2xl">
            Take the sale off the terminal?
          </DialogTitle>
          <p className="text-base text-muted-foreground leading-6">
            The machine stops waiting for this sale and you come back to the payment methods, so you
            can take cash or another card. If the card has already gone through, stay here instead —
            the payment lands on its own.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
            >
              Keep waiting
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => {
                setConfirmOpen(false)
                onCancel()
              }}
            >
              Collect another way
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
