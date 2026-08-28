// Notification configuration — Sender ID, channel grants, reminder toggles,
// rates, and the send log. Pure types, defaults, and helpers; the React
// provider lives alongside in store.tsx (same split as lib/payment-policy).
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// The one structural decision worth reading here: merchant intent (`events`)
// and the HQ grant (`grant`) are separate fields and never merged. A single
// effective boolean would lose the difference between "the merchant switched
// this off" and "HQ disabled the channel", so re-enabling at HQ would silently
// resurrect events the merchant had deliberately turned off. Effective state is
// computed at render by `channelEnabled`.
//
// Nothing here imports React, so Cami HQ mocks (lib/admin-businesses.ts) can
// read the same types and defaults the merchant portal does.

/** What sends when a merchant has no approved Sender ID of their own. */
export const FALLBACK_SENDER_ID = "CAMI"

export type NotificationChannel = "email" | "sms" | "whatsapp"

export const CHANNELS: NotificationChannel[] = ["email", "sms", "whatsapp"]

export const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
}

export type ReminderEvent =
  | "booking-confirmed"
  | "reminder-24h"
  | "reminder-2h"
  | "cancelled"
  | "no-show"
  | "review-request"
  | "receipt"

/** Display order in the reminders matrix — roughly the order a booking hits them. */
export const REMINDER_EVENTS: { id: ReminderEvent; label: string; description: string }[] = [
  {
    id: "booking-confirmed",
    label: "Booking confirmed",
    description: "Sent as soon as an appointment is booked.",
  },
  {
    id: "reminder-24h",
    label: "Reminder — 24h before",
    description: "The day-before nudge.",
  },
  {
    id: "reminder-2h",
    label: "Reminder — 2h before",
    description: "Short-notice reminder on the day.",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    description: "Confirms a cancellation to the pet parent.",
  },
  { id: "no-show", label: "No-show", description: "Sent after a missed appointment." },
  {
    id: "review-request",
    label: "Review request",
    description: "Asks for a review once the visit is complete.",
  },
  { id: "receipt", label: "Receipt", description: "Payment receipt after checkout." },
]

export type SenderIdStatus = "not-submitted" | "submitted" | "approved" | "rejected"

export type SenderId = {
  /** null → messages send as CAMI. */
  value: string | null
  status: SenderIdStatus
  /** HQ-authored, surfaced verbatim to the merchant. Only set when rejected. */
  rejectionReason?: string
  /** Demo values are pre-formatted; the real API returns a timestamp. */
  submittedAt?: string
}

/** Per event, per channel — the merchant's intent, independent of the HQ grant. */
export type EventMatrix = Record<ReminderEvent, Record<NotificationChannel, boolean>>

/** HQ-owned master switches. Read here so the merchant matrix can lock a column. */
export type ChannelGrant = Record<NotificationChannel, boolean>

export type NotificationStatus = "queued" | "sent" | "delivered" | "failed"

export type NotificationLogEntry = {
  id: string
  channel: NotificationChannel
  event: ReminderEvent
  /** null for sends not tied to an appointment (e.g. a standalone receipt). */
  appointmentId: string | null
  /** Recipient as addressed — phone for SMS/WhatsApp, email address for Email. */
  recipient: string
  /** Who it went to, for scanning. Not part of the send itself. */
  recipientName: string
  body: string
  /**
   * ISO 8601 with an explicit offset, e.g. `2026-08-28T11:20:00+04:00`.
   *
   * Was a pre-formatted display string ("Yesterday 10:15") until the log gained
   * day grouping, which needs a real date to bucket on. Parsing the day back out
   * of a display string works right up until the copy changes.
   */
  sentAt: string
  status: NotificationStatus
  failureReason?: string
  /**
   * AED, stamped at send time rather than derived from the current rate. A rate
   * change must not retroactively rewrite last month's consumption, or the log
   * stops reconciling against the invoice computed from it.
   */
  cost: number
}

export type NotificationsState = {
  senderId: SenderId
  events: EventMatrix
  grant: ChannelGrant
  /**
   * Billing-period totals, per channel. Deliberately NOT derived from `log`:
   * the log is the most recent sends, not the whole period (a real month is
   * hundreds of rows and gets paginated), so summing it would under-report the
   * invoice by an order of magnitude. This is the number the merchant is billed
   * on; the log is how they inspect individual sends.
   */
  periodUsage: PeriodUsage
  log: NotificationLogEntry[]
}

