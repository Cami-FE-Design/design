import type { AvatarSpecies } from "@/components/ui/avatar"

export type MockPet = {
  id: string
  name: string
  species: AvatarSpecies
}

/**
 * Allergies as a recorded state, not a list that happens to be empty.
 *
 * "No known allergies" is a thing a member of staff asked about and wrote down;
 * an empty list is a thing nobody has got to yet. They look identical in a
 * database and mean opposite things at the chair, so they are different states
 * here. The client's own card says which one it is, because "we have nothing"
 * and "we asked, and there's nothing" are not the same reassurance.
 */
export type ClientAllergies = {
  status: "none-known" | "recorded"
  items: Array<{
    id: string
    name: string
    /** What happens. Free text in salon words, not a clinical code list. */
    reaction?: string
    severity?: "mild" | "moderate" | "severe"
  }>
}

/**
 * A patch test records two independent things, and collapsing them loses one.
 *
 * `result` is how the test went — it can be pending, and a pending test is not
 * a pass. `testedOn` is when, and whether it is still current is *derived* from
 * that, never stored: a stored "expired" flag is wrong the day after somebody
 * forgets to update it. See `patchTestState`.
 */
export type ClientPatchTest = {
  /** What was tested, e.g. "Tint patch test". */
  title?: string
  result: "pending" | "passed" | "failed"
  /** ISO date the test was done. */
  testedOn: string
  testedBy?: string
}

/** How long a passed patch test stays current. */
export const PATCH_TEST_VALID_MONTHS = 6

export type PatchTestState = "pending" | "failed" | "valid" | "expired"

/**
 * What a patch test means today. Derived, so it cannot go stale — which is the
 * whole reason expiry is not a field.
 */
export function patchTestState(test: ClientPatchTest, now = new Date()): PatchTestState {
  if (test.result === "pending") return "pending"
  if (test.result === "failed") return "failed"
  return patchTestExpiry(test) > now ? "valid" : "expired"
}

export function patchTestExpiry(test: ClientPatchTest): Date {
  const tested = new Date(test.testedOn)
  const expiry = new Date(tested)
  expiry.setMonth(expiry.getMonth() + PATCH_TEST_VALID_MONTHS)
  return expiry
}

export function formatPatchTestDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export type MockClient = {
  id: string
  name: string
  email?: string
  phone?: string
  /** Photo URL when available; otherwise the character avatar is hashed off id. */
  photoUrl?: string
  pets: MockPet[]
  salesAed: number
  createdAt: string
  /** Tag IDs from `TAG_LIBRARY`. */
  tags?: string[]
  /**
   * Profile fields the detail dialog's Overview surfaces (Client Card brief,
   * task 1). Optional on purpose — a client the front desk added from a phone
   * call has a name and nothing else, and Overview has to read correctly for
   * them too, not only for the fully-filled demo record.
   */
  /** Short locality for the Overview chip row, e.g. "Marina, Dubai". */
  locality?: string
  /** How they found the business. Mirrors the Source field under Details. */
  source?: string
  /** Active packages and passes. */
  packages?: Array<{ id: string; name: string; usedVisits: number; totalVisits: number }>
  /** Loyalty balance in points. Absent or 0 = this client has none. */
  loyaltyPoints?: number
  /** Unspent gift card value, in AED. */
  giftCardAed?: number
  /** Membership tier name, e.g. "Gold". Absent = not a member. */
  membershipTier?: string
  /**
   * Staff-maintained, customer-visible. The one field on this record that both
   * faces of the client card render and only one of them may write: reception
   * edits it, the customer reads it. Free-form label/value because what a venue
   * keeps varies — a salon records a patch test, a groomer records handling.
   */
  preferences?: Array<{ id: string; label: string; value: string }>
  /**
   * Clinical records, not preferences — which is why they are their own fields
   * and not rows anyone types.
   *
   * Both surface on the customer's card and both are read-only there: an
   * allergy is about the client, and a patch test is something they need to
   * know the state of before they can book colour. Neither is typed into the
   * customer-visible summary by hand, because "On file" typed by a receptionist
   * is a claim with nothing behind it.
   */
  allergies?: ClientAllergies
  patchTest?: ClientPatchTest
  // ── Details tab ────────────────────────────────────────────────────────────
  // Everything below was hardcoded into the Details tab and rendered the same
  // for all 15 clients, including a Los Angeles home address on a UAE account.
  // Harmless while Overview was hardcoded too; a contradiction inside one
  // dialog once Overview started reading the record.
  birthday?: string
  gender?: string
  country?: string
  addresses?: Array<{ id: string; label: string; line: string }>
  contacts?: Array<{
    id: string
    relationship: string
    name: string
    phone?: string
    email?: string
  }>
}

