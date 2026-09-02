import { formatDate } from "@/lib/format"
// Performance dashboard (DSG-79) — mock data for all 19 widgets.
//
// Sourced from Maaz's "Cami Reports.xlsx → 2. Dashboard WIP" draft (the HTML
// wireframe he circulated in Aug 2026). Figures are illustrative placeholders,
// not real merchant data. Currency is AED throughout.
//
// Kept separate from lib/reports/mock.ts (which serves the 20+ table reports)
// so the dashboard's widget data stays greppable next to its registry.

import type { SeriesPoint } from "@/lib/reports/mock"

/**
 * The period this mock data actually describes. The dashboard's date picker
 * opens on it, so the pill, the comparison and the chart legends all say the
 * same thing. Left to its own default the picker showed today — a period the
 * mock has no data for — while every chart was labelled June to July.
 */
export const DASHBOARD_PERIOD = {
  from: new Date(2026, 5, 15),
  to: new Date(2026, 6, 14),
}

/** Same wording the date picker uses, so the two pills read as one sentence. */
export function formatRangeLabel(range: { from: Date; to: Date }): string {
  return `${formatDate(range.from)} – ${formatDate(range.to)}`
}

/** The equal-length period immediately before `range` (PRO-703 §4). */
export function comparisonRange(range: { from: Date; to: Date }) {
  const days = Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000) + 1
  const to = new Date(range.from)
  to.setDate(to.getDate() - 1)
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { from, to }
}

export const DASHBOARD_PERIOD_LABEL = formatRangeLabel(DASHBOARD_PERIOD)
export const DASHBOARD_COMPARISON_LABEL = formatRangeLabel(comparisonRange(DASHBOARD_PERIOD))

/** Daily trend x-axis, shared by every time-series widget on the dashboard. */
const TREND_LABELS = [
  "Jun 15",
  "Jun 18",
  "Jun 21",
  "Jun 24",
  "Jun 27",
  "Jun 30",
  "Jul 3",
  "Jul 6",
  "Jul 9",
  "Jul 12",
  "Jul 14",
]

function series(current: number[], comparison: number[]): SeriesPoint[] {
  return TREND_LABELS.map((label, i) => ({
    label,
    current: current[i],
    comparison: comparison[i],
  }))
}

// ─── Shared value shapes ─────────────────────────────────────────────────────

export type BreakdownItem = {
  label: string
  /** Pre-formatted so a row can carry AED, a count, or a percent equally. */
  value: string
  /** Categorical slot index (0–5) — drives the swatch. Omit for no swatch. */
  slot?: number
  /** Period-over-period change, in percentage points. */
  deltaPct?: number
}

export type MetricValue = {
  value: string
  deltaPct?: number
  footnote?: string
}

export type SimpleTable = {
  columns: { key: string; label: string; align?: "left" | "right" }[]
  rows: Record<string, string>[]
  /** Bold the last row (team average / total). */
  emphasiseLastRow?: boolean
}

export type FunnelStage = { label: string; value: number; slot: number }

// ═══ SALES & REVENUE ═════════════════════════════════════════════════════════

// 1. Total sales
// Definition confirmed against the built API (cami-business,
// src/types/reports/sales-summary.ts): the row chain is
// grossSales − totalDiscounts − refunds = netSales, and totalSales =
// netSales + taxes. So the headline is net of discounts and refunds, and
// tax-INCLUSIVE.
export const TOTAL_SALES: MetricValue = {
  value: "AED 8,750",
  deltaPct: 12,
  footnote: "Net of discounts and refunds, including tax",
}

export const TOTAL_SALES_BREAKDOWN: BreakdownItem[] = [
  { label: "Services", value: "AED 6,420" },
  { label: "Products", value: "AED 2,140" },
  { label: "Packages", value: "AED 190" },
]

export const SALES_OVER_TIME = series(
  [610, 690, 580, 905, 830, 1020, 380, 470, 950, 1010, 1130],
  [560, 650, 540, 700, 640, 780, 420, 460, 660, 700, 760],
)

// 2. Sales by payment type
export const SALES_BY_PAYMENT: BreakdownItem[] = [
  { label: "CamiPay — POS", value: "AED 5,120", slot: 0 },
  { label: "CamiPay — Online", value: "AED 3,480", slot: 1 },
  { label: "Cash", value: "AED 1,340", slot: 2 },
  { label: "Gift card", value: "AED 300", slot: 3 },
]

