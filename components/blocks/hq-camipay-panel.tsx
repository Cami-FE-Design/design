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
  PercentIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { DatePicker } from "@/components/blocks/date-picker"
import { EmptyState } from "@/components/blocks/empty-state"
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
  effectiveRate,
  formatEffectiveDate,
  formatRate,
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

function Card({
  title,
  hint,
  children,
}: {
  title: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex items-center justify-between gap-2 pb-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {hint}
      </header>
      {children}
    </section>
  )
}

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

function RailRow({
  business,
  rail,
  disabled,
}: {
  business: AdminBusiness
  rail: CamiPayRail
  disabled: boolean
}) {
  const camipay = useCamiPay()
  const auth = useAuth()
  const canEdit = auth.has("billing.camipay.rails.edit") && !disabled

  const meta = CAMIPAY_RAILS.find((r) => r.id === rail)
  const config = merchantConfig(camipay, business.id)[rail]
  const Icon = RAIL_ICON[rail]
  const selectId = `${rail}-gateway`

  function handleToggle(next: boolean) {
    camipay.setRailEnabled(business.id, rail, next)
    toast.success(`${railLabel(rail)} ${next ? "enabled" : "disabled"} for ${business.name}`)
  }

  function handleGateway(next: GatewayId) {
    camipay.setRailGateway(business.id, rail, next)
    toast.success(`${railLabel(rail)} routed to ${gatewayLabel(next)}`)
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/50 py-3.5 last:border-b-0">
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
          disabled={!canEdit}
          aria-label={`${meta?.label}, ${config.enabled ? "on" : "off"}`}
        />
      </div>

      {config.enabled ? (
        <div className="flex items-center justify-between gap-3 pl-11">
          <label htmlFor={selectId} className="text-sm text-muted-foreground">
            Gateway
          </label>
          <Select
            value={config.gatewayId ?? ""}
            onValueChange={(v) => handleGateway(v as GatewayId)}
            disabled={!canEdit}
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
        </div>
      ) : null}

      {config.enabled && !config.gatewayId ? (
        <p className="flex items-center gap-2 pl-11 text-xs text-cami-yellow-11">
          <TriangleAlertIcon className="size-3.5 shrink-0" />
          This rail is on but has no gateway, so nothing will route.
        </p>
      ) : null}
    </div>
  )
}

function RailsCard({ business, disabled }: { business: AdminBusiness; disabled: boolean }) {
  return (
    <Card title="CamiPay rails">
      <div className="flex flex-col">
        {CAMIPAY_RAILS.map((rail) => (
          <RailRow key={rail.id} business={business} rail={rail.id} disabled={disabled} />
        ))}
      </div>
      <FootNote>
        Turning a rail off removes it from this Partner's checkout, nothing more. Cash and off-rail
        card payments still record to the sale ledger.
      </FootNote>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Rate card                                                                  */
/* -------------------------------------------------------------------------- */

function RateRailRow({
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
  const canEdit = auth.has("billing.camipay.rates.edit") && !disabled

  const current = effectiveRate(camipay, business.id, rail)
  const scheduled = scheduledRates(camipay, business.id, rail)

  return (
    <div className="flex flex-col gap-2 border-b border-border/50 py-3.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{railLabel(rail)}</span>
          <span className="text-xs text-muted-foreground">
            {current
              ? `From ${formatEffectiveDate(current.effectiveFrom)}, set by ${current.createdBy}`
              : "No rate set"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              "text-base font-medium tabular-nums",
              current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {current ? formatRate(current.rate) : "Not set"}
          </span>
          {canEdit ? (
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
        </div>
      </div>

      {scheduled.map((row) => (
        <div
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
        </div>
      ))}
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

function RateCard({
  business,
  disabled,
  onChangeRate,
}: {
  business: AdminBusiness
  disabled: boolean
  onChangeRate: (rail: CamiPayRail) => void
}) {
  const camipay = useCamiPay()
  const auth = useAuth()
  const rows = merchantRates(camipay, business.id)
  const canEdit = auth.has("billing.camipay.rates.edit") && !disabled

  return (
    <Card
      title="Rate card"
      hint={<span className="text-xs text-muted-foreground">Set at Business level</span>}
    >
      {rows.length === 0 ? (
        <EmptyState
          className="py-4"
          icon={PercentIcon}
          title="No rate card yet"
          description="Set a take rate per rail before this Partner starts taking CamiPay."
          action={
            canEdit ? (
              <Button variant="outline" radius="full" onClick={() => onChangeRate("terminal")}>
                Set terminal rate
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="flex flex-col">
          {CAMIPAY_RAILS.map((rail) => (
            <RateRailRow
              key={rail.id}
              business={business}
              rail={rail.id}
              disabled={disabled}
              onChangeRate={onChangeRate}
            />
          ))}
        </div>
      )}

      <FootNote>
        Changing a rate never re-prices past payments. Every payment keeps the rate that was live
        when it was captured, so a change only applies from its effective date forward.
      </FootNote>

      <RateHistory rows={rows} />
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Change rate dialog                                                         */
/* -------------------------------------------------------------------------- */

const rateSchema = z.object({
  rate: z
    .string()
    .min(1, "Enter a rate")
    .refine((v) => !Number.isNaN(Number(v)), "Numbers only")
    .refine((v) => Number(v) > 0, "Must be above 0")
    .refine((v) => Number(v) <= 100, "Must be 100 or less"),
  effectiveFrom: z.string().min(1, "Pick a date"),
})
type RateValues = z.infer<typeof rateSchema>

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
    defaultValues: { rate: "", effectiveFrom: today },
  })

  useEffect(() => {
    if (open) form.reset({ rate: "", effectiveFrom: today })
  }, [open, form, today])

  const nextRate = form.watch("rate")
  const effectiveFrom = form.watch("effectiveFrom")
  const isScheduled = Boolean(effectiveFrom) && effectiveFrom > today
  const parsed = Number(nextRate)
  const showPreview = Boolean(effectiveFrom) && Boolean(nextRate) && !Number.isNaN(parsed)

  function onSubmit(values: RateValues) {
    camipay.addRate({
      merchantId: business.id,
      rail,
      rate: Number(values.rate),
      effectiveFrom: values.effectiveFrom,
      createdBy: auth.user.name,
    })
    toast.success(
      values.effectiveFrom > today
        ? `${railLabel(rail)} rate scheduled for ${formatEffectiveDate(values.effectiveFrom)}`
        : `${railLabel(rail)} rate is now ${formatRate(Number(values.rate))}`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change {railLabel(rail).toLowerCase()} rate</DialogTitle>
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
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New rate</FormLabel>
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
              <div className="flex flex-col gap-1.5 rounded-2xl bg-muted/60 p-4 text-sm">
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
                    <span className="font-medium text-foreground">{formatRate(parsed)}</span>.
                  </span>
                </span>
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
        <RailsCard business={business} disabled={disabled} />
        <RateCard
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
