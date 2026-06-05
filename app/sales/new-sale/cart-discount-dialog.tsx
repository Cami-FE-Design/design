"use client"

import { CoinsIcon, PercentIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatAedDecimal } from "./mock"

type Mode = "amount" | "percent"

type CartDiscountDialogProps = {
  open: boolean
  baseMinor: number
  onOpenChange: (open: boolean) => void
  onApply: (discountMinor: number) => void
}

export function CartDiscountDialog({
  open,
  baseMinor,
  onOpenChange,
  onApply,
}: CartDiscountDialogProps) {
  const [mode, setMode] = useState<Mode>("percent")
  const [value, setValue] = useState("0")

  const num = Number.parseFloat(value) || 0
  const discountMinor = Math.min(
    baseMinor,
    mode === "amount" ? Math.round(num * 100) : Math.round((baseMinor * num) / 100),
  )
  const afterMinor = Math.max(0, baseMinor - discountMinor)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-5 sm:max-w-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading font-semibold text-2xl">
              Add cart discount
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Taxes will be recalculated after the discount has been applied.
            </p>
          </div>
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

        <div className="flex flex-col gap-2">
          <span className="font-medium text-foreground text-sm">Amount</span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
                {mode === "amount" ? "AED" : "%"}
              </span>
              <Input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                className={mode === "amount" ? "pl-14" : "pl-10"}
                aria-label="Discount amount"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted p-1">
              <ToggleBtn
                active={mode === "amount"}
                onClick={() => setMode("amount")}
                label="Amount"
              >
                <CoinsIcon className="size-4" />
              </ToggleBtn>
              <ToggleBtn
                active={mode === "percent"}
                onClick={() => setMode("percent")}
                label="Percent"
              >
                <PercentIcon className="size-4" />
              </ToggleBtn>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Total after discount</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-lg tabular-nums">
                {formatAedDecimal(afterMinor)}
              </span>
              {discountMinor > 0 ? (
                <span className="text-muted-foreground text-sm line-through tabular-nums">
                  {formatAedDecimal(baseMinor)}
                </span>
              ) : null}
            </span>
          </div>
          <Button
            type="button"
            radius="full"
            className="px-8"
            onClick={() => {
              onApply(discountMinor)
              onOpenChange(false)
            }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  )
}
