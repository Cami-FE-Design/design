"use client"

import { CheckIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type SendState = "edit" | "sending" | "sent"

type SendMessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Template name shown as the dialog title, e.g. "Booking confirmation". */
  templateName: string
  /** Recipient client name for the "To" line. */
  recipientName: string
  /** Recipient phone for the "To" line. Empty string hides it. */
  recipientPhone?: string
  /** Resolved template body, pre-filled into the editable textarea. */
  initialBody: string
}

export function SendMessageDialog({
  open,
  onOpenChange,
  templateName,
  recipientName,
  recipientPhone,
  initialBody,
}: SendMessageDialogProps) {
  const [body, setBody] = useState(initialBody)
  const [state, setState] = useState<SendState>("edit")

  // Reset to a fresh edit state with the latest resolved body each open.
  useEffect(() => {
    if (open) {
      setBody(initialBody)
      setState("edit")
    }
  }, [open, initialBody])

  // Mock send: hold the sending state briefly, then flip to sent in place.
  useEffect(() => {
    if (state !== "sending") return
    const timer = setTimeout(() => setState("sent"), 800)
    return () => clearTimeout(timer)
  }, [state])

  const isSent = state === "sent"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-sm">
        {isSent ? (
          <>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            </DialogClose>
            <div className="flex flex-col items-center gap-3 pb-2 pt-4 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-lime-3 text-lime-11 ring-8 ring-lime-3/40">
                <CheckIcon className="size-7" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-xl">Message sent</DialogTitle>
                <DialogDescription>Delivered to {recipientName} on WhatsApp</DialogDescription>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <DialogTitle className="text-2xl">{templateName}</DialogTitle>
                <DialogDescription>
                  To {recipientName}
                  {recipientPhone ? ` · ${recipientPhone}` : ""} · WhatsApp
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="-mt-1 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-4" aria-hidden />
                </button>
              </DialogClose>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="min-h-32"
              disabled={state === "sending"}
            />
          </>
        )}

        <DialogFooter>
          {isSent ? (
            <Button
              type="button"
              radius="full"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          ) : (
            <>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  radius="full"
                  disabled={state === "sending"}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                radius="full"
                className="gap-1.5"
                disabled={state === "sending" || body.trim().length === 0}
                onClick={() => setState("sending")}
              >
                {state === "sending" ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4" aria-hidden />
                    Send
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
