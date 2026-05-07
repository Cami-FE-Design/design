"use client"

import {
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ShieldAlertIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AccessDeniedCard } from "@/components/blocks/access-denied-card"
import { AdminShell } from "@/components/blocks/admin-shell"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  durationSeconds,
  eventsToCsv,
  eventsToOwnerSummary,
  filterEvents,
  formatDateTime,
  formatDuration,
  type ImpersonationEvent,
  type ImpersonationStatus,
  impersonationEvents,
  PII_FIELD_LABELS,
  relativeTime,
  statusBadgeClass,
  statusLabel,
  uniqueBusinesses,
  uniqueHqUsers,
} from "@/lib/admin-impersonation"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

type RangeFilter = "7d" | "30d" | "all"
type StatusFilter = ImpersonationStatus | "all"

const RANGE_LABEL: Record<RangeFilter, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
}

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active now" },
  { id: "ended", label: "Ended" },
  { id: "expired", label: "Expired" },
]

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function HqUserChip({ user }: { user: ImpersonationEvent["hqUser"] }) {
  const initials = user.name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white"
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm text-foreground">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ImpersonationStatus }) {
  return (
    <Badge className={cn("gap-1.5", statusBadgeClass(status))}>
      {status === "active" ? (
        <span aria-hidden className="size-1.5 rounded-full bg-cami-green-11" />
      ) : null}
      {statusLabel(status)}
    </Badge>
  )
}

