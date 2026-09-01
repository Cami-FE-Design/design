"use client"

// Dashboard template router. Three reports share the "dashboard" template but
// are three genuinely different shapes, so each has its own component:
//   • Performance dashboard  — the widget grid (DSG-79)
//   • Performance summary    — metric × team-member matrix
//   • Performance over time  — entity × time-period matrix
// Anything else on this template is still behind its feature flag.

import { ChartNoAxesCombinedIcon } from "lucide-react"
import { EmptyState } from "@/components/blocks/empty-state"
import { PerformanceDashboard } from "@/components/blocks/reports/dashboard/performance-dashboard"
import { PerformanceOverTimeReport } from "@/components/blocks/reports/performance-over-time-report"
import { PerformanceSummaryReport } from "@/components/blocks/reports/performance-summary-report"
import type { ReportDef } from "@/lib/reports/types"

export function DashboardReport({ report }: { report: ReportDef }) {
  if (report.id === "performance-dashboard") {
    return <PerformanceDashboard report={report} />
  }

  if (report.id === "performance-summary") {
    return <PerformanceSummaryReport report={report} />
  }

  if (report.id === "performance-over-time") {
    return <PerformanceOverTimeReport report={report} />
  }

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
