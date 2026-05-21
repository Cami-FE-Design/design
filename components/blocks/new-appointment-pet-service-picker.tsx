"use client"

import { AlertCircleIcon, ArrowLeftIcon, ChevronDownIcon, PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"

import {
  formatAed,
  formatDuration,
  MOCK_SERVICE_CATALOG,
  type MockServiceCatalogItem,
  type MockServiceCategory,
  SERVICE_CATEGORY_ACCENT,
  SERVICE_CATEGORY_LABEL,
} from "@/app/appointments/mock"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type PetOption = {
  name: string
  species: AvatarSpecies
  breed: string
  weight: string
}

type PetAndServicePickerPanelProps = {
  /** Pets the operator can pick from (typically client's pets minus those already on the appointment). */
  availablePets: PetOption[]
  onBack: () => void
  onSave: (pet: PetOption, services: MockServiceCatalogItem[]) => void
}

export function PetAndServicePickerPanel({
  availablePets,
  onBack,
  onSave,
}: PetAndServicePickerPanelProps) {
  const [selectedPet, setSelectedPet] = useState<PetOption | null>(availablePets[0] ?? null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const grouped = useMemo(() => {
    const byCategory = new Map<MockServiceCategory, MockServiceCatalogItem[]>()
    for (const item of MOCK_SERVICE_CATALOG) {
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return Array.from(byCategory.entries())
  }, [])

  const selectedServices = useMemo(
    () => MOCK_SERVICE_CATALOG.filter((s) => selectedIds.has(s.id)),
    [selectedIds],
  )

  function toggleService(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleSave() {
    if (!selectedPet) return
    onSave(selectedPet, selectedServices)
  }

  const canSave = selectedPet !== null

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
          Select pet and service
        </h2>

        <PetSelector available={availablePets} selected={selectedPet} onSelect={setSelectedPet} />

        <div className="flex flex-col gap-6">
          {grouped.map(([category, items]) => (
            <ServiceCheckGroup
              key={category}
              category={category}
              items={items}
              selectedIds={selectedIds}
              onToggle={toggleService}
            />
          ))}
        </div>
      </div>

      <footer className="flex items-center gap-3 border-t border-border/60 bg-card px-6 py-4">
        <Button type="button" variant="secondary" radius="full" onClick={onBack} className="flex-1">
          Cancel
        </Button>
        <Button
          type="button"
          radius="full"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1"
        >
          Save
          {selectedServices.length > 0 ? (
            <span className="ms-1 text-xs opacity-80">({selectedServices.length})</span>
          ) : null}
        </Button>
      </footer>
    </div>
  )
}

function PetSelector({
  available,
  selected,
  onSelect,
}: {
  available: PetOption[]
  selected: PetOption | null
  onSelect: (pet: PetOption) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group/pet-selector flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 text-start transition-colors hover:bg-muted/40"
        >
          {selected ? (
            <>
              <Avatar
                name={selected.name}
                fallback="species"
                species={selected.species}
                size="md"
                shape="circle"
              />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-foreground">
                  {selected.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selected.breed} · {selected.weight}
                </span>
              </div>
            </>
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">Select pet</span>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {available.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No more pets to add.</div>
        ) : (
          available.map((pet) => (
            <DropdownMenuItem
              key={pet.name}
              onSelect={() => onSelect(pet)}
              className="items-center gap-2.5"
            >
              <Avatar
                name={pet.name}
                fallback="species"
                species={pet.species}
                size="sm"
                shape="circle"
              />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{pet.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {pet.breed} · {pet.weight}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuItem
          // TODO: open the "create new pet" flow
          onSelect={(e) => e.preventDefault()}
          className="text-cami-violet-11"
        >
          <PlusIcon className="size-4" aria-hidden />
          New pet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PickerWarningPill({ text }: { text: string }) {
  return (
    <Badge variant="warning" size="md">
      <AlertCircleIcon aria-hidden />
      {text}
    </Badge>
  )
}

function ServiceCheckGroup({
  category,
  items,
  selectedIds,
  onToggle,
}: {
  category: MockServiceCategory
  items: MockServiceCatalogItem[]
  selectedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {SERVICE_CATEGORY_LABEL[category]}
        <Badge variant="muted" className="rounded-full">
          {items.length}
        </Badge>
      </h3>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const checked = selectedIds.has(item.id)
          return (
            <li key={item.id}>
              <label
                htmlFor={`pet-service-${item.id}`}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition-colors",
                  checked
                    ? "bg-cami-gray-2 outline-2 outline-cami-gray-8 -outline-offset-2"
                    : "hover:bg-muted/40",
                )}
              >
                <Checkbox
                  id={`pet-service-${item.id}`}
                  size="lg"
                  checked={checked}
                  onCheckedChange={(v) => onToggle(item.id, v === true)}
                />
                <span
                  aria-hidden
                  className={cn(
                    "w-1 shrink-0 self-stretch rounded-full",
                    SERVICE_CATEGORY_ACCENT[item.category],
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2 py-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-base font-semibold text-foreground">
                        {item.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(item.durationMin)}
                      </span>
                    </div>
                    <span className="shrink-0 text-base font-semibold leading-tight tabular-nums text-foreground">
                      {formatAed(item.priceMinor)}
                    </span>
                  </div>
                  {item.warnings && item.warnings.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.warnings.map((w) => (
                        <PickerWarningPill key={w} text={w} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
