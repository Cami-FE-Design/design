import type * as React from "react"
import { AdminAuthProvider } from "@/components/blocks/admin-auth-provider"
import { AdminRolesProvider } from "@/lib/admin-roles-store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // AdminRolesProvider must wrap AdminAuthProvider so the AdminSettingsController
  // (rendered inside AdminAuthProvider) has the roles store in scope. Otherwise
  // opening the Settings dialog → Roles & Permissions pane crashes with
  // "useAdminRoles must be used inside <AdminRolesProvider>".
  return (
    <AdminRolesProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </AdminRolesProvider>
  )
}
