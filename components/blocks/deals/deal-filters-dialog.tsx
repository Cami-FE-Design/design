"use client"

/**
 * The deals list's filters (DW3.4, R18).
 *
 * `DealFiltersDialog` on the dev repo's `promotion-discount-ui`, minus one axis
 * and plus another.
 *
 * **Status left**, because it is what a reader switches between rather than
 * narrows by — "what is running" and "what have I got queued" are two views of
 * the list, and this repo puts that on a tab strip with a count beside each
 * (`/products`, `/clients`). Burying it behind a dialog hides both the choice
 * and the counts.
 *
 * ## Why "Location" is a filter and not just a column
 *
 * An owner with nine branches opens this list to answer one of two questions:
 * "what am I running everywhere" or "what is Mirdif running". A column lets
 * them read the answer one row at a time; a filter gives it to them. And the
 * third option — deals scoped to nowhere — is the one nobody would think to
 * look for and the one worth finding, because those rows are somebody's
 * campaign quietly reaching no client at all.
 */

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DealStatus, DealType } from "@/lib/deals/mock"
import { publicLabel } from "@/lib/locations/mock"
import type { Location } from "@/lib/locations/types"

export type DealFilters = {
  /** Owned by the toolbar's tab strip, not by this dialog. */
  status: DealStatus | "all"
  type: DealType | "all"
  /**
   * `"all"` is every deal, a branch id narrows to deals that run there, and
   * `"unscoped"` finds the ones that run nowhere.
   */
  location: string | "all" | "unscoped"
}

export const DEFAULT_DEAL_FILTERS: DealFilters = {
  status: "all",
  type: "all",
  location: "all",
}

/**
 * How many axes THIS DIALOG is narrowing by.
 *
 * Status is deliberately not counted: it is a tab the reader can see selected,
 * and a dot on the filter button for something already on screen is noise.
 */
export function activeFilterCount(f: DealFilters): number {
  return [f.type !== "all", f.location !== "all"].filter(Boolean).length
}

export function DealFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
  locations,
  isMultiLocation,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: DealFilters
  onApply: (filters: DealFilters) => void
  /** The branches this reader holds — never the estate (R18). */
  locations: ReadonlyArray<Location>
  isMultiLocation: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md gap-6 p-6">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>Filters</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="deal-filter-type">Deal type</Label>
          <Select
            value={filters.type}
            onValueChange={(v) => onApply({ ...filters, type: v as DealType | "all" })}
          >
            <SelectTrigger id="deal-filter-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="flash-sale">Flash sale</SelectItem>
              <SelectItem value="last-minute-offer">Last-minute offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isMultiLocation ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="deal-filter-location">Location</Label>
            <Select
              value={filters.location}
              onValueChange={(v) => onApply({ ...filters, location: v })}
            >
              <SelectTrigger id="deal-filter-location" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    Runs at {publicLabel(l)}
                  </SelectItem>
                ))}
                {/* The rows nobody goes looking for. */}
                <SelectItem value="unscoped">Runs nowhere</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            radius="full"
            // Clears what this dialog owns. The status tab is the reader's
            // current view, and resetting it from in here would move the list
            // out from under them.
            onClick={() => onApply({ ...DEFAULT_DEAL_FILTERS, status: filters.status })}
          >
            Clear filters
          </Button>
          <Button type="button" radius="full" onClick={() => onOpenChange(false)}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
