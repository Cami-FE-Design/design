"use client"

// Changing Cami's payout schedule — DSG-75 T2-9.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// Only the Cami rail reaches this dialog. NeoPay's schedule is theirs, and the
// bank-account panel renders it with no control at all rather than a disabled
// one (SET-B7) — a greyed button implies a permission the merchant could be
// granted, when what they actually need is the gateway.
//
// Deliberately much lighter than the account-change flow next door. Moving a
// payout from Thursday to Monday is reversible and costs nothing; moving the
// destination is neither. Friction should track consequence, not category.

import { useState } from "react"
import { FullScreenTakeover } from "@/components/blocks/sales-settings"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatMoney } from "@/lib/money/format"
import { PAYOUT_MINIMUM_MINOR } from "@/lib/money/mock"

// Field styling shared with the other settings takeovers (see sales-settings).
const selectTriggerOverride =
  "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

/**
 * How often Cami sends online money to the bank.
 *
 * Daily or weekly, and nothing else, because that is what SET-B6 specifies. A
 * monthly option was here briefly and was invented — it is not in the BRD, and
 * an interval nobody agreed to is a commitment the payout engine has not made.
 *
 * The run day is not the merchant's to choose either. SET-B6 asks for a cadence;
 * which weekday the run lands on follows the banking cycle, not a preference.
 */
export type CamiPayoutCadence = "daily" | "weekly"

/** What the merchant reads on the schedule row, and in the picker. */
export const CADENCE_LABEL: Record<CamiPayoutCadence, string> = {
  daily: "Daily, every business day",
  weekly: "Weekly, every Thursday",
}

export function PayoutScheduleDialog({
  open,
  onOpenChange,
  cadence,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cadence: CamiPayoutCadence
  onSave: (cadence: CamiPayoutCadence) => void
}) {
  const [draft, setDraft] = useState<CamiPayoutCadence>(cadence)

  // Re-seed on open so a cancelled edit does not survive into the next one.
  const [seededFor, setSeededFor] = useState(open)
  if (open !== seededFor) {
    setSeededFor(open)
    if (open) setDraft(cadence)
  }

  if (!open) return null

  function close() {
    onOpenChange(false)
  }

  return (
    <FullScreenTakeover
      title="Payout schedule"
      ariaDescription="Choose how often Cami sends your online payments to your bank"
      subtitle="How often Cami sends your online payments to your bank account."
      onClose={close}
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={close}>
            Close
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            onClick={() => {
              onSave(draft)
              close()
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Select child */}
        <label className="flex w-full max-w-md flex-col gap-1.5">
          <span className="text-sm font-medium leading-5 text-foreground">How often</span>
          <Select value={draft} onValueChange={(v) => setDraft(v as CamiPayoutCadence)}>
            <SelectTrigger className={selectTriggerOverride} aria-label="How often">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CADENCE_LABEL) as CamiPayoutCadence[]).map((id) => (
                <SelectItem key={id} value={id}>
                  {CADENCE_LABEL[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm leading-5 text-muted-foreground">
            Money taken after a run goes out on the following one.
          </span>
        </label>

        {/* Two facts, not two fields. Rendered as a note because a label above
            uneditable text reads as a disabled control — the merchant looks for
            the input that is not there.

            T2-10 is restated here, at the point of change, because a merchant
            moving from daily to monthly is exactly who needs to know a small
            balance rolls forward. And the second line exists because this
            setting does not govern the other rail: someone who changes it
            expecting both to move has been misled by the screen. */}
        <div className="flex w-full max-w-md flex-col gap-2 rounded-xl bg-cami-sage-2 p-3">
          <p className="text-sm leading-5 text-foreground">
            <span className="font-medium">Minimum payout {formatMoney(PAYOUT_MINIMUM_MINOR)}.</span>{" "}
            Below this nothing is sent and the balance rolls forward to the next run — nothing is
            lost.
          </p>
          <p className="text-sm leading-5 text-foreground">
            <span className="font-medium">Card machine payments are not affected.</span> NeoPay
            holds that money and pays it on its own schedule.
          </p>
        </div>
      </div>
    </FullScreenTakeover>
  )
}
