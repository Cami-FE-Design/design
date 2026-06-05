"use client"

import { InfoIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

const CURRENCY = "AED"

function money(minor: number) {
  return `${CURRENCY} ${(minor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// "Friday, 22 May 2026" — same long date used in the refund header.
function formatLongDate(d: Date) {
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export type VoidPayment = {
  /** Amount of the payment, in minor units (fils). */
  amountMinor: number
  /** Payment method label, e.g. "Cash" / "Card" / "Other". */
  method: string
  /** When the payment was taken. */
  at: Date
}

type VoidSaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Payments that will be deleted when the sale is voided. */
  payments: VoidPayment[]
}

export function VoidSaleDialog({ open, onOpenChange, payments }: VoidSaleDialogProps) {
  function handleVoid() {
    toast.success("Sale voided")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            className="absolute right-4 top-4 z-10 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>

        <DialogTitle className="font-heading font-semibold text-2xl">Void sale?</DialogTitle>
        <p className="text-base leading-6 text-muted-foreground">
          This action is permanent and cannot be undone.
        </p>

        {/* Warning callout — uses the design-system warning palette (cami-yellow)
            to flag the payments that will be removed alongside the sale. */}
        {payments.length > 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-cami-yellow-5 bg-cami-yellow-2 px-4 py-3.5 text-sm">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-cami-yellow-12">
                Following payments will be deleted
              </span>
              <ul className="flex flex-col gap-0.5 text-cami-yellow-12">
                {payments.map((p) => (
                  <li key={`${p.method}-${p.at.getTime()}-${p.amountMinor}`}>
                    {money(p.amountMinor)} paid by {p.method} on {formatLongDate(p.at)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            radius="full"
            size="lg"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            radius="full"
            size="lg"
            className="flex-1"
            onClick={handleVoid}
          >
            Void
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
