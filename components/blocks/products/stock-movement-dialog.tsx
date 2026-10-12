"use client"

import { MinusIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { WriteTargetLocation } from "@/components/blocks/settings/write-target-location"
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
import { quantityAt } from "@/lib/inventory/branch-stock"
import { useBranchStock } from "@/lib/inventory/store"
import { useLocations } from "@/lib/locations/store"

// Adding and removing stock are one form: where, how many, why. Stock coming
// in also asks what it cost. Each movement is an operational write, so it
// names one branch and there is no default (R11, R16): receiving a case of
// shampoo at "the business" is not a thing that happens, and removing stock
// from "the business" would leave every branch's count unchanged and the
// total wrong, which is the failure DW4.1 is written about.

type Direction = "in" | "out"

const COPY: Record<
  Direction,
  { title: string; description: string; action: string; reasons: [string, string][] }
> = {
  in: {
    title: "Add stock",
    description: "Record incoming stock for this product, including supply price and a reason.",
    action: "This delivery",
    reasons: [
      ["new-stock", "New Stock"],
      ["return", "Return"],
      ["transfer", "Transfer"],
      ["adjustment", "Adjustment"],
      ["other", "Other"],
    ],
  },
  out: {
    title: "Remove stock",
    description: "Record outgoing stock for this product and the reason it was removed.",
    action: "This removal",
    reasons: [
      ["internal-use", "Internal use"],
      ["damaged", "Damaged"],
      ["expired", "Expired"],
      ["theft", "Theft"],
      ["other", "Other"],
    ],
  },
}

type CommonProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  /** Which product, so the count can be read at the location chosen. */
  productId?: string
  stockOnHand: number
}

export function AddStockDialog({
  onSave,
  ...props
}: CommonProps & {
  /** The movement, with the branch it happened at (R11, R16). */
  onSave?: (qty: number, supplyPrice: string, reason: string, locationId: string) => void
}) {
  return (
    <StockMovementDialog
      direction="in"
      {...props}
      onSave={(m) => onSave?.(m.qty, m.supplyPrice, m.reason, m.locationId)}
    />
  )
}

export function RemoveStockDialog({
  onSave,
  ...props
}: CommonProps & {
  /** The movement, with the branch it happened at (R11, R16). */
  onSave?: (qty: number, reason: string, locationId: string) => void
}) {
  return (
    <StockMovementDialog
      direction="out"
      {...props}
      onSave={(m) => onSave?.(m.qty, m.reason, m.locationId)}
    />
  )
}

function StockMovementDialog({
  direction,
  open,
  onOpenChange,
  productName,
  productId,
  stockOnHand,
  onSave,
}: CommonProps & {
  direction: Direction
  onSave: (m: { qty: number; supplyPrice: string; reason: string; locationId: string }) => void
}) {
  const copy = COPY[direction]
  const idPrefix = direction === "in" ? "add-stock" : "remove-stock"
  const { stock } = useBranchStock()
  const { isMultiLocation, locationName } = useLocations()
  const [qty, setQty] = useState(1)
  const [supplyPrice, setSupplyPrice] = useState("0.00")
  const [savePrice, setSavePrice] = useState(true)
  const [reason, setReason] = useState(copy.reasons[0][0])
  const [locationId, setLocationId] = useState<string | null>(null)

  // That location's count once it is settled. Not a limit: stock can go
  // negative.
  const atLocation = productId && locationId ? quantityAt(stock, productId, locationId) : undefined

  function handleSave() {
    if (!locationId) return
    onSave({ qty, supplyPrice, reason, locationId })
    onOpenChange(false)
    setQty(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription className="sr-only">{copy.description}</DialogDescription>
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
              {atLocation !== undefined && locationId
                ? `${atLocation} in stock${isMultiLocation ? ` at ${locationName(locationId)}` : ""}`
                : `${stockOnHand} in stock`}
            </span>
          </div>

          {/* Asked before the quantity, because "how many" has no meaning
              until "where" is settled. */}
          <WriteTargetLocation value={locationId} onChange={setLocationId} action={copy.action} />

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

          {direction === "in" ? (
            <>
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
            </>
          ) : null}

          {/* Reason */}
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-reason`}>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id={`${idPrefix}-reason`}
                className="data-[size=default]:h-12 w-full rounded-2xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {copy.reasons.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button radius="full" disabled={!locationId} onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
