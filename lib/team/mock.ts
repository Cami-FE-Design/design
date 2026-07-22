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
  permission: TeamPermission
  status: TeamMemberStatus
  initials: string
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
  },
  {
    id: "m_ahmed",
    name: null,
    email: "ahmed@getcami.io",
    permission: "Low",
    status: "pending",
    initials: "A",
  },
]

/** Resolve a report row's team-member display name to the real roster profile. */
export function findTeamMemberByName(name: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.name === name)
}
