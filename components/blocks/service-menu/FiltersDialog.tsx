"use client"

import { useState } from "react"
import {
  FilterSelectField,
  FiltersDialogShell,
} from "@/components/blocks/shared/filters-dialog-shell"

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

export function FiltersDialog({
  open,
  onOpenChange,
  filters,
  teamMembers,
  onApply,
}: FiltersDialogProps) {
  const [local, setLocal] = useState<ServiceFilters>(filters)

  const set = (key: keyof ServiceFilters) => (value: string) =>
    setLocal((prev) => ({ ...prev, [key]: fromSelectValue(value) }))

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

  const teamMemberOptions = [
    { value: ALL, label: "Any team member" },
    ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
  ]

  return (
    <FiltersDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      onClose={handleCancel}
      secondaryLabel="Cancel"
      onSecondary={handleCancel}
      onApply={handleApply}
    >
      <FilterSelectField
        label="Status"
        value={toSelectValue(local.status)}
        onValueChange={set("status")}
        placeholder="All statuses"
        active={!!local.status}
        options={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
      />
      <FilterSelectField
        label="Team member"
        value={toSelectValue(local.teamMemberId)}
        onValueChange={set("teamMemberId")}
        placeholder="Any team member"
        active={!!local.teamMemberId}
        options={teamMemberOptions}
      />
    </FiltersDialogShell>
  )
}
