"use client"

import {
  ArrowDownUpIcon,
  CalendarIcon,
  ChevronDownIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

import {
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
} from "@/app/appointments/mock"
import { AppShell } from "@/components/blocks/app-shell"
import { AppointmentDetailSheet } from "@/components/blocks/appointment-detail-sheet"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
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
import { cn } from "@/lib/utils"

// Set high enough that the demo mock (27 rows) paints in a single page so
// every status badge color is visible without scrolling. Infinite scroll still
// kicks in once real data exceeds this window.
const PAGE_SIZE = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAFF_BY_ID = Object.fromEntries(MOCK_STAFF.map((s) => [s.id, s]))

// Anchor demo dates on 18 May 2026 so the listing reads like the figma.
const ANCHOR_DATE = new Date(2026, 4, 18)

function parseHm(value: string): [number, number] {
  const [h, m] = value.split(":").map(Number)
  return [h ?? 0, m ?? 0]
}

type Augmented = MockBooking & {
  scheduledAt: Date
  createdAt: Date
  createdBy: string
}

function augment(b: MockBooking, index: number): Augmented {
  const [h, m] = parseHm(b.start)
  const scheduledAt = new Date(ANCHOR_DATE)
  scheduledAt.setHours(h, m, 0, 0)

  // Created at a sensible time on the same day. Offset a few minutes per row so
  // sort-by-created is not all-ties.
  const createdAt = new Date(ANCHOR_DATE)
  createdAt.setHours(12, 30 + index, 0, 0)

  return {
    ...b,
    scheduledAt,
    createdAt,
    createdBy: "Hussain Shabbir",
  }
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatDateOnly(d: Date) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

function formatTimeOnly(d: Date) {
  let h = d.getHours()
  const m = d.getMinutes()
  const meridiem = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}${meridiem}`
}

function formatDuration(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function formatPrice(minor: number) {
  return `AED ${Math.round(minor / 100).toLocaleString()}`
}

function refOf(b: MockBooking) {
  if (b.bookingRef) {
    const cleaned = b.bookingRef
      .replace(/[^0-9A-Z]/gi, "")
      .toUpperCase()
      .padStart(8, "0")
      .slice(0, 8)
    return `#${cleaned}`
  }
  let h = 0
  for (let i = 0; i < b.id.length; i++) {
    h = ((h << 5) - h + b.id.charCodeAt(i)) | 0
  }
  return `#${Math.abs(h).toString(16).toUpperCase().padStart(8, "0").slice(0, 8)}`
}

function clientIdOf(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<MockBookingStatus, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-blue-3 text-blue-11" },
  confirmed: { label: "Confirmed", className: "bg-cami-violet-3 text-cami-violet-11" },
  "checked-in": { label: "Arrived", className: "bg-cami-sage-3 text-cami-sage-12" },
  "ready-for-pickup": { label: "Started", className: "bg-gold-3 text-gold-11" },
  completed: { label: "Completed", className: "bg-cami-green-3 text-cami-green-12" },
  cancelled: { label: "Canceled", className: "bg-cami-gray-3 text-cami-gray-12" },
  "no-show": { label: "No-show", className: "bg-tomato-3 text-tomato-11" },
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey =
  | "created-asc"
  | "created-desc"
  | "scheduled-asc"
  | "scheduled-desc"
  | "duration-asc"
  | "duration-desc"

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "created-asc", label: "Created Date (oldest first)" },
  { key: "created-desc", label: "Created Date (newest first)" },
  { key: "scheduled-asc", label: "Scheduled Date (oldest first)" },
  { key: "scheduled-desc", label: "Scheduled Date (newest first)" },
  { key: "duration-asc", label: "Duration (shortest first)" },
  { key: "duration-desc", label: "Duration (longest first)" },
]

