"use client"

/**
 * One deal in full — `DealDetailView` on the dev repo's `promotion-discount-ui`.
 *
 * The same drill-down as the Locations settings panel: breadcrumb back to the
 * list, the deal's name and status, and three ghost tabs. Row-level actions
 * live on the list.
 *
 * The built Availability tab can only print "All locations", and its Edit says
 * editing is coming soon: every deal it creates has `locationIds: []`. Here
 * that row names the deal's real reach and Edit opens the location picker.
 */

import {
  AlignLeftIcon,
  BoxIcon,
  CalendarClockIcon,
  CalendarIcon,
  ChevronRightIcon,
  CirclePercentIcon,
  ClockIcon,
  CopyIcon,
  HashIcon,
  type LucideIcon,
  MapPinIcon,
  TagIcon,
  UserCheckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { DealScopePickerDialog } from "@/components/blocks/deals/deal-scope-picker-dialog"
import { DealWizardDialog } from "@/components/blocks/deals/deal-wizard-dialog"
import { groupByCity, scopeFromPicked } from "@/components/blocks/deals/deal-wizard-steps"
import { formatMinor, STATUS_BADGE } from "@/components/blocks/deals/deals-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  applyToRows,
  DEAL_TYPE_LABEL,
  type Deal,
  formatDealSummary,
  formatLocations,
  resolvedStatus,
} from "@/lib/deals/mock"
import { saveDeal } from "@/lib/deals/store"
import { isRunnable } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"

