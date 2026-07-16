"use client"

// Detailed Table template — the Finance-summary shape: metric rows grouped into
// sections (Sales / Payments / Redemptions) with bold subtotal/total rows and
// accent drill-down links, laid out as a metric × time-period matrix. Flat rows
// (no expandable children, per Michelle), consistent with the daily-summary
// emphasis pattern and Fresha's Finance summary.

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { type DateRange, DateRangePopover } from "@/components/blocks/date-range-popover"
import { ReportFiltersSheet } from "@/components/blocks/reports/report-filters-sheet"
import { TableToolbar } from "@/components/blocks/table-toolbar"
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
import { formatAed } from "@/lib/format"
import { FINANCE_SUMMARY_PERIODS, FINANCE_SUMMARY_SECTIONS } from "@/lib/reports/mock"
import type { ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

const GRANULARITIES = ["Day", "Week", "Month"]

function GranularityPill() {
  const [selected, setSelected] = useState("Month")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {selected}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {GRANULARITIES.map((g) => (
          <DropdownMenuItem key={g} onClick={() => setSelected(g)}>
            <CheckIcon className={cn("size-4", selected === g ? "opacity-100" : "opacity-0")} />
            {g}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DetailedTableReport({ report }: { report: ReportDef }) {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  // "Last 6 months" — the range that matches the period columns.
  const [range, setRange] = useState<DateRange>(() => {
    const from = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    return { from, to: today }
  })

  // Only Finance summary uses this template today; guard for the general case.
  const sections = report.id === "finance-summary" ? FINANCE_SUMMARY_SECTIONS : []

  return (
    <div className="flex w-full flex-col gap-4">
      <TableToolbar
        actions={
          <>
            <GranularityPill />
            <DateRangePopover value={range} onChange={setRange} today={today} />
            <ReportFiltersSheet filters={report.filters ?? []} />
          </>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-20! whitespace-nowrap bg-background shadow-[1px_0_0_0_var(--border)]">
              {sections[0]?.label ?? ""}
            </TableHead>
            {FINANCE_SUMMARY_PERIODS.map((period) => (
              <TableHead key={period} className="whitespace-nowrap text-right">
                {period}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section, si) => (
            <SectionRows key={section.label} section={section} isFirst={si === 0} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SectionRows({
  section,
  isFirst,
}: {
  section: (typeof FINANCE_SUMMARY_SECTIONS)[number]
  isFirst: boolean
}) {
  return (
    <>
      {!isFirst ? (
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={FINANCE_SUMMARY_PERIODS.length + 1}
            className="pt-6 pb-2 text-sm font-semibold text-foreground"
          >
            {section.label}
          </TableCell>
        </TableRow>
      ) : null}
      {section.rows.map((row) => (
        <TableRow key={row.label} className={cn(row.emphasis && "bg-muted/30 hover:bg-muted/30")}>
          <TableCell
            className={cn(
              "sticky left-0 z-10 whitespace-nowrap text-sm shadow-[1px_0_0_0_var(--border)]",
              row.emphasis
                ? "bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] font-semibold"
                : "bg-background",
              row.linkTo ? "font-medium text-cami-violet-11" : "text-foreground",
            )}
          >
            {row.linkTo ? (
              <Link href={`/reports/${row.linkTo}`} className="hover:underline">
                {row.label}
              </Link>
            ) : (
              row.label
            )}
          </TableCell>
          {row.values.map((value, i) => (
            <TableCell
              key={FINANCE_SUMMARY_PERIODS[i]}
              className={cn(
                "whitespace-nowrap text-right text-sm tabular-nums",
                value < 0 ? "text-tomato-11" : "text-foreground",
                row.emphasis && "font-semibold",
              )}
            >
              {formatAed(value)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
