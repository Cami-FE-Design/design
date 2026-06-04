"use client"

import { MinusIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { money, STAFF } from "./mock"
import type { CartLine } from "./types"

export type LinePatch = { priceMinor: number; qty: number; staffName?: string }

type EditLineDialogProps = {
  line: CartLine
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (uid: string, patch: LinePatch) => void
  onDelete: (uid: string) => void
}

export function EditLineDialog({
  line,
  open,
  onOpenChange,
  onApply,
  onDelete,
}: EditLineDialogProps) {
  const [price, setPrice] = useState((line.priceMinor / 100).toFixed(2))
  const [qty, setQty] = useState(line.qty)
  const [staff, setStaff] = useState(line.staffName ?? "Any")

  const priceMinor = Math.round((Number.parseFloat(price) || 0) * 100)
  const totalMinor = priceMinor * qty

  function apply() {
    onApply(line.uid, { priceMinor, qty, staffName: staff })
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
            Edit {line.name}
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price">
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-4 text-muted-foreground text-sm">
                AED
              </span>
              <Input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => setPrice((Number.parseFloat(price) || 0).toFixed(2))}
                className="pl-14"
                aria-label="Price"
              />
            </div>
          </Field>

          <Field label="Quantity">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1"
                aria-label="Quantity"
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="full"
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <MinusIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  radius="full"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </Field>
        </div>

        <Field label="Discounts">
          {/* Read-only scaffolding — discounts are applied by the backend (PRO-395). */}
          <Select disabled>
            <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12">
              <SelectValue placeholder="None selected" />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Field>

        <Field label="Team member">
          <Select value={staff} onValueChange={setStaff}>
            <SelectTrigger
              className="h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium text-sm data-[size=default]:h-12"
              aria-label="Team member"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Item total</span>
            <span className="font-semibold text-foreground text-lg tabular-nums">
              {money(totalMinor)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              radius="full"
              aria-label={`Delete ${line.name}`}
              className="text-destructive"
              onClick={() => {
                onDelete(line.uid)
                onOpenChange(false)
              }}
            >
              <Trash2Icon className="size-5" />
            </Button>
            <Button type="button" radius="full" className="px-8" onClick={apply}>
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