export type PeriodUsage = Record<
  NotificationChannel,
  {
    /** Billable sends — delivered, sent, or in flight. */
    sent: number
    /** Attempted and failed. Costs nothing, but the merchant still needs to see it. */
    failed: number
    /**
     * Sum of the costs stamped on each send, not sent × the current rate. Same
     * reason as NotificationLogEntry.cost: a mid-period rate change must not
     * retroactively rewrite what was already consumed.
     */
    cost: number
  }
>

/**
 * Effective state for one cell: the merchant has to have asked for it AND HQ
 * has to permit the channel. Both halves are kept so neither can be inferred
 * away — see the note at the top of this file.
 */
export function channelEnabled(
  state: Pick<NotificationsState, "events" | "grant">,
  event: ReminderEvent,
  channel: NotificationChannel,
): boolean {
  return state.events[event][channel] && state.grant[channel]
}

/** What a customer sees as the sender right now. */
export function effectiveSenderId(senderId: SenderId): string {
  return senderId.status === "approved" && senderId.value ? senderId.value : FALLBACK_SENDER_ID
}

/**
 * Sender ID rules, per GNK: requested from the merchant directly rather than
 * inferred from their business name, and validated at input time. 3–11
 * alphanumeric characters is the GSM alphanumeric sender constraint.
 * Returns null when valid.
 */
export function validateSenderId(raw: string): string | null {
  const value = raw.trim()
  if (!value) return "Enter a Sender ID, or leave it blank to send as CAMI."
  if (value.length < 3) return "Sender IDs are at least 3 characters."
  if (value.length > 11) return "Sender IDs are at most 11 characters."
  if (!/^[A-Za-z0-9]+$/.test(value)) return "Letters and numbers only — no spaces or symbols."
  if (value.toUpperCase() === FALLBACK_SENDER_ID)
    return `${FALLBACK_SENDER_ID} is reserved. It's already the fallback when you have no Sender ID.`
  return null
}

/** The field is locked while a registration is with the carrier. */
export function senderIdLocked(senderId: SenderId): boolean {
  return senderId.status === "submitted"
}

const EMAIL_ONLY: Record<NotificationChannel, boolean> = {
  email: true,
  sms: false,
  whatsapp: false,
}

/**
 * Defaults mirror what a merchant would sensibly pay for: email on everywhere
 * (free-ish), SMS only on the messages that change someone's day. WhatsApp off
 * throughout — it isn't granted by default either, so nothing turns on the
 * moment HQ enables the channel.
 */
export const DEFAULT_EVENTS: EventMatrix = {
  "booking-confirmed": { email: true, sms: true, whatsapp: false },
  "reminder-24h": { email: true, sms: true, whatsapp: false },
  "reminder-2h": { ...EMAIL_ONLY },
  cancelled: { ...EMAIL_ONLY },
  "no-show": { ...EMAIL_ONLY },
  "review-request": { ...EMAIL_ONLY },
  receipt: { ...EMAIL_ONLY },
}

/**
 * WhatsApp ungranted by default. It's the one channel with a Meta-side
 * integration per merchant, so "not yet enabled for you" is the honest default
 * — and it makes the locked-column state the first thing a reviewer sees.
 */
export const DEFAULT_GRANT: ChannelGrant = { email: true, sms: true, whatsapp: false }

/** AED per message. UAE SMS pricing is why this isn't one global number. */
export const DEFAULT_RATES: Record<NotificationChannel, number> = {
  email: 0.02,
  sms: 0.12,
  whatsapp: 0.09,
}

/**
 * A merchant mid-registration: they've submitted their own Sender ID and it's
 * still with the carrier, so messages are going out as CAMI. That is the state
 * the thread is actually about, so it's where the demo starts.
 */
export const DEFAULT_SENDER_ID: SenderId = {
  value: "SHAMPOOCH",
  status: "submitted",
  submittedAt: "Aug 4",
}

/** Every Sender ID state, reachable from the panel's demo toggle. */
export const DEMO_SENDER_IDS: Record<SenderIdStatus, SenderId> = {
  "not-submitted": { value: null, status: "not-submitted" },
  submitted: DEFAULT_SENDER_ID,
  approved: { value: "SHAMPOOCH", status: "approved", submittedAt: "Jul 12" },
  rejected: {
    value: "SHAMPOOCH",
    status: "rejected",
    submittedAt: "Jul 30",
    rejectionReason:
      "The carrier could not match SHAMPOOCH to your trade licence. Submit a Sender ID that matches your registered business name.",
  },
}

