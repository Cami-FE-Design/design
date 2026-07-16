"use client"

// Report Filters — follows the app's existing filter pattern (see
// components/blocks/service-menu/FiltersDialog): a centered dialog with a
// label + Select per filter and a Clear / Apply footer. Mock only (selections
// aren't wired to the rows). Advanced filters (the query-builder) are out of
// scope for v0.1.

import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterKey } from "@/lib/reports/types"

const FILTER_META: Record<FilterKey, { label: string; options: string[] }> = {
  location: { label: "Location", options: ["Pet Loft"] },
  type: { label: "Type", options: ["Service", "Product"] },
  teamMember: { label: "Team member", options: ["Aziz", "Sara", "Omar"] },
  channel: { label: "Channel", options: ["Public booking", "Operator", "Walk-in"] },
  paymentMethod: { label: "Payment method", options: ["CamiPay", "NeoPay", "Cash", "Gift card"] },
  category: { label: "Category", options: ["Grooming", "Food", "Healthcare"] },
  status: { label: "Status", options: ["Completed", "Cancelled", "No-show"] },
  clientGender: { label: "Client gender", options: ["Female", "Male", "Not specified"] },
  clientRetention: { label: "Client retention", options: ["New", "Returning", "Walk-in"] },
  discountCategory: { label: "Discount category", options: ["Loyalty", "Seasonal promo"] },
  brand: { label: "Brand", options: ["Royal Canin", "Frontline"] },
  supplier: { label: "Supplier", options: ["Gulf Pet Supplies", "VetCare Trading"] },
}

function FilterField({ filterKey }: { filterKey: FilterKey }) {
  const meta = FILTER_META[filterKey]
  const [value, setValue] = useState("all")
  return (
    <div className="flex flex-col gap-1.5">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger is a button; htmlFor doesn't apply */}
      <label className="text-sm font-semibold text-foreground">{meta.label}</label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-11 w-full rounded-xl border border-border bg-background text-sm">
          <SelectValue placeholder={`All ${meta.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{`All ${meta.label.toLowerCase()}`}</SelectItem>
          {meta.options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ReportFiltersSheet({ filters }: { filters: FilterKey[] }) {
  const [open, setOpen] = useState(false)
  if (!filters.length) return null

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        radius="full"
        aria-label="Filters"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontalIcon className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md gap-0 overflow-hidden px-6 pt-6 pb-0">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">Filters</DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close filters"
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          <div className="flex max-h-[calc(100vh-220px)] flex-col gap-4 overflow-y-auto pr-0.5 pb-1">
            {filters.map((key) => (
              <FilterField key={key} filterKey={key} />
            ))}
          </div>

          <div className="mt-1 flex items-center gap-3 py-5">
            <Button
              type="button"
              variant="outline"
              radius="full"
              className="h-12 flex-1 text-base"
              onClick={() => setOpen(false)}
            >
              Clear filters
            </Button>
            <Button
              type="button"
              radius="full"
              className="h-12 flex-1 text-base font-semibold"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
