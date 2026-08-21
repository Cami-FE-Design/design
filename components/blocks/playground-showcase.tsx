"use client"

import {
  BanknoteIcon,
  BedIcon,
  BellIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
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
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
  type MockServiceCategory,
} from "@/app/appointments/mock"
import { GiftCardDialog, newGiftCardDraft } from "@/app/sales/new-sale/gift-card-dialog"
import { PaymentLinkLockScreen } from "@/app/sales/new-sale/payment-link-lock"
import { PaymentView } from "@/app/sales/new-sale/payment-view"
import { RedeemGiftCardDialog } from "@/app/sales/new-sale/redeem-gift-card-dialog"
import { SelfCheckoutDialog } from "@/app/sales/new-sale/self-checkout-dialog"
import { AddTeamMemberDialog } from "@/components/blocks/add-team-member-dialog"
import { AppointmentBlock } from "@/components/blocks/appointment-block"
import {
  AppointmentDetailPanel,
  AppointmentQuickPanel,
} from "@/components/blocks/appointment-popover"
import { AppointmentsToolbar } from "@/components/blocks/appointments-toolbar"
import { AvatarStack } from "@/components/blocks/avatar-stack"
import { BoardingDetailSheet } from "@/components/blocks/boarding/booking-detail-sheet"
import { NewBoardingSheet } from "@/components/blocks/boarding/new-boarding-sheet"
import { CamiPayFeeBreakdown } from "@/components/blocks/camipay-fee-breakdown"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { DaycareDetailSheet } from "@/components/blocks/daycare/booking-detail-sheet"
import { EmailInvoiceDialog } from "@/components/blocks/email-invoice-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { GlobalSearchDialog } from "@/components/blocks/global-search-dialog"
import { HqCamiPayPanel } from "@/components/blocks/hq-camipay-panel"
import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
import { InvoiceDocumentView } from "@/components/blocks/invoice-document"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import { MyProfilePanel } from "@/components/blocks/my-profile-panel"
import { AmountInput } from "@/components/blocks/payment-policy/amount-input"
import { PdfViewer } from "@/components/blocks/pdf-viewer-lazy"
import { PeopleGrid } from "@/components/blocks/people-grid"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { PetNotesFields, PetNotesList } from "@/components/blocks/pet-notes-fields"
import { PhoneField } from "@/components/blocks/phone-field"
import { PickupFields } from "@/components/blocks/pickup-fields"
import { DashboardReport } from "@/components/blocks/reports/dashboard-report"
import { DetailedTableReport } from "@/components/blocks/reports/detailed-table-report"
import { TableReport } from "@/components/blocks/reports/table-report"
import { SectionCard } from "@/components/blocks/section-card"
import { SectionedSheetShell, type SectionGroup } from "@/components/blocks/sectioned-sheet-shell"
import { CategorySidebar } from "@/components/blocks/service-menu/CategorySidebar"
import { ServiceCardInner } from "@/components/blocks/service-menu/ServiceCard"
import { SettingsRow } from "@/components/blocks/settings-row"
import { ShareInvoiceDialog, type ShareLinkState } from "@/components/blocks/share-invoice-dialog"
import {
  SignatureDialog,
  SignaturePreview,
  type SignatureResult,
} from "@/components/blocks/sign/signature-dialog"
import { FacebookGlyphIcon, InstagramGlyphIcon, XGlyphIcon } from "@/components/blocks/social-icons"
import {
  TeamMemberDetailDialog,
  type TeamMemberDetailMember,
} from "@/components/blocks/team-member-detail-dialog"
import { TerminalsPanel } from "@/components/blocks/terminals-panel"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
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
import { adminBusinesses } from "@/lib/admin-businesses"
import { ALL_HQ_PERMISSIONS, AuthProvider, type PermissionKey } from "@/lib/auth-mock"
import { BOARDING_STAYS, TODAY_ISO as BOARDING_TODAY } from "@/lib/boarding-mock"
import { DAYCARE_SESSIONS } from "@/lib/daycare-mock"
import { CamiPayProvider, ZERO_RATE } from "@/lib/hq-camipay/store"
import { INVOICE_FIXTURES } from "@/lib/invoice/mock"
import { buildConsentPdfUrl } from "@/lib/mock-pdf"
import {
  type AmountValue,
  DEFAULT_PAYMENT_POLICY,
  examplePolicyText,
} from "@/lib/payment-policy/types"
import type { PetNoteEntry } from "@/lib/pet-notes"
import { getReport } from "@/lib/reports/registry"
import { seedCategories, seedServices } from "@/lib/service-catalog/mock-data"
import { cn } from "@/lib/utils"

/** Fixed so the lock-screen expiry label is stable between renders. */
const NOW = new Date("2026-07-20T10:00:00Z").getTime()

