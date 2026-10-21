"use client"

// The calendar's team picker. Rebuilt from the built one (search, All team,
// All team members, one checkbox per person, Done) with one addition for
// BUG-21: Scheduled team, which shows whoever the rota has working at this
// branch on the day in view, and follows the day as it changes.

import { CalendarClockIcon, ChevronDownIcon, UsersIcon } from "lucide-react"
import { useId, useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import { Separator } from "@/components/ui/separator"
import {
  resolveTeamSelection,
  type TeamSelection,
  teamSelectionLabel,
  visibleMemberIds,
} from "@/lib/team/calendar-team"
import type { RosterMember } from "@/lib/team/shifts"
import { cn } from "@/lib/utils"

export function TeamDropdown({
  members,
  scheduledIds,
  selection,
  onSelectionChange,
  defaultOpen = false,
}: {
  /** This branch's team, in column order. */
  members: ReadonlyArray<RosterMember>
  /** Who the rota has working here on the day in view. */
  scheduledIds: ReadonlySet<string>
  selection: TeamSelection
  onSelectionChange: (next: TeamSelection) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [search, setSearch] = useState("")
  const idPrefix = useId()
  // What is actually applied today: Scheduled team on a closed day is All team.
  const applied = resolveTeamSelection(selection, scheduledIds)
  const visible = visibleMemberIds(selection, members, scheduledIds)
  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
  const allSelected = members.every((m) => visible.has(m.id))

  /** Ticking one person turns whatever was showing into a hand-picked set. */
  function toggle(id: string) {
    const ids = new Set(visible)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    onSelectionChange({ mode: "custom", ids })
  }

  function choose(next: TeamSelection) {
    onSelectionChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" radius="full" className="gap-2 pr-2.5">
          {teamSelectionLabel(selection, members, scheduledIds)}
          <ChevronDownIcon
            className={cn("size-4 text-foreground transition-transform", open && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 overflow-hidden rounded-2xl p-1.5">
        <div className="p-1.5">
          <SearchInput
            autoFocus
            placeholder="Search"
            aria-label="Search team members"
            onValueChange={setSearch}
          />
        </div>

        {/* First, since it is what the calendar opens on. Off with nobody in:
            picking it would draw an empty day, which reads as the calendar
            failing to load. */}
        <QuickRow
          icon={CalendarClockIcon}
          label="Scheduled team"
          active={applied.mode === "scheduled"}
          disabled={scheduledIds.size === 0}
          onClick={() => choose({ mode: "scheduled" })}
        />
        <QuickRow
          icon={UsersIcon}
          label="All team"
          active={applied.mode === "all"}
          onClick={() => choose({ mode: "all" })}
        />

        <Separator className="-mx-1.5 my-1.5 w-auto bg-border/50" />

        <div className="max-h-52 overflow-y-auto">
          {search ? null : (
            <label
              htmlFor={`${idPrefix}-all`}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-accent"
            >
              <Checkbox
                id={`${idPrefix}-all`}
                checked={allSelected}
                onCheckedChange={(v) =>
                  onSelectionChange(v ? { mode: "all" } : { mode: "custom", ids: new Set() })
                }
                aria-label="Select all team members"
              />
              <span className="font-semibold text-sm">All team members</span>
            </label>
          )}

          {filtered.map((member) => (
            <label
              key={member.id}
              htmlFor={`${idPrefix}-${member.id}`}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-accent"
            >
              <Checkbox
                id={`${idPrefix}-${member.id}`}
                checked={visible.has(member.id)}
                onCheckedChange={() => toggle(member.id)}
                aria-label={member.name}
              />
              <Avatar name={member.name} size="sm" className="shrink-0" />
              <span className="min-w-0 flex-1 truncate font-medium text-sm">{member.name}</span>
              {/* Says why Scheduled team leaves somebody out. */}
              {scheduledIds.has(member.id) ? null : (
                <span className="shrink-0 text-muted-foreground text-xs">Not working</span>
              )}
            </label>
          ))}
        </div>

        <Separator className="-mx-1.5 my-1.5 w-auto bg-border/50" />

        <div className="px-1.5 pt-0.5">
          <Button className="w-full" radius="full" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function QuickRow({
  icon: Icon,
  label,
  active,
  disabled = false,
  onClick,
}: {
  icon: typeof UsersIcon
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-2.5 rounded-xl px-3 py-2 font-medium text-sm",
        active && "bg-accent",
      )}
    >
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </Button>
  )
}
