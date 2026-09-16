// The vocabulary staff pick from when recording what a client likes.
//
// Preferences are the one thing on the client record that staff write and the
// *customer* reads, on their own card under "Your preferences". That is why the
// label is not a free text box.
//
// Left open, five receptionists produce "stylist", "Stylist", "fav stylist" and
// "Preferred Stylist" for one idea, and all four ship to customers — on a screen
// whose whole job is to look like the venue took care over it. A closed list
// costs a merchant the odd word they wanted and buys every customer a card that
// reads consistently.
//
// The list stays venue-neutral for the same reason typography does: one card,
// many venues. "Preferred staff" reads correctly for a salon and a groomer,
// where "Preferred stylist" only reads correctly for one of them.
//
// `OTHER` is the escape hatch, deliberately last and deliberately a separate
// step: a merchant who needs a word this list doesn't have can still have it,
// but they have to mean it.
// Allergy, Patch test and Note are deliberately NOT on this list, and that is
// the point of the list existing.
//
// They were, briefly, and it was wrong. A patch test has a date, a state and a
// consequence — you cannot book colour without a valid one — and its record
// lives under Documents. Offering it as a free-text preference meant a
// receptionist typing "On file" into a field the customer reads, with nothing
// behind it: the customer is told there is a file, and there is no file. The
// same for an allergy, which is a clinical record, not a liking.
//
// So those two are derived from their records (see `allergies` and `patchTest`
// on MockClient) and never typed here. Internal notes stay internal and do not
// reach the customer at all.
//
// What is left is what the word actually means: things this client likes, which
// have no record anywhere and need no verification.
export const PREFERENCE_LABELS = [
  "Preferred staff",
  "Handling note",
  "Product preference",
  "Contact preference",
] as const

export type PreferenceLabel = (typeof PREFERENCE_LABELS)[number]

/** Sentinel for the custom-label branch. Never stored — the typed label is. */
export const PREFERENCE_OTHER = "__other"

/** True when a stored label came from the list rather than being typed. */
export function isKnownPreferenceLabel(label: string): boolean {
  return (PREFERENCE_LABELS as ReadonlyArray<string>).includes(label)
}

/** What a row's detail field should suggest, so two rows never prompt alike. */
export function preferencePlaceholder(label: string): string {
  switch (label) {
    case "Preferred staff":
      return "Sara"
    case "Handling note":
      return "Nervous with clippers"
    case "Product preference":
      return "Fragrance-free only"
    case "Contact preference":
      return "WhatsApp before any colour change"
    default:
      return "Anything the team should know"
  }
}
