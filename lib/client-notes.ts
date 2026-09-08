// Client notes — Fresha's "Staff Alert" (DZ-209).
//
// Persistent, CLIENT-level context that has to resurface on every appointment
// for that client: preferences, remaining packages / credits / vouchers,
// imported history, "always ask for Dan". Distinct from the two note kinds this
// repo already had, and the distinction is the whole point:
//
//   - `MockBooking.notes` — the APPOINTMENT note. One booking, one occasion.
//     "Owner asked for extra paw moisturizer last visit."
//   - `PetNoteEntry` (lib/pet-notes) — PET notes. Travel with the animal,
//     structured category + detail, matter on every appointment for that pet.
//   - `ClientNote` (here) — CLIENT notes. Travel with the person, free text,
//     matter on every appointment for that client regardless of which pet came.
//
// Mirrors the as-built `CustomerNote` in cami-business
// (src/modules/customer/components/ClientNoteBanner.tsx) so the design surface
// and the implementation stay the same shape: content, optional author,
// timestamp, no severity field. That last absence is load-bearing — see the
// banner component for why it must not be rendered as a hazard.

export type ClientNote = {
  id: string
  clientId: string
  content: string
  /**
   * Arrives only when the backend enriches the row, so every surface has to
   * render without it.
   */
  authorName?: string
  /** ISO timestamp. Sorted on, and shown per note on non-glance surfaces. */
  createdAt: string
}

// Demo data. Deliberately a spread of the shapes real notes take, because each
// one broke a different earlier layout: a one-liner, a note long enough to run
// past two lines, a client with four notes on one afternoon (which is why the
// attribution line keeps its time), and clients with none at all.
const CLIENT_NOTES: ClientNote[] = [
  {
    id: "cn-karen-1",
    clientId: "karen-dougall",
    content: "Always asks for Aya. Do not rebook with anyone else without calling her first.",
    authorName: "Ahsan Khan",
    createdAt: "2026-09-07T17:49:00+04:00",
  },
  {
    id: "cn-karen-2",
    clientId: "karen-dougall",
    content:
      "Has 3 washes left on the 10-wash package bought in March. Reception keeps charging her full price — check the package balance before taking payment.",
    authorName: "Ahsan Khan",
    createdAt: "2026-09-07T17:52:00+04:00",
  },
  {
    id: "cn-karen-3",
    clientId: "karen-dougall",
    content: "Prefers WhatsApp over calls. Never picks up the phone.",
    authorName: "Ahsan Khan",
    createdAt: "2026-09-07T18:03:00+04:00",
  },
  {
    id: "cn-karen-4",
    clientId: "karen-dougall",
    content: "Parks in the loading bay — takes the side entrance, buzz her in.",
    createdAt: "2026-09-07T18:20:00+04:00",
  },
  {
    id: "cn-maaz-1",
    clientId: "maaz-test",
    content: "Building access needs a call from the gate — phone before arriving, not on arrival.",
    authorName: "Aya Hassan",
    createdAt: "2026-09-06T10:15:00+04:00",
  },
  {
    id: "cn-aaesha-1",
    clientId: "aaesha-al-ali",
    content: "Speaks Arabic only. Book with Nadia when possible.",
    authorName: "Maaz Shaffi",
    createdAt: "2026-08-22T13:40:00+04:00",
  },
  {
    id: "cn-luke-1",
    clientId: "luke-tan",
    content: "Card on file declined twice in August. Take payment at drop-off, not at collection.",
    authorName: "Maaz Shaffi",
    createdAt: "2026-08-29T11:10:00+04:00",
  },
  {
    id: "cn-luke-2",
    clientId: "luke-tan",
    content: "Two dogs, only ever brings Rocky. Bailey is with the other groomer.",
    authorName: "Maaz Shaffi",
    createdAt: "2026-08-14T09:30:00+04:00",
  },
  {
    id: "cn-tom-1",
    clientId: "tom-cassidy",
    content: "Imported from Fresha — 2 unused vouchers on the account, expiring 31 Dec 2026.",
    createdAt: "2026-06-02T08:00:00+04:00",
  },
  {
    id: "cn-millie-1",
    clientId: "millie-cassidy",
    content: "Tom's daughter. Bills go to Tom's account, not hers.",
    authorName: "Aya Hassan",
    createdAt: "2026-07-19T14:05:00+04:00",
  },
]

/**
 * Notes for one client, newest first. Sorting lives here rather than in each
 * surface so the preview and the profile can never disagree about which note is
 * the most recent one.
 */
export function clientNotesFor(clientId: string | null | undefined): ClientNote[] {
  if (!clientId) return []
  return CLIENT_NOTES.filter((note) => note.clientId === clientId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
