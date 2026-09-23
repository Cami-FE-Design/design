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
import { formatAed } from "@/lib/format"
import { type Package, priceLabel, sessionsLabel, VALID_FOR_LABEL } from "@/lib/packages/catalog"
import { usePackages } from "@/lib/packages/store"

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
          <TableHead className="min-w-32">Sessions</TableHead>
          <TableHead className="min-w-32">Valid for</TableHead>
          <TableHead className="min-w-32">Sold online</TableHead>
          <TableHead className="min-w-28 text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => {
          const price = priceLabel(pkg)
          return (
            <TableRow key={pkg.id} className="group cursor-pointer" onClick={() => onRowClick(pkg)}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: pkg.colour }}
                  >
                    <CalendarClockIcon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{pkg.name}</p>
                    {/* The services themselves, not a count of them — the row
                        is scanned for "is the groom in it". */}
                    <p className="truncate text-sm text-muted-foreground">
                      {pkg.services.join(", ")}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{sessionsLabel(pkg)}</TableCell>
              {/* A recurring package has no expiry to print; it runs until it
                  is cancelled, and a dash there reads as missing data. */}
              <TableCell className="text-sm text-muted-foreground">
                {pkg.payment === "recurring"
                  ? "Subscription"
                  : pkg.validFor
                    ? VALID_FOR_LABEL[pkg.validFor]
                    : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pkg.onlineSales ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap text-foreground">
                {formatAed(Math.round(price.amountMinor / 100))}
                {price.suffix ? (
                  <span className="block text-xs text-muted-foreground">{price.suffix}</span>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  const { packages, dirty, reset } = usePackages()
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<PackageFilters>(DEFAULT_PACKAGE_FILTERS)
  const [selected, setSelected] = useState<Package | null>(null)

  // Name or a service it covers — "which package has the groom in it" is the
  // search somebody actually runs.
  const q = query.trim().toLowerCase()
  const visible = q
    ? packages.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.services.some((svc) => svc.toLowerCase().includes(q)),
      )
    : packages

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
                {/* /catalogs/packages/sold is not routed yet, so this went to a
                    404. Disabled rather than removed: the action belongs in the
                    menu, it just has nowhere to go until that page exists. */}
                <DropdownMenuItem disabled>View sold packages</DropdownMenuItem>
                {dirty ? (
                  <DropdownMenuItem onSelect={reset}>Reset demo packages</DropdownMenuItem>
                ) : null}
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
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto">
        <TableToolbar
          actions={
            <>
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by name or service"
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
