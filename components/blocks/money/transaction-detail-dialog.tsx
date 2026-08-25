"use client"

// Transaction detail — DSG-78 T5-4, T5-5.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// Fresha's detail modal has the right field set (spec §2.4) and we adopt it:
// date, appointment reference (linked), channel, location, payment method,
// billing period, from, to. Two things are ours:
//
//   - A rail + custodian row. Their From/To works because they have one wallet;
//     with two custodians "To: Cami" and "To: NeoPay" are different facts, and
//     neither may be inferred from context (G3).
//   - The related rows. A fee and the payment that caused it are one event to
//     the merchant, so the panel shows the pair rather than making them find
//     the sibling row in the feed (T5-3).

import { ArrowUpRightIcon, ExternalLinkIcon, InfoIcon } from "lucide-react"
import { RailBadge } from "@/components/blocks/money/rail-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/format"
import {
  billingPeriodOf,
  channelLabel,
  confirmationNote,
  formatMoney,
  fromToOf,
  payoutStatusLabel,
  txKindLabel,
} from "@/lib/money/format"
import { relatedTxs } from "@/lib/money/ledger"
import { BUSINESS_NAME, DESTINATION_LAST4 } from "@/lib/money/mock"
import type { MoneyTx, Payout } from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

type Props = {
  tx: MoneyTx | null
  txs: ReadonlyArray<MoneyTx>
  payouts: ReadonlyArray<Payout>
  onOpenChange: (open: boolean) => void
  /** Opens the payout this money went out with, when it has gone out. */
  onOpenPayout?: (payout: Payout) => void
}

export function TransactionDetailDialog({ tx, txs, payouts, onOpenChange, onOpenPayout }: Props) {
  if (!tx) return null

  const custodian = custodianOf(tx.rail)
  const { from, to } = fromToOf(tx, BUSINESS_NAME, DESTINATION_LAST4)
  const related = relatedTxs(txs, tx)
  const payout = payouts.find((p) => p.id === tx.payoutId)
  const reversed = payouts.find((p) => p.id === tx.reversesPayoutId)
  const note = confirmationNote(tx)
  const isOut = tx.amountMinor < 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[520px] flex max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[520px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          {txKindLabel(tx.kind)} of {formatMoney(tx.amountMinor)}
        </DialogDescription>

        <DialogHeader className="flex flex-col gap-3 bg-muted/40 px-7 pt-7 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {/* The amount carries its own direction. A merchant should not have
                  to read a minus sign to know which way money went (T5-2). */}
              <DialogTitle
                className={cn(
                  "font-heading text-[28px] leading-8 font-semibold",
                  isOut ? "text-foreground" : "text-cami-green-11",
                )}
              >
                {formatMoney(tx.amountMinor)}
              </DialogTitle>
              <span className="text-sm text-muted-foreground">
                {txKindLabel(tx.kind)} · {isOut ? "Out" : "In"}
              </span>
            </div>
            {/* The rail, not the custodian — the Custody block below already
                says "Held by Cami" in words, and a grey chip repeating it read
                as a switched-off status. Same chip the held cards carry, so a
                merchant learns one mark for one fact (G3). */}
            <RailBadge rail={tx.rail} />
          </div>

          {tx.note ? <p className="text-sm text-foreground">{tx.note}</p> : null}

          {note ? (
            <div className="flex gap-2 rounded-xl bg-cami-yellow-2 p-3">
              <InfoIcon className="mt-px size-4 shrink-0 text-cami-yellow-11" strokeWidth={1.5} />
              <p className="text-sm text-foreground">{note}</p>
            </div>
          ) : null}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-6">
          <dl className="flex flex-col">
            <Field term="Date" value={formatDateTime(tx.at)} />
            {tx.reference ? (
              <Field
                term="Reference"
                value={tx.reference.label}
                // Keep the link. It is the difference between a statement and a
                // record you can check (T5-4).
                href={tx.reference.href ?? "/sales/sales-list"}
              />
            ) : null}
            {tx.client ? <Field term="Client" value={tx.client} /> : null}
            <Field term="Channel" value={channelLabel(tx.rail)} />
            <Field term="Location" value={tx.locationName} />
            {tx.method ? <Field term="Payment method" value={tx.method} /> : null}
            <Field term="Billing period" value={billingPeriodOf(tx.at)} />
          </dl>

          {/* T5-5. Who held it and who pays it out — stated, never implied. */}
          <section className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-medium text-foreground">Custody</h3>
            <dl className="flex flex-col">
              <Field term="From" value={from} />
              <Field term="To" value={to} />
              <Field
                term="Held by"
                value={`${custodianLabel(custodian)} — ${
                  custodian === "cami"
                    ? "Cami pays this to your bank"
                    : "NeoPay pays this to your bank"
                }`}
              />
            </dl>
          </section>

          {payout ? (
            <button
              type="button"
              onClick={() => onOpenPayout?.(payout)}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">
                  Paid out with {formatMoney(payout.amountMinor)} from{" "}
                  {custodianLabel(custodianOf(payout.rail))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {payoutStatusLabel(payout.status)} · see everything in that payout
                </span>
              </div>
              <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : tx.kind !== "payout" ? (
            <p className="text-sm text-muted-foreground">
              Not paid out yet — this is still part of what {custodianLabel(custodian)} is holding
              for you.
            </p>
          ) : null}

          {reversed ? (
            <p className="text-sm text-muted-foreground">
              This reversed a payout of {formatMoney(reversed.amountMinor)} that did not arrive.
              {reversed.failureReason ? ` ${reversed.failureReason}.` : ""}
            </p>
          ) : null}

          {related.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">Part of the same payment</h3>
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
                {related.map((r, i) => (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-2.5",
                      i > 0 && "border-t border-border/60",
                    )}
                  >
                    <span className="text-sm text-foreground">{txKindLabel(r.kind)}</span>
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        r.amountMinor < 0 ? "text-foreground" : "text-cami-green-11",
                      )}
                    >
                      {formatMoney(r.amountMinor)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            {tx.reference ? (
              <Button variant="outline" radius="full" size="sm">
                <ExternalLinkIcon className="size-3.5" />
                Open {tx.reference.label}
              </Button>
            ) : null}
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

function Field({ term, value, href }: { term: string; value: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-right text-foreground">
        {href ? (
          <a href={href} className="text-primary underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