export const SALES_BY_PAYMENT_VALUES = [5120, 3480, 1340, 300]

// 3. Sales by category
// Columns mirror the shipped sales-summary row exactly, Taxes and Total sales
// included — without them "Total sales" on this card and the headline above it
// would be two different numbers.
export const SALES_BY_CATEGORY: SimpleTable = {
  columns: [
    { key: "cat", label: "Category" },
    { key: "gross", label: "Gross sales", align: "right" },
    { key: "disc", label: "Discounts", align: "right" },
    { key: "ref", label: "Refunds", align: "right" },
    { key: "net", label: "Net sales", align: "right" },
    { key: "tax", label: "Taxes", align: "right" },
    { key: "total", label: "Total sales", align: "right" },
  ],
  rows: [
    {
      cat: "Grooming services",
      gross: "AED 6,820",
      disc: "AED 210",
      ref: "AED 40",
      net: "AED 6,570",
      tax: "AED 329",
      total: "AED 6,899",
    },
    {
      cat: "Retail products",
      gross: "AED 2,310",
      disc: "AED 90",
      ref: "AED 30",
      net: "AED 2,190",
      tax: "AED 110",
      total: "AED 2,300",
    },
    {
      cat: "Boarding & daycare",
      gross: "AED 980",
      disc: "AED 15",
      ref: "AED 0",
      net: "AED 965",
      tax: "AED 48",
      total: "AED 1,013",
    },
    {
      cat: "Packages",
      gross: "AED 210",
      disc: "AED 20",
      ref: "AED 0",
      net: "AED 190",
      tax: "AED 10",
      total: "AED 200",
    },
  ],
}

// 4. Sales by booking channel — 7 channels, so the 5-slot categorical palette
// is exhausted; the tail folds into the neutral "Other" slot rather than
// inventing hues (dataviz rule: assign in fixed order, never cycle).
/**
 * Booking channel is HOW the sale was booked, and today that is two values.
 * The draft listed seven (Booking Link, Instagram, WhatsApp, Marketing, TikTok,
 * Walk-in, Referral) but those are sources, not booking routes — Maaz confirmed
 * they collapse to one Online channel until per-link URL tracking exists, at
 * which point Online breaks down further. Where the client CAME from is a
 * separate, manually maintained field: see ACQUISITION_SPLIT.
 */
export const SALES_BY_CHANNEL: BreakdownItem[] = [
  { label: "Online", value: "AED 6,180", deltaPct: 16 },
  { label: "In person", value: "AED 2,570", deltaPct: 3 },
]

export const SALES_BY_CHANNEL_NOTE =
  "Online covers every booking link. It splits by source once link tracking ships."

// Dropped from the card: "7 active channels" was a hero figure nobody acts on.
// The ranked list underneath is what the card is for.

// 5. Sales acquisition channel (client source)
export const ACQUISITION_SPLIT: BreakdownItem[] = [
  { label: "Website", value: "AED 2,860", slot: 0 },
  { label: "TikTok", value: "AED 1,740", slot: 1 },
  { label: "Instagram", value: "AED 1,510", slot: 2 },
  { label: "Marketing campaigns", value: "AED 980", slot: 3 },
  { label: "Friend referral", value: "AED 610", slot: 4 },
  { label: "Other (GMB, Facebook, walk-in)", value: "AED 790", slot: 5 },
]

export const ACQUISITION_VALUES = [2860, 1740, 1510, 980, 610, 790]

export const ACQUISITION_DETAIL: SimpleTable = {
  columns: [
    { key: "src", label: "Client source" },
    { key: "clients", label: "New clients", align: "right" },
    { key: "rev", label: "Revenue", align: "right" },
  ],
  rows: [
    { src: "Website", clients: "41", rev: "AED 2,860" },
    { src: "TikTok", clients: "29", rev: "AED 1,740" },
    { src: "Instagram", clients: "24", rev: "AED 1,510" },
    { src: "Marketing campaigns", clients: "14", rev: "AED 980" },
    { src: "Friend referral", clients: "9", rev: "AED 610" },
    { src: "Google My Business", clients: "7", rev: "AED 420" },
    { src: "Facebook", clients: "4", rev: "AED 250" },
    { src: "Walk-in", clients: "3", rev: "AED 120" },
  ],
}

