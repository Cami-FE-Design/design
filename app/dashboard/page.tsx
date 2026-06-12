import {
  ArrowRightIcon,
  CalendarPlusIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  ReceiptIcon,
  UserPlusIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import {
  formatAed,
  formatTimeRange,
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
} from "@/app/appointments/mock"
import { AppShell } from "@/components/blocks/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Home",
  description: "Front-desk dashboard — today's schedule, takings, and what needs attention",
}

// Demo "now" anchored to mid-morning so "next up" and the day's progress read
// meaningfully against the appointments fixture. Real wiring swaps this for the
// live clock + the business's actual booking data.
const BUSINESS_NAME = "Shampooch JVC"
const TODAY_LABEL = "Wednesday, 13 May 2026"
const NOW_MIN = 11 * 60 + 20 // 11:20

const STAFF_BY_ID = Object.fromEntries(MOCK_STAFF.map((s) => [s.id, s]))

const UPCOMING: MockBookingStatus[] = ["booked", "confirmed", "checked-in"]

function startMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

const STATUS_STYLE: Record<MockBookingStatus, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-blue-3 text-blue-11" },
  confirmed: { label: "Confirmed", className: "bg-cami-violet-3 text-cami-violet-11" },
  "checked-in": { label: "Checked in", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  "ready-for-pickup": { label: "Ready", className: "bg-lime-3 text-lime-11" },
  completed: { label: "Completed", className: "bg-cami-sage-3 text-cami-sage-11" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  "no-show": { label: "No-show", className: "bg-tomato-3 text-tomato-11" },
}

// ─── Derived KPIs (off the shared appointments fixture) ─────────────────────

const byStart = [...MOCK_BOOKINGS].sort((a, b) => startMinutes(a.start) - startMinutes(b.start))

const totalToday = MOCK_BOOKINGS.length
const completedToday = MOCK_BOOKINGS.filter((b) => b.status === "completed")
const revenueMinor = completedToday.reduce((sum, b) => sum + b.priceMinor, 0)
const awaitingCheckout = MOCK_BOOKINGS.filter((b) => b.status === "ready-for-pickup").length
const noShowCount = MOCK_BOOKINGS.filter((b) => b.status === "no-show").length
const unpaidDrafts = 2 // mock — wired to /sales drafts later
const lowStock = 3 // mock — wired to /products inventory later

const nextUp = byStart.find((b) => UPCOMING.includes(b.status) && startMinutes(b.start) >= NOW_MIN)

type Kpi = {
  label: string
  value: string
  hint: string
  href: string
}

const KPIS: Kpi[] = [
  {
    label: "Appointments today",
    value: String(totalToday),
    hint: nextUp
      ? `Next ${nextUp.start} · ${nextUp.petName ?? nextUp.clientName}`
      : "Nothing left today",
    href: "/appointments",
  },
  {
    label: "Takings today",
    value: formatAed(revenueMinor),
    hint: `${completedToday.length} completed`,
    href: "/sales/daily-summary",
  },
  {
    label: "Awaiting checkout",
    value: String(awaitingCheckout),
    hint: "Ready for pickup",
    href: "/sales/sales-list",
  },
  {
    label: "Unread messages",
    value: "8",
    hint: "Across all channels",
    href: "/clients",
  },
]

const QUICK_ACTIONS = [
  { label: "New sale", href: "/sales/new-sale", icon: ReceiptIcon },
  { label: "New appointment", href: "/appointments", icon: CalendarPlusIcon },
  { label: "Add client", href: "/clients?add=1", icon: UserPlusIcon },
  { label: "Add pet", href: "/pets?add=1", icon: PlusIcon },
]

type Attention = {
  label: string
  count: number
  tone: "tomato" | "yellow" | "sand"
  href: string
}

const ATTENTION_ALL: Attention[] = [
  {
    label: "No-shows to follow up",
    count: noShowCount,
    tone: "tomato",
    href: "/sales/appointments-list",
  },
  { label: "Ready for checkout", count: awaitingCheckout, tone: "yellow", href: "/sales/new-sale" },
  {
    label: "Unpaid drafts",
    count: unpaidDrafts,
    tone: "sand",
    href: "/sales/sales-list?tab=drafts",
  },
  { label: "Products low on stock", count: lowStock, tone: "sand", href: "/products" },
]

const ATTENTION = ATTENTION_ALL.filter((item) => item.count > 0)

const ATTENTION_DOT: Record<Attention["tone"], string> = {
  tomato: "bg-tomato-9",
  yellow: "bg-cami-yellow-9",
  sand: "bg-sand-8",
}

// Today's agenda: everything still ahead or in progress, earliest first.
const AGENDA = byStart.filter((b) => b.status !== "cancelled").slice(0, 9)

// ─── UI ─────────────────────────────────────────────────────────────────────

function DashboardHeader() {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate font-heading text-xl font-medium text-foreground">
          Good morning, {BUSINESS_NAME}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{TODAY_LABEL}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge size="md" className="bg-cami-sage-3 text-cami-sage-11">
          Open now
        </Badge>
        <Button asChild radius="full" className="hidden sm:inline-flex">
          <Link href="/sales/new-sale">
            <PlusIcon /> New sale
          </Link>
        </Button>
      </div>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Link href={kpi.href} className="group block">
      <Card size="sm" className="h-full transition-shadow group-hover:shadow-lg">
        <CardContent className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{kpi.label}</span>
          <span className="font-heading text-2xl font-medium tabular-nums text-foreground">
            {kpi.value}
          </span>
          <span className="mt-1 truncate text-xs text-muted-foreground">{kpi.hint}</span>
        </CardContent>
      </Card>
    </Link>
  )
}

