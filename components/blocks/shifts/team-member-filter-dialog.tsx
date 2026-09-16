"use client"

/**
 * Which of a branch's team the grid shows (SCR-10, R05, DW2.3).
 *
 * The built dialog is headed "Team members at {locationName}" and describes
 * itself as assigning who can be booked there — which is the multi-location
 * concept already named in shipped copy, before anyone started the work. It is
 * kept here as a filter rather than an assignment, because assigning somebody
 * to a branch is a team-member decision (SCR-03's grants) and doing it from two
 * places is how the two disagree.
 *
 * The heading still names the branch. A list of people with no place attached
 * is the partial truth a per-branch grid exists to avoid.
 */

import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchInput } from "@/components/ui/search-input"

export function TeamMemberFilterDialog({
  open,
  onOpenChange,
  members,
  visibleIds,
  locationName,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: ReadonlyArray<{ id: string; name: string; role: string }>
  visibleIds: ReadonlySet<string>
  locationName: string
  onApply: (ids: Set<string>) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(visibleIds))
  const [search, setSearch] = useState("")

  // Reopening starts from what is showing now, not from an abandoned edit.
  const [openedWith, setOpenedWith] = useState(visibleIds)
  if (open && openedWith !== visibleIds) {
    setOpenedWith(visibleIds)
    setSelected(new Set(visibleIds))
  }

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
  const allChecked = members.length > 0 && members.every((m) => selected.has(m.id))
  const someChecked = !allChecked && members.some((m) => selected.has(m.id))

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Team members at {locationName}</DialogTitle>
          <DialogDescription>
            Choose who appears on this location&apos;s week. Everybody assigned here stays bookable
            — this is what the grid shows, not who works where.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <SearchInput
            onValueChange={setSearch}
            placeholder="Search team members"
            aria-label="Search team members"
            className="w-full"
          />
        </div>

        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto px-6 pb-2">
          <button
            type="button"
            onClick={() => setSelected(allChecked ? new Set() : new Set(members.map((m) => m.id)))}
            className="flex items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={allChecked ? true : someChecked ? "indeterminate" : false}
              className="pointer-events-none size-5 rounded-md"
            />
            <span className="font-semibold text-foreground text-base">All team members</span>
            <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-border px-1.5 font-medium text-foreground text-xs">
              {members.length}
            </span>
          </button>

          {filtered.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => toggle(member.id)}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={selected.has(member.id)}
                className="pointer-events-none size-5 rounded-md"
              />
              <Avatar name={member.name} size="md" className="shrink-0" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground text-sm">{member.name}</span>
                <span className="truncate text-muted-foreground text-xs">{member.role}</span>
              </span>
            </button>
          ))}

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              No team members match your search.
            </p>
          ) : null}
        </div>

        <DialogFooter className="items-center justify-between border-border border-t px-6 py-4 sm:justify-between">
          <span className="text-muted-foreground text-sm">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              radius="full"
              onClick={() => {
                onApply(selected)
                onOpenChange(false)
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
