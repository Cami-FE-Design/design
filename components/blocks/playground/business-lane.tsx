"use client"

import { CirclePlusIcon, CreditCardIcon } from "lucide-react"
import { Suspense, useState } from "react"
import { toast } from "sonner"
import { AppointmentBlock } from "@/components/blocks/appointments/appointment-block"
import { AppointmentQuickPanel } from "@/components/blocks/appointments/appointment-popover"
import { AppointmentsToolbar } from "@/components/blocks/appointments/appointments-toolbar"
import { BranchDayStrip } from "@/components/blocks/appointments/branch-day-strip"
import { ClientOpenAppointmentsBanner } from "@/components/blocks/appointments/client-open-appointments-banner"
import { MoveToBranchDialog } from "@/components/blocks/appointments/move-to-branch-dialog"
import { ServicePickerPanel } from "@/components/blocks/appointments/new-appointment-service-picker"
import { PeopleGrid } from "@/components/blocks/appointments/people-grid"
import { PickupFields } from "@/components/blocks/appointments/pickup-fields"
import { ConfirmStep } from "@/components/blocks/booking/booking-flow"
import { PromoCodeField } from "@/components/blocks/booking/promo-code-field"
import { ServicePicker } from "@/components/blocks/booking/service-picker"
import {
  CategoryAtBranchPreview,
  type PreviewCategory,
} from "@/components/blocks/catalog/category-at-branch-preview"
import { EditServicePanel } from "@/components/blocks/catalog/edit-service-panel"
import { ClientDetailDialog } from "@/components/blocks/clients/client-detail-dialog"
import { ClientNoteBanner } from "@/components/blocks/clients/client-note-banner"
import { PetNotesFields, PetNotesList } from "@/components/blocks/clients/pet-notes-fields"
import { CardJourney } from "@/components/blocks/customer-card/card-journey"
import { CustomerCard } from "@/components/blocks/customer-card/customer-card"
import { TwoFaces } from "@/components/blocks/customer-card/two-faces"
import { DealDetailsStep } from "@/components/blocks/deals/deal-wizard-steps"
import { DealsPage } from "@/components/blocks/deals/deals-page"
import { DealsTable } from "@/components/blocks/deals/deals-table"
import { clientPetOutcome } from "@/components/blocks/imports/clients/client-pet-flow"
import { ClientReviewPanel } from "@/components/blocks/imports/clients/client-review-panel"
import {
  CLIENT_GRID,
  ClientReviewRow,
  PET_GRID,
  rowStatusKey,
} from "@/components/blocks/imports/clients/client-review-row"
import { DonePanel } from "@/components/blocks/imports/redesign/done-panel"
import { IssueSummary } from "@/components/blocks/imports/redesign/issue-summary"
import { OutcomePanel } from "@/components/blocks/imports/redesign/outcome-panel"
import { OutcomeStrip } from "@/components/blocks/imports/redesign/outcome-strip"
import { ReviewPanel } from "@/components/blocks/imports/redesign/review-panel"
import { REVIEW_GRID_TEMPLATE, ReviewRow } from "@/components/blocks/imports/redesign/review-row"
import { InboxPhase0Showcase } from "@/components/blocks/inbox-phase-0/showcase"
import {
  type BankAccountDemoState,
  BankAccountPanel,
} from "@/components/blocks/money/bank-account-panel"
import {
  type BillingDetailsDemoState,
  BillingDetailsPanel,
} from "@/components/blocks/money/billing-details-panel"
import { MoneyActivityView } from "@/components/blocks/money/money-activity"
import { MoneyByLocationView } from "@/components/blocks/money/money-by-location"
import { MoneyFeesView } from "@/components/blocks/money/money-fees"
import { MoneySummaryView } from "@/components/blocks/money/money-summary"
import { AmountInput } from "@/components/blocks/payment-policy/amount-input"
import { Lane, LazyMount, Row, Section, StatePicker } from "@/components/blocks/playground/kit"
import {
  SelectBrandDialog,
  SelectCategoryDialog,
  SelectSupplierDialog,
} from "@/components/blocks/products/product-attribute-dialogs"
import { ProductBranchStock } from "@/components/blocks/products/product-branch-stock"
import { PublicBranchPicker } from "@/components/blocks/public/public-branch-picker"
import { CapacityHeatmap } from "@/components/blocks/reports/charts/capacity-heatmap"
import { DonutChart } from "@/components/blocks/reports/charts/donut-chart"
import { FunnelChart } from "@/components/blocks/reports/charts/funnel-chart"
import { RankedBarChart } from "@/components/blocks/reports/charts/ranked-bar-chart"
import { DashboardReport } from "@/components/blocks/reports/dashboard-report"
import { DetailedTableReport } from "@/components/blocks/reports/detailed-table-report"
import { TableReport } from "@/components/blocks/reports/table-report"
import { CamiPayFeeBreakdown } from "@/components/blocks/sales/camipay-fee-breakdown"
import { EmailInvoiceDialog } from "@/components/blocks/sales/email-invoice-dialog"
import { InvoiceDocumentView } from "@/components/blocks/sales/invoice-document"
import {
  CartContent,
  CartFooter,
  CheckoutFooter,
} from "@/components/blocks/sales/new-sale/cart-summary"
import {
  GiftCardDialog,
  newGiftCardDraft,
} from "@/components/blocks/sales/new-sale/gift-card-dialog"
import { PaymentLinkLockScreen } from "@/components/blocks/sales/new-sale/payment-link-lock"
import { PaymentView } from "@/components/blocks/sales/new-sale/payment-view"
import { RedeemGiftCardDialog } from "@/components/blocks/sales/new-sale/redeem-gift-card-dialog"
import { SelectTerminalDialog } from "@/components/blocks/sales/new-sale/select-terminal-dialog"
import { SelfCheckoutDialog } from "@/components/blocks/sales/new-sale/self-checkout-dialog"
import { TerminalLockScreen } from "@/components/blocks/sales/new-sale/terminal-lock"
import {
  PackageBranchWarning,
  type PackageDecision,
} from "@/components/blocks/sales/package-branch-warning"
import {
  ShareInvoiceDialog,
  type ShareLinkState,
} from "@/components/blocks/sales/share-invoice-dialog"
import { CategorySidebar } from "@/components/blocks/service-menu/CategorySidebar"
import { ServiceCardInner } from "@/components/blocks/service-menu/ServiceCard"
import { ServiceLocationsSection } from "@/components/blocks/service-menu/ServiceLocationsSection"
import { CommsTemplatesPanel } from "@/components/blocks/settings/comms-templates-panel"
import { GoogleReviewLinkField } from "@/components/blocks/settings/google-review-link-field"
import { AddLocationsTakeover, LocationForm } from "@/components/blocks/settings/location-form"
import { LocationStatusBadge } from "@/components/blocks/settings/location-status-badge"
import { NotificationsSettingsPanel } from "@/components/blocks/settings/notifications-settings-panel"
import { TerminalsPanel } from "@/components/blocks/settings/terminals-panel"
import { WhatsAppNumbersPanel } from "@/components/blocks/settings/whatsapp-numbers-panel"
import { WhoMayChangeBranch } from "@/components/blocks/settings/who-may-change-branch"
import { WriteTargetLocation } from "@/components/blocks/settings/write-target-location"
import { NavigateToAddress } from "@/components/blocks/shared/navigate-to-address"
import type { SurfaceStatus } from "@/components/blocks/shared/surface-states"
import { LocationSwitcher } from "@/components/blocks/shell/location-switcher"
import { NoLocationAccess } from "@/components/blocks/shell/no-location-access"
import { ScheduledShifts } from "@/components/blocks/team/scheduled-shifts"
import { TeamAccessDialog } from "@/components/blocks/team/team-access-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PlaceRef } from "@/lib/address"
import {
  MOCK_BOOKINGS,
  MOCK_SERVICE_CATALOG,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
  type MockServiceCategory,
} from "@/lib/appointments/mock"
import {
  BOOKING_DAYS,
  BOOKING_STAFF,
  bookingDaysForLocation,
  bookingPromoLines,
  bookingStaffForLocation,
  findCatalogService,
  SERVICE_CATEGORIES,
  slotGroupsForLocation,
} from "@/lib/booking"
import { checkGoogleReviewLink } from "@/lib/business-links/links"
import { openAppointmentsFor } from "@/lib/clients/open-appointments"
import { getCustomerCard } from "@/lib/customer-card/mock"
import { CUSTOMER_CARD_THEMES, getCustomerCardTheme } from "@/lib/customer-card/theme"
import { MOCK_DEALS } from "@/lib/deals/mock"
import { type BookingPromoContext, CHECK_FAILED, evaluateBookingCode } from "@/lib/deals/online"
import { createEmptyDealDraft } from "@/lib/deals/wizard"
import { formatAed } from "@/lib/format"
import { ZERO_RATE } from "@/lib/hq-camipay/store"
import { type ClientPetScenarioId, getClientPetScenario } from "@/lib/imports/client-pet-mock"
import { groupIssues } from "@/lib/imports/issues"
import { applySummaryFor, getScenario, type ImportScenarioId } from "@/lib/imports/mock"
import { placeholderSkuRows, reviewCounts } from "@/lib/imports/outcome"
import type { ProductImportPreviewRow, RowOverride } from "@/lib/imports/types"
import type { BranchStock } from "@/lib/inventory/branch-stock"
import { BRANCH_STOCK } from "@/lib/inventory/mock"
import { INVOICE_FIXTURES } from "@/lib/invoice/mock"
import { bookingsInScope } from "@/lib/locations/calendar-scope"
import { formatDayHours, isOpenNow, WEEK_DAYS } from "@/lib/locations/hours"
import { locationName as estateLocationName, NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import {
  describeScope,
  isRunnable,
  type PromotionScope,
  reaches,
} from "@/lib/locations/promotion-scope"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { resolveTimezone, timezoneLabel } from "@/lib/locations/timezone"
import type { TerminalFeeModel } from "@/lib/money/fees"
import { defaultRange, MONEY_TXS, PAYOUTS, periodBounds, TODAY_ISO } from "@/lib/money/mock"
import type { MerchantRails, SettlementBlock } from "@/lib/money/types"
import { allocatePackageSessions } from "@/lib/packages/allocate"
import { packagesFor } from "@/lib/packages/customer-packages"
import {
  type AmountValue,
  DEFAULT_PAYMENT_POLICY,
  examplePolicyText,
} from "@/lib/payment-policy/types"
import type { PetNoteEntry } from "@/lib/pet-notes"
import { getPublicBusiness, getPublicBusinessBySlug } from "@/lib/public-business"
import {
  HEATMAP_DAYS,
  HEATMAP_HOURS,
  HEATMAP_MATRIX,
  OPEN_INQUIRY_AGE,
  SALES_BY_PAYMENT,
  SALES_BY_PAYMENT_VALUES,
  WHATSAPP_FUNNEL,
} from "@/lib/reports/dashboard/mock"
import { CHART_CAT_SWATCH } from "@/lib/reports/dashboard/palette"
import { getReport } from "@/lib/reports/registry"
import type { CartLine } from "@/lib/sales/cart-types"
import { comboCartLines, SERVICES } from "@/lib/sales/new-sale-mock"
import { seedCategories, seedServices } from "@/lib/service-catalog/mock-data"
import type { LocationOffering, ServiceDefaults } from "@/lib/service-catalog/offerings"
import {
  type BranchServiceTerms,
  checkPackageAtBranch,
} from "@/lib/service-catalog/package-branch-check"
import { TEAM_MEMBERS } from "@/lib/team/mock"
import { roleById } from "@/lib/team/roles"
import { NINE_BRANCH_LEAVES, NINE_BRANCH_MEMBERS, NINE_BRANCH_SHIFTS } from "@/lib/team/shifts-mock"
import { DEMO_SESSIONS, DEMO_TERMINALS } from "@/lib/terminals/store"
import { cn } from "@/lib/utils"

/** Fixed so the lock-screen expiry label is stable between renders. */
const NOW = new Date("2026-07-20T10:00:00Z").getTime()

const PICKUP_DEMO_BOOKING: MockBooking = {
  id: "pg-pickup",
  staffId: "aya-hassan",
  locationId: "shampooch-jvc",
  start: "10:15",
  durationMin: 60,
  status: "confirmed",
  serviceCategory: "grooming",
  serviceName: "Wash & Blow Dry MD",
  clientName: "Tom Cassidy",
  clientPhone: "+971 50 374 5511",
  petName: "Luna",
  petSpecies: "cat",
  petBreed: "British Shorthair",
  priceMinor: 14000,
  bookingRef: "B-77342",
  needsPickup: true,
  pickupAddress: "Villa 12, Street 4B, Jumeirah 1, Dubai",
  petNotes: [
    { category: "grooming-sensitivity", detail: "Hates the dryer on high." },
    { category: "handling", detail: "Sensitive ears — no water near the head." },
  ],
  notes: "Owner asked for extra paw moisturizer last visit.",
}

// Same booking with a pinned address (PRD-144). The pair is the point: one was
// picked from the map search and gets "Navigate", the other was typed and can
// only offer "Search in Maps".
// Three services by two groomers, one with duration modifiers, one drawn from a
// membership — the shape the as-built popup shows and ours could not.
// PRD-143 — the pet-parent picker, opened on the category that carries a combo
// so the badge and its "2 services" count are on screen without scrolling.

// Same booking with a pinned address (PRD-144). The pair is the point: one was
// picked from the map search and gets "Navigate", the other was typed and can
// only offer "Search in Maps".
// Three services by two groomers, one with duration modifiers, one drawn from a
// membership — the shape the as-built popup shows and ours could not.
// PRD-143 — the pet-parent picker, opened on the category that carries a combo
// so the badge and its "2 services" count are on screen without scrolling.
/**
 * Chain setup, with the resulting estate rendered beside it — the created
 * branches are the acceptance criterion (SU1.2), so hiding them behind a closed
 * dialog would show the form and not the outcome.
 */
/**
 * SCR-03 against three real roster rows, because the states that matter are
 * per-person: an owner (all, untickable), a manager granted one branch of
 * three, and an invited member granted none.
 */
/**
 * SCR-09 with the business default under the operator's thumb, because DW3.1 is
 * a claim about what happens *after* a default changes — a static screenshot of
 * the section cannot show it.
 */
/** Month to date, so the breakdown has a period with real activity in it. */
const MONEY_DEMO_FILTER = {
  fromIso: periodBounds("month-to-date").fromIso,
  toIso: periodBounds("month-to-date").toIso,
}

/** Shampooch, the seeded chain — two published branches, one suspended. */
const PICKER_DEMO_BUSINESS = getPublicBusinessBySlug("shampooch")!

function ServicePricingDemo() {
  const [defaults, setDefaults] = useState<ServiceDefaults>({
    priceType: "Fixed",
    price: 60,
    duration: 45,
  })
  const [offerings, setOfferings] = useState<LocationOffering[]>([
    // Jumeirah is the busy branch that deliberately charges more — the exact
    // shape DW3.1 is written about.
    {
      serviceId: "dog-wash",
      locationId: "shampooch-jumeirah",
      enabled: true,
      overrides: { price: 75 },
    },
    // Al Quoz has no groomer, so it does not offer this at all (DW3.3).
    { serviceId: "dog-wash", locationId: "shampooch-al-quoz", enabled: false, overrides: {} },
  ])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          radius="full"
          onClick={() =>
            setDefaults((d) => ({ ...d, price: d.price + 5, duration: d.duration + 5 }))
          }
        >
          Raise the business default
        </Button>
        <span className="text-xs text-muted-foreground">
          Now {formatAed(defaults.price)} · {defaults.duration} min
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          radius="full"
          onClick={() => setDefaults({ priceType: "Fixed", price: 60, duration: 45 })}
        >
          Back to AED 60 · 45 min
        </Button>
      </div>
      <ServiceLocationsSection
        serviceId="dog-wash"
        defaults={defaults}
        offerings={offerings}
        onChange={setOfferings}
      />
    </div>
  )
}

/**
 * SCR-07 under one reader at a time.
 *
 * The screen only says anything if you can change who is looking: the same
 * client, the same four visits, and a different set of things you may do about
 * them. Each row wraps it in its own provider, so the grant is the only
 * variable between them.
 */
function ClientVisitsDemo({ cta, isOwner = false }: { cta: string; isOwner?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="outline" size="sm" radius="full" onClick={() => setOpen(true)}>
        {cta}
      </Button>
      <ClientDetailDialog
        open={open}
        onOpenChange={setOpen}
        client={{
          id: "millie-cassidy",
          name: "Millie Cassidy",
          phone: "+971 58 509 9313",
        }}
        isOwner={isOwner}
      />
    </>
  )
}

/**
 * G1 and R11, in the three sentences the rule actually has.
 *
 * Each row is its own provider, so the only thing changing between them is the
 * grant — which is the point: the control is not one message styled three ways,
 * it says a different thing in each case.
 */
function WriteTargetDemo({ action, variant }: { action: string; variant?: "field" | "card" }) {
  const [locationId, setLocationId] = useState<string | null>(null)
  return (
    <WriteTargetLocation
      value={locationId}
      onChange={setLocationId}
      action={action}
      variant={variant}
    />
  )
}

