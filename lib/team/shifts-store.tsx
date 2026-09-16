"use client"

/**
 * The rota, as this session left it.
 *
 * Scheduled shifts is a **write** surface in the built product — a day's
 * windows, a repeating rule, a leave, a whole member's week cleared. A grid
 * that only reads would let this repo show the states without ever showing what
 * it takes to reach one, and every question that matters for multi-location is
 * about writing: which branch does this shift land at, does clearing a week
 * clear it everywhere, does a leave entered at one branch show at the other.
 *
 * One seam, the same shape `lib/locations/store` uses: the seed is untouched,
 * edits live beside it under one key, and everything the dialogs do goes
 * through here. That is what makes "did this stick" the same answer on every
 * grid on the page.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { BlockTime, Leave, RosterMember, Shift, ShiftTime } from "@/lib/team/shifts"
import {
  NINE_BRANCH_LEAVES,
  NINE_BRANCH_MEMBERS,
  NINE_BRANCH_SHIFTS,
  ROSTER_BLOCKS,
} from "@/lib/team/shifts-mock"

const STORAGE_KEY = "cami-rota-edits"

type StoredRota = {
  shifts: Shift[]
  leaves: Leave[]
}

function readStored(): StoredRota | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredRota>
    if (!Array.isArray(parsed?.shifts) || !Array.isArray(parsed?.leaves)) return null
    return { shifts: parsed.shifts, leaves: parsed.leaves }
  } catch {
    return null
  }
}

type RotaValue = {
  members: ReadonlyArray<RosterMember>
  shifts: ReadonlyArray<Shift>
  leaves: ReadonlyArray<Leave>
  blocks: ReadonlyArray<BlockTime>

  /**
   * Replace one person's windows for one day at **one branch** (R11).
   *
   * Scoped to the branch on purpose: the built product writes a day through a
   * venue-scoped call, so editing Tuesday at JVC must not touch Tuesday at
   * Jumeirah. Getting that wrong is how a split-branch day collapses into one.
   */
  setDay: (memberId: string, locationId: string, day: string, windows: ShiftTime[]) => void

  /**
   * Apply one week's pattern from a repeating rule (`intervalWeeks` is carried
   * for the label; this repo shows one week, so a rule writes that week).
   */
  setWeek: (
    memberId: string,
    locationId: string,
    days: ReadonlyArray<{ day: string; windows: ShiftTime[] }>,
  ) => void

  /** Clear every shift this person has at this branch. Never at the others. */
  clearMemberWeek: (memberId: string, locationId: string) => void

  /**
   * Take this person off this branch entirely (R05).
   *
   * Two writes, and both are needed: the assignment goes, and so do the shifts
   * that only existed because of it. Dropping the assignment alone would leave
   * a rota nobody is allowed to work, which is worse than either state on its
   * own. Their other branches are untouched — the whole reason the action names
   * one.
   */
  unassignFromLocation: (memberId: string, locationId: string) => void

  /**
   * Put somebody on the roster, at the branches they were assigned to.
   *
   * They arrive with no shifts, which is the honest state: being assigned to a
   * branch is permission to be rostered there, not a rota. The grid says "Not
   * working" all week until somebody writes one, and that is the difference
   * this screen exists to make visible.
   */
  addMember: (member: Omit<RosterMember, "id">) => void

  /**
   * Add time off at one branch (DW2.2, P0).
   *
   * The built dialog has no location field, but a single-venue product has
   * nothing to choose between. The PRD is explicit that a branch sets its own
   * time off and that "another branch's roster change never affects mine", so
   * the branch is part of the record.
   */
  addLeave: (leave: Omit<Leave, "id">) => void
  removeLeave: (leaveId: string) => void

  /** Back to the seeded week, for a reviewer who has edited it into a corner. */
  reset: () => void
  edited: boolean
}

const RotaContext = createContext<RotaValue | null>(null)

