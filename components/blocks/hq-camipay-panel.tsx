"use client"

// CamiPay settlement config for one Partner, rendered in the Settings tab of
// the HQ Partner detail dialog (PRO-737).
// Spec: docs/specs/PRO-737-cami-hq-camipay-config.md
//
// Two cards: the rails (mutable flags plus a gateway per rail) and the rate
// card (append-only rows). The rate card deliberately has no editable rate
// field anywhere — the only write is "Change", which appends a row with an
// effective-from date. Past rows are read-only with no edit or delete
// affordance, because a processed transaction's rate is a financial fact.

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreditCardIcon,
  InfoIcon,
  LinkIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { DatePicker } from "@/components/blocks/date-picker"
import { SectionCard } from "@/components/blocks/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { type AdminBusiness, formatDate } from "@/lib/admin-businesses"
import { useAuth } from "@/lib/auth-mock"
import {
  CAMIPAY_RAILS,
  type CamiPayRail,
  type CamiPayRate,
  computeFee,
  effectiveRate,
  explainFee,
  formatAed,
  formatEffectiveDate,
  formatRate,
  formatRateBracket,
  GATEWAYS,
  type GatewayId,
  gatewayLabel,
  merchantConfig,
  merchantRates,
  parseEffectiveDate,
  type RateRow,
  railLabel,
  scheduledRates,
  todayIso,
  useCamiPay,
} from "@/lib/hq-camipay/store"
import { cn } from "@/lib/utils"

