"use client"

import {
  BanknoteIcon,
  BedIcon,
  BellIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CirclePlusIcon,
  CircleUserIcon,
  CreditCardIcon,
  FlagIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  LightbulbIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PercentIcon,
  PhoneIcon,
  PlusIcon,
  ScissorsIcon,
  SettingsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
} from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
  type MockServiceCategory,
} from "@/app/appointments/mock"
import { CartContent, CartFooter } from "@/app/sales/new-sale/cart-summary"
import { GiftCardDialog, newGiftCardDraft } from "@/app/sales/new-sale/gift-card-dialog"
import { comboCartLines, SERVICES } from "@/app/sales/new-sale/mock"
import { PaymentLinkLockScreen } from "@/app/sales/new-sale/payment-link-lock"
import { PaymentView } from "@/app/sales/new-sale/payment-view"
import { RedeemGiftCardDialog } from "@/app/sales/new-sale/redeem-gift-card-dialog"
import { SelectTerminalDialog } from "@/app/sales/new-sale/select-terminal-dialog"
import { SelfCheckoutDialog } from "@/app/sales/new-sale/self-checkout-dialog"
import { TerminalLockScreen } from "@/app/sales/new-sale/terminal-lock"
import { AddTeamMemberDialog } from "@/components/blocks/add-team-member-dialog"
import { AddressSearchField } from "@/components/blocks/address-search-field"
import { AppointmentBlock } from "@/components/blocks/appointment-block"
import { AppointmentQuickPanel } from "@/components/blocks/appointment-popover"
import { AppointmentsToolbar } from "@/components/blocks/appointments-toolbar"
import { AvatarStack } from "@/components/blocks/avatar-stack"
import { BoardingDetailSheet } from "@/components/blocks/boarding/booking-detail-sheet"
import { NewBoardingSheet } from "@/components/blocks/boarding/new-boarding-sheet"
import { ServicePicker } from "@/components/blocks/booking/service-picker"
import { BranchDayStrip } from "@/components/blocks/branch-day-strip"
import { BranchRoster } from "@/components/blocks/branch-roster"
import { BusinessNotificationsSection } from "@/components/blocks/business-detail-dialog"
import { CamiPayFeeBreakdown } from "@/components/blocks/camipay-fee-breakdown"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { ClientNoteBanner } from "@/components/blocks/client-note-banner"
import { CommsTemplatesPanel } from "@/components/blocks/comms-templates-panel"
import { DaycareDetailSheet } from "@/components/blocks/daycare/booking-detail-sheet"
import { EmailInvoiceDialog } from "@/components/blocks/email-invoice-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { GlobalSearchDialog } from "@/components/blocks/global-search-dialog"
import { HqCamiPayPanel } from "@/components/blocks/hq-camipay-panel"
import { TerminalStatus } from "@/components/blocks/hq-terminal-status"
import { HqTerminalsPanel } from "@/components/blocks/hq-terminals-panel"
import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
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
import { InvoiceDocumentView } from "@/components/blocks/invoice-document"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import { AddLocationsTakeover } from "@/components/blocks/location-form"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { LocationSwitcher } from "@/components/blocks/location-switcher"
import { MerchantCode } from "@/components/blocks/merchant-code"
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
import { RailBadge } from "@/components/blocks/money/rail-badge"
import { MoveToBranchDialog } from "@/components/blocks/move-to-branch-dialog"
import { MyProfilePanel } from "@/components/blocks/my-profile-panel"
import { NavigateToAddress } from "@/components/blocks/navigate-to-address"
import { ServicePickerPanel } from "@/components/blocks/new-appointment-service-picker"
import { NotificationsSettingsPanel } from "@/components/blocks/notifications-settings-panel"
import {
  PackageBranchWarning,
  type PackageDecision,
} from "@/components/blocks/package-branch-warning"
import { AmountInput } from "@/components/blocks/payment-policy/amount-input"
import { PdfViewer } from "@/components/blocks/pdf-viewer-lazy"
import { PeopleGrid } from "@/components/blocks/people-grid"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { PetNotesFields, PetNotesList } from "@/components/blocks/pet-notes-fields"
import { PhoneField } from "@/components/blocks/phone-field"
import { PickupFields } from "@/components/blocks/pickup-fields"
import { ProductBranchStock } from "@/components/blocks/product-branch-stock"
import { PublicBranchPicker } from "@/components/blocks/public-branch-picker"
import { CapacityHeatmap } from "@/components/blocks/reports/charts/capacity-heatmap"
import { DonutChart } from "@/components/blocks/reports/charts/donut-chart"
import { FunnelChart } from "@/components/blocks/reports/charts/funnel-chart"
import { RankedBarChart } from "@/components/blocks/reports/charts/ranked-bar-chart"
import { DashboardReport } from "@/components/blocks/reports/dashboard-report"
import { DetailedTableReport } from "@/components/blocks/reports/detailed-table-report"
import { TableReport } from "@/components/blocks/reports/table-report"
import { SectionCard } from "@/components/blocks/section-card"
import { SectionedSheetShell, type SectionGroup } from "@/components/blocks/sectioned-sheet-shell"
import { CategorySidebar } from "@/components/blocks/service-menu/CategorySidebar"
import { ServiceCardInner } from "@/components/blocks/service-menu/ServiceCard"
import { ServiceLocationsSection } from "@/components/blocks/service-menu/ServiceLocationsSection"
import { SettingsRow } from "@/components/blocks/settings-row"
import { ShareInvoiceDialog, type ShareLinkState } from "@/components/blocks/share-invoice-dialog"
import {
  SignatureDialog,
  SignaturePreview,
  type SignatureResult,
} from "@/components/blocks/sign/signature-dialog"
import { FacebookGlyphIcon, InstagramGlyphIcon, XGlyphIcon } from "@/components/blocks/social-icons"
import { TeamAccessDialog } from "@/components/blocks/team-access-dialog"
import {
  TeamMemberDetailDialog,
  type TeamMemberDetailMember,
} from "@/components/blocks/team-member-detail-dialog"
import { TerminalsPanel } from "@/components/blocks/terminals-panel"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
import { WhatsAppNumbersPanel } from "@/components/blocks/whatsapp-numbers-panel"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RecencyBadge } from "@/components/ui/recency-badge"
import { SearchInput } from "@/components/ui/search-input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type AddressParts, addressToLines, EMPTY_ADDRESS, type PlaceRef } from "@/lib/address"
import { adminBusinesses } from "@/lib/admin-businesses"
import { ALL_HQ_PERMISSIONS, AuthProvider, type PermissionKey } from "@/lib/auth-mock"
import { BOARDING_STAYS, TODAY_ISO as BOARDING_TODAY } from "@/lib/boarding-mock"
import {
  BOOKING_DAYS,
  BOOKING_STAFF,
  bookingDaysForLocation,
  bookingStaffForLocation,
  slotGroupsForLocation,
} from "@/lib/booking"
import { DAYCARE_SESSIONS } from "@/lib/daycare-mock"
import { CamiPayProvider, ZERO_RATE } from "@/lib/hq-camipay/store"
import { type HqTerminalStatus, HqTerminalsProvider } from "@/lib/hq-terminals/store"
import { type ClientPetScenarioId, getClientPetScenario } from "@/lib/imports/client-pet-mock"
import { groupIssues } from "@/lib/imports/issues"
import { applySummaryFor, getScenario, type ImportScenarioId } from "@/lib/imports/mock"
import { placeholderSkuRows, reviewCounts } from "@/lib/imports/outcome"
import type { ProductImportPreviewRow, RowOverride } from "@/lib/imports/types"
import { INVOICE_FIXTURES } from "@/lib/invoice/mock"
import { bookingsInScope } from "@/lib/locations/calendar-scope"
import { formatDayHours, isOpenNow, WEEK_DAYS } from "@/lib/locations/hours"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { buildConsentPdfUrl } from "@/lib/mock-pdf"
import { DEMO_BILLING_DETAILS } from "@/lib/money/billing-details"
import type { TerminalFeeModel } from "@/lib/money/fees"
import { defaultRange, MONEY_TXS, PAYOUTS, periodBounds } from "@/lib/money/mock"
import type { MerchantRails, SettlementBlock } from "@/lib/money/types"
import {
  type AmountValue,
  DEFAULT_PAYMENT_POLICY,
  examplePolicyText,
} from "@/lib/payment-policy/types"
import type { PetNoteEntry } from "@/lib/pet-notes"
import { getPublicBusinessBySlug } from "@/lib/public-business"
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
import { seedCategories, seedServices } from "@/lib/service-catalog/mock-data"
import type { LocationOffering, ServiceDefaults } from "@/lib/service-catalog/offerings"
import {
  type BranchServiceTerms,
  checkPackageAtBranch,
} from "@/lib/service-catalog/package-branch-check"
import { TEAM_MEMBERS } from "@/lib/team/mock"
import { roleById } from "@/lib/team/roles"
import { DEMO_SESSIONS, DEMO_TERMINALS } from "@/lib/terminals/store"
import { cn } from "@/lib/utils"

/** Fixed so the lock-screen expiry label is stable between renders. */
const NOW = new Date("2026-07-20T10:00:00Z").getTime()

type SectionProps = {
  title: string
  description?: string
  /**
   * Defer the demo until it is scrolled near. For the sections whose content is
   * expensive — report views, the PDF viewer, the people grid, the invoice and
   * import frames. The heading and anchor always render.
   */
  lazy?: boolean
  children: React.ReactNode
}

// Section titles double as anchors so a review message can deep-link straight
// to one section instead of asking the reader to scroll and hunt for it.
// "Appointments — pickup & pet notes" → #appointments-pickup-pet-notes
function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * The lanes the sections are grouped into. Read by the index at the top of the
 * page and by <Lane> itself, so the two can't drift.
 *
 * 67 sections in one flat scroll had no legend: a primitive, a ticket demo and
 * an HQ surface sat next to each other, and the only way to reach one was to
 * know it was there. Titles stay the anchors — the lanes are what makes them
 * findable.
 */
const LANES: Array<{ id: string; label: string; sections: string[] }> = [
  {
    id: "primitives",
    label: "Primitives",
    sections: [
      "Button",
      "Badge",
      "Avatar",
      "Input and Textarea",
      "Checkbox, Radio, Switch",
      "Search input",
      "Segmented toggle",
      "Select",
      "Tabs",
      "Card",
      "Separator",
      "Dialog",
      "Sheet, Popover, Dropdown, Tooltip",
    ],
  },
  {
    id: "blocks",
    label: "Building blocks",
    sections: [
      "Empty state",
      "Recency badge",
      "Avatar stack",
      "Linked entity chip",
      "Note callout",
      "Pickable card grid",
      "Timeline row",
      "Section card",
      "KPI card and grid",
      "Settings row",
      "Sectioned sheet shell",
      "Address search field",
      "Add a signature dialog",
      "PDF viewer",
    ],
  },
  {
    id: "detail-views",
    label: "Detail views & takeovers",
    sections: [
      "Client detail dialog",
      "Pet detail dialog",
      "Team member detail dialog",
      "Boarding & daycare booking drawers",
      "My profile (settings panel)",
      "Add / Edit takeovers",
      "Global search takeover",
    ],
  },
  {
    id: "business",
    label: "Business app features",
    sections: [
      "Multi-location — branch switcher",
      "Multi-location — branch lifecycle",
      "Multi-location — per-branch hours",
      "Multi-location — per-branch availability",
      "Multi-location — branch roster",
      "Multi-location — per-branch stock",
      "Multi-location — nine branches (D5)",
      "Multi-location — chain setup",
      "Multi-location — branch access grants",
      "Multi-location — per-branch service pricing",
      "Multi-location — public branch picker",
      "Multi-location — branch WhatsApp numbers",
      "Multi-location — money by branch",
      "Multi-location — cross-branch move",
      "Multi-location — all-branches calendar",
      "Multi-location — package mismatch at checkout",
      "Appointments — booking block",
      "Appointments — toolbar and people grid",
      "Appointments — pickup & pet notes",
      "Client notes (Staff Alert)",
      "Pet notes — structured categories",
      "Navigate to address",
      "Service menu — cards & sidebar",
      "Combos across surfaces",
      "New sale — Gift cards in checkout",
      "New sale — Payment link (self checkout)",
      "New sale — POS Terminal (card present)",
      "Payment policy — deposit & no-show config",
      "Terminals (DSG-62)",
      "Notifications settings",
      "Communication templates",
      "Merchant money surfaces — account summary (DSG-77)",
      "Merchant money surfaces — activity and detail (DSG-78)",
      "Merchant money surfaces — bank account (DSG-75)",
      "Merchant money surfaces — invoices and fees (DSG-76)",
      "Merchant money surfaces — billing details (DSG-74)",
      "CamiPay fee breakdown — Partner side",
      "Invoice document — A4 downloadable",
      "Invoice document — share & email actions",
      "Product import — review states (DSG-80)",
      "Clients and pets import — review states (DSG-84)",
      "Performance dashboard — chart primitives",
      "Reporting module (DSG-43 / PRO-703)",
    ],
  },
  {
    id: "hq",
    label: "Cami HQ",
    sections: [
      "Cami HQ — CamiPay settlement config",
      "Cami HQ — terminal fleet, Partner card",
      "Terminal status — one vocabulary, two surfaces",
      "Partner code — CM-####",
      "Notifications, Cami HQ control plane",
      "Impersonation banner",
    ],
  },
]