const APPLY_ICON = { services: WrenchIcon, products: BoxIcon, packages: TagIcon } as const

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatAmount(value: number) {
  return `AED ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-border/60 p-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-semibold text-2xl text-foreground">{value}</span>
    </div>
  )
}

/** Settings-style info row — icon tile + muted label over medium value. */
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-muted-foreground text-sm leading-5">{label}</span>
        <span className="min-w-0 truncate font-medium text-foreground text-sm leading-5">
          {children}
        </span>
      </div>
    </div>
  )
}

export function DealDetailView({
  deal,
  todayIso,
  onBack,
}: {
  deal: Deal
  todayIso: string
  /** Returns to the deals list (breadcrumb back navigation). */
  onBack: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [locationsOpen, setLocationsOpen] = useState(false)
  const { granted, grants, locationName } = useLocations()
  const status = STATUS_BADGE[resolvedStatus(deal, todayIso)]
  const holdsEstate = grants === "all"
  // A manager sees only their own branches in the picker, so a chain-wide deal
  // is not theirs to narrow (R04).
  const mayEditLocations = holdsEstate || deal.scope.kind === "branches"

  return (
    <Tabs
      defaultValue="overview"
      className="flex min-h-0 flex-1 animate-in flex-col duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] slide-in-from-right-12"
    >
      <div className="shrink-0 border-border/40 border-b px-6 pt-9 pb-4 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 text-muted-foreground text-sm leading-5 transition-colors hover:bg-muted hover:text-foreground"
          >
            <CirclePercentIcon className="size-4" />
            Deals
          </button>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          <span className="truncate px-1.5 font-medium text-foreground text-sm leading-5">
            {deal.name}
          </span>
        </nav>

        <header className="mt-6 flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-heading font-semibold text-2xl text-foreground leading-8">
              {deal.name}
            </h2>
            <Badge variant={status.variant} className="h-6 shrink-0 rounded-full px-2.5">
              {status.label}
            </Badge>
          </div>
          <p className="truncate text-muted-foreground text-sm leading-5">
            {DEAL_TYPE_LABEL[deal.type]}: {formatDealSummary(deal)}
          </p>
        </header>

        <div className="no-scrollbar -mx-1 mt-6 overflow-x-auto px-1">
          <TabsList variant="ghost" className="w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-9 lg:px-10">
        <TabsContent value="overview">
          <div className="flex w-full flex-col gap-6 sm:w-146">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total sales" value={formatMinor(deal.totalSalesMinor)} />
              <StatCard label="Promotions applied" value={String(deal.redemptions)} />
              <StatCard label="Total clients" value={String(deal.totalClients)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="flex w-full flex-col gap-6 sm:w-146">
            <div className="flex flex-col gap-6 rounded-2xl border border-border/60 p-5">
              <header className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-semibold text-foreground text-lg leading-7">
                  Details
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  radius="full"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              </header>
              <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <InfoRow icon={CirclePercentIcon} label="Promotion value">
                  {deal.discountKind === "percentage"
                    ? `${deal.discountValue}%`
                    : formatAmount(deal.discountValue)}
                </InfoRow>
                {applyToRows(deal.applicability).map((row) => (
                  <InfoRow key={row.key} icon={APPLY_ICON[row.key]} label={row.label}>
                    {row.value}
                  </InfoRow>
                ))}
                <InfoRow icon={CalendarIcon} label="Start date">
                  {formatDay(deal.startDate)}
                </InfoRow>
                <InfoRow icon={CalendarClockIcon} label="End date">
                  {deal.endDate ? formatDay(deal.endDate) : "No end date"}
                </InfoRow>
                {deal.discountCode ? (
                  <InfoRow icon={CirclePercentIcon} label="Discount code">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(deal.discountCode)
                        toast.success("Discount code copied")
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {deal.discountCode}
                      <CopyIcon className="size-3.5" />
                    </button>
                  </InfoRow>
                ) : null}
                <InfoRow icon={UserCheckIcon} label="One use per client">
                  {deal.limits.oneUsePerClient ? "Yes" : "No"}
                </InfoRow>
                <InfoRow icon={HashIcon} label="Usage limit">
                  {deal.limits.totalUsesEnabled && deal.limits.totalUses != null
                    ? `${deal.limits.totalUses} total uses`
                    : "Unlimited"}
                </InfoRow>
                <InfoRow icon={WalletIcon} label="Minimum purchase">
                  {deal.limits.minimumPurchaseEnabled && deal.limits.minimumPurchaseAmount != null
                    ? formatAmount(deal.limits.minimumPurchaseAmount)
                    : "None"}
                </InfoRow>
                <InfoRow icon={ClockIcon} label="Date created">
                  {new Date(deal.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </InfoRow>
                {deal.description ? (
                  <InfoRow icon={AlignLeftIcon} label="Description">
                    {deal.description}
                  </InfoRow>
                ) : null}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <div className="flex w-full flex-col gap-6 sm:w-146">
            <div className="flex flex-col gap-6 rounded-2xl border border-border/60 p-5">
              <header className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-semibold text-foreground text-lg leading-7">
                  Availability
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  radius="full"
                  disabled={!mayEditLocations}
                  onClick={() => setLocationsOpen(true)}
                >
                  Edit
                </Button>
              </header>
              <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <InfoRow icon={MapPinIcon} label="Locations">
                  {formatLocations(deal.scope, locationName)}
                </InfoRow>
                <InfoRow icon={UsersIcon} label="Team members">
                  {deal.teamMemberIds.length > 0
                    ? `${deal.teamMemberIds.length} selected`
                    : "All team members"}
                </InfoRow>
              </div>
              {!isRunnable(deal.scope) ? (
                <p className="rounded-xl bg-cami-tomato-2 p-3 text-foreground text-sm">
                  This deal has no locations, so it cannot be used anywhere. Select at least one.
                </p>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </div>

      <DealWizardDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        dealToEdit={deal}
        todayIso={todayIso}
        onSave={saveDeal}
      />

      <DealScopePickerDialog
        open={locationsOpen}
        onOpenChange={setLocationsOpen}
        title="Select locations"
        searchPlaceholder="Search by location name"
        allLabel="Select all"
        itemNounSingular="location"
        itemNounPlural="locations"
        groups={groupByCity(granted).map((g) => ({
          id: g.city,
          // A single city is no grouping, so the picker draws a flat list.
          name: groupByCity(granted).length > 1 ? g.city : "",
          items: g.locations.map((l) => ({ id: l.id, name: l.name })),
        }))}
        value={deal.scope.kind === "estate" ? null : new Set(deal.scope.locationIds as string[])}
        onApply={(next) => {
          const picked = next === null ? granted.map((l) => l.id) : [...next]
          // Branches outside this reader's grant were never in the picker, so
          // they stay as they were rather than being dropped unseen.
          const unseen =
            deal.scope.kind === "branches"
              ? deal.scope.locationIds.filter((id) => !granted.some((l) => l.id === id))
              : []
          const scope = scopeFromPicked(picked, granted, holdsEstate)
          saveDeal({
            ...deal,
            scope:
              scope.kind === "branches"
                ? { kind: "branches", locationIds: [...scope.locationIds, ...unseen] }
                : scope,
          })
          toast.success("Deal updated")
        }}
      />
    </Tabs>
  )
}
