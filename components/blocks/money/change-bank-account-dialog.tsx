"use client"

// Changing where the money goes — DSG-75 T2-4, T2-5, T2-6.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// Deliberately a multi-step confirm and not an inline edit. Friction is the
// feature here (`JOB-OWN-PAY3`): this is the one control in the product that can
// redirect every dirham the business takes, and it is used perhaps twice in a
// company's life. Making it fast would be optimising the wrong number.
//
// The steps do different jobs:
//
//   1. Consequences — what changing this does, BEFORE any typing. Chiefly that
//      payouts pause until the new account is verified, and that they will not
//      quietly fall back to the old account (SET-B4).
//   2. Details — the new account.
//   3. Review — the old and new side by side, because "•••• 1001 → •••• 8842"
//      is the only part anyone actually checks.
//   4. Result — applied to both systems, or applied to neither (SET-B3).
//
// The failure screen is the reason this component exists. It has to say which
// system refused, and that nothing changed, in words a merchant can act on.

import { AlertTriangleIcon, ArrowLeftIcon, CheckIcon, InfoIcon, XIcon } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type CommitResult,
  commitDestination,
  type DraftDestination,
  type PayoutDestination,
} from "@/lib/money/bank-account"
import { formatMoney } from "@/lib/money/format"
import { PAYOUT_MINIMUM_MINOR } from "@/lib/money/mock"
import { cn } from "@/lib/utils"

type Step = "consequences" | "details" | "review" | "result"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: PayoutDestination | null
  actor: string
  nowIso: string
  /** Drives the demo to the both-or-neither failure (QA SET-X1). */
  simulateGatewayFailure?: boolean
  onApplied: (destination: PayoutDestination, draft: DraftDestination) => void
  onFailed: (draft: DraftDestination, result: Extract<CommitResult, { ok: false }>) => void
}

