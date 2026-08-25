"use client"

// Account summary — DSG-77.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The screen the whole model has to survive. Two rules govern every line here,
// and both come from a measured defect in the benchmark (spec §2.1):
//
//   1. ONE headline figure, and the breakdown ARRIVES at it. The breakdown is
//      rendered from the same `MoneySummary` the headline reads, and the
//      running total is printed after every block, so the arithmetic is visible
//      rather than asserted (T4-2, T4-4).
//   2. Payouts are a line in that arithmetic. Fresha's omission is why their
//      two figures disagree by 9.3x — theirs reconciles to itself, not to the
//      bank (SET-D5).
//
// D6 is still open, so both layouts live here behind `variant`:
//
//   - "two-rail" (recommended): one headline for money Cami holds — the only
//     timing Cami controls — with gateway money as a labelled secondary
//     section. Two custodians, two figures, each scoped.
//   - "blended": one figure for everything held, with the custodian split
//     stated underneath. Simpler to glance at, and closer to recreating the
//     two-balance defect from the other direction.
//
// Both read the same `summarize()`. Whichever D6 picks, no arithmetic changes.

import {
  ArrowDownToLineIcon,
  BanknoteIcon,
  InfoIcon,
  LandmarkIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"
import { toast } from "sonner"
import { type DateRange, DateRangePopover } from "@/components/blocks/date-range-popover"
import { EmptyState } from "@/components/blocks/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { formatRate } from "@/lib/hq-camipay/store"
import {
  formatMoney,
  fromDayIso,
  payoutStatusLabel,
  SCOPE_STATEMENT,
  settlementBlockCopy,
  toDayIso,
} from "@/lib/money/format"
import { summarize, summarizeByRail } from "@/lib/money/ledger"
import {
  DEMO_RATES,
  nextPayoutDay,
  PAYOUT_MINIMUM_MINOR,
  PAYOUT_SCHEDULE,
  TODAY_ISO,
} from "@/lib/money/mock"
import type {
  CamiPayRail,
  MerchantRails,
  MoneySummary,
  MoneyTx,
  Payout,
  SettlementBlock,
} from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

export type MoneySummaryVariant = "two-rail" | "blended"

type Props = {
  txs: ReadonlyArray<MoneyTx>
  payouts: ReadonlyArray<Payout>
  rails: MerchantRails
  range: DateRange
  onRangeChange: (range: DateRange) => void
  variant: MoneySummaryVariant
  /** Null is the healthy case. */
  block: SettlementBlock | null
}

const RAIL_LABEL: Record<CamiPayRail, string> = {
  online: "Online payments",
  terminal: "Card machine payments",
}

export function MoneySummaryView({
  txs,
  payouts,
  rails,
  range,
  onRangeChange,
  variant,
  block,
}: Props) {
  const bounds = { fromIso: toDayIso(range.from), toIso: toDayIso(range.to) }
  const blended = summarize(txs, bounds)
  const byRail = summarizeByRail(txs, bounds)

  const activeRails = (["online", "terminal"] as const).filter((r) => rails[r])
  const singleRail = activeRails.length === 1 ? activeRails[0] : null

  // A terminal-only or online-only merchant is not a degraded case — the screen
  // has to be complete for them (SET-X7, SET-X8). With one rail there is one
  // custodian, so the rail split has nothing to split and collapses.
  const showRailSplit = variant === "two-rail" && activeRails.length > 1

  const hasActivity = blended.moneyIn.totalMinor !== 0 || blended.payouts.count > 0

  return (
    <div className="flex w-full flex-col gap-6 pb-4">
      <PeriodRow range={range} onRangeChange={onRangeChange} />

      {block ? <SettlementBanner block={block} /> : null}

      {!hasActivity ? (
        <EmptyState
          variant="card"
          icon={WalletIcon}
          title="No money moved in this period"
          description="Card payments taken through Cami will appear here, along with what Cami charged and what went to your bank."
        />
      ) : (
        <>
          {showRailSplit ? (
            <TwoRailHeadline byRail={byRail} />
          ) : (
            <BlendedHeadline
              summary={singleRail ? byRail[singleRail] : blended}
              rails={activeRails}
              blockedFromPayout={block !== null}
            />
          )}

          <Tiles summary={singleRail ? byRail[singleRail] : blended} />

          <Breakdown
            summary={singleRail ? byRail[singleRail] : blended}
            custodianName={singleRail ? custodianLabel(custodianOf(singleRail)) : "Cami and NeoPay"}
          />

          {showRailSplit ? <RailDetail byRail={byRail} payouts={payouts} /> : null}

          <TaxBlock summary={singleRail ? byRail[singleRail] : blended} />

          <RecentPayouts payouts={payouts} rails={rails} />
        </>
      )}

      <ScopeNote />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function PeriodRow({
  range,
  onRangeChange,
}: {
  range: DateRange
  onRangeChange: (range: DateRange) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* The shared range control (presets + two-month calendar + typed dates),
          not a bespoke one. It replaced a Select whose "Custom" option silently
          showed month-to-date — an option that does nothing is worse than no
          option, because the merchant believes they filtered. */}
      <DateRangePopover value={range} onChange={onRangeChange} today={fromDayIso(TODAY_ISO)} />

      {/* T4-10. Format defers to the reporting CSV set (ADR-024). */}
      <Button
        variant="outline"
        radius="full"
        size="sm"
        onClick={() =>
          toast("Reconciliation exported", {
            description: `${formatDate(fromDayIso(toDayIso(range.from)))} – ${formatDate(fromDayIso(toDayIso(range.to)))}`,
          })
        }
      >
        <ArrowDownToLineIcon className="size-3.5" />
        Export for my accountant
      </Button>
    </div>
  )
}

function SettlementBanner({ block }: { block: SettlementBlock }) {
  const { tone, title, body } = settlementBlockCopy(block)
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl p-3",
        tone === "warning" ? "bg-cami-yellow-2" : "bg-cami-sage-2",
      )}
    >
      <InfoIcon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "warning" ? "text-cami-yellow-11" : "text-cami-sage-12",
        )}
        strokeWidth={1.5}
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

