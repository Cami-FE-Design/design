"use client"

import { XIcon } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /**
   * Return a promise to keep the dialog open while it runs: both buttons lock,
   * a rejection shows `errorMessage` and leaves the dialog up for a retry, and
   * only a success closes it. A plain function closes straight away, as before.
   */
  onConfirm: () => void | Promise<void>
  /** Shown when a promise from `onConfirm` rejects. */
  errorMessage?: string
  /** Use destructive Button styling for the confirm action. */
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  errorMessage = "Something went wrong. Try again.",
  destructive = false,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (open) setFailed(false)
  }, [open])

  function handleOpenChange(next: boolean) {
    // A request in flight can't be walked away from: closing would hide
    // whether it landed.
    if (pending) return
    onOpenChange(next)
  }

  async function handleConfirm() {
    const result = onConfirm()
    if (!result) {
      onOpenChange(false)
      return
    }
    setPending(true)
    setFailed(false)
    try {
      await result
      setPending(false)
      onOpenChange(false)
    } catch {
      setPending(false)
      setFailed(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex flex-col gap-4 sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            disabled={pending}
            className="absolute right-4 top-4 z-10 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>

        <DialogTitle className="font-heading font-semibold text-2xl">{title}</DialogTitle>
        {description ? (
          <p className="text-base leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {failed ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            radius="full"
            size="lg"
            className="flex-1"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            radius="full"
            size="lg"
            className="flex-1"
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