function EventRow({
  event,
  nowMs,
  onSelect,
}: {
  event: ImpersonationEvent
  nowMs: number
  onSelect: (e: ImpersonationEvent) => void
}) {
  const dur = durationSeconds(event, nowMs)
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onSelect(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(event)
      }}
      tabIndex={0}
    >
      <TableCell className="py-3">
        <HqUserChip user={event.hqUser} />
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col leading-tight">
          <Link
            href={`/admin/businesses/${event.business.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {event.business.name}
          </Link>
          <span className="truncate font-mono text-xs text-muted-foreground">
            cami.app/{event.business.slug}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-foreground">
        <div className="flex flex-col leading-tight">
          <span>{relativeTime(event.startedAt, nowMs)}</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(event.startedAt)}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm tabular-nums text-foreground">{formatDuration(dur)}</TableCell>
      <TableCell>
        <StatusBadge status={event.status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {event.piiReveals.length === 0 ? (
          <span className="text-xs">None</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cami-yellow-3 px-2 py-0.5 text-xs font-medium text-cami-yellow-11">
            <ShieldAlertIcon className="size-3" />
            {event.piiReveals.length}
          </span>
        )}
      </TableCell>
      <TableCell className="w-12 pr-3 text-right text-muted-foreground">
        <ChevronRightIcon className="ml-auto size-4" />
      </TableCell>
    </TableRow>
  )
}

function EventsTable({
  events,
  nowMs,
  onSelect,
}: {
  events: ImpersonationEvent[]
  nowMs: number
  onSelect: (e: ImpersonationEvent) => void
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No impersonation events match</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different filter or clear the search.
        </p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>HQ user</TableHead>
          <TableHead>Pet Business</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>PII reveals</TableHead>
          <TableHead className="w-12 sr-only">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <EventRow key={event.id} event={event} nowMs={nowMs} onSelect={onSelect} />
        ))}
      </TableBody>
    </Table>
  )
}

function ExportMenu({ events }: { events: ImpersonationEvent[] }) {
  function handleCsv() {
    const csv = eventsToCsv(events)
    const stamp = new Date().toISOString().split("T")[0]
    downloadCsv(`impersonation-events-${stamp}.csv`, csv)
    toast.success(`Exported ${events.length} ${events.length === 1 ? "event" : "events"} to CSV`)
  }
  async function handleSummary() {
    const businesses = uniqueBusinesses(events)
    if (businesses.length !== 1) {
      toast.error("Filter to a single Pet Business to copy a shareable summary.")
      return
    }
    const summary = eventsToOwnerSummary(events, businesses[0])
    const ok = await copyToClipboard(summary)
    if (ok) {
      toast.success(`Owner summary copied for ${businesses[0].name}`)
    } else {
      toast.error("Could not access clipboard. Try downloading the CSV instead.")
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-icon="inline-start">
          <DownloadIcon />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onSelect={handleCsv}>
          <FileTextIcon />
          Download CSV ({events.length})
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSummary}>
          <CopyIcon />
          Copy owner summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function EventDetailSheet({
  event,
  open,
  onOpenChange,
  nowMs,
}: {
  event: ImpersonationEvent | null
  open: boolean
  onOpenChange: (next: boolean) => void
  nowMs: number
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:max-w-lg">
        {event ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <StatusBadge status={event.status} />
                <span className="font-mono text-xs text-muted-foreground">{event.id}</span>
              </div>
              <SheetTitle className="text-xl">
                {event.hqUser.name} signed in as {event.business.ownerName}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{event.business.name}</p>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <StatBlock label="Started" value={formatDateTime(event.startedAt)} />
                  <StatBlock
                    label={event.endedAt ? "Ended" : "Expires after"}
                    value={
                      event.endedAt
                        ? formatDateTime(event.endedAt)
                        : `${event.maxDurationSeconds / 60} min from start`
                    }
                  />
                  <StatBlock
                    label="Duration"
                    value={formatDuration(durationSeconds(event, nowMs))}
                  />
                  <StatBlock label="Max allowed" value={`${event.maxDurationSeconds / 60} min`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reason at start</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{event.reason}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>Sensitive fields revealed</CardTitle>
                  <span className="text-sm text-muted-foreground">{event.piiReveals.length}</span>
                </CardHeader>
                <CardContent>
                  {event.piiReveals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No invoice PII was revealed during this session.
                    </p>
                  ) : (
                    <ul className="flex flex-col">
                      {event.piiReveals.map((p, i) => (
                        <li
                          key={p.id}
                          className={cn(
                            "grid grid-cols-[140px_1fr] items-start gap-4 py-3",
                            i > 0 && "border-t border-border/60",
                          )}
                        >
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm text-foreground">
                              {relativeTime(p.at, nowMs)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(p.at)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 leading-tight">
                            <span className="text-sm font-medium text-foreground">
                              {PII_FIELD_LABELS[p.field]}
                            </span>
                            <span className="text-xs text-muted-foreground">on {p.resource}</span>
                            <span className="mt-1 text-sm text-foreground">{p.reason}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild data-icon="inline-start">
                  <Link href={`/admin/businesses/${event.business.slug}`}>
                    <ExternalLinkIcon />
                    Open Pet Business
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  data-icon="inline-start"
                  onClick={async () => {
                    const summary = eventsToOwnerSummary([event], event.business)
                    const ok = await copyToClipboard(summary)
                    if (ok) toast.success("Event summary copied")
                    else toast.error("Could not access clipboard")
                  }}
                >
                  <CopyIcon />
                  Copy owner summary
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

export default function ImpersonationLogPage() {
  const auth = useAuth()
  const allowed = auth.permissions.has("merchants.impersonate")
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [tab, setTab] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")
  const [businessId, setBusinessId] = useState<string | "all">("all")
  const [hqUserId, setHqUserId] = useState<string | "all">("all")
  const [range, setRange] = useState<RangeFilter>("30d")
  const [selected, setSelected] = useState<ImpersonationEvent | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const allBusinesses = useMemo(() => uniqueBusinesses(impersonationEvents), [])
  const allHqUsers = useMemo(() => uniqueHqUsers(impersonationEvents), [])

  const counts = useMemo(() => {
    const base = { all: 0, active: 0, ended: 0, expired: 0 } as Record<StatusFilter, number>
    for (const e of impersonationEvents) {
      base.all += 1
      base[e.status] += 1
    }
    return base
  }, [])

  const visible = useMemo(
    () =>
      filterEvents(impersonationEvents, {
        query,
        businessId,
        hqUserId,
        status: tab,
        range,
      }),
    [query, businessId, hqUserId, tab, range],
  )

  if (!allowed) {
    return (
      <AdminShell>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <AccessDeniedCard intendedUrl="/admin/impersonation" />
        </div>
      </AdminShell>
    )
  }

  function handleSelect(event: ImpersonationEvent) {
    setSelected(event)
    setSheetOpen(true)
  }

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium leading-8 text-foreground">Impersonation log</h1>
              <p className="text-sm text-muted-foreground">
                Every Cami HQ session opened on a Pet Business account, and every sensitive field
                revealed inside that session.
              </p>
            </div>
            <ExportMenu events={visible} />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cami-yellow-3 px-4 py-3 text-sm text-cami-yellow-12">
            <ShieldAlertIcon className="size-4 shrink-0 text-cami-yellow-11" />
            <span className="text-sm">
              Pet Businesses can request a copy of these events at any time. Filter to one business
              and copy the owner summary.
            </span>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as StatusFilter)}>
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                {STATUS_TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                    <span
                      className={cn(
                        "text-sm font-normal text-muted-foreground",
                        tab === t.id && "text-foreground/70",
                      )}
                    >
                      {counts[t.id]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            }
            actions={
              <SearchInput
                placeholder="Search by reason, business, HQ user"
                aria-label="Search impersonation events"
                defaultValue={query}
                onValueChange={(v: string) => setQuery(v)}
                className="w-72"
              />
            }
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Select value={businessId} onValueChange={(v) => setBusinessId(v)}>
              <SelectTrigger className="h-9 w-[220px]">
                <SelectValue placeholder="All Pet Businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pet Businesses</SelectItem>
                {allBusinesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={hqUserId} onValueChange={(v) => setHqUserId(v)}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="All HQ users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All HQ users</SelectItem>
                {allHqUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={(v) => setRange(v as RangeFilter)}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RANGE_LABEL) as RangeFilter[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RANGE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">
              Showing {visible.length} of {impersonationEvents.length} events
            </span>
          </div>
          <EventsTable events={visible} nowMs={nowMs} onSelect={handleSelect} />
        </Tabs>
      </div>

      <EventDetailSheet
        event={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        nowMs={nowMs}
      />
    </AdminShell>
  )
}
