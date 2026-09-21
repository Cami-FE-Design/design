"use client"

import { ChevronDownIcon, FileSpreadsheetIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { CartFlow } from "@/app/sales/new-sale/cart-flow"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { AppShell } from "@/components/blocks/app-shell"
import { DateSelector } from "@/components/blocks/date-selector"
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
import { useLocations } from "@/lib/locations/store"
import {
  type DailySummary,
  dayIso,
  latestTradingDay,
  summarizeDay,
} from "@/lib/sales/daily-summary"
import { cn } from "@/lib/utils"

// ─── Derived from the sales log ───────────────────────────────────────────────
//
// Every figure on this page comes from `summarizeDay`, bounded by the grant
// before it sums (G7, R18). It used to be two cards of constants typed to match
// a Figma frame, with no branch anywhere on them — so an owner of nine branches
// read one merged number, which is exactly the failure the PRD's first user
// story names: "the roll-up shows a per-location breakdown side by side, not a
// merged total. A single number destroys the job."

function money(minor: number) {
  const aed = Math.round(minor / 100)
  if (aed < 0) return `- ${CURRENCY} ${Math.abs(aed).toLocaleString()}`
  return `${CURRENCY} ${aed.toLocaleString()}`
}

const CURRENCY = "AED"

// ─── Cards ────────────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden bg-card", className)}>
      <div className="px-5 py-4">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function TransactionSummary({ summary }: { summary: DailySummary }) {
  return (
    <SummaryCard title="Transaction summary">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item type</TableHead>
            <TableHead className="text-right">Sales qty</TableHead>
            <TableHead className="text-right">Refund qty</TableHead>
            <TableHead className="text-right">Gross total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.transactions.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-sm text-foreground">{row.label}</TableCell>
              <TableCell className="text-right text-sm text-foreground tabular-nums">
                {row.salesQty}
              </TableCell>
              <TableCell className="text-right text-sm text-foreground tabular-nums">
                {row.refundQty}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  row.grossMinor < 0 ? "text-tomato-11" : "text-foreground",
                )}
              >
                {money(row.grossMinor)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-border/60 bg-muted/30">
            <TableCell className="text-sm font-semibold text-foreground">Total Sales</TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {summary.transactionTotal.salesQty}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {summary.transactionTotal.refundQty}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {money(summary.transactionTotal.grossMinor)}
            </TableCell>
          </TableRow>
          {/* Below the total and outside it. Confirmed against the built
              summary: a gift card sold is deferred revenue, so counting it as
              takings overstates the day by the face value of every card and
              puts the till out with the books at month close. The money is in
              the drawer — it appears in Cash movement — but the revenue arrives
              when somebody redeems it, at whichever branch does the work. */}
          <TableRow className="border-t-2 border-border">
            <TableCell className="text-muted-foreground text-sm">
              Gift cards sold
              <Badge variant="primary-soft" size="sm" className="ml-1.5">
                Liability
              </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
              {summary.giftCardsSold.salesQty}
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
              {summary.giftCardsSold.refundQty}
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
              {money(summary.giftCardsSold.grossMinor)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </SummaryCard>
  )
}

function CashMovementSummary({ summary }: { summary: DailySummary }) {
  return (
    <SummaryCard title="Cash movement summary">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment type</TableHead>
            <TableHead className="text-right">Payments collected</TableHead>
            <TableHead className="text-right">Refunds paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.cash.map((row) => (
            <TableRow key={row.label} className={cn(row.emphasis && "bg-muted/30")}>
              <TableCell className={cn("text-sm text-foreground", row.emphasis && "font-semibold")}>
                {row.label}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  row.emphasis ? "font-semibold text-foreground" : "text-foreground",
                )}
              >
                {money(row.collectedMinor)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  row.refundedMinor < 0 ? "text-tomato-11" : "text-foreground",
                  row.emphasis && "font-semibold",
                )}
              >
                {money(row.refundedMinor)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SummaryCard>
  )
}

/**
 * Which branch, not just how much (KH1.1, R09).
 *
 * The total sits after the rows and is labelled as their sum, rather than being
 * a headline with a breakdown hidden underneath — an owner asking how the day
 * went across nine branches is asking which one had a bad day, and a single
 * number sends them back to phoning each branch, which is what BG-05 measures.
 *
 * Absent for a single-branch business: there is nothing to tell apart, and a
 * breakdown of one row is a label for nothing (DW1.2).
 */
function ByLocationSummary({ summary }: { summary: DailySummary }) {
  const { locationName } = useLocations()
  return (
    <SummaryCard title="By location" className="shrink-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Sales qty</TableHead>
            <TableHead className="text-right">Refund qty</TableHead>
            <TableHead className="text-right">Tips</TableHead>
            <TableHead className="text-right">Gross total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.byLocation.map((row) => (
            <TableRow key={row.locationId}>
              <TableCell className="text-sm text-foreground">
                {locationName(row.locationId)}
              </TableCell>
              <TableCell className="text-right text-sm text-foreground tabular-nums">
                {row.salesQty}
              </TableCell>
              <TableCell className="text-right text-sm text-foreground tabular-nums">
                {row.refundQty}
              </TableCell>
              <TableCell className="text-right text-sm text-foreground tabular-nums">
                {money(row.tipsMinor)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  row.grossMinor < 0 ? "text-tomato-11" : "text-foreground",
                )}
              >
                {money(row.grossMinor)}
              </TableCell>
            </TableRow>
          ))}
          {summary.byLocation.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-sm text-muted-foreground">
                No takings anywhere in your locations on this day.
              </TableCell>
            </TableRow>
          ) : (
            <TableRow className="border-t border-border/60 bg-muted/30">
              <TableCell className="text-sm font-semibold text-foreground">
                Business total — the sum of {summary.byLocation.length}{" "}
                {summary.byLocation.length === 1 ? "location" : "locations"}
              </TableCell>
              <TableCell colSpan={3} />
              <TableCell className="text-right text-sm font-semibold tabular-nums">
                {money(summary.rollUpMinor)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Named, never dropped: "nothing at Al Quoz today" and "Al Quoz is
          missing from this report" are different answers. */}
      {summary.quietLocations.length > 0 ? (
        <p className="px-5 pb-4 text-xs text-muted-foreground">
          No takings this day at {summary.quietLocations.map(locationName).join(", ")}.
        </p>
      ) : null}
    </SummaryCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailySummaryPage() {
  // useSearchParams() opts a route out of static prerendering unless it runs
  // inside a Suspense boundary — the failure that only a production build
  // catches, and that took /settings/team down on Vercel.
  return (
    <Suspense>
      <DailySummaryInner />
    </Suspense>
  )
}

function DailySummaryInner() {
  // The granted set, not the estate (R18). A manager holding one branch reads
  // their own day, labelled as theirs — not a business figure built from
  // branches they cannot open.
  const { granted, scopedLocations, isMultiLocation } = useLocations()
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted
  const allowed = useMemo(() => inScope.map((l) => l.id), [inScope])

  // Opening on today met every reviewer with an empty report and no way to
  // tell an empty day from a broken one — the seeded log's last sale is months
  // back. The landing day is this scope's own last trading day.
  // `?d=YYYY-MM-DD` opens a named day, the way every other reviewable state in
  // this repo is a link — /screens hands these out and a review message pastes
  // them. Without it the only way to reach the busy day was to guess it with
  // the arrows.
  const params = useSearchParams()
  const [date, setDate] = useState<Date>(() => {
    const asked = params.get("d")
    if (asked && /^\d{4}-\d{2}-\d{2}$/.test(asked)) {
      const [y, m, d] = asked.split("-").map(Number)
      return new Date(y!, m! - 1, d!)
    }
    const latest = latestTradingDay(MOCK_SALES, allowed)
    const d = latest ? new Date(latest) : new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [cartOpen, setCartOpen] = useState(false)

  const summary = useMemo(() => summarizeDay(MOCK_SALES, dayIso(date), allowed), [date, allowed])
  const latest = useMemo(() => latestTradingDay(MOCK_SALES, allowed), [allowed])
  const today = new Date()
  const landedOnLastTradingDay =
    latest != null && dayIso(date) === dayIso(latest) && dayIso(date) !== dayIso(today)

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Daily sales</h1>
            <p className="text-sm text-muted-foreground">
              View, filter and export the transactions and cash movement for the day.
            </p>
          </div>

          <div className="flex items-center gap-2">
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

            <Button radius="full" onClick={() => setCartOpen(true)}>
              <PlusIcon className="size-4" />
              Add new
            </Button>
          </div>
        </div>
      }
    >
      {/* The date picker stays put and the report scrolls under it — the same
          shape the sales list uses. Putting the scroll on the outer max-width
          wrapper looked equivalent and was not: the page grew a third card,
          overflowed, and clipped it with no scrollbar anywhere. */}
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4">
        <DateSelector value={date} onChange={setDate} />

        {/* Why you are looking at a day that is not today. Landing somewhere
            unexplained reads as a broken date picker; the seeded log simply
            stops before today, and a real merchant's would not. */}
        {landedOnLastTradingDay ? (
          <p className="text-muted-foreground text-sm">
            Nothing has been sold since, so this is your last trading day.
          </p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {/* First, not last. The question an owner brings to an end-of-day
              report is which branch had a bad day, and that answer sitting
              under two full-height tables is an answer nobody scrolls to —
              which is the merged-total failure again, wearing a breakdown. */}
          {isMultiLocation ? <ByLocationSummary summary={summary} /> : null}

          <div className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <TransactionSummary summary={summary} />
            <CashMovementSummary summary={summary} />
          </div>
        </div>
      </div>

      <CartFlow open={cartOpen} onOpenChange={setCartOpen} />
    </AppShell>
  )
}
