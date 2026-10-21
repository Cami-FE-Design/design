import {
  type BlockTime,
  dayCell,
  type Leave,
  type RosterMember,
  type Shift,
} from "@/lib/team/shifts"

/**
 * Which of a branch's team the calendar shows (BUG-21).
 *
 * The built team picker offers All team or a hand-picked set, so a receptionist
 * opening the day ticks off whoever isn't in, every day. "Scheduled team" is a
 * third choice that reads the rota instead: the people working at this branch
 * on the day in view.
 *
 * It is a mode, not a list. Paging to tomorrow shows tomorrow's team; a saved
 * list of names would carry today's people into a day they aren't working.
 */
export type TeamSelection =
  | { mode: "all" }
  | { mode: "scheduled" }
  | { mode: "custom"; ids: ReadonlySet<string> }

const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

/** The rota's day id for an ISO date: "2026-05-13" → "wed". */
export function rotaDay(isoDate: string): string {
  return WEEKDAY_IDS[new Date(`${isoDate}T12:00:00`).getDay()]!
}

/**
 * Who works at this branch on this day. A full-day leave takes somebody out;
 * a part-day one does not, since they are still in for the rest of it.
 */
export function scheduledMemberIds(
  members: ReadonlyArray<RosterMember>,
  rota: {
    shifts: ReadonlyArray<Shift>
    leaves: ReadonlyArray<Leave>
    blocks: ReadonlyArray<BlockTime>
  },
  locationId: string,
  day: string,
): Set<string> {
  return new Set(
    members
      .filter(
        (m) => !dayCell(rota.shifts, rota.leaves, rota.blocks, m.id, locationId, day).notWorking,
      )
      .map((m) => m.id),
  )
}

/**
 * The calendar opens on Scheduled team: the people in today are who the front
 * desk is booking. A day with nobody scheduled (a closed day) falls back to All
 * team, since an empty grid reads as the calendar failing to load.
 */
export const DEFAULT_TEAM_SELECTION: TeamSelection = { mode: "scheduled" }

/** The selection actually applied on this day, after the closed-day fallback. */
export function resolveTeamSelection(
  selection: TeamSelection,
  scheduled: ReadonlySet<string>,
): TeamSelection {
  return selection.mode === "scheduled" && scheduled.size === 0 ? { mode: "all" } : selection
}

/** The columns the grid draws for a selection. */
export function visibleMemberIds(
  selection: TeamSelection,
  members: ReadonlyArray<RosterMember>,
  scheduled: ReadonlySet<string>,
): Set<string> {
  const applied = resolveTeamSelection(selection, scheduled)
  if (applied.mode === "all") return new Set(members.map((m) => m.id))
  if (applied.mode === "scheduled") return new Set(scheduled)
  return new Set(applied.ids)
}

/**
 * The team button's label. The built labels stay as they are (All team, one
 * name, "3 members"); Scheduled team names itself, so the button says why
 * somebody is missing from the grid.
 */
export function teamSelectionLabel(
  selection: TeamSelection,
  members: ReadonlyArray<RosterMember>,
  scheduled: ReadonlySet<string>,
): string {
  const applied = resolveTeamSelection(selection, scheduled)
  if (applied.mode === "all") return "All team"
  if (applied.mode === "scheduled") return "Scheduled team"
  const { ids } = applied
  if (ids.size === members.length) return "All team"
  if (ids.size === 1) {
    const [id] = ids
    return members.find((m) => m.id === id)?.name ?? "All team"
  }
  return `${ids.size} members`
}
