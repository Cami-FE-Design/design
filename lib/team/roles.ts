/**
 * The business's role catalog, and the location capabilities a role can hold.
 *
 * Access is the intersection of two independent axes (R04): role capability
 * answers *what* someone may do, the granted location scope answers *where*.
 * Capability never widens scope and scope never widens capability — a manager
 * granted every branch is still not an owner, and an owner granted one branch
 * still sees one branch.
 *
 * Before this file the roster carried `permission: "High" | "Medium" | "Low"`,
 * which is neither axis. It named a vague altitude and said nothing about
 * either capability or location, so there was nothing for a location grant to
 * be independent *of*.
 *
 * ## Grounded in the built product, not in the blueprint's summary
 *
 * `cami-business` seeds exactly three merchant role codes and treats them as
 * read-only (`src/types/roles.ts`): `merchant_owner`, `receptionist`, `staff`.
 * Everything else in a live account is a **custom role the merchant created** —
 * `modules/rbac` ships add, rename, edit and delete dialogs for exactly that,
 * and its permission editor is driven by a registry the backend returns rather
 * than by a list in the frontend.
 *
 * So the blueprint's "five shipped roles" is one account's catalog, not a law:
 * Owner, Receptionist and Staff are seeded, and Manager and Marketing are
 * custom. Its "Stylist" is the seeded `staff` role under a grooming account's
 * naming. Modelling all five as fixed would have hard-coded one merchant's
 * choices as the product.
 */

/** Seeded on the backend and read-only there. Names match the BE column verbatim. */
export const SEEDED_ROLE_CODES = {
  MERCHANT_OWNER: "merchant_owner",
  RECEPTIONIST: "receptionist",
  STAFF: "staff",
} as const

/**
 * The location-shaped permission codes a role can hold.
 *
 * Only `venues:read` exists in the product today — it is the whole of the
 * `VENUES` module in `src/lib/permission-codes.ts`, described there as "view
 * and manage business locations", which bundles reading a branch with changing
 * it. The other four are **proposed**, and they are what the blueprint's §03
 * asks for when it says the location toggle set "needs to exist for every role,
 * not just Manager".
 *
 * Splitting `venues:read` is the substance of the proposal: an area manager who
 * may set a branch's hours must not thereby be able to edit its tax identity,
 * because that changes every future receipt (R23), or archive it (R01). One
 * code cannot express that.
 */
export const VENUE_CAPABILITIES = [
  {
    code: "venues:read",
    label: "Can view and access all locations",
    /** The one that already exists. */
    shipped: true,
    /**
     * Capability, not scope, and the pair people conflate. It decides whether
     * a role may hold an all-locations grant at all; it does not grant one.
     * Turning it on for someone granted a single branch changes nothing about
     * what they see (R04, R24).
     */
    note: "Whether this role may hold an all-locations grant. It does not grant one.",
  },
  {
    code: "venues:manage_hours",
    label: "Can manage location hours",
    shipped: false,
    note: "Operational, so it reaches further down the roles than the rest.",
  },
  {
    code: "venues:manage_invoice",
    label: "Can manage location invoice and tax details",
    shipped: false,
    note: "Owner-level: it changes every future receipt (R23, INV-12).",
  },
  {
    code: "venues:change_state",
    label: "Can suspend or archive a location",
    shipped: false,
    note: "Owner-level: branch lifecycle is not an operational action (R01, R12).",
  },
  {
    code: "venues:update",
    label: "Can create and update locations",
    shipped: false,
    note: "Owner-level: this is how a chain is stood up (R02).",
  },
] as const

export type VenueCapabilityCode = (typeof VENUE_CAPABILITIES)[number]["code"]

export type MerchantRole = {
  id: string
  /** The BE role code. Seeded roles use SEEDED_ROLE_CODES; custom roles get a slug. */
  roleCode: string
  name: string
  /** What the role may do, in the operator's words. */
  capability: string
  /** Seeded roles cannot be renamed or deleted. Their permissions can still be edited. */
  isSystemRole: boolean
  /** What scope this role is usually granted. Guidance for the owner, never enforcement. */
  typicalScope: string
  venueCapabilities: VenueCapabilityCode[]
}

/**
 * A plausible catalog for a grooming chain: the three seeded roles, plus the
 * two custom ones the blueprint observed. Which capabilities each holds follows
 * the PRD's §3.3 grid — creating, configuring, suspending and archiving a
 * branch is Owner only, and so is editing a branch's tax identity.
 *
 * Anything the grid does not settle is off. A capability that has to be granted
 * deliberately is the right default on a screen whose whole job is preventing
 * leakage, where BG-06 is a gate rather than a target.
 */
export const MERCHANT_ROLES: MerchantRole[] = [
  {
    id: "owner",
    roleCode: SEEDED_ROLE_CODES.MERCHANT_OWNER,
    name: "Owner",
    capability:
      "Full access to every setting, including billing, team management and business configuration.",
    isSystemRole: true,
    typicalScope: "All locations",
    venueCapabilities: [
      "venues:read",
      "venues:manage_hours",
      "venues:manage_invoice",
      "venues:change_state",
      "venues:update",
    ],
  },
  {
    id: "manager",
    roleCode: "manager",
    name: "Manager",
    capability:
      "Operations, finance and marketing — every capability except managing role permissions.",
    isSystemRole: false,
    typicalScope: "All locations, or a named set for an area manager",
    venueCapabilities: ["venues:read", "venues:manage_hours"],
  },
  {
    id: "receptionist",
    roleCode: SEEDED_ROLE_CODES.RECEPTIONIST,
    name: "Receptionist",
    capability:
      "Front desk — client visibility, bookings and checkout at the locations they are granted.",
    isSystemRole: true,
    typicalScope: "One location, or a granted subset",
    venueCapabilities: [],
  },
  {
    id: "staff",
    roleCode: SEEDED_ROLE_CODES.STAFF,
    name: "Staff",
    capability:
      "Delivers services, manages their own calendar, and processes their own appointments.",
    isSystemRole: true,
    /** "Stylist" in a grooming account is this role renamed. */
    typicalScope: "The locations they are assigned to work",
    venueCapabilities: [],
  },
  {
    id: "marketing",
    roleCode: "marketing",
    name: "Marketing",
    capability: "Campaigns, audiences and social. No client money, no branch configuration.",
    isSystemRole: false,
    /**
     * Business-wide by nature: audiences and templates sit on the shared plane
     * (blueprint §02), and an opt-out at one branch suppresses every branch.
     * Cost is still attributed to the sending location (R22).
     */
    typicalScope: "Business-wide — campaigns are shared",
    venueCapabilities: ["venues:read"],
  },
]

export function roleById(id: string): MerchantRole | undefined {
  return MERCHANT_ROLES.find((r) => r.id === id)
}

/** The owner role holds every branch by definition, so its grant is not editable. */
export function holdsAllLocations(roleId: string): boolean {
  return roleById(roleId)?.roleCode === SEEDED_ROLE_CODES.MERCHANT_OWNER
}
