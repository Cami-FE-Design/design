"use client"

import {
  CheckIcon,
  CreditCardIcon,
  MessageCircleIcon,
  SendIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatAedDecimal } from "./mock"

// Self-checkout: the operator texts the client a secure link from the Select
// payment step. The client pays on their own phone (they land on the existing
// /[slug]/pay/[token] page) while the operator watches the progress sequence
// below. The client's side is real; the operator's side can only ever observe,
// so each beat is what the *server* would push back over the payment socket.

/** Beats the operator watches after Send link. Terminal beat settles the sale. */
type Stage = "form" | "sending" | "adding-card" | "processing" | "paid"

const STEPS = [
  "A WhatsApp message with a secure checkout link is sent to your client.",
  "The client enters their card details and confirms on their own phone.",
  "Payment is processed and settles back to this sale automatically.",
]

/**
 * Mock timings. Real build replaces these with payment-socket events:
 * message.sent → checkout.card_entered → payment.processing → payment.succeeded.
 */
const STAGE_MS: Record<Exclude<Stage, "form" | "paid">, number> = {
  sending: 2200,
  "adding-card": 3400,
  processing: 2600,
}

const NEXT_STAGE: Record<Exclude<Stage, "form" | "paid">, Stage> = {
  sending: "adding-card",
  "adding-card": "processing",
  processing: "paid",
}

/** Strip a +971 dial code off a mock client phone so it fits the local field. */
function localPart(phone?: string): string {
  if (!phone) return ""
  return phone.startsWith("+971") ? phone.slice(4).trim() : phone
}

type SelfCheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  toPayMinor: number
  defaultName?: string
  defaultPhone?: string
  /** Settle the sale once the client pays (or the operator confirms manually). */
  onPaid: (amountMinor: number) => void
}

export function SelfCheckoutDialog({
  open,
  onOpenChange,
  toPayMinor,
  defaultName,
  defaultPhone,
  onPaid,
}: SelfCheckoutDialogProps) {
  const [stage, setStage] = useState<Stage>("form")
  const [name, setName] = useState(defaultName ?? "")
  const [phone, setPhone] = useState(localPart(defaultPhone))

  const firstName = name.trim().split(" ")[0] || "your client"

  // Advance through the waiting beats. Each is a placeholder for a server push.
  useEffect(() => {
    if (stage === "form" || stage === "paid") return
    const timer = setTimeout(() => setStage(NEXT_STAGE[stage]), STAGE_MS[stage])
    return () => clearTimeout(timer)
  }, [stage])

  function close(next: boolean) {
    if (!next) setStage("form")
    onOpenChange(next)
  }

  // Settle the sale, from the success beat or from the operator's manual escape.
  function settle() {
    onPaid(toPayMinor)
    setStage("form")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        {stage === "form" ? (
          <SendForm
            name={name}
            phone={phone}
            toPayMinor={toPayMinor}
            onName={setName}
            onPhone={setPhone}
            onSend={() => setStage("sending")}
          />
        ) : (
          <ProgressView
            stage={stage}
            firstName={firstName}
            phone={phone}
            toPayMinor={toPayMinor}
            onCancel={() => setStage("form")}
            onSettle={settle}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Send form ─────────────────────────────────────────────────────────────

type SendFormProps = {
  name: string
  phone: string
  toPayMinor: number
  onName: (value: string) => void
  onPhone: (value: string) => void
  onSend: () => void
}

function SendForm({ name, phone, toPayMinor, onName, onPhone, onSend }: SendFormProps) {
  return (
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
            onChange={(e) => onName(e.target.value)}
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
              onChange={(e) => onPhone(e.target.value)}
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
          onClick={onSend}
        >
          <SendIcon className="size-4" />
          Send link
        </Button>
      </div>
    </div>
  )
}

// ─── Waiting beats ─────────────────────────────────────────────────────────

type ProgressViewProps = {
  stage: Exclude<Stage, "form">
  firstName: string
  phone: string
  toPayMinor: number
  onCancel: () => void
  onSettle: () => void
}

function ProgressView({
  stage,
  firstName,
  phone,
  toPayMinor,
  onCancel,
  onSettle,
}: ProgressViewProps) {
  const paid = stage === "paid"

  const copy: Record<Exclude<Stage, "form">, { title: string; body: string }> = {
    sending: {
      title: "Sending checkout link",
      body: `Message sent to ${firstName}'s phone +971 ${phone} with a secure link.`,
    },
    "adding-card": {
      title: `${firstName} is adding their card and confirming their purchase`,
      body: `They're paying ${formatAedDecimal(toPayMinor)} on their own phone.`,
    },
    processing: {
      title: "Processing payment",
      body: `Confirming ${formatAedDecimal(toPayMinor)} with the bank. Don't close this window.`,
    },
    paid: {
      title: "Payment received",
      body: `${firstName} paid ${formatAedDecimal(toPayMinor)}. The sale is settled.`,
    },
  }

  const Icon = {
    sending: MessageCircleIcon,
    "adding-card": SmartphoneIcon,
    processing: CreditCardIcon,
    paid: CheckIcon,
  }[stage]

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span
        // The orb pulses while we wait and settles solid on success, so the
        // terminal beat reads as "done" without a copy change.
        className={
          paid
            ? "flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-cami-violet-11 to-cami-violet-9 text-white"
            : "flex size-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-cami-violet-11 to-cami-violet-9 text-white"
        }
      >
        <Icon className="size-10" strokeWidth={1.75} />
      </span>

      <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
        <DialogTitle className="text-balance text-center font-heading font-semibold text-foreground text-xl">
          {copy[stage].title}
        </DialogTitle>
        <p className="text-pretty text-center text-muted-foreground text-sm leading-relaxed">
          {copy[stage].body}
        </p>
      </div>

      {paid ? (
        <Button radius="full" size="lg" className="mt-1 gap-1.5" onClick={onSettle}>
          <CheckIcon className="size-4" />
          Done
        </Button>
      ) : (
        <div className="mt-1 flex gap-2">
          <Button variant="ghost" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" radius="full" className="gap-1.5" onClick={onSettle}>
            <CheckIcon className="size-4" />
            Mark as paid
          </Button>
        </div>
      )}
    </div>
  )
}
