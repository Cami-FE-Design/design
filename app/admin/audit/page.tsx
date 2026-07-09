"use client"

import { ShieldAlertIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo } from "react"
import { AdminShell } from "@/components/blocks/admin-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AUDIT_KIND_LABELS,
  type AuditEventKind,
  auditKindBadge,
  formatDateTime,
  type GlobalAuditEvent,
  getAllAuditEvents,
  relativeTime,
} from "@/lib/admin-businesses"
import { cn } from "@/lib/utils"

type KindFilter = "all" | AuditEventKind

const tabs: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "impersonation", label: "Impersonation" },
  { id: "suspend", label: "Suspend" },
  { id: "archive", label: "Archive" },
  { id: "edit", label: "Edits" },
  { id: "login", label: "Sign-ins" },
]

function isKindFilter(v: string | null): v is KindFilter {
  if (v === "all") return true
  return v !== null && v in AUDIT_KIND_LABELS
}

function ActorAvatar({ actor }: { actor: string }) {
  const initials = actor
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
  const isHQ = actor.toLowerCase().includes("cami hq")
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
        isHQ ? "bg-cami-yellow-3 text-cami-yellow-11" : "bg-cami-violet-3 text-cami-violet-11",
      )}
    >
      {initials}
    </span>
  )
}

function AuditRow({ event }: { event: GlobalAuditEvent }) {
  const kind = auditKindBadge(event.kind)
  return (
    <TableRow>
      <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">
        <div className="flex flex-col">
          <span className="text-foreground">{relativeTime(event.at)}</span>
          <span className="text-xs">{formatDateTime(event.at)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <ActorAvatar actor={event.actor} />
          <span className="text-sm text-foreground">{event.actor}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={kind.className}>{kind.label}</Badge>
      </TableCell>
      <TableCell>
        <Link
          href={`/admin/businesses/${event.businessSlug}`}
          className="text-sm font-medium text-foreground hover:underline"
        >
          {event.businessName}
        </Link>
      </TableCell>
      <TableCell className="max-w-md">
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{event.action}</span>
          {event.detail ? (
            <span className="truncate text-sm text-muted-foreground">{event.detail}</span>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

function AuditTable({ events }: { events: GlobalAuditEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={ShieldAlertIcon}
        title="No audit events match"
        description="Try a different tab, business, or clear the search."
      />
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-44">When</TableHead>
          <TableHead className="w-56">Actor</TableHead>
          <TableHead className="w-32">Kind</TableHead>
          <TableHead className="w-48">Partner</TableHead>
          <TableHead>Detail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <AuditRow key={`${event.businessId}-${event.id}`} event={event} />
        ))}
      </TableBody>
    </Table>
  )
}

function AuditLog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const allEvents = useMemo(() => getAllAuditEvents(), [])

  const tabParam = searchParams.get("kind")
  const tab: KindFilter = isKindFilter(tabParam) ? tabParam : "all"
  const query = searchParams.get("q") ?? ""
  const businessFilter = searchParams.get("business") ?? "all"

  const businessOptions = useMemo(() => {
    const seen = new Map<string, { slug: string; name: string }>()
    for (const e of allEvents) {
      if (!seen.has(e.businessSlug))
        seen.set(e.businessSlug, { slug: e.businessSlug, name: e.businessName })
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [allEvents])

  const updateParams = useCallback(
    (next: Partial<{ kind: string; q: string; business: string }>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(next)) {
        if (v === "" || v === null || v === undefined || v === "all") {
          params.delete(k)
        } else {
          params.set(k, v)
        }
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  const counts = useMemo(() => {
    const base: Record<KindFilter, number> = {
      all: allEvents.length,
      login: 0,
      impersonation: 0,
      edit: 0,
      create: 0,
      suspend: 0,
      archive: 0,
      restore: 0,
      system: 0,
    }
    for (const e of allEvents) base[e.kind] += 1
    return base
  }, [allEvents])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allEvents.filter((e) => {
      if (tab !== "all" && e.kind !== tab) return false
      if (businessFilter !== "all" && e.businessSlug !== businessFilter) return false
      if (!q) return true
      return (
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        (e.detail?.toLowerCase().includes(q) ?? false) ||
        e.businessName.toLowerCase().includes(q)
      )
    })
  }, [allEvents, tab, businessFilter, query])

  const impersonationsThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return allEvents.filter(
      (e) => e.kind === "impersonation" && new Date(e.at).getTime() >= sevenDaysAgo,
    ).length
  }, [allEvents])

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Audit log</h1>
            <p className="text-sm text-muted-foreground">
              Every action by Cami HQ and Partner owners. Retained for 12 months.
            </p>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl bg-cami-yellow-3 p-4 text-sm">
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          <div className="flex flex-col">
            <span className="font-medium text-cami-yellow-12">
              {impersonationsThisWeek}{" "}
              {impersonationsThisWeek === 1 ? "impersonation" : "impersonations"} in the last 7 days
            </span>
            <span className="text-cami-yellow-11">
              Impersonation events are highlighted because every action taken inside an Owner&apos;s
              account is recorded against the HQ user who started the session.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => updateParams({ kind: "impersonation" })}
          >
            See impersonations
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => updateParams({ kind: v })}>
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                {tabs.map((t) => (
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
              <>
                <Select value={businessFilter} onValueChange={(v) => updateParams({ business: v })}>
                  <SelectTrigger className="w-48" aria-label="Filter by Partner">
                    <SelectValue placeholder="All businesses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All businesses</SelectItem>
                    {businessOptions.map((b) => (
                      <SelectItem key={b.slug} value={b.slug}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchInput
                  placeholder="Search log"
                  aria-label="Search audit log"
                  defaultValue={query}
                  onValueChange={(v: string) => updateParams({ q: v })}
                />
              </>
            }
          />
          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <AuditTable events={visible} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminShell>
  )
}

export default function AuditPage() {
  return (
    <Suspense fallback={null}>
      <AuditLog />
    </Suspense>
  )
}
