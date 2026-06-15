"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"

// Sentinel used as the Select item value that represents "no filter selected".
// Radix Select forbids empty-string values; we convert to/from "" on apply.
const ALL = "__all__"

export type ServiceFilters = {
  status: string
  teamMemberId: string
}

export const DEFAULT_FILTERS: ServiceFilters = {
  status: "all",
  teamMemberId: "",
}

// Converts the stored filter value (empty string = "all") to a Select value.
function toSelectValue(v: string) {
  return v === "" ? ALL : v
}

// Converts a Select value back to a stored filter value.
function fromSelectValue(v: string) {
  return v === ALL ? "" : v
}

type TeamMember = { id: string; name: string }

type FiltersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ServiceFilters
  teamMembers: TeamMember[]
  onApply: (filters: ServiceFilters) => void
}

function FilterField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  isActive,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  isActive?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger is a button; htmlFor doesn't apply */}
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <Select value={toSelectValue(value)} onValueChange={(v) => onValueChange(fromSelectValue(v))}>
        <SelectTrigger
          className={`h-11 w-full rounded-xl border bg-background text-sm ${
            isActive ? "border-primary ring-2 ring-primary/20" : "border-border"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.value === "" ? ALL : opt.value}
              value={opt.value === "" ? ALL : opt.value}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function FiltersDialog({
  open,
  onOpenChange,
  filters,
  teamMembers,
  onApply,
}: FiltersDialogProps) {
  const [local, setLocal] = useState<ServiceFilters>(filters)

  const set = (key: keyof ServiceFilters) => (value: string) =>
    setLocal((prev) => ({ ...prev, [key]: value }))

  const handleApply = () => {
    onApply(local)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLocal(filters)
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) setLocal(filters)
    onOpenChange(next)
  }

  const teamMemberOptions: { value: string; label: string }[] = [
    { value: "", label: "Any team member" },
    ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden px-6 pb-0 pt-6">
        {/* Header — DialogTitle satisfies the a11y requirement */}
        <div className="mb-5 flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-foreground">Filters</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleCancel}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close filters"
          >
            <XIcon className="size-5" />
          </Button>
        </div>

        {/* Filter fields */}
        <div className="flex max-h-[calc(100vh-220px)] flex-col gap-4 overflow-y-auto pr-0.5 pb-1">
          <FilterField
            label="Status"
            value={local.status}
            onValueChange={set("status")}
            placeholder="All statuses"
            isActive={!!local.status}
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
          />

          <FilterField
            label="Team member"
            value={local.teamMemberId}
            onValueChange={set("teamMemberId")}
            placeholder="Any team member"
            isActive={!!local.teamMemberId}
            options={teamMemberOptions}
          />
        </div>

        {/* Footer */}
        <div className="mt-1 flex items-center gap-3 py-5">
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="h-12 flex-1 text-base"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            radius="full"
            className="h-12 flex-1 text-base font-semibold"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