function Lane({
  id,
  label,
  blurb,
  children,
}: {
  id: string
  label: string
  blurb: string
  children: React.ReactNode
}) {
  return (
    <div id={`lane-${id}`} className="scroll-mt-6">
      <div className="flex flex-col gap-1 border-b-2 border-foreground/15 pt-10 pb-2">
        <h2 className="font-heading text-xl font-semibold text-foreground">{label}</h2>
        <p className="text-xs text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </div>
  )
}

/**
 * Mounts its children only once they are near the viewport.
 *
 * The page rendered every section eagerly — five full report views, the PDF
 * viewer, sixteen invoice previews, two import frames — which is why one URL
 * shipped 2.7 MB of HTML and took over a second to render. The heavy sections
 * keep their heading and anchor (so a deep link still lands and scrolls); only
 * the demo inside waits until it is scrolled to.
 */
function LazyMount({ minHeight, children }: { minHeight: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return
    // No IntersectionObserver (older browser, jsdom) → render immediately
    // rather than leaving the section permanently empty.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown(true)
      },
      { rootMargin: "600px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div ref={ref} style={shown ? undefined : { minHeight }}>
      {shown ? children : null}
    </div>
  )
}

function Section({ title, description, lazy, children }: SectionProps) {
  const slug = sectionSlug(title)
  return (
    <section
      id={slug}
      className="scroll-mt-20 border-t border-border py-10 first:border-t-0 first:pt-0"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-base font-medium text-foreground">
          <a href={`#${slug}`} className="hover:underline">
            {title}
          </a>
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {lazy ? <LazyMount minHeight={420}>{children}</LazyMount> : children}
    </section>
  )
}

function Row({
  label,
  align = "center",
  children,
}: {
  label: string
  /** `start` for tall demo frames, where a centred label floats halfway down. */
  align?: "center" | "start"
  children: React.ReactNode
}) {
  const top = align === "start"
  return (
    <div
      className={cn("grid grid-cols-[140px_1fr] gap-6 py-3", top ? "items-start" : "items-center")}
    >
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wide text-muted-foreground",
          top && "pt-0.5",
        )}
      >
        {label}
      </span>
      <div className={cn("flex flex-wrap gap-4", top ? "items-start" : "items-center gap-3")}>
        {children}
      </div>
    </div>
  )
}

// ─── Pickup & pet notes demos ─────────────────────────────────────────────────

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
          Now AED {defaults.price} · {defaults.duration} min
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

