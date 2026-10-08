"use client"

import { LogInIcon, TriangleAlertIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-mock"

type LoginAsOwnerDialogProps = {
  business: {
    id: string
    name: string
    ownerName: string
    ownerEmail: string
  }
  /**
   * Default behavior is to open the impersonation portal demo in a new tab. Override
   * if a real BE call is wired up — should hit POST /api/v1/admin/impersonate and
   * navigate to the returned `portalUrl`.
   */
  onConfirm?: (input: { merchantUserId: string; reason: string }) => void
}

const MIN_REASON_LENGTH = 10

export function LoginAsOwnerDialog({ business, onConfirm }: LoginAsOwnerDialogProps) {
  const auth = useAuth()
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [open, setOpen] = useState(false)
  const tooShort = reason.trim().length < MIN_REASON_LENGTH
  const showError = submitted && tooShort

  function handleConfirm() {
    setSubmitted(true)
    if (tooShort) return
    if (onConfirm) {
      onConfirm({ merchantUserId: business.id, reason })
    } else {
      auth.setImpersonating(true)
      window.open("/admin/portal-impersonation-demo", "_blank", "noopener")
    }
    setOpen(false)
    setReason("")
    setSubmitted(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setReason("")
      setSubmitted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" data-icon="inline-start">
          <LogInIcon />
          Sign in as Owner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-sand-3 text-sand-11">
            <TriangleAlertIcon className="size-5" />
          </div>
          <DialogTitle>Sign in as {business.ownerName}?</DialogTitle>
          <DialogDescription>
            You&apos;re about to enter{" "}
            <span className="font-medium text-foreground">{business.name}</span> as the owner. Every
            action you take is recorded against your HQ account in the audit log. This session
            expires after 30 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="group mt-2 grid gap-2" data-error={showError ? "true" : undefined}>
          <Label htmlFor="impersonation-reason">Reason</Label>
          <Textarea
            id="impersonation-reason"
            placeholder="Reproducing a billing issue reported in ticket #4218"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={showError || undefined}
            aria-describedby="impersonation-reason-hint"
            rows={3}
          />
          <p
            id="impersonation-reason-hint"
            className={
              showError
                ? "text-xs leading-4 text-destructive"
                : "text-xs leading-4 text-muted-foreground"
            }
          >
            {showError
              ? `Reason must be at least ${MIN_REASON_LENGTH} characters.`
              : "Visible to engineering and the business owner. Be specific."}
          </p>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Open portal as owner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
