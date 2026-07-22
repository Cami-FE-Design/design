// Performance over time — the data model behind the third dashboard matrix:
// entity (team member OR location) × time-period, for a chosen business metric.
// Unlike Performance summary (metric × member, hand-authored), this view is
// LIVE: switching the metric, the granularity (Day/Week/Month) or the date range
// recomputes both the table and the bar chart. To stay deterministic (no
// hydration mismatch — a client value must match the server render) the daily
// cube is generated from a seeded hash, never Math.random.
//
// Metrics reuse the Performance summary section list verbatim, so the two
// reports agree on what a "metric" is. Summable kinds (money/number/duration)
// aggregate by sum; ratio kinds (percent) can't be summed across time, so they
// aggregate as a weighted average by that day's activity — the honest roll-up.

import type { DateRange } from "@/components/blocks/date-range-popover"
import {
  PERFORMANCE_SUMMARY_MEMBERS,
  PERFORMANCE_SUMMARY_SECTIONS,
  type PerfMetricKind,
} from "./mock"

export type PerfOtMetric = { section: string; label: string; kind: PerfMetricKind }
export type PerfDimension = "Team member" | "Location"
export type PerfGranularity = "Day" | "Week" | "Month"

/** Flattened, section-grouped metric picker — the full Performance summary set. */
export const PERF_OT_METRICS: PerfOtMetric[] = PERFORMANCE_SUMMARY_SECTIONS.flatMap((s) =>
  s.rows.map((r) => ({ section: s.label, label: r.label, kind: r.kind })),
)

/** Default selection = "Total sales" (matches the Fresha reference default). */
export const DEFAULT_METRIC_INDEX = Math.max(
  0,
  PERF_OT_METRICS.findIndex((m) => m.label === "Total sales"),
)

// Cami's demo business is single-location, so the Location dimension is one row
// today; it scales the day the business adds branches.
export const PERF_LOCATIONS = ["Pet Loft"]

export const PERF_DIMENSIONS: PerfDimension[] = ["Team member", "Location"]
export const PERF_GRANULARITIES: PerfGranularity[] = ["Day", "Week", "Month"]

export function entitiesFor(dim: PerfDimension): string[] {
  return dim === "Team member" ? PERFORMANCE_SUMMARY_MEMBERS : PERF_LOCATIONS
}

// ─── Deterministic seeded values ─────────────────────────────────────────────

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Stable float in [0, 1) from any set of parts. */
function rand(...parts: (string | number)[]): number {
  return (hash(parts.join("|")) % 100000) / 100000
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** That entity's activity level for a given day — busier entities, quieter weekends. */
function weight(entity: string, d: Date): number {
  const base = 2 + rand(entity, "base") * 8 // 2..10 baseline per entity
  const jitter = 0.4 + rand(entity, dayKey(d)) * 1.2 // day-to-day 0.4..1.6
  const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.55 : 1
  return base * jitter * weekend
}

/** Daily figure for one entity + metric: raw amount for summable, a % for ratio. */
function dailyValue(entity: string, metric: PerfOtMetric, d: Date): number {
  const w = weight(entity, d)
  const r = rand(entity, metric.label, dayKey(d))
  switch (metric.kind) {
    case "money":
      return Math.round(w * (80 + r * 220))
    case "number":
      return Math.round(w * (0.4 + r * 1.6))
    case "duration":
      return Math.round(w * (20 + r * 40)) // minutes
    case "percent":
      return Math.round((25 + r * 65) * 10) / 10 // 25.0..90.0 %
  }
}

// ─── Time buckets ────────────────────────────────────────────────────────────

export type Bucket = { key: string; label: string; days: Date[] }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function fmtDay(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function eachDay(range: DateRange): Date[] {
  const out: Date[] = []
  const d = new Date(range.from)
  d.setHours(0, 0, 0, 0)
  const end = new Date(range.to)
  end.setHours(0, 0, 0, 0)
  // Guard against an inverted or runaway range (cap ~= 2 years of daily columns).
  let guard = 0
  while (d <= end && guard < 800) {
    out.push(new Date(d))
    d.setDate(d.getDate() + 1)
    guard++
  }
  return out
}

/** Split the range into columns at the chosen granularity. */
export function bucketsFor(range: DateRange, gran: PerfGranularity): Bucket[] {
  const days = eachDay(range)
  if (gran === "Day") {
    return days.map((d) => ({ key: dayKey(d), label: fmtDay(d), days: [d] }))
  }
  const map = new Map<string, Date[]>()
  for (const d of days) {
    let key: string
    if (gran === "Week") {
      const dow = (d.getDay() + 6) % 7 // Monday-start week
      const ws = new Date(d)
      ws.setDate(d.getDate() - dow)
      key = dayKey(ws)
    } else {
      key = `${d.getFullYear()}-${d.getMonth()}`
    }
    const bucket = map.get(key)
    if (bucket) bucket.push(d)
    else map.set(key, [d])
  }
  return [...map.entries()].map(([key, ds]) => {
    if (gran === "Week") {
      const dow = (ds[0].getDay() + 6) % 7
      const ws = new Date(ds[0])
      ws.setDate(ds[0].getDate() - dow)
      return { key, label: fmtDay(ws), days: ds }
    }
    return { key, label: `${MONTHS[ds[0].getMonth()]} ${ds[0].getFullYear()}`, days: ds }
  })
}

/** Lowercase noun for the chart title ("… by day"). */
export function granularityNoun(gran: PerfGranularity): string {
  return gran.toLowerCase()
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

/** Roll a set of days up for one entity: sum for summable, weighted-avg for %. */
export function aggregate(entity: string, metric: PerfOtMetric, days: Date[]): number {
  if (metric.kind === "percent") {
    let num = 0
    let den = 0
    for (const d of days) {
      const w = weight(entity, d)
      num += dailyValue(entity, metric, d) * w
      den += w
    }
    return den === 0 ? 0 : num / den
  }
  let sum = 0
  for (const d of days) sum += dailyValue(entity, metric, d)
  return sum
}

/** The Total row / chart value: aggregate across every entity for these days. */
export function aggregateAll(entities: string[], metric: PerfOtMetric, days: Date[]): number {
  if (metric.kind === "percent") {
    let num = 0
    let den = 0
    for (const e of entities) {
      for (const d of days) {
        const w = weight(e, d)
        num += dailyValue(e, metric, d) * w
        den += w
      }
    }
    return den === 0 ? 0 : num / den
  }
  let sum = 0
  for (const e of entities) for (const d of days) sum += dailyValue(e, metric, d)
  return sum
}
