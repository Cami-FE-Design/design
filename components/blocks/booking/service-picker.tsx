"use client"

import { CheckIcon, ListIcon, PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const active = SERVICE_CATEGORIES.find((c) => c.id === activeId) ?? SERVICE_CATEGORIES[0]!
  const selected = new Set(selectedIds)

  return (
    <div className="flex flex-col gap-5">
      {/* Category tabs + overflow */}
      <div className="flex items-center gap-2">
        <div className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1">
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
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="All categories"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted/40"
        >
          <ListIcon className="size-4" />
        </button>
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

      {/* All categories sheet — for menus too long to fit the tab row */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[80dvh] gap-0 overflow-y-auto"
        >
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="font-semibold text-lg">Categories</SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60"
              >
                <XIcon className="size-5" />
              </button>
            </SheetClose>
          </SheetHeader>
          <nav className="flex flex-col px-2 pb-6">
            {SERVICE_CATEGORIES.map((cat) => {
              const n = cat.services.filter((s) => selected.has(s.id)).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveId(cat.id)
                    setSheetOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-base transition-colors hover:bg-muted/50",
                    cat.id === activeId ? "font-semibold text-foreground" : "text-foreground",
                  )}
                >
                  <span>{cat.name}</span>
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    {n > 0 ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-cami-violet-9 text-white text-xs">
                        {n}
                      </span>
                    ) : null}
                    {cat.services.length}
                  </span>
                </button>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
