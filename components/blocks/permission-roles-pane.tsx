"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AddRoleDialog } from "@/components/blocks/admin/add-role-dialog"
import { EditRoleDialog } from "@/components/blocks/admin/edit-role-dialog"
import { RenameRoleDialog } from "@/components/blocks/admin/rename-role-dialog"
import { PermissionRoleRow } from "@/components/blocks/permission-role-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminRoles } from "@/lib/admin-roles-store"
import { useAuth } from "@/lib/auth-mock"
import type { Role } from "@/lib/roles-mock"

const COPY = {
  en: {
    add: "Add a new role",
    moved: (name: string) => `${name} renamed.`,
    duplicated: (name: string) => `${name} duplicated.`,
    setDefault: (name: string) => `${name} is now the default role.`,
    moved_order: "Order updated.",
  },
  ar: {
    add: "إضافة دور جديد",
    moved: (name: string) => `تمت إعادة تسمية ${name}.`,
    duplicated: (name: string) => `تم تكرار ${name}.`,
    setDefault: (name: string) => `${name} هو الدور الافتراضي الآن.`,
    moved_order: "تم تحديث الترتيب.",
  },
}

export function PermissionRolesPane() {
  const { locale } = useAuth()
  const t = COPY[locale]
  const { roles, defaultRoleId, renameRole, duplicateRole, setAsDefault, moveRole } =
    useAdminRoles()

  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [renameTarget, setRenameTarget] = useState<Role | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  function rowProps(role: Role, index: number) {
    // Move boundaries: a custom role can swap up only if its previous sibling
    // is also custom (system roles like HQ Admin are pinned in place even when
    // they share the visual list).
    const prev = roles[index - 1]
    const next = roles[index + 1]
    return {
      role,
      isDefault: defaultRoleId === role.id,
      locale,
      onEdit: () => setEditTarget(role),
      // Manage team members + Delete are flagged WIP in the dropdown menu;
      // wiring left as no-ops until the flows are designed.
      onManageMembers: () => {},
      onRename: role.isSystemRole ? undefined : () => setRenameTarget(role),
      onDuplicate: () => {
        const dup = duplicateRole(role.id)
        if (dup) toast.success(t.duplicated(role.name))
      },
      onSetDefault: () => {
        setAsDefault(role.id)
        toast.success(t.setDefault(role.name))
      },
      onDelete: role.isSystemRole ? undefined : () => {},
      canMoveUp: !role.isSystemRole && prev !== undefined && !prev.isSystemRole,
      canMoveDown: !role.isSystemRole && next !== undefined && !next.isSystemRole,
      onMoveUp: role.isSystemRole
        ? undefined
        : () => {
            moveRole(role.id, "up")
            toast.success(t.moved_order)
          },
      onMoveDown: role.isSystemRole
        ? undefined
        : () => {
            moveRole(role.id, "down")
            toast.success(t.moved_order)
          },
    }
  }

  return (
    <div data-slot="permission-roles-pane" className="flex min-w-0 flex-col gap-3">
      {roles.map((role, index) => (
        <PermissionRoleRow key={role.id} {...rowProps(role, index)} />
      ))}
      <Button
        variant="secondary"
        size="lg"
        onClick={() => setAddOpen(true)}
        className="w-fit text-muted-foreground hover:text-foreground"
      >
        <PlusIcon />
        {t.add}
        <Badge variant="secondary" className="ms-1 bg-background/60 font-normal">
          WIP
        </Badge>
      </Button>

      <EditRoleDialog role={editTarget} onOpenChange={(o) => !o && setEditTarget(null)} />

      <AddRoleDialog open={addOpen} onOpenChange={setAddOpen} />

      <RenameRoleDialog
        open={renameTarget !== null}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        role={renameTarget}
        locale={locale}
        onSave={(name, description) => {
          if (renameTarget) {
            renameRole(renameTarget.id, name, description)
            toast.success(t.moved(name))
            setRenameTarget(null)
          }
        }}
      />
    </div>
  )
}
