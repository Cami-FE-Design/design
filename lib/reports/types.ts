// Report registry types. The Reporting module is config-driven: a small set of
// view templates render every report from these definitions (columns, filters,
// date controls) rather than 26 bespoke screens.

export type ReportCategory =
  | "dashboards"
  | "sales"
  | "finance"
  | "appointments"
  | "team"
  | "clients"
  | "inventory"

export type ViewTemplate = "table" | "detailed-table" | "dashboard"

/** Which date control the report's toolbar shows. */
export type DateControl =
  | "range" // date-range picker with presets (most reports)
  | "range-granularity" // granularity (Month/Week) + range — Finance summary
  | "single-date" // single-day stepper — Stock on hand
  | "range-compare" // range + "Compare to" period — dashboards

export type ColumnKind =
  | "text"
  | "money" // AED
  | "number"
  | "percent"
  | "date"
  | "datetime"
  | "duration"
  | "link" // accent-coloured linked-entity text
  | "status" // status badge
  | "boolean" // Yes / No

export type ColumnDef = {
  key: string
  label: string
  /** Defaults to "text". */
  kind?: ColumnKind
  /** Defaults to left; money/number/percent render right unless overridden. */
  align?: "left" | "right"
  /** Emphasised (semibold) — used for the primary column. */
  emphasis?: boolean
  /**
   * Ratio columns can't be summed for the Total row (e.g. % Occupancy, Average
   * appt. value). Instead the total is a weighted ratio of two source columns:
   * Σ numerator ÷ Σ denominator, × 100 for a percent (% Occupancy = booked ÷
   * available; Average appt. value = total value ÷ appointments).
   */
  totalFrom?: { numerator: string; denominator: string }
}

/** Filter groups shown in the right-hand Filters sheet. */
export type FilterKey =
  | "location"
  | "type"
  | "teamMember"
  | "channel"
  | "paymentMethod"
  | "category"
  | "status"
  | "clientGender"
  | "clientRetention"
  | "discountCategory"
  | "brand"
  | "supplier"

/** Primary group-by dimension — the left-most "Type ▾" / "Team member ▾" pill. */
export type GroupBy = {
  label: string
  options: string[]
  /**
   * Dimensions where one record sits in several rows (an appointment with two
   * services is under both), keyed by option, with the note the table shows
   * while that option is picked. Rows then add up to more than the Total row,
   * which carries the distinct count from MOCK_DISTINCT_TOTALS instead.
   */
  overlapNote?: Record<string, string>
}

/**
 * Summary → detail drill-through. Clicking a summary row's first-column entity
 * opens the target report pre-filtered to that entity (shown as a removable
 * chip), e.g. Appointments summary → Appointments list filtered by location.
 * The active group-by dimension chooses which filter the value is applied to.
 */
export type DrillThrough = {
  /** Target report id, e.g. "appointments-list". */
  report: string
  /** Maps each group-by option label to the target column the value filters. */
  paramByDimension: Record<string, string>
}

export type ReportDef = {
  /** URL slug + registry key, e.g. "sales-summary". */
  id: string
  category: ReportCategory
  name: string
  description: string
  template: ViewTemplate
  dateControl: DateControl
  /** Premium badge on the index card. */
  premium?: boolean
  /** Dashboard reports ship behind a feature flag (future add-on pricing). */
  featureFlagged?: boolean
  /**
   * Not built yet — kept out of the live index until scope is confirmed with
   * Michelle/Maaz. Commission reports (ticket §7 "out" vs MVP sheet "in") and
   * Client insights (separate vs merge) are parked here.
   */
  held?: boolean
  heldReason?: string
  groupBy?: GroupBy
  /** The order rows open in; the Sort menu still overrides it. Defaults to data order. */
  defaultSort?: { key: string; dir: "asc" | "desc" }
  columns?: ColumnDef[]
  filters?: FilterKey[]
  /** First-column entity links through to a detail report pre-filtered to it. */
  drillThrough?: DrillThrough
  /** Clients-category reports add a Pet Name column beside Client (PRO-703 §4). */
  hasPetColumn?: boolean
  /** Render a bold Total row at the top of the table. */
  totalRow?: boolean
}
