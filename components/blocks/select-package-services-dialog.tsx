"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// ─── Types & mock data ──────────────────────────────────────────────────────────

/** A selectable leaf — a standalone service or one variant of a service. */
export type ServiceLeaf = {
  id: string
  name: string
  /** Duration label, e.g. "1 hr" or "20 min". */
  duration: string
  price: number
}

/** A service row; either a leaf (own price) or a parent with variant children. */
type ServiceItem = {
  id: string
  name: string
  duration?: string
  price?: number
  /** Price floor label shown on a parent row, e.g. "from AED 180". */
  fromPrice?: number
  variants?: ServiceLeaf[]
}

type ServiceCategory = {
  id: string
  name: string
  items: ServiceItem[]
}

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    id: "grooming",
    name: "Grooming",
    items: [
      {
        id: "full-groom",
        name: "Full groom",
        fromPrice: 180,
        variants: [
          {
            id: "full-groom-s",
            name: "Full groom — Small breed",
            duration: "1 hr 30 min",
            price: 180,
          },
          {
            id: "full-groom-m",
            name: "Full groom — Medium breed",
            duration: "1 hr 50 min",
            price: 240,
          },
          { id: "full-groom-l", name: "Full groom — Large breed", duration: "2 hr", price: 300 },
        ],
      },
      { id: "puppy-first", name: "Puppy's first groom", duration: "1 hr", price: 120 },
    ],
  },
  {
    id: "bathing",
    name: "Bathing",
    items: [
      { id: "bath-brush", name: "Bath & brush", duration: "45 min", price: 90 },
      { id: "deshedding", name: "De-shedding treatment", duration: "1 hr", price: 130 },
    ],
  },
  {
    id: "spa",
    name: "Spa & wellness",
    items: [
      { id: "aroma-spa", name: "Aromatherapy spa bath", duration: "1 hr", price: 150 },
      { id: "mud-paw", name: "Mud paw treatment", duration: "30 min", price: 70 },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function formatPrice(n: number): string {
  return `AED ${n.toLocaleString("en-US")}`
}

/** All selectable leaves in a category (variants flattened in). */
function categoryLeaves(category: ServiceCategory): ServiceLeaf[] {
  return category.items.flatMap((item) =>
    item.variants
      ? item.variants
      : [{ id: item.id, name: item.name, duration: item.duration ?? "", price: item.price ?? 0 }],
  )
}

/** Count of leaves across the whole catalog (for the empty default summary). */
export function countSelectedServices(ids: Set<string>): number {
  return ids.size
}

// ─── Component ──────────────────────────────────────────────────────────────────

type SelectPackageServicesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Currently-included leaf ids. */
  value: Set<string>
  onConfirm: (ids: Set<string>) => void
}

export function SelectPackageServicesDialog({
  open,
  onOpenChange,
  value,
  onConfirm,
}: SelectPackageServicesDialogProps) {
  const [query, setQuery] = useState("")
  // Draft selection so Close discards and the CTA commits.
  const [draft, setDraft] = useState<Set<string>>(value)

  // Re-seed the draft whenever the dialog re-opens with a fresh value.
  const [seenOpen, setSeenOpen] = useState(false)
  if (open && !seenOpen) {
    setSeenOpen(true)
    setDraft(new Set(value))
  }
  if (!open && seenOpen) setSeenOpen(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SERVICE_CATALOG
    return SERVICE_CATALOG.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.variants?.some((v) => v.name.toLowerCase().includes(q)),
      ),
    })).filter((cat) => cat.items.length > 0)
  }, [query])

  function toggleLeaf(id: string) {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCategory(category: ServiceCategory) {
    const leaves = categoryLeaves(category)
    const allOn = leaves.every((l) => draft.has(l.id))
    setDraft((prev) => {
      const next = new Set(prev)
      for (const l of leaves) {
        if (allOn) next.delete(l.id)
        else next.add(l.id)
      }
      return next
    })
  }

  function categoryState(category: ServiceCategory): boolean | "indeterminate" {
    const leaves = categoryLeaves(category)
    const on = leaves.filter((l) => draft.has(l.id)).length
    if (on === 0) return false
    if (on === leaves.length) return true
    return "indeterminate"
  }

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("")
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 pt-7 pb-5">
          <DialogTitle>Select services</DialogTitle>
          <DialogDescription className="sr-only">
            Pick the services included in this package.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={() => handleOpenChange(false)}
          >
            <XIcon />
          </Button>
        </div>

        <div className="px-6 pb-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              className="pl-11"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
          {filtered.map((category) => (
            <div key={category.id} className="flex flex-col">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
              <label className="flex cursor-pointer items-center gap-3 py-2">
                <Checkbox
                  checked={categoryState(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="text-sm font-semibold text-foreground">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {categoryLeaves(category).length}
                </span>
              </label>

              {category.items.map((item) =>
                item.variants ? (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex items-center justify-between gap-3 py-2 pl-7">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variants[0].duration} –{" "}
                          {item.variants[item.variants.length - 1].duration}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        from {formatPrice(item.fromPrice ?? item.variants[0].price)}
                      </span>
                    </div>
                    {item.variants.map((v) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                      <label
                        key={v.id}
                        className="flex cursor-pointer items-center justify-between gap-3 py-2 pl-14"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Checkbox
                            checked={draft.has(v.id)}
                            onCheckedChange={() => toggleLeaf(v.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-foreground">{v.name}</p>
                            <p className="text-sm text-muted-foreground">{v.duration}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {formatPrice(v.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center justify-between gap-3 py-2 pl-7"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Checkbox
                        checked={draft.has(item.id)}
                        onCheckedChange={() => toggleLeaf(item.id)}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.duration}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {formatPrice(item.price ?? 0)}
                    </span>
                  </label>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-border/40 px-6 py-4">
          <Button variant="outline" radius="full" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button
            radius="full"
            disabled={draft.size === 0}
            onClick={() => {
              onConfirm(new Set(draft))
              handleOpenChange(false)
            }}
          >
            {draft.size > 0
              ? `Select ${draft.size} service${draft.size === 1 ? "" : "s"}`
              : "Select services"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
