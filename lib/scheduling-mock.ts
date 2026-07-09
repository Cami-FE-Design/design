// Shared mock data for the resource-scheduling + availability surfaces
// (Rooms & Spaces epic + staff working hours). Sota-shaped: a grooming salon
// with rooms, stations, and a small team.

export type ResourceType = "Room" | "Station" | "Bath" | "Bay" | "Kennel" | "Equipment"

export type Resource = {
  id: string
  name: string
  type: ResourceType
  capacity: number
  color: string // cami scale token suffix, e.g. "violet"
  services: ReadonlyArray<string>
}

export const RESOURCES: ReadonlyArray<Resource> = [
  {
    id: "r1",
    name: "Grooming Bay 1",
    type: "Bay",
    capacity: 1,
    color: "violet",
    services: ["Full groom", "Bath & brush"],
  },
  {
    id: "r2",
    name: "Grooming Bay 2",
    type: "Bay",
    capacity: 1,
    color: "green",
    services: ["Full groom", "Bath & brush"],
  },
  {
    id: "r3",
    name: "Bath Station",
    type: "Bath",
    capacity: 2,
    color: "sage",
    services: ["Bath & brush", "Nail trim"],
  },
  {
    id: "r4",
    name: "Cat Room",
    type: "Room",
    capacity: 1,
    color: "pink",
    services: ["Cat grooming"],
  },
  {
    id: "r5",
    name: "Daycare Hall",
    type: "Room",
    capacity: 12,
    color: "yellow",
    services: ["Daycare"],
  },
]

export const RESOURCE_TYPES: ReadonlyArray<ResourceType> = [
  "Room",
  "Station",
  "Bath",
  "Bay",
  "Kennel",
  "Equipment",
]

// Service → required resource map (Service ↔ resource requirement).
export type ServiceRequirement = {
  service: string
  durationMinutes: number
  requires: string // resource type or named resource
}

export const SERVICE_REQUIREMENTS: ReadonlyArray<ServiceRequirement> = [
  { service: "Full groom", durationMinutes: 120, requires: "Grooming Bay" },
  { service: "Bath & brush", durationMinutes: 60, requires: "Bath Station or Bay" },
  { service: "Cat grooming", durationMinutes: 75, requires: "Cat Room" },
  { service: "Nail trim", durationMinutes: 15, requires: "Any station" },
  { service: "Daycare", durationMinutes: 660, requires: "Daycare Hall" },
]

// Calendar bookings for the resource day view. Start/end in minutes from 8:00.
export type ResourceBooking = {
  id: string
  resourceId: string
  title: string
  sub: string
  startMin: number
  endMin: number
  color: string
}

export const RESOURCE_DAY_START = 8 * 60 // 8:00am
export const RESOURCE_DAY_END = 19 * 60 // 7:00pm

export const RESOURCE_BOOKINGS: ReadonlyArray<ResourceBooking> = [
  {
    id: "b1",
    resourceId: "r1",
    title: "Full groom · Bella",
    sub: "Lena",
    startMin: 60,
    endMin: 180,
    color: "violet",
  },
  {
    id: "b2",
    resourceId: "r1",
    title: "Full groom · Coco",
    sub: "Lena",
    startMin: 240,
    endMin: 360,
    color: "violet",
  },
  {
    id: "b3",
    resourceId: "r2",
    title: "Bath · Rex",
    sub: "Mariam",
    startMin: 90,
    endMin: 150,
    color: "green",
  },
  {
    id: "b4",
    resourceId: "r3",
    title: "Nail trim · Milo",
    sub: "Deepa",
    startMin: 30,
    endMin: 60,
    color: "sage",
  },
  {
    id: "b5",
    resourceId: "r4",
    title: "Cat groom · Miso",
    sub: "Mariam",
    startMin: 180,
    endMin: 255,
    color: "pink",
  },
  {
    id: "b6",
    resourceId: "r5",
    title: "Daycare · 8 pets",
    sub: "Team",
    startMin: 0,
    endMin: 600,
    color: "yellow",
  },
]

// ─── Staff working hours ──────────────────────────────────────────────────────

export type StaffMember = { id: string; name: string; role: string }

export const SCHED_STAFF: ReadonlyArray<StaffMember> = [
  { id: "lena", name: "Lena Hassan", role: "Senior groomer" },
  { id: "mariam", name: "Mariam Saleh", role: "Groomer" },
  { id: "deepa", name: "Deepa Nair", role: "Groomer" },
  { id: "sara", name: "Sara Okonkwo", role: "Front desk" },
]

export type DayHours = { on: boolean; open: string; close: string }

export const DEFAULT_STAFF_WEEK: Record<string, DayHours> = {
  Mon: { on: true, open: "9:00am", close: "6:00pm" },
  Tue: { on: true, open: "9:00am", close: "6:00pm" },
  Wed: { on: true, open: "9:00am", close: "6:00pm" },
  Thu: { on: true, open: "9:00am", close: "6:00pm" },
  Fri: { on: true, open: "10:00am", close: "4:00pm" },
  Sat: { on: false, open: "9:00am", close: "6:00pm" },
  Sun: { on: false, open: "9:00am", close: "6:00pm" },
}

export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export type TimeOff = { id: string; staff: string; reason: string; range: string }

export const TIME_OFF: ReadonlyArray<TimeOff> = [
  { id: "t1", staff: "Lena Hassan", reason: "Annual leave", range: "12–16 Jul" },
  { id: "t2", staff: "Deepa Nair", reason: "Sick day", range: "Today" },
]

// Static map — Tailwind can't JIT dynamically-built class strings, so every
// utility must appear literally here.
type ColorClass = { bg: string; border: string; text: string; dot: string }

const COLOR_CLASSES: Record<string, ColorClass> = {
  violet: {
    bg: "bg-cami-violet-3",
    border: "border-cami-violet-8",
    text: "text-cami-violet-11",
    dot: "bg-cami-violet-9",
  },
  green: {
    bg: "bg-cami-green-3",
    border: "border-cami-green-8",
    text: "text-cami-green-11",
    dot: "bg-cami-green-9",
  },
  sage: {
    bg: "bg-cami-sage-3",
    border: "border-cami-sage-8",
    text: "text-cami-sage-11",
    dot: "bg-cami-sage-9",
  },
  pink: {
    bg: "bg-cami-pink-3",
    border: "border-cami-pink-8",
    text: "text-cami-pink-11",
    dot: "bg-cami-pink-9",
  },
  yellow: {
    bg: "bg-cami-yellow-3",
    border: "border-cami-yellow-8",
    text: "text-cami-yellow-11",
    dot: "bg-cami-yellow-9",
  },
}

export function colorClasses(color: string): ColorClass {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES.violet!
}
