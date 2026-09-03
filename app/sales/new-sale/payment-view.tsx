"use client"

import {
  BanknoteIcon,
  CreditCardIcon,
  GiftIcon,
  InfoIcon,
  type LucideIcon,
  MonitorSmartphoneIcon,
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
 * A merchant's machines get their own tiles up to this many, so the common
 * counter — one or two registers — is a single tap. Past it the grid stops
 * reading as a list of payment methods and starts reading as an inventory of
 * hardware, with the merchant's own device names ("Till 2") sitting where Cash
 * and Card are; so beyond the cap they collapse to one POS Terminal tile that
 * opens the picker.
 *
 * Counted on REGISTERED machines, never on how many are signed in right now.
 * Otherwise a four-machine business would see two named tiles in the morning
 * and a single POS Terminal tile by noon as staff signed in — the same screen
 * changing shape through the day, for the same person. How many registers a
 * counter has is a fact about the business; who is signed into them is not.
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
   * The merchant's registered machines. Few enough and each becomes its own
   * tile — the counter's registers ARE the payment method, and picking one
   * shouldn't cost a second click. A machine that can't take the sale is still
   * shown, greyed, carrying the reason: the grid stays the same shape all day,
   * and "Grooming Counter · Nobody signed in" is more use to a receptionist
   * than a tile that quietly isn't there. Selecting one calls back with
   * `terminal:<id>`.
   */
  machines?: { id: string; name: string; blockedReason: string | null }[]
}

export function PaymentView({
  onSelect,
  hasGiftCard,
  terminalAvailable = true,
  machines = [],
}: PaymentViewProps) {
  // Per-machine tiles replace the generic one. The generic tile is what a
  // merchant past the cap gets — there the picker does the naming.
  const perMachine =
    terminalAvailable && machines.length > 0 && machines.length <= MAX_TERMINAL_TILES
  const methods = METHODS.filter((m) => m.id !== "terminal" || (terminalAvailable && !perMachine))

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
        {methods.map((method) => (
          <MethodTile
            key={method.id}
            label={method.label}
            icon={method.icon}
            disabled={method.id === "gift-card" && Boolean(hasGiftCard)}
            onClick={() => onSelect(method.id)}
          />
        ))}
      </div>

      {/* The machines get their own group rather than sitting loose among the
          methods. A tile reading "Front Desk Register" next to "Cash" and
          "Card" says nothing about what it is — and "Card" already means
          keying a card in by hand, so the two are easy to confuse. The heading
          answers it once, for all of them, and keeps the tiles themselves as
          short as the names allow. Icon matches the terminal rows in Payment
          settings, so the same object looks the same in both places. */}
      {perMachine ? (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium text-muted-foreground text-sm leading-5">Card terminals</h2>
          <div className="grid grid-cols-3 gap-3">
            {machines.map((machine) => (
              <MethodTile
                key={machine.id}
                label={machine.name}
                caption={machine.blockedReason ?? undefined}
                icon={MonitorSmartphoneIcon}
                disabled={machine.blockedReason !== null}
                onClick={() => onSelect(`terminal:${machine.id}`)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MethodTile({
  label,
  caption,
  icon: Icon,
  disabled = false,
  onClick,
}: {
  label: string
  /** Why a machine can't be used — sits under its name, greyed with it. */
  caption?: string
  icon: LucideIcon
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/40",
      )}
    >
      <Icon
        className={cn(
          "size-6 stroke-[1.5]",
          disabled ? "text-muted-foreground" : "text-foreground",
        )}
      />
      {/* Merchant-typed device names land here beside "Cash", so the label has
          to survive a long one rather than blow the tile. */}
      <span
        className={cn(
          "line-clamp-2 w-full break-words font-medium text-base",
          disabled ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {label}
      </span>
      {caption ? (
        <span className="-mt-2 text-muted-foreground text-xs leading-4">{caption}</span>
      ) : null}
    </button>
  )
}
