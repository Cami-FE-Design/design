"use client"

// Shared page frame for every report view: Back + breadcrumb, then a title row
// with a favourite star on the left and the Options (export) menu on the right —
// aligned like the other app pages. The report body scrolls itself.

import {
  ArrowLeftIcon,
  ChevronDownIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  StarIcon,
} from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/blocks/app-shell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CATEGORY_LABELS } from "@/lib/reports/registry"
import { useReports } from "@/lib/reports/store"
import type { ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

function FavouriteStar({ id }: { id: string }) {
  const { isFavourite, toggleFavourite } = useReports()
  const active = isFavourite(id)
  return (
    <button
      type="button"
      onClick={() => toggleFavourite(id)}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      <StarIcon className={cn("size-5", active && "fill-cami-yellow-9 text-cami-yellow-9")} />
    </button>
  )
}

function ExportMenu() {
  return (
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
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileTextIcon className="size-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileSpreadsheetIcon className="size-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ReportShell({
  report,
  children,
}: {
  report: ReportDef
  children: React.ReactNode
}) {
  const { freshnessLabel, setActiveTab } = useReports()

  return (
    <AppShell
      header={
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" radius="full" size="sm">
              <Link href="/reports">
                <ArrowLeftIcon className="size-3.5" />
                Back
              </Link>
            </Button>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link
                href="/reports"
                className="hover:text-foreground"
                onClick={() => setActiveTab("all")}
              >
                All reports
              </Link>
              <span aria-hidden>·</span>
              <Link
                href="/reports"
                className="hover:text-foreground"
                onClick={() => setActiveTab(report.category)}
              >
                {CATEGORY_LABELS[report.category]}
              </Link>
              <span aria-hidden>·</span>
              <span className="text-foreground">{report.name}</span>
            </nav>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl leading-8 font-medium text-foreground">{report.name}</h1>
                <FavouriteStar id={report.id} />
              </div>
              <p className="text-sm text-muted-foreground">
                {report.description} {freshnessLabel}
              </p>
            </div>
            <ExportMenu />
          </div>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-y-auto pb-4">
        {children}
      </div>
    </AppShell>
  )
}
