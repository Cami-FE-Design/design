import type { Package } from "@/lib/packages/catalog"

/**
 * The seeded catalog.
 *
 * Every package below exists to put one shape on screen that the old seven-field
 * model could not express:
 *
 * - **Bath & Brush 5+1** — the ordinary one-time package, and the one the rest
 *   are read against.
 * - **Full Groom 3+1** — sold at a branch that prices the groom differently, so
 *   it is the package the till's branch warning fires on.
 * - **Puppy Starter Pack** — covers three services rather than one, which is
 *   what makes coverage a set rather than a field.
 * - **Grooming Club** — **recurring**. Billed monthly until cancelled, with no
 *   single price to print, and the case the old model had no room for at all.
 * - **Spa Day, unlimited** — no session cap. The chip reads "Unlimited", and a
 *   count would be a lie.
 * - **Nail Trim 10-pack** — sold at every branch except the one that does not
 *   do nails online, which is the per-branch `onlineSales` override.
 */
export const PACKAGES: Package[] = [
  {
    id: "bath-brush-5",
    name: "Bath & Brush 5+1",
    description: "Five baths, the sixth on us.",
    services: ["bath-small"],
    sessionType: "limited",
    sessionCount: 6,
    payment: "one-time",
    validFor: "12m",
    price: 45000,
    frequency: null,
    recurringPrice: null,
    length: null,
    taxRate: "vat5",
    colour: "#6aa3e0",
    onlineSales: true,
    onlineRedemption: true,
    terms: "Sessions are non-transferable and expire 12 months from purchase.",
    createdAt: "2026-02-10",
    updatedAt: "2026-08-04",
    sales: [
      {
        customerPackageId: "cp-aaishah-1",
        code: "BB5-0417",
        customerId: "aaishah-vaza",
        customerName: "Aaishah Vaza",
        status: "active",
        sessionsTotal: 6,
        sessionsRemaining: 3,
        sessionsUsed: 3,
        purchasedAt: "2026-06-02",
        expiresAt: "2027-06-02",
        soldAtLocationId: "shampooch-jvc",
      },
      {
        customerPackageId: "cp-abbey-1",
        code: "BB5-0418",
        customerId: "abbey-mcdermaid",
        customerName: "Abbey McDermaid",
        status: "active",
        sessionsTotal: 6,
        sessionsRemaining: 1,
        sessionsUsed: 5,
        purchasedAt: "2026-05-19",
        expiresAt: "2027-05-19",
        soldAtLocationId: "shampooch-jumeirah",
      },
      {
        customerPackageId: "cp-abrar-1",
        code: "BB5-0402",
        customerId: "abrar-mohammed",
        customerName: "Abrar Mohammed",
        // Two sessions on it and out of time — the row that makes "exhausted"
        // and "expired" visibly different states rather than one grey word.
        status: "active",
        sessionsTotal: 6,
        sessionsRemaining: 2,
        sessionsUsed: 4,
        purchasedAt: "2025-01-31",
        expiresAt: "2026-01-31",
        soldAtLocationId: "shampooch-jvc",
      },
    ],
  },
  {
    id: "full-groom-3",
    name: "Full Groom 3+1",
    description: null,
    services: ["full-groom"],
    sessionType: "limited",
    sessionCount: 4,
    payment: "one-time",
    validFor: "6m",
    price: 72000,
    frequency: null,
    recurringPrice: null,
    length: null,
    taxRate: "vat5",
    colour: "#9b8bd6",
    onlineSales: true,
    onlineRedemption: true,
    terms: null,
    createdAt: "2026-03-01",
    updatedAt: "2026-07-22",
    sales: [
      {
        customerPackageId: "cp-karen-1",
        code: "FG3-0221",
        customerId: "karen-dougall",
        customerName: "Karen Dougall",
        status: "exhausted",
        sessionsTotal: 4,
        sessionsRemaining: 0,
        sessionsUsed: 4,
        purchasedAt: "2026-04-11",
        expiresAt: "2026-10-11",
        soldAtLocationId: "shampooch-jvc",
      },
      /**
       * The third status, because two of three is a legend nobody can read.
       *
       * Cancelled is not a worse Exhausted — that one did its job, this one was
       * taken back — which is why the dev repo colours them apart. Sessions left
       * on it on purpose: a package is cancelled while it still has value, and a
       * row showing zero would read as exhausted by another name.
       */
      {
        customerPackageId: "cp-hind-1",
        code: "FG3-0247",
        customerId: "hind-al-suwaidi",
        customerName: "Hind Al Suwaidi",
        status: "cancelled",
        sessionsTotal: 4,
        sessionsRemaining: 3,
        sessionsUsed: 1,
        purchasedAt: "2026-06-02",
        expiresAt: "2026-12-02",
        soldAtLocationId: "shampooch-al-majaz",
      },
    ],
  },
  {
    id: "puppy-starter",
    name: "Puppy Starter Pack",
    description: "First bath, first trim, first groom.",
    services: ["bath-small", "nail-trim", "full-groom"],
    sessionType: "limited",
    sessionCount: 5,
    payment: "one-time",
    validFor: "3m",
    price: 60000,
    frequency: null,
    recurringPrice: null,
    length: null,
    taxRate: "vat5",
    colour: "#66bb8a",
    onlineSales: true,
    onlineRedemption: true,
    terms: null,
    createdAt: "2026-04-18",
    updatedAt: "2026-04-18",
    sales: [],
  },
  {
    id: "grooming-club",
    name: "Grooming Club",
    description: "One groom a month, billed monthly.",
    services: ["full-groom", "bath-small"],
    sessionType: "limited",
    sessionCount: 1,
    payment: "recurring",
    validFor: null,
    price: null,
    frequency: "monthly",
    recurringPrice: 18000,
    length: "until-canceled",
    taxRate: "vat5",
    colour: "#e08aa8",
    onlineSales: true,
    onlineRedemption: true,
    terms: "Cancel any time; the current month is not refunded.",
    createdAt: "2026-05-06",
    updatedAt: "2026-09-01",
    sales: [
      {
        customerPackageId: "cp-millie-1",
        code: "GC-0031",
        customerId: "millie-cassidy",
        customerName: "Millie Cassidy",
        status: "active",
        sessionsTotal: 1,
        sessionsRemaining: 1,
        sessionsUsed: 0,
        purchasedAt: "2026-09-01",
        expiresAt: null,
        soldAtLocationId: "shampooch-jumeirah",
      },
    ],
  },
  {
    id: "spa-day-unlimited",
    name: "Spa Day, unlimited",
    description: "Every spa treatment, as often as they like.",
    services: ["deep-tissue"],
    sessionType: "unlimited",
    sessionCount: null,
    payment: "recurring",
    validFor: null,
    price: null,
    frequency: "monthly",
    recurringPrice: 55000,
    length: "12m",
    taxRate: "vat5",
    colour: "#4f9e8f",
    onlineSales: false,
    onlineRedemption: true,
    terms: "Sold in the salon only.",
    createdAt: "2026-06-14",
    updatedAt: "2026-08-30",
    sales: [
      {
        customerPackageId: "cp-abbie-1",
        code: "SPA-0007",
        customerId: "abbie-connelly",
        customerName: "Abbie Connelly",
        status: "active",
        sessionsTotal: null,
        sessionsRemaining: null,
        sessionsUsed: 9,
        purchasedAt: "2026-07-03",
        expiresAt: "2027-07-03",
        soldAtLocationId: "shampooch-jvc",
      },
    ],
  },
  {
    id: "nail-trim-10",
    name: "Nail Trim 10-pack",
    description: null,
    services: ["nail-trim"],
    sessionType: "limited",
    sessionCount: 10,
    payment: "one-time",
    validFor: "12m",
    price: 25000,
    frequency: null,
    recurringPrice: null,
    length: null,
    taxRate: "vat5",
    colour: "#e8c25e",
    onlineSales: true,
    // Al Quoz is boarding-led and does not take nail bookings online, so it
    // says so for itself. Every other branch still follows the business switch,
    // including one added next month (INV-13).
    onlineRedemption: true,
    terms: null,
    createdAt: "2026-01-20",
    updatedAt: "2026-09-12",
    sales: [],
  },
]

export function packageById(id: string | null | undefined): Package | undefined {
  if (!id) return undefined
  return PACKAGES.find((p) => p.id === id)
}
