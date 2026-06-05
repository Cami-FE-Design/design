"use client"

import { BanknoteIcon, type LucideIcon, SplitIcon, WalletIcon } from "lucide-react"

const METHODS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "cash", label: "Cash", icon: BanknoteIcon },
  { id: "card", label: "Card", icon: WalletIcon },
  { id: "split", label: "Split payment", icon: SplitIcon },
]

type PaymentViewProps = {
  onSelect: (id: string) => void
}

export function PaymentView({ onSelect }: PaymentViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading font-semibold text-2xl text-foreground leading-8">
        Select payment
      </h1>

      <div className="grid grid-cols-3 gap-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center transition-colors hover:bg-muted/40"
          >
            <method.icon className="size-6 stroke-[1.5] text-foreground" />
            <span className="font-medium text-base text-foreground">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
