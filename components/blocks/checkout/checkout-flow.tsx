"use client"

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TimerOffIcon,
  WalletIcon,
} from "lucide-react"
import { useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"
import {
  type CheckoutLine,
  type CheckoutSale,
  type CheckoutSavedCard,
  checkoutTotals,
  formatAedDecimal,
  TIP_AMOUNTS,
  TIP_MOST_COMMON_MINOR,
} from "./mock"

// Luma's principle: ONE flat surface. No nested cards — hairline rules and
// whitespace separate sections. The only boxed element is the card selector.

// ─── Section label (bold, with optional accent action on the right) ───────────

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  )
}

function AccentLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-cami-violet-11 hover:underline"
    >
      {children}
    </button>
  )
}

// ─── Business row (compact: square thumb + name + when) ───────────────────────

function BusinessRow({ business, whenLabel }: { business: PublicBusiness; whenLabel?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        size="lg"
        shape="square"
        fallback="initials"
        name={business.businessName}
        src={business.logoUrl}
        hashSeed={business.slug}
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-base font-semibold text-foreground">
          {business.displayName}
        </span>
        {whenLabel ? <span className="text-sm text-muted-foreground">{whenLabel}</span> : null}
      </div>
    </div>
  )
}

// ─── Items + flat money ledger ────────────────────────────────────────────────

function LineRow({ line, hasPets }: { line: CheckoutLine; hasPets: boolean }) {
  const meta = [line.staff, line.qty > 1 ? `×${line.qty}` : null].filter(Boolean).join(" · ")
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">
          {line.qty > 1 ? <span className="text-muted-foreground">{line.qty}× </span> : null}
          {line.name}
          {hasPets && line.petName ? (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-cami-violet-3 px-2 py-0.5 align-middle text-xs font-medium text-cami-violet-11">
              {line.petName}
            </span>
          ) : null}
        </span>
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
        {formatAedDecimal(line.priceMinor * line.qty)}
      </span>
    </div>
  )
}