/**
 * The recommended D6 shape. Cami-held money is the headline because it is the
 * only money whose timing Cami controls; NeoPay's sits beside it, labelled, at
 * a visibly lower weight. Neither figure can be mistaken for "the balance"
 * because neither is called one.
 */
function TwoRailHeadline({ byRail }: { byRail: Record<CamiPayRail, MoneySummary> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-5">
      <HeldCard
        className="sm:col-span-3"
        rail="online"
        summary={byRail.online}
        emphasis="primary"
      />
      <HeldCard
        className="sm:col-span-2"
        rail="terminal"
        summary={byRail.terminal}
        emphasis="secondary"
      />
    </div>
  )
}

function HeldCard({
  rail,
  summary,
  emphasis,
  className,
}: {
  rail: CamiPayRail
  summary: MoneySummary
  emphasis: "primary" | "secondary"
  className?: string
}) {
  const custodian = custodianOf(rail)
  const who = custodianLabel(custodian)
  const schedule = PAYOUT_SCHEDULE[rail]
  const arriving = nextPayoutDay(rail)
  const below = summary.heldMinor > 0 && summary.heldMinor < PAYOUT_MINIMUM_MINOR

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5",
        emphasis === "primary" && "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          {/* Never "Balance". What it is, who has it, when it leaves (G1, G3). */}
          <p className="text-sm font-medium text-foreground">Held by {who}</p>
          <p className="text-xs text-muted-foreground">{RAIL_LABEL[rail]}</p>
        </div>
        <Badge variant="secondary">{who}</Badge>
      </div>

      <p
        className={cn(
          "font-heading font-semibold leading-none text-foreground",
          emphasis === "primary" ? "text-4xl" : "text-2xl",
        )}
      >
        {formatMoney(summary.heldMinor)}
      </p>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        {below ? (
          // Skipped is not failed (SET-X9) — no alarm colour, no error wording.
          <p>
            Under your {formatMoney(PAYOUT_MINIMUM_MINOR)} minimum, so it rolls forward to the next
            payout.
          </p>
        ) : (
          <p>Arriving {formatDate(`${arriving}T00:00:00Z`)}</p>
        )}
        <p>
          {schedule.label}
          {schedule.editable ? null : (
            // SET-B7: the gateway owns this schedule, so there is no disabled
            // control here to imply a permission the merchant could be granted.
            <span> · set by {who}</span>
          )}
        </p>
      </div>
    </div>
  )
}