function AgendaRow({ booking }: { booking: MockBooking }) {
  const staff = STAFF_BY_ID[booking.staffId]
  const status = STATUS_STYLE[booking.status]
  const primary = booking.petName ?? booking.clientName
  const secondary = booking.petName ? booking.clientName : undefined

  return (
    <div className="flex items-center gap-4 px-6 py-3">
      <div className="flex w-24 shrink-0 items-center gap-1.5 text-sm tabular-nums text-foreground">
        <ClockIcon className="size-3.5 text-muted-foreground" />
        {formatTimeRange(booking.start, booking.durationMin)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {primary}
          {secondary ? (
            <span className="font-normal text-muted-foreground"> · {secondary}</span>
          ) : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {booking.serviceName}
          {staff ? ` · ${staff.name}` : ""}
        </p>
      </div>
      <Badge size="sm" className={cn("shrink-0", status.className)}>
        {status.label}
      </Badge>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppShell headerClassName="min-h-0 justify-start px-6 py-5" header={<DashboardHeader />}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {KPIS.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Today's schedule */}
            <Card className="gap-0 py-0">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="font-heading text-base font-medium text-foreground">
                    Today's schedule
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalToday} appointments · {completedToday.length} done
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" radius="full">
                  <Link href="/appointments">
                    View calendar <ArrowRightIcon />
                  </Link>
                </Button>
              </div>
              <div className="divide-y divide-border border-t border-border">
                {AGENDA.map((booking) => (
                  <AgendaRow key={booking.id} booking={booking} />
                ))}
              </div>
            </Card>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Quick actions */}
              <Card size="sm" className="gap-0 py-0">
                <h2 className="px-6 pt-5 pb-3 font-heading text-base font-medium text-foreground">
                  Quick actions
                </h2>
                <div className="flex flex-col border-t border-border">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="flex-1">{action.label}</span>
                        <ChevronRightIcon className="size-4 text-muted-foreground" />
                      </Link>
                    )
                  })}
                </div>
              </Card>

              {/* Needs attention */}
              <Card size="sm" className="gap-0 py-0">
                <h2 className="px-6 pt-5 pb-3 font-heading text-base font-medium text-foreground">
                  Needs attention
                </h2>
                <div className="flex flex-col border-t border-border">
                  {ATTENTION.length === 0 ? (
                    <p className="px-6 py-4 text-sm text-muted-foreground">All caught up 🎉</p>
                  ) : (
                    ATTENTION.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-muted"
                      >
                        <span
                          className={cn("size-2 shrink-0 rounded-full", ATTENTION_DOT[item.tone])}
                        />
                        <span className="flex-1 text-foreground">{item.label}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {item.count}
                        </span>
                        <ChevronRightIcon className="size-4 text-muted-foreground" />
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
