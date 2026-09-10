"use client"

/**
 * Location scope for the session (R03, R04, R11, R24).
 *
 * This is the surface every other multi-location requirement is read through,
 * and it is deliberately the smallest thing that can be true: which branches
 * exist, which of them this user is granted, and which of those they are
 * currently looking at. Nothing else belongs here — a branch's hours, catalog
 * and money live with their own modules and carry a `locationId`.
 *
 * Two things this store is NOT:
 *
 * - It is not security. "A location switcher in the UI is context, not
 *   security" (blueprint §03) — the backend authorizes every request on both
 *   axes independently, and a granted scope here only decides what a surface
 *   offers, never what it is allowed to return.
 * - It is not the workspace switcher. A workspace holds exactly one business
 *   (blueprint §01), so branches are not workspaces and must not be listed as
 *   if they were. The topbar used to fabricate a second workspace row from the
 *   business name; that row was a location wearing the wrong hat.
 *
 * Demo-only: `grantedIds` is settable so a presenter can stand in a branch
 * manager's shoes (one branch), an area manager's (a subset), or a staff
 * member with no grant at all (R24) without a login. Persisted so a scope
 * survives navigation mid-demo.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { CLOSED_DAY, openFor, type WeekSchedule } from "@/lib/locations/hours"
import { LOCATIONS, locationName } from "@/lib/locations/mock"
import type { Location, LocationScope, LocationStatus } from "@/lib/locations/types"
import { acceptsWrites } from "@/lib/locations/types"

/**
 * The fallback for a business with no branches yet to inherit from. Weekdays
 * open, Sunday closed — a starting point an owner edits, not a claim.
 */
const DEFAULT_HOURS: WeekSchedule = {
  mon: openFor("09:00", "19:00"),
  tue: openFor("09:00", "19:00"),
  wed: openFor("09:00", "19:00"),
  thu: openFor("09:00", "19:00"),
  fri: openFor("10:00", "18:00"),
  sat: openFor("10:00", "18:00"),
  sun: CLOSED_DAY,
}

const SCOPE_KEY = "cami-location-scope"
const GRANTS_KEY = "cami-location-grants"
const STATUS_KEY = "cami-location-statuses"
const HOURS_KEY = "cami-location-hours"

/**
 * `"all"` is a grant of every location the business has, now and later — what
 * an owner holds. An explicit array is a named set, which is what makes
 * revocation observable (SU2.3): drop an id and every surface narrows.
 */
export type LocationGrants = "all" | string[]

type LocationsValue = {
  /** Every location in the business, whatever its state. */
  locations: Location[]
  byId: (id: string) => Location | undefined
  /** Display name for an id. Falls back to the id so a stale reference is visible, not silent. */
  locationName: (id: string) => string

  /** Move a branch through its lifecycle (R01, R12). */
  setStatus: (id: string, status: LocationStatus) => void

  /**
   * Set one branch's hours and timezone (R01, R19). Per branch by construction
   * — there is no "apply to all", because a chain whose branches keep identical
   * hours is the exception, and an owner who wants that can copy a week faster
   * than they can undo a bulk write they did not mean.
   */
  setHours: (id: string, hours: WeekSchedule, timezone: string) => void

  /**
   * Stand up N branches in one pass (R02, SU1.2). One call, so it is all or
   * none by construction — there is no partial state to clean up after a bad
   * row. Adding branch N touches nothing already built: no client, staff or
   * catalog data moves, which is BG-03's "0 steps" gate.
   */
  addLocations: (rows: NewLocationInput[]) => void

  /** Slugs already taken, so chain setup can refuse a collision before submitting. */
  takenSlugs: string[]

  /** What this user is granted (R04). */
  grants: LocationGrants
  setGrants: (grants: LocationGrants) => void
  /** The granted locations, resolved. */
  granted: Location[]

  /**
   * Whether to render a branch switcher at all. False for a single-branch
   * business, and the whole of DW1.2: "a concept I don't need never clutters
   * my screen". Note it reads `granted`, not `locations` — a manager granted
   * one branch of nine also has nothing to switch between.
   */
  isMultiLocation: boolean

  /** No grant at all. Performs no operational read or write, and never means "all" (R24). */
  hasNoAccess: boolean

  /** The active scope of the session (R03). */
  scope: LocationScope
  setScope: (scope: LocationScope) => void
  /** The scope resolved to locations, always bounded by grants. */
  scopedLocations: Location[]
  /** Short label for the switcher trigger and any "you are looking at" copy. */
  scopeLabel: string

  /**
   * The one branch an operational write would land on, or null when the scope
   * spans more than one. Null is not a problem to be defaulted away — it is
   * the R11 state that a create action has to resolve by asking.
   */
  activeLocation: Location | null

  /**
   * True when a create action must ask for a target branch before it can write:
   * the scope covers more than one location, so there is nothing to infer from
   * (R11, "all-locations is read only"). Never resolve this by picking the
   * first granted branch.
   */
  requiresTargetLocation: boolean
}

