"use client"

/**
 * Choosing the services / products / packages a deal comes off (DW3.4).
 *
 * `DealScopePickerDialog` on the dev repo's `promotion-discount-ui`, same
 * three-level shape: a Select-all row, a per-category row with an
 * indeterminate state, and the items under it.
 *
 * ## The one thing this picker has to get right
 *
 * Ticking every box and choosing "all" are different answers, and the
 * difference is a service added next month. `onApply` returns **null** when
 * everything is ticked, which the caller stores as `mode: "all"` — so the offer
 * keeps covering the catalogue as it grows. An explicit set of ids is a set of
 * ids forever. It is R24's distinction, one axis over from locations, and the
 * built product draws it the same way.
 */

import { SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ScopePickerGroup } from "@/lib/deals/catalogue"

export function DealScopePickerDialog({
  open,
  onOpenChange,
  title,
  searchPlaceholder,
  allLabel,
  itemNounSingular,
  itemNounPlural,
  groups,
  value,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  searchPlaceholder: string
  allLabel: string
  itemNounSingular: string
  itemNounPlural: string
  groups: ScopePickerGroup[]
  /** `null` means "all" — every current item and every future one. */
  value: Set<string> | null
  onApply: (value: Set<string> | null) => void
}) {
  const allIds = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups])
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState<Set<string>>(value ?? new Set(allIds))
  // Re-seed on each open rather than in an effect: an effect would run after
  // the first paint and the reader would see last time's ticks flick over.
  const [seenOpen, setSeenOpen] = useState(false)
  if (open && !seenOpen) {
    setSeenOpen(true)
    setDraft(value ?? new Set(allIds))
    setQuery("")
  }
  if (!open && seenOpen) setSeenOpen(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0)
  }, [groups, query])

  const allSelected = allIds.length > 0 && allIds.every((id) => draft.has(id))

  function toggleItem(id: string) {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(group: ScopePickerGroup) {
    const ids = group.items.map((i) => i.id)
    const groupAllOn = ids.every((id) => draft.has(id))
    setDraft((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (groupAllOn) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  function groupState(group: ScopePickerGroup): boolean | "indeterminate" {
    const ids = group.items.map((i) => i.id)
    const on = ids.filter((id) => draft.has(id)).length
    if (on === 0) return false
    if (on === ids.length) return true
    return "indeterminate"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{searchPlaceholder}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-11"
            />
          </div>
        </div>

        {/* One scroll region. The dialog itself does not scroll — two nested
            bars is a defect this repo has shipped four separate times. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6">
          {allIds.length === 0 ? (
            <EmptyState icon={SearchIcon} title={`No ${itemNounPlural} yet`} className="py-12" />
          ) : (
            <>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
              <label className="flex cursor-pointer items-center gap-3 border-border/60 border-b py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => setDraft(allSelected ? new Set() : new Set(allIds))}
                />
                <span className="font-semibold text-foreground text-sm">{allLabel}</span>
                <span className="text-muted-foreground text-sm">{allIds.length}</span>
              </label>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={SearchIcon}
                  title="No matches"
                  description="Try a different search."
                  className="py-12"
                />
              ) : (
                filtered.map((group) => (
                  <div key={group.id} className="flex flex-col">
                    {group.name !== "" ? (
                      // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                      <label className="flex cursor-pointer items-center gap-3 border-border/60 border-b py-3">
                        <Checkbox
                          checked={groupState(group)}
                          onCheckedChange={() => toggleGroup(group)}
                        />
                        <span className="font-semibold text-foreground text-sm">{group.name}</span>
                        <span className="text-muted-foreground text-sm">{group.items.length}</span>
                      </label>
                    ) : null}

                    {group.items.map((item) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center justify-between gap-3 border-border/40 border-b py-3 pl-7 last:border-b-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Checkbox
                            checked={draft.has(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-foreground text-sm">{item.name}</p>
                            {item.subtitle ? (
                              <p className="text-muted-foreground text-xs">{item.subtitle}</p>
                            ) : null}
                          </div>
                        </div>
                        {item.priceLabel ? (
                          <span className="shrink-0 font-medium text-foreground text-sm tabular-nums">
                            {item.priceLabel}
                          </span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-border/40 border-t px-6 py-4">
          <span className="text-muted-foreground text-sm">
            {/* Said out loud, because "all" and "every box ticked" look
                identical here and store differently. */}
            {allSelected
              ? `All ${itemNounPlural}, including any added later`
              : `${draft.size} ${draft.size === 1 ? itemNounSingular : itemNounPlural} selected`}
          </span>
          <Button
            radius="full"
            onClick={() => {
              onApply(allSelected ? null : new Set(draft))
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
