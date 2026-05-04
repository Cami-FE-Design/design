import type { Emirate } from "@/lib/business-profile"

export type BusinessStatus = "active" | "suspended" | "archived"
export type PilotStatus = "onboarding" | "active" | "ended"

export const REASON_CODES = [
  { id: "owner_request", label: "Owner request" },
  { id: "off_platform", label: "Off-platform / paused" },
  { id: "business_closed", label: "Business closed" },
  { id: "fraud", label: "Fraud or abuse" },
  { id: "other", label: "Other" },
] as const

export type ReasonCodeId = (typeof REASON_CODES)[number]["id"]

export type AuditEvent = {
  id: string
  at: string
  actor: string
  action: string
  detail?: string
}

export type AdminBusiness = {
  id: string
  name: string
  slug: string
  ownerName: string
  ownerEmail: string
  status: BusinessStatus
  pilotStatus: PilotStatus
  createdAt: string
  lastActivityAt: string | null
  staffCount: number
  staffPreview: string[]
  servicesCount: number
  servicesPreview: string[]
  street: string
  city: string
  emirate: Emirate
  phone: string
  email: string
  vatNumber?: string
  reasonCode?: ReasonCodeId
  reasonNote?: string
  audit: AuditEvent[]
}

export const adminBusinesses: AdminBusiness[] = [
  {
    id: "biz_shampooch",
    name: "Shampooch JVC",
    slug: "shampooch-jvc",
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    status: "active",
    pilotStatus: "active",
    createdAt: "2026-03-04T09:12:00Z",
    lastActivityAt: "2026-05-03T07:48:00Z",
    staffCount: 4,
    staffPreview: ["Maz Khan", "Sara Park", "Beth Carter", "Ahmed N."],
    servicesCount: 6,
    servicesPreview: ["Full groom", "Bath & brush", "Nail trim"],
    street: "Al Ghozlan 4, Jumeirah Village Circle",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 50 123 4567",
    email: "hello@shampooch.ae",
    vatNumber: "100123456700003",
    audit: [
      { id: "a1", at: "2026-05-03T07:48:00Z", actor: "Maz Khan", action: "Logged in" },
      {
        id: "a2",
        at: "2026-05-02T18:21:00Z",
        actor: "Sara Park",
        action: "Confirmed booking",
        detail: "Mochi (toy poodle) — full groom",
      },
      {
        id: "a3",
        at: "2026-04-29T11:05:00Z",
        actor: "Maz Khan",
        action: "Edited service",
        detail: "Full groom — price",
      },
      { id: "a4", at: "2026-04-28T14:32:00Z", actor: "Sara Park", action: "Added staff member" },
      {
        id: "a5",
        at: "2026-04-23T09:00:00Z",
        actor: "Cami HQ (Michelle)",
        action: "Created Pet Business",
      },
    ],
  },
  {
    id: "biz_pawhaus",
    name: "Pawhaus Boarding",
    slug: "pawhaus",
    ownerName: "Layla Saeed",
    ownerEmail: "layla@pawhaus.ae",
    status: "active",
    pilotStatus: "active",
    createdAt: "2026-03-18T10:00:00Z",
    lastActivityAt: "2026-05-02T17:14:00Z",
    staffCount: 3,
    staffPreview: ["Layla Saeed", "Hamza Ali", "Riya Mehta"],
    servicesCount: 4,
    servicesPreview: ["Overnight boarding", "Day care", "Pickup & drop"],
    street: "Warehouse 22, Al Quoz 3",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 56 222 1188",
    email: "hello@pawhaus.ae",
    vatNumber: "100876543200003",
    audit: [
      { id: "b1", at: "2026-05-02T17:14:00Z", actor: "Layla Saeed", action: "Logged in" },
      {
        id: "b2",
        at: "2026-04-30T08:11:00Z",
        actor: "Layla Saeed",
        action: "Updated business hours",
      },
    ],
  },
  {
    id: "biz_velvetpaw",
    name: "Velvet Paw Spa",
    slug: "velvet-paw",
    ownerName: "Noura Al Marzooqi",
    ownerEmail: "noura@velvetpaw.ae",
    status: "active",
    pilotStatus: "onboarding",
    createdAt: "2026-04-21T14:00:00Z",
    lastActivityAt: "2026-04-22T09:42:00Z",
    staffCount: 1,
    staffPreview: ["Noura Al Marzooqi"],
    servicesCount: 0,
    servicesPreview: [],
    street: "City Walk Block 8, Unit 12",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 52 800 4400",
    email: "noura@velvetpaw.ae",
    audit: [
      { id: "c1", at: "2026-04-22T09:42:00Z", actor: "Noura Al Marzooqi", action: "Logged in" },
      {
        id: "c2",
        at: "2026-04-21T14:00:00Z",
        actor: "Cami HQ (Michelle)",
        action: "Created Pet Business",
      },
    ],
  },
  {
    id: "biz_doggos",
    name: "Doggos Daycare",
    slug: "doggos",
    ownerName: "Faisal Rahman",
    ownerEmail: "faisal@doggos.ae",
    status: "suspended",
    pilotStatus: "active",
    createdAt: "2026-02-12T09:00:00Z",
    lastActivityAt: "2026-04-15T11:30:00Z",
    staffCount: 2,
    staffPreview: ["Faisal Rahman", "Mira Joseph"],
    servicesCount: 3,
    servicesPreview: ["Day care", "Half-day", "Walks"],
    street: "Mirdif Hills Block C, Shop 4",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 55 776 9012",
    email: "hello@doggos.ae",
    reasonCode: "off_platform",
    reasonNote: "Owner is taking bookings off-platform during Eid promotion.",
    audit: [
      {
        id: "d1",
        at: "2026-04-18T10:08:00Z",
        actor: "Cami HQ (Michelle)",
        action: "Suspended account",
        detail: "Off-platform / paused",
      },
      { id: "d2", at: "2026-04-15T11:30:00Z", actor: "Faisal Rahman", action: "Logged in" },
    ],
  },
  {
    id: "biz_furrytales",
    name: "Furry Tales Grooming",
    slug: "furry-tales",
    ownerName: "Priya Anand",
    ownerEmail: "priya@furrytales.ae",
    status: "archived",
    pilotStatus: "ended",
    createdAt: "2026-01-08T08:00:00Z",
    lastActivityAt: "2026-03-21T16:55:00Z",
    staffCount: 2,
    staffPreview: ["Priya Anand", "Kabir N."],
    servicesCount: 5,
    servicesPreview: ["Full groom", "De-shed", "Nail trim"],
    street: "Studio 3, Al Barsha 2",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 50 444 8821",
    email: "hello@furrytales.ae",
    reasonCode: "business_closed",
    reasonNote: "Owner closed the storefront and joined another business.",
    audit: [
      {
        id: "e1",
        at: "2026-03-22T09:00:00Z",
        actor: "Cami HQ (Michelle)",
        action: "Archived account",
        detail: "Business closed",
      },
    ],
  },
]

export function findBusinessBySlug(slug: string): AdminBusiness | undefined {
  return adminBusinesses.find((b) => b.slug === slug)
}

const statusBadgeStyles: Record<BusinessStatus, string> = {
  active: "bg-cami-green-3 text-cami-green-11",
  suspended: "bg-tomato-3 text-tomato-11",
  archived: "bg-sand-3 text-sand-11",
}

const statusLabels: Record<BusinessStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
}

export function statusBadge(status: BusinessStatus) {
  return { className: statusBadgeStyles[status], label: statusLabels[status] }
}

const pilotBadgeStyles: Record<PilotStatus, string> = {
  onboarding: "bg-cami-violet-3 text-cami-violet-11",
  active: "bg-cami-sage-3 text-cami-sage-11",
  ended: "bg-sand-3 text-sand-11",
}

const pilotLabels: Record<PilotStatus, string> = {
  onboarding: "Onboarding",
  active: "Active pilot",
  ended: "Pilot ended",
}

export function pilotBadge(pilot: PilotStatus) {
  return { className: pilotBadgeStyles[pilot], label: pilotLabels[pilot] }
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "Never"
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = now - then
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} mo ago`
  const years = Math.round(months / 12)
  return `${years} yr ago`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
