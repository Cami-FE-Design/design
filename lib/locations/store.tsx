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
import { actsAsChain, type MultiLocationEnablement } from "@/lib/locations/enablement"
import { idsWithin } from "@/lib/locations/from-business"
import { CLOSED_DAY, openFor, type WeekSchedule } from "@/lib/locations/hours"
import { LOCATIONS, locationName, NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
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
/**
 * One key, holding what a demo changed: the fields edited per branch, and the
 * branches created. Two keys grew here first (statuses, then hours) and a third
 * was about to, once the profile tabs saved — at which point "did this survive
 * a reload" would depend on which tab you were in. It is one seam now.
 */
const EDITS_KEY = "cami-location-edits"

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

  /**
   * Change fields on one branch (R01). A patch, so a surface writes only what
   * it edits — and the one seam every branch edit goes through, which is what
   * makes "did this survive a reload" the same answer on every tab.
   */
  updateLocation: (id: string, patch: Partial<Location>) => void

  /** Move a branch through its lifecycle (R01, R12). */
  setStatus: (id: string, status: LocationStatus) => void

  /**
   * Set one branch's hours and timezone (R01, R19). Per branch by construction
   * — there is no "apply to all", because a chain whose branches keep identical
   * hours is the exception, and an owner who wants that can copy a week faster
   * than they can undo a bulk write they did not mean.
   */
  /**
   * Set one branch's hours, and its timezone override (R01, R19).
   *
   * `undefined` for the zone is inheritance, not a clear — the branch goes back
   * to following the business default, which is a different state from holding
   * a value that happens to match it today.
   */
  setHours: (id: string, hours: WeekSchedule, timezone: string | undefined) => void

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
   * Whether to render a branch switcher at all.
   *
   * Two things have to be true, and they are false for different reasons. HQ
   * must have switched multi-location on for this business (GNK §2 — "before
   * any of this appears, Cami HQ turns multi-location on… once its data check
   * has passed"), and the reader must hold more than one branch. The second is
   * DW1.2's half: "a concept I don't need never clutters my screen", and it
   * reads `granted` rather than `locations`, because a manager holding one
   * branch of nine also has nothing to switch between.
   *
   * Deriving it from the branch count alone read the ordering backwards: a
   * half-migrated account would show every chain surface to its merchant with
   * no way to stand them down short of deleting rows.
   */
  isMultiLocation: boolean

  /** HQ's switch and the data check behind it (GNK §2). */
  enablement: MultiLocationEnablement
  /** HQ only. Recorded with who did it, because it is an HQ act (INV-08). */
  setEnabled: (enabled: boolean) => void

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

/**
 * The demo business is a chain HQ has already switched on.
 *
 * Every multi-location surface in this repo is reviewed against Shampooch, so
 * the seed carries the enabled state — the OFF state is a thing to look at on
 * the HQ side, not the state the whole prototype starts in.
 */
const ENABLED_DEMO: MultiLocationEnablement = {
  enabled: true,
  dataCheck: "passed",
  enabledBy: "Michelle You",
  enabledAt: "2026-09-14",
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

/**
 * What a session changed, as a patch per branch rather than whole locations.
 * A patch is what makes the seed still the source: add a field to `Location`
 * and every stored edit stays valid, where a stored copy would be missing it.
 */
type StoredEdits = {
  overrides: Record<string, Partial<Location>>
  /** Branches created in this session (R02). Seed order first, these after. */
  created: Location[]
}

const NO_EDITS: StoredEdits = { overrides: {}, created: [] }

function readStoredEdits(): StoredEdits {
  try {
    const raw = window.localStorage.getItem(EDITS_KEY)
    if (!raw) return NO_EDITS
    const parsed = JSON.parse(raw) as Partial<StoredEdits>
    return {
      overrides: parsed?.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
      created: Array.isArray(parsed?.created) ? parsed.created : [],
    }
  } catch {
    return NO_EDITS
  }
}

/** The estate as this session left it: seed, plus what was created, plus the edits. */
function applyEdits(edits: StoredEdits, seed: ReadonlyArray<Location>): Location[] {
  return [...seed, ...edits.created].map((l) =>
    edits.overrides[l.id] ? { ...l, ...edits.overrides[l.id] } : l,
  )
}

/**
 * A stored scope, narrowed to what this estate actually holds, or `null` when
 * nothing of it survives — in which case the caller keeps its own default
 * rather than rendering a scope nobody can see anything through.
 */
function scopeWithin(estate: ReadonlyArray<Location>, scope: LocationScope): LocationScope | null {
  if (scope.kind === "all") return scope
  if (scope.kind === "one") {
    return estate.some((l) => l.id === scope.locationId) ? scope : null
  }
  const ids = idsWithin(estate, scope.locationIds)
  return ids.length > 0 ? { kind: "subset", locationIds: ids } : null
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
  initialLocations = LOCATIONS,
  persist = true,
}: {
  children: React.ReactNode
  /** Seed the grant, to stand in a branch manager's or an ungranted staff member's shoes. */
  initialGrants?: LocationGrants
  /** Seed the scope, to open on one branch rather than the roll-up. */
  initialScope?: LocationScope
  /**
   * Seed the estate. Three branches is the demo; the PRD assumes nine, and the
   * layouts that hold at three are the ones that fail at nine — nine cards most
   * of them identical, a switcher list that needs scrolling, a money table
   * whose interesting row is below the fold. `NINE_BRANCH_ESTATE` in
   * lib/locations/mock.ts exists to make those reviewable rather than argued
   * about. Pass `persist: false` with it: a demo estate must not be written over
   * the one the operator is working in.
   */
  initialLocations?: ReadonlyArray<Location>
  /**
   * Read and write localStorage. False for a nested provider — the playground
   * shows several scopes at once, and a showcase must not overwrite the scope
   * the operator is actually working in.
   */
  persist?: boolean
}) {
  // Start from the seed so server and first client render agree, then hydrate
  // in an effect — same shape as lib/demo-business.tsx.
  const [locations, setLocations] = useState<Location[]>([...initialLocations])
  const [grants, setGrantsState] = useState<LocationGrants>(initialGrants)
  const [scope, setScopeState] = useState<LocationScope>(initialScope)
  /**
   * HQ's switch (GNK §2). Seeded ON for the demo chain, because every
   * multi-location surface here is reviewed against it — the OFF state is
   * something to look at in HQ, not the state the prototype starts in.
   */
  const [enablement, setEnablement] = useState<MultiLocationEnablement>(ENABLED_DEMO)
  const setEnabled = useCallback(
    (enabled: boolean) =>
      setEnablement((current) => ({
        ...current,
        enabled,
        enabledBy: enabled ? "Michelle You" : current.enabledBy,
        enabledAt: enabled ? new Date().toISOString().slice(0, 10) : current.enabledAt,
      })),
    [],
  )

  useEffect(() => {
    if (!persist) return
    const edits = readStoredEdits()
    if (Object.keys(edits.overrides).length > 0 || edits.created.length > 0) {
      setLocations(applyEdits(edits, initialLocations))
    }
    // Both outlive a change of business, and an id from the estate you have
    // left resolves to nothing — a scope pointing at `shampooch-jvc` while
    // signed into Sota empties every screen, and nothing on them says why.
    // Checked against the estate rather than cleared on any mismatch, so
    // switching away and back keeps what the session had.
    const estate = applyEdits(edits, initialLocations)
    const savedGrants = readStoredGrants()
    if (savedGrants) {
      const kept = savedGrants === "all" ? "all" : idsWithin(estate, savedGrants)
      // An empty survivor list is not a grant of none — that is R24's state and
      // it has to be asked for, never arrived at by a business switch.
      if (kept === "all" || kept.length > 0) setGrantsState(kept)
    }
    const savedScope = readStoredScope()
    if (savedScope) {
      const kept = scopeWithin(estate, savedScope)
      if (kept) setScopeState(kept)
    }
    // `initialLocations` is a seed, and both callers pass a module constant, so
    // this runs once per provider rather than on every render.
  }, [persist, initialLocations])

  /**
   * Write to the stored patch, then to state, so the two cannot disagree —
   * every branch edit goes through here, whatever surface asked for it.
   */
  const writeEdits = useCallback(
    (mutate: (edits: StoredEdits) => StoredEdits) => {
      if (!persist) return
      window.localStorage.setItem(EDITS_KEY, JSON.stringify(mutate(readStoredEdits())))
    },
    [persist],
  )

  /**
   * Change fields on one branch (R01). A patch, not a replacement, because a
   * surface only knows the fields it edits — the address form has no business
   * asserting anything about hours.
   */
  const updateLocation = useCallback(
    (id: string, patch: Partial<Location>) => {
      setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
      writeEdits((edits) => ({
        ...edits,
        // Merged with what was already stored for this branch, so editing the
        // address does not drop yesterday's hours.
        overrides: {
          ...edits.overrides,
          [id]: { ...edits.overrides[id], ...patch },
        },
        created: edits.created.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      }))
    },
    [writeEdits],
  )

  /**
   * Move a branch through its lifecycle (R01, R12). Suspend and reactivate are
   * a state change in both directions — reactivating is not a re-creation
   * (SU1.5). Archive is one-way here: history stays readable forever and a
   * branch is never deleted, so there is nothing to undo it to.
   */
  const setStatus = useCallback(
    (id: string, status: LocationStatus) => {
      updateLocation(id, { status })
    },
    [updateLocation],
  )

  const setHours = useCallback(
    (id: string, hours: WeekSchedule, timezone: string | undefined) => {
      updateLocation(id, { hours, timezone })
    },
    [updateLocation],
  )

  const addLocations = useCallback(
    (rows: NewLocationInput[]) => {
      // Built outside the state updater on purpose: it writes to storage, and
      // React may call an updater twice, which would create every branch twice.
      // Tax identity, invoicing and the operating country are business-level,
      // so a new branch inherits them rather than being asked again (R23 is a
      // business default with a per-field override, not a per-branch form).
      const businessDefault = locations[0]
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
        // Created trading, which is what the built product does — a venue is
        // created active and `suspend`/`archive` are transitions away from it.
        // An owner who is not ready can suspend it, and that state already
        // means "not bookable yet" without inventing a fourth one.
        status: "live",
        // Starts on the business default, which is what inheriting means — an
        // owner adjusts the days this branch actually differs on rather than
        // filling in a week from empty (R01).
        hours: businessDefault?.hours ?? DEFAULT_HOURS,
        timezone: row.timezone,
        ownerName: businessDefault?.ownerName ?? "",
        ownerEmail: businessDefault?.ownerEmail ?? "",
        photoUrl: `https://picsum.photos/seed/${slugify(row.name)}/80`,
      }))
      writeEdits((edits) => ({ ...edits, created: [...edits.created, ...created] }))
      setLocations((prev) => [...prev, ...created])
    },
    [locations, writeEdits],
  )

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
      updateLocation,
      setStatus,
      setHours,
      addLocations,
      takenSlugs: locations.map((l) => l.slug),
      grants,
      setGrants,
      granted,
      isMultiLocation: actsAsChain(enablement, granted.length),
      enablement,
      setEnabled,
      hasNoAccess: granted.length === 0,
      scope,
      setScope,
      scopedLocations,
      scopeLabel: labelFor(granted, scopedLocations, scope),
      activeLocation,
      requiresTargetLocation: writable.length !== 1,
    }
  }, [
    locations,
    grants,
    scope,
    updateLocation,
    setStatus,
    setHours,
    addLocations,
    setGrants,
    setScope,
    enablement,
    setEnabled,
  ])

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
  // The estate, not the first three. This fallback predates the nine-branch
  // seed, so anything rendering outside a provider — a takeover, a portal, a
  // standalone playground mount — silently saw a three-branch business and
  // dropped every row belonging to the other six.
  const locations = NINE_BRANCH_ESTATE as Location[]
  const writable = locations.filter((l) => acceptsWrites(l.status))
  return {
    locations,
    byId: (id) => locations.find((l) => l.id === id),
    locationName,
    updateLocation: () => {},
    setStatus: () => {},
    setHours: () => {},
    addLocations: () => {},
    takenSlugs: locations.map((l) => l.slug),
    grants: "all",
    setGrants: () => {},
    granted: locations,
    isMultiLocation: actsAsChain(ENABLED_DEMO, locations.length),
    enablement: ENABLED_DEMO,
    setEnabled: () => {},
    hasNoAccess: false,
    scope: { kind: "all" },
    setScope: () => {},
    scopedLocations: locations,
    scopeLabel: labelFor(locations, locations, { kind: "all" }),
    activeLocation: writable.length === 1 ? writable[0] : null,
    requiresTargetLocation: writable.length !== 1,
  }
}
