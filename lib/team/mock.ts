import type { LocationGrants } from "@/lib/locations/store"
import { staffById } from "@/lib/team/staff"

// Who can sign in to the business, and what they may access. Team settings and
// the Reporting module read it, so a Team member cell in any report opens that
// member's actual profile.
//
// A member is the person on lib/team/staff.ts with the same id — name and
// title come from there, so the two lists cannot disagree, and the rota's
// "View team member" lands on the right row. What this file adds is access:
// email, invite status, role and branch grants. An invite nobody has accepted
// yet has no staff record.

export type TeamMemberStatus = "active" | "pending"

export type TeamMember = {
  id: string
  name: string | null
  title?: string
  email: string
  phone?: string
  status: TeamMemberStatus
  initials: string
  /** What this person may do. Defined once per role (R04). */
  roleId: string
  /**
   * Where they may do it. Independent of the role: `"all"` is every branch the
   * business has now and later, an array is a named set, and `[]` is no access
   * at all — never "all" (R24).
   */
  locationGrants: LocationGrants
}

/** Name and job title, from the staff roster. */
function person(id: string): { id: string; name: string; title: string } {
  const staff = staffById(id)
  if (!staff) throw new Error(`Team member "${id}" has no staff record in lib/team/staff.ts`)
  return { id, name: staff.name, title: staff.role }
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    ...person("maz-khan"),
    email: "maaz@getcami.io",
    phone: "+971 50 412 7730",
    status: "active",
    initials: "MK",
    roleId: "owner",
    locationGrants: "all",
  },
  {
    ...person("aziz-rahman"),
    email: "aziz@getcami.io",
    phone: "+971 50 118 2204",
    status: "active",
    initials: "AR",
    roleId: "manager",
    // The pilot configuration asks for exactly this: one manager granted one
    // branch, so SU2.1 and SU2.2 are exercised by a real person rather than
    // assumed. Aziz runs Jumeirah and sees nothing of JVC.
    locationGrants: ["shampooch-jumeirah"],
  },
  {
    ...person("sara-park"),
    email: "sara@getcami.io",
    phone: "+971 54 402 0718",
    status: "active",
    initials: "SP",
    roleId: "staff",
    locationGrants: ["shampooch-jvc"],
  },
  {
    ...person("beth-carter"),
    email: "beth@getcami.io",
    phone: "+971 55 218 9043",
    status: "active",
    initials: "BC",
    roleId: "staff",
    // Works two sites, which is DW2.3's roving stylist.
    locationGrants: ["shampooch-jvc", "shampooch-jumeirah"],
  },
  {
    id: "ahmed-invite",
    name: null,
    email: "ahmed@getcami.io",
    status: "pending",
    initials: "A",
    roleId: "receptionist",
    // Invited, not yet granted a branch. Performs no operational read or
    // write, and this empty array must never resolve to every branch (R24).
    locationGrants: [],
  },
]

/**
 * The ids team members had before they shared the staff roster's. Review links
 * already sent use them (`?access=m_aziz`, `?services=m_beth`), and a browser
 * may have one saved as the signed-in member, so they keep resolving.
 */
const LEGACY_MEMBER_IDS: Record<string, string> = {
  m_owner: "maz-khan",
  m_aziz: "aziz-rahman",
  m_sara: "sara-park",
  m_beth: "beth-carter",
  m_ahmed: "ahmed-invite",
}

/** A member id as it is now, whether given the current one or a legacy one. */
export function resolveMemberId(id: string): string {
  return LEGACY_MEMBER_IDS[id] ?? id
}

/** Resolve a report row's team-member display name to the real roster profile. */
export function findTeamMemberByName(name: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.name === name)
}
