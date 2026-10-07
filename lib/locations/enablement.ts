/**
 * Whether multi-location is switched on for this business at all (GNK §2).
 *
 * ## The ordering GNK states, which this repo did not have
 *
 * "Before any of this appears, Cami HQ turns multi-location on for that
 * business, once its data check has passed."
 *
 * Until now the repo derived the answer from the data: more than one branch
 * meant a chain. That reads the wrong way round. A merchant does not become a
 * chain by having a second row created; HQ decides, after checking the account
 * can take it, and the branches follow. The difference is visible the moment
 * anything goes wrong in the check — rows exist, the account is half migrated,
 * and every chain surface is already live to the merchant with no way to stand
 * them down short of deleting data.
 *
 * ## Why a check rather than a switch alone
 *
 * The check is what the switch is waiting for, so hiding it behind the switch
 * makes "why can't I turn this on" a support call. The three states are the
 * ones an account manager can act on: it has passed, it has not run, or it
 * found something. A failed check names what it found, because "failed" on its
 * own sends them to ask us.
 *
 * ## What it does NOT gate
 *
 * The branches themselves. A business can hold location rows with this off —
 * that is exactly the state a migration lands in — and they stay readable in
 * HQ. What it gates is the merchant's own surfaces: the switcher, the branch
 * columns, the per-branch settings, everything G3 and DW1.2 are about.
 */

export type DataCheckStatus = "passed" | "pending" | "failed"

export type MultiLocationEnablement = {
  enabled: boolean
  dataCheck: DataCheckStatus
  /** What the check found. Present only when it failed, and named rather than counted. */
  dataCheckNote?: string
  /**
   * Everything a failed check found, one fact per entry. A check rarely finds
   * one thing, and naming only the first sends the account manager round the
   * loop once per finding. `dataCheckNote` stays for a check that reports a
   * single line.
   */
  dataCheckFindings?: string[]
  /** Who at HQ turned it on, and when. Recorded because it is an HQ act (INV-08). */
  enabledBy?: string
  enabledAt?: string
}

/** Nothing switched on, and nothing checked. The state every account starts in. */
export const NOT_ENABLED: MultiLocationEnablement = { enabled: false, dataCheck: "pending" }

/**
 * Whether HQ may switch it on right now.
 *
 * Only a passed check. Turning it OFF is always allowed — an account manager
 * standing an account down should never be blocked by the reason they are
 * standing it down.
 */
export function canEnable(state: MultiLocationEnablement): boolean {
  return state.dataCheck === "passed"
}

/**
 * Every finding standing between this business and the switch, in order. Empty
 * unless the check failed — a check that has not run has found nothing yet,
 * which `blockedReason` says on its own.
 */
export function checkBlockers(state: MultiLocationEnablement): string[] {
  if (state.dataCheck !== "failed") return []
  const findings = (state.dataCheckFindings ?? []).filter((f) => f.trim().length > 0)
  if (findings.length > 0) return findings
  return state.dataCheckNote ? [state.dataCheckNote] : []
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * When it was switched on, as "14 Sep 2026". Read from the ISO date's parts
 * rather than through `Date`, so no timezone moves it a day. Anything that is
 * not an ISO date passes through unchanged.
 */
export function formatEnabledOn(iso: string | undefined): string {
  if (!iso) return ""
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match
  const name = MONTHS[Number(month) - 1]
  return name ? `${Number(day)} ${name} ${year}` : iso
}

/** Why the switch is unavailable, in words an account manager can act on. */
export function blockedReason(state: MultiLocationEnablement): string | null {
  if (state.dataCheck === "passed") return null
  if (state.dataCheck === "failed") {
    const found = checkBlockers(state)
    return found.length > 0
      ? `The data check found: ${found.join("; ")}`
      : "The data check found something that has to be fixed first."
  }
  return "The data check has not run yet."
}

/**
 * Whether this business's merchant-facing surfaces behave as a chain.
 *
 * Both halves are required, and they fail differently: switched off is HQ's
 * answer, and one branch is DW1.2's. A business switched on with one branch
 * still shows nothing — there is nothing to switch between — which is why this
 * takes the granted count rather than deciding on the flag alone.
 */
export function actsAsChain(state: MultiLocationEnablement, grantedCount: number): boolean {
  return state.enabled && grantedCount > 1
}
