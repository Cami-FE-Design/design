"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SELECT_TRIGGER =
  "data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"

export type PackageFilters = {
  sessions: string
  payment: string
  validFor: string
  coversAll: boolean
}

export const DEFAULT_PACKAGE_FILTERS: PackageFilters = {
  sessions: "any",
  payment: "all",
  validFor: "any",
  coversAll: false,
}

type PackageFiltersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: PackageFilters
  onApply: (filters: PackageFilters) => void
}

export function PackageFiltersDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: PackageFiltersDialogProps) {
  const [draft, setDraft] = useState<PackageFilters>(value)

  // Re-seed draft on open so an un-applied edit doesn't persist across opens.
  const [seenOpen, setSeenOpen] = useState(false)
  if (open && !seenOpen) {
    setSeenOpen(true)
    setDraft(value)
  }
  if (!open && seenOpen) setSeenOpen(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription className="sr-only">Filter the package list.</DialogDescription>
          <Button
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
          </Button>
        </div>

        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="filter-sessions">Sessions</Label>
            <Select
              value={draft.sessions}
              onValueChange={(v) => setDraft((d) => ({ ...d, sessions: v }))}
            >
              <SelectTrigger id="filter-sessions" className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any number of sessions</SelectItem>
                <SelectItem value="1-5">1–5 sessions</SelectItem>
                <SelectItem value="6-10">6–10 sessions</SelectItem>
                <SelectItem value="11+">11+ sessions</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filter-payment">Payment</Label>
            <Select
              value={draft.payment}
              onValueChange={(v) => setDraft((d) => ({ ...d, payment: v }))}
            >
              <SelectTrigger id="filter-payment" className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="one-time">One-time payment</SelectItem>
                <SelectItem value="recurring">Recurring payments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filter-valid">Valid for</Label>
            <Select
              value={draft.validFor}
              onValueChange={(v) => setDraft((d) => ({ ...d, validFor: v }))}
            >
              <SelectTrigger id="filter-valid" className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any period</SelectItem>
                <SelectItem value="1m">1 month</SelectItem>
                <SelectItem value="3m">3 months</SelectItem>
                <SelectItem value="6m">6 months</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
                <SelectItem value="until-canceled">Until canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={draft.coversAll}
              onCheckedChange={(c) => setDraft((d) => ({ ...d, coversAll: c === true }))}
            />
            <span className="text-sm text-foreground">
              Display only packages which cover all services
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button variant="outline" radius="full" onClick={() => setDraft(DEFAULT_PACKAGE_FILTERS)}>
            Clear filters
          </Button>
          <Button
            radius="full"
            onClick={() => {
              onApply(draft)
              onOpenChange(false)
            }}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
