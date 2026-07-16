"use client"

// Dashboard View — the Cami Performance Dashboard (Maaz's "Dashboard WIP" spec):
// 6 metrics owners track daily (Sales, Appointments, New vs Returning, Overall
// Occupancy, Sales by Category, Payment Method Breakdown), each with a
// current-vs-comparison delta and a "View report" drill-down to its source
// report. Ships behind a feature flag (future add-on pricing). Charts use
// recharts. The other two dashboards (Performance summary / over time) are
// distinct matrix shapes handled by their own components below.

import { ArrowDownIcon, ArrowUpIcon, ChartNoAxesCombinedIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  type DateRange,
  DateRangePopover,
  defaultRange,
} from "@/components/blocks/date-range-popover"
import { EmptyState } from "@/components/blocks/empty-state"
import { ComparisonLineChart } from "@/components/blocks/reports/comparison-line-chart"
import { PerformanceOverTimeReport } from "@/components/blocks/reports/performance-over-time-report"
import { PerformanceSummaryReport } from "@/components/blocks/reports/performance-summary-report"
import { ReportFiltersSheet } from "@/components/blocks/reports/report-filters-sheet"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import { formatAed, formatNumber, formatPercent } from "@/lib/format"
import {
  DASHBOARD_SALES_SERIES,
  type DashboardBreakdownItem,
  PERFORMANCE_DASHBOARD,
} from "@/lib/reports/mock"
import type { ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

function DeltaChip({ pct }: { pct: number }) {
  const Icon = pct >= 0 ? ArrowUpIcon : ArrowDownIcon
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3" />
        {Math.abs(pct)}%
      </span>
      <span className="text-xs text-muted-foreground">vs comp period</span>
    </span>
  )
}

function BreakdownList({ items }: { items: DashboardBreakdownItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{it.label}</span>
          <span className="font-medium tabular-nums text-foreground">
            {it.money ? formatAed(it.value) : formatNumber(it.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function DashCard({
  title,
  viewReportId,
  className,
  children,
}: {
  title: string
  viewReportId?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {viewReportId ? (
          <Link
            href={`/reports/${viewReportId}`}
            className="text-sm font-medium text-cami-violet-11 hover:underline"
          >
            View report
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function DashboardReport({ report }: { report: ReportDef }) {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [range, setRange] = useState<DateRange>(() => defaultRange(today))

  // Performance summary is a metric × team-member matrix — its own view.
  if (report.id === "performance-summary") {
    return <PerformanceSummaryReport report={report} />
  }

  // Performance over time is an entity × time-period matrix with a metric chart.
  if (report.id === "performance-over-time") {
    return <PerformanceOverTimeReport report={report} />
  }

  // Only the Performance dashboard is fully specced (Cami's Dashboard WIP tab).
  if (report.id !== "performance-dashboard") {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <EmptyState
          variant="card"
          icon={ChartNoAxesCombinedIcon}
          title={`${report.name} is behind a feature flag`}
          description="This dashboard is a distinct matrix report — its build lands in a later phase."
        />
      </div>
    )
  }

  const d = PERFORMANCE_DASHBOARD

  return (
    <div className="flex w-full flex-col gap-4">
      <TableToolbar
        actions={
          <>
            <DateRangePopover value={range} onChange={setRange} today={today} />
            <Button variant="outline" radius="full" size="sm">
              Compare to: {d.comparisonLabel}
            </Button>
            <ReportFiltersSheet filters={report.filters ?? []} />
          </>
        }
      />

      <div className="flex flex-col gap-4">
        {/* Row 1: sales summary (1/3) + the over-time chart (2/3), like Fresha. */}
        <div className="grid gap-4 lg:grid-cols-3">
          <DashCard title="Total sales" viewReportId="sales-summary">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-semibold leading-none text-foreground">
                {formatAed(d.sales.value)}
              </span>
              <DeltaChip pct={d.sales.deltaPct} />
            </div>
            <BreakdownList items={d.salesByCategory} />
          </DashCard>

          <DashCard title="Sales over time" viewReportId="sales-summary" className="lg:col-span-2">
            <ComparisonLineChart
              data={DASHBOARD_SALES_SERIES}
              currentLabel={d.periodLabel}
              comparisonLabel={d.comparisonLabel}
              formatValue={formatNumber}
            />
          </DashCard>
        </div>

        {/* Row 2: four even KPI cards. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashCard title="Appointments" viewReportId="appointments-summary">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-semibold leading-none text-foreground">
                {formatNumber(d.appointments.value)}
              </span>
              <DeltaChip pct={d.appointments.deltaPct} />
            </div>
            <BreakdownList items={d.appointments.breakdown} />
          </DashCard>

          <DashCard title="New vs returning" viewReportId="client-summary">
            <DeltaChip pct={d.clients.deltaPct} />
            <BreakdownList items={d.clients.breakdown} />
          </DashCard>

          <DashCard title="Overall occupancy" viewReportId="working-hours-summary">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-semibold leading-none text-foreground">
                {formatPercent(d.occupancy.pct)}
              </span>
              <DeltaChip pct={d.occupancy.deltaPct} />
            </div>
          </DashCard>

          <DashCard title="Payment methods" viewReportId="payments-summary">
            <BreakdownList items={d.paymentMethods} />
          </DashCard>
        </div>
      </div>
    </div>
  )
}
