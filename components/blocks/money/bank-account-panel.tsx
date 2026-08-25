"use client"

// Bank account (payout destination) — DSG-75.
// Settings › Payments › Bank account.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The merchant's money goes where they said, and nobody else can quietly
// redirect it. Three things this screen has to carry that Fresha's equivalent
// does not (spec §1, `fresha-bank-account.png` — theirs is a masked account, an
// Edit button, and nothing else):
//
//   - A VERIFICATION STATE. An account can be on file and not yet usable.
//   - TWO SENDERS, ONE ACCOUNT. Cami and NeoPay both pay into it on different
//     schedules, and only Cami's is Cami's to change (SET-B6, SET-B7).
//   - A PERMANENT CHANGE LOG, failed attempts included (SET-B5, INV-08).
//
// Changing the account is a takeover flow, never an inline edit — see
// change-bank-account-dialog.tsx for why.

import {
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  LandmarkIcon,
  LockIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { useState } from "react"
import { ChangeBankAccountDialog } from "@/components/blocks/money/change-bank-account-dialog"
import {
  CADENCE_LABEL,
  type CamiPayoutCadence,
  PayoutScheduleDialog,
} from "@/components/blocks/money/payout-schedule-dialog"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import type { BreadcrumbRoot } from "@/components/blocks/sales-settings"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/format"
import {
  DEMO_CHANGE_HISTORY,
  DEMO_DESTINATION,
  type DestinationChange,
  type PayoutDestination,
  payoutsPaused,
  type VerificationState,
} from "@/lib/money/bank-account"
import { formatMoney } from "@/lib/money/format"
import { PAYOUT_MINIMUM_MINOR, PAYOUT_SCHEDULE, TODAY_ISO } from "@/lib/money/mock"
import type { CamiPayRail, MerchantRails } from "@/lib/money/types"
import { custodianLabel, custodianOf } from "@/lib/money/types"
import { cn } from "@/lib/utils"

/** Review states, reachable from /screens by `?bd=`. */
export type BankAccountDemoState =
  | "verified"
  | "unverified"
  | "pending"
  | "gateway-failed"
  | "read-only"
  | "terminal-only"
  | "online-only"

const VERIFICATION: Record<
  VerificationState,
  { label: string; variant: "success" | "warning" | "muted"; icon: typeof BadgeCheckIcon }
> = {
  verified: { label: "Verified", variant: "success", icon: BadgeCheckIcon },
  unverified: { label: "Not verified yet", variant: "warning", icon: ShieldAlertIcon },
  pending: { label: "Verification in progress", variant: "muted", icon: ClockIcon },
}

const ACTOR = "Omar Haddad"

/** Fixed clock, like the rest of the money demo data. */
const CHANGED_AT = `${TODAY_ISO}T09:00:00.000Z`

export function BankAccountPanel({
  onBack,
  breadcrumbRoot,
  initialState = null,
}: {
  onBack: () => void
  breadcrumbRoot: BreadcrumbRoot
  initialState?: BankAccountDemoState | null
}) {
  const demoState = initialState ?? "verified"

  const rails: MerchantRails = {
    online: demoState !== "terminal-only",
    terminal: demoState !== "online-only",
  }
  const activeRails = (["online", "terminal"] as const).filter((r) => rails[r])

  // Whether this role may change the destination. Gated by its own permission,
  // separate from rails and rates (SET-B9, INV-A1) — someone who can read the
  // rate card is not thereby allowed to move the money.
  const canChange = demoState !== "read-only"

  const [destination, setDestination] = useState<PayoutDestination>({
    ...DEMO_DESTINATION,
    verification:
      demoState === "unverified" ? "unverified" : demoState === "pending" ? "pending" : "verified",
    receives: activeRails,
  })
  const [history, setHistory] = useState<ReadonlyArray<DestinationChange>>(DEMO_CHANGE_HISTORY)
  // Only Cami's cadence is stored here. NeoPay's lives with NeoPay.
  const [cadence, setCadence] = useState<CamiPayoutCadence>("weekly")
  const [changeOpen, setChangeOpen] = useState(false)

  // Derived, not stored: the newest applied change whose result is the account
  // shown above. Storing a flag would let the log and the card disagree.
  const currentChangeId = history.find(
    (c) => c.outcome === "applied" && c.toLast4 === destination.last4,
  )?.id

  const paused = payoutsPaused(destination)
  const state = VERIFICATION[destination.verification]

  return (
    <SettingsPanel
      header={
        <>
          <NotionBreadcrumb
            segments={[
              { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
              { label: "Bank account" },
            ]}
          />
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              Bank account
            </h2>
            <p className="max-w-xl text-sm leading-5 text-muted-foreground">
              Where your payouts are sent. Both Cami and NeoPay pay into this one account, on their
              own schedules.
            </p>
          </header>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {paused ? (
          <div className="flex w-full gap-3 rounded-xl bg-cami-yellow-2 p-3 sm:w-fit sm:min-w-146 sm:max-w-146">
            <ShieldAlertIcon
              className="mt-0.5 size-4 shrink-0 text-cami-yellow-11"
              strokeWidth={1.5}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Payouts are paused</p>
              <p className="text-sm text-muted-foreground">
                {destination.verification === "pending"
                  ? "We are verifying this account. Payouts start again as soon as it is done, and your money keeps building up until then."
                  : "This account has not been verified yet. Your money keeps building up, and it will not be sent to any previous account."}
              </p>
              {/* What verification actually consists of is decision D3, still
                  open. The STATE is designed; this sentence is the placeholder,
                  and it is deliberately vague rather than wrong. */}
              <p className="text-xs text-muted-foreground">
                We will contact you if we need anything to complete it.
              </p>
            </div>
          </div>
        ) : null}

        {!canChange ? (
          <div className="flex w-full gap-3 rounded-xl bg-cami-sage-2 p-3 sm:w-fit sm:min-w-146 sm:max-w-146">
            <LockIcon className="mt-0.5 size-4 shrink-0 text-cami-sage-12" strokeWidth={1.5} />
            <p className="text-sm text-foreground">
              You can see where payouts go, but changing the account needs the payout-account
              permission. Ask an owner.
            </p>
          </div>
        ) : null}

        {/* ── Destination ─────────────────────────────────────────────────── */}
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
                Payout account
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                Only the last 4 digits are ever shown.
              </p>
            </div>
            {/* One Edit per card, and it opens a flow rather than a field. */}
            {canChange ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                radius="full"
                className="shrink-0"
                onClick={() => setChangeOpen(true)}
              >
                Change
              </Button>
            ) : null}
          </header>

          <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LandmarkIcon className="size-4" strokeWidth={1.5} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-foreground">
                {destination.holderName}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {destination.bankName} •••• {destination.last4}
              </span>
              <span className="text-xs text-muted-foreground">
                Added {formatDate(destination.addedAtIso)} by {destination.addedBy}
              </span>
            </div>
            <Badge variant={state.variant} className="shrink-0">
              <state.icon className="size-3" />
              {state.label}
            </Badge>
          </div>

          {/* SET-B1, SET-B2: two senders, one account, and the gateway holds its
              own copy of it. The merchant is told, because a second deposit from
              a name they do not recognise otherwise reads as a mistake. */}
          <hr className="border-border/60" />

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-foreground">
              {activeRails.length > 1 ? "Two senders pay into this account" : "Who pays into it"}
            </h4>
            {/* Sentences, not a two-column list. The pair only means something
                read together — "Cami sends your online payments here" — and a
                name in one column beside a category in another made the reader
                assemble that themselves. */}
            <ul className="flex flex-col gap-1.5">
              {activeRails.map((rail) => (
                <li key={rail} className="text-sm leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {custodianLabel(custodianOf(rail))}
                  </span>{" "}
                  sends your {rail === "online" ? "online payments" : "card machine payments"} here.
                </li>
              ))}
            </ul>
            {rails.terminal ? (
              <p className="text-xs text-muted-foreground">
                NeoPay keeps its own copy of these details. Cami updates both together — if either
                one refuses, nothing changes anywhere.
              </p>
            ) : null}
          </div>
        </section>

        {/* ── Schedules ───────────────────────────────────────────────────── */}
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <header className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Payout schedule
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              {activeRails.length > 1
                ? "Two senders, two schedules. You control Cami's; NeoPay sets its own."
                : "When your money is sent to the account above."}
            </p>
          </header>

          <div className="flex flex-col gap-3">
            {activeRails.map((rail) => (
              <ScheduleRow
                key={rail}
                rail={rail}
                canChange={canChange}
                cadence={cadence}
                onCadenceChange={setCadence}
              />
            ))}
          </div>

          <hr className="border-border/60" />

          {/* T2-10. The minimum, and — the part that actually gets asked about —
              what happens below it. */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Minimum payout</span>
              <span className="text-sm text-muted-foreground">
                Below this, nothing is sent and the balance rolls forward to the next payout.
                Nothing is lost and nothing has gone wrong.
              </span>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {formatMoney(PAYOUT_MINIMUM_MINOR)}
            </span>
          </div>
        </section>

        {/* ── History ─────────────────────────────────────────────────────── */}
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <header className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Change history
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              Who pointed your money where, and when. Attempts that did not go through are kept too,
              and nothing here can be edited or removed.
            </p>
          </header>

          {/* Two rules, both from elsewhere in this pack.
              1. The common case is silent. An "Applied" chip on almost every row
                 carries no information — a badge that is always there teaches the
                 merchant to stop reading badges. Only the exception is marked.
              2. The exception is marked WITHOUT alarm. A change that failed in
                 March is history, not a warning: nothing is wrong now and nothing
                 is being asked. Same reason "Rolled forward" is not styled as a
                 failure (SET-X9). */}
          <ul className="flex flex-col divide-y divide-border/60">
            {history.map((change) => {
              const failed = change.outcome === "failed"
              const current = change.id === currentChangeId
              return (
                <li key={change.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm",
                        failed ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {change.fromLast4 ? `•••• ${change.fromLast4} → ` : "First account set — "}
                      •••• {change.toLast4}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {change.actor} · {formatDateTime(change.atIso)}
                    </span>
                    {change.failureReason ? (
                      <span className="text-xs text-muted-foreground">
                        {change.failureReason}. Nothing was changed.
                      </span>
                    ) : null}
                  </div>
                  {failed ? (
                    <Badge variant="muted" className="shrink-0">
                      Did not apply
                    </Badge>
                  ) : current ? (
                    // The one row a merchant scans for: which of these is the
                    // account my money is going to right now.
                    <Badge variant="success" className="shrink-0">
                      <CheckIcon className="size-3" />
                      In effect
                    </Badge>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <ChangeBankAccountDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        current={destination}
        actor={ACTOR}
        nowIso={CHANGED_AT}
        simulateGatewayFailure={demoState === "gateway-failed"}
        onApplied={(next) => {
          setDestination(next)
          setHistory((h) => [
            {
              id: `chg_${h.length + 1}`,
              atIso: CHANGED_AT,
              actor: ACTOR,
              fromLast4: destination.last4,
              toLast4: next.last4,
              outcome: "applied",
            },
            ...h,
          ])
        }}
        onFailed={(draft, result) => {
          // The destination is deliberately NOT touched here. A failed change
          // that leaves state behind is the defect this whole screen exists to
          // prevent (SET-B3).
          setHistory((h) => [
            {
              id: `chg_${h.length + 1}`,
              atIso: CHANGED_AT,
              actor: ACTOR,
              fromLast4: destination.last4,
              toLast4: draft.iban.replace(/\s+/g, "").slice(-4),
              outcome: "failed",
              failureReason: result.message.replace(/,? so nothing was changed\.?.*$/, ""),
            },
            ...h,
          ])
        }}
      />
    </SettingsPanel>
  )
}

function ScheduleRow({
  rail,
  canChange,
  cadence,
  onCadenceChange,
}: {
  rail: CamiPayRail
  canChange: boolean
  /** Cami rail only — the gateway's cadence is not ours to hold. */
  cadence: CamiPayoutCadence
  onCadenceChange: (cadence: CamiPayoutCadence) => void
}) {
  const schedule = PAYOUT_SCHEDULE[rail]
  const who = custodianLabel(custodianOf(rail))
  const [editing, setEditing] = useState(false)

  // Cami's row shows the cadence the merchant chose; NeoPay's shows theirs.
  const label = schedule.editable ? CADENCE_LABEL[cadence] : schedule.label

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          Paid by {who}
          {!schedule.editable ? (
            <Badge variant="muted">
              <LockIcon className="size-3" />
              Set by {who}
            </Badge>
          ) : null}
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{schedule.description}</span>
      </div>

      {/* SET-B7: the gateway's schedule is read-only in the strong sense —
          there is no disabled control here, because a greyed button implies a
          permission the merchant could be granted, when what they actually need
          is NeoPay. */}
      {schedule.editable && canChange ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          radius="full"
          className="shrink-0"
          onClick={() => setEditing(true)}
        >
          Change
        </Button>
      ) : null}

      <PayoutScheduleDialog
        open={editing}
        onOpenChange={setEditing}
        cadence={cadence}
        onSave={onCadenceChange}
      />
    </div>
  )
}
