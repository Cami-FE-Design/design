"use client"

import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CalendarClockIcon,
  CalendarXIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  CirclePlusIcon,
  EyeOffIcon,
  FileTextIcon,
  FlagIcon,
  type LucideIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RotateCwIcon,
  TagIcon,
  ThumbsUpIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import {
  formatAed,
  formatDuration,
  MOCK_SERVICE_CATALOG,
  type MockBookingStatus,
  type MockServiceCatalogItem,
  SERVICE_CATEGORY_ACCENT,
} from "@/app/appointments/mock"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { DatePicker } from "@/components/blocks/date-picker"
import { EditServicePanel } from "@/components/blocks/edit-service-panel"
import { EmptyState } from "@/components/blocks/empty-state"
import {
  PetAndServicePickerPanel,
  type PetOption,
} from "@/components/blocks/new-appointment-pet-service-picker"
import { ServicePickerPanel } from "@/components/blocks/new-appointment-service-picker"
import { NoteDialog } from "@/components/blocks/note-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SelectedPet = {
  uid: string
  name: string
  species: AvatarSpecies
  breed: string
  weight: string
  services: SelectedService[]
}

// A service the operator has added to the new appointment. Wraps the catalog
// item with per-instance overrides (start time, staff). Time defaults to the
// appointment's start; staff defaults to "any" (renders as a stub for now).
type SelectedService = {
  uid: string
  catalog: MockServiceCatalogItem
  startTime: string
  staffName?: string
  /** Soft warnings rendered as amber pills below the service row.
   *  E.g. "Team member doesn't provide service", "Not available on this day". */
  warnings?: string[]
}

// Mock pet pool used by the demo "+ Add pet" affordance. Real implementation
// will fetch from the pet-parents directory, scoped to the selected client.
const MOCK_PET_POOL: Omit<SelectedPet, "uid" | "services">[] = [
  { name: "Bobo", species: "dog", breed: "French Bulldog", weight: "10 lbs" },
  { name: "Mochi", species: "cat", breed: "Domestic Shorthair", weight: "8 lbs" },
  { name: "Saffron", species: "other", breed: "Other", weight: "26 lbs" },
  { name: "Max", species: "dog", breed: "Labrador Retriever", weight: "65 lbs" },
]

type SelectedClient = {
  id: string
  name: string
  phone: string
}

// Mock client directory used by the demo client picker. Searchable by name
// or phone number. Real implementation reads from the pet-parents directory.
const MOCK_CLIENTS: SelectedClient[] = [
  { id: "karen-dougall", name: "Karen Dougall", phone: "+971 54 433 3592" },
  { id: "maaz-test", name: "Maaz Test You", phone: "+971 50 963 6445" },
  { id: "demo-profile", name: "Demo Profile", phone: "+1 234 567 8901" },
  { id: "aaesha-al-ali", name: "Aaesha Al Ali", phone: "+971 50 374 5511" },
  { id: "aaliyah-hazari", name: "Aaliyah Hazari", phone: "+971 52 692 6368" },
]

// Mock client → pet ownership. Real implementation reads from the
// pet-parents directory's many-to-many relationship.
const MOCK_CLIENT_PETS: Record<string, string[]> = {
  "karen-dougall": ["Bobo", "Mochi"],
  "maaz-test": ["Saffron"],
  "demo-profile": ["Max"],
  "aaesha-al-ali": ["Max"],
}

function normalizePhone(s: string): string {
  return s.replace(/\s|-|\(|\)/g, "")
}

// Reverse lookup: which client owns this pet? Returns the first owner found
// (per memory, pet ⇄ client is many-to-many in v0 — we pick the first match).
function findClientForPet(petName: string): SelectedClient | null {
  for (const [clientId, petNames] of Object.entries(MOCK_CLIENT_PETS)) {
    if (petNames.includes(petName)) {
      return MOCK_CLIENTS.find((c) => c.id === clientId) ?? null
    }
  }
  return null
}

/**
 * When a client is selected, return only their pets minus the ones already on
 * this appointment. When no client is selected (walk-in), return the full
 * pool minus already-attached pets.
 */
function computeAvailablePets(client: SelectedClient | null, attached: SelectedPet[]): PetOption[] {
  const attachedNames = new Set(attached.map((p) => p.name).filter(Boolean))
  const pool = client
    ? MOCK_PET_POOL.filter((p) => (MOCK_CLIENT_PETS[client.id] ?? []).includes(p.name))
    : MOCK_PET_POOL
  return pool.filter((p) => !attachedNames.has(p.name))
}