/**
 * What an owner actually types per branch during chain setup. Everything else
 * a Location carries is either inherited from the business (tax identity,
 * currency) or filled in later on the branch's own settings — asking for all
 * of it up front is what makes standing up nine branches feel like nine
 * onboardings.
 */
export type NewLocationInput = {
  name: string
  city: string
  timezone: string
}

/** Kebab-case, and the branch's public URL, so a collision is a real conflict. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const LocationsContext = createContext<LocationsValue | null>(null)

function resolveGranted(locations: Location[], grants: LocationGrants): Location[] {
  if (grants === "all") return locations
  return locations.filter((l) => grants.includes(l.id))
}

/**
 * Resolve a scope against the granted set. Every branch of this function
 * intersects with `granted`, which is what makes "all" mean "all of mine"
 * rather than "all that exist" (KH1.3), and what makes a scope naming a
 * revoked branch narrow rather than leak (SU2.3).
 */
function resolveScope(granted: Location[], scope: LocationScope): Location[] {
  if (scope.kind === "all") return granted
  if (scope.kind === "one") {
    return granted.filter((l) => l.id === scope.locationId)
  }
  return granted.filter((l) => scope.locationIds.includes(l.id))
}

function labelFor(granted: Location[], scoped: Location[], scope: LocationScope): string {
  if (scoped.length === 0) return "No location"
  if (scoped.length === 1) return scoped[0].name
  if (scope.kind === "all" || scoped.length === granted.length) return "All locations"
  return `${scoped.length} locations`
}

