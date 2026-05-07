"use client"

import { EyeIcon, EyeOffIcon, ShieldAlertIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PII_FIELD_LABELS, type PIIField } from "@/lib/admin-impersonation"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

const MIN_REASON_LENGTH = 10
const REVEAL_TTL_SECONDS = 60

function maskValue(field: PIIField, value: string): string {
  if (field === "customer_phone") {
    const digits = value.replace(/\D/g, "")
    if (digits.length < 5) return "•".repeat(value.length)
    const tail = digits.slice(-2)
    return `${value.slice(0, value.indexOf(digits[2]) + 1)} ••• ••${tail}`
  }
  if (field === "customer_email") {
    const at = value.indexOf("@")
    if (at < 2) return value.replace(/./g, "•")
    return `${value[0]}••••${value[at - 1]}${value.slice(at)}`
  }
  if (field === "customer_address") {
    const parts = value.split(",").map((p) => p.trim())
    if (parts.length >= 2) return `•••• ••, ${parts.slice(-2).join(", ")}`
    return "•••• ••"
  }
  if (field === "payment_last4") {
    const last4 = value.replace(/\D/g, "").slice(-4)
    return `•••• ${last4}`
  }
  if (field === "vat_number") {
    if (value.length < 6) return "•".repeat(value.length)
    return `${value.slice(0, 3)}${"•".repeat(value.length - 6)}${value.slice(-3)}`
  }
  return "•".repeat(value.length)
}

type PIIRevealProps = {
  field: PIIField
  /** Resource label used in the audit log entry, e.g. "Invoice INV-2031". */
  resource: string
  value: string
  /** Optional callback fired when reason is accepted. Receives the reason and timestamp. */
  onReveal?: (reason: string, at: string) => void
  /** Optional callback fired when the field is hidden again. */
  onHide?: () => void
  className?: string
}

export function PIIReveal({ field, resource, value, onReveal, onHide, className }: PIIRevealProps) {
  const auth = useAuth()
  const requiresReason = auth.isImpersonating
  const [revealed, setRevealed] = useState(!requiresReason)
  const [revealedAt, setRevealedAt] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!requiresReason) {
      setRevealed(true)
      setRevealedAt(null)
      return
    }
    setRevealed(false)
    setRevealedAt(null)
  }, [requiresReason])

  useEffect(() => {
    if (!revealed || !revealedAt) return
    const id = window.setTimeout(() => {
      setRevealed(false)
      setRevealedAt(null)
      onHide?.()
    }, REVEAL_TTL_SECONDS * 1000)
    return () => window.clearTimeout(id)
  }, [revealed, revealedAt, onHide])

  function handleConfirm(reason: string) {
    const at = new Date().toISOString()
    setRevealed(true)
    setRevealedAt(at)
    setDialogOpen(false)
    onReveal?.(reason, at)
  }

  function handleHide() {
    setRevealed(false)
    setRevealedAt(null)
    onHide?.()
  }

  const fieldLabel = PII_FIELD_LABELS[field]

  return (
    <div
      data-slot="pii-reveal"
      data-revealed={revealed ? "true" : undefined}
      className={cn("flex min-w-0 flex-col gap-1", className)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "min-w-0 truncate font-mono text-sm",
            revealed ? "text-foreground" : "text-muted-foreground tracking-tight",
          )}
        >
          {revealed ? value : maskValue(field, value)}
        </span>
        {requiresReason ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={revealed ? handleHide : () => setDialogOpen(true)}
                aria-label={revealed ? `Hide ${fieldLabel}` : `Reveal ${fieldLabel}`}
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cami-yellow-3 text-cami-yellow-11 transition-colors hover:bg-cami-yellow-4 focus-visible:ring-2 focus-visible:ring-cami-yellow-9 focus-visible:outline-none"
              >
                {revealed ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {revealed ? `Hide ${fieldLabel.toLowerCase()}` : `Reveal ${fieldLabel.toLowerCase()}`}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {requiresReason && revealed && revealedAt ? (
        <span className="text-xs text-cami-yellow-11">
          Revealed at{" "}
          {new Date(revealedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},
          auto-hides in {REVEAL_TTL_SECONDS}s
        </span>
      ) : null}

      <PIIRevealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fieldLabel={fieldLabel}
        resource={resource}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

type PIIRevealDialogProps = {
  open: boolean
  onOpenChange: (next: boolean) => void
  fieldLabel: string
  resource: string
  onConfirm: (reason: string) => void
}

function PIIRevealDialog({
  open,
  onOpenChange,
  fieldLabel,
  resource,
  onConfirm,
}: PIIRevealDialogProps) {
  const reasonId = useId()
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const tooShort = reason.trim().length < MIN_REASON_LENGTH
  const showError = submitted && tooShort

  function handleConfirm() {
    setSubmitted(true)
    if (tooShort) return
    onConfirm(reason)
    setReason("")
    setSubmitted(false)
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setReason("")
      setSubmitted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-cami-yellow-3 text-cami-yellow-11">
            <ShieldAlertIcon className="size-5" />
          </div>
          <DialogTitle>Reveal {fieldLabel.toLowerCase()}?</DialogTitle>
          <DialogDescription>
            You're about to view a sensitive field on{" "}
            <span className="font-medium text-foreground">{resource}</span>. Cami will log this
            access against your HQ account and notify the Pet Business if they request a report.
          </DialogDescription>
        </DialogHeader>

        <div className="group mt-2 grid gap-2" data-error={showError ? "true" : undefined}>
          <Label htmlFor={reasonId}>Reason</Label>
          <Textarea
            id={reasonId}
            placeholder="e.g. Calling customer to confirm a refund destination"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={showError || undefined}
            aria-describedby={`${reasonId}-hint`}
            rows={3}
          />
          <p
            id={`${reasonId}-hint`}
            className={
              showError
                ? "text-xs leading-4 text-destructive"
                : "text-xs leading-4 text-muted-foreground"
            }
          >
            {showError
              ? `Reason must be at least ${MIN_REASON_LENGTH} characters.`
              : "Visible to engineering and the Pet Business owner. Be specific."}
          </p>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Reveal field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
