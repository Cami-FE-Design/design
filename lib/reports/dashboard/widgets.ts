// Performance dashboard widget registry (DSG-79).
//
// The dashboard is config-driven the same way the rest of the Reporting module
// is: this file owns *which* widgets exist, what order and width they take, who
// may see them, and where each drills through to. The bodies live in
// components/blocks/reports/dashboard/dashboard-widget.tsx, keyed by id.
//
// Splitting it this way is what makes the two dashboard-level features cheap:
// the "Customise dashboard" sheet toggles ids, and the role preview filters on
// `access` — neither needs to know how a widget draws itself.
//
// Source: Maaz's "Cami Reports.xlsx → 2. Dashboard WIP" tab, Aug 2026 revision
// (19 widgets; Appointments Summary, Deposit Overrides, Lost Revenue
// Opportunities, Appointment Outcomes and Booked-Not-Yet-Confirmed were dropped
// by the Owner in that revision).

export type DashboardSectionId = "sales" | "crm"

/**
 * Review states for the dashboard, reachable as ?state=loading / ?state=empty
 * — the same URL-driven demo pattern the product-import screens use, so the
 * team can review a state without needing a live API to be in it.
 */
export type DashboardState = "ready" | "loading" | "empty" | "sparse"

/**
 * Widgets that come back empty in the "sparse" state — a real merchant case,
 * not a contrivance: these are the cards Anum's feasibility audit lists as
 * having no data source at all (no inbound-conversation or lead entity exists),
 * so a salon with a full sales month still sees nothing in them. Capacity
 * heatmap and Occupancy rate are excluded: they read working-hours data, which
 * is built.
 */
export const WIDGETS_WITHOUT_DATA = [
  "booking-funnel-summary",
  "whatsapp-funnel",
  "closed-lost-reasons",
  "lead-engagement-response",
  "daily-inquiry-volume",
  "daily-inquiries",
  "sales-by-channel",
]

export type DashboardRole = "owner" | "manager" | "staff"

/**
 * "limited" means the widget renders but scoped to the viewer — their own row
 * on a leaderboard, their own hours on an occupancy chart. The mock renders the
 * full data and labels the scope; the real build applies it server-side.
 */
export type AccessLevel = "full" | "limited" | "none"

// Reality check against the built product (cami-business,
// src/types/reports/report-flags.ts): report visibility there is a single
// SYSTEM-WIDE flag map, and only super_admin may PUT it; favourites are the
// only per-user state. So neither the per-business widget toggle nor the
// per-role gating below has a backend yet — both are design proposals, and
// Maaz/BE need to confirm before either is treated as shipped behaviour.

export type DashboardWidget = {
  id: string
  section: DashboardSectionId
  title: string
  /** One line under the title in the Customise sheet — not on the card. */
  description: string
  /** Columns out of 12 at `lg` and up. Everything is full-width below that. */
  span: 4 | 5 | 6 | 7 | 8 | 12
  access: Record<DashboardRole, AccessLevel>
  /** Shown beside a "limited" access level in the Customise sheet. */
  limitedNote?: string
  /** Report id the card's "View report" link opens. */
  viewReportId?: string
  /** Hidden by default — the owner opts in from the Customise sheet. */
  offByDefault?: boolean
  /**
   * Which skeleton to draw while the widget loads. Kept here rather than in the
   * renderer so the loading state stays in step with the card list: add a
   * widget and you are asked for its shape.
   */
  shape: WidgetShape
}

export type WidgetShape =
  | "stat" // hero figure plus a short list
  | "chart" // hero figure plus a trend line
  | "donut" // ring plus a legend
  | "table" // header row plus body rows
  | "funnel" // label / bar / drop-off rows
  | "heatmap" // day x hour grid
  | "tiles"

export const DASHBOARD_SECTIONS: { id: DashboardSectionId; label: string }[] = [
  { id: "sales", label: "Sales & revenue" },
  { id: "crm", label: "Appointments & CRM" },
]