function LedgerRow({
  label,
  value,
  muted,
}: {
  label: React.ReactNode
  value: React.ReactNode
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className={cn(muted ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      <span className={cn("tabular-nums", muted ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  )
}

function ItemsSection({ sale }: { sale: CheckoutSale }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Your bill</SectionLabel>
      <div className="flex flex-col divide-y divide-border/50">
        {sale.lines.map((line) => (
          <LineRow key={line.id} line={line} hasPets={sale.hasPets} />
        ))}
      </div>
    </section>
  )
}

// Flat money ledger — sits AFTER the tip picker so the hero total already
// reflects the chosen tip. No card; a hairline rule separates it from the tip.
function LedgerSection({
  sale,
  tipMinor,
  membershipDiscount,
  membershipJoined,
  onToggleMembership,
}: {
  sale: CheckoutSale
  tipMinor: number
  membershipDiscount: number
  membershipJoined: boolean
  onToggleMembership: () => void
}) {
  const { subtotalMinor, taxMinor, totalMinor } = checkoutTotals(sale.lines)
  const payable = totalMinor - membershipDiscount + tipMinor - (sale.paidMinor ?? 0)

  return (
    <section className="flex flex-col border-t border-border/60 pt-3">
      <LedgerRow label="Subtotal" value={formatAedDecimal(subtotalMinor)} muted />
      <LedgerRow label="VAT (5%)" value={formatAedDecimal(taxMinor)} muted />
      {membershipDiscount > 0 ? (
        <LedgerRow
          label={`${sale.membership?.name} discount`}
          value={`- ${formatAedDecimal(membershipDiscount)}`}
          muted
        />
      ) : null}
      {tipMinor > 0 ? <LedgerRow label="Tip" value={formatAedDecimal(tipMinor)} muted /> : null}

      {/* coupon/membership as an inline accent link, Luma "Add a coupon" pattern */}
      {sale.membership ? (
        <div className="py-1">
          <AccentLink onClick={onToggleMembership}>
            {membershipJoined
              ? `${sale.membership.name} applied · remove`
              : `Join ${sale.membership.name} and save ${formatAedDecimal(sale.membership.saveMinor)}`}
          </AccentLink>
        </div>
      ) : null}

      {/* hero total */}
      <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border/60 pt-3">
        <span className="text-base font-medium text-foreground">
          {sale.paidMinor ? "Left to pay" : "Total"}
        </span>
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {formatAedDecimal(payable)}
        </span>
      </div>
    </section>
  )
}

// ─── Tip (compact preset row, no card) ────────────────────────────────────────

function TipSection({
  tipMinor,
  onSelect,
}: {
  tipMinor: number
  onSelect: (minor: number) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel
        action={
          tipMinor > 0 ? (
            <span className="text-sm font-medium text-foreground">
              Tip <span className="tabular-nums">{formatAedDecimal(tipMinor)}</span>
            </span>
          ) : null
        }
      >
        Say thanks to the team
      </SectionLabel>
      <div className="grid grid-cols-4 gap-2">
        {TIP_AMOUNTS.map((minor) => {
          const active = minor === tipMinor
          const mostCommon = minor === TIP_MOST_COMMON_MINOR
          return (
            <button
              key={minor}
              type="button"
              onClick={() => onSelect(minor)}
              aria-pressed={active}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-colors",
                active
                  ? "border-cami-violet-8 bg-cami-violet-3"
                  : "border-border/60 hover:bg-muted/40",
              )}
            >
              {mostCommon ? (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium leading-none text-background">
                  Most common
                </span>
              ) : null}
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  active ? "text-cami-violet-12" : "text-foreground",
                )}
              >
                {minor === 0 ? "No tip" : formatAedDecimal(minor).replace("AED ", "")}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ─── Payment (qlub-style method radio list + single contextual CTA) ───────────

const CARD_BRAND_LABEL: Record<CheckoutSavedCard["brand"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
}

type PayMethod = "wallet" | "card"

function MethodRow({
  active,
  onSelect,
  icon: Icon,
  label,
  sublabel,
  trailing,
}: {
  active: boolean
  onSelect: () => void
  icon: typeof WalletIcon
  label: string
  sublabel?: string
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        active ? "border-cami-violet-8 bg-cami-violet-3" : "border-border/60 hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          active ? "border-cami-violet-9 bg-cami-violet-9 text-white" : "border-border bg-card",
        )}
      >
        {active ? <CheckCircle2Icon className="size-4" /> : null}
      </span>
      <Icon className="size-5 shrink-0 text-foreground" />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {sublabel ? <span className="text-xs text-muted-foreground">{sublabel}</span> : null}
      </span>
      {trailing}
    </button>
  )
}

function PaymentSection({
  sale,
  payableMinor,
  onPay,
}: {
  sale: CheckoutSale
  payableMinor: number
  onPay: () => void
}) {
  const [method, setMethod] = useState<PayMethod>("wallet")
  const card = sale.savedCard
  const cardLabel = card ? `${CARD_BRAND_LABEL[card.brand]} •••• ${card.last4}` : "Card"

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Payment method</SectionLabel>

      <div className="flex flex-col gap-2">
        <MethodRow
          active={method === "wallet"}
          onSelect={() => setMethod("wallet")}
          icon={WalletIcon}
          label="Apple Pay · Google Pay"
        />
        <MethodRow
          active={method === "card"}
          onSelect={() => setMethod("card")}
          icon={CreditCardIcon}
          label={cardLabel}
          sublabel={card ? "Saved card" : undefined}
          trailing={<ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />}
        />
      </div>

      {/* card fields expand only when card is chosen and none is saved */}
      {method === "card" && !card ? (
        <div className="flex flex-col gap-2.5 pt-1">
          <Input inputMode="numeric" placeholder="Card number" aria-label="Card number" />
          <div className="grid grid-cols-2 gap-2.5">
            <Input inputMode="numeric" placeholder="MM / YY" aria-label="Expiry" />
            <Input inputMode="numeric" placeholder="CVC" aria-label="Security code" />
          </div>
        </div>
      ) : null}

      <p className="pt-1 text-center text-xs text-muted-foreground">
        By paying you agree to Cami&apos;s{" "}
        <span className="font-medium text-cami-violet-11">terms of use</span>.
      </p>

      {/* one contextual CTA, driven by the selected method */}
      <Button
        type="button"
        onClick={onPay}
        radius="full"
        size="lg"
        className={cn(
          "w-full gap-2",
          method === "wallet"
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "bg-cami-violet-9 text-white hover:bg-cami-violet-10",
        )}
      >
        {method === "wallet" ? (
          <>
            <WalletIcon className="size-4" />
            Pay with Apple Pay
          </>
        ) : (
          `Pay ${formatAedDecimal(payableMinor)}`
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheckIcon className="size-3.5" />
        Secure payments powered by CamiPay
      </p>
    </section>
  )
}

// ─── Terminal states ──────────────────────────────────────────────────────────

function TerminalState({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "success" | "neutral"
  icon: typeof CheckCircle2Icon
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          tone === "success"
            ? "bg-cami-green-3 text-cami-green-11"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

export function CheckoutFlow({ business, sale }: { business: PublicBusiness; sale: CheckoutSale }) {
  const [tipMinor, setTipMinor] = useState(0)
  const [joined, setJoined] = useState(false)
  const [paid, setPaid] = useState(false)

  const { totalMinor } = checkoutTotals(sale.lines)
  const membershipDiscount = joined && sale.membership ? sale.membership.saveMinor : 0
  const discountedTotal = totalMinor - membershipDiscount
  const payableMinor = discountedTotal + tipMinor - (sale.paidMinor ?? 0)

  const isPaid = paid || sale.status === "paid"
  const isExpired = sale.status === "expired"

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-6 px-5 py-8">
        <BusinessRow business={business} whenLabel={sale.whenLabel} />

        {isExpired ? (
          <TerminalState
            tone="neutral"
            icon={TimerOffIcon}
            title="This link has expired"
            body="This payment link is no longer active. Ask the business to send a new one."
          />
        ) : isPaid ? (
          <TerminalState
            tone="success"
            icon={CheckCircle2Icon}
            title="Paid"
            body="Thanks! Your payment went through. A receipt is on its way to you."
          />
        ) : (
          <>
            <ItemsSection sale={sale} />
            <TipSection tipMinor={tipMinor} onSelect={setTipMinor} />
            <LedgerSection
              sale={sale}
              tipMinor={tipMinor}
              membershipDiscount={membershipDiscount}
              membershipJoined={joined}
              onToggleMembership={() => setJoined((v) => !v)}
            />
            <PaymentSection sale={sale} payableMinor={payableMinor} onPay={() => setPaid(true)} />
          </>
        )}

        <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">Powered by Cami</p>
      </div>
    </main>
  )
}
