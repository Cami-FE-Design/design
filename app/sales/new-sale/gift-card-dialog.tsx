"use client"

import { Trash2Icon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CURRENT_USER,
  GIFT_CARD_DEFAULT_EXPIRATION,
  GIFT_CARD_EXPIRATION_OPTIONS,
  money,
  TEAM_MEMBERS,
} from "./mock"
import type { GiftCardDraft } from "./types"

/** A fresh gift-card draft seeded to `valueMinor` (price tracks the value). */
export function newGiftCardDraft(valueMinor: number): GiftCardDraft {
  return {
    valueMinor,
    priceMinor: valueMinor,
    expiration: GIFT_CARD_DEFAULT_EXPIRATION,
    useCustomCode: false,
    customCode: "",
    isGift: true,
    sendEmail: true,
    staffName: CURRENT_USER,
  }
}

/** Whole-AED digits → fils. The gift-card amounts are always whole units. */
function aedToMinor(digits: string): number {
  return (Number(digits) || 0) * 100
}

/**
 * Add / Edit gift card — the centered modal shown over the checkout drawer. On
 * Apply it hands back a complete {@link GiftCardDraft}; the cart owns the line.
 */
export function GiftCardDialog({
  mode,
  initial,
  open,
  onOpenChange,
  onApply,
  onDelete,
}: {
  mode: "add" | "edit"
  initial: GiftCardDraft
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (draft: GiftCardDraft) => void
  /** Edit mode only — removes the line. */
  onDelete?: () => void
}) {
  const [value, setValue] = useState(String(initial.valueMinor / 100))
  const [price, setPrice] = useState(String(initial.priceMinor / 100))
  const [expiration, setExpiration] = useState(initial.expiration)
  const [useCustomCode, setUseCustomCode] = useState(initial.useCustomCode)
  const [customCode, setCustomCode] = useState(initial.customCode)
  const [isGift, setIsGift] = useState(initial.isGift)
  const [sendEmail, setSendEmail] = useState(initial.sendEmail)
  const [staffName, setStaffName] = useState(initial.staffName)

  const valueMinor = aedToMinor(value)
  const priceMinor = aedToMinor(price)
  const canApply = valueMinor > 0 && priceMinor > 0

  function apply() {
    if (!canApply) return
    onApply({
      valueMinor,
      priceMinor,
      expiration,
      useCustomCode,
      customCode: useCustomCode ? customCode.trim() : "",
      isGift,
      sendEmail,
      staffName,
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
            {mode === "add" ? "Add gift card" : "Edit gift card"}
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
        <DialogDescription className="sr-only">
          Set the gift card value, price and options.
        </DialogDescription>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Gift card value">
            <AedInput value={value} onChange={setValue} ariaLabel="Gift card value" />
          </Field>
          <Field label="Price">
            <AedInput value={price} onChange={setPrice} ariaLabel="Price" />
          </Field>
        </div>

        <Field label="Discounts">
          {/* Read-only scaffolding — discount rules are configured server-side. */}
          <Select disabled>
            <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12">
              <SelectValue placeholder="None available" />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Field>

        <Field label="Expiration">
          <Select value={expiration} onValueChange={setExpiration}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12"
              aria-label="Expiration"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GIFT_CARD_EXPIRATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col gap-4">
          <CheckRow
            checked={useCustomCode}
            onChange={(v) => setUseCustomCode(v === true)}
            label="Use a custom gift card code"
          />
          {useCustomCode ? (
            <div className="ml-7 flex flex-col gap-1.5">
              <span className="text-sm font-medium leading-5 text-foreground">Gift card code</span>
              <Input
                autoFocus
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Enter custom gift card code"
                aria-label="Gift card code"
              />
              <span className="text-xs leading-4 text-muted-foreground">
                For use on physical gift cards
              </span>
            </div>
          ) : null}
          <CheckRow
            checked={isGift}
            onChange={(v) => setIsGift(v === true)}
            label="This is a gift"
            hint="Gift card will not be added to the purchasing client's wallet so it can be shared"
          />
          <CheckRow
            checked={sendEmail}
            onChange={(v) => setSendEmail(v === true)}
            label="Send purchase confirmation email"
            hint="We'll send an email to the purchasing client with their gift card code and information on how to redeem it"
          />
        </div>

        <Field label="Team member">
          <Select value={staffName} onValueChange={setStaffName}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12"
              aria-label="Team member"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_MEMBERS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Item total</span>
            <span className="font-semibold text-foreground text-lg tabular-nums">
              {money(priceMinor)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && onDelete ? (
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                radius="full"
                aria-label="Delete gift card"
                className="text-destructive"
                onClick={() => {
                  onDelete()
                  onOpenChange(false)
                }}
              >
                <Trash2Icon className="size-5" />
              </Button>
            ) : null}
            <Button
              type="button"
              radius="full"
              className="px-8"
              disabled={!canApply}
              onClick={apply}
            >
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

/** Digits-only money input with a leading AED adornment (whole units). */
function AedInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (digits: string) => void
  ariaLabel: string
}) {
  return (
    <div className="relative">
      <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
        AED
      </span>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className="pl-14"
        aria-label={ariaLabel}
      />
    </div>
  )
}

/** A checkbox with a clickable label and an optional helper line beneath. */
function CheckRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (value: boolean | "indeterminate") => void
  label: string
  hint?: string
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is the Checkbox child
    <label className="flex cursor-pointer gap-3">
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
        {hint ? <span className="text-xs leading-4 text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  )
}
