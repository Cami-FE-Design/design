import {
  BarChart3Icon,
  ContactRoundIcon,
  CreditCardIcon,
  HeadsetIcon,
  HomeIcon,
  type LucideIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import type { PermissionKey } from "@/lib/auth-mock"

export type AdminMenuItem = {
  icon: LucideIcon
  label: string
  href?: string
  permission?: PermissionKey
  /** Required when this item is a parent group; renders a collapsible section. */
  children?: AdminMenuItem[]
  hasUpdate?: boolean
  notificationCount?: number
}

export const adminTopMenu: AdminMenuItem[] = [
  { icon: HomeIcon, label: "Dashboard", href: "/admin", permission: "dashboard.view" },
  {
    icon: ContactRoundIcon,
    label: "Pet Businesses",
    href: "/admin/businesses",
    permission: "merchants.view",
  },
  { icon: CreditCardIcon, label: "Billing", href: "/admin/billing", permission: "billing.read" },
  { icon: HeadsetIcon, label: "Support", href: "/admin/support", permission: "support.read" },
  { icon: ScrollTextIcon, label: "Audit Log", href: "/admin/audit", permission: "audit.read" },
  {
    icon: BarChart3Icon,
    label: "Analytics",
    href: "/admin/analytics",
    permission: "analytics.read",
  },
  { icon: UsersIcon, label: "Users", href: "/admin/users", permission: "hq_users.read" },
]

export const adminBottomMenu: AdminMenuItem[] = [
  {
    icon: SettingsIcon,
    label: "Settings",
    children: [
      {
        icon: ShieldCheckIcon,
        label: "Roles & Permissions",
        href: "/admin/settings/roles",
        permission: "roles.read",
      },
    ],
  },
]
