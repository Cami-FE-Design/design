"use client"

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ImportIcon,
  PawPrintIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  UploadIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"

import { AppShell } from "@/components/blocks/app-shell"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
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
import { formatDate, formatRelative, MOCK_PETS, type MockPet } from "./mock"

type SortKey = "name" | "lastVisit" | "totalVisits" | "createdAt"
type SortDir = "asc" | "desc"

const SORT_OPTIONS: Array<{ key: SortKey; dir: SortDir; label: string }> = [
  { key: "name", dir: "asc", label: "Name (A-Z)" },
  { key: "name", dir: "desc", label: "Name (Z-A)" },
  { key: "lastVisit", dir: "desc", label: "Last visit (newest first)" },
  { key: "lastVisit", dir: "asc", label: "Last visit (oldest first)" },
  { key: "totalVisits", dir: "desc", label: "Total visits (high to low)" },
  { key: "totalVisits", dir: "asc", label: "Total visits (low to high)" },
  { key: "createdAt", dir: "desc", label: "Created (newest first)" },
  { key: "createdAt", dir: "asc", label: "Created (oldest first)" },
]

const DEFAULT_SORT_KEY: SortKey = "lastVisit"
const DEFAULT_SORT_DIR: SortDir = "desc"
const PAGE_SIZE = 25

function isSortKey(v: string | null): v is SortKey {
  return v === "name" || v === "lastVisit" || v === "totalVisits" || v === "createdAt"
}
function isSortDir(v: string | null): v is SortDir {
  return v === "asc" || v === "desc"
}

function compareBy(a: MockPet, b: MockPet, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name)
    case "totalVisits":
      return a.totalVisits - b.totalVisits
    case "createdAt":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    case "lastVisit": {
      const av = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0
      const bv = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0
      return av - bv
    }
  }
}

function sortLabel(key: SortKey, dir: SortDir): string {
  return SORT_OPTIONS.find((o) => o.key === key && o.dir === dir)?.label ?? "Sort"
}

function OwnersCell({ owners, seed }: { owners: MockPet["owners"]; seed: string }) {
  if (owners.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }
  const visible = owners.slice(0, 2)
  const overflow = owners.length - visible.length
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((o) => (
        <LinkedEntityChip
          key={o.id}
          name={o.name}
          avatar={{ fallback: "character", hashSeed: seed }}
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

function PetRow({ pet, onOpen }: { pet: MockPet; onOpen: () => void }) {
  const familySeed = pet.familySeed ?? pet.owners[0]?.id ?? pet.id
  return (
    <TableRow
      className="cursor-pointer bg-background hover:bg-muted/40"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen()
      }}
      tabIndex={0}
    >
      <TableCell className="sticky left-0 z-10 w-[260px] bg-inherit py-3">
        <div className="flex items-center gap-3">
          <Avatar size="md" fallback="species" species={pet.species} hashSeed={familySeed} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{pet.name}</span>
            <span className="truncate text-xs text-muted-foreground">{pet.breed}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">
        <OwnersCell owners={pet.owners} seed={familySeed} />
      </TableCell>
      <TableCell className="text-sm text-foreground tabular-nums">
        {formatRelative(pet.lastVisitDate)}
      </TableCell>
      <TableCell className="text-sm text-foreground tabular-nums">{pet.totalVisits}</TableCell>
      <TableCell className="text-sm text-muted-foreground tabular-nums">
        {formatDate(pet.createdAt)}
      </TableCell>
    </TableRow>
  )
}

function PetsIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get("q") ?? ""
  const sortParam = searchParams.get("sort")
  const sort: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT_KEY
  const dirParam = searchParams.get("dir")
  const dir: SortDir = isSortDir(dirParam) ? dirParam : DEFAULT_SORT_DIR
  const openPetId = searchParams.get("pet")
  const addOpen = searchParams.get("add") === "1"

  const updateParams = useCallback(
    (
      next: Partial<{
        q: string
        sort: string
        dir: string
        pet: string
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
    updateParams({ pet: id })
  }

  function handleClose() {
    updateParams({ pet: "" })
  }

  function setAddOpen(next: boolean) {
    updateParams({ add: next ? "1" : "" })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = MOCK_PETS.filter((p) => {
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.owners.some((o) => o.name.toLowerCase().includes(q))
      )
    })
    const sorted = [...filtered].sort((a, b) => {
      const cmp = compareBy(a, b, sort)
      return dir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [query, sort, dir])

  const openPet = useMemo(
    () => (openPetId ? (MOCK_PETS.find((p) => p.id === openPetId) ?? null) : null),
    [openPetId],
  )

  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const selectedOwner = useMemo(() => {
    if (!selectedOwnerId) return null
    for (const pet of MOCK_PETS) {
      const o = pet.owners.find((o) => o.id === selectedOwnerId)
      if (o) return o
    }
    return null
  }, [selectedOwnerId])

  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const shown = visible.slice(0, shownCount)
  const hasMore = shownCount < visible.length
  const lastRow = shown[shown.length - 1]

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Pets</h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_PETS.length} {MOCK_PETS.length === 1 ? "pet" : "pets"}
            </p>
          </div>
          {/* Actions group. Without the wrapper, justify-between strands Options
              in the middle of the header instead of beside Add pet. */}
          <div className="flex items-center gap-2">
            {/* Same Options menu as clients and products (DSG-84). */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/clients/import?entity=pets">
                    <ImportIcon className="size-4" />
                    Import pets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UploadIcon className="size-4" />
                  Export pets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button radius="full" onClick={() => setAddOpen(true)}>
              <PlusIcon />
              Add pet
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
                placeholder="Name, breed or owner"
                aria-label="Search pets"
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
          <EmptyState
            variant="card"
            icon={PawPrintIcon}
            title="No pets match"
            description="Try a different search."
          />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 w-[260px] bg-background shadow-[1px_0_0_0_var(--border)]">
                  <SortableHeader
                    label="Pet"
                    sortKey="name"
                    current={sort}
                    dir={dir}
                    onChange={handleSortHeader}
                  />
                </TableHead>
                <TableHead>Owners</TableHead>
                <TableHead>
                  <SortableHeader
                    label="Last visit"
                    sortKey="lastVisit"
                    current={sort}
                    dir={dir}
                    onChange={handleSortHeader}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Visits"
                    sortKey="totalVisits"
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
              {shown.map((pet) => (
                <PetRow key={pet.id} pet={pet} onOpen={() => handleOpen(pet.id)} />
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

      {openPet ? (
        <PetDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) handleClose()
          }}
          pet={{
            id: openPet.id,
            name: openPet.name,
            species: openPet.species,
            breed: openPet.breed,
          }}
          owners={openPet.owners.map((o) => ({ id: o.id, name: o.name, phone: o.phone }))}
          onSelectOwner={setSelectedOwnerId}
        />
      ) : null}

      {selectedOwner ? (
        <ClientDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setSelectedOwnerId(null)
          }}
          client={{ id: selectedOwner.id, name: selectedOwner.name, phone: selectedOwner.phone }}
        />
      ) : null}

      <PetEditSheet open={addOpen} onOpenChange={setAddOpen} mode="add" />
    </AppShell>
  )
}

export default function PetsIndexPage() {
  return (
    <Suspense fallback={null}>
      <PetsIndex />
    </Suspense>
  )
}
