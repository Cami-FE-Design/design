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
  MoreVerticalIcon,
  NotebookPenIcon,
  PencilIcon,
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

import { AppShell } from "@/components/blocks/app-shell"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
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
        <Button variant="outline" radius="full" size="sm" className="h-8 gap-1.5">
          {label}
          <CalendarIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Date range</span>
            <Select value={preset} onValueChange={(v) => handlePreset(v as PresetKey)}>
              <SelectTrigger className="h-10 w-full rounded-xl border border-input bg-input/40">
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
                className="h-10 rounded-xl"
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
                className="h-10 rounded-xl"
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

type Sale = {
  id: number
  client: string
  status: SaleStatus
  saleAt: Date
  tipsMinor: number
  grossMinor: number
}

// Demo today is 2026-05-25. Five "today" rows (one per status) guarantee every
// state is visible the moment the page opens; the rest are anchored on 22–24
// May so the Last-7/30/90 ranges also fill out. Ids 1–7 are preserved so
// existing deep-links (/sales/sales-list?sale=N referenced from /screens) keep
// working.
const MOCK_SALES: Sale[] = [
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
  // 24 May — extra variety alongside the originals.
  {
    id: 11,
    client: "Tom Cassidy",
    status: "completed",
    saleAt: new Date(2026, 4, 24, 16, 0),
    tipsMinor: 500,
    grossMinor: 6800,
  },
  {
    id: 10,
    client: "Karen Dougall",
    status: "unpaid",
    saleAt: new Date(2026, 4, 24, 13, 15),
    tipsMinor: 0,
    grossMinor: 1500,
  },
  {
    id: 9,
    client: "Aya Hassan",
    status: "part-paid",
    saleAt: new Date(2026, 4, 24, 11, 40),
    tipsMinor: 0,
    grossMinor: 3000,
  },
  {
    id: 8,
    client: "Millie Cassidy",
    status: "refunded",
    saleAt: new Date(2026, 4, 24, 9, 25),
    tipsMinor: 0,
    grossMinor: -2100,
  },
  // Original 7 — preserved so /screens?sale=N deep-links don't break.
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
    id: 5,
    client: "Jane Doe",
    status: "unpaid",
    saleAt: new Date(2026, 4, 22, 11, 34),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 4,
    client: "John Doe",
    status: "unpaid",
    saleAt: new Date(2026, 4, 22, 10, 52),
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
  unpaid: { label: "Unpaid", className: "bg-cami-yellow-5 text-cami-yellow-12" },
  refunded: { label: "Refunded", className: "bg-olive-5 text-olive-12" },
  voided: { label: "Voided", className: "bg-tomato-8 text-tomato-12" },
}

// Status pill used at the top of the centered sale-detail dialog header.
// Same palette as the listing row badge for visual continuity between the
// row and the open detail dialog.
const STATUS_DIALOG_PILL: Record<SaleStatus, string> = {
  completed: "bg-lime-5 text-lime-12",
  "part-paid": "bg-gold-5 text-gold-12",
  unpaid: "bg-cami-yellow-5 text-cami-yellow-12",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

function SalesListPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSaleId = searchParams.get("sale")

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

  // Anchor "today" in the demo so the empty state is reproducible against the
  // hard-coded fixture dates (May 2026).
  const today = useMemo(() => startOfDay(new Date(2026, 4, 25)), [])
  const [tab, setTab] = useState<"sales" | "drafts">("sales")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("sale-desc")
  const [range, setRange] = useState<DateRange>(() => rangeForPreset("today", today))
  const [selectedClient, setSelectedClient] = useState<ClientDetailClient | null>(null)

  // URL is the source of truth — match the `?sale=<id>` param to a row.
  const selectedSale = selectedSaleId
    ? (MOCK_SALES.find((s) => String(s.id) === selectedSaleId) ?? null)
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
  const draftsCount = 0

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Sales</h1>
            <p className="text-sm text-muted-foreground">Manage your sales history and invoices</p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" className="h-9 gap-1.5 px-4">
                  Options
                  <ChevronDownIcon className="size-4" />
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

            <Button radius="full" className="h-9 gap-1.5 px-4">
              <PlusIcon className="size-4" />
              Add new
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
        <Tabs
          className="flex min-h-0 flex-1 flex-col gap-4"
          value={tab}
          onValueChange={(v) => setTab(v as "sales" | "drafts")}
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
                  placeholder="Search by Sale or Client"
                  aria-label="Search sales"
                  onValueChange={setQuery}
                />
                <DateRangePopover value={range} onChange={setRange} today={today} />
                <Button variant="outline" aria-label="Filter" className="size-8 rounded-full">
                  <SlidersHorizontalIcon className="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5 px-3">
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

          {sorted.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16">
              <TagIcon
                className="size-10 -rotate-[20deg] stroke-[1.25] text-cami-violet-9"
                aria-hidden="true"
              />
              <p className="mt-3 text-base font-semibold text-foreground">
                {tab === "drafts" ? "No drafts yet" : "No sales yet"}
              </p>
              <Button variant="outline" radius="full" size="sm" className="mt-4 h-8 gap-1.5">
                {tab === "drafts" ? "Create new draft" : "Create new sale"}
              </Button>
            </div>
          ) : (
            <Table containerClassName="min-h-0 flex-1">
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
                        {formatDateOnly(s.saleAt)}, {formatTimeOnly(s.saleAt)}
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

          {sorted.length > 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Showing {sorted.length} of {sorted.length} results
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

function SaleDetailDialog({ sale, onOpenChange, onViewProfile }: SaleDetailDialogProps) {
  const open = sale !== null
  // Hold the last sale so the dialog animates out with its content still
  // rendered after `sale` is cleared.
  const [last, setLast] = useState<Sale | null>(sale)
  const [tab, setTab] = useState<"details" | "activity">("details")
  useEffect(() => {
    if (sale) {
      setLast(sale)
      setTab("details")
    }
  }, [sale])

  const data = sale ?? last
  if (!data) return null

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
                        <DropdownMenuItem>
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
                          <DropdownMenuItem variant="destructive">Void sale</DropdownMenuItem>
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
                      <span className="font-medium text-foreground">Haircut</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatTimeOnly(data.saleAt)}, {formatDateOnly(data.saleAt)} · 1h 30min ·
                        Hussain S…
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
    </Dialog>
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
