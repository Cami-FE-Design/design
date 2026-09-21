"use client"

/**
 * Which branches somebody works at, as a control that survives an estate (R04,
 * R05).
 *
 * ## Not a popover
 *
 * This lives inside a dialog, and a menu opened from inside one lands on top of
 * the field that opened it, closes on the wrong click, and has to be reopened
 * for every branch you tick. The first version did all three.
 *
 * So it is a list in the form, in a box of its own with a fixed height. The
 * page below stays where it is however long the estate gets, which is the whole
 * problem a stack of nine full-width cards had.
 *
 * ## Checkboxes, because it is a choice of many
 *
 * A tick in a menu reads as "this is the one". A checkbox reads as "these are
 * the ones", which is what a branch grant is.
 *
 * ## Grouped by city
 *
 * Six of nine seeded branches are in Dubai. Printing the city on every row is a
 * column of one word; printing it only on the exceptions leaves some rows with
 * a second element and some without, which reads as broken rather than as a
 * decision. A heading per city says it once, keeps every row identical, and
 * matches how an estate is actually scanned — an owner hunting for a branch
 * knows the emirate before the name.
 *
 * ## "All" is not the same as ticking everything
 *
 * Ticking every branch is a named set that happens to be complete today and
 * will not include the twenty-first. That difference is R04's: the one role
 * that genuinely holds the estate is the owner, and that is a role, not a
 * shortcut here.
 */

import { useState } from "react"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchInput } from "@/components/ui/search-input"
import type { Location } from "@/lib/locations/types"
import { cn } from "@/lib/utils"

/** Past this, finding a branch by eye costs more than typing its name. */
const SEARCH_FROM = 8

export function LocationMultiSelect({
  locations,
  selectedIds,
  onChange,
  disabled,
}: {
  locations: ReadonlyArray<Location>
  selectedIds: ReadonlyArray<string>
  onChange: (ids: string[]) => void
  /** An owner's set is the estate and is not edited here. */
  disabled?: boolean
}) {
  const [query, setQuery] = useState("")
  const selected = new Set(selectedIds)

  const q = query.trim().toLowerCase()
  const shown = q
    ? locations.filter((l) =>
        `${l.name} ${l.location.district} ${l.location.city}`.toLowerCase().includes(q),
      )
    : locations

  const allSelected = locations.length > 0 && locations.every((l) => selected.has(l.id))
  const someSelected = selected.size > 0 && !allSelected
  // Grouped by city, not annotated per row.
  //
  // The first attempt printed the city only where it differed from the
  // commonest one, so six rows had nothing and three had a suffix — a list
  // where some rows carry a second element and others do not reads as broken
  // rather than as considered. Printing it on all nine is a column of the word
  // "Dubai".
  //
  // A heading per city says it once, keeps the rows identical to each other,
  // and is the thing an estate is actually scanned by: an owner looking for a
  // branch knows the emirate before the name.
  const groups: Array<{ city: string; items: Location[] }> = []
  for (const loc of shown) {
    const city = loc.location.city || "Other"
    const group = groups.find((g) => g.city === city)
    if (group) group.items.push(loc)
    else groups.push({ city, items: [loc] })
  }

  function toggle(id: string) {
    if (disabled) return
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  return (
    <div className={cn("flex flex-col", disabled && "pointer-events-none opacity-60")}>
      <div className="overflow-hidden rounded-2xl border border-border">
        {/* Search inside the box, as its first row. Outside it, the field and
            the list were two rectangles of different widths pretending to be
            one control — and making them agree by hand is a width you have to
            keep agreeing forever. */}
        {locations.length >= SEARCH_FROM ? (
          // The rule belongs to the row, not to the input. On the input it
          // stopped wherever the field stopped and left a gap at the edge of
          // the box — a line that nearly reaches is worse than no line.
          <div className="border-border border-b px-2 py-2">
            <SearchInput
              containerClassName="w-full"
              className="h-9! border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search locations"
              aria-label="Search locations"
              onValueChange={setQuery}
            />
          </div>
        ) : null}
        {/* Stays put while the list scrolls. At nine branches it is the row
            most used and the one a scrolling list hides first. */}
        <label
          htmlFor="loc-multi-all"
          className="flex cursor-pointer items-center gap-2.5 border-border border-b bg-muted/40 px-3 py-2.5"
        >
          <Checkbox
            id="loc-multi-all"
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            disabled={disabled}
            onCheckedChange={(v) => onChange(v === true ? locations.map((l) => l.id) : [])}
          />
          <span className="flex-1 font-medium text-foreground text-sm">All locations</span>
          <span className="text-muted-foreground text-sm tabular-nums">
            {selected.size} of {locations.length}
          </span>
        </label>

        {/* `overscroll-contain` keeps the wheel on this list instead of chaining
            it into whatever is behind — inside a dialog that is a page which
            does not scroll, so the list read as frozen. */}
        <div className="max-h-[13.5rem] overflow-y-auto overscroll-contain py-1">
          {groups.map((group) => (
            <div key={group.city}>
              {/* Only when there is more than one city to tell apart. A single
                  heading over every branch is a label for nothing. */}
              {/* Opaque and ruled. It painted its own background colour as a 1px
                  shadow to mask the row sliding under it, which left a seam: at
                  some scroll positions a checkbox showed through the gap between
                  the two. A real background and a real border have nothing to
                  slip between. */}
              {groups.length > 1 ? (
                <p className="sticky top-0 z-10 border-border/60 border-b bg-card px-3 py-1.5 font-medium text-muted-foreground text-xs">
                  {group.city}
                </p>
              ) : null}
              {group.items.map((loc) => {
                const checked = selected.has(loc.id)
                return (
                  <label
                    key={loc.id}
                    htmlFor={`loc-multi-${loc.id}`}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors",
                      checked ? "bg-cami-violet-2" : "hover:bg-muted/50",
                    )}
                  >
                    {/* Named explicitly. The row's text sits in a sibling span
                        and the control is a Radix button, so the wrapping label
                        gave it no accessible name — every branch read as an
                        unlabelled checkbox, which is the one thing a picker of
                        nine cannot afford. */}
                    <Checkbox
                      id={`loc-multi-${loc.id}`}
                      aria-label={loc.location.district || loc.name}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggle(loc.id)}
                    />
                    {/* The branch's own label. Every name in a chain starts
                        with the business, so a column of "Shampooch …" spends
                        its width on the one word that cannot tell them apart. */}
                    <span className="min-w-0 flex-1 truncate text-foreground text-sm">
                      {loc.location.district || loc.name}
                    </span>
                    {loc.status === "live" ? null : <LocationStatusBadge status={loc.status} />}
                  </label>
                )
              })}
            </div>
          ))}

          {shown.length === 0 ? (
            <p className="px-3 py-6 text-center text-muted-foreground text-sm">
              No locations match your search.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
