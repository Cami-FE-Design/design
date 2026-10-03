"use client"

/**
 * Sign in as somebody else, for the length of a demo.
 *
 * Every permission rule in this repo reads the signed-in member's role and the
 * branches they hold (GNK §2, §3, R04). Until the profile pointed at a roster
 * row there was nobody to read, so the rules were written, tested, and obeyed
 * by nothing — and SU2.3, "revoking a branch narrows every surface at once",
 * could be reasoned about and never shown.
 *
 * This is the control that makes them reviewable. It sits in the dashed
 * design-repo strip, like every other control here that production decides for
 * you: it stands in for signing in as a different person, which no product
 * screen will ever offer, so it must not read as part of the screen.
 */

import { DesignRepoBar } from "@/components/blocks/design-repo-bar"
import { useCurrentUser } from "@/lib/current-user"
import { useLocations } from "@/lib/locations/store"
import { TEAM_MEMBERS } from "@/lib/team/mock"
import { roleById } from "@/lib/team/roles"
import { cn } from "@/lib/utils"

/** Named by what they can do here, not by their job title. */
function describe(
  roleId: string,
  grants: "all" | ReadonlyArray<string>,
  locationName: (id: string) => string,
): string {
  const role = roleById(roleId)?.name ?? roleId
  if (grants === "all") return `${role} · every location`
  if (grants.length === 0) return `${role} · no locations`
  if (grants.length === 1) return `${role} · ${locationName(grants[0] as string)}`
  return `${role} · ${grants.length} locations`
}

export function SignedInAs({ className }: { className?: string }) {
  const { user, actor, setMemberId } = useCurrentUser()
  const { locationName, setGrants, setScope } = useLocations()

  /**
   * Switching the person switches what they hold, not only what they may press.
   *
   * These were two halves of one fact kept in two places: the refusals read the
   * signed-in member, while the branch list read the provider's own grant. So
   * Aziz — a manager at Jumeirah — was refused the buttons and still shown all
   * nine branches, which is the R04 failure the panel exists to demonstrate,
   * performed by the panel itself. No access never means all branches (GNK §1).
   *
   * The scope goes back to "all of mine" because a scope naming a branch this
   * person does not hold resolves to nothing, and an empty screen is the wrong
   * way to say "you are somebody else now".
   */
  function signInAs(memberId: string, grants: "all" | ReadonlyArray<string>) {
    setMemberId(memberId)
    setGrants(grants === "all" ? "all" : [...grants])
    setScope({ kind: "all" })
  }

  return (
    <div className={className}>
      <DesignRepoBar
        label="sign in as somebody else"
        note={describe(actor.roleId, actor.grants, locationName)}
      >
        {TEAM_MEMBERS.map((member) => {
          const active = member.id === user.memberId
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => signInAs(member.id, member.locationGrants ?? "all")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                active
                  ? "border-foreground/30 bg-background text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {/* An invited member has no name yet, and their email is what the
                  roster shows for them — so it is what this shows too. */}
              {member.name ?? member.email}
            </button>
          )
        })}
      </DesignRepoBar>
    </div>
  )
}
