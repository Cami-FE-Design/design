"use client"

import { ChevronDownIcon, FileSpreadsheetIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { DateSelector } from "@/components/blocks/date-selector"
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
import { cn } from "@/lib/utils"

// ─── Mock data (matches the figma values) ─────────────────────────────────────

const CURRENCY = "AED"

function money(amount: number) {
  if (amount < 0) {
    return `- ${CURRENCY} ${Math.abs(amount).toLocaleString()}`
  }
  return `${CURRENCY} ${amount.toLocaleString()}`
}

type TxnRow = { label: string; salesQty: number; refundQty: number; grossTotal: number }

const TRANSACTION_ROWS: TxnRow[] = [
  { label: "Services", salesQty: 1, refundQty: 0, grossTotal: 25 },
  { label: "Service add-ons", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Products", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Shipping", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Gift cards", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Memberships", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Late cancellation fees", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "No-show fees", salesQty: 0, refundQty: 0, grossTotal: 0 },
  { label: "Refund amount", salesQty: 0, refundQty: 1, grossTotal: -9 },
]

const TRANSACTION_TOTAL = TRANSACTION_ROWS.reduce(
  (acc, row) => ({
    salesQty: acc.salesQty + row.salesQty,
    refundQty: acc.refundQty + row.refundQty,
    grossTotal: acc.grossTotal + row.grossTotal,
  }),
  { salesQty: 0, refundQty: 0, grossTotal: 0 },
)

type CashRow = {
  label: string
  paymentsCollected: number
  refundsPaid: number
  emphasis?: boolean
}

const CASH_ROWS: CashRow[] = [
  { label: "Cash", paymentsCollected: 11, refundsPaid: -9 },
  { label: "Other", paymentsCollected: 0, refundsPaid: 0 },
  { label: "Gift card redemptions", paymentsCollected: 0, refundsPaid: 0 },
  { label: "Payments collected", paymentsCollected: 11, refundsPaid: -9, emphasis: true },
  { label: "Of which tips", paymentsCollected: 0, refundsPaid: 0 },
]

// ─── Cards ────────────────────────────────────────────────────────────────────

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="px-5 py-4">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function TransactionSummary() {
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
          {TRANSACTION_ROWS.map((row) => (
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
                  row.grossTotal < 0 ? "text-tomato-11" : "text-foreground",
                )}
              >
                {money(row.grossTotal)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-border/60 bg-muted/30">
            <TableCell className="text-sm font-semibold text-foreground">Total Sales</TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {TRANSACTION_TOTAL.salesQty}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {TRANSACTION_TOTAL.refundQty}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold tabular-nums">
              {money(TRANSACTION_TOTAL.grossTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </SummaryCard>
  )
}

function CashMovementSummary() {
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
          {CASH_ROWS.map((row) => (
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
                {money(row.paymentsCollected)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  row.refundsPaid < 0 ? "text-tomato-11" : "text-foreground",
                  row.emphasis && "font-semibold",
                )}
              >
                {money(row.refundsPaid)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SummaryCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailySummaryPage() {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Daily sales</h1>
            <p className="text-sm text-muted-foreground">
              View, filter and export the transactions and cash movement for the day.
            </p>
          </div>

          <div className="flex items-center gap-2">
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

            <Button radius="full" className="h-9 gap-1.5 px-4">
              <PlusIcon className="size-4" />
              Add new
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 overflow-y-auto">
        <DateSelector value={date} onChange={setDate} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TransactionSummary />
          <CashMovementSummary />
        </div>
      </div>
    </AppShell>
  )
}
