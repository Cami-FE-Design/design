"use client"

import { MessageCircleIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatAedDecimal } from "./mock"
import type { PaymentLinkDetails } from "./self-checkout-dialog"

// PRO-909. Once a payment link is out, the cart is locked: the amount and the
// payment method are frozen so the link and the sale cannot drift apart. This
// takes over the whole drawer body — the lock is a state of the sale, not a
// modal moment, so there is no two-pane cart to return to behind it.

/** Links live 12 hours (decision log). Not surfaced on this screen — the
 * operator can't act on the deadline, and the backend expires the link on its
 * own. Kept here as the single place the TTL is written down. */
export const LINK_TTL_MS = 12 * 60 * 60 * 1000

export type ActivePaymentLink = PaymentLinkDetails & {
  /** Epoch ms the link was generated. Expiry derives from this + LINK_TTL_MS. */
  sentAt: number
  /** Draft sale created alongside the link — where cancelling hands back to. */
  draftRef: string
}

type PaymentLinkLockScreenProps = {
  link: ActivePaymentLink
  /** Invalidate the link and unlock the cart. Does not cancel the draft sale. */
  onCancelLink: () => void
  /** Demo-only settle, standing in for the payment socket. */
  onMarkPaid: () => void
}

export function PaymentLinkLockScreen({
  link,
  onCancelLink,
  onMarkPaid,
}: PaymentLinkLockScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const firstName = link.name.split(" ")[0] || "your client"

  return (
    <div className="flex flex-1 flex-col px-6 py-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
          <MessageCircleIcon className="size-9" strokeWidth={1.75} />
        </span>

        <div className="flex max-w-sm flex-col gap-1.5">
          <h1 className="text-balance font-heading font-semibold text-2xl text-foreground">
            Payment link sent
          </h1>
          <p className="text-pretty text-muted-foreground leading-relaxed">
            {firstName} can pay {formatAedDecimal(link.amountMinor)} on their own phone. We sent the
            link to +971 {link.phone}.
          </p>
        </div>

        <Button variant="ghost" radius="full" className="mt-1" onClick={() => setConfirmOpen(true)}>
          Cancel payment link
        </Button>
      </div>

      {/* Demo scaffolding. In the real build the payment socket settles the sale;
          this stands in so the paid outcome is reachable from the prototype. */}
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

      {/* Links are never edited, only invalidated — so this is a one-way door. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="flex flex-col gap-4 text-left sm:max-w-md">
          <DialogTitle className="font-heading font-semibold text-2xl">
            Cancel payment link?
          </DialogTitle>
          <p className="text-base text-muted-foreground leading-6">
            The link stops working straight away and can’t be restored. The draft sale is kept —
            we’ll take you to it, and you can check out from there.
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
              Keep link
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => {
                setConfirmOpen(false)
                onCancelLink()
              }}
            >
              Cancel link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
