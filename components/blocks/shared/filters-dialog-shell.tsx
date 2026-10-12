"use client"

import { XIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// The filters dialog of a listing: a "Filters" title, a column of label +
// Select fields that scrolls on its own, and two wide buttons. Used by the
// service menu and the reports; the left button is Cancel or Clear filters,
// whichever the screen means.

export function FiltersDialogShell({
  open,
  onOpenChange,
  onClose,
  secondaryLabel,
  onSecondary,
  onApply,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The X. Defaults to closing. */
  onClose?: () => void
  /** "Cancel" or "Clear filters". */
  secondaryLabel: string
  onSecondary: () => void
  onApply: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden px-6 pt-6 pb-0">
        <div className="mb-5 flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-foreground">Filters</DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={onClose ?? (() => onOpenChange(false))}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Close filters"
          >
            <XIcon className="size-5" />
          </Button>
        </div>

        <div className="flex max-h-[calc(100vh-220px)] flex-col gap-4 overflow-y-auto pr-0.5 pb-1">
          {children}
        </div>

        <div className="mt-1 flex items-center gap-3 py-5">
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="h-12 flex-1 text-base"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
          <Button
            type="button"
            radius="full"
            className="h-12 flex-1 text-base font-semibold"
            onClick={onApply}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** One filter: a label over a Select. `active` rings it when it narrows the list. */
export function FilterSelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  active,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  active?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger is a button; htmlFor doesn't apply */}
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "h-11 w-full rounded-xl border bg-background text-sm",
            active ? "border-primary ring-2 ring-primary/20" : "border-border",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