// 6. Returning client rate
// The shipped client-summary defines "returning" as a prior qualifying visit
// within 180 days of the business date — a client whose only earlier visit is
// older counts as new again. That window is provisional (narrowing it means
// replaying history, not editing a view), so the card states it rather than
// letting an owner assume "ever".
export const RETURNING_RATE: MetricValue = {
  value: "77%",
  deltaPct: 3,
  footnote: "Returning = visited within the last 180 days",
}

export const RETURNING_BREAKDOWN: BreakdownItem[] = [
  { label: "New", value: "128" },
  { label: "Returning", value: "423" },
  { label: "Walk-in", value: "10" },
]

export const RETURNING_TREND = series(
  [68, 70, 71, 73, 72, 74, 75, 74, 76, 77, 77],
  [64, 65, 66, 68, 67, 69, 70, 69, 71, 72, 72],
)

// 7. Average sale value
export const AVERAGE_SALE: MetricValue = {
  value: "AED 142",
  deltaPct: 5,
  footnote: "AED 8,750 across 62 sale transactions",
}

export const AVERAGE_SALE_TREND = series(
  [128, 131, 126, 138, 134, 145, 119, 124, 147, 151, 142],
  [121, 124, 118, 127, 123, 130, 115, 118, 129, 133, 135],
)

// 8. Top team members leaderboard
export type LeaderboardRow = {
  initials: string
  name: string
  sales: string
  salesDelta: number
  occupancy: string
  occupancyDelta: number
  returning: string
  returningDelta: number
  served: string
}

export const TEAM_LEADERBOARD: LeaderboardRow[] = [
  {
    initials: "AL",
    name: "Aisha Al Marri",
    sales: "AED 2,860",
    salesDelta: 14,
    occupancy: "81%",
    occupancyDelta: 5,
    returning: "82%",
    returningDelta: 6,
    served: "34",
  },
  {
    initials: "RK",
    name: "Ravi Kumar",
    sales: "AED 2,140",
    salesDelta: 6,
    occupancy: "74%",
    occupancyDelta: -2,
    returning: "71%",
    returningDelta: 3,
    served: "27",
  },
  {
    initials: "SM",
    name: "Sara Mostafa",
    sales: "AED 1,780",
    salesDelta: 11,
    occupancy: "69%",
    occupancyDelta: 4,
    returning: "75%",
    returningDelta: -1,
    served: "24",
  },
  {
    initials: "JD",
    name: "Jomar Dela Cruz",
    sales: "AED 1,410",
    salesDelta: -3,
    occupancy: "62%",
    occupancyDelta: 1,
    returning: "66%",
    returningDelta: 2,
    served: "19",
  },
  {
    initials: "HN",
    name: "Hana Noor",
    sales: "AED 880",
    salesDelta: 9,
    occupancy: "58%",
    occupancyDelta: 8,
    returning: "60%",
    returningDelta: 5,
    served: "13",
  },
]

// 9. Staff performance detail
export const STAFF_PERFORMANCE: SimpleTable = {
  columns: [
    { key: "name", label: "Team member" },
    { key: "svc", label: "Service sales", align: "right" },
    { key: "prod", label: "Product sales", align: "right" },
    { key: "net", label: "Net revenue", align: "right" },
    { key: "util", label: "Occupancy", align: "right" },
    { key: "rph", label: "Revenue / paid hr", align: "right" },
    { key: "rebook", label: "Rebooking", align: "right" },
    { key: "newc", label: "New clients", align: "right" },
    { key: "retc", label: "Returning clients", align: "right" },
  ],
  rows: [
    {
      name: "Aisha Al Marri",
      svc: "AED 2,772",
      prod: "AED 88",
      net: "AED 2,860",
      util: "81%",
      rph: "AED 92",
      rebook: "64%",
      newc: "9",
      retc: "25",
    },
    {
      name: "Ravi Kumar",
      svc: "AED 2,077",
      prod: "AED 63",
      net: "AED 2,140",
      util: "74%",
      rph: "AED 78",
      rebook: "58%",
      newc: "7",
      retc: "19",
    },
    {
      name: "Sara Mostafa",
      svc: "AED 1,729",
      prod: "AED 51",
      net: "AED 1,780",
      util: "69%",
      rph: "AED 74",
      rebook: "61%",
      newc: "6",
      retc: "17",
    },
    {
      name: "Jomar Dela Cruz",
      svc: "AED 1,371",
      prod: "AED 39",
      net: "AED 1,410",
      util: "62%",
      rph: "AED 66",
      rebook: "49%",
      newc: "5",
      retc: "12",
    },
    {
      name: "Team average",
      svc: "AED 1,987",
      prod: "AED 61",
      net: "AED 2,048",
      util: "71%",
      rph: "AED 77",
      rebook: "58%",
      newc: "7",
      retc: "18",
    },
  ],
  emphasiseLastRow: true,
}

