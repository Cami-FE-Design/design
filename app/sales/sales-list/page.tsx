"use client"

import {
  ArrowUpDownIcon,
  BanknoteIcon,
  CheckIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  GiftIcon,
  LinkIcon,
  MoreVerticalIcon,
  NotebookPenIcon,
  PencilIcon,
  PersonStandingIcon,
  PlusIcon,
  PrinterIcon,
  RotateCcwIcon,
  SendIcon,
  SlidersHorizontalIcon,
  TagIcon,
  XIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/clients/client-detail-dialog"
import { CamiPayFeeBreakdown } from "@/components/blocks/sales/camipay-fee-breakdown"
import { EmailInvoiceDialog } from "@/components/blocks/sales/email-invoice-dialog"
import { CartFlow } from "@/components/blocks/sales/new-sale/cart-flow"
import { RefundSaleDialog } from "@/components/blocks/sales/refund-sale-dialog"
import { ShareGiftCardDialog } from "@/components/blocks/sales/share-gift-card-dialog"
import { ShareInvoiceDialog } from "@/components/blocks/sales/share-invoice-dialog"
import { VoidSaleDialog } from "@/components/blocks/sales/void-sale-dialog"
import { ConfirmDialog } from "@/components/blocks/shared/confirm-dialog"
import {
  type DateRange,
  DateRangePopover,
  rangeForPreset,
} from "@/components/blocks/shared/date-range-popover"
import { EmptyState } from "@/components/blocks/shared/empty-state"
import { PageHeader } from "@/components/blocks/shared/page-header"
import { TableToolbar } from "@/components/blocks/shared/table-toolbar"
import { TimelineRow } from "@/components/blocks/shared/timeline-row"
import { AppShell } from "@/components/blocks/shell/app-shell"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { endOfDay, formatAed, formatDate, formatTime, startOfDay } from "@/lib/format"
import { type CamiPayRail, type CamiPayRate, railLabel } from "@/lib/hq-camipay/store"
import { invoiceFromSale, originalFor, receiptNumberFor } from "@/lib/invoice/from-sale"
import { documentTitle } from "@/lib/invoice/totals"
import { useLocations } from "@/lib/locations/store"
import type { CartLine } from "@/lib/sales/cart-types"
import { MOCK_SALES, type Sale, type SaleItem } from "@/lib/sales/mock"
import {
  demoPaidMinor,
  paymentsElsewhere,
  paymentsFor,
  type SalePayment,
} from "@/lib/sales/payments"
import { SALE_STATUS_CLASS, SALE_STATUS_LABEL } from "@/lib/sales/status"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Weekday-led format used in the draft detail dialog header and receipt card
// ("Tue, Jun 2"), matching the figma. The listing rows use formatDateOnly.
function formatWeekdayShort(d: Date) {
  return `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
}

// ─── Draft mock data ──────────────────────────────────────────────────────────
//
// Drafts are unsubmitted sales — no sale number yet, just a short hex reference
// (#31A06EA3). They're always "Unpaid" until checked out, so unlike sales they
// carry no status variants. The first row mirrors the figma exactly (Walk-In,
// 2 Jun 2026 5:22pm, AED 25) and is deep-linked from /screens as ?draft=31A06EA3.

type Draft = {
  id: string
  client: string
  /**
   * Where it will land when it is taken (R11).
   *
   * A draft is a sale that has not been completed, not a sale with no branch:
   * the receipt it becomes is numbered against this, so losing it would leave
   * the sequence to be guessed at the till.
   */
  locationId: string
  createdAt: Date
  tipsMinor: number
  grossMinor: number
}

/**
 * Why the table is empty, in its own words.
 *
 * It said "Try a different search" whatever the reason, so a branch that has
 * simply never taken a sale read as a failed search — and the operator retyped
 * a query they had not entered. Nothing here is broken in that case: it is a
 * real, correct state of a real branch, and saying so is the whole job.
 */
function emptyCopy(
  tab: "sales" | "drafts",
  searching: boolean,
  scopeLabel: string,
): { title: string; description: string } {
  const noun = tab === "drafts" ? "drafts" : "sales"
  if (searching) {
    return { title: `No ${noun} match`, description: "Try a different search." }
  }
  return {
    title: `No ${noun} at ${scopeLabel}`,
    description: `Nothing has been ${tab === "drafts" ? "started" : "sold"} here in this period.`,
  }
}

// Build a Draft for a ref that isn't in MOCK_DRAFTS — see `selectedDraft`.
// Returns null unless the query string carries a usable total, so a stale or
// mistyped ?draft= still falls through to "no draft" rather than a blank AED 0.
function synthesizeDraft(
  id: string,
  totalMinor: string | null,
  client: string | null,
  /** The branch in view, since a URL-built draft names none of its own. */
  locationId: string,
): Draft | null {
  const grossMinor = Number(totalMinor)
  if (!totalMinor || !Number.isFinite(grossMinor) || grossMinor <= 0) return null
  return {
    id,
    client: client || "Walk-In",
    locationId,
    createdAt: new Date(),
    tipsMinor: 0,
    grossMinor,
  }
}

// Drafts carry no line items in the mock — the detail dialog renders a single
// hardcoded Haircut priced at the draft total. Checkout rebuilds that same line
// so the resumed cart matches what the operator was just looking at. The real
// build reads the draft sale's stored lines instead.
function draftToCartLines(draft: Draft): CartLine[] {
  return [
    {
      uid: `draft-${draft.id}-1`,
      kind: "service",
      name: "Haircut",
      priceMinor: draft.grossMinor,
      durationMin: 90,
      staffName: "Hussain Shabbir",
      qty: 1,
      sourceId: `draft-${draft.id}`,
    },
  ]
}

const MOCK_DRAFTS: Draft[] = [
  {
    id: "31A06EA3",
    client: "Walk-In",
    locationId: "shampooch-downtown-dubai",
    createdAt: new Date(2026, 5, 2, 17, 22),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: "7F2B19C4",
    client: "Karen Dougall",
    locationId: "shampooch-jvc",
    createdAt: new Date(2026, 5, 2, 14, 10),
    tipsMinor: 0,
    grossMinor: 6400,
  },
  {
    id: "A4D8E0F1",
    client: "Tom Cassidy",
    locationId: "shampooch-jumeirah",
    createdAt: new Date(2026, 5, 1, 16, 45),
    tipsMinor: 0,
    grossMinor: 3800,
  },
  {
    id: "C9B3A77D",
    client: "Walk-In",
    locationId: "shampooch-downtown-dubai",
    createdAt: new Date(2026, 4, 30, 11, 5),
    tipsMinor: 0,
    grossMinor: 1200,
  },
]

/**
 * One line of a saved sale.
 *
 * A line a package session paid for reads 0 with what it was worth struck
 * beneath it, and that is all — the shape `InvoiceDetailDialog` uses in the
 * built product, and deliberately WITHOUT the sessions chip the cart and the
 * appointment sheets carry.
 *
 * The chip was here and came out. It counts what the client has left TODAY, and
 * a sale from May records what was charged then: a live balance printed on a
 * settled document moves under a figure that cannot, and a reader has no way to
 * tell which of the two they are looking at. The struck price is the part that
 * belongs to the sale and never changes.
 */
function SaleLineRow({ item }: { item: SaleItem }) {
  return (
    <li className="flex items-baseline justify-between gap-3 text-sm">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium text-foreground">{item.name}</span>
        {item.meta ? (
          <span className="truncate text-xs text-muted-foreground">{item.meta}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="font-medium text-foreground tabular-nums">
          {formatAed(Math.round(item.priceMinor / 100))}
        </span>
        {item.originalPriceMinor != null ? (
          <span className="text-muted-foreground text-xs tabular-nums line-through">
            {formatAed(Math.round(item.originalPriceMinor / 100))}
          </span>
        ) : null}
      </div>
    </li>
  )
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey = "sale-desc" | "sale-asc" | "date-desc" | "date-asc" | "gross-desc" | "gross-asc"

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "sale-desc", label: "Sale # (newest first)" },
  { key: "sale-asc", label: "Sale # (oldest first)" },
  { key: "date-desc", label: "Sale date (newest first)" },
  { key: "date-asc", label: "Sale date (oldest first)" },
  { key: "gross-desc", label: "Gross total (high to low)" },
  { key: "gross-asc", label: "Gross total (low to high)" },
]

function compareSales(a: Sale, b: Sale, key: SortKey): number {
  switch (key) {
    case "sale-asc":
      return a.id - b.id
    case "sale-desc":
      return b.id - a.id
    case "date-asc":
      return a.saleAt.getTime() - b.saleAt.getTime()
    case "date-desc":
      return b.saleAt.getTime() - a.saleAt.getTime()
    case "gross-asc":
      return a.grossMinor - b.grossMinor
    case "gross-desc":
      return b.grossMinor - a.grossMinor
  }
}

// Drafts reuse the same SortKey — "Sale #" maps to the hex reference (sorted
// lexicographically), the date keys to createdAt, gross to the total.
function compareDrafts(a: Draft, b: Draft, key: SortKey): number {
  switch (key) {
    case "sale-asc":
      return a.id.localeCompare(b.id)
    case "sale-desc":
      return b.id.localeCompare(a.id)
    case "date-asc":
      return a.createdAt.getTime() - b.createdAt.getTime()
    case "date-desc":
      return b.createdAt.getTime() - a.createdAt.getTime()
    case "gross-asc":
      return a.grossMinor - b.grossMinor
    case "gross-desc":
      return b.grossMinor - a.grossMinor
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SalesListPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSaleId = searchParams.get("sale")
  const selectedDraftId = searchParams.get("draft")

  const setSelectedSaleId = useCallback(
    (id: number | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id !== null) {
        params.set("sale", String(id))
      } else {
        params.delete("sale")
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  const setSelectedDraftId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id !== null) {
        params.set("draft", id)
      } else {
        params.delete("draft")
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  // Anchor "today" in the demo so the empty state is reproducible against the
  // hard-coded fixture dates (May 2026).
  const today = useMemo(() => startOfDay(new Date(2026, 4, 25)), [])
  // Tab is URL-backed so /screens can deep-link the Drafts tab; an open
  // `?draft=` also implies the Drafts tab.
  const [tab, setTab] = useState<"sales" | "drafts">(() =>
    searchParams.get("tab") === "drafts" || selectedDraftId ? "drafts" : "sales",
  )
  const setTabAndUrl = useCallback(
    (next: "sales" | "drafts") => {
      setTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === "drafts") {
        params.set("tab", "drafts")
      } else {
        params.delete("tab")
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("sale-desc")
  const [range, setRange] = useState<DateRange>(() => rangeForPreset("today", today))
  const [selectedClient, setSelectedClient] = useState<ClientDetailClient | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  // Draft being resumed through Checkout — seeds a cart opened on the Tip step.
  const [checkoutDraft, setCheckoutDraft] = useState<Draft | null>(null)

  // URL is the source of truth — match the `?sale=<id>` param to a row.
  const selectedSale = selectedSaleId
    ? (MOCK_SALES.find((s) => String(s.id) === selectedSaleId) ?? null)
    : null
  // …and `?draft=<ref>` to a draft row. A ref that isn't in the mock list is a
  // draft minted elsewhere in the session — cancelling a payment link hands
  // back here with the total and client on the query string, since there's no
  // store to persist it. The real build looks the draft up by ref.
  // Memoized: a fresh object each render would retrigger the detail dialog's
  // effect on every pass.
  const draftTotalParam = searchParams.get("draftTotal")
  const draftClientParam = searchParams.get("draftClient")
  // The scope resolved to branches, falling back to the whole grant when the
  // switcher is on all-locations.
  const { scopedLocations, granted, isMultiLocation, locationName, scopeLabel } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted

  const selectedDraft = useMemo(
    () =>
      selectedDraftId
        ? (MOCK_DRAFTS.find((d) => d.id === selectedDraftId) ??
          synthesizeDraft(
            selectedDraftId,
            draftTotalParam,
            draftClientParam,
            // The branch in view. A draft reached by URL names none of its own,
            // and a sale has to resolve to exactly one (R11).
            inScope[0]?.id ?? "",
          ))
        : null,
    [selectedDraftId, draftTotalParam, draftClientParam, inScope[0]?.id],
  )

  function openClientFor(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    setSelectedClient({
      id: slug,
      name,
      email: `${slug.replace(/-/g, ".")}@example.com`,
    })
  }

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (tab === "drafts") return []
    const from = startOfDay(range.from).getTime()
    const to = endOfDay(range.to).getTime()
    return MOCK_SALES.filter((s) => {
      // Bounded by the scope before anything else (G7, R18). A money view that
      // ignores the switcher is worse than one with no switcher: the operator
      // narrows to two branches, the totals do not move, and nothing says why.
      if (!inScope.some((l) => l.id === s.locationId)) return false
      const t = s.saleAt.getTime()
      if (t < from || t > to) return false
      if (!q) return true
      return (
        s.client.toLowerCase().includes(q) ||
        receiptNumberFor(s).toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    })
  }, [tab, range, q, inScope])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareSales(a, b, sort)),
    [filtered, sort],
  )

  // Drafts are filtered by search only — the date-range pill scopes completed
  // sales, but drafts are unfinished work the user always wants to see in full
  // regardless of when they were started.
  const filteredDrafts = useMemo(() => {
    // Scoped like everything else on this page: a draft belongs to the branch
    // it will be taken at, so a branch you are not looking at should not offer
    // you its unfinished work.
    const mine = MOCK_DRAFTS.filter((d) => inScope.some((l) => l.id === d.locationId))
    if (!q) return mine
    return mine.filter((d) => d.client.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
  }, [q, inScope])
  const sortedDrafts = useMemo(
    () => [...filteredDrafts].sort((a, b) => compareDrafts(a, b, sort)),
    [filteredDrafts, sort],
  )

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort"

  // Tab counts — the in-range rows, independent of search but bounded by the
  // same scope the table is. Counted across the estate while the rows were
  // narrowed to two branches, the tab said 8 above an empty table and nothing
  // on screen reconciled the two.
  const salesCount = useMemo(() => {
    const from = startOfDay(range.from).getTime()
    const to = endOfDay(range.to).getTime()
    return MOCK_SALES.filter((s) => {
      const t = s.saleAt.getTime()
      return t >= from && t <= to && inScope.some((l) => l.id === s.locationId)
    }).length
  }, [range, inScope])
  const draftsCount = useMemo(
    () => MOCK_DRAFTS.filter((d) => inScope.some((l) => l.id === d.locationId)).length,
    [inScope],
  )

  return (
    <AppShell
      header={
        <PageHeader
          title="Sales"
          description="Manage your sales history and invoices"
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" radius="full" size="sm">
                    Options
                    <ChevronDownIcon className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem>
                    <FileTextIcon className="size-4" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileTextIcon className="size-4" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileSpreadsheetIcon className="size-4" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button radius="full" onClick={() => setCartOpen(true)}>
                <PlusIcon className="size-4" />
                Add new
              </Button>
            </>
          }
        />
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <Tabs
          className="flex min-h-0 flex-1 flex-col gap-4"
          value={tab}
          onValueChange={(v) => setTabAndUrl(v as "sales" | "drafts")}
        >
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                <TabsTrigger value="sales">
                  Sales
                  <span className="text-sm font-normal text-muted-foreground">{salesCount}</span>
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Drafts
                  <span className="text-sm font-normal text-muted-foreground">{draftsCount}</span>
                </TabsTrigger>
              </TabsList>
            }
            actions={
              <>
                <SearchInput
                  className="h-9! w-72"
                  placeholder={tab === "drafts" ? "Search by Draft ID" : "Search by Sale or Client"}
                  aria-label={tab === "drafts" ? "Search drafts" : "Search sales"}
                  onValueChange={setQuery}
                />
                <DateRangePopover value={range} onChange={setRange} today={today} />
                <Button variant="outline" size="icon-sm" radius="full" aria-label="Filter">
                  <SlidersHorizontalIcon className="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                      <ArrowUpDownIcon className="size-3.5" />
                      {sortLabel}
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
              </>
            }
          />

          {(tab === "drafts" ? sortedDrafts.length : sorted.length) === 0 ? (
            <EmptyState
              variant="card"
              icon={tab === "drafts" ? FileTextIcon : TagIcon}
              {...emptyCopy(tab, q.length > 0, scopeLabel)}
            />
          ) : tab === "drafts" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    label="Draft #"
                    className="sticky left-0 z-20! shadow-[1px_0_0_0_var(--border)]"
                  />
                  <SortableHead label="Client" />
                  <TableHead>Status</TableHead>
                  <SortableHead label="Created" />
                  <SortableHead label="Tips" className="text-right" />
                  <SortableHead label="Gross total" className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDrafts.map((d) => {
                  const isWalkIn = d.client === "Walk-In"
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
                        <button
                          type="button"
                          onClick={() => setSelectedDraftId(d.id)}
                          className="cursor-pointer text-start text-sm font-medium text-cami-violet-11 hover:underline"
                        >
                          #{d.id}
                        </button>
                      </TableCell>
                      <TableCell>
                        {isWalkIn ? (
                          <span className="text-sm text-foreground">Walk-In</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openClientFor(d.client)}
                            className="cursor-pointer text-start text-sm text-cami-violet-11 hover:underline"
                          >
                            {d.client}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="rounded-full border-transparent bg-olive-5 text-xs text-olive-12">
                          Draft
                        </Badge>
                      </TableCell>
                      {/* A date never wraps — see the appointments table. */}
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(d.createdAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatAed(Math.round(d.tipsMinor / 100))}
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap text-foreground tabular-nums">
                        {formatAed(Math.round(d.grossMinor / 100))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    label="Sale #"
                    className="sticky left-0 z-20! shadow-[1px_0_0_0_var(--border)]"
                  />

                  <SortableHead label="Client" />
                  <TableHead>Status</TableHead>
                  <SortableHead label="Sale date" />
                  <SortableHead label="Tips" className="text-right" />
                  <SortableHead label="Gross total" className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => {
                  const status = {
                    label: SALE_STATUS_LABEL[s.status],
                    className: SALE_STATUS_CLASS[s.status],
                  }
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleId(s.id)}
                          className="cursor-pointer text-start text-sm font-medium text-cami-violet-11 hover:underline"
                        >
                          {/* The number as it was actually issued, prefixed by
                              the branch that issued it (R25). A bare id here and
                              a prefixed one on the document are two spellings of
                              one fact, and the operator has to match them by
                              eye — which is the reconciliation this column
                              exists to make easy. */}
                          <span className="flex flex-col leading-tight">
                            <span className="whitespace-nowrap">{receiptNumberFor(s)}</span>
                            {/* The prefix already names the branch, but a code
                                is only readable to somebody who knows the
                                estate — and a column of its own was what
                                pushed this table into a horizontal scroll. */}
                            {isMultiLocation ? (
                              <span className="font-normal whitespace-nowrap text-muted-foreground text-xs">
                                {locationName(s.locationId)}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => openClientFor(s.client)}
                          className="cursor-pointer text-start text-sm text-cami-violet-11 hover:underline"
                        >
                          {s.client}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full border-transparent text-xs",
                            status.className,
                          )}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(s.saleAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatAed(Math.round(s.tipsMinor / 100))}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm whitespace-nowrap tabular-nums",
                          s.grossMinor < 0 ? "text-tomato-11" : "text-foreground",
                        )}
                      >
                        {formatAed(Math.round(s.grossMinor / 100))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {(tab === "drafts" ? sortedDrafts.length : sorted.length) > 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              {/* "Showing 8 of 8" whatever you filtered — both halves read the
                  same value, so the line could never say anything. The second
                  is the unfiltered total, which is the only reason to print a
                  ratio at all. */}
              Showing {tab === "drafts" ? sortedDrafts.length : sorted.length} of{" "}
              {tab === "drafts" ? draftsCount : salesCount} results
            </div>
          ) : null}
        </Tabs>
      </div>

      {selectedClient ? (
        <ClientDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setSelectedClient(null)
          }}
          client={selectedClient}
        />
      ) : null}

      <SaleDetailDialog
        sale={selectedSale}
        onOpenChange={(next) => {
          if (!next) setSelectedSaleId(null)
        }}
        onViewProfile={() => {
          if (selectedSale) openClientFor(selectedSale.client)
        }}
      />

      <DraftDetailDialog
        draft={selectedDraft}
        onOpenChange={(next) => {
          if (!next) setSelectedDraftId(null)
        }}
        onViewProfile={() => {
          if (selectedDraft) openClientFor(selectedDraft.client)
        }}
        onCheckout={() => {
          if (selectedDraft) setCheckoutDraft(selectedDraft)
          setSelectedDraftId(null)
        }}
      />

      <CartFlow open={cartOpen} onOpenChange={setCartOpen} />

      {/* Resuming a draft — the cart is already built, so it opens on Tip.
          Keyed by draft id so each resume mounts a fresh cart. */}
      {checkoutDraft ? (
        <CartFlow
          key={checkoutDraft.id}
          open
          onOpenChange={(next) => !next && setCheckoutDraft(null)}
          initialLines={draftToCartLines(checkoutDraft)}
          initialAttachment={
            checkoutDraft.client === "Walk-In"
              ? { type: "walk-in" }
              : {
                  type: "client",
                  client: {
                    id: `draft-${checkoutDraft.id}`,
                    name: checkoutDraft.client,
                  },
                }
          }
          initialStep="tip"
        />
      ) : null}
    </AppShell>
  )
}

export default function SalesListPage() {
  return (
    <Suspense fallback={null}>
      <SalesListPageInner />
    </Suspense>
  )
}

// ─── Sale detail dialog ───────────────────────────────────────────────────────
//
// Centered dialog mirroring `ClientDetailDialog` — same ~630px width, sticky
// header (status pill + Rebook + Actions + Close, then title and meta line),
// horizontal underline tabs (Details / Activity), scroll body. Replaces the
// earlier right-side sheet so the surface matches the rest of the detail
// dialogs in the app.

function refOf(id: number) {
  return `#${String(id).padStart(8, "0")}`
}

type SaleDetailDialogProps = {
  sale: Sale | null
  onOpenChange: (open: boolean) => void
  onViewProfile: () => void
}

export function SaleDetailDialog({ sale, onOpenChange, onViewProfile }: SaleDetailDialogProps) {
  const router = useRouter()
  const { granted, isMultiLocation, locationName, enablement } = useLocations()
  const open = sale !== null
  // Hold the last sale so the dialog animates out with its content still
  // rendered after `sale` is cleared.
  const [last, setLast] = useState<Sale | null>(sale)
  const [tab, setTab] = useState<"details" | "activity">("details")
  const [refundOpen, setRefundOpen] = useState(false)
  // The one payment a "Refund payment" opened the refund for; null when the
  // whole sale is being refunded.
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null)
  const [voidOpen, setVoidOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareInvoiceOpen, setShareInvoiceOpen] = useState(false)
  const [emailInvoiceOpen, setEmailInvoiceOpen] = useState(false)
  useEffect(() => {
    if (sale) {
      setLast(sale)
      setTab("details")
    }
  }, [sale])

  const data = sale ?? last
  const heldIds = new Set(granted.map((l) => l.id))
  const payments = data ? paymentsFor(data) : []
  // Taken at a location this viewer does not hold. Refunding or voiding one is
  // refused (LOCATION_ACCESS_DENIED), so neither is offered for it.
  const elsewhere = paymentsElsewhere(payments, heldIds)
  const elsewhereIds = new Set(elsewhere.map((p) => p.id))
  const refundable = payments.filter((p) => !elsewhereIds.has(p.id))
  // Taken somewhere other than the sale's own location: the only payments
  // whose location is worth naming. Named for anyone at a multi-location
  // business, including someone who holds one location — that is who most
  // needs to know a payment, and its refund, belong somewhere else.
  const takenElsewhere = (p: SalePayment) => enablement.enabled && p.locationId !== data?.locationId
  const refundPayment = refundable.find((p) => p.id === refundPaymentId) ?? null
  function openPaymentRefund(id: string) {
    setRefundPaymentId(id)
    setRefundOpen(true)
  }
  if (!data) return null

  const giftCard = data.giftCard
  const status = {
    label: SALE_STATUS_LABEL[data.status],
    className: SALE_STATUS_CLASS[data.status],
  }
  const pill = SALE_STATUS_CLASS[data.status]
  const gross = Math.round(data.grossMinor / 100)

  // Demo payment numbers — derived from status so the receipt body reads right
  // for every state. Real numbers arrive with the sale payload.
  //   • completed: tendered > total → "Change" line
  //   • part-paid: ~80% paid       → "Balance" line for the remainder
  //   • unpaid:    nothing paid    → "Balance" = full total
  //   • refunded:  original sale fully paid before being refunded (the refund
  //                renders in its own card above the original sale)
  //   • voided:    no payment
  const grossAbsMinor = Math.abs(data.grossMinor)
  // A sale with its own payment records paid what they add up to.
  const paidMinor = data.payments
    ? data.payments.reduce((sum, p) => sum + p.amountMinor, 0)
    : demoPaidMinor(data)
  const paid = Math.round(paidMinor / 100)
  const totalAbs = Math.round(grossAbsMinor / 100)
  // Positive = customer still owes (Balance). Negative = change due. Zero = paid in full.
  const balance = totalAbs - paid

  const clientEmail = `${data.client.toLowerCase().replace(/\s+/g, ".")}@example.com`

  // Payments that voiding will delete — the actual amount paid (capped at the
  // sale total so a completed sale's tendered change doesn't inflate it). The
  // completed demo sale is paid by split tender (Cash + Other) to exercise the
  // multi-payment layout; everything else is a single cash payment. Real sales
  // arrive with their own payment records.
  const collectedMinor = Math.min(paidMinor, grossAbsMinor)

  // Print / Download PDF open the document for this sale in a NEW TAB. Every
  // production action on this dialog works in place — a modal, a print dialog, a
  // download — and none of them costs the operator their place in the sale. A new
  // tab is the closest honest equivalent while still showing the document, which
  // is the point of the design repo.
  //
  // Share invoice and Email do not come through here: production opens a modal
  // for each, so they go to <ShareInvoiceDialog> and <EmailInvoiceDialog>.
  // Both actions open the document in a new tab, and the difference between them
  // is the print dialog — which is exactly how they differ in production
  // (confirmed 21 Aug 2026): Print raises it automatically, Download PDF does
  // not and leaves the operator to save from the viewer.
  //
  // Production reaches a real `blob:` PDF, because a backend renders the document
  // to a PDF binary. This repo has no PDF generator — the document is React plus
  // print CSS — so the browser's print dialog, with "Save as PDF" as its
  // destination, is the only route to a file here. That is a capability gap, not
  // a design choice; the document itself is identical either way.
  const openInvoice = (autoprint: boolean) => {
    const suffix = autoprint ? "&autoprint=1" : ""
    window.open(
      `/sales/invoice-document?sale=${data.id}&surface=pdf${suffix}`,
      "_blank",
      "noopener",
    )
  }

  const invoiceDoc = invoiceFromSale(data)
  // Production hands out `https://business.getcami.io/invoice/<id>`, and this
  // repo serves the same path at /invoice/<id> — so the shared link is real and
  // openable here, not a cosmetic string. Falls back to the production host
  // during SSR, where there is no origin to read.
  const invoiceOrigin =
    typeof window === "undefined" ? "https://business.getcami.io" : window.location.origin
  const invoiceUrl = `${invoiceOrigin}/invoice/${data.id}`
  const methodLabel = (p: SalePayment) =>
    p.kind === "cash"
      ? "Cash"
      : p.kind === "card"
        ? "Card"
        : railLabel(data.camipay?.rail ?? "terminal")
  const voidPayments = data.payments
    ? data.payments.map((p) => ({ amountMinor: p.amountMinor, method: methodLabel(p), at: p.at }))
    : collectedMinor <= 0
      ? []
      : data.status === "completed"
        ? (() => {
            const other = Math.round(collectedMinor * 0.4)
            return [
              { amountMinor: collectedMinor - other, method: "Cash", at: data.saleAt },
              { amountMinor: other, method: "Other", at: data.saleAt },
            ]
          })()
        : [{ amountMinor: collectedMinor, method: "Cash", at: data.saleAt }]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Sale {refOf(data.id)} for {data.client}
        </DialogDescription>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "details" | "activity")}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-0 bg-muted/40">
            <DialogHeader className="flex flex-col gap-3 px-9 pt-[28px] pb-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                    pill,
                  )}
                >
                  {data.status === "completed" ? <CheckIcon className="size-3.5" /> : null}
                  {data.status === "refunded" ? <RotateCcwIcon className="size-3.5" /> : null}
                  {status.label}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {/* Status-specific primary action:
                      • completed → filled "Share invoice" (positive follow-up)
                      • refunded  → outline "Share invoice" (terminal post-event)
                      • voided    → no button (action drops to the kebab menu)
                      • unpaid / part-paid → filled "Pay now" (balance owed) */}
                  {data.status === "completed" ? (
                    <Button
                      type="button"
                      size="sm"
                      radius="full"
                      onClick={() => setShareInvoiceOpen(true)}
                    >
                      Share invoice
                    </Button>
                  ) : data.status === "refunded" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      radius="full"
                      onClick={() => setShareInvoiceOpen(true)}
                    >
                      Share invoice
                    </Button>
                  ) : data.status === "unpaid" || data.status === "part-paid" ? (
                    <Button type="button" size="sm" radius="full">
                      Pay now
                    </Button>
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        radius="full"
                        aria-label="Quick actions"
                      >
                        <MoreVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    {/* Quick actions menu — items differ by sale status:
                        • voided:   only Add a note + Print + Download PDF
                        • refunded: + Refund sale, Email
                        • completed/part-paid/unpaid: + Edit sale details, Void sale
                          (Refund sale hidden on unpaid — nothing to refund) */}
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                      {data.status !== "voided" &&
                      data.status !== "unpaid" &&
                      refundable.length > 0 ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            setRefundPaymentId(null)
                            setRefundOpen(true)
                          }}
                        >
                          <RotateCcwIcon className="size-4" />
                          Refund sale
                        </DropdownMenuItem>
                      ) : null}
                      {data.status !== "voided" && data.status !== "refunded" ? (
                        <DropdownMenuItem>
                          <PencilIcon className="size-4" />
                          Edit sale details
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem>
                        <NotebookPenIcon className="size-4" />
                        Add a note
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {data.status !== "voided" ? (
                        <DropdownMenuItem onSelect={() => setEmailInvoiceOpen(true)}>
                          <SendIcon className="size-4" />
                          Email
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem onSelect={() => openInvoice(true)}>
                        <PrinterIcon className="size-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openInvoice(false)}>
                        <DownloadIcon className="size-4" />
                        Download PDF
                      </DropdownMenuItem>

                      {/* Voiding deletes every payment, so it is not offered
                          while any of them was taken at a location this viewer
                          does not hold. */}
                      {data.status !== "voided" &&
                      data.status !== "refunded" &&
                      elsewhere.length === 0 ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setVoidOpen(true)}
                          >
                            Void sale
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      radius="full"
                      aria-label="Close"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-[28px] leading-8 font-semibold">Sale</DialogTitle>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatDate(data.saleAt)}</span>
                  <span aria-hidden>·</span>
                  <span>Pet</span>
                  {isMultiLocation ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{locationName(data.locationId)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </DialogHeader>

            <div className="flex items-center gap-6 px-9">
              <TabsList variant="underline">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-6">
            <TabsContent value="details" className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onViewProfile}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate font-semibold text-foreground">{data.client}</span>
                  <span className="truncate text-sm text-muted-foreground">{clientEmail}</span>
                </div>
                <Avatar
                  size="md"
                  fallback="character"
                  name={data.client}
                  hashSeed={data.client.toLowerCase().replace(/\s+/g, "-")}
                />
              </button>

              {/* Gift-card item — present when this sale sold a gift card. Mirrors
                  the line in the receipt below and links back to the card. */}
              {giftCard ? (
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">
                        {formatAed(giftCard.valueAed)} - Gift Card
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {giftCard.code} <span aria-hidden>•</span>{" "}
                        <span
                          className={cn(
                            giftCard.status === "Active" && "text-cami-green-11",
                            giftCard.status === "Expired" && "text-muted-foreground",
                          )}
                        >
                          {giftCard.status}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        radius="full"
                        onClick={() => {
                          onOpenChange(false)
                          router.push(`/sales/gift-cards-sold?card=${giftCard.cardId}`)
                        }}
                      >
                        View gift card
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        radius="full"
                        onClick={() => setShareOpen(true)}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-cami-violet-3 text-cami-violet-11">
                    <GiftIcon className="size-4" />
                  </span>
                </div>
              ) : null}

              {/* Refund card — only for refunded sales. Sits ABOVE the original
                  sale card so the user sees what was refunded, then the sale
                  it came from. */}
              {data.status === "refunded" ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg font-semibold text-foreground">
                      Refund {receiptNumberFor(data)}
                    </span>
                    <span className="text-sm text-muted-foreground">{formatDate(data.saleAt)}</span>
                  </div>

                  <span className="text-sm text-foreground">Accidental charge</span>

                  <div className="h-px bg-border/60" />

                  <div className="flex items-baseline justify-between gap-2 text-sm font-medium text-foreground">
                    <span>Refund Amount</span>
                    <span className="tabular-nums">- {formatAed(totalAbs)}</span>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">- {formatAed(totalAbs)}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums">- {formatAed(totalAbs)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        Refund
                        <span className="inline-flex items-center gap-1 rounded-md bg-cami-green-3 px-1.5 py-0.5 text-xs font-medium text-cami-green-11">
                          <BanknoteIcon className="size-3" />
                          Cash
                        </span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatDate(data.saleAt)} at {formatTime(data.saleAt)}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">
                      - {formatAed(totalAbs)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold text-foreground">
                    {/* Resolved, never guessed. This said `id - 1`, which on this
                        very data cites sale 12 — a VOIDED one — and now that
                        sequences are per branch it could also name another
                        branch's document entirely. Same resolver the invoice
                        uses, so the two cannot disagree. */}
                    Sale{" "}
                    {data.status === "refunded"
                      ? (originalFor(data)?.number ?? "—")
                      : receiptNumberFor(data)}
                  </span>
                  <span className="text-sm text-muted-foreground">{formatDate(data.saleAt)}</span>
                </div>

                {/* The lines, when the sale carries them. A saved sale is a
                    list of totals for most of this seed, and the single row
                    below is what it has always drawn — but a line a package
                    session paid for cannot be told from a free one by its
                    figure alone, so where the lines exist they are printed. */}
                {data.items && data.items.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {data.items.map((item) => (
                      <SaleLineRow key={item.name} item={item} />
                    ))}
                  </ul>
                ) : (
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-baseline justify-between gap-3 text-sm">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium text-foreground">
                          {giftCard ? `${formatAed(giftCard.valueAed)} - Gift Card` : "Haircut"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {giftCard
                            ? `${giftCard.code} · Husain NGI`
                            : `${formatTime(data.saleAt)}, ${formatDate(data.saleAt)} · 1h 30min · Hussain S…`}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium text-foreground tabular-nums">
                        {formatAed(totalAbs)}
                      </span>
                    </li>
                  </ul>
                )}

                <div className="h-px bg-border/60" />

                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatAed(totalAbs)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums">{formatAed(totalAbs)}</span>
                  </div>
                </div>

                {/* Payment block — skipped for voided sales (no money moved).
                    One line per payment; a location is named only on one taken
                    somewhere other than the sale's. */}
                {data.status !== "voided" && paid > 0
                  ? payments.map((p) => (
                      <div key={p.id} className="flex flex-col gap-4">
                        <div className="h-px bg-border/60" />
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                              Payment
                              <PaymentMethodBadge
                                kind={p.kind}
                                rail={data.camipay?.rail}
                                label={methodLabel(p)}
                              />
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {formatDate(p.at)} at {formatTime(p.at)}
                              {takenElsewhere(p) ? ` · ${locationName(p.locationId)}` : ""}
                            </span>
                          </div>
                          <span className="shrink-0 font-medium text-foreground tabular-nums">
                            {formatAed(Math.round(p.amountMinor / 100))}
                          </span>
                        </div>
                      </div>
                    ))
                  : null}

                {/* What Cami took out of this payment. Only for CamiPay, and
                    only once money has actually moved — a fee on an unpaid or
                    voided sale is a number for a thing that never happened. */}
                {data.camipay && data.status !== "voided" && paid > 0 ? (
                  <>
                    <div className="h-px bg-border/60" />
                    {/* `collectedMinor`, not `paidMinor`: a completed sale's
                        paid figure includes change tendered back, and Cami
                        charges on what was captured, not what crossed the
                        counter. */}
                    <CamiPayFeeBreakdown
                      rail={data.camipay.rail}
                      rate={data.camipay.rate}
                      amountMinor={collectedMinor}
                      capturedOnLabel={formatDate(data.saleAt)}
                    />
                  </>
                ) : null}

                {/* Balance / Change line — only render when there's something to show. */}
                {data.status !== "voided" && balance !== 0 ? (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                      <span>{balance > 0 ? "Balance" : "Change"}</span>
                      <span className="tabular-nums">{formatAed(Math.abs(balance))}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex flex-col gap-4">
              <span className="text-sm font-medium text-foreground">May</span>
              <ol className="flex flex-col">
                <ActivityRow
                  title={`Sale ${data.id} created`}
                  timestamp={`Yesterday at ${formatTime(data.saleAt)}`}
                  body={`Completed by Hussain Shabbir`}
                  trailing={
                    <Avatar
                      size="md"
                      className="size-8"
                      fallback="character"
                      name="Hussain Shabbir"
                      hashSeed="hussain-shabbir"
                    />
                  }
                />
                {data.payments ? (
                  data.payments.map((p, index, all) => (
                    <ActivityRow
                      key={p.id}
                      title={`${formatAed(Math.round(p.amountMinor / 100))} paid by ${methodLabel(p).toLowerCase()}`}
                      timestamp={`${formatDate(p.at)} at ${formatTime(p.at)}`}
                      body={`Payment taken by Hussain Shabbir${
                        takenElsewhere(p) ? ` · at ${locationName(p.locationId)}` : ""
                      }`}
                      trailing={
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11 ring-2 ring-background">
                          {p.kind === "cash" ? (
                            <BanknoteIcon className="size-4" />
                          ) : (
                            <CreditCardIcon className="size-4" />
                          )}
                        </span>
                      }
                      footer={
                        <PaymentActions
                          canRefund={!elsewhereIds.has(p.id)}
                          onRefund={() => openPaymentRefund(p.id)}
                        />
                      }
                      isLast={index === all.length - 1}
                    />
                  ))
                ) : (
                  <ActivityRow
                    title={`${formatAed(Math.abs(gross))} paid by cash`}
                    timestamp={`Yesterday at ${formatTime(data.saleAt)}`}
                    body="Payment taken by Hussain Shabbir"
                    trailing={
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11 ring-2 ring-background">
                        <BanknoteIcon className="size-4" />
                      </span>
                    }
                    footer={
                      <PaymentActions
                        canRefund={elsewhere.length === 0}
                        onRefund={payments[0] ? () => openPaymentRefund(payments[0].id) : undefined}
                      />
                    }
                    isLast
                  />
                )}
              </ol>
              <p className="text-xs text-muted-foreground">
                Activity for this sale in the last 90 days
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      <RefundSaleDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        sale={{
          id: data.id,
          saleAt: data.saleAt,
          subjectLabel: "Pet",
          // Refundable = what was collected, capped at the sale total (a
          // completed sale's `paidMinor` includes change tendered back).
          availableMinor: refundPayment
            ? Math.min(refundPayment.amountMinor, grossAbsMinor)
            : data.payments
              ? refundable.reduce((sum, p) => sum + p.amountMinor, 0)
              : Math.min(paidMinor, grossAbsMinor),
          paymentMethod: "Cash",
          alreadyRefunded: data.status === "refunded",
          // Only the payments this viewer may refund. One taken at a location
          // they do not hold is not offered (LOCATION_ACCESS_DENIED).
          payments: refundPayment
            ? [
                {
                  id: refundPayment.id,
                  method: methodLabel(refundPayment),
                  kind: refundPayment.kind === "cash" ? ("cash" as const) : ("card" as const),
                  availableMinor: Math.min(refundPayment.amountMinor, grossAbsMinor),
                },
              ]
            : data.payments
              ? refundable.map((p) => ({
                  id: p.id,
                  method: methodLabel(p),
                  kind: p.kind === "cash" ? ("cash" as const) : ("card" as const),
                  availableMinor: p.amountMinor,
                }))
              : undefined,
        }}
      />

      <VoidSaleDialog open={voidOpen} onOpenChange={setVoidOpen} payments={voidPayments} />

      <ShareGiftCardDialog open={shareOpen} onOpenChange={setShareOpen} />

      {/* Production's Share invoice: a copyable invoice link plus share targets,
          layered over the sale rather than navigating away from it. The link is
          the ticket's "unique invoice link", so it renders the same document as
          the PDF and the email attachment. */}
      <ShareInvoiceDialog
        open={shareInvoiceOpen}
        onOpenChange={setShareInvoiceOpen}
        invoiceUrl={invoiceUrl}
        merchantName={invoiceDoc.issuer.tradingName ?? invoiceDoc.issuer.legalName}
        saleNumber={String(data.id)}
        isRefund={data.status === "refunded"}
        defaultEmail={clientEmail}
      />

      {/* Production's Email: one prefilled address, Cancel / Send. No document
          preview and no navigation — the attachment framing is reviewable on its
          own at /sales/invoice-document?sale=<id>&surface=email. */}
      <EmailInvoiceDialog
        open={emailInvoiceOpen}
        onOpenChange={setEmailInvoiceOpen}
        defaultEmail={clientEmail}
        documentLabel={`${documentTitle(invoiceDoc)} #${invoiceDoc.number}`}
      />
    </Dialog>
  )
}

/** The method chip on a payment line. */
function PaymentMethodBadge({
  kind,
  rail,
  label,
}: {
  kind: SalePayment["kind"]
  rail?: CamiPayRail
  label: string
}) {
  if (kind === "cash") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-cami-green-3 px-1.5 py-0.5 text-xs font-medium text-cami-green-11">
        <BanknoteIcon className="size-3" />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-cami-violet-3 px-1.5 py-0.5 text-xs font-medium text-cami-violet-11">
      {kind === "camipay" && rail === "online" ? (
        <LinkIcon className="size-3" />
      ) : (
        <CreditCardIcon className="size-3" />
      )}
      {label}
    </span>
  )
}

/**
 * A payment's actions on the Activity tab. Refund is absent, not disabled, for
 * a payment taken at a location the viewer does not hold.
 */
function PaymentActions({ canRefund, onRefund }: { canRefund: boolean; onRefund?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" radius="full" className="gap-1.5">
          Actions
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canRefund ? <DropdownMenuItem onSelect={onRefund}>Refund payment</DropdownMenuItem> : null}
        <DropdownMenuItem>Print receipt</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Draft detail dialog ──────────────────────────────────────────────────────
//
// Same shell as SaleDetailDialog (centered ~630px dialog, sticky header, Details
// / Activity underline tabs, scroll body) so the draft and sale surfaces read as
// one family. Drafts have no status variants — they're always "Unpaid" with the
// full total still owed, so the primary action is "Checkout" rather than Pay
// now / Share invoice. Walk-In drafts show a violet walk-in card instead of the
// clickable client row.

type DraftDetailDialogProps = {
  draft: Draft | null
  onOpenChange: (open: boolean) => void
  onViewProfile: () => void
  /** Resume the sale — reopens the cart on the Tip step with the draft loaded. */
  onCheckout: () => void
}

function DraftDetailDialog({
  draft,
  onOpenChange,
  onViewProfile,
  onCheckout,
}: DraftDetailDialogProps) {
  const open = draft !== null
  // Hold the last draft so the dialog can animate out after `draft` is cleared.
  const [last, setLast] = useState<Draft | null>(draft)
  const [tab, setTab] = useState<"details" | "activity">("details")
  useEffect(() => {
    if (draft) {
      setLast(draft)
      setTab("details")
    }
  }, [draft])

  const [confirmCancel, setConfirmCancel] = useState(false)

  const data = draft ?? last
  if (!data) return null

  const total = Math.round(data.grossMinor / 100)
  // Nothing has been tendered on a draft, so the whole total is still owed.
  const balance = total
  const isWalkIn = data.client === "Walk-In"
  const clientEmail = `${data.client.toLowerCase().replace(/\s+/g, ".")}@example.com`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogDescription className="sr-only">
            Draft sale #{data.id} for {data.client}
          </DialogDescription>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "details" | "activity")}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-col gap-3 px-9 pt-[28px] pb-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                      SALE_STATUS_CLASS.unpaid,
                    )}
                  >
                    Unpaid
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button type="button" size="sm" radius="full" onClick={onCheckout}>
                      Checkout
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          radius="full"
                          aria-label="Quick actions"
                        >
                          <MoreVerticalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setConfirmCancel(true)}
                        >
                          Cancel draft
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        radius="full"
                        aria-label="Close"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </DialogClose>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <DialogTitle className="text-[28px] leading-8 font-semibold">
                    Draft sale
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span>{formatWeekdayShort(data.createdAt)}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-6 px-9">
                <TabsList variant="underline">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-6">
              <TabsContent value="details" className="flex flex-col gap-3">
                {isWalkIn ? (
                  <div className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
                    <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                      Walk-In
                    </span>
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
                      <PersonStandingIcon className="size-6" />
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onViewProfile}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-semibold text-foreground">{data.client}</span>
                      <span className="truncate text-sm text-muted-foreground">{clientEmail}</span>
                    </div>
                    <Avatar
                      size="md"
                      fallback="character"
                      name={data.client}
                      hashSeed={data.client.toLowerCase().replace(/\s+/g, "-")}
                    />
                  </button>
                )}

                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg font-semibold text-foreground">#{data.id}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatWeekdayShort(data.createdAt)}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    <li className="flex items-baseline justify-between gap-3 text-sm">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium text-foreground">Haircut</span>
                        <span className="truncate text-xs text-muted-foreground">
                          1h 30min · Hussain Shabbir
                        </span>
                      </div>
                      <span className="shrink-0 font-medium text-foreground tabular-nums">
                        {formatAed(total)}
                      </span>
                    </li>
                  </ul>

                  <div className="h-px bg-border/60" />

                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatAed(total)}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums">{formatAed(total)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                    <span>Balance</span>
                    <span className="tabular-nums">{formatAed(balance)}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="flex flex-col gap-4">
                <span className="text-sm font-medium text-foreground">
                  {MONTH_SHORT[data.createdAt.getMonth()]}
                </span>
                <ol className="flex flex-col">
                  <ActivityRow
                    title={`Draft #${data.id} created`}
                    timestamp={`${formatWeekdayShort(data.createdAt)} at ${formatTime(data.createdAt)}`}
                    body="Created by Hussain Shabbir"
                    trailing={
                      <Avatar
                        size="md"
                        fallback="character"
                        name="Hussain Shabbir"
                        hashSeed="hussain-shabbir"
                      />
                    }
                    isLast
                  />
                </ol>
                <p className="text-xs text-muted-foreground">
                  Activity for this draft in the last 90 days
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel draft sale?"
        description="Canceling will remove this sale from the sales list."
        cancelLabel="Go back"
        confirmLabel="Confirm"
        onConfirm={() => {
          // Mock data — closing the detail dialog stands in for removing the
          // draft from the list.
          onOpenChange(false)
        }}
      />
    </>
  )
}

function ActivityRow({
  title,
  timestamp,
  body,
  trailing,
  footer,
  isLast,
}: {
  title: string
  timestamp: string
  body: React.ReactNode
  trailing?: React.ReactNode
  footer?: React.ReactNode
  isLast?: boolean
}) {
  return (
    <TimelineRow isLast={isLast}>
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
        <p className="mt-2 text-sm text-foreground">{body}</p>
        {footer ? <div className="mt-3 flex">{footer}</div> : null}
      </div>
    </TimelineRow>
  )
}

function SortableHead({ label, className }: { label: string; className?: string }) {
  return (
    <TableHead className={className}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          className?.includes("text-right") && "justify-end",
        )}
      >
        {label}
        <ArrowUpDownIcon className="size-3 text-muted-foreground/50" />
      </span>
    </TableHead>
  )
}