// Default pet + services seeded into the sheet for design review. Lets us
// iterate on the populated layout without clicking through the picker every
// reload. Replace with [] once persistence + picker are real.
function defaultPets(startTime: string): SelectedPet[] {
  const fullGroom = MOCK_SERVICE_CATALOG.find((s) => s.id === "full-grooming-md")
  const washBlow = MOCK_SERVICE_CATALOG.find((s) => s.id === "wash-blow-sm")
  if (!fullGroom || !washBlow) return []
  return [
    {
      uid: "seed-bobo",
      ...MOCK_PET_POOL[0]!,
      services: [
        { uid: "seed-full-groom", catalog: fullGroom, startTime, staffName: "Sophie" },
        {
          uid: "seed-wash-blow",
          catalog: washBlow,
          startTime: "11:30",
          staffName: "Aisha",
          warnings: ["Team member doesn't provide service"],
        },
      ],
    },
  ]
}

type StatusOption = {
  value: MockBookingStatus
  label: string
  Icon: LucideIcon
  destructive?: boolean
}

// Menu order mirrors Fresha: Booked → Confirmed → Arrived → Started → No-show
// → Cancel. "Completed" is intentionally omitted — it's reached automatically
// after a service is delivered, not a forward-action the operator picks.
type RepeatFrequency = "no-repeat" | "daily" | "weekly" | "monthly" | "custom"
type RepeatUnit = "day" | "week" | "month"
type RepeatEnds = "never" | "after" | "specific-date"

type RepeatConfig = {
  frequency: RepeatFrequency
  customInterval: number
  customUnit: RepeatUnit
  ends: RepeatEnds
  endsAfter: number
  endsDate: string
}

const REPEAT_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: "no-repeat", label: "Doesn't repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "custom", label: "Custom" },
]

const UNIT_LABEL: Record<RepeatUnit, string> = { day: "Day", week: "Week", month: "Month" }

// Number-of-times options shown in the "Ends" dropdown — 2..15 then 20/25/30.
const AFTER_TIMES_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30]

function repeatLabel(config: RepeatConfig): string {
  if (config.frequency === "custom") {
    const unit = config.customUnit
    const plural = config.customInterval === 1 ? unit : `${unit}s`
    return `every ${config.customInterval} ${plural}`
  }
  const base = REPEAT_OPTIONS.find((o) => o.value === config.frequency)?.label ?? "Doesn't repeat"
  return base.toLowerCase()
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: "booked", label: "Booked", Icon: CalendarClockIcon },
  { value: "confirmed", label: "Confirmed", Icon: ThumbsUpIcon },
  { value: "checked-in", label: "Arrived", Icon: MapPinIcon },
  { value: "ready-for-pickup", label: "Started", Icon: PlayIcon },
  { value: "no-show", label: "No-show", Icon: EyeOffIcon, destructive: true },
  { value: "cancelled", label: "Canceled", Icon: CalendarXIcon, destructive: true },
]

// Hero-header palette. Passive/done states use pastel fill tokens (step 5/6)
// paired with foreground (step 12). Active states (Confirmed, Started) use the
// saturated step 9 — Confirmed = Cami brand violet with white text; Started =
// lime/9 with lime/12 dark text (lime/9 is too bright for white per Radix
// contrast guidance, same rule as yellow/amber). No-show keeps tomato/8 for
// destructive weight. `checked-in` (Arrived) sits at lime/5 pastel — revisit
// once that state gets its own token.
const STATUS_THEME: Record<MockBookingStatus, { fill: string; text: string; subText: string }> = {
  booked: { fill: "bg-blue-5", text: "text-blue-12", subText: "text-blue-12/70" },
  confirmed: { fill: "bg-lime-5", text: "text-lime-12", subText: "text-lime-12/70" },
  "checked-in": { fill: "bg-lime-3", text: "text-lime-12", subText: "text-lime-12/70" },
  "ready-for-pickup": { fill: "bg-lime-9", text: "text-lime-12", subText: "text-lime-12/70" },
  completed: { fill: "bg-cami-gray-6", text: "text-cami-gray-12", subText: "text-cami-gray-12/70" },
  cancelled: { fill: "bg-olive-5", text: "text-olive-12", subText: "text-olive-12/70" },
  "no-show": { fill: "bg-tomato-8", text: "text-tomato-12", subText: "text-tomato-12/70" },
}

type NewAppointmentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ISO date for the appointment slot the user clicked from (defaults today). */
  date: string
  /** HH:mm 24h start time. */
  startTime?: string
  /** Pet-business mode: shows client + pet picker. Without-pets is the generic shell. */
  hasPets?: boolean
}

export function NewAppointmentSheet({
  open,
  onOpenChange,
  date,
  startTime = "10:00",
  hasPets = true,
}: NewAppointmentSheetProps) {
  const [status, setStatus] = useState<MockBookingStatus>("booked")
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(null)
  const [pets, setPets] = useState<SelectedPet[]>(() => defaultPets(startTime))
  const availablePets = computeAvailablePets(selectedClient, pets)
  const [note, setNote] = useState<string | null>(null)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [petPendingDelete, setPetPendingDelete] = useState<string | null>(null)
  const [petBeingEdited, setPetBeingEdited] = useState<string | null>(null)
  const [activePetUid, setActivePetUid] = useState<string | null>(null)
  const [mode, setMode] = useState<
    "appointment" | "select-service" | "select-pet-and-service" | "edit-service" | "edit-repeating"
  >("appointment")
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(() => ({
    frequency: "no-repeat",
    customInterval: 1,
    customUnit: "week",
    ends: "never",
    endsAfter: 2,
    endsDate: date,
  }))
  const [editingServiceUid, setEditingServiceUid] = useState<string | null>(null)
  const [editingPetUid, setEditingPetUid] = useState<string | null>(null)
  // Tracks why the service picker was opened. "add" appends a new service to
  // activePetUid; "swap" replaces the catalog on the editing service.
  const [pickerIntent, setPickerIntent] = useState<"add" | "swap">("add")

  const theme = STATUS_THEME[status]
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? STATUS_FALLBACK_LABEL[status]
  const dateLabel = formatHeaderDate(date)
  const timeLabel = formatTime(startTime)
  const totalMinor = pets.reduce(
    (sum, pet) => sum + pet.services.reduce((s, svc) => s + svc.catalog.priceMinor, 0),
    0,
  )
  const totalServices = pets.reduce((n, pet) => n + pet.services.length, 0)
  const canSave = totalServices > 0
  const editingPet = pets.find((p) => p.uid === editingPetUid) ?? null
  const editingService = editingPet?.services.find((s) => s.uid === editingServiceUid) ?? null

  function handleOpenServicePicker(petUid: string) {
    setActivePetUid(petUid)
    setPickerIntent("add")
    setMode("select-service")
  }

  function handleOpenSwapServicePicker() {
    setPickerIntent("swap")
    setMode("select-service")
  }

  function handlePickServiceFromPicker(catalog: MockServiceCatalogItem) {
    if (pickerIntent === "swap" && editingPetUid && editingServiceUid) {
      // Swap the catalog on the editing service, preserving its duration override
      // (durationMin comes from catalog; user can re-adjust in the edit panel).
      setPets((prev) =>
        prev.map((pet) =>
          pet.uid === editingPetUid
            ? {
                ...pet,
                services: pet.services.map((s) =>
                  s.uid === editingServiceUid ? { ...s, catalog } : s,
                ),
              }
            : pet,
        ),
      )
      setMode("edit-service")
      return
    }
    const targetUid = activePetUid ?? pets[0]?.uid
    if (!targetUid) return
    setPets((prev) =>
      prev.map((pet) =>
        pet.uid === targetUid
          ? {
              ...pet,
              services: [
                ...pet.services,
                {
                  uid: `${catalog.id}-${Date.now()}`,
                  catalog,
                  startTime,
                },
              ],
            }
          : pet,
      ),
    )
    setMode("appointment")
  }

  function handleRemoveService(petUid: string, serviceUid: string) {
    setPets((prev) => {
      const updated = prev.map((pet) =>
        pet.uid === petUid
          ? { ...pet, services: pet.services.filter((s) => s.uid !== serviceUid) }
          : pet,
      )
      // A detached pet with no services left isn't worth keeping around.
      return updated.filter((p) => !(p.name === "" && p.services.length === 0))
    })
  }

  function handleEditService(petUid: string, serviceUid: string) {
    setEditingPetUid(petUid)
    setEditingServiceUid(serviceUid)
    setMode("edit-service")
  }

  function handleUpdateService(updated: SelectedService) {
    if (!editingPetUid) return
    setPets((prev) =>
      prev.map((pet) =>
        pet.uid === editingPetUid
          ? {
              ...pet,
              services: pet.services.map((s) => (s.uid === updated.uid ? updated : s)),
            }
          : pet,
      ),
    )
    setMode("appointment")
    setEditingPetUid(null)
    setEditingServiceUid(null)
  }

  function handleDeleteEditingService() {
    if (!editingPetUid || !editingServiceUid) return
    handleRemoveService(editingPetUid, editingServiceUid)
    setMode("appointment")
    setEditingPetUid(null)
    setEditingServiceUid(null)
  }

  function handleAttachPet(petUid: string, option: PetOption) {
    setPets((prev) =>
      prev.map((p) =>
        p.uid === petUid
          ? {
              ...p,
              name: option.name,
              species: option.species,
              breed: option.breed,
              weight: option.weight,
            }
          : p,
      ),
    )
    // Auto-attach the pet's owner if no client is set yet.
    if (!selectedClient) {
      const owner = findClientForPet(option.name)
      if (owner) setSelectedClient(owner)
    }
  }

  function handleDetachPet(petUid: string) {
    // Strip the pet's identity but keep its services. If a detached entry
    // already exists, merge this pet's services into it and drop this entry —
    // we only ever want ONE "Select pet" slot on the appointment.
    // If the pet has no services to leave behind, just drop the entry: an
    // empty detached row isn't worth showing.
    setPets((prev) => {
      const target = prev.find((p) => p.uid === petUid)
      if (!target) return prev
      if (target.services.length === 0) {
        return prev.filter((p) => p.uid !== petUid)
      }
      const existingDetached = prev.find((p) => p.uid !== petUid && p.name === "")
      if (existingDetached) {
        return prev
          .map((p) =>
            p.uid === existingDetached.uid
              ? { ...p, services: [...p.services, ...target.services] }
              : p,
          )
          .filter((p) => p.uid !== petUid)
      }
      return prev.map((p) =>
        p.uid === petUid ? { ...p, name: "", species: "other", breed: "", weight: "" } : p,
      )
    })
  }

  function handleConfirmDeletePet() {
    if (!petPendingDelete) return
    setPets((prev) => prev.filter((p) => p.uid !== petPendingDelete))
    setPetPendingDelete(null)
  }

  function handleOpenAddPet() {
    setActivePetUid(null)
    setMode("select-pet-and-service")
  }

  function handleSavePetAndServices(pet: PetOption, services: MockServiceCatalogItem[]) {
    const newUid = `pet-${Date.now()}`
    setPets((prev) => [
      ...prev,
      {
        uid: newUid,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        weight: pet.weight,
        services: services.map((catalog) => ({
          uid: `${catalog.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          catalog,
          startTime,
        })),
      },
    ])
    // Auto-attach the pet's owner if no client is set yet.
    if (!selectedClient) {
      const owner = findClientForPet(pet.name)
      if (owner) setSelectedClient(owner)
    }
    setMode("appointment")
  }

  function handleSheetOpenChange(next: boolean) {
    if (!next) {
      // Reset transient state on close so the next "Add" lands on a fresh sheet
      // with the demo seed pet + services re-applied.
      setPets(defaultPets(startTime))
      setActivePetUid(null)
      setStatus("booked")
      setMode("appointment")
    }
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[480px] max-w-[480px] flex-col gap-0 overflow-hidden p-0"
      >
        <SheetTitle className="sr-only">
          {mode === "appointment" ? "New appointment" : "Select a service"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Create a new appointment for {dateLabel} at {timeLabel}.
        </SheetDescription>

        {mode === "select-service" ? (
          <ServicePickerPanel
            onBack={() => setMode(pickerIntent === "swap" ? "edit-service" : "appointment")}
            onSelectService={handlePickServiceFromPicker}
          />
        ) : mode === "select-pet-and-service" ? (
          <PetAndServicePickerPanel
            availablePets={availablePets}
            onBack={() => setMode("appointment")}
            onSave={handleSavePetAndServices}
          />
        ) : mode === "edit-repeating" ? (
          <EditRepeatingPanel
            value={repeatConfig}
            onApply={(next) => {
              setRepeatConfig(next)
              setMode("appointment")
            }}
            onBack={() => setMode("appointment")}
          />
        ) : mode === "edit-service" && editingPet && editingService ? (
          <EditServicePanel
            service={editingService}
            onBack={() => {
              setMode("appointment")
              setEditingPetUid(null)
              setEditingServiceUid(null)
            }}
            onApply={handleUpdateService}
            onDelete={handleDeleteEditingService}
            onChangeService={handleOpenSwapServicePicker}
          />
        ) : (
          <>
            <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
              <SheetClose asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                  <ChevronsRightIcon />
                </Button>
              </SheetClose>
            </header>
            <header
              data-slot="appointment-sheet-header"
              className="flex items-center gap-3 bg-sand-2 px-6 py-7 text-foreground"
            >
              <DateAvatarCard date={date} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <button
                  type="button"
                  className="self-start truncate text-[22px] font-semibold leading-7 tracking-tight hover:opacity-90"
                  aria-label="Change date"
                >
                  {dateLabel}
                </button>
                <div className="text-xs leading-4 text-muted-foreground">
                  <button type="button" className="font-medium hover:underline">
                    {timeLabel}
                  </button>
                  <span aria-hidden>, </span>
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setMode("edit-repeating")}
                  >
                    {repeatLabel(repeatConfig)}
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
                      aria-label="Quick actions"
                    >
                      <MoreHorizontalIcon className="size-5" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={() => setNoteDialogOpen(true)}>
                      <FileTextIcon className="size-4" aria-hidden />
                      {note ? "Edit note" : "Add a note"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-sand-2 px-6 py-5">
              {hasPets ? (
                <ClientPicker
                  selected={selectedClient}
                  onSelect={setSelectedClient}
                  onClear={() => setSelectedClient(null)}
                />
              ) : null}

              <section data-slot="services-section" className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold leading-7 text-foreground">Services</h2>
                {hasPets ? (
                  pets.length === 0 ? (
                    <EmptyServicesCard onAdd={handleOpenAddPet} />
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4">
                        {pets.map((pet, idx) => (
                          <div key={pet.uid} className="flex flex-col gap-4">
                            {idx > 0 ? <div className="h-px bg-border/60" aria-hidden /> : null}
                            <PetServiceGroup
                              pet={pet}
                              availablePets={availablePets}
                              onAttachPet={(option) => handleAttachPet(pet.uid, option)}
                              onAddMore={() => handleOpenServicePicker(pet.uid)}
                              onRemoveService={(serviceUid) =>
                                handleRemoveService(pet.uid, serviceUid)
                              }
                              onEditService={(serviceUid) => handleEditService(pet.uid, serviceUid)}
                              onRemovePet={() => handleDetachPet(pet.uid)}
                              onEditPet={() => setPetBeingEdited(pet.uid)}
                              onDeletePet={() => setPetPendingDelete(pet.uid)}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddPet}
                        className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-muted/40 px-3 text-left text-muted-foreground transition-colors hover:bg-muted/60"
                      >
                        <CirclePlusIcon className="size-4 shrink-0" aria-hidden />
                        <span className="text-sm leading-5">Add pet</span>
                      </button>
                    </>
                  )
                ) : totalServices === 0 ? (
                  <EmptyServicesCard onAdd={() => handleOpenServicePicker(pets[0]?.uid ?? "")} />
                ) : (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
                    <ServiceRowList
                      services={pets[0]?.services ?? []}
                      onRemoveService={(serviceUid) =>
                        handleRemoveService(pets[0]?.uid ?? "", serviceUid)
                      }
                      onEditService={(serviceUid) =>
                        handleEditService(pets[0]?.uid ?? "", serviceUid)
                      }
                    />
                    <ServiceGroupActions
                      onAddMore={() => handleOpenServicePicker(pets[0]?.uid ?? "")}
                    />
                  </div>
                )}
              </section>

              {note !== null ? (
                <section data-slot="notes-section" className="flex flex-col gap-3">
                  <h2 className="text-lg font-semibold leading-7 text-foreground">Notes</h2>
                  <div className="group/note relative rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/30">
                    <button
                      type="button"
                      onClick={() => setNoteDialogOpen(true)}
                      className="block w-full pr-20 text-start text-sm text-foreground"
                    >
                      {note || "Empty note — click to edit"}
                    </button>
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover/note:opacity-100 group-focus-within/note:opacity-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            radius="full"
                            onClick={() => setNoteDialogOpen(true)}
                            aria-label="Edit note"
                          >
                            <PencilIcon className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            radius="full"
                            onClick={() => setNote(null)}
                            aria-label="Delete note"
                          >
                            <Trash2Icon className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </section>
              ) : null}

              <section data-slot="payment-policy-section" className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold leading-7 text-foreground">Payment policy</h2>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Requires confirmation
                    </span>
                    <span className="text-xs text-muted-foreground">
                      No upcoming appointment yet.
                    </span>
                  </div>
                  <Button variant="outline" size="icon-sm" radius="full" aria-label="Edit policy">
                    <MoreHorizontalIcon className="size-4" aria-hidden />
                  </Button>
                </div>
              </section>
            </div>

            <footer
              data-slot="appointment-sheet-footer"
              className="border-t border-border bg-card px-6 py-4"
            >
              {hasPets ? (
                <Button radius="full" disabled={!canSave} className="w-full">
                  Save
                </Button>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
                    >
                      {totalServices > 0 ? formatAed(totalMinor) : "Full payment added"}
                      <ChevronRightIcon className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" radius="full">
                      Checkout
                    </Button>
                    <Button radius="full" disabled={!canSave}>
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </footer>
          </>
        )}
      </SheetContent>
      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        initialValue={note}
        onSave={(v) => setNote(v)}
        onDelete={() => setNote(null)}
      />
      <ConfirmDialog
        open={petPendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPetPendingDelete(null)
        }}
        title="Delete this pet?"
        description="This permanently removes the pet's profile from your business — not just from this appointment. Their history, notes, and any future bookings will be lost."
        confirmLabel="Delete pet"
        destructive
        onConfirm={handleConfirmDeletePet}
      />
      <PetEditSheet
        open={petBeingEdited !== null}
        onOpenChange={(next) => {
          if (!next) setPetBeingEdited(null)
        }}
        mode="edit"
        initial={(() => {
          const p = pets.find((p) => p.uid === petBeingEdited)
          return p ? { name: p.name, species: p.species, breed: p.breed } : undefined
        })()}
      />
    </Sheet>
  )
}

function EditRepeatingPanel({
  value,
  onApply,
  onBack,
}: {
  value: RepeatConfig
  onApply: (next: RepeatConfig) => void
  onBack: () => void
}) {
  const [local, setLocal] = useState<RepeatConfig>(value)
  const triggerClass = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

  const endsValue =
    local.ends === "never"
      ? "never"
      : local.ends === "specific-date"
        ? "specific-date"
        : `after-${local.endsAfter}`

  function handleEndsChange(v: string) {
    if (v === "never") setLocal({ ...local, ends: "never" })
    else if (v === "specific-date") setLocal({ ...local, ends: "specific-date" })
    else if (v.startsWith("after-")) {
      const n = Number(v.slice(6))
      setLocal({ ...local, ends: "after", endsAfter: n })
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon />
          Back
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-sand-2 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground">
          Edit repeating options
        </h2>

        <div className="flex flex-col gap-2">
          <Label>Frequency</Label>
          <Select
            value={local.frequency}
            onValueChange={(v) => setLocal({ ...local, frequency: v as RepeatFrequency })}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPEAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {local.frequency === "custom" ? (
          <div className="flex flex-col gap-2">
            <Label>Every</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                value={local.customInterval}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    customInterval: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-24"
              />
              <Select
                value={local.customUnit}
                onValueChange={(v) => setLocal({ ...local, customUnit: v as RepeatUnit })}
              >
                <SelectTrigger className={cn(triggerClass, "flex-1")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["day", "week", "month"] as RepeatUnit[]).map((u) => (
                    <SelectItem key={u} value={u}>
                      {UNIT_LABEL[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {local.frequency !== "no-repeat" ? (
          <div className="flex flex-col gap-2">
            <Label>Ends</Label>
            <Select value={endsValue} onValueChange={handleEndsChange}>
              <SelectTrigger className={triggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                {AFTER_TIMES_OPTIONS.map((n) => (
                  <SelectItem key={n} value={`after-${n}`}>
                    After {n} times
                  </SelectItem>
                ))}
                <SelectItem value="specific-date">Specific date</SelectItem>
              </SelectContent>
            </Select>
            {local.ends === "specific-date" ? (
              <DatePicker
                value={local.endsDate}
                onChange={(next) => setLocal({ ...local, endsDate: next })}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-end border-t border-border/60 bg-card px-6 py-4">
        <Button type="button" radius="full" onClick={() => onApply(local)} className="w-full">
          Apply changes
        </Button>
      </footer>
    </div>
  )
}

function DetachedPetPicker({
  availablePets,
  onAttach,
}: {
  availablePets: PetOption[]
  onAttach: (option: PetOption) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const filtered = q ? availablePets.filter((p) => p.name.toLowerCase().includes(q)) : availablePets
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2.5 text-start transition-colors hover:bg-muted/40"
        >
          <div
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full border border-dashed border-border bg-muted/30 text-muted-foreground"
          >
            <PlusIcon className="size-4" />
          </div>
          <span className="flex-1 truncate text-sm font-medium text-muted-foreground">
            Select pet
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] gap-2 p-2 supports-backdrop-filter:backdrop-blur-[8px]"
      >
        <SearchInput size="lg" onValueChange={setQuery} placeholder="Search pets" />
        <ul className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No pets found.</li>
          ) : (
            filtered.map((option) => (
              <li key={option.name}>
                <button
                  type="button"
                  onClick={() => {
                    onAttach(option)
                    setOpen(false)
                    setQuery("")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/50"
                >
                  <Avatar
                    name={option.name}
                    fallback="species"
                    species={option.species}
                    size="sm"
                    shape="circle"
                  />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">{option.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {option.breed} · {option.weight}
                    </span>
                  </div>
                </button>
              </li>
            ))
          )}
          <li className="mt-1 border-t border-border/60 pt-1">
            <button
              type="button"
              // TODO: open "Add new pet" flow
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-cami-violet-11 transition-colors hover:bg-muted/50"
            >
              <PlusIcon className="size-4" aria-hidden />
              New pet
            </button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function PetServiceGroup({
  pet,
  availablePets,
  onAttachPet,
  onAddMore,
  onRemoveService,
  onEditService,
  onRemovePet,
  onEditPet,
  onDeletePet,
}: {
  pet: SelectedPet
  availablePets: PetOption[]
  onAttachPet: (option: PetOption) => void
  onAddMore: () => void
  onRemoveService: (serviceUid: string) => void
  onEditService: (serviceUid: string) => void
  onRemovePet: () => void
  onEditPet: () => void
  onDeletePet: () => void
}) {
  const detached = pet.name === ""
  return (
    <div className="flex flex-col gap-3">
      {detached ? (
        <DetachedPetPicker availablePets={availablePets} onAttach={onAttachPet} />
      ) : (
        <header className="flex items-center gap-2">
          <Avatar
            name={pet.name}
            fallback="species"
            species={pet.species}
            size="md"
            shape="circle"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">{pet.name}</span>
            <span className="text-xs text-muted-foreground">
              {pet.breed} · {pet.weight}
            </span>
          </div>
        </header>
      )}
      {pet.services.length > 0 ? (
        <ServiceRowList
          services={pet.services}
          onRemoveService={onRemoveService}
          onEditService={onEditService}
        />
      ) : null}
      <ServiceGroupActions
        onAddMore={onAddMore}
        onRemovePet={onRemovePet}
        onEditPet={onEditPet}
        onDeletePet={onDeletePet}
      />
    </div>
  )
}

function ServiceRowList({
  services,
  onRemoveService,
  onEditService,
}: {
  services: SelectedService[]
  onRemoveService: (uid: string) => void
  onEditService: (uid: string) => void
}) {
  return (
    <ul className="-mx-3 flex flex-col gap-1">
      {services.map((s) => (
        <li
          key={s.uid}
          className="group/service flex gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50"
        >
          <span
            aria-hidden
            className={cn(
              "w-1 shrink-0 self-stretch rounded-full",
              SERVICE_CATEGORY_ACCENT[s.catalog.category],
            )}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-base font-semibold text-foreground">{s.catalog.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime(s.startTime)} · {formatDuration(s.catalog.durationMin)} ·{" "}
                  {s.staffName ?? "Any team member"}
                </span>
              </div>
              <div className="relative flex shrink-0 items-center leading-tight">
                <span className="text-base font-semibold leading-tight tabular-nums text-foreground transition-opacity group-hover/service:invisible">
                  {formatAed(s.catalog.priceMinor)}
                </span>
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover/service:opacity-100 group-focus-within/service:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        radius="full"
                        onClick={() => onEditService(s.uid)}
                        aria-label={`Edit ${s.catalog.name}`}
                      >
                        <PencilIcon className="size-4" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        radius="full"
                        onClick={() => onRemoveService(s.uid)}
                        aria-label={`Remove ${s.catalog.name}`}
                      >
                        <Trash2Icon className="size-4" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            {s.warnings && s.warnings.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {s.warnings.map((w) => (
                  <ServiceWarningPill key={w} text={w} />
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyServicesCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <EmptyState
        icon={TagIcon}
        title="Add a service to save the appointment"
        action={
          <Button type="button" variant="outline" radius="full" size="sm" onClick={onAdd}>
            <CirclePlusIcon className="size-4" aria-hidden />
            Add service
          </Button>
        }
      />
    </div>
  )
}

function ServiceWarningPill({ text }: { text: string }) {
  return (
    <Badge variant="warning" size="md">
      <AlertCircleIcon aria-hidden />
      {text}
    </Badge>
  )
}

function ServiceGroupActions({
  onAddMore,
  onRemovePet,
  onAddStaffAlert,
  onEditPet,
  onDeletePet,
}: {
  onAddMore: () => void
  onRemovePet?: () => void
  onAddStaffAlert?: () => void
  onEditPet?: () => void
  onDeletePet?: () => void
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" radius="full">
            Action
            <ChevronDownIcon className="size-4 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onSelect={() => onRemovePet?.()}>
            <RotateCwIcon className="size-4" aria-hidden />
            Remove pet
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAddStaffAlert?.()}>
            <FlagIcon className="size-4" aria-hidden />
            Add staff alert
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onEditPet?.()}>Edit pet details</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDeletePet?.()}>
            Delete pet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" variant="outline" size="sm" radius="full" onClick={onAddMore}>
        <CirclePlusIcon className="size-4" aria-hidden />
        Add service
      </Button>
    </div>
  )
}

function DateAvatarCard({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`)
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  const day = d.getDate()
  return (
    <div
      data-slot="date-avatar-card"
      aria-hidden
      className="flex h-12 w-[3rem] shrink-0 flex-col overflow-hidden rounded-[9px] bg-background text-foreground shadow-[0_0_0_2px_var(--background)]"
    >
      <div className="bg-black/10 py-[3px] text-center font-bold text-[9px] tracking-tight text-foreground/50 leading-none">
        {month}
      </div>
      <div className="flex flex-1 items-center justify-center font-bold text-2xl leading-none text-foreground/70">
        {day}
      </div>
    </div>
  )
}

function ClientPicker({
  selected,
  onSelect,
  onClear,
}: {
  selected: SelectedClient | null
  onSelect: (client: SelectedClient) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const qPhone = normalizePhone(q)
  const filtered = q
    ? MOCK_CLIENTS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || (qPhone && normalizePhone(c.phone).includes(qPhone)),
      )
    : MOCK_CLIENTS
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2.5 text-start transition-colors hover:bg-muted/40"
        >
          {selected ? (
            <>
              <Avatar name={selected.name} fallback="character" size="md" shape="circle" />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-foreground">
                  {selected.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">{selected.phone}</span>
              </div>
            </>
          ) : (
            <>
              <div
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full border border-dashed border-border bg-muted/30 text-muted-foreground"
              >
                <PlusIcon className="size-4" />
              </div>
              <span className="flex-1 truncate text-sm font-medium text-muted-foreground">
                Add client
              </span>
            </>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] gap-2 p-2 supports-backdrop-filter:backdrop-blur-[8px]"
      >
        <SearchInput size="lg" onValueChange={setQuery} placeholder="Search by name or phone" />
        <ul className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No clients found.</li>
          ) : (
            filtered.map((client) => (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(client)
                    setOpen(false)
                    setQuery("")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/50"
                >
                  <Avatar name={client.name} fallback="character" size="sm" shape="circle" />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">{client.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{client.phone}</span>
                  </div>
                </button>
              </li>
            ))
          )}
          <li className="mt-1 border-t border-border/60 pt-1">
            <button
              type="button"
              // TODO: open "Add new client" full-screen takeover
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-cami-violet-11 transition-colors hover:bg-muted/50"
            >
              <PlusIcon className="size-4" aria-hidden />
              New client
            </button>
          </li>
          {selected ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setOpen(false)
                  setQuery("")
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-destructive transition-colors hover:bg-destructive/10"
              >
                <XIcon className="size-4" aria-hidden />
                Remove client
              </button>
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

// "2026-05-13" → "Wed, 13 May"
function formatHeaderDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const day = d.getDate()
  const month = d.toLocaleDateString("en-GB", { month: "short" })
  return `${weekday}, ${day} ${month}`
}

// "10:00" → "10:00AM"
function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":")
  const h = Number(hStr)
  const period = h >= 12 ? "PM" : "AM"
  const display = ((h + 11) % 12) + 1
  return `${display}:${mStr ?? "00"}${period}`
}

// Status labels for values not exposed in the dropdown (e.g. `completed` is
// reached automatically, never picked from the menu, but still needs a pill
// label if the sheet opens against an existing booking in that state).
const STATUS_FALLBACK_LABEL: Record<MockBookingStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  "checked-in": "Arrived",
  "ready-for-pickup": "Started",
  completed: "Completed",
  cancelled: "Canceled",
  "no-show": "No-show",
}
