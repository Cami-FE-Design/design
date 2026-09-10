"use client"

/**
 * SCR-04 · Branch switcher.
 *
 * The surface every other multi-location requirement is read through, and the
 * one the PRD notes "exists in no feature guide today". It answers one question
 * at all times: which branch am I acting on?
 *
 * Three rules it carries, none of them cosmetic:
 *
 * - R03  Scope spans one branch, a named subset, or all granted branches, and
 *        the filters and date range a user already set survive the change. The
 *        switcher never navigates and never resets a view (DW1.1).
 * - DW1.2 A single-branch business sees no switcher at all. Not disabled, not
 *        a one-item dropdown — absent. "A concept I don't need never clutters
 *        my screen." This reads the *granted* set, so a manager holding one
 *        branch of nine also gets nothing to switch.
 * - R24  No grant means no access, and never resolves to all branches. The
 *        switcher says so plainly rather than rendering an empty menu.
 *
 * It is context, not security (blueprint §03). Every request is authorized on
 * role capability and granted locations independently, so nothing here decides
 * what a query may return.
 */

import { BuildingIcon, CheckIcon, ChevronDownIcon, LockIcon } from "lucide-react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

export function LocationSwitcher({ className }: { className?: string }) {
  const { granted, isMultiLocation, hasNoAccess, setScope, scopedLocations, scopeLabel } =
    useLocations()

  // R24. An empty scope is a real state with a real consequence, so it is said
  // out loud — an operator who can see nothing should know that is why.
  if (hasNoAccess) {
    return (
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-xl bg-destructive/10 px-3 text-sm font-medium text-destructive",
          className,
        )}
      >
        <LockIcon className="size-4 shrink-0" />
        <span>No location access</span>
      </div>
    )
  }

  // DW1.2. Absent, not disabled.
  if (!isMultiLocation) return null

  const selectedIds = new Set(scopedLocations.map((l) => l.id))
  const allSelected = selectedIds.size === granted.length

  /**
   * One interaction for the whole control: toggle branches. The scope *kind*
   * falls out of what ends up selected rather than being a separate mode the
   * user has to think about — everything selected is `all`, one is `one`, and
   * anything between is a subset.
   *
   * The last selected branch cannot be unchecked. A scope of nothing is not a
   * view of nothing, it is a broken session, and R24's empty state comes from a
   * missing grant rather than from a user clearing a menu.
   */
  function toggle(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      if (next.size === 1) return
      next.delete(id)
    } else {
      next.add(id)
    }
    if (next.size === granted.length) {
      setScope({ kind: "all" })
    } else if (next.size === 1) {
      setScope({ kind: "one", locationId: [...next][0] })
    } else {
      setScope({
        kind: "subset",
        locationIds: granted.filter((l) => next.has(l.id)).map((l) => l.id),
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "h-11 min-w-0 max-w-[240px] justify-start gap-2 bg-background px-3 text-sm font-medium text-foreground hover:bg-background/90",
            className,
          )}
        >
          <BuildingIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-left">{scopeLabel}</span>
          <ChevronDownIcon className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setScope({ kind: "all" })
          }}
          className="gap-2"
        >
          <CheckIcon className={cn("size-4 shrink-0", allSelected ? "opacity-100" : "opacity-0")} />
          <span className="flex-1">All locations</span>
          <span className="text-xs text-muted-foreground">{granted.length}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Locations
        </DropdownMenuLabel>
        {granted.map((loc) => {
          const checked = selectedIds.has(loc.id)
          const isLastSelected = checked && selectedIds.size === 1
          return (
            <DropdownMenuItem
              key={loc.id}
              // Keep the menu open: building a subset takes more than one click,
              // and closing after each would make it unusable.
              onSelect={(e) => {
                e.preventDefault()
                toggle(loc.id)
              }}
              className={cn("gap-2", isLastSelected && "cursor-default")}
              aria-checked={checked}
              role="menuitemcheckbox"
            >
              <CheckIcon className={cn("size-4 shrink-0", checked ? "opacity-100" : "opacity-0")} />
              <span className="min-w-0 flex-1 truncate">{loc.name}</span>
              <LocationStatusBadge status={loc.status} />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
