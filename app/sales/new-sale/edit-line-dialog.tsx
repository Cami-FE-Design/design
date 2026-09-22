"use client"

import { MinusIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { dealDiscountMinor, offersAtTill } from "@/lib/deals/eligible"
import { formatDiscountValue, MOCK_DEALS } from "@/lib/deals/mock"
import { useLocations } from "@/lib/locations/store"
import { TODAY_ISO } from "@/lib/money/mock"
import { money, STAFF } from "./mock"
import type { CartLine } from "./types"

export type LinePatch = {
  priceMinor: number
  qty: number
  staffName?: string
  /** The deal on this line, or undefined for none (DW3.4). */
  dealId?: string
  /** What it reads as on the line, the footer and the receipt. */
  dealName?: string
  /** What that deal takes off this line, in fils. */
  dealDiscountMinor?: number
}

type EditLineDialogProps = {
  line: CartLine
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (uid: string, patch: LinePatch) => void
  /** Omit on read-only steps (Tip / Payment) to hide the delete control. */
  onDelete?: (uid: string) => void
  /**
   * The branch this sale is being taken at (R11).
   *
   * Required to answer which deals are on offer at all — a deal scoped to
   * another branch is not shown, and a sale with no branch is offered none.
   */
  locationId: string | null
  /**
   * The cart's total before this line's deal, in fils — a deal's minimum spend
   * is about the cart, not the line it is attached to.
   */
  cartTotalMinor?: number
  /**
   * How many times the attached client has already used each deal. `null` for
   * a walk-in, which is not zero: nobody can say whether an unnamed client has
   * had a once-per-client offer before.
   */
  clientRedemptions?: number | null
}

/** The select's "nothing chosen" value. Radix refuses an empty string. */
const NO_DEAL = "none"

export function EditLineDialog({
  line,
  open,
  onOpenChange,
  onApply,
  onDelete,
  locationId,
  cartTotalMinor = 0,
  clientRedemptions = null,
}: EditLineDialogProps) {
  const [price, setPrice] = useState((line.priceMinor / 100).toFixed(2))
  const [qty, setQty] = useState(line.qty)
  const [staff, setStaff] = useState(line.staffName ?? "Any")

  const [dealId, setDealId] = useState(line.dealId ?? NO_DEAL)

  // Only what runs at the branch this sale is being taken at (R11, R18).
  const { locationName } = useLocations()
  // The line's own kind as well as the branch: a grooming offer takes nothing
  // off a bottle of conditioner, which is what this screen showed before the
  // applicability axis existed here.
  // Every offer that belongs on this screen, each carrying the reason it
  // cannot be taken yet — a minimum spend not reached, a cap used up, a
  // once-per-client offer this client has had. Those rows stay visible and
  // disabled: "spend AED 40 more" is something the person at the counter can
  // act on, and hiding it makes the offer look as though it never existed.
  const offers = offersAtTill(MOCK_DEALS, locationId, TODAY_ISO, line.kind, {
    cartTotalMinor,
    clientRedemptions,
    totalRedemptions: 0,
  })

  const priceMinor = Math.round((Number.parseFloat(price) || 0) * 100)
  const grossMinor = priceMinor * qty
  const deal = offers.find((o) => o.deal.id === dealId && !o.block)?.deal
  // Computed against this line's gross, the way the built product does it — a
  // line discount is one flat amount for the whole line, not a per-unit one.
  const discountMinor = deal ? dealDiscountMinor(deal, grossMinor) : 0
  const totalMinor = Math.max(0, grossMinor - discountMinor)

  function apply() {
    onApply(line.uid, {
      priceMinor,
      qty,
      staffName: staff,
      dealId: deal?.id,
      // Named here, once, rather than re-derived by each surface downstream.
      // The line is what the cart, the footer and the receipt all read from,
      // and the deal it was taken under may not exist by the time one of them
      // is reprinted.
      dealName: deal ? `${deal.name} · ${formatDiscountValue(deal)} off` : undefined,
      dealDiscountMinor: discountMinor,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-6 sm:max-w-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="font-heading font-semibold text-2xl">
            Edit {line.name}
          </DialogTitle>
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price">
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
                AED
              </span>
              <Input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => setPrice((Number.parseFloat(price) || 0).toFixed(2))}
                className="pl-14"
                aria-label="Price"
              />
            </div>
          </Field>

          <Field label="Quantity">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1"
                aria-label="Quantity"
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="full"
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <MinusIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="full"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </Field>
        </div>

        {/* A deal attaches to a LINE, which is where the built product puts it
            (`edit-line-dialog.tsx` on promotion-discount-ui: a select of
            eligible promotions, and the discount computed against that line's
            gross). It was a disabled select here, and the first attempt at
            wiring it up was a panel floating under the cart — which offered a
            percentage of nothing on an empty cart.

            The list is the deals running at THIS SALE'S BRANCH today (DW3.4).
            A deal scoped elsewhere is not shown, and there is no override: it
            is another branch's decision about its own diary, unlike a client's
            package, which is theirs and only warns (KC1.5). */}
        <Field label="Discounts">
          <Select value={dealId} onValueChange={setDealId}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12"
              aria-label="Discounts"
            >
              <SelectValue placeholder="None selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_DEAL}>No discount</SelectItem>
              {offers.map(({ deal, block }) => (
                <SelectItem key={deal.id} value={deal.id} disabled={Boolean(block)}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {deal.name} · {formatDiscountValue(deal)} off
                    </span>
                    {/* The reason, on the row it belongs to. A greyed line with
                        no explanation is a control the reader has to guess at,
                        and this one has an answer they can act on. */}
                    {block ? (
                      <span className="text-muted-foreground text-xs">
                        {block.reason}
                        {block.detail ? ` · ${block.detail}` : ""}
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {offers.length === 0 && locationId ? (
            <span className="text-muted-foreground text-xs">
              {line.kind === "gift-card"
                ? "Deals do not apply to gift cards."
                : `No deal running at ${locationName(locationId)} today applies to ${
                    line.kind === "product" ? "products" : "services"
                  }.`}
            </span>
          ) : null}
        </Field>

        <Field label="Team member">
          <Select value={staff} onValueChange={setStaff}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12"
              aria-label="Team member"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {discountMinor > 0 ? `Item total · ${money(discountMinor)} off` : "Item total"}
            </span>
            <span className="font-semibold text-foreground text-lg tabular-nums">
              {money(totalMinor)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onDelete ? (
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                radius="full"
                aria-label={`Delete ${line.name}`}
                className="text-destructive"
                onClick={() => {
                  onDelete(line.uid)
                  onOpenChange(false)
                }}
              >
                <Trash2Icon className="size-5" />
              </Button>
            ) : null}
            <Button type="button" radius="full" className="px-8" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground text-sm">{label}</Label>
      {children}
    </div>
  )
}