/**
 * Reception's half of SCR-10, three frames of the Edit service panel at JVC on
 * a Tuesday. Lena works JVC mornings and Jumeirah afternoons; Marco works at
 * Jumeirah only and is preselected, the way a seeded line or a changed
 * location would leave him.
 */
function TeamMemberAtThisLocationDemo({
  startTime,
  staffName,
}: {
  startTime: string
  staffName: string
}) {
  return (
    <div className="h-[560px] w-[400px] overflow-hidden rounded-2xl border border-border/60 bg-sand-2">
      <EditServicePanel
        service={{
          uid: `demo-${staffName}-${startTime}`,
          catalog: MOCK_SERVICE_CATALOG[0]!,
          startTime,
          staffName,
        }}
        onBack={() => {}}
        onApply={() => {}}
        onDelete={() => {}}
        onChangeService={() => {}}
        locationId="shampooch-jvc"
        date="2026-10-06"
      />
    </div>
  )
}

/**
 * The five branch lists in the state they are in before they are lists. The
 * prototype's data is local, so nothing on a route ever loads or fails — the
 * toggle stands in for the network, and Try again is what puts it back.
 */
function SurfaceStatesDemo() {
  const [status, setStatus] = useState<SurfaceStatus>("loading")
  const [accessOpen, setAccessOpen] = useState(false)
  const retry = () => setStatus("ready")
  const aziz = TEAM_MEMBERS.find((m) => m.id === "aziz-rahman") ?? null
  const frame = "w-full max-w-[640px] rounded-2xl border border-border/60 p-4"

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex gap-2">
        {(["ready", "loading", "error"] as const).map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            radius="full"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s === "ready" ? "Ready" : s === "loading" ? "Loading" : "Error"}
          </Button>
        ))}
      </div>
      <Row label="Locations" align="start">
        <div className={frame}>
          <Suspense fallback={null}>
            <LocationForm status={status} onRetry={retry} />
          </Suspense>
        </div>
      </Row>
      <Row label="Deals" align="start">
        <div className={frame}>
          <Suspense fallback={null}>
            <DealsPage status={status} onRetry={retry} />
          </Suspense>
        </div>
      </Row>
      <Row label="WhatsApp numbers" align="start">
        <div className={frame}>
          <WhatsAppNumbersPanel status={status} onRetry={retry} />
        </div>
      </Row>
      <Row label="Stock by location" align="start">
        <div className="w-full max-w-[560px]">
          <ProductBranchStock
            product={STOCK_DEMO_PRODUCTS.lowAndOut}
            status={status}
            onRetry={retry}
          />
        </div>
      </Row>
      <Row label="Team access" align="start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          radius="full"
          onClick={() => setAccessOpen(true)}
        >
          Open Aziz&rsquo;s access
        </Button>
        <TeamAccessDialog
          open={accessOpen}
          onOpenChange={setAccessOpen}
          member={aziz}
          onSave={() => {}}
          status={status}
          onRetry={retry}
        />
      </Row>
    </div>
  )
}

function TeamAccessDemo() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const shown = members.filter((m) => ["maz-khan", "aziz-rahman", "ahmed-invite"].includes(m.id))
  const { locationName } = useLocations()

  return (
    <div className="flex flex-col gap-2">
      {shown.map((m) => (
        <div key={m.id} className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            onClick={() => setOpenId(m.id)}
          >
            {m.name ?? m.email}
          </Button>
          <span className="text-xs text-muted-foreground">
            {roleById(m.roleId)?.name ?? m.roleId} ·{" "}
            {m.locationGrants === "all"
              ? "All locations"
              : m.locationGrants.length === 0
                ? "No access"
                : m.locationGrants.map(locationName).join(", ")}
          </span>
        </div>
      ))}
      <TeamAccessDialog
        open={openId !== null}
        onOpenChange={(next) => {
          if (!next) setOpenId(null)
        }}
        member={members.find((m) => m.id === openId) ?? null}
        onSave={(memberId, roleId, grants) =>
          setMembers((prev) =>
            prev.map((m) => (m.id === memberId ? { ...m, roleId, locationGrants: grants } : m)),
          )
        }
      />
    </div>
  )
}

/**
 * The move dialog against one appointment, with the destination checks the
 * dialog cannot compute supplied per branch — there is no per-branch
 * availability model to ask yet, so the demo says so rather than faking one.
 */
/**
 * The strip over a scoped booking list. The grid itself lives under
 * "Appointments — toolbar and people grid"; this shows what the scope does to
 * the day rather than re-mounting it.
 */
const PACKAGE_ENTITLEMENT = {
  packageId: "pkg-1",
  serviceId: "bath-small",
  soldAtLocationId: "shampooch-jvc",
  soldPriceMinor: 6_000,
  soldDurationMin: 45,
  remainingSessions: 3,
}

const PACKAGE_MISMATCH_CASES = [
  { label: "Same terms", terms: { offered: true, priceMinor: 6_000, durationMin: 45 } },
  { label: "Priced differently", terms: { offered: true, priceMinor: 7_500, durationMin: 45 } },
  { label: "Different duration", terms: { offered: true, priceMinor: 6_000, durationMin: 60 } },
  { label: "Not offered here", terms: { offered: false, priceMinor: 0, durationMin: 0 } },
]

/** One cart line's worth of the warning, with the staff decision live. */
function PackageWarningDemo({ terms }: { terms: BranchServiceTerms }) {
  const [decision, setDecision] = useState<PackageDecision | null>(null)
  const mismatch = checkPackageAtBranch(PACKAGE_ENTITLEMENT, terms)
  return (
    <div className="flex flex-col gap-2">
      <PackageBranchWarning
        mismatch={mismatch}
        soldAtLocationId={PACKAGE_ENTITLEMENT.soldAtLocationId}
        serviceName="Bath & brush, small"
        decision={decision}
        onDecide={setDecision}
      />
      {mismatch.kind === "match" ? (
        <span className="text-xs text-muted-foreground">
          Nothing rendered — the terms match, so there is nothing to warn about
        </span>
      ) : null}
      <span className="text-xs text-muted-foreground">
        Checkout completes either way{decision ? ", and the decision is on the sale" : ""}
      </span>
    </div>
  )
}

