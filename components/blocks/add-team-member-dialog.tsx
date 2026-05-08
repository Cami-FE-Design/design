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
      { id: "locations", label: "Locations", icon: BuildingIcon, count: "1" },
      { id: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
] as const

type SectionId = (typeof sectionGroups)[number]["items"][number]["id"]

type Permission = "High" | "Medium" | "Low"

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

const mockServices = [
  { id: "wash-tidy", label: "Wash & tidy", duration: "45 min" },
  { id: "full-groom", label: "Full groom", duration: "1 hr 30 min" },
  { id: "puppy-first", label: "Puppy first groom", duration: "1 hr" },
  { id: "nails", label: "Nail trim", duration: "15 min" },
  { id: "deshed", label: "Deshedding treatment", duration: "1 hr" },
]

const permissionDescriptions: Record<Permission, string> = {
  High: "Full access to calendar, sales, clients, catalog, marketing, team, payments and workspace.",
  Medium:
    "Partial access to calendar, sales, clients, catalog, online profile, marketing, team, payments and wallet, and workspace.",
  Low: "Calendar, their own appointments, and limited client info. Cannot edit team or settings.",
}

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
  permission: z.enum(["High", "Medium", "Low"]),
  services: z.array(z.string()),
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
  permission: "Medium",
  services: [],
}

type AddTeamMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (values: AddTeamMemberValues) => void
  /** Used in microcopy, e.g. "join Shampooch JVC". */
  businessName?: string
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onAdd,
  businessName,
}: AddTeamMemberDialogProps) {
  const [section, setSection] = useState<SectionId>("profile")
  const form = useForm<AddTeamMemberValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues,
    mode: "onChange",
  })

  const firstName = form.watch("firstName").trim()
  const lastName = form.watch("lastName").trim()
  const email = form.watch("email").trim()
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    (email.charAt(0).toUpperCase() ?? "")
  const canSubmit = firstName.length > 0 && lastName.length > 0 && /.+@.+\..+/.test(email)

  function reset() {
    form.reset(defaultValues)
    setSection("profile")
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
        if (!next) reset()
        onOpenChange(next)
      }}
      title="Add team member"
      subtitle={
        businessName
          ? `Set up a new team member for ${businessName}.`
          : "Set up a new team member's profile, services, and access."
      }
      saveLabel="Add"
      saveDisabled={!canSubmit}
      onSave={form.handleSubmit(handleSubmit)}
      contentClassName="max-w-3xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]"
        >
          <SectionNav active={section} onChange={setSection} />

          <div className="flex min-w-0 flex-col gap-5">
            {section === "profile" ? (
              <ProfileSection form={form} initials={initials} businessName={businessName} />
            ) : null}
            {section === "addresses" ? <AddressesSection /> : null}
            {section === "emergency" ? <EmergencySection /> : null}
            {section === "services" ? <ServicesSection form={form} /> : null}
            {section === "locations" ? <LocationsSection businessName={businessName} /> : null}
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
}: {
  active: SectionId
  onChange: (id: SectionId) => void
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
                count={"count" in item ? item.count : undefined}
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
  function toggle(id: string, value: boolean) {
    const next = new Set(selected)
    if (value) next.add(id)
    else next.delete(id)
    form.setValue("services", Array.from(next), { shouldDirty: true })
  }
  return (
    <SectionShell title="Services" description="Choose the services this team member provides.">
      <ul className="flex flex-col divide-y divide-border">
        {mockServices.map((service) => {
          const checked = selected.includes(service.id)
          return (
            <li key={service.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Checkbox
                id={`svc-${service.id}`}
                size="lg"
                checked={checked}
                onCheckedChange={(v) => toggle(service.id, v === true)}
              />
              <label htmlFor={`svc-${service.id}`} className="flex flex-1 cursor-pointer flex-col">
                <span className="text-sm font-medium text-foreground">{service.label}</span>
                <span className="text-sm text-muted-foreground">{service.duration}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}

function LocationsSection({ businessName }: { businessName?: string }) {
  return (
    <SectionShell title="Works at" description="Choose the locations where this team member works.">
      <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
          <BuildingIcon className="size-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium text-foreground">
            {businessName ?? "Main location"}
          </span>
          <span className="text-sm text-muted-foreground">Default workspace</span>
        </div>
      </div>
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
              <Checkbox
                size="lg"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
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
        name="permission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Permission role</FormLabel>
            <FormDescription>
              Choose the access level this team member has to the workspace.
            </FormDescription>
            <Select value={field.value} onValueChange={(v) => field.onChange(v as Permission)}>
              <FormControl>
                <SelectTrigger className={cn(triggerOverride, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <p className="pt-1 text-sm text-muted-foreground">
              {permissionDescriptions[field.value as Permission]}
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
