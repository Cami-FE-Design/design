"use client"

// Widget bodies for the Performance dashboard (DSG-79), keyed by widget id.
//
// Order, width, access and drill-through live in lib/reports/dashboard/widgets.ts;
// this file only answers "what goes inside the card". The switch is deliberate:
// the twenty-odd widgets are genuinely different shapes (a donut, a heatmap, a
// leaderboard), and a generic renderer configured to cover all of them would be
// harder to read than the shapes themselves.

import { PackagePlusIcon } from "lucide-react"
import { CapacityHeatmap } from "@/components/blocks/reports/charts/capacity-heatmap"
import { DonutChart } from "@/components/blocks/reports/charts/donut-chart"
import { FunnelChart } from "@/components/blocks/reports/charts/funnel-chart"
import { RankedBarChart } from "@/components/blocks/reports/charts/ranked-bar-chart"
import { ComparisonLineChart } from "@/components/blocks/reports/comparison-line-chart"
import {
  BreakdownList,
  CompositionBar,
  DashCard,
  DeltaChip,
  HeroValue,
  Initials,
  InlineStat,
  MiniTable,
  TileRow,
} from "@/components/blocks/reports/dashboard/dashboard-primitives"
import { WidgetEmpty, WidgetSkeleton } from "@/components/blocks/reports/dashboard/dashboard-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatAed, formatNumber } from "@/lib/format"
import * as data from "@/lib/reports/dashboard/mock"
import type {
  DashboardRole,
  DashboardState,
  DashboardWidget,
} from "@/lib/reports/dashboard/widgets"
import { cn } from "@/lib/utils"

const SPAN_CLASS: Record<DashboardWidget["span"], string> = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
}

const LIMITED_SCOPE_NOTE: Record<string, string> = {
  "Own row only": "Showing your row only",
  "Own hours only": "Showing your hours only",
  "Own schedule only": "Showing your schedule only",
  "Own client base only": "Showing your client base only",
}

const STOCK_BADGE: Record<
  data.StockStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  "in-stock": { label: "In stock", variant: "success" },
  low: { label: "Low stock", variant: "warning" },
  out: { label: "Out of stock", variant: "destructive" },
  slow: { label: "Slow moving", variant: "muted" },
}

/** Percent-valued charts need a `%` suffix rather than the AED/number default. */
const formatPct = (n: number) => `${n}%`

