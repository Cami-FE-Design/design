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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Deal } from "@/lib/deals/mock"
import { isRunnable, type PromotionScope } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

function ScopeChoice({
  id,
  value,
  selected,
  onSelect,
  title,
  detail,
}: {
  id: string
  value: string
  selected: boolean
  onSelect: () => void
  title: string
  detail: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
        selected ? "border-cami-violet-8 bg-cami-violet-2" : "border-border/60 hover:bg-muted/40",
      )}
    >
      {/* Not interactive itself — the card above it already is, and two click
          targets for one choice is how a row ends up half-working. */}
      <RadioGroupItem id={id} value={value} className="pointer-events-none mt-0.5" tabIndex={-1} />
      <span className="flex min-w-0 flex-col">
        <span className="font-medium text-foreground text-sm">{title}</span>
        <span className="text-muted-foreground text-sm">{detail}</span>
      </span>
    </button>
  )
}

export function DealScopeDialog({
  open,
  onOpenChange,
  deal,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `null` creates one. The scope question is the same either way. */
  deal: Deal | null
  onSave: (next: { name: string; offer: string; scope: PromotionScope }) => void
}) {
  // The branches this owner may scope to — never the estate, since you cannot
  // run a deal at a branch you do not hold (R04).
  const { granted } = useLocations()

  const [kind, setKind] = useState<PromotionScope["kind"]>("estate")
  const [picked, setPicked] = useState<string[]>([])
  const [name, setName] = useState("")
  const [offer, setOffer] = useState("")

  useEffect(() => {
    if (!open) return
    setKind(deal?.scope.kind ?? "estate")
    setPicked(deal?.scope.kind === "branches" ? [...deal.scope.locationIds] : [])
    setName(deal?.name ?? "")
    setOffer(deal?.offer ?? "")
  }, [open, deal])

  const scope: PromotionScope =
    kind === "estate" ? { kind: "estate" } : { kind: "branches", locationIds: picked }
  const runnable = isRunnable(scope)
  const named = name.trim().length > 0 && offer.trim().length > 0
  const creating = deal === null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{creating ? "New deal" : "Where does this deal run?"}</DialogTitle>
          <DialogDescription>
            {creating
              ? "Name it, say what it takes off, and choose where it runs."
              : `${deal.name} · ${deal.offer}`}
          </DialogDescription>
        </DialogHeader>

        {/* No scroll here. The picker below carries its own bounded list — a
            fixed height so the dialog does not grow with the estate — and a
            scroll port around it made two scrollbars for one dialog, with the
            notice under the picker half-cut between them. One scrollable
            region, and it is the one that has too many rows. */}
        <div className="flex flex-col gap-4">
          {creating ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deal-name">Name</Label>
                <Input
                  id="deal-name"
                  value={name}
                  placeholder="Spring refresh"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deal-offer">Offer</Label>
                <Input
                  id="deal-offer"
                  value={offer}
                  placeholder="15% off grooming"
                  onChange={(e) => setOffer(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <RadioGroup
            value={kind}
            onValueChange={(v) => setKind(v as PromotionScope["kind"])}
            className="flex flex-col gap-3"
          >
            {/* The whole card is the target, not the 16px dot. Radix renders the
                radio as a <button>, and a <label htmlFor> pointing at one does
                not reliably activate it — so the row looked clickable, was
                styled clickable, and only worked if you hit the dot. The card
                takes the click and the radio stays as the thing that shows
                which is chosen. */}
            <ScopeChoice
              id="deal-scope-estate"
              value="estate"
              selected={kind === "estate"}
              onSelect={() => setKind("estate")}
              title="All locations"
              detail="Including any location you open while this deal is running."
            />
            <ScopeChoice
              id="deal-scope-branches"
              value="branches"
              selected={kind === "branches"}
              onSelect={() => setKind("branches")}
              title="Only the locations I choose"
              detail="A local offer, which a location opened later will not join."
            />
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
          <Button
            radius="full"
            disabled={!runnable || (creating && !named)}
            onClick={() => onSave({ name: name.trim(), offer: offer.trim(), scope })}
          >
            {creating ? "Create deal" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
