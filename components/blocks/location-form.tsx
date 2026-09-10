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
  CirclePlusIcon,
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
import { Fragment, useEffect, useRef, useState } from "react"
import { FullScreenEditDialog as SharedFullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
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
import { REASON_CODES } from "@/lib/admin-businesses"
import {
  CLOSED_DAY,
  formatDayHours,
  fromPickerTime,
  toPickerTime,
  WEEK_DAYS,
  type WeekSchedule,
} from "@/lib/locations/hours"
import { type NewLocationInput, slugify, useLocations } from "@/lib/locations/store"
import {
  BUSINESS_TAX_IDENTITY,
  formatReceiptNumber,
  LOCATION_TAX_OVERRIDES,
  resolveTaxIdentity,
  taxOverrideCount,
} from "@/lib/locations/tax-identity"
import type { Invoicing, Location, LocationAddress } from "@/lib/locations/types"
import { isPubliclyBookable } from "@/lib/locations/types"
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
 * top of the detail provides back navigation.
 *
 * Every tab here writes through `updateLocation`, so a branch's profile, hours
 * and lifecycle all survive a reload the same way. That uniformity is the
 * point: a reviewer who finds Hours persisting and Address not concludes the
 * feature is broken, and they are not wrong to. Three dialogs are still
 * unwired and listed as a gap in docs/specs: tax defaults, receipt sequencing
 * and tipping. Those are not plain per-branch fields — they resolve from a
 * business default with a per-field override (R23), so saving one means
 * building that inheritance, which is SCR-12's own slice.
 */
export function LocationForm() {
  // The estate, not the seed: suspending a branch here has to be the same
  // branch the topbar switcher and the terminals panel are looking at.
  const { locations } = useLocations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const selected = locations.find((l) => l.id === selectedId) ?? null

  if (selected) {
    return <LocationDetailView location={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Locations
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Where you operate. Click a location to manage its details.
          </p>
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="self-start"
            onClick={() => setAddOpen(true)}
          >
            <CirclePlusIcon className="size-4" />
            Add locations
          </Button>
        </header>
      }
    >
      <div className="flex flex-col gap-3">
        {locations.map((loc) => (
          <LocationListCard key={loc.id} location={loc} onOpen={() => setSelectedId(loc.id)} />
        ))}
      </div>
      <AddLocationsTakeover open={addOpen} onOpenChange={setAddOpen} />
    </SettingsPanel>
  )
}

/**
 * SCR-02 · Chain setup (R02, SU1.2, SU1.3).
 *
 * The gate this screen exists for is BG-03: adding branch N costs zero
 * operator migration steps. So it asks for the three things that genuinely
 * differ per branch and inherits everything else from the business — tax
 * identity, invoicing and country are a business default with a per-field
 * override (R23), not a form to fill in nine times.
 *
 * All or none, deliberately. "Submitting several branches at once with one bad
 * entry creates none of them, I fix it and retry" (SU1.2). A partial create is
 * worse than a rejection here: the owner cannot tell which of the nine landed,
 * and retrying duplicates the ones that did.
 *
 * Branches land as `draft`, not `live`. Created is not trading — hours and
 * staff still have to be set before a branch can take a booking.
 */
export function AddLocationsTakeover({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addLocations, takenSlugs } = useLocations()
  const [rows, setRows] = useState<NewLocationInput[]>([
    { name: "", city: "Dubai", timezone: "Asia/Dubai" },
  ])
  const [errors, setErrors] = useState<Record<number, string>>({})

  function update(index: number, patch: Partial<NewLocationInput>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
    // Clear this row's error as soon as it is edited, so the form stops
    // shouting about something the owner is already fixing.
    setErrors((prev) => {
      if (!prev[index]) return prev
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  function validate(): Record<number, string> {
    const found: Record<number, string> = {}
    const seen = new Map<string, number>()
    rows.forEach((row, i) => {
      const name = row.name.trim()
      if (!name) {
        found[i] = "Give this location a name"
        return
      }
      if (!row.city.trim()) {
        found[i] = "Give this location a city"
        return
      }
      const slug = slugify(name)
      if (!slug) {
        found[i] = "That name has no letters or numbers to make a link from"
        return
      }
      if (takenSlugs.includes(slug)) {
        found[i] = `cami.app/${slug} is already taken by another location`
        return
      }
      // Two rows in the same batch resolving to one link is the collision the
      // owner cannot see coming, so it is named on the second row rather than
      // silently overwriting the first.
      const earlier = seen.get(slug)
      if (earlier !== undefined) {
        found[i] = `Same link as row ${earlier + 1} (cami.app/${slug})`
        return
      }
      seen.set(slug, i)
    })
    return found
  }

  function save() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    addLocations(rows)
    setRows([{ name: "", city: "Dubai", timezone: "Asia/Dubai" }])
    setErrors({})
    onOpenChange(false)
  }

  const errorCount = Object.keys(errors).length

  return (
    <SharedFullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add locations"
      subtitle="Add one location, or several in one pass. Everything else — tax details, invoicing, country — is inherited from the business, and each location can override it later."
      onSave={save}
      saveLabel={rows.length > 1 ? `Create ${rows.length} locations` : "Create location"}
    >
      {/* The settings form idiom, copied from sales-settings.tsx (Gift card
          settings, Payment policy): section heading + description, fields
          constrained to max-w-md rather than filling the column, an `hr`
          between sections, and a circled-plus pill for the add action. A
          bordered card per row was wrong twice — cards are for the read-mode
          summaries this form is the counterpart to, and full-width inputs are
          not what any other settings form does. */}
      {rows.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and have no id until created
        <Fragment key={i}>
          {i > 0 ? <hr className="border-border/40" /> : null}
          <section className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
                  {rows.length > 1 ? `Location ${i + 1}` : "New location"}
                </h3>
                <p className="text-sm leading-5 text-muted-foreground">
                  Shown on receipts, booking confirmations, and the public booking page.
                </p>
              </div>
              {rows.length > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  radius="full"
                  onClick={() => {
                    setRows((prev) => prev.filter((_, j) => j !== i))
                    setErrors({})
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="flex w-full max-w-md flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Field label="Location name">
                  <Input
                    value={row.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder="Shampooch Marina"
                    aria-invalid={Boolean(errors[i])}
                  />
                </Field>
                {/* Helper under the field, the way Payment policy explains a
                    deposit percentage — the link is a consequence of the name,
                    so it belongs next to it rather than in the heading. */}
                <p className="text-sm leading-5 text-muted-foreground">
                  {row.name.trim()
                    ? `Its booking page will be cami.app/${slugify(row.name)}`
                    : "Its booking page link is made from this name."}
                </p>
              </div>

              <Field label="City">
                <Input
                  value={row.city}
                  onChange={(e) => update(i, { city: e.target.value })}
                  placeholder="Dubai"
                  aria-invalid={Boolean(errors[i])}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Field label="Timezone">
                  <Select value={row.timezone} onValueChange={(v) => update(i, { timezone: v })}>
                    <SelectTrigger className={cn(triggerOverride, "w-full")}>
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
                <p className="text-sm leading-5 text-muted-foreground">
                  Appointments and reports at this location bucket by its own day.
                </p>
              </div>

              {errors[i] ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors[i]}
                </p>
              ) : null}
            </div>
          </section>
        </Fragment>
      ))}

      <hr className="border-border/40" />

      <section className="flex flex-col gap-5">
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="gap-1.5"
            onClick={() =>
              setRows((prev) => [...prev, { name: "", city: "Dubai", timezone: "Asia/Dubai" }])
            }
          >
            <CirclePlusIcon className="size-4" />
            Add another location
          </Button>
        </div>
        {errorCount > 0 ? (
          <p
            role="alert"
            className="w-full max-w-md rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground"
          >
            {errorCount === 1 ? "One location needs" : `${errorCount} locations need`} fixing.
            Nothing has been created — fix the fields above and try again.
          </p>
        ) : null}
      </section>
    </SharedFullScreenEditDialog>
  )
}

function LocationListCard({ location, onOpen }: { location: Location; onOpen: () => void }) {
  const { setStatus } = useLocations()
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
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-heading text-base font-semibold text-foreground">
              {location.name}
            </span>
            <LocationStatusBadge status={location.status} />
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
          {location.status === "suspended" ? (
            <DropdownMenuItem onSelect={() => setStatus(location.id, "live")}>
              Unsuspend location
            </DropdownMenuItem>
          ) : location.status === "live" ? (
            <DropdownMenuItem onSelect={() => setStatus(location.id, "suspended")}>
              Suspend location
            </DropdownMenuItem>
          ) : null}
          {/* Suspended and archived branches have no public page to open
              (SU1.5, R12), so the row goes rather than 404ing the operator. */}
          {isPubliclyBookable(location.status) ? (
            <DropdownMenuItem asChild>
              <a href={`/${location.slug}`} target="_blank" rel="noopener noreferrer">
                See public booking page
                <ArrowUpRightIcon className="ml-auto size-3.5 text-muted-foreground" />
              </a>
            </DropdownMenuItem>
          ) : null}
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
    <SettingsPanel
      className="animate-in duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] slide-in-from-right-12"
      header={
        <>
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
                <img
                  src={location.photoUrl}
                  alt={location.name}
                  className="size-full object-cover"
                />
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
        </>
      }
    >
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
          <HoursTab location={location} />
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
    </SettingsPanel>
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

/**
 * SCR-01 · A branch's own opening hours and timezone (R01, R19).
 *
 * Reads the branch, not the business. This card used to print the same
 * "9:00 AM – 9:00 PM" for every location, which quietly contradicted the whole
 * premise: if all three branches show one week, per-branch hours do not exist.
 * Closed days say Closed rather than being dropped, and a day with two shifts
 * prints both — a branch that shuts over lunch is a real week, not a bad row.
 */
function HoursTab({ location }: { location: Location }) {
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
                When this location accepts bookings. Time zone {location.timezone}.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {WEEK_DAYS.map((day) => {
                const schedule = location.hours[day.id]
                return (
                  <div key={day.id} className="flex gap-6 text-sm leading-5">
                    <span className="w-24 font-medium text-foreground">{day.long}</span>
                    <span className={schedule.closed ? "text-muted-foreground" : "text-foreground"}>
                      {formatDayHours(schedule)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SummaryCard>
      <HoursEditDialog location={location} open={editing} onOpenChange={setEditing} />
    </>
  )
}

/**
 * SCR-12 · A branch's tax identity (R23, R25, INV-12).
 *
 * Every inheritable row says whose value it is, because "business default with
 * a per-field override" is invisible otherwise — two branches showing
 * "Shampooch Trading LLC" look identical whether one of them means it or is
 * merely following along, and the difference decides what happens when the
 * business default changes.
 *
 * The forward-only warning is the load-bearing copy on this screen. Editing
 * here changes every **future** receipt and no issued one: the resolved values
 * are copied onto the receipt at sale completion and are permanent from then
 * (INV-12). An operator who expects a correction to fix last month's invoices
 * is going to be wrong in a way that matters at filing.
 */
function InvoicingTab({ location }: { location: Location }) {
  const [taxEditing, setTaxEditing] = useState(false)
  const [receiptEditing, setReceiptEditing] = useState(false)
  const [tippingEditing, setTippingEditing] = useState(false)

  const overrides = LOCATION_TAX_OVERRIDES[location.id]
  const { value: tax, source } = resolveTaxIdentity(BUSINESS_TAX_IDENTITY, overrides)
  const ownFields = taxOverrideCount(overrides)

  return (
    <div className="flex flex-col gap-4">
      <InvoicingDetailsCard location={location} />

      <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
        {ownFields === 0
          ? "This location follows the business tax identity on every field."
          : ownFields === 1
            ? "This location holds its own value for 1 field. The rest follow the business."
            : `This location holds its own values for ${ownFields} fields. The rest follow the business.`}{" "}
        Changes here apply to future receipts only — an issued receipt keeps the details it was
        printed with.
      </p>

      <SummaryCard heading="Tax identity" onEdit={() => setTaxEditing(true)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow
            label="Legal / invoice name"
            value={tax.legalName}
            source={source.legalName}
          />
          <SummaryRow label="Tax registration number" value={tax.trn} source={source.trn} />
          <SummaryRow
            label="Invoice address"
            value={tax.invoiceAddress}
            source={source.invoiceAddress}
          />
        </div>
      </SummaryCard>

      <SummaryCard heading="Tax defaults" onEdit={() => setTaxEditing(true)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow
            label="Services"
            value={tax.servicesVatRate}
            source={source.servicesVatRate}
          />
          <SummaryRow
            label="Products"
            value={tax.productsVatRate}
            source={source.productsVatRate}
          />
        </div>
      </SummaryCard>
      <SummaryCard heading="Receipt sequencing" onEdit={() => setReceiptEditing(true)}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow
            label="Receipt No. prefix"
            value={tax.receiptPrefix}
            source={source.receiptPrefix}
          />
          {/* Shown as it will print, prefix included: the prefix is the whole
              point of a per-branch sequence, and "21857" alone does not show
              that two branches cannot collide. */}
          <SummaryRow
            label="Next receipt number"
            value={formatReceiptNumber(tax.receiptPrefix, 21857)}
          />
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

/**
 * The lifecycle half of SCR-01 (R01, R12, SU1.4, SU1.5).
 *
 * Copy, states and disabled rules are the shipped ones — this mirrors
 * `LocationsPanel.tsx` in cami-business, which already ships suspend,
 * unsuspend and delete against `useChangeVenueState()`. It was wired to
 * nothing here, which is the only thing that changed.
 *
 * Two rules that are easy to miss and are the shipped behaviour:
 *
 * - Suspend and delete are **mutually exclusive moves**. A suspended location
 *   has to be unsuspended before it can be deleted, and an archived one accepts
 *   neither. That is why each button has its own disabled condition rather than
 *   one shared guard.
 * - Every move takes a **reason code and an optional internal note**, composed
 *   into one reason string. The state endpoint expects it, and INV-08 wants the
 *   change attributable. Unsuspend narrows the picker to owner request and
 *   other, because coming back is almost always the owner's own call.
 *
 * ⚠️ The delete copy says data is "permanently removed" after 90 days. That is
 * the shipped wording and the shipped behaviour, and it contradicts **R12**,
 * which says an archived location is never deleted and its history, receipts,
 * reports and issued stored value stay readable. Only the slug is meant to free
 * up. Not changed here — the conflict is between the built product and the
 * requirement, and it belongs to Michelle rather than to this file.
 *
 * Also deliberately not invented: what happens to a branch's future
 * appointments and unsettled sales on delete. Undecided (PRD §16, PRO-557).
 */
function ManageTab({ location }: { location: Location }) {
  const { setStatus } = useLocations()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [unsuspendOpen, setUnsuspendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isSuspended = location.status === "suspended"
  const isArchived = location.status === "archived"

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
          title={isSuspended ? "Unsuspend Location" : "Suspend Location"}
          description={
            isSuspended
              ? "This location is currently suspended — its public booking page is hidden. Unsuspending makes it bookable again."
              : "Hides the public booking page for this location. Owner can re-enable any time. Bookings, services, and staff are preserved."
          }
          action={
            <Button
              type="button"
              variant="outline"
              radius="full"
              disabled={isArchived}
              onClick={() => (isSuspended ? setUnsuspendOpen(true) : setSuspendOpen(true))}
            >
              {isSuspended ? "Unsuspend location" : "Suspend location"}
            </Button>
          }
        />

        <ManageRow
          title="Delete Location"
          description={
            isArchived
              ? "This location has already been deleted. Data is preserved for 90 days, then permanently removed."
              : isSuspended
                ? "Unsuspend this location before deleting it. A suspended location can't be moved straight to archive."
                : "Soft-deletes the location. Data is preserved for 90 days, then permanently removed. The slug frees up after 90 days."
          }
          action={
            <Button
              type="button"
              variant="destructive"
              radius="full"
              disabled={isArchived || isSuspended}
              onClick={() => setDeleteOpen(true)}
            >
              Delete location
            </Button>
          }
        />
      </section>

      <LocationStateDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={`Suspend ${location.name}?`}
        description="Hides the public booking page and disables the calendar. Bookings, services, and staff are preserved. You can unsuspend at any time."
        confirmLabel="Suspend location"
        reasons={REASON_CODES}
        onConfirm={() => setStatus(location.id, "suspended")}
      />
      <LocationStateDialog
        open={unsuspendOpen}
        onOpenChange={setUnsuspendOpen}
        title={`Unsuspend ${location.name}?`}
        description="Brings the public booking page back online. Bookings, services, and staff are preserved."
        confirmLabel="Unsuspend location"
        destructive={false}
        reasons={UNSUSPEND_REASONS}
        onConfirm={() => setStatus(location.id, "live")}
      />
      <LocationStateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${location.name}?`}
        description="Soft-deletes the location. Data is preserved for 90 days, then permanently removed. The slug is freed up after 90 days."
        confirmLabel="Delete location"
        reasons={REASON_CODES}
        onConfirm={() => setStatus(location.id, "archived")}
      />
    </div>
  )
}

/**
 * Coming back from a suspension is almost always the owner's own call, so the
 * picker narrows rather than offering fraud or business-closed as a reason to
 * reopen. Matches the shipped panel.
 */
const UNSUSPEND_REASONS = REASON_CODES.filter((r) => r.id === "owner_request" || r.id === "other")

/**
 * One dialog for all three lifecycle moves. They differ only in copy, which
 * reason codes they offer, and where they land — so three near-identical
 * components would be three places for the reason field to drift.
 *
 * The reason is required: an unattributable state change is the thing INV-08
 * exists to prevent, and the shipped dialogs enforce it through their schema.
 */
function LocationStateDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  reasons,
  destructive = true,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  reasons: readonly { id: string; label: string }[]
  destructive?: boolean
  onConfirm: (reason: string, note: string) => void
}) {
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!open) {
      setReason("")
      setNote("")
      setShowError(false)
    }
  }, [open])

  function confirm() {
    if (!reason) {
      setShowError(true)
      return
    }
    onConfirm(reason, note)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex flex-col gap-4 pt-4">
          <Field label="Reason">
            <Select
              value={reason}
              onValueChange={(v) => {
                setReason(v)
                setShowError(false)
              }}
            >
              <SelectTrigger className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="Pick a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {showError ? (
            <p role="alert" className="text-sm text-destructive">
              Pick a reason before continuing.
            </p>
          ) : null}
          <Field label="Internal note (optional)">
            <Textarea
              placeholder="Anything ops should know"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              radius="full"
              onClick={confirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  onSave,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  subtitle?: string
  /**
   * What Save commits. Absent for the tabs that are still mock-only, where
   * Save closes and changes nothing — leaving those alone rather than pretending
   * they persist, which would be the worse lie of the two.
   */
  onSave?: () => void
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
                onClick={() => (onSave ? onSave() : onOpenChange(false))}
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

/** Every control these dialogs read on save. The invoice note is a textarea. */
type FieldElement = HTMLInputElement | HTMLTextAreaElement

/** What a ref holds, or the branch's current value when the field never rendered. */
function readField(el: FieldElement | null | undefined, fallback: string): string {
  return el ? el.value.trim() : fallback
}

function useFocusOnOpen<T extends string>(
  open: boolean,
  focusField: T | null,
  fieldRefs: React.MutableRefObject<Partial<Record<T, FieldElement | null>>>,
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
  const fieldRefs = useRef<Partial<Record<BasicInfoField, FieldElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const setFieldRef = (field: BasicInfoField) => (el: FieldElement | null) => {
    fieldRefs.current[field] = el
  }
  const { updateLocation } = useLocations()
  const [dialCode, setDialCode] = useState(() => dialCodeOf(location.phone))

  useEffect(() => {
    if (open) setDialCode(dialCodeOf(location.phone))
  }, [open, location.phone])

  /**
   * The slug is deliberately not renamed with the branch. It is the branch's
   * public URL and the id every operational record carries; renaming "Shampooch
   * JVC" to "Shampooch JVC (Main)" must not break a link a client already has
   * or orphan a booking. Changing a slug is its own decision, with a redirect.
   */
  const save = () => {
    const local = readField(fieldRefs.current.phone, location.phone)
    updateLocation(location.id, {
      name: readField(fieldRefs.current.name, location.name) || location.name,
      phone: local ? `${dialCode} ${local}` : "",
      email: readField(fieldRefs.current.email, location.email),
    })
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit basic info"
      subtitle={`Change the contact details for ${location.name}`}
      description="Edit this location's name and contact details."
      onSave={save}
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
            <Input key={location.id} ref={setFieldRef("name")} defaultValue={location.name} />
          </Field>
          <Field label="Phone">
            <div className="flex gap-2">
              <Select value={dialCode} onValueChange={setDialCode}>
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
  const { updateLocation } = useLocations()
  const [selected, setSelected] = useState<Set<string>>(() => new Set(location.businessType))

  useEffect(() => {
    if (open) setSelected(new Set(location.businessType))
  }, [open, location.businessType])

  // Ordered by the option list, not by the order they were clicked, so two
  // branches offering the same things read the same on the public page.
  const save = () => {
    updateLocation(location.id, {
      businessType: BUSINESS_TYPE_OPTIONS.filter((o) => selected.has(o.id)).map((o) => o.id),
    })
    onOpenChange(false)
  }

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
      subtitle={`Change what ${location.name} offers`}
      description="Choose every service this location offers."
      onSave={save}
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
  const fieldRefs = useRef<Partial<Record<AddressField, FieldElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const setFieldRef = (field: AddressField) => (el: FieldElement | null) => {
    fieldRefs.current[field] = el
  }
  const { updateLocation } = useLocations()
  const [country, setCountry] = useState(location.location.country)

  useEffect(() => {
    if (open) setCountry(location.location.country)
  }, [open, location.location.country])

  /**
   * The map pin is not derived from the typed address here — geocoding is a real
   * service, and a pin quietly moved to the wrong side of a road is worse than a
   * pin left where the operator put it. It stays as it was.
   */
  const save = () => {
    const current = location.location
    updateLocation(location.id, {
      location: {
        address: readField(fieldRefs.current.address, current.address),
        aptSuite: readField(fieldRefs.current.aptSuite, current.aptSuite),
        district: readField(fieldRefs.current.district, current.district),
        city: readField(fieldRefs.current.city, current.city),
        state: readField(fieldRefs.current.state, current.state),
        postcode: readField(fieldRefs.current.postcode, current.postcode),
        country,
      },
    })
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit address"
      subtitle={`Change where ${location.name} is`}
      description="Edit the business location address."
      onSave={save}
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
              <Select value={country} onValueChange={setCountry}>
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
  const fieldRefs = useRef<Partial<Record<InvoicingField, FieldElement | null>>>({})
  useFocusOnOpen(open, focusField, fieldRefs)
  const { updateLocation } = useLocations()
  const [sameAsLocation, setSameAsLocation] = useState(location.invoicing.sameAsLocation)

  useEffect(() => {
    if (open) setSameAsLocation(location.invoicing.sameAsLocation)
  }, [open, location.invoicing.sameAsLocation])

  const setFieldRef = (field: InvoicingField) => (el: FieldElement | null) => {
    fieldRefs.current[field] = el
  }

  /**
   * With "same as location" ticked the entity fields are disabled and mirror the
   * address, so what is stored is the tick — not a copy of today's address. A
   * copy would silently stop following when the address changed, which is the
   * one thing ticking it was meant to promise.
   */
  const save = () => {
    const current = location.invoicing
    updateLocation(location.id, {
      invoicing: {
        sameAsLocation,
        companyName: sameAsLocation
          ? current.companyName
          : readField(fieldRefs.current.companyName, current.companyName),
        address: sameAsLocation
          ? current.address
          : readField(fieldRefs.current.address, current.address),
        aptSuite: sameAsLocation
          ? current.aptSuite
          : readField(fieldRefs.current.aptSuite, current.aptSuite),
        city: sameAsLocation ? current.city : readField(fieldRefs.current.city, current.city),
        state: sameAsLocation ? current.state : readField(fieldRefs.current.state, current.state),
        postcode: sameAsLocation
          ? current.postcode
          : readField(fieldRefs.current.postcode, current.postcode),
        vatNumber: readField(fieldRefs.current.vatNumber, current.vatNumber),
        invoiceNote: readField(fieldRefs.current.invoiceNote, current.invoiceNote),
      },
    })
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit invoicing details"
      subtitle={`Change the invoicing entity for ${location.name}`}
      description="Edit the legal entity and address shown on invoices and receipts."
      onSave={save}
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
            ref={setFieldRef("invoiceNote")}
            defaultValue={location.invoicing.invoiceNote}
            placeholder="e.g. Thank you! Reschedule up to 24 hours before."
            rows={3}
          />
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

/**
 * Split a stored phone into its dial code, so reopening the form shows the code
 * the branch is actually on rather than resetting every branch to +971.
 *
 * Four codes is not a phone input — `cami-business` ships a searchable
 * 199-country picker, and four hardcoded lists of these exist in this repo. That
 * is its own inconsistency to fix, not this slice's.
 */
const DIAL_CODES = ["+971", "+966", "+44", "+1"]

function dialCodeOf(phone: string): string {
  return DIAL_CODES.find((code) => phone.startsWith(code)) ?? DIAL_CODES[0]
}

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

/** Enough zones to show a chain spanning more than one (R19), not a full IANA list. */
const TIMEZONE_OPTIONS = [
  "Asia/Dubai",
  "Asia/Riyadh",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
]

/** What the time pickers hold while an edit is open: 12-hour labels, per day. */
type PickerRange = { open: string; close: string }
type PickerWeek = Record<string, PickerRange[]>

const DEFAULT_PICKER_RANGE: PickerRange = { open: "9:00 AM", close: "6:00 PM" }

function openDaysOf(location: Location): Set<string> {
  return new Set(WEEK_DAYS.filter((d) => !location.hours[d.id].closed).map((d) => d.id))
}

/**
 * A closed day still gets a default range behind the scenes, so ticking it back
 * on offers a sensible week rather than an empty row to fill in.
 */
function pickerWeekOf(location: Location): PickerWeek {
  return Object.fromEntries(
    WEEK_DAYS.map((d) => {
      const schedule = location.hours[d.id]
      return [
        d.id,
        schedule.closed
          ? [{ ...DEFAULT_PICKER_RANGE }]
          : schedule.ranges.map((r) => ({
              open: toPickerTime(r.open),
              close: toPickerTime(r.close),
            })),
      ]
    }),
  )
}

/**
 * A day the owner unticked becomes closed, not an empty range list — closed is
 * a state the client-facing surfaces render ("Closed"), whereas a day with no
 * ranges would read as open with nothing in it.
 */
function weekScheduleOf(days: Set<string>, hours: PickerWeek): WeekSchedule {
  return Object.fromEntries(
    WEEK_DAYS.map((d) => {
      if (!days.has(d.id)) return [d.id, CLOSED_DAY]
      const ranges = (hours[d.id] ?? [{ ...DEFAULT_PICKER_RANGE }]).map((r) => ({
        open: fromPickerTime(r.open),
        close: fromPickerTime(r.close),
      }))
      return [d.id, ranges.length > 0 ? { closed: false, ranges } : CLOSED_DAY]
    }),
  ) as WeekSchedule
}

function HoursEditDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { setHours: saveHours } = useLocations()

  // Opens on what this branch actually keeps. Re-seeded on `open` so a
  // cancelled edit is discarded rather than lingering into the next one, and
  // so switching branches never shows the previous branch's week.
  const [days, setDays] = useState<Set<string>>(() => openDaysOf(location))
  const [hours, setHours] = useState<PickerWeek>(() => pickerWeekOf(location))
  const [timezone, setTimezone] = useState(location.timezone)

  useEffect(() => {
    if (!open) return
    setDays(openDaysOf(location))
    setHours(pickerWeekOf(location))
    setTimezone(location.timezone)
  }, [open, location])

  const save = () => {
    saveHours(location.id, weekScheduleOf(days, hours), timezone)
    onOpenChange(false)
  }

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
      const ranges = (curr[id] ?? [{ ...DEFAULT_PICKER_RANGE }]).map((r, idx) =>
        idx === i ? { ...r, [key]: val } : r,
      )
      return { ...curr, [id]: ranges }
    })
  }

  const addRange = (id: string) => {
    setHours((curr) => ({
      ...curr,
      [id]: [...(curr[id] ?? []), { ...DEFAULT_PICKER_RANGE }],
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
      subtitle={`Change opening hours for ${location.name}`}
      description="Set the days and hours this location is open."
      onSave={save}
    >
      <section className="flex flex-col gap-3">
        <span className="text-sm font-medium leading-5 text-foreground">Days</span>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const isSelected = days.has(day.id)
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                aria-pressed={isSelected}
                aria-label={day.long}
                className={cn(
                  "size-9 rounded-full text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-cami-violet-8 text-white"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
              >
                {day.long.slice(0, 1)}
              </button>
            )
          })}
        </div>
      </section>

      {WEEK_DAYS.some((d) => days.has(d.id)) && (
        <section className="flex flex-col gap-3">
          {WEEK_DAYS.filter((d) => days.has(d.id)).map((day) => {
            const ranges = hours[day.id] ?? [{ ...DEFAULT_PICKER_RANGE }]
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
                        {day.long}
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
                        aria-label={`Add another range for ${day.long}`}
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
          <Select value={timezone} onValueChange={setTimezone}>
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
  source,
}: {
  label: string
  value: string | null
  onAdd?: () => void
  /**
   * Where the value came from (R06, R23). Omitted on rows that are not
   * inheritable, so an ordinary field is not decorated with a concept it does
   * not have.
   */
  source?: "business" | "location"
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
      {source ? (
        <span
          className={cn(
            "text-xs leading-4",
            source === "location" ? "font-medium text-cami-violet-11" : "text-muted-foreground",
          )}
        >
          {source === "location" ? "Set for this location" : "Inherited from the business"}
        </span>
      ) : null}
    </div>
  )
}
