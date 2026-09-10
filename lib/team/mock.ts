import type { LocationGrants } from "@/lib/locations/store"

// Single source of truth for the business's team roster. Both the Team settings
// listing and the Reporting module read from here so a Team member link cell in
// any report opens that member's ACTUAL profile (no fabricated look-ups).

export type TeamPermission = "High" | "Medium" | "Low"
export type TeamMemberStatus = "active" | "pending"

export type TeamMember = {
  id: string
  name: string | null
  title?: string
  email: string
  phone?: string
  /**
   * Kept while the reporting module and the older team surfaces still read it.
   * It is neither of the two axes access actually resolves on — see
   * lib/team/roles.ts — so `roleId` and `locationGrants` are what a new surface
   * should read.
   */
  permission: TeamPermission
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

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "m_owner",
    name: "Maz Khan",
    title: "Manager",
    email: "maaz@getcami.io",
    phone: "+971 50 963 6445",
    permission: "High",
    status: "active",
    initials: "MK",
    roleId: "owner",
    locationGrants: "all",
  },
  {
    id: "m_aziz",
    name: "Aziz Rahman",
    title: "Senior Groomer",
    email: "aziz@getcami.io",
    phone: "+971 50 118 2204",
    permission: "Medium",
    status: "active",
    initials: "AR",
    roleId: "manager",
    // The pilot configuration asks for exactly this: one manager granted one
    // branch, so SU2.1 and SU2.2 are exercised by a real person rather than
    // assumed. Aziz runs Jumeirah and sees nothing of JVC.
    locationGrants: ["shampooch-jumeirah"],
  },
  {
    id: "m_sara",
    name: "Sara Park",
    title: "Groomer",
    email: "sara@getcami.io",
    phone: "+971 54 402 0718",
    permission: "Medium",
    status: "active",
    initials: "SP",
    roleId: "staff",
    locationGrants: ["shampooch-jvc"],
  },
  {
    id: "m_beth",
    name: "Beth Carter",
    title: "Stylist",
    email: "beth@getcami.io",
    phone: "+971 55 218 9043",
    permission: "Medium",
    status: "active",
    initials: "BC",
    roleId: "staff",
    // Works two sites, which is DW2.3's roving stylist.
    locationGrants: ["shampooch-jvc", "shampooch-jumeirah"],
  },
  {
    id: "m_ahmed",
    name: null,
    email: "ahmed@getcami.io",
    permission: "Low",
    status: "pending",
    initials: "A",
    roleId: "receptionist",
    // Invited, not yet granted a branch. Performs no operational read or
    // write, and this empty array must never resolve to every branch (R24).
    locationGrants: [],
  },
]

/** Resolve a report row's team-member display name to the real roster profile. */
export function findTeamMemberByName(name: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.name === name)
}
