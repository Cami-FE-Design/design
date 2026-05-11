"use client"

import {
  ArrowUpIcon,
  CircleUserIcon,
  InfoIcon,
  type LucideIcon,
  MapPinIcon,
  PawPrintIcon,
  PhoneIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { TagPicker } from "@/components/blocks/tag-picker"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const PHONE_CODES = ["+971", "+966", "+965", "+974", "+44", "+1"]

type SectionId = "profile" | "additional" | "addresses" | "contacts" | "pets" | "settings"

type SectionItem = { id: SectionId; label: string; icon: LucideIcon }

type PersonContact = {
  name: string
  relationship: string
  email: string
  phoneCode: string
  phone: string
}

const EMPTY_CONTACT: PersonContact = {
  name: "",
  relationship: "",
  email: "",
  phoneCode: "+971",
  phone: "",
}

type ClientFormValues = {
  photoUrl: string
  firstName: string
  lastName: string
  phoneCode: string
  phone: string
  email: string
  birthday: string
  gender: string
  source: string
  country: string
  tags: string[]
  addresses: Array<{
    id: string
    type: string
    street: string
    apt: string
    city: string
    region: string
    postalCode: string
    country: string
  }>
  contacts: [PersonContact, PersonContact]
  pets: Array<{ id: string; name: string; species: AvatarSpecies }>
  notifications: {
    serviceRelated: { whatsapp: boolean; email: boolean }
    marketing: { whatsapp: boolean; email: boolean }
  }
  requireCardOnFile: boolean
}

const EMPTY: ClientFormValues = {
  photoUrl: "",
  firstName: "",
  lastName: "",
  phoneCode: "+971",
  phone: "",
  email: "",
  birthday: "",
  gender: "",
  source: "",
  country: "",
  tags: [],
  addresses: [],
  contacts: [{ ...EMPTY_CONTACT }, { ...EMPTY_CONTACT }],
  pets: [],
  notifications: {
    serviceRelated: { whatsapp: true, email: true },
    marketing: { whatsapp: false, email: false },
  },
  requireCardOnFile: false,
}

type ClientEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "add" | "edit"
  initial?: Partial<ClientFormValues>
  initialSection?: SectionId
  hasPets?: boolean
  onSave?: (values: ClientFormValues) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function ClientEditSheet({
  open,
  onOpenChange,
  mode = "add",
  initial,
  initialSection,
  hasPets = true,
  onSave,
}: ClientEditSheetProps) {
  const [values, setValues] = useState<ClientFormValues>({ ...EMPTY, ...initial })
  const [section, setSection] = useState<SectionId>(initialSection ?? "profile")

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY, ...initial })
      setSection(initialSection ?? "profile")
    }
  }, [open, initial, initialSection])

  const title = mode === "add" ? "Add client" : "Edit client"
  const subtitle =
    mode === "add"
      ? "Only the first name is required. Anything else can be filled later from the client's profile."
      : undefined
  const saveDisabled = values.firstName.trim() === ""

  const sections: SectionItem[] = [
    { id: "profile", label: "Profile", icon: CircleUserIcon },
    { id: "additional", label: "Additional info", icon: InfoIcon },
    { id: "addresses", label: "Addresses", icon: MapPinIcon },
    { id: "contacts", label: "Additional contacts", icon: PhoneIcon },
    ...(hasPets ? [{ id: "pets" as const, label: "Pets", icon: PawPrintIcon }] : []),
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ]

  function patch<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSave() {
    onSave?.(values)
    const displayName = `${values.firstName} ${values.lastName}`.trim()
    toast.success(`${displayName} ${mode === "add" ? "added" : "saved"}`)
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={subtitle}
      onSave={handleSave}
      saveDisabled={saveDisabled}
      saveLabel={mode === "add" ? "Add client" : "Save"}
      contentClassName="max-w-3xl"
    >
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={sections} active={section} onChange={setSection} />

        <div className="flex min-w-0 flex-col gap-5">
          {section === "profile" ? <ProfileSection values={values} patch={patch} /> : null}
          {section === "additional" ? <AdditionalSection values={values} patch={patch} /> : null}
          {section === "addresses" ? <AddressesSection values={values} patch={patch} /> : null}
          {section === "contacts" ? <ContactsSection values={values} patch={patch} /> : null}
          {section === "pets" && hasPets ? <PetsSection values={values} patch={patch} /> : null}
          {section === "settings" ? <SettingsSection values={values} patch={patch} /> : null}
        </div>
      </div>
    </FullScreenEditDialog>
  )
}

