"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowUpIcon,
  BuildingIcon,
  CircleUserIcon,
  type LucideIcon,
  MapPinIcon,
  PhoneIcon,
  ScissorsIcon,
  SettingsIcon,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { LocationMultiSelect } from "@/components/blocks/location-multi-select"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocations } from "@/lib/locations/store"
import { seedServices } from "@/lib/service-catalog/mock-data"
import { MERCHANT_ROLES, roleById } from "@/lib/team/roles"
import { cn } from "@/lib/utils"

// Match Input's h-12 / rounded-2xl / bg-input. Same pattern used by
// business-profile-form.tsx and location-form.tsx so Select triggers don't
// look shorter than adjacent inputs.
const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const sectionGroups = [
  {
    label: "Personal",
    items: [
      { id: "profile", label: "Profile", icon: CircleUserIcon },
      { id: "addresses", label: "Addresses", icon: MapPinIcon },
      { id: "emergency", label: "Emergency contacts", icon: PhoneIcon },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "services", label: "Services", icon: ScissorsIcon, count: "12" },
      { id: "locations", label: "Locations", icon: BuildingIcon },
      { id: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
] as const

type SectionId = (typeof sectionGroups)[number]["items"][number]["id"]

const calendarColors = [
  { id: "indigo", className: "bg-cami-violet-9" },
  { id: "violet", className: "bg-cami-violet-8" },
  { id: "purple", className: "bg-cami-violet-7" },
  { id: "pink", className: "bg-cami-pink-9" },
  { id: "rose", className: "bg-cami-pink-7" },
  { id: "amber", className: "bg-cami-yellow-9" },
  { id: "yellow", className: "bg-cami-yellow-7" },
  { id: "lime", className: "bg-cami-green-7" },
  { id: "green", className: "bg-cami-green-9" },
] as const

const countries = ["United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "United Kingdom"]

const phoneCodes = ["+971", "+966", "+965", "+974", "+44", "+1"]

const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phoneCode: z.string(),
  phone: z.string().trim().optional(),
  country: z.string().optional(),
  birthDay: z.string().optional(),
  birthMonth: z.string().optional(),
  birthYear: z.string().optional(),
  calendarColor: z.string(),
  jobTitle: z.string().trim().optional(),
  allowBookings: z.boolean(),
  services: z.array(z.string()),
  /** What they may do (R04). Defined once per role, in lib/team/roles.ts. */
  roleId: z.string(),
  /**
   * Where they may do it (R04). The backend calls these venues
   * (`assignedVenueIds`); "location" is the operator-facing word, per the
   * blueprint's terminology mapping.
   */
  assignedLocationIds: z.array(z.string()),
})

export type AddTeamMemberValues = z.infer<typeof formSchema>

const defaultValues: AddTeamMemberValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCode: "+971",
  phone: "",
  country: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  calendarColor: "indigo",
  jobTitle: "",
  allowBookings: true,
  services: [],
  // Not the owner: there is exactly one, and inviting a second by default is
  // the wrong shape. Staff is the narrowest useful starting point.
  roleId: "staff",
  // Nothing granted until the owner says so. An invited member who can see
  // every branch by default is precisely what R24 forbids.
  assignedLocationIds: [],
}

type AddTeamMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (values: AddTeamMemberValues) => void
  /** Used in microcopy, e.g. "join Shampooch JVC". */
  businessName?: string
  /**
   * The member being edited, when this is an edit rather than an invitation.
   *
   * One form, not two. The sections an owner fills in to create somebody are
   * the sections they come back to change — Works at above all, which is where
   * the estate lives — and a separate edit form is how the two drift until one
   * of them forgets a field.
   */
  editing?: Partial<AddTeamMemberValues> & { name?: string }
  /**
   * Which section to land on. "Edit Services" that opened on Profile made the
   * operator find the section themselves, which is the whole cost the menu item
   * was saving them.
   */
  initialSection?: SectionId
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onAdd,
  businessName,
  editing,
  initialSection = "profile",
}: AddTeamMemberDialogProps) {
  const [section, setSection] = useState<SectionId>(initialSection)
  const form = useForm<AddTeamMemberValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues: { ...defaultValues, ...editing },
    mode: "onChange",
  })

  // Reopening on a different person loads that person, rather than leaving the
  // last one's details in the fields.
  const [loadedFor, setLoadedFor] = useState(editing?.email)
  if (open && loadedFor !== editing?.email) {
    setLoadedFor(editing?.email)
    form.reset({ ...defaultValues, ...editing })
    setSection(initialSection)
  }

  const firstName = form.watch("firstName").trim()
  const lastName = form.watch("lastName").trim()
  const email = form.watch("email").trim()
  const { locations: allLocations } = useLocations()
  const locationCount = allLocations.length
  const grantedIds = form.watch("assignedLocationIds") ?? []
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    (email.charAt(0).toUpperCase() ?? "")
  const canSubmit = firstName.length > 0 && lastName.length > 0 && /.+@.+\..+/.test(email)

  // An owner holds every location, so its badge counts the estate rather than
  // the (empty, untickable) grant array.
  const grantedCount = form.watch("roleId") === "owner" ? locationCount : grantedIds.length
  // The nav carries both counts, the way the built form does — how many
  // services and how many locations, so a section says what is in it before
  // you open it.
  const serviceCount = (form.watch("services") ?? []).length
  const sectionCounts = {
    services: serviceCount > 0 ? String(serviceCount) : undefined,
    locations: grantedCount > 0 ? String(grantedCount) : undefined,
  }

  function reset() {
    form.reset(defaultValues)
    setSection(initialSection)
  }

  function handleSubmit(values: AddTeamMemberValues) {
    onAdd(values)
    reset()
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !editing) reset()
        onOpenChange(next)
      }}
      title={editing ? `Edit ${editing.name ?? "team member"}` : "Add team member"}
      subtitle={
        editing
          ? "Change their profile, the services they provide, and the locations they work at."
          : businessName
            ? `Set up a new team member for ${businessName}.`
            : "Set up a new team member's profile, services, and access."
      }
      saveLabel={editing ? "Save" : "Add"}
      saveDisabled={!canSubmit}
      onSave={form.handleSubmit(handleSubmit)}
      contentClassName="max-w-3xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]"
        >
          <SectionNav active={section} onChange={setSection} counts={sectionCounts} />

          <div className="flex min-w-0 flex-col gap-5">
            {section === "profile" ? (
              <ProfileSection form={form} initials={initials} businessName={businessName} />
            ) : null}
            {section === "addresses" ? <AddressesSection /> : null}
            {section === "emergency" ? <EmergencySection /> : null}
            {section === "services" ? <ServicesSection form={form} /> : null}
            {section === "locations" ? <LocationsSection form={form} /> : null}
            {section === "settings" ? <SettingsSection form={form} /> : null}
          </div>
        </form>
      </Form>
    </FullScreenEditDialog>
  )
}

