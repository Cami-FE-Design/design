"use client"

// Payout detail — DSG-78 T5-7, T5-8, T5-9.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The drill-in has one job: ARRIVE at the payout figure (SET-C4, SET-D4). It
// lists what the payout carried and sums it on screen, rather than restating the
// payout amount and asking the merchant to trust it. `payoutReconciles` is
// checked here rather than assumed — if the contents and the figure ever
// disagree, the screen says so. Picking one silently is how a money screen
// starts lying.
//
// Two states Fresha has no equivalent of, because they have no failed payout in
// any captured feed (spec §2.5):
//
//   - A payout that did not arrive keeps its row and its reason, permanently,
//     and the retry is a separate payout that carries the same money (INV-01).
//   - A refund against money this payout already carried appears here as a
//     footnote, NOT folded into the total. The payout really did send that
//     money; restating a completed transfer is a different defect.

import { AlertTriangleIcon, InfoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate, formatDateTime } from "@/lib/format"
import { formatMoney, payoutStatusLabel, txKindLabel } from "@/lib/money/format"
import { payoutContents, payoutReconciles } from "@/lib/money/ledger"
import type { MoneyTx, Payout } from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

type Props = {
  payout: Payout | null
  txs: ReadonlyArray<MoneyTx>
  payouts: ReadonlyArray<Payout>
  onOpenChange: (open: boolean) => void
  onOpenTx?: (tx: MoneyTx) => void
  onOpenPayout?: (payout: Payout) => void
}

export function PayoutDetailDialog({
  payout,
  txs,
  payouts,
  onOpenChange,
  onOpenTx,
  onOpenPayout,
}: Props) {
  if (!payout) return null

  const contents = payoutContents(txs, payout)
  const ties = payoutReconciles(contents)
  const who = custodianLabel(custodianOf(payout.rail))
  const retry = payouts.find((p) => p.retryOfPayoutId === payout.id)
  const original = payouts.find((p) => p.id === payout.retryOfPayoutId)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[560px] flex max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[560px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Payout of {formatMoney(payout.amountMinor)} from {who}
        </DialogDescription>

        <DialogHeader className="flex flex-col gap-3 bg-muted/40 px-7 pt-7 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-heading text-[28px] leading-8 font-semibold">
                {formatMoney(payout.amountMinor)}
              </DialogTitle>
              <span className="text-sm text-muted-foreground">
                Payout from {who} · sent {formatDate(payout.sentAt)}
              </span>
            </div>
            <Badge
              variant={
                payout.status === "failed"
                  ? "destructive"
                  : payout.status === "paid"
                    ? "secondary"
                    : "outline"
              }
            >
              {payoutStatusLabel(payout.status)}
            </Badge>
          </div>

          {payout.status === "failed" && payout.failureReason ? (
            <div className="flex gap-2 rounded-xl bg-cami-yellow-2 p-3">
              <AlertTriangleIcon
                className="mt-px size-4 shrink-0 text-cami-yellow-11"
                strokeWidth={1.5}
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">{payout.failureReason}.</p>
                <p className="text-sm text-muted-foreground">
                  The money came back to {who} and stayed yours.
                  {retry ? " It was sent again — see below." : ""}
                </p>
              </div>
            </div>
          ) : null}

          {payout.status === "held-below-minimum" ? (
            <div className="flex gap-2 rounded-xl bg-cami-sage-2 p-3">
              <InfoIcon className="mt-px size-4 shrink-0 text-cami-sage-12" strokeWidth={1.5} />
              <p className="text-sm text-foreground">
                Nothing was sent on this run — the balance was under your minimum, so it rolled
                forward to the next one.
              </p>
            </div>
          ) : null}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-6">
          <dl className="flex flex-col text-sm">
            <Field term="Sent by" value={who} />
            <Field term="Sent" value={formatDateTime(payout.sentAt)} />
            <Field
              term="Arriving"
              value={
                payout.arrivesAt
                  ? formatDate(payout.arrivesAt)
                  : // Nothing left, so nothing may claim an arrival date.
                    "Not arriving"
              }
            />
            <Field term="To" value={`Your bank •••• ${payout.destinationLast4}`} />
          </dl>

          {contents.txs.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">
                What was in it
                {payout.carriesPayoutId ? " (the same money the returned payout carried)" : ""}
              </h3>
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
                {contents.txs.map((tx, i) => (
                  <button
                    type="button"
                    key={tx.id}
                    onClick={() => onOpenTx?.(tx)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/30",
                      i > 0 && "border-t border-border/60",
                    )}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-foreground">
                        {txKindLabel(tx.kind)}
                        {tx.client ? ` · ${tx.client}` : ""}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatDate(tx.at)}
                        {tx.reference ? ` · ${tx.reference.label}` : ""}
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

                {/* The arithmetic, on screen. This is the requirement. */}
                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {contents.txs.length} transaction{contents.txs.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-heading text-base font-semibold tabular-nums text-foreground">
                    {formatMoney(contents.contentsTotalMinor)}
                  </span>
                </div>
              </div>

              {!ties ? (
                // Never silently pick one of the two figures.
                <div className="flex gap-2 rounded-xl bg-cami-yellow-2 p-3">
                  <AlertTriangleIcon
                    className="mt-px size-4 shrink-0 text-cami-yellow-11"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-foreground">
                    These transactions add up to {formatMoney(contents.contentsTotalMinor)}, which
                    does not match the payout amount. We are looking into it — nothing here has been
                    adjusted.
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {contents.laterRefunds.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">Refunded after this payout</h3>
              <p className="text-sm text-muted-foreground">
                This payout sent the full amount above. These refunds came later and went out
                against a different payout, so nothing here changes what arrived.
              </p>
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
                {contents.laterRefunds.map((tx, i) => (
                  <button
                    type="button"
                    key={tx.id}
                    onClick={() => onOpenTx?.(tx)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/30",
                      i > 0 && "border-t border-border/60",
                    )}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-foreground">
                        Refund{tx.client ? ` · ${tx.client}` : ""}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatDate(tx.at)}
                        {tx.reference ? ` · ${tx.reference.label}` : ""}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-foreground">
                      {formatMoney(tx.amountMinor)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {retry ? (
            <LinkedPayout label="Sent again as" payout={retry} onOpenPayout={onOpenPayout} />
          ) : null}
          {original ? (
            <LinkedPayout
              label="This replaced a payout that did not arrive"
              payout={original}
              onOpenPayout={onOpenPayout}
            />
          ) : null}

          <div className="flex justify-end pt-1">
            <DialogClose asChild>
              <Button variant="ghost" radius="full" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LinkedPayout({
  label,
  payout,
  onOpenPayout,
}: {
  label: string
  payout: Payout
  onOpenPayout?: (payout: Payout) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenPayout?.(payout)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {formatMoney(payout.amountMinor)} · {formatDate(payout.sentAt)} ·{" "}
          {payoutStatusLabel(payout.status)}
        </span>
      </div>
    </button>
  )
}

function Field({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-right text-foreground">{value}</dd>
    </div>
  )
}
