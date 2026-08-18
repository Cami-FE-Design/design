// Structured pet notes.
//
// Replaces the single free-text "Anything we should know?" box. A blank box
// gets skipped, or filled with prose nobody can filter on; tappable categories
// keep it fast for the parent and give groomers consistent, comparable data.
//
// "Other" exists as a genuine fallback for the case none of the categories fit
// — not as the default catch-all everything ends up in.

export type PetNoteCategoryId =
  | "allergies"
  | "behavior"
  | "medical"
  | "handling"
  | "grooming-sensitivity"
  | "other"

export type PetNoteCategory = {
  id: PetNoteCategoryId
  /** Chip label. */
  label: string
  /** Question shown above the detail field once the chip is tapped. */
  prompt: string
  placeholder: string
}

export const PET_NOTE_CATEGORIES: ReadonlyArray<PetNoteCategory> = [
  {
    id: "allergies",
    label: "Allergies",
    prompt: "Which allergies?",
    placeholder: "e.g. chicken, oatmeal shampoo",
  },
  {
    id: "behavior",
    label: "Behavior / aggression",
    prompt: "What should we watch for?",
    placeholder: "e.g. snaps when the dryer starts",
  },
  {
    id: "medical",
    label: "Medical condition",
    prompt: "Which condition?",
    placeholder: "e.g. epilepsy, recent surgery",
  },
  {
    id: "handling",
    label: "Handling instructions",
    prompt: "How should we handle them?",
    placeholder: "e.g. sensitive paws, needs a muzzle",
  },
  {
    id: "grooming-sensitivity",
    label: "Grooming sensitivity",
    prompt: "What are they sensitive to?",
    placeholder: "e.g. sensitive skin, mats easily",
  },
  {
    id: "other",
    label: "Other",
    prompt: "What should we know?",
    placeholder: "Anything that doesn't fit above",
  },
]

/** One selected category plus the specifics the parent typed for it. */
export type PetNoteEntry = {
  category: PetNoteCategoryId
  detail: string
}

export function petNoteLabel(id: PetNoteCategoryId): string {
  return PET_NOTE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

/**
 * A selected chip with no specifics is no better than the blank box it
 * replaced, so the detail is required before the flow moves on.
 */
export function petNotesComplete(entries: ReadonlyArray<PetNoteEntry>): boolean {
  return entries.every((e) => e.detail.trim().length > 0)
}

/** Flattened for compact surfaces — a calendar hover panel, an email row. */
export function formatPetNotes(entries: ReadonlyArray<PetNoteEntry>): string {
  return entries
    .filter((e) => e.detail.trim().length > 0)
    .map((e) => `${petNoteLabel(e.category)}: ${e.detail.trim()}`)
    .join(" · ")
}
