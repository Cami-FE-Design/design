"use client"

/**
 * The deal wizard — `DealWizardDialog` and `DealSuccessStep` on the dev repo's
 * `promotion-discount-ui`: a full-viewport takeover, a sticky header with Back,
 * Close and Continue over a progress bar, and a confirmation on create.
 *
 * The built flow is details → limits. **Locations** follows as a third step
 * (DW3.4, R24), and the confirmation gains the line it has no answer for.
 */

import { ArrowLeftIcon, CheckIcon, CopyIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  DealDetailsStep,
  DealLimitsStep,
  DealLocationsStep,
} from "@/components/blocks/deals/deal-wizard-steps"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  type Deal,
  formatApplicabilitySummary,
  formatDateRange,
  formatDiscountValue,
  formatLocations,
} from "@/lib/deals/mock"
import {
  createEmptyDealDraft,
  DEAL_WIZARD_STEPS,
  type DealWizardDraft,
  dealToWizardDraft,
  draftToDeal,
  stepBlocker,
} from "@/lib/deals/wizard"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! z-50! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col gap-0 border-0! bg-background! p-0 shadow-none!"

// Column width the header row and body share, so Close/Continue and the
// progress bar line up with the step content below them.
const columnClass = "w-full max-w-160"

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
  const { locationName } = useLocations()

  function copyCode() {
    if (!deal.discountCode) return
    navigator.clipboard?.writeText(deal.discountCode)
    setCopied(true)
    toast.success("Discount code copied")
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center gap-8 py-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-cami-green-3">
          <CheckIcon className="size-7 text-cami-green-11" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Your promotion is set!
          </h1>
          <p className="mx-auto max-w-sm text-muted-foreground text-sm">
            Your promotion has been created and will be applied to bookings and sales within its
            dates.
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
        <SummaryRow label="Locations">{formatLocations(deal.scope, locationName)}</SummaryRow>
        <SummaryRow label="Redeem at">
          {deal.enableAtPointOfSale ? "Point of Sale" : "Online only"}
        </SummaryRow>
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
            onClick={copyCode}
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
  /** Unset creates one; a deal opens the wizard prefilled and saves in place. */
  dealToEdit?: Deal
  todayIso: string
  onSave: (deal: Deal) => void
}) {
  const isEditMode = !!dealToEdit
  const [stepIndex, setStepIndex] = useState(0)
  const [created, setCreated] = useState<Deal | null>(null)
  const [draft, setDraft] = useState<DealWizardDraft>(() => createEmptyDealDraft(todayIso))
  const { granted, grants } = useLocations()

  // Re-derive the draft fresh every time the dialog opens — from the deal
  // being edited, or blank for a new one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `granted` derives from `grants`; keying on it would re-seed a draft mid-edit
  useEffect(() => {
    if (!open) return
    setStepIndex(0)
    setCreated(null)
    if (dealToEdit) {
      setDraft(dealToWizardDraft(dealToEdit))
      return
    }
    const blank = createEmptyDealDraft(todayIso)
    // A manager cannot run a deal chain-wide (R04), so theirs starts on the
    // branches they hold rather than on the estate.
    setDraft(
      grants === "all"
        ? blank
        : { ...blank, scope: { kind: "branches", locationIds: granted.map((l) => l.id) } },
    )
  }, [open, dealToEdit, todayIso, grants])

  const step = DEAL_WIZARD_STEPS[stepIndex] ?? "details"
  const isLast = stepIndex === DEAL_WIZARD_STEPS.length - 1
  // The last step re-checks every earlier one too — editing seeds the draft
  // from data that never passed through this wizard's own gate.
  const canContinue = DEAL_WIZARD_STEPS.slice(0, stepIndex + 1).every(
    (s) => stepBlocker(s, draft) === null,
  )

  function back() {
    if (stepIndex === 0) onOpenChange(false)
    else setStepIndex((i) => i - 1)
  }

  function next() {
    if (!canContinue) return
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }
    const deal = draftToDeal(draft, todayIso, dealToEdit)
    onSave(deal)
    if (isEditMode) {
      toast.success("Deal updated")
      onOpenChange(false)
    } else {
      toast.success("Promotion created")
      setCreated(deal)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenDialogClass}>
        <DialogTitle className="sr-only">{isEditMode ? "Edit deal" : "Create deal"}</DialogTitle>
        <DialogDescription className="sr-only">
          Set up a promotion, flash sale, or last-minute offer.
        </DialogDescription>

        {created ? null : (
          <header className="sticky top-0 z-10 shrink-0 border-border/40 border-b bg-background px-6 py-4 lg:px-10">
            <div className={cn("mx-auto flex items-center justify-between gap-4", columnClass)}>
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
                  disabled={!canContinue}
                  onClick={next}
                >
                  {isLast ? (isEditMode ? "Save" : "Create") : "Continue"}
                </Button>
              </div>
            </div>

            <div className={cn("mx-auto mt-4 flex gap-1.5", columnClass)} aria-hidden>
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
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-12 lg:px-10">
          <div className={cn("mx-auto flex flex-col", columnClass)}>
            {created ? (
              <DealSuccessStep deal={created} onDone={() => onOpenChange(false)} />
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
                applicability={draft.applicability}
                onApplicability={(applicability) => setDraft((d) => ({ ...d, applicability }))}
              />
            ) : step === "limits" ? (
              <DealLimitsStep
                value={draft.limits}
                onChange={(limits) => setDraft((d) => ({ ...d, limits }))}
              />
            ) : (
              <DealLocationsStep
                value={draft.scope}
                onChange={(scope) => setDraft((d) => ({ ...d, scope }))}
                locations={granted}
                holdsEstate={grants === "all"}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
