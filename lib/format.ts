// Shared formatters for the Reporting module (reusable across the app).
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
