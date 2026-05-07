/**
 * HQ role catalog (PRO-138, mock seed).
 *
 * The store in `lib/admin-roles-store.tsx` clones from these seeds and exposes
 * mutation methods (add, edit, delete, rename, duplicate). Anything that just
 * needs the seeded read-only catalog (e.g. server components, the auth provider)
 * can keep importing `ROLES` directly.
 */

import { ALL_HQ_PERMISSION_CODES } from "@/lib/hq-permissions-catalog"

export type Role = {
  /** Stable id, used in URLs and store mutations. */
  id: string
  /** Legacy short code for the auth provider's roleCodes lookup. Custom roles get a slug. */
  roleCode: string
  name: string
  description: string
  /**
   * System roles are seeded by engineering and cannot be deleted or renamed.
   * Their permissions can still be edited (Fresha pattern); back-end will enforce
   * minimums on the last HQ Admin role.
   */
  isSystemRole: boolean
  /** Set of permission codes granted by this role. */
  permissionCodes: string[]
}

const adminPermissions: string[] = ALL_HQ_PERMISSION_CODES

const supportPermissions: string[] = [
  "merchants.view",
  "merchants.impersonate",
  "support.read",
  "support.reply",
  "audit.read",
  "hq_users.read",
  "settings.read",
]

const financePermissions: string[] = [
  "merchants.view",
  "billing.read",
  "billing.subscriptions.edit",
  "billing.refunds.issue",
  "audit.read",
  "analytics.read",
  "analytics.export",
  "hq_users.read",
  "settings.read",
]

const managementPermissions: string[] = [
  "merchants.view",
  "merchants.edit",
  "billing.read",
  "support.read",
  "audit.read",
  "audit.export",
  "analytics.read",
  "analytics.export",
  "hq_users.read",
  "hq_users.invite",
  "hq_users.disable",
  "hq_users.role.change",
  "roles.read",
  "settings.read",
  "settings.edit",
]

export const SEED_ROLES: Role[] = [
  {
    id: "role_hq_admin",
    roleCode: "hq_admin",
    name: "HQ Admin",
    description: "Full access across the Cami HQ console.",
    isSystemRole: true,
    permissionCodes: adminPermissions,
  },
  {
    id: "role_hq_support",
    roleCode: "hq_support",
    name: "HQ Support",
    description: "Read-only access plus impersonation for the support team.",
    isSystemRole: false,
    permissionCodes: supportPermissions,
  },
  {
    id: "role_hq_finance",
    roleCode: "hq_finance",
    name: "HQ Finance",
    description:
      "Billing operators. Can manage subscriptions, refunds, and view financial reports.",
    isSystemRole: false,
    permissionCodes: financePermissions,
  },
  {
    id: "role_hq_management",
    roleCode: "hq_management",
    name: "HQ Management",
    description: "Senior leadership. Full reports access and HQ team management.",
    isSystemRole: false,
    permissionCodes: managementPermissions,
  },
]

/**
 * Read-only seed view kept for compat with existing imports (auth-mock,
 * other panes). Live mutations go through the AdminRolesProvider store.
 */
export const ROLES: Role[] = SEED_ROLES

export const PERMISSION_MODULES = [
  "Partners",
  "Billing",
  "Support",
  "Audit",
  "Analytics",
  "HQ Users",
  "Roles",
  "Settings",
]
