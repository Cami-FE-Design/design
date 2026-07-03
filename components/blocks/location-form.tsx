"use client"

import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  AtSignIcon,
  BedIcon,
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  FootprintsIcon,
  GraduationCapIcon,
  HomeIcon,
  LayoutGridIcon,
  LightbulbIcon,
  type LucideIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ReceiptIcon,
  ScissorsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useRef, useState } from "react"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col p-0"

type BasicInfoField = "name" | "phone" | "email"
type AddressField =
  | "search"
  | "address"
  | "aptSuite"
  | "district"
  | "city"
  | "state"
  | "postcode"
  | "country"
type InvoicingField =
  | "companyName"
  | "address"
  | "aptSuite"
  | "city"
  | "state"
  | "postcode"
  | "vatNumber"
  | "invoiceNote"

type BusinessTypeOption = {
  id: string
  label: string
  Icon: LucideIcon
}

const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  { id: "grooming", label: "Pet grooming", Icon: ScissorsIcon },
  { id: "boarding", label: "Boarding", Icon: HomeIcon },
  { id: "daycare", label: "Daycare", Icon: SunIcon },
  { id: "training", label: "Training", Icon: GraduationCapIcon },
  { id: "veterinary", label: "Veterinary", Icon: StethoscopeIcon },
  { id: "walking", label: "Dog walking", Icon: FootprintsIcon },
  { id: "sitting", label: "Pet sitting", Icon: BedIcon },
  { id: "wellness", label: "Wellness & spa", Icon: SparklesIcon },
  { id: "other", label: "Other", Icon: LayoutGridIcon },
]

function businessTypeOption(id: string): BusinessTypeOption | undefined {
  return BUSINESS_TYPE_OPTIONS.find((t) => t.id === id)
}

const COUNTRY_OPTIONS = [
  "United Arab Emirates",
  "Saudi Arabia",
  "United Kingdom",
  "United States",
] as const

type LocationAddress = {
  address: string
  aptSuite: string
  district: string
  city: string
  state: string
  postcode: string
  country: string
}

type Invoicing = {
  sameAsLocation: boolean
  companyName: string
  address: string
  aptSuite: string
  city: string
  state: string
  postcode: string
  vatNumber: string
  invoiceNote: string
}

type Location = {
  id: string
  name: string
  slug: string
  phone: string
  email: string
  location: LocationAddress
  mapPin: { lat: number; lng: number } | null
  businessType: string[]
  invoicing: Invoicing
  status: "live" | "draft"
  ownerName: string
  ownerEmail: string
  photoUrl: string
}

const LOCATIONS: Location[] = [
  {
    id: "shampooch-jvc",
    name: "Shampooch JVC",
    slug: "shampooch-jvc",
    phone: "+971 50 123 4567",
    email: "hello@shampooch.ae",
    location: {
      address: "Al Ghozlan 4, Jumeirah Village Circle",
      aptSuite: "",
      district: "JVC",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      country: "United Arab Emirates",
    },
    mapPin: { lat: 25.0635, lng: 55.2008 },
    businessType: ["grooming", "wellness"],
    invoicing: {
      sameAsLocation: false,
      companyName: "Shampooch Trading LLC",
      address: "Office 504, Building 7, JLT",
      aptSuite: "",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      vatNumber: "100123456700003",
      invoiceNote: "",
    },
    status: "live",
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    photoUrl: "https://picsum.photos/seed/shampooch/80",
  },
]

function formatLocationAddress(loc: LocationAddress): string | null {
  const line = [loc.address, loc.aptSuite, loc.district, loc.city, loc.state, loc.postcode]
    .filter(Boolean)
    .join(", ")
  return line || null
}

function formatInvoicingAddress(inv: Invoicing): string | null {
  const line = [inv.address, inv.aptSuite, inv.city, inv.state, inv.postcode]
    .filter(Boolean)
    .join(", ")
  return line || null
}

/**
 * Locations panel — list view that drills down into a per-location detail
 * page (inner-page navigation, not a popup). Notion-style breadcrumb at the
 * top of the detail provides back navigation. Form-state wiring is
 * intentionally absent during design iteration.
 */
