"use client"

import { MinusIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RemoveStockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  stockOnHand: number
  onSave?: (qty: number, reason: string) => void
}

export function RemoveStockDialog({
  open,
  onOpenChange,
  productName,
  stockOnHand,
  onSave,
}: RemoveStockDialogProps) {
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState("internal-use")

  function handleSave() {
    onSave?.(qty, reason)
    onOpenChange(false)
    setQty(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
          <DialogTitle>Remove stock</DialogTitle>
          <DialogDescription className="sr-only">
            Record outgoing stock for this product and the reason it was removed.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-6">
          {/* Product identity */}
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-sm font-semibold text-foreground">{productName}</p>
            <span className="rounded-full bg-tomato-3 px-2.5 py-0.5 text-xs font-medium text-tomato-11">
              {stockOnHand} in stock
            </span>
          </div>

          {/* Quantity stepper */}
          <div className="flex flex-col items-center gap-2">
            <Label className="text-sm font-medium text-foreground">Quantity</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="size-4" />
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="h-12 w-24 rounded-2xl bg-input text-center text-sm font-medium text-foreground outline-none ring-inset focus-visible:ring-2 focus-visible:ring-foreground"
              />
              <button
                type="button"
                onClick={() => setQty((v) => v + 1)}
                className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Increase quantity"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label htmlFor="remove-stock-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id="remove-stock-reason"
                className="data-[size=default]:h-12 w-full rounded-2xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal-use">Internal use</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button radius="full" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