// Demo log. Deliberately mixed: two failures (one hard bounce, one unreachable
// number), a queued row, and sends across all three channels — the states
// someone opening this screen is actually hunting for.
export const DEMO_LOG: NotificationLogEntry[] = [
  // Tom Cassidy / Luna — b-002, ready for pickup at 10:15.
  {
    id: "NTF-1041",
    channel: "sms",
    event: "reminder-24h",
    appointmentId: "b-002",
    recipient: "+971 50 374 5511",
    recipientName: "Tom Cassidy",
    body: "Hi Tom — reminder: Luna's Wash & Blow Dry is tomorrow at 10:15 AM with Shampooch. Reply STOP to opt out.",
    sentAt: "2026-08-27T10:15:00+04:00",
    status: "delivered",
    cost: 0.12,
  },
  {
    id: "NTF-1040",
    channel: "email",
    event: "reminder-24h",
    appointmentId: "b-002",
    recipient: "tom.cassidy@gmail.com",
    recipientName: "Tom Cassidy",
    body: "Luna's appointment is tomorrow at 10:15 AM. Wash & Blow Dry MD with Aya Hassan, 60 min.",
    sentAt: "2026-08-27T10:15:00+04:00",
    status: "delivered",
    cost: 0.02,
  },
  {
    id: "NTF-1039",
    channel: "email",
    event: "receipt",
    appointmentId: "b-002",
    recipient: "tom.cassidy@gmail.com",
    recipientName: "Tom Cassidy",
    body: "Receipt for AED 140.00 — Wash & Blow Dry MD. AED 50.00 deposit applied.",
    sentAt: "2026-08-28T11:20:00+04:00",
    status: "sent",
    cost: 0.02,
  },
  // Karen Dougall / Willow — b-003, confirmed at 11:30, recurring every 4 weeks.
  {
    id: "NTF-1038",
    channel: "sms",
    event: "booking-confirmed",
    appointmentId: "b-003",
    recipient: "+971 50 491 2202",
    recipientName: "Karen Dougall",
    body: "Booking confirmed: Willow, Full Grooming MD, today 11:30 AM at Shampooch.",
    sentAt: "2026-08-28T08:44:00+04:00",
    status: "delivered",
    cost: 0.12,
  },
  {
    // Queued sits on SMS, not WhatsApp: WhatsApp isn't granted in the demo, and
    // a send on an ungranted channel is a state the model can't produce.
    id: "NTF-1037",
    channel: "sms",
    event: "reminder-2h",
    appointmentId: "b-003",
    recipient: "+971 50 491 2202",
    recipientName: "Karen Dougall",
    body: "Reminder: Willow's Full Grooming is at 11:30 AM today.",
    sentAt: "2026-08-28T09:30:00+04:00",
    status: "queued",
    cost: 0.12,
  },
  // Luke Tan / Rocky — b-004, tomorrow. No phone on the booking, which is
  // exactly how an SMS ends up undeliverable.
  {
    id: "NTF-1036",
    channel: "sms",
    event: "booking-confirmed",
    appointmentId: "b-004",
    recipient: "+971 4 771 0032",
    recipientName: "Luke Tan",
    body: "Booking confirmed: Rocky, Deshedding LG, tomorrow 1:00 PM at Shampooch.",
    sentAt: "2026-08-28T08:10:00+04:00",
    status: "failed",
    failureReason: "Landline number — SMS not deliverable",
    cost: 0,
  },
  // Millie Cassidy / Mochi — b-005, completed yesterday.
  {
    id: "NTF-1035",
    channel: "email",
    event: "review-request",
    appointmentId: "b-005",
    recipient: "m.cassidy@oldmail.example",
    recipientName: "Millie Cassidy",
    body: "How did Mochi's visit go? Leave Shampooch a review.",
    sentAt: "2026-08-25T17:31:00+04:00",
    status: "failed",
    failureReason: "Mailbox does not exist (hard bounce)",
    cost: 0,
  },
  {
    id: "NTF-1034",
    channel: "email",
    event: "booking-confirmed",
    appointmentId: "b-005",
    recipient: "m.cassidy@oldmail.example",
    recipientName: "Millie Cassidy",
    body: "Booking confirmed: Mochi, Full Grooming SM, 9:30 AM with Lena Petrov.",
    sentAt: "2026-08-27T08:02:00+04:00",
    status: "delivered",
    cost: 0.02,
  },
]