export function ChangeBankAccountDialog({
  open,
  onOpenChange,
  current,
  actor,
  nowIso,
  simulateGatewayFailure,
  onApplied,
  onFailed,
}: Props) {
  const holderId = useId()
  const bankId = useId()
  const ibanId = useId()

  const [step, setStep] = useState<Step>("consequences")
  const [draft, setDraft] = useState<DraftDestination>({ holderName: "", bankName: "", iban: "" })
  const [result, setResult] = useState<CommitResult | null>(null)

  function reset() {
    setStep("consequences")
    setDraft({ holderName: "", bankName: "", iban: "" })
    setResult(null)
  }

  function close() {
    onOpenChange(false)
    // Leave the dialog on its opening step for next time. A half-typed account
    // number surviving a close is not a draft worth keeping.
    setTimeout(reset, 200)
  }

  const ibanDigits = draft.iban.replace(/\s+/g, "")
  const detailsComplete =
    draft.holderName.trim().length > 2 && draft.bankName.trim().length > 2 && ibanDigits.length >= 8

  function commit() {
    const outcome = commitDestination(current, draft, { actor, nowIso, simulateGatewayFailure })
    setResult(outcome)
    setStep("result")
    if (outcome.ok) onApplied(outcome.destination, draft)
    else onFailed(draft, outcome)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent
        className="!max-w-[560px] flex max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[560px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Change the bank account your payouts are sent to
        </DialogDescription>

        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-7 pt-7 pb-5">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading text-xl leading-7 font-semibold">
              {step === "result" && result?.ok === false
                ? "Nothing was changed"
                : step === "result"
                  ? "New account added"
                  : "Change your payout account"}
            </DialogTitle>
            {step !== "result" ? (
              <span className="text-sm text-muted-foreground">
                Step {step === "consequences" ? 1 : step === "details" ? 2 : 3} of 3
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={close}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-7 py-6">
          {step === "consequences" ? (
            <>
              <p className="text-sm text-foreground">
                Every payout from Cami and from NeoPay goes to the account you set here. Before you
                change it:
              </p>
              <ul className="flex flex-col gap-3">
                <Consequence>
                  <strong className="font-medium text-foreground">Payouts pause</strong> until the
                  new account is verified. They do not go to your current account in the meantime —
                  the money waits.
                </Consequence>
                <Consequence>
                  Your money is <strong className="font-medium text-foreground">not lost</strong>{" "}
                  while payouts are paused. It keeps building up and goes out on the first run after
                  verification.
                </Consequence>
                <Consequence>
                  The account holder name must match your registered business name, or verification
                  fails.
                </Consequence>
                <Consequence>
                  This change is recorded — who made it, when, and which account it moved from and
                  to.
                </Consequence>
              </ul>
            </>
          ) : null}

          {step === "details" ? (
            <div className="flex max-w-md flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={holderId}>Account holder name</Label>
                <Input
                  id={holderId}
                  value={draft.holderName}
                  placeholder="As registered with your bank"
                  onChange={(e) => setDraft((d) => ({ ...d, holderName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={bankId}>Bank</Label>
                <Input
                  id={bankId}
                  value={draft.bankName}
                  placeholder="Emirates NBD"
                  onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={ibanId}>IBAN</Label>
                <Input
                  id={ibanId}
                  value={draft.iban}
                  placeholder="AE00 0000 0000 0000 0000 000"
                  onChange={(e) => setDraft((d) => ({ ...d, iban: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Only the last 4 digits are shown anywhere in Cami after this.
                </p>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="flex flex-col gap-4">
              {/* The only part anyone actually checks. */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs text-muted-foreground">Now</span>
                  <span className="truncate text-sm text-foreground">
                    {current ? `${current.bankName} •••• ${current.last4}` : "No account set"}
                  </span>
                </div>
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs text-muted-foreground">After this change</span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {draft.bankName} •••• {ibanDigits.slice(-4)}
                  </span>
                </div>
              </div>

              <dl className="flex flex-col text-sm">
                <ReviewRow term="Account holder" value={draft.holderName} />
                <ReviewRow term="Bank" value={draft.bankName} />
                <ReviewRow term="Receives" value="Payouts from Cami and from NeoPay" />
                <ReviewRow term="Minimum payout" value={formatMoney(PAYOUT_MINIMUM_MINOR)} />
              </dl>

              <Notice tone="warning">
                Payouts stay paused until this account is verified, and will not be sent to your
                previous account in the meantime.
              </Notice>
            </div>
          ) : null}

          {step === "result" && result ? (
            result.ok ? (
              <div className="flex flex-col gap-4">
                <Notice tone="info">
                  {draft.bankName} •••• {ibanDigits.slice(-4)} was saved with Cami and with NeoPay.
                </Notice>
                <p className="text-sm text-foreground">
                  It needs to be verified before any money is sent to it. Payouts are paused until
                  then and your money keeps building up — nothing goes to your old account.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* The whole reason this flow is not an inline edit. */}
                <Notice tone="warning">{result.message}</Notice>
                <p className="text-sm text-foreground">
                  Your payout account is still{" "}
                  {current ? `${current.bankName} •••• ${current.last4}` : "unchanged"}, and payouts
                  are running normally.
                </p>
                <p className="text-sm text-muted-foreground">
                  The usual cause is an account holder name that does not match the bank's record.
                  Check the name and try again, or contact your account manager.
                </p>
              </div>
            )
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-7 py-4">
          {step === "details" || step === "review" ? (
            <Button
              type="button"
              variant="ghost"
              radius="full"
              size="sm"
              onClick={() => setStep(step === "review" ? "details" : "consequences")}
            >
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step === "consequences" ? (
            <Button type="button" radius="full" onClick={() => setStep("details")}>
              Continue
            </Button>
          ) : null}
          {step === "details" ? (
            <Button
              type="button"
              radius="full"
              disabled={!detailsComplete}
              onClick={() => setStep("review")}
            >
              Review the change
            </Button>
          ) : null}
          {step === "review" ? (
            // Names the act, not "Save". Nobody misreads this one.
            <Button type="button" radius="full" onClick={commit}>
              Send my payouts here
            </Button>
          ) : null}
          {step === "result" ? (
            <Button type="button" radius="full" onClick={close}>
              {result?.ok ? "Done" : "Close"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Consequence({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm text-muted-foreground">
      <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
      <span>{children}</span>
    </li>
  )
}

function Notice({ tone, children }: { tone: "warning" | "info"; children: React.ReactNode }) {
  const Icon = tone === "warning" ? AlertTriangleIcon : InfoIcon
  return (
    <div
      className={cn(
        "flex gap-2 rounded-xl p-3",
        tone === "warning" ? "bg-cami-yellow-2" : "bg-cami-sage-2",
      )}
    >
      <Icon
        className={cn(
          "mt-px size-4 shrink-0",
          tone === "warning" ? "text-cami-yellow-11" : "text-cami-sage-12",
        )}
        strokeWidth={1.5}
      />
      <p className="text-sm text-foreground">{children}</p>
    </div>
  )
}

function ReviewRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-right text-foreground">{value}</dd>
    </div>
  )
}
