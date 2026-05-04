"use client"

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo } from "react"
import { AdminShell } from "@/components/blocks/admin-shell"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type AdminBusiness,
  adminBusinesses,
  type BusinessState,
  formatAed,
  formatDate,
  relativeTime,
  stateBadge,
} from "@/lib/admin-businesses"
import { cn } from "@/lib/utils"

type StateFilter = "all" | BusinessState
type SortKey = "name" | "owner" | "weekly" | "createdAt" | "lastActivity"
type SortDir = "asc" | "desc"

const tabs: { id: StateFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "onboarding", label: "Onboarding" },
  { id: "live", label: "Live" },
  { id: "suspended", label: "Suspended" },
  { id: "archived", label: "Archived" },
]

const SORT_KEYS: SortKey[] = ["name", "owner", "weekly", "createdAt", "lastActivity"]
const DEFAULT_SORT: SortKey = "lastActivity"
const DEFAULT_DIR: SortDir = "desc"

function isStateFilter(v: string | null): v is StateFilter {
  return v === "all" || v === "onboarding" || v === "live" || v === "suspended" || v === "archived"
}

function isSortKey(v: string | null): v is SortKey {
  return v !== null && (SORT_KEYS as string[]).includes(v)
}

function compareBy(a: AdminBusiness, b: AdminBusiness, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name)
    case "owner":
      return a.ownerName.localeCompare(b.ownerName)
    case "weekly":
      return a.weekly.markPaidAed - b.weekly.markPaidAed
    case "createdAt":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    case "lastActivity":
      return (
        (a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0) -
        (b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0)
      )
  }
}

function BusinessAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-sm font-medium text-cami-violet-11"
    >
      {initials}
    </span>
  )
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onChange,
  hint,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onChange: (key: SortKey) => void
  hint?: string
}) {
  const active = current === sortKey
  const Icon = !active ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <button
      type="button"
      onClick={() => onChange(sortKey)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-foreground",
      )}
      aria-label={`Sort by ${label}${active ? ` (${dir === "asc" ? "ascending" : "descending"})` : ""}`}
    >
      <span>{label}</span>
      {hint ? (
        <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground">
          {hint}
        </span>
      ) : null}
      <Icon
        className={cn(
          "size-3.5 shrink-0 transition-opacity",
          active ? "opacity-100" : "opacity-40 group-hover:opacity-80",
        )}
      />
    </button>
  )
}

function WeeklyCell({ weekly }: { weekly: AdminBusiness["weekly"] }) {
  const empty = weekly.bookings === 0 && weekly.invoices === 0 && weekly.markPaidAed === 0
  if (empty) {
    return <span className="text-sm text-muted-foreground/70">No activity</span>
  }
  return (
    <div className="flex flex-col text-sm tabular-nums">
      <span className="font-medium text-foreground">AED {formatAed(weekly.markPaidAed)}</span>
      <span className="text-muted-foreground">
        {weekly.bookings} {weekly.bookings === 1 ? "booking" : "bookings"}, {weekly.invoices}{" "}
        {weekly.invoices === 1 ? "invoice" : "invoices"}
      </span>
    </div>
  )
}

function BusinessRow({ business }: { business: AdminBusiness }) {
  const router = useRouter()
  const href = `/admin/businesses/${business.slug}`
  const state = stateBadge(business.state)
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href)
      }}
      tabIndex={0}
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <BusinessAvatar name={business.name} />
          <div className="flex min-w-0 flex-col">
            <Link
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {business.name}
            </Link>
            <span className="truncate font-mono text-xs text-muted-foreground">
              cami.app/{business.slug}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-foreground">{business.ownerName}</span>
          <span className="truncate text-sm text-muted-foreground">{business.ownerEmail}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={state.className}>{state.label}</Badge>
      </TableCell>
      <TableCell>
        <WeeklyCell weekly={business.weekly} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground tabular-nums">
        {formatDate(business.createdAt)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {relativeTime(business.lastActivityAt)}
      </TableCell>
      <TableCell className="w-12 pr-3 text-right text-muted-foreground">
        <ChevronRightIcon className="ml-auto size-4" />
      </TableCell>
    </TableRow>
  )
}