type SectionProps = {
  title: string
  description?: string
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

function Section({ title, description, children }: SectionProps) {
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
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-6 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

// ─── Pickup & pet notes demos ─────────────────────────────────────────────────

const PICKUP_DEMO_BOOKING: MockBooking = {
  id: "pg-pickup",
  staffId: "aya-hassan",
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

// Every reachable state of the pickup block, each one live so the checkboxes
// can be toggled in place.
const PICKUP_FIELD_STATES: Array<{
  key: string
  label: string
  needsPickup: boolean
  useSavedAddress: boolean
  savedAddress?: string
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
    label: "On · reusing the saved address",
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

  return (
    <PickupFields
      idPrefix={`pg-${state.key}`}
      needsPickup={needsPickup}
      onNeedsPickup={setNeedsPickup}
      useSavedAddress={useSavedAddress}
      onUseSavedAddress={setUseSavedAddress}
      address={address}
      onAddress={setAddress}
      savedAddress={state.savedAddress}
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
      <Section
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
              Over-time Matrix — Performance over time (live pills recompute a recharts bar chart +
              entity × time-period table)
            </p>
            <DashboardReport report={reportPerformanceOverTime} />
          </div>
        ) : null}
      </Section>
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
            <KpiCard label="Total sales" value="AED 0" info="Lifetime revenue from this client." />
            <KpiCard label="No-shows" value="0" info="Lifetime count of no-shows." />
          </KpiGrid>
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
        title="Empty state"
        description="Centered placeholder for sections with no data. variant='plain' (default) is the borderless, muted in-section treatment. variant='card' wraps the same light line-icon and muted title in a dashed self-framed card — the full-page listing look used by the sales / clients / pets / products / appointments tables when a search or filter returns nothing."
      >
        <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card">
            <EmptyState icon={FolderIcon} title="Create a new folder to get started organizing." />
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
        title="Global search takeover"
        description="Full-screen search opened from the topbar magnifier (or Cmd/Ctrl+K). Reuses <FullScreenEditDialog> (same sticky header + pill Close as add/edit takeovers) with an xl <SearchInput>. Searches clients by name, mobile, email, or pet, and bookings by client name or booking reference (try 'B-77342'). Empty query shows Upcoming appointments + Clients (recently added). Clicking a client opens <ClientDetailDialog>; clicking an appointment opens <AppointmentDetailSheet> — both stack over the takeover."
      >
        <Row label="Open">
          <Button onClick={() => setGlobalSearchOpen(true)}>Open global search</Button>
        </Row>
        <GlobalSearchDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
      </Section>

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
        title="My profile (settings panel)"
        description="Personal info panel for the signed-in user (Settings → Account → My profile), scoped exactly to DSG-63 'view and edit contact details': one Contact card (Business-details pattern) with Legal name + masked mobile/email and a single Edit → full-screen takeover. Name saves directly; new mobile number → 6-digit OTP dialog (any 6 digits in the demo, shared OtpInput boxes); new email → 'Check your inbox' dialog (Resend with 30s cooldown / Cancel; the link click itself is simulated by a subtle bottom-right 'Demo: open confirmation link' control in the settings panel). Pending changes show as a neutral 'Pending' badge inline on the affected row that reopens the matching dialog; duplicates of team-member values blocked inline."
      >
        <div className="max-w-2xl rounded-2xl border border-border/60 bg-muted/20 p-6">
          <MyProfilePanel />
        </div>
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
            <PopoverContent className="w-64 text-sm">Quick settings panel content.</PopoverContent>
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

      <Section title="Separator">
        <div className="max-w-md">
          <p className="text-sm text-foreground">Above</p>
          <Separator className="my-4" />
          <p className="text-sm text-foreground">Below</p>
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
        title="Terminals (DSG-62)"
        description="Add card machines, issue their credentials, and manage sign-in sessions — Business Settings > Payments > Terminals. Replaces the merchant-level shared-PIN model. Each terminal is added from the dashboard with a name and a location, and comes back with two credentials that do different jobs: a pairing code (TRM-XXXXXX, typed into the hardware once, never changes) and a 6-digit sign-in PIN (typed every sign-in, readable from the row any time, regenerated whenever the merchant wants). Both are shown together because that is how a device gets set up, but labelled apart because their lifecycles differ. Per-device rather than merchant-wide, so regenerating a PIN or a failed-attempt lockout hits that terminal alone. Status is a precedence, first match wins: Locked · 12 min, Not paired, Active, No sessions — the middle two are states the source mockup had no room for and cover most of a working morning. Row menu: Show code & PIN, Rename terminal, Change location (split apart because 'Edit' didn't say what it edits), N devices signed in, Regenerate PIN, Unlock now while locked, Remove terminal. Sessions open as a modal per terminal rather than a second listing, showing device model, app build, IP, signed in and expires, with Revoke per session — a session belongs to hardware, not a person, since the PIN is shared by whoever works that counter. Nothing is capped: as many terminals as there is hardware for, as many concurrent sessions as staff open. Three instances below are live; the faint controls at the bottom stand in for the two things that happen on the hardware (pairing a device, signing in) and swap the demo data."
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
        title="Appointments — pickup & pet notes"
        description="Pet-address capture on the staff appointment sheet (<PickupFields>) and the read-only rendering on the calendar popover. Copy is deliberately service-agnostic — 'pickup' does not apply to mobile grooming, where the groomer always travels to the pet. The tick is off by default: most appointments are self-drop, and defaulting it on would put a car icon on every block. When it is on, the saved address is reused billing/shipping style so nothing has to be typed in the common case. Pet notes deliberately sit outside the checkbox: allergies and handling matter on every appointment. Every field state is live below — tick and untick them."
      >
        <PickupFieldsStates />
        <Row label="Popover — pickup + notes">
          <AppointmentQuickPanel booking={PICKUP_DEMO_BOOKING} />
          <AppointmentDetailPanel booking={PICKUP_DEMO_BOOKING} />
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

      {/* ── Service catalog ──────────────────────────────────────────────── */}
      <Section
        title="Service menu — cards & sidebar"
        description="Presentational building blocks for the catalog screens. Full interactive screens (drag-reorder, add/edit, archive) live at /catalogs/service-menu and /catalogs/categories. Prices render in AED."
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
        title="Invoice document — A4 downloadable"
        description="DSG-72. One component renders the PDF download, the email attachment and the unique invoice link, so field order is identical across the three by construction. Paper, not app chrome: it stays white-with-dark-ink in dark mode and carries no badge chips — payment state is carried by the numbers (Balance), and only Refunded and Voided get a line of prose under the document date. Previews are scaled to 34%; open /sales/invoice-document?state=<id> for full size and the Print action."
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
          <InvoiceDocumentView doc={doc} />
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