function SectionNav({
  sections,
  active,
  onChange,
}: {
  sections: SectionItem[]
  active: SectionId
  onChange: (id: SectionId) => void
}) {
  return (
    <aside aria-label="Sections" className="flex min-w-0 flex-col">
      <ul className="flex flex-col gap-1">
        {sections.map((item) => (
          <SectionNavItem
            key={item.id}
            item={item}
            active={active === item.id}
            onSelect={() => onChange(item.id)}
          />
        ))}
      </ul>
    </aside>
  )
}

function SectionNavItem({
  item,
  active,
  onSelect,
}: {
  item: SectionItem
  active: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        data-section={item.id}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
          active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted/50",
        )}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="flex-1 truncate font-medium">{item.label}</span>
      </button>
    </li>
  )
}

function SectionShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      data-slot="client-edit-section"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border/60 bg-background p-5"
    >
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold leading-9 text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="-mx-5 h-px bg-border/60" aria-hidden />
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

type SectionProps = {
  values: ClientFormValues
  patch: <K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) => void
}

function EmptyAddRow({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-muted/40 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
    >
      <PlusIcon className="size-4 shrink-0" />
      {label}
    </button>
  )
}

function PhoneField({
  label,
  code,
  number,
  onCodeChange,
  onNumberChange,
}: {
  label: string
  code: string
  number: string
  onCodeChange: (next: string) => void
  onNumberChange: (next: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full items-center gap-2">
        <Select value={code} onValueChange={onCodeChange}>
          <SelectTrigger className={cn(triggerOverride, "w-24 shrink-0")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHONE_CODES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          className="min-w-0 flex-1"
          placeholder="50 000 0000"
        />
      </div>
    </div>
  )
}

function FieldRow({
  label,
  htmlFor,
  required,
  description,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-foreground"> *</span> : null}
      </Label>
      {children}
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

function PhotoUploader({
  photoUrl,
  name,
  hashSeed,
  onClear,
}: {
  photoUrl: string
  name: string
  hashSeed?: string
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        {photoUrl ? (
          // biome-ignore lint/performance/noImgElement: mock URL, not a Next-managed asset
          <img
            src={photoUrl}
            alt=""
            className="size-32 rounded-full object-cover ring-2 ring-background"
          />
        ) : (
          <Avatar
            size="xl"
            fallback="character"
            name={name || "?"}
            hashSeed={hashSeed}
            className="!size-32 ring-2 ring-background [&_svg]:size-14"
          />
        )}
        <button
          type="button"
          aria-label={photoUrl ? "Remove photo" : "Upload photo"}
          onClick={photoUrl ? onClear : undefined}
          className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background transition-colors hover:bg-foreground/90"
        >
          {photoUrl ? (
            <XIcon className="size-4" strokeWidth={2.25} />
          ) : (
            <ArrowUpIcon className="size-4" strokeWidth={2.25} />
          )}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Upload a photo. A character avatar shows until a photo is added.
      </p>
    </div>
  )
}

function ProfileSection({ values, patch }: SectionProps) {
  const displayName = `${values.firstName} ${values.lastName}`.trim() || "?"
  return (
    <SectionShell title="Profile" description="Only the first name is required.">
      <PhotoUploader
        photoUrl={values.photoUrl}
        name={displayName}
        hashSeed={values.firstName}
        onClear={() => patch("photoUrl", "")}
      />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="First name" htmlFor="firstName" required>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(e) => patch("firstName", e.target.value)}
              placeholder="Millie"
            />
          </FieldRow>
          <FieldRow label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(e) => patch("lastName", e.target.value)}
              placeholder="Cassidy"
            />
          </FieldRow>
        </div>
        <PhoneField
          label="Phone number"
          code={values.phoneCode}
          number={values.phone}
          onCodeChange={(c) => patch("phoneCode", c)}
          onNumberChange={(n) => patch("phone", n)}
        />
        <FieldRow label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => patch("email", e.target.value)}
            placeholder="millie@example.com"
          />
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Birthday" htmlFor="birthday">
            <Input
              id="birthday"
              value={values.birthday}
              onChange={(e) => patch("birthday", e.target.value)}
              placeholder="May 14"
            />
          </FieldRow>
          <FieldRow label="Gender">
            <Select value={values.gender} onValueChange={(v) => patch("gender", v)}>
              <SelectTrigger className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>
    </SectionShell>
  )
}

function AdditionalSection({ values, patch }: SectionProps) {
  return (
    <SectionShell title="Additional info" description="Optional metadata about this client.">
      <div className="flex flex-col gap-5">
        <FieldRow label="Source">
          <Select value={values.source} onValueChange={(v) => patch("source", v)}>
            <SelectTrigger className={cn(triggerOverride, "w-full")}>
              <SelectValue placeholder="How did they find you?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Country" htmlFor="country">
          <Input
            id="country"
            value={values.country}
            onChange={(e) => patch("country", e.target.value)}
            placeholder="United Arab Emirates"
          />
        </FieldRow>
        <FieldRow label="Tags" description="VIP, Loyal, First visit, etc.">
          <TagPicker
            value={values.tags}
            onChange={(next) => patch("tags", next)}
            categories={["client", "general"]}
          />
        </FieldRow>
      </div>
    </SectionShell>
  )
}

function AddressesSection({ values, patch }: SectionProps) {
  function addRow() {
    patch("addresses", [
      ...values.addresses,
      {
        id: uid(),
        type: "home",
        street: "",
        apt: "",
        city: "",
        region: "",
        postalCode: "",
        country: "",
      },
    ])
  }
  function update(
    id: string,
    next: Partial<{
      type: string
      street: string
      apt: string
      city: string
      region: string
      postalCode: string
      country: string
    }>,
  ) {
    patch(
      "addresses",
      values.addresses.map((a) => (a.id === id ? { ...a, ...next } : a)),
    )
  }
  function remove(id: string) {
    patch(
      "addresses",
      values.addresses.filter((a) => a.id !== id),
    )
  }
  return (
    <SectionShell
      title="Addresses"
      description="Add as many addresses as you like, e.g. home, work."
    >
      {values.addresses.length === 0 ? (
        <EmptyAddRow label="Add an address" onAdd={addRow} />
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {values.addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Select value={addr.type} onValueChange={(v) => update(addr.id, { type: v })}>
                    <SelectTrigger className={cn(triggerOverride, "max-w-40")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    radius="full"
                    aria-label="Remove address"
                    onClick={() => remove(addr.id)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
                <FieldRow label="Street address">
                  <Input
                    value={addr.street}
                    onChange={(e) => update(addr.id, { street: e.target.value })}
                    placeholder="123 Main Street"
                    autoComplete="address-line1"
                  />
                </FieldRow>
                <FieldRow label="Apt, suite, unit (optional)">
                  <Input
                    value={addr.apt}
                    onChange={(e) => update(addr.id, { apt: e.target.value })}
                    placeholder="Apt 4B"
                    autoComplete="address-line2"
                  />
                </FieldRow>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow label="City">
                    <Input
                      value={addr.city}
                      onChange={(e) => update(addr.id, { city: e.target.value })}
                      placeholder="Dubai"
                      autoComplete="address-level2"
                    />
                  </FieldRow>
                  <FieldRow label="State / region">
                    <Input
                      value={addr.region}
                      onChange={(e) => update(addr.id, { region: e.target.value })}
                      placeholder="Dubai"
                      autoComplete="address-level1"
                    />
                  </FieldRow>
                  <FieldRow label="Postal code">
                    <Input
                      value={addr.postalCode}
                      onChange={(e) => update(addr.id, { postalCode: e.target.value })}
                      placeholder="00000"
                      autoComplete="postal-code"
                    />
                  </FieldRow>
                  <FieldRow label="Country">
                    <Input
                      value={addr.country}
                      onChange={(e) => update(addr.id, { country: e.target.value })}
                      placeholder="United Arab Emirates"
                      autoComplete="country-name"
                    />
                  </FieldRow>
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Button type="button" variant="secondary" size="sm" radius="full" onClick={addRow}>
              <PlusIcon />
              Add address
            </Button>
          </div>
        </>
      )}
    </SectionShell>
  )
}

function ContactsSection({ values, patch }: SectionProps) {
  function updateAt(index: 0 | 1, next: Partial<PersonContact>) {
    patch(
      "contacts",
      values.contacts.map((c, i) => (i === index ? { ...c, ...next } : c)) as [
        PersonContact,
        PersonContact,
      ],
    )
  }
  return (
    <SectionShell
      title="Additional contacts"
      description="Two people to reach about this client, like emergency or pickup."
    >
      <ContactBlock
        title="Primary contact"
        contact={values.contacts[0]}
        onChange={(next) => updateAt(0, next)}
      />
      <div className="-mx-5 h-px bg-border/60" aria-hidden />
      <ContactBlock
        title="Secondary contact"
        contact={values.contacts[1]}
        onChange={(next) => updateAt(1, next)}
      />
    </SectionShell>
  )
}

function ContactBlock({
  title,
  contact,
  onChange,
}: {
  title: string
  contact: PersonContact
  onChange: (next: Partial<PersonContact>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      <FieldRow label="Full name">
        <Input
          value={contact.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Tom Cassidy"
        />
      </FieldRow>
      <FieldRow label="Relationship">
        <Input
          value={contact.relationship}
          onChange={(e) => onChange({ relationship: e.target.value })}
          placeholder="e.g. Emergency, Pickup, Husband"
        />
      </FieldRow>
      <FieldRow label="Email">
        <Input
          type="email"
          value={contact.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="tom@example.com"
        />
      </FieldRow>
      <PhoneField
        label="Phone"
        code={contact.phoneCode}
        number={contact.phone}
        onCodeChange={(code) => onChange({ phoneCode: code })}
        onNumberChange={(n) => onChange({ phone: n })}
      />
    </div>
  )
}

const SEARCHABLE_PETS: Array<{ id: string; name: string; species: AvatarSpecies; breed?: string }> =
  [
    { id: "bobo", name: "Bobo", species: "dog", breed: "French Bulldog" },
    { id: "mochi", name: "Mochi", species: "cat", breed: "Domestic Shorthair" },
    { id: "kiwi", name: "Kiwi", species: "bird", breed: "Cockatiel" },
    { id: "biscuit", name: "Biscuit", species: "dog", breed: "Poodle" },
    { id: "pepper", name: "Pepper", species: "rabbit", breed: "Holland Lop" },
    { id: "ralph", name: "Ralph", species: "dog", breed: "Labrador" },
    { id: "tofu", name: "Tofu", species: "cat" },
    { id: "muffin", name: "Muffin", species: "cat" },
    { id: "shadow", name: "Shadow", species: "dog", breed: "German Shepherd" },
    { id: "rocky", name: "Rocky", species: "dog", breed: "Bulldog" },
    { id: "duke", name: "Duke", species: "dog", breed: "Beagle" },
    { id: "olive", name: "Olive", species: "rabbit", breed: "Mini Rex" },
  ]

const SPECIES_OPTIONS: Array<{ value: AvatarSpecies; label: string }> = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
]

function PetsSection({ values, patch }: SectionProps) {
  function addPet(pet: { id: string; name: string; species: AvatarSpecies }) {
    if (values.pets.some((p) => p.id === pet.id)) return
    patch("pets", [...values.pets, pet])
  }
  function remove(id: string) {
    patch(
      "pets",
      values.pets.filter((p) => p.id !== id),
    )
  }
  return (
    <SectionShell
      title="Pets"
      description="Search for an existing pet or create a new one. You can complete each pet's profile later."
    >
      {values.pets.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {values.pets.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
            >
              <Avatar size="md" fallback="species" species={p.species} hashSeed={p.id} />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {SPECIES_OPTIONS.find((o) => o.value === p.species)?.label}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                radius="full"
                aria-label="Remove pet"
                onClick={() => remove(p.id)}
              >
                <XIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <AddPetPopover
        existingIds={values.pets.map((p) => p.id)}
        onPick={addPet}
        onCreateNew={({ name, species }) => {
          addPet({ id: uid(), name, species })
        }}
      />
    </SectionShell>
  )
}

function AddPetPopover({
  existingIds,
  onPick,
  onCreateNew,
}: {
  existingIds: string[]
  onPick: (pet: { id: string; name: string; species: AvatarSpecies }) => void
  onCreateNew: (pet: { name: string; species: AvatarSpecies }) => void
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"search" | "create">("search")
  const [query, setQuery] = useState("")
  const [draftName, setDraftName] = useState("")
  const [draftSpecies, setDraftSpecies] = useState<AvatarSpecies | "">("")

  const q = query.trim().toLowerCase()
  const filtered = SEARCHABLE_PETS.filter((p) => {
    if (existingIds.includes(p.id)) return false
    if (!q) return true
    return p.name.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q)
  })

  function close() {
    setOpen(false)
    setQuery("")
    setMode("search")
    setDraftName("")
    setDraftSpecies("")
  }

  function startCreate() {
    setDraftName(query.trim())
    setDraftSpecies("")
    setMode("create")
  }

  function confirmCreate() {
    if (!draftName.trim() || !draftSpecies) return
    onCreateNew({ name: draftName.trim(), species: draftSpecies })
    close()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery("")
          setMode("search")
          setDraftName("")
          setDraftSpecies("")
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" size="sm" radius="full">
          <PlusIcon />
          Add pet
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-80 flex-col gap-0 p-0">
        {mode === "search" ? (
          <>
            <div className="border-b border-border/60 p-2">
              <SearchInput
                className="!h-9 w-full"
                placeholder="Search name or breed"
                aria-label="Search pets"
                defaultValue={query}
                onValueChange={setQuery}
              />
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  {q ? "No pets match." : "Start typing to search."}
                </li>
              ) : (
                filtered.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(p)
                        close()
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <Avatar size="sm" fallback="species" species={p.species} hashSeed={p.id} />
                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        {p.breed ? (
                          <span className="truncate text-xs text-muted-foreground">{p.breed}</span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-border/60 p-2">
              <button
                type="button"
                onClick={startCreate}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-cami-violet-11 transition-colors hover:bg-muted/50"
              >
                <PlusIcon className="size-4" />
                <span className="truncate">
                  {query.trim() ? `Create "${query.trim()}" as new pet` : "Create new pet"}
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 p-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-pet-name" className="text-xs font-medium text-muted-foreground">
                Name <span className="text-foreground">*</span>
              </Label>
              <Input
                id="new-pet-name"
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Bobo"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Species <span className="text-foreground">*</span>
              </Label>
              <Select
                value={draftSpecies}
                onValueChange={(v) => setDraftSpecies(v as AvatarSpecies)}
              >
                <SelectTrigger className={cn(triggerOverride, "w-full")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                radius="full"
                onClick={() => setMode("search")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                radius="full"
                onClick={confirmCreate}
                disabled={!draftName.trim() || !draftSpecies}
              >
                Add pet
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function SettingsSection({ values, patch }: SectionProps) {
  function setChannel(
    category: "serviceRelated" | "marketing",
    channel: "whatsapp" | "email",
    next: boolean,
  ) {
    patch("notifications", {
      ...values.notifications,
      [category]: { ...values.notifications[category], [channel]: next },
    })
  }
  return (
    <SectionShell title="Settings" description="Notifications and payment preferences.">
      <div className="flex flex-col gap-3">
        <Label className="font-medium">Service-related notifications</Label>
        <p className="text-sm text-muted-foreground">
          How this client is notified about appointments, reminders, and changes.
        </p>
        <div className="flex flex-col gap-3 pt-1">
          <ChannelRow
            label="WhatsApp"
            checked={values.notifications.serviceRelated.whatsapp}
            onCheckedChange={(c) => setChannel("serviceRelated", "whatsapp", c)}
          />
          <ChannelRow
            label="Email"
            checked={values.notifications.serviceRelated.email}
            onCheckedChange={(c) => setChannel("serviceRelated", "email", c)}
          />
        </div>
      </div>

      <div className="-mx-5 h-px bg-border/60" aria-hidden />

      <div className="flex flex-col gap-3">
        <Label className="font-medium">Marketing notifications</Label>
        <p className="text-sm text-muted-foreground">
          Whether this client has opted into promotions and announcements.
        </p>
        <div className="flex flex-col gap-3 pt-1">
          <ChannelRow
            label="WhatsApp"
            checked={values.notifications.marketing.whatsapp}
            onCheckedChange={(c) => setChannel("marketing", "whatsapp", c)}
          />
          <ChannelRow
            label="Email"
            checked={values.notifications.marketing.email}
            onCheckedChange={(c) => setChannel("marketing", "email", c)}
          />
        </div>
      </div>

      <div className="-mx-5 h-px bg-border/60" aria-hidden />

      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Label className="font-medium">Require card on file</Label>
          <p className="text-sm text-muted-foreground">
            Charge a deposit upfront or hold a card for cancellation fees.
          </p>
        </div>
        <Switch
          checked={values.requireCardOnFile}
          onCheckedChange={(c) => patch("requireCardOnFile", c)}
        />
      </div>
    </SectionShell>
  )
}

function ChannelRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  const id = `channel-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm">
      <Checkbox
        id={id}
        size="lg"
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
      />
      <span className="font-medium">{label}</span>
    </label>
  )
}
