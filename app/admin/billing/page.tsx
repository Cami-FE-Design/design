"use client"

// Cami HQ notification billing.
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// GNK's third point: "HQ side, billing tier screen for every merchant where we
// can see consumption of sms and email with rates". The Billing item has been
// in lib/admin-menu.ts pointing at a route that didn't exist; this is it.
//
// Scope is notification consumption only. Cami Pay's own billing (subscription
// tiers, transaction fees) is a different ledger and isn't modelled here — the
// page says so rather than implying this is every charge a partner sees.

import { BellIcon, InfoIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { AdminShell } from "@/components/blocks/admin-shell"
import { EmptyState } from "@/components/blocks/empty-state"
import { TableToolbar } from "@/components/blocks/table-toolbar"
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
import { type AdminBusiness, adminBusinesses } from "@/lib/admin-businesses"
import { type HqRates, useHqRates } from "@/lib/notifications/hq-store"
import {
  amountDue,
  CHANNEL_LABEL,
  CHANNELS,
  channelAmountDue,
  formatRate,
  isRateOverridden,
  type NotificationChannel,
  resolvedGrant,
  resolvedRate,
  totalSends,
} from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

/**
 * The billing period. A constant rather than derived from the clock: every
 * timestamp in the admin mocks is fixed, so a "current month" computed at render
 * would drift away from the demo data and show an empty period.
 */
const PERIOD = "1 – 10 August 2026"

type ChannelFilter = "all" | NotificationChannel

function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function BillingRow({ business, globalRates }: { business: AdminBusiness; globalRates: HqRates }) {
  const config = business.notifications
  const sends = totalSends(config)
  const due = amountDue(config, globalRates)
  const grant = resolvedGrant(config)

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/admin/businesses/${business.slug}`}
          className="text-sm font-medium text-foreground hover:underline"
        >
          {business.name}
        </Link>
        <div className="text-xs text-muted-foreground">{business.ownerName}</div>
      </TableCell>

      {CHANNELS.map((channel) => {
        const count = config?.usage?.[channel] ?? 0
        const overridden = isRateOverridden(config, channel, globalRates)
        return (
          <TableCell key={channel} className="tabular-nums">
            {grant[channel] || count > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm text-foreground">
                  {count.toLocaleString("en-US")}
                  {/* Nothing sent isn't the same as the channel being off. A
                      granted channel at zero shows a zero; an ungranted one
                      shows "Off", so a blank cell never means two things. */}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    overridden ? "font-medium text-cami-yellow-11" : "text-muted-foreground",
                  )}
                >
                  {formatRate(resolvedRate(config, channel, globalRates))}
                  {overridden ? " · override" : ""}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Off</span>
            )}
          </TableCell>
        )
      })}

      <TableCell className="tabular-nums text-sm text-muted-foreground">
        {sends.toLocaleString("en-US")}
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm font-medium text-foreground">
        {formatAed(due)}
      </TableCell>
    </TableRow>
  )
}

export default function BillingPage() {
  // Amounts price against the live platform rates, so editing a rate in HQ
  // settings moves this table too.
  const { rates: globalRates } = useHqRates()
  const [query, setQuery] = useState("")
  const [channel, setChannel] = useState<ChannelFilter>("all")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return adminBusinesses.filter((b) => {
      // Filtering by channel means "partners billed for this channel this
      // period" — a partner with the channel granted but nothing sent has no
      // line on that invoice, so it isn't a row worth showing.
      if (channel !== "all" && (b.notifications?.usage?.[channel] ?? 0) === 0) return false
      if (!q) return true
      return b.name.toLowerCase().includes(q) || b.ownerName.toLowerCase().includes(q)
    })
  }, [query, channel])

  const totals = useMemo(() => {
    const perChannel = {} as Record<NotificationChannel, { sends: number; amount: number }>
    for (const c of CHANNELS) perChannel[c] = { sends: 0, amount: 0 }
    let amount = 0
    for (const b of visible) {
      for (const c of CHANNELS) {
        perChannel[c].sends += b.notifications?.usage?.[c] ?? 0
        perChannel[c].amount += channelAmountDue(b.notifications, c, globalRates)
      }
      amount += amountDue(b.notifications, globalRates)
    }
    return { perChannel, amount }
  }, [visible, globalRates])

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Notification consumption per partner. {PERIOD}.
            </p>
          </div>
          <Button variant="outline" radius="full" disabled>
            Export period
          </Button>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {CHANNELS.map((c) => (
            <div key={c} className="flex flex-col gap-1 rounded-2xl border border-border/60 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CHANNEL_LABEL[c]}
              </span>
              <span className="text-xl font-semibold text-foreground">
                {totals.perChannel[c].sends.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatAed(totals.perChannel[c].amount)}
              </span>
            </div>
          ))}
          <div className="flex flex-col gap-1 rounded-2xl bg-cami-violet-2 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-cami-violet-11">
              Due this period
            </span>
            <span className="text-xl font-semibold text-foreground">
              {formatAed(totals.amount)}
            </span>
            <span className="text-xs text-cami-violet-11">Invoiced at month end</span>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-2xl bg-muted/50 p-4 text-sm leading-5 text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Messaging consumption only — Cami Pay subscription and transaction fees are a separate
            ledger. Amounts use the rate stamped on each send, so changing a rate never rewrites a
            closed period. Set the platform defaults in Settings &rsaquo; Notification rates, and a
            partner&rsquo;s override on their record under Notifications.
          </span>
        </p>

        <TableToolbar
          actions={
            <>
              <Select value={channel} onValueChange={(v) => setChannel(v as ChannelFilter)}>
                <SelectTrigger className="w-44" aria-label="Filter by channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CHANNEL_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SearchInput
                placeholder="Search partners"
                aria-label="Search partners"
                defaultValue={query}
                onValueChange={setQuery}
              />
            </>
          }
        />

        {visible.length === 0 ? (
          <EmptyState
            variant="card"
            icon={BellIcon}
            title="No partners billed for this channel"
            description="Nothing was sent on this channel in the current period. Try another channel or clear the search."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                {CHANNELS.map((c) => (
                  <TableHead key={c} className="w-32">
                    {CHANNEL_LABEL[c]}
                  </TableHead>
                ))}
                <TableHead className="w-24">Total sends</TableHead>
                <TableHead className="w-32 text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((b) => (
                <BillingRow key={b.id} business={b} globalRates={globalRates} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminShell>
  )
}
