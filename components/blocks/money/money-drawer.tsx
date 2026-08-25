"use client"

// The topbar money drawer — DSG-73, journey steps 1 to 3.
//
// Not called a wallet, because Cami has no wallet: there is no stored balance
// to top up or spend from, only money a custodian is holding until the next
// payout. Fresha's IS a wallet, which is why their feed carries "Wallet top-up"
// rows and ours never will. The ticket says "topbar wallet"; the product says
// "your money".
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md §5
//
// Omar's morning glance: "did yesterday land?" One click from anywhere, which
// is what the ticket asks for ("reachable from the topbar wallet in two clicks
// or fewer"). Fresha does the same thing and it is the right shape for a
// glance — a drawer keeps him where he was instead of navigating him away.
//
// What it does NOT try to be is the account summary. It answers "how much, from
// whom, when" and hands off to the full screens, which open as full-screen
// takeovers with a Close — Fresha's shape, and the reason there is no routed
// "Money" section: a section nothing links to is a section nobody finds. The
// drawer is the one door to the money surfaces; Settings > Billing is the one
// door to the billing records.
//
// Deep links for /screens ride on query params, since there is no route of
// their own: `?money=summary|activity`, plus `?state=` and `?variant=`.
//
// The one thing Fresha's wallet gets wrong is baked out here: their drawer
// header and their account summary are two different figures both readable as
// "balance" (spec §2.1). This drawer shows the SAME `summarize()` output the
// summary page shows, per custodian, so the two surfaces cannot disagree.

import { ArrowUpRightIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type * as React from "react"
import { Suspense, useState } from "react"
import type { DateRange } from "@/components/blocks/date-range-popover"
import { MoneyActivityView } from "@/components/blocks/money/money-activity"
import { type MoneySummaryVariant, MoneySummaryView } from "@/components/blocks/money/money-summary"
import { PayoutDetailDialog } from "@/components/blocks/money/payout-detail-dialog"
import { RailBadge } from "@/components/blocks/money/rail-badge"
import { TransactionDetailDialog } from "@/components/blocks/money/transaction-detail-dialog"
import { FullScreenTakeover } from "@/components/blocks/sales-settings"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/format"
import { CamiPayProvider } from "@/lib/hq-camipay/store"
import { formatDayHeading, formatMoney, txKindLabel } from "@/lib/money/format"
import { groupByDay, paginateDays, summarizeByRail } from "@/lib/money/ledger"
import {
  defaultRange,
  nextPayoutDay,
  PAYOUT_SCHEDULE,
  periodBounds,
  TODAY_ISO,
} from "@/lib/money/mock"
import {
  isRailsId,
  isStateId,
  type RailsId,
  resolveScenario,
  type StateId,
} from "@/lib/money/scenarios"
import type { CamiPayRail, MoneyTx, Payout } from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

/** Days of feed in the drawer. Enough for "did yesterday land?", not a ledger. */
const DRAWER_DAYS = 3

// There is no state picker on these screens, on purpose.
//
// Every state is already a link: `/screens` lists one per state and the review
// message hands them out individually, which is how a developer or a reviewer
// reaches them. A dropdown would be a second mechanism for the same job, living
// inside the product UI, and it would have to be deleted when the settlement API
// lands. The query params below do the work and leave nothing to remove.
//
// `?money=summary|activity` · `?rails=` · `?state=` · `?variant=` · `?loading=1`

type Overlay = "summary" | "activity" | null

const OVERLAY_TABS: ReadonlyArray<{ id: Exclude<Overlay, null>; label: string }> = [
  { id: "summary", label: "Account summary" },
  { id: "activity", label: "Activity" },
]

const OVERLAY_COPY: Record<
  Exclude<Overlay, null>,
  { title: string; subtitle: string; aria: string }
> = {
  summary: {
    title: "Account summary",
    subtitle: "What you have taken, what Cami charged, and what has gone to your bank.",
    aria: "What is held for you, what Cami charged, and what has gone to your bank",
  },
  activity: {
    title: "Activity",
    subtitle: "Every card payment, fee and payout, newest first.",
    aria: "Every card payment, fee and payout, newest first",
  },
}

type Props = {
  trigger: React.ReactNode
  /** Overrides for the playground. Left unset, the wallet follows `?state=`. */
  txs?: ReadonlyArray<MoneyTx>
  payouts?: ReadonlyArray<Payout>
}

// useSearchParams() bails out of static prerendering unless it runs inside a
// Suspense boundary, and this drawer sits in the topbar of every AppShell page,
// so the boundary lives here rather than at the one call site. The fallback is
// the trigger itself, so the icon is in the prerendered HTML either way.
// Mirrors AppSettingsController's boundary in app-shell.tsx.
export function MoneyDrawer(props: Props) {
  return (
    <Suspense fallback={props.trigger}>
      <MoneyDrawerInner {...props} />
    </Suspense>
  )
}

function MoneyDrawerInner({ trigger, txs: txsProp, payouts: payoutsProp }: Props) {
  const params = useSearchParams()
  const router = useRouter()
  const stateParam = params.get("state")
  const railsParam = params.get("rails")
  const stateId: StateId = isStateId(stateParam) ? stateParam : "healthy"
  const railsId: RailsId = isRailsId(railsParam) ? railsParam : "both"
  const scenario = resolveScenario(stateId, railsId)

  // The scenario drives the wallet too, so a reviewer switching state on the
  // summary sees the same money in the drawer that opened it.
  const txs = txsProp ?? scenario.txs
  const payouts = payoutsProp ?? scenario.payouts

  // `?money=drawer` opens the sheet itself, so the entry point is a link like
  // everything else. Without it the only thing /screens could offer was a route
  // with the icon sitting in its topbar, unopened — a link that demonstrated
  // nothing.
  const money = params.get("money")
  const [open, setOpen] = useState(money === "drawer")
  const [overlay, setOverlay] = useState<Overlay>(
    money === "summary" || money === "activity" ? money : null,
  )
  const [range, setRange] = useState<DateRange>(() => defaultRange())
  const variant: MoneySummaryVariant = params.get("variant") === "blended" ? "blended" : "two-rail"

  const [openTx, setOpenTx] = useState<MoneyTx | null>(null)
  const [openPayout, setOpenPayout] = useState<Payout | null>(null)

  // Switching view rewrites `?money=`, because on these screens the link IS the
  // mechanism: /screens and the review message hand out URLs, and a URL that
  // says `summary` while Activity is on screen sends the reader somewhere else.
  function go(next: Overlay) {
    setOverlay(next)
    const params2 = new URLSearchParams(params.toString())
    if (next) params2.set("money", next)
    else params2.delete("money")
    router.replace(`?${params2.toString()}`, { scroll: false })
  }

  function show(next: Overlay) {
    setOpen(false)
    go(next)
  }

  const bounds = periodBounds("month-to-date")
  const byRail = summarizeByRail(txs, bounds)
  const { groups } = paginateDays(groupByDay(txs), DRAWER_DAYS)

  const rails = (["online", "terminal"] as const).filter(
    (r) => txs.some((t) => t.rail === r) || payouts.some((p) => p.rail === r),
  )

  const drawer = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[420px]">
        {/* SheetTitle defaults to body weight, which is why this read as a
            paragraph rather than a heading. */}
        <SheetHeader className="gap-2">
          <SheetTitle className="font-heading text-xl font-semibold leading-7">
            Your money
          </SheetTitle>
          <SheetDescription className="text-sm leading-5">
            What is held for you right now, and what has moved in the last few days.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
          {rails.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Card payments taken through Cami will show up here.
            </p>
          ) : (
            <>
              {/* One card per custodian. Never one blended figure with two
                  senders hiding behind it — that is the two-balance defect
                  arriving from the other direction (G2, G3). */}
              <div className="flex flex-col gap-2">
                {rails.map((rail) => (
                  <HeldRow key={rail} rail={rail} heldMinor={byRail[rail].heldMinor} />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-foreground">Recent activity</h3>
                  <Button variant="ghost" radius="full" size="sm" onClick={() => show("activity")}>
                    See all
                    <ArrowUpRightIcon className="size-3.5" />
                  </Button>
                </div>

                {groups.map((group) => (
                  <div key={group.dayIso} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3 pt-1">
                      <span className="text-xs font-medium text-foreground">
                        {formatDayHeading(group.dayIso, TODAY_ISO)}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatMoney(group.subtotalMinor)} net
                      </span>
                    </div>
                    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
                      {group.txs.slice(0, 6).map((tx, i) => (
                        <button
                          type="button"
                          key={tx.id}
                          onClick={() =>
                            tx.kind === "payout"
                              ? setOpenPayout(payouts.find((p) => p.id === tx.payoutId) ?? null)
                              : setOpenTx(tx)
                          }
                          className={cn(
                            "flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/30",
                            i > 0 && "border-t border-border/60",
                          )}
                        >
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm text-foreground">
                              {txKindLabel(tx.kind)}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {tx.client ?? tx.reference?.label ?? tx.locationName}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-sm tabular-nums",
                              tx.amountMinor < 0 ? "text-foreground" : "text-cami-green-11",
                            )}
                          >
                            {formatMoney(tx.amountMinor)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pinned, not the last thing after the feed. The drawer is a glance and
            this is its one hand-off — putting it below however many days of
            activity happen to be loaded makes reaching it a scroll, and on a
            busy month a long one. */}
        {rails.length > 0 ? (
          <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-6 py-4">
            <Button radius="full" onClick={() => show("summary")}>
              Open account summary
            </Button>
            <p className="text-xs text-muted-foreground">
              The full reconciliation, VAT figures and the export for your accountant.
            </p>
          </div>
        ) : null}
      </SheetContent>

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
    </Sheet>
  )

  return (
    <>
      {drawer}

      {/* Full-screen with a Close, like the benchmark. Deliberately not routed
          pages: a "Money" section in the sidebar was an orphan nothing linked
          to, and these are read-and-close surfaces, not places you navigate to
          and stay.

          The two views switch in place. Dropping the old tab row along with the
          routes left the summary with no way to reach the activity behind it
          except closing and reopening the drawer — the navigation was the
          routes' only real job, and it had to survive them. */}
      {overlay !== null ? (
        <FullScreenTakeover
          contentClassName="max-w-3xl"
          title={OVERLAY_COPY[overlay].title}
          ariaDescription={OVERLAY_COPY[overlay].aria}
          subtitle={OVERLAY_COPY[overlay].subtitle}
          onClose={() => go(null)}
          actions={
            <Button
              type="button"
              variant="outline"
              size="lg"
              radius="full"
              onClick={() => go(null)}
            >
              Close
            </Button>
          }
        >
          <div className="flex flex-col gap-6">
            <nav aria-label="Money" className="flex items-center gap-1">
              {OVERLAY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => go(tab.id)}
                  aria-current={overlay === tab.id ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    overlay === tab.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {overlay === "summary" ? (
              // The rate card store is mounted in the HQ layout, not here. The
              // summary states the merchant's rate, so without this it would
              // read the built-in default while the fees screen reads what HQ
              // actually set — the same drift one screen over.
              <CamiPayProvider>
                <MoneySummaryView
                  txs={txs}
                  payouts={payouts}
                  rails={scenario.rails}
                  range={range}
                  onRangeChange={setRange}
                  variant={variant}
                  block={scenario.block}
                />
              </CamiPayProvider>
            ) : (
              <MoneyActivityView
                txs={txs}
                payouts={payouts}
                rails={scenario.rails}
                loading={params.get("loading") === "1"}
              />
            )}
          </div>
        </FullScreenTakeover>
      ) : null}
    </>
  )
}

function HeldRow({ rail, heldMinor }: { rail: CamiPayRail; heldMinor: number }) {
  const who = custodianLabel(custodianOf(rail))
  const arriving = nextPayoutDay(rail)

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        {/* Named, scoped, and attributed to a sender. Never a bare "Balance" (G1). */}
        <span className="text-sm font-medium text-foreground">Held by {who}</span>
        <RailBadge rail={rail} />
      </div>
      <span className="font-heading text-2xl font-semibold leading-none text-foreground">
        {formatMoney(heldMinor)}
      </span>
      <span className="text-xs text-muted-foreground">
        Arriving {formatDate(`${arriving}T00:00:00Z`)} · {PAYOUT_SCHEDULE[rail].label}
      </span>
    </div>
  )
}
