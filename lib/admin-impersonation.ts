import { adminBusinesses } from "@/lib/admin-businesses"

export type ImpersonationStatus = "active" | "ended" | "expired"

export type PIIField =
  | "customer_phone"
  | "customer_email"
  | "customer_address"
  | "payment_last4"
  | "vat_number"

export const PII_FIELD_LABELS: Record<PIIField, string> = {
  customer_phone: "Customer phone",
  customer_email: "Customer email",
  customer_address: "Customer address",
  payment_last4: "Card last 4",
  vat_number: "Customer VAT number",
}

export type PIIRevealEvent = {
  id: string
  field: PIIField
  /** Resource the PII belonged to, e.g. "Invoice INV-2031" or "Booking BK-441". */
  resource: string
  at: string
  reason: string
}

export type ImpersonationEvent = {
  id: string
  hqUser: { id: string; name: string; email: string }
  business: {
    id: string
    name: string
    slug: string
    ownerName: string
    ownerEmail: string
  }
  reason: string
  startedAt: string
  /** When the session actually ended, or null if still active. */
  endedAt: string | null
  /** Server-issued max length, in seconds. Default 30 min. */
  maxDurationSeconds: number
  status: ImpersonationStatus
  piiReveals: PIIRevealEvent[]
}

const now = Date.now()
const minutes = (n: number) => n * 60_000
const hours = (n: number) => n * 60 * 60_000
const days = (n: number) => n * 24 * 60 * 60_000

function iso(offsetMs: number) {
  return new Date(now - offsetMs).toISOString()
}

const HQ_USERS: ImpersonationEvent["hqUser"][] = [
  { id: "u_michelle", name: "Michelle You", email: "michelle@cami.app" },
  { id: "u_arman", name: "Arman Patel", email: "arman@cami.app" },
  { id: "u_priya", name: "Priya Anand", email: "priya@cami.app" },
  { id: "u_jules", name: "Jules Tan", email: "jules@cami.app" },
]

function findBiz(id: string): ImpersonationEvent["business"] {
  const b = adminBusinesses.find((biz) => biz.id === id)
  if (!b) throw new Error(`unknown business: ${id}`)
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    ownerName: b.ownerName,
    ownerEmail: b.ownerEmail,
  }
}

