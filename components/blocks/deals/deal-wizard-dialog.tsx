"use client"

/**
 * The deal wizard (DW3.4, R04, R11, R18, R24).
 *
 * A full-viewport takeover with a progress bar, as `DealWizardDialog` on the
 * dev repo's `promotion-discount-ui` does it — the same header column width, so
 * Close and Continue line up with the step content beneath them.
 *
 * Five steps here against its four: **locations** is added, and it is the whole
 * of PRD-169 on this screen. The built wizard creates every deal with
 * `locationIds: []`, which its own mapper reads as every venue — so a
 * chain-wide offer and a deal nobody scoped save as the same row, and the
 * Availability tab can only ever say "All locations".
 */

import { ArrowLeftIcon, CheckIcon, CopyIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"

import {
  DealDetailsStep,
  DealLimitsStep,
  DealLocationsStep,
  DealTeamStep,
  DealTypeStep,
} from "@/components/blocks/deals/deal-wizard-steps"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { describeLimits } from "@/lib/deals/limits"
import {
  type Deal,
  formatApplicabilitySummary,
  formatDateRange,
  formatDiscountValue,
} from "@/lib/deals/mock"
import {
  createEmptyDealDraft,
  DEAL_WIZARD_STEPS,
  type DealWizardDraft,
  type DealWizardStepId,
  dealToWizardDraft,
  draftToDeal,
  stepBlocker,
} from "@/lib/deals/wizard"
import { describeScope, reaches } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"
import { TEAM_MEMBERS } from "@/lib/team/mock"
import { cn } from "@/lib/utils"

const STEP_LABEL: Record<DealWizardStepId, string> = {
  type: "Type",
  details: "Details",
  limits: "Limits",
  locations: "Locations",
  team: "Team",
}

/** Label-left, value-right — the confirmation card's row. */
function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="shrink-0 text-muted-foreground text-sm">{label}</span>
      <span className="min-w-0 text-end font-medium text-foreground text-sm">{children}</span>
    </div>
  )
}

