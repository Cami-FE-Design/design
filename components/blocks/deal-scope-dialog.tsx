"use client"

/**
 * Choosing where a deal runs (DW3.4, R04, R24).
 *
 * ## Two cases, not one list with a shortcut
 *
 * "All locations" is a named set that happens to be complete today and will
 * include the twenty-first branch; ticking every box is a list that will not.
 * For a promotion that difference is money: a chain-wide January offer must
 * reach a branch that opens on the 14th, and an owner who expressed it by
 * ticking nine boxes finds that it does not. So the choice is made first, and
 * the list only appears for the second case — the same shape the branch
 * switcher and the team grants use, so an owner learns it once.
 *
 * ## Nothing chosen is refused, not saved
 *
 * A branch-scoped deal with an empty list runs nowhere. The dev repo's mapper
 * reads that shape as the whole chain (`allVenues` → `locationIds: []`), so the
 * same saved row means opposite things on either side of the seam. Save is
 * disabled with the reason on screen rather than storing something whose
 * meaning depends on who reads it (R24).
 */

import { useEffect, useState } from "react"

import { LocationMultiSelect } from "@/components/blocks/location-multi-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Deal } from "@/lib/deals/mock"
import { isRunnable, type PromotionScope } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"

export function DealScopeDialog({
  open,
  onOpenChange,
  deal,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onSave: (scope: PromotionScope) => void
}) {
  // The branches this owner may scope to — never the estate, since you cannot
  // run a deal at a branch you do not hold (R04).
  const { granted } = useLocations()

  const [kind, setKind] = useState<PromotionScope["kind"]>("estate")
  const [picked, setPicked] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setKind(deal.scope.kind)
    setPicked(deal.scope.kind === "branches" ? [...deal.scope.locationIds] : [])
  }, [open, deal])

  const scope: PromotionScope =
    kind === "estate" ? { kind: "estate" } : { kind: "branches", locationIds: picked }
  const runnable = isRunnable(scope)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Where does this deal run?</DialogTitle>
          <DialogDescription>
            {deal.name} · {deal.offer}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <RadioGroup
            value={kind}
            onValueChange={(v) => setKind(v as PromotionScope["kind"])}
            className="flex flex-col gap-3"
          >
            <label
              htmlFor="deal-scope-estate"
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 p-3"
            >
              <RadioGroupItem id="deal-scope-estate" value="estate" className="mt-0.5" />
              <span className="flex min-w-0 flex-col">
                <span className="font-medium text-foreground text-sm">All locations</span>
                <span className="text-muted-foreground text-sm">
                  Including any location you open while this deal is running.
                </span>
              </span>
            </label>

            <label
              htmlFor="deal-scope-branches"
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 p-3"
            >
              <RadioGroupItem id="deal-scope-branches" value="branches" className="mt-0.5" />
              <span className="flex min-w-0 flex-col">
                <span className="font-medium text-foreground text-sm">
                  Only the locations I choose
                </span>
                <span className="text-muted-foreground text-sm">
                  A local offer, which a location opened later will not join.
                </span>
              </span>
            </label>
          </RadioGroup>

          {kind === "branches" ? (
            <div className="flex flex-col gap-1.5">
              <Label>Locations</Label>
              <LocationMultiSelect locations={granted} selectedIds={picked} onChange={setPicked} />
            </div>
          ) : null}

          {!runnable ? (
            <p className="rounded-xl bg-cami-yellow-2 p-3 text-foreground text-sm">
              Choose at least one location. A deal with none does not run everywhere — it runs
              nowhere, and nobody can use it.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button radius="full" disabled={!runnable} onClick={() => onSave(scope)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
