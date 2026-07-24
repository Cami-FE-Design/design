"use client"

// Payments panel inside the app settings dialog (Fresha-parity payment
// policy). Business-level only for v1 — Location override is blocked pending
// the Malen/Maaz scope decision. Follows the sales-settings.tsx conventions:
// summary card in the panel, editing via FullScreenTakeover dialogs (policy
// editor → customize-by-service table, and the client-facing terms editor).
//
// Deep-links for /screens: `?pp=edit` opens the policy editor, `?pp=services`
// the customize-by-service table, `?pp=terms` the terms editor.

import {
  CheckCircle2Icon,
  CircleOffIcon,
  ClipboardListIcon,
  CreditCardIcon,
  HandCoinsIcon,
  InfoIcon,
  PencilIcon,
  WalletIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/blocks/empty-state"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { AmountInput } from "@/components/blocks/payment-policy/amount-input"
import { FullScreenTakeover, PaymentMethodsPanel } from "@/components/blocks/sales-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDemoBusiness } from "@/lib/demo-business"
import { usePaymentPolicy } from "@/lib/payment-policy/store"
import {
  type AmountValue,
  AUTO_CANCEL_REFERENCE_OPTIONS,
  AUTO_CANCEL_WINDOW_OPTIONS,
  type AutoCancelReference,
  examplePolicyText,
  formatAmount,
  LATE_FEE_TRIGGER_OPTIONS,
  overrideCount,
  type PaymentPolicy,
  type PaymentPolicyType,
  POLICY_TYPE_OPTIONS,
  REFUND_OPTIONS,
  RESCHEDULE_OPTIONS,
  refundLabel,
  rescheduleLabel,
  type ServiceOverride,
  TERMS_MAX_LENGTH,
} from "@/lib/payment-policy/types"
import {
  ServiceCatalogProvider,
  useServiceCategories,
  useServices,
} from "@/lib/service-catalog/store"
import { formatDurationMin, type Service } from "@/lib/service-catalog/types"
import { cn } from "@/lib/utils"

// Field styling shared with the other settings takeovers (see sales-settings).
const selectTriggerOverride =
  "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

type TakeoverView = "edit" | "services" | "terms" | null

const POLICY_TYPE_ICONS: Record<PaymentPolicyType, typeof HandCoinsIcon> = {
  none: CircleOffIcon,
  deposit: HandCoinsIcon,
}

function SummaryLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm leading-5 text-foreground">
      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-cami-green-11" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

function ExamplePolicyPreview({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <h4 className="font-heading text-base font-semibold leading-6 text-foreground">
          Example policy
        </h4>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="size-3.5 text-muted-foreground" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>
            Auto-generated from your policy — clients see this when booking
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="rounded-2xl bg-cami-violet-2 px-4 py-3 text-sm leading-5 text-foreground">
        {text}
      </div>
    </div>
  )
}

type PaymentsView = "home" | "policy" | "methods"

const PAYMENTS_CARDS: {
  id: Exclude<PaymentsView, "home">
  label: string
  description: string
  icon: typeof WalletIcon
}[] = [
  {
    id: "policy",
    label: "Payment policy",
    description: "Deposit, no-show, and cancellation policy applied to bookings.",
    icon: HandCoinsIcon,
  },
  {
    id: "methods",
    label: "Payment methods",
    description: "Customize the payment methods displayed at checkout for your team members.",
    icon: WalletIcon,
  },
]

const PAYMENTS_BREADCRUMB_ROOT = { label: "Payments", icon: CreditCardIcon }

export function PaymentsSettingsPanel() {
  const searchParams = useSearchParams()
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const { name: businessName } = useDemoBusiness()

  // Deep-links: ?pp=policy|methods opens a sub-screen; edit|services|terms
  // open the policy sub-screen with the matching takeover on top.
  const pp = searchParams.get("pp")
  const [view, setView] = useState<PaymentsView>(
    pp === "methods" ? "methods" : pp ? "policy" : "home",
  )

  // When a takeover was opened via deep-link (e.g. "Edit policy" from the
  // appointment sheet), closing it should close the whole settings dialog and
  // return to the page underneath — not strand the user on the dialog they
  // never opened themselves. Mirrors AppSettingsController's close.
  function closeDialog() {
    const next = new URLSearchParams(searchParams.toString())
    next.delete("settings")
    next.delete("pp")
    next.delete("pm")
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (view === "policy") {
    return (
      <PaymentPolicySubScreen
        onBack={() => setView("home")}
        initialTakeover={pp}
        onDeepLinkExit={closeDialog}
      />
    )
  }
  if (view === "methods") {
    return (
      <PaymentMethodsPanel
        onBack={() => setView("home")}
        initialAction={searchParams.get("pm")}
        breadcrumbRoot={PAYMENTS_BREADCRUMB_ROOT}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">Payments</h2>
        <p className="text-sm leading-5 text-muted-foreground">
          How your clients pay for their appointments at {businessName}.
        </p>
      </header>

      {/* Same card footprint as the Sales landing (see sales-settings.tsx). */}
      <div className="grid gap-3 sm:w-146 sm:grid-cols-2">
        {PAYMENTS_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setView(card.id)}
              className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left transition-colors hover:bg-foreground/3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-base font-semibold text-foreground">{card.label}</span>
                <span className="text-sm leading-5 text-muted-foreground">{card.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PaymentPolicySubScreen({
  onBack,
  initialTakeover,
  onDeepLinkExit,
}: {
  onBack: () => void
  initialTakeover: string | null
  /** Called instead of returning to the summary when the takeover was deep-linked open. */
  onDeepLinkExit?: () => void
}) {
  const { name: businessName } = useDemoBusiness()
  const { policy, updatePolicy } = usePaymentPolicy()

  const deepLinkedTakeover =
    initialTakeover === "edit" || initialTakeover === "services" || initialTakeover === "terms"
  const [takeover, setTakeover] = useState<TakeoverView>(
    deepLinkedTakeover ? (initialTakeover as TakeoverView) : null,
  )
  // Consumed on first close so in-dialog navigation afterwards behaves normally.
  const deepLinkRef = useRef(deepLinkedTakeover)

  function closeTakeover() {
    setTakeover(null)
    if (deepLinkRef.current) {
      deepLinkRef.current = false
      onDeepLinkExit?.()
    }
  }

  const customCount = overrideCount(policy)
  // Session-only preview override for the demo toggle below — the populated
  // state always shows first on a fresh load (like the Gift cards panel), and
  // previewing the empty state never persists to the stored policy.
  const [demoOverride, setDemoOverride] = useState<"empty" | "populated" | null>(null)
  const hasPolicy = demoOverride ? demoOverride === "populated" : policy.type === "deposit"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex shrink-0 flex-col gap-4">
        <NotionBreadcrumb
          segments={[
            {
              label: PAYMENTS_BREADCRUMB_ROOT.label,
              icon: PAYMENTS_BREADCRUMB_ROOT.icon,
              onClick: onBack,
            },
            { label: "Payment policy" },
          ]}
        />
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Payment policy
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            How your clients pay for their appointments at {businessName}.
          </p>
        </header>
      </div>

      {hasPolicy ? (
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <header className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
                Cancellation and no-show policy
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                Configure the default payment policy applied to all bookings.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              radius="full"
              onClick={() => setTakeover("edit")}
            >
              Edit
            </Button>
          </header>

          <ul className="flex flex-col gap-2.5">
            <SummaryLine>
              Policy applies to <strong>all clients</strong>
              {policy.limitByValue ? (
                <>
                  {" "}
                  on appointments over{" "}
                  <strong>AED {policy.minValueAed.toLocaleString("en-US")}</strong>
                </>
              ) : null}
            </SummaryLine>
            <SummaryLine>
              Clients will be charged a <strong>{formatAmount(policy.deposit)}</strong> deposit
              upfront.
              {policy.customizePerService && customCount > 0 ? (
                <>
                  {" "}
                  Custom deposit settings apply to <strong>{customCount} services</strong>
                </>
              ) : null}
            </SummaryLine>
            <SummaryLine>
              Deposits are{" "}
              <strong>
                {policy.refundRule === "non-refundable"
                  ? "non-refundable"
                  : `refundable until ${refundLabel(policy.refundRule).toLowerCase()}`}
              </strong>
            </SummaryLine>
            <SummaryLine>
              Clients can reschedule online{" "}
              <strong>{rescheduleLabel(policy.rescheduleWindowMin).toLowerCase()}</strong>
            </SummaryLine>
          </ul>

          <ExamplePolicyPreview text={examplePolicyText(policy, businessName)} />

          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
            <div className="flex flex-col gap-1">
              <h4 className="font-heading text-base font-semibold leading-6 text-foreground">
                Additional terms and conditions
              </h4>
              <p className="text-sm leading-5 text-muted-foreground">
                {policy.terms || "No additional terms set."}
              </p>
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                radius="full"
                onClick={() => setTakeover("terms")}
              >
                Edit
                <PencilIcon className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        // No policy configured — inactive empty state, mirroring the Gift cards
        // pattern in sales-settings. Set up opens the editor takeover.
        <section className="flex w-full flex-col rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <EmptyState
            icon={HandCoinsIcon}
            title="No payment policy"
            description="No policy is applied to clients when booking. Protect against no-shows and late cancellations by requiring a deposit upfront."
            action={
              <Button
                type="button"
                variant="secondary"
                radius="full"
                onClick={() => setTakeover("edit")}
              >
                Set up
              </Button>
            }
          />
        </section>
      )}

      {/* Prepay only makes sense once a policy exists — hidden in the empty state. */}
      {hasPolicy ? (
        <section className="flex w-full items-start justify-between gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
              Allow clients the option to prepay in full before their appointment
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              Give clients the choice to pay in advance, ideal for gifting, booking for family or
              friends, or simply planning ahead.
            </p>
          </div>
          <Switch
            checked={policy.prepayEnabled}
            onCheckedChange={(checked) => updatePolicy({ prepayEnabled: checked })}
            aria-label="Allow clients to prepay in full"
          />
        </section>
      ) : null}

      {/* Prototype demo toggle — previews the opposite state for this session
          only (same pattern as the Gift cards panel); the stored policy is
          untouched, so the populated default always returns on reload. */}
      <div className="mt-auto flex justify-end pt-2">
        <button
          type="button"
          onClick={() => setDemoOverride(hasPolicy ? "empty" : "populated")}
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          {hasPolicy ? "Show empty state" : "Show populated state"}
        </button>
      </div>

      {takeover === "edit" ? (
        <PaymentPolicyTakeover
          onClose={closeTakeover}
          onEditServices={() => setTakeover("services")}
        />
      ) : null}
      {takeover === "services" ? (
        <ServiceCatalogProvider>
          <ServiceCustomizationsTakeover onClose={() => setTakeover("edit")} />
        </ServiceCatalogProvider>
      ) : null}
      {takeover === "terms" ? <TermsTakeover onClose={closeTakeover} /> : null}
    </div>
  )
}

// ── Policy editor takeover (tickets 1–5, 7) ────────────────────────────────

function FieldGroup({
  label,
  helper,
  children,
}: {
  label?: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full max-w-md flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      ) : null}
      {children}
      {helper ? <span className="text-sm leading-5 text-muted-foreground">{helper}</span> : null}
    </div>
  )
}

function CheckboxRow({
  id,
  checked,
  onCheckedChange,
  disabled,
  label,
  subCopy,
  trailing,
  children,
}: {
  id: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  label: string
  subCopy?: string
  trailing?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(c) => onCheckedChange(c === true)}
          className="mt-0.5"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <Label
            htmlFor={id}
            className={
              disabled
                ? "text-sm font-medium leading-5 text-muted-foreground"
                : "text-sm font-medium leading-5 text-foreground"
            }
          >
            {label}
            {trailing}
          </Label>
          {subCopy ? <p className="text-sm leading-5 text-muted-foreground">{subCopy}</p> : null}
        </div>
      </div>
      {checked && children ? <div className="ps-7">{children}</div> : null}
    </div>
  )
}

function PaymentPolicyTakeover({
  onClose,
  onEditServices,
}: {
  onClose: () => void
  onEditServices: () => void
}) {
  const { policy, setPolicy } = usePaymentPolicy()
  const [draft, setDraft] = useState<PaymentPolicy>(policy)
  const dirtyRef = useRef(false)

  // The store hydrates from localStorage after mount — adopt that value as the
  // draft as long as the user hasn't started editing.
  useEffect(() => {
    if (!dirtyRef.current) setDraft(policy)
  }, [policy])

  function patch(next: Partial<PaymentPolicy>) {
    dirtyRef.current = true
    setDraft((d) => ({ ...d, ...next }))
  }

  function save() {
    setPolicy(draft)
    toast.success("Payment policy saved")
    onClose()
  }

  const isDeposit = draft.type === "deposit"
  const selectedType = POLICY_TYPE_OPTIONS.find((o) => o.value === draft.type)
  const refundOption = REFUND_OPTIONS.find((o) => o.value === draft.refundRule)
  const customCount = overrideCount(policy)

  return (
    <FullScreenTakeover
      title="Payment policy"
      ariaDescription="Configure the deposit, refund, reschedule, and no-show policy for bookings."
      subtitle="Protect against no-shows and late cancellations by requiring a deposit, or holding a card to charge a fee."
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <FieldGroup helper={selectedType?.description}>
        <Select value={draft.type} onValueChange={(v) => patch({ type: v as PaymentPolicyType })}>
          <SelectTrigger className={selectTriggerOverride} aria-label="Payment policy type">
            {/* Trigger shows only icon + label — the option descriptions live in
                the dropdown list and the helper text below, not the selected value. */}
            <SelectValue>
              {selectedType ? (
                <span className="flex items-center gap-3">
                  {(() => {
                    const Icon = POLICY_TYPE_ICONS[selectedType.value]
                    return <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  })()}
                  <span className="text-sm font-medium text-foreground">{selectedType.label}</span>
                </span>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {POLICY_TYPE_OPTIONS.map((option) => {
              const Icon = POLICY_TYPE_ICONS[option.value]
              return (
                <SelectItem key={option.value} value={option.value} className="py-3">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex flex-col gap-0.5 text-start">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="max-w-md text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>

      {isDeposit ? (
        <>
          <FieldGroup label="Deposit amount" helper="Of each service in the appointment">
            <AmountInput
              value={draft.deposit}
              onChange={(deposit) => patch({ deposit })}
              ariaLabel="Deposit amount"
            />
          </FieldGroup>

          <FieldGroup label="Refundable until" helper={refundOption?.helper}>
            <Select
              value={String(draft.refundRule)}
              onValueChange={(v) =>
                patch({ refundRule: v === "non-refundable" ? "non-refundable" : Number(v) })
              }
            >
              <SelectTrigger className={selectTriggerOverride} aria-label="Refundable until">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFUND_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup
            label="Clients can reschedule online"
            helper="Clients will be able to reschedule without losing their deposit before this timeframe"
          >
            <Select
              value={
                draft.rescheduleWindowMin === null ? "none" : String(draft.rescheduleWindowMin)
              }
              onValueChange={(v) => patch({ rescheduleWindowMin: v === "none" ? null : Number(v) })}
            >
              <SelectTrigger
                className={selectTriggerOverride}
                aria-label="Clients can reschedule online"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESCHEDULE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value === null ? "none" : option.value}
                    value={option.value === null ? "none" : String(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          {/* Grouped so the two related checkboxes sit close (gap-4), not at the
              takeover's section rhythm (gap-10). */}
          <div className="flex flex-col gap-4">
            <CheckboxRow
              id="late-fee"
              checked={draft.lateFeeEnabled}
              onCheckedChange={(lateFeeEnabled) => patch({ lateFeeEnabled })}
              label="Apply late cancellation or no-show fee"
            >
              <div className="flex flex-col gap-5">
                <FieldGroup helper="Of the total appointment value">
                  <AmountInput
                    value={draft.lateFee}
                    onChange={(lateFee) => patch({ lateFee })}
                    ariaLabel="No-show fee"
                  />
                </FieldGroup>
                <FieldGroup
                  label="Apply fee when"
                  helper="No-shows are always included in late cancellation and reschedule fees"
                >
                  <Select
                    value={String(draft.lateFeeTrigger)}
                    onValueChange={(v) =>
                      patch({ lateFeeTrigger: v === "no-show" ? "no-show" : Number(v) })
                    }
                  >
                    <SelectTrigger className={selectTriggerOverride} aria-label="Apply fee when">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LATE_FEE_TRIGGER_OPTIONS.map((option) => (
                        <SelectItem key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>
            </CheckboxRow>

            <CheckboxRow
              id="auto-cancel"
              checked={draft.autoCancelUnpaid}
              onCheckedChange={(autoCancelUnpaid) => patch({ autoCancelUnpaid })}
              label="Automatically cancel appointments for clients that did not pay a deposit"
              subCopy="Appointments booked by team members in-store will be automatically canceled if clients don't pay their deposit within the set time frame"
            >
              <FieldGroup label="If not paid within">
                <div className="flex w-full gap-2">
                  <Select
                    value={String(draft.autoCancelWithinMin)}
                    onValueChange={(v) => patch({ autoCancelWithinMin: Number(v) })}
                  >
                    <SelectTrigger
                      className={cn(selectTriggerOverride, "flex-1")}
                      aria-label="Auto-cancel window"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTO_CANCEL_WINDOW_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={draft.autoCancelReference}
                    onValueChange={(v) => patch({ autoCancelReference: v as AutoCancelReference })}
                  >
                    <SelectTrigger
                      className={cn(selectTriggerOverride, "flex-1")}
                      aria-label="Auto-cancel reference point"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTO_CANCEL_REFERENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FieldGroup>
            </CheckboxRow>
          </div>

          <hr className="border-border/40" />

          <section className="flex flex-col gap-5">
            <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
              Advanced options
            </h3>

            <CheckboxRow
              id="customize-per-service"
              checked={draft.customizePerService}
              onCheckedChange={(customizePerService) => patch({ customizePerService })}
              label="Customize per service"
            >
              <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <ClipboardListIcon className="size-5 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium text-foreground">
                    {customCount} service customization{customCount === 1 ? "" : "s"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  radius="full"
                  onClick={() => {
                    // Persist the draft first so the table opens against the
                    // policy the user sees (deposit default, etc.).
                    setPolicy(draft)
                    onEditServices()
                  }}
                >
                  Edit
                </Button>
              </div>
            </CheckboxRow>

            {/* Client groups don't exist in Cami yet — disabled pending Michelle's call. */}
            <CheckboxRow
              id="client-groups"
              checked={draft.limitToClientGroups}
              onCheckedChange={() => {}}
              disabled
              label="Only apply payment policy to selected client groups"
              trailing={
                <Badge variant="secondary" className="ms-2 align-middle font-normal">
                  Coming soon
                </Badge>
              }
            />

            <CheckboxRow
              id="min-value"
              checked={draft.limitByValue}
              onCheckedChange={(limitByValue) => patch({ limitByValue })}
              label="Only apply payment policy to appointments over a set value"
            >
              <FieldGroup helper="Appointments below this value won't require a deposit">
                <div className="flex h-12 w-full max-w-56 items-center gap-2 rounded-2xl bg-input px-4 ring-inset focus-within:ring-2 focus-within:ring-foreground">
                  <span className="text-sm font-medium text-muted-foreground">AED</span>
                  <input
                    inputMode="numeric"
                    value={draft.minValueAed || ""}
                    aria-label="Minimum appointment value"
                    className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "")
                      patch({ minValueAed: digits ? Number(digits) : 0 })
                    }}
                  />
                </div>
              </FieldGroup>
            </CheckboxRow>
          </section>
        </>
      ) : null}
    </FullScreenTakeover>
  )
}

// ── Customize by service takeover (ticket 6) ────────────────────────────────

type OverridesDraft = Record<string, ServiceOverride>

function DepositCell({
  serviceName,
  defaultDeposit,
  override,
  onChange,
}: {
  serviceName: string
  defaultDeposit: AmountValue
  override: ServiceOverride | undefined
  onChange: (next: ServiceOverride | undefined) => void
}) {
  const isCustom = override?.deposit !== undefined
  return (
    <div className="flex items-center gap-2">
      <Select
        value={isCustom ? "custom" : "default"}
        onValueChange={(v) => {
          if (v === "default") {
            const next = { ...override }
            delete next.deposit
            onChange(next.noShowFee !== undefined ? next : undefined)
          } else {
            onChange({ ...override, deposit: { ...defaultDeposit } })
          }
        }}
      >
        <SelectTrigger
          className={cn(selectTriggerOverride, "w-44 shrink-0")}
          aria-label={`Deposit for ${serviceName}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default ({formatAmount(defaultDeposit)})</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      <AmountInput
        value={override?.deposit ?? defaultDeposit}
        disabled={!isCustom}
        className="w-56"
        ariaLabel={`Custom deposit for ${serviceName}`}
        onChange={(deposit) => onChange({ ...override, deposit })}
      />
    </div>
  )
}

function NoShowFeeCell({
  serviceName,
  override,
  onChange,
}: {
  serviceName: string
  override: ServiceOverride | undefined
  onChange: (next: ServiceOverride | undefined) => void
}) {
  const fee = override?.noShowFee
  const isCustom = fee !== undefined && fee !== null
  return (
    <div className="flex items-center gap-2">
      <Select
        value={isCustom ? "custom" : "default"}
        onValueChange={(v) => {
          if (v === "default") {
            const next = { ...override }
            delete next.noShowFee
            onChange(next.deposit !== undefined ? next : undefined)
          } else {
            onChange({ ...override, noShowFee: { mode: "percent", value: 50 } })
          }
        }}
      >
        <SelectTrigger
          className={cn(selectTriggerOverride, "w-40 shrink-0")}
          aria-label={`No-show fee for ${serviceName}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default (Off)</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      <AmountInput
        value={isCustom ? fee : { mode: "percent", value: 0 }}
        disabled={!isCustom}
        className="w-56"
        ariaLabel={`Custom no-show fee for ${serviceName}`}
        onChange={(noShowFee) => onChange({ ...override, noShowFee })}
      />
    </div>
  )
}

function ServiceCustomizationsTakeover({ onClose }: { onClose: () => void }) {
  const { policy, setPolicy } = usePaymentPolicy()
  const { data: services = [] } = useServices()
  const { data: categories = [] } = useServiceCategories()

  const [overrides, setOverrides] = useState<OverridesDraft>(policy.serviceOverrides)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeposit, setBulkDeposit] = useState<AmountValue>({ mode: "percent", value: 25 })

  const activeServices = useMemo(() => services.filter((s) => s.isActive !== false), [services])

  // Only categories that actually contain services, in catalog order.
  const categoryTabs = useMemo(
    () => categories.filter((c) => activeServices.some((s) => s.categoryId === c.id)),
    [categories, activeServices],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return activeServices.filter((s) => {
      if (activeCategory && s.categoryId !== activeCategory) return false
      if (q && !s.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [activeServices, activeCategory, search])

  const grouped = useMemo(() => {
    const byCategory = new Map<string, Service[]>()
    for (const s of visible) {
      const list = byCategory.get(s.categoryId) ?? []
      list.push(s)
      byCategory.set(s.categoryId, list)
    }
    return categoryTabs
      .filter((c) => byCategory.has(c.id))
      .map((c) => ({ category: c, services: byCategory.get(c.id) ?? [] }))
  }, [visible, categoryTabs])

  function setOverride(serviceId: string, next: ServiceOverride | undefined) {
    setOverrides((prev) => {
      if (next === undefined) {
        const { [serviceId]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [serviceId]: next }
    })
  }

  function toggleSelect(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function toggleCategory(ids: string[], next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev)
      for (const id of ids) {
        if (next) copy.add(id)
        else copy.delete(id)
      }
      return copy
    })
  }

  function applyBulkDeposit() {
    setOverrides((prev) => {
      const next = { ...prev }
      for (const id of selectedIds) {
        next[id] = { ...next[id], deposit: { ...bulkDeposit } }
      }
      return next
    })
    toast.success(`Custom deposit applied to ${selectedIds.size} services`)
    setSelectedIds(new Set())
  }

  function save() {
    setPolicy({ ...policy, serviceOverrides: overrides, customizePerService: true })
    toast.success("Service customizations saved")
    onClose()
  }

  return (
    <FullScreenTakeover
      title="Customize by service"
      ariaDescription="Set a custom deposit or no-show fee per service."
      subtitle="Choose to use the default or custom deposit per service."
      onClose={onClose}
      wide
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <SearchInput
          size="lg"
          onValueChange={setSearch}
          placeholder="Search"
          aria-label="Search services"
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === null
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All services
          </button>
          {categoryTabs.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === c.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {selectedIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
            <AmountInput
              value={bulkDeposit}
              onChange={setBulkDeposit}
              className="w-56"
              ariaLabel="Bulk deposit amount"
            />
            <Button type="button" radius="full" size="sm" onClick={applyBulkDeposit}>
              Set custom deposit
            </Button>
            <Button
              type="button"
              variant="ghost"
              radius="full"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        ) : null}

        <div className="hidden grid-cols-[minmax(200px,1.3fr)_90px_minmax(360px,1.6fr)_minmax(340px,1.5fr)] gap-4 border-b border-border/60 pb-2 text-sm font-medium text-muted-foreground lg:grid">
          <span>Service</span>
          <span>Price</span>
          <span>Deposit</span>
          <span>No-show fee</span>
        </div>

        {grouped.length === 0 ? (
          <p className="py-16 text-center text-sm leading-5 text-muted-foreground">
            No services match. Try a different search or category.
          </p>
        ) : (
          grouped.map(({ category, services: categoryServices }) => {
            const ids = categoryServices.map((s) => s.id)
            const selectedInCategory = ids.filter((id) => selectedIds.has(id)).length
            const categoryChecked: boolean | "indeterminate" =
              selectedInCategory === 0
                ? false
                : selectedInCategory === ids.length
                  ? true
                  : "indeterminate"

            return (
              <section key={category.id} className="flex flex-col">
                <div className="flex items-center gap-3 border-b border-border/60 py-3">
                  <Checkbox
                    checked={categoryChecked}
                    onCheckedChange={(c) => toggleCategory(ids, c === true)}
                    aria-label={`Select all ${category.name} services`}
                  />
                  <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="font-normal">
                    {categoryServices.length}
                  </Badge>
                </div>

                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-3 border-b border-border/40 py-4 lg:grid lg:grid-cols-[minmax(200px,1.3fr)_90px_minmax(360px,1.6fr)_minmax(340px,1.5fr)] lg:items-center lg:gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(service.id)}
                        onCheckedChange={(c) => toggleSelect(service.id, c === true)}
                        aria-label={`Select ${service.name}`}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {service.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDurationMin(service.duration)}
                        </span>
                      </div>
                    </div>
                    <span className="ps-7 text-sm text-foreground lg:ps-0">
                      AED {service.price.toLocaleString("en-US")}
                    </span>
                    <div className="ps-7 lg:ps-0">
                      <DepositCell
                        serviceName={service.name}
                        defaultDeposit={policy.deposit}
                        override={overrides[service.id]}
                        onChange={(next) => setOverride(service.id, next)}
                      />
                    </div>
                    <div className="ps-7 lg:ps-0">
                      <NoShowFeeCell
                        serviceName={service.name}
                        override={overrides[service.id]}
                        onChange={(next) => setOverride(service.id, next)}
                      />
                    </div>
                  </div>
                ))}
              </section>
            )
          })
        )}
      </div>
    </FullScreenTakeover>
  )
}

// ── Terms takeover (ticket 8) ────────────────────────────────────────────────

function TermsTakeover({ onClose }: { onClose: () => void }) {
  const { name: businessName } = useDemoBusiness()
  const { policy, updatePolicy } = usePaymentPolicy()
  const [terms, setTerms] = useState(policy.terms)
  const dirtyRef = useRef(false)

  // Adopt the localStorage-hydrated value until the user starts typing.
  useEffect(() => {
    if (!dirtyRef.current) setTerms(policy.terms)
  }, [policy.terms])

  function save() {
    updatePolicy({ terms })
    toast.success("Policy text saved")
    onClose()
  }

  return (
    <FullScreenTakeover
      title="Policy displayed to clients"
      ariaDescription="Edit the additional terms and conditions clients see when booking."
      subtitle="Clients see this information when booking appointments with you."
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <ExamplePolicyPreview text={examplePolicyText(policy, businessName)} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-5 text-foreground">
            Additional terms and conditions
          </span>
          <span className="text-sm leading-5 text-muted-foreground">
            {terms.length}/{TERMS_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={terms}
          maxLength={TERMS_MAX_LENGTH}
          rows={5}
          aria-label="Additional terms and conditions"
          className="w-full resize-y rounded-2xl bg-input px-4 py-3 text-sm font-medium leading-5 text-foreground outline-none ring-inset focus:ring-2 focus:ring-foreground"
          onChange={(e) => {
            dirtyRef.current = true
            setTerms(e.target.value.slice(0, TERMS_MAX_LENGTH))
          }}
        />
        <span className="text-sm leading-5 text-muted-foreground">
          Additional terms and conditions shown to clients when booking online. Ensure they match
          the settings configured in your payment policy
        </span>
      </div>
    </FullScreenTakeover>
  )
}
