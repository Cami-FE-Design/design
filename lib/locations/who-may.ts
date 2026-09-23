/**
 * Who may change what about a branch (GNK §2 and §3).
 *
 * ## The rules, as their document states them
 *
 * §2 — only the owner can create or suspend a branch, decide who gets access to
 * which branches, edit a branch's tax details, or assign its WhatsApp number.
 *
 * §3 — only the owner and a manager can change a branch's service settings;
 * reception and service staff cannot. And a manager can change **only the
 * branches they have been given**, which is the second axis: a role says what,
 * a grant says where, and neither widens the other (R04).
 *
 * ## Why this is a module and not a set of `disabled` props
 *
 * The same four questions are asked by six surfaces — the locations panel, the
 * grants dialog, the tax identity tab, the WhatsApp numbers panel, the service
 * editor's Locations section, and HQ looking at any of them. Answered inline,
 * six screens drift, and the one that drifts quietly is the one that lets
 * somebody through.
 *
 * ## What this does NOT do yet
 *
 * Enforce itself. The prototype has no signed-in team member: `lib/current-user`
 * holds a profile that matches no roster row, so there is nothing honest to
 * resolve a role from at runtime. The rule is written and tested, and the
 * playground shows it against the four roles — wiring it to a session is the
 * `SU2.3` item the spec already records as demonstrable only once that concept
 * exists.
 *
 * The product's own permission codes are also not there yet: it ships one
 * `venues:read` that bundles viewing a branch with changing it, which is why
 * four of the five codes in the grants dialog are marked Proposed.
 */

export type BranchAction =
  /** Create a branch, or stand one up in chain setup (R02). */
  | "createBranch"
  /** Suspend, reactivate or archive one (R01, R12). */
  | "changeBranchState"
  /** Who holds which branches (R04, SCR-03). */
  | "setAccess"
  /** Legal name, TRN, receipt prefix and sequence (R23, R25). */
  | "editTaxDetails"
  /** Bind or replace a branch's WhatsApp number (R21, SCR-14). */
  | "assignWhatsAppNumber"
  /** Price, duration and whether a service is offered here (R06, DW3.3). */
  | "editServiceSettings"

/** Owner-only, per §2. Everything else on this list is §3's shorter one. */
const OWNER_ONLY: ReadonlySet<BranchAction> = new Set<BranchAction>([
  "createBranch",
  "changeBranchState",
  "setAccess",
  "editTaxDetails",
  "assignWhatsAppNumber",
])

export type Actor = {
  roleId: string
  /** "all" for an owner — every branch, including ones added later (R24). */
  grants: "all" | ReadonlyArray<string>
}

export type Verdict = { allowed: true } | { allowed: false; reason: "roleCannot" | "branchNotHeld" }

/**
 * Whether this person may do this to this branch.
 *
 * Two refusals, kept apart because they are two different conversations: the
 * role cannot do it at all, or it can and not here. "You don't have permission"
 * for the second sends a manager to ask the owner for a role they already have.
 */
export function mayChangeBranch(actor: Actor, action: BranchAction, locationId: string): Verdict {
  const isOwner = actor.roleId === "owner"
  if (isOwner) return { allowed: true }

  if (OWNER_ONLY.has(action)) return { allowed: false, reason: "roleCannot" }

  // §3: service settings are the owner's and a manager's. Reception and service
  // staff are named in the document as unable, so this is an allow-list rather
  // than "anyone who is not reception".
  if (action === "editServiceSettings" && actor.roleId !== "manager") {
    return { allowed: false, reason: "roleCannot" }
  }

  const holds = actor.grants === "all" || actor.grants.includes(locationId)
  return holds ? { allowed: true } : { allowed: false, reason: "branchNotHeld" }
}

/** What to say, in the words the person can act on. */
export function refusalFor(verdict: Verdict, branchName: string): string | null {
  if (verdict.allowed) return null
  return verdict.reason === "roleCannot"
    ? "Only the account owner can change this."
    : `You don't have access to ${branchName}. Ask the owner to add it.`
}
