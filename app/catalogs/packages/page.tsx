"use client"

import { CalendarClockIcon, ChevronDownIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { PackageDetailDialog } from "@/components/blocks/package-detail-dialog"
import {
  DEFAULT_PACKAGE_FILTERS,
  type PackageFilters,
  PackageFiltersDialog,
} from "@/components/blocks/package-filters-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
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

// ─── Mock data ──────────────────────────────────────────────────────────────────

type Package = {
  id: string
  name: string
  serviceCount: number
  validFor: string
  sessions: string
  price: number
  /** Card colour (softened hue). */
  color: string
}

const MOCK_PACKAGES: Package[] = [
  {
    id: "bath-brush-5",
    name: "Bath & Brush 5+1",
    serviceCount: 1,
    validFor: "1 year",
    sessions: "6 sessions",
    price: 450,
    color: "#6aa3e0",
  },
  {
    id: "full-groom-3",
    name: "Full Groom 3+1",
    serviceCount: 1,
    validFor: "6 months",
    sessions: "4 sessions",
    price: 720,
    color: "#9b8bd6",
  },
  {
    id: "puppy-starter",
    name: "Puppy Starter Pack",
    serviceCount: 3,
    validFor: "3 months",
    sessions: "5 sessions",
    price: 600,
    color: "#66bb8a",
  },
  {
    id: "nail-trim-10",
    name: "Nail Trim 10-pack",
    serviceCount: 1,
    validFor: "1 year",
    sessions: "10 sessions",
    price: 250,
    color: "#e8c25e",
  },
  {
    id: "spa-day-4",
    name: "Spa Day x4",
    serviceCount: 2,
    validFor: "6 months",
    sessions: "4 sessions",
    price: 560,
    color: "#d782b4",
  },
  {
    id: "deshed-monthly",
    name: "De-shed Monthly",
    serviceCount: 1,
    validFor: "Until canceled",
    sessions: "Unlimited",
    price: 130,
    color: "#6aa3e0",
  },
  {
    id: "cat-groom-3",
    name: "Cat Groom 3+1",
    serviceCount: 1,
    validFor: "6 months",
    sessions: "4 sessions",
    price: 700,
    color: "#e89177",
  },
  {
    id: "aroma-5",
    name: "Aromatherapy Spa x5",
    serviceCount: 1,
    validFor: "1 year",
    sessions: "5 sessions",
    price: 700,
    color: "#9b8bd6",
  },
]

function formatPrice(n: number): string {
  return `AED ${n.toLocaleString("en-US")}`
}

// ─── Table ──────────────────────────────────────────────────────────────────────

function PackagesTable({
  packages,
  onRowClick,
}: {
  packages: Package[]
  onRowClick: (pkg: Package) => void
}) {
  if (packages.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={CalendarClockIcon}
        title="No packages match"
        description="Try a different search."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Package name</TableHead>
          <TableHead className="min-w-32">Valid for</TableHead>
          <TableHead className="min-w-32">Sessions</TableHead>
          <TableHead className="min-w-28 text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id} className="group cursor-pointer" onClick={() => onRowClick(pkg)}>
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: pkg.color }}
                >
                  <CalendarClockIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{pkg.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pkg.serviceCount} service{pkg.serviceCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{pkg.validFor}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{pkg.sessions}</TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap text-foreground">
              {formatPrice(pkg.price)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<PackageFilters>(DEFAULT_PACKAGE_FILTERS)
  const [selected, setSelected] = useState<Package | null>(null)

  const visible = query.trim()
    ? MOCK_PACKAGES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : MOCK_PACKAGES

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <h1 className="text-2xl leading-8 font-medium text-foreground">Packages</h1>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/catalogs/packages/sold">View sold packages</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild radius="full">
              <Link href="/catalogs/packages/new">
                <PlusIcon className="size-4" />
                Add
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <TableToolbar
          actions={
            <>
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by package name"
                aria-label="Search packages"
                onValueChange={setQuery}
              />
              <Button
                variant="outline"
                size="icon-sm"
                radius="full"
                aria-label="Filter"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </>
          }
        />

        <PackagesTable packages={visible} onRowClick={setSelected} />
      </div>

      <PackageFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filters}
        onApply={setFilters}
      />

      <PackageDetailDialog
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        pkg={selected}
      />
    </AppShell>
  )
}
