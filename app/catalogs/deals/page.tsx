"use client"

/**
 * Deals, and where each one runs (DW3.4, R04, R11, R18, R24).
 *
 * ## Why this screen exists
 *
 * "As an owner, I want to run a promotion across my whole chain or scope it to
 * one branch, so that a business-wide campaign and a local offer can coexist."
 * A quiet branch discounting to fill a Tuesday and a chain-wide January offer
 * are both real, and a list that cannot tell them apart is a list an owner
 * cannot act on.
 *
 * ## Shaped on `DealsPage`, with one thing it could not have
 *
 * The dev repo's `promotion-discount-ui` has this module built: a list of
 * cards, an Options menu per row, a sort menu, a filters dialog, and an
 * inner-page drill-down to a three-tab detail view. All of that is replicated.
 *
 * What it does not have is a location. Its wizard creates every deal with
 * `locationIds: []`, its mapper reads that empty array as every venue, and its
 * Availability tab can therefore only ever say "All locations" behind an Edit
 * button that says editing is coming soon. That empty array is exactly the
 * shape R24 forbids — so here the reach is a wizard step, a line on every row,
 * a filter axis, and a panel on the detail view that names the branches.
 *
 * ## Bounded by the grant, and narrowed by the switcher
 *
 * A manager granted one branch sees the deals that reach their branch, and the
 * count on each row is what it reaches **of theirs** — not the chain's nine. A
 * chain-wide deal is still listed for them, because it does run at their
 * branch; what they are not told is where else.
 */

import { ArrowDownUpIcon, CirclePercentIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"

import { AppShell } from "@/components/blocks/app-shell"
import { DealDetailDialog } from "@/components/blocks/deals/deal-detail-dialog"
import {
  activeFilterCount,
  DEFAULT_DEAL_FILTERS,
  type DealFilters,
  DealFiltersDialog,
} from "@/components/blocks/deals/deal-filters-dialog"
import { DealWizardDialog } from "@/components/blocks/deals/deal-wizard-dialog"
import { DealsTable } from "@/components/blocks/deals/deals-table"
import { EmptyState } from "@/components/blocks/empty-state"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Deal, type DealStatus, MOCK_DEALS, statusFor } from "@/lib/deals/mock"
import { isRunnable, runsAt } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"
import { TODAY_ISO } from "@/lib/money/mock"

type SortKey = "created-newest" | "created-oldest" | "name-asc" | "name-desc" | "sales-highest"

const SORT_LABEL: Record<SortKey, string> = {
  "created-newest": "Created (newest first)",
  "created-oldest": "Created (oldest first)",
  "name-asc": "Deal name (A–Z)",
  "name-desc": "Deal name (Z–A)",
  "sales-highest": "Total sales (highest first)",
}

/**
 * Status as a tab strip, not a row in the filters dialog.
 *
 * It is the axis a reader switches between constantly — "what is running", "what
 * have I got queued" — and the repo puts that on tabs with a count beside each
 * (`/products`, `/clients`). Location and Type stay in the dialog, because those
 * narrow a list rather than switch between views of it.
 */
const STATUS_TABS: ReadonlyArray<{ value: DealStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
]

/** A deal that reaches nobody can never read Active, whatever was stored. */
function resolvedStatus(deal: Deal, todayIso: string): DealStatus {
  return isRunnable(deal.scope)
    ? statusFor(deal.status, deal.startDate, deal.endDate, todayIso)
    : "inactive"
}

