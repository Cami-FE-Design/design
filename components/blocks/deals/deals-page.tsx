"use client"

/**
 * Settings → Marketing → Deals — `DealsPage` on the dev repo's
 * `promotion-discount-ui`, mounted where it mounts it: a tab of the settings
 * dialog, not a route.
 *
 * Breadcrumb and header, a search, the list of deal cards, then a sort menu and
 * Add deal under it. A row drills into the detail view in place.
 *
 * Multi-location adds two things and changes nothing else. Each row says where
 * the deal runs, and the list is bounded by the reader's grant and the branch
 * switcher: a manager holding one branch sees the deals that reach it (R18).
 * The deal that reaches nobody stays listed, so an owner can find and fix it.
 */

import { ArrowDownUpIcon, ChevronRightIcon, CirclePercentIcon, CirclePlusIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { DealDetailView } from "@/components/blocks/deals/deal-detail-view"
import { DealWizardDialog } from "@/components/blocks/deals/deal-wizard-dialog"
import { DealsTable } from "@/components/blocks/deals/deals-table"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { type Deal, resolvedStatus } from "@/lib/deals/mock"
import { duplicateDeal, saveDeal, setDealStatus, useDeals } from "@/lib/deals/store"
import { isRunnable, runsAt } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"
import { TODAY_ISO } from "@/lib/money/mock"
import { cn } from "@/lib/utils"

type SortKey =
  | "name-asc"
  | "name-desc"
  | "status-active"
  | "status-inactive"
  | "created-oldest"
  | "created-newest"
  | "sales-highest"
  | "sales-lowest"

const SORT_LABELS: Record<SortKey, string> = {
  "name-asc": "Deal name (A–Z)",
  "name-desc": "Deal name (Z–A)",
  "status-active": "Status (active first)",
  "status-inactive": "Status (inactive first)",
  "created-oldest": "Created (oldest first)",
  "created-newest": "Created (newest first)",
  "sales-highest": "Total sales (highest first)",
  "sales-lowest": "Total sales (lowest first)",
}

function sortDeals(deals: Deal[], sort: SortKey): Deal[] {
  const list = [...deals]
  const active = (d: Deal) => Number(resolvedStatus(d, TODAY_ISO) === "active")
  switch (sort) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case "status-active":
      return list.sort((a, b) => active(b) - active(a))
    case "status-inactive":
      return list.sort((a, b) => active(a) - active(b))
    case "created-oldest":
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case "sales-highest":
      return list.sort((a, b) => b.totalSalesMinor - a.totalSalesMinor)
    case "sales-lowest":
      return list.sort((a, b) => a.totalSalesMinor - b.totalSalesMinor)
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

export function DealsPage() {
  const deals = useDeals()
  const { granted, scopedLocations, locationName } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted

  // `?deal=<id>` opens that deal, so a review link lands on it rather than on
  // a list and an instruction to click.
  const params = useSearchParams()
  const dealParam = params?.get("deal") ?? null
  const [selectedDealId, setSelectedDealId] = useState<string | null>(dealParam)
  const [openedFor, setOpenedFor] = useState(dealParam)
  if (dealParam !== openedFor) {
    setOpenedFor(dealParam)
    setSelectedDealId(dealParam)
  }

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("created-newest")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  /** What this reader may see: deals reaching a branch in scope, plus the unscoped one. */
  const reachable = useMemo(
    () =>
      deals.filter(
        (deal) => !isRunnable(deal.scope) || inScope.some((l) => runsAt(deal.scope, l.id)),
      ),
    [deals, inScope],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? reachable.filter((d) => d.name.toLowerCase().includes(q)) : reachable
    return sortDeals(base, sort)
  }, [reachable, query, sort])

  const selected = selectedDealId ? deals.find((d) => d.id === selectedDealId) : undefined
  if (selected) {
    return (
      <DealDetailView deal={selected} todayIso={TODAY_ISO} onBack={() => setSelectedDealId(null)} />
    )
  }

  return (
    // Only the list scrolls. The header, the search and the sort / Add deal row
    // stay put, as they do in the dev repo and in every other settings panel.
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-6 pt-9 pb-6 max-lg:pt-14 lg:px-10">
      <div className="flex shrink-0 flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
          <CirclePercentIcon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm leading-5">Marketing</span>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground text-sm leading-5">Deals</span>
        </nav>
        <header className="flex flex-col gap-2">
          <h2 className="font-heading font-semibold text-2xl text-foreground leading-8">Deals</h2>
          <p className="text-muted-foreground text-sm leading-5">
            Set up and manage the deals you offer to your clients.
          </p>
        </header>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 sm:w-146">
        {reachable.length > 0 ? (
          <SearchInput
            defaultValue={query}
            onValueChange={setQuery}
            placeholder="Search by deal name"
            className="h-10 max-w-80 shrink-0"
          />
        ) : null}

        {filtered.length === 0 ? (
          <section className="flex w-full flex-col rounded-2xl border border-border/60 p-5">
            <EmptyState
              icon={CirclePercentIcon}
              title="No active deals yet"
              description="Create promotions and discounts to offer deals to your clients."
              action={
                <Button variant="secondary" radius="full" onClick={() => setWizardOpen(true)}>
                  Add deal
                </Button>
              }
            />
          </section>
        ) : (
          <DealsTable
            deals={filtered}
            todayIso={TODAY_ISO}
            locationName={locationName}
            onSelect={setSelectedDealId}
            onEdit={setEditingDeal}
            onSetStatus={setDealStatus}
            onDuplicate={duplicateDeal}
          />
        )}

        {reachable.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" radius="full" className="gap-1.5">
                  <ArrowDownUpIcon className="size-4" />
                  {SORT_LABELS[sort]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onSelect={() => setSort(key)}
                    className={cn(key === sort && "font-medium")}
                  >
                    {SORT_LABELS[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="secondary"
              radius="full"
              className="gap-1.5"
              onClick={() => setWizardOpen(true)}
            >
              <CirclePlusIcon className="size-4" />
              Add deal
            </Button>
          </div>
        ) : null}
      </div>

      <DealWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        todayIso={TODAY_ISO}
        onSave={saveDeal}
      />

      <DealWizardDialog
        open={editingDeal !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDeal(null)
        }}
        dealToEdit={editingDeal ?? undefined}
        todayIso={TODAY_ISO}
        onSave={saveDeal}
      />
    </div>
  )
}