function compare(a: Augmented, b: Augmented, key: SortKey): number {
  switch (key) {
    case "created-asc":
      return a.createdAt.getTime() - b.createdAt.getTime()
    case "created-desc":
      return b.createdAt.getTime() - a.createdAt.getTime()
    case "scheduled-asc":
      return a.scheduledAt.getTime() - b.scheduledAt.getTime()
    case "scheduled-desc":
      return b.scheduledAt.getTime() - a.scheduledAt.getTime()
    case "duration-asc":
      return a.durationMin - b.durationMin
    case "duration-desc":
      return b.durationMin - a.durationMin
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AppointmentsListPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedRef = searchParams.get("ref")

  const setSelectedRef = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) {
        params.set("ref", id)
      } else {
        params.delete("ref")
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("scheduled-desc")
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [selectedClient, setSelectedClient] = useState<ClientDetailClient | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const augmented: Augmented[] = MOCK_BOOKINGS.map(augment)
  const total = augmented.length
  // URL is the source of truth — find the booking that matches `?ref=<id>`.
  const selectedBooking = selectedRef ? (augmented.find((b) => b.id === selectedRef) ?? null) : null

  const q = query.trim().toLowerCase()
  const filtered = q
    ? augmented.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          refOf(b).toLowerCase().includes(q) ||
          (b.bookingRef ?? "").toLowerCase().includes(q),
      )
    : augmented

  const sorted = [...filtered].sort((a, b) => compare(a, b, sort))
  const shown = sorted.slice(0, shownCount)
  const hasMore = shown.length < sorted.length
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort"

  // Reset visible window when the filter or sort changes so the user is not
  // scrolled into the middle of an unrelated dataset.
  // biome-ignore lint/correctness/useExhaustiveDependencies: query/sort are intentional reset triggers, not values read inside the effect.
  useEffect(() => {
    setShownCount(PAGE_SIZE)
  }, [query, sort])

  // Infinite scroll — load the next page when the sentinel enters the viewport.
  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShownCount((c) => c + PAGE_SIZE)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore])

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Appointments</h1>
            <p className="text-sm text-muted-foreground">
              View, filter and export appointments booked by your clients.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" className="h-9 gap-1.5 px-4">
                Export
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <FileTextIcon className="size-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileTextIcon className="size-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheetIcon className="size-4" />
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4">
        {/* Toolbar — same shape as /products: left tabs/filters, right sort */}
        <TableToolbar
          tabs={
            <div className="flex items-center gap-2">
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by Reference or Client"
                aria-label="Search appointments"
                onValueChange={setQuery}
              />
              <Button variant="outline" radius="full" size="sm" className="h-8 gap-1.5">
                Month to date
                <CalendarIcon className="size-3.5" />
              </Button>
              <Button variant="outline" radius="full" size="sm" className="h-8 gap-1.5">
                Filters
                <SlidersHorizontalIcon className="size-3.5" />
              </Button>
            </div>
          }
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm" className="h-8 gap-1.5">
                  {sortLabel}
                  <ArrowDownUpIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.key}
                    onSelect={() => setSort(opt.key)}
                    data-active={sort === opt.key}
                    className="data-[active=true]:font-semibold"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No appointments match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
          </div>
        ) : (
          <Table containerClassName="min-h-0 flex-1">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20">Ref #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Team member</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((b) => {
                const status = STATUS_META[b.status]
                return (
                  <TableRow key={b.id}>
                    <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedRef(b.id)}
                        className="text-start text-cami-violet-11 hover:underline"
                      >
                        {refOf(b)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => {
                          const slug = clientIdOf(b.clientName)
                          setSelectedClient({
                            id: slug,
                            name: b.clientName,
                            phone: b.clientPhone,
                            // Demo signals — match the figma so the new header + tags row are
                            // immediately visible. Real wiring would derive these from bookings.
                            email: `${slug.replace(/-/g, ".")}@example.com`,
                            noShowCount: 1,
                            unpaidMinor: 3000,
                            tags: [
                              { id: "high-spender", label: "High spender" },
                              { id: "vip", label: "VIP" },
                              { id: "loyal", label: "Loyal" },
                            ],
                          })
                        }}
                        className="text-start text-xs text-cami-violet-11 hover:underline"
                      >
                        {b.clientName}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{b.serviceName}</TableCell>
                    <TableCell className="text-xs text-foreground">{b.createdBy}</TableCell>
                    <TableCell className="text-xs text-foreground">
                      <div className="flex flex-col leading-tight">
                        <span>{formatDateOnly(b.createdAt)},</span>
                        <span>{formatTimeOnly(b.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">
                      <div className="flex flex-col leading-tight">
                        <span>{formatDateOnly(b.scheduledAt)},</span>
                        <span>{formatTimeOnly(b.scheduledAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-foreground tabular-nums">
                      {formatDuration(b.durationMin)}
                    </TableCell>
                    <TableCell className="text-xs text-foreground">
                      {STAFF_BY_ID[b.staffId]?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground tabular-nums">
                      {formatPrice(b.priceMinor)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("rounded-full border-transparent text-xs", status.className)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Infinite-scroll sentinel — IntersectionObserver triggers next page when this enters view. */}
        {hasMore ? (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-3 text-xs text-muted-foreground"
          >
            Loading more…
          </div>
        ) : null}

        {/* Result count */}
        {sorted.length > 0 ? (
          <div className="py-2 text-center text-xs text-muted-foreground">
            Showing {shown.length} of {sorted.length}
            {sorted.length === total ? "" : ` (filtered from ${total})`} results
          </div>
        ) : null}
      </div>

      {/* Client modal — opens in-place on row's Client cell click */}
      {selectedClient ? (
        <ClientDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setSelectedClient(null)
          }}
          client={selectedClient}
        />
      ) : null}

      {/* Appointment detail sheet — opens on Ref # click. View profile inside
          the sheet pops the existing ClientDetailDialog on top using the same
          state that powers the Client column. */}
      <AppointmentDetailSheet
        open={selectedBooking !== null}
        onOpenChange={(next) => {
          if (!next) setSelectedRef(null)
        }}
        booking={selectedBooking}
        staff={MOCK_STAFF}
        onViewSale={() => {
          // Demo mapping: every booking's "View sale" jumps to sale #2, matching
          // the "sale receipt 2" link in the appointment activity log.
          router.push("/sales/sales-list?sale=2")
        }}
        onViewProfile={() => {
          if (!selectedBooking) return
          const slug = clientIdOf(selectedBooking.clientName)
          setSelectedClient({
            id: slug,
            name: selectedBooking.clientName,
            phone: selectedBooking.clientPhone,
            email: `${slug.replace(/-/g, ".")}@example.com`,
            noShowCount: 1,
            unpaidMinor: 3000,
            tags: [
              { id: "high-spender", label: "High spender" },
              { id: "vip", label: "VIP" },
              { id: "loyal", label: "Loyal" },
            ],
          })
        }}
      />
    </AppShell>
  )
}

export default function AppointmentsListPage() {
  return (
    <Suspense fallback={null}>
      <AppointmentsListPageInner />
    </Suspense>
  )
}
