"use client"

// "Email" from the sale detail dialog's Quick actions (DSG-72).
//
// Matched to the shipped implementation rather than to a screenshot:
// cami-business `src/modules/invoice/components/EmailInvoiceDialog.tsx`, read
// 2026-08-21. One prefilled Client email field, Cancel / Send, no document
// preview, and no navigation away from the sale.
//
// The attachment framing is reviewable on its own at
// /sales/invoice-document?sale=<id>&surface=email. This dialog is only the send
// step, which is why it shows no document.

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailInvoiceDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  documentLabel,
  isWalkIn = false,
  isPending = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Client email on file. Empty for walk-ins, where there is no client record. */
  defaultEmail?: string
  /** "Tax Invoice #00017", used in the confirmation toast. */
  documentLabel: string
  /** Adds the helper line explaining there is no client on file. */
  isWalkIn?: boolean
  /** Sending in flight — Send reads "Sending…" and both buttons lock. */
  isPending?: boolean
}) {
  const [email, setEmail] = useState(defaultEmail)
  // The error appears on a failed Send, not while typing — validating an
  // address the operator is halfway through entering is just noise.
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail(defaultEmail)
    setShowError(false)
  }, [open, defaultEmail])

  const emailValid = EMAIL_RE.test(email.trim())

  function handleSend() {
    if (!emailValid) {
      setShowError(true)
      return
    }
    onOpenChange(false)
    toast.success(`${documentLabel} emailed to ${email.trim()}`)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmail(defaultEmail)
      setShowError(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogDescription className="sr-only">
          Send this invoice as a PDF attachment.
        </DialogDescription>
        <DialogTitle className="text-xl font-semibold">Email invoice</DialogTitle>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email-invoice-email" className="font-medium">
            Client email
          </Label>
          {isWalkIn ? (
            <p className="text-sm text-muted-foreground">
              No client on file. Enter the recipient email below.
            </p>
          ) : null}
          <Input
            id="email-invoice-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setShowError(false)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
            className="h-12 rounded-2xl"
            autoFocus
          />
          {showError ? (
            <p className="text-sm text-destructive">
              {!email.trim() ? "Email address is required" : "Enter a valid email address"}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            radius="full"
            className="flex-1"
            onClick={handleSend}
            disabled={isPending || !emailValid}
          >
            {isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
