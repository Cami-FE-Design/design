"use client"

import {
  ArrowLeftIcon,
  BanknoteIcon,
  CirclePlusIcon,
  DollarSignIcon,
  Trash2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Payment } from "./cart-summary"
import { formatAedDecimal } from "./mock"

type SplitPaymentViewProps = {
  payments: Payment[]
  onBack: () => void
  onAddMethod: () => void
  onRemovePayment: (id: number) => void
}

export function SplitPaymentView({
  payments,
  onBack,
  onAddMethod,
  onRemovePayment,
}: SplitPaymentViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
        <h1 className="font-heading font-semibold text-2xl text-foreground leading-8">
          Split payment
        </h1>
      </div>

      {payments.length > 0 ? (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  p.method === "cash"
                    ? "bg-cami-green-3 text-cami-green-11"
                    : "bg-cami-violet-3 text-cami-violet-11",
                )}
              >
                {p.method === "cash" ? (
                  <BanknoteIcon className="size-5" />
                ) : (
                  <DollarSignIcon className="size-5" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">
                {p.method === "cash" ? "Cash" : "Card"}
                {p.receivedBy ? (
                  <span className="text-muted-foreground"> · {p.receivedBy}</span>
                ) : null}
              </span>
              <span className="shrink-0 font-medium text-foreground text-sm tabular-nums">
                {formatAedDecimal(p.amountMinor)}
              </span>
              <button
                type="button"
                onClick={() => onRemovePayment(p.id)}
                aria-label="Remove payment"
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onAddMethod}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border border-dashed px-4 py-4 font-medium text-cami-violet-11 text-sm transition-colors hover:bg-muted/40"
      >
        <CirclePlusIcon className="size-5" />
        Add payment method
      </button>
    </div>
  )
}
