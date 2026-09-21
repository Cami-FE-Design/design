/**
 * What a reader may *do* with a visit that happened at another branch (R13,
 * R18, SCR-07).
 *
 * ## The read is not narrowed. The action is.
 *
 * R13 fixes the readable field set as uniform across branches. Its existence is
 * the answer to the question people ask first: another branch's visits are
 * readable, or R13 would have nothing to govern. Franchise views are out of
 * scope, so this is one business with one owner and one P&L — branches are not
 * rivals keeping books from each other, and a receptionist who cannot answer "I
 * paid 180 last time" ends up telephoning the other branch, which is the
 * workaround KC1.5 already refused to design around.
 *
 * So the whole of the multi-location delta on a client record is this: you read
 * everything, and you act only where you hold a grant (G1 — every operational
 * write names one branch).
 *
 * ## This is a choice, and the PRD has not finished making it
 *
 * The live PRD (Slite `5hKLTw-Tfm0psh`, 2026-09-04) drafts the opposite in
 * **GB2.2**: "viewing that visit shows only date, branch, and service. No
 * charges, no notes" — P1, coupled to GB2.1. Its §16 still lists *R13's
 * readable field set* as an open decision owned by **Maaz**, and names GB2.2 as
 * what the decision blocks. So the story is drafted, not settled.
 *
 * We are built wide, deliberately and for the reasons above. If Maaz settles it
 * narrow, the change is contained: `grantCovers()` already decides per visit,
 * so a narrow field set is a second consumer of the same answer — the money and
 * note fields hide where it returns false, and nothing else moves. Noted here
 * rather than in the ticket because this is the file that would change.
 *
 * ## Why not being granted outranks the branch's own state
 *
 * A branch you do not hold should not tell you its lifecycle. "Shampooch Al
 * Quoz is paused" is a fact about a branch, and handing it to somebody with no
 * access to that branch is the kind of small leak BG-06 is pass/fail about. So
 * the grant is checked first and the answer stops there.
 */

import type { LocationGrants } from "@/lib/locations/store"
import type { Location } from "@/lib/locations/types"

/**
 * Why a visit takes no writes. `null` from `visitWriteBlock` means it does.
 *
 * Kept as separate reasons rather than one boolean because the sentence a
 * surface writes differs: one is about the reader, two are about the branch,
 * and "ask for access" is useless advice when the branch is archived.
 */
export type VisitWriteBlock = "not-granted" | "suspended" | "archived" | "unknown-branch"

/** Whether this reader's grant covers this branch (R04). */
export function grantCovers(grants: LocationGrants, locationId: string): boolean {
  return grants === "all" || grants.includes(locationId)
}

/**
 * Why this visit's branch takes no writes from this reader, or `null` when it
 * does.
 *
 * `unknown-branch` is a visit pointing at a branch the estate no longer lists.
 * It reads rather than disappears: a client's history is a record of what
 * happened, and dropping the row would silently shorten it.
 */
export function visitWriteBlock(
  location: Location | undefined,
  grants: LocationGrants,
  locationId: string,
): VisitWriteBlock | null {
  // Before the branch's own state, deliberately — see the note above.
  if (!grantCovers(grants, locationId)) return "not-granted"
  if (!location) return "unknown-branch"
  if (location.status === "suspended") return "suspended"
  if (location.status === "archived") return "archived"
  return null
}

/**
 * The sentence to put where the actions were.
 *
 * Said rather than left blank: an absent row of buttons and a visit with
 * nothing to do about it look identical, and only one of them is the reader's
 * problem to solve.
 */
export function visitWriteBlockMessage(block: VisitWriteBlock, branchName: string): string {
  switch (block) {
    case "not-granted":
      // Names what is missing and who fixes it, because the reader cannot.
      return `Read-only — you don't have access to ${branchName}. An owner can grant it.`
    case "suspended":
      return `Read-only — ${branchName} is paused and takes no changes.`
    case "archived":
      return `Read-only — ${branchName} is archived.`
    case "unknown-branch":
      // The visit is still true even though the branch is gone. Saying so beats
      // a dead end that looks like a bug.
      return "Read-only — this location is no longer part of the business."
  }
}

/**
 * How a client's visits fall across branches, commonest first.
 *
 * This is the one thing an owner cannot get from the rows themselves once there
 * are nine branches and a scroll. Ties keep the order they arrived in, so a
 * spread does not reshuffle between renders for no reason the reader can see.
 */
export function branchSpread(
  visits: ReadonlyArray<{ locationId: string }>,
): Array<{ locationId: string; count: number }> {
  const counts: Array<{ locationId: string; count: number }> = []
  for (const visit of visits) {
    const row = counts.find((c) => c.locationId === visit.locationId)
    if (row) row.count += 1
    else counts.push({ locationId: visit.locationId, count: 1 })
  }
  return counts.sort((a, b) => b.count - a.count)
}

/**
 * Whether this client's history involves more than one branch.
 *
 * Not the same question as "is the business multi-location". A chain's client
 * who has only ever been to one branch has nothing to disambiguate, and
 * printing a branch on every row of a single-branch history is a column of one
 * repeated word — the same mistake as stamping the city on every row of a list
 * where they are all in Dubai.
 */
export function spansBranches(visits: ReadonlyArray<{ locationId: string }>): boolean {
  return branchSpread(visits).length > 1
}