export const impersonationEvents: ImpersonationEvent[] = [
  {
    id: "imp_8821",
    hqUser: HQ_USERS[1],
    business: findBiz("biz_shampooch"),
    reason: "Investigating duplicate charge reported in ticket #4218.",
    startedAt: iso(minutes(7)),
    endedAt: null,
    maxDurationSeconds: 30 * 60,
    status: "active",
    piiReveals: [
      {
        id: "p_1",
        field: "customer_phone",
        resource: "Invoice INV-2031",
        at: iso(minutes(4)),
        reason: "Calling customer to confirm refund destination.",
      },
      {
        id: "p_2",
        field: "payment_last4",
        resource: "Invoice INV-2031",
        at: iso(minutes(3)),
        reason: "Cross-checking with Stripe dispute payload.",
      },
    ],
  },
  {
    id: "imp_8819",
    hqUser: HQ_USERS[0],
    business: findBiz("biz_pawhaus"),
    reason: "Reproducing the booking confirmation email rendering bug.",
    startedAt: iso(hours(2) + minutes(14)),
    endedAt: iso(hours(2) + minutes(2)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8815",
    hqUser: HQ_USERS[2],
    business: findBiz("biz_velvetpaw"),
    reason: "Owner asked us to verify staff role assignment.",
    startedAt: iso(hours(5) + minutes(48)),
    endedAt: iso(hours(5) + minutes(40)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8810",
    hqUser: HQ_USERS[3],
    business: findBiz("biz_shampooch"),
    reason: "Walking owner through the invoice export feature on a support call.",
    startedAt: iso(hours(7) + minutes(2)),
    endedAt: iso(hours(7) + minutes(0) - minutes(28)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [
      {
        id: "p_3",
        field: "customer_email",
        resource: "Invoice INV-2018",
        at: iso(hours(7) + minutes(0) - minutes(40)),
        reason: "Owner asked us to resend the invoice to the right contact.",
      },
    ],
  },
  {
    id: "imp_8801",
    hqUser: HQ_USERS[1],
    business: findBiz("biz_doggos"),
    reason: "Pre-suspension audit, owner taking bookings off-platform.",
    startedAt: iso(days(1) + hours(2)),
    endedAt: iso(days(1) + hours(2) - minutes(22)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8790",
    hqUser: HQ_USERS[0],
    business: findBiz("biz_pawhaus"),
    reason: "Verifying VAT number formatting after owner reported a save error.",
    startedAt: iso(days(1) + hours(5)),
    endedAt: iso(days(1) + hours(4) + minutes(43)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8782",
    hqUser: HQ_USERS[2],
    business: findBiz("biz_shampooch"),
    reason: "Helping owner reconcile a payout that did not match the daily total.",
    startedAt: iso(days(2) + hours(3)),
    endedAt: iso(days(2) + hours(3) - minutes(58)),
    maxDurationSeconds: 30 * 60,
    status: "expired",
    piiReveals: [
      {
        id: "p_4",
        field: "customer_address",
        resource: "Invoice INV-1992",
        at: iso(days(2) + hours(3) - minutes(20)),
        reason: "Owner needed the customer billing address to reissue.",
      },
    ],
  },
  {
    id: "imp_8770",
    hqUser: HQ_USERS[3],
    business: findBiz("biz_velvetpaw"),
    reason: "Verifying onboarding state after pilot kickoff call.",
    startedAt: iso(days(3) + hours(6)),
    endedAt: iso(days(3) + hours(6) - minutes(11)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8762",
    hqUser: HQ_USERS[1],
    business: findBiz("biz_furrytales"),
    reason: "Pre-archival data review, owner closing the business.",
    startedAt: iso(days(4) + hours(2)),
    endedAt: iso(days(4) + hours(2) - minutes(18)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8744",
    hqUser: HQ_USERS[0],
    business: findBiz("biz_shampooch"),
    reason: "Bug repro for ticket #4011, calendar timezone display.",
    startedAt: iso(days(6) + hours(1)),
    endedAt: iso(days(6) + hours(1) - minutes(9)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8721",
    hqUser: HQ_USERS[2],
    business: findBiz("biz_doggos"),
    reason: "Restoring a service that was accidentally deleted by a staff member.",
    startedAt: iso(days(8) + hours(2)),
    endedAt: iso(days(8) + hours(2) - minutes(6)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
  {
    id: "imp_8702",
    hqUser: HQ_USERS[1],
    business: findBiz("biz_pawhaus"),
    reason: "Onboarding handoff, configuring service hours with owner on Zoom.",
    startedAt: iso(days(11) + hours(3)),
    endedAt: iso(days(11) + hours(3) - minutes(31)),
    maxDurationSeconds: 30 * 60,
    status: "ended",
    piiReveals: [],
  },
]

export function durationSeconds(event: ImpersonationEvent, nowMs = Date.now()): number {
  const start = new Date(event.startedAt).getTime()
  const end = event.endedAt ? new Date(event.endedAt).getTime() : nowMs
  return Math.max(0, Math.round((end - start) / 1000))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return s === 0 ? `${m}m` : `${m}m ${s}s`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return remM === 0 ? `${h}h` : `${h}h ${remM}m`
}

export function statusLabel(status: ImpersonationStatus): string {
  if (status === "active") return "Active now"
  if (status === "expired") return "Expired"
  return "Ended"
}

export function statusBadgeClass(status: ImpersonationStatus): string {
  if (status === "active") return "bg-cami-green-3 text-cami-green-11"
  if (status === "expired") return "bg-tomato-3 text-tomato-11"
  return "bg-sand-3 text-sand-11"
}

export type ImpersonationFilter = {
  query?: string
  businessId?: string | "all"
  hqUserId?: string | "all"
  status?: ImpersonationStatus | "all"
  /** "7d", "30d", "all" */
  range?: "7d" | "30d" | "all"
}

export function filterEvents(
  events: ImpersonationEvent[],
  filter: ImpersonationFilter,
): ImpersonationEvent[] {
  const q = (filter.query ?? "").trim().toLowerCase()
  const cutoff =
    filter.range === "7d"
      ? Date.now() - days(7)
      : filter.range === "30d"
        ? Date.now() - days(30)
        : 0
  return events.filter((e) => {
    if (filter.businessId && filter.businessId !== "all" && e.business.id !== filter.businessId) {
      return false
    }
    if (filter.hqUserId && filter.hqUserId !== "all" && e.hqUser.id !== filter.hqUserId) {
      return false
    }
    if (filter.status && filter.status !== "all" && e.status !== filter.status) {
      return false
    }
    if (cutoff && new Date(e.startedAt).getTime() < cutoff) {
      return false
    }
    if (q) {
      const haystack = [e.business.name, e.business.slug, e.hqUser.name, e.hqUser.email, e.reason]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function uniqueHqUsers(events: ImpersonationEvent[]): ImpersonationEvent["hqUser"][] {
  const map = new Map<string, ImpersonationEvent["hqUser"]>()
  for (const e of events) map.set(e.hqUser.id, e.hqUser)
  return [...map.values()]
}

export function uniqueBusinesses(events: ImpersonationEvent[]): ImpersonationEvent["business"][] {
  const map = new Map<string, ImpersonationEvent["business"]>()
  for (const e of events) map.set(e.business.id, e.business)
  return [...map.values()]
}

const CSV_HEADER = [
  "event_id",
  "hq_user_name",
  "hq_user_email",
  "business_name",
  "business_slug",
  "started_at",
  "ended_at",
  "duration_seconds",
  "status",
  "reason",
  "pii_reveals",
]

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function eventsToCsv(events: ImpersonationEvent[]): string {
  const rows = events.map((e) => {
    const piiSummary = e.piiReveals
      .map((p) => `${PII_FIELD_LABELS[p.field]} on ${p.resource}`)
      .join("; ")
    return [
      e.id,
      e.hqUser.name,
      e.hqUser.email,
      e.business.name,
      e.business.slug,
      e.startedAt,
      e.endedAt ?? "",
      String(durationSeconds(e)),
      e.status,
      e.reason,
      piiSummary,
    ]
      .map(csvEscape)
      .join(",")
  })
  return [CSV_HEADER.join(","), ...rows].join("\n")
}

export function eventsToOwnerSummary(
  events: ImpersonationEvent[],
  business: ImpersonationEvent["business"],
): string {
  const lines: string[] = []
  lines.push(`Cami support access report for ${business.name}`)
  lines.push(`Generated ${new Date().toISOString()}`)
  lines.push("")
  if (events.length === 0) {
    lines.push("No Cami staff have signed in as your account.")
    return lines.join("\n")
  }
  lines.push(`${events.length} session${events.length === 1 ? "" : "s"} on record.`)
  lines.push("")
  for (const e of events) {
    const dur = formatDuration(durationSeconds(e))
    lines.push(`• ${new Date(e.startedAt).toLocaleString()} (${dur}) by ${e.hqUser.name}`)
    lines.push(`  Reason: ${e.reason}`)
    if (e.piiReveals.length > 0) {
      lines.push(`  Sensitive fields revealed: ${e.piiReveals.length}`)
      for (const p of e.piiReveals) {
        lines.push(`    - ${PII_FIELD_LABELS[p.field]} on ${p.resource}, reason: ${p.reason}`)
      }
    }
    lines.push("")
  }
  return lines.join("\n").trim()
}

export function findEventById(id: string): ImpersonationEvent | undefined {
  return impersonationEvents.find((e) => e.id === id)
}

export function relativeTime(iso: string, nowMs = Date.now()): string {
  const then = new Date(iso).getTime()
  const diff = nowMs - then
  if (diff < 60_000) return "Just now"
  const m = Math.round(diff / 60_000)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} d ago`
  const mo = Math.round(d / 30)
  return `${mo} mo ago`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
