"use client"

// Invoices and fees — DSG-76.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The merchant can see, verify and expense what Cami charged, without
// reconstructing it from a bank statement.
//
// The benchmark shape works and is adopted: period headings, newest first, two
// documents per period, and a pending state for the month still running
// ([`fresha-invoices-and-fees.png`]). What changes is the content —
//
//   - No subscription. Fresha's fee statement is 58% plan charges; Cami's OS is
//     free (INV-P4), so this screen carries processing margin and usage only.
//   - The rate is ON the screen (T3-5). Theirs is discoverable only from a
//     statement, or from a Payment methods page three clicks away.
//   - Every fee traces to the sale that caused it, with the working shown
//     (T3-4). A fee whose cause is invisible reads as skimming.
//   - The rate rendered is the one snapshotted at capture, never today's
//     (T3-6) — a filed statement must not restate itself after a renegotiation.
//
// D1 is open, so both terminal outcomes are built behind `terminalModel`.

import {
  ChevronRightIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  InfoIcon,
  ReceiptTextIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/blocks/empty-state"
import { InvoiceDocumentView } from "@/components/blocks/invoice-document"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { addressToLines } from "@/lib/address"
import { formatDate, formatDateTime } from "@/lib/format"
import { formatRate } from "@/lib/hq-camipay/store"
import { DEMO_BILLING_DETAILS } from "@/lib/money/billing-details"
import { feeInvoiceOf } from "@/lib/money/fee-invoice"
import {
  explainFeeLine,
  type FeeLine,
  type FeePeriod,
  feePeriods,
  type TerminalFeeModel,
} from "@/lib/money/fees"
import { formatMoney } from "@/lib/money/format"
import { DEMO_RATES, TODAY_ISO } from "@/lib/money/mock"
import type { MerchantRails, MoneyTx } from "@/lib/money/types"
import { cn } from "@/lib/utils"

type Props = {
  txs: ReadonlyArray<MoneyTx>
  rails: MerchantRails
  /** Decision D1, still open. Both outcomes are drawn. */
  terminalModel: TerminalFeeModel
}

export function MoneyFeesView({ txs, rails, terminalModel }: Props) {
  const periods = useMemo(() => feePeriods(txs, TODAY_ISO), [txs])
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [invoicePeriod, setInvoicePeriod] = useState<FeePeriod | null>(null)

  const closed = periods.filter((p) => p.status === "available")

  return (
    <div className="flex w-full flex-col gap-6 pb-4 sm:w-fit sm:min-w-146 sm:max-w-146">
      <RateCard rails={rails} terminalModel={terminalModel} />

      {periods.length === 0 ? (
        <EmptyState
          variant="card"
          icon={ReceiptTextIcon}
          title="No fees yet"
          description="Once you take your first card payment, what Cami charged on it appears here — itemised down to the sale."
        />
      ) : (
        <section className="flex flex-col gap-5">
          {closed.length === 0 ? (
            // First period. The list is not empty, but there is nothing to
            // download yet, and saying so beats an empty list with a pending row.
            <p className="text-sm text-muted-foreground">
              This is your first period. Your first statement and tax invoice arrive once it closes.
            </p>
          ) : null}

          {periods.map((period) => (
            <PeriodBlock
              key={period.key}
              period={period}
              expanded={openKey === period.key}
              onToggle={() => setOpenKey(openKey === period.key ? null : period.key)}
              onOpenInvoice={setInvoicePeriod}
              terminalModel={terminalModel}
              rails={rails}
            />
          ))}
        </section>
      )}

      {/* The tax invoice was modelled and tested but had nowhere to appear —
          T3-2 asks for two documents a period and only one of them existed on
          screen. It renders through the DSG-72 document, not a second renderer:
          two things claiming to be tax invoices with different layouts is the
          §2.1 drift one level up. */}
      <FeeInvoiceDialog
        period={invoicePeriod}
        onOpenChange={(open) => {
          if (!open) setInvoicePeriod(null)
        }}
      />
    </div>
  )
}

/**
 * T3-5. The rate in force, stated in the product rather than buried in a
 * download. Reads the same rate card the CamiPay rates panel reads (PRO-737), so
 * a change made in HQ shows up in both places with no sync step.
 */
function RateCard({
  rails,
  terminalModel,
}: {
  rails: MerchantRails
  terminalModel: TerminalFeeModel
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          What Cami charges you
        </h2>
        <p className="text-sm text-muted-foreground">
          Your rate today. Statements below use the rate that was in force when each payment was
          taken, so a past statement never changes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rails.online ? (
          <RateRow label="Online payments" rate={formatRate(DEMO_RATES.online)} />
        ) : null}
        {rails.terminal ? (
          <RateRow label="Card machine payments" rate={formatRate(DEMO_RATES.terminal)} />
        ) : null}
      </div>

      {/* No subscription line, now or later. Said out loud because every
          competitor the merchant has used does charge one. */}
      <p className="text-xs text-muted-foreground">
        There is no subscription and no monthly platform fee — the software is free. Cami charges on
        payments, plus messaging you send.
      </p>

      {rails.terminal ? (
        <div className="flex gap-2 rounded-xl bg-cami-sage-2 p-3">
          <InfoIcon className="mt-px size-4 shrink-0 text-cami-sage-12" strokeWidth={1.5} />
          <p className="text-sm text-foreground">
            {terminalModel === "gateway-deducts"
              ? "Card machine fees are taken by NeoPay before your payout reaches you. They are listed below so you can see and expense them, but you are never billed for them separately."
              : "Card machine fees are not deducted from your payouts. Cami invoices you for them, and the invoice below is payable."}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function RateRow({ label, rate }: { label: string; rate: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{rate}</span>
    </div>
  )
}

function PeriodBlock({
  period,
  expanded,
  onToggle,
  onOpenInvoice,
  terminalModel,
  rails,
}: {
  period: FeePeriod
  expanded: boolean
  onToggle: () => void
  onOpenInvoice: (period: FeePeriod) => void
  terminalModel: TerminalFeeModel
  rails: MerchantRails
}) {
  const pending = period.status === "pending"
  const payable = terminalModel === "cami-invoices" && rails.terminal

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-base font-semibold text-foreground">{period.label}</h3>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatMoney(period.feeTotalMinor)}
          {pending ? " so far" : ""}
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
        {/* Two documents per period (T3-2): the itemised working, and the tax
            invoice that goes to the accountant. */}
        <DocumentRow
          icon={FileSpreadsheetIcon}
          onAction={() => toast(`Fee activity for ${period.label} downloaded`)}
          title="Fee activity"
          subtitle={
            pending
              ? `Still adding up. Available ${period.availableOnIso ? formatDate(`${period.availableOnIso}T00:00:00Z`) : "when the month closes"}`
              : `${period.lines.length} fees, each traced to the sale that caused it`
          }
          action={pending ? "pending" : "Download CSV"}
        />
        <DocumentRow
          icon={FileTextIcon}
          onAction={() => onOpenInvoice(period)}
          title={payable ? "Cami tax invoice · payable" : "Cami tax invoice"}
          subtitle={
            pending
              ? `Issued ${period.availableOnIso ? formatDate(`${period.availableOnIso}T00:00:00Z`) : "when the month closes"}`
              : `Includes ${formatMoney(period.vatMinor)} VAT you can reclaim`
          }
          action={pending ? "pending" : "Download PDF"}
          bordered
        />

        {!pending ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">
              {expanded ? "Hide the itemised fees" : "See every fee in this period"}
            </span>
            <ChevronRightIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        ) : null}

        {expanded ? <LineTable period={period} /> : null}
      </div>
    </div>
  )
}

function DocumentRow({
  icon: Icon,
  title,
  subtitle,
  action,
  bordered,
  onAction,
}: {
  icon: typeof FileTextIcon
  title: string
  subtitle: string
  action: string
  bordered?: boolean
  onAction: () => void
}) {
  const pending = action === "pending"

  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3", bordered && "border-t border-border/60")}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.5} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {pending ? (
        // Fresha's pending treatment, which works: the row exists, says when the
        // document arrives, and offers nothing to click.
        <Badge variant="warning" className="shrink-0">
          Pending
        </Badge>
      ) : (
        <Button variant="outline" radius="full" size="sm" className="shrink-0" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}

/** T3-4 + T3-6: the cause, and the rate that was in force at the time. */
function LineTable({ period }: { period: FeePeriod }) {
  return (
    <div className="flex flex-col border-t border-border/60">
      <div className="flex flex-col divide-y divide-border/60">
        {period.lines.slice(0, 12).map((line) => (
          <LineRow key={line.id} line={line} />
        ))}
      </div>

      {period.lines.length > 12 ? (
        <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          Showing 12 of {period.lines.length}. The full list is in the fee activity download — every
          line, with the same references.
        </p>
      ) : null}

      <div className="flex flex-col gap-1 border-t border-border bg-muted/50 px-4 py-3">
        <SummaryRow label="Processing fees" value={period.processingMinor} />
        {period.usageMinor > 0 ? (
          <SummaryRow label="Messaging and add-ons" value={period.usageMinor} />
        ) : null}
        <SummaryRow label="Total charged" value={period.feeTotalMinor} strong />
        {/* T3-8. The figure the merchant reclaims. */}
        <SummaryRow label="of which VAT" value={period.vatMinor} muted />
      </div>
    </div>
  )
}

function LineRow({ line }: { line: FeeLine }) {
  const working = explainFeeLine(line)

  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-foreground">
          {line.description}
          {line.reference ? ` · ${line.reference.label}` : ""}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {formatDateTime(line.at)}
          {line.baseAmountMinor > 0 ? ` · on ${formatMoney(line.baseAmountMinor)}` : ""}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-sm tabular-nums text-foreground">{formatMoney(line.feeMinor)}</span>
        {/* The rate as it stood at capture — not today's card. */}
        <span className="text-xs text-muted-foreground">{working ?? line.rateLabel}</span>
      </div>
    </div>
  )
}

function SummaryRow({
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
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
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

/**
 * Cami's own tax invoice for one period, in the DSG-72 document.
 *
 * The recipient is the merchant's billing details, which is the whole reason
 * DSG-74 exists: get the legal name or the TRN wrong there and this document is
 * wrong here.
 */
function FeeInvoiceDialog({
  period,
  onOpenChange,
}: {
  period: FeePeriod | null
  onOpenChange: (open: boolean) => void
}) {
  if (!period) return null

  const invoice = feeInvoiceOf(
    period,
    {
      legalName: DEMO_BILLING_DETAILS.legalName,
      addressLines: addressToLines(DEMO_BILLING_DETAILS.address),
      trn: DEMO_BILLING_DETAILS.trn,
    },
    {
      number: `CAMI-${period.key.replace("-", "")}`,
      issuedAtIso: `${period.availableOnIso ?? `${period.key}-28`}T09:00:00.000Z`,
    },
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[860px] flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0 sm:!max-w-[860px]">
        <DialogTitle className="sr-only">Cami tax invoice for {period.label}</DialogTitle>
        <DialogDescription className="sr-only">
          What Cami charged you in {period.label}, as a tax invoice
        </DialogDescription>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-6">
          <InvoiceDocumentView doc={invoice} responsive className="mx-auto" />
        </div>
        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button
            variant="outline"
            radius="full"
            onClick={() => toast(`Tax invoice for ${period.label} downloaded`)}
          >
            Download PDF
          </Button>
          <Button variant="ghost" radius="full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
