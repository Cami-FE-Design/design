"use client"

// Report Filters — the shared FiltersDialogShell (also the service menu's): a
// centered dialog with a label + Select per filter and a Clear / Apply footer.
// Mock only (selections aren't wired to the rows). Advanced filters (the
// query-builder) are out of scope for v0.1.

import { SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import {
  FilterSelectField,
  FiltersDialogShell,
} from "@/components/blocks/shared/filters-dialog-shell"
import { Button } from "@/components/ui/button"
import { useLocations } from "@/lib/locations/store"
import type { FilterKey } from "@/lib/reports/types"

const FILTER_META: Record<FilterKey, { label: string; all: string; options: string[] }> = {
  // Options come from the reader's grant at render — see `FilterField`. The
  // list here was `["Pet Loft"]`, a different merchant entirely, so the one
  // filter multi-location needs offered a single wrong answer.
  location: { label: "Location", all: "All locations", options: [] },
  type: { label: "Type", all: "All types", options: ["Service", "Product"] },
  teamMember: { label: "Team member", all: "All team members", options: ["Aziz", "Sara", "Omar"] },
  channel: {
    label: "Channel",
    all: "All channels",
    options: ["Public booking", "Operator", "Walk-in"],
  },
  paymentMethod: {
    label: "Payment method",
    all: "All payment methods",
    options: ["CamiPay", "NeoPay", "Cash", "Gift card"],
  },
  category: {
    label: "Category",
    all: "All categories",
    options: ["Grooming", "Food", "Healthcare"],
  },
  status: { label: "Status", all: "All statuses", options: ["Completed", "Cancelled", "No-show"] },
  clientGender: {
    label: "Client gender",
    all: "All genders",
    options: ["Female", "Male", "Not specified"],
  },
  clientRetention: {
    label: "Client retention",
    all: "All clients",
    options: ["New", "Returning", "Walk-in"],
  },
  discountCategory: {
    label: "Discount category",
    all: "All discount categories",
    options: ["Loyalty", "Seasonal promo"],
  },
  brand: { label: "Brand", all: "All brands", options: ["Royal Canin", "Frontline"] },
  supplier: {
    label: "Supplier",
    all: "All suppliers",
    options: ["Gulf Pet Supplies", "VetCare Trading"],
  },
}

function FilterField({ filterKey }: { filterKey: FilterKey }) {
  const meta = FILTER_META[filterKey]
  // Branches are the one filter whose options are not a fixed list: they are
  // whatever this reader holds (R18). An owner sees the estate, a manager sees
  // theirs, and neither is told the other exists.
  const { granted } = useLocations()
  const options = filterKey === "location" ? granted.map((l) => l.name) : meta.options
  const [value, setValue] = useState("all")
  const all = meta.all
  return (
    <FilterSelectField
      label={meta.label}
      value={value}
      onValueChange={setValue}
      placeholder={all}
      options={[{ value: "all", label: all }, ...options.map((o) => ({ value: o, label: o }))]}
    />
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

      <FiltersDialogShell
        open={open}
        onOpenChange={setOpen}
        secondaryLabel="Clear filters"
        onSecondary={() => setOpen(false)}
        onApply={() => setOpen(false)}
      >
        {filters.map((key) => (
          <FilterField key={key} filterKey={key} />
        ))}
      </FiltersDialogShell>
    </>
  )
}
