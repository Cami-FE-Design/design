"use client"

/**
 * Who may change what about a branch, as one table (GNK §2, §3).
 *
 * Six surfaces ask these four questions, so the answers are drawn once here
 * rather than argued about per screen. Roles across, actions down, and the two
 * refusals kept visibly apart: a role that cannot do it at all, and a role that
 * can but not at this branch. They read the same in a disabled button and they
 * are two different conversations at the counter.
 *
 * Not wired to a session — the prototype has no signed-in team member to
 * resolve a role from. This is the rule made reviewable ahead of that.
 */

import { CheckIcon, MinusIcon } from "lucide-react"

import { type Actor, type BranchAction, mayChangeBranch } from "@/lib/locations/who-may"

const ACTIONS: Array<{ id: BranchAction; label: string }> = [
  { id: "createBranch", label: "Create a location" },
  { id: "changeBranchState", label: "Suspend or archive one" },
  { id: "setAccess", label: "Set who holds which locations" },
  { id: "editTaxDetails", label: "Edit tax details and receipt numbering" },
  { id: "assignWhatsAppNumber", label: "Assign a WhatsApp number" },
  { id: "editServiceSettings", label: "Change a service's price here" },
]

const ACTORS: Array<{ label: string; actor: Actor; note: string }> = [
  { label: "Owner", actor: { roleId: "owner", grants: "all" }, note: "every location" },
  {
    label: "Manager",
    actor: { roleId: "manager", grants: ["shampooch-jumeirah"] },
    note: "holds Jumeirah",
  },
  // The second manager is the whole reason the table has two refusals rather
  // than one: same role, same permissions, a branch they were not given. Their
  // column is identical to the one beside it except where the grant decides.
  {
    label: "Manager",
    actor: { roleId: "manager", grants: ["shampooch-jvc"] },
    note: "holds JVC only",
  },
  {
    label: "Reception",
    actor: { roleId: "receptionist", grants: ["shampooch-jumeirah"] },
    note: "holds Jumeirah",
  },
  {
    label: "Groomer",
    actor: { roleId: "staff", grants: ["shampooch-jumeirah"] },
    note: "holds Jumeirah",
  },
]

/** The branch the table asks about — the one the manager holds. */
const AT = "shampooch-jumeirah"

export function WhoMayChangeBranch() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/60 bg-card p-4">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="pb-2 text-left font-medium text-muted-foreground">At Jumeirah</th>
            {ACTORS.map((a) => (
              <th key={a.label} className="px-2 pb-2 text-left font-medium text-foreground">
                {a.label}
                <span className="block text-xs font-normal text-muted-foreground">{a.note}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTIONS.map((action) => (
            <tr key={action.id} className="border-t border-border/60">
              <td className="py-2 pr-3 text-foreground">{action.label}</td>
              {ACTORS.map((a) => {
                const verdict = mayChangeBranch(a.actor, action.id, AT)
                return (
                  <td key={a.label} className="px-2 py-2">
                    {verdict.allowed ? (
                      <span className="inline-flex items-center gap-1 text-cami-green-11">
                        <CheckIcon className="size-4" aria-hidden />
                        <span className="sr-only">Allowed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <MinusIcon className="size-4" aria-hidden />
                        <span className="text-xs">
                          {verdict.reason === "roleCannot" ? "Owner only" : "Not their location"}
                        </span>
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
