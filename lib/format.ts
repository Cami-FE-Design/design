// Shared formatters: money, numbers, dates, times, durations and names.
// Currency is always AED — never PKR. Amounts are whole AED units unless noted.

const AED = "AED"

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** `AED 1,840` · `AED 0` · negatives as `- AED 5`. Expects whole AED units. */
export function formatAed(value: number): string {
  if (value < 0) return `- ${AED} ${Math.abs(value).toLocaleString("en-US")}`
  return `${AED} ${value.toLocaleString("en-US")}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US")
}

/** `12%` — `value` is already a percentage (0–100), not a fraction. */
export function formatPercent(value: number): string {
  return `${value}%`
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input)
}

/** `05 Jul 2026` — two-digit day first, as cami-business formats every date. */
export function formatDate(input: string | Date): string {
  const d = toDate(input)
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** `1:39pm` */
export function formatTime(input: string | Date): string {
  const d = toDate(input)
  let h = d.getHours()
  const m = d.getMinutes()
  const meridiem = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}${meridiem}`
}

/** `15 Jul 2026, 1:39pm` */
export function formatDateTime(input: string | Date): string {
  const d = toDate(input)
  return `${formatDate(d)}, ${formatTime(d)}`
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/** A `YYYY-MM-DD` day is read as local midnight, so it never slips a day west of UTC. */
function toDay(input: string | Date): Date {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T00:00:00`)
  }
  return toDate(input)
}

/** `Tuesday, 15 Jul 2026` */
export function formatLongDate(input: string | Date): string {
  const d = toDay(input)
  return `${WEEKDAY_LONG[d.getDay()]}, ${formatDate(d)}`
}

/** `Tue, 15 Jul` — a day in the current year, as sheet headers show it. */
export function formatWeekdayDate(input: string | Date): string {
  const d = toDay(input)
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

/** `15 Jul 2026, 13:39` — a 24-hour timestamp, as the HQ audit views show it. */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** `09:30` → `9:30AM`. For `HH:MM` slot times, not Date objects. */
export function formatClock(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":")
  const h = Number(hStr)
  const period = h >= 12 ? "PM" : "AM"
  const display = ((h + 11) % 12) + 1
  return `${display}:${mStr ?? "00"}${period}`
}

/** `09:30` → `570`, minutes since midnight. */
export function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/**
 * `1h 30min` · `45min` · `2h` — the one duration style for operational screens
 * (calendar, sales, reports, daycare), as in cami-business. The service catalog
 * (`formatDurationMin`) and the public booking page keep their own.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/** A local Date as `YYYY-MM-DD`, with no timezone shift. */
export function toDayIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** `2026-07-15` plus 3 → `2026-07-18`. Done in UTC so a DST change cannot skip a day. */
export function addDaysIso(dayIso: string, days: number): string {
  const d = new Date(`${dayIso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

export function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

/** The first letter of a name, uppercased: `michelle` → `M`. */
export function initialOf(name?: string): string {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

/** `Michelle H. You` → `{ firstName: "Michelle", lastName: "H. You" }` */
export function splitName(full: string): { firstName: string; lastName: string } {
  const [first, ...rest] = full.trim().split(/\s+/)
  return { firstName: first ?? "", lastName: rest.join(" ") }
}

/**
 * How long ago something happened — the one standard for the whole app.
 *
 * `precision: "time"` (default) is for timestamps: activity, sessions, audit
 * events. `"day"` is for things that only have a date, like a last visit, so
 * they never read "3 hr ago".
 *
 *   Just now · 5 min ago · 3 hr ago        (time precision, under a day)
 *   Today · Yesterday · 3 days ago
 *   2 wk ago · 4 mo ago · 2 yr ago
 *   Never                                  (no date at all)
 *
 * Days count calendar days between local midnights, so something from late
 * last night is "Yesterday", not "1 day ago". A date in the future reads as
 * "Today" (day) or "Just now" (time).
 */
export function formatTimeAgo(
  input: string | Date | null | undefined,
  {
    now = Date.now(),
    precision = "time",
  }: { now?: number | Date; precision?: "time" | "day" } = {},
): string {
  if (!input) return "Never"
  const then = toDay(input)
  if (Number.isNaN(then.getTime())) return "Never"
  const nowDate = now instanceof Date ? now : new Date(now)

  if (precision === "time") {
    const minutes = Math.floor((nowDate.getTime() - then.getTime()) / 60_000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} hr ago`
  }

  const days = Math.round((startOfDay(nowDate).getTime() - startOfDay(then).getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} wk ago`
  if (days < 365) return `${Math.floor(days / 30)} mo ago`
  return `${Math.floor(days / 365)} yr ago`
}
