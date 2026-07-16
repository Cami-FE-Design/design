"use client"

// Table View template — renders any table-shaped report from its registry
// definition. Matches the app's list pages (Appointments list / Sales list):
// a TableToolbar (group-by + date + filter left, Sort right), a plain table
// with a sticky first column, an optional Total row, and the page scrolls.
//
// Group-by pill re-slices the data (Sales summary: Type → Item/Team/Location);
// on the top-level dimension the rows drill into the next level with a
// removable filter chip. Entity link cells open shared detail dialogs (Client
// / Pet / Product) or navigate to the source list (Sale no. / Appt. ref.).

import { ArrowUpDownIcon, CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { MOCK_BOOKINGS, MOCK_STAFF, type MockBooking } from "@/app/appointments/mock"
import { MOCK_SALES, type Sale, SaleDetailDialog } from "@/app/sales/sales-list/page"
import { AppointmentDetailSheet } from "@/components/blocks/appointment-detail-sheet"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
import {
  type DateRange,
  DateRangePopover,
  defaultRange,
} from "@/components/blocks/date-range-popover"
import { DateSelector } from "@/components/blocks/date-selector"
import { EmptyState } from "@/components/blocks/empty-state"
import {
  PetDetailDialog,
  type PetDetailOwner,
  type PetDetailPet,
} from "@/components/blocks/pet-detail-dialog"
import { ProductDetailDialog } from "@/components/blocks/product-detail-dialog"
import type { Product } from "@/components/blocks/products-table"
import { ReportFiltersSheet } from "@/components/blocks/reports/report-filters-sheet"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import {
  TeamMemberDetailDialog,
  type TeamMemberDetailMember,
} from "@/components/blocks/team-member-detail-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatAed,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format"
import { MOCK_GROUPED, MOCK_ROWS, PET_DETAILS, type ReportRow } from "@/lib/reports/mock"
import type { ColumnDef, ColumnKind, ReportDef } from "@/lib/reports/types"
import { findTeamMemberByName } from "@/lib/team/mock"
import { cn } from "@/lib/utils"

function isNumericKind(kind?: ColumnKind) {
  return kind === "money" || kind === "number" || kind === "percent"
}

function isSummableKind(kind?: ColumnKind) {
  return kind === "money" || kind === "number" || kind === "duration"
}

function statusVariant(value: string) {
  const v = value.toLowerCase()
  if (v === "completed" || v === "received") return "primary-soft" as const
  if (v === "cancelled" || v === "voided") return "muted" as const
  if (v === "no-show" || v === "refunded" || v === "ordered" || v === "partially received")
    return "warning" as const
  return "secondary" as const
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatCell(column: ColumnDef, value: ReportRow[string]) {
  switch (column.kind ?? "text") {
    case "money":
      return formatAed(Number(value))
    case "number":
      return formatNumber(Number(value))
    case "percent":
      return formatPercent(Number(value))
    case "date":
      return formatDate(String(value))
    case "datetime":
      return formatDateTime(String(value))
    case "duration":
      return formatDuration(Number(value))
    case "boolean":
      return value ? "Yes" : "No"
    default:
      return String(value)
  }
}

function CellValue({
  column,
  value,
  row,
  linkHandlers,
}: {
  column: ColumnDef
  value: ReportRow[string]
  row: ReportRow
  linkHandlers: Record<string, (row: ReportRow) => void>
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>
  }
  const kind = column.kind ?? "text"

  if (kind === "status") {
    return (
      <Badge variant={statusVariant(String(value))} size="md">
        {String(value)}
      </Badge>
    )
  }
  if (kind === "link") {
    const handler = linkHandlers[column.key]
    if (handler) {
      return (
        <button
          type="button"
          onClick={() => handler(row)}
          className="cursor-pointer text-start font-medium text-cami-violet-11 hover:underline"
        >
          {String(value)}
        </button>
      )
    }
    return <span className="font-medium text-cami-violet-11">{String(value)}</span>
  }
  const numeric = kind === "money" || kind === "number"
  return (
    <span className={cn(numeric && Number(value) < 0 && "text-tomato-11")}>
      {formatCell(column, value)}
    </span>
  )
}

function GroupByPill({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {value}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            <CheckIcon className={cn("size-4", value === o ? "opacity-100" : "opacity-0")} />
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function compareValues(a: ReportRow[string], b: ReportRow[string]) {
  if (a === null || a === undefined || a === "") return 1
  if (b === null || b === undefined || b === "") return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b))
}

function TableReportInner({ report }: { report: ReportDef }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const columns = report.columns ?? []
  const groupedData = MOCK_GROUPED[report.id]

  // Drill-through arrivals: any query param matching a column key becomes a
  // removable filter chip and narrows the rows (Appointments summary → list
  // pre-filtered to the clicked location / team member / service).
  const drillFilters = useMemo(() => {
    const out: { key: string; label: string; value: string }[] = []
    for (const [key, value] of searchParams.entries()) {
      const col = columns.find((c) => c.key === key)
      if (col) out.push({ key, label: col.label, value })
    }
    return out
  }, [searchParams, columns])

  function removeDrillFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [range, setRange] = useState<DateRange>(() => defaultRange(today))
  const [singleDate, setSingleDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [groupBySel, setGroupBySel] = useState(report.groupBy?.options[0] ?? "")
  const [drillType, setDrillType] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientDetailClient | null>(null)
  const [selectedPet, setSelectedPet] = useState<{
    pet: PetDetailPet
    owners: PetDetailOwner[]
  } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null)
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMemberDetailMember | null>(null)

  // Rows: pick the group-by dataset if this report has one, then apply the
  // drill filter (Sales summary: clicking "Service" → its items).
  const rows = useMemo(() => {
    const base = groupedData ? (groupedData[groupBySel] ?? []) : (MOCK_ROWS[report.id] ?? [])
    const drilled = drillType ? base.filter((r) => r._group === drillType) : base
    if (drillFilters.length === 0) return drilled
    return drilled.filter((r) => drillFilters.every((f) => String(r[f.key]) === f.value))
  }, [groupedData, groupBySel, drillType, report.id, drillFilters])

  // On the top-level dimension, the first-column rows drill into the next level.
  const canDrill =
    !!groupedData &&
    (report.groupBy?.options.includes("Item") ?? false) &&
    groupBySel === report.groupBy?.options[0]

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((r1, r2) => {
      const c = compareValues(r1[sortKey], r2[sortKey])
      return sortDir === "asc" ? c : -c
    })
  }, [rows, sortKey, sortDir])

  const totals = report.totalRow
    ? columns.map((col) => {
        if (isSummableKind(col.kind)) {
          return rows.reduce((sum, r) => sum + (Number(r[col.key]) || 0), 0)
        }
        // Ratio-percents (e.g. % Occupancy) can't be summed — compute a weighted
        // total from their source columns: Σ numerator ÷ Σ denominator × 100.
        if (col.kind === "percent" && col.totalFrom) {
          const { numerator, denominator } = col.totalFrom
          const num = rows.reduce((s, r) => s + (Number(r[numerator]) || 0), 0)
          const den = rows.reduce((s, r) => s + (Number(r[denominator]) || 0), 0)
          return den ? Math.round((num / den) * 1000) / 10 : null
        }
        return null
      })
    : null

  const stickyHead = "sticky left-0 z-20! bg-background shadow-[1px_0_0_0_var(--border)]"
  const stickyCell =
    "sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]"
  // Opaque composite of the muted/30 row tint — a sticky cell needs a SOLID bg
  // or the columns scrolled under it bleed through ("Tota128").
  const stickyTotalCell =
    "sticky left-0 z-10 bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] shadow-[1px_0_0_0_var(--border)]"

  // Entity link cells reuse existing surfaces: Client/Pet/Product/Sale no./Appt.
  // ref./Team member all open the shared detail dialog/sheet inline where that
  // record's detail lives.
  const linkHandlers: Record<string, (row: ReportRow) => void> = {
    teamMember: (row) => {
      // Resolve to the real roster profile so the modal shows the actual team
      // member (no fabricated data); unknown names simply don't open a dialog.
      const member = findTeamMemberByName(String(row.teamMember ?? ""))
      if (member) setSelectedTeamMember(member)
    },
    client: (row) => {
      const name = String(row.client ?? "")
      setSelectedClient({ id: slugify(name), name })
    },
    pet: (row) => {
      const petName = String(row.pet ?? "")
      const info = PET_DETAILS[petName] ?? { species: "dog" as const, breed: "Unknown" }
      const ownerName = String(row.client ?? "")
      setSelectedPet({
        pet: { id: slugify(petName), name: petName, species: info.species, breed: info.breed },
        owners: ownerName ? [{ id: slugify(ownerName), name: ownerName }] : [],
      })
    },
    product: (row) => {
      const name = String(row.product ?? "")
      setSelectedProduct({
        id: slugify(name),
        name,
        barcode: row.barcode ? String(row.barcode) : undefined,
        brand: String(row.brand ?? "—"),
        category: row.category ? String(row.category) : "—",
        sku: String(row.primarySku ?? "—"),
        supplier: row.supplier ? String(row.supplier) : undefined,
        supplyPrice: Number(row.avgCost ?? row.totalCost ?? 0),
        retailPrice: Number(row.retailPrice ?? 0),
        status: "active",
      })
    },
    saleNo: (row) => {
      const sale = MOCK_SALES.find((s) => String(s.id) === String(row.saleNo))
      setSelectedSale(sale ?? null)
    },
    adjRef: (row) => {
      // Stock-movement adjustments link to their source: a sale opens the shared
      // sale detail inline; a stock order drills into the Ordered stock report
      // filtered to that reference.
      if (row.adjSaleId != null) {
        const sale = MOCK_SALES.find((s) => String(s.id) === String(row.adjSaleId))
        setSelectedSale(sale ?? null)
        return
      }
      const ref = String(row.adjRef ?? "")
      if (ref) router.push(`/reports/ordered-stock?reference=${encodeURIComponent(ref)}`)
    },
    apptRef: (row) => {
      // Resolve the row to a booking by client name so the shared detail sheet
      // opens inline (consistent with Sale no.), falling back to a representative
      // booking for demo rows whose client isn't in the appointments dataset.
      const name = String(row.client ?? "")
      const booking = MOCK_BOOKINGS.find((b) => b.clientName === name) ?? MOCK_BOOKINGS[0] ?? null
      setSelectedBooking(booking)
    },
  }

  function headLabel(col: ColumnDef, i: number) {
    return groupedData && i === 0 ? groupBySel : col.label
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TableToolbar
        tabs={
          <div className="flex items-center gap-2">
            {report.groupBy ? (
              <GroupByPill
                options={report.groupBy.options}
                value={groupBySel}
                onChange={(v) => {
                  setGroupBySel(v)
                  setDrillType(null)
                }}
              />
            ) : null}
            {report.dateControl === "single-date" ? (
              <DateSelector value={singleDate} onChange={setSingleDate} />
            ) : (
              <DateRangePopover value={range} onChange={setRange} today={today} />
            )}
            <ReportFiltersSheet filters={report.filters ?? []} />
          </div>
        }
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" size="sm" className="gap-1.5">
                Sort
                <ArrowUpDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {columns.map((col) => (
                <DropdownMenuItem key={col.key} onSelect={() => toggleSort(col.key)}>
                  <CheckIcon
                    className={cn("size-4", sortKey === col.key ? "opacity-100" : "opacity-0")}
                  />
                  {col.label}
                  {sortKey === col.key ? (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {sortDir === "asc" ? "A–Z" : "Z–A"}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {drillType || drillFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {drillType ? (
            <Badge variant="primary-soft" size="md" className="gap-1 pr-1">
              {drillType}
              <button
                type="button"
                onClick={() => setDrillType(null)}
                aria-label={`Clear ${drillType} filter`}
                className="rounded-full p-0.5 hover:bg-cami-violet-5"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ) : null}
          {drillFilters.map((f) => (
            <Badge key={f.key} variant="primary-soft" size="md" className="gap-1 pr-1">
              {f.value}
              <button
                type="button"
                onClick={() => removeDrillFilter(f.key)}
                aria-label={`Clear ${f.label} filter`}
                className="rounded-full p-0.5 hover:bg-cami-violet-5"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          variant="card"
          icon={SearchIcon}
          title="No results found"
          description="Try using different filters"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap",
                      isNumericKind(col.kind) && "text-right",
                      i === 0 && stickyHead,
                    )}
                  >
                    {headLabel(col, i)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {totals ? (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  {columns.map((col, i) => {
                    const total = totals[i]
                    return (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "whitespace-nowrap text-sm font-semibold",
                          isNumericKind(col.kind) && "text-right tabular-nums",
                          i === 0 && stickyTotalCell,
                        )}
                      >
                        {i === 0
                          ? "Total"
                          : total === null
                            ? ""
                            : col.kind === "money"
                              ? formatAed(total)
                              : col.kind === "duration"
                                ? formatDuration(total)
                                : col.kind === "percent"
                                  ? formatPercent(total)
                                  : formatNumber(total)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ) : null}
              {sortedRows.map((row) => (
                <TableRow key={columns.map((c) => String(row[c.key])).join("|")}>
                  {columns.map((col, i) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap text-sm text-foreground",
                        isNumericKind(col.kind) && "text-right tabular-nums",
                        col.emphasis && "font-semibold",
                        i === 0 && stickyCell,
                      )}
                    >
                      {i === 0 && canDrill ? (
                        <button
                          type="button"
                          onClick={() => {
                            setGroupBySel("Item")
                            setDrillType(String(row[col.key]))
                          }}
                          className="cursor-pointer text-start font-medium text-cami-violet-11 hover:underline"
                        >
                          {String(row[col.key])}
                        </button>
                      ) : i === 0 && report.drillThrough ? (
                        <button
                          type="button"
                          onClick={() => {
                            const param = report.drillThrough?.paramByDimension[groupBySel]
                            if (!param) return
                            const value = String(row[col.key])
                            router.push(
                              `/reports/${report.drillThrough?.report}?${param}=${encodeURIComponent(value)}`,
                            )
                          }}
                          className="cursor-pointer text-start font-medium text-cami-violet-11 hover:underline"
                        >
                          {String(row[col.key])}
                        </button>
                      ) : (
                        <CellValue
                          column={col}
                          value={row[col.key]}
                          row={row}
                          linkHandlers={linkHandlers}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="py-2 text-center text-xs text-muted-foreground">
            Showing {rows.length} of {rows.length} results
          </p>
        </>
      )}

      {selectedClient ? (
        <ClientDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) setSelectedClient(null)
          }}
          client={selectedClient}
          hasPets={report.hasPetColumn}
        />
      ) : null}
      {selectedPet ? (
        <PetDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) setSelectedPet(null)
          }}
          pet={selectedPet.pet}
          owners={selectedPet.owners}
        />
      ) : null}
      {selectedProduct ? (
        <ProductDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) setSelectedProduct(null)
          }}
          product={selectedProduct}
        />
      ) : null}
      {selectedTeamMember ? (
        <TeamMemberDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) setSelectedTeamMember(null)
          }}
          member={selectedTeamMember}
        />
      ) : null}
      <SaleDetailDialog
        sale={selectedSale}
        onOpenChange={(o) => {
          if (!o) setSelectedSale(null)
        }}
        onViewProfile={() => {
          if (selectedSale) {
            const name = selectedSale.client
            setSelectedSale(null)
            setSelectedClient({ id: slugify(name), name })
          }
        }}
      />
      <AppointmentDetailSheet
        open={selectedBooking !== null}
        onOpenChange={(o) => {
          if (!o) setSelectedBooking(null)
        }}
        booking={selectedBooking}
        staff={MOCK_STAFF}
        onViewProfile={() => {
          if (selectedBooking) {
            const name = selectedBooking.clientName
            setSelectedBooking(null)
            setSelectedClient({ id: slugify(name), name })
          }
        }}
        onViewSale={() => router.push("/sales/sales-list?sale=2")}
      />
    </div>
  )
}

// useSearchParams (drill-through filter chips) needs a Suspense boundary.
export function TableReport({ report }: { report: ReportDef }) {
  return (
    <Suspense fallback={null}>
      <TableReportInner report={report} />
    </Suspense>
  )
}
