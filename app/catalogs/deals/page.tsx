"use client"

/**
 * Deals, and where each one runs (DW3.4, R04, R18, R24).
 *
 * ## Why this screen exists
 *
 * "As an owner, I want to run a promotion across my whole chain or scope it to
 * one branch, so that a business-wide campaign and a local offer can coexist."
 * A quiet branch discounting to fill a Tuesday and a chain-wide January offer
 * are both real, and a list that cannot tell them apart is a list an owner
 * cannot act on.
 *
 * ## The column that carries the rule
 *
 * **Locations** is not decoration. "All locations" and "3 locations" are
 * different claims — the first survives a tenth branch opening and the second
 * does not — so they read differently, the same way the branch switcher and the
 * team grants say it. And a deal saved with nothing chosen says *nobody can use
 * this*, rather than passing as chain-wide: that is the one state the dev
 * repo's `locationIds: []` would read the other way, and R24 is explicit that
 * an empty scope never resolves to all.
 *
 * ## Bounded by the grant, and narrowed by the switcher
 *
 * A manager granted one branch sees the deals that reach their branch, and the
 * count on each row is what it reaches **of theirs** — not the chain's nine.
 * A chain-wide deal is still listed for them, because it does run at their
 * branch; what they are not told is where else.
 */

import { ChevronDownIcon, PlusIcon, SlidersHorizontalIcon, TagIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { DealScopeDialog } from "@/components/blocks/deal-scope-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DEAL_STATUS_LABEL, type Deal, MOCK_DEALS } from "@/lib/deals/mock"
import { describeScope, isRunnable, reaches, runsAt } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"

export default function DealsPage() {
  const [query, setQuery] = useState("")
  // `null` is "nothing open"; `{ deal: null }` is "creating one". A single
  // nullable would collapse those two into one state.
  const [editing, setEditing] = useState<{ deal: Deal | null } | null>(null)
  const [deals, setDeals] = useState(MOCK_DEALS)

  // The granted set, narrowed by the switcher (R03, R18). A manager holding one
  // branch is shown the deals that reach it, and nothing about the rest.
  // `locations` is the estate, and is used for one comparison only: whether
  // this reader holds all of it. A manager who does not is told what a
  // chain-wide deal reaches OF THEIRS — never how many branches exist.
  const { granted, scopedLocations, locations, locationName, isMultiLocation } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deals.filter((deal) => {
      if (q && !deal.name.toLowerCase().includes(q)) return false
      // A deal that reaches none of your branches is not yours to read. The
      // unscoped one is the exception: it reaches nobody by definition, and an
      // owner has to be able to find and fix it.
      if (!isRunnable(deal.scope)) return true
      return inScope.some((l) => runsAt(deal.scope, l.id))
    })
  }, [deals, query, inScope])

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="font-medium text-2xl text-foreground leading-8">Deals</h1>
            <p className="text-muted-foreground text-sm">
              Offers and discounts, and the locations each one runs at.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem disabled>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* It was disabled, which on a list page's primary action reads as
                broken rather than as "not yet". A deal needs a name, an offer
                and somewhere to run — the third is this ticket's, and leaving
                the first two out is what made the button dead. */}
            <Button radius="full" onClick={() => setEditing({ deal: null })}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto">
        <TableToolbar
          actions={
            <>
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by deal name"
                aria-label="Search deals"
                onValueChange={setQuery}
              />
              <Button variant="outline" size="icon-sm" radius="full" aria-label="Filter" disabled>
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </>
          }
        />

        {visible.length === 0 ? (
          <EmptyState
            variant="card"
            icon={TagIcon}
            title="No deals run at your locations"
            description="A deal scoped to another branch is not shown here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead className="min-w-28">Status</TableHead>
                <TableHead className="min-w-40">Runs</TableHead>
                {isMultiLocation ? <TableHead className="min-w-48">Locations</TableHead> : null}
                <TableHead className="min-w-28 text-right">Redeemed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((deal) => {
                const runnable = isRunnable(deal.scope)
                const mine = reaches(deal.scope, inScope)
                return (
                  <TableRow
                    key={deal.id}
                    className="group cursor-pointer"
                    onClick={() => setEditing({ deal })}
                  >
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                          <TagIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground text-sm">
                            {deal.name}
                          </p>
                          <p className="text-muted-foreground text-sm">{deal.offer}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deal.status === "live"
                            ? "primary-soft"
                            : deal.status === "scheduled"
                              ? "outline"
                              : "secondary"
                        }
                        size="sm"
                      >
                        {DEAL_STATUS_LABEL[deal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{deal.runs}</TableCell>
                    {isMultiLocation ? (
                      <TableCell>
                        {runnable ? (
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-foreground text-sm">
                              {describeScope(deal.scope, locationName)}
                            </span>
                            {/* What it reaches of YOURS. A manager holding one
                                branch is not told the chain-wide deal also runs
                                at eight others (R18). */}
                            {deal.scope.kind === "estate" && inScope.length < locations.length ? (
                              <span className="text-muted-foreground text-xs">
                                including {mine.length} of yours
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          // Said out loud, because the alternative reading —
                          // an empty list meaning everywhere — is the defect
                          // R24 exists to prevent.
                          <span className="text-cami-tomato-11 text-sm">
                            No locations — cannot run
                          </span>
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right text-foreground text-sm tabular-nums">
                      {deal.redemptions.toLocaleString("en-US")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {editing ? (
        <DealScopeDialog
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null)
          }}
          deal={editing.deal}
          onSave={({ name, offer, scope }) => {
            const target = editing.deal
            setDeals((current) =>
              target
                ? current.map((d) => (d.id === target.id ? { ...d, scope } : d))
                : [
                    {
                      id: `deal-${Date.now()}`,
                      name,
                      offer,
                      status: "scheduled" as const,
                      runs: "Not scheduled yet",
                      scope,
                      redemptions: 0,
                    },
                    ...current,
                  ],
            )
            setEditing(null)
          }}
        />
      ) : null}
    </AppShell>
  )
}