function WidgetBody({ widget }: { widget: DashboardWidget }) {
  switch (widget.id) {
    // ─── Sales & revenue ─────────────────────────────────────────────────────
    case "total-sales":
      return (
        <>
          <HeroValue value={data.TOTAL_SALES.value} deltaPct={data.TOTAL_SALES.deltaPct} />
          <BreakdownList items={data.TOTAL_SALES_BREAKDOWN} />
        </>
      )

    case "sales-over-time":
      return (
        <ComparisonLineChart
          data={data.SALES_OVER_TIME}
          currentLabel={data.DASHBOARD_PERIOD_LABEL}
          comparisonLabel={data.DASHBOARD_COMPARISON_LABEL}
          formatValue={formatNumber}
          height={150}
        />
      )

    case "average-sale-value":
      return (
        <>
          <HeroValue
            value={data.AVERAGE_SALE.value}
            deltaPct={data.AVERAGE_SALE.deltaPct}
            footnote={data.AVERAGE_SALE.footnote}
          />
          <ComparisonLineChart
            data={data.AVERAGE_SALE_TREND}
            currentLabel={data.DASHBOARD_PERIOD_LABEL}
            comparisonLabel={data.DASHBOARD_COMPARISON_LABEL}
            formatValue={formatNumber}
            zeroBaseline={false}
            height={200}
            grow
          />
        </>
      )

    case "sales-by-payment":
      return (
        <DonutChart
          items={data.SALES_BY_PAYMENT}
          values={data.SALES_BY_PAYMENT_VALUES}
          centreLabel="collected"
          centreValue={formatAed(data.SALES_BY_PAYMENT_VALUES.reduce((a, b) => a + b, 0))}
          formatValue={formatAed}
        />
      )

    case "sales-by-category":
      return <MiniTable table={data.SALES_BY_CATEGORY} minWidth={760} />

    case "sales-by-channel":
      return (
        <>
          {/* A ranked list, not a bar chart: seven channels is past the point
              where colour carries identity, and the delta per channel is the
              number being asked for — which a bar length can't show. */}
          <BreakdownList items={data.SALES_BY_CHANNEL} />
        </>
      )

    case "sales-acquisition-channel":
      return (
        <DonutChart
          items={data.ACQUISITION_SPLIT}
          values={data.ACQUISITION_VALUES}
          centreLabel="from new clients"
          centreValue={formatAed(data.ACQUISITION_VALUES.reduce((a, b) => a + b, 0))}
          formatValue={formatAed}
        />
      )

    case "acquisition-detail":
      return <MiniTable table={data.ACQUISITION_DETAIL} minWidth={420} />

    case "returning-client-rate":
      return (
        <>
          <HeroValue
            value={data.RETURNING_RATE.value}
            deltaPct={data.RETURNING_RATE.deltaPct}
            footnote={data.RETURNING_RATE.footnote}
          />
          <div className="max-w-md">
            <BreakdownList items={data.RETURNING_BREAKDOWN} />
          </div>
          <p className="text-xs text-muted-foreground">
            Counts are summed per day — one client visiting twice in the period counts twice.
          </p>
          <ComparisonLineChart
            data={data.RETURNING_TREND}
            currentLabel={data.DASHBOARD_PERIOD_LABEL}
            comparisonLabel={data.DASHBOARD_COMPARISON_LABEL}
            formatValue={formatPct}
            zeroBaseline={false}
            height={180}
            grow
          />
        </>
      )

    case "top-team-leaderboard":
      return (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                {[
                  "",
                  "Team member",
                  "Sales",
                  "Occupancy",
                  "Returning clients",
                  "Clients served",
                ].map((label, i) => (
                  <th
                    key={label || "rank"}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap border-b border-border pb-2 pr-4 text-xs font-medium text-muted-foreground last:pr-0",
                      i >= 2 ? "text-right" : "text-left",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.TEAM_LEADERBOARD.map((row, i) => (
                <tr key={row.name}>
                  <td className="border-b border-border/50 py-2.5 pr-4">
                    <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4">
                    <span className="flex items-center gap-2 text-foreground">
                      <Initials initials={row.initials} />
                      {row.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="tabular-nums text-foreground">{row.sales}</span>
                      <DeltaChip pct={row.salesDelta} caption={null} tone="progress" />
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="tabular-nums text-foreground">{row.occupancy}</span>
                      <DeltaChip pct={row.occupancyDelta} caption={null} tone="progress" />
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="tabular-nums text-foreground">{row.returning}</span>
                      <DeltaChip pct={row.returningDelta} caption={null} tone="progress" />
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-border/50 py-2.5 text-right tabular-nums text-foreground">
                    {row.served}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "staff-performance-detail":
      return <MiniTable table={data.STAFF_PERFORMANCE} minWidth={760} />

    case "services-inventory-summary":
      return (
        <>
          <TileRow tiles={data.SERVICES_INVENTORY_TILES} />
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">Top services</h4>
            <MiniTable table={data.TOP_SERVICES} />
          </div>
        </>
      )

    case "inventory-performance":
      return (
        <>
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr>
                  {[
                    "Product",
                    "On hand",
                    "On order",
                    "Reorder point",
                    "Recommended order",
                    "Inventory value",
                    "Status",
                  ].map((label, i) => (
                    <th
                      key={label}
                      scope="col"
                      className={cn(
                        "whitespace-nowrap border-b border-border pb-2 pr-4 text-xs font-medium text-muted-foreground last:pr-0",
                        // First column is the product name, last is a status
                        // badge — both read left. The numbers between them right.
                        i === 0 || i === 6 ? "text-left" : "text-right",
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.INVENTORY_PERFORMANCE.map((row) => {
                  const badge = STOCK_BADGE[row.status]
                  return (
                    <tr key={row.product}>
                      <td className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4 text-foreground">
                        {row.product}
                      </td>
                      {[row.onHand, row.onOrder, row.reorderPoint, row.recommended, row.value].map(
                        (cell, i) => (
                          <td
                            // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional columns.
                            key={i}
                            className="whitespace-nowrap border-b border-border/50 py-2.5 pr-4 text-right tabular-nums text-foreground"
                          >
                            {cell}
                          </td>
                        ),
                      )}
                      <td className="whitespace-nowrap border-b border-border/50 py-2.5 text-left">
                        <Badge variant={badge.variant} size="md">
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cami-yellow-2 p-3">
            <p className="text-sm text-foreground">
              2 SKUs are below their reorder point and 1 is out of stock.
            </p>
            <Button variant="outline" radius="full" size="sm">
              <PackagePlusIcon className="size-3.5" />
              Create purchase order
            </Button>
          </div>
        </>
      )

    // ─── Appointments & CRM ──────────────────────────────────────────────────
    case "booking-funnel-summary":
      return (
        <>
          {/* Funnel across the top, then one row of KPIs beneath it. Side by
              side the funnel column ran out of bars long before the KPI column
              ran out of height. */}
          <FunnelChart stages={data.BOOKING_FUNNEL} />
          {/* One language below the steps: a plain stat line and a plain
              composition bar, separated by a rule. Two bordered boxes of
              different natures, forced to equal height, left the single-figure
              one mostly empty. */}
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4">
            <InlineStat
              label={data.BOOKING_FUNNEL_KPIS[0].label}
              value={data.BOOKING_FUNNEL_KPIS[0].value}
              sub={data.BOOKING_FUNNEL_KPIS[0].sub}
            />
            <CompositionBar caption={data.BOOKED_SPLIT.caption} parts={data.BOOKED_SPLIT.parts} />
          </div>
        </>
      )

    case "occupancy-rate":
      return (
        <>
          <HeroValue
            value={data.OCCUPANCY.value}
            deltaPct={data.OCCUPANCY.deltaPct}
            footnote={data.OCCUPANCY_FOOTNOTE}
          />
          {/* No trend chart. The hero already carries the vs-comparison delta and
              the rows carry the composition, so the chart only added height —
              and it made this card twice the height of the funnel card it sits
              beside, which no grid setting can rescue. */}
          <BreakdownList items={data.OCCUPANCY_BREAKDOWN} />
        </>
      )

    case "capacity-heatmap":
      return (
        <CapacityHeatmap
          rowLabels={data.HEATMAP_HOURS}
          colLabels={data.HEATMAP_DAYS}
          matrix={data.HEATMAP_MATRIX}
        />
      )

    case "whatsapp-funnel":
      return (
        <>
          <FunnelChart stages={data.WHATSAPP_FUNNEL} />
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4">
            <InlineStat
              label={data.WHATSAPP_AUTOMATION[0].label}
              value={data.WHATSAPP_AUTOMATION[0].value}
              sub={data.WHATSAPP_AUTOMATION[0].sub}
            />
            <CompositionBar
              caption={data.WHATSAPP_HANDLING.caption}
              parts={data.WHATSAPP_HANDLING.parts}
            />
          </div>
        </>
      )

    case "daily-inquiry-volume":
      return (
        <>
          <ComparisonLineChart
            data={data.INQUIRY_TREND}
            currentLabel={data.DASHBOARD_PERIOD_LABEL}
            comparisonLabel={data.DASHBOARD_COMPARISON_LABEL}
            formatValue={formatNumber}
            height={236}
            grow
          />
          <TileRow tiles={data.INQUIRY_KPIS} columns={3} />
        </>
      )

    case "lead-engagement-response":
      return (
        <>
          <TileRow tiles={data.RESPONSE_KPIS} columns={3} />
          <div className="flex flex-1 flex-col gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">Open inquiries by age</h4>
            <RankedBarChart
              data={data.OPEN_INQUIRY_AGE}
              formatValue={formatNumber}
              unit="Conversations still open, by how long"
              orientation="column"
            />
          </div>
        </>
      )

    case "closed-lost-reasons":
      return (
        <>
          <MiniTable table={data.CLOSED_LOST_TABLE} />
          <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
            {data.CLOSED_LOST_NOTE}
          </p>
        </>
      )

    case "daily-inquiries":
      return <MiniTable table={data.DAILY_INQUIRIES} minWidth={680} />

    default:
      return null
  }
}

export function DashboardWidgetCard({
  id,
  widget,
  role,
  state = "ready",
}: {
  /** Anchor for the hero strip's jump-to-widget links. */
  id: string
  widget: DashboardWidget
  role: DashboardRole
  state?: DashboardState
}) {
  const scopeNote =
    widget.access[role] === "limited" && widget.limitedNote
      ? LIMITED_SCOPE_NOTE[widget.limitedNote]
      : undefined

  return (
    <div id={id} className={cn("min-w-0 scroll-mt-4", SPAN_CLASS[widget.span])}>
      <DashCard
        title={widget.title}
        viewReportId={widget.viewReportId}
        scopeNote={scopeNote}
        className="h-full"
      >
        {state === "loading" ? (
          <WidgetSkeleton shape={widget.shape} />
        ) : state === "empty" ? (
          <WidgetEmpty label={widget.title.toLowerCase()} />
        ) : (
          <WidgetBody widget={widget} />
        )}
      </DashCard>
    </div>
  )
}
