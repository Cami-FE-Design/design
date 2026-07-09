"use client"

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  Building2Icon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { AdminShell } from "@/components/blocks/admin-shell"
import { BusinessDetailDialog } from "@/components/blocks/business-detail-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { NewBusinessSheet } from "@/components/blocks/new-business-sheet"
import { StateDropdown } from "@/components/blocks/state-dropdown"
import { TableToolbar } from "@/components/blocks/table-toolbar"
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
  stateLabel,
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

function OwnerAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={56}
        height={56}
        className="size-7 shrink-0 rounded-full object-cover"
        unoptimized
      />
    )
  }
  const initial = name.trim().charAt(0).toUpperCase()
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white"
    >
      {initial}
    </span>
  )
}

function BusinessAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={72}
        height={72}
        className="size-9 shrink-0 rounded-xl object-cover"
        unoptimized
      />
    )
  }
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

function BusinessRow({
  business,
  onOpen,
  onStateChange,
}: {
  business: AdminBusiness
  onOpen: () => void
  onStateChange: (next: BusinessState) => void
}) {
  return (
    <TableRow
      className="cursor-pointer"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen()
      }}
      tabIndex={0}
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <BusinessAvatar name={business.name} photoUrl={business.photoUrl} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{business.name}</span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              cami.app/{business.slug}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2.5">
          <OwnerAvatar name={business.ownerName} photoUrl={business.ownerPhotoUrl} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-foreground">{business.ownerName}</span>
            <span className="truncate text-sm text-muted-foreground">{business.ownerEmail}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StateDropdown state={business.state} onChange={onStateChange} inset />
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
    </TableRow>
  )
}

function BusinessesTable({
  businesses,
  sort,
  dir,
  onSortChange,
  onOpen,
  onStateChange,
}: {
  businesses: AdminBusiness[]
  sort: SortKey
  dir: SortDir
  onSortChange: (key: SortKey) => void
  onOpen: (slug: string) => void
  onStateChange: (id: string, next: BusinessState) => void
}) {
  if (businesses.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={Building2Icon}
        title="No partners match"
        description="Try a different tab or clear the search."
      />
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
              label="Partner since"
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((business) => (
          <BusinessRow
            key={business.id}
            business={business}
            onOpen={() => onOpen(business.slug)}
            onStateChange={(next) => onStateChange(business.id, next)}
          />
        ))}
      </TableBody>
    </Table>
  )
}

function BusinessesIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [overrides, setOverrides] = useState<Record<string, Partial<AdminBusiness>>>({})
  const [newBusinessOpen, setNewBusinessOpen] = useState(false)

  const businesses = useMemo(
    () => adminBusinesses.map((b) => (overrides[b.id] ? { ...b, ...overrides[b.id] } : b)),
    [overrides],
  )

  function patchBusiness(id: string, patch: Partial<AdminBusiness>) {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  function handleStateChange(id: string, next: BusinessState) {
    patchBusiness(id, { state: next, reasonCode: undefined, reasonNote: undefined })
    const business = adminBusinesses.find((b) => b.id === id)
    if (business) {
      toast.success(`${business.name}, ${stateLabel(next).toLowerCase()}`)
    }
  }

  const tabParam = searchParams.get("tab")
  const tab: StateFilter = isStateFilter(tabParam) ? tabParam : "all"
  const query = searchParams.get("q") ?? ""
  const sortParam = searchParams.get("sort")
  const sort: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT
  const dirParam = searchParams.get("dir")
  const dir: SortDir = dirParam === "asc" ? "asc" : DEFAULT_DIR
  const openSlug = searchParams.get("business")

  const updateParams = useCallback(
    (next: Partial<{ tab: string; q: string; sort: string; dir: string; business: string }>) => {
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

  function handleOpen(slug: string) {
    updateParams({ business: slug })
  }

  function handleClose() {
    updateParams({ business: "" })
  }

  const counts = useMemo(() => {
    const base = { all: businesses.length, onboarding: 0, live: 0, suspended: 0, archived: 0 }
    for (const b of businesses) base[b.state] += 1
    return base
  }, [businesses])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = businesses.filter((b) => {
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
  }, [businesses, tab, query, sort, dir])

  const openBusiness = useMemo(
    () => (openSlug ? (businesses.find((b) => b.slug === openSlug) ?? null) : null),
    [openSlug, businesses],
  )

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Partners</h1>
            <p className="text-sm text-muted-foreground">
              {counts.all} {counts.all === 1 ? "partner" : "partners"} on Cami
            </p>
          </div>
          <Button radius="full" onClick={() => setNewBusinessOpen(true)}>
            <PlusIcon />
            New Partner
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
                  placeholder="Search partners"
                  aria-label="Search partners"
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
                onOpen={handleOpen}
                onStateChange={handleStateChange}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <BusinessDetailDialog
        business={openBusiness}
        open={Boolean(openBusiness)}
        onOpenChange={(next) => {
          if (!next) handleClose()
        }}
        onUpdate={(patch) => {
          if (openBusiness) patchBusiness(openBusiness.id, patch)
        }}
        onSlugChange={(_oldSlug, newSlug) => updateParams({ business: newSlug })}
      />

      <NewBusinessSheet open={newBusinessOpen} onOpenChange={setNewBusinessOpen} />
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
