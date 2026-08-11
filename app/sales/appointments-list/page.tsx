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
import { cn } from "@/lib/utils"

// Set high enough that the curated demo subset (10 rows) paints in a single
// page so every status badge color is visible without scrolling. Infinite
// scroll still kicks in once real data exceeds this window.
const PAGE_SIZE = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAFF_BY_ID = Object.fromEntries(MOCK_STAFF.map((s) => [s.id, s]))

// Curated 10-row listing subset covering all seven statuses (booked, confirmed,
// checked-in, ready-for-pickup, completed, cancelled, no-show) so every badge
// color is visible without scrolling. The detail sheet still resolves
// `?ref=<id>` against the full MOCK_BOOKINGS, so b-001…b-027 deep-links keep
// opening even when a row isn't in this subset.
const LISTING_BOOKING_IDS = new Set([
  "b-001", // completed
  "b-002", // ready-for-pickup
  "b-003", // confirmed
  "b-013", // checked-in
  "b-016", // booked
  "b-024", // cancelled
  "b-027", // no-show
  "b-011", // completed
  "b-014", // confirmed
  "b-018", // completed
])

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

// Mirrors the NewAppointmentSheet / AppointmentDetailSheet hero-band palette
// (pale step-5/6 fills with dark text) so the same status reads identically
// in this row badge and in the open detail sheet's hero band.
const STATUS_META: Record<MockBookingStatus, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-blue-5 text-blue-12" },
  confirmed: { label: "Confirmed", className: "bg-lime-5 text-lime-12" },
  "checked-in": { label: "Arrived", className: "bg-lime-3 text-lime-12" },
  "ready-for-pickup": { label: "Started", className: "bg-lime-9 text-lime-12" },
  completed: { label: "Completed", className: "bg-cami-gray-6 text-cami-gray-12" },
  cancelled: { label: "Canceled", className: "bg-olive-5 text-olive-12" },
  "no-show": { label: "No-show", className: "bg-tomato-8 text-tomato-12" },
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
  // URL is the source of truth — find the booking that matches `?ref=<id>`.
  // Resolved against the full dataset so any b-id deep-link still opens.
  const selectedBooking = selectedRef ? (augmented.find((b) => b.id === selectedRef) ?? null) : null
  // The table renders a curated 10-row subset covering every status.
  const listing = augmented.filter((b) => LISTING_BOOKING_IDS.has(b.id))
  const total = listing.length

  const q = query.trim().toLowerCase()
  const filtered = q
    ? listing.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          refOf(b).toLowerCase().includes(q) ||
          (b.bookingRef ?? "").toLowerCase().includes(q),
      )
    : listing

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
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Appointments</h1>
            <p className="text-sm text-muted-foreground">
              View, filter and export appointments booked by your clients.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" size="sm">
                Export
                <ChevronDownIcon className="size-3.5" />
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
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4">
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
              <Button variant="outline" radius="full" size="sm" className="gap-1.5">
                Month to date
                <CalendarIcon className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon-sm" radius="full" aria-label="Filters">
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </div>
          }
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm" className="gap-1.5">
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
          <EmptyState
            variant="card"
            icon={CalendarIcon}
            title="No appointments match"
            description="Try a different search."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20! shadow-[1px_0_0_0_var(--border)]">
                  Ref #
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Scheduled Date</TableHead>
                {/* Duration column hidden for now */}
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
                    <TableCell className="sticky left-0 z-10 bg-background font-mono text-sm shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
                      <button
                        type="button"
                        onClick={() => setSelectedRef(b.id)}
                        className="cursor-pointer text-start text-cami-violet-11 hover:underline"
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
                        className="cursor-pointer text-start text-sm text-cami-violet-11 hover:underline"
                      >
                        {b.clientName}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{b.serviceName}</TableCell>
                    <TableCell className="text-sm text-foreground">{b.createdBy}</TableCell>
                    <TableCell className="text-sm text-foreground">
                      {formatDateOnly(b.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {formatDateOnly(b.scheduledAt)}
                    </TableCell>
                    {/* Duration column hidden for now */}
                    <TableCell className="text-sm text-foreground">
                      {STAFF_BY_ID[b.staffId]?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground tabular-nums">
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
        // `&view=activity` opens the sheet on the activity timeline instead of
        // the detail panel, so a notification trace can be linked to directly.
        initialMode={searchParams.get("view") === "activity" ? "activity" : undefined}
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