export function LocationForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = LOCATIONS.find((l) => l.id === selectedId) ?? null

  if (selected) {
    return <LocationDetailView location={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">Locations</h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Where you operate. Click a location to manage its details.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {LOCATIONS.map((loc) => (
          <LocationListCard key={loc.id} location={loc} onOpen={() => setSelectedId(loc.id)} />
        ))}
      </div>
    </div>
  )
}

function LocationListCard({ location, onOpen }: { location: Location; onOpen: () => void }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4 transition-colors hover:bg-foreground/[0.03]">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
          {/* biome-ignore lint/performance/noImgElement: placeholder photo for design mock */}
          <img src={location.photoUrl} alt={location.name} className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-base font-semibold text-foreground">
            {location.name}
          </span>
          <span className="truncate text-sm text-muted-foreground">cami.app/{location.slug}</span>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" radius="full">
            Options
            <ChevronDownIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>Change photo</DropdownMenuItem>
          <DropdownMenuItem>Suspend location</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/${location.slug}`} target="_blank" rel="noopener noreferrer">
              See public booking page
              <ArrowUpRightIcon className="ml-auto size-3.5 text-muted-foreground" />
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ============================================================================
// Per-location detail view (inner-page, no popup)
// ============================================================================

function LocationDetailView({ location, onBack }: { location: Location; onBack: () => void }) {
  return (
    <div className="flex animate-in flex-col gap-6 duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] slide-in-from-right-12">
      <NotionBreadcrumb
        segments={[
          { label: "Locations", icon: MapPinIcon, onClick: onBack },
          { label: location.name, photoUrl: location.photoUrl },
        ]}
      />

      <header className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="size-16 overflow-hidden rounded-2xl bg-muted">
            {/* biome-ignore lint/performance/noImgElement: placeholder photo for design mock */}
            <img src={location.photoUrl} alt={location.name} className="size-full object-cover" />
          </div>
          <button
            type="button"
            aria-label="Upload location photo"
            className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-sm transition-transform hover:scale-105"
          >
            <ArrowUpIcon className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            {location.name}
          </h2>
          <a
            href={`/${location.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start font-mono text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            cami.app/{location.slug}
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      </header>

      <Tabs defaultValue="general" className="flex flex-col gap-6">
        <TabsList variant="ghost">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="address">Location</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab location={location} />
        </TabsContent>
        <TabsContent value="hours">
          <HoursTab />
        </TabsContent>
        <TabsContent value="address">
          <AddressTab location={location} />
        </TabsContent>
        <TabsContent value="invoicing">
          <InvoicingTab location={location} />
        </TabsContent>
        <TabsContent value="manage">
          <ManageTab location={location} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// Tab content
// ============================================================================

function GeneralTab({ location }: { location: Location }) {
  const [basicEditing, setBasicEditing] = useState(false)
  const [basicFocus, setBasicFocus] = useState<BasicInfoField | null>(null)
  const [typeEditing, setTypeEditing] = useState(false)

  const openBasic = (field: BasicInfoField | null = null) => {
    setBasicFocus(field)
    setBasicEditing(true)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit">
          <header className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Basic info
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              radius="full"
              onClick={() => openBasic()}
            >
              Edit
            </Button>
          </header>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
            <SettingsRow
              icon={Building2Icon}
              label="Location name"
              value={location.name}
              onAdd={() => openBasic("name")}
            />
            <SettingsRow
              icon={PhoneIcon}
              label="Phone"
              value={location.phone}
              onAdd={() => openBasic("phone")}
            />
            <SettingsRow
              icon={AtSignIcon}
              label="Email"
              value={location.email}
              onAdd={() => openBasic("email")}
            />
          </div>
        </section>

        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-[36.5rem]">
          <header className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Business type
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              radius="full"
              onClick={() => setTypeEditing(true)}
            >
              Edit
            </Button>
          </header>
          <SettingsRow
            icon={BriefcaseIcon}
            label="Type"
            value={
              location.businessType
                .map((id) => businessTypeOption(id)?.label)
                .filter(Boolean)
                .join(", ") || null
            }
            onAdd={() => setTypeEditing(true)}
            addLabel="Add business types"
          />
        </section>
      </div>

      <BasicInfoEditDialog
        location={location}
        open={basicEditing}
        onOpenChange={(o) => {
          setBasicEditing(o)
          if (!o) setBasicFocus(null)
        }}
        focusField={basicFocus}
      />
      <BusinessTypeEditDialog
        location={location}
        open={typeEditing}
        onOpenChange={setTypeEditing}
      />
    </>
  )
}

function AddressTab({ location }: { location: Location }) {
  const locationAddress = formatLocationAddress(location.location)
  const [editing, setEditing] = useState(false)
  const [focusField, setFocusField] = useState<AddressField | null>(null)

  const openEdit = (field: AddressField | null = null) => {
    setFocusField(field)
    setEditing(true)
  }

  return (
    <>
      <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-[36.5rem]">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Business location
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            radius="full"
            onClick={() => openEdit()}
          >
            Edit
          </Button>
        </header>
        <SettingsRow
          icon={MapPinIcon}
          label="Address"
          value={locationAddress}
          onAdd={() => openEdit("address")}
        />

        <hr className="border-border/40" />

        <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
          Map location
        </h3>
        <button
          type="button"
          onClick={() => openEdit("search")}
          className="flex h-44 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
        >
          Map preview with pin at selected address
        </button>
      </section>

      <AddressEditDialog
        location={location}
        open={editing}
        onOpenChange={(o) => {
          setEditing(o)
          if (!o) setFocusField(null)
        }}
        focusField={focusField}
      />
    </>
  )
}

function InvoicingDetailsCard({ location }: { location: Location }) {
  const invoicingAddress = formatInvoicingAddress(location.invoicing)
  const [editing, setEditing] = useState(false)
  const [focusField, setFocusField] = useState<InvoicingField | null>(null)

  const openEdit = (field: InvoicingField | null = null) => {
    setFocusField(field)
    setEditing(true)
  }

  return (
    <>
      <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Invoicing details
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            radius="full"
            onClick={() => openEdit()}
          >
            Edit
          </Button>
        </header>

        {location.invoicing.sameAsLocation ? (
          <p className="text-sm leading-5 text-muted-foreground">
            Using the same info as business location.{" "}
            <button
              type="button"
              onClick={() => openEdit("companyName")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Change
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
            <SettingsRow
              icon={Building2Icon}
              label="Company name"
              value={location.invoicing.companyName || null}
              onAdd={() => openEdit("companyName")}
            />
            <SettingsRow
              icon={MapPinIcon}
              label="Billing address"
              value={invoicingAddress}
              onAdd={() => openEdit("address")}
            />
            <SettingsRow
              icon={ReceiptIcon}
              label="VAT number"
              value={location.invoicing.vatNumber || null}
              onAdd={() => openEdit("vatNumber")}
            />
            <SettingsRow
              icon={BriefcaseIcon}
              label="Invoice note"
              value={location.invoicing.invoiceNote || null}
              onAdd={() => openEdit("invoiceNote")}
            />
          </div>
        )}
      </section>

      <InvoicingDetailsEditDialog
        location={location}
        open={editing}
        onOpenChange={(o) => {
          setEditing(o)
          if (!o) setFocusField(null)
        }}
        focusField={focusField}
      />
    </>
  )
}

function HoursTab() {
  const [editing, setEditing] = useState(false)
  return (
    <>
      <SummaryCard heading="Opening hours" onEdit={() => setEditing(true)}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
            <ClockIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm leading-5 text-muted-foreground">Hours</span>
              <p className="text-sm leading-5 text-foreground">
                When this location accepts bookings. Time zone Asia/Dubai.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {DAYS_FULL.map((day) => (
                <div key={day.id} className="flex gap-6 text-sm leading-5">
                  <span className="w-24 font-medium text-foreground">{day.label}</span>
                  <span className="text-foreground">9:00 AM – 9:00 PM</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SummaryCard>
      <HoursEditDialog open={editing} onOpenChange={setEditing} />
    </>
  )
}

function InvoicingTab({ location }: { location: Location }) {
  const [taxEditing, setTaxEditing] = useState(false)
  const [receiptEditing, setReceiptEditing] = useState(false)
  const [tippingEditing, setTippingEditing] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <InvoicingDetailsCard location={location} />
      <SummaryCard heading="Tax defaults" onEdit={() => setTaxEditing(true)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow label="Services" value="VAT (5%)" />
          <SummaryRow label="Products" value="VAT (5%)" />
        </div>
      </SummaryCard>
      <SummaryCard heading="Receipt sequencing" onEdit={() => setReceiptEditing(true)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow
            label="Receipt No. prefix"
            value={null}
            onAdd={() => setReceiptEditing(true)}
          />
          <SummaryRow label="Next receipt number" value="21857" />
        </div>
      </SummaryCard>
      <SummaryCard heading="Tipping" onEdit={() => setTippingEditing(true)}>
        <div className="flex flex-col gap-3">
          <SummaryRow label="Tipping options" value="All options enabled" />
          <SummaryRow label="Default values" value="10% · 18% · 25% · 35% · 45%" />
          <SummaryRow label="Tip calculation" value="All items included" />
        </div>
      </SummaryCard>

      <TaxDefaultsEditDialog location={location} open={taxEditing} onOpenChange={setTaxEditing} />
      <ReceiptSequencingEditDialog
        location={location}
        open={receiptEditing}
        onOpenChange={setReceiptEditing}
      />
      <TippingEditDialog open={tippingEditing} onOpenChange={setTippingEditing} />
    </div>
  )
}

function ManageTab({ location }: { location: Location }) {
  return (
    <div className="flex flex-col gap-4">
      {location.status === "live" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-cami-green-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2Icon className="size-5 shrink-0 text-cami-green-11" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-cami-green-11">Live</span>
              <span className="text-xs text-cami-green-11/80">
                Owner can sign in and accept bookings
              </span>
            </div>
          </div>
        </div>
      )}
      <section className="flex flex-col gap-1 pt-2">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Manage Location</h3>

        <ManageRow
          title="Suspend Location"
          description="Hides the public booking page for this location. Owner can re-enable any time. Bookings, services, and staff are preserved."
          action={
            <Button type="button" variant="outline" radius="full">
              Suspend location
            </Button>
          }
        />

        <ManageRow
          title="Delete Location"
          description="Soft-deletes the location. Data is preserved for 90 days, then permanently removed. The slug frees up after 90 days."
          action={
            <Button type="button" variant="destructive" radius="full">
              Delete location
            </Button>
          }
        />
      </section>
    </div>
  )
}

function ManageRow({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <div className="shrink-0 pt-0.5">{action}</div>
    </div>
  )
}

// ============================================================================
// Edit dialog (full-screen takeover)
// ============================================================================

function FullScreenEditDialog({
  open,
  onOpenChange,
  title,
  description,
  subtitle,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  subtitle?: string
  children: React.ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)

  useEffect(() => {
    if (!open) return
    setShowHeaderTitle(false)

    let cleanup: (() => void) | undefined
    const setup = () => {
      const el = scrollRef.current
      const titleEl = titleRef.current
      if (!el || !titleEl) {
        const id = window.requestAnimationFrame(setup)
        cleanup = () => window.cancelAnimationFrame(id)
        return
      }
      const update = () => {
        const titleRect = titleEl.getBoundingClientRect()
        const containerRect = el.getBoundingClientRect()
        setShowHeaderTitle(titleRect.bottom < containerRect.top)
      }
      update()
      el.addEventListener("scroll", update, { passive: true })
      cleanup = () => el.removeEventListener("scroll", update)
    }
    setup()

    return () => cleanup?.()
  }, [open])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenDialogClass}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        <header className="sticky top-0 z-10 border-border/40 border-b bg-background">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <span
              className={cn(
                "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
                showHeaderTitle ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!showHeaderTitle}
            >
              {title}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                radius="full"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="lg:hidden"
              >
                <XIcon className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                radius="full"
                onClick={() => onOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                Close
              </Button>
              <Button
                type="button"
                size="lg"
                radius="full"
                onClick={() => onOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                Save
              </Button>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h2
                ref={titleRef}
                className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="text-base leading-6 text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>

        <footer className="border-border/40 border-t bg-background px-4 py-3 lg:hidden">
          <Button
            type="button"
            size="lg"
            radius="full"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </footer>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

function useFocusOnOpen<T extends string>(
  open: boolean,
  focusField: T | null,
  fieldRefs: React.MutableRefObject<Partial<Record<T, HTMLInputElement | null>>>,
) {
  useEffect(() => {
    if (!open || !focusField) return
    const id = window.setTimeout(() => {
      const el = fieldRefs.current[focusField]
      if (el) {
        el.focus()
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 120)
    return () => window.clearTimeout(id)
  }, [open, focusField, fieldRefs])
}

function BasicInfoEditDialog({
  location,
  open,
  onOpenChange,
  focusField,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField: BasicInfoField | null
}) {
  const fieldRefs = useRef<Partial<Record<BasicInfoField, HTMLInputElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const setFieldRef = (field: BasicInfoField) => (el: HTMLInputElement | null) => {
    fieldRefs.current[field] = el
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit basic info"
      description="Edit this location's name and contact details."
    >
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Basic info
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Shown on receipts, booking confirmations, and the public booking page.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <Field label="Location name">
            <Input ref={setFieldRef("name")} defaultValue={location.name} />
          </Field>
          <Field label="Phone">
            <div className="flex gap-2">
              <Select defaultValue="+971">
                <SelectTrigger className={cn(triggerOverride, "w-28")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+971">🇦🇪 +971</SelectItem>
                  <SelectItem value="+966">🇸🇦 +966</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                </SelectContent>
              </Select>
              <Input
                ref={setFieldRef("phone")}
                defaultValue={location.phone.replace(/^\+\d+\s*/, "")}
                className="flex-1"
              />
            </div>
          </Field>
          <Field label="Email">
            <Input ref={setFieldRef("email")} type="email" defaultValue={location.email} />
          </Field>
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function BusinessTypeEditDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(location.businessType))

  useEffect(() => {
    if (open) setSelected(new Set(location.businessType))
  }, [open, location.businessType])

  const toggle = (id: string) => {
    setSelected((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit business type"
      description="Choose every service this location offers."
    >
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Business type
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Pick all that apply. We'll use this to suggest service templates and shape the public
            booking page.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BUSINESS_TYPE_OPTIONS.map(({ id, label, Icon }) => {
            const isSelected = selected.has(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
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
      </section>
    </FullScreenEditDialog>
  )
}

function AddressEditDialog({
  location,
  open,
  onOpenChange,
  focusField,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField: AddressField | null
}) {
  const fieldRefs = useRef<Partial<Record<AddressField, HTMLInputElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const setFieldRef = (field: AddressField) => (el: HTMLInputElement | null) => {
    fieldRefs.current[field] = el
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit address"
      description="Edit the business location address."
    >
      <section className="flex flex-col gap-5">
        <Field label="Where's your business located?">
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={setFieldRef("search")}
              defaultValue={
                location.location.address
                  ? `${location.location.address}, ${location.location.city}`
                  : ""
              }
              placeholder="Search address"
              className="h-12 rounded-2xl pl-10"
            />
          </div>
        </Field>

        <div className="flex h-44 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Map preview with pin at selected address
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Business location
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Address">
            <Input ref={setFieldRef("address")} defaultValue={location.location.address} />
          </Field>
          <Field label="Apt./Suite (optional)">
            <Input ref={setFieldRef("aptSuite")} defaultValue={location.location.aptSuite} />
          </Field>
          <Field label="District">
            <Input ref={setFieldRef("district")} defaultValue={location.location.district} />
          </Field>
          <Field label="City">
            <Input ref={setFieldRef("city")} defaultValue={location.location.city} />
          </Field>
          <Field label="State">
            <Input ref={setFieldRef("state")} defaultValue={location.location.state} />
          </Field>
          <Field label="Postcode">
            <Input ref={setFieldRef("postcode")} defaultValue={location.location.postcode} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Country">
              <Select defaultValue={location.location.country}>
                <SelectTrigger className={triggerOverride}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function InvoicingDetailsEditDialog({
  location,
  open,
  onOpenChange,
  focusField,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField: InvoicingField | null
}) {
  const fieldRefs = useRef<Partial<Record<InvoicingField, HTMLInputElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const [sameAsLocation, setSameAsLocation] = useState(location.invoicing.sameAsLocation)

  useEffect(() => {
    if (open) setSameAsLocation(location.invoicing.sameAsLocation)
  }, [open, location.invoicing.sameAsLocation])

  const setFieldRef = (field: InvoicingField) => (el: HTMLInputElement | null) => {
    fieldRefs.current[field] = el
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit invoicing details"
      description="Edit the legal entity and address shown on invoices and receipts."
    >
      <section className="flex flex-col gap-5">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox child is the control */}
        <label className="flex items-center gap-3">
          <Checkbox
            checked={sameAsLocation}
            onCheckedChange={(v) => setSameAsLocation(v === true)}
          />
          <span className="text-sm font-medium leading-5 text-foreground">
            Use the same info as the business location
          </span>
        </label>

        {(() => {
          const synced = sameAsLocation
          const values = synced
            ? {
                companyName: location.name,
                address: location.location.address,
                aptSuite: location.location.aptSuite,
                city: location.location.city,
                state: location.location.state,
                postcode: location.location.postcode,
              }
            : {
                companyName: location.invoicing.companyName,
                address: location.invoicing.address,
                aptSuite: location.invoicing.aptSuite,
                city: location.invoicing.city,
                state: location.invoicing.state,
                postcode: location.invoicing.postcode,
              }

          const disabledClass = "disabled:text-muted-foreground"
          return (
            <div key={synced ? "synced" : "custom"} className="flex flex-col gap-5">
              <Field label="Company name">
                <Input
                  ref={setFieldRef("companyName")}
                  defaultValue={values.companyName}
                  disabled={synced}
                  className={disabledClass}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Address">
                  <Input
                    ref={setFieldRef("address")}
                    defaultValue={values.address}
                    disabled={synced}
                    className={disabledClass}
                  />
                </Field>
                <Field label="Apt./Suite (optional)">
                  <Input
                    ref={setFieldRef("aptSuite")}
                    defaultValue={values.aptSuite}
                    disabled={synced}
                    className={disabledClass}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="City">
                    <Input
                      ref={setFieldRef("city")}
                      defaultValue={values.city}
                      disabled={synced}
                      className={disabledClass}
                    />
                  </Field>
                </div>
                <Field label="State">
                  <Input
                    ref={setFieldRef("state")}
                    defaultValue={values.state}
                    disabled={synced}
                    className={disabledClass}
                  />
                </Field>
                <Field label="Postcode">
                  <Input
                    ref={setFieldRef("postcode")}
                    defaultValue={values.postcode}
                    disabled={synced}
                    className={disabledClass}
                  />
                </Field>
              </div>
            </div>
          )
        })()}

        <Field label="VAT number (optional)">
          <Input ref={setFieldRef("vatNumber")} defaultValue={location.invoicing.vatNumber} />
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium leading-5 text-foreground">
            Invoice note (optional)
          </span>
          <Textarea
            defaultValue={location.invoicing.invoiceNote}
            placeholder="e.g. Thank you! Reschedule up to 24 hours before."
            rows={3}
          />
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

type DayDef = { id: string; short: string; label: string }
const DAYS_FULL: DayDef[] = [
  { id: "sun", short: "S", label: "Sunday" },
  { id: "mon", short: "M", label: "Monday" },
  { id: "tue", short: "T", label: "Tuesday" },
  { id: "wed", short: "W", label: "Wednesday" },
  { id: "thu", short: "T", label: "Thursday" },
  { id: "fri", short: "F", label: "Friday" },
  { id: "sat", short: "S", label: "Saturday" },
]

const HOUR_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const period = h < 12 ? "AM" : "PM"
      out.push(`${hour12}:${m === 0 ? "00" : "30"} ${period}`)
    }
  }
  return out
})()

const TIMEZONE_OPTIONS = [
  "Asia/Dubai",
  "Asia/Riyadh",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
]

function HoursEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Range = { open: string; close: string }
  const defaultRange: Range = { open: "9:00 AM", close: "6:00 PM" }
  const [days, setDays] = useState<Set<string>>(() => new Set(["mon", "tue", "wed", "thu", "fri"]))
  const [hours, setHours] = useState<Record<string, Range[]>>(() =>
    Object.fromEntries(DAYS_FULL.map((d) => [d.id, [{ ...defaultRange }]])),
  )

  const toggleDay = (id: string) => {
    setDays((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setHour = (id: string, i: number, key: "open" | "close", val: string) => {
    setHours((curr) => {
      const ranges = (curr[id] ?? [{ ...defaultRange }]).map((r, idx) =>
        idx === i ? { ...r, [key]: val } : r,
      )
      return { ...curr, [id]: ranges }
    })
  }

  const addRange = (id: string) => {
    setHours((curr) => ({
      ...curr,
      [id]: [...(curr[id] ?? []), { ...defaultRange }],
    }))
  }

  const removeRange = (id: string, i: number) => {
    setHours((curr) => ({
      ...curr,
      [id]: (curr[id] ?? []).filter((_, idx) => idx !== i),
    }))
  }

  const clearAll = () => setDays(new Set())

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit business hours"
      description="Set the days and hours this location is open."
    >
      <section className="flex flex-col gap-3">
        <span className="text-sm font-medium leading-5 text-foreground">Days</span>
        <div className="flex flex-wrap gap-2">
          {DAYS_FULL.map((day) => {
            const isSelected = days.has(day.id)
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                aria-pressed={isSelected}
                aria-label={day.label}
                className={cn(
                  "size-9 rounded-full text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-cami-violet-8 text-white"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
              >
                {day.short}
              </button>
            )
          })}
        </div>
      </section>

      {DAYS_FULL.some((d) => days.has(d.id)) && (
        <section className="flex flex-col gap-3">
          {DAYS_FULL.filter((d) => days.has(d.id)).map((day) => {
            const ranges = hours[day.id] ?? [{ ...defaultRange }]
            const isOnly = ranges.length === 1
            return (
              <div key={day.id} className="flex flex-col gap-2">
                {ranges.map((range, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: ordering is stable for mock
                    key={i}
                    className="grid grid-cols-[8rem_1fr_auto_1fr_2.5rem] items-center gap-3"
                  >
                    {i === 0 ? (
                      <span className="text-sm font-medium leading-5 text-foreground">
                        {day.label}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Select value={range.open} onValueChange={(v) => setHour(day.id, i, "open", v)}>
                      <SelectTrigger className={triggerOverride}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm leading-5 text-muted-foreground">to</span>
                    <Select
                      value={range.close}
                      onValueChange={(v) => setHour(day.id, i, "close", v)}
                    >
                      <SelectTrigger className={triggerOverride}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOnly ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        radius="full"
                        aria-label={`Add another range for ${day.label}`}
                        onClick={() => addRange(day.id)}
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        radius="full"
                        aria-label="Remove range"
                        onClick={() => removeRange(day.id, i)}
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <Field label="Time zone">
          <Select defaultValue="Asia/Dubai">
            <SelectTrigger className={triggerOverride}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </section>

      <button
        type="button"
        onClick={clearAll}
        className="self-start text-sm font-medium leading-5 text-foreground underline-offset-4 hover:underline"
      >
        Clear business hours
      </button>
    </FullScreenEditDialog>
  )
}

function TaxDefaultsEditDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit tax defaults"
      subtitle={`Change tax defaults for ${location.name}`}
      description="Change the default tax rates applied to services and products at this location."
    >
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Field label="Services">
            <Select defaultValue="vat-5">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vat-5">VAT (5%)</SelectItem>
                <SelectItem value="vat-0">VAT exempt (0%)</SelectItem>
                <SelectItem value="none">No tax</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">
            You can override this per service
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Field label="Products">
            <Select defaultValue="vat-5">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vat-5">VAT (5%)</SelectItem>
                <SelectItem value="vat-0">VAT exempt (0%)</SelectItem>
                <SelectItem value="none">No tax</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">
            You can override this per product
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-sand-3 px-4 py-3">
          <LightbulbIcon className="mt-0.5 size-4 shrink-0 fill-sand-9 text-sand-11" />
          <p className="text-sm leading-5 text-foreground">
            Once saved, changes will automatically apply to all products and services which are
            already assigned to default taxes
          </p>
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function ReceiptSequencingEditDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit receipt sequencing"
      subtitle={`Change receipt sequence for ${location.name}`}
      description="Set the prefix and the next receipt number for this location."
    >
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Receipt No. Prefix">
          <Input placeholder="" />
        </Field>
        <Field label="Next receipt number">
          <Input defaultValue="21889" inputMode="numeric" />
        </Field>
      </section>
    </FullScreenEditDialog>
  )
}

function TippingEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tipValues, setTipValues] = useState<number[]>([10, 18, 25, 35, 45])
  const removeTip = (i: number) => setTipValues((v) => v.filter((_, idx) => idx !== i))
  const [cartItems, setCartItems] = useState<Set<string>>(
    () => new Set(["services", "addons", "products", "memberships", "gift-cards"]),
  )
  const toggleCart = (id: string) =>
    setCartItems((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tip values and calculation"
      description="Configure tipping options, default tip values, and how tips are calculated."
    >
      <section className="flex flex-col gap-3">
        <Field label="Tipping">
          <Select defaultValue="workspace">
            <SelectTrigger className={triggerOverride}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspace defaults</SelectItem>
              <SelectItem value="custom">Custom for this location</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
          Tipping options
        </h3>
        <TippingToggleRow title="Display a tip option screen at the Point of Sale" defaultChecked />
        <TippingToggleRow
          title="Display tip options on card terminals and self checkout"
          defaultChecked
        />
        <TippingToggleRow
          title="Allow client to leave a tip online"
          subtitle="Options to leave a tip on the Cami app after completed appointments"
          defaultChecked
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Default tip values
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Clients will see these options while tipping in-store and online depending on your
            settings. They can always add their own custom amount.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium leading-5 text-foreground">Tip value</span>
          {tipValues.map((value, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: ordering is stable for mock
              key={i}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Input defaultValue={value} inputMode="decimal" className="pr-10" />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                aria-label="Remove tip value"
                onClick={() => removeTip(i)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Tip calculation
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Define which items to include in the base amount for tip calculations
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium leading-5 text-foreground">Cart items</span>
          <p className="text-xs leading-5 text-muted-foreground">
            The selected item types will be included in the base amount when calculating tips
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { id: "services", label: "Services" },
            { id: "addons", label: "Service add-ons" },
            { id: "products", label: "Products" },
            { id: "memberships", label: "Memberships" },
            { id: "gift-cards", label: "Gift cards" },
          ].map(({ id, label }) => (
            // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox child is the control
            <label key={id} className="flex items-center gap-3">
              <Checkbox checked={cartItems.has(id)} onCheckedChange={() => toggleCart(id)} />
              <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Field label="Service charges">
            <Select defaultValue="included">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included</SelectItem>
                <SelectItem value="excluded">Excluded</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">
            Service charges will be included in the base amount when calculating tips
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Field label="Discounts">
            <Select defaultValue="included">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included</SelectItem>
                <SelectItem value="excluded">Excluded</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">
            Discounts will be included in the base amount when calculating tips
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Field label="Taxes">
            <Select defaultValue="included">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included</SelectItem>
                <SelectItem value="excluded">Excluded</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs leading-5 text-muted-foreground">
            Taxes will be included in the base amount when calculating tips
          </p>
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function TippingToggleRow({
  title,
  subtitle,
  defaultChecked,
}: {
  title: string
  subtitle?: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium leading-5 text-foreground">{title}</span>
        {subtitle ? (
          <span className="text-xs leading-5 text-muted-foreground">{subtitle}</span>
        ) : null}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is passed via children; static analysis can't see through
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      {children}
    </label>
  )
}

// ============================================================================
// Read-mode helpers
// ============================================================================

function SummaryCard({
  heading,
  onEdit,
  children,
}: {
  heading: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-[36.5rem]">
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">{heading}</h3>
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onEdit}>
          Edit
        </Button>
      </header>
      {children}
    </section>
  )
}

function SummaryRow({
  label,
  value,
  onAdd,
}: {
  label: string
  value: string | null
  onAdd?: () => void
}) {
  if (!value) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex h-10 items-center gap-2 self-start rounded-xl bg-muted/40 px-3 text-muted-foreground transition-colors hover:bg-muted/60"
      >
        <PlusIcon className="size-4 shrink-0" />
        <span className="truncate text-sm leading-5">Add {label}</span>
      </button>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm leading-5 text-muted-foreground">{label}</span>
      <span className="text-sm font-medium leading-5 text-foreground">{value}</span>
    </div>
  )
}
