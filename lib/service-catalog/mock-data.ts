// Seed data for the prototype service catalog. Mirrors the developer repo's
// mock-service-catalog.json, but normalized to the UI-facing types: durations
// are stored as minutes (not display strings) and every service carries the
// `variants` / `extraTimes` / `isActive` fields the components expect.
//
// The merchant-facing services and their categories are DERIVED from the one
// catalog in lib/booking.ts rather than written again here. That is not tidying
// — this file used to hold a hair salon (Hair Color, Brazilian Blowout, "Color
// treatments") while every client-facing surface read a pet groomer, so the two
// were not duplicates of each other, they were different businesses. Setting a
// branch price on "Hair Color" wrote an override keyed to a service id that
// publicMenuForLocation() never looks up, so the per-branch pricing screen
// (SCR-09) could not reach a client page at all.
//
// The as-built settles the shape: src/types/service-catalog.ts has one `Service`
// record with a `showInPublicBooking` flag, and src/types/booking.ts's
// `CatalogService.serviceId` is documented as "the underlying service UUID".
// One record set, two projections. Deriving here makes that true by
// construction rather than by keeping two lists in step by hand.
//
// The system-managed `admin-*` categories below stay hand-written: they are the
// platform's business types, not this merchant's menu.
//
// All mutations happen in local React state (see store.tsx).

import { SERVICE_CATEGORIES } from "@/lib/booking"

import type { Service, ServiceCategory } from "./types"

/** Lightweight team-member shape — the only fields the catalog screens read. */
export type TeamMember = {
  id: string
  name: string
  title?: string
}

/** The roster the catalog screens read. */
export const seedTeamMembers: TeamMember[] = [
  { id: "tm-1", name: "Sarah Johnson" },
  { id: "tm-2", name: "James Carter", title: "Cashier" },
  { id: "tm-3", name: "Emily Rivera" },
]

/** Cycled so the Categories table is legible; the palette is the repo's. */
const CATEGORY_COLORS = ["purple", "yellow", "green", "pink"]

/**
 * Who can perform a service. The catalog carries no staff assignment, so this
 * spreads the roster across the menu rather than claiming every groomer does
 * everything — enough for the Team members tab to have something true to show.
 */
function teamFor(index: number): string[] {
  const roster = seedTeamMembers.map((member) => member.id)
  return [roster[index % roster.length], roster[(index + 1) % roster.length]]
}

export const seedCategories: ServiceCategory[] = [
  // System-managed top-level categories (hidden from the merchant-facing list,
  // used as parents / for resolving display names).
  {
    id: "admin-1",
    name: "Grooming",
    color: "purple",
    description: "Bathing, haircuts, nail trims, and coat care",
    order: 0,
    parentId: null,
    isSystemManaged: true,
    slug: "grooming",
    icon: "scissors",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-2",
    name: "Veterinary",
    color: "blue",
    description: "Health check-ups, vaccinations, and medical care",
    order: 1,
    parentId: null,
    isSystemManaged: true,
    slug: "veterinary",
    icon: "stethoscope",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-3",
    name: "Boarding",
    color: "teal",
    description: "Overnight and extended stay accommodation",
    order: 2,
    parentId: null,
    isSystemManaged: true,
    slug: "boarding",
    icon: "home",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-4",
    name: "Daycare",
    color: "yellow",
    description: "Daytime supervision and play activities",
    order: 3,
    parentId: null,
    isSystemManaged: true,
    slug: "daycare",
    icon: "sun",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-5",
    name: "Training",
    color: "orange",
    description: "Obedience, behaviour, and skill training",
    order: 4,
    parentId: null,
    isSystemManaged: true,
    slug: "training",
    icon: "graduation-cap",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-6",
    name: "Wellness",
    color: "green",
    description: "Spa treatments, massage, and preventive care",
    order: 5,
    parentId: null,
    isSystemManaged: true,
    slug: "wellness",
    icon: "heart",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-7",
    name: "Retail",
    color: "pink",
    description: "Products, accessories, and merchandise",
    order: 6,
    parentId: null,
    isSystemManaged: true,
    slug: "retail",
    icon: "shopping-bag",
    isActive: true,
    servicesCount: 0,
  },
  {
    id: "admin-8",
    name: "Transport",
    color: "red",
    description: "Pick-up, drop-off, and mobile visit services",
    order: 7,
    parentId: null,
    isSystemManaged: true,
    slug: "transport",
    icon: "truck",
    isActive: true,
    servicesCount: 0,
  },

  // Merchant-created categories (shown in the Categories table + Service menu),
  // one per category of the catalog the client browses. Parented to Grooming
  // because that is this merchant's business type.
  ...SERVICE_CATEGORIES.map(
    (category, index): ServiceCategory => ({
      id: category.id,
      name: category.name,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      description: category.description,
      order: index + 1,
      parentId: "admin-1",
      isSystemManaged: false,
      slug: category.id,
      isActive: true,
      servicesCount: category.services.length,
    }),
  ),
]

export const seedServices: Service[] = SERVICE_CATEGORIES.flatMap((category) =>
  category.services.map((service, index): Service => {
    const components = (service.componentIds ?? []).map((componentId) => {
      const component = SERVICE_CATEGORIES.flatMap((c) => c.services).find(
        (candidate) => candidate.id === componentId,
      )
      return { id: componentId, name: component?.name ?? componentId }
    })

    return {
      id: service.id,
      name: service.name,
      ...(service.isCombo
        ? {
            serviceType: "combo" as const,
            components,
            // The catalog's own field: absent means back-to-back, which is
            // what "sequence" is called on this side.
            scheduleType: service.comboScheduleType ?? ("sequence" as const),
            // The catalog prices its combos below the sum of the components
            // (a full groom and a nail trim are 295 apart, the combo is 270),
            // which is "custom" rather than derived from the components.
            comboPriceType: "custom" as const,
          }
        : {}),
      categoryId: category.id,
      categoryName: category.name,
      description: service.description,
      priceType: "Fixed",
      price: service.priceAed,
      duration: service.durationMinutes,
      order: index + 1,
      teamMemberIds: teamFor(index),
      isActive: true,
      variants: [],
      extraTimes: [],
    }
  }),
)
