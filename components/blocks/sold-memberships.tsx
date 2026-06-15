"use client"

import { type MembershipColorId, membershipColorClass } from "@/components/blocks/memberships-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types & mock data ──────────────────────────────────────────────────────────

export type SoldMembershipStatus = "active" | "paused"

export type SoldActivityKind = "purchased" | "paused" | "resumed"

export type SoldActivityEntry = {
  id: string
  /** ISO date the event happened. */
  date: string
  title: string
  subtitle: string
  kind: SoldActivityKind
}

export type SoldAppointmentStatus = "not-confirmed" | "confirmed" | "completed" | "cancelled"

export type SoldAppointment = {
  id: string
  /** ISO date — drives the date tile + sorting. */
  date: string
  /** Service / appointment title. */
  title: string
  /** Friendly time label, e.g. "Tue 3:45pm". */
  timeLabel: string
  timing: "upcoming" | "past"
  status: SoldAppointmentStatus
}

export type SoldMembership = {
  id: string
  name: string
  color: MembershipColorId
  client: string
  /** Links the Client field to the client directory detail dialog (?client=<id>). */
  clientId: string
  clientEmail: string
  /** Membership type — "One-time" or "Recurring". */
  type: string
  /** ISO start date. */
  startDate: string
  /** ISO end date, or null when it runs "Until canceled". */
  endDate: string | null
  status: SoldMembershipStatus
  /** Total charged in AED (whole units). */
  totalCharged: number
  sessionsTotal: number | "unlimited"
  sessionsRemaining: number | "unlimited"
  serviceCount: number
  /** e.g. "In-store and online". */
  redemption: string
  activity: SoldActivityEntry[]
  appointments: SoldAppointment[]
}

export const MOCK_SOLD_MEMBERSHIPS: SoldMembership[] = [
  {
    id: "s1",
    name: "Monthly Grooming Club",
    color: "green",
    client: "Millie Cassidy",
    clientId: "millie-cassidy",
    clientEmail: "millie.cassidy@example.com",
    type: "One-time",
    startDate: "2026-06-15",
    endDate: "2026-07-14",
    status: "active",
    totalCharged: 320,
    sessionsTotal: 4,
    sessionsRemaining: 4,
    serviceCount: 3,
    redemption: "In-store and online",
    activity: [
      {
        id: "s1-a1",
        date: "2026-06-15",
        title: "Membership purchased",
        subtitle: "Receipt 11",
        kind: "purchased",
      },
    ],
    appointments: [
      {
        id: "s1-up1",
        date: "2026-06-16",
        title: "Bath & brush",
        timeLabel: "Tue 3:45pm",
        timing: "upcoming",
        status: "not-confirmed",
      },
      {
        id: "s1-pa1",
        date: "2026-06-15",
        title: "Bath & brush",
        timeLabel: "Mon 2:15pm",
        timing: "past",
        status: "completed",
      },
    ],
  },
  {
    id: "s2",
    name: "Unlimited Bath & Brush",
    color: "pink",
    client: "Kirsty Dingomal",
    clientId: "kirsty-dingomal",
    clientEmail: "kirsty.dingomal@example.com",
    type: "One-time",
    startDate: "2026-06-15",
    endDate: null,
    status: "paused",
    totalCharged: 280,
    sessionsTotal: "unlimited",
    sessionsRemaining: "unlimited",
    serviceCount: 1,
    redemption: "In-store and online",
    activity: [
      {
        id: "s2-a2",
        date: "2026-06-15",
        title: "Membership paused",
        subtitle: "Paused by Husain Shabbir",
        kind: "paused",
      },
      {
        id: "s2-a1",
        date: "2026-06-15",
        title: "Membership purchased",
        subtitle: "Receipt 12",
        kind: "purchased",
      },
    ],
    appointments: [
      {
        id: "s2-up1",
        date: "2026-06-18",
        title: "Deluxe bath",
        timeLabel: "Thu 11:00am",
        timing: "upcoming",
        status: "confirmed",
      },
      {
        id: "s2-pa1",
        date: "2026-06-14",
        title: "Deluxe bath",
        timeLabel: "Sun 9:30am",
        timing: "past",
        status: "completed",
      },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** ISO date → "15 Jun 2026". */
export function formatSoldDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-US")}`
}

export function formatSessions(sessions: number | "unlimited"): string {
  if (sessions === "unlimited") return "Unlimited"
  return `${sessions} session${sessions === 1 ? "" : "s"}`
}

const STATUS_BADGE: Record<SoldMembershipStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-cami-green-3 text-cami-green-11" },
  paused: { label: "Paused", className: "bg-cami-yellow-3 text-cami-yellow-11" },
}

export function SoldStatusBadge({ status }: { status: SoldMembershipStatus }) {
  const meta = STATUS_BADGE[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

// ─── Table ──────────────────────────────────────────────────────────────────────

type SoldMembershipsTableProps = {
  rows: SoldMembership[]
  onRowClick: (id: string) => void
  /** Open the client detail modal. Omit to render the client as plain text. */
  onClientClick?: (row: SoldMembership) => void
}

export function SoldMembershipsTable({
  rows,
  onRowClick,
  onClientClick,
}: SoldMembershipsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        No memberships match this filter.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-44">Name</TableHead>
          <TableHead className="min-w-36">Client</TableHead>
          <TableHead className="min-w-28">Type</TableHead>
          <TableHead className="min-w-28">Start date</TableHead>
          <TableHead className="min-w-28">End date</TableHead>
          <TableHead className="min-w-24">Status</TableHead>
          <TableHead className="min-w-28 text-right">Total charged</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            className="group cursor-pointer"
            onClick={() => onRowClick(row.id)}
          >
            <TableCell>
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rounded-full ${membershipColorClass(row.color)}`}
                />
                <span className="text-sm font-medium text-cami-violet-11 group-hover:underline">
                  {row.name}
                </span>
              </span>
            </TableCell>
            <TableCell>
              {onClientClick ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClientClick(row)
                  }}
                  className="text-sm font-medium text-cami-violet-11 hover:underline"
                >
                  {row.client}
                </button>
              ) : (
                <span className="text-sm font-medium text-foreground">{row.client}</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.type}</TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {formatSoldDate(row.startDate)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {row.endDate ? formatSoldDate(row.endDate) : "Until canceled"}
            </TableCell>
            <TableCell>
              <SoldStatusBadge status={row.status} />
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap text-foreground">
              {formatAed(row.totalCharged)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
