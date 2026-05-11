"use client"

import {
  ArrowUpIcon,
  CheckIcon,
  CircleUserIcon,
  HeartIcon,
  type LucideIcon,
  PawPrintIcon,
  PlusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/blocks/date-picker"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { SearchableCombobox } from "@/components/blocks/searchable-combobox"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const PHONE_CODES = ["+971", "+966", "+965", "+974", "+44", "+1"]

const BREED_OPTIONS_BY_SPECIES: Record<AvatarSpecies, string[]> = {
  dog: [
    "French Bulldog",
    "Labrador Retriever",
    "Golden Retriever",
    "Poodle",
    "Toy Poodle",
    "Goldendoodle",
    "Cavoodle",
    "German Shepherd",
    "Siberian Husky",
    "Beagle",
    "Bulldog",
    "Pug",
    "Shih Tzu",
    "Maltese",
    "Yorkshire Terrier",
    "Pomeranian",
    "Chihuahua",
    "Dachshund",
    "Border Collie",
  ],
  cat: [
    "Domestic Shorthair",
    "Domestic Longhair",
    "Persian",
    "Maine Coon",
    "Siamese",
    "Ragdoll",
    "British Shorthair",
    "Bengal",
    "Scottish Fold",
    "Sphynx",
  ],
  bird: ["Cockatiel", "Budgerigar", "Canary", "Lovebird", "Conure", "African Grey"],
  rabbit: ["Holland Lop", "Netherland Dwarf", "Mini Rex", "Lionhead", "Flemish Giant"],
  other: [],
}

const SEARCHABLE_CLIENTS: Array<{ id: string; name: string; phone?: string }> = [
  { id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" },
  { id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" },
  { id: "kirsty-dingomal", name: "Kirsty Dingomal", phone: "+44 7508 219989" },
  { id: "grace-kent", name: "Grace Kent", phone: "+971 58 566 5998" },
  { id: "lisa-lyons-wilson", name: "Lisa Lyons Wilson", phone: "+971 54 265 9265" },
  { id: "nadia-martinez", name: "Nadia Martinez", phone: "+971 52 115 6075" },
  { id: "karen-dougall", name: "Karen Dougall", phone: "+971 54 433 3592" },
  { id: "frances", name: "Frances", phone: "+971 58 597 2103" },
]

type SectionId = "profile" | "health" | "family"

type SectionItem = { id: SectionId; label: string; icon: LucideIcon }

type PetOwner = { id: string; name: string; phone?: string }

type PetFormValues = {
  photoUrl: string
  name: string
  species: AvatarSpecies | ""
  breed: string
  isMixed: boolean
  gender: string
  desexedStatus: string
  birthday: string
  weight: string
  weightUnit: "lb" | "kg"
  coatType: string
  appearance: string
  microchip: string
  tags: string[]
  customDesexedOptions: string[]
  customCoatOptions: string[]
  customAppearanceOptions: string[]
  customBreedOptions: Partial<Record<AvatarSpecies, string[]>>
  vetName: string
  vetPhoneCode: string
  vetPhone: string
  vetAddress: string
  owners: PetOwner[]
}

const EMPTY: PetFormValues = {
  photoUrl: "",
  name: "",
  species: "",
  breed: "",
  isMixed: false,
  gender: "",
  desexedStatus: "",
  birthday: "",
  weight: "",
  weightUnit: "kg",
  coatType: "",
  appearance: "",
  microchip: "",
  tags: [],
  customDesexedOptions: [],
  customCoatOptions: [],
  customAppearanceOptions: [],
  customBreedOptions: {},
  vetName: "",
  vetPhoneCode: "+971",
  vetPhone: "",
  vetAddress: "",
  owners: [],
}

type PetEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "add" | "edit"
  initial?: Partial<PetFormValues>
  initialSection?: SectionId
  onSave?: (values: PetFormValues) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function PetEditSheet({
  open,
  onOpenChange,
  mode = "add",
  initial,
  initialSection,
  onSave,
}: PetEditSheetProps) {
  const [values, setValues] = useState<PetFormValues>({ ...EMPTY, ...initial })
  const [section, setSection] = useState<SectionId>(initialSection ?? "profile")

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY, ...initial })
      setSection(initialSection ?? "profile")
    }
  }, [open, initial, initialSection])

  const title = mode === "add" ? "Add pet" : "Edit pet"
  const subtitle =
    mode === "add"
      ? "Only the name and species are required. Everything else can be filled later from the pet's profile."
      : undefined
  const saveDisabled = values.name.trim() === "" || values.species === ""

  const sections: SectionItem[] = [
    { id: "profile", label: "Profile", icon: CircleUserIcon },
    { id: "health", label: "Health & care", icon: HeartIcon },
    { id: "family", label: "Family", icon: UsersIcon },
  ]

  function patch<K extends keyof PetFormValues>(key: K, value: PetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSave() {
    onSave?.(values)
    toast.success(`${values.name || "Pet"} ${mode === "add" ? "added" : "saved"}`)
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
      saveLabel={mode === "add" ? "Add pet" : "Save"}
      contentClassName="max-w-3xl"
    >
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={sections} active={section} onChange={setSection} />

        <div className="flex min-w-0 flex-col gap-5">
          {section === "profile" ? <ProfileSection values={values} patch={patch} /> : null}
          {section === "health" ? <HealthSection values={values} patch={patch} /> : null}
          {section === "family" ? <FamilySection values={values} patch={patch} /> : null}
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
        {sections.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
                  active === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <span className="flex-1 truncate font-medium">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
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
    <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border/60 bg-background p-5">
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
  values: PetFormValues
  patch: <K extends keyof PetFormValues>(key: K, value: PetFormValues[K]) => void
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

const ADD_NEW_VALUE = "__add_new__"

function SelectWithAddNew({
  value,
  onValueChange,
  baseOptions,
  customOptions,
  onAddCustom,
  placeholder,
}: {
  value: string
  onValueChange: (v: string) => void
  baseOptions: Array<{ value: string; label: string }>
  customOptions: string[]
  onAddCustom: (v: string) => void
  placeholder?: string
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  function confirm() {
    const v = draft.trim()
    if (!v) return
    onAddCustom(v)
    onValueChange(v)
    setDraft("")
    setAdding(false)
  }

  if (adding) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              confirm()
            }
            if (e.key === "Escape") setAdding(false)
          }}
          placeholder="Type a new option"
          className="flex-1"
        />
        <Button
          type="button"
          size="icon-xs"
          aria-label="Add"
          onClick={confirm}
          disabled={!draft.trim()}
        >
          <CheckIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Cancel"
          onClick={() => {
            setDraft("")
            setAdding(false)
          }}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === ADD_NEW_VALUE) {
          setAdding(true)
        } else {
          onValueChange(v)
        }
      }}
    >
      <SelectTrigger className={cn(triggerOverride, "w-full")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ADD_NEW_VALUE} className="font-medium text-cami-violet-11">
          <PlusIcon className="size-4" />
          Add new
        </SelectItem>
        {baseOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
        {customOptions.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function PhotoUploader({
  photoUrl,
  species,
  onClear,
}: {
  photoUrl: string
  species: AvatarSpecies | ""
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
        ) : species ? (
          <Avatar
            size="xl"
            fallback="species"
            species={species}
            className="!size-32 ring-2 ring-background [&_svg]:size-14"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-32 items-center justify-center rounded-full bg-muted/40 text-muted-foreground"
          >
            <PawPrintIcon className="size-12" strokeWidth={1.25} />
          </div>
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
        Upload a photo. The species icon shows on the calendar until a photo is added.
      </p>
    </div>
  )
}

const SPECIES_OPTIONS: Array<{ value: AvatarSpecies; label: string }> = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
]

function ProfileSection({ values, patch }: SectionProps) {
  return (
    <SectionShell title="Profile" description="Name and species are required.">
      <PhotoUploader
        photoUrl={values.photoUrl}
        species={values.species}
        onClear={() => patch("photoUrl", "")}
      />
      <FieldRow label="Name" htmlFor="pet-name" required>
        <Input
          id="pet-name"
          value={values.name}
          onChange={(e) => patch("name", e.target.value)}
          placeholder="Bobo"
        />
      </FieldRow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
        <FieldRow label="Species" required>
          <Select
            value={values.species}
            onValueChange={(v) => {
              const next = v as AvatarSpecies
              if (next !== values.species) {
                patch("species", next)
                // Breeds are species-specific; clear when species changes.
                patch("breed", "")
              }
            }}
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
        </FieldRow>
        <FieldRow label="Breed" htmlFor="pet-breed">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <SearchableCombobox
                id="pet-breed"
                value={values.breed}
                onValueChange={(v) => patch("breed", v)}
                baseOptions={values.species ? BREED_OPTIONS_BY_SPECIES[values.species] : []}
                customOptions={
                  values.species ? (values.customBreedOptions[values.species] ?? []) : []
                }
                onAddCustom={(v) => {
                  if (!values.species) return
                  const species = values.species
                  patch("customBreedOptions", {
                    ...values.customBreedOptions,
                    [species]: [...(values.customBreedOptions[species] ?? []), v],
                  })
                }}
                placeholder={values.species ? "Search or add" : "Pick a species first"}
              />
            </div>
            <label
              htmlFor="pet-is-mixed"
              className="flex shrink-0 cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                id="pet-is-mixed"
                checked={values.isMixed}
                onCheckedChange={(c) => patch("isMixed", c === true)}
              />
              <span>Mixed</span>
            </label>
          </div>
        </FieldRow>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldRow label="Coat type">
          <SelectWithAddNew
            value={values.coatType}
            onValueChange={(v) => patch("coatType", v)}
            baseOptions={[
              { value: "short", label: "Short coat" },
              { value: "long", label: "Long coat" },
              { value: "wire", label: "Wire coat" },
              { value: "curly", label: "Curly coat" },
              { value: "double", label: "Double coat" },
            ]}
            customOptions={values.customCoatOptions}
            onAddCustom={(v) => patch("customCoatOptions", [...values.customCoatOptions, v])}
            placeholder="Select or add new"
          />
        </FieldRow>
        <FieldRow label="Appearance">
          <SelectWithAddNew
            value={values.appearance}
            onValueChange={(v) => patch("appearance", v)}
            baseOptions={[
              { value: "black", label: "Black" },
              { value: "gray", label: "Gray/Silver/Blue" },
              { value: "brown", label: "Brown" },
              { value: "white", label: "White/Cream" },
              { value: "red", label: "Red" },
              { value: "yellow", label: "Yellow/Golden" },
            ]}
            customOptions={values.customAppearanceOptions}
            onAddCustom={(v) =>
              patch("customAppearanceOptions", [...values.customAppearanceOptions, v])
            }
            placeholder="Select or add new"
          />
        </FieldRow>
        <FieldRow label="Sex">
          <Select value={values.gender} onValueChange={(v) => patch("gender", v)}>
            <SelectTrigger className={cn(triggerOverride, "w-full")}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Reproductive status">
          <SelectWithAddNew
            value={values.desexedStatus}
            onValueChange={(v) => patch("desexedStatus", v)}
            baseOptions={[
              { value: "spayed", label: "Spayed" },
              { value: "neutered", label: "Neutered" },
              { value: "intact", label: "Intact" },
            ]}
            customOptions={values.customDesexedOptions}
            onAddCustom={(v) => patch("customDesexedOptions", [...values.customDesexedOptions, v])}
            placeholder="Select or add new"
          />
        </FieldRow>
        <FieldRow label="Birthday" htmlFor="pet-birthday">
          <DatePicker
            id="pet-birthday"
            value={values.birthday}
            onChange={(v) => patch("birthday", v)}
            placeholder="Select date"
            disableAfter={new Date()}
          />
        </FieldRow>
        <FieldRow label="Weight">
          <div className="flex items-center gap-2">
            <Input
              value={values.weight}
              onChange={(e) => patch("weight", e.target.value)}
              placeholder="10"
              inputMode="decimal"
              className="flex-1"
            />
            <Select
              value={values.weightUnit}
              onValueChange={(v) => patch("weightUnit", v as "lb" | "kg")}
            >
              <SelectTrigger className={cn(triggerOverride, "w-28 shrink-0")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lb">Pounds</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>
        <FieldRow label="Microchip number" htmlFor="pet-chip" className="sm:col-span-2">
          <Input
            id="pet-chip"
            value={values.microchip}
            onChange={(e) => patch("microchip", e.target.value)}
            placeholder="000-000-000-000-000"
          />
        </FieldRow>
      </div>
    </SectionShell>
  )
}

function HealthSection({ values, patch }: SectionProps) {
  return (
    <SectionShell
      title="Health & care"
      description="Tags and the pet's vet. Notes live in the Documents tab on the pet detail."
    >
      <FieldRow
        label="Tags"
        description="Behavior, health flags, and grooming codes that show on appointments and the pet card."
      >
        <TagPicker
          value={values.tags}
          onChange={(next) => patch("tags", next)}
          categories={["behavior", "health", "service", "general"]}
        />
      </FieldRow>
      <div className="-mx-5 h-px bg-border/60" aria-hidden />

      <h3 className="font-heading text-base font-semibold text-foreground">Vet</h3>
      <FieldRow label="Vet name">
        <Input
          value={values.vetName}
          onChange={(e) => patch("vetName", e.target.value)}
          placeholder="Dr. Sarah Lee"
        />
      </FieldRow>
      <FieldRow label="Vet phone">
        <div className="flex items-center gap-2">
          <Select value={values.vetPhoneCode} onValueChange={(v) => patch("vetPhoneCode", v)}>
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
            inputMode="tel"
            value={values.vetPhone}
            onChange={(e) => patch("vetPhone", e.target.value)}
            placeholder="50 000 0000"
            className="min-w-0 flex-1"
          />
        </div>
      </FieldRow>
      <FieldRow label="Vet address">
        <Textarea
          value={values.vetAddress}
          onChange={(e) => patch("vetAddress", e.target.value)}
          placeholder="Clinic name, street, city"
          rows={2}
        />
      </FieldRow>
    </SectionShell>
  )
}

function FamilySection({ values, patch }: SectionProps) {
  function addOwner(owner: { id: string; name: string; phone?: string }) {
    if (values.owners.some((o) => o.id === owner.id)) return
    patch("owners", [...values.owners, owner])
  }
  function remove(id: string) {
    patch(
      "owners",
      values.owners.filter((o) => o.id !== id),
    )
  }
  return (
    <SectionShell
      title="Family"
      description="People in this pet's family. Many pets have more than one owner."
    >
      {values.owners.length === 0 ? null : (
        <ul className="flex flex-col gap-3">
          {values.owners.map((o) => (
            <li
              key={o.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
            >
              <Avatar size="md" fallback="character" name={o.name || "?"} hashSeed={o.id} />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{o.name}</span>
                {o.phone ? (
                  <span className="truncate text-xs text-muted-foreground">{o.phone}</span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                radius="full"
                aria-label="Remove family member"
                onClick={() => remove(o.id)}
              >
                <XIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AddOwnerPopover
        existingIds={values.owners.map((o) => o.id)}
        onPick={addOwner}
        onCreateNew={(name) => {
          // For v0 demo: pretend we just created a new client and link them.
          // Real flow would open the Client Edit takeover and then link the result.
          addOwner({ id: uid(), name: name || "New client" })
        }}
      />
    </SectionShell>
  )
}

function AddOwnerPopover({
  existingIds,
  onPick,
  onCreateNew,
}: {
  existingIds: string[]
  onPick: (client: { id: string; name: string; phone?: string }) => void
  onCreateNew: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = SEARCHABLE_CLIENTS.filter((c) => {
    if (existingIds.includes(c.id)) return false
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
  })

  function close() {
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" size="sm" radius="full">
          <PlusIcon />
          Add family
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-80 flex-col gap-0 p-0">
        <div className="border-b border-border/60 p-2">
          <SearchInput
            className="!h-9 w-full"
            placeholder="Search name or phone"
            aria-label="Search clients"
            defaultValue={query}
            onValueChange={setQuery}
          />
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              {q ? "No clients match." : "Start typing to search."}
            </li>
          ) : (
            filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(c)
                    close()
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm" fallback="character" name={c.name} hashSeed={c.id} />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                    {c.phone ? (
                      <span className="truncate text-xs text-muted-foreground">{c.phone}</span>
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
            onClick={() => {
              onCreateNew(query.trim())
              close()
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-cami-violet-11 transition-colors hover:bg-muted/50"
          >
            <PlusIcon className="size-4" />
            <span className="truncate">
              {query.trim() ? `Create "${query.trim()}" as new client` : "Create new client"}
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
