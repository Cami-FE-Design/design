"use client"

// Transaction activity — DSG-78.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The itemised feed under the number. Omar's report has an emotional job —
// proving the chaos is gone — so the day is never summarised away.
//
// Adopted from the benchmark (spec §2.4): day grouping with a subtotal, and the
// row shape. Changed on purpose:
//
//   - The daily subtotal is the NET, not money-in. Theirs shows takings only, so
//     a heavy fee day reads as a good one.
//   - A rail filter exists. They have one wallet, so no rail axis exists for
//     them to filter on (§2.5).
//   - Direction is carried by an icon and colour, not only by the sign (T5-2).

import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  CoinsIcon,
  FilterIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MessageSquareIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { type DateRange, DateRangePopover } from "@/components/blocks/date-range-popover"
import { EmptyState } from "@/components/blocks/empty-state"
import { PayoutDetailDialog } from "@/components/blocks/money/payout-detail-dialog"
import { TransactionDetailDialog } from "@/components/blocks/money/transaction-detail-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTime } from "@/lib/format"
import {
  formatDayHeading,
  formatMoney,
  fromDayIso,
  SCOPE_STATEMENT,
  toDayIso,
  txKindLabel,
} from "@/lib/money/format"
import { filterActivity, groupByDay, paginateDays } from "@/lib/money/ledger"
import { DESTINATION_LAST4, defaultRange, TODAY_ISO } from "@/lib/money/mock"
import type { CamiPayRail, MerchantRails, MoneyTx, MoneyTxKind, Payout } from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<MoneyTxKind, typeof BanknoteIcon> = {
  sale: BanknoteIcon,
  // HandCoins is what Payments already uses for a deposit, so one concept keeps
  // one glyph across the product. It replaced a WALLET, which contradicted the
  // thing this pack keeps saying: Cami has no wallet.
  deposit: HandCoinsIcon,
  // Was the same banknote as a sale. A tip is money the merchant did not price.
  tip: CoinsIcon,
  refund: RotateCcwIcon,
  "cami-fee": ReceiptTextIcon,
  messaging: MessageSquareIcon,
  // Sliders read as settings. An adjustment moves money back or forth.
  adjustment: ArrowLeftRightIcon,
  payout: LandmarkIcon,
}

/**
 * The filter list. Fresha's covers ten types including Business loans and
 * Marketplace fees; ours covers what Cami actually moves, and nothing it does
 * not sell (INV-P4).
 */
const KIND_FILTERS: ReadonlyArray<{ id: MoneyTxKind; label: string }> = [
  { id: "sale", label: "Sales" },
  { id: "deposit", label: "Deposits" },
  { id: "tip", label: "Tips" },
  { id: "refund", label: "Refunds" },
  { id: "cami-fee", label: "Cami fees" },
  { id: "messaging", label: "Messaging" },
  { id: "payout", label: "Payouts" },
  { id: "adjustment", label: "Adjustments" },
]

const DAYS_PER_PAGE = 7

type Props = {
  txs: ReadonlyArray<MoneyTx>
  payouts: ReadonlyArray<Payout>
  rails: MerchantRails
  /** Review-only, for the loading state in the ticket's list. */
  loading?: boolean
}

