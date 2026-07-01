"use client"

import { ChevronLeftIcon, InfoIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { GiftCardVisual } from "@/components/blocks/gift-card-visual"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { findRedeemableGiftCard, money, type RedeemableGiftCard } from "./mock"

// Business name shown on the gift card visual (venue config in production).
const BUSINESS_NAME = "Cami"

type RedeemGiftCardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Amount still owed on the sale, in fils — caps how much the card redeems. */
  leftToPayMinor: number
  /** Apply the redeemed amount as a Gift card payment line. */
  onApply: (amountMinor: number) => void
}

type FindError = "not-found" | "inactive"

const ERROR_COPY: Record<FindError, string> = {
  "not-found": "Please check your gift card code for possible typos and enter it again.",
  inactive: "This gift card is not active.",
}

/**
 * Redeem an existing gift card to pay (PRO-743). Two phases: find a card by
 * code (with not-found / not-active errors), then — on the card visual — choose
 * how much of its balance to apply. The redeem amount defaults to (and is capped
 * at) the smaller of the card balance and the amount still owed; any surplus
 * stays on the card.
 */
export function RedeemGiftCardDialog({
  open,
  onOpenChange,
  leftToPayMinor,
  onApply,
}: RedeemGiftCardDialogProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<FindError | null>(null)
  const [card, setCard] = useState<RedeemableGiftCard | null>(null)
  // Redeem amount in whole AED (gift cards carry whole-unit balances).
  const [redeemAed, setRedeemAed] = useState("")

  // Can never redeem more than the card holds or more than is still owed.
  const maxRedeemMinor = card ? Math.min(card.balanceMinor, leftToPayMinor) : 0
  const redeemMinor = Math.min((Number(redeemAed) || 0) * 100, maxRedeemMinor)
  const leftAfterMinor = Math.max(0, leftToPayMinor - redeemMinor)

  function reset() {
    setCode("")
    setError(null)
    setCard(null)
    setRedeemAed("")
  }

  function close() {
    onOpenChange(false)
    // Defer the reset so the dialog doesn't flash its empty state while closing.
    setTimeout(reset, 150)
  }

  function find() {
    const match = findRedeemableGiftCard(code)
    if (!match) {
      setError("not-found")
      return
    }
    if (!match.active || match.balanceMinor <= 0) {
      setError("inactive")
      return
    }
    setError(null)
    setCard(match)
    setRedeemAed(String(Math.round(Math.min(match.balanceMinor, leftToPayMinor) / 100)))
  }

  function apply() {
    if (!card || redeemMinor <= 0) return
    onApply(redeemMinor)
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent
        className="flex flex-col gap-6 sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2">
          {card ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Back"
              className="-ml-1 text-muted-foreground"
              onClick={reset}
            >
              <ChevronLeftIcon className="size-5" />
            </Button>
          ) : null}
          <DialogTitle className="font-heading font-semibold text-xl">Redeem gift card</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="ml-auto text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">
          Enter a gift card code to redeem its balance toward this sale.
        </DialogDescription>

        {card ? (
          // ─── Found: card visual + redeem amount ──────────────────────────────
          <>
            <GiftCardVisual
              className="mx-auto"
              amount={money(card.balanceMinor)}
              subtitle={BUSINESS_NAME}
              code={card.code}
              expires={card.expires}
            />

            {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Input child */}
            <label className="flex flex-col gap-1.5">
              <span className="font-medium text-foreground text-sm leading-5">Redeem amount</span>
              <div className="relative">
                <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
                  AED
                </span>
                <Input
                  inputMode="numeric"
                  value={redeemAed}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, "")
                    const capped = Math.min(Number(digits) || 0, Math.round(maxRedeemMinor / 100))
                    setRedeemAed(digits === "" ? "" : String(capped))
                  }}
                  className="pl-14"
                  aria-label="Redeem amount"
                />
              </div>
              <span className="text-muted-foreground text-sm leading-5">
                {money(leftAfterMinor)} left to be paid
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="outline" size="lg" radius="full" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                radius="full"
                className="px-8"
                disabled={redeemMinor <= 0}
                onClick={apply}
              >
                Redeem
              </Button>
            </div>
          </>
        ) : (
          // ─── Find a card by code ─────────────────────────────────────────────
          <>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Input child */}
            <label className="flex flex-col gap-1.5">
              <span className="font-medium text-foreground text-sm leading-5">Find gift card</span>
              <Input
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  if (error) setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") find()
                }}
                placeholder="Enter gift card code"
                aria-label="Gift card code"
                aria-invalid={error !== null}
              />
            </label>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-destructive">
                <InfoIcon className="mt-0.5 size-5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm leading-5">Code invalid</span>
                  <span className="text-sm leading-5">{ERROR_COPY[error]}</span>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="outline" size="lg" radius="full" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                radius="full"
                className="px-8"
                disabled={code.trim().length === 0}
                onClick={find}
              >
                Find
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
