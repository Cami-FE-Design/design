export type HqUserStatus = "active" | "disabled"

/**
 * Stable lookup key tying an HQ user to a role in `lib/roles-mock` /
 * `lib/admin-roles-store`. Custom roles created at runtime get auto-generated
 * codes (e.g. `hq_compliance`), so this is a plain string rather than a fixed
 * union; the canonical list is the role catalog itself.
 */
export type HqRoleCode = string

export type HqUser = {
  id: string
  name: string
  email: string
  initials: string
  roleCode: HqRoleCode
  status: HqUserStatus
  /** Marks the demo's "current user" so the Roles & Permissions pane can render the "You" badge. */
  isYou?: boolean
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
}

function makeUser(name: string, email: string, roleCode: HqRoleCode, isYou = false): HqUser {
  return {
    id: `hq_${name.toLowerCase().replace(/[^a-z]+/g, "_")}`,
    name,
    email,
    initials: initialsOf(name),
    roleCode,
    status: "active",
    isYou: isYou || undefined,
  }
}

export const initialHqUsers: HqUser[] = [
  // HQ Admin — full access. 12 members.
  makeUser("Michelle You", "michelle@cami.app", "hq_admin", true),
  makeUser("Sarah Patel", "sarah@cami.app", "hq_admin"),
  makeUser("James Wright", "james@cami.app", "hq_admin"),
  makeUser("Emma Davis", "emma@cami.app", "hq_admin"),
  makeUser("Aisha Al Hashemi", "aisha@cami.app", "hq_admin"),
  makeUser("Ben Kim", "ben@cami.app", "hq_admin"),
  makeUser("Priya Shah", "priya@cami.app", "hq_admin"),
  makeUser("Noor Hassan", "noor@cami.app", "hq_admin"),
  makeUser("Tom Chen", "tom@cami.app", "hq_admin"),
  makeUser("Lina Bouzid", "lina@cami.app", "hq_admin"),
  makeUser("Adrian Lopez", "adrian@cami.app", "hq_admin"),
  makeUser("Maya Singh", "maya@cami.app", "hq_admin"),
  // HQ Support — read-only + impersonation. 4 members.
  makeUser("Felix Brooks", "felix@cami.app", "hq_support"),
  makeUser("Hana Tanaka", "hana@cami.app", "hq_support"),
  makeUser("Owen Reilly", "owen@cami.app", "hq_support"),
  makeUser("Saskia Jensen", "saskia@cami.app", "hq_support"),
  // HQ Finance — billing operators. 2 members.
  makeUser("Ravi Iyer", "ravi@cami.app", "hq_finance"),
  makeUser("Camille Rosen", "camille@cami.app", "hq_finance"),
]
