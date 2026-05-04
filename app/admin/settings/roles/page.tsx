import type { Metadata } from "next"
import { AdminShell } from "@/components/blocks/admin-shell"
import { RolePermissionsTable } from "@/components/blocks/role-permissions-table"

export const metadata: Metadata = {
  title: "Roles & Permissions · Cami HQ",
}

export default function AdminRolesPage() {
  return (
    <AdminShell
      header={
        <div className="flex w-full flex-col gap-1">
          <h1 className="font-heading text-base font-medium leading-6 text-foreground">
            Roles & Permissions
          </h1>
          <p className="text-xs leading-4 text-muted-foreground">
            Cami uses fixed role definitions. To request a change, contact engineering.
          </p>
        </div>
      }
    >
      <RolePermissionsTable />
    </AdminShell>
  )
}