function BranchCalendarDemo() {
  const { scopedLocations, scopeLabel } = useLocations()
  const scoped = bookingsInScope(
    MOCK_BOOKINGS,
    scopedLocations.map((l) => l.id),
  )
  return (
    <div className="flex flex-col gap-3">
      <BranchDayStrip bookings={MOCK_BOOKINGS} />
      <p className="text-sm text-muted-foreground">
        {scopeLabel} — {scoped.length} of {MOCK_BOOKINGS.length} appointments in view
      </p>
      <ul className="flex flex-col gap-1">
        {scoped.slice(0, 6).map((b) => (
          <li key={b.id} className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{b.start}</span>
            <span className="truncate">{b.clientName}</span>
            <span className="truncate text-muted-foreground">{b.serviceName}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MoveDemo({
  depositMinor,
  paymentResolvable = true,
}: {
  depositMinor: number
  paymentResolvable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [moved, setMoved] = useState<string | null>(null)
  const { locationName } = useLocations()

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" size="sm" radius="full" onClick={() => setOpen(true)}>
        Move Karen Dougall's appointment
      </Button>
      {moved ? <span className="text-xs text-muted-foreground">{moved}</span> : null}
      <MoveToBranchDialog
        open={open}
        onOpenChange={setOpen}
        appointment={{
          appointmentId: "b-004",
          clientName: "Karen Dougall",
          serviceName: "Full groom",
          serviceId: "full-groom",
          when: "Today, 11:00",
          sourceLocationId: "shampooch-jvc",
          depositMinor,
        }}
        destinationChecks={{
          "shampooch-jumeirah": {
            destinationOffersService: true,
            destinationHasSlot: true,
            paymentResolvable,
          },
        }}
        onMoved={(attribution) =>
          setMoved(
            `Moved. Collected at ${locationName(attribution.collectionLocationId)}, delivered at ${locationName(attribution.fulfillmentLocationId)}.`,
          )
        }
      />
    </div>
  )
}

/**
 * The three seeded weeks side by side, because per-branch hours cannot be shown
 * one branch at a time — a single week looks the same whether it is the
 * branch's own or the business's. "Open now" is pinned so the row is
 * deterministic to review.
 */
function BranchHoursDemo() {
  const { locations, businessTimezone } = useLocations()
  const now = new Date("2026-09-08T14:00:00+04:00")
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {locations.map((loc) => (
        <div key={loc.id} className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-5 text-foreground">{loc.name}</span>
            <span className="text-xs text-muted-foreground">
              {timezoneLabel(resolveTimezone(businessTimezone, loc.timezone).value)} ·{" "}
              {isOpenNow(loc.hours, now) ? (
                <span className="text-cami-green-11">Open now</span>
              ) : (
                "Closed now"
              )}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {WEEK_DAYS.map((day) => {
              const schedule = loc.hours[day.id]
              return (
                <li key={day.id} className="flex justify-between gap-2 text-xs leading-5">
                  <span className="text-muted-foreground">{day.short}</span>
                  <span className={schedule.closed ? "text-muted-foreground" : "text-foreground"}>
                    {formatDayHours(schedule)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

/**
 * The same week and the same day, resolved for each branch. R15 asks for "that
 * Location's offering **and** availability", and the availability half was one
 * hardcoded week and one roster shown on every branch.
 *
 * Friday is picked because it is where all three differ: JVC 10-6, Jumeirah
 * 10-9, Al Quoz closed.
 */
function BranchAvailabilityDemo() {
  const { locations } = useLocations()
  const friday = BOOKING_DAYS.find((d) => d.weekDay === "fri")!

  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {locations.map((loc) => {
        const days = bookingDaysForLocation(loc.hours)
        const slots = slotGroupsForLocation(loc.hours, friday)
        const free = slots.flatMap((g) => g.times.filter((t) => !t.taken))
        const staff = bookingStaffForLocation(loc.id)
        return (
          <div key={loc.id} className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3">
            <span className="text-sm font-medium leading-5 text-foreground">{loc.name}</span>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">The week</span>
              <div className="flex gap-1">
                {days.map((day) => (
                  <span
                    key={day.id}
                    title={day.closed ? "Closed" : day.full ? "Fully booked" : "Open"}
                    className={cn(
                      "flex h-7 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                      day.closed
                        ? "bg-background text-muted-foreground/40 line-through"
                        : day.full
                          ? "bg-background text-muted-foreground/60"
                          : "bg-cami-green-3 text-cami-green-11",
                    )}
                  >
                    {/* Three letters, not one. "T W T F S S M" has two T and
                        two S, so the two days that differ most between these
                        branches — Friday and Sunday — could not be picked out
                        of it. The chip is wider; the row is still one line. */}
                    {day.weekday}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Friday · {free.length} free of {slots.flatMap((g) => g.times).length}
              </span>
              {free.length === 0 ? (
                <span className="text-xs text-muted-foreground">Closed, so nothing offered</span>
              ) : (
                <span className="text-xs text-foreground">
                  {free[0]!.time} – {free[free.length - 1]!.time}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Bookable team · {staff.length} of {BOOKING_STAFF.length}
              </span>
              <span className="text-xs text-foreground">
                {staff.map((member) => member.name.split(" ")[0]).join(", ")}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * The redemption panel against the four verdicts and the three mismatches, on
 * one cart line each — so the states sit side by side rather than needing a
 * sale built up by hand.
 */
/**
 * One promotion's reach, said the way the switcher and the team grants say it.
 *
 * The badge is the whole point: "All locations" survives a tenth branch opening
 * and "9 locations" does not, so they are different claims and read differently.
 * An empty list is refused out loud rather than being allowed to look like the
 * chain-wide case.
 */
function PromotionScopeRow({ scope }: { scope: PromotionScope }) {
  const { granted, locationName } = useLocations()
  const runnable = isRunnable(scope)
  const covered = reaches(scope, granted)

  return (
    <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-foreground text-sm">January groom offer · 20% off</span>
        <Badge variant={runnable ? "primary-soft" : "outline"} size="sm">
          {describeScope(scope, locationName)}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        {runnable
          ? `Runs at ${covered.length} of your ${granted.length} locations.`
          : "Nobody can use this. Choose a location, or make it chain-wide."}
      </p>
    </div>
  )
}

/**
 * A cart with the client's sessions already spent on it.
 *
 * The built product's model: no Apply anywhere, a covered line reads 0 with its
 * price struck beneath, and the chip counts down. The branch warning is ours
 * (R08, KC1.5) and hangs off the line it is about — the session is spent either
 * way, and what changes is that reception is told.
 */
function PackageCoverageDemo({
  clientId,
  lines,
  redeemingAt,
}: {
  clientId: string
  lines: CartLine[]
  /** The branch this sale has already named (R11). */
  redeemingAt?: string
}) {
  const [decisions, setDecisions] = useState<Record<string, PackageDecision>>({})
  const held = packagesFor(clientId)
  const coverage = allocatePackageSessions(
    lines.map((l) => ({ uid: l.uid, catalogId: l.sourceId })),
    held,
    new Date("2026-09-22T10:00:00Z"),
  ).byUid

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <CartContent
        lines={lines}
        hasClient
        readOnly
        onRemove={() => {}}
        onSetQty={() => {}}
        coverage={coverage}
        renderLineNotice={(line) => {
          const session = coverage.get(line.uid)
          const pkg = held.find((p) => p.id === session?.customerPackageId)
          const sold = pkg?.soldTerms[line.sourceId]
          if (!pkg || !sold || !redeemingAt) return null
          // The playground has no offerings store, so the branch's terms are
          // stated here rather than resolved — the rule under test is what the
          // warning says, not where the price came from.
          const here =
            redeemingAt === "shampooch-jumeirah"
              ? { offered: true, priceMinor: 14500, durationMin: sold.durationMin }
              : redeemingAt === "shampooch-al-quoz"
                ? { offered: false, priceMinor: 0, durationMin: 0 }
                : { offered: true, priceMinor: sold.priceMinor, durationMin: sold.durationMin }
          const mismatch = checkPackageAtBranch(
            {
              packageId: pkg.packageId,
              serviceId: line.sourceId,
              soldAtLocationId: pkg.soldAtLocationId,
              soldPriceMinor: sold.priceMinor,
              soldDurationMin: sold.durationMin,
              remainingSessions: pkg.sessionsRemaining ?? 1,
            },
            here,
          )
          return (
            <PackageBranchWarning
              className="mx-3 mb-1"
              mismatch={mismatch}
              soldAtLocationId={pkg.soldAtLocationId}
              serviceName={line.name}
              decision={decisions[line.uid] ?? null}
              onDecide={(d) => setDecisions((c) => ({ ...c, [line.uid]: d }))}
            />
          )
        }}
      />
    </div>
  )
}

function ChainSetupDemo() {
  const { locations } = useLocations()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="outline" radius="full" onClick={() => setOpen(true)}>
        <CirclePlusIcon className="size-4" />
        Add locations
      </Button>
      <AddLocationsTakeover open={open} onOpenChange={setOpen} />
      <ul className="flex flex-col gap-1">
        {locations.map((loc) => (
          <li key={loc.id} className="flex items-center gap-2 text-sm text-foreground">
            <span>{loc.name}</span>
            <LocationStatusBadge status={loc.status} />
            <span className="font-mono text-xs text-muted-foreground">cami.app/{loc.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The editable half of SCR-11: rows read as one line until the operator says
 * they are editing, because seven branches needing attention is seven cards and
 * fourteen labelled inputs nobody opened the card to fill in.
 */
function BranchStockThresholdsDemo() {
  const [stock, setStock] = useState<BranchStock[]>(() => [...BRANCH_STOCK])

  return (
    <ProductBranchStock
      product={STOCK_DEMO_PRODUCTS.lowAndOut}
      stock={stock}
      onThresholds={(locationId, patch) =>
        setStock((rows) =>
          rows.map((row) =>
            row.productId === STOCK_DEMO_PRODUCTS.lowAndOut.id && row.locationId === locationId
              ? { ...row, ...patch }
              : row,
          ),
        )
      }
    />
  )
}

// DZ-352 — a promo code on the booking review step. Every state is the real
// rule run against the seeded codes at JVC, so a refusal here reads exactly as
// it does on /shampooch-jvc/book.
function promoContext(
  serviceIds: string[],
  overrides: Partial<BookingPromoContext> = {},
): BookingPromoContext {
  return {
    deals: MOCK_DEALS,
    locationId: "shampooch-jvc",
    locationName: "Shampooch JVC",
    todayIso: TODAY_ISO,
    lines: bookingPromoLines(serviceIds),
    clientHasRedeemed: () => false,
    ...overrides,
  }
}

function promoCheck(serviceIds: string[], overrides: Partial<BookingPromoContext> = {}) {
  return (code: string) => evaluateBookingCode(code, promoContext(serviceIds, overrides))
}

function promoApplied(code: string, serviceIds: string[]) {
  return { code, result: promoCheck(serviceIds)(code) }
}

function promoRefusal(
  code: string,
  serviceIds: string[],
  overrides?: Partial<BookingPromoContext>,
) {
  const result = promoCheck(serviceIds, overrides)(code)
  return result.ok ? null : result.refusal
}

const PROMO_REFUSALS: ReadonlyArray<{
  label: string
  code: string
  serviceIds: string[]
  overrides?: Partial<BookingPromoContext>
}> = [
  { label: "Not found (or team-only)", code: "TEACH10", serviceIds: ["full-groom"] },
  { label: "Expired", code: "JULY10", serviceIds: ["full-groom"] },
  { label: "Switched off", code: "FRIEND25", serviceIds: ["full-groom"] },
  { label: "Another branch", code: "ALQUOZ30", serviceIds: ["full-groom"] },
  { label: "Fully redeemed", code: "FIRST50", serviceIds: ["full-groom"] },
  {
    label: "Already used",
    code: "WELCOME15",
    serviceIds: ["full-groom"],
    overrides: { clientHasRedeemed: () => true },
  },
  { label: "Minimum spend", code: "GROOM50", serviceIds: ["full-groom", "nail-trim"] },
  { label: "Combo only", code: "WELCOME15", serviceIds: ["groom-and-nails-combo"] },
  { label: "Wrong services", code: "SPA20", serviceIds: ["full-groom"] },
]

function PromoFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-105">{children}</div>
}

function BookingPromoReview({ code, serviceIds }: { code: string; serviceIds: string[] }) {
  const business = getPublicBusiness("shampooch-jvc")
  if (!business) return null
  const applied = promoApplied(code, serviceIds)
  return (
    <div className="w-full max-w-115 rounded-2xl border border-border/60 bg-background p-5">
      <ConfirmStep
        business={business}
        services={serviceIds.map((id) => findCatalogService(id)).filter((s) => s != null)}
        catalog={SERVICE_CATEGORIES}
        whenLabel="Tue 25 · 10:00 AM"
        staffLabel="Any team member"
        customerLabel="Natalie Grant"
        promos={applied.result.ok ? [applied.result.promo] : []}
        promoField={
          <PromoCodeField applied={applied} onApply={promoCheck(serviceIds)} onRemove={() => {}} />
        }
      />
    </div>
  )
}

function BookingPromoCodeDemo() {
  const noop = () => {}
  return (
    <StatePicker
      states={[
        {
          label: "Review step, code applied",
          note: "WELCOME15 on a groom and a nail trim: line captions, the promo row, VAT on the discounted total.",
          content: <BookingPromoReview code="WELCOME15" serviceIds={["full-groom", "nail-trim"]} />,
        },
        {
          label: "AED 0 booking",
          note: "NAILFREE on a nail trim alone: 100% off, and the pay-at-salon note changes.",
          content: <BookingPromoReview code="NAILFREE" serviceIds={["nail-trim"]} />,
        },
        {
          label: "Field",
          note: "Closed, typing, checking, applied, applied to 1 of 2, re-checking after a change, and a check that failed.",
          content: (
            <div className="flex flex-col">
              <Row label="Closed">
                <PromoFrame>
                  <PromoCodeField
                    applied={null}
                    onApply={promoCheck(["full-groom"])}
                    onRemove={noop}
                  />
                </PromoFrame>
              </Row>
              <Row label="Typing">
                <PromoFrame>
                  <PromoCodeField
                    applied={null}
                    onApply={promoCheck(["full-groom"])}
                    onRemove={noop}
                    defaultOpen
                    defaultCode="WELCOME15"
                  />
                </PromoFrame>
              </Row>
              <Row label="Checking">
                <PromoFrame>
                  <PromoCodeField
                    applied={null}
                    onApply={promoCheck(["full-groom"])}
                    onRemove={noop}
                    defaultOpen
                    defaultCode="WELCOME15"
                    defaultChecking
                  />
                </PromoFrame>
              </Row>
              <Row label="Applied">
                <PromoFrame>
                  <PromoCodeField
                    applied={promoApplied("WELCOME15", ["full-groom", "nail-trim"])}
                    onApply={promoCheck(["full-groom", "nail-trim"])}
                    onRemove={noop}
                  />
                </PromoFrame>
              </Row>
              <Row label="Applies to 1 of 2">
                <PromoFrame>
                  <PromoCodeField
                    applied={promoApplied("SPA20", ["full-groom", "teeth"])}
                    onApply={promoCheck(["full-groom", "teeth"])}
                    onRemove={noop}
                  />
                </PromoFrame>
              </Row>
              <Row label="Re-checking after a change">
                <PromoFrame>
                  <PromoCodeField
                    applied={promoApplied("SPA20", ["full-groom", "teeth"])}
                    onApply={promoCheck(["full-groom", "teeth"])}
                    onRemove={noop}
                    rechecking
                  />
                </PromoFrame>
              </Row>
              <Row label="Couldn't check">
                <PromoFrame>
                  <PromoCodeField
                    applied={null}
                    onApply={promoCheck(["full-groom"])}
                    onRemove={noop}
                    defaultOpen
                    defaultCode="WELCOME15"
                    defaultRefusal={CHECK_FAILED}
                  />
                </PromoFrame>
              </Row>
            </div>
          ),
        },
        {
          label: "Refusals",
          note: "One row per reason a code is turned down, each from the real rule.",
          content: (
            <div className="flex flex-col">
              {PROMO_REFUSALS.map((r) => (
                <Row key={r.label} label={r.label}>
                  <PromoFrame>
                    <PromoCodeField
                      applied={null}
                      onApply={promoCheck(r.serviceIds, r.overrides)}
                      onRemove={noop}
                      defaultOpen
                      defaultCode={r.code}
                      defaultRefusal={promoRefusal(r.code, r.serviceIds, r.overrides)}
                    />
                  </PromoFrame>
                </Row>
              ))}
            </div>
          ),
        },
        {
          label: "No longer applies",
          note: "WELCOME15 applied, then the groom swapped for a combo: the code stays named, with the reason.",
          content: (
            <PromoFrame>
              <PromoCodeField
                applied={promoApplied("WELCOME15", ["groom-and-nails-combo"])}
                onApply={promoCheck(["groom-and-nails-combo"])}
                onRemove={noop}
              />
            </PromoFrame>
          ),
        },
      ]}
    />
  )
}

// DZ-200 D10 — the wizard's details step with the online-booking switch, so the
// code field's three readings sit side by side.
function DealOnlineSwitchDemo({ on, code }: { on: boolean; code: string }) {
  const [draft, setDraft] = useState(() => ({
    ...createEmptyDealDraft(TODAY_ISO),
    name: "Welcome offer",
    discountValue: "15",
    bookingRedeemable: on,
    discountCode: code,
  }))
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-background p-6">
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
        bookingRedeemable={draft.bookingRedeemable}
        onBookingRedeemable={(bookingRedeemable) => setDraft((d) => ({ ...d, bookingRedeemable }))}
        startDate={draft.startDate}
        onStartDate={(startDate) => setDraft((d) => ({ ...d, startDate }))}
        endDate={draft.endDate}
        onEndDate={(endDate) => setDraft((d) => ({ ...d, endDate }))}
        applicability={draft.applicability}
        onApplicability={(applicability) => setDraft((d) => ({ ...d, applicability }))}
      />
    </div>
  )
}

function BookingComboPickerDemo() {
  const [selected, setSelected] = useState<string[]>(["groom-and-nails-combo"])
  return (
    <ServicePicker
      selectedIds={selected}
      onToggle={(id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
      }
    />
  )
}

// PRD-143 — the POS cart holds a combo the same way: its component lines, each
// with the list price struck through, and the saving named in the footer.

// PRD-143 — the POS cart holds a combo the same way: its component lines, each
// with the list price struck through, and the saving named in the footer.
let comboUidSeq = 0
/**
 * The seeded combos, by kind rather than by id. The catalog is derived from
 * lib/booking.ts now, so naming "svc-8" tied these rows to which service
 * happened to sit where.
 */
const SEED_COMBOS = seedServices.filter((service) => service.serviceType === "combo")

/**
 * The four stock states, each on the seeded product that actually holds it, so
 * the numbers on screen come from lib/inventory/mock.ts rather than from props
 * written to make a screenshot look right.
 */
const STOCK_DEMO_PRODUCTS = {
  // 18 at Jumeirah, -2 at JVC: the sum hides the only row worth acting on.
  negative: { id: "p3", name: "Burt's Bees Hypoallergenic Shampoo", trackStock: true },
  // Low at one branch, empty at another — same product, two problems.
  lowAndOut: { id: "p2", name: "Furminator Deshedding Tool", trackStock: true },
  unlimited: { id: "p9", name: "Service consumable", trackStock: false },
} as const

/**
 * A two-line cart where the package pays for one of them (KC1.5). The covered
 * line keeps its own price — a package is a captured payment, not a discount —
 * and says so with a chip, so "zero" and "already paid for" stay different
 * facts at the counter.
 */
/**
 * The example GNK's §4 asks about: a Spa category with three services, and a
 * branch with no spa room that has turned all three off.
 */
const CATEGORIES_AT_BRANCH: PreviewCategory[] = [
  {
    id: "grooming",
    name: "Grooming",
    services: ["Bath & brush", "Full groom", "Puppy trim"],
    offered: ["Bath & brush", "Full groom", "Puppy trim"],
  },
  {
    id: "spa",
    name: "Spa",
    services: ["Deep tissue", "Aromatherapy", "Mud wrap"],
    offered: [],
  },
  {
    id: "addons",
    name: "Add-ons",
    services: ["Nail trim", "Teeth clean"],
    offered: ["Nail trim"],
  },
]

const PACKAGE_CART_LINES: CartLine[] = [
  {
    uid: "pkg-line-1",
    kind: "service",
    name: "Blow dry",
    priceMinor: 12000,
    durationMin: 45,
    qty: 1,
    sourceId: "blow-dry",
  },
  {
    uid: "pkg-line-2",
    kind: "service",
    name: "Nail trim",
    priceMinor: 6000,
    durationMin: 20,
    qty: 1,
    sourceId: "nail-trim",
  },
  // A second line the same package covers, so one session has to choose.
  {
    uid: "pkg-line-3",
    kind: "service",
    name: "Blow dry",
    priceMinor: 12000,
    durationMin: 45,
    qty: 1,
    sourceId: "blow-dry",
  },
  {
    uid: "pkg-line-4",
    kind: "service",
    name: "Deep tissue massage",
    priceMinor: 32000,
    durationMin: 90,
    qty: 1,
    sourceId: "deep-tissue",
  },
]

/**
 * Two grooms under one promotion and a product without one — the till's
 * promotion chip on each discounted line, and one summary row for the offer.
 */
const PROMO_CART_LINES: CartLine[] = [
  {
    uid: "promo-pg-1",
    kind: "service",
    name: "Full groom",
    priceMinor: 25000,
    qty: 1,
    durationMin: 90,
    sourceId: "full-groom",
    dealId: "summer-groom",
    dealName: "Summer groom offer",
    dealRule: { kind: "percentage", value: 20 },
    dealDiscountMinor: 5000,
  },
  {
    uid: "promo-pg-2",
    kind: "service",
    name: "Puppy groom",
    priceMinor: 18000,
    qty: 1,
    durationMin: 60,
    sourceId: "puppy-groom",
    dealId: "summer-groom",
    dealName: "Summer groom offer",
    dealRule: { kind: "percentage", value: 20 },
    dealDiscountMinor: 3600,
  },
  {
    uid: "promo-pg-3",
    kind: "product",
    name: "Oatmeal shampoo",
    priceMinor: 6500,
    qty: 1,
    sourceId: "oatmeal-shampoo",
  },
]

const COMBO_CART_LINES = comboCartLines(
  SERVICES.find((svc) => svc.id === "nails-and-style-combo") ?? SERVICES[0],
  SERVICES,
  (prefix) => `${prefix}-pg-${++comboUidSeq}`,
)

// PRD-143 — booking a combo books its component services, so the appointment
// carries one line per component and each names the combo it came from.

// PRD-143 — booking a combo books its component services, so the appointment
// carries one line per component and each names the combo it came from.
const COMBO_DEMO_BOOKING: MockBooking = {
  ...PICKUP_DEMO_BOOKING,
  id: "pg-combo",
  serviceName: "Wash & Blow Dry MD",
  items: [
    {
      id: "pg-c1",
      name: "Wash & Blow Dry MD",
      priceMinor: 12000,
      durationMin: 60,
      staffName: "Aya Hassan",
      comboName: "Wash & Nails Combo",
      comboGrossPriceMinor: 20000,
    },
    {
      id: "pg-c2",
      name: "Nails Clip",
      priceMinor: 8000,
      durationMin: 15,
      staffName: "Aya Hassan",
      comboName: "Wash & Nails Combo",
      comboGrossPriceMinor: 10000,
    },
    {
      id: "pg-c3",
      name: "Ear Clean",
      priceMinor: 4000,
      durationMin: 15,
      staffName: "Lena Petrov",
    },
  ],
}

const MULTI_SERVICE_DEMO_BOOKING: MockBooking = {
  ...PICKUP_DEMO_BOOKING,
  id: "pg-multi-service",
  items: [
    {
      id: "pg-i1",
      name: "Wash & Blow Dry MD",
      priceMinor: 14000,
      durationMin: 60,
      staffName: "Aya Hassan",
      extraTimes: [
        { type: "processing", durationMin: 10 },
        { type: "blocked", durationMin: 10 },
      ],
    },
    {
      id: "pg-i2",
      name: "Nail clipping",
      priceMinor: 4000,
      durationMin: 15,
      staffName: "Aya Hassan",
    },
    {
      id: "pg-i3",
      name: "Deshedding MD",
      priceMinor: 18000,
      durationMin: 45,
      staffName: "Lena Petrov",
      membership: { label: "Included in membership", grossPriceMinor: 18000 },
    },
  ],
}

const PICKUP_PINNED_DEMO_BOOKING: MockBooking = {
  ...PICKUP_DEMO_BOOKING,
  id: "pg-pickup-pinned",
  pickupAddress: "Apt 1804, Marina Heights Tower, Dubai Marina",
  pickupPlace: { placeId: "ChIJdemo_marina_heights", point: { lat: 25.0805, lng: 55.1403 } },
}

// Every reachable state of the pickup block, each one live so the checkboxes
// can be toggled in place.

// Every reachable state of the pickup block, each one live so the checkboxes
// can be toggled in place.
const PICKUP_FIELD_STATES: Array<{
  key: string
  label: string
  needsPickup: boolean
  useSavedAddress: boolean
  savedAddress?: string
  /** Set on the state whose saved address was picked from the map search. */
  savedPlace?: PlaceRef
  clientName?: string
}> = [
  { key: "off", label: "Off (default)", needsPickup: false, useSavedAddress: true },
  {
    key: "no-client",
    label: "On · no client selected yet",
    needsPickup: true,
    useSavedAddress: true,
  },
  {
    key: "saved",
    label: "On · reusing the saved address (pinned)",
    needsPickup: true,
    useSavedAddress: true,
    savedAddress: "Apt 1804, Marina Heights Tower, Dubai Marina",
    savedPlace: { placeId: "ChIJdemo_marina_heights", point: { lat: 25.0805, lng: 55.1403 } },
    clientName: "Maaz Test You",
  },
  {
    key: "saved-unpinned",
    label: "On · saved address typed, never pinned",
    needsPickup: true,
    useSavedAddress: true,
    savedAddress: "Villa 12, Street 4B, Jumeirah 1, Dubai",
    clientName: "Karen Dougall",
  },
  {
    key: "override",
    label: "On · overriding with a different address",
    needsPickup: true,
    useSavedAddress: false,
    savedAddress: "Villa 12, Street 4B, Jumeirah 1, Dubai",
    clientName: "Karen Dougall",
  },
  {
    key: "no-saved",
    label: "On · client has no address on file",
    needsPickup: true,
    useSavedAddress: true,
    clientName: "Aaliyah Hazari",
  },
]

function PickupFieldsDemo({ state }: { state: (typeof PICKUP_FIELD_STATES)[number] }) {
  const [needsPickup, setNeedsPickup] = useState(state.needsPickup)
  const [useSavedAddress, setUseSavedAddress] = useState(state.useSavedAddress)
  const [address, setAddress] = useState("")
  // Held next to the string exactly as the appointment sheet holds it: pick a
  // suggestion and the note under the field flips to "Pinned"; edit the text
  // afterwards and it flips back, because the field drops the stale pin.
  const [place, setPlace] = useState<PlaceRef | undefined>(undefined)

  return (
    <PickupFields
      idPrefix={`pg-${state.key}`}
      needsPickup={needsPickup}
      onNeedsPickup={setNeedsPickup}
      useSavedAddress={useSavedAddress}
      onUseSavedAddress={setUseSavedAddress}
      address={address}
      onAddress={setAddress}
      place={place}
      onPlace={setPlace}
      savedAddress={state.savedAddress}
      savedPlace={state.savedPlace}
      clientName={state.clientName}
    />
  )
}

function PetNotesFieldsDemo({ initial, idPrefix }: { initial: PetNoteEntry[]; idPrefix: string }) {
  const [entries, setEntries] = useState<PetNoteEntry[]>(initial)
  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-4">
      <PetNotesFields entries={entries} onEntries={setEntries} idPrefix={idPrefix} />
    </div>
  )
}

function PickupFieldsStates() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PICKUP_FIELD_STATES.map((state) => (
        <div key={state.key} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {state.label}
          </span>
          <PickupFieldsDemo state={state} />
        </div>
      ))}
    </div>
  )
}

/** One Share invoice dialog, opened inline so a link state can be inspected. */
function ShareDialogDemo({
  linkState,
  label,
  note,
}: {
  linkState: ShareLinkState
  label: string
  note: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex w-64 flex-col gap-2">
      <Button variant="outline" radius="full" size="sm" onClick={() => setOpen(true)}>
        Share invoice · {label}
      </Button>
      <span className="text-xs leading-snug text-muted-foreground">{note}</span>
      <ShareInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        invoiceUrl="https://business.getcami.io/invoice/17"
        merchantName="Pet Loft Dubai"
        saleNumber="17"
        defaultEmail="haroon.zafar@example.com"
        linkState={linkState}
      />
    </div>
  )
}

/** One Email invoice dialog. `invalid` opens with a blank field to reach the error. */
function EmailDialogDemo({
  label,
  note,
  walkIn = false,
  invalid = false,
}: {
  label: string
  note: string
  walkIn?: boolean
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex w-64 flex-col gap-2">
      <Button variant="outline" radius="full" size="sm" onClick={() => setOpen(true)}>
        Email invoice · {label}
      </Button>
      <span className="text-xs leading-snug text-muted-foreground">{note}</span>
      <EmailInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        defaultEmail={walkIn || invalid ? "" : "haroon.zafar@example.com"}
        documentLabel="Tax Invoice #00017"
        isWalkIn={walkIn}
      />
    </div>
  )
}

/**
 * One invoice state, scaled down so several fit side by side in the showcase.
 *
 * The document is a fixed 210mm wide, so it cannot flex into a showcase row —
 * `scale` shrinks it without touching the layout, which is the point: what you
 * see here is the same geometry that prints, not a responsive variant of it.
 */
function InvoicePreview({ id, note }: { id: keyof typeof INVOICE_FIXTURES; note: string }) {
  const { label, doc } = INVOICE_FIXTURES[id]
  return (
    <div className="flex w-[270px] flex-col gap-2">
      <div className="h-[382px] overflow-hidden rounded-lg border border-border/60 bg-sand-3 dark:bg-neutral-900">
        <div className="origin-top-left scale-[0.34]">
          {/* Not printable: sixteen previews would each emit a print copy. */}
          <InvoiceDocumentView doc={doc} printable={false} />
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <a
          href={`/sales/invoice-document?state=${id}`}
          className="text-xs font-medium text-foreground hover:underline"
        >
          {label}
        </a>
        <span className="text-xs leading-snug text-muted-foreground">{note}</span>
      </div>
    </div>
  )
}

/**
 * One HQ CamiPay panel, wrapped in its own AuthProvider so each row can show a
 * different permission set. The CamiPay store is provided once by the section
 * above, so edits made in one row are reflected in the others.
 */

/** Interactive percent/fixed amount input, as used for deposits and no-show fees. */
function AmountInputDemo({ initial }: { initial: AmountValue }) {
  const [value, setValue] = useState<AmountValue>(initial)
  return <AmountInput value={value} onChange={setValue} className="w-64" />
}

/** Opens the checkout Add gift card dialog, seeded to an AED 1,800 preset. */
function GiftCardDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" radius="full" onClick={() => setOpen(true)}>
        Open Add gift card
      </Button>
      {open ? (
        <GiftCardDialog
          mode="add"
          initial={newGiftCardDraft(180000)}
          open
          onOpenChange={setOpen}
          onApply={(draft) => toast(`Gift card added · ${draft.priceMinor / 100} AED`)}
        />
      ) : null}
    </>
  )
}

/**
 * The pick-a-machine dialog over the four DSG-62 terminal states. `signedIn`
 * off drops the live sessions, so every row carries its blocked reason and the
 * dialog leads with the "nothing signed in" notice.
 */
function SelectTerminalDialogDemo({ signedIn = true }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" radius="full" onClick={() => setOpen(true)}>
        Open Send to terminal
      </Button>
      {open ? (
        <SelectTerminalDialog
          open
          onOpenChange={setOpen}
          terminals={DEMO_TERMINALS}
          sessions={signedIn ? DEMO_SESSIONS : []}
          amountMinor={15000}
          onSend={(terminal) => toast(`Sent to ${terminal.name}`)}
        />
      ) : null}
    </>
  )
}

/**
 * Opens the send-payment-link dialog with AED 57 owed and a client prefilled.
 * Send only generates the link — in the real flow the cart locks behind it
 * (see the lock screen below).
 */
function SelfCheckoutDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" radius="full" onClick={() => setOpen(true)}>
        Open Send payment link
      </Button>
      {open ? (
        <SelfCheckoutDialog
          open
          onOpenChange={setOpen}
          toPayMinor={5700}
          defaultName="Maaz Test"
          defaultPhone="+971 50 963 6445"
          onSend={(d) =>
            toast(`Link sent to +971 ${d.phone} · ${(d.amountMinor / 100).toFixed(2)} AED`)
          }
        />
      ) : null}
    </>
  )
}

/**
 * Opens the redeem-at-checkout dialog with AED 57 owed. Try QM4KTRZA / ZTP3RG84
 * (active), YYOSNPHO (not active), or any other code (typo error).
 */
function RedeemGiftCardDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" radius="full" onClick={() => setOpen(true)}>
        Open Redeem gift card
      </Button>
      <RedeemGiftCardDialog
        open={open}
        onOpenChange={setOpen}
        leftToPayMinor={5700}
        onApply={(amount) => toast(`Redeemed ${(amount / 100).toFixed(2)} AED`)}
      />
    </>
  )
}

/**
 * The account summary at one state. Rendered whole rather than in pieces: the
 * thing worth reviewing is whether the arithmetic reads down the page to the
 * headline, and a row of extracted cards cannot show that.
 */
function MoneySummaryDemo({
  variant,
  block = null,
  rails = { online: true, terminal: true },
  empty = false,
}: {
  variant: "two-rail" | "blended"
  block?: SettlementBlock | null
  rails?: MerchantRails
  empty?: boolean
}) {
  const [range, setRange] = useState(() => defaultRange())
  const txs = empty ? [] : MONEY_TXS.filter((t) => rails[t.rail])
  const payouts = empty ? [] : PAYOUTS.filter((p) => rails[p.rail])

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-sand-2 p-4">
      <MoneySummaryView
        txs={txs}
        payouts={payouts}
        rails={rails}
        range={range}
        onRangeChange={setRange}
        variant={variant}
        block={block}
      />
    </div>
  )
}

/**
 * The activity feed at one state. Filters, pagination and both detail dialogs
 * are live here — the payout drill-in is the part worth clicking, since it is
 * the one that has to arrive at the payout figure rather than assert it.
 */
function MoneyActivityDemo({
  rails = { online: true, terminal: true },
  empty = false,
}: {
  rails?: MerchantRails
  empty?: boolean
}) {
  const txs = empty ? [] : MONEY_TXS.filter((t) => rails[t.rail])
  const payouts = empty ? [] : PAYOUTS.filter((p) => rails[p.rail])

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-sand-2 p-4">
      <MoneyActivityView txs={txs} payouts={payouts} rails={rails} />
    </div>
  )
}

/**
 * The bank account panel at one state. Open "Change" on the gateway-failed one:
 * the flow has to end on a screen that says which system refused and that
 * nothing moved.
 */
function BankAccountDemo({ state }: { state: BankAccountDemoState }) {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-sand-2 p-4">
      <BankAccountPanel
        onBack={() => toast("Back to Payments")}
        breadcrumbRoot={{ label: "Payments", icon: CreditCardIcon }}
        initialState={state}
      />
    </div>
  )
}

/** The fee statements at one D1 outcome. Expand a closed period to see the working. */
function MoneyFeesDemo({
  terminalModel,
  rails = { online: true, terminal: true },
}: {
  terminalModel: TerminalFeeModel
  rails?: MerchantRails
}) {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-sand-2 p-4">
      <MoneyFeesView
        txs={MONEY_TXS.filter((t) => rails[t.rail])}
        rails={rails}
        terminalModel={terminalModel}
      />
    </div>
  )
}

/** The address field on its own, so both entry routes are visible at once. */

/** Billing details at one state. Open Edit to read the forward-only note. */
function BillingDetailsDemo({ state }: { state: BillingDetailsDemoState }) {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-sand-2 p-4">
      <BillingDetailsPanel
        onBack={() => toast("Back to Payments")}
        breadcrumbRoot={{ label: "Payments", icon: CreditCardIcon }}
        initialState={state}
      />
    </div>
  )
}

// ─── Product import demos (DSG-80) ───────────────────────────────────────────

/** Frame + caption shared by the import demos, matching the other wide demos. */
function ImportFrame({
  label,
  note,
  className,
  wide,
  children,
}: {
  /** Short name for the variant, above the frame where a label belongs. */
  label: string
  /** One line on what to look at. Optional — most variants speak for themselves. */
  note?: string
  className?: string
  /** Full width, for frames that need it (a table row, a whole step). */
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", wide ? "w-full" : "flex-1 basis-112")}>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {note ? <span className="text-xs leading-5 text-muted-foreground">{note}</span> : null}
      </div>
      <div className={cn("w-full rounded-2xl border border-border/60 bg-sand-2 p-3", className)}>
        {children}
      </div>
    </div>
  )
}

function scenarioPreview(scenario: ImportScenarioId) {
  const preview = getScenario(scenario).preview
  if (!preview) throw new Error(`scenario ${scenario} has no preview`)
  return preview
}

/** One grouped-issue block on its own, blocking or advisory. */
function IssueSummaryDemo({
  scenario,
  severity,
  label,
  note,
}: {
  scenario: ImportScenarioId
  severity: "blocking" | "advisory"
  label: string
  note?: string
}) {
  const preview = scenarioPreview(scenario)
  const groups = groupIssues(preview.rows)
  const counts = reviewCounts(preview)

  return (
    <ImportFrame label={label} note={note}>
      <IssueSummary
        groups={severity === "blocking" ? groups.blocking : groups.advisory}
        severity={severity}
        title={
          severity === "blocking"
            ? `${counts.blocked} rows can't be imported`
            : "Worth knowing before you import"
        }
        blockedRowCount={counts.blocked}
        onShowRows={() => toast("Filters the table to these rows")}
        onDownloadFailed={() => toast("Downloads the rows that failed")}
      />
    </ImportFrame>
  )
}

function OutcomeStripDemo({
  scenario,
  label,
  note,
}: {
  scenario: ImportScenarioId
  label: string
  note?: string
}) {
  return (
    <ImportFrame label={label} note={note}>
      <OutcomeStrip counts={reviewCounts(scenarioPreview(scenario))} />
    </ImportFrame>
  )
}

/** A single row under the real table header, so the columns line up as shipped. */
function ReviewRowDemo({
  scenario,
  status,
  label,
  note,
}: {
  scenario: ImportScenarioId
  status: ProductImportPreviewRow["status"]
  label: string
  note?: string
}) {
  const preview = scenarioPreview(scenario)
  const row = preview.rows.find((r) => r.status === status)
  const [expanded, setExpanded] = useState(false)
  const [override, setOverride] = useState<RowOverride>({})

  if (!row) return null

  return (
    <ImportFrame label={label} note={note} wide className="p-0">
      <div className="overflow-hidden rounded-2xl bg-background">
        <div
          className="grid gap-3 border-b border-border/60 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground"
          style={{ gridTemplateColumns: REVIEW_GRID_TEMPLATE }}
        >
          <span>Row</span>
          <span>Status</span>
          <span>Product</span>
          <span>Details</span>
          <span />
        </div>
        <ReviewRow
          row={row}
          preview={preview}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          override={override}
          onOverrideChange={setOverride}
        />
      </div>
    </ImportFrame>
  )
}

/** The whole review step at one case, height-capped because it is a preview. */
function ReviewStateDemo({
  scenario,
  label,
  note,
}: {
  scenario: ImportScenarioId
  label: string
  note?: string
}) {
  const preview = scenarioPreview(scenario)
  return (
    <ImportFrame label={label} note={note} wide>
      <div className="max-h-[560px] overflow-y-auto rounded-xl bg-background p-4">
        <ReviewPanel
          preview={preview}
          onConfirm={() => toast(`Imports ${reviewCounts(preview).willImport} products`)}
          onCancel={() => toast("Back to products")}
        />
      </div>
    </ImportFrame>
  )
}

function DoneStateDemo({
  scenario,
  label,
  note,
}: {
  scenario: ImportScenarioId
  label: string
  note?: string
}) {
  const preview = scenarioPreview(scenario)
  return (
    <ImportFrame label={label} note={note} wide>
      <div className="rounded-xl bg-background p-4">
        <DonePanel
          summary={applySummaryFor(preview)}
          preview={preview}
          placeholderSkuCount={placeholderSkuRows(preview).length}
          onImportAnother={() => toast("Starts a new import")}
        />
      </div>
    </ImportFrame>
  )
}

/** One client or pet row, picked by the status it is meant to show. */
function ClientRowDemo({
  scenario,
  status,
  label,
  note,
}: {
  scenario: ClientPetScenarioId
  status: string
  label: string
  note?: string
}) {
  const demo = getClientPetScenario(scenario)
  // Keyed the way the table badges and filters rows, so a standalone pet — whose
  // client status is `skip` — is reachable here by the name it is shown under.
  const row = demo.preview.rows.find((r) => rowStatusKey(r) === status) ?? demo.preview.rows[0]
  const [override, setOverride] = useState<RowOverride>({})
  const [expanded, setExpanded] = useState(false)

  return (
    <ImportFrame label={label} note={note} wide className="p-0">
      <div className="overflow-hidden rounded-xl bg-background">
        <div
          className="grid gap-3 border-b border-border/60 bg-sand-3 px-3 py-2.5 text-xs font-medium text-muted-foreground"
          style={{ gridTemplateColumns: demo.entity === "pets" ? PET_GRID : CLIENT_GRID }}
        >
          <span>Row</span>
          <span>Status</span>
          <span>Client</span>
          {demo.entity === "pets" && <span>Pet</span>}
          <span>Details</span>
          <span />
        </div>
        <ClientReviewRow
          row={row}
          entity={demo.entity}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          override={override}
          onOverrideChange={setOverride}
        />
      </div>
    </ImportFrame>
  )
}

/** A whole client or pet review step, in a frame tall enough to scroll in. */
function ClientReviewStateDemo({
  scenario,
  label,
  note,
}: {
  scenario: ClientPetScenarioId
  label: string
  note?: string
}) {
  const demo = getClientPetScenario(scenario)
  return (
    <ImportFrame label={label} note={note} wide>
      <div className="flex h-160 flex-col rounded-xl bg-background p-4">
        <ClientReviewPanel
          preview={demo.preview}
          entity={demo.entity}
          onConfirm={() => toast("Imports the ready rows")}
          onCancel={() => toast("Back to upload")}
        />
      </div>
    </ImportFrame>
  )
}

/** The shared outcome step, on a client or pet result. */
function ClientOutcomeDemo({
  scenario,
  label,
  note,
}: {
  scenario: ClientPetScenarioId
  label: string
  note?: string
}) {
  const demo = getClientPetScenario(scenario)
  return (
    <ImportFrame label={label} note={note} wide>
      <div className="rounded-xl bg-background p-4">
        <OutcomePanel
          {...clientPetOutcome(demo)}
          onImportAnother={() => toast("Starts a new import")}
        />
      </div>
    </ImportFrame>
  )
}

/**
 * One partner's HQ notification controls, backed by local state so the four
 * rows in the showcase can be edited independently instead of writing through
 * to the shared mock array and fighting each other.
 */

/**
 * Playground-only: what `checkGoogleReviewLink` makes of each shape a merchant
 * might paste. Rendered as data rather than as four live fields, because the
 * field writes to one shared setting — four of them would fight over it.
 */
function GoogleLinkChecks() {
  const samples = [
    "https://g.page/r/CShampoochJVC/review",
    "https://search.google.com/local/writereview?placeid=ChIJ12345",
    "https://www.google.com/maps/place/Shampooch+JVC/@25.05,55.2",
    "https://g.page/shampooch-jvc",
    "https://facebook.com/shampooch",
    "not a url at all",
  ]
  const tone: Record<string, string> = {
    review: "bg-cami-green-2 text-cami-green-12",
    listing: "bg-cami-yellow-2 text-cami-yellow-12",
    invalid: "bg-destructive/10 text-destructive",
    empty: "bg-muted text-muted-foreground",
  }
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      {samples.map((sample) => {
        const check = checkGoogleReviewLink(sample)
        return (
          <div
            key={sample}
            className="flex flex-col gap-1 rounded-xl border border-border/60 p-3 text-sm leading-5"
          >
            <div className="flex items-center justify-between gap-3">
              <code className="min-w-0 truncate text-xs text-muted-foreground">{sample}</code>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  tone[check.kind],
                )}
              >
                {check.kind}
              </span>
            </div>
            {check.message ? <p className="text-muted-foreground">{check.message}</p> : null}
          </div>
        )
      })}
    </div>
  )
}

/**
 * One customer card at gallery size. Shrunk rather than reflowed: the row exists
 * to compare palettes, and a card that re-laid-out at preview width would be
 * comparing two things at once.
 *
 * `zoom` rather than `transform: scale`, which is the usual trick here (see
 * InvoicePreview). A transform leaves the layout box at full size, so the
 * preview needs a hardcoded height — and any guess is wrong for a card whose
 * height depends on its content: the empty Purr Palace card left a third of its
 * box as bare shell colour. `zoom` shrinks the layout box too, so every preview
 * ends exactly where its card ends.
 */
function CustomerCardPreview({
  slug = "sota",
  themeId,
  label,
}: {
  slug?: string
  themeId: string
  label: string
}) {
  const business = getPublicBusiness(slug)
  const card = getCustomerCard(slug)
  if (!business || !card) return null
  const theme = getCustomerCardTheme(slug, themeId)
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="w-[520px] [zoom:0.42]">
          <CustomerCard business={business} card={card} theme={theme} />
        </div>
      </div>
      <a
        href={`/${slug}/card?theme=${themeId}`}
        className="text-xs font-medium text-foreground hover:underline"
      >
        {label}
      </a>
    </div>
  )
}

function ProductPickersDemo() {
  const [open, setOpen] = useState<"brand" | "category" | "supplier" | null>(null)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const pick = (kind: string) => (item: { name: string }) =>
    setPicked((prev) => ({ ...prev, [kind]: item.name }))
  return (
    <Row label="Open one">
      {(["brand", "category", "supplier"] as const).map((kind) => (
        <Button key={kind} variant="outline" radius="full" onClick={() => setOpen(kind)}>
          {picked[kind] ?? `Select a ${kind}`}
        </Button>
      ))}
      <SelectBrandDialog
        open={open === "brand"}
        onOpenChange={(o) => setOpen(o ? "brand" : null)}
        onSelect={pick("brand")}
      />
      <SelectCategoryDialog
        open={open === "category"}
        onOpenChange={(o) => setOpen(o ? "category" : null)}
        onSelect={pick("category")}
      />
      <SelectSupplierDialog
        open={open === "supplier"}
        onOpenChange={(o) => setOpen(o ? "supplier" : null)}
        onSelect={pick("supplier")}
      />
    </Row>
  )
}

export function BusinessLane() {
  const reportPaymentsSummary = getReport("payments-summary")
  const reportDiscountSummary = getReport("discount-summary")
  const reportAppointmentsSummary = getReport("appointments-summary")
  const reportFinanceSummary = getReport("finance-summary")
  const reportPerformanceDashboard = getReport("performance-dashboard")
  const reportPerformanceSummary = getReport("performance-summary")
  const reportPerformanceOverTime = getReport("performance-over-time")

  return (
    <Lane
      id="business"
      label="Business app features"
      blurb="Ticketed work on the operator's surfaces, newest thinking first."
    >
      <Section
        title="Inbox Phase 0 — list, composer, client pane"
        description="WhatsApp inbox pieces in each state: unmatched number, failed rows, list states, composer window states and client pane."
        lazy
      >
        <InboxPhase0Showcase />
      </Section>
      <Section
        title="Multi-location — a deal, and where it runs"
        description="Deal rows by location scope: All locations, 3 locations, and an empty scope that never reads Active."
      >
        {MOCK_DEALS.slice(0, 4).map((deal) => (
          <Row
            key={deal.id}
            label={
              isRunnable(deal.scope)
                ? deal.scope.kind === "estate"
                  ? "Chain-wide — a named set"
                  : `A named few — ${deal.scope.locationIds.length}`
                : "Saved with nothing chosen"
            }
          >
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <div className="w-full max-w-146">
                <DealsTable
                  deals={[deal]}
                  todayIso={TODAY_ISO}
                  locationName={estateLocationName}
                  onSelect={() => {}}
                  onEdit={() => {}}
                  onSetStatus={() => {}}
                  onDuplicate={() => {}}
                />
              </div>
            </LocationsProvider>
          </Row>
        ))}
      </Section>

      <Section
        title="Multi-location — branch switcher"
        description="Branch switcher scoped to one branch, a subset or all granted branches, each scope side by side."
      >
        <Row label="Owner, all branches">
          <LocationsProvider persist={false} initialScope={{ kind: "all" }}>
            <LocationSwitcher />
          </LocationsProvider>
        </Row>
        <Row label="Scope = one branch">
          <LocationsProvider
            persist={false}
            initialScope={{ kind: "one", locationId: "shampooch-jumeirah" }}
          >
            <LocationSwitcher />
          </LocationsProvider>
        </Row>
        <Row label="Scope = subset">
          <LocationsProvider
            persist={false}
            initialScope={{
              kind: "subset",
              locationIds: ["shampooch-jvc", "shampooch-al-quoz"],
            }}
          >
            <LocationSwitcher />
          </LocationsProvider>
        </Row>
        <Row label="Single-branch business" align="start">
          {/* DW1.2: absent, not disabled, not a one-item dropdown. The frame
              is here so the reviewer can see that nothing renders on purpose
              — a T3 operator must not pay attention to a concept they do not
              have. Granted one branch, so an area manager holding one of nine
              lands here too. */}
          <LocationsProvider persist={false} initialGrants={["shampooch-jvc"]}>
            <div className="flex min-h-11 items-center gap-3">
              <LocationSwitcher />
              <span className="text-xs text-muted-foreground">
                Nothing rendered — one granted branch means no switcher
              </span>
            </div>
          </LocationsProvider>
        </Row>
        <Row label="No branch granted">
          {/* R24. An empty scope is never "all" — it is no access, and the
              control says so rather than showing an empty menu. */}
          <LocationsProvider persist={false} initialGrants={[]}>
            <LocationSwitcher />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — branch lifecycle"
        description="Branch lifecycle states: suspended and archived named by consequence, live renders nothing on purpose."
      >
        <Row label="Status badge">
          {(["live", "suspended", "archived"] as const).map((status) => (
            <span key={status} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{status}</span>
              <LocationStatusBadge status={status} />
              {status === "live" ? (
                <span className="text-xs text-muted-foreground">(nothing rendered)</span>
              ) : null}
            </span>
          ))}
        </Row>
      </Section>
      <Section
        title="Multi-location — per-branch hours"
        description="Per-branch weeks and timezones: JVC closed Sunday, Jumeirah seven days, Al Quoz with a midday break reading Closed now."
      >
        <Row label="The seeded estate" align="start">
          <LocationsProvider persist={false}>
            <BranchHoursDemo />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — per-branch availability"
        description="Per-branch booking days and slots: a closed day reads Closed, not Fully booked. Friday shows all three branches differ."
      >
        <Row label="The seeded estate" align="start">
          <LocationsProvider persist={false}>
            <BranchAvailabilityDemo />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — where a promotion runs"
        description="How a promotion's scope is a named case or a list, never an empty list meaning everywhere."
      >
        <Row label="Across the chain">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <PromotionScopeRow scope={{ kind: "estate" }} />
          </LocationsProvider>
        </Row>
        <Row label="One branch only">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <PromotionScopeRow scope={{ kind: "branches", locationIds: ["shampooch-mirdif"] }} />
          </LocationsProvider>
        </Row>
        <Row label="A named few">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <PromotionScopeRow
              scope={{
                kind: "branches",
                locationIds: ["shampooch-jvc", "shampooch-jumeirah", "shampooch-al-reem"],
              }}
            />
          </LocationsProvider>
        </Row>
        <Row label="Nothing chosen — refused, not treated as everywhere">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <PromotionScopeRow scope={{ kind: "branches", locationIds: [] }} />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — the duplicate caught before booking"
        description="Unprompted duplicate-booking notice under the client picker, including other branches, that informs but never blocks."
      >
        <Row label="Already booked at another branch" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <ClientOpenAppointmentsBanner
                open={openAppointmentsFor("millie-cassidy")}
                bookingAt="shampooch-jumeirah"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Already booked here — the ordinary case" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <ClientOpenAppointmentsBanner
                open={openAppointmentsFor("millie-cassidy")}
                bookingAt="shampooch-jvc"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Nothing to say — renders nothing at all" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <ClientOpenAppointmentsBanner open={openAppointmentsFor("nobody")} />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — who may change what about a branch"
        description="One table of who may change what about a branch, across owner, manager, reception and groomer."
      >
        <Row label="The table" align="start">
          <div className="w-full max-w-3xl">
            <WhoMayChangeBranch />
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — a category a branch has emptied"
        description="A category a branch has emptied: hidden from clients, kept for reception with the absence stated, Add-ons as the control."
      >
        <Row label="What a client sees" align="start">
          <div className="w-full max-w-md">
            <CategoryAtBranchPreview
              categories={CATEGORIES_AT_BRANCH}
              branchName="Shampooch JBR"
              mode="hidden"
            />
          </div>
        </Row>
        <Row label="What reception sees" align="start">
          <div className="w-full max-w-md">
            <CategoryAtBranchPreview
              categories={CATEGORIES_AT_BRANCH}
              branchName="Shampooch JBR"
              mode="empty"
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — packages at the till"
        description="Packages applied automatically at the till, with a warning when redeemed at a branch that prices the service differently."
      >
        <Row label="Sold and redeemed at the same branch" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="aaishah-vaza"
                lines={[PACKAGE_CART_LINES[0]!]}
                redeemingAt="shampooch-jvc"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Priced differently here — warns, still completes" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="aaishah-vaza"
                lines={[PACKAGE_CART_LINES[0]!]}
                redeemingAt="shampooch-jumeirah"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Not offered at this branch at all" align="start">
          <div className="w-full max-w-md">
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="aaishah-vaza"
                lines={[PACKAGE_CART_LINES[0]!]}
                redeemingAt="shampooch-al-quoz"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="One session, two lines that want it" align="start">
          <div className="w-full max-w-md">
            {/* Abbey has a single session left. The first line takes it and
                the second pays in full — which is the whole reason the
                allocation exists: "does this package cover this service"
                would zero both. */}
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="abbey-mcdermaid"
                lines={[PACKAGE_CART_LINES[0]!, PACKAGE_CART_LINES[2]!]}
                redeemingAt="shampooch-jvc"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Two packages, one of them unlimited" align="start">
          <div className="w-full max-w-md">
            {/* Abbie holds both. The daycare one never runs out, so its line
                reads Unlimited rather than a count. */}
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="abbie-connelly"
                lines={[PACKAGE_CART_LINES[0]!, PACKAGE_CART_LINES[3]!]}
                redeemingAt="shampooch-jvc"
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Expired — out of time, not out of sessions" align="start">
          <div className="w-full max-w-md">
            {/* Two sessions on it and expired in January. Nothing is
                covered, and "you have none left" would be the wrong sentence
                to say to him. */}
            <LocationsProvider persist={false}>
              <PackageCoverageDemo
                clientId="abrar-mohammed"
                lines={[PACKAGE_CART_LINES[0]!]}
                redeemingAt="shampooch-jvc"
              />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — scheduled shifts"
        description="Read-only per-branch shift grid where Lena works two branches and Tala's same-hours clash is flagged."
      >
        <Row label="JVC" align="start">
          <div className="w-full">
            <LocationsProvider persist={false}>
              <ScheduledShifts locationId="shampooch-jvc" />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Jumeirah" align="start">
          <div className="w-full">
            <LocationsProvider persist={false}>
              <ScheduledShifts locationId="shampooch-jumeirah" />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Nobody assigned" align="start">
          <div className="w-full">
            {/* A branch standing up has no roster yet, which is a sentence
                rather than an empty grid. */}
            <LocationsProvider persist={false}>
              <ScheduledShifts locationId="shampooch-al-quoz" />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Nine branches" align="start">
          <div className="w-full">
            {/* Three branches is where a rule looks obvious and a layout looks
                fine. Nine is where both get tested — every defect this repo
                has found in a multi-location surface showed up here first.

                Huda works three branches, Faris crosses an emirate line and
                clashes with himself on Saturday, and Hadi is rostered at a
                suspended branch, because a rota does not stop when trading
                does and the hours are still owed. */}
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <ScheduledShifts
                locationId="shampooch-dubai-marina"
                members={NINE_BRANCH_MEMBERS}
                shifts={NINE_BRANCH_SHIFTS}
                leaves={NINE_BRANCH_LEAVES}
              />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Nine branches · suspended" align="start">
          <div className="w-full">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <ScheduledShifts
                locationId="shampooch-yas-island"
                members={NINE_BRANCH_MEMBERS}
                shifts={NINE_BRANCH_SHIFTS}
                leaves={NINE_BRANCH_LEAVES}
              />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — per-branch stock"
        description="Per-branch stock rows before a derived total, with empty and negative kept apart and reorder points behind Edit."
      >
        <Row label="Two branches disagree" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false}>
              <ProductBranchStock product={STOCK_DEMO_PRODUCTS.negative} />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Low and out" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false}>
              <ProductBranchStock product={STOCK_DEMO_PRODUCTS.lowAndOut} />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Manager · one branch" align="start">
          <div className="w-full max-w-[560px]">
            {/* No roll-up row: it would restate the row above it and call one
                manager's shelf the business. */}
            <LocationsProvider persist={false} initialGrants={["shampooch-jumeirah"]}>
              <ProductBranchStock product={STOCK_DEMO_PRODUCTS.negative} />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Reading · thresholds summarised" align="start">
          <div className="w-full max-w-[560px]">
            {/* Same card with an editor attached: "Edit reorder points"
                swaps every row's summary for its two fields, and back. */}
            <LocationsProvider persist={false}>
              <BranchStockThresholdsDemo />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Not counted" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false}>
              <ProductBranchStock product={STOCK_DEMO_PRODUCTS.unlimited} />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — nine branches (D5)"
        description="Nine branches collapsed and expanded side by side, plus the switcher and money roll-up at that scale."
      >
        <Row label="Per-branch pricing · collapsed" align="start">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <ServicePricingDemo />
          </LocationsProvider>
        </Row>
        <Row label="Branch switcher · nine">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <LocationSwitcher />
          </LocationsProvider>
        </Row>
        <Row label="Money by branch · nine" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <MoneyByLocationView txs={MONEY_TXS} filter={MONEY_DEMO_FILTER} />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="All-branches calendar · nine" align="start">
          <div className="w-full max-w-[720px]">
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <BranchDayStrip bookings={MOCK_BOOKINGS} />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — chain setup"
        description="Create N branches in one all-or-none pass: try duplicate names or 'Shampooch JVC' for the link and slug errors."
      >
        <Row label="Add locations" align="start">
          <LocationsProvider persist={false}>
            <ChainSetupDemo />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — branch access grants"
        description="Role says what, location grant says where. The owner holds every branch and Ahmed's empty grant reads as no access."
      >
        <Row label="Open a member" align="start">
          <LocationsProvider persist={false}>
            <TeamAccessDemo />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — a write names one branch"
        description="Branch line for writes: resolved for one branch, a required choice for several, no write for none."
      >
        {/* Nine held, one picked in the topbar switcher. Holding a single
            location would render nothing at all — that is DW1.2, not this. */}
        <Row label="One branch in scope · resolved, not asked" align="start">
          <LocationsProvider
            persist={false}
            initialLocations={NINE_BRANCH_ESTATE}
            initialScope={{ kind: "one", locationId: "shampooch-jvc" }}
          >
            <WriteTargetDemo action="This appointment" />
          </LocationsProvider>
        </Row>
        <Row label="Nine in scope · a required choice" align="start">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <WriteTargetDemo action="This appointment" />
          </LocationsProvider>
        </Row>
        {/* Open the list here: two of the nine are suspended and both are in
            it, badged. Pick one and it says so, and Save stays shut because
            nothing was reported upward. */}
        <Row label="Nine in scope · open it and pick a suspended one (R12)" align="start">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <WriteTargetDemo action="This appointment" />
          </LocationsProvider>
        </Row>
        <Row label="Only a suspended branch · nowhere to record it (R12)" align="start">
          <LocationsProvider
            persist={false}
            initialLocations={NINE_BRANCH_ESTATE}
            initialGrants={["shampooch-al-quoz"]}
          >
            <WriteTargetDemo action="This appointment" />
          </LocationsProvider>
        </Row>
        {/* The same control, dressed for the appointment sheet: a section
            heading like Services and Pet Address, and a white bordered card
            instead of a grey field. The dialogs and panels keep the field
            look, because there it sits among Inputs that carry no border. */}
        <Row label="Card variant · for the appointment sheet's stacked cards" align="start">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <WriteTargetDemo action="This appointment" variant="card" />
          </LocationsProvider>
        </Row>
        <Row label="No grant at all · no access, said out loud (R24)" align="start">
          <LocationsProvider
            persist={false}
            initialLocations={NINE_BRANCH_ESTATE}
            initialGrants={[]}
          >
            <WriteTargetDemo action="This appointment" />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — client visits at another branch"
        description="Millie's visits across three branches, read in full by everyone, with actions only where the grant allows."
      >
        <Row label="Owner · holds every branch" align="start">
          <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
            <ClientVisitsDemo cta="Open as Maz (owner)" isOwner />
          </LocationsProvider>
        </Row>
        <Row label="Reception · holds JVC only" align="start">
          <LocationsProvider
            persist={false}
            initialLocations={NINE_BRANCH_ESTATE}
            initialGrants={["shampooch-jvc"]}
          >
            <ClientVisitsDemo cta="Open as JVC reception" />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — per-branch service pricing"
        description="Override a branch price, reset one field, then raise the business default and watch only inherited fields follow."
      >
        <Row label="Locations section" align="start">
          <LocationsProvider persist={false}>
            <ServicePricingDemo />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — public branch picker"
        description="Public branch picker listing only published branches, the suspended one absent, 'Open now' pinned to Tuesday 11am."
      >
        <Row label="Chain page" align="start">
          <div className="w-full max-w-[560px]">
            <PublicBranchPicker
              business={PICKER_DEMO_BUSINESS}
              branches={PICKER_DEMO_BUSINESS.branches.filter((b) => b.isPublished)}
              now={new Date("2026-09-08T11:00:00+04:00")}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — branch WhatsApp numbers"
        description="Per-branch WhatsApp numbers in three states: JVC connected, Jumeirah stuck on the OTP, Al Quoz with no number."
      >
        <Row label="Numbers panel" align="start">
          <div className="w-full max-w-[640px]">
            <LocationsProvider persist={false}>
              <WhatsAppNumbersPanel />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — no location access"
        description="The page shown to someone with no location access, live via ahmed@getcami.io."
      >
        <Row label="No location at all" align="start">
          <div className="w-full max-w-[560px]">
            <NoLocationAccess />
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — somebody working at another location"
        description="Team member list for this location, where staff busy at another location show where and until when and are blocked."
        lazy
      >
        <Row label="Busy at another location" align="start">
          <TeamMemberAtThisLocationDemo startTime="15:00" staffName="Lena Petrov" />
        </Row>
        <Row label="Not at this location" align="start">
          <TeamMemberAtThisLocationDemo startTime="11:00" staffName="Marco Rossi" />
        </Row>
        <Row label="Rostered here" align="start">
          <TeamMemberAtThisLocationDemo startTime="11:00" staffName="Lena Petrov" />
        </Row>
      </Section>
      <Section
        title="Multi-location — loading and error"
        description="Empty, loading and error states for each multi-location surface, and errors never show a partial list."
        lazy
      >
        <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
          <SurfaceStatesDemo />
        </LocationsProvider>
      </Section>
      <Section
        title="Multi-location — money by branch"
        description="Money per branch side by side with the total after the rows, plus a Jumeirah-only manager seeing one row."
      >
        <Row label="Owner · all branches" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false}>
              <MoneyByLocationView txs={MONEY_TXS} filter={MONEY_DEMO_FILTER} />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Waiting on the roll-up" align="start">
          <div className="w-full max-w-[560px]">
            {/* The one branch surface with a loading state worth drawing: a
                grant-bounded query that sums a row per branch, and the one
                the product has a budget for (PRD-78 is an E2E about exactly
                that). Nine placeholders because the count is known before the
                money is — an owner should see nine rows coming rather than a
                spinner that could resolve to anything. */}
            <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
              <MoneyByLocationView txs={MONEY_TXS} filter={MONEY_DEMO_FILTER} loading />
            </LocationsProvider>
          </div>
        </Row>
        <Row label="Manager · one branch" align="start">
          <div className="w-full max-w-[560px]">
            <LocationsProvider persist={false} initialGrants={["shampooch-jumeirah"]}>
              <MoneyByLocationView txs={MONEY_TXS} filter={MONEY_DEMO_FILTER} />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — cross-branch move"
        description="Moving a booking across branches: Jumeirah allowed, Al Quoz suspended and refused, an unresolved payment rejected whole."
      >
        <Row label="Deposit taken" align="start">
          <LocationsProvider persist={false}>
            <MoveDemo depositMinor={5000} />
          </LocationsProvider>
        </Row>
        <Row label="Nothing collected" align="start">
          <LocationsProvider persist={false}>
            <MoveDemo depositMinor={0} />
          </LocationsProvider>
        </Row>
        <Row label="Payment can't resolve" align="start">
          <LocationsProvider persist={false}>
            <MoveDemo depositMinor={5000} paymentResolvable={false} />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Multi-location — all-branches calendar"
        description="All-branches calendar filter strip with per-branch counts, where clicking a branch narrows the day."
      >
        <Row label="Branch strip + day" align="start">
          <div className="w-full">
            <LocationsProvider persist={false}>
              <BranchCalendarDemo />
            </LocationsProvider>
          </div>
        </Row>
      </Section>
      <Section
        title="Multi-location — package mismatch at checkout"
        description="A package used at a different branch at checkout warns but never blocks, shows both prices and records the choice."
      >
        {PACKAGE_MISMATCH_CASES.map((demo) => (
          <Row key={demo.label} label={demo.label} align="start">
            <div className="w-full max-w-[520px]">
              <LocationsProvider persist={false}>
                <PackageWarningDemo terms={demo.terms} />
              </LocationsProvider>
            </div>
          </Row>
        ))}
      </Section>
      <Section
        title="Appointments — booking block"
        description="Booking block for the People grid: colour for category, fill and border for status, all content at every size."
      >
        <Row label="Sizes (15/30/60/180 min)">
          {[15, 30, 60, 180].map((min) => (
            <div
              key={min}
              className="relative w-[148px] border border-border/40 bg-muted/20"
              style={{ height: Math.max(28, min * (95 / 60)) }}
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${min}`,
                  staffId: "demo",
                  locationId: "shampooch-jvc",
                  start: "10:00",
                  durationMin: min,
                  status: "confirmed",
                  serviceCategory: "grooming",
                  serviceName: min < 30 ? "Nails Clip" : "Wash & Blow Dry SM",
                  clientName: "Tom Cassidy",
                  petName: "Luna",
                  petSpecies: "cat",
                  priceMinor: min < 30 ? 3000 : 14000,
                  hasDeposit: min >= 60,
                }}
                top={0}
                height={Math.max(24, min * (95 / 60))}
              />
            </div>
          ))}
        </Row>
        <Row label="Status variants">
          {(
            [
              "booked",
              "confirmed",
              "checked-in",
              "ready-for-pickup",
              "completed",
              "cancelled",
              "no-show",
            ] as MockBookingStatus[]
          ).map((status) => (
            <div
              key={status}
              className="relative h-[95px] w-[148px] border border-border/40 bg-muted/20"
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${status}`,
                  staffId: "demo",
                  locationId: "shampooch-jvc",
                  start: "10:00",
                  durationMin: 60,
                  status,
                  serviceCategory: "grooming",
                  serviceName: "Full Grooming SM",
                  clientName: "Karen Dougall",
                  petName: "Willow",
                  petSpecies: "dog",
                  priceMinor: 21000,
                }}
                top={0}
                height={95}
              />
            </div>
          ))}
        </Row>
        <Row label="Service categories">
          {(
            [
              { cat: "grooming", svc: "Wash & Blow Dry" },
              { cat: "vet", svc: "Vaccination" },
              { cat: "daycare", svc: "Day Care · 12 pets" },
              { cat: "boarding", svc: "Boarding Stay" },
              { cat: "details", svc: "Nails Clip" },
              { cat: "welcome", svc: "Meet & Greet" },
            ] as Array<{ cat: MockServiceCategory; svc: string }>
          ).map(({ cat, svc }) => (
            <div
              key={cat}
              className="relative h-[95px] w-[148px] border border-border/40 bg-muted/20"
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${cat}`,
                  staffId: "demo",
                  locationId: "shampooch-jvc",
                  start: "10:00",
                  durationMin: 60,
                  status: "confirmed",
                  serviceCategory: cat,
                  serviceName: svc,
                  clientName: "Frances",
                  petName: "Duke",
                  petSpecies: "dog",
                  priceMinor: 14000,
                }}
                top={0}
                height={95}
              />
            </div>
          ))}
        </Row>
        <Row label="Flag icons (pickup leads the row)">
          {(
            [
              { key: "pickup", label: "Pet address only", flags: { needsPickup: true } },
              { key: "deposit", label: "Deposit only", flags: { hasDeposit: true } },
              {
                key: "pickup-safety",
                label: "Pet address + safety flag",
                flags: { needsPickup: true, hasSafetyFlag: true },
              },
              {
                key: "all",
                label: "All four",
                flags: {
                  needsPickup: true,
                  hasDeposit: true,
                  isRecurring: true,
                  hasSafetyFlag: true,
                },
              },
            ] as Array<{ key: string; label: string; flags: Partial<MockBooking> }>
          ).map(({ key, label, flags }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="relative h-[95px] w-[148px] border border-border/40 bg-muted/20">
                <AppointmentBlock
                  booking={{
                    id: `demo-flags-${key}`,
                    staffId: "demo",
                    locationId: "shampooch-jvc",
                    start: "10:00",
                    durationMin: 60,
                    status: "confirmed",
                    serviceCategory: "grooming",
                    serviceName: "Full Grooming SM",
                    clientName: "Karen Dougall",
                    petName: "Willow",
                    petSpecies: "dog",
                    priceMinor: 21000,
                    ...flags,
                  }}
                  top={0}
                  height={95}
                />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </Row>
      </Section>
      <Section
        lazy
        title="Appointments — toolbar and people grid"
        description="Calendar toolbar (Today, date, view mode, filters, new) above an 11-column staff by time grid."
      >
        <Row label="Toolbar">
          <div className="w-full max-w-5xl rounded-2xl border border-border/60 bg-card">
            <AppointmentsToolbar date="2026-05-11" viewMode="day" />
          </div>
        </Row>
        <Row label="People grid (clipped to 600px)">
          <div className="h-150 w-full min-w-0">
            <PeopleGrid
              staff={MOCK_STAFF}
              bookings={MOCK_BOOKINGS}
              nowMinutes={(11 - 7) * 60 + 30}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Appointments — pickup & pet notes"
        description="Pickup address fields on the staff sheet, pet notes, and the one hover card with services, notes and branch."
      >
        <PickupFieldsStates />
        <Row label="Hover card — pinned address (Navigate)">
          <AppointmentQuickPanel booking={PICKUP_PINNED_DEMO_BOOKING} />
        </Row>
        <Row label="Hover card — typed address (Search in Maps)">
          <AppointmentQuickPanel booking={PICKUP_DEMO_BOOKING} />
        </Row>
        <Row label="Hover card — three services, two groomers, one on a membership">
          <AppointmentQuickPanel booking={MULTI_SERVICE_DEMO_BOOKING} />
        </Row>
        {/* One grant, so there is nothing to tell apart and the branch line
            renders nothing at all (DW1.2) — the same rule the switcher and
            the detail sheet follow. Compare against the rows above, which
            run against the whole nine-branch estate. */}
        <Row label="Hover card — single-branch business · no branch anywhere on it">
          <LocationsProvider
            persist={false}
            initialLocations={NINE_BRANCH_ESTATE}
            initialGrants={["shampooch-jvc"]}
          >
            <AppointmentQuickPanel booking={PICKUP_PINNED_DEMO_BOOKING} />
          </LocationsProvider>
        </Row>
      </Section>
      <Section
        title="Client notes (Staff Alert)"
        description="Client, appointment and pet notes told apart, with the client card as a two-note preview."
      >
        <Row label="Full (detail sheet) — heading outside, marker leading">
          <section className="flex w-full max-w-md flex-col gap-3">
            <h2 className="text-lg font-semibold leading-7 text-foreground">Client notes</h2>
            <ClientNoteBanner hideLabel clientId="karen-dougall" className="p-4" />
          </section>
        </Row>
        <Row label="Full — a single note, no author on the row">
          <div className="w-full max-w-md">
            <ClientNoteBanner clientId="tom-cassidy" />
          </div>
        </Row>
        <Row label="Compact (hover card) — a labelled group, not a card">
          <div className="flex w-[320px] flex-col gap-2.5 rounded-xl bg-popover p-3 shadow-overlay">
            <ClientNoteBanner compact clientId="karen-dougall" />
            {/* Neighbours included on purpose: the whole point of the compact
              rendering is that its label row matches theirs. */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Your Pet Address
              </div>
              <div className="rounded-md bg-cami-sage-2 px-2 py-1.5 text-[11px] text-cami-sage-12">
                Apt 1804, Marina Heights Tower, Dubai Marina
              </div>
            </div>
          </div>
        </Row>
        <Row label="No notes on file — renders nothing">
          <div className="w-full max-w-md rounded-2xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
            <ClientNoteBanner clientId="aaliyah-hazari" />
            Nothing above this line: the banner returns null rather than an empty card, so a client
            with no notes costs no vertical space on any surface.
          </div>
        </Row>
      </Section>
      <Section
        title="Pet notes — structured categories"
        description="Multi-select pet note chips, each needing specifics, shared by the public booking flow and the staff sheet."
      >
        <Row label="Empty">
          <PetNotesFieldsDemo initial={[]} idPrefix="pg-notes-empty" />
        </Row>
        <Row label="Two categories picked">
          <PetNotesFieldsDemo
            initial={[
              { category: "allergies", detail: "Chicken, and oatmeal shampoo" },
              { category: "handling", detail: "Sensitive paws — needs a muzzle for nails" },
            ]}
            idPrefix="pg-notes-filled"
          />
        </Row>
        <Row label="Picked, specifics still blank">
          <PetNotesFieldsDemo
            initial={[{ category: "behavior", detail: "" }]}
            idPrefix="pg-notes-blank"
          />
        </Row>
        <Row label="Read-only rendering">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-4">
            <PetNotesList entries={PICKUP_DEMO_BOOKING.petNotes ?? []} />
          </div>
        </Row>
      </Section>
      <Section
        title="Navigate to address"
        description="Navigate button opening Google Maps directions, or 'Search in Maps' for a typed address."
      >
        <Row label="Pinned — routes to coordinates">
          <NavigateToAddress
            address="Apt 1804, Marina Heights Tower, Dubai Marina"
            place={{ placeId: "ChIJdemo_marina_heights", point: { lat: 25.0805, lng: 55.1403 } }}
          />
        </Row>
        <Row label="Typed — text query only">
          <NavigateToAddress address="Villa 12, Street 4B, Jumeirah 1, Dubai" />
        </Row>
        <Row label="Compact (popover rendering)">
          <NavigateToAddress
            size="compact"
            address="Apt 1804, Marina Heights Tower, Dubai Marina"
            place={{ placeId: "ChIJdemo_marina_heights", point: { lat: 25.0805, lng: 55.1403 } }}
          />
          <NavigateToAddress size="compact" address="Villa 12, Street 4B, Jumeirah 1, Dubai" />
        </Row>
      </Section>
      <Section
        title="Product pickers — brand, category, supplier"
        description="One picker dialog in three configs: search, pick, or add a new brand, category or supplier in a second dialog."
      >
        <ProductPickersDemo />
      </Section>
      <Section
        title="Service menu — cards & sidebar"
        description="Catalog cards and sidebar with AED prices. Combos carry a tinted Combo badge and a bundled-services count."
      >
        <Row label="Service card, default">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={seedServices[0]}
              category={seedCategories.find((c) => c.id === seedServices[0].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onEdit={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, archived">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={{ ...seedServices[1], isActive: false }}
              category={seedCategories.find((c) => c.id === seedServices[1].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onUnarchive={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, dragging">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={seedServices[2]}
              category={seedCategories.find((c) => c.id === seedServices[2].categoryId)!}
              dragging
              withHandle={false}
              onDelete={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, combo">
          <div className="w-full max-w-xl">
            {/* PRD-143 — combos share the list with single services, so the row
              carries a tinted Combo badge and a component count. */}
            <ServiceCardInner
              service={SEED_COMBOS[0]}
              category={seedCategories.find((c) => c.id === SEED_COMBOS[0].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onEdit={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, combo (archived)">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={{ ...SEED_COMBOS[1], isActive: false }}
              category={seedCategories.find((c) => c.id === SEED_COMBOS[1].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onUnarchive={() => {}}
            />
          </div>
        </Row>
        <Row label="Category sidebar">
          <CategorySidebar
            categories={seedCategories.filter((c) => !c.isSystemManaged)}
            selectedId={null}
            counts={seedCategories
              .filter((c) => !c.isSystemManaged)
              .reduce<Record<string, number>>((acc, c) => {
                acc[c.id] = seedServices.filter((s) => s.categoryId === c.id).length
                return acc
              }, {})}
            totalCount={
              seedServices.filter((s) =>
                seedCategories.some((c) => !c.isSystemManaged && c.id === s.categoryId),
              ).length
            }
            onSelect={() => {}}
            onAddCategory={() => {}}
            onAddService={() => {}}
            onDeleteCategory={() => {}}
          />
        </Row>
      </Section>
      <Section
        title="Online booking — promo code"
        description="Promo code on the booking review step: applied, AED 0, the field's states, each refusal, and a code that stopped applying."
      >
        <BookingPromoCodeDemo />
      </Section>
      <Section
        title="Deals — redeemable on your booking page"
        description="The deal wizard's online-booking switch: off with an optional code, on without a code, and on with one."
      >
        <StatePicker
          states={[
            { label: "Team only", content: <DealOnlineSwitchDemo on={false} code="" /> },
            { label: "Online, no code", content: <DealOnlineSwitchDemo on code="" /> },
            { label: "Online, with code", content: <DealOnlineSwitchDemo on code="WELCOME15" /> },
          ]}
        />
      </Section>
      <Section
        title="Deals — list statuses"
        description="One row per status, as the built list shows them; an expired deal's Activate is disabled."
      >
        {(
          [
            ["Active", "summer-groom"],
            ["Inactive — switched off by hand", "referral-bonus"],
            ["Expired — past its end date", "july-treat"],
            ["Archived — after Delete", "eid-weekend"],
          ] as const
        ).map(([label, id]) => {
          const deal = MOCK_DEALS.find((d) => d.id === id)
          return deal ? (
            <Row key={id} label={label}>
              <LocationsProvider persist={false} initialLocations={NINE_BRANCH_ESTATE}>
                <div className="w-full max-w-146">
                  <DealsTable
                    deals={[deal]}
                    todayIso={TODAY_ISO}
                    locationName={estateLocationName}
                    onSelect={() => {}}
                    onEdit={() => {}}
                    onSetStatus={() => {}}
                    onDuplicate={() => {}}
                  />
                </div>
              </LocationsProvider>
            </Row>
          ) : null
        })}
      </Section>
      <Section
        title="Deals — at the till"
        description="A promotion on a sale line: the removable chip, one summary row per promotion, and the checkout order."
      >
        <Row label="Cart — chip with remove, summary row" align="start">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card">
            <CartContent
              lines={PROMO_CART_LINES}
              hasClient={false}
              onRemove={() => {}}
              onSetQty={() => {}}
              onRemoveDeal={() => toast("Promotion removed")}
            />
            <CartFooter
              lines={PROMO_CART_LINES}
              discountMinor={2000}
              onContinue={() => {}}
              onAddTip={() => {}}
              onAddCartDiscount={() => {}}
              onAddSaleNote={() => {}}
              onSaveDraft={() => {}}
              onCancelSale={() => {}}
            />
          </div>
        </Row>
        <Row label="Tip step — discounts before Subtotal and VAT" align="start">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card">
            <CheckoutFooter
              baseMinor={38900}
              tipMinor={2000}
              ctaLabel="Continue to payment"
              onCta={() => {}}
              onAddTip={() => {}}
              onAddCartDiscount={() => {}}
              onAddSaleNote={() => {}}
              onSaveDraft={() => {}}
              onCancelSale={() => {}}
              deductions={[
                {
                  key: "promo",
                  label: "Promotion · Summer groom offer - 20%",
                  amountMinor: 8600,
                },
                { key: "cart", label: "Cart discount", amountMinor: 2000 },
              ]}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Combos across surfaces"
        description="Combos while chosen (badge and count) and once picked (component services with struck prices)."
      >
        <Row label="Appointment service picker (clipped to 520px)" align="start">
          <div className="h-130 w-full max-w-md overflow-hidden rounded-2xl border border-border/60">
            {/* Search 'combo' to bring both bundles side by side. */}
            <ServicePickerPanel onBack={() => {}} onSelectService={() => {}} />
          </div>
        </Row>
        <Row label="Booked lines — hover card ('Combo - Service')">
          <AppointmentQuickPanel booking={COMBO_DEMO_BOOKING} />
        </Row>
        <Row label="Pet-parent picker — combo card (Grooming)" align="start">
          <div className="w-full max-w-md">
            {/* The public flow badges a combo the same way the staff pickers do;
              picking it books its component services. */}
            <BookingComboPickerDemo />
          </div>
        </Row>
        <Row label="POS cart — component lines + bundle discount" align="start">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card">
            <CartContent
              lines={COMBO_CART_LINES}
              hasClient={false}
              onRemove={() => {}}
              onSetQty={() => {}}
            />
            <CartFooter
              lines={COMBO_CART_LINES}
              onContinue={() => {}}
              onAddTip={() => {}}
              onAddCartDiscount={() => {}}
              onAddSaleNote={() => {}}
              onSaveDraft={() => {}}
              onCancelSale={() => {}}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="New sale — Gift cards in checkout"
        description="Selling a gift card from the POS: the Add/Edit dialog, the block on paying with a gift card, and redeem by code."
      >
        <Row label="Add gift card dialog">
          <GiftCardDialogDemo />
        </Row>
        <Row label="Payment step — gift card in cart">
          <div className="w-full max-w-xl">
            {/* Real PaymentView with a gift card present: notice shown, Gift card tile disabled. */}
            <PaymentView onSelect={(id) => toast(`Selected ${id}`)} hasGiftCard />
          </div>
        </Row>
        <Row label="Redeem gift card dialog">
          <RedeemGiftCardDialogDemo />
        </Row>
      </Section>
      <Section
        title="New sale — Payment link (self checkout)"
        description="Payment link lock screen: cart frozen while the 12-hour link is live, with Cancel and Mark as paid."
      >
        <Row label="Payment step — method grid">
          <div className="w-full max-w-xl">
            {/* Payment link leads the grid, ahead of the take-payment-here methods. */}
            <PaymentView onSelect={(id) => toast(`Selected ${id}`)} />
          </div>
        </Row>
        <Row label="Send payment link dialog">
          <SelfCheckoutDialogDemo />
        </Row>
        <Row label="Locked cart — link is live">
          <div className="flex min-h-96 w-full max-w-xl rounded-3xl border border-border/60 bg-background">
            <PaymentLinkLockScreen
              link={{
                name: "Maaz Test",
                phone: "50 963 6445",
                amountMinor: 5700,
                sentAt: NOW,
                draftRef: "C9B3A77D",
              }}
              onCancelLink={() => toast("Link cancelled · opens the draft sale")}
              onMarkPaid={() => toast("Marked as paid")}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="New sale — POS Terminal (card present)"
        description="A sale sent to a terminal locks the drawer: Mark as paid stands in for the callback, Collect another way is the only exit."
      >
        <Row label="Payment step — two machines, one tile each">
          <div className="w-full max-w-xl">
            <PaymentView
              onSelect={(id) => toast(`Selected ${id}`)}
              machines={[
                { id: "TRM-7Q4K2M", name: "Front Desk Register", blockedReason: null },
                { id: "TRM-3H8N5P", name: "Grooming Counter", blockedReason: null },
              ]}
            />
          </div>
        </Row>
        {/* One row, not two: past the cap and nothing-signed-in produce the
          same grid — a single POS Terminal tile. What separates them is what
          the picker says when it opens, which is the pair of rows below. */}
        <Row label="Payment step — two machines, one of them signed out">
          <div className="w-full max-w-xl">
            <PaymentView
              onSelect={(id) => toast(`Selected ${id}`)}
              machines={[
                { id: "TRM-7Q4K2M", name: "Front Desk Register", blockedReason: null },
                {
                  id: "TRM-3H8N5P",
                  name: "Grooming Counter",
                  blockedReason: "Nobody signed in",
                },
              ]}
            />
          </div>
        </Row>
        <Row label="Payment step — past the tile cap, one POS Terminal tile">
          <div className="w-full max-w-xl">
            <PaymentView onSelect={(id) => toast(`Selected ${id}`)} />
          </div>
        </Row>
        <Row label="Payment step — no usable terminal (tile hidden)">
          <div className="w-full max-w-xl">
            <PaymentView onSelect={(id) => toast(`Selected ${id}`)} terminalAvailable={false} />
          </div>
        </Row>
        <Row label="Send to terminal — picking the machine">
          <SelectTerminalDialogDemo />
        </Row>
        <Row label="Send to terminal — nothing signed in">
          <SelectTerminalDialogDemo signedIn={false} />
        </Row>
        <Row label="Locked cart — sale is on the machine">
          <div className="flex min-h-96 w-full max-w-xl rounded-3xl border border-border/60 bg-background">
            <TerminalLockScreen
              charge={{
                amountMinor: 15000,
                terminalName: "Front Desk Register",
                terminalLocation: "Downtown Clinic",
                sentAt: NOW,
              }}
              firstName="Maaz"
              onCancel={() => toast("Taken off the terminal · back to the payment methods")}
              onMarkPaid={() => toast("Marked as paid")}
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Payment policy — deposit & no-show config"
        description="The shared percent/AED deposit input and the generated example line from the payment policy editor."
      >
        <Row label="Amount input — percent mode (deposit default)">
          <AmountInputDemo initial={{ mode: "percent", value: 25 }} />
        </Row>
        <Row label="Amount input — fixed AED mode (no-show fee)">
          <AmountInputDemo initial={{ mode: "fixed", value: 150 }} />
        </Row>
        <Row label="Amount input — disabled (row on Default in the per-service table)">
          <AmountInput
            value={{ mode: "percent", value: 25 }}
            onChange={() => {}}
            disabled
            className="w-64"
          />
        </Row>
        <Row label="Example policy — auto-generated client-facing line">
          <div className="w-full max-w-xl rounded-xl bg-cami-violet-2 px-4 py-3 text-sm text-foreground">
            {examplePolicyText(DEFAULT_PAYMENT_POLICY, "Sota Salon")}
          </div>
        </Row>
        <Row label="Example policy — no payment policy state">
          <div className="w-full max-w-xl rounded-xl bg-cami-violet-2 px-4 py-3 text-sm text-foreground">
            {examplePolicyText({ ...DEFAULT_PAYMENT_POLICY, type: "none" }, "Sota Salon")}
          </div>
        </Row>
      </Section>
      <Section
        title="Terminals (DSG-62)"
        description="Per-device terminal rows with session state, and demo controls for Not paired, No sessions and Active."
      >
        <Row label="Empty (nothing added yet)">
          <div className="w-full rounded-2xl border border-border/60 bg-card p-6">
            <TerminalsPanel
              onBack={() => toast("Back to Payments")}
              breadcrumbRoot={{ label: "Payments", icon: CreditCardIcon }}
            />
          </div>
        </Row>
        <Row label="Typical (2 terminals)">
          <div className="w-full rounded-2xl border border-border/60 bg-card p-6">
            <TerminalsPanel
              onBack={() => toast("Back to Payments")}
              breadcrumbRoot={{ label: "Payments", icon: CreditCardIcon }}
              initialState="typical"
            />
          </div>
        </Row>
        <Row label="All statuses">
          <div className="w-full rounded-2xl border border-border/60 bg-card p-6">
            <TerminalsPanel
              onBack={() => toast("Back to Payments")}
              breadcrumbRoot={{ label: "Payments", icon: CreditCardIcon }}
              initialState="full"
            />
          </div>
        </Row>
      </Section>
      <Section
        title="Notifications settings"
        description="Three cards: Sender ID, a Reminders matrix of 6 events by 3 channels, and Usage this month with a month-end estimate."
      >
        <Row label="Live (Settings + Log tabs)">
          <div className="w-full rounded-2xl border border-border/60 bg-card p-6">
            {/* The panel reads its deep-link params with useSearchParams, which
              bails out of prerendering unless a boundary sits above it —
              /playground is a static page, so the boundary lives here. */}
            <Suspense fallback={null}>
              <NotificationsSettingsPanel />
            </Suspense>
          </div>
        </Row>
      </Section>
      <Section
        title="Communication templates"
        description="Per-channel template list and editor with live preview and {{placeholder}} chips, and no send toggle."
      >
        <Row label="Live (Email + WhatsApp tabs)">
          <div className="w-full rounded-2xl border border-border/60 bg-card p-6">
            {/* Same reason as the notifications panel: the panel reads its
              deep-link params with useSearchParams, which bails out of
              prerendering unless a boundary sits above it. */}
            <Suspense fallback={null}>
              <CommsTemplatesPanel />
            </Suspense>
          </div>
        </Row>
      </Section>
      <Section
        title="Google review link (PRD-168)"
        description="Google review URL field: a listing URL saves with a warning, non-Google is refused, empty drops the Thank You review line."
      >
        <Row label="Field — live (writes the shared setting)">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6">
            <GoogleReviewLinkField id="playground-google-review-link" help="full" />
          </div>
        </Row>
        <Row label="What each paste is recognised as">
          <GoogleLinkChecks />
        </Row>
      </Section>
      <Section
        title="Money — account summary (DSG-77)"
        description="Account summary split into terminal money paid by NeoPay and online money by Cami. Both layouts shown as D6 is undecided."
      >
        <StatePicker
          states={[
            { label: "Two rails", content: <MoneySummaryDemo variant="two-rail" /> },
            { label: "Blended", content: <MoneySummaryDemo variant="blended" /> },
            {
              label: "Payouts paused",
              content: <MoneySummaryDemo variant="two-rail" block="destination-unverified" />,
            },
            {
              label: "Below minimum",
              content: <MoneySummaryDemo variant="two-rail" block="below-minimum" />,
            },
            {
              label: "Terminal only",
              content: (
                <MoneySummaryDemo variant="two-rail" rails={{ online: false, terminal: true }} />
              ),
            },
            { label: "Zero activity", content: <MoneySummaryDemo variant="two-rail" empty /> },
          ]}
        />
      </Section>
      <Section
        title="Money — activity and detail (DSG-78)"
        description="Itemised money feed with net day subtotals, row detail, and payout rows that sum to the payout."
      >
        <StatePicker
          states={[
            { label: "Both rails", content: <MoneyActivityDemo /> },
            {
              label: "Terminal only",
              content: <MoneyActivityDemo rails={{ online: false, terminal: true }} />,
            },
            { label: "Empty", content: <MoneyActivityDemo empty /> },
          ]}
        />
      </Section>
      <Section
        title="Money — bank account (DSG-75)"
        description="Bank account change as a multi-step flow with verification and a change log, try the gateway failure state."
      >
        <StatePicker
          states={[
            { label: "Verified", content: <BankAccountDemo state="verified" /> },
            { label: "Unverified", content: <BankAccountDemo state="unverified" /> },
            { label: "Gateway failed", content: <BankAccountDemo state="gateway-failed" /> },
            { label: "Read-only", content: <BankAccountDemo state="read-only" /> },
            { label: "Terminal only", content: <BankAccountDemo state="terminal-only" /> },
          ]}
        />
      </Section>
      <Section
        title="Money — invoices and fees (DSG-76)"
        description="Cami's per-period fee statements with the current month pending and each fee expandable to its sale."
      >
        <Row label="NeoPay deducts">
          <MoneyFeesDemo terminalModel="gateway-deducts" />
        </Row>
        <Row label="Cami invoices">
          <MoneyFeesDemo terminalModel="cami-invoices" />
        </Row>
        <Row label="Online only">
          <MoneyFeesDemo
            terminalModel="gateway-deducts"
            rails={{ online: true, terminal: false }}
          />
        </Row>
      </Section>
      <Section
        title="Money — billing details (DSG-74)"
        description="Billing details card: missing fields as Add pills, the no-TRN consequence, and a forward-only Edit with address search."
      >
        <Row label="Complete">
          <BillingDetailsDemo state="complete" />
        </Row>
        <Row label="No TRN">
          <BillingDetailsDemo state="no-trn" />
        </Row>
        <Row label="Nothing filled in">
          <BillingDetailsDemo state="empty" />
        </Row>
      </Section>
      <Section
        title="CamiPay fee breakdown — Partner side"
        description="Partner sale detail fee: Sale amount, Cami fee and Net, with the calculation spelled out under the fee."
      >
        <Row label="Percentage only">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5">
            <CamiPayFeeBreakdown
              rail="terminal"
              rate={{ percent: 1.8, fixedMinor: 0, fixedBelowMinor: null }}
              amountMinor={5400}
              capturedOnLabel="25 May 2026"
            />
          </div>
        </Row>
        <Row label="Percentage + fixed, under the bracket so the fixed applies">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5">
            <CamiPayFeeBreakdown
              rail="online"
              rate={{ percent: 3, fixedMinor: 75, fixedBelowMinor: 10000 }}
              amountMinor={3040}
              capturedOnLabel="25 May 2026"
            />
          </div>
        </Row>
        <Row label="Same rate above the bracket, so the fixed drops off">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5">
            <CamiPayFeeBreakdown
              rail="online"
              rate={{ percent: 3, fixedMinor: 75, fixedBelowMinor: 10000 }}
              amountMinor={1050000}
              capturedOnLabel="01 Jun 2026"
            />
          </div>
        </Row>
        <Row label="No rate configured, so no fee">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5">
            <CamiPayFeeBreakdown
              rail="terminal"
              rate={ZERO_RATE}
              amountMinor={4200}
              capturedOnLabel="25 May 2026"
            />
          </div>
        </Row>
      </Section>
      <Section
        lazy
        title="Invoice document — A4 downloadable"
        description="One invoice component for PDF, email and link, as white paper with no badge chips, previewed at 34%."
      >
        <Row label="Status — carried by the numbers, no chips">
          <InvoicePreview id="completed" note="Split tender, per-tender timestamps, Balance 0.00" />
          <InvoicePreview id="part-paid" note="Cart discount, Balance outstanding" />
          <InvoicePreview
            id="unpaid"
            note="Named promotion. Explicit 'No payments received' row, not a bare gap"
          />
        </Row>
        <Row label="Exceptional states — prose, plus a watermark for void">
          <InvoicePreview
            id="credit-note"
            note="Own number, references the original, and reverses the VAT the benchmark omits"
          />
          <InvoicePreview
            id="voided"
            note="Subtitle carries the timestamp, watermark carries the at-a-glance signal"
          />
        </Row>
        <Row label="Document type — three-way, one layout">
          <InvoicePreview
            id="tax-full"
            note="Recipient TRN captured, so per-line tax columns render"
          />
          <InvoicePreview
            id="plain"
            note="No business TRN: no tax column, no tax summary, no tax wording anywhere"
          />
          <InvoicePreview id="recipient-minimal" note="Recipient collapses to a single name line" />
        </Row>
        <Row label="Money edge cases">
          <InvoicePreview
            id="tip"
            note="EC-39. A tip splits taxable gross from amount due — both rows always render"
          />
          <InvoicePreview
            id="zero-value"
            note="Package redemption at AED 0.00 is still a valid, fully itemised invoice"
          />
          <InvoicePreview
            id="zero-value-tip"
            note="Live Sale 387. Package covers the service, customer tips 5.00 — production folds that 5.00 into Total unlabelled, where it is indistinguishable from 5% VAT"
          />
          <InvoicePreview
            id="credit-note-tip"
            note="A refund returns the tip too, but the reversed VAT stays on the line only"
          />
          <InvoicePreview
            id="overtender"
            note="Change goes back across the counter and does not count as collected"
          />
        </Row>
        <Row label="Identity, overflow and pagination">
          <InvoicePreview
            id="logo"
            note="Logo slot filled. With none it collapses, no placeholder box"
          />
          <InvoicePreview
            id="overflow"
            note="Long legal name wraps to two lines; long description wraps in-column"
          />
          <InvoicePreview
            id="multi-page"
            note="30 lines. Condensed identity + column headers repeat, page N of M"
          />
        </Row>
      </Section>
      <Section
        lazy
        title="Invoice document — share & email actions"
        description="Share invoice and email invoice modals from the sale detail dialog, neither leaving the sale."
      >
        <Row label="Share invoice — the link is fetched, so it has three states">
          <ShareDialogDemo
            linkState="ready"
            label="Ready"
            note="Link arrived. Copy shows a tick that reverts after 2s. Gmail also copies the link and toasts, because Gmail's compose URL drops a prefilled body often enough that the operator would otherwise send an empty email; WhatsApp's text param is reliable and does neither."
          />
          <ShareDialogDemo
            linkState="loading"
            label="Loading"
            note="Dialog opens before the backend has minted the share token. Skeleton in place of the URL, every action disabled."
          />
          <ShareDialogDemo
            linkState="error"
            label="Failed"
            note="Token request failed. 'Failed to generate link' in place of the URL, Gmail drops to a non-interactive row rather than a dead link."
          />
        </Row>
        <Row label="Email invoice">
          <EmailDialogDemo
            label="Client on file"
            note="Prefilled and focused. Send is disabled until the address is valid."
          />
          <EmailDialogDemo
            walkIn
            label="Walk-in"
            note="No client record, so no address to prefill — an extra line says so instead of leaving an empty field unexplained."
          />
          <EmailDialogDemo
            invalid
            label="Validation"
            note="The error appears on a failed Send, never while typing: 'Email address is required' when empty, 'Enter a valid email address' otherwise."
          />
        </Row>
      </Section>
      <Section
        lazy
        title="Product import — review states (DSG-80)"
        description="Bulk-import review with causes grouped once, using Aya's 100-row case, compare with today's UI via the compare bar."
      >
        <Row label="Grouped causes" align="start">
          <IssueSummaryDemo
            scenario="mixed"
            severity="blocking"
            label="Blocking — two causes"
            note="Ordered by how many rows each hit. Each states the rule, the rows, and the fix."
          />
          <IssueSummaryDemo
            scenario="aya-migration"
            severity="advisory"
            label="Advisory"
            note="Weighted down: one line and a count, no row list, no fix line."
          />
        </Row>

        <Row label="Outcome strip" align="start">
          <OutcomeStripDemo
            scenario="aya-migration"
            label="First import"
            note="Additions lead. Blocked rows are counted here but acted on in the summary above."
          />
          <OutcomeStripDemo
            scenario="mixed"
            label="Re-import"
            note="Updates lead; needs-your-OK is tinted because it is the count that stalls."
          />
        </Row>

        <Row label="Row anatomy" align="start">
          <ReviewRowDemo
            scenario="aya-migration"
            status="reject"
            label="Blocked"
            note="The cause sits in the row. Expand for the checker's own sentences."
          />
          <ReviewRowDemo
            scenario="mixed"
            status="update"
            label="Update"
            note="Names the fields that change, so the diff is optional."
          />
          <ReviewRowDemo
            scenario="mixed"
            status="flag"
            label="Needs your OK"
            note="Per-field switch, off by default."
          />
          <ReviewRowDemo
            scenario="mixed"
            status="skip"
            label="Left out"
            note="The option the operator chose, not 'Skipped by mode'."
          />
          <ReviewRowDemo
            scenario="duplicate-barcodes"
            status="reject"
            label="Blocked, but rescuable"
            note="The one rejection that can be undone in place."
          />
          <ReviewRowDemo
            scenario="placeholder-skus"
            status="create"
            label="Generated SKU"
            note="Imports cleanly, but says the code is ours."
          />
        </Row>

        <StatePicker
          label="Whole review step"
          states={[
            {
              label: "The reported case",
              content: (
                <ReviewStateDemo
                  scenario="aya-migration"
                  label="The reported case"
                  note="83 ready, 17 blocked. Clicking a cause filters the table to those rows."
                />
              ),
            },
            {
              label: "Every status at once",
              content: (
                <ReviewStateDemo
                  scenario="mixed"
                  label="Every status at once"
                  note="Plus an unrecognised tax rate. The filter appears because several statuses are present."
                />
              ),
            },
            {
              label: "Nothing importable",
              content: (
                <ReviewStateDemo
                  scenario="all-rejected"
                  label="Nothing importable"
                  note="No disabled primary button and no filter — one way out instead."
                />
              ),
            },
            {
              label: "Already up to date",
              content: (
                <ReviewStateDemo
                  scenario="up-to-date"
                  label="Already up to date"
                  note="Confirm is gone; the headline is the answer."
                />
              ),
            },
            {
              label: "After PRD-63",
              content: (
                <ReviewStateDemo
                  scenario="placeholder-skus"
                  label="After PRD-63"
                  note="All 100 import; the advisory names the 17 generated SKUs."
                />
              ),
            },
          ]}
        />

        <StatePicker
          label="Done step"
          states={[
            {
              label: "With rows left behind",
              content: (
                <DoneStateDemo
                  scenario="mixed"
                  label="With rows left behind"
                  note="Offers the failed-row download, not just a count."
                />
              ),
            },
            {
              label: "After PRD-63",
              content: (
                <DoneStateDemo
                  scenario="placeholder-skus"
                  label="After PRD-63"
                  note="'17 products need a real SKU', linking to them. This is what makes PRD-63 safe to ship."
                />
              ),
            },
            {
              label: "Clean import",
              content: (
                <DoneStateDemo
                  scenario="duplicate-barcodes"
                  label="Clean import"
                  note="Follow-up blocks appear only when there is something to chase."
                />
              ),
            },
          ]}
        />
      </Section>
      <Section
        lazy
        title="Clients and pets import — review states (DSG-84)"
        description="Import review states for clients and pets, including first-name-only matches and pet rows with owner and pet outcomes."
      >
        <Row label="Row anatomy" align="start">
          <ClientRowDemo
            scenario="aya-clients"
            status="reject"
            label="Blocked — no last name"
            note="18 of Aya's rows. The cause is in the row; the grouped block above states it once."
          />
          <ClientRowDemo
            scenario="aya-clients"
            status="review"
            label="Name match"
            note="'In your file' against 'Already in Cami'. The third option — add as a new person — is drawn disabled: the backend models NEW_RECORD but the confirm call has no override that reaches it."
          />
          <ClientRowDemo
            scenario="aya-clients"
            status="create"
            label="Will be added"
            note="Nothing to say, so the Details column stays empty rather than repeating the badge."
          />
          <ClientRowDemo
            scenario="maaz-pets"
            status="create"
            label="Pet row"
            note="Owner and pet in one row, each with its own outcome."
          />
          <ClientRowDemo
            scenario="maaz-pets"
            status="standalone"
            label="Pet with no owner"
            note="No phone and no email, so the backend imports the pet on its own and creates nobody. The owner side is skipped, but badging the row 'Left out' would say the pet never arrived — so the pet's outcome names the row."
          />
        </Row>

        <StatePicker
          label="Whole review step"
          states={[
            {
              label: "Aya's client import",
              content: (
                <ClientReviewStateDemo
                  scenario="aya-clients"
                  label="Aya's client import"
                  note="Opens on the 21 rows that need her — 18 missing a last name, 1 duplicate phone, 2 name matches — not on 79 identical green badges."
                />
              ),
            },
            {
              label: "Maaz's pet import",
              content: (
                <ClientReviewStateDemo
                  scenario="maaz-pets"
                  label="Maaz's pet import"
                  note="Eleven counts and eight lists created. Owner counts are named, so '826 pets will be added' cannot be read as the owner total."
                />
              ),
            },
            {
              label: "No contact details anywhere",
              content: (
                <ClientReviewStateDemo
                  scenario="pets-no-owner"
                  label="No contact details anywhere"
                  note="120 rows, every pet standalone, not one client created. The commit button counts pets on a pet import for this file: counting owners read 'nothing to import' over an import of 120 pets."
                />
              ),
            },
            {
              label: "Mostly name matches",
              content: (
                <ClientReviewStateDemo
                  scenario="many-name-matches"
                  label="Mostly name matches"
                  note="16 of 24 rows matched on first name alone — the volume the reported file would produce in a populated account."
                />
              ),
            },
            {
              label: "Pet feature off",
              content: (
                <ClientReviewStateDemo
                  scenario="client-no-pets"
                  label="Pet feature off"
                  note="The same file on an account without pets. Nothing pet-related may appear anywhere on this screen."
                />
              ),
            },
          ]}
        />

        <StatePicker
          label="Done step"
          states={[
            {
              label: "Clients, with rows left behind",
              content: (
                <ClientOutcomeDemo
                  scenario="aya-clients"
                  label="Clients, with rows left behind"
                  note="The ledger has to add up to the file: 79 added + 2 left for you to answer + 19 left behind = 100."
                />
              ),
            },
            {
              label: "Pets",
              content: (
                <ClientOutcomeDemo
                  scenario="maaz-pets"
                  label="Pets"
                  note="The same panel as the product Done step — the two were separate implementations and drifted apart within a day."
                />
              ),
            },
            {
              label: "Pets, none with an owner",
              content: (
                <ClientOutcomeDemo
                  scenario="pets-no-owner"
                  label="Pets, none with an owner"
                  note="'120 pets added' with 0 owners under it — the ledger keeps the standalone pets on their own line rather than folding them into the added count."
                />
              ),
            },
          ]}
        />
      </Section>
      <Section
        lazy
        title="Performance dashboard — chart primitives"
        description="The four chart marks and shared categorical palette for the Performance dashboard. Check it in both themes."
      >
        <Row label="Categorical palette" align="start">
          <div className="flex flex-wrap gap-3">
            {CHART_CAT_SWATCH.map((swatch, i) => (
              <div key={swatch} className="flex items-center gap-2">
                <span className={cn("size-4 rounded-sm", swatch)} />
                <span className="text-xs text-muted-foreground">
                  {i === CHART_CAT_SWATCH.length - 1 ? "Other (overflow)" : `Slot ${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Donut" align="start">
          <div className="w-[420px] rounded-2xl border border-border/60 bg-card p-5">
            <DonutChart
              items={SALES_BY_PAYMENT}
              values={SALES_BY_PAYMENT_VALUES}
              centreLabel="collected"
              centreValue="AED 10,240"
              formatValue={formatAed}
            />
          </div>
          <span className="w-56 text-xs leading-snug text-muted-foreground">
            Stacked: ring above its legend. Hovering a slice swaps the centre total for that slice —
            no floating tooltip, because the tooltip would cover the total it is explaining.
          </span>
        </Row>

        <Row label="Donut — wide" align="start">
          <div className="w-[720px] rounded-2xl border border-border/60 bg-card p-5">
            <DonutChart
              items={SALES_BY_PAYMENT}
              values={SALES_BY_PAYMENT_VALUES}
              centreLabel="collected"
              centreValue="AED 10,240"
              formatValue={formatAed}
              wide
            />
          </div>
          <span className="w-56 text-xs leading-snug text-muted-foreground">
            Ring beside the legend, for cards 8 columns and wider. The legend stays one column: two
            columns truncated the longer labels and gave each column its own value edge, so the
            amounts stopped lining up.
          </span>
        </Row>

        <Row label="Funnel" align="start">
          <div className="w-[420px] rounded-2xl border border-border/60 bg-card p-5">
            <FunnelChart stages={WHATSAPP_FUNNEL} />
          </div>
        </Row>

        <Row label="Ranked bars" align="start">
          <div className="w-[420px] rounded-2xl border border-border/60 bg-card p-5">
            <RankedBarChart
              data={OPEN_INQUIRY_AGE}
              formatValue={(n) => `${n}`}
              unit="Conversations still open, by how long"
              orientation="column"
            />
          </div>
          <span className="w-56 text-xs leading-snug text-muted-foreground">
            Ranked, so the order carries the ranking and the axis carries the size. Shown the way
            the dashboard ships it — vertical columns, wrapped two-line labels.
          </span>
        </Row>

        <Row label="Capacity heatmap" align="start">
          <div className="w-[620px] rounded-2xl border border-border/60 bg-card p-5">
            <CapacityHeatmap
              rowLabels={HEATMAP_HOURS}
              colLabels={HEATMAP_DAYS}
              matrix={HEATMAP_MATRIX}
            />
          </div>
          <span className="w-56 text-xs leading-snug text-muted-foreground">
            Sequential blue ramp, never the categorical slots. The number is printed in every cell
            so the reading never depends on colour.
          </span>
        </Row>
      </Section>
      <Section
        lazy
        title="Reporting module (DSG-43 / PRO-703)"
        description="Shared view templates that render every report from its config, with all amounts in AED."
      >
        <StatePicker
          label="Report"
          states={[
            ...(reportPaymentsSummary
              ? [
                  {
                    label: "Payments summary",
                    note: "Table View: Total row, Cami payment methods",
                    content: <TableReport report={reportPaymentsSummary} />,
                  },
                ]
              : []),
            ...(reportDiscountSummary
              ? [
                  {
                    label: "Discount summary",
                    note: "Table View: group-by re-slices the rows: name / type / category; opens most used first",
                    content: <TableReport report={reportDiscountSummary} />,
                  },
                ]
              : []),
            ...(reportAppointmentsSummary
              ? [
                  {
                    label: "Appointments summary",
                    note: "Table View: pick Team member or Service: rows overlap, the Total row keeps the distinct count and a note says why",
                    content: <TableReport report={reportAppointmentsSummary} />,
                  },
                ]
              : []),
            ...(reportFinanceSummary
              ? [
                  {
                    label: "Finance summary",
                    note: "Detailed Table View: section-grouped metric × period matrix",
                    content: <DetailedTableReport report={reportFinanceSummary} />,
                  },
                ]
              : []),
            ...(reportPerformanceDashboard
              ? [
                  {
                    label: "Performance dashboard",
                    note: "Dashboard View: 6 Cami metrics + comparison chart + drill-downs",
                    content: <DashboardReport report={reportPerformanceDashboard} />,
                  },
                ]
              : []),
            ...(reportPerformanceSummary
              ? [
                  {
                    label: "Performance summary",
                    note: "Matrix View: metric × team-member, section subtotals, Total column",
                    content: <DashboardReport report={reportPerformanceSummary} />,
                  },
                ]
              : []),
            ...(reportPerformanceOverTime
              ? [
                  {
                    label: "Performance over time",
                    note: "Over-time Matrix: live pills recompute a recharts bar chart + entity × time-period table",
                    content: <DashboardReport report={reportPerformanceOverTime} />,
                  },
                ]
              : []),
          ]}
        />
      </Section>
      <Section
        title="Customer card — per-venue theming"
        description="Customer card in five venue palettes, with wallet, loyalty, next appointment, preferences and the empty card."
        lazy
      >
        <Row label="Themes">
          <LazyMount minHeight={440}>
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {CUSTOMER_CARD_THEMES.map((theme) => (
                <CustomerCardPreview key={theme.id} themeId={theme.id} label={theme.label} />
              ))}
            </div>
          </LazyMount>
        </Row>
        <Row label="Empty">
          <LazyMount minHeight={340}>
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              <CustomerCardPreview
                slug="purr-palace"
                themeId="sage"
                label="Empty wallet, no loyalty programme"
              />
            </div>
          </LazyMount>
        </Row>
        <Row label="The door">
          <a href="/sota/card/demo" className="text-sm font-medium text-foreground hover:underline">
            Branded login — /sota/card/demo
          </a>
        </Row>
      </Section>
      <Section
        title="Client card — the two faces"
        description="Operator and client faces of one client row (Maaz Shaffi) side by side through the same resolver."
        lazy
      >
        <Row label="One record" align="start">
          <LazyMount minHeight={600}>
            <TwoFaces clientId="maaz-shaffi" slug="sota" />
          </LazyMount>
        </Row>
      </Section>
      <Section
        title="Client card — message to card"
        description="Trigger, message, branded login and card in four panels, with the venue's mark carried from the message onward."
        lazy
      >
        <Row label="End to end" align="start">
          <LazyMount minHeight={380}>
            <CardJourney slug="sota" clientId="maaz-shaffi" />
          </LazyMount>
        </Row>
      </Section>
    </Lane>
  )
}
