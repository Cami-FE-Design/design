"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { RolePermissionsEditor } from "@/components/blocks/role-permissions-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminRoles } from "@/lib/admin-roles-store"
import { useAuth } from "@/lib/auth-mock"

const COPY = {
  en: {
    title: "Add permission role",
    subtitle:
      "Define a new role for the HQ team. You can update permissions and members at any time.",
    nameLabel: "Role name",
    namePlaceholder: "e.g. HQ Compliance",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Short summary shown on the permission roles list.",
    permissions: "Permissions",
    permissionsHint:
      "Select the areas of your workspace that team members in this role can access and manage.",
    saved: (name: string) => `${name} created.`,
    nameError: "Use 2 to 50 characters.",
    duplicateError: "A role with this name already exists.",
  },
  ar: {
    title: "إضافة دور",
    subtitle: "أنشئ دورًا جديدًا لفريق المقر. يمكنك تحديث الأذونات والأعضاء في أي وقت.",
    nameLabel: "اسم الدور",
    namePlaceholder: "مثال: HQ Compliance",
    descriptionLabel: "الوصف",
    descriptionPlaceholder: "ملخص قصير يظهر في قائمة الأدوار.",
    permissions: "الأذونات",
    permissionsHint: "اختر المجالات في مساحة العمل التي يمكن لأعضاء الفريق الوصول إليها وإدارتها.",
    saved: (name: string) => `تم إنشاء ${name}.`,
    nameError: "استخدم من 2 إلى 50 حرفًا.",
    duplicateError: "يوجد دور بهذا الاسم بالفعل.",
  },
}

type AddRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddRoleDialog({ open, onOpenChange }: AddRoleDialogProps) {
  const { locale } = useAuth()
  const t = COPY[locale]
  const { roles, addRole } = useAdminRoles()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [draftCodes, setDraftCodes] = useState<Set<string>>(() => new Set())
  const [submitted, setSubmitted] = useState(false)

  // Reset every time the dialog opens.
  useEffect(() => {
    if (open) {
      setName("")
      setDescription("")
      setDraftCodes(new Set())
      setSubmitted(false)
    }
  }, [open])

  const trimmed = name.trim()
  const isDuplicate = roles.some(
    (r) => r.name.trim().toLowerCase() === trimmed.toLowerCase() && trimmed.length > 0,
  )
  const nameLengthOk = trimmed.length >= 2 && trimmed.length <= 50
  const canSave = nameLengthOk && !isDuplicate

  const nameError =
    submitted && !nameLengthOk ? t.nameError : submitted && isDuplicate ? t.duplicateError : null

  function handleSave() {
    setSubmitted(true)
    if (!canSave) return
    const created = addRole({
      name: trimmed,
      description: description.trim(),
      permissionCodes: [...draftCodes],
    })
    toast.success(t.saved(created.name))
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.title}
      subtitle={t.subtitle}
      onSave={handleSave}
      saveDisabled={!canSave}
      contentClassName="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="add-role-name">{t.nameLabel}</Label>
          <Input
            id="add-role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={50}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "add-role-name-err" : undefined}
          />
          {nameError ? (
            <p id="add-role-name-err" className="text-xs text-destructive">
              {nameError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="add-role-description">{t.descriptionLabel}</Label>
          <Textarea
            id="add-role-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            maxLength={200}
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold leading-7 text-foreground">
          {t.permissions}
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">{t.permissionsHint}</p>
      </div>

      <RolePermissionsEditor
        permissionCodes={draftCodes}
        onChange={setDraftCodes}
        locale={locale}
      />
    </FullScreenEditDialog>
  )
}
