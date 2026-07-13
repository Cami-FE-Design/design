"use client"

import { CheckIcon, ListIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type CatalogService, SERVICE_CATEGORIES } from "@/lib/booking"
import { formatDuration, formatPriceAed } from "@/lib/public-business"
import { cn } from "@/lib/utils"

// Fresha-style service selection that scales past 30 services: category tabs
// (horizontal scroll) + an overflow "Categories" sheet, then multi-select cards.

function ServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: CatalogService
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-4 transition-colors",
        selected ? "border-cami-violet-8 bg-cami-violet-3/40" : "border-border/60",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground text-sm">{service.name}</span>
        <span className="text-muted-foreground text-xs">
          {formatDuration(service.durationMinutes)}
          {service.tag ? ` · ${service.tag}` : ""}
        </span>
        {service.description ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
            {service.description}
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-medium text-foreground text-sm tabular-nums">
          {formatPriceAed(service.priceAed)}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${service.name}` : `Add ${service.name}`}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
            selected
              ? "bg-cami-violet-9 text-white"
              : "border border-border text-foreground hover:bg-muted/60",
          )}
        >
          {selected ? (
            <CheckIcon className="size-4" strokeWidth={2.5} />
          ) : (
            <PlusIcon className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function ServicePicker({
  selectedIds,
  onToggle,
}: {
  selectedIds: ReadonlyArray<string>
  onToggle: (id: string) => void
}) {
  const [activeId, setActiveId] = useState(SERVICE_CATEGORIES[0]!.id)
  const active = SERVICE_CATEGORIES.find((c) => c.id === activeId) ?? SERVICE_CATEGORIES[0]!
  const selected = new Set(selectedIds)

  return (
    <div className="flex flex-col gap-5">
      {/* Category tabs + overflow — sticky under the flow's top bar (z-10 sits
          below the z-20 header so it tucks under it, no seam). */}
      <div className="-mx-1 sticky top-20 z-10 flex items-center gap-2 bg-background/85 px-1 py-2 backdrop-blur-md lg:top-24">
        <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1">
          {SERVICE_CATEGORIES.map((cat) => {
            const on = cat.id === activeId
            // Count of selected services in this category — a subtle badge on the tab.
            const n = cat.services.filter((s) => selected.has(s.id)).length
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveId(cat.id)}
                aria-pressed={on}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 text-foreground hover:bg-muted/40",
                )}
              >
                {cat.name}
                {n > 0 ? (
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px]",
                      on ? "bg-background/25 text-background" : "bg-cami-violet-9 text-white",
                    )}
                  >
                    {n}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="All categories"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted/40 data-[state=open]:bg-muted/60"
            >
              <ListIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[60vh] w-56 overflow-y-auto">
            {SERVICE_CATEGORIES.map((cat) => {
              const n = cat.services.filter((s) => selected.has(s.id)).length
              return (
                <DropdownMenuItem
                  key={cat.id}
                  onSelect={() => setActiveId(cat.id)}
                  className={cn(
                    "justify-between gap-3",
                    cat.id === activeId && "font-semibold text-foreground",
                  )}
                >
                  <span>{cat.name}</span>
                  {n > 0 ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-cami-violet-9 text-[10px] text-white">
                      {n}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active category */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-foreground text-lg tracking-tight">{active.name}</h2>
        {active.description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{active.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5">
        {active.services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            selected={selected.has(s.id)}
            onToggle={() => onToggle(s.id)}
          />
        ))}
      </div>
    </div>
  )
}
