"use client"

import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react"
import { useMemo, useState } from "react"

import {
  formatAed,
  formatDuration,
  MOCK_SERVICE_CATALOG,
  type MockServiceCatalogItem,
  type MockServiceCategory,
  SERVICE_CATEGORY_ACCENT,
  SERVICE_CATEGORY_LABEL,
} from "@/app/appointments/mock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

type ServicePickerPanelProps = {
  onBack: () => void
  /** Fires when the operator commits a service. The caller closes the picker. */
  onSelectService: (service: MockServiceCatalogItem) => void
}

/**
 * Inline service picker — renders the service catalog as the sheet's
 * content (replacing the appointment view) rather than a full-screen modal.
 * The caller toggles between this and the appointment view via a mode state.
 */
export function ServicePickerPanel({ onBack, onSelectService }: ServicePickerPanelProps) {
  const [search, setSearch] = useState("")

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const byCategory = new Map<MockServiceCategory, MockServiceCatalogItem[]>()
    for (const item of MOCK_SERVICE_CATALOG) {
      if (q && !item.name.toLowerCase().includes(q)) continue
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return Array.from(byCategory.entries())
  }, [search])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon />
          Back
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-sand-2 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground">
          Select a service
        </h2>
        <SearchInput size="xl" onValueChange={setSearch} placeholder="Search by service name" />
        <div className="flex flex-col gap-6">
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No services match &ldquo;{search}&rdquo;.
            </p>
          ) : (
            grouped.map(([category, items]) => (
              <ServiceCategoryGroup
                key={category}
                category={category}
                items={items}
                onPick={onSelectService}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ServiceWarningPill({ text }: { text: string }) {
  return (
    <Badge variant="warning" size="md">
      <AlertCircleIcon aria-hidden />
      {text}
    </Badge>
  )
}

function ServiceCategoryGroup({
  category,
  items,
  onPick,
}: {
  category: MockServiceCategory
  items: MockServiceCatalogItem[]
  onPick: (item: MockServiceCatalogItem) => void
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {SERVICE_CATEGORY_LABEL[category]}
        <Badge variant="muted" className="rounded-full">
          {items.length}
        </Badge>
      </h3>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onPick(item)}
              className="group/service flex w-full gap-3 rounded-2xl px-3 py-2 text-start transition-colors hover:bg-muted/50"
            >
              <span
                aria-hidden
                className={cn(
                  "w-1 shrink-0 self-stretch rounded-full",
                  SERVICE_CATEGORY_ACCENT[item.category],
                )}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-base font-semibold text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(item.durationMin)}
                    </span>
                  </div>
                  <span className="shrink-0 text-base font-semibold leading-tight tabular-nums text-foreground">
                    {formatAed(item.priceMinor)}
                  </span>
                </div>
                {item.warnings && item.warnings.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.warnings.map((w) => (
                      <ServiceWarningPill key={w} text={w} />
                    ))}
                  </div>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