export const STAFF_PERFORMANCE_NOTE =
  "Service revenue splits by each member's contribution; product sales split evenly across the staff on the appointment."

// 10. Inventory performance
export type StockStatus = "in-stock" | "low" | "out" | "slow"

export type InventoryRow = {
  product: string
  onHand: string
  onOrder: string
  reorderPoint: string
  recommended: string
  value: string
  status: StockStatus
}

export const INVENTORY_PERFORMANCE: InventoryRow[] = [
  {
    product: "Oatmeal shampoo 1L",
    onHand: "2",
    onOrder: "0",
    reorderPoint: "8",
    recommended: "20",
    value: "AED 90",
    status: "low",
  },
  {
    product: "Deshedding brush",
    onHand: "0",
    onOrder: "12",
    reorderPoint: "5",
    recommended: "0",
    value: "AED 0",
    status: "out",
  },
  {
    product: "Cat calming spray",
    onHand: "14",
    onOrder: "0",
    reorderPoint: "6",
    recommended: "0",
    value: "AED 420",
    status: "in-stock",
  },
  {
    product: "Nail clipper kit",
    onHand: "3",
    onOrder: "0",
    reorderPoint: "4",
    recommended: "6",
    value: "AED 135",
    status: "low",
  },
  {
    product: "Puppy conditioner 500ml",
    onHand: "26",
    onOrder: "0",
    reorderPoint: "10",
    recommended: "0",
    value: "AED 780",
    status: "slow",
  },
]

// 11. Services & inventory summary
export const SERVICES_INVENTORY_TILES = [
  { label: "Service revenue", value: "AED 6,820", sub: "↑ 11% vs comparison" },
  { label: "Retail revenue", value: "AED 2,310", sub: "↑ 6% vs comparison" },
  { label: "Inventory value", value: "AED 8,940", sub: "across 42 SKUs" },
  { label: "Reorder required", value: "6 SKUs", sub: "≈ AED 1,120 est. cost" },
]

export const TOP_SERVICES: SimpleTable = {
  columns: [
    { key: "s", label: "Service" },
    { key: "c", label: "Completed", align: "right" },
    { key: "rev", label: "Net revenue", align: "right" },
    { key: "rph", label: "Revenue / hr", align: "right" },
  ],
  rows: [
    { s: "Full groom — medium dog", c: "38", rev: "AED 3,040", rph: "AED 95" },
    { s: "Bath & brush", c: "44", rev: "AED 1,760", rph: "AED 80" },
    { s: "Nail trim", c: "61", rev: "AED 610", rph: "AED 61" },
    { s: "Cat groom", c: "12", rev: "AED 960", rph: "AED 88" },
  ],
}

// ═══ APPOINTMENT MANAGEMENT (CRM) ════════════════════════════════════════════

// 12. Booking funnel summary
/**
 * Deliberately no longer a funnel. Its three stages were the inbound funnel's
 * first, fourth and fifth — the same 104 and 88 printed twice on one page — and
 * its top figure said 186 where the inbound funnel said 214, so the two cards
 * contradicted each other in public. Maaz confirmed they are one funnel; the
 * stages live on the inbound card and this one answers "how many, and who".
 */
export const BOOKED_TOTAL = {
  value: "104",
  deltaPct: 8,
  footnote: "88 confirmed — 85% of booked, up 4% vs comparison",
}

// Only the change. The rate itself is already on the funnel above — a stage's
// "−15% drop-off" and an 85% conversion are the same fact stated twice — so
// this line carries what the funnel can't say: the movement since last period.
// BOOKING_FUNNEL_KPIS is gone. "Booked → Confirmed ↑ 4%" was a third layout in
// a card that already had a headline and a list, and it repeated the footnote
// directly above it. The movement now rides in that footnote.

