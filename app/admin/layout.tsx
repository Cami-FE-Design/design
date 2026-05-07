import type * as React from "react"
import { AdminAuthProvider } from "@/components/blocks/admin-auth-provider"
import { AdminRolesProvider } from "@/lib/admin-roles-store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminRolesProvider>{children}</AdminRolesProvider>
    </AdminAuthProvider>
  )
}
