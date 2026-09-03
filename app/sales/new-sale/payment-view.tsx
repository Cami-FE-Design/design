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

/**
 * Signed-in machines get their own tile up to this many, so the common counter
 * — one or two registers — is a single tap. Past it the grid stops reading as
 * a list of payment methods and starts reading as an inventory of hardware,
 * with the merchant's own device names ("Till 2", "wfewf") sitting where Cash
 * and Card are; so beyond the cap they collapse back to one POS Terminal tile
 * that opens the picker.
 */
const MAX_TERMINAL_TILES = 3

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
  /**
   * Machines someone is signed into, i.e. the ones that can actually take the
   * sale right now. Few enough and each becomes its own tile — the counter's
   * registers are the payment method, and picking one shouldn't cost a second
   * click. Selecting one calls back with `terminal:<id>`.
   */
  signedInTerminals?: { id: string; name: string }[]
}

export function PaymentView({
  onSelect,
  hasGiftCard,
  terminalAvailable = true,
  signedInTerminals = [],
}: PaymentViewProps) {
  // Per-machine tiles replace the generic one; the generic tile stays whenever
  // there is no single obvious machine to name — none signed in (the picker
  // says why) or too many to list.
  const perMachine =
    terminalAvailable &&
    signedInTerminals.length > 0 &&
    signedInTerminals.length <= MAX_TERMINAL_TILES
  const methods = [
    ...METHODS.filter((m) => m.id !== "terminal" || (terminalAvailable && !perMachine)),
    ...(perMachine
      ? signedInTerminals.map((t) => ({
          id: `terminal:${t.id}`,
          label: t.name,
          icon: CreditCardIcon,
        }))
      : []),
  ]

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
              {/* Merchant-typed device names land here beside "Cash", so the
                  label has to survive a long one rather than blow the tile. */}
              <span
                className={cn(
                  "line-clamp-2 w-full break-words font-medium text-base",
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