function SectionNav({
  active,
  onChange,
  counts,
}: {
  active: SectionId
  onChange: (id: SectionId) => void
  /** Per-section badge overrides, for the counts that depend on the form. */
  counts?: Partial<Record<SectionId, string>>
}) {
  return (
    <aside aria-label="Sections" className="flex min-w-0 flex-col gap-6">
      {sectionGroups.map((group) => (
        <div key={group.label} className="flex min-w-0 flex-col gap-2">
          <div className="px-3 font-heading text-sm font-semibold leading-5 text-foreground">
            {group.label}
          </div>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <SectionNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                count={counts?.[item.id] ?? ("count" in item ? item.count : undefined)}
                active={active === item.id}
                onSelect={() => onChange(item.id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}

function SectionNavItem({
  id,
  label,
  icon: Icon,
  count,
  active,
  onSelect,
}: {
  id: SectionId
  label: string
  icon: LucideIcon
  count?: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        data-section={id}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
          active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted/50",
        )}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="flex-1 truncate font-medium">{label}</span>
        {count ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </button>
    </li>
  )
}

type FormReturn = ReturnType<typeof useForm<AddTeamMemberValues>>

function SectionShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section
      data-slot="add-team-member-section"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border/60 bg-background p-5"
    >
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold leading-9 text-foreground">{title}</h2>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </header>
      <div className="-mx-5 h-px bg-border/60" aria-hidden />
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function ProfileSection({
  form,
  initials,
  businessName,
}: {
  form: FormReturn
  initials: string
  businessName?: string
}) {
  return (
    <SectionShell
      title="Profile"
      description={
        businessName
          ? `Personal details for the team member joining ${businessName}.`
          : "Manage the team member's personal profile."
      }
    >
      <AvatarUploader initials={initials} />

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First name <span className="text-foreground">*</span>
                </FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last name <span className="text-foreground">*</span>
                </FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-foreground">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="teammate@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PhoneField form={form} codeName="phoneCode" numberName="phone" label="Phone number" />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={cn(triggerOverride, "w-full")}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <BirthdayField form={form} />

      <CalendarColorField form={form} />

      <div className="-mx-5 h-px bg-border/60" aria-hidden />

      <FormField
        control={form.control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Senior Groomer" {...field} />
            </FormControl>
            <FormDescription>Visible to clients online.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </SectionShell>
  )
}

function AvatarUploader({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          aria-hidden
          className="flex size-32 items-center justify-center rounded-full bg-cami-violet-3 font-heading text-3xl font-semibold text-cami-violet-11"
        >
          {initials || <CircleUserIcon className="size-12 text-cami-violet-9" strokeWidth={1.25} />}
        </div>
        <button
          type="button"
          aria-label="Upload photo"
          className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background transition-colors hover:bg-foreground/90"
        >
          <ArrowUpIcon className="size-4" strokeWidth={2.25} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Initials show on the calendar until a photo is uploaded.
      </p>
    </div>
  )
}

function PhoneField({
  form,
  codeName,
  numberName,
  label,
}: {
  form: FormReturn
  codeName: "phoneCode"
  numberName: "phone"
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full items-center gap-2">
        <FormField
          control={form.control}
          name={codeName}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn(triggerOverride, "w-24 shrink-0")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phoneCodes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={form.control}
          name={numberName}
          render={({ field }) => (
            <Input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="min-w-0 flex-1"
              {...field}
            />
          )}
        />
      </div>
    </div>
  )
}

function BirthdayField({ form }: { form: FormReturn }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Birthday</Label>
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="birthDay"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn(triggerOverride, "w-20")}>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={form.control}
          name="birthMonth"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn(triggerOverride, "flex-1")}>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={form.control}
          name="birthYear"
          render={({ field }) => (
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Year"
              maxLength={4}
              className="w-24"
              {...field}
            />
          )}
        />
      </div>
    </div>
  )
}

function CalendarColorField({ form }: { form: FormReturn }) {
  return (
    <FormField
      control={form.control}
      name="calendarColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Calendar color</FormLabel>
          <FormDescription>Used on the calendar to identify their bookings.</FormDescription>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {calendarColors.map((c) => {
              const selected = field.value === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.id}
                  aria-pressed={selected}
                  onClick={() => field.onChange(c.id)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-transform",
                    selected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "hover:scale-110",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-7 rounded-full ring-1 ring-inset ring-border/40",
                      c.className,
                    )}
                  />
                </button>
              )
            })}
          </div>
        </FormItem>
      )}
    />
  )
}