const RAIL_ICON: Record<CamiPayRail, LucideIcon> = {
  terminal: CreditCardIcon,
  online: LinkIcon,
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                      */
/* -------------------------------------------------------------------------- */

function FootNote({
  icon: Icon = InfoIcon,
  children,
  tone = "muted",
}: {
  icon?: LucideIcon
  children: React.ReactNode
  tone?: "muted" | "warning"
}) {
  return (
    <p
      className={cn(
        "mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-4",
        tone === "muted" && "bg-muted/50 text-muted-foreground",
        tone === "warning" && "bg-cami-yellow-3 text-cami-yellow-11",
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/* -------------------------------------------------------------------------- */
/* Rails                                                                      */
/* -------------------------------------------------------------------------- */

/** Label + control, the shared shape of the Gateway and Rate rows. */
function SettingRow({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex min-h-9 items-center justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
            {label}
          </label>
        ) : (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      </div>
      {hint}
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-4 text-cami-yellow-11">
      <TriangleAlertIcon className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/**
 * Everything about one rail: whether it is on, where it routes, and what Cami
 * charges on it.
 *
 * These used to be two cards, rails and rate card, each listing the same two
 * rails in the same order. Splitting them was modelled on the write semantics,
 * mutable flags versus an append-only ledger, but that is a fact about the
 * store, not about the question being asked. Ops asks "how is Terminal set up
 * for this Partner", and the answer was spread across two places that had to be
 * read against each other. The coupling was already showing: the zero-rate
 * warning lives with the rate but reads the rail's enabled flag.
 *
 * The append-only model is unchanged and still enforced the same way, by there
 * being no editable rate field on the surface at all.
 */
function RailSection({
  business,
  rail,
  disabled,
  onChangeRate,
}: {
  business: AdminBusiness
  rail: CamiPayRail
  disabled: boolean
  onChangeRate: (rail: CamiPayRail) => void
}) {
  const camipay = useCamiPay()
  const auth = useAuth()
  // Two independent permissions on one card. Turning a rail on is operational,
  // changing a rate is commercial, and the same person does not necessarily do
  // both, so each control is gated separately rather than the card as a whole.
  const canEditRail = auth.has("billing.camipay.rails.edit") && !disabled
  const canEditRate = auth.has("billing.camipay.rates.edit") && !disabled

  const meta = CAMIPAY_RAILS.find((r) => r.id === rail)
  const config = merchantConfig(camipay, business.id)[rail]
  const Icon = RAIL_ICON[rail]
  const selectId = `${rail}-gateway`

  const current = effectiveRate(camipay, business.id, rail)
  const scheduled = scheduledRates(camipay, business.id, rail)
  const bracket = current ? formatRateBracket(current.rate) : null
  // A rail that is taking money with no rate row is charging nothing. That is
  // the defined behaviour (a missing rate is zero, not an error), but it is
  // also almost always a mistake, so it is surfaced rather than left silent.
  const liveWithoutRate = config.enabled && !current

  function handleToggle(next: boolean) {
    camipay.setRailEnabled(business.id, rail, next)
    toast.success(`${railLabel(rail)} ${next ? "enabled" : "disabled"} for ${business.name}`)
  }

  function handleGateway(next: GatewayId) {
    camipay.setRailGateway(business.id, rail, next)
    toast.success(`${railLabel(rail)} routed to ${gatewayLabel(next)}`)
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border/50 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
              config.enabled
                ? "bg-cami-violet-3 text-cami-violet-11"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{meta?.label}</span>
            <span className="text-sm leading-5 text-muted-foreground">{meta?.description}</span>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={handleToggle}
          disabled={!canEditRail}
          aria-label={`${meta?.label}, ${config.enabled ? "on" : "off"}`}
        />
      </div>

      <div className="flex flex-col gap-1.5 pl-11">
        {/* Gateway only when the rail is on: an off rail has no routing
            question to answer. The rate stays visible either way, because a
            commercial term outlives the switch, see the suspended Partner. */}
        {config.enabled ? (
          <SettingRow
            label="Gateway"
            htmlFor={selectId}
            hint={
              config.gatewayId ? null : (
                <Warning>This rail is on but has no gateway, so nothing will route.</Warning>
              )
            }
          >
            <Select
              value={config.gatewayId ?? ""}
              onValueChange={(v) => handleGateway(v as GatewayId)}
              disabled={!canEditRail}
            >
              <SelectTrigger id={selectId} className="w-56">
                <SelectValue placeholder="Select gateway" />
              </SelectTrigger>
              <SelectContent>
                {GATEWAYS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    <span className="flex items-center gap-2">
                      {g.label}
                      {g.status === "onboarding" ? (
                        <Badge variant="muted" size="sm">
                          Onboarding
                        </Badge>
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        ) : null}

        <SettingRow
          label="Rate"
          hint={
            <div className="flex flex-col gap-1.5">
              {/* Provenance only when there is a rate. The value already reads
                  "Not set", and "No rate set" under it says it twice. */}
              {current ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  From {formatEffectiveDate(current.effectiveFrom)}, set by {current.createdBy}
                </span>
              ) : null}
              {bracket ? (
                <span className="text-xs text-muted-foreground tabular-nums">{bracket}</span>
              ) : null}
              {liveWithoutRate ? (
                <Warning>
                  This rail is live with no rate, so Cami earns nothing on these payments.
                </Warning>
              ) : null}
              {scheduled.map((row) => (
                <span
                  key={row.id}
                  className="flex items-center gap-2 rounded-xl bg-cami-yellow-3 px-3 py-2 text-xs text-cami-yellow-11"
                >
                  <Badge variant="warning" size="sm">
                    Scheduled
                  </Badge>
                  <span className="tabular-nums">
                    {formatRate(row.rate)} from {formatEffectiveDate(row.effectiveFrom)}, set by{" "}
                    {row.createdBy}
                  </span>
                </span>
              ))}
            </div>
          }
        >
          <span
            className={cn(
              "text-base font-medium tabular-nums",
              current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {current ? formatRate(current.rate) : "Not set"}
          </span>
          {canEditRate ? (
            <Button
              variant="outline"
              size="sm"
              radius="full"
              onClick={() => onChangeRate(rail)}
              aria-label={`Change ${railLabel(rail)} rate`}
            >
              {current ? "Change" : "Set rate"}
            </Button>
          ) : null}
        </SettingRow>
      </div>
    </div>
  )
}

function RateHistory({ rows }: { rows: RateRow[] }) {
  const [open, setOpen] = useState(false)
  const today = todayIso()

  if (rows.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="self-start text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {open ? "Hide" : "Show"} rate history ({rows.length})
      </button>
      {open ? (
        <ol className="flex flex-col gap-0 rounded-xl bg-muted/40 px-3 py-1">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-baseline justify-between gap-3 border-b border-border/40 py-2 text-xs last:border-b-0"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-foreground">
                  {railLabel(row.rail)}, {formatRate(row.rate)}
                </span>
                {formatRateBracket(row.rate) ? (
                  <span className="text-muted-foreground tabular-nums">
                    {formatRateBracket(row.rate)}
                  </span>
                ) : null}
                <span className="text-muted-foreground">
                  Set by {row.createdBy} on {formatDate(row.createdAt)}
                </span>
              </span>
              <span className="shrink-0 text-right text-muted-foreground tabular-nums">
                {row.effectiveFrom > today ? "Starts" : "From"}{" "}
                {formatEffectiveDate(row.effectiveFrom)}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function CamiPayCard({
  business,
  disabled,
  onChangeRate,
}: {
  business: AdminBusiness
  disabled: boolean
  onChangeRate: (rail: CamiPayRail) => void
}) {
  const camipay = useCamiPay()
  const rows = merchantRates(camipay, business.id)

  return (
    <SectionCard
      title="CamiPay"
      action={<span className="text-xs text-muted-foreground">Set at Business level</span>}
    >
      <div className="flex flex-col">
        {CAMIPAY_RAILS.map((rail) => (
          <RailSection
            key={rail.id}
            business={business}
            rail={rail.id}
            disabled={disabled}
            onChangeRate={onChangeRate}
          />
        ))}
      </div>

      {/* One footnote, not two. Both sentences answer the same question, "this
          change is narrower than it looks", and two stacked grey blocks read as
          boilerplate where one reads as a rule. */}
      <FootNote>
        Turning a rail off removes it from this Partner's checkout, nothing more. Cash and off-rail
        card payments still record to the sale ledger. Changing a rate never re-prices past
        payments, so a change only applies from its effective date forward.
      </FootNote>

      {/* History stays Partner-scoped rather than moving inside each rail: the
          question ops asks is "what has this Partner been charged", not "what
          has this rail been". */}
      <RateHistory rows={rows} />
    </SectionCard>
  )
}

/* -------------------------------------------------------------------------- */
/* Change rate dialog                                                         */
/* -------------------------------------------------------------------------- */

/** Blank counts as zero, so a percentage-only rate needs no keystrokes in the fixed field. */
const amountField = (max: number, tooBig: string) =>
  z
    .string()
    .refine((v) => v.trim() === "" || !Number.isNaN(Number(v)), "Numbers only")
    .refine((v) => v.trim() === "" || Number(v) >= 0, "Cannot be negative")
    .refine((v) => v.trim() === "" || Number(v) <= max, tooBig)

const rateSchema = z
  .object({
    percent: amountField(100, "Must be 100 or less"),
    fixed: amountField(1000, "That is above AED 1,000"),
    bracketEnabled: z.boolean(),
    bracketAmount: amountField(1_000_000, "That is above AED 1,000,000"),
    effectiveFrom: z.string().min(1, "Pick a date"),
  })
  // A rate of nothing is a real state, but it is reached by leaving the rail
  // unconfigured, not by writing a zero row. Saving 0% + AED 0 would look like
  // a decision and behave like an absence.
  .refine((v) => num(v.percent) > 0 || num(v.fixed) > 0, {
    message: "Enter a percentage, a fixed fee, or both",
    path: ["percent"],
  })
  .refine((v) => !v.bracketEnabled || num(v.bracketAmount) > 0, {
    message: "Enter the amount the fixed fee stops applying at",
    path: ["bracketAmount"],
  })
type RateValues = z.infer<typeof rateSchema>

function blankRate(today: string): RateValues {
  return { percent: "", fixed: "", bracketEnabled: false, bracketAmount: "", effectiveFrom: today }
}

function num(v: string): number {
  const n = Number(v)
  return v.trim() === "" || Number.isNaN(n) ? 0 : n
}

/** AED as typed to fils as stored. */
function toMinor(v: string): number {
  return Math.round(num(v) * 100)
}

function valuesToRate(values: RateValues): CamiPayRate {
  const fixedMinor = toMinor(values.fixed)
  const below = toMinor(values.bracketAmount)
  // A bracket needs both a fixed fee to gate and a threshold to gate it at.
  // Without either it is dropped rather than stored as a rule that can never
  // fire, which also keeps the preview honest while the amount is still empty.
  const bracketed = values.bracketEnabled && fixedMinor > 0 && below > 0
  return {
    percent: num(values.percent),
    fixedMinor,
    fixedBelowMinor: bracketed ? below : null,
  }
}

/** One line of the worked example under the dialog fields. */
function WorkedExample({ rate, amountMinor }: { rate: CamiPayRate; amountMinor: number }) {
  const fee = computeFee(rate, amountMinor)
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs tabular-nums">
      <span className="text-muted-foreground">
        On {formatAed(amountMinor)}, {explainFee(rate, amountMinor)}
      </span>
      <span className="shrink-0 font-medium text-foreground">{formatAed(fee.totalMinor)}</span>
    </div>
  )
}

function ChangeRateDialog({
  open,
  onOpenChange,
  business,
  rail,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  rail: CamiPayRail
}) {
  const camipay = useCamiPay()
  const auth = useAuth()
  const today = todayIso()
  const current = effectiveRate(camipay, business.id, rail)

  const form = useForm<RateValues>({
    resolver: zodResolver(rateSchema as never),
    defaultValues: blankRate(today),
  })

  // Every open starts from empty. Carrying the last attempt over would let
  // someone re-submit a rate they had abandoned, and a rate row cannot be
  // taken back once written.
  useEffect(() => {
    if (open) form.reset(blankRate(todayIso()))
  }, [open, form])

  const values = form.watch()
  const effectiveFrom = values.effectiveFrom
  const isScheduled = Boolean(effectiveFrom) && effectiveFrom > today
  const draft = valuesToRate(values)
  const showPreview = Boolean(effectiveFrom) && (draft.percent > 0 || draft.fixedMinor > 0)

  // Sample amounts for the worked example. With a bracket, one either side of
  // it, because the whole reason a bracket exists is that the two behave
  // differently and nobody should have to take that on trust.
  const samples =
    draft.fixedBelowMinor !== null
      ? [Math.max(500, Math.round(draft.fixedBelowMinor / 2)), draft.fixedBelowMinor + 5000]
      : [12000]

  function onSubmit(v: RateValues) {
    const rate = valuesToRate(v)
    camipay.addRate({
      merchantId: business.id,
      rail,
      rate,
      effectiveFrom: v.effectiveFrom,
      createdBy: auth.user.name,
    })
    toast.success(
      v.effectiveFrom > today
        ? `${railLabel(rail)} rate scheduled for ${formatEffectiveDate(v.effectiveFrom)}`
        : `${railLabel(rail)} rate is now ${formatRate(rate)}`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* Not lowercased: "camipay terminal" reads as a typo, and CamiPay
              is a product name before it is a word in a sentence. */}
          <DialogTitle>Change {railLabel(rail)} rate</DialogTitle>
          <DialogDescription>
            {business.name} is on{" "}
            <span className="font-medium text-foreground">
              {current ? formatRate(current.rate) : "no rate"}
            </span>
            {current ? ` since ${formatEffectiveDate(current.effectiveFrom)}` : ""}. A change is
            added to the rate card, it does not overwrite what came before.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            {/* Percentage and fixed sit side by side because they are one
                rate, not two settings. "3% + AED 0.75" is how the commercial
                team says it, and stacking them would read as a choice. */}
            <div className="flex items-start gap-3">
              <FormField
                control={form.control}
                name="percent"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Percentage</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="1.8"
                          className="pr-10"
                          {...field}
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground"
                        >
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span aria-hidden className="pt-9 text-sm font-medium text-muted-foreground">
                +
              </span>
              <FormField
                control={form.control}
                name="fixed"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fixed per transaction</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground"
                        >
                          AED
                        </span>
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="0.00"
                          className="pl-14"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* The bracket only has meaning once a fixed fee exists to gate. */}
            {draft.fixedMinor > 0 ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4">
                <FormField
                  control={form.control}
                  name="bracketEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <FormLabel>Drop the fixed fee on larger sales</FormLabel>
                        <span className="text-xs leading-4 text-muted-foreground">
                          Above the amount you set, the Partner pays the percentage alone.
                        </span>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label="Drop the fixed fee on larger sales"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {values.bracketEnabled ? (
                  <FormField
                    control={form.control}
                    name="bracketAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed fee applies below</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground"
                            >
                              AED
                            </span>
                            <Input
                              inputMode="decimal"
                              autoComplete="off"
                              placeholder="100.00"
                              className="pl-14"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective from</FormLabel>
                  <FormControl>
                    {/* Forward-only: a rate cannot be backdated, or it would
                        re-price payments that are already captured. */}
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disableBefore={parseEffectiveDate(today)}
                      placeholder="Select date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showPreview ? (
              <div className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4 text-sm">
                <span className="flex items-start gap-2 text-muted-foreground">
                  <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Payments captured before{" "}
                    <span className="font-medium text-foreground">
                      {formatEffectiveDate(effectiveFrom)}
                    </span>{" "}
                    stay at{" "}
                    <span className="font-medium text-foreground">
                      {current ? formatRate(current.rate) : "their captured rate"}
                    </span>
                    . From that date, Cami charges{" "}
                    <span className="font-medium text-foreground">{formatRate(draft)}</span>.
                  </span>
                </span>
                <div className="flex flex-col gap-1 border-t border-border/50 pt-3">
                  {samples.map((amountMinor) => (
                    <WorkedExample key={amountMinor} rate={draft} amountMinor={amountMinor} />
                  ))}
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isScheduled ? "Schedule change" : "Apply change"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export type HqCamiPayPanelProps = {
  business: AdminBusiness
  /** Archived Partners render read-only, matching the other detail tabs. */
  disabled?: boolean
}

export function HqCamiPayPanel({ business, disabled = false }: HqCamiPayPanelProps) {
  const auth = useAuth()
  const [rateDialogRail, setRateDialogRail] = useState<CamiPayRail | null>(null)

  const readOnly =
    disabled || (!auth.has("billing.camipay.rails.edit") && !auth.has("billing.camipay.rates.edit"))

  return (
    <>
      <div className="flex flex-col gap-4">
        {readOnly ? (
          <FootNote tone="warning" icon={InfoIcon}>
            {disabled
              ? "This Partner is archived, settlement config is read-only."
              : "You have view-only access to settlement config. Ask an HQ admin for CamiPay edit rights."}
          </FootNote>
        ) : null}
        <CamiPayCard
          business={business}
          disabled={disabled}
          onChangeRate={(rail) => setRateDialogRail(rail)}
        />
      </div>

      {rateDialogRail ? (
        <ChangeRateDialog
          open={rateDialogRail !== null}
          onOpenChange={(next) => {
            if (!next) setRateDialogRail(null)
          }}
          business={business}
          rail={rateDialogRail}
        />
      ) : null}
    </>
  )
}
