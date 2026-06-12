"use client"

import { CheckIcon, InfoIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { formatAed } from "@/app/appointments/mock"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Same trigger sizing as the refund flow so the reason dropdown reads as the
// same field family (h-12, rounded-2xl, input background).
const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

// First entry is the default — matches "No reason provided" being pre-selected
// in the figma. A cancellation never requires a reason.
const CANCEL_REASONS = [
  "No reason provided",
  "Duplicate appointment",
  "Appointment made by mistake",
  "Client not available",
]

type CancelAppointmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Appointment total in minor units (fils) — shown in the details card. */
  totalMinor: number
  /**
   * Whether a cancellation policy fee applies. When false (the common case in
   * the figma) we show the "No fee will be charged" reassurance line.
   */
  feeMinor?: number
  /** Fired once the cancellation is confirmed. */
  onConfirm?: () => void
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  totalMinor,
  feeMinor = 0,
  onConfirm,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState(CANCEL_REASONS[0])
  // Once cancelled we swap the form for a centred "Appointment cancelled"
  // confirmation, mirroring the "Refund complete" screen in the refund flow.
  const [done, setDone] = useState(false)

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (!open) return
    setReason(CANCEL_REASONS[0])
    setDone(false)
  }, [open])

  // Auto-close a moment after the confirmation shows — matches the refund flow.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when `done` flips
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onOpenChange(false), 2200)
    return () => clearTimeout(t)
  }, [done])

  function handleCancel() {
    onConfirm?.()
    setDone(true)
  }

  if (done) {
    return <CancelCompleteScreen open={open} onOpenChange={onOpenChange} />
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Are you sure you want to cancel?"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* ─── Left: policy notice + cancellation reason ──────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-2xl bg-cami-violet-3 px-5 py-4 text-sm leading-6 text-foreground">
            <InfoIcon className="size-5 shrink-0 text-cami-violet-11" />
            <span>No policy was applied to this appointment</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cancel-reason">Cancellation reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="cancel-reason" className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="No reason provided" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ─── Right: cancellation details + confirm action ───────────────── */}
        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border/60 bg-sand-2 p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Cancellation details
          </h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Appointment total</span>
            <span className="font-medium tabular-nums text-foreground">
              {formatAed(totalMinor)}
            </span>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            {feeMinor > 0
              ? `A cancellation fee of ${formatAed(feeMinor)} will be charged`
              : "No fee will be charged"}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            radius="full"
            className="w-full"
            onClick={handleCancel}
          >
            Cancel appointment
          </Button>
        </aside>
      </div>
    </FullScreenEditDialog>
  )
}

// Full-screen "Appointment cancelled" confirmation — mirrors RefundCompleteScreen
// (centred icon, headline) and reuses the same opaque full-screen sizing so it
// reads as the same takeover and cleanly covers the sheet stacked beneath it.
const fullScreenSuccessClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! bg-background! p-0"

function CancelCompleteScreen({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenSuccessClass}>
        <DialogTitle className="sr-only">Appointment cancelled</DialogTitle>
        <DialogDescription className="sr-only">
          The appointment has been cancelled
        </DialogDescription>
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
            <CheckIcon className="size-10" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Appointment cancelled
            </h1>
            <p className="text-muted-foreground">The appointment has been cancelled</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