// The draft flags Contact → Booked as "a directional trend, not a headline".
// That caveat is a spec question — whether a booking counts on the booked date
// or the appointment date, open since July per the reporting PRD — not something
// a merchant needs read to them on the card, so it lives here and in DSG-79
// rather than in the UI.

export const BOOKED_SPLIT = {
  caption: "Of the 104 booked",
  /** BreakdownItem, so it renders in the same list as every other card. */
  parts: [
    { label: "New customers", value: "44", slot: 0 },
    { label: "Returning customers", value: "60", slot: 1 },
  ] as BreakdownItem[],
}

// 13. Capacity heatmap
export const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const HEATMAP_HOURS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm"]

/** matrix[hourRow][dayCol] — utilisation 0–1. */
export const HEATMAP_MATRIX = [
  [0.3, 0.4, 0.3, 0.5, 0.6, 0.8, 0.5],
  [0.4, 0.5, 0.4, 0.6, 0.7, 0.9, 0.6],
  [0.5, 0.6, 0.4, 0.7, 0.8, 1.0, 0.6],
  [0.6, 0.7, 0.5, 0.8, 0.9, 0.95, 0.5],
  [0.4, 0.5, 0.4, 0.6, 0.8, 0.9, 0.4],
  [0.5, 0.6, 0.5, 0.7, 0.9, 0.85, 0.4],
  [0.6, 0.7, 0.5, 0.8, 0.9, 0.8, 0.3],
  [0.3, 0.4, 0.3, 0.5, 0.7, 0.6, 0.2],
]

// 14. Occupancy rate
export const OCCUPANCY: MetricValue = { value: "72%", deltaPct: -2 }

// working-hours-summary ships scheduled / blocked / leave / available / booked
// / unbooked minutes, with occupancyPct = booked ÷ available. blockedMinutes
// and leaveMinutes are always 0 in the current pass, so available == scheduled
// today — the two rows are kept separate so the day they diverge, the card
// already reads correctly.
/** "Scheduled hours" sat here reading 312 beside "Available hours" reading 312
 *  — the same figure under two names, because breaks and leave are not carved
 *  out yet (the footnote says so). It returns when the two actually differ. */
export const OCCUPANCY_BREAKDOWN: BreakdownItem[] = [
  { label: "Available hours", value: "312 hrs" },
  { label: "Booked hours", value: "225 hrs" },
  { label: "Unbooked hours", value: "87 hrs" },
]

export const OCCUPANCY_FOOTNOTE =
  "Booked ÷ available hours. Breaks and leave aren’t carved out yet."

export const OCCUPANCY_TREND = series(
  [66, 68, 65, 71, 70, 74, 62, 64, 73, 76, 72],
  [69, 70, 68, 72, 71, 75, 66, 67, 74, 76, 74],
)

// 15. WhatsApp conversation funnel
/** All inbound conversations. WhatsApp is the only source today, so this is
 *  both funnels at once — see the widget title for why they are not twins. */
export const WHATSAPP_FUNNEL: FunnelStage[] = [
  { label: "Inquiries", value: 214, slot: 0 },
  { label: "Engaged", value: 172, slot: 1 },
  { label: "Quoted", value: 139, slot: 2 },
  { label: "Booked", value: 104, slot: 3 },
  { label: "Visited", value: 88, slot: 4 },
]

export const WHATSAPP_AUTOMATION = [
  { label: "Quoted → Booked", value: "↑ 3%", sub: "vs comparison" },
]

/** The 83% AI-handled figure, as counts, so it reads against the funnel.
 *  "AI handled" and "Auto-scheduled" were the same metric under two names;
 *  Maaz standardised on AI-handled. */
export const WHATSAPP_HANDLING = {
  caption: "Of the 104 booked",
  parts: [
    { label: "AI-handled", value: 86, slot: 0 },
    { label: "Handled by a person", value: 18, slot: 1 },
  ],
}

// 16. Closed-lost reasons
/** Table form, as in the draft — the reasons are phrases, and a table lets each
 *  sit on one line without the wrapping or rotation a category axis forces. */
export const CLOSED_LOST_TABLE: SimpleTable = {
  columns: [
    { key: "reason", label: "Reason" },
    { key: "count", label: "Conversations", align: "right" },
    { key: "share", label: "% of total", align: "right" },
  ],
  rows: [
    { reason: "Price", count: "38", share: "34%" },
    { reason: "Unresponsive 3+", count: "29", share: "26%" },
    { reason: "Timing", count: "21", share: "19%" },
    { reason: "Chose competitor", count: "14", share: "13%" },
    { reason: "Other", count: "9", share: "8%" },
  ],
}

