"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Role } from "@/lib/roles-mock"

const COPY = {
  en: {
    title: "Rename role",
    description: "Update the name and description shown on the permission roles list.",
    nameLabel: "Role name",
    descriptionLabel: "Description",
    cancel: "Cancel",
    save: "Save",
    nameRequired: "Role name is required.",
    nameTooShort: "Use at least 2 characters.",
    nameTooLong: "50 characters maximum.",
  },
  ar: {
    title: "إعادة تسمية الدور",
    description: "حدّث الاسم والوصف الظاهر في قائمة الأدوار.",
    nameLabel: "اسم الدور",
    descriptionLabel: "الوصف",
    cancel: "إلغاء",
    save: "حفظ",
    nameRequired: "اسم الدور مطلوب.",
    nameTooShort: "استخدم حرفين على الأقل.",
    nameTooLong: "بحد أقصى 50 حرفًا.",
  },
}

type RenameRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  locale?: "en" | "ar"
  onSave: (name: string, description: string) => void
}

export function RenameRoleDialog({
  open,
  onOpenChange,
  role,
  locale = "en",
  onSave,
}: RenameRoleDialogProps) {
  const t = COPY[locale]
  const [name, setName] = useState(role?.name ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open && role) {
      setName(role.name)
      setDescription(role.description)
      setTouched(false)
    }
  }, [open, role])

  const trimmed = name.trim()
  const error =
    touched && trimmed.length === 0
      ? t.nameRequired
      : touched && trimmed.length < 2
        ? t.nameTooShort
        : trimmed.length > 50
          ? t.nameTooLong
          : null

  const canSave = trimmed.length >= 2 && trimmed.length <= 50 && description.length <= 200

  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rename-role-name">{t.nameLabel}</Label>
            <Input
              id="rename-role-name"
              value={name}
              onChange={(e) => {
                setTouched(true)
                setName(e.target.value)
              }}
              onBlur={() => setTouched(true)}
              maxLength={50}
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "rename-role-name-err" : undefined}
            />
            {error ? (
              <p id="rename-role-name-err" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rename-role-description">{t.descriptionLabel}</Label>
            <Textarea
              id="rename-role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button
            onClick={() => canSave && onSave(trimmed, description.trim())}
            disabled={!canSave}
          >
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
