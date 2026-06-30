"use client"

import {
  ArrowUpDownIcon,
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  GiftIcon,
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
import { CartFlow } from "@/app/sales/new-sale/cart-flow"
import { AppShell } from "@/components/blocks/app-shell"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { RefundSaleDialog } from "@/components/blocks/refund-sale-dialog"
import { ShareGiftCardDialog } from "@/components/blocks/share-gift-card-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { VoidSaleDialog } from "@/components/blocks/void-sale-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY = "AED"

function money(amount: number) {
  if (amount < 0) {
    return `- ${CURRENCY} ${Math.abs(amount).toLocaleString()}`
  }
  return `${CURRENCY} ${amount.toLocaleString()}`
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

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Weekday-led format used in the draft detail dialog header and receipt card
// ("Tue, Jun 2"), matching the figma. The listing rows use formatDateOnly.
function formatWeekdayShort(d: Date) {
  return `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
}

function formatTimeOnly(d: Date) {
  let h = d.getHours()
  const m = d.getMinutes()
  const meridiem = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}${meridiem}`
}

function startOfDay(d: Date) {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function endOfDay(d: Date) {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

function addDays(d: Date, days: number) {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

function toIso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseIso(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split("-").map(Number)
  const out = new Date(y, m - 1, d)
  return Number.isNaN(out.getTime()) ? null : out
}

// ─── Date range presets ───────────────────────────────────────────────────────

type PresetKey =
  | "today"
  | "yesterday"
  | "last-7"
  | "last-30"
  | "last-90"
  | "last-month"
  | "week-to-date"
  | "month-to-date"
  | "quarter-to-date"
  | "year-to-date"
  | "custom"

const PRESETS: Array<{ key: PresetKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last-7", label: "Last 7 days" },
  { key: "last-30", label: "Last 30 days" },
  { key: "last-90", label: "Last 90 days" },
  { key: "last-month", label: "Last month" },
  { key: "week-to-date", label: "Week to date" },
  { key: "month-to-date", label: "Month to date" },
  { key: "quarter-to-date", label: "Quarter to date" },
  { key: "year-to-date", label: "Year to date" },
]

type DateRange = { from: Date; to: Date }

function rangeForPreset(key: PresetKey, today: Date): DateRange {
  const t = startOfDay(today)
  switch (key) {
    case "today":
      return { from: t, to: t }
    case "yesterday": {
      const y = addDays(t, -1)
      return { from: y, to: y }
    }
    case "last-7":
      return { from: addDays(t, -6), to: t }
    case "last-30":
      return { from: addDays(t, -29), to: t }
    case "last-90":
      return { from: addDays(t, -89), to: t }
    case "last-month": {
      const from = new Date(t.getFullYear(), t.getMonth() - 1, 1)
      const to = new Date(t.getFullYear(), t.getMonth(), 0)
      return { from, to }
    }
    case "week-to-date": {
      // Week starts Monday — matches the calendar in the figma.
      const dow = (t.getDay() + 6) % 7
      return { from: addDays(t, -dow), to: t }
    }
    case "month-to-date":
      return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }
    case "quarter-to-date": {
      const qStart = Math.floor(t.getMonth() / 3) * 3
      return { from: new Date(t.getFullYear(), qStart, 1), to: t }
    }
    case "year-to-date":
      return { from: new Date(t.getFullYear(), 0, 1), to: t }
    case "custom":
      return { from: t, to: t }
  }
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function inferPreset(range: DateRange, today: Date): PresetKey {
  for (const p of PRESETS) {
    const candidate = rangeForPreset(p.key, today)
    if (sameDay(candidate.from, range.from) && sameDay(candidate.to, range.to)) {
      return p.key
    }
  }
  return "custom"
}

// ─── Date range popover ───────────────────────────────────────────────────────

type DateRangePopoverProps = {
  value: DateRange
  onChange: (next: DateRange) => void
  today: Date
}

function DateRangePopover({ value, onChange, today }: DateRangePopoverProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)
  const [preset, setPreset] = useState<PresetKey>(() => inferPreset(value, today))
  const [fromText, setFromText] = useState(() => toIso(value.from))
  const [toText, setToText] = useState(() => toIso(value.to))

  // Sync the editing state when the popover opens, so reopening starts from the
  // currently-applied range rather than the last in-flight edit.
  useEffect(() => {
    if (!open) return
    setDraft(value)
    setPreset(inferPreset(value, today))
    setFromText(toIso(value.from))
    setToText(toIso(value.to))
  }, [open, value, today])

  function commitDraft(next: DateRange) {
    setDraft(next)
    setFromText(toIso(next.from))
    setToText(toIso(next.to))
    setPreset(inferPreset(next, today))
  }

  function handlePreset(key: PresetKey) {
    setPreset(key)
    if (key === "custom") return
    commitDraft(rangeForPreset(key, today))
  }

  function apply() {
    onChange(draft)
    setOpen(false)
  }

  const label = useMemo(() => {
    const matched = PRESETS.find((p) => p.key === inferPreset(value, today))
    if (matched) return matched.label
    return `${formatDateOnly(value.from)} – ${formatDateOnly(value.to)}`
  }, [value, today])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {label}
          <CalendarIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Date range</span>
            <Select value={preset} onValueChange={(v) => handlePreset(v as PresetKey)}>
              <SelectTrigger className="data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Starting</span>
              <Input
                value={fromText}
                onChange={(e) => {
                  const next = e.target.value
                  setFromText(next)
                  const parsed = parseIso(next)
                  if (parsed) {
                    setDraft((d) => ({ from: parsed, to: parsed > d.to ? parsed : d.to }))
                    setPreset("custom")
                  }
                }}
                aria-label="Starting date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Ending</span>
              <Input
                value={toText}
                onChange={(e) => {
                  const next = e.target.value
                  setToText(next)
                  const parsed = parseIso(next)
                  if (parsed) {
                    setDraft((d) => ({ from: parsed < d.from ? parsed : d.from, to: parsed }))
                    setPreset("custom")
                  }
                }}
                aria-label="Ending date"
              />
            </div>
          </div>

          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: draft.from, to: draft.to }}
            onSelect={(r) => {
              if (!r?.from) return
              const from = startOfDay(r.from)
              const to = startOfDay(r.to ?? r.from)
              commitDraft({ from, to })
            }}
            defaultMonth={draft.from}
            weekStartsOn={1}
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" radius="full" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button radius="full" size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type SaleStatus = "completed" | "part-paid" | "unpaid" | "refunded" | "voided"

/** Gift-card purchase reference — present on sales that sold a gift card. */
export type SaleGiftCard = {
  /** Gift card id on /sales/gift-cards-sold, for the "View gift card" link. */
  cardId: string
  code: string
  /** Display status label, e.g. "Active". */
  status: string
  valueAed: number
}

export type Sale = {
  id: number
  client: string
  status: SaleStatus
  saleAt: Date
  tipsMinor: number
  grossMinor: number
  /** Set when this sale is a gift-card purchase (drives the gift-card item UI). */
  giftCard?: SaleGiftCard
}

// Demo today is 2026-05-25. Trimmed to 10 rows: five "today" rows (one per
// status) guarantee every state is visible the moment the page opens, plus
// five older rows anchored on 22–24 May so the Last-7/30/90 ranges also fill
// out. The kept ids (1, 2, 3, 6, 7, 12–16) are exactly the ones deep-linked
// from /screens and the appointments "View sale" (?sale=2), so no existing
// link breaks.
export const MOCK_SALES: Sale[] = [
  // 25 May — today. One per status so the default Today view shows every state.
  {
    id: 16,
    client: "Tom Cassidy",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 14, 30),
    tipsMinor: 1000,
    grossMinor: 5400,
  },
  {
    id: 15,
    client: "Karen Dougall",
    status: "part-paid",
    saleAt: new Date(2026, 4, 25, 12, 5),
    tipsMinor: 0,
    grossMinor: 3800,
  },
  {
    id: 14,
    client: "Millie Cassidy",
    status: "unpaid",
    saleAt: new Date(2026, 4, 25, 11, 20),
    tipsMinor: 0,
    grossMinor: 2100,
  },
  {
    id: 13,
    client: "Aya Hassan",
    status: "refunded",
    saleAt: new Date(2026, 4, 25, 10, 45),
    tipsMinor: 0,
    grossMinor: -1800,
  },
  {
    id: 12,
    client: "Charmaine Hayes",
    status: "voided",
    saleAt: new Date(2026, 4, 25, 9, 50),
    tipsMinor: 0,
    grossMinor: 4200,
  },
  // Older rows — preserved so /screens?sale=N deep-links don't break.
  {
    id: 7,
    client: "Jane Doe",
    status: "completed",
    saleAt: new Date(2026, 4, 24, 10, 15),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 6,
    client: "Jane Doe",
    status: "part-paid",
    saleAt: new Date(2026, 4, 24, 10, 15),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 3,
    client: "John Doe",
    status: "refunded",
    saleAt: new Date(2026, 4, 22, 10, 45),
    tipsMinor: 0,
    grossMinor: -900,
  },
  {
    id: 2,
    client: "John Doe",
    status: "part-paid",
    saleAt: new Date(2026, 4, 22, 10, 33),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 1,
    client: "John Doe",
    status: "voided",
    saleAt: new Date(2026, 4, 22, 10, 2),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  // Gift-card-purchase sales (ids 20–24). These back the rows on
  // /sales/gift-cards-sold — each gift card references one of these by id, so
  // the gift card's "View sale" opens the matching sale and they appear here in
  // the listing too (single source of truth, no duplicated sale data).
  {
    id: 24,
    client: "Aamena Fatta",
    status: "completed",
    saleAt: new Date(2026, 5, 1, 15, 33),
    tipsMinor: 0,
    grossMinor: 1050000,
    giftCard: { cardId: "gc-5", code: "ZTP3RG84", status: "Active", valueAed: 10500 },
  },
  {
    id: 23,
    client: "Luke Williams",
    status: "completed",
    saleAt: new Date(2025, 1, 20, 12, 10),
    tipsMinor: 0,
    grossMinor: 700000,
    giftCard: { cardId: "gc-4", code: "HK7VWQ1M", status: "Expired", valueAed: 7000 },
  },
  {
    id: 22,
    client: "Tom Cassidy",
    status: "completed",
    saleAt: new Date(2026, 3, 3, 16, 45),
    tipsMinor: 0,
    grossMinor: 530000,
    giftCard: { cardId: "gc-3", code: "BX9PLND2", status: "Redeemed", valueAed: 5300 },
  },
  {
    id: 21,
    client: "Millie Cassidy",
    status: "completed",
    saleAt: new Date(2026, 4, 12, 9, 5),
    tipsMinor: 0,
    grossMinor: 350000,
    giftCard: { cardId: "gc-2", code: "QM4KTRZA", status: "Active", valueAed: 3500 },
  },
  {
    id: 20,
    client: "Walk-In",
    status: "unpaid",
    saleAt: new Date(2026, 5, 29, 11, 20),
    tipsMinor: 0,
    grossMinor: 180000,
    giftCard: { cardId: "gc-1", code: "YYOSNPHO", status: "Unpaid", valueAed: 1800 },
  },
]

// Mirrors the SALE_BADGE_CLASS in client-detail-dialog (step-5 + step-12) so
// the same sale status reads identically in the listing row, the detail
// dialog header pill, and the Sales tab badges in the client modal. Hue map:
// completed = lime (paid), part-paid = gold, unpaid = cami-yellow, refunded
// = olive, voided = tomato. Voided uses step-8/-12 to match the destructive
// No-show badge weight in the appointments list — both are terminal "bad"
// states and read with the same visual emphasis.
const STATUS_META: Record<SaleStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-lime-5 text-lime-12" },
  "part-paid": { label: "Part Paid", className: "bg-gold-5 text-gold-12" },
  unpaid: { label: "Unpaid", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  refunded: { label: "Refunded", className: "bg-olive-5 text-olive-12" },
  voided: { label: "Voided", className: "bg-tomato-8 text-tomato-12" },
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
  createdAt: Date
  tipsMinor: number
  grossMinor: number
}

const MOCK_DRAFTS: Draft[] = [
  {
    id: "31A06EA3",
    client: "Walk-In",
    createdAt: new Date(2026, 5, 2, 17, 22),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: "7F2B19C4",
    client: "Karen Dougall",
    createdAt: new Date(2026, 5, 2, 14, 10),
    tipsMinor: 0,
    grossMinor: 6400,
  },
  {
    id: "A4D8E0F1",
    client: "Tom Cassidy",
    createdAt: new Date(2026, 5, 1, 16, 45),
    tipsMinor: 0,
    grossMinor: 3800,
  },
  {
    id: "C9B3A77D",
    client: "Walk-In",
    createdAt: new Date(2026, 4, 30, 11, 5),
    tipsMinor: 0,
    grossMinor: 1200,
  },
]

// Status pill used at the top of the centered sale-detail dialog header.
// Same palette as the listing row badge for visual continuity between the
// row and the open detail dialog.
const STATUS_DIALOG_PILL: Record<SaleStatus, string> = {
  completed: "bg-lime-5 text-lime-12",
  "part-paid": "bg-gold-5 text-gold-12",
  unpaid: "bg-cami-yellow-3 text-cami-yellow-11",
  refunded: "bg-olive-5 text-olive-12",
  voided: "bg-tomato-8 text-tomato-12",
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

  // URL is the source of truth — match the `?sale=<id>` param to a row.
  const selectedSale = selectedSaleId
    ? (MOCK_SALES.find((s) => String(s.id) === selectedSaleId) ?? null)
    : null
  // …and `?draft=<ref>` to a draft row.
  const selectedDraft = selectedDraftId
    ? (MOCK_DRAFTS.find((d) => d.id === selectedDraftId) ?? null)
    : null

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
      const t = s.saleAt.getTime()
      if (t < from || t > to) return false
      if (!q) return true
      return s.client.toLowerCase().includes(q) || String(s.id).includes(q)
    })
  }, [tab, range, q])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareSales(a, b, sort)),
    [filtered, sort],
  )

  // Drafts are filtered by search only — the date-range pill scopes completed
  // sales, but drafts are unfinished work the user always wants to see in full
  // regardless of when they were started.
  const filteredDrafts = useMemo(() => {
    if (!q) return MOCK_DRAFTS
    return MOCK_DRAFTS.filter(
      (d) => d.client.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
    )
  }, [q])
  const sortedDrafts = useMemo(
    () => [...filteredDrafts].sort((a, b) => compareDrafts(a, b, sort)),
    [filteredDrafts, sort],
  )

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort"

  // Tab counts — Sales is the in-range fixture rows (independent of search),
  // Drafts is always 0 in the demo.
  const salesCount = useMemo(() => {
    const from = startOfDay(range.from).getTime()
    const to = endOfDay(range.to).getTime()
    return MOCK_SALES.filter((s) => {
      const t = s.saleAt.getTime()
      return t >= from && t <= to
    }).length
  }, [range])
  const draftsCount = MOCK_DRAFTS.length

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Sales</h1>
            <p className="text-sm text-muted-foreground">Manage your sales history and invoices</p>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
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
              title={tab === "drafts" ? "No drafts match" : "No sales match"}
              description="Try a different search."
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
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateOnly(d.createdAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                        {money(Math.round(d.tipsMinor / 100))}
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap text-foreground tabular-nums">
                        {money(Math.round(d.grossMinor / 100))}
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
                  const status = STATUS_META[s.status]
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleId(s.id)}
                          className="cursor-pointer text-start text-sm font-medium text-cami-violet-11 hover:underline"
                        >
                          {s.id}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateOnly(s.saleAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                        {money(Math.round(s.tipsMinor / 100))}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm whitespace-nowrap tabular-nums",
                          s.grossMinor < 0 ? "text-tomato-11" : "text-foreground",
                        )}
                      >
                        {money(Math.round(s.grossMinor / 100))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {(tab === "drafts" ? sortedDrafts.length : sorted.length) > 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Showing {tab === "drafts" ? sortedDrafts.length : sorted.length} of{" "}
              {tab === "drafts" ? sortedDrafts.length : sorted.length} results
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
      />

      <CartFlow open={cartOpen} onOpenChange={setCartOpen} />
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
  const open = sale !== null
  // Hold the last sale so the dialog animates out with its content still
  // rendered after `sale` is cleared.
  const [last, setLast] = useState<Sale | null>(sale)
  const [tab, setTab] = useState<"details" | "activity">("details")
  const [refundOpen, setRefundOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  useEffect(() => {
    if (sale) {
      setLast(sale)
      setTab("details")
    }
  }, [sale])

  const data = sale ?? last
  if (!data) return null

  const giftCard = data.giftCard
  const status = STATUS_META[data.status]
  const pill = STATUS_DIALOG_PILL[data.status]
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
  const paidMinor =
    data.status === "completed"
      ? grossAbsMinor + 500
      : data.status === "part-paid"
        ? Math.round(grossAbsMinor * 0.8)
        : data.status === "refunded"
          ? grossAbsMinor
          : 0
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
  const voidPayments =
    collectedMinor <= 0
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
                    <Button type="button" size="sm" radius="full">
                      Share invoice
                    </Button>
                  ) : data.status === "refunded" ? (
                    <Button type="button" variant="outline" size="sm" radius="full">
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
                      {data.status !== "voided" && data.status !== "unpaid" ? (
                        <DropdownMenuItem onSelect={() => setRefundOpen(true)}>
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
                        <DropdownMenuItem>
                          <SendIcon className="size-4" />
                          Email
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem>
                        <PrinterIcon className="size-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DownloadIcon className="size-4" />
                        Download PDF
                      </DropdownMenuItem>

                      {data.status !== "voided" && data.status !== "refunded" ? (
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
                  <span>{formatDateOnly(data.saleAt)}</span>
                  <span aria-hidden>·</span>
                  <span>Pet</span>
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
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">
                        {money(giftCard.valueAed)} - Gift Card
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
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                    <GiftIcon className="size-5" />
                  </span>
                </div>
              ) : null}

              {/* Refund card — only for refunded sales. Sits ABOVE the original
                  sale card so the user sees what was refunded, then the sale
                  it came from. */}
              {data.status === "refunded" ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg font-semibold text-foreground">Refund #{data.id}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateOnly(data.saleAt)}
                    </span>
                  </div>

                  <span className="text-sm text-foreground">Accidental charge</span>

                  <div className="h-px bg-border/60" />

                  <div className="flex items-baseline justify-between gap-2 text-sm font-medium text-foreground">
                    <span>Refund Amount</span>
                    <span className="tabular-nums">- {money(totalAbs)}</span>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">- {money(totalAbs)}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums">- {money(totalAbs)}</span>
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
                        {formatDateOnly(data.saleAt)} at {formatTimeOnly(data.saleAt)}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">
                      - {money(totalAbs)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold text-foreground">
                    {/* For refunded, point to the originating sale id (id - 1 in demo data). */}
                    Sale #{data.status === "refunded" ? data.id - 1 : data.id}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateOnly(data.saleAt)}
                  </span>
                </div>

                <ul className="flex flex-col gap-2">
                  <li className="flex items-baseline justify-between gap-3 text-sm">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium text-foreground">
                        {giftCard ? `${money(giftCard.valueAed)} - Gift Card` : "Haircut"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {giftCard
                          ? `${giftCard.code} · Husain NGI`
                          : `${formatTimeOnly(data.saleAt)}, ${formatDateOnly(data.saleAt)} · 1h 30min · Hussain S…`}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">
                      {money(totalAbs)}
                    </span>
                  </li>
                </ul>

                <div className="h-px bg-border/60" />

                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{money(totalAbs)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums">{money(totalAbs)}</span>
                  </div>
                </div>

                {/* Payment block — skipped for voided sales (no money moved). */}
                {data.status !== "voided" && paid > 0 ? (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          Payment
                          <span className="inline-flex items-center gap-1 rounded-md bg-cami-green-3 px-1.5 py-0.5 text-xs font-medium text-cami-green-11">
                            <BanknoteIcon className="size-3" />
                            Cash
                          </span>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {formatDateOnly(data.saleAt)} at {formatTimeOnly(data.saleAt)}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium text-foreground tabular-nums">
                        {money(paid)}
                      </span>
                    </div>
                  </>
                ) : null}

                {/* Balance / Change line — only render when there's something to show. */}
                {data.status !== "voided" && balance !== 0 ? (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                      <span>{balance > 0 ? "Balance" : "Change"}</span>
                      <span className="tabular-nums">{money(Math.abs(balance))}</span>
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
                  timestamp={`Yesterday at ${formatTimeOnly(data.saleAt)}`}
                  body={`Completed by Hussain Shabbir`}
                  trailing={
                    <Avatar
                      size="md"
                      fallback="character"
                      name="Hussain Shabbir"
                      hashSeed="hussain-shabbir"
                    />
                  }
                />
                <ActivityRow
                  title={`${money(Math.abs(gross))} paid by cash`}
                  timestamp={`Yesterday at ${formatTimeOnly(data.saleAt)}`}
                  body="Payment taken by Hussain Shabbir"
                  trailing={
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
                      <BanknoteIcon className="size-5" />
                    </span>
                  }
                  footer={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                          Actions
                          <ChevronDownIcon className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>Refund payment</DropdownMenuItem>
                        <DropdownMenuItem>Print receipt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  isLast
                />
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
          availableMinor: Math.min(paidMinor, grossAbsMinor),
          paymentMethod: "Cash",
          alreadyRefunded: data.status === "refunded",
        }}
      />

      <VoidSaleDialog open={voidOpen} onOpenChange={setVoidOpen} payments={voidPayments} />

      <ShareGiftCardDialog open={shareOpen} onOpenChange={setShareOpen} />
    </Dialog>
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
}

function DraftDetailDialog({ draft, onOpenChange, onViewProfile }: DraftDetailDialogProps) {
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
                      STATUS_DIALOG_PILL.unpaid,
                    )}
                  >
                    Unpaid
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button type="button" size="sm" radius="full">
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
                        {money(total)}
                      </span>
                    </li>
                  </ul>

                  <div className="h-px bg-border/60" />

                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{money(total)}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 font-semibold text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums">{money(total)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
                    <span>Balance</span>
                    <span className="tabular-nums">{money(balance)}</span>
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
                    timestamp={`${formatWeekdayShort(data.createdAt)} at ${formatTimeOnly(data.createdAt)}`}
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
    <li className="grid grid-cols-[16px_minmax(0,1fr)] gap-3">
      <div className="relative flex justify-center">
        {!isLast ? (
          <div className="absolute inset-y-0 top-3 border-l border-dashed border-border" />
        ) : null}
        <div className="relative mt-3 size-2 shrink-0 rounded-full bg-foreground/40" />
      </div>
      <div className={cn("rounded-2xl border border-border/60 bg-card p-4", !isLast && "mb-4")}>
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
    </li>
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
