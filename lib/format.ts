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

/** `15 Jul 2026` — day-first, matching Fresha and the existing Sales screens. */
export function formatDate(input: string | Date): string {
  const d = toDate(input)
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
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

/** `1h 30m` · `45m` · `0m` — from a minutes count. */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
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

/** `1h 30min` · `45min` · `2h` */
export function formatDurationCompact(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/** `1 hr 30 min` · `45 min` · `2 hr` */
export function formatDurationLong(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
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
