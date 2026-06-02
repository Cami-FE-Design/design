"use client"

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"

import { AppShell } from "@/components/blocks/app-shell"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Avatar } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"
import { formatAed, formatDate, MOCK_CLIENTS, type MockClient } from "./mock"

type SortKey = "name" | "sales" | "createdAt"
type SortDir = "asc" | "desc"

type Mode = "with-pets" | "without-pets"

const SORT_OPTIONS: Array<{ key: SortKey; dir: SortDir; label: string }> = [
  { key: "name", dir: "asc", label: "First name (A-Z)" },
  { key: "name", dir: "desc", label: "First name (Z-A)" },
  { key: "sales", dir: "desc", label: "Sales (high to low)" },
  { key: "sales", dir: "asc", label: "Sales (low to high)" },
  { key: "createdAt", dir: "desc", label: "Created (newest first)" },
  { key: "createdAt", dir: "asc", label: "Created (oldest first)" },
]

const DEFAULT_SORT_KEY: SortKey = "createdAt"
const DEFAULT_SORT_DIR: SortDir = "desc"
const PAGE_SIZE = 25

function isSortKey(v: string | null): v is SortKey {
  return v === "name" || v === "sales" || v === "createdAt"
}

function isSortDir(v: string | null): v is SortDir {
  return v === "asc" || v === "desc"
}

function compareBy(a: MockClient, b: MockClient, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name)
    case "sales":
      return a.salesAed - b.salesAed
    case "createdAt":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  }
}

function sortLabel(key: SortKey, dir: SortDir): string {
  return SORT_OPTIONS.find((o) => o.key === key && o.dir === dir)?.label ?? "Sort"
}