let counter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`

export function RotaProvider({
  children,
  persist = true,
  // The nine-branch roster is a superset of the three-branch one, and
  // `membersAt` filters by branch — so somebody assigned to Dubai Marina simply
  // does not appear until that branch exists. One seed covers both estates,
  // which is what makes the page's own behaviour at nine reviewable: the tab
  // strip, one grid at a time and the scroll are all page decisions, and none
  // of them are exercised by a playground row that renders a single grid.
  initialShifts = NINE_BRANCH_SHIFTS,
  initialLeaves = NINE_BRANCH_LEAVES,
  members = NINE_BRANCH_MEMBERS,
  blocks = ROSTER_BLOCKS,
}: {
  children: ReactNode
  /** False for a nested provider — a showcase must not write over a session. */
  persist?: boolean
  initialShifts?: ReadonlyArray<Shift>
  initialLeaves?: ReadonlyArray<Leave>
  members?: ReadonlyArray<RosterMember>
  blocks?: ReadonlyArray<BlockTime>
}) {
  // Seeded on both sides of the wire. The stored week arrives after mount, not
  // in the initialiser and not during the first render: localStorage does not
  // exist on the server, so either of those makes the first client render
  // disagree with the HTML, and React throws the whole tree away and rebuilds
  // it. One frame of the seed is the cheaper failure.
  const [rota, setRota] = useState<StoredRota>(() => ({
    shifts: [...initialShifts],
    leaves: [...initialLeaves],
  }))
  const [edited, setEdited] = useState(false)
  // Assignment overrides, keyed by member. Kept beside the rota rather than in
  // it because an assignment is not a shift — it is what makes shifts possible.
  const [assignments, setAssignments] = useState<Record<string, ReadonlyArray<string>>>({})

  // Once, on mount. `edited` is what the Reset button hangs off, so reading it
  // any earlier is what put a button on the client that the server never sent.
  useEffect(() => {
    if (!persist) return
    const stored = readStored()
    if (!stored) return
    setRota(stored)
    setEdited(true)
  }, [persist])

  // One writer. Repeating the try/catch at every mutation is how one of them
  // ends up missing it, and a session that silently stops persisting.
  const save = useCallback(
    (next: StoredRota) => {
      if (!persist) return next
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage blocked in a private window: the session still works, it just
        // does not survive a reload, which is the honest failure.
      }
      return next
    },
    [persist],
  )

  const setDay = useCallback<RotaValue["setDay"]>(
    (memberId, locationId, day, windows) => {
      setRota((current) => {
        const kept = current.shifts.filter(
          (s) => !(s.memberId === memberId && s.locationId === locationId && s.day === day),
        )
        const added = windows.map((w) => ({
          id: nextId("sh"),
          memberId,
          locationId,
          day,
          start: w.start,
          end: w.end,
        }))
        return save({ ...current, shifts: [...kept, ...added] })
      })
      setEdited(true)
    },
    [save],
  )

  const setWeek = useCallback<RotaValue["setWeek"]>(
    (memberId, locationId, days) => {
      setRota((current) => {
        const touched = new Set(days.map((d) => d.day))
        const kept = current.shifts.filter(
          (s) => !(s.memberId === memberId && s.locationId === locationId && touched.has(s.day)),
        )
        const added = days.flatMap((d) =>
          d.windows.map((w) => ({
            id: nextId("sh"),
            memberId,
            locationId,
            day: d.day,
            start: w.start,
            end: w.end,
          })),
        )
        return save({ ...current, shifts: [...kept, ...added] })
      })
      setEdited(true)
    },
    [save],
  )

  const clearMemberWeek = useCallback<RotaValue["clearMemberWeek"]>(
    (memberId, locationId) => {
      setRota((current) => {
        return save({
          ...current,
          shifts: current.shifts.filter(
            (s) => !(s.memberId === memberId && s.locationId === locationId),
          ),
        })
      })
      setEdited(true)
    },
    [save],
  )

  const unassignFromLocation = useCallback<RotaValue["unassignFromLocation"]>(
    (memberId, locationId) => {
      setAssignments((current) => ({
        ...current,
        [memberId]: (
          current[memberId] ??
          members.find((m) => m.id === memberId)?.locationIds ??
          []
        ).filter((id) => id !== locationId),
      }))
      setRota((current) =>
        save({
          ...current,
          shifts: current.shifts.filter(
            (s) => !(s.memberId === memberId && s.locationId === locationId),
          ),
        }),
      )
      setEdited(true)
    },
    [members, save],
  )

  const [added, setAdded] = useState<RosterMember[]>([])

  const addMember = useCallback<RotaValue["addMember"]>((member) => {
    setAdded((current) => [...current, { ...member, id: nextId("tm") }])
    setEdited(true)
  }, [])

  const addLeave = useCallback<RotaValue["addLeave"]>(
    (leave) => {
      setRota((current) => {
        return save({ ...current, leaves: [...current.leaves, { ...leave, id: nextId("lv") }] })
      })
      setEdited(true)
    },
    [save],
  )

  const removeLeave = useCallback<RotaValue["removeLeave"]>(
    (leaveId) => {
      setRota((current) => {
        return save({ ...current, leaves: current.leaves.filter((l) => l.id !== leaveId) })
      })
      setEdited(true)
    },
    [save],
  )

  const reset = useCallback(() => {
    const next = { shifts: [...initialShifts], leaves: [...initialLeaves] }
    setRota(next)
    setAssignments({})
    setAdded([])
    setEdited(false)
    if (!persist) return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [initialShifts, initialLeaves, persist])

  const value = useMemo<RotaValue>(
    () => ({
      // Assignment overrides applied here, so every surface reads one roster.
      members: [...members, ...added].map((m) =>
        assignments[m.id] ? { ...m, locationIds: assignments[m.id]! } : m,
      ),
      blocks,
      shifts: rota.shifts,
      leaves: rota.leaves,
      setDay,
      setWeek,
      clearMemberWeek,
      unassignFromLocation,
      addMember,
      addLeave,
      removeLeave,
      reset,
      edited,
    }),
    [
      members,
      added,
      assignments,
      blocks,
      rota,
      setDay,
      setWeek,
      clearMemberWeek,
      unassignFromLocation,
      addMember,
      addLeave,
      removeLeave,
      reset,
      edited,
    ],
  )

  return <RotaContext.Provider value={value}>{children}</RotaContext.Provider>
}

/**
 * The rota, or the seed when no provider is mounted.
 *
 * A fallback rather than a throw, because the grid is shown in the playground
 * without a provider and a showcase that crashed would be worse than one that
 * cannot be edited. `canEdit` is what a surface checks before offering a write.
 */
export function useRota(): RotaValue & { canEdit: boolean } {
  const value = useContext(RotaContext)
  const noop = useCallback(() => {}, [])
  const fallback = useMemo<RotaValue & { canEdit: boolean }>(
    () => ({
      // Same superset the provider seeds, so a grid shown without one — the
      // playground's rows — reads the same estate it would on the route.
      members: NINE_BRANCH_MEMBERS,
      shifts: NINE_BRANCH_SHIFTS,
      leaves: NINE_BRANCH_LEAVES,
      blocks: ROSTER_BLOCKS,
      setDay: noop,
      setWeek: noop,
      clearMemberWeek: noop,
      unassignFromLocation: noop,
      addMember: noop,
      addLeave: noop,
      removeLeave: noop,
      reset: noop,
      edited: false,
      canEdit: false,
    }),
    [noop],
  )
  if (!value) return fallback
  return { ...value, canEdit: true }
}

export type { RotaValue }