export const MOCK_CLIENTS: MockClient[] = [
  // Sota's client, not Shampooch's — he is here because this file is the demo
  // client directory and the repo has one. He is the record the Client Card
  // brief is written against: open /clients?client=maaz-shaffi for the operator
  // face and /sota/card for the customer face of these same fields.
  {
    id: "maaz-shaffi",
    name: "Maaz Shaffi",
    email: "maaz@getcami.io",
    phone: "+971 50 963 6445",
    pets: [],
    salesAed: 4237,
    createdAt: "2026-01-15",
    tags: ["client-vip"],
    locality: "Marina, Dubai",
    source: "Instagram",
    packages: [{ id: "pkg-colour-6", name: "Colour package", usedVisits: 3, totalVisits: 6 }],
    loyaltyPoints: 320,
    giftCardAed: 150,
    membershipTier: "Gold",
    preferences: [
      { id: "stylist", label: "Preferred staff", value: "Sara" },
      { id: "scalp", label: "Handling note", value: "Sensitive scalp — no heat on the roots" },
    ],
    patchTest: {
      title: "Tint patch test",
      result: "passed",
      testedOn: "2026-08-12",
      testedBy: "Sara",
    },
    allergies: { status: "none-known", items: [] },
    birthday: "Sep 9",
    gender: "Male",
    country: "United Arab Emirates",
    addresses: [{ id: "home", label: "Home", line: "Marina Promenade, Dubai Marina, Dubai, AE" }],
    contacts: [
      { id: "pickup", relationship: "Partner", name: "Hareem Rehan", phone: "+971 50 411 8820" },
    ],
  },
  {
    id: "millie-cassidy",
    name: "Millie Cassidy",
    email: "millie@example.com",
    phone: "+971 58 509 9313",
    pets: [
      { id: "bobo", name: "Bobo", species: "dog" },
      { id: "mochi", name: "Mochi", species: "cat" },
      { id: "kiwi", name: "Kiwi", species: "bird" },
    ],
    salesAed: 1840,
    createdAt: "2026-02-10",
    tags: ["client-vip", "client-loyal"],
    locality: "Jumeirah Village Circle, Dubai",
    source: "Instagram",
    // Three, so the card's collapse gets looked at. A client holding a groom
    // package, a nail pass and a daycare block at once is ordinary.
    packages: [
      { id: "pkg-groom-5", name: "Grooming package", usedVisits: 2, totalVisits: 5 },
      { id: "pkg-nails-6", name: "Nail trim pass", usedVisits: 5, totalVisits: 6 },
      { id: "pkg-daycare-10", name: "Daycare 10-day block", usedVisits: 1, totalVisits: 10 },
    ],
    loyaltyPoints: 320,
    giftCardAed: 75,
    membershipTier: "Gold",
    preferences: [
      { id: "groomer", label: "Preferred staff", value: "Sophie" },
      { id: "handling", label: "Handling note", value: "Bobo is nervous with clippers" },
      { id: "contact", label: "Contact preference", value: "Ask before any coat change" },
    ],
    allergies: {
      status: "recorded",
      items: [
        {
          id: "oat",
          name: "Oat-based shampoo",
          reaction: "Itching and redness",
          severity: "moderate",
        },
      ],
    },
    birthday: "May 14",
    gender: "Female",
    country: "United Arab Emirates",
    addresses: [
      { id: "home", label: "Home", line: "Al Ghozlan 4, Jumeirah Village Circle, Dubai, AE" },
      { id: "work", label: "Work", line: "JVC Tower 4, Apt 1102, Dubai, AE" },
    ],
    contacts: [
      {
        id: "emergency",
        relationship: "Emergency",
        name: "Tom Cassidy",
        phone: "+971 50 222 1133",
        email: "tom@example.com",
      },
      { id: "pickup", relationship: "Pickup", name: "Sarah Johnson", phone: "+971 55 555 0001" },
    ],
  },
  {
    id: "kirsty-dingomal",
    name: "Kirsty Dingomal",
    email: "kirsty.dingomal@hotmail.co.uk",
    phone: "+44 7508 219989",
    pets: [{ id: "biscuit", name: "Biscuit", species: "dog" }],
    salesAed: 0,
    createdAt: "2026-05-10",
    source: "Google",
    country: "United Kingdom",
    preferences: [{ id: "handling", label: "Handling note", value: "Puppy — first groom" }],
    patchTest: { title: "Tint patch test", result: "pending", testedOn: "2026-05-22" },
  },
  {
    id: "tom-cassidy",
    name: "Tom Cassidy",
    phone: "+971 50 222 1133",
    pets: [
      { id: "bobo", name: "Bobo", species: "dog" },
      { id: "luna", name: "Luna", species: "cat" },
    ],
    salesAed: 320,
    createdAt: "2026-03-01",
    locality: "Al Barsha, Dubai",
    source: "Referral",
    packages: [{ id: "pkg-bath-10", name: "Bath pass", usedVisits: 7, totalVisits: 10 }],
    giftCardAed: 40,
    birthday: "Nov 2",
    gender: "Male",
    country: "United Arab Emirates",
    addresses: [{ id: "home", label: "Home", line: "Al Barsha 2, Villa 14, Dubai, AE" }],
    preferences: [
      { id: "groomer", label: "Preferred staff", value: "Sophie" },
      { id: "dryer", label: "Handling note", value: "Luna hates the dryer — towel finish" },
    ],
    patchTest: { title: "Tint patch test", result: "passed", testedOn: "2026-01-03" },
  },
  {
    id: "charmaine-hayes",
    name: "Charmaine Hayes",
    email: "charmaine_hayes@icloud.com",
    phone: "+44 7960 969062",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "grace-kent",
    name: "Grace Kent",
    phone: "+971 58 566 5998",
    pets: [{ id: "pepper", name: "Pepper", species: "rabbit" }],
    salesAed: 280,
    createdAt: "2026-01-10",
  },
  {
    id: "test-michelle",
    name: "test michelle",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "lisa-lyons-wilson",
    name: "Lisa Lyons Wilson",
    email: "lisalyonswilson@gmail.com",
    phone: "+971 54 265 9265",
    pets: [{ id: "ralph", name: "Ralph", species: "dog" }],
    salesAed: 1240,
    createdAt: "2026-04-01",
    tags: ["client-loyal", "client-tipper"],
  },
  {
    id: "amy",
    name: "Amy",
    pets: [
      { id: "tofu", name: "Tofu", species: "cat" },
      { id: "muffin", name: "Muffin", species: "cat" },
    ],
    salesAed: 100,
    createdAt: "2026-01-28",
  },
  {
    id: "nadia-martinez",
    name: "Nadia Martinez",
    email: "nadiamartinezheredia@gmail.com",
    phone: "+971 52 115 6075",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-07",
  },
  {
    id: "luke",
    name: "Luke",
    phone: "+971 52 155 0516",
    pets: [
      { id: "shadow", name: "Shadow", species: "dog" },
      { id: "rocky", name: "Rocky", species: "dog" },
      { id: "mango", name: "Mango", species: "bird" },
      { id: "ginger", name: "Ginger", species: "cat" },
    ],
    salesAed: 2480,
    createdAt: "2026-04-05",
  },
  {
    id: "violetta",
    name: "Violetta",
    phone: "+971 52 155 0516",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-05",
  },
  {
    id: "evie-lelliott",
    name: "Evie Lelliott",
    email: "evie_lelliott@hotmail.co.uk",
    phone: "+44 7464 931681",
    pets: [{ id: "olive", name: "Olive", species: "rabbit" }],
    salesAed: 540,
    createdAt: "2026-05-04",
  },
  {
    id: "jamielee-haggerty",
    name: "Jamielee Haggerty",
    phone: "+971 58 550 6552",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-03",
  },
  {
    id: "frances",
    name: "Frances",
    phone: "+971 58 597 2103",
    pets: [{ id: "duke", name: "Duke", species: "dog" }],
    salesAed: 1400,
    createdAt: "2026-05-02",
    tags: ["client-walk-in"],
  },
  {
    id: "karen-dougall",
    name: "Karen Dougall",
    phone: "+971 54 433 3592",
    pets: [
      { id: "pickle", name: "Pickle", species: "cat" },
      { id: "willow", name: "Willow", species: "dog" },
    ],
    salesAed: 3013,
    createdAt: "2026-03-10",
    tags: ["client-vip", "client-tipper"],
  },
]

export function formatAed(value: number): string {
  if (value === 0) return "AED 0"
  return `AED ${value.toLocaleString("en-US")}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}
