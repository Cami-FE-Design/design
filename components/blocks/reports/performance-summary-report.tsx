"use client"

// Matrix View — the Performance summary shape: business metrics (rows, grouped
// into sections with bold subtotal/total rows) laid out across team-member
// columns, with a leading "Total" column. Distinct from the Table template
// (rows = records) and Detailed Table (columns = time periods). Adapted to
// Cami's real roster + channels, AED currency. Team-member column headers are
// plain labels; a few metric labels drill to their source report.
// Feature-flagged like the other dashboards (future add-on pricing).

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  type DateRange,
  DateRangePopover,
  defaultRange,
} from "@/components/blocks/date-range-popover"
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
import { formatAed, formatDuration, formatNumber, formatPercent } from "@/lib/format"
import {
  PERFORMANCE_SUMMARY_MEMBERS,
  PERFORMANCE_SUMMARY_SECTIONS,
  type PerfMetricKind,
  type PerfMetricRow,
} from "@/lib/reports/mock"
import type { ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

const GROUP_BY = ["Team member", "Location"]

function formatMetric(kind: PerfMetricKind, value: number) {
  switch (kind) {
    case "money":
      return formatAed(value)
    case "percent":
      return formatPercent(value)
    case "duration":
      return formatDuration(value)
    default:
      return formatNumber(value)
  }
}

/** Leading "Total" column: sum for summable kinds, explicit for ratio/average. */
function rowTotal(row: PerfMetricRow) {
  if (row.total !== undefined) return row.total
  return row.values.reduce((sum, v) => sum + v, 0)
}

function GroupByPill() {
  const [selected, setSelected] = useState(GROUP_BY[0])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {selected}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {GROUP_BY.map((g) => (
          <DropdownMenuItem key={g} onClick={() => setSelected(g)}>
            <CheckIcon className={cn("size-4", selected === g ? "opacity-100" : "opacity-0")} />
            {g}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PerformanceSummaryReport({ report }: { report: ReportDef }) {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [range, setRange] = useState<DateRange>(() => defaultRange(today))

  const members = PERFORMANCE_SUMMARY_MEMBERS
  // label + Total + one column per member.
  const colCount = members.length + 2

  // Opaque composite of the muted/30 row tint — a sticky cell needs a SOLID bg
  // or the columns scrolled under it bleed through.
  const stickyBase = "sticky left-0 z-10 whitespace-nowrap shadow-[1px_0_0_0_var(--border)]"
  const stickyEmphasis = "bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] font-semibold"

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <TableToolbar
        tabs={
          <div className="flex items-center gap-2">
            <GroupByPill />
            <DateRangePopover value={range} onChange={setRange} today={today} />
            <ReportFiltersSheet filters={report.filters ?? []} />
          </div>
        }
      />

      {/* flex-1 min-h-0 turns the table-container into a bounded scroll ancestor
          so TableHeader's built-in sticky `<thead>` engages — the team-member
          header row stays pinned on vertical scroll while the first column stays
          pinned on horizontal scroll. */}
      <Table containerClassName="min-h-0 flex-1">
        <TableHeader>
          <TableRow>
            {/* Corner cell: sticky on BOTH axes (top from thead, left here) and
                above the other sticky cells (z-20) so nothing bleeds under it. */}
            <TableHead className="sticky left-0 z-20! whitespace-nowrap bg-background">
              {PERFORMANCE_SUMMARY_SECTIONS[0]?.label ?? ""}
            </TableHead>
            <TableHead className="whitespace-nowrap text-right">Total</TableHead>
            {members.map((name) => (
              <TableHead
                key={name}
                className="whitespace-nowrap text-right font-medium text-foreground"
              >
                {name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERFORMANCE_SUMMARY_SECTIONS.map((section, si) => (
            <SectionRows
              key={section.label}
              section={section}
              isFirst={si === 0}
              colCount={colCount}
              stickyBase={stickyBase}
              stickyEmphasis={stickyEmphasis}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SectionRows({
  section,
  isFirst,
  colCount,
  stickyBase,
  stickyEmphasis,
}: {
  section: (typeof PERFORMANCE_SUMMARY_SECTIONS)[number]
  isFirst: boolean
  colCount: number
  stickyBase: string
  stickyEmphasis: string
}) {
  return (
    <>
      {!isFirst ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colCount} className="pt-6 pb-2 text-sm font-semibold text-foreground">
            {section.label}
          </TableCell>
        </TableRow>
      ) : null}
      {section.rows.map((row) => (
        <TableRow key={row.label} className={cn(row.emphasis && "bg-muted/30 hover:bg-muted/30")}>
          <TableCell
            className={cn(
              stickyBase,
              "text-sm",
              row.emphasis ? stickyEmphasis : "bg-background",
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
          <TableCell
            className={cn(
              "whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground",
              row.emphasis && "font-semibold",
            )}
          >
            {formatMetric(row.kind, rowTotal(row))}
          </TableCell>
          {row.values.map((value, i) => (
            <TableCell
              key={PERFORMANCE_SUMMARY_MEMBERS[i]}
              className={cn(
                "whitespace-nowrap text-right text-sm tabular-nums text-foreground",
                row.emphasis && "font-semibold",
              )}
            >
              {formatMetric(row.kind, value)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