function sortDeals(deals: Deal[], sort: SortKey): Deal[] {
  const list = [...deals]
  switch (sort) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case "created-oldest":
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case "sales-highest":
      return list.sort((a, b) => b.totalSalesMinor - a.totalSalesMinor)
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

function DealsScreen() {
  const router = useRouter()
  const params = useSearchParams()
  // A deep link, so a review comment can point at one deal's Availability tab
  // rather than at a list and an instruction to click.
  const selectedId = params.get("deal")

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("created-newest")
  const [filters, setFilters] = useState<DealFilters>(DEFAULT_DEAL_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  // `null` is "closed"; `{ deal: null }` is "creating one". A single nullable
  // would collapse those two into one state.
  const [wizard, setWizard] = useState<{ deal: Deal | null } | null>(null)
  const [deals, setDeals] = useState(MOCK_DEALS)

  const { granted, scopedLocations, locations, locationName, isMultiLocation } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted

  /**
   * Stop, restart or archive a deal.
   *
   * Written onto the deal rather than derived, because none of the three is a
   * fact a calendar holds: "somebody switched this off" is not "its end date
   * passed", and `statusFor` deliberately lets a stored one win.
   */
  function setStatus(id: string, next: DealStatus) {
    setDeals((current) => current.map((d) => (d.id === id ? { ...d, status: next } : d)))
  }

  function saveDeal(deal: Deal) {
    setDeals((current) =>
      current.some((d) => d.id === deal.id)
        ? current.map((d) => (d.id === deal.id ? deal : d))
        : [deal, ...current],
    )
  }

  /**
   * Copy a deal, and copy its reach with it.
   *
   * The copy starts **inactive**: duplicating is how an owner makes next
   * season's offer out of last season's, and a second live discount appearing
   * at nine branches because somebody clicked Duplicate is money nobody agreed
   * to spend.
   */
  function duplicate(deal: Deal) {
    saveDeal({
      ...deal,
      id: `deal-${Date.now()}`,
      name: `${deal.name} (copy)`,
      status: "inactive",
      redemptions: 0,
      totalSalesMinor: 0,
      totalClients: 0,
      createdAt: new Date().toISOString(),
    })
  }

  /**
   * Everything this reader may see, before the status tab narrows it.
   *
   * The tab counts are taken from here rather than from `visible`, or every tab
   * would read the count of the one already selected.
   */
  const inReach = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deals.filter((deal) => {
      if (q && !deal.name.toLowerCase().includes(q)) return false
      if (filters.type !== "all" && deal.type !== filters.type) return false

      const runs = isRunnable(deal.scope)
      if (filters.location === "unscoped") return !runs
      if (filters.location !== "all" && !runsAt(deal.scope, filters.location)) return false

      // A deal that reaches none of your branches is not yours to read. The
      // unscoped one is the exception: it reaches nobody by definition, and an
      // owner has to be able to find and fix it.
      if (!runs) return true
      return inScope.some((l) => runsAt(deal.scope, l.id))
    })
  }, [deals, query, inScope, filters.type, filters.location])

  const counts = useMemo(() => {
    const out: Record<DealStatus | "all", number> = {
      all: inReach.length,
      active: 0,
      scheduled: 0,
      inactive: 0,
      archived: 0,
    }
    for (const deal of inReach) out[resolvedStatus(deal, TODAY_ISO)] += 1
    return out
  }, [inReach])

  const visible = useMemo(() => {
    const matched =
      filters.status === "all"
        ? inReach
        : inReach.filter((d) => resolvedStatus(d, TODAY_ISO) === filters.status)
    return sortDeals(matched, sort)
  }, [inReach, filters.status, sort])

  const selected = selectedId ? deals.find((d) => d.id === selectedId) : undefined
  const filterCount = activeFilterCount(filters)

  return (
    <>
      <AppShell
        header={
          <div className="flex w-full max-w-6xl items-center justify-between gap-3">
            <div className="flex flex-col">
              <h1 className="font-medium text-2xl text-foreground leading-8">Deals</h1>
              <p className="text-muted-foreground text-sm">
                Offers and discounts, and the locations each one runs at.
              </p>
            </div>
            {/* It was disabled, which on a list page's primary action reads as
                broken rather than as "not yet". */}
            <Button radius="full" onClick={() => setWizard({ deal: null })}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
        }
      >
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto">
          <TableToolbar
            // Tabs left, actions right — the repo's toolbar shape
            // (`/products`, `/clients`). Status is the axis a reader
            // switches between constantly, so it is a tab strip rather than
            // a row buried in the filters dialog; Location and Type stay in
            // there, because those are narrowing rather than switching.
            tabs={
              <Tabs
                value={filters.status}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, status: v as DealFilters["status"] }))
                }
              >
                <TabsList variant="ghost">
                  {STATUS_TABS.map((t) => (
                    <TabsTrigger key={t.value} value={t.value}>
                      {t.label}
                      <span className="font-normal text-muted-foreground text-sm">
                        {counts[t.value]}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            actions={
              <>
                <SearchInput
                  className="h-9! w-72"
                  placeholder="Search by deal name"
                  aria-label="Search deals"
                  onValueChange={setQuery}
                />
                {/* Icon-only, as every other list in the repo draws it. The
                        dot says a filter is on without spending a column of
                        width on a number — a filtered list that looks like an
                        empty one is how somebody concludes they have no deals. */}
                <Button
                  variant="outline"
                  size="icon-sm"
                  radius="full"
                  aria-label={filterCount > 0 ? `Filter (${filterCount} applied)` : "Filter"}
                  className="relative"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontalIcon className="size-4" />
                  {filterCount > 0 ? (
                    <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary" />
                  ) : null}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                      <ArrowDownUpIcon className="size-3.5" />
                      {SORT_LABEL[sort]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                      <DropdownMenuItem
                        key={key}
                        onSelect={() => setSort(key)}
                        data-active={sort === key}
                        className="data-[active=true]:font-semibold"
                      >
                        {SORT_LABEL[key]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />

          {visible.length === 0 ? (
            <EmptyState
              variant="card"
              icon={CirclePercentIcon}
              title={
                filterCount > 0 || query
                  ? "No deals match those filters"
                  : "No deals run at your locations"
              }
              description={
                filterCount > 0 || query
                  ? "Clear the filters to see everything that runs here."
                  : "A deal scoped to another branch is not shown here."
              }
            />
          ) : (
            <DealsTable
              deals={visible}
              todayIso={TODAY_ISO}
              locationName={locationName}
              inScope={inScope}
              estateSize={locations.length}
              isMultiLocation={isMultiLocation}
              onSelect={(id) => router.push(`/catalogs/deals?deal=${id}`)}
              onEdit={(deal) => setWizard({ deal })}
              onSetStatus={setStatus}
              onDuplicate={duplicate}
            />
          )}
        </div>
      </AppShell>

      {/* Outside AppShell, which is now a preference rather than a rule.
          It used to be the rule: the shell rendered its children twice, once
          per breakpoint, and a dialog portals to the body — out of the
          container whose CSS was hiding the second copy — so two appeared
          stacked. The shell renders once now and nine other pages keep their
          dialogs inside it happily. These stay out because a page's dialogs
          are not part of its layout, and reading them here says so. */}
      {wizard ? (
        <DealWizardDialog
          open
          onOpenChange={(next) => {
            if (!next) setWizard(null)
          }}
          dealToEdit={wizard.deal}
          todayIso={TODAY_ISO}
          onSave={saveDeal}
        />
      ) : null}

      <DealDetailDialog
        open={selected !== undefined}
        onOpenChange={(next) => {
          // The URL is the state, so closing goes back to the plain list —
          // which keeps ?deal=… a shareable link into one deal's Availability.
          if (!next) router.push("/catalogs/deals")
        }}
        deal={selected ?? null}
        todayIso={TODAY_ISO}
        locationName={locationName}
        granted={inScope}
        estateSize={locations.length}
        isMultiLocation={isMultiLocation}
        onEdit={() => {
          if (selected) setWizard({ deal: selected })
        }}
        onDuplicate={() => {
          if (selected) duplicate(selected)
        }}
        onSetStatus={(next) => {
          if (selected) setStatus(selected.id, next)
        }}
      />

      <DealFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={setFilters}
        locations={inScope}
        isMultiLocation={isMultiLocation}
      />
    </>
  )
}

export default function DealsPage() {
  // `useSearchParams` bails out of static prerendering unless it runs inside a
  // Suspense boundary.
  return (
    <Suspense>
      <DealsScreen />
    </Suspense>
  )
}