function PetsCell({ pets, familySeed }: { pets: MockClient["pets"]; familySeed: string }) {
  if (pets.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }
  const visible = pets.slice(0, 2)
  const overflow = pets.length - visible.length
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((pet) => (
        <LinkedEntityChip
          key={pet.id}
          name={pet.name}
          avatar={{ species: pet.species, hashSeed: familySeed, fallback: "species" }}
        />
      ))}
      {overflow > 0 ? (
        <span className="text-xs font-medium text-muted-foreground">+{overflow}</span>
      ) : null}
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onChange,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onChange: (key: SortKey) => void
}) {
  const isActive = current === sortKey
  const Icon = !isActive ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <button
      type="button"
      onClick={() => onChange(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}

function ClientRow({
  client,
  hasPets,
  onOpen,
}: {
  client: MockClient
  hasPets: boolean
  onOpen: () => void
}) {
  return (
    <TableRow
      className="cursor-pointer bg-background"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen()
      }}
      tabIndex={0}
    >
      <TableCell className="sticky left-0 z-10 w-[260px] bg-background py-3 shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
        <div className="flex items-center gap-3">
          <Avatar size="md" fallback="character" name={client.name} hashSeed={client.id} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{client.name}</span>
            {client.email ? (
              <span className="truncate text-xs text-muted-foreground">{client.email}</span>
            ) : null}
          </div>
        </div>
      </TableCell>
      {hasPets ? (
        <TableCell className="text-sm">
          <PetsCell pets={client.pets} familySeed={client.id} />
        </TableCell>
      ) : null}
      <TableCell className="text-sm text-foreground tabular-nums">
        {client.phone ?? <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-sm text-foreground tabular-nums">
        {formatAed(client.salesAed)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground tabular-nums">
        {formatDate(client.createdAt)}
      </TableCell>
    </TableRow>
  )
}

function ClientsIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const modeParam = searchParams.get("mode")
  const mode: Mode = modeParam === "without-pets" ? "without-pets" : "with-pets"
  const hasPets = mode === "with-pets"

  const query = searchParams.get("q") ?? ""
  const sortParam = searchParams.get("sort")
  const sort: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT_KEY
  const dirParam = searchParams.get("dir")
  const dir: SortDir = isSortDir(dirParam) ? dirParam : DEFAULT_SORT_DIR
  const openClientId = searchParams.get("client")

  const updateParams = useCallback(
    (
      next: Partial<{
        mode: string
        q: string
        sort: string
        dir: string
        client: string
        add: string
      }>,
    ) => {
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

  function handleQueryChange(next: string) {
    updateParams({ q: next })
  }

  function handleSortHeader(key: SortKey) {
    if (key === sort) {
      updateParams({ dir: dir === "asc" ? "desc" : "asc" })
    } else {
      updateParams({ sort: key, dir: key === "name" ? "asc" : "desc" })
    }
  }

  function handleSortPick(key: SortKey, nextDir: SortDir) {
    updateParams({ sort: key, dir: nextDir })
  }

  function handleOpen(id: string) {
    updateParams({ client: id })
  }

  function handleClose() {
    updateParams({ client: "" })
  }

  function handleModeChange(next: Mode) {
    updateParams({ mode: next === "with-pets" ? "" : next })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = MOCK_CLIENTS.filter((c) => {
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.pets.some((p) => p.name.toLowerCase().includes(q))
      )
    })
    const sorted = [...filtered].sort((a, b) => {
      const cmp = compareBy(a, b, sort)
      return dir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [query, sort, dir])

  const openClient = useMemo(
    () => (openClientId ? (MOCK_CLIENTS.find((c) => c.id === openClientId) ?? null) : null),
    [openClientId],
  )

  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const shown = visible.slice(0, shownCount)
  const hasMore = shownCount < visible.length
  const lastRow = shown[shown.length - 1]
  const addOpen = searchParams.get("add") === "1"
  function setAddOpen(next: boolean) {
    updateParams({ add: next ? "1" : "" })
  }

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_CLIENTS.length} {MOCK_CLIENTS.length === 1 ? "client" : "clients"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" radius="full" size="sm">
                  Mode: {hasPets ? "with pets" : "without pets"}
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleModeChange("with-pets")}>
                  With pets
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleModeChange("without-pets")}>
                  Without pets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button radius="full" onClick={() => setAddOpen(true)}>
              <PlusIcon />
              Add client
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <TableToolbar
          tabs={
            <div className="flex items-center gap-2">
              <SearchInput
                className="!h-9 w-72"
                placeholder="Name, email or phone"
                aria-label="Search clients"
                defaultValue={query}
                onValueChange={handleQueryChange}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                radius="full"
                aria-label="Filters"
              >
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </div>
          }
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" radius="full" size="sm">
                  {sortLabel(sort, dir)}
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={`${opt.key}-${opt.dir}`}
                    onSelect={() => handleSortPick(opt.key, opt.dir)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No clients match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
          </div>
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 w-[260px] bg-background shadow-[1px_0_0_0_var(--border)]">
                  <SortableHeader
                    label="Client"
                    sortKey="name"
                    current={sort}
                    dir={dir}
                    onChange={handleSortHeader}
                  />
                </TableHead>
                {hasPets ? <TableHead>Pets</TableHead> : null}
                <TableHead>Mobile</TableHead>
                <TableHead>
                  <SortableHeader
                    label="Sales"
                    sortKey="sales"
                    current={sort}
                    dir={dir}
                    onChange={handleSortHeader}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Created"
                    sortKey="createdAt"
                    current={sort}
                    dir={dir}
                    onChange={handleSortHeader}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  hasPets={hasPets}
                  onOpen={() => handleOpen(client.id)}
                />
              ))}
            </TableBody>
          </Table>
        )}
        {visible.length > 0 ? (
          <div className="flex flex-col items-center gap-3 py-2 text-sm text-muted-foreground">
            <span>
              Showing {shown.length} {shown.length === 1 ? "result" : "results"}
              {lastRow ? ` through ${formatDate(lastRow.createdAt)}` : null}.
            </span>
            {hasMore ? (
              <Button
                type="button"
                variant="outline"
                radius="full"
                size="sm"
                onClick={() => setShownCount((c) => c + PAGE_SIZE)}
              >
                Load more
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {openClient ? (
        <ClientDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) handleClose()
          }}
          client={{
            id: openClient.id,
            name: openClient.name,
            phone: openClient.phone,
          }}
          hasPets={hasPets}
          onSelectOwner={(ownerId) => {
            updateParams({ client: ownerId })
          }}
        />
      ) : null}

      <ClientEditSheet open={addOpen} onOpenChange={setAddOpen} mode="add" hasPets={hasPets} />
    </AppShell>
  )
}

export default function ClientsIndexPage() {
  return (
    <Suspense fallback={null}>
      <ClientsIndex />
    </Suspense>
  )
}
