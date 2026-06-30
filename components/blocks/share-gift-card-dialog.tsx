"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * "Share gift card" form — send a gift card to a recipient by email. Shared by
 * the gift-card item in the sale detail dialog and the Actions menu on the
 * gift card detail. Form state is local (prototype); Share just closes.
 */
export function ShareGiftCardDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [message, setMessage] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:!max-w-[520px] !max-w-[520px]">
        <DialogDescription className="sr-only">
          Send this gift card to a recipient by email.
        </DialogDescription>

        <div className="flex flex-col gap-2 px-8 pt-6">
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-[28px] font-semibold leading-8">Share gift card</DialogTitle>
        </div>

        <div className="flex flex-col gap-5 px-8 pb-8 pt-6">
          <label htmlFor="share-gc-sender" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Sender name</span>
            <Input id="share-gc-sender" />
          </label>
          <label htmlFor="share-gc-recipient" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Recipient name</span>
            <Input id="share-gc-recipient" />
          </label>
          <label htmlFor="share-gc-email" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Recipient email</span>
            <Input id="share-gc-email" type="email" />
          </label>
          <label htmlFor="share-gc-message" className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Personal message</span>
              <span className="text-xs text-muted-foreground">{message.length}/200</span>
            </span>
            <Textarea
              id="share-gc-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
            />
          </label>
          <Button
            type="button"
            size="lg"
            radius="full"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
