"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PET_NOTE_CATEGORIES, type PetNoteCategoryId, type PetNoteEntry } from "@/lib/pet-notes"
import { cn } from "@/lib/utils"

// Tap-first pet notes: pick the categories that apply, then say what
// specifically. Shared by the public booking flow and the staff appointment
// sheet so notes captured either way are the same shape and stay comparable.

export function PetNotesFields({
  entries,
  onEntries,
  idPrefix = "pet-notes",
  label = "Anything we should know?",
}: {
  entries: ReadonlyArray<PetNoteEntry>
  onEntries: (next: PetNoteEntry[]) => void
  idPrefix?: string
  label?: string
}) {
  const selected = new Set(entries.map((e) => e.category))

  function toggle(id: PetNoteCategoryId) {
    onEntries(
      selected.has(id)
        ? entries.filter((e) => e.category !== id)
        : // Appended, so the detail fields below stay in the order tapped
          // rather than jumping around as chips go on and off.
          [...entries, { category: id, detail: "" }],
    )
  }

  function setDetail(id: PetNoteCategoryId, detail: string) {
    onEntries(entries.map((e) => (e.category === id ? { ...e, detail } : e)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {label} <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Tap what applies — it helps us prepare before your pet arrives.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PET_NOTE_CATEGORIES.map((category) => {
          const active = selected.has(category.id)
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(category.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-cami-violet-8 bg-cami-violet-3 font-medium text-cami-violet-12"
                  : "border-border/60 text-foreground hover:bg-muted/40",
              )}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      {entries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const category = PET_NOTE_CATEGORIES.find((c) => c.id === entry.category)
            if (!category) return null
            const fieldId = `${idPrefix}-${category.id}`
            return (
              <div key={category.id} className="group flex flex-col gap-1.5">
                <Label htmlFor={fieldId}>{category.prompt}</Label>
                <Input
                  id={fieldId}
                  value={entry.detail}
                  onChange={(e) => setDetail(category.id, e.target.value)}
                  placeholder={category.placeholder}
                />
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/** Read-only rendering — one line per note, used on the detail surfaces. */
export function PetNotesList({
  entries,
  className,
}: {
  entries: ReadonlyArray<PetNoteEntry>
  className?: string
}) {
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {entries.map((entry) => (
        <li key={entry.category} className="flex flex-col leading-snug">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {PET_NOTE_CATEGORIES.find((c) => c.id === entry.category)?.label ?? entry.category}
          </span>
          <span className="text-sm text-foreground">{entry.detail}</span>
        </li>
      ))}
    </ul>
  )
}