/** The blended D6 variant, and the only sensible shape for a single-rail merchant. */
function BlendedHeadline({
  summary,
  rails,
  blockedFromPayout,
}: {
  summary: MoneySummary
  rails: ReadonlyArray<CamiPayRail>
  blockedFromPayout: boolean
}) {
  const custodians = [...new Set(rails.map((r) => custodianLabel(custodianOf(r))))]

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">
        Held for you by {custodians.join(" and ")}
      </p>
      <p className="font-heading text-4xl font-semibold leading-none text-foreground">
        {formatMoney(summary.heldMinor)}
      </p>
      {blockedFromPayout ? (
        <p className="text-sm text-muted-foreground">No payout is scheduled right now.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {rails
            .map(
              (r) =>
                `${custodianLabel(custodianOf(r))} pays ${PAYOUT_SCHEDULE[r].label.toLowerCase()}`,
            )
            .join(" · ")}
        </p>
      )}
      {custodians.length > 1 ? (
        // The blended variant's weak point, stated rather than hidden: one
        // number, two senders, two schedules behind it.
        <p className="text-xs text-muted-foreground">
          This is two payouts from two senders. See the rail breakdown below for which is which.
        </p>
      ) : null}
    </div>
  )
}

function Tiles({ summary }: { summary: MoneySummary }) {
  const tiles = [
    { label: "Money in", value: summary.moneyIn.totalMinor, icon: TrendingUpIcon },
    { label: "Cami charged", value: summary.deductions.totalMinor, icon: ReceiptTextIcon },
    // The tile Fresha omits. It is the reason the figures above tie to a bank
    // statement rather than only to themselves (SET-D5).
    { label: "Paid to your bank", value: summary.payouts.totalMinor, icon: LandmarkIcon },
    { label: "Adjustments", value: summary.adjustments.totalMinor, icon: BanknoteIcon },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <t.icon className="size-4" strokeWidth={1.5} />
            <span className="text-xs font-medium">{t.label}</span>
          </div>
          <span className="font-heading text-xl font-semibold leading-none text-foreground">
            {formatMoney(t.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * The reconciliation. Every block prints its own subtotal and then the running
 * total, so a merchant can follow the arithmetic down to the headline instead of
 * trusting it (T4-4).
 */
function Breakdown({ summary, custodianName }: { summary: MoneySummary; custodianName: string }) {
  // Opens at the balance, not at zero. Held money is a point-in-time figure and
  // the rows below it are period flows — mixing the two without an opening line
  // is what makes a "balance" under a period selector go negative.
  const afterMoneyIn = summary.openingMinor + summary.moneyIn.totalMinor
  const afterDeductions = afterMoneyIn + summary.deductions.totalMinor
  const afterAdjustments = afterDeductions + summary.adjustments.totalMinor

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">Details breakdown</h2>

      <Block title="Held when this period started">
        <Row label="Brought forward" value={summary.openingMinor} />
      </Block>

      <Block title="Money in">
        <Row label="Sales" value={summary.moneyIn.salesMinor} />
        <Row label="Client tips" value={summary.moneyIn.tipsMinor} />
        <Row label="Deposits" value={summary.moneyIn.depositsMinor} />
        <Row label="Total money in" value={summary.moneyIn.totalMinor} strong />
      </Block>

      <Block title="What Cami charged">
        <Row label="Cami fee" value={summary.deductions.camiFeeMinor} />
        <Row label="Messaging and add-on usage" value={summary.deductions.messagingMinor} />
        <Row label="Refunds to clients" value={summary.deductions.refundsMinor} />
        <Row label="Total charged" value={summary.deductions.totalMinor} strong />
        {/* No subscription line, now or later. The OS is free (INV-P4). */}
        <p className="pt-1 text-xs text-muted-foreground">
          Cami charges {formatRate(DEMO_RATES.terminal)} on card machine payments and{" "}
          {formatRate(DEMO_RATES.online)} online. There is no subscription — the software is free.
        </p>
      </Block>

      <Running
        label="Brought forward, plus money in, less what Cami charged"
        value={afterDeductions}
      />

      <Block title="Adjustments">
        {summary.adjustments.count === 0 ? (
          <Row label="No adjustments in this period" value={0} muted />
        ) : (
          <Row
            label={`${summary.adjustments.count} adjustment${summary.adjustments.count === 1 ? "" : "s"}`}
            value={summary.adjustments.totalMinor}
          />
        )}
      </Block>

      <Running label="After adjustments" value={afterAdjustments} />

      <Block title="Already paid to your bank">
        <Row
          label={`${summary.payouts.count} payout${summary.payouts.count === 1 ? "" : "s"} sent in this period`}
          value={summary.payouts.totalMinor}
        />
      </Block>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          Still held for you by {custodianName}
        </span>
        <span className="font-heading text-lg font-semibold text-foreground">
          {formatMoney(summary.heldMinor)}
        </span>
      </div>
    </section>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string
  value: number
  strong?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-1.5 text-sm",
        strong && "mt-1 border-t border-border/60 pt-2.5 font-medium text-foreground",
      )}
    >
      <span className={cn(muted ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground",
          strong && "font-semibold",
        )}
      >
        {formatMoney(value)}
      </span>
    </div>
  )
}

/** A visible carry-forward. Without these the block totals do not add up on the page. */
function Running({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-y border-dashed border-border/70 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{formatMoney(value)}</span>
    </div>
  )
}

function RailDetail({
  byRail,
  payouts,
}: {
  byRail: Record<CamiPayRail, MoneySummary>
  payouts: ReadonlyArray<Payout>
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Where each payout comes from
        </h2>
        <p className="text-sm text-muted-foreground">
          Two senders pay into your one bank account. This is what each of them owes you right now,
          and when they send it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["online", "terminal"] as const).map((rail) => {
          const summary = byRail[rail]
          const who = custodianLabel(custodianOf(rail))
          const last = payouts.find((p) => p.rail === rail && p.status !== "held-below-minimum")
          return (
            <div
              key={rail}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{RAIL_LABEL[rail]}</span>
                <Badge variant="secondary">Paid by {who}</Badge>
              </div>
              <dl className="flex flex-col gap-1.5 text-sm">
                <DefRow term="Money in" value={formatMoney(summary.moneyIn.totalMinor)} />
                <DefRow term="Cami charged" value={formatMoney(summary.deductions.totalMinor)} />
                <DefRow term="Paid to your bank" value={formatMoney(summary.payouts.totalMinor)} />
                <DefRow term="Still held" value={formatMoney(summary.heldMinor)} strong />
                <DefRow term="Schedule" value={PAYOUT_SCHEDULE[rail].label} />
                <DefRow
                  term="Last payout"
                  value={
                    last
                      ? `${formatMoney(last.amountMinor)} · ${payoutStatusLabel(last.status)}`
                      : "None yet"
                  }
                />
              </dl>
              <p className="text-xs text-muted-foreground">{PAYOUT_SCHEDULE[rail].description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DefRow({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className={cn("tabular-nums text-foreground", strong && "font-semibold")}>{value}</dd>
    </div>
  )
}

/**
 * Both totals, always (T4-7, G4). Amount due and taxable gross differ whenever
 * a tip exists, and a single "total" here produces a wrong VAT return (EC-39).
 */
function TaxBlock({ summary }: { summary: MoneySummary }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">For your VAT return</h2>
        <p className="text-sm text-muted-foreground">
          Prices include VAT, so the tax below is the amount contained in them, not added on top.
        </p>
      </div>
      <div className="flex flex-col">
        <Row label="Taxable sales (VAT inclusive)" value={summary.tax.taxableGrossMinor} />
        <Row label="Client tips (outside VAT)" value={summary.moneyIn.tipsMinor} />
        <Row label="Total clients paid" value={summary.tax.amountDueMinor} strong />
        <div className="mt-3 flex flex-col">
          <Row label="VAT within your sales" value={summary.tax.vatOnSalesMinor} />
          <Row label="VAT on Cami's fee (reclaimable)" value={summary.tax.vatOnCamiFeeMinor} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Cami's fee is invoiced to you as a tax invoice. Download it under Invoices and fees.
      </p>
    </section>
  )
}

function RecentPayouts({
  payouts,
  rails,
}: {
  payouts: ReadonlyArray<Payout>
  rails: MerchantRails
}) {
  const recent = payouts.filter((p) => rails[p.rail]).slice(0, 6)
  if (recent.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">Recent payouts</h2>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
        {recent.map((p, i) => {
          const who = custodianLabel(custodianOf(p.rail))
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                i > 0 && "border-t border-border/60",
              )}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {formatMoney(p.amountMinor)} from {who}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(p.sentAt)} · to •••• {p.destinationLast4}
                  {p.retryOfPayoutId ? " · retry of a returned payout" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {p.failureReason ? (
                  <span className="max-w-xs text-xs text-destructive">{p.failureReason}</span>
                ) : null}
                <Badge
                  variant={
                    p.status === "failed"
                      ? "destructive"
                      : p.status === "paid"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {payoutStatusLabel(p.status)}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** T4-8 / SET-D7. The figure's scope, including what it leaves out. */
function ScopeNote() {
  return (
    <p className="flex gap-2 text-xs text-muted-foreground">
      <InfoIcon className="mt-px size-3.5 shrink-0" strokeWidth={1.5} />
      <span>{SCOPE_STATEMENT}</span>
    </p>
  )
}
