"use client"

import { CheckIcon, SearchIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types & mock data ──────────────────────────────────────────────────────────

export type ComboService = {
  id: string
  name: string
  /** Duration in minutes. */
  duration: number
  /** Price in business currency (AED). */
  price: number
  category: string
  /** Hex used for the category dot + the card's left accent border. */
  color: string
}

export const MOCK_SERVICES: ComboService[] = [
  // Grooming
  {
    id: "full-groom-small",
    name: "Full groom — Small breed",
    duration: 90,
    price: 180,
    category: "Grooming",
    color: "#5eead4",
  },
  {
    id: "full-groom-large",
    name: "Full groom — Large breed",
    duration: 120,
    price: 260,
    category: "Grooming",
    color: "#5eead4",
  },
  {
    id: "puppy-first-groom",
    name: "Puppy's first groom",
    duration: 60,
    price: 120,
    category: "Grooming",
    color: "#5eead4",
  },
  // Bathing
  {
    id: "bath-brush",
    name: "Bath & brush",
    duration: 45,
    price: 90,
    category: "Bathing",
    color: "#93c5fd",
  },
  {
    id: "deshedding",
    name: "De-shedding treatment",
    duration: 60,
    price: 130,
    category: "Bathing",
    color: "#93c5fd",
  },
  // Nail & paw care
  {
    id: "nail-trim",
    name: "Nail trim",
    duration: 15,
    price: 30,
    category: "Nail & paw care",
    color: "#fdba74",
  },
  {
    id: "paw-pad-care",
    name: "Paw pad & nail care",
    duration: 25,
    price: 55,
    category: "Nail & paw care",
    color: "#fdba74",
  },
  // Add-ons
  {
    id: "teeth-brushing",
    name: "Teeth brushing",
    duration: 15,
    price: 25,
    category: "Add-ons",
    color: "#86efac",
  },
  {
    id: "blueberry-facial",
    name: "Blueberry facial",
    duration: 15,
    price: 35,
    category: "Add-ons",
    color: "#86efac",
  },
  {
    id: "cologne-bow",
    name: "Cologne & bow finish",
    duration: 10,
    price: 20,
    category: "Add-ons",
    color: "#86efac",
  },
  // Spa & wellness
  {
    id: "aromatherapy-spa",
    name: "Aromatherapy spa bath",
    duration: 60,
    price: 150,
    category: "Spa & wellness",
    color: "#c4b5fd",
  },
  {
    id: "mud-paw",
    name: "Mud paw treatment",
    duration: 30,
    price: 70,
    category: "Spa & wellness",
    color: "#c4b5fd",
  },
  // Cats
  {
    id: "cat-full-groom",
    name: "Cat full groom",
    duration: 75,
    price: 200,
    category: "Cats",
    color: "#f9a8d4",
  },
  {
    id: "cat-nail-trim",
    name: "Cat nail trim",
    duration: 15,
    price: 35,
    category: "Cats",
    color: "#f9a8d4",
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/** Money with thousands separators; 2 decimals only when the value isn't whole. */
export function formatMoney(n: number): string {
  const rounded = Math.round(n * 100) / 100
  const hasFraction = rounded % 1 !== 0
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })
}

export function formatPrice(price: number): string {
  return `AED ${formatMoney(price)}`
}

// ─── Component ──────────────────────────────────────────────────────────────────

type SelectServicesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** IDs already added to the combo — rendered selected. */
  selectedIds: string[]
  onToggle: (service: ComboService) => void
}

export function SelectServicesDialog({
  open,
  onOpenChange,
  selectedIds,
  onToggle,
}: SelectServicesDialogProps) {
  const [query, setQuery] = useState("")

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? MOCK_SERVICES.filter((s) => s.name.toLowerCase().includes(q))
      : MOCK_SERVICES
    const map = new Map<string, ComboService[]>()
    for (const s of matches) {
      const list = map.get(s.category) ?? []
      list.push(s)
      map.set(s.category, list)
    }
    return [...map.entries()]
  }, [query])

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("")
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 pt-7 pb-5">
          <DialogTitle className="font-heading text-2xl font-semibold">Services</DialogTitle>
          <DialogDescription className="sr-only">
            Pick services to include in this combo.
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
              placeholder="Search by name"
              className="pl-11"
            />
          </div>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-6 py-4">
          {grouped.length === 0 ? (
            <EmptyState icon={SearchIcon} title="No services found" className="py-8" />
          ) : (
            grouped.map(([category, services]) => (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                <div className="flex flex-col gap-2">
                  {services.map((service) => {
                    const selected = selectedIds.includes(service.id)
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => onToggle(service)}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 border-l-4 py-3 pr-4 pl-3.5 text-left transition-colors hover:bg-muted/40",
                          selected && "bg-muted/60",
                        )}
                        style={{ borderLeftColor: service.color }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {service.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(service.duration)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {formatPrice(service.price)}
                        </span>
                        {selected ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckIcon className="size-3.5" />
                          </span>
                        ) : (
                          <span className="size-5 shrink-0 rounded-full border border-border" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end border-t border-border/40 px-6 py-4">
          <Button radius="full" onClick={() => handleOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