function TeamAccessDemo() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const shown = members.filter((m) => ["m_owner", "m_aziz", "m_ahmed"].includes(m.id))
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
  const { locations } = useLocations()
  const now = new Date("2026-09-08T14:00:00+04:00")
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {locations.map((loc) => (
        <div key={loc.id} className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-5 text-foreground">{loc.name}</span>
            <span className="text-xs text-muted-foreground">
              {loc.timezone} ·{" "}
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

const COMBO_CART_LINES = comboCartLines(
  SERVICES.find((svc) => svc.id === "nails-and-style-combo") ?? SERVICES[0],
  SERVICES,
  (prefix) => `${prefix}-pg-${++comboUidSeq}`,
)

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

const PICKABLE_TYPES = [
  { id: "grooming", label: "Pet grooming", Icon: ScissorsIcon },
  { id: "boarding", label: "Boarding", Icon: HomeIcon },
  { id: "daycare", label: "Daycare", Icon: SunIcon },
  { id: "veterinary", label: "Veterinary", Icon: StethoscopeIcon },
  { id: "sitting", label: "Pet sitting", Icon: BedIcon },
  { id: "wellness", label: "Wellness & spa", Icon: SparklesIcon },
]

const TEAM_DEMO_MEMBERS: Record<"active" | "pending", TeamMemberDetailMember> = {
  active: {
    id: "pg-tm-active",
    name: "Sara Park",
    title: "Groomer",
    email: "sara@getcami.io",
    phone: "+971 54 402 0718",
    permission: "Medium",
    status: "active",
  },
  pending: {
    id: "pg-tm-pending",
    name: null,
    email: "ahmed@getcami.io",
    permission: "Low",
    status: "pending",
  },
}

export function PlaygroundShowcase() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(true)
  const [phoneCode, setPhoneCode] = useState("+971")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState("option-2")
  const [pickedTypes, setPickedTypes] = useState<Set<string>>(
    () => new Set(["grooming", "wellness"]),
  )
  const [segmentedNeutral, setSegmentedNeutral] = useState<"web" | "ios">("web")
  const [segmentedPrimary, setSegmentedPrimary] = useState<"on" | "off">("on")
  const [shellMode, setShellMode] = useState<"add" | "detail">("detail")
  const [shellSection, setShellSection] = useState<string>("overview")
  const [detailOpen, setDetailOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [detailHasPets, setDetailHasPets] = useState(true)
  const [boardingDrawerOpen, setBoardingDrawerOpen] = useState(false)
  const [boardingCreateOpen, setBoardingCreateOpen] = useState(false)
  const [daycareDrawerOpen, setDaycareDrawerOpen] = useState(false)
  const [petDetailOpen, setPetDetailOpen] = useState(false)
  const [clientEditOpen, setClientEditOpen] = useState(false)
  const [petEditOpen, setPetEditOpen] = useState(false)
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null)
  const [teamDetailOpen, setTeamDetailOpen] = useState(false)
  const [teamAddOpen, setTeamAddOpen] = useState(false)
  const [teamDetailStatus, setTeamDetailStatus] = useState<"active" | "pending">("active")

  // A demo consent PDF built client-side for the <PdfViewer> showcase.
  const [demoPdfUrl, setDemoPdfUrl] = useState<string | null>(null)
  useEffect(() => {
    let built: string | null = null
    buildConsentPdfUrl("Grooming consent form", [
      "I confirm that the information I have provided about my pet is accurate and complete.",
      "I consent to my pet being handled, bathed and groomed by the team, and understand that a muzzle or other safe restraint may be used if my pet becomes anxious.",
      "I release the staff and the business from liability for any accidental injury or stress to my pet that may occur despite reasonable and professional care.",
    ]).then((url) => {
      built = url
      setDemoPdfUrl(url)
    })
    return () => {
      if (built) URL.revokeObjectURL(built)
    }
  }, [])

  const togglePick = (id: string) => {
    setPickedTypes((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const reportPaymentsSummary = getReport("payments-summary")
  const reportFinanceSummary = getReport("finance-summary")
  const reportPerformanceDashboard = getReport("performance-dashboard")
  const reportPerformanceSummary = getReport("performance-summary")
  const reportPerformanceOverTime = getReport("performance-over-time")

  return (
    <TooltipProvider delayDuration={100}>
      {/* Index. Deep links were already possible — the anchors have been there
          since the sections were added — but nothing listed them, so finding a
          section meant scrolling 67 of them. */}
      <nav aria-label="Sections" className="flex flex-col gap-5">
        {LANES.map((lane) => (
          <div key={lane.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <a
                href={`#lane-${lane.id}`}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {lane.label}
              </a>
              <span className="text-xs tabular-nums text-muted-foreground">
                {lane.sections.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {lane.sections.map((title) => (
                <a
                  key={title}
                  href={`#${sectionSlug(title)}`}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <Lane
        id="primitives"
        label="Primitives"
        blurb="The installed ui/ components in every state. Hover, focus and keyboard are live."
      >
        <Section
          title="Button"
          description="Variants, sizes, with icon, and disabled. Hover and focus are live."
        >
          <Row label="Variant">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </Row>
          <Row label="Size">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
            <Button size="icon-xl" aria-label="Add">
              <PlusIcon />
            </Button>
          </Row>
          <Row label="Radius">
            <Button>Default (rounded-xl)</Button>
            <Button radius="full">Full (rounded-full)</Button>
            <Button variant="outline" size="icon-lg" radius="full" aria-label="Add">
              <PlusIcon />
            </Button>
          </Row>
          <Row label="With icon">
            <Button>
              <MailIcon /> Email
            </Button>
            <Button variant="outline">
              Options <ChevronDownIcon />
            </Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Default</Button>
            <Button variant="outline" disabled>
              Outline
            </Button>
            <Button variant="destructive" disabled>
              Destructive
            </Button>
          </Row>
        </Section>
        <Section title="Badge" description="Compact inline labels for status, counts, and tags.">
          <Row label="Variant">
            <Badge>New</Badge>
            <Badge variant="secondary">3</Badge>
            <Badge variant="outline">Beta</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="primary-soft">Active</Badge>
            <Badge variant="muted">Off</Badge>
            {/* The two tone-on-tone status variants. `success` was added for
              DSG-75's "Verified": before it, anything confirmed-good fell back
              to the flat grey `secondary`, which reads as switched off — and
              the green was being hand-rolled at the call site instead. */}
            <Badge variant="warning">Needs attention</Badge>
            <Badge variant="success">Verified</Badge>
          </Row>
          <Row label="Money surfaces">
            {/* One mark for one fact (DSG-73, G3): the RAIL always rides in a
              chip, the custodian is always named in words beside it. */}
            <RailBadge rail="online" />
            <RailBadge rail="terminal" />
          </Row>
          <Row label="Size">
            <Badge size="sm">Small</Badge>
            <Badge size="default">Default</Badge>
            <Badge size="default" variant="primary-soft">
              Default · soft
            </Badge>
          </Row>
        </Section>
        <Section
          title="Avatar"
          description="Person, pet, and business avatars. Photo wins when present; otherwise renders a deterministic fallback (initials, character face, or species icon) on a hashed pastel background."
        >
          <Row label="Size">
            <Avatar size="xs" name="Sarah Johnson" />
            <Avatar size="sm" name="Sarah Johnson" />
            <Avatar size="md" name="Sarah Johnson" />
            <Avatar size="lg" name="Sarah Johnson" />
            <Avatar size="xl" name="Sarah Johnson" />
          </Row>
          <Row label="Initials · hash">
            <Avatar name="Sarah Johnson" />
            <Avatar name="Luke Williams" />
            <Avatar name="Amy Chen" />
            <Avatar name="Maeve Madden" />
            <Avatar name="Violetta Pérez" />
            <Avatar name="Kiren Matharu" />
          </Row>
          <Row label="Character · all faces">
            <Avatar fallback="character" hashSeed="0" />
            <Avatar fallback="character" hashSeed="1" />
            <Avatar fallback="character" hashSeed="2" />
            <Avatar fallback="character" hashSeed="3" />
            <Avatar fallback="character" hashSeed="4" />
            <Avatar fallback="character" hashSeed="5" />
          </Row>
          <Row label="Character · directory">
            <Avatar fallback="character" name="Sarah Johnson" />
            <Avatar fallback="character" name="Luke Williams" />
            <Avatar fallback="character" name="Amy Chen" />
            <Avatar fallback="character" name="Maeve Madden" />
            <Avatar fallback="character" name="Violetta Pérez" />
            <Avatar fallback="character" name="Kiren Matharu" />
          </Row>
          <Row label="Species · pets">
            <Avatar fallback="species" species="dog" hashSeed="bobo" />
            <Avatar fallback="species" species="cat" hashSeed="mochi" />
            <Avatar fallback="species" species="bird" hashSeed="kiwi" />
            <Avatar fallback="species" species="rabbit" hashSeed="pip" />
            <Avatar fallback="species" species="other" hashSeed="nemo" />
          </Row>
          <Row label="Shape · business">
            <Avatar shape="square" name="Sota Salon" />
            <Avatar shape="square" size="lg" name="Sota Salon" />
            <Avatar shape="square" size="xl" name="Sota Salon" />
          </Row>
          <Row label="Photo">
            <Avatar
              size="lg"
              name="Aaliyah Hazari"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces"
              alt="Aaliyah Hazari"
            />
            <Avatar
              size="lg"
              shape="square"
              name="Sota Salon"
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=128&h=128&fit=crop"
              alt="Sota Salon"
            />
          </Row>
          <Row label="With overlay">
            <Avatar size="xl" fallback="character" name="Millie Cassidy">
              <button
                type="button"
                aria-label="Edit avatar"
                className="absolute right-0 bottom-0 inline-flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
              >
                <PencilIcon className="size-3" />
              </button>
            </Avatar>
          </Row>
        </Section>
        <Section title="Input and Textarea" description="Text inputs with label and error state.">
          <Row label="Default">
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="pg-email">Email</Label>
              <Input id="pg-email" type="email" placeholder="name@example.com" />
            </div>
          </Row>
          <Row label="Disabled">
            <div className="group grid w-full max-w-sm gap-2" data-disabled="true">
              <Label htmlFor="pg-email-disabled">Email</Label>
              <Input id="pg-email-disabled" type="email" placeholder="name@example.com" disabled />
            </div>
          </Row>
          <Row label="Error">
            <div className="group grid w-full max-w-sm gap-2" data-error="true">
              <Label htmlFor="pg-email-error">Email</Label>
              <Input id="pg-email-error" type="email" defaultValue="nope" aria-invalid />
              <p className="text-xs text-destructive">Enter a valid email.</p>
            </div>
          </Row>
          <Row label="Textarea">
            <Textarea className="w-full max-w-sm" placeholder="Notes" />
          </Row>
          <Row label="Phone field">
            <div className="w-full max-w-sm">
              <PhoneField
                id="pg-phone"
                label="Mobile number"
                code={phoneCode}
                number={phoneNumber}
                onCodeChange={setPhoneCode}
                onNumberChange={setPhoneNumber}
              />
            </div>
          </Row>
          <Row label="Phone · verified">
            <div className="flex w-full max-w-sm flex-col gap-1.5">
              <PhoneField
                id="pg-phone-locked"
                label="Mobile number"
                code="+971"
                number="50 123 4567"
                onCodeChange={() => undefined}
                onNumberChange={() => undefined}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Verified. We send your confirmation and reminders here on Email / SMS / WhatsApp.
              </p>
            </div>
          </Row>
        </Section>
        <Section title="Checkbox, Radio, Switch" description="Selection controls.">
          <Row label="Checkbox">
            <div className="flex items-center gap-2">
              <Checkbox id="pg-cb-1" checked={checked} onCheckedChange={(v) => setChecked(v)} />
              <Label htmlFor="pg-cb-1">Interactive</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pg-cb-2" defaultChecked disabled />
              <Label htmlFor="pg-cb-2">Checked, disabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pg-cb-3" disabled />
              <Label htmlFor="pg-cb-3">Unchecked, disabled</Label>
            </div>
          </Row>
          <Row label="Checkbox · lg">
            <div className="flex items-center gap-3">
              <Checkbox id="pg-cb-lg-1" size="lg" defaultChecked />
              <Label htmlFor="pg-cb-lg-1" className="text-base font-medium">
                Can view billing data
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="pg-cb-lg-2" size="lg" />
              <Label htmlFor="pg-cb-lg-2" className="text-base font-medium">
                Can issue refunds
              </Label>
            </div>
          </Row>
          <Row label="Radio">
            <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-4">
              {["option-1", "option-2", "option-3"].map((id) => (
                <div key={id} className="flex items-center gap-2">
                  <RadioGroupItem id={id} value={id} />
                  <Label htmlFor={id}>{id.replace("-", " ")}</Label>
                </div>
              ))}
            </RadioGroup>
          </Row>
          <Row label="Switch">
            <div className="flex items-center gap-2">
              <Switch id="pg-sw-1" checked={switchOn} onCheckedChange={setSwitchOn} />
              <Label htmlFor="pg-sw-1">Notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="pg-sw-2" defaultChecked disabled />
              <Label htmlFor="pg-sw-2">On, disabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="pg-sw-3" disabled />
              <Label htmlFor="pg-sw-3">Off, disabled</Label>
            </div>
          </Row>
        </Section>
        <Section
          title="Search input"
          description="Search field with clearable value. Three sizes for different surfaces."
        >
          <Row label="Default">
            <SearchInput placeholder="Search…" aria-label="Search" />
          </Row>
          <Row label="Large">
            <div className="w-full max-w-md">
              <SearchInput size="lg" placeholder="Search settings…" aria-label="Search settings" />
            </div>
          </Row>
          <Row label="Hero (xl)">
            <div className="w-full max-w-2xl">
              <SearchInput
                size="xl"
                placeholder="Search permissions"
                aria-label="Search permissions"
              />
            </div>
          </Row>
        </Section>
        <Section
          title="Segmented toggle"
          description="Pill toggle with sliding active capsule. Neutral default + primary tone (cami-violet pill on dark track) for switch-style on/off."
        >
          <Row label="Neutral">
            <SegmentedToggle
              value={segmentedNeutral}
              onValueChange={setSegmentedNeutral}
              options={[
                { value: "ios", label: "iOS" },
                { value: "web", label: "Web" },
              ]}
              ariaLabel="Platform"
            />
          </Row>
          <Row label="Primary on/off">
            <SegmentedToggle
              value={segmentedPrimary}
              onValueChange={setSegmentedPrimary}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On", activeTone: "primary" },
              ]}
              ariaLabel="Permission area state"
            />
          </Row>
          <Row label="Disabled">
            <SegmentedToggle
              value="off"
              onValueChange={() => {}}
              disabled
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On", activeTone: "primary" },
              ]}
              ariaLabel="Disabled toggle"
            />
          </Row>
        </Section>
        <Section title="Select" description="Single-select dropdown.">
          <Row label="Default">
            <Select defaultValue="weekly">
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Disabled">
            <Select disabled>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>
        <Section title="Tabs" description="Segmented content switcher with four variants.">
          <div className="flex flex-col gap-6">
            <Row label="default">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
                  Filled segmented control. Use for top-level page tabs.
                </TabsContent>
              </Tabs>
            </Row>
            <Row label="ghost">
              <Tabs defaultValue="all" className="w-full">
                <TabsList variant="ghost">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="pt-4 text-sm text-muted-foreground">
                  Pill-shaped, transparent. Use for table toolbars (filter tabs).
                </TabsContent>
              </Tabs>
            </Row>
            <Row label="line">
              <Tabs defaultValue="general" className="w-full">
                <TabsList variant="line">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="pt-4 text-sm text-muted-foreground">
                  Underline floats 5px below the tab. Use when tabs sit above whitespace.
                </TabsContent>
              </Tabs>
            </Row>
            <Row label="underline">
              <Tabs defaultValue="general" className="w-full">
                <TabsList variant="underline">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="manage">Manage</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="pt-4 text-sm text-muted-foreground">
                  Underline sits at the tab's baseline. Use when the tab row marks a surface seam,
                  e.g. between a tinted header zone and a white content zone in a detail dialog.
                </TabsContent>
              </Tabs>
            </Row>
          </div>
        </Section>
        <Section title="Card">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Weekly summary</CardTitle>
              <CardDescription>Your activity for the past seven days.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              42 events, 12 contacts added, 3 pending follow-ups.
            </CardContent>
          </Card>
        </Section>
        <Section title="Separator">
          <div className="max-w-md">
            <p className="text-sm text-foreground">Above</p>
            <Separator className="my-4" />
            <p className="text-sm text-foreground">Below</p>
          </div>
        </Section>
        <Section
          title="Dialog"
          description="Centered modal. Per cami terminology, Detail surfaces use this; Add / Edit use the full-screen takeover instead."
        >
          <Row label="Basic">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    This will do the thing you asked. You can undo within ten seconds.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Row>
          <Row label="Destructive confirm">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Delete client</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this client?</DialogTitle>
                  <DialogDescription>
                    Millie Cassidy and her 2 pets will be removed. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Row>
          <Row label="With form body">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Add note</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a note</DialogTitle>
                  <DialogDescription>
                    Private to your business. Visible to all staff.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dialog-note-title">Title</Label>
                    <Input id="dialog-note-title" placeholder="e.g. Prefers morning slots" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dialog-note-body">Note</Label>
                    <Textarea id="dialog-note-body" placeholder="Add details…" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button>Save note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Row>
          <Row label="Title only">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Minimal dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Heads up</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Got it</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Row>
        </Section>
        <Section title="Sheet, Popover, Dropdown, Tooltip">
          <Row label="Sheet">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Quick settings</SheetTitle>
                  <SheetDescription>Slide-in panel for secondary navigation.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </Row>
          <Row label="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SettingsIcon /> Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm">
                Quick settings panel content.
              </PopoverContent>
            </Popover>
          </Row>
          <Row label="Dropdown">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <CheckIcon /> Mark done
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellIcon /> Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>
          <Row label="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Info">
                  <BellIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </Row>
          <Row label="Toast">
            <Button
              variant="outline"
              onClick={() => toast("Event created", { description: "Sunday at 2pm" })}
            >
              Fire toast
            </Button>
          </Row>
        </Section>
      </Lane>
      <Lane
        id="blocks"
        label="Building blocks"
        blurb="Presentational blocks assembled from the primitives, shared across screens."
      >
        <Section
          title="Empty state"
          description="Centered placeholder for sections with no data. variant='plain' (default) is the borderless, muted in-section treatment. variant='card' wraps the same light line-icon and muted title in a dashed self-framed card — the full-page listing look used by the sales / clients / pets / products / appointments tables when a search or filter returns nothing."
        >
          <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card">
              <EmptyState
                icon={FolderIcon}
                title="Create a new folder to get started organizing."
              />
            </div>
            <div className="rounded-2xl border border-border/60 bg-card">
              <EmptyState
                icon={CalendarIcon}
                title="No appointments yet."
                description="Bookings will appear here once they're created."
                action={
                  <Button variant="secondary" size="sm" radius="full">
                    <PlusIcon />
                    Book appointment
                  </Button>
                }
              />
            </div>
          </div>
        </Section>
        <Section
          title="Recency badge"
          description="Recency indicator next to client / pet names. Common labels: 'New' (≤14d since first visit), relative time like '4 weeks' (between), '90+ days' (>90d since last visit)."
        >
          <Row label="Labels">
            <RecencyBadge>New</RecencyBadge>
            <RecencyBadge>4 weeks</RecencyBadge>
            <RecencyBadge>90+ days</RecencyBadge>
          </Row>
          <Row label="Inline with name">
            <div className="flex items-center gap-2">
              <span className="font-medium">Sarah Johnson</span>
              <RecencyBadge>New</RecencyBadge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Luke Williams</span>
              <RecencyBadge>4 weeks</RecencyBadge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Aamena Fatta</span>
              <RecencyBadge>90+ days</RecencyBadge>
            </div>
          </Row>
        </Section>
        <Section
          title="Avatar stack"
          description="Stacked avatars with overlap + an overflow indicator. Hover any avatar to see the name; the +N chip lists the rest. Used for family / staff / contributor lists where vertical space is tight."
        >
          <Row label="Few (2)">
            <AvatarStack
              items={[
                { id: "millie", name: "Millie Cassidy", fallback: "character", hashSeed: "millie" },
                { id: "tom", name: "Tom Cassidy", fallback: "character", hashSeed: "tom" },
              ]}
            />
          </Row>
          <Row label="At max (3)">
            <AvatarStack
              items={[
                { id: "millie", name: "Millie Cassidy", fallback: "character", hashSeed: "millie" },
                { id: "tom", name: "Tom Cassidy", fallback: "character", hashSeed: "tom" },
                { id: "sarah", name: "Sarah Johnson", fallback: "character", hashSeed: "sarah" },
              ]}
            />
          </Row>
          <Row label="Overflow (12)">
            <AvatarStack
              items={Array.from({ length: 12 }, (_, i) => ({
                id: `person-${i}`,
                name:
                  [
                    "Brent J",
                    "Sarah I",
                    "Tara T",
                    "Luke W",
                    "Amy C",
                    "Maeve M",
                    "Violetta P",
                    "Kiren M",
                    "Aaesha A",
                    "Aaishah V",
                    "Aaliyah H",
                    "Aaliyah P",
                  ][i] ?? `Person ${i}`,
                fallback: "character",
                hashSeed: `person-${i}`,
              }))}
            />
          </Row>
          <Row label="Sizes">
            <AvatarStack
              size="xs"
              items={[
                { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
                { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
                { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
                { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
                { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
              ]}
            />
            <AvatarStack
              size="sm"
              items={[
                { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
                { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
                { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
                { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
                { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
              ]}
            />
            <AvatarStack
              size="md"
              items={[
                { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
                { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
                { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
                { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
                { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
              ]}
            />
          </Row>
        </Section>
        <Section
          title="Linked entity chip"
          description="Small avatar + name pill, clickable. Used for Owners list on Pet detail and similar navigation chips."
        >
          <Row label="Person">
            <LinkedEntityChip
              name="Millie Cassidy"
              avatar={{ fallback: "character", hashSeed: "millie" }}
            />
            <LinkedEntityChip
              name="Tom Cassidy"
              avatar={{ fallback: "character", hashSeed: "tom" }}
            />
            <LinkedEntityChip
              name="Sarah Johnson"
              avatar={{ fallback: "character", hashSeed: "sarah" }}
            />
          </Row>
          <Row label="Pet">
            <LinkedEntityChip
              name="Bobo"
              avatar={{ fallback: "species", species: "dog", hashSeed: "bobo" }}
            />
            <LinkedEntityChip
              name="Mochi"
              avatar={{ fallback: "species", species: "cat", hashSeed: "mochi" }}
            />
          </Row>
        </Section>
        <Section
          title="Note callout"
          description="Notion-style note pill. Lightbulb on a soft sand background. Used inside edit dialogs to flag side-effects ('Once saved...')."
        >
          <Row label="Default">
            <div className="flex w-full max-w-xl items-start gap-3 rounded-2xl bg-sand-3 px-4 py-3">
              <LightbulbIcon className="mt-0.5 size-4 shrink-0 fill-sand-9 text-sand-11" />
              <p className="text-sm leading-5 text-foreground">
                Once saved, changes will automatically apply to all products and services which are
                already assigned to default taxes
              </p>
            </div>
          </Row>
        </Section>
        <Section
          title="Pickable card grid"
          description="Multi-select cards with icon, label, and a check indicator. Used for picking business types in the Edit business type dialog."
        >
          <Row label="Default">
            <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {PICKABLE_TYPES.map(({ id, label, Icon }) => {
                const isSelected = pickedTypes.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePick(id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative flex flex-col items-start gap-3 rounded-xl border bg-background p-4 text-left transition-colors",
                      isSelected
                        ? "border-transparent bg-cami-violet-3 outline-2 outline-cami-violet-8 -outline-offset-2"
                        : "border-border/60 hover:bg-muted/30",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full",
                        isSelected
                          ? "bg-cami-violet-8 text-white"
                          : "border border-border text-transparent",
                      )}
                    >
                      <CheckIcon className="size-3" />
                    </span>
                    <Icon className="size-6 text-foreground" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </button>
                )
              })}
            </div>
          </Row>
        </Section>
        <Section
          title="Timeline row"
          description="Vertical timeline used by Appointments / Visit history. Date / leading slot on the left, thin connector with a small dot, card on the right. Layout inspired by Luma's event list."
        >
          <div className="max-w-lg">
            <ul className="flex flex-col">
              <TimelineRow leading={<TimelineDate dayMonth="May 22" weekday="Friday" />}>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                    <span className="font-semibold text-foreground">10:00am</span>
                    <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                  </div>
                </div>
              </TimelineRow>
              <TimelineRow leading={<TimelineDate dayMonth="Apr 8" weekday="Wednesday" />}>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                    <span className="font-semibold text-foreground">2:30pm</span>
                    <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                  </div>
                </div>
              </TimelineRow>
              <TimelineRow isLast leading={<TimelineDate dayMonth="Mar 4" weekday="Monday" />}>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                    <span className="font-semibold text-foreground">11:00am</span>
                    <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                  </div>
                </div>
              </TimelineRow>
            </ul>
          </div>

          {/* Leading-less variant: no date gutter (grouped under a month header
            instead), used by the gift-card activity timeline. A lone row still
            shows the connector so it reads as a timeline. */}
          <div className="max-w-lg">
            <p className="mb-2 text-sm text-muted-foreground">May</p>
            <ul className="flex flex-col">
              <TimelineRow isLast>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <span className="font-semibold text-foreground">Gift card purchased</span>
                  <p className="text-xs text-muted-foreground">Yesterday at 3:33pm by Husain NGI</p>
                </div>
              </TimelineRow>
            </ul>
          </div>
        </Section>
        <Section
          title="Section card"
          description="Section panel used inside detail surfaces. Title + optional right-aligned action + body."
        >
          <div className="flex max-w-md flex-col gap-3">
            <SectionCard
              title="Profile"
              action={
                <Button variant="secondary" size="sm" radius="full">
                  Edit
                </Button>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase text-muted-foreground">Full name</span>
                  <span>Millie Cassidy</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase text-muted-foreground">Phone</span>
                  <span>+971 58 509 9313</span>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              title="Notes"
              action={
                <Button variant="secondary" size="sm" radius="full">
                  <PlusIcon />
                  Add note
                </Button>
              }
            >
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            </SectionCard>
          </div>
        </Section>
        <Section
          title="KPI card and grid"
          description="Static metric tiles for Overview-style headers. KpiGrid is 2-col by default; override className to change."
        >
          <div className="max-w-md">
            <KpiGrid>
              <KpiCard
                label="Upcoming"
                value="0"
                info="Count of bookings in the future for this client."
              />
              <KpiCard
                label="Total appts"
                value="4"
                info="Lifetime appointment count, including no-shows and cancellations."
              />
              <KpiCard
                label="Total sales"
                value="AED 0"
                info="Lifetime revenue from this client."
              />
              <KpiCard label="No-shows" value="0" info="Lifetime count of no-shows." />
            </KpiGrid>
          </div>
        </Section>
        <Section
          title="Settings row"
          description="Icon + label/value stack used inside settings summary cards. When the value is null the row collapses into a subtle 'Add {label}' pill."
        >
          <Row label="Filled">
            <div className="flex w-full max-w-md flex-col gap-5">
              <SettingsRow icon={Building2Icon} label="Business name" value="Shampooch JVC" />
              <SettingsRow icon={FlagIcon} label="Country" value="United Arab Emirates" />
              <SettingsRow icon={BanknoteIcon} label="Currency" value="AED" />
              <SettingsRow
                icon={PercentIcon}
                label="Tax calculation"
                value="Retail prices include tax"
              />
            </div>
          </Row>
          <Row label="Empty (Add)">
            <div className="flex w-full max-w-md flex-col gap-5">
              <SettingsRow
                icon={FacebookGlyphIcon}
                label="Facebook"
                value={null}
                onAdd={() => toast("Open editor focused on Facebook")}
              />
              <SettingsRow
                icon={XGlyphIcon}
                label="X (Twitter)"
                value={null}
                onAdd={() => toast("Open editor focused on X")}
              />
              <SettingsRow
                icon={InstagramGlyphIcon}
                label="Instagram"
                value={null}
                onAdd={() => toast("Open editor focused on Instagram")}
              />
              <SettingsRow icon={GlobeIcon} label="Website" value="www.shampooch.ae" />
            </div>
          </Row>
        </Section>
        <Section
          title="Sectioned sheet shell"
          description="Two-column layout for sectioned add/edit takeovers (FullScreenEditDialog). Vertical sidenav left, scrollable content right. Optional leading slot above the nav for cases where you want identity context (e.g. Edit). Detail surfaces use a different pattern — see the next section."
        >
          <Row label="Leading slot">
            <SegmentedToggle
              value={shellMode}
              onValueChange={(v) => {
                const next = v as "add" | "detail"
                setShellMode(next)
                setShellSection(next === "add" ? "profile" : "profile")
              }}
              options={[
                { value: "add", label: "None (Add)" },
                { value: "detail", label: "Identity (Edit)" },
              ]}
              ariaLabel="Leading slot variant"
            />
          </Row>
          <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <SectionedSheetShell
              groups={
                [
                  {
                    label: "Personal",
                    items: [
                      { id: "profile", label: "Profile", icon: CircleUserIcon },
                      { id: "addresses", label: "Addresses", icon: MapPinIcon },
                      { id: "emergency", label: "Emergency contacts", icon: PhoneIcon },
                    ],
                  },
                  {
                    label: "Settings",
                    items: [{ id: "settings", label: "Notifications", icon: SettingsIcon }],
                  },
                ] satisfies SectionGroup[]
              }
              activeId={shellSection}
              onActiveChange={setShellSection}
              leading={
                shellMode === "detail" ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-background p-5 text-center">
                    <Avatar size="xl" fallback="character" name="Millie Cassidy" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-semibold">Millie Cassidy</span>
                      <span className="text-sm text-muted-foreground">+971 58 509 9313</span>
                    </div>
                    <div className="flex w-full gap-2">
                      <Button variant="outline" size="sm" radius="full" className="flex-1">
                        Actions
                      </Button>
                      <Button size="sm" radius="full" className="flex-1">
                        Book now
                      </Button>
                    </div>
                  </div>
                ) : null
              }
            >
              <div className="flex min-h-[260px] flex-col gap-3 rounded-2xl border border-border/60 bg-background p-6">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Section content
                </span>
                <h3 className="font-heading text-2xl font-semibold capitalize">
                  {shellSection.replace(/-/g, " ")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Form fields for this section render here. Save persists; Close discards.
                </p>
              </div>
            </SectionedSheetShell>
          </div>
        </Section>
        <Section
          title="Address search field"
          description="Search first, structured fields second: picking a place fills the grid, and the grid stays editable because a places result is a starting point and the trade licence is what has to match. Manual entry is the first row of the dropdown, not a fallback reached by failing. PRD-144: a picked place stores its placeId and coordinates, and editing the text afterwards drops them — watch the line under the field flip as you type. See docs/specs/address-search-field.md."
        >
          <Row label="Empty — search only">
            <AddressSearchFieldDemo />
          </Row>
          <Row label="Prefilled — fields already open">
            <AddressSearchFieldDemo initial={DEMO_BILLING_DETAILS.address} />
          </Row>
        </Section>
        <Section
          title="Add a signature dialog"
          description="Standalone signature-capture modal: full name + Title, a Type / Draw segmented toggle — Type renders the scripted preview + Signature ID, Draw is a pointer canvas pad with Clear. Sign is disabled until valid. The public signer flow (/sign) now captures the signature inline in its split layout rather than in this modal; kept here for reuse elsewhere."
        >
          <Row label="Open">
            <Button onClick={() => setSignatureOpen(true)}>Add a signature</Button>
          </Row>
          {signatureResult ? (
            <Row label="Captured">
              <SignaturePreview
                businessName="Shampooch"
                fullName={signatureResult.fullName}
                signatureId={signatureResult.signatureId}
                drawingDataUrl={signatureResult.drawingDataUrl}
              />
            </Row>
          ) : null}
          <SignatureDialog
            open={signatureOpen}
            onOpenChange={setSignatureOpen}
            businessName="Shampooch"
            defaultFullName="Michelle You"
            onSign={setSignatureResult}
          />
        </Section>
        <Section
          lazy
          title="PDF viewer"
          description="<PdfViewer> renders PDFs in-app on a canvas (react-pdf / pdf.js) inside our own themed, scrolling container — no native viewer chrome. Pages fit the container width (= 100% zoom); a floating dark toolbar carries zoom (−/+, 50–250%) and page navigation (Prev · Page X/Y · Next, tracked as you scroll). Loaded client-only (dynamic, ssr:false). Used by the public signer flow (/sign), the operator 'View form' split layout, and the Files → Preview action. Here it shows a consent PDF built client-side from copy."
        >
          <Row label="Document">
            <div className="w-full max-w-xl">
              {demoPdfUrl ? (
                <PdfViewer file={demoPdfUrl} />
              ) : (
                <div className="flex h-60 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
                  Preparing document…
                </div>
              )}
            </div>
          </Row>
        </Section>
      </Lane>
      <Lane
        id="detail-views"
        label="Detail views & takeovers"
        blurb="The drawers, dialogs and full-screen takeovers a row opens into."
      >
        <Section
          title="Client detail dialog"
          description="Centered Dialog modeled on <BusinessDetailDialog>. ~630px wide; sticky header with avatar + name + meta + Book now + Actions + Close; horizontal underline tabs with a 'More' overflow dropdown for less-used sections (Documents, Settings). Skeleton — each tab renders a placeholder; real content arrives per section."
        >
          <Row label="Pets">
            <SegmentedToggle
              value={detailHasPets ? "yes" : "no"}
              onValueChange={(v) => setDetailHasPets(v === "yes")}
              options={[
                { value: "yes", label: "With pets" },
                { value: "no", label: "Without pets" },
              ]}
              ariaLabel="Whether the partner manages pets"
            />
          </Row>
          <Row label="Open">
            <Button onClick={() => setDetailOpen(true)}>Open client detail</Button>
          </Row>
          <ClientDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            client={{
              id: "millie-cassidy-1",
              name: "Millie Cassidy",
              phone: "+971 58 509 9313",
              recencyLabel: "First visit",
            }}
            hasPets={detailHasPets}
            isOwner
            onBookNow={() => toast("Book (stubbed)")}
            onMerge={() => toast("Merge profiles (stubbed)")}
            onDelete={() => toast.error("Delete client (stubbed)")}
          />
        </Section>
        <Section
          title="Pet detail dialog"
          description="Same shell as Client detail. Stacks over the client dialog when opened from inside it. Tabs: Overview · Family · Visit history · Pet details · Documents. Multi-owner aware — chip row in the header. Actions menu has Edit pet details + Delete pet."
        >
          <Row label="Open">
            <Button onClick={() => setPetDetailOpen(true)}>Open pet detail</Button>
          </Row>
          <PetDetailDialog
            open={petDetailOpen}
            onOpenChange={setPetDetailOpen}
            pet={{ id: "bobo", name: "Bobo", species: "dog", breed: "French Bulldog" }}
            owners={[
              { id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" },
              { id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" },
            ]}
            isOwner
          />
        </Section>
        <Section
          title="Team member detail dialog"
          description="Same centered Dialog shell as Client / Pet detail. Sticky header (avatar + name + permission access · email · phone + Edit + Actions + Close), underline tabs: Overview (KPIs, Works at, Services, Notes) · Details (Profile, Settings incl. permission role, Addresses, Emergency contacts). Owner rows lock profile/role edits; a pending invite shows an empty Overview. Opened from a row on /settings/team; Add uses the full-screen takeover."
        >
          <Row label="Status">
            <SegmentedToggle
              value={teamDetailStatus}
              onValueChange={(v) => setTeamDetailStatus(v as "active" | "pending")}
              options={[
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending invite" },
              ]}
              ariaLabel="Team member status"
            />
          </Row>
          <Row label="Detail">
            <Button onClick={() => setTeamDetailOpen(true)}>Open team member detail</Button>
          </Row>
          <Row label="Add takeover">
            <Button variant="outline" radius="full" onClick={() => setTeamAddOpen(true)}>
              Open Add team member
            </Button>
          </Row>
          <TeamMemberDetailDialog
            open={teamDetailOpen}
            onOpenChange={setTeamDetailOpen}
            member={TEAM_DEMO_MEMBERS[teamDetailStatus]}
            onEditProfile={() => toast("Edit profile (stubbed)")}
            onEditRoles={() => toast("Edit roles & permissions (stubbed)")}
            onEditServices={() => toast("Edit services (stubbed)")}
            onEditSchedule={() => toast("Edit schedule (stubbed)")}
            onResendInvitation={() => toast("Resend invitation (stubbed)")}
            onRemove={() => toast.error("Remove from business (stubbed)")}
          />
          <AddTeamMemberDialog
            open={teamAddOpen}
            onOpenChange={setTeamAddOpen}
            onAdd={() => toast.success("Team member added (stubbed)")}
            businessName="Shampooch"
          />
        </Section>
        <Section
          lazy
          title="Boarding & daycare booking drawers"
          description="Right-side Sheet detail drawers modeled on <AppointmentDetailSheet>. Boarding is night-based (rate/night, check-in/out, N Nights, Subtotal by nights); daycare is duration-based (plan label 'Full Day · Up to 8 hours', time range, Subtotal by minutes). Both share: collapsible customer card, pet card, editable status pill (Booked → Checked in → Checked out → No-show/Canceled), add-on chips + Add menu (Primary Service/Add-on/Product/Custom Item), Late check out fee toggle, notes, sticky Check Out. The New boarding stay create sheet mirrors the add-appointment shell."
        >
          <Row label="Boarding">
            <div className="flex gap-2">
              <Button onClick={() => setBoardingDrawerOpen(true)}>Open booking detail</Button>
              <Button variant="outline" radius="full" onClick={() => setBoardingCreateOpen(true)}>
                New boarding stay
              </Button>
            </div>
          </Row>
          <Row label="Daycare">
            <Button onClick={() => setDaycareDrawerOpen(true)}>Open booking detail</Button>
          </Row>
          <BoardingDetailSheet
            open={boardingDrawerOpen}
            onOpenChange={setBoardingDrawerOpen}
            stay={BOARDING_STAYS[0]}
          />
          <NewBoardingSheet
            open={boardingCreateOpen}
            onOpenChange={setBoardingCreateOpen}
            date={BOARDING_TODAY}
          />
          <DaycareDetailSheet
            open={daycareDrawerOpen}
            onOpenChange={setDaycareDrawerOpen}
            session={DAYCARE_SESSIONS[3]}
          />
        </Section>
        <Section
          title="My profile (settings panel)"
          description="Personal info panel for the signed-in user (Settings → Account → My profile), scoped exactly to DSG-63 'view and edit contact details': one Contact card (Business-details pattern) with Legal name + masked mobile/email and a single Edit → full-screen takeover. Name saves directly; new mobile number → 6-digit OTP dialog (any 6 digits in the demo, shared OtpInput boxes); new email → 'Check your inbox' dialog (Resend with 30s cooldown / Cancel; the link click itself is simulated by a subtle bottom-right 'Demo: open confirmation link' control in the settings panel). Pending changes show as a neutral 'Pending' badge inline on the affected row that reopens the matching dialog; duplicates of team-member values blocked inline."
        >
          <div className="max-w-2xl rounded-2xl border border-border/60 bg-muted/20 p-6">
            <MyProfilePanel />
          </div>
        </Section>
        <Section
          title="Add / Edit takeovers"
          description="<FullScreenEditDialog> + sectioned sidenav. Quick-create rule: only the first name (client) or name + species (pet) are required. Edit mode pre-populates fields and deep-links to the relevant section."
        >
          <Row label="Add client">
            <Button onClick={() => setClientEditOpen(true)}>Open Add client</Button>
          </Row>
          <Row label="Add pet">
            <Button onClick={() => setPetEditOpen(true)}>Open Add pet</Button>
          </Row>
          <ClientEditSheet open={clientEditOpen} onOpenChange={setClientEditOpen} mode="add" />
          <PetEditSheet open={petEditOpen} onOpenChange={setPetEditOpen} mode="add" />
        </Section>
        <Section
          lazy
          title="Global search takeover"
          description="Full-screen search opened from the topbar magnifier (or Cmd/Ctrl+K). Reuses <FullScreenEditDialog> (same sticky header + pill Close as add/edit takeovers) with an xl <SearchInput>. Searches clients by name, mobile, email, or pet, and bookings by client name or booking reference (try 'B-77342'). Empty query shows Upcoming appointments + Clients (recently added). Clicking a client opens <ClientDetailDialog>; clicking an appointment opens <AppointmentDetailSheet> — both stack over the takeover."
        >
          <Row label="Open">
            <Button onClick={() => setGlobalSearchOpen(true)}>Open global search</Button>
          </Row>
          <GlobalSearchDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
        </Section>
      </Lane>
      <Lane
        id="business"
        label="Business app features"
        blurb="Ticketed work on the operator's surfaces, newest thinking first."
      >
        <Section
          title="Multi-location — branch switcher"
          description="SCR-04. The control every other multi-location surface is read through: which branch am I acting on? Scope spans one branch, a named subset, or all granted branches (R03), and never resets the filters or date range a user already set (DW1.1). Each frame below is its own scope, so the states sit side by side."
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
          description="SCR-01's state half (R01, R12). Four states, and the consequence of each is what the badge is for: paused means the booking page is hidden and the calendar is off, archived means no new writes ever again. Live renders nothing on purpose — badging every healthy branch makes the two that need attention harder to find. The full panel, with the Suspend / Reactivate / Archive actions and the archive confirmation, is at /shell-demo?settings=locations."
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
          description="SCR-01's hours half (R01, R19). Every branch keeps its own week and its own timezone: JVC closes Sunday, Jumeirah trades seven days and later at the weekend, Al Quoz shuts over the middle of the day. That last one is why a day holds shifts rather than one open and one close — pinned to a Tuesday mid-afternoon below, Al Quoz reads Closed now while both others are open, and the public card says 'opens 4pm' rather than naming tomorrow. Editable at /shell-demo?settings=locations → a branch → Hours, and the edit survives a reload and reaches the client page: change JVC's Monday and /shampooch-jvc says so, as does the chain picker's row for it."
        >
          <Row label="The seeded estate" align="start">
            <LocationsProvider persist={false}>
              <BranchHoursDemo />
            </LocationsProvider>
          </Row>
        </Section>
        <Section
          title="Multi-location — per-branch availability"
          description="R15's other half (R04, R15). The offering was per branch; the availability was one hardcoded week and all twelve staff on every branch's page. Now both are derived: the day chips come from the branch's hours, and a day it does not open is Closed rather than Fully booked — those are different facts, and showing one as the other sends a client back to a day that will never have a slot. Slots are the hours at half-hour steps, so Al Quoz's midday gap is simply absent instead of being filtered out, and the last slot is half an hour before closing. Staff are filtered by the branches they work at; someone covering two sites appears at both. Friday below, because that is where all three differ."
        >
          <Row label="The seeded estate" align="start">
            <LocationsProvider persist={false}>
              <BranchAvailabilityDemo />
            </LocationsProvider>
          </Row>
        </Section>
        <Section
          title="Multi-location — branch roster"
          description="SCR-10 (R05, DW2.3, DW2.4). A roster belongs to one branch, and somebody assigned to two appears on both with the hours they work there — not their whole day, because DW2.3's acceptance is that booking offers them at a branch only during their rostered hours there. Lena is JVC mornings and Jumeirah evenings: two branches in one day and no conflict, which is the arrangement the story is written for. Sara is rostered at both over the same hours, which is the one clash DW2.4 names — one person cannot be in two places. Mariam has two overlapping shifts at JVC and is deliberately not flagged: ADR-023 allows overlap inside a branch, and marking it would report the product's own behaviour as an error. Nothing here blocks: whether booking refuses a cross-branch overlap extends ADR-023, which the PRD marks as needing an extension, so the roster states the fact and leaves the rule to the rule."
        >
          <Row label="JVC" align="start">
            <div className="w-full">
              <LocationsProvider persist={false}>
                <BranchRoster locationId="shampooch-jvc" />
              </LocationsProvider>
            </div>
          </Row>
          <Row label="Jumeirah" align="start">
            <div className="w-full">
              <LocationsProvider persist={false}>
                <BranchRoster locationId="shampooch-jumeirah" />
              </LocationsProvider>
            </div>
          </Row>
          <Row label="Nobody assigned" align="start">
            <div className="w-full">
              {/* A branch standing up has no roster yet, which is a sentence
                  rather than an empty grid. */}
              <LocationsProvider persist={false}>
                <BranchRoster locationId="shampooch-al-quoz" />
              </LocationsProvider>
            </div>
          </Row>
        </Section>
        <Section
          title="Multi-location — per-branch stock"
          description="SCR-11 (R16, R18, DW4.1–DW4.2). Stock quantity and reorder configuration resolve per location, and the business quantity is derived from them and never stored — which is what makes 'I never reconcile it by hand' true by construction. Rows first, total after, because a sum is correct and insufficient: 18 at one branch and -2 at another add up to a healthy-looking 16, and the -2 is the only row worth acting on. Empty and negative are kept apart on purpose — zero is a reorder, below zero is a stock take, and one red state for both sends a manager to the wrong action. Thresholds are per branch because a busy branch and a quiet one do not reorder at the same number. Nothing here moves stock between branches: cross-branch transfer and a central warehouse are future backlog, confirmed at the 2026-09-02 workshop."
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
          description="The designs at the scale the PRD assumes. Three branches is the demo; nine is where the layouts fail, and the failure is the same one every time — most rows say nothing and the one that matters is below the fold. Both states are drawn so the decision can be made by looking: collapsed folds the branches that inherit everything into one line that names them, and expanded is the nine cards it replaces. Under four quiet branches nothing collapses, because folding three cards into a line you have to click is a worse screen than three cards. The switcher and the money roll-up are here at nine too. Neither had a height cap, because at three nothing needed one — the switcher’s branch list now scrolls on its own while All locations stays put, since a roll-up you have to scroll back up to reach is the row an owner uses most."
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
          description="SCR-02 (R02, SU1.2). N branches in one pass, because growth must not be a second onboarding — BG-03 makes 'zero operator migration steps' a gate rather than a target. All or none: submit with one bad row and nothing is created, which is the whole point — a partial create leaves the owner unable to tell which of nine landed. Try two rows with the same name to see the link collision, or the existing 'Shampooch JVC' to see a taken slug. Isolated below, so creating here does not touch the app's own estate."
        >
          <Row label="Add locations" align="start">
            <LocationsProvider persist={false}>
              <ChainSetupDemo />
            </LocationsProvider>
          </Row>
        </Section>
        <Section
          title="Multi-location — branch access grants"
          description="SCR-03 (R04, R24). Two independent axes: role capability is what, the location grant is where, and neither widens the other. Open the owner to see an untickable list — an owner holds every branch including ones added later, which is why that grant is stored as 'all' rather than as today's ids. Open Ahmed to see an empty grant said out loud: no access, never 'every branch'. The location permission list marks the four codes that do not exist yet — the product ships one venues:read that bundles viewing a branch with changing it."
        >
          <Row label="Open a member" align="start">
            <LocationsProvider persist={false}>
              <TeamAccessDemo />
            </LocationsProvider>
          </Row>
        </Section>
        <Section
          title="Multi-location — per-branch service pricing"
          description="SCR-09 (R06, DW3.1–DW3.3). One service defined once, configured per branch. Type over a price to override that field; the marker under it says whose value it is, and Reset returns only that field to inheriting. Then press 'Raise the business default' — the inherited branches follow, the overridden field does not. That divergence is the requirement, and it only works because a branch stores what it deliberately differs on rather than a copy of everything."
        >
          <Row label="Locations section" align="start">
            <LocationsProvider persist={false}>
              <ServicePricingDemo />
            </LocationsProvider>
          </Row>
        </Section>
        <Section
          title="Multi-location — public branch picker"
          description="SCR-08 (R15, GB3.1). A chain's public page asks where before it shows anything branch-shaped, because it has N addresses, hours and menus rather than one. The branch's own link skips this entirely (GB3.2) — both paths bind the booking to one branch, and neither guesses. Entry order was left to design: location first, for the reasons in the component's own note. Only published branches are listed; the suspended one is absent rather than greyed out. 'Open now' is pinned to a Tuesday 11am here so the row is deterministic."
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
          description="SCR-14 (R21, R22, KC2.2, KC2.4). WhatsApp is the front door, and per branch it becomes the thing that decides which branch a message belongs to — inbound resolves from the number it arrived on and never falls back. Three states seeded: JVC connected, Jumeirah stuck on the OTP (the step that needs a person standing in that branch), Al Quoz with no number at all, which says so in words because the consequence is no WhatsApp bookings here and nothing rerouted. Note the contrast with SMS: an unapproved sender ID falls back to CAMI on purpose, because a generic sender still reaches the right person — a wrong WhatsApp number reaches the wrong branch."
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
          title="Multi-location — money by branch"
          description="SCR-15 (R09, R18, KH1.1–KH1.3). Side by side, never merged — KH1.1 says a single number destroys the job, because an owner asking how the day went is asking which branch had a bad one. The total sits after the rows and is labelled as their sum. The second frame is the same component for a manager granted only Jumeirah: one row, and a roll-up equal to it — their real number, not an error and not anyone else's (KH1.3). The bound is a grant, not a filter, so the wider result is never fetched (R18, KH1.2)."
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
          description="SCR-06 (R07, R17, GB1.1–GB1.3). The one operation that touches both branches at once, and every way it fails is a way money or access fails. The destination list is bounded by grants, so a branch you cannot reach is never offered. Pick Jumeirah for the allowed case — the money panel says the deposit stays credited where it was taken while the work moves, because R17 records both and rewrites neither. Al Quoz is suspended, so it is refused as a destination (R12). The third frame has an unresolvable payment: the move is rejected whole and nothing changes, rather than losing the money's trail (GB1.3). Decision logic is unit-tested in lib/locations/cross-branch-move.test.ts."
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
          description="SCR-05 (R07, R11). 'Per-branch columns or filter, drill into one' — this is the filter half, and it is a filter on purpose: a day grid is already staff × time, so a third axis turns 11 columns into 99. Click a branch to narrow the day to it, click it again to go back to all. The counts are why it is a strip and not a dropdown: an owner opening the calendar across branches is asking which branch is busy. While more than one branch is in view the strip says a new booking needs one chosen first — R11's all-locations-is-read-only, said where someone would otherwise expect to drag one in."
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
          description="SCR-13 (R08, KC1.5). Corrected 2026-09-03 from Maaz's walkthrough of Chaps & Co's real Fresha account, and the earlier design had it backwards: gift cards and memberships travel across branches, packages do not — a package is sold against one specific priced service. The rule is warn, never block. Operators already work around a block by hand (a 100% discount, a gift-card credit), so blocking does not prevent the outcome, it makes reception do it slowly in front of the client. The warning carries both figures so they can decide there and then, and the choice is recorded on the sale — not out of suspicion, but so an owner reading a branch's numbers can see why a package redeemed below its value. The blueprint's §07 'can only be redeemed there' is the superseded version."
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
          description="Booking card rendered on the People grid. Color carries service category, fill saturation and border style overlay status. All content elements (time, price, name, service, icons) render at every size; truncation handles the squeeze."
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
          description="Calendar toolbar (Today, date, view mode, filters, new) above an 11-column staff × time grid. Right-side filters are placeholders pending tighter Figma reference."
        >
          <Row label="Toolbar">
            <div className="w-full max-w-5xl rounded-2xl border border-border/60 bg-card">
              <AppointmentsToolbar date="2026-05-11" viewMode="day" />
            </div>
          </Row>
          <Row label="People grid (clipped to 600px)">
            <div className="h-150 w-full">
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
          description="Pet-address capture on the staff sheet (<PickupFields>) and its read-only rendering on the calendar card. The tick is off by default and reuses the saved address when on; the field is the same map search as billing, so a picked place stores a pin and the line beneath says whether this one has it. Pet notes sit outside the tick — allergies and handling matter on every appointment. The card below is the ONE hover card (PRO-68's second click popover is gone): identity once, every service with its own performer and price, and the note rows. See docs/specs/PRD-167-appointment-notes.md and address-search-field.md."
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
        </Section>
        <Section
          title="Client notes (Staff Alert)"
          description="DZ-209 — three note kinds share these surfaces and telling them apart is the point: client notes travel with the person, the appointment note is the occasion, pet notes travel with the animal. The card is a PREVIEW, not the archive, and the bound is on the content (two notes at two lines, one note at one line on glance surfaces) so nothing is cut mid-glyph. Deliberately not an amber warning slab: ClientNote carries no severity, and that treatment marked every written-about client as a hazard. Karen Dougall's four notes on one afternoon are the case that forces per-note timestamps. See docs/specs/PRD-167-appointment-notes.md."
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
              Nothing above this line: the banner returns null rather than an empty card, so a
              client with no notes costs no vertical space on any surface.
            </div>
          </Row>
        </Section>
        <Section
          title="Pet notes — structured categories"
          description="Replaces the single free-text box. A blank box gets skipped or filled with prose nobody can filter on; tapping categories keeps it fast for the parent and gives groomers comparable data. Multi-select, and the specifics field is required once a chip is on — a selected chip with nothing typed is no better than the blank box it replaced, so it blocks Continue. 'Other' is a genuine fallback, not the default catch-all. Same component on the public booking flow and the staff appointment sheet."
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
          description="The driver's half of PRD-144, used wherever a pet address is shown read-only. Opens Google Maps in directions mode rather than search mode: on a phone that hands off to the native app with the trip already loaded, one tap fewer than a pin you then press Directions on. Where the address was picked from the map search it routes to the stored coordinates; where it was typed it falls back to a text query and says 'Search in Maps' instead of 'Navigate', because a text query that lands on the wrong side of a villa cluster should not look like a promise. Two renderings — compact for the calendar popover, default for the detail sheet — and it renders nothing at all when there is no address."
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
          title="Service menu — cards & sidebar"
          description="Presentational building blocks for the catalog screens. Full interactive screens (drag-reorder, add/edit, archive) live at /catalogs/service-menu and /catalogs/categories. Prices render in AED. Combos come back from the same endpoint as single services, so the card marks them with a tinted Combo badge (layers icon) plus a count of the services they bundle — PRD-143."
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
          title="Combos across surfaces"
          description="PRD-143 — a combo is a bundle sold as one catalog entry. Where it is still being CHOSEN the row carries a Combo badge (layers icon) and a bundled-services count; once PICKED it stops being one row and becomes its component services, each named 'Combo - Service', led by the glyph, with the standalone price struck through. The POS cart footer states the saving as a Bundle discount rather than subtracting it twice. Rules and decisions: docs/specs/catalogs-service-menu-combo.md."
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
          description="Selling a gift card from the POS drawer (/sales/new-sale → Gift cards). The Add/Edit gift card dialog sets value, price, expiration, an optional custom code, the is-a-gift + confirmation-email toggles, and the attributed team member. On the payment step a notice blocks paying for a gift card with another gift card; the Gift card method otherwise opens a redeem-by-code dialog."
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
          description="The operator half of CamiPay (PRO-396, reworked in PRO-909). From the Payment step, 'Payment link' texts the client a secure link; they pay on their own phone at /[slug]/pay/[token]. Sending the link creates a draft sale and locks the cart — amount and method are frozen so the link and the sale can't drift apart — so the drawer body is replaced by the lock screen rather than narrating progress the operator can't act on. Links live 12 hours. Cancel invalidates the link (never edits it) and hands off to the draft sale it created; Checkout on that draft resumes the journey at Tip. Mark as paid is the manual settle path."
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
          description="The card-present adoption of PRO-909's locked cart: once a sale is sent to a machine the drawer body is replaced, so the operator cannot re-charge it or discard a sale that already took the money. Mark as paid stands in for the terminal callback; Collect another way is the only exit and keeps the cart. The tile lists the merchant's machines and lets only a signed-in one be picked, each other state carrying its reason. See docs/specs/terminal-checkout-locked-cart.md."
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
          description="Payment policy (DSG-51) inside the Settings dialog (?settings=payments). Summary panel → policy editor takeover (?pp=edit), with the Customize-by-service table (?pp=services) and the client-facing terms editor (?pp=terms). Configured policy drives the Payment policy card in the appointment sheet: deposit amount from percent/fixed default + per-service overrides, hidden entirely when no policy is set. Shown here: the shared percent/AED amount input and the auto-generated client-facing example line."
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
          description="Per-device terminals: each unit registers itself with its own code and PIN, and a session is time-boxed — the superseded model shared one merchant PIN, so removing a terminal signed out every location. Rows lead with the device name, carry the session state, and the menu offers only what that state allows. The faint demo controls walk one unit through Not paired → No sessions → Active. See docs/specs/DSG-62-terminal-registration.md."
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
          description="Three cards: Sender ID (the registered value, with 'Customers currently see CAMI' only when the two differ, and Edit disabled while a registration is pending), Reminders (7 events × 3 channels with per-message rates, event labels linking into their template editor, stacking into per-event blocks below sm), and Usage this month (share-of-cost meter, straight-line month-end estimate, totals from a period aggregate rather than the paginated log). Three faint demo controls bottom-right walk the Sender ID states and the WhatsApp grant. See docs/specs/notifications-sender-id-and-rates.md."
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
          description="DSG-83 — Notifications decides whether an event sends, this decides its wording, so there is no send toggle here. Per-channel tabs over one card of 7 rows keyed on the same event list the Reminders matrix uses. The editor is form left, sticky preview right, with clickable {{placeholder}} chips; an unknown token sends as written rather than being blanked, because a typo has to be visible here and not in a customer's inbox. See docs/specs/DSG-83-communication-templates.md."
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
          title="Merchant money surfaces — account summary (DSG-77)"
          description="Split custody made legible: terminal money is held and paid by NeoPay, online money by Cami. Every figure is derived from one ledger (lib/money), so the breakdown arrives at the headline instead of asserting it — the defect the benchmark shows at 9.3x. D6 is undecided, so both layouts are here."
        >
          <Row label="Two rails">
            <MoneySummaryDemo variant="two-rail" />
          </Row>
          <Row label="Blended">
            <MoneySummaryDemo variant="blended" />
          </Row>
          <Row label="Payouts paused">
            <MoneySummaryDemo variant="two-rail" block="destination-unverified" />
          </Row>
          <Row label="Below minimum">
            <MoneySummaryDemo variant="two-rail" block="below-minimum" />
          </Row>
          <Row label="Terminal only">
            <MoneySummaryDemo variant="two-rail" rails={{ online: false, terminal: true }} />
          </Row>
          <Row label="Zero activity">
            <MoneySummaryDemo variant="two-rail" empty />
          </Row>
        </Section>
        <Section
          title="Merchant money surfaces — activity and detail (DSG-78)"
          description="The itemised feed under the number. Day groups carry a NET subtotal rather than takings, so a heavy fee day cannot read as a good one. Rows carry direction in the icon and colour before the sign. Open any row for the detail panel; open a payout row to drill into what it carried and watch the contents sum to the payout figure."
        >
          <Row label="Both rails">
            <MoneyActivityDemo />
          </Row>
          <Row label="Terminal only">
            <MoneyActivityDemo rails={{ online: false, terminal: true }} />
          </Row>
          <Row label="Empty">
            <MoneyActivityDemo empty />
          </Row>
        </Section>
        <Section
          title="Merchant money surfaces — bank account (DSG-75)"
          description="The one control that can redirect every dirham the business takes, so changing it is a multi-step flow and never an inline edit. The reference version is a masked account and an Edit button; this one adds a verification state, both senders shown against the single account they pay into, and a permanent change log that keeps failed attempts. The state worth clicking is the gateway failure — it must leave the old account untouched and say so."
        >
          <Row label="Verified">
            <BankAccountDemo state="verified" />
          </Row>
          <Row label="Unverified">
            <BankAccountDemo state="unverified" />
          </Row>
          <Row label="Gateway failed">
            <BankAccountDemo state="gateway-failed" />
          </Row>
          <Row label="Read-only">
            <BankAccountDemo state="read-only" />
          </Row>
          <Row label="Terminal only">
            <BankAccountDemo state="terminal-only" />
          </Row>
        </Section>
        <Section
          title="Merchant money surfaces — invoices and fees (DSG-76)"
          description="What Cami charged, per period, with the current month pending. Cami's statement is a different document from the benchmark's: no subscription line (the OS is free), the rate stated on the screen rather than only inside a download, and every fee expandable to the sale that caused it with the working shown. Each line renders the rate snapshotted at capture, so a past statement never re-rates after a renegotiation."
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
          title="Merchant money surfaces — billing details (DSG-74)"
          description="Four values, held once, printed on every tax invoice the merchant sends and every invoice Cami sends them. Missing fields collapse into an Add pill rather than a blank row, and the no-TRN state names its consequence: ordinary invoices with no tax wording. Edit opens the standard takeover, which says changes apply forward only, and takes the registered address through the address search field below rather than a free-text box."
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
          description="PRO-737. What the Partner sees on their own sale detail (/sales/sales-list, open a sale paid by CamiPay). Sale amount → Cami fee → Net, with the calculation spelled out under the fee so the number is never a black box. The gateway's processing fee is deliberately absent: the Partner pays Cami's fee and nothing else. The rate is snapshotted onto the payment at capture, so a later rate change never restates it."
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
          description="DSG-72. One component renders the PDF download, the email attachment and the unique invoice link, so field order is identical across the three by construction. Paper, not app chrome: it stays white-with-dark-ink in dark mode and carries no badge chips — payment state is carried by the numbers (Balance), and only Refunded and Voided get a line of prose under the document date. Previews are scaled to 34%; open /sales/invoice-document?state=<id> for full size and the Print action."
        >
          <Row label="Status — carried by the numbers, no chips">
            <InvoicePreview
              id="completed"
              note="Split tender, per-tender timestamps, Balance 0.00"
            />
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
            <InvoicePreview
              id="recipient-minimal"
              note="Recipient collapses to a single name line"
            />
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
          description="DSG-72. The two modals behind the sale detail dialog's actions, matched to the shipped implementation in cami-business rather than to a screenshot. Neither navigates away from the sale — that is the shape every production action on this dialog shares. Share invoice hands out the unique invoice link, which renders the same document as the PDF and the email attachment."
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
          description="The redesigned bulk-import review. Aya's migration from the Slack thread is the reference case: 100 rows, 83 added, 17 blocked for a missing SKU. The complaint was that those 17 rows shared one cause and the shipped UI made you expand each one to find it, so causes are now grouped and stated once and the table's last column says what happens in words rather than counting errors. Every frame reads the real mock payload; compare against what ships today at /products/import via the compare bar."
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

          <Row label="Whole review step" align="start">
            <ReviewStateDemo
              scenario="aya-migration"
              label="The reported case"
              note="83 ready, 17 blocked. Clicking a cause filters the table to those rows."
            />
            <ReviewStateDemo
              scenario="mixed"
              label="Every status at once"
              note="Plus an unrecognised tax rate. The filter appears because several statuses are present."
            />
            <ReviewStateDemo
              scenario="all-rejected"
              label="Nothing importable"
              note="No disabled primary button and no filter — one way out instead."
            />
            <ReviewStateDemo
              scenario="up-to-date"
              label="Already up to date"
              note="Confirm is gone; the headline is the answer."
            />
            <ReviewStateDemo
              scenario="placeholder-skus"
              label="After PRD-63"
              note="All 100 import; the advisory names the 17 generated SKUs."
            />
          </Row>

          <Row label="Done step" align="start">
            <DoneStateDemo
              scenario="mixed"
              label="With rows left behind"
              note="Offers the failed-row download, not just a count."
            />
            <DoneStateDemo
              scenario="placeholder-skus"
              label="After PRD-63"
              note="'17 products need a real SKU', linking to them. This is what makes PRD-63 safe to ship."
            />
            <DoneStateDemo
              scenario="duplicate-barcodes"
              label="Clean import"
              note="Follow-up blocks appear only when there is something to chase."
            />
          </Row>
        </Section>
        <Section
          lazy
          title="Clients and pets import — review states (DSG-84)"
          description="The same wizard on the other two entities. Production serves all three from one component set, so these screens are the product import's parts with different counts: one CountLedger, one IssueSummary, one LookupsPanel, one OutcomePanel, and every string from lib/imports/copy.ts. What is genuinely specific is name matching — a row matched on first name alone, which products have no equivalent of — and a pet row, which carries an owner and a pet with separate outcomes. Both reference cases come from the #ui threads: Aya's 100-row client file and Maaz's 873-row pet file. Compare at /clients/import."
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

          <Row label="Whole review step" align="start">
            <ClientReviewStateDemo
              scenario="aya-clients"
              label="Aya's client import"
              note="Opens on the 21 rows that need her — 18 missing a last name, 1 duplicate phone, 2 name matches — not on 79 identical green badges."
            />
            <ClientReviewStateDemo
              scenario="maaz-pets"
              label="Maaz's pet import"
              note="Eleven counts and eight lists created. Owner counts are named, so '826 pets will be added' cannot be read as the owner total."
            />
            <ClientReviewStateDemo
              scenario="pets-no-owner"
              label="No contact details anywhere"
              note="120 rows, every pet standalone, not one client created. The commit button counts pets on a pet import for this file: counting owners read 'nothing to import' over an import of 120 pets."
            />
            <ClientReviewStateDemo
              scenario="many-name-matches"
              label="Mostly name matches"
              note="16 of 24 rows matched on first name alone — the volume the reported file would produce in a populated account."
            />
            <ClientReviewStateDemo
              scenario="client-no-pets"
              label="Pet feature off"
              note="The same file on an account without pets. Nothing pet-related may appear anywhere on this screen."
            />
          </Row>

          <Row label="Done step" align="start">
            <ClientOutcomeDemo
              scenario="aya-clients"
              label="Clients, with rows left behind"
              note="The ledger has to add up to the file: 79 added + 2 left for you to answer + 19 left behind = 100."
            />
            <ClientOutcomeDemo
              scenario="maaz-pets"
              label="Pets"
              note="The same panel as the product Done step — the two were separate implementations and drifted apart within a day."
            />
            <ClientOutcomeDemo
              scenario="pets-no-owner"
              label="Pets, none with an owner"
              note="'120 pets added' with 0 owners under it — the ledger keeps the standalone pets on their own line rather than folding them into the added count."
            />
          </Row>
        </Section>
        <Section
          lazy
          title="Performance dashboard — chart primitives"
          description="The four marks the Performance dashboard (DSG-79) is built from, plus the categorical palette they share. Colours come from the --chart-cat-* tokens; both the light and dark sets pass the dataviz validator, so check this section in both themes."
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
                formatValue={(n) => `AED ${n.toLocaleString("en-US")}`}
              />
            </div>
            <span className="w-56 text-xs leading-snug text-muted-foreground">
              Stacked: ring above its legend. Hovering a slice swaps the centre total for that slice
              — no floating tooltip, because the tooltip would cover the total it is explaining.
            </span>
          </Row>

          <Row label="Donut — wide" align="start">
            <div className="w-[720px] rounded-2xl border border-border/60 bg-card p-5">
              <DonutChart
                items={SALES_BY_PAYMENT}
                values={SALES_BY_PAYMENT_VALUES}
                centreLabel="collected"
                centreValue="AED 10,240"
                formatValue={(n) => `AED ${n.toLocaleString("en-US")}`}
                wide
              />
            </div>
            <span className="w-56 text-xs leading-snug text-muted-foreground">
              Ring beside the legend, for cards 8 columns and wider. The legend stays one column:
              two columns truncated the longer labels and gave each column its own value edge, so
              the amounts stopped lining up.
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
          description="The shared view templates that render every report from lib/reports/registry.ts. Config-driven — columns, group-by, filters and date control come from each report's definition. All amounts AED."
        >
          {reportPaymentsSummary ? (
            <div className="py-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Table View — Payments summary (Total row, Cami payment methods)
              </p>
              <TableReport report={reportPaymentsSummary} />
            </div>
          ) : null}
          {reportFinanceSummary ? (
            <div className="py-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Detailed Table View — Finance summary (section-grouped metric × period matrix)
              </p>
              <DetailedTableReport report={reportFinanceSummary} />
            </div>
          ) : null}
          {reportPerformanceDashboard ? (
            <div className="py-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dashboard View — Performance dashboard (6 Cami metrics + comparison chart +
                drill-downs)
              </p>
              <DashboardReport report={reportPerformanceDashboard} />
            </div>
          ) : null}
          {reportPerformanceSummary ? (
            <div className="py-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Matrix View — Performance summary (metric × team-member, section subtotals, Total
                column)
              </p>
              <DashboardReport report={reportPerformanceSummary} />
            </div>
          ) : null}
          {reportPerformanceOverTime ? (
            <div className="py-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Over-time Matrix — Performance over time (live pills recompute a recharts bar chart
                + entity × time-period table)
              </p>
              <DashboardReport report={reportPerformanceOverTime} />
            </div>
          ) : null}
        </Section>
      </Lane>
      <Lane id="hq" label="Cami HQ" blurb="Our own control plane over Partners.">
        <Section
          title="Cami HQ — CamiPay settlement config"
          description="PRO-737. The Settings tab of the HQ Partner detail dialog (/admin/businesses?business=…). One card, one section per rail: whether it is on, where it routes, and what Cami charges on it. A rate is a percentage plus a fixed per-transaction amount, optionally with a ceiling above which the fixed part drops off (Shampooch Online, Pawhaus Online). Rates are append-only, so the only write is Change, which adds a row with an effective-from date; past rows have no edit or delete affordance on purpose. A live rail with no rate row earns Cami nothing and says so (Doggos Online). The switch and gateway are gated by billing.camipay.rails.edit, Change by billing.camipay.rates.edit, separately. One store is shared across the rows below, so a change made in one row shows up in the others."
        >
          <CamiPayProvider>
            <Row label="Live Partner, full edit rights">
              <CamiPayPanelDemo slug="shampooch-jvc" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="Scheduled rate, split gateways per rail">
              <CamiPayPanelDemo slug="pawhaus" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="Onboarding, rails off and no rate card">
              <CamiPayPanelDemo slug="velvet-paw" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="View-only, billing.read without CamiPay edit">
              <CamiPayPanelDemo slug="shampooch-jvc" permissions={["billing.read"]} />
            </Row>
            <Row label="Archived Partner, whole tab read-only">
              <CamiPayPanelDemo slug="furry-tales" permissions={ALL_HQ_PERMISSIONS} disabled />
            </Row>
          </CamiPayProvider>
        </Section>
        <Section
          title="Cami HQ — terminal fleet, Partner card"
          description="DSG-82 — Cami owns the machines and leases them, so a terminal is an asset HQ assigns, not a device a merchant registered. Rows lead with the serial (what is printed on the box and quoted in a ticket); Return to Cami is the destructive item, not Block, because a block is undone from the same menu. The access switch writes the same rails.terminal.enabled flag as CamiPay Terminal. One store across the rows, so an assignment in one shows in the others. See docs/specs/DSG-82-hq-terminal-management.md."
        >
          <HqTerminalsProvider>
            <CamiPayProvider>
              <Row label="Three units: active, idle, and shipped but never switched on">
                <HqTerminalsPanelDemo slug="shampooch-jvc" permissions={ALL_HQ_PERMISSIONS} />
              </Row>
              <Row label="One unit blocked by HQ, with who and when on the row">
                <HqTerminalsPanelDemo slug="pawhaus" permissions={ALL_HQ_PERMISSIONS} />
              </Row>
              <Row label="Suspended Partner, device locked itself out on failed PINs">
                <HqTerminalsPanelDemo slug="doggos" permissions={ALL_HQ_PERMISSIONS} />
              </Row>
              <Row label="Nothing assigned yet — empty state carries Assign">
                <HqTerminalsPanelDemo slug="velvet-paw" permissions={ALL_HQ_PERMISSIONS} />
              </Row>
              <Row label="Terminal access off, so the unit in hand cannot transact">
                <HqTerminalsPanelDemo slug="furry-tales" permissions={ALL_HQ_PERMISSIONS} />
              </Row>
              <Row label="View-only, merchants.view without merchants.edit">
                <HqTerminalsPanelDemo slug="shampooch-jvc" permissions={["merchants.view"]} />
              </Row>
              <Row label="Archived Partner, whole tab read-only">
                <HqTerminalsPanelDemo
                  slug="furry-tales"
                  permissions={ALL_HQ_PERMISSIONS}
                  disabled
                />
              </Row>
            </CamiPayProvider>
          </HqTerminalsProvider>
        </Section>
        <Section
          title="Terminal status — one vocabulary, two surfaces"
          description="DSG-82. The fleet table and the Partner card read from components/blocks/hq-terminal-status.tsx so they cannot drift. The first three are fleet states only HQ sees; Not set up, Locked, Active and No sessions are the merchant's own words from DSG-62, so HQ and the merchant looking at one device read the same status. Order is first-match-wins: where the unit physically is, then whether HQ stopped it, then what the device is doing."
        >
          {(
            [
              "in-stock",
              "returned",
              "faulty",
              "not-paired",
              "active",
              "no-sessions",
              "blocked",
              "locked",
            ] as HqTerminalStatus[]
          ).map((status) => (
            <Row key={status} label={status}>
              <TerminalStatus status={status} suffix={status === "locked" ? "12 min" : null} />
            </Row>
          ))}
        </Section>
        <Section
          title="Partner code — CM-####"
          description="DSG-82. The identifier a human says out loud. `id` (biz_shampooch) is internal and never rendered; the slug is public and changeable from the General tab; this one is issued at creation and immutable, which is why there is no edit affordance anywhere. Chip variant on the detail modal header and the Terminals card, click to copy; inline variant in dense listing rows, where a button per row would be twelve buttons nobody asked for."
        >
          <Row label="Chip — click to copy">
            <MerchantCode code="CM-4821" />
          </Row>
          <Row label="Inline — roster row, paired with the slug">
            <span className="truncate font-mono text-xs text-muted-foreground">
              CM-4821 · cami.app/shampooch-jvc
            </span>
          </Row>
        </Section>
        <Section
          title="Notifications, Cami HQ control plane"
          description="The HQ half of the same store the merchant panel reads: Sender ID registrations to approve or reject, per-Partner channel grants, and rate overrides against the global rate card. Four Partners cover the states — Shampooch (approved, negotiated override), Pawhaus (pending), Doggos (rejected, SMS off), Furry Tales (no config, so every global default applies). See docs/specs/notifications-sender-id-and-rates.md."
        >
          <Row label="Approved Sender ID, global rates (Shampooch)">
            <div className="w-full max-w-2xl">
              <HqNotificationsDemo slug="shampooch-jvc" />
            </div>
          </Row>
          <Row label="Pending Sender ID + SMS rate override (Pawhaus)">
            <div className="w-full max-w-2xl">
              <HqNotificationsDemo slug="pawhaus" />
            </div>
          </Row>
          <Row label="Rejected Sender ID, SMS switched off (Doggos)">
            <div className="w-full max-w-2xl">
              <HqNotificationsDemo slug="doggos" />
            </div>
          </Row>
          <Row label="No config at all — inherits every default (Furry Tales)">
            <div className="w-full max-w-2xl">
              <HqNotificationsDemo slug="furry-tales" />
            </div>
          </Row>
        </Section>
        <Section
          title="Impersonation banner"
          description="Bottom-anchored pill on the Partner portal during a Cami HQ impersonation session. Yellow active state, tomato expiring/expired states, plus a collapsed toggle that doubles as a re-open affordance."
        >
          <Row label="Active">
            <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
              <ImpersonationBanner
                ownerName="Maz Khan"
                businessName="Shampooch JVC"
                onExit={() => toast.success("Impersonation stopped")}
              />
            </div>
          </Row>
          <Row label="Expiring (5 min)">
            <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
              <ImpersonationBanner
                ownerName="Maz Khan"
                businessName="Shampooch JVC"
                durationSeconds={4 * 60}
                expiringThresholdSeconds={5 * 60}
                onExit={() => toast.success("Impersonation stopped")}
              />
            </div>
          </Row>
          <Row label="Expired (terminal)">
            <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
              <ImpersonationBanner
                ownerName="Maz Khan"
                businessName="Shampooch JVC"
                durationSeconds={0}
                onExit={() => toast.success("Window closed")}
              />
            </div>
          </Row>
          <Row label="Collapsed">
            <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
              <ImpersonationBanner
                ownerName="Maz Khan"
                businessName="Shampooch JVC"
                defaultCollapsed
                onExit={() => toast.success("Impersonation stopped")}
              />
            </div>
          </Row>
        </Section>
      </Lane>
    </TooltipProvider>
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
function CamiPayPanelDemo({
  slug,
  permissions,
  disabled,
}: {
  slug: string
  permissions: PermissionKey[]
  disabled?: boolean
}) {
  const business = adminBusinesses.find((b) => b.slug === slug)
  if (!business) return null
  return (
    <div className="w-full max-w-xl">
      <AuthProvider initialPermissions={permissions}>
        <HqCamiPayPanel business={business} disabled={disabled} />
      </AuthProvider>
    </div>
  )
}

/**
 * One HQ terminals panel, wrapped in its own AuthProvider so each row can show
 * a different permission set. Both stores are provided once by the section
 * above, so a block made in one row shows up in the others.
 */
function HqTerminalsPanelDemo({
  slug,
  permissions,
  disabled,
}: {
  slug: string
  permissions: PermissionKey[]
  disabled?: boolean
}) {
  const business = adminBusinesses.find((b) => b.slug === slug)
  if (!business) return null
  return (
    <div className="w-full max-w-xl">
      <AuthProvider initialPermissions={permissions}>
        <HqTerminalsPanel business={business} disabled={disabled} />
      </AuthProvider>
    </div>
  )
}

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
function AddressSearchFieldDemo({ initial = EMPTY_ADDRESS }: { initial?: AddressParts }) {
  const [parts, setParts] = useState<AddressParts>(initial)
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-sand-2 p-4">
      <AddressSearchField value={parts} onChange={setParts} />
      <div className="flex flex-col gap-0.5 rounded-xl bg-cami-sage-2 p-3">
        <p className="text-sm font-medium text-foreground">On the document</p>
        {addressToLines(parts).length > 0 ? (
          addressToLines(parts).map((line) => (
            <p key={line} className="text-sm leading-5 text-muted-foreground">
              {line}
            </p>
          ))
        ) : (
          <p className="text-sm leading-5 text-muted-foreground">Nothing yet.</p>
        )}
      </div>
    </div>
  )
}

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
function HqNotificationsDemo({ slug }: { slug: string }) {
  const base = adminBusinesses.find((b) => b.slug === slug)
  const [business, setBusiness] = useState(base)
  if (!business) return null
  return (
    <BusinessNotificationsSection
      business={business}
      onUpdate={(patch) => setBusiness((prev) => (prev ? { ...prev, ...patch } : prev))}
    />
  )
}
