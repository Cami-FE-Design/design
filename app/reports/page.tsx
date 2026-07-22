"use client"

import {
  ArrowUpDownIcon,
  BanknoteIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  CheckIcon,
  type LucideIcon,
  PackageIcon,
  SearchIcon,
  SmileIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { CATEGORY_LABELS, LIVE_REPORTS, liveCategories } from "@/lib/reports/registry"
import { useReports } from "@/lib/reports/store"
import type { ReportCategory, ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

const CATEGORY_ICON: Record<ReportCategory, LucideIcon> = {
  dashboards: ChartNoAxesCombinedIcon,
  sales: TagIcon,
  finance: BanknoteIcon,
  appointments: CalendarIcon,
  team: UsersIcon,
  clients: SmileIcon,
  inventory: PackageIcon,
}

type SortKey = "category" | "updated" | "az" | "za"
const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "category", label: "Category" },
  { key: "updated", label: "Last updated" },
  { key: "az", label: "A – Z" },
  { key: "za", label: "Z – A" },
]

function FavStar({ id }: { id: string }) {
  const { isFavourite, toggleFavourite } = useReports()
  const active = isFavourite(id)
  return (
    <button
      type="button"
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavourite(id)
      }}
      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
    >
      <StarIcon className={cn("size-5", active && "fill-cami-yellow-9 text-cami-yellow-9")} />
    </button>
  )
}

function ReportCard({ report }: { report: ReportDef }) {
  const Icon = CATEGORY_ICON[report.category]
  return (
    <Link
      href={`/reports/${report.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{report.name}</span>
          {report.premium ? (
            <Badge variant="primary-soft" size="sm">
              Premium
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{report.description}</p>
      </div>
      <FavStar id={report.id} />
    </Link>
  )
}

export default function ReportsIndexPage() {
  const { favourites, activeTab: tab, setActiveTab: setTab } = useReports()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("category")

  const tabs: Array<{ key: "all" | "favourites" | ReportCategory; label: string }> = [
    { key: "all", label: "All reports" },
    { key: "favourites", label: "Favourites" },
    ...liveCategories().map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = LIVE_REPORTS.filter((r) => {
      if (tab === "favourites" && !favourites.includes(r.id)) return false
      if (tab !== "all" && tab !== "favourites" && r.category !== tab) return false
      if (!q) return true
      return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    })
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === "za") return [...list].sort((a, b) => b.name.localeCompare(a.name))
    // "category" (registry order, grouped by category) and "updated" keep source order.
    return list
  }, [query, tab, sort, favourites])

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort"

  return (
    <AppShell
      header={
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl leading-8 font-medium text-foreground">
                Reporting and analytics
              </h1>
              <Badge variant="secondary" size="md">
                {LIVE_REPORTS.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Access all of your Cami reports.</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" size="sm" className="gap-1.5">
                {sortLabel}
                <ArrowUpDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {SORT_OPTIONS.map((o) => (
                <DropdownMenuItem key={o.key} onSelect={() => setSort(o.key)}>
                  <CheckIcon
                    className={cn("size-4", sort === o.key ? "opacity-100" : "opacity-0")}
                  />
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4">
        <SearchInput
          size="lg"
          placeholder="Search by report name or description"
          onValueChange={setQuery}
        />

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "ghost"}
              radius="full"
              size="sm"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4">
          {filtered.length === 0 ? (
            <EmptyState
              variant="card"
              icon={tab === "favourites" ? StarIcon : SearchIcon}
              title={tab === "favourites" ? "No favourites yet" : "No reports found"}
              description={
                tab === "favourites"
                  ? "Tap the star on any report to pin it here."
                  : "Try a different search or category."
              }
            />
          ) : (
            filtered.map((r) => <ReportCard key={r.id} report={r} />)
          )}
        </div>
      </div>
    </AppShell>
  )
}
