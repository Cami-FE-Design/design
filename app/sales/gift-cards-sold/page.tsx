"use client"

import {
  CalendarClockIcon,
  ChevronDownIcon,
  CopyIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  GiftIcon,
  PrinterIcon,
  SettingsIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { MOCK_SALES, type Sale, SaleDetailDialog } from "@/app/sales/sales-list/page"
import { AppShell } from "@/components/blocks/app-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { GiftCardVisual } from "@/components/blocks/gift-card-visual"
import { ShareGiftCardDialog } from "@/components/blocks/share-gift-card-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { TimelineRow } from "@/components/blocks/timeline-row"
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
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ─── Helpers ────────────────────────────────────────────────────────────────

const CURRENCY = "AED"

function money(amount: number) {
  return `${CURRENCY} ${amount.toLocaleString("en-US")}`
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

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// "Wednesday, 30 Jun 2027" — used by the Extend expiry select.
function formatLongDate(d: Date) {
  return `${WEEKDAY_FULL[d.getDay()]}, ${formatDate(d)}`
}

function addYears(d: Date, years: number) {
  return new Date(d.getFullYear() + years, d.getMonth(), d.getDate())
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type GiftCardStatus = "unpaid" | "active" | "redeemed" | "expired"

type GiftCardSold = {
  id: string
  code: string
  issuedAt: Date
  expiresAt: Date
  status: GiftCardStatus
  saleNo: number
  purchaser: string
  owner: string
  totalAed: number
  redeemedAed: number
}

const STATUS_META: Record<GiftCardStatus, { label: string; className: string }> = {
  unpaid: { label: "Unpaid", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  active: { label: "Active", className: "bg-lime-5 text-lime-12" },
  redeemed: { label: "Redeemed", className: "bg-olive-5 text-olive-12" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
}

const MOCK_GIFT_CARDS: GiftCardSold[] = [
  {
    id: "gc-1",
    code: "YYOSNPHO",
    issuedAt: new Date(2026, 5, 29),
    expiresAt: new Date(2027, 5, 29),
    status: "unpaid",
    saleNo: 20,
    purchaser: "Walk-In",
    owner: "Not claimed",
    totalAed: 1800,
    redeemedAed: 0,
  },
  {
    id: "gc-2",
    code: "QM4KTRZA",
    issuedAt: new Date(2026, 4, 12),
    expiresAt: new Date(2027, 4, 12),
    status: "active",
    saleNo: 21,
    purchaser: "Millie Cassidy",
    owner: "Millie Cassidy",
    totalAed: 3500,
    redeemedAed: 1200,
  },
  {
    id: "gc-3",
    code: "BX9PLND2",
    issuedAt: new Date(2026, 3, 3),
    expiresAt: new Date(2027, 3, 3),
    status: "redeemed",
    saleNo: 22,
    purchaser: "Tom Cassidy",
    owner: "Sarah Johnson",
    totalAed: 5300,
    redeemedAed: 5300,
  },
  {
    id: "gc-4",
    code: "HK7VWQ1M",
    issuedAt: new Date(2025, 1, 20),
    expiresAt: new Date(2026, 1, 20),
    status: "expired",
    saleNo: 23,
    purchaser: "Luke Williams",
    owner: "Not claimed",
    totalAed: 7000,
    redeemedAed: 0,
  },
  {
    id: "gc-5",
    code: "ZTP3RG84",
    issuedAt: new Date(2026, 5, 1),
    expiresAt: new Date(2027, 5, 1),
    status: "active",
    saleNo: 24,
    purchaser: "Aamena Fatta",
    owner: "Aamena Fatta",
    totalAed: 10500,
    redeemedAed: 4500,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function GiftCardsSoldPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")

  const [saleId, setSaleId] = useState<number | null>(null)
  const openSale = (n: number) => setSaleId(n)
  const sale: Sale | null = MOCK_SALES.find((s) => s.id === saleId) ?? null

  const selectedId = searchParams.get("card")
  const selected = MOCK_GIFT_CARDS.find((c) => c.id === selectedId) ?? null

  const openCard = (id: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("card", id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }
  const closeCard = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("card")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_GIFT_CARDS
    return MOCK_GIFT_CARDS.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.purchaser.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Gift cards sold</h1>
            <p className="text-sm text-muted-foreground">
              View, filter and export gift cards purchased by your clients.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" size="sm" className="gap-1.5">
                Options
                <ChevronDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <SettingsIcon className="size-4" />
                Gift cards settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Export</DropdownMenuLabel>
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
        <TableToolbar
          actions={
            <>
              <SearchInput
                className="h-9! w-72"
                placeholder="Search by Code, Purchaser or Owner"
                aria-label="Search gift cards"
                onValueChange={setQuery}
              />
              <Button variant="outline" size="icon-sm" radius="full" aria-label="Filter">
                <SlidersHorizontalIcon className="size-4" />
              </Button>
            </>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            variant="card"
            icon={GiftIcon}
            title="No gift cards match"
            description="Try a different search."
          />
        ) : (
          <Table containerClassName="flex-1 min-h-0">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20! shadow-[1px_0_0_0_var(--border)]">
                  Gift card
                </TableHead>
                <TableHead>Issue date</TableHead>
                <TableHead>Expiry date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sale #</TableHead>
                <TableHead>Purchaser</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Redeemed</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const status = STATUS_META[c.status]
                return (
                  <TableRow key={c.id}>
                    <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors [tr:hover_&]:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
                      <button
                        type="button"
                        onClick={() => openCard(c.id)}
                        className="cursor-pointer text-start text-sm font-medium text-cami-violet-11 hover:underline"
                      >
                        {c.code}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.issuedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("font-medium", status.className)}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => openSale(c.saleNo)}
                        className="cursor-pointer text-start text-sm font-medium text-cami-violet-11 hover:underline"
                      >
                        {c.saleNo}
                      </button>
                    </TableCell>
                    <TableCell>{c.purchaser}</TableCell>
                    <TableCell className="text-muted-foreground">{c.owner}</TableCell>
                    <TableCell className="text-right">{money(c.totalAed)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {money(c.redeemedAed)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {money(c.totalAed - c.redeemedAed)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <p className="pb-2 text-center text-xs text-muted-foreground">
          Showing {rows.length} of {MOCK_GIFT_CARDS.length} results
        </p>
      </div>

      {selected ? (
        <GiftCardDetailDialog card={selected} onClose={closeCard} onOpenSale={openSale} />
      ) : null}

      <SaleDetailDialog
        sale={sale}
        onOpenChange={(open) => !open && setSaleId(null)}
        onViewProfile={() => {}}
      />
    </AppShell>
  )
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function GiftCardDetailDialog({
  card,
  onClose,
  onOpenSale,
}: {
  card: GiftCardSold
  onClose: () => void
  onOpenSale: (saleNo: number) => void
}) {
  const [tab, setTab] = useState<"details" | "activity">("activity")
  const [shareOpen, setShareOpen] = useState(false)
  const [extendOpen, setExtendOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const status = STATUS_META[card.status]

  const openSale = () => onOpenSale(card.saleNo)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[560px] !max-w-[560px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">Gift card {card.code}</DialogDescription>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "details" | "activity")}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-0 bg-muted/40">
            <DialogHeader className="flex flex-col gap-3 px-9 pt-7 pb-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className={cn("font-medium", status.className)}>{status.label}</Badge>
                <div className="flex shrink-0 items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        radius="full"
                        className="gap-1.5"
                      >
                        Actions
                        <ChevronDownIcon className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => setShareOpen(true)}>
                        <Share2Icon className="size-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setExtendOpen(true)}>
                        <CalendarClockIcon className="size-4" />
                        Extend
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setPrintOpen(true)}>
                        <PrinterIcon className="size-4" />
                        Print
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
                <DialogTitle className="text-[28px] font-semibold leading-8">Gift card</DialogTitle>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatDate(card.issuedAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{card.code}</span>
                </div>
              </div>
            </DialogHeader>

            <div className="flex items-center gap-6 px-9">
              <TabsList variant="underline">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-6">
            <TabsContent value="activity">
              <GiftCardActivity card={card} onOpenSale={openSale} />
            </TabsContent>
            <TabsContent value="details">
              <GiftCardDetails card={card} onOpenSale={openSale} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      <ShareGiftCardDialog open={shareOpen} onOpenChange={setShareOpen} />
      <ExtendGiftCardDialog card={card} open={extendOpen} onOpenChange={setExtendOpen} />
      <PrintGiftCardDialog card={card} open={printOpen} onOpenChange={setPrintOpen} />
    </Dialog>
  )
}

// Extend a gift card's expiry. Options are the current expiry plus +1/+2/+3
// years and Never.
function ExtendGiftCardDialog({
  card,
  open,
  onOpenChange,
}: {
  card: GiftCardSold
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const options = [
    { value: "current", label: formatLongDate(card.expiresAt) },
    { value: "1y", label: formatLongDate(addYears(card.expiresAt, 1)) },
    { value: "2y", label: formatLongDate(addYears(card.expiresAt, 2)) },
    { value: "3y", label: formatLongDate(addYears(card.expiresAt, 3)) },
    { value: "never", label: "Never" },
  ]
  const [value, setValue] = useState("current")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:!max-w-[480px] !max-w-[480px]">
        <div className="flex flex-col gap-2 px-8 pt-6">
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-[28px] font-semibold leading-8">
            Extend gift card expiry
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a new expiry date for this gift card.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-6">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Select child */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Expires</span>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="lg" radius="full" onClick={() => onOpenChange(false)}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// Standalone printable gift-card page written into a popup window, so the app's
// styles don't interfere and only the card prints. Inline styles + an inline
// gift SVG keep it self-contained (no external assets to wait on).
function buildGiftCardPrintHtml(
  card: GiftCardSold,
  fields: { sender: string; recipient: string; message: string },
) {
  const recipient = escapeHtml(fields.recipient.trim() || "there")
  const sender = escapeHtml(fields.sender.trim())
  const message = escapeHtml(fields.message.trim() || "Enjoy using this gift card at Cami.")
  const giftSvg = `<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Gift card ${escapeHtml(card.code)}</title>
<style>
  * { box-sizing: border-box; }
  /* Standard portrait page so the preview renders at normal scale. */
  @page { size: A4 portrait; margin: 16mm; }
  /* Force background colours/gradients to print — browsers drop them otherwise,
     which is why the blue card would vanish in the printout / PDF. */
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px; color: #18181b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .wrap { max-width: 420px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 16px; padding: 28px; }
  h1 { font-size: 20px; font-weight: 600; margin: 0 0 12px; }
  p { font-size: 14px; line-height: 20px; color: #3f3f46; margin: 0 0 6px; }
  .gift { margin-top: 16px; height: 180px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2563eb, #6d4aff); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .value { margin-top: 16px; min-height: 170px; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; }
  .amount { font-size: 28px; font-weight: 600; }
  .biz { font-size: 14px; color: #52525b; }
  .meta { margin-top: auto; display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
  .label { color: #71717a; margin-bottom: 2px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Hi ${recipient},</h1>
    <p>${message}</p>
    ${sender ? `<p>From ${sender}</p>` : ""}
    <div class="gift">${giftSvg}</div>
    <div class="value">
      <div class="amount">${money(card.totalAed)}</div>
      <div class="biz">Cami</div>
      <div class="meta">
        <div><div class="label">Code:</div>${escapeHtml(card.code)}</div>
        <div style="text-align:right"><div class="label">Expires:</div>${formatDate(card.expiresAt)}</div>
      </div>
    </div>
  </div>
  <script>setTimeout(function () { window.print() }, 250)</script>
</body>
</html>`
}

// Collect sender/recipient/message, then open a printable gift-card page and
// trigger the browser print dialog.
function PrintGiftCardDialog({
  card,
  open,
  onOpenChange,
}: {
  card: GiftCardSold
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [sender, setSender] = useState("")
  const [recipient, setRecipient] = useState("")
  const [message, setMessage] = useState("Enjoy using this gift card at Cami.")

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1100")
    if (win) {
      win.document.write(buildGiftCardPrintHtml(card, { sender, recipient, message }))
      win.document.close()
      win.focus()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:!max-w-[520px] !max-w-[520px]">
        <DialogDescription className="sr-only">
          Print a copy of this gift card with a personal message.
        </DialogDescription>

        <div className="flex flex-col gap-2 px-8 pt-6">
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-[28px] font-semibold leading-8">Print gift card</DialogTitle>
        </div>

        <div className="flex flex-col gap-5 px-8 pb-8 pt-6">
          <label htmlFor="print-gc-sender" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Sender name</span>
            <Input
              id="print-gc-sender"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />
          </label>
          <label htmlFor="print-gc-recipient" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Recipient name</span>
            <Input
              id="print-gc-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
          <label htmlFor="print-gc-message" className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Personal message</span>
              <span className="text-xs text-muted-foreground">{message.length}/200</span>
            </span>
            <Textarea
              id="print-gc-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
            />
          </label>
          <Button type="button" size="lg" radius="full" className="w-full" onClick={handlePrint}>
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type ActivityKind = "purchased" | "claimed" | "redeemed" | "fully-redeemed"

type ActivityEvent = {
  id: string
  title: string
  when: string
  by: string
  kind: ActivityKind
  secondary?: React.ReactNode
}

function buildActivity(card: GiftCardSold, onOpenSale: () => void): ActivityEvent[] {
  const remaining = card.totalAed - card.redeemedAed
  const claimed = card.owner !== "Not claimed"
  const events: ActivityEvent[] = []

  if (claimed && remaining === 0) {
    events.push({
      id: "claimed",
      title: "Gift card claimed",
      when: "Today at 11:20am",
      by: "Husain NGI",
      kind: "claimed",
      secondary: (
        <span>
          Added to <span className="font-medium text-cami-violet-11">{card.owner}</span>
        </span>
      ),
    })
  }
  if (card.redeemedAed > 0 && remaining === 0) {
    events.push({
      id: "fully",
      title: "Gift card fully redeemed",
      when: "Today at 11:20am",
      by: "Husain NGI",
      kind: "fully-redeemed",
    })
  } else if (card.redeemedAed > 0) {
    events.push({
      id: "partial",
      title: `${money(card.redeemedAed)} redeemed`,
      when: "Yesterday at 3:38pm",
      by: "Husain NGI",
      kind: "redeemed",
      secondary: `Remaining balance ${money(remaining)}`,
    })
  }
  events.push({
    id: "purchased",
    title: "Gift card purchased",
    when: "Yesterday at 3:33pm",
    by: "Husain NGI",
    kind: "purchased",
    secondary: (
      <button
        type="button"
        onClick={onOpenSale}
        className="cursor-pointer text-cami-violet-11 hover:underline"
      >
        View sale {card.saleNo}
      </button>
    ),
  })
  return events
}

function GiftCardActivity({ card, onOpenSale }: { card: GiftCardSold; onOpenSale: () => void }) {
  const remaining = card.totalAed - card.redeemedAed
  const events = buildActivity(card, onOpenSale)

  return (
    <div className="flex flex-col gap-6">
      <GiftCardVisual
        className="mx-auto"
        amount={money(remaining)}
        code={card.code}
        expires={formatDate(card.expiresAt)}
        copyableCode
      />

      <div>
        <p className="mb-2 text-sm text-muted-foreground">{MONTH_FULL[card.issuedAt.getMonth()]}</p>
        <ul className="flex flex-col">
          {events.map((event, i) => {
            const isLast = i === events.length - 1
            return (
              <TimelineRow key={event.id} isLast={isLast}>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-semibold text-foreground">{event.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {event.when} by {event.by}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <ActivityIcon event={event} />
                    </div>
                  </div>
                  {event.secondary ? (
                    <p className="mt-2 text-sm text-foreground">{event.secondary}</p>
                  ) : null}
                </div>
              </TimelineRow>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// Redeem events use the green gift glyph; lifecycle events (purchased/claimed)
// show the actor's avatar. The actor is always the staff member who performed
// it ("Husain NGI"), so the avatar colour stays consistent — it is NOT the
// owner/purchaser (those names would each hash to a different pastel).
function ActivityIcon({ event }: { event: ActivityEvent }) {
  if (event.kind === "redeemed" || event.kind === "fully-redeemed") {
    return (
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11 ring-2 ring-background">
        <GiftIcon className="size-4" />
      </span>
    )
  }
  return (
    <Avatar
      size="md"
      className="size-8"
      fallback="character"
      name="Husain NGI"
      hashSeed="husain-ngi"
    />
  )
}

function GiftCardDetails({ card, onOpenSale }: { card: GiftCardSold; onOpenSale: () => void }) {
  const status = STATUS_META[card.status]
  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <div className="flex flex-col divide-y divide-border/60 px-4 py-4">
        <DetailSection title="Balance">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DetailField label="Original amount" value={money(card.totalAed)} />
            <DetailField label="Redeemed" value={money(card.redeemedAed)} />
            <DetailField label="Remaining" value={money(card.totalAed - card.redeemedAed)} />
          </div>
        </DetailSection>

        <DetailSection title="Card">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DetailField
              label="Status"
              value={<Badge className={cn("font-medium", status.className)}>{status.label}</Badge>}
            />
            <DetailField
              label="Code"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {card.code}
                  <CopyButton value={card.code} />
                </span>
              }
            />
            <DetailField
              label="Sale #"
              value={
                <button
                  type="button"
                  onClick={onOpenSale}
                  className="cursor-pointer font-medium text-cami-violet-11 hover:underline"
                >
                  {card.saleNo}
                </button>
              }
            />
          </div>
        </DetailSection>

        <DetailSection title="People">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DetailField label="Purchaser" value={card.purchaser} />
            <DetailField label="Owner" value={card.owner} />
          </div>
        </DetailSection>

        <DetailSection title="Validity">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DetailField label="Issue date" value={formatDate(card.issuedAt)} />
            <DetailField label="Expires" value={formatDate(card.expiresAt)} />
          </div>
        </DetailSection>
      </div>
    </div>
  )
}

// Mirrors the Details-tab structure used by ClientDetailDialog / PetDetailDialog:
// grouped subsections separated by a divider, each a 2-column field grid.
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm">{value || "—"}</span>
    </div>
  )
}

function CopyButton({ value, className }: { value: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(value)}
      aria-label="Copy code"
      className={cn("text-muted-foreground transition-colors hover:text-foreground", className)}
    >
      <CopyIcon className="size-3.5" />
    </button>
  )
}

export default function GiftCardsSoldPage() {
  return (
    <Suspense fallback={null}>
      <GiftCardsSoldPageInner />
    </Suspense>
  )
}
