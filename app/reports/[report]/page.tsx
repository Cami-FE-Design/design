"use client"

import { ArrowLeftIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppShell } from "@/components/blocks/app-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { DashboardReport } from "@/components/blocks/reports/dashboard-report"
import { DetailedTableReport } from "@/components/blocks/reports/detailed-table-report"
import { ReportShell } from "@/components/blocks/reports/report-shell"
import { TableReport } from "@/components/blocks/reports/table-report"
import { Button } from "@/components/ui/button"
import { getReport } from "@/lib/reports/registry"

export default function ReportPage() {
  const params = useParams<{ report: string }>()
  const report = getReport(params.report)

  // Held reports (scope pending) aren't linked from the index — direct hits get
  // a friendly fallback rather than a half-built view.
  if (!report || report.held) {
    return (
      <AppShell
        header={
          <div className="flex w-full items-center gap-3">
            <Button asChild variant="outline" radius="full" size="sm">
              <Link href="/reports">
                <ArrowLeftIcon className="size-3.5" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl leading-8 font-medium text-foreground">Report unavailable</h1>
          </div>
        }
      >
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
          <EmptyState
            variant="card"
            icon={SearchIcon}
            title="Report not available"
            description="This report doesn’t exist or isn’t available yet."
            action={
              <Button asChild radius="full">
                <Link href="/reports">Back to all reports</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    )
  }

  return (
    <ReportShell report={report}>
      {report.template === "dashboard" ? (
        <DashboardReport report={report} />
      ) : report.template === "detailed-table" ? (
        <DetailedTableReport report={report} />
      ) : (
        <TableReport report={report} />
      )}
    </ReportShell>
  )
}