function readStoredScope(): LocationScope | null {
  try {
    const raw = window.localStorage.getItem(SCOPE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LocationScope
    if (parsed?.kind === "all") return parsed
    if (parsed?.kind === "one" && typeof parsed.locationId === "string") return parsed
    if (parsed?.kind === "subset" && Array.isArray(parsed.locationIds)) return parsed
    return null
  } catch {
    return null
  }
}

function readStoredStatuses(): Record<string, LocationStatus> | null {
  try {
    const raw = window.localStorage.getItem(STATUS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, LocationStatus>
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

/** Hours and timezone survive a reload, because reviewing an edit means seeing it again. */
type StoredHours = Record<string, { hours: WeekSchedule; timezone: string }>

function readStoredHours(): StoredHours | null {
  try {
    const raw = window.localStorage.getItem(HOURS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredHours
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function readStoredGrants(): LocationGrants | null {
  try {
    const raw = window.localStorage.getItem(GRANTS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LocationGrants
    if (parsed === "all") return parsed
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) return parsed
    return null
  } catch {
    return null
  }
}

export function LocationsProvider({
  children,
  initialGrants = "all",
  initialScope = { kind: "all" },
  persist = true,
}: {
  children: React.ReactNode
  /** Seed the grant, to stand in a branch manager's or an ungranted staff member's shoes. */
  initialGrants?: LocationGrants
  /** Seed the scope, to open on one branch rather than the roll-up. */
  initialScope?: LocationScope
  /**
   * Read and write localStorage. False for a nested provider — the playground
   * shows several scopes at once, and a showcase must not overwrite the scope
   * the operator is actually working in.
   */
  persist?: boolean
}) {
  // Start from the seed so server and first client render agree, then hydrate
  // in an effect — same shape as lib/demo-business.tsx.
  const [locations, setLocations] = useState<Location[]>(LOCATIONS)
  const [grants, setGrantsState] = useState<LocationGrants>(initialGrants)
  const [scope, setScopeState] = useState<LocationScope>(initialScope)

  useEffect(() => {
    if (!persist) return
    const savedStatuses = readStoredStatuses()
    if (savedStatuses) {
      // Only the lifecycle state is persisted, never a whole location. A branch's
      // profile is seed data; its state is what a demo changes.
      setLocations((prev) =>
        prev.map((l) => (savedStatuses[l.id] ? { ...l, status: savedStatuses[l.id] } : l)),
      )
    }
    const savedHours = readStoredHours()
    if (savedHours) {
      setLocations((prev) =>
        prev.map((l) =>
          savedHours[l.id]
            ? { ...l, hours: savedHours[l.id].hours, timezone: savedHours[l.id].timezone }
            : l,
        ),
      )
    }
    const savedGrants = readStoredGrants()
    if (savedGrants) setGrantsState(savedGrants)
    const savedScope = readStoredScope()
    if (savedScope) setScopeState(savedScope)
  }, [persist])

  /**
   * Move a branch through its lifecycle (R01, R12). Suspend and reactivate are
   * a state change in both directions — reactivating is not a re-creation
   * (SU1.5). Archive is one-way here: history stays readable forever and a
   * branch is never deleted, so there is nothing to undo it to.
   */
  const setStatus = useCallback(
    (id: string, status: LocationStatus) => {
      setLocations((prev) => {
        const next = prev.map((l) => (l.id === id ? { ...l, status } : l))
        if (persist) {
          const statuses = Object.fromEntries(next.map((l) => [l.id, l.status]))
          window.localStorage.setItem(STATUS_KEY, JSON.stringify(statuses))
        }
        return next
      })
    },
    [persist],
  )

  const setHours = useCallback(
    (id: string, hours: WeekSchedule, timezone: string) => {
      setLocations((prev) => {
        const next = prev.map((l) => (l.id === id ? { ...l, hours, timezone } : l))
        if (persist) {
          const stored: StoredHours = Object.fromEntries(
            next.map((l) => [l.id, { hours: l.hours, timezone: l.timezone }]),
          )
          window.localStorage.setItem(HOURS_KEY, JSON.stringify(stored))
        }
        return next
      })
    },
    [persist],
  )

  const addLocations = useCallback((rows: NewLocationInput[]) => {
    setLocations((prev) => {
      // Tax identity, invoicing and the operating country are business-level,
      // so a new branch inherits them rather than being asked again (R23 is a
      // business default with a per-field override, not a per-branch form).
      const businessDefault = prev[0]
      const created: Location[] = rows.map((row) => ({
        id: slugify(row.name),
        name: row.name.trim(),
        slug: slugify(row.name),
        phone: "",
        email: "",
        location: {
          address: "",
          aptSuite: "",
          district: "",
          city: row.city.trim(),
          state: row.city.trim(),
          postcode: "",
          country: businessDefault?.location.country ?? "United Arab Emirates",
        },
        mapPin: null,
        businessType: businessDefault?.businessType ?? [],
        invoicing: businessDefault?.invoicing ?? {
          sameAsLocation: true,
          companyName: "",
          address: "",
          aptSuite: "",
          city: "",
          state: "",
          postcode: "",
          vatNumber: "",
          invoiceNote: "",
        },
        // Draft, not live: created is not the same as trading, and an owner
        // still has hours and staff to set before it takes a booking.
        status: "draft",
        // Starts on the business default, which is what inheriting means — an
        // owner adjusts the days this branch actually differs on rather than
        // filling in a week from empty (R01).
        hours: businessDefault?.hours ?? DEFAULT_HOURS,
        timezone: row.timezone,
        ownerName: businessDefault?.ownerName ?? "",
        ownerEmail: businessDefault?.ownerEmail ?? "",
        photoUrl: `https://picsum.photos/seed/${slugify(row.name)}/80`,
      }))
      return [...prev, ...created]
    })
  }, [])

  const setGrants = useCallback(
    (next: LocationGrants) => {
      setGrantsState(next)
      if (persist) window.localStorage.setItem(GRANTS_KEY, JSON.stringify(next))
    },
    [persist],
  )

  const setScope = useCallback(
    (next: LocationScope) => {
      setScopeState(next)
      if (persist) window.localStorage.setItem(SCOPE_KEY, JSON.stringify(next))
    },
    [persist],
  )

  const value = useMemo<LocationsValue>(() => {
    const granted = resolveGranted(locations, grants)
    const scopedLocations = resolveScope(granted, scope)
    // One writable branch in view is what a create action needs. A suspended or
    // archived branch is readable but takes no new writes (R12), so it is not a
    // target even when it is the only thing in scope.
    const writable = scopedLocations.filter((l) => acceptsWrites(l.status))
    const activeLocation = writable.length === 1 ? writable[0] : null

    return {
      locations,
      byId: (id) => locations.find((l) => l.id === id),
      locationName,
      setStatus,
      setHours,
      addLocations,
      takenSlugs: locations.map((l) => l.slug),
      grants,
      setGrants,
      granted,
      isMultiLocation: granted.length > 1,
      hasNoAccess: granted.length === 0,
      scope,
      setScope,
      scopedLocations,
      scopeLabel: labelFor(granted, scopedLocations, scope),
      activeLocation,
      requiresTargetLocation: writable.length !== 1,
    }
  }, [locations, grants, scope, setStatus, setHours, addLocations, setGrants, setScope])

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>
}

/**
 * Read the session's location scope. Works outside a provider so a surface
 * rendered in isolation (playground, tests) still gets a coherent estate —
 * every location, all granted, scope "all".
 */
export function useLocations(): LocationsValue {
  const ctx = useContext(LocationsContext)
  if (ctx) return ctx
  const locations = LOCATIONS
  const writable = locations.filter((l) => acceptsWrites(l.status))
  return {
    locations,
    byId: (id) => locations.find((l) => l.id === id),
    locationName,
    setStatus: () => {},
    setHours: () => {},
    addLocations: () => {},
    takenSlugs: locations.map((l) => l.slug),
    grants: "all",
    setGrants: () => {},
    granted: locations,
    isMultiLocation: locations.length > 1,
    hasNoAccess: false,
    scope: { kind: "all" },
    setScope: () => {},
    scopedLocations: locations,
    scopeLabel: labelFor(locations, locations, { kind: "all" }),
    activeLocation: writable.length === 1 ? writable[0] : null,
    requiresTargetLocation: writable.length !== 1,
  }
}
