// Mock catalog + money helpers for the "Add to cart" flow (PRO-395).
//
// Prices are tax-inclusive and stored in fils (minor units). The breakdown is
// back-calculated so Subtotal + Tax always equals Total exactly (ticket edge
// case: "Rounding under tax-inclusive math").

import type {
  AppointmentItem,
  CartLine,
  CatalogClient,
  ProductCategory,
  ProductItem,
  ServiceCategory,
  ServiceItem,
  Staff,
} from "./types"

// ─── Venue config (read from venue settings in production, not hard-coded) ────

export const CURRENCY = "AED"
/** UAE default VAT rate. Sourced from venue config; do not hard-code in the UI. */
export const VAT_RATE = 0.05
/** Block the CTA when no client is attached. Per-venue toggle. */
export const CLIENT_REQUIRED = false
/**
 * Whether this partner manages pets. Drives the appointment-card subject row:
 * with-pets shows the pet (avatar + breed · weight), without-pets shows the
 * client (avatar + phone). See [[project_cami_business_types]].
 */
export const HAS_PETS = true

// ─── Money ────────────────────────────────────────────────────────────────────

/** Format fils as a tax-inclusive "AED 25" string (whole units, like sales). */
export function money(minor: number): string {
  const aed = Math.round(minor / 100)
  if (aed < 0) return `- ${CURRENCY} ${Math.abs(aed).toLocaleString("en-US")}`
  return `${CURRENCY} ${aed.toLocaleString("en-US")}`
}

