"use client"

import { SendIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatAedDecimal } from "./mock"

// Self-checkout: the operator texts the client a secure link from the Select
// payment step. The client pays on their own phone (they land on the existing
// /[slug]/pay/[token] page). This dialog only generates the link — once it is
// sent the cart locks and the drawer takes over (see PaymentLinkLockScreen).
// We deliberately do not narrate the client's progress here: the operator can
// only ever observe it, and a live progress dialog invites them to keep editing
// the cart underneath a link that is already out in the world (PRO-909).

const STEPS = [
  "A WhatsApp message with a secure checkout link is sent to your client.",
  "The client enters their card details and confirms on their own phone.",
  "The link stays valid for 12 hours, then expires on its own.",
]

/** Strip a +971 dial code off a mock client phone so it fits the local field. */
function localPart(phone?: string): string {
  if (!phone) return ""
  return phone.startsWith("+971") ? phone.slice(4).trim() : phone
}

export type PaymentLinkDetails = {
  name: string
  /** Local part only — the +971 prefix is fixed by the field. */
  phone: string
  amountMinor: number
}

type SelfCheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  toPayMinor: number
  defaultName?: string
  defaultPhone?: string
  /** Link generated — the caller locks the cart on this. */
  onSend: (details: PaymentLinkDetails) => void
}

export function SelfCheckoutDialog({
  open,
  onOpenChange,
  toPayMinor,
  defaultName,
  defaultPhone,
  onSend,
}: SelfCheckoutDialogProps) {
  const [name, setName] = useState(defaultName ?? "")
  const [phone, setPhone] = useState(localPart(defaultPhone))

  function send() {
    onSend({ name: name.trim(), phone: phone.trim(), amountMinor: toPayMinor })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-5">
          <DialogTitle className="font-heading font-semibold text-2xl text-foreground">
            Send link to self checkout
          </DialogTitle>

          <div className="flex flex-col gap-4">
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="sc-name">Client name</Label>
              <Input
                id="sc-name"
                placeholder="Client name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="sc-phone">Mobile number</Label>
              <div className="flex gap-2">
                <span className="flex h-12 items-center rounded-2xl bg-input px-4 font-medium text-foreground text-sm">
                  +971
                </span>
                <Input
                  id="sc-phone"
                  inputMode="tel"
                  className="flex-1"
                  placeholder="50 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4">
            <span className="font-medium text-foreground text-sm">How it works</span>
            <ol className="flex flex-col gap-2.5">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-2.5 text-muted-foreground text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background font-semibold text-foreground text-xs">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center justify-between gap-3 border-border/60 border-t pt-4">
            <div className="flex flex-col leading-tight">
              <span className="text-muted-foreground text-xs">To pay</span>
              <span className="font-semibold text-foreground text-lg tabular-nums">
                {formatAedDecimal(toPayMinor)}
              </span>
            </div>
            <Button
              radius="full"
              size="lg"
              className="gap-2"
              disabled={!name.trim() || !phone.trim()}
              onClick={send}
            >
              <SendIcon className="size-4" />
              Send link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
