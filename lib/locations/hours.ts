/**
 * Opening hours — a branch's own, on one model (R01, R19).
 *
 * ## Why the model gained shifts
 *
 * There were three shapes for the same thing. The operator's edit dialog
 * offered several ranges per day; the public page's `DaySchedule` held exactly
 * one; and `cami-business`'s venue carries a single `startTime`/`endTime` for
 * the whole week. Whichever a surface happened to read decided what an operator
 * could express.
 *
 * Shifts win, because they are the product's real concept: PRO-363 is a shipped
 * bug report titled "user is unable to add more than 2 shifts in business hours
 * for a day". A model that holds one range per day cannot represent a branch
 * that closes for lunch, which is an ordinary thing for a grooming salon to do.
 *
 * ## Hours are meaningless without the zone
 *
 * A branch's hours are read in that branch's timezone (R19) — time is stored in
 * UTC, and a business default with a per-location override governs display and
 * date bucketing. So `Location.timezone` sits next to `Location.hours` and the
 * two are always shown together; "9am–7pm" on its own is ambiguous the moment a
 * chain crosses a zone.
 *
 * These types live here rather than with the public page because hours are
 * location-configuration (blueprint §02). `lib/public-business.ts` re-exports
 * them, so the client-facing surfaces that already import from there keep
 * working.
 */

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export const WEEK_DAYS: ReadonlyArray<{ id: WeekDay; short: string; long: string }> = [
  { id: "mon", short: "Mon", long: "Monday" },
  { id: "tue", short: "Tue", long: "Tuesday" },
  { id: "wed", short: "Wed", long: "Wednesday" },
  { id: "thu", short: "Thu", long: "Thursday" },
  { id: "fri", short: "Fri", long: "Friday" },
  { id: "sat", short: "Sat", long: "Saturday" },
  { id: "sun", short: "Sun", long: "Sunday" },
]

/** 24-hour `HH:MM`, in the branch's own timezone. */
export type TimeRange = { open: string; close: string }

/**
 * A day is either closed or open for one or more ranges. Closed is its own
 * shape rather than an empty range list, so "we do not open" and "nobody has
 * set the hours yet" cannot be confused.
 */
export type DaySchedule = { closed: true } | { closed: false; ranges: ReadonlyArray<TimeRange> }

export type WeekSchedule = Record<WeekDay, DaySchedule>

export const CLOSED_DAY: DaySchedule = { closed: true }

/** One continuous range, for the common case. */
export function openFor(open: string, close: string): DaySchedule {
  return { closed: false, ranges: [{ open, close }] }
}

/** Two ranges with a gap, for a branch that closes in the middle of the day. */
export function openForShifts(...ranges: TimeRange[]): DaySchedule {
  return { closed: false, ranges }
}

export function getDaySchedule(hours: WeekSchedule, day: WeekDay): DaySchedule {
  return hours[day]
}

export function getDayIdFromDate(date: Date): WeekDay {
  const order: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
  return order[date.getDay()]
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(":").map(Number)
  return h * 60 + m
}

/**
 * Open right now, in any of the day's ranges.
 *
 * ⚠️ Reads `now` in the *viewer's* zone, not the branch's. Correct for a client
 * standing outside the branch; wrong for an owner in another country looking at
 * nine branches. Resolving that needs the timezone threaded through every
 * caller, which is R19's remaining half and is called out in the spec.
 */
export function isOpenNow(hours: WeekSchedule, now: Date): boolean {
  const schedule = hours[getDayIdFromDate(now)]
  if (schedule.closed) return false
  const minutes = now.getHours() * 60 + now.getMinutes()
  return schedule.ranges.some(
    (range) => minutes >= toMinutes(range.open) && minutes < toMinutes(range.close),
  )
}

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const suffix = h >= 12 ? "pm" : "am"
  const display = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${display}${suffix}` : `${display}:${mStr}${suffix}`
}

/** `9am – 7pm`, or `9am – 1pm, 4pm – 8pm` when the branch closes for lunch. */
export function formatDayHours(schedule: DaySchedule): string {
  if (schedule.closed) return "Closed"
  return schedule.ranges
    .map((range) => `${formatTime12h(range.open)} – ${formatTime12h(range.close)}`)
    .join(", ")
}

/** Whether any day differs from the business default, for a "customised" note. */
export function sameSchedule(a: WeekSchedule, b: WeekSchedule): boolean {
  return WEEK_DAYS.every(({ id }) => formatDayHours(a[id]) === formatDayHours(b[id]))
}

/**
 * When the branch closes, if it is open right now.
 *
 * With shifts this is the close of the range currently covering `now`, not the
 * last close of the day — a branch open 9–1 and 4–8 closes at 1pm at noon, and
 * saying 8pm would send a client away at ten past one.
 */
export function closingTime(schedule: DaySchedule, now: Date): string | null {
  if (schedule.closed) return null
  const minutes = now.getHours() * 60 + now.getMinutes()
  const current = schedule.ranges.find(
    (range) => minutes >= toMinutes(range.open) && minutes < toMinutes(range.close),
  )
  return current?.close ?? null
}

/**
 * When the branch next opens today, if it is shut at the moment.
 *
 * Returns the next range's opening — which for a branch on a lunch break is
 * this afternoon, not tomorrow. Null once the last range has closed, so the
 * caller says "closed" rather than naming a time in the past.
 */
export function nextOpeningTime(schedule: DaySchedule, now: Date): string | null {
  if (schedule.closed) return null
  const minutes = now.getHours() * 60 + now.getMinutes()
  const upcoming = schedule.ranges.find((range) => toMinutes(range.open) > minutes)
  return upcoming?.open ?? null
}

/**
 * `"9:00 AM"` — the shape the hours editor's time picker uses.
 *
 * Separate from `formatTime12h`, which is display copy for a client ("9am")
 * and drops the minutes when they are zero. A picker cannot do that: its label
 * has to round-trip back to a value, so the minutes always show.
 */
export function toPickerTime(time24: string): string {
  const [hStr, mStr] = time24.split(":")
  const h = Number(hStr)
  const period = h < 12 ? "AM" : "PM"
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${mStr} ${period}`
}

/** The inverse, so what the editor saves is storable 24h time. */
export function fromPickerTime(label: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim())
  if (!match) return "09:00"
  const [, hStr, minutes, period] = match
  let h = Number(hStr) % 12
  if (period.toUpperCase() === "PM") h += 12
  return `${String(h).padStart(2, "0")}:${minutes}`
}