function BusinessesTable({
  businesses,
  sort,
  dir,
  onSortChange,
}: {
  businesses: AdminBusiness[]
  sort: SortKey
  dir: SortDir
  onSortChange: (key: SortKey) => void
}) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No Pet Businesses match</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different tab or clear the search.
        </p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <SortableHeader
              label="Business"
              sortKey="name"
              current={sort}
              dir={dir}
              onChange={onSortChange}
            />
          </TableHead>
          <TableHead>
            <SortableHeader
              label="Owner"
              sortKey="owner"
              current={sort}
              dir={dir}
              onChange={onSortChange}
            />
          </TableHead>
          <TableHead>State</TableHead>
          <TableHead>
            <SortableHeader
              label="This week"
              hint="AED"
              sortKey="weekly"
              current={sort}
              dir={dir}
              onChange={onSortChange}
            />
          </TableHead>
          <TableHead>
            <SortableHeader
              label="Pilot start"
              sortKey="createdAt"
              current={sort}
              dir={dir}
              onChange={onSortChange}
            />
          </TableHead>
          <TableHead>
            <SortableHeader
              label="Last activity"
              sortKey="lastActivity"
              current={sort}
              dir={dir}
              onChange={onSortChange}
            />
          </TableHead>
          <TableHead className="w-12 sr-only">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((business) => (
          <BusinessRow key={business.id} business={business} />
        ))}
      </TableBody>
    </Table>
  )
}

function BusinessesIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab")
  const tab: StateFilter = isStateFilter(tabParam) ? tabParam : "all"
  const query = searchParams.get("q") ?? ""
  const sortParam = searchParams.get("sort")
  const sort: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT
  const dirParam = searchParams.get("dir")
  const dir: SortDir = dirParam === "asc" ? "asc" : DEFAULT_DIR

  const updateParams = useCallback(
    (next: Partial<{ tab: string; q: string; sort: string; dir: string }>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(next)) {
        if (v === "" || v === null || v === undefined) {
          params.delete(k)
        } else {
          params.set(k, v)
        }
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  function handleTabChange(next: string) {
    updateParams({ tab: next === "all" ? "" : next })
  }

  function handleQueryChange(next: string) {
    updateParams({ q: next })
  }

  function handleSortChange(key: SortKey) {
    if (key === sort) {
      updateParams({ dir: dir === "asc" ? "desc" : "asc" })
    } else {
      updateParams({ sort: key, dir: "desc" })
    }
  }

  const counts = useMemo(() => {
    const base = { all: adminBusinesses.length, onboarding: 0, live: 0, suspended: 0, archived: 0 }
    for (const b of adminBusinesses) base[b.state] += 1
    return base
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = adminBusinesses.filter((b) => {
      if (tab !== "all" && b.state !== tab) return false
      if (!q) return true
      return (
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.ownerEmail.toLowerCase().includes(q)
      )
    })
    const sorted = [...filtered].sort((a, b) => {
      const cmp = compareBy(a, b, sort)
      return dir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [tab, query, sort, dir])

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Pet Businesses</h1>
            <p className="text-sm text-muted-foreground">
              {counts.all} pilot {counts.all === 1 ? "account" : "accounts"} on Cami
            </p>
          </div>
          <Button asChild radius="full">
            <Link href="/admin/businesses/new">
              <PlusIcon />
              New Pet Business
            </Link>
          </Button>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                {tabs.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                    <span
                      className={cn(
                        "text-sm font-normal text-muted-foreground",
                        tab === t.id && "text-foreground/70",
                      )}
                    >
                      {counts[t.id]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            }
            actions={
              <>
                <SearchInput
                  placeholder="Search by name, slug, owner"
                  aria-label="Search Pet Businesses"
                  defaultValue={query}
                  onValueChange={handleQueryChange}
                />
                <Button variant="outline" aria-label="Filter" className="size-8 rounded-full">
                  <SlidersHorizontalIcon className="size-4" />
                </Button>
              </>
            }
          />
          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <BusinessesTable
                businesses={visible}
                sort={sort}
                dir={dir}
                onSortChange={handleSortChange}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminShell>
  )
}

export default function BusinessesIndexPage() {
  return (
    <Suspense fallback={null}>
      <BusinessesIndex />
    </Suspense>
  )
}
