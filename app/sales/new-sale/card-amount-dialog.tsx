"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatAedDecimal } from "./mock"

type CardAmountDialogProps = {
  open: boolean
  /** Outstanding amount, in fils. */
  toPayMinor: number
  onOpenChange: (open: boolean) => void
  onApply: (amountMinor: number) => void
}

export function CardAmountDialog({
  open,
  toPayMinor,
  onOpenChange,
  onApply,
}: CardAmountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-md">
        <CardBody toPayMinor={toPayMinor} onApply={onApply} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function CardBody({
  toPayMinor,
  onApply,
  onClose,
}: {
  toPayMinor: number
  onApply: (amountMinor: number) => void
  onClose: () => void
}) {
  const [value, setValue] = useState((toPayMinor / 100).toFixed(2))
  const amountMinor = Math.round((Number.parseFloat(value) || 0) * 100)
  const leftMinor = Math.max(0, toPayMinor - amountMinor)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <DialogTitle className="font-heading font-semibold text-xl">Add Card payment</DialogTitle>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            className="text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Amount to pay</span>
        <span className="font-medium text-foreground tabular-nums">
          {formatAedDecimal(toPayMinor)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground text-sm">Amount to pay on Card</span>
        <div className="relative">
          <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
            AED
          </span>
          <Input
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="pl-14"
            aria-label="Amount to pay on Card"
          />
        </div>
        <span className="text-muted-foreground text-xs">
          {formatAedDecimal(leftMinor)} left to be paid
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <Button type="button" variant="outline" radius="full" className="px-6" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          radius="full"
          className="px-6"
          disabled={amountMinor <= 0}
          onClick={() => {
            onApply(amountMinor)
            onClose()
          }}
        >
          Add payment
        </Button>
      </div>
    </>
  )
}
