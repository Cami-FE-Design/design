export type RolePermission = {
  code: string
  module: string
  action: string
  description: string
}

export type Role = {
  roleCode: string
  name: string
  description: string
  isSystemRole: boolean
  permissions: RolePermission[]
}

const merchants: RolePermission[] = [
  {
    code: "merchants.view",
    module: "Merchants",
    action: "view",
    description: "View partners",
  },
  {
    code: "merchants.edit",
    module: "Merchants",
    action: "edit",
    description: "Edit partner details",
  },
  {
    code: "merchants.impersonate",
    module: "Merchants",
    action: "impersonate",
    description: "Sign in as a Partner Owner",
  },
]

const billing: RolePermission[] = [
  { code: "billing.read", module: "Billing", action: "read", description: "View billing data" },
  {
    code: "billing.edit",
    module: "Billing",
    action: "edit",
    description: "Adjust subscriptions and credits",
  },
]

const support: RolePermission[] = [
  { code: "support.read", module: "Support", action: "read", description: "View support tickets" },
]

const audit: RolePermission[] = [
  { code: "audit.read", module: "Audit", action: "read", description: "View HQ audit log" },
]

const analytics: RolePermission[] = [
  { code: "analytics.read", module: "Analytics", action: "read", description: "View HQ analytics" },
]

const hqUsers: RolePermission[] = [
  { code: "hq_users.read", module: "HQ Users", action: "read", description: "View HQ team" },
  {
    code: "hq_users.edit",
    module: "HQ Users",
    action: "edit",
    description: "Invite and remove HQ team",
  },
]

const roles: RolePermission[] = [
  {
    code: "roles.read",
    module: "Roles",
    action: "read",
    description: "View roles and permissions",
  },
]

const dashboard: RolePermission[] = [
  {
    code: "dashboard.view",
    module: "Dashboard",
    action: "view",
    description: "Access HQ dashboard",
  },
]

export const ROLES: Role[] = [
  {
    roleCode: "hq_admin",
    name: "HQ Admin",
    description: "Full access across the Cami HQ console.",
    isSystemRole: true,
    permissions: [
      ...dashboard,
      ...merchants,
      ...billing,
      ...support,
      ...audit,
      ...analytics,
      ...hqUsers,
      ...roles,
    ],
  },
  {
    roleCode: "hq_support",
    name: "HQ Support",
    description: "Read-only access for the support team plus impersonation.",
    isSystemRole: true,
    permissions: [
      ...dashboard,
      {
        code: "merchants.view",
        module: "Merchants",
        action: "view",
        description: "View partners",
      },
      {
        code: "merchants.impersonate",
        module: "Merchants",
        action: "impersonate",
        description: "Sign in as a Partner Owner",
      },
      ...support,
      ...audit,
    ],
  },
  {
    roleCode: "hq_billing",
    name: "HQ Billing",
    description: "Billing operators. Sees merchants and full billing.",
    isSystemRole: true,
    permissions: [
      ...dashboard,
      {
        code: "merchants.view",
        module: "Merchants",
        action: "view",
        description: "View partners",
      },
      ...billing,
      ...audit,
    ],
  },
]

export const PERMISSION_MODULES = [
  "Dashboard",
  "Merchants",
  "Billing",
  "Support",
  "Audit",
  "Analytics",
  "HQ Users",
  "Roles",
]
