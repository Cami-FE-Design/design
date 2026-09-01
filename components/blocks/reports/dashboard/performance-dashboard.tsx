"use client"

// The Cami Performance Dashboard (DSG-79) — the premium reporting surface.
//
// Shape, top to bottom:
//   1. a hero strip of the six numbers an owner opens the page for,
//   2. a sticky control bar (date range, comparison, filters, customise) that
//      also carries the section rail, so the jump targets follow you down,
//   3. the sections themselves, one continuous scroll of widget cards.
//
// Everything about *which* cards render — order, width, access, drill-through —
// comes from lib/reports/dashboard/widgets.ts; the bodies come from
// dashboard-widget.tsx. This file owns only the frame and the page state.

import { ArrowUpIcon, ChartNoAxesCombinedIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { type DateRange, DateRangePopover } from "@/components/blocks/date-range-popover"
import { EmptyState } from "@/components/blocks/empty-state"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { CustomiseDashboardPopover } from "@/components/blocks/reports/dashboard/customise-dashboard-popover"
import { DeltaChip } from "@/components/blocks/reports/dashboard/dashboard-primitives"
import { DashboardWidgetCard } from "@/components/blocks/reports/dashboard/dashboard-widget"
import { ReportFiltersSheet } from "@/components/blocks/reports/report-filters-sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DASHBOARD_PERIOD, HERO_METRICS } from "@/lib/reports/dashboard/mock"
import {
  DASHBOARD_SECTIONS,
  DASHBOARD_WIDGETS,
  type DashboardRole,
  type DashboardState,
  DEFAULT_VISIBLE_WIDGETS,
  WIDGETS_WITHOUT_DATA,
} from "@/lib/reports/dashboard/widgets"
import type { ReportDef } from "@/lib/reports/types"

/** The sticky control bar sits at the top of the scroll area — a jump clears it. */
const STICKY_OFFSET = 56

function HeroStrip({ onJump, loading }: { onJump: (widgetId: string) => void; loading: boolean }) {
  if (loading) {
    // The strip loads with everything else. Leaving the last figures on screen
    // while the cards below are skeletons would read as "these six are current"
    // when they are not.
    return (
      <KpiGrid className="grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {HERO_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </KpiGrid>
    )
  }

  // KpiCard/KpiGrid are the app's existing stat tiles — the first pass built a
  // bespoke strip of hairline-separated cells instead, which was the only place
  // on the page not using the same card as everything else.
  return (
    <KpiGrid className="grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {HERO_METRICS.map((metric) => (
        <KpiCard
          key={metric.id}
          label={metric.label}
          onClick={() => onJump(metric.id)}
          value={
            <span className="flex flex-col gap-2">
              <span>{metric.value}</span>
              <DeltaChip pct={metric.deltaPct} caption={null} tone="progress" />
            </span>
          }
        />
      ))}
    </KpiGrid>
  )
}