function ServicesSection({ form }: { form: FormReturn }) {
  const selected = form.watch("services") ?? []

  // The real catalog, not a five-row fixture. A team member's services is a
  // list of dozens — that is what makes Select all worth having and what a
  // five-row mock hides.
  const services = seedServices

  const allSelected = services.length > 0 && services.every((s) => selected.includes(s.id))
  const someSelected = selected.length > 0 && !allSelected

  function toggle(id: string, value: boolean) {
    const next = new Set(selected)
    if (value) next.add(id)
    else next.delete(id)
    form.setValue("services", Array.from(next), { shouldDirty: true })
  }

  return (
    <SectionShell title="Services" description="Choose the services this team member provides.">
      {/* The rules run edge to edge. Inside the card's padding they stopped
          short of both sides and read as a boxed sub-list rather than as the
          section's own rows — `-mx-5 px-5` is the same trick the shell uses
          for its header rule. */}
      <div className="-mx-5 -mt-1 flex flex-col">
        <label
          htmlFor="svc-select-all"
          className="flex cursor-pointer items-center gap-3 border-border/60 border-b px-5 py-3"
        >
          <Checkbox
            id="svc-select-all"
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={(v) =>
              form.setValue("services", v === true ? services.map((x) => x.id) : [], {
                shouldDirty: true,
              })
            }
          />
          <span className="flex-1 font-medium text-foreground text-sm">Select all</span>
        </label>

        {services.map((service) => {
          const checked = selected.includes(service.id)
          return (
            <label
              key={service.id}
              htmlFor={`svc-${service.id}`}
              className="flex cursor-pointer items-start gap-3 border-border/60 border-b px-5 py-3 last:border-b-0"
            >
              {/* Top-aligned, because the row is two lines. Centred against a
                  name-plus-category block, the box drifts between the two and
                  stops lining up with anything. */}
              <Checkbox
                id={`svc-${service.id}`}
                className="mt-0.5"
                checked={checked}
                onCheckedChange={(v) => toggle(service.id, v === true)}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-foreground text-sm">{service.name}</span>
                {/* The category, not the price. This section answers "which
                    services does this person perform", and a groomer is
                    assigned by category — what a service costs and how long it
                    takes belong to the booking, not to the capability. */}
                <span className="truncate text-muted-foreground text-sm">
                  {service.categoryName}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </SectionShell>
  )
}

/**
 * "Works at" — the per-member half of SCR-03 (R04, R05, R24).
 *
 * Mirrors the shipped section in cami-business's `TeamMemberProfileForm.tsx`:
 * one checkbox row per branch against `assignedVenueIds`, and the whole list
 * disabled for an owner, who holds every branch by definition. Ours read a
 * single hardcoded row derived from the business name, which is the same
 * business-as-location conflation the topbar switcher had.
 *
 * A grant here is *where*, never *what* (R04). Ticking every branch does not
 * make a receptionist a manager, and an owner's untickable list is not a
 * missing feature — capability and scope do not widen each other.
 *
 * Ticking nothing is a real, permitted state: the member performs no
 * operational read or write, and it must never resolve to every branch (R24).
 * So the empty case is said out loud rather than left as an unticked list.
 */
function LocationsSection({ form }: { form: FormReturn }) {
  const { locations } = useLocations()
  const selected = form.watch("assignedLocationIds") ?? []
  const isOwner = form.watch("roleId") === "owner"

  const allSelected = locations.length > 0 && locations.every((l) => selected.includes(l.id))
  const _someSelected = selected.length > 0 && !allSelected

  function _toggle(id: string, next: boolean) {
    if (isOwner) return
    const set = new Set(selected)
    if (next) set.add(id)
    else set.delete(id)
    form.setValue("assignedLocationIds", Array.from(set), { shouldDirty: true })
  }

  return (
    <SectionShell title="Works at" description="Choose the locations where this team member works.">
      {isOwner ? (
        <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
          An owner holds every location, including any added later. Change the role to grant a named
          set instead.
        </p>
      ) : selected.length === 0 ? (
        <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
          No location granted yet. Until one is, this team member can see and do nothing — an empty
          grant never means every location.
        </p>
      ) : null}
      {/* A dropdown, not a stack of cards. The answer is two or three
          branches whether the estate is three or twenty, so the control should
          cost what the answer costs. Same shape as the topbar switcher and the
          access dialog — one gesture for choosing branches. */}
      <LocationMultiSelect
        locations={locations}
        selectedIds={isOwner ? locations.map((l) => l.id) : selected}
        onChange={(ids) => form.setValue("assignedLocationIds", ids, { shouldDirty: true })}
        disabled={isOwner}
      />
    </SectionShell>
  )
}

function SettingsSection({ form }: { form: FormReturn }) {
  return (
    <SectionShell title="Settings" description="Bookings and access for this team member.">
      <FormField
        control={form.control}
        name="allowBookings"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
            </FormControl>
            <div className="flex flex-1 flex-col gap-0.5">
              <FormLabel className="font-medium">Allow calendar bookings</FormLabel>
              <FormDescription>
                Allow this team member to receive bookings on the calendar.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="-mx-5 h-px bg-border/60" aria-hidden />

      <FormField
        control={form.control}
        name="roleId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Permission role *</FormLabel>
            <FormDescription>
              Choose the access level this team member has to the workspace.
            </FormDescription>
            {/* The real roles, not High / Medium / Low.
                This select offered three severities that are not roles, name
                nothing a merchant recognises, and were read by no surface in
                the repo — while the same form's Roles & permissions section was
                editing `roleId`. One form, two ideas of what a role is, and the
                meaningless one was the one on screen.

                Owner is absent for the same reason it is absent from the access
                dialog: it is not an access level you hand out, it is what
                holding the estate is called (R04). */}
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className={cn(triggerOverride, "w-full")}>
                  <SelectValue>{roleById(field.value)?.name}</SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MERCHANT_ROLES.filter((r) => r.id !== "owner").map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="pt-1 text-sm text-muted-foreground">
              {roleById(field.value)?.capability}
            </p>
          </FormItem>
        )}
      />
    </SectionShell>
  )
}

function AddressesSection() {
  return (
    <SectionShell
      title="Addresses"
      description="Manage the team member's correspondence addresses."
    >
      <SettingsRow icon={MapPinIcon} label="Address" value={null} addLabel="Add an address" />
    </SectionShell>
  )
}

function EmergencySection() {
  return (
    <SectionShell
      title="Emergency contacts"
      description="Manage the team member's emergency contacts."
    >
      <SettingsRow
        icon={PhoneIcon}
        label="Emergency contact"
        value={null}
        addLabel="Add an emergency contact"
      />
    </SectionShell>
  )
}