/**
 * Ten days of a working grooming business, not the eight rows the log happens
 * to show. The numbers match Shampooch's `usage` in lib/admin-businesses.ts, so
 * the merchant's "Total so far" and the partner's row on /admin/billing agree —
 * AED 42.92 either way. WhatsApp is zero because it isn't granted, which is a
 * different fact from "granted and unused" and the UI distinguishes them.
 */
export const DEFAULT_PERIOD_USAGE: PeriodUsage = {
  email: { sent: 412, failed: 6, cost: 8.24 },
  sms: { sent: 289, failed: 4, cost: 34.68 },
  whatsapp: { sent: 0, failed: 0, cost: 0 },
}

/**
 * The same period with WhatsApp consuming too, for the demo toggle.
 *
 * The default has WhatsApp at zero, which is the honest shipped state — but it
 * also made the usage card's three-segment share bar unreachable, so a whole
 * branch of the design could not be reviewed. Both states matter: a granted
 * channel that hasn't been used says "Nothing sent yet", and one that has says
 * what it cost.
 *
 * Deliberately NOT mirrored into DEMO_LOG. periodUsage is a period aggregate and
 * the log is the most recent sends; the two are not derived from each other (see
 * NotificationsState.periodUsage), so consumption can exist without a matching
 * row in a paginated log. 214 sends at the AED 0.09 global rate is AED 19.26.
 */
export const DEMO_PERIOD_USAGE_WITH_WHATSAPP: PeriodUsage = {
  ...DEFAULT_PERIOD_USAGE,
  whatsapp: { sent: 214, failed: 2, cost: 19.26 },
}

export const DEFAULT_NOTIFICATIONS_STATE: NotificationsState = {
  senderId: DEFAULT_SENDER_ID,
  events: DEFAULT_EVENTS,
  grant: DEFAULT_GRANT,
  periodUsage: DEFAULT_PERIOD_USAGE,
  log: DEMO_LOG,
}

// `usageByChannel(log)` and `totalCost(log)` used to live here and are gone on
// purpose. Both derived period usage by summing the log, which is the one thing
// this model says not to do: the log is the most recent sends, not the period, so
// summing it under-reports the invoice by an order of magnitude — the first build
// of the usage card showed AED 0.49 for a month that cost AED 42.92. Neither had
// a caller, so they were purely a signposted route back to that bug. Period
// figures come from `periodUsage` via `periodTotalCost`.

export function periodTotalCost(usage: PeriodUsage): number {
  return CHANNELS.reduce((sum, channel) => sum + usage[channel].cost, 0)
}

/**
 * Whether the merchant portal shows per-message prices, or only what they used.
 *
 * Unresolved commercial policy, not a design preference — so it's one constant
 * rather than five call sites. Review the other state at
 * `?settings=notifications&nr=hidden`.
 *
 * The thread supports both readings. maaz: "The merchants need to see
 * consumption via appointment log / and an invoice will be generated end of each
 * month" — consumption, with the money arriving on an invoice. GNK put rates on
 * the HQ screen ("where *we* can see consumption of sms and email with rates").
 * Neither forbids showing a merchant their own price, and hiding it from the
 * person paying is hostile when the invoice reveals it weeks later anyway.
 *
 * Default is `true` on that last point. It matters because rates are negotiated
 * per merchant (Pawhaus runs AED 0.14 against a global AED 0.12), so if Cami
 * doesn't want merchants comparing prices, this flips to `false`.
 *
 * When false, per-channel costs go too — 412 sends for AED 8.24 is the rate
 * with one division. The period total stays: it's what they owe, it's on the
 * invoice regardless, and it can't be decomposed back into per-channel rates.
 */
export const MERCHANT_SEES_RATES = true

export function formatRate(amount: number): string {
  return `AED ${amount.toFixed(2)}`
}

/**
 * Sends tied to one appointment, newest first. The appointment timeline reads
 * this rather than slicing the log, so an appointment with no sends correctly
 * shows none instead of borrowing another booking's messages.
 */
export function logForAppointment(
  log: NotificationLogEntry[],
  appointmentId: string,
): NotificationLogEntry[] {
  return log.filter((entry) => entry.appointmentId === appointmentId)
}

// ── Log timestamps and day grouping ─────────────────────────────────────────
//
// The log groups by day, the way the money activity feed does: "did today's
// reminders actually go out" is the question it exists to answer, and an
// ungrouped list of times makes you read every row to find the boundary.
//
// Everything below is deliberately string arithmetic on the ISO value, not Date
// parsing. Two reasons. `Date.now()` would re-bucket the fixtures every midnight
// and make a screenshot unreproducible; and parsing an offset-bearing ISO into a
// local Date then asking for its calendar day reintroduces the timezone bug this
// is meant to avoid — a 23:30 +04:00 send would land on the previous day for a
// reviewer in London.