export function PerformanceDashboard({ report }: { report: ReportDef }) {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  // Opens on the period the mock data describes, not on today — otherwise the
  // pill and the chart legends disagree about which month is on screen.
  const [range, setRange] = useState<DateRange>(() => DASHBOARD_PERIOD)
  const [role, setRole] = useState<DashboardRole>("owner")
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE_WIDGETS)
  const [scrolled, setScrolled] = useState(false)

  // ?state=loading / ?state=empty. The data here is a fixed mock, so without a
  // switch these two states could never be reviewed — and they are the ones a
  // new merchant sees first.
  const params = useSearchParams()
  const raw = params.get("state")
  const state: DashboardState =
    raw === "loading" || raw === "empty" || raw === "sparse" ? raw : "ready"

  // A widget shows when the owner has it switched on AND the previewed role can
  // see it. Toggling the role never edits the owner's own visibility choices.
  const shown = useMemo(
    () => DASHBOARD_WIDGETS.filter((w) => visible.includes(w.id) && w.access[role] !== "none"),
    [visible, role],
  )

  const sections = useMemo(
    () =>
      DASHBOARD_SECTIONS.map((section) => ({
        ...section,
        widgets: shown.filter((w) => w.section === section.id),
      })).filter((section) => section.widgets.length > 0),
    [shown],
  )

  /**
   * Scrolls the report's scroll container; `null` means back to the top.
   *
   * AppShell renders two shells — a hidden mobile one and the desktop one — so
   * both the target and the scroll container exist twice in the DOM.
   * getElementById returns the hidden copy first, whose container has no
   * height, and the scroll silently did nothing. Pick the rendered one.
   */
  const scrollTo = (elementId: string | null) => {
    requestAnimationFrame(() => scrollToNow(elementId))
  }

  const scrollToNow = (elementId: string | null) => {
    const onScreen = <T extends HTMLElement>(selector: string) =>
      [...document.querySelectorAll<T>(selector)].find((el) => el.offsetParent !== null) ?? null

    const root = onScreen<HTMLElement>("[data-report-scroll]")
    if (!root) return

    if (elementId === null) {
      root.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const el = onScreen<HTMLElement>(`#${elementId}`)
    if (!el) return
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
    root.scrollTo({ top: top - STICKY_OFFSET, behavior: "smooth" })
  }

  const jumpToWidget = (widgetId: string) => scrollTo(`widget-${widgetId}`)

  // The button only appears once there is somewhere to come back from.
  useEffect(() => {
    const root = [...document.querySelectorAll<HTMLElement>("[data-report-scroll]")].find(
      (el) => el.offsetParent !== null,
    )
    if (!root) return
    const onScroll = () => setScrolled(root.scrollTop > 600)
    onScroll()
    root.addEventListener("scroll", onScroll, { passive: true })
    return () => root.removeEventListener("scroll", onScroll)
  }, [])

  const toggleWidget = (id: string) =>
    setVisible((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]))

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Sticky control bar. One date control and nothing else that looks like
          one: the comparison window used to sit beside it as a second pill,
          then as a caption, and both read as a choice the user does not get to
          make — it is always the previous equivalent period (PRO-703 §4). The
          deltas say "vs comparison"; the window itself belongs in the picker,
          not on the bar. It carried a section rail in the first pass; it
          read as tabs, so people expected it to switch views rather than
          scroll, and it earned nothing on a page that is meant to be skimmed
          top to bottom. Dropped — the hero strip above is the jump-to. */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-background/95 py-2 backdrop-blur">
        <DateRangePopover value={range} onChange={setRange} today={today} />
        <ReportFiltersSheet filters={report.filters ?? []} />
        {/* In the bar rather than floating over the cards. As a `fixed` pill it
            resolved against the toolbar, not the viewport — `backdrop-blur`
            makes a containing block — and landed on top of Customise. The bar
            is pinned anyway, so the way back up is always one click away. */}
        <div className="ml-auto flex items-center gap-2">
          {scrolled ? (
            <Button
              variant="ghost"
              radius="full"
              size="sm"
              onClick={() => scrollTo(null)}
              className="text-muted-foreground"
            >
              <ArrowUpIcon className="size-3.5" />
              Back to top
            </Button>
          ) : null}

          <CustomiseDashboardPopover
            visible={visible}
            onToggle={toggleWidget}
            onReset={() => {
              setVisible(DEFAULT_VISIBLE_WIDGETS)
              setRole("owner")
            }}
            role={role}
            onRoleChange={setRole}
          />
        </div>
      </div>

      {state === "empty" ? (
        <EmptyState
          variant="card"
          icon={ChartNoAxesCombinedIcon}
          title="No activity in this period"
          description="Once sales and appointments start coming in, they show up here within minutes. Try a wider date range."
        />
      ) : (
        <HeroStrip onJump={jumpToWidget} loading={state === "loading"} />
      )}

      {state === "empty" ? null : sections.length === 0 ? (
        <EmptyState
          variant="card"
          icon={ChartNoAxesCombinedIcon}
          title="Every widget is switched off"
          description="Turn a few back on from Customise to rebuild your dashboard."
        />
      ) : (
        sections.map((section) => (
          <section
            key={section.id}
            id={`dashboard-section-${section.id}`}
            aria-labelledby={`dashboard-heading-${section.id}`}
            className="flex scroll-mt-4 flex-col gap-3 pt-2"
          >
            <div className="flex items-baseline gap-2 border-b border-border/60 pb-2">
              <h2
                id={`dashboard-heading-${section.id}`}
                className="font-heading text-lg font-semibold text-foreground"
              >
                {section.label}
              </h2>
              <span className="text-xs text-muted-foreground">
                {section.widgets.length} widgets
              </span>
            </div>
            <div className="grid grid-flow-row-dense grid-cols-1 gap-4 lg:grid-cols-12">
              {section.widgets.map((widget) => (
                <DashboardWidgetCard
                  key={widget.id}
                  id={`widget-${widget.id}`}
                  widget={widget}
                  role={role}
                  state={
                    state === "sparse"
                      ? WIDGETS_WITHOUT_DATA.includes(widget.id)
                        ? "empty"
                        : "ready"
                      : state
                  }
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
