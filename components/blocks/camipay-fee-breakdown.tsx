"use client"

// What Cami charged the Partner on one CamiPay payment, shown on the Partner's
// own sale detail (PRO-737).
// Spec: docs/specs/PRO-737-camipay-fee-visibility.md
//
// Three rules this component exists to hold:
//
// 1. Sale amount, then fee, then net. GNK's sequence. The Partner reads down to
//    the number that reaches their account.
// 2. The calculation is legible. `3% of AED 120.00 + AED 0.75` sits under the
//    fee, so the amount is never a figure the Partner has to trust.
// 3. The gateway's processing fee is NOT here, and never will be. Maaz: the
//    Partner sees Cami's fee only. NeoPay's and Tap's economics are Cami's
//    side of the deal, and surfacing them would invite a negotiation about a
//    cost the Partner does not pay.
//
// The rate comes in as a snapshot taken at capture, not from the live rate
// card. A rate change must never restate a past sale (INV-01).

import { InfoIcon } from "lucide-react"
import {
  type CamiPayRail,
  type CamiPayRate,
  computeFee,
  explainFee,
  formatAed,
  isZeroRate,
  railLabel,
} from "@/lib/hq-camipay/store"

export type CamiPayFeeBreakdownProps = {
  rail: CamiPayRail
  /** The rate snapshotted onto this payment when it was captured. */
  rate: CamiPayRate
  /** What the client paid, in fils. Absolute value; refunds pass the magnitude. */
  amountMinor: number
  /** Rendered in the footnote so the Partner can see which day's rate applied. */
  capturedOnLabel: string
}

function Row({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string
  value: string
  hint?: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={emphasis ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
        {hint ? <span className="text-xs text-muted-foreground tabular-nums">{hint}</span> : null}
      </div>
      <span
        className={
          emphasis
            ? "shrink-0 font-semibold text-foreground tabular-nums"
            : "shrink-0 text-foreground tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  )
}

export function CamiPayFeeBreakdown({
  rail,
  rate,
  amountMinor,
  capturedOnLabel,
}: CamiPayFeeBreakdownProps) {
  const fee = computeFee(rate, amountMinor)

  // A Partner on no rate keeps the whole amount. Saying so beats a fee line
  // reading AED 0.00, which looks like a rounding artefact rather than a term.
  if (isZeroRate(rate)) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-4 text-muted-foreground">
        <InfoIcon className="mt-px size-3.5 shrink-0" />
        <span>
          No Cami fee applies to this {railLabel(rail)} payment. The full{" "}
          {formatAed(Math.abs(amountMinor))} settles to you.
        </span>
      </p>
    )
  }

  // No rail heading: the payment line directly above already carries the
  // CamiPay Terminal / Online pill, and repeating it reads as a second payment
  // rather than a breakdown of the first.
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5">
        <Row label="Sale amount" value={formatAed(Math.abs(amountMinor))} />
        <Row
          label="Cami fee"
          hint={explainFee(rate, amountMinor)}
          value={`- ${formatAed(fee.totalMinor)}`}
        />
      </div>

      <div className="h-px bg-border/60" />

      <Row label="Net to you" value={formatAed(fee.netMinor)} emphasis />

      <p className="mt-1 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-4 text-muted-foreground">
        <InfoIcon className="mt-px size-3.5 shrink-0" />
        <span>
          Charged at your rate on {capturedOnLabel}, and locked to it. This is everything Cami
          charges on this payment.
        </span>
      </p>
    </div>
  )
}