function DealSuccessStep({ deal, onDone }: { deal: Deal; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const { locationName, granted } = useLocations()
  const limits = describeLimits(deal)

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center gap-6 py-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-cami-green-3">
          <CheckIcon className="size-7 text-cami-green-11" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading font-semibold text-2xl text-foreground">Your deal is set</h2>
          <p className="mx-auto max-w-sm text-muted-foreground text-sm">
            It will be applied to bookings and sales within its dates.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-2xl bg-muted/40 p-5 text-start">
        <SummaryRow label="Discount">{formatDiscountValue(deal)} off</SummaryRow>
        <SummaryRow label="Applies to">{formatApplicabilitySummary(deal.applicability)}</SummaryRow>
        <SummaryRow label="Valid">
          {formatDateRange(deal.startDate, deal.endDate)}
          {!deal.endDate ? " onwards" : ""}
        </SummaryRow>
        {/* The line the built confirmation cannot print, because it has no
            answer to give: every deal it creates is chain-wide by omission. */}
        <SummaryRow label="Runs at">
          {describeScope(deal.scope, locationName)}
          {deal.scope.kind === "estate" ? ` · ${reaches(deal.scope, granted).length} today` : ""}
        </SummaryRow>
        <SummaryRow label="Redeem at">
          {deal.enableAtPointOfSale ? "Point of Sale and online" : "Online only"}
        </SummaryRow>
        {limits.length > 0 ? <SummaryRow label="Limits">{limits.join(" · ")}</SummaryRow> : null}
        {deal.discountCode ? (
          <SummaryRow label="Discount code">{deal.discountCode}</SummaryRow>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button type="button" size="lg" radius="full" className="w-full" onClick={onDone}>
          Done
        </Button>
        {deal.discountCode ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            radius="full"
            className="w-full"
            onClick={() => {
              navigator.clipboard?.writeText(deal.discountCode)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copied ? "Copied" : "Copy code"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function DealWizardDialog({
  open,
  onOpenChange,
  dealToEdit,
  todayIso,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `null` creates one; a deal opens the wizard prefilled and saves in place. */
  dealToEdit: Deal | null
  todayIso: string
  onSave: (deal: Deal) => void
}) {
  const isEdit = dealToEdit !== null
  const [stepIndex, setStepIndex] = useState(0)
  const [created, setCreated] = useState<Deal | null>(null)
  const [draft, setDraft] = useState<DealWizardDraft>(() => createEmptyDealDraft(todayIso))
  const { granted } = useLocations()

  // Re-derive fresh on every open — from the deal being edited, or blank.
  // Covers switching between create and edit, and editing a different deal on
  // a later open.
  useEffect(() => {
    if (!open) return
    setStepIndex(0)
    setCreated(null)
    setDraft(dealToEdit ? dealToWizardDraft(dealToEdit) : createEmptyDealDraft(todayIso))
  }, [open, dealToEdit, todayIso])

  const step = DEAL_WIZARD_STEPS[stepIndex] ?? "details"
  const isLast = stepIndex === DEAL_WIZARD_STEPS.length - 1
  const blocker = stepBlocker(step, draft)

  function back() {
    if (stepIndex === 0) onOpenChange(false)
    else setStepIndex((i) => i - 1)
  }

  function next() {
    if (blocker) return
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }
    const deal = draftToDeal(draft, todayIso, dealToEdit ?? undefined)
    onSave(deal)
    // Editing closes on save — the reader came from a row they can see change.
    // Creating shows the confirmation, because a new deal has a code to copy
    // and a reach worth stating before it disappears into a list.
    if (isEdit) onOpenChange(false)
    else setCreated(deal)
  }

  const reach = draft.scope.kind === "branches" ? draft.scope.locationIds : granted.map((l) => l.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !top-0 !left-0 !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !bg-background !shadow-none z-50 flex flex-col gap-0 p-0 sm:!max-w-none">
        <DialogTitle className="sr-only">{isEdit ? "Edit deal" : "Create deal"}</DialogTitle>
        <DialogDescription className="sr-only">
          Set up a promotion, flash sale or last-minute offer.
        </DialogDescription>

        {created ? null : (
          <header className="shrink-0 border-border/40 border-b bg-background px-6 py-3.5 lg:px-10">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                radius="full"
                aria-label="Go back"
                onClick={back}
                className="text-muted-foreground"
              >
                <ArrowLeftIcon className="size-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  radius="full"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="lg"
                  radius="full"
                  disabled={Boolean(blocker)}
                  onClick={next}
                >
                  {isLast ? (isEdit ? "Save" : "Create") : "Continue"}
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-3 flex w-full max-w-2xl flex-col gap-2">
              <div className="flex gap-1.5" aria-hidden>
                {DEAL_WIZARD_STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= stepIndex ? "bg-foreground" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              {/* The blocker sits under the bar, beside the button it disables.
                  A greyed-out Continue with no reason on a form of eight fields
                  leaves the reader hunting for which one it wants. */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">
                  Step {stepIndex + 1} of {DEAL_WIZARD_STEPS.length} · {STEP_LABEL[step]}
                </span>
                {blocker ? <span className="text-cami-tomato-11 text-xs">{blocker}</span> : null}
              </div>
            </div>
          </header>
        )}

        {/* One scroll region, and it is this one. */}
        {/* py-10 and a 40rem column came from the dev repo, where the step
            heading is text-4xl. At this repo's scale that left a third of the
            viewport empty above three fields. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col">
            {created ? (
              <DealSuccessStep deal={created} onDone={() => onOpenChange(false)} />
            ) : step === "type" ? (
              <DealTypeStep
                value={draft.type}
                onChange={(type) => setDraft((d) => ({ ...d, type }))}
              />
            ) : step === "details" ? (
              <DealDetailsStep
                type={draft.type}
                name={draft.name}
                onName={(name) => setDraft((d) => ({ ...d, name }))}
                description={draft.description}
                onDescription={(description) => setDraft((d) => ({ ...d, description }))}
                discountKind={draft.discountKind}
                onDiscountKind={(discountKind) => setDraft((d) => ({ ...d, discountKind }))}
                discountValue={draft.discountValue}
                onDiscountValue={(discountValue) => setDraft((d) => ({ ...d, discountValue }))}
                discountCode={draft.discountCode}
                onDiscountCode={(discountCode) => setDraft((d) => ({ ...d, discountCode }))}
                startDate={draft.startDate}
                onStartDate={(startDate) => setDraft((d) => ({ ...d, startDate }))}
                endDate={draft.endDate}
                onEndDate={(endDate) => setDraft((d) => ({ ...d, endDate }))}
                enableAtPointOfSale={draft.enableAtPointOfSale}
                onEnableAtPointOfSale={(enableAtPointOfSale) =>
                  setDraft((d) => ({ ...d, enableAtPointOfSale }))
                }
                applicability={draft.applicability}
                onApplicability={(applicability) => setDraft((d) => ({ ...d, applicability }))}
              />
            ) : step === "limits" ? (
              <DealLimitsStep
                value={draft.limits}
                onChange={(limits) => setDraft((d) => ({ ...d, limits }))}
              />
            ) : step === "locations" ? (
              <DealLocationsStep
                value={draft.scope}
                onChange={(scope) => setDraft((d) => ({ ...d, scope }))}
              />
            ) : (
              <DealTeamStep
                value={draft.teamMemberIds}
                onChange={(teamMemberIds) => setDraft((d) => ({ ...d, teamMemberIds }))}
                members={TEAM_MEMBERS}
                reach={reach}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
