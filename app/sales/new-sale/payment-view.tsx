"use client"

import {
  BanknoteIcon,
  CreditCardIcon,
  GiftIcon,
  InfoIcon,
  type LucideIcon,
  SmartphoneIcon,
  SplitIcon,
  WalletIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const METHODS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "link", label: "Payment link", icon: SmartphoneIcon },
  { id: "cash", label: "Cash", icon: BanknoteIcon },
  { id: "card", label: "Card", icon: WalletIcon },
  { id: "gift-card", label: "Gift card", icon: GiftIcon },
  { id: "split", label: "Split payment", icon: SplitIcon },
  { id: "terminal", label: "POS Terminal", icon: CreditCardIcon },
]

type PaymentViewProps = {
  onSelect: (id: string) => void
  /**
   * Cart contains a gift card being sold — show the redemption-blocked notice
   * and disable the Gift card method (a gift card can't pay for another).
   */
  hasGiftCard?: boolean
  /**
   * Merchant has a usable card machine. The real build asks the backend for
   * one boolean and fails closed on anything else — a payment option must
   * never appear because a request failed. Hiding the tile is the affordance,
   * not the security boundary: the backend refuses a sale routed to a
   * terminal that cannot pick it up regardless of what we render.
   */
  terminalAvailable?: boolean
}

export function PaymentView({ onSelect, hasGiftCard, terminalAvailable = true }: PaymentViewProps) {
  const methods = METHODS.filter((m) => m.id !== "terminal" || terminalAvailable)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading font-semibold text-2xl text-foreground leading-8">
        Select payment
      </h1>

      {hasGiftCard ? (
        <div className="flex items-center gap-3 rounded-2xl bg-blue-3 px-4 py-3 text-blue-12">
          <InfoIcon className="size-5 shrink-0" />
          <p className="text-sm leading-5">
            Gift cards can't be used to purchase another gift card
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        {methods.map((method) => {
          const disabled = method.id === "gift-card" && Boolean(hasGiftCard)
          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center transition-colors",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/40",
              )}
            >
              <method.icon
                className={cn(
                  "size-6 stroke-[1.5]",
                  disabled ? "text-muted-foreground" : "text-foreground",
                )}
              />
              <span
                className={cn(
                  "font-medium text-base",
                  disabled ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {method.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
