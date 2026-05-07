"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { RolePermissionsEditor } from "@/components/blocks/role-permissions-editor"
import { useAdminRoles } from "@/lib/admin-roles-store"
import { useAuth } from "@/lib/auth-mock"
import type { Role } from "@/lib/roles-mock"

const COPY = {
  en: {
    title: (name: string) => `Edit ${name} permission role`,
    subtitle:
      "Select the areas of your workspace that team members in this role can access and manage.",
    saved: (name: string) => `${name} permissions updated.`,
  },
  ar: {
    title: (name: string) => `تعديل دور ${name}`,
    subtitle: "اختر المجالات في مساحة العمل التي يمكن لأعضاء الفريق الوصول إليها وإدارتها.",
    saved: (name: string) => `تم تحديث أذونات ${name}.`,
  },
}

type EditRoleDialogProps = {
  /** When non-null, the dialog is open and edits this role. */
  role: Role | null
  onOpenChange: (open: boolean) => void
}

/**
 * Full-screen edit takeover stacked on top of the Settings dialog. Clones the
 * role's current permissions into local draft state on open; commits via the
 * admin-roles store on Save.
 */
export function EditRoleDialog({ role, onOpenChange }: EditRoleDialogProps) {
  const { locale } = useAuth()
  const t = COPY[locale]
  const { updateRolePermissions } = useAdminRoles()

  const seededCodes = role?.permissionCodes
  const [draftCodes, setDraftCodes] = useState<Set<string>>(() => new Set(seededCodes ?? []))

  useEffect(() => {
    if (seededCodes) setDraftCodes(new Set(seededCodes))
  }, [seededCodes])

  const isDirty = useMemo(() => {
    if (!role) return false
    if (role.permissionCodes.length !== draftCodes.size) return true
    return role.permissionCodes.some((c) => !draftCodes.has(c))
  }, [role, draftCodes])

  if (!role) return null

  return (
    <FullScreenEditDialog
      open={role !== null}
      onOpenChange={onOpenChange}
      title={t.title(role.name)}
      subtitle={t.subtitle}
      saveDisabled={!isDirty}
      contentClassName="max-w-3xl"
      onSave={() => {
        updateRolePermissions(role.id, [...draftCodes])
        toast.success(t.saved(role.name))
        onOpenChange(false)
      }}
    >
      <RolePermissionsEditor
        permissionCodes={draftCodes}
        onChange={setDraftCodes}
        locale={locale}
      />
    </FullScreenEditDialog>
  )
}