export function MoneyActivityView({ txs, payouts, rails, loading = false }: Props) {
  const [range, setRange] = useState<DateRange>(() => defaultRange())
  const [kind, setKind] = useState<MoneyTxKind | "all">("all")
  const [rail, setRail] = useState<CamiPayRail | "all">("all")
  const [location, setLocation] = useState<string>("all")
  const [days, setDays] = useState(DAYS_PER_PAGE)

  const [openTx, setOpenTx] = useState<MoneyTx | null>(null)
  const [openPayout, setOpenPayout] = useState<Payout | null>(null)

  const bothRails = rails.online && rails.terminal
  const bounds = { fromIso: toDayIso(range.from), toIso: toDayIso(range.to) }

  // Forward-compatible with multi-location (OBJ-P6): the filter reads the
  // locations present in the data rather than a hardcoded list, so it starts
  // working the day a second location exists.
  const locations = useMemo(() => [...new Set(txs.map((t) => t.locationName))].sort(), [txs])

  const filtered = useMemo(
    () =>
      filterActivity(txs, {
        kinds: kind === "all" ? undefined : [kind],
        rail: rail === "all" ? null : rail,
        locationName: location === "all" ? undefined : location,
        fromIso: bounds.fromIso,
        toIso: bounds.toIso,
      }),
    [txs, kind, rail, location, bounds.fromIso, bounds.toIso],
  )

  const allGroups = useMemo(() => groupByDay(filtered), [filtered])
  const { groups, remainingDays } = paginateDays(allGroups, days)

  const filtersActive = kind !== "all" || rail !== "all" || location !== "all"

  return (
    <div className="flex w-full flex-col gap-5 pb-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Shared range control, same as the account summary — one period
            vocabulary across the money surfaces. */}
        <DateRangePopover value={range} onChange={setRange} today={fromDayIso(TODAY_ISO)} />

        <Select value={kind} onValueChange={(v) => setKind(v as MoneyTxKind | "all")}>
          <SelectTrigger className="w-40" aria-label="Transaction type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {KIND_FILTERS.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* The axis Fresha has no equivalent of. Only worth showing to a
            merchant who actually runs both rails. */}
        {bothRails ? (
          <Select value={rail} onValueChange={(v) => setRail(v as CamiPayRail | "all")}>
            <SelectTrigger className="w-48" aria-label="Paid by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Both senders</SelectItem>
              <SelectItem value="online">Held by Cami (online)</SelectItem>
              <SelectItem value="terminal">Held by NeoPay (card machine)</SelectItem>
            </SelectContent>
          </Select>
        ) : null}

        {locations.length > 1 ? (
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-44" aria-label="Location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {filtersActive ? (
          <Button
            variant="ghost"
            radius="full"
            size="sm"
            onClick={() => {
              setKind("all")
              setRail("all")
              setLocation("all")
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {loading ? (
        // Skeletons keep the day shape, so the feed does not jump when the rows
        // land. A spinner would say "something is happening"; this says what.
        <div className="flex flex-col gap-6">
          {[0, 1].map((day) => (
            <section key={day} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
                {[0, 1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      row > 0 && "border-t border-border/60",
                    )}
                  >
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : groups.length === 0 ? (
        filtersActive ? (
          // Filtered to zero is not the same as having no money. Say which.
          <EmptyState
            variant="card"
            icon={FilterIcon}
            title="Nothing matches these filters"
            description="There is money in this period, but none of it matches what you have filtered to."
            action={
              <Button
                radius="full"
                onClick={() => {
                  setKind("all")
                  setRail("all")
                  setLocation("all")
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            variant="card"
            icon={BanknoteIcon}
            title="No activity in this period"
            description="Every card payment, fee and payout will appear here as it happens."
          />
        )
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.dayIso} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-medium text-foreground">
                  {formatDayHeading(group.dayIso, TODAY_ISO)}
                </h2>
                {/* The net, not the takings. See the header comment. */}
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatMoney(group.subtotalMinor)} net
                </span>
              </div>

              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
                {group.txs.map((tx, i) => (
                  <Row
                    key={tx.id}
                    tx={tx}
                    showCustodian={bothRails}
                    first={i === 0}
                    onOpen={() =>
                      tx.kind === "payout"
                        ? setOpenPayout(payouts.find((p) => p.id === tx.payoutId) ?? null)
                        : setOpenTx(tx)
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          {remainingDays > 0 ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                radius="full"
                onClick={() => setDays((d) => d + DAYS_PER_PAGE)}
              >
                Show earlier days ({remainingDays} more)
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{SCOPE_STATEMENT}</p>

      <TransactionDetailDialog
        tx={openTx}
        txs={txs}
        payouts={payouts}
        onOpenChange={(open) => {
          if (!open) setOpenTx(null)
        }}
        onOpenPayout={(p) => {
          setOpenTx(null)
          setOpenPayout(p)
        }}
      />

      <PayoutDetailDialog
        payout={openPayout}
        txs={txs}
        payouts={payouts}
        onOpenChange={(open) => {
          if (!open) setOpenPayout(null)
        }}
        onOpenTx={(tx) => {
          setOpenPayout(null)
          setOpenTx(tx)
        }}
        onOpenPayout={(p) => setOpenPayout(p)}
      />
    </div>
  )
}

function Row({
  tx,
  showCustodian,
  first,
  onOpen,
}: {
  tx: MoneyTx
  showCustodian: boolean
  first: boolean
  onOpen: () => void
}) {
  const Icon = KIND_ICON[tx.kind]
  const isOut = tx.amountMinor < 0
  const who = custodianLabel(custodianOf(tx.rail))

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30",
        !first && "border-t border-border/60",
      )}
    >
      {/* Direction is readable before the amount is (T5-2). */}
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isOut ? "bg-muted text-muted-foreground" : "bg-cami-green-3 text-cami-green-11",
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
          {txKindLabel(tx.kind)}
          {tx.confirmation === "reported" ? (
            // T5-10. Real enough to show, not yet confirmed by the gateway.
            <Badge variant="warning" size="sm">
              Reported
            </Badge>
          ) : null}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {[tx.client, tx.reference?.label, tx.note].filter(Boolean).join(" · ") ||
            (tx.kind === "payout" ? `to •••• ${DESTINATION_LAST4}` : tx.locationName)}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            "flex items-center gap-1 text-sm font-medium tabular-nums",
            isOut ? "text-foreground" : "text-cami-green-11",
          )}
        >
          {isOut ? (
            <ArrowUpRightIcon className="size-3" />
          ) : (
            <ArrowDownLeftIcon className="size-3" />
          )}
          {formatMoney(tx.amountMinor)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTime(tx.at)}
          {showCustodian ? ` · ${who}` : ""}
        </span>
      </div>
    </button>
  )
}