// ORDER FOLLOWS THE DRAFT, not the grid. An earlier pass resequenced these so
// every row summed neatly to 12 columns, which quietly broke the argument the
// draft's order makes: total money, then how it was paid, then what it was
// for, then where it came from (the two channel reports are adjacent on
// purpose), then who it came from, ticket size, who sold it, and finally what
// stock backs it. CRM runs conversion, capacity, conversation detail, why we
// lost, how fast we answer, volume, and the daily audit.
//
// Where the draft's order and a clean layout disagree, layout wins and the
// deviation is named. Sales by payment type is four slices: at full width its
// legend spread so far from the donut that a label and its amount stopped
// reading as a pair. It is 6 wide now, which lets the grid pack a neighbour
// beside it — at the cost of the draft's booking-channel/acquisition-channel
// adjacency. Returning client rate takes the full width instead, laid out in
// two columns so it fills honestly.
//
// Spans pair the draft's order into full rows. Dense packing alone was not
// enough: it only backfills when a LATER card is small enough for the hole, and
// after Average sale value every remaining card is full width — so it, the
// WhatsApp funnel and Daily inquiry volume each sat alone with dead space
// beside them. Widths are now chosen so consecutive cards add to 12.
//
// The grid still packs with
// `grid-auto-flow: dense`, which is what the draft's CSS did too: order is
// declared here, and the browser backfills gaps rather than leaving a card
// stranded at full width. Forcing every row to add to 12 by hand — the previous
// approach — left a 4-slice donut and a 3-step funnel each alone across 1100px.
export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  // Sales & revenue. Row: 4 + 8 - the draft's Total Sales is one report holding
  // both the figure and the trend; split so each can be switched off alone.
  {
    id: "total-sales",
    section: "sales",
    title: "Total sales",
    description: "Revenue across every sale line item, split by service, product and package.",
    span: 4,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "sales-summary",
    shape: "stat",
  },
  {
    id: "sales-over-time",
    section: "sales",
    title: "Sales over time",
    description: "Daily revenue trend against the comparison period.",
    span: 8,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "sales-summary",
    shape: "chart",
  },
  {
    id: "sales-by-payment",
    section: "sales",
    title: "Sales by payment type",
    description: "Revenue split by card, cash, online wallet and gift card.",
    // 8 + 4 rather than 6 + 6. Booking channel collapsed to two rows once Maaz
    // confirmed there is one Online channel today, and a two-row list beside a
    // stacked donut left a card that was mostly empty. The donut goes wide
    // (ring beside its legend), which is both shorter and better use of 8.
    span: 8,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "payments-summary",
    shape: "donut",
  },
  {
    id: "sales-by-category",
    section: "sales",
    title: "Sales by category",
    description: "Gross, discounts, refunds and net revenue per service or product category.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "sales-summary",
    shape: "table",
  },
  // Row: 6 + 6 - the two channel reports stay together, as in the draft.
  {
    id: "sales-by-channel",
    section: "sales",
    title: "Sales by booking channel",
    description: "How the sale was booked. Where the client came from is the acquisition card.",
    span: 4,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "sales-summary",
    shape: "stat",
  },
  {
    id: "sales-acquisition-channel",
    section: "sales",
    title: "Sales by acquisition channel",
    description: "Client source - which channels are generating new demand.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "client-summary",
    shape: "donut",
  },
  {
    id: "acquisition-detail",
    section: "sales",
    title: "New client acquisition - detail",
    description: "New clients and revenue per client source, including the long tail.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "client-list",
    shape: "table",
  },
  // Row: 8 + 4
  {
    id: "returning-client-rate",
    section: "sales",
    title: "Returning client rate",
    description: "Retention trend, split between new, returning and walk-in clients.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "limited" },
    limitedNote: "Own client base only",
    viewReportId: "client-summary",
    shape: "chart",
  },
  {
    id: "average-sale-value",
    section: "sales",
    title: "Average sale value",
    description: "Ticket size trend - total sales divided by transaction count.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "sales-log-detail",
    shape: "chart",
  },
  {
    id: "top-team-leaderboard",
    section: "sales",
    title: "Top team members",
    description: "Who is driving revenue, occupancy and retention this period.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "limited" },
    limitedNote: "Own row only",
    viewReportId: "working-hours-summary",
    shape: "table",
  },
  {
    id: "staff-performance-detail",
    section: "sales",
    title: "Staff performance detail",
    description: "Per-staff scorecard: revenue, utilisation, rebooking, retention, retail attach.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "limited" },
    limitedNote: "Own row only",
    viewReportId: "working-hours-summary",
    shape: "table",
  },
  {
    id: "inventory-performance",
    section: "sales",
    title: "Inventory performance",
    description: "What needs reordering now, with an estimated purchase-order cost.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "stock-on-hand",
    shape: "table",
  },
  {
    id: "services-inventory-summary",
    section: "sales",
    title: "Services & inventory summary",
    description: "Service economics and retail stock health side by side.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "stock-on-hand",
    shape: "tiles",
  },

  // Appointments & CRM
  {
    id: "booking-funnel-summary",
    section: "crm",
    title: "Appointments booked",
    description:
      "How many appointments were booked, how many confirmed, and the new-vs-returning split. The stages that get there are on the inbound conversation funnel.",
    span: 7,
    access: { owner: "full", manager: "full", staff: "none" },
    viewReportId: "appointments-summary",
    shape: "stat",
  },
  {
    id: "capacity-heatmap",
    section: "crm",
    title: "Capacity heatmap",
    description: "When the business is over- or under-booked, by day and hour.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "limited" },
    limitedNote: "Own schedule only",
    viewReportId: "appointments-list",
    shape: "heatmap",
  },
  // Row: 4 + 8 - occupancy stays beside the heatmap it explains.
  {
    id: "occupancy-rate",
    section: "crm",
    title: "Occupancy rate",
    description: "How much of available staff time is filled with paid appointments.",
    span: 5,
    access: { owner: "full", manager: "full", staff: "limited" },
    limitedNote: "Own hours only",
    viewReportId: "working-hours-summary",
    shape: "stat",
  },
  {
    id: "whatsapp-funnel",
    section: "crm",
    // Named for the funnel, not the channel. Maaz confirmed WhatsApp is a
    // subset of inbound conversations — but today it is the ONLY source, so a
    // separate WhatsApp funnel would print identical figures beside this one.
    // When IG, email and TikTok land as inbound sources, this card gains a
    // source breakdown rather than a twin.
    title: "Inbound conversation funnel",
    description: "Every conversation from first inquiry through to a salon visit.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    shape: "funnel",
  },
  // Row: 6 + 6
  {
    id: "closed-lost-reasons",
    section: "crm",
    title: "Closed-lost reasons",
    description: "Why inquiries failed to convert - the coaching list for reception.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    shape: "table",
  },
  {
    id: "lead-engagement-response",
    section: "crm",
    title: "Lead engagement & response times",
    description: "How fast leads are answered, and what is sitting unanswered.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    shape: "tiles",
  },
  {
    id: "daily-inquiry-volume",
    section: "crm",
    title: "Daily inquiry volume",
    description: "Inbound demand trend, so inbox staffing can match volume.",
    span: 6,
    access: { owner: "full", manager: "full", staff: "none" },
    shape: "chart",
  },
  {
    id: "daily-inquiries",
    section: "crm",
    title: "Daily inquiries",
    description: "Day-by-day audit proving no inquiry falls through the cracks.",
    span: 12,
    access: { owner: "full", manager: "full", staff: "none" },
    shape: "table",
  },
]

export const DEFAULT_VISIBLE_WIDGETS = DASHBOARD_WIDGETS.filter((w) => !w.offByDefault).map(
  (w) => w.id,
)

export const ROLE_LABELS: Record<DashboardRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
}

/** Widgets a role may see at all — "none" drops the card entirely. */
export function widgetsForRole(widgets: DashboardWidget[], role: DashboardRole): DashboardWidget[] {
  return widgets.filter((w) => w.access[role] !== "none")
}