export const CLOSED_LOST_NOTE =
  "Reasons are tagged by hand today; 6 conversations (5%) have none. Unresponsive 3+ is automated later."

// 17. Lead engagement & response times
export const RESPONSE_KPIS = [
  { label: "Avg lead time", value: "6.4 hrs", sub: "inquiry → booked" },
  { label: "Avg first response", value: "4.1 min", sub: "↓ 1.2 min vs comparison" },
  { label: "Follow-up delays", value: "11 convs", sub: "open more than 2 hours" },
]

export const OPEN_INQUIRY_AGE = [
  { label: "0–2h", value: 24, slot: 0 },
  { label: "2–24h", value: 9, slot: 1 },
  { label: "1–3d", value: 4, slot: 2 },
  { label: "3+d", value: 2, slot: 3 },
]

// 18. Daily inquiry volume
export const INQUIRY_TREND = series(
  [18, 22, 19, 27, 24, 31, 20, 23, 29, 33, 30],
  [16, 19, 18, 22, 21, 26, 18, 20, 24, 27, 26],
)

export const INQUIRY_KPIS = [
  { label: "Peak day", value: "Jul 12", sub: "33 inquiries" },
  { label: "Avg / day", value: "25.2", sub: "↑ 9% vs comparison" },
  { label: "AI-handled", value: "83%", sub: "no human touch needed" },
]

// 19. Daily inquiries (close-the-loop audit)
export const DAILY_INQUIRIES: SimpleTable = {
  columns: [
    { key: "d", label: "Date" },
    { key: "i", label: "Inquiries", align: "right" },
    { key: "e", label: "Engaged", align: "right" },
    { key: "q", label: "Quoted", align: "right" },
    { key: "b", label: "Booked", align: "right" },
    { key: "v", label: "Visited", align: "right" },
    { key: "l", label: "Lost", align: "right" },
    { key: "lr", label: "Lost revenue", align: "right" },
  ],
  rows: [
    { d: "15 Aug 2026", i: "22", e: "18", q: "14", b: "11", v: "9", l: "4", lr: "AED 610" },
    { d: "14 Aug 2026", i: "19", e: "16", q: "12", b: "9", v: "8", l: "3", lr: "AED 420" },
    { d: "13 Aug 2026", i: "27", e: "21", q: "17", b: "13", v: "10", l: "6", lr: "AED 880" },
    { d: "12 Aug 2026", i: "24", e: "19", q: "15", b: "12", v: "11", l: "5", lr: "AED 715" },
    { d: "11 Aug 2026", i: "16", e: "13", q: "10", b: "8", v: "7", l: "3", lr: "AED 390" },
  ],
}

// ─── Hero strip ──────────────────────────────────────────────────────────────
// The six numbers an owner checks first, lifted out of the widgets below so the
// answer is above the fold and the 19 cards are the drill-down, not the entry
// point.

/**
 * The strip earns its place by surfacing what is otherwise thousands of pixels
 * down the page. It used to repeat four cards verbatim — Total sales, Avg sale
 * value, Occupancy and Returning clients all appeared again within two screens,
 * Total sales directly underneath itself — which made the strip look like a
 * summary and behave like an echo.
 *
 * Total sales stays as the headline: its card adds the services/products/
 * packages split, so the number is the answer and the card is the why. The
 * other five now come from the CRM half of the page, which a reader would have
 * to scroll past everything else to reach.
 */
export const HERO_METRICS = [
  { id: "total-sales", label: "Total sales", value: "AED 8,750", deltaPct: 12 },
  { id: "occupancy-rate", label: "Occupancy", value: "72%", deltaPct: -2 },
  { id: "whatsapp-funnel", label: "Inquiry → visit", value: "41%", deltaPct: 4 },
  { id: "whatsapp-funnel", label: "AI-handled", value: "83%", deltaPct: 6 },
  {
    id: "lead-engagement-response",
    label: "Avg first response",
    value: "4.1 min",
    deltaPct: -23,
    lowerIsBetter: true,
  },
  { id: "services-inventory-summary", label: "Reorder required", value: "6 SKUs" },
]