/** The demo's "today", in the business's own offset. Fixed on purpose — see above. */
export const DEMO_TODAY = "2026-08-28"

const MONTH_ABBR = [
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

/** The calendar day a send belongs to, as `YYYY-MM-DD`. Sorts and compares as a string. */
export function logDay(sentAt: string): string {
  return sentAt.slice(0, 10)
}

/** Wall-clock time of a send, as `HH:MM`. The day is the group header's job. */
export function logTime(sentAt: string): string {
  return sentAt.slice(11, 16)
}

/** `YYYY-MM-DD` one day earlier. UTC math on a date-only value, so no DST edge. */
function dayBefore(day: string): string {
  const [y, m, d] = day.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10)
}

/**
 * Group header for a day. Relative for the two days a merchant actually thinks
 * in, absolute beyond that — "3 days ago" makes you do the arithmetic the label
 * was supposed to save you.
 */
export function logDayLabel(day: string): string {
  if (day === DEMO_TODAY) return "Today"
  if (day === dayBefore(DEMO_TODAY)) return "Yesterday"
  const [, m, d] = day.split("-").map(Number)
  return `${d} ${MONTH_ABBR[m - 1]}`
}

/** One line for surfaces with no day header of their own (the activity timeline). */
export function logStamp(sentAt: string): string {
  return `${logDayLabel(logDay(sentAt))} ${logTime(sentAt)}`
}

export type LogDayGroup = {
  day: string
  label: string
  entries: NotificationLogEntry[]
}