/** Format fils as "AED 118.80" — always 2 decimals (tips, payment totals). */
export function formatAedDecimal(minor: number): string {
  const aed = minor / 100
  return `${CURRENCY} ${aed.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDuration(durationMin: number): string {
  if (durationMin < 60) return `${durationMin}min`
  const h = Math.floor(durationMin / 60)
  const m = durationMin % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

export type CartTotals = {
  /** Sum of line prices, tax-inclusive (matches collapsed Total). */
  totalMinor: number
  /** Back-calculated ex-VAT subtotal. */
  subtotalMinor: number
  /** Back-calculated VAT, = total − subtotal (rounding-safe). */
  taxMinor: number
}

/** Back-calculate the VAT breakdown from tax-inclusive line totals. */
export function totals(lines: CartLine[]): CartTotals {
  const totalMinor = lines.reduce((sum, l) => sum + l.priceMinor * l.qty, 0)
  const subtotalMinor = Math.round(totalMinor / (1 + VAT_RATE))
  return { totalMinor, subtotalMinor, taxMinor: totalMinor - subtotalMinor }
}

// ─── Staff ──────────────────────────────────────────────────────────────────

export const STAFF: Staff[] = [
  { id: "any", name: "Any" },
  { id: "maz", name: "Maz" },
  { id: "lena", name: "Lena" },
  { id: "priya", name: "Priya" },
  { id: "sara", name: "Sara" },
]

// ─── Clients ──────────────────────────────────────────────────────────────────

export const CLIENTS: CatalogClient[] = [
  { id: "maaz-test", name: "Maaz Test", phone: "+971 50 963 6445" },
  {
    id: "aaishah-vaza",
    name: "Aaishah Vaza",
    phone: "+44 7938 894210",
    email: "aaishahpatel2000@mail.com",
  },
  {
    id: "abbey-mcdermaid",
    name: "Abbey Mcdermaid",
    phone: "+971 50 447 6804",
    email: "abbeyxmcx@yahoo.co.uk",
  },
  { id: "abbey-mitchell", name: "Abbey Mitchell", phone: "+971 58 598 4293" },
  {
    id: "abbie-connelly",
    name: "Abbie Connelly",
    phone: "+44 7757 337517",
    email: "abbieconnelly@msn.com",
    photoUrl: "https://i.pravatar.cc/120?img=47",
  },
  { id: "abby-moses", name: "Abby Moses", phone: "+971 58 564 9303" },
  { id: "abrar-mohammed", name: "Abrar Mohammed", phone: "+966 55 043 7944" },
  {
    id: "adriana-martino",
    name: "Adriana Martino",
    phone: "+971 50 113 2280",
    email: "adrianamartino1998@gmail.com",
    tags: ["High spender"],
  },
  { id: "bilal-haddad", name: "Bilal Haddad", phone: "+971 52 901 7733" },
  { id: "carla-mendez", name: "Carla Mendez", phone: "+971 55 220 8841" },
]

// ─── Service catalog ──────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "nails", label: "Nails", accent: "bg-cami-violet-9" },
  { id: "staff", label: "Staff Services", accent: "bg-gold-9" },
  { id: "massage", label: "Massage", accent: "bg-cami-sage-9" },
  { id: "hair", label: "Hair", accent: "bg-cami-pink-9" },
]

export const SERVICES: ServiceItem[] = [
  { id: "staff-nails", categoryId: "staff", name: "Staff Nails", durationMin: 60, priceMinor: 0 },
  {
    id: "biab-ext",
    categoryId: "nails",
    name: "Biab with Nail Extensions",
    durationMin: 90,
    priceMinor: 38500,
  },
  {
    id: "acrylic-infill",
    categoryId: "nails",
    name: "Acrylic Nail infill for hands/toes",
    durationMin: 90,
    priceMinor: 25000,
  },
  {
    id: "acrylic-full",
    categoryId: "nails",
    name: "Acrylic Nails Full Set hand",
    durationMin: 150,
    priceMinor: 28500,
  },
  {
    id: "ext-repair",
    categoryId: "nails",
    name: "Nail Extension Repair",
    durationMin: 45,
    priceMinor: 3000,
  },
  {
    id: "nail-art-per",
    categoryId: "nails",
    name: "Nail Art PER nail",
    durationMin: 10,
    priceMinor: 2000,
  },
  {
    id: "swedish-massage",
    categoryId: "massage",
    name: "Swedish Massage 60min",
    durationMin: 60,
    priceMinor: 22000,
  },
  {
    id: "deep-tissue",
    categoryId: "massage",
    name: "Deep Tissue Massage",
    durationMin: 90,
    priceMinor: 32000,
  },
  {
    id: "blow-dry",
    categoryId: "hair",
    name: "Blow Dry & Style",
    durationMin: 45,
    priceMinor: 12000,
  },
  {
    id: "cut-finish",
    categoryId: "hair",
    name: "Cut & Finish",
    durationMin: 60,
    priceMinor: 18000,
  },
]

export function serviceCountLabel(categoryId: string): number {
  return SERVICES.filter((s) => s.categoryId === categoryId).length
}

// ─── Product catalog ──────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "hair", label: "Hair Products", count: "99+" },
  { id: "skincare", label: "Skincare", count: "89" },
  { id: "nails", label: "Nail Care", count: "24" },
  { id: "tools", label: "Tools & Equipment", count: "12" },
]

export const PRODUCTS: ProductItem[] = [
  {
    id: "abc-cleanser",
    categoryId: "hair",
    name: "ABC Bare Cleanser Shampoo",
    size: "300ml",
    priceMinor: 13000,
  },
  {
    id: "abc-conditioner",
    categoryId: "hair",
    name: "ABC Bare Conditioner",
    size: "300ml",
    priceMinor: 13500,
  },
  {
    id: "argan-oil",
    categoryId: "hair",
    name: "Argan Repair Oil",
    size: "50ml",
    priceMinor: 9000,
  },
  {
    id: "vitc-serum",
    categoryId: "skincare",
    name: "Vitamin C Brightening Serum",
    size: "30ml",
    priceMinor: 21000,
  },
  {
    id: "spf-fluid",
    categoryId: "skincare",
    name: "Daily SPF 50 Fluid",
    size: "50ml",
    priceMinor: 16000,
  },
  {
    id: "cuticle-oil",
    categoryId: "nails",
    name: "Nourishing Cuticle Oil",
    size: "15ml",
    priceMinor: 4500,
  },
  { id: "nail-file", categoryId: "tools", name: "Professional Nail File", priceMinor: 1500 },
]

export function productCountLabel(categoryId: string): number {
  return PRODUCTS.filter((p) => p.categoryId === categoryId).length
}

// ─── Appointments (Upcoming today) ────────────────────────────────────────────

export const APPOINTMENTS: AppointmentItem[] = [
  {
    id: "appt-1",
    clientId: "adriana-martino",
    clientName: "Adriana Martino",
    start: "9:00am",
    end: "11:00am",
    location: "Shampooch JVC",
    status: "Booked",
    pet: { name: "Bobo", breed: "French Bulldog", weight: "10 lbs", species: "dog" },
    lines: [
      {
        serviceId: "acrylic-full",
        name: "Acrylic Nails Full Set hand",
        durationMin: 150,
        staffName: "Lena",
        priceMinor: 28500,
      },
      {
        serviceId: "nail-art-per",
        name: "Nail Art PER nail",
        durationMin: 10,
        staffName: "Lena",
        priceMinor: 2000,
      },
    ],
  },
  {
    id: "appt-2",
    clientId: "bilal-haddad",
    clientName: "Bilal Haddad",
    start: "11:30am",
    end: "12:30pm",
    location: "Shampooch JVC",
    status: "Booked",
    pet: { name: "Rex", breed: "Beagle", weight: "22 lbs", species: "dog" },
    lines: [
      {
        serviceId: "cut-finish",
        name: "Cut & Finish",
        durationMin: 60,
        staffName: "Priya",
        priceMinor: 18000,
        warnings: ["Team member doesn't provide this service"],
      },
    ],
  },
  {
    id: "appt-3",
    clientId: "carla-mendez",
    clientName: "Carla Mendez",
    start: "2:00pm",
    end: "3:30pm",
    location: "Shampooch JVC",
    status: "Booked",
    pet: { name: "Milo", breed: "Persian Cat", weight: "9 lbs", species: "cat" },
    lines: [
      {
        serviceId: "biab-ext",
        name: "Biab with Nail Extensions",
        durationMin: 90,
        staffName: "Sara",
        priceMinor: 38500,
      },
    ],
  },
]

export function appointmentTotalMinor(appt: AppointmentItem): number {
  return appt.lines.reduce((sum, l) => sum + l.priceMinor, 0)
}
