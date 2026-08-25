"use client"

// The Partner's own view of their CamiPay rates, inside app settings →
// Payments → CamiPay rates (PRO-737).
// Spec: docs/specs/PRO-737-camipay-fee-visibility.md
//
// Read-only, and read-only in the strong sense: there is no disabled control
// anywhere on this screen. A rate is a commercial term Cami sets, so a greyed
// field would imply a permission the Partner could be granted, when what they
// actually need is their account manager.
//
// Two things are deliberately absent:
//
// - The gateway. Whether a payment routes through NeoPay or Tap is Cami's
//   plumbing, and naming it invites questions the Partner cannot act on.
// - The processing fee. Maaz: the Partner sees Cami's fee only. What Cami pays
//   its providers sits behind that number.
//
// It reads the same store HQ writes to, so a change made on the HQ rate card
// shows up here with no sync step, which is the point of demoing them together.

import { CreditCardIcon, InfoIcon, LinkIcon, type LucideIcon } from "lucide-react"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { Badge } from "@/components/ui/badge"
import { useDemoBusiness } from "@/lib/demo-business"
import {
  CAMIPAY_RAILS,
  type CamiPayRail,
  DEMO_MERCHANT_ID,
  effectiveRate,
  formatEffectiveDate,
  formatRate,
  formatRateBracket,
  merchantConfig,
  scheduledRates,
  useCamiPay,
} from "@/lib/hq-camipay/store"
import { cn } from "@/lib/utils"

const RAIL_ICON: Record<CamiPayRail, LucideIcon> = {
  terminal: CreditCardIcon,
  online: LinkIcon,
}

function RailCard({ rail }: { rail: CamiPayRail }) {
  const camipay = useCamiPay()
  const meta = CAMIPAY_RAILS.find((r) => r.id === rail)
  const config = merchantConfig(camipay, DEMO_MERCHANT_ID)[rail]
  const current = effectiveRate(camipay, DEMO_MERCHANT_ID, rail)
  const scheduled = scheduledRates(camipay, DEMO_MERCHANT_ID, rail)
  const bracket = current ? formatRateBracket(current.rate) : null
  const Icon = RAIL_ICON[rail]

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              config.enabled
                ? "bg-cami-violet-3 text-cami-violet-11"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2 text-base font-semibold text-foreground">
              {meta?.label}
              {config.enabled ? null : (
                <Badge variant="muted" size="sm">
                  Not enabled
                </Badge>
              )}
            </span>
            <span className="text-sm leading-5 text-muted-foreground">{meta?.description}</span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-lg font-semibold tabular-nums",
            current ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {/* "No fee" rather than a dash: an unset rate is a real, and
              favourable, commercial position, not missing data. */}
          {current ? formatRate(current.rate) : "No fee"}
        </span>
      </div>

      {bracket || current ? (
        <div className="flex flex-col gap-0.5 ps-13 text-xs leading-4 text-muted-foreground">
          {bracket ? <span className="tabular-nums">{bracket}</span> : null}
          {current ? (
            <span>In place since {formatEffectiveDate(current.effectiveFrom)}</span>
          ) : null}
        </div>
      ) : null}

      {/* An agreed future change is the Partner's business too — finding out
          from an invoice is how trust in the number goes. */}
      {scheduled.map((row) => (
        <p
          key={row.id}
          className="flex items-center gap-2 rounded-xl bg-cami-yellow-3 px-3 py-2 text-xs leading-4 text-cami-yellow-11"
        >
          <Badge variant="warning" size="sm">
            Upcoming
          </Badge>
          <span className="tabular-nums">
            {formatRate(row.rate)} from {formatEffectiveDate(row.effectiveFrom)}
          </span>
        </p>
      ))}
    </section>
  )
}

export function CamiPayRatesPanel({
  onBack,
  breadcrumbRoot,
}: {
  onBack: () => void
  breadcrumbRoot: { label: string; icon: LucideIcon }
}) {
  const { name: businessName } = useDemoBusiness()

  return (
    <SettingsPanel
      header={
        <>
          <NotionBreadcrumb
            segments={[
              { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
              { label: "CamiPay rates" },
            ]}
          />
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              CamiPay rates
            </h2>
            <p className="text-sm leading-5 text-muted-foreground">
              What Cami charges {businessName} on payments taken through CamiPay.
            </p>
          </header>
        </>
      }
    >
      <div className="flex w-full flex-col gap-3 sm:w-fit sm:min-w-146 sm:max-w-146">
        {CAMIPAY_RAILS.map((rail) => (
          <RailCard key={rail.id} rail={rail.id} />
        ))}

        <p className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-4 text-muted-foreground">
          <InfoIcon className="mt-px size-3.5 shrink-0" />
          <span>
            This is everything Cami charges. Card processing is already covered by it, and nothing
            else is deducted from a payment. Each payment keeps the rate that was live on the day it
            was taken, so a rate change never affects money you have already been paid. To discuss
            your rates, talk to your Cami account manager.
          </span>
        </p>
      </div>
    </SettingsPanel>
  )
}