/** Newest day first, and newest send first inside each day. */
export function groupLogByDay(entries: NotificationLogEntry[]): LogDayGroup[] {
  const byDay = new Map<string, NotificationLogEntry[]>()
  for (const entry of entries) {
    const day = logDay(entry.sentAt)
    const bucket = byDay.get(day)
    if (bucket) bucket.push(entry)
    else byDay.set(day, [entry])
  }
  return [...byDay.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((day) => ({
      day,
      label: logDayLabel(day),
      entries: [...(byDay.get(day) ?? [])].sort((x, y) => y.sentAt.localeCompare(x.sentAt)),
    }))
}

/**
 * Above this, a per-message rate is almost certainly a misplaced decimal.
 *
 * AED 1.00 is roughly eight times the highest rate Cami actually charges (SMS at
 * 0.12) and about seven times the highest negotiated override in the mocks
 * (0.14), so the gap between "an aggressive rate" and "a typo" is wide enough
 * that a single round number sits comfortably in it.
 *
 * A warning, never a block. What Cami charges is a commercial decision and a cap
 * would eventually be wrong about someone's real rate — but a rate this size is
 * the one that quietly bills a partner thousands, so it has to be said out loud.
 * The failure mode is specific enough to name: it is nearly always a decimal
 * that went missing while typing.
 */
export const IMPLAUSIBLE_RATE = 1

export function rateLooksImplausible(amount: number): boolean {
  return amount > IMPLAUSIBLE_RATE
}

// ── Period shape ─────────────────────────────────────────────────────────────

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/** Days in the calendar month a `YYYY-MM-DD` day falls in. */
function daysInMonth(day: string): number {
  const [y, m] = day.split("-").map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/**
 * The billing period as the merchant experiences it: which days it covers so
 * far, and where the running total is heading.
 *
 * The projection exists because "Total so far" implies a trajectory and then
 * shows none. A merchant on day 28 of a month wants to know what the invoice
 * lands at, and the honest answer is a straight-line estimate from what has
 * already been consumed — stated as an estimate, never as a figure to plan on.
 *
 * Not projected on day 1: one day of sends extrapolated over 31 is noise
 * wearing a number's clothes.
 */
export function periodShape(total: number, today = DEMO_TODAY) {
  const [, month, dayOfMonth] = today.split("-").map(Number)
  const days = daysInMonth(today)
  const [year] = today.split("-").map(Number)
  return {
    /** The days covered so far, e.g. "1 – 28 Aug". */
    label: `1 – ${dayOfMonth} ${MONTH_ABBR[month - 1]}`,
    /**
     * The same period spelled out, e.g. "1 – 28 August 2026", for HQ surfaces
     * that have the room and cover more than one merchant's month.
     *
     * Both labels come from here so the two portals cannot disagree about which
     * period they are describing — they briefly did, when the merchant card was
     * derived and /admin/billing was still a hardcoded string.
     */
    labelLong: `1 – ${dayOfMonth} ${MONTH_FULL[month - 1]} ${year}`,
    /** The day the invoice is cut, e.g. "31 Aug" — the projection's horizon. */
    endLabel: `${days} ${MONTH_ABBR[month - 1]}`,
    dayOfMonth,
    days,
    /** null while there isn't enough of the month to extrapolate from. */
    projected: dayOfMonth >= 3 ? (total / dayOfMonth) * days : null,
  }
}

/** Each channel's share of the period cost, 0–1. Zero total → all zero. */
export function costShare(usage: PeriodUsage, channel: NotificationChannel): number {
  const total = periodTotalCost(usage)
  return total > 0 ? usage[channel].cost / total : 0
}

export function eventLabel(event: ReminderEvent): string {
  return REMINDER_EVENTS.find((e) => e.id === event)?.label ?? event
}

// ── Cami HQ side ─────────────────────────────────────────────────────────────

/**
 * What Cami HQ owns per merchant. Everything is optional: an absent field means
 * "inherit the platform default", so a merchant HQ has never touched carries no
 * config at all rather than a copy of the defaults that silently goes stale.
 */
export type BusinessNotificationConfig = {
  /** Master switches. An ungranted channel locks that column for the merchant. */
  grant?: Partial<ChannelGrant>
  senderId?: SenderId
  /** Per-channel rate override. Absent channels inherit the global rate. */
  rateOverrides?: Partial<Record<NotificationChannel, number>>
  /** Sends this billing period, per channel. Drives the HQ billing table. */
  usage?: Partial<Record<NotificationChannel, number>>
}

/**
 * Platform price list shipped as the factory default. Per-country pricing is why
 * SMS isn't one number worldwide; the demo carries the UAE row only.
 *
 * HQ can change these — the live list lives in lib/notifications/hq-store.tsx.
 * Every helper below takes the rates as an argument and falls back to this, so a
 * caller with the store passes the edited values and a caller without one (a
 * test, an isolated render) still gets real prices rather than zeroes.
 */
export const PLATFORM_DEFAULT_RATES = DEFAULT_RATES

export function resolvedGrant(config: BusinessNotificationConfig | undefined): ChannelGrant {
  return { ...DEFAULT_GRANT, ...config?.grant }
}

export function resolvedSenderId(config: BusinessNotificationConfig | undefined): SenderId {
  // A merchant with no Sender ID on file isn't mid-registration — they're
  // sending as CAMI, which is `not-submitted`.
  return config?.senderId ?? { value: null, status: "not-submitted" }
}

export function resolvedRate(
  config: BusinessNotificationConfig | undefined,
  channel: NotificationChannel,
  globalRates: Record<NotificationChannel, number> = PLATFORM_DEFAULT_RATES,
): number {
  return config?.rateOverrides?.[channel] ?? globalRates[channel]
}

/** True when this merchant's rate for the channel differs from the global one. */
export function isRateOverridden(
  config: BusinessNotificationConfig | undefined,
  channel: NotificationChannel,
  globalRates: Record<NotificationChannel, number> = PLATFORM_DEFAULT_RATES,
): boolean {
  const override = config?.rateOverrides?.[channel]
  // Compared against the live global rate, so an "override" that HQ has since
  // matched globally stops claiming to be one.
  return override !== undefined && override !== globalRates[channel]
}

/** Amount due this period for one channel: sends × the rate that applies. */
export function channelAmountDue(
  config: BusinessNotificationConfig | undefined,
  channel: NotificationChannel,
  globalRates: Record<NotificationChannel, number> = PLATFORM_DEFAULT_RATES,
): number {
  return (config?.usage?.[channel] ?? 0) * resolvedRate(config, channel, globalRates)
}

/** Amount due across every channel this merchant is billed for. */
export function amountDue(
  config: BusinessNotificationConfig | undefined,
  globalRates: Record<NotificationChannel, number> = PLATFORM_DEFAULT_RATES,
): number {
  return CHANNELS.reduce((sum, channel) => sum + channelAmountDue(config, channel, globalRates), 0)
}

/** Total sends this period, across channels. */
export function totalSends(config: BusinessNotificationConfig | undefined): number {
  return CHANNELS.reduce((sum, channel) => sum + (config?.usage?.[channel] ?? 0), 0)
}
