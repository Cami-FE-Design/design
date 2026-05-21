"use client"

import { MinusIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

type AddStockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  stockOnHand: number
  onSave?: (qty: number, supplyPrice: string, reason: string) => void
}

export function AddStockDialog({
  open,
  onOpenChange,
  productName,
  stockOnHand,
  onSave,
}: AddStockDialogProps) {
  const [qty, setQty] = useState(1)
  const [supplyPrice, setSupplyPrice] = useState("0.00")
  const [savePrice, setSavePrice] = useState(true)
  const [reason, setReason] = useState("new-stock")

  function handleSave() {
    onSave?.(qty, supplyPrice, reason)
    onOpenChange(false)
    setQty(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
          <DialogTitle>Add stock</DialogTitle>
          <DialogDescription className="sr-only">
            Record incoming stock for this product, including supply price and a reason.
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

          {/* Supply price */}
          <div className="grid gap-2">
            <Label htmlFor="add-stock-price">Supply price</Label>
            <div className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground">
              <span className="shrink-0 pl-4 pr-3 text-sm text-muted-foreground">AED</span>
              <span className="h-5 w-px shrink-0 bg-border/60" />
              <input
                id="add-stock-price"
                type="number"
                min={0}
                step={0.01}
                value={supplyPrice}
                onChange={(e) => setSupplyPrice(e.target.value)}
                className="h-full flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Save price */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-price"
              checked={savePrice}
              onCheckedChange={(v) => setSavePrice(v === true)}
            />
            <Label htmlFor="save-price" className="font-normal text-foreground">
              Save price for next time
            </Label>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label htmlFor="add-stock-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id="add-stock-reason"
                className="data-[size=default]:h-12 w-full rounded-2xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-stock">New Stock</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
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
