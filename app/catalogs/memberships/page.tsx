"use client"

import {
  CalendarClockIcon,
  ChevronDownIcon,
  ListIcon,
  PlusIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import {
  type Membership,
  MembershipsTable,
  MOCK_MEMBERSHIPS,
} from "@/components/blocks/memberships-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MembershipsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="flex h-9 items-center gap-4 border-b border-border/60 bg-muted/30 px-4">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 5 }, (_, i) => `row-${i}`).map((key, i) => (
        <div
          key={key}
          className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5 last:border-b-0"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <div className="size-12 animate-pulse rounded-xl bg-muted" />
          <div className="h-3 w-44 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembershipsPage() {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  // Prototype toggle: switch between empty and populated state
  const [showEmpty, setShowEmpty] = useState(false)

  // Simulate a brief load on mount
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400)
    return () => clearTimeout(t)
  }, [])

  const memberships: Membership[] = showEmpty ? [] : MOCK_MEMBERSHIPS

  const visible = query.trim()
    ? memberships.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : memberships

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Memberships</h1>
            <p className="text-sm text-muted-foreground">
              Sell recurring service packages to your clients
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-52">
                <DropdownMenuItem className="whitespace-nowrap">
                  <ListIcon className="size-4" />
                  Reorder
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="whitespace-nowrap">
                  <Link href="/sales/memberships-sold">
                    <TrendingUpIcon className="size-4" />
                    View sold memberships
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="whitespace-nowrap">
                  <Settings2Icon className="size-4" />
                  Upsell settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add membership */}
            <Button asChild radius="full">
              <Link href="/catalogs/memberships/new">
                <PlusIcon className="size-4" />
                Add
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        {isLoading ? (
          <>
            {/* Skeleton toolbar — search + filter on the left */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-56 animate-pulse rounded-full bg-muted" />
              <div className="size-8 animate-pulse rounded-full bg-muted" />
            </div>
            <MembershipsSkeleton />
          </>
        ) : memberships.length === 0 ? (
          /* Empty state — header already has Add, no duplicate CTA here */
          <EmptyState
            icon={CalendarClockIcon}
            title="No memberships yet"
            description="Create your first membership to get started"
            className="py-24"
          />
        ) : (
          <>
            {/* No tabs — search + filter sit on the left */}
            <div className="flex items-center gap-2">
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by membership name"
                aria-label="Search memberships"
                onValueChange={setQuery}
              />
              <Button variant="outline" size="icon-sm" radius="full" aria-label="Filter">
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                variant="card"
                icon={CalendarClockIcon}
                title="No memberships match"
                description="Try a different search."
              />
            ) : (
              <MembershipsTable
                memberships={visible}
                onRowClick={(id) => router.push(`/catalogs/memberships/${id}/edit`)}
              />
            )}
          </>
        )}

        {/* Prototype demo toggle */}
        {!isLoading && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowEmpty((v) => !v)}
              className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              {showEmpty ? "Show populated state" : "Show empty state"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
