"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  PencilIcon,
  PencilLineIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/lib/roles-mock"

const COPY = {
  en: {
    defaultBadge: "Default",
    optionsLabel: "Options",
    editPermissions: "Edit permissions",
    manageMembers: "Manage team members",
    rename: "Rename",
    duplicate: "Duplicate",
    setDefault: "Set as default",
    delete: "Delete",
    moveUp: "Move up",
    moveDown: "Move down",
    options: (name: string) => `Options for ${name}`,
  },
  ar: {
    defaultBadge: "افتراضي",
    optionsLabel: "خيارات",
    editPermissions: "تعديل الأذونات",
    manageMembers: "إدارة أعضاء الفريق",
    rename: "إعادة تسمية",
    duplicate: "تكرار",
    setDefault: "تعيين كافتراضي",
    delete: "حذف",
    moveUp: "تحريك لأعلى",
    moveDown: "تحريك لأسفل",
    options: (name: string) => `خيارات ${name}`,
  },
}

type PermissionRoleRowProps = {
  role: Role
  isDefault?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  locale?: "en" | "ar"
  onEdit: () => void
  onManageMembers: () => void
  onRename?: () => void
  onDuplicate?: () => void
  onSetDefault?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function PermissionRoleRow({
  role,
  isDefault,
  canMoveUp,
  canMoveDown,
  locale = "en",
  onEdit,
  onManageMembers,
  onRename,
  onDuplicate,
  onSetDefault,
  onDelete,
  onMoveUp,
  onMoveDown,
}: PermissionRoleRowProps) {
  const t = COPY[locale]
  const isSystem = role.isSystemRole
  const showMoveGroup = (onMoveUp || onMoveDown) && !isSystem

  return (
    <article
      data-slot="permission-role-row"
      data-system={isSystem || undefined}
      className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-base font-semibold leading-6 text-foreground">
            {role.name}
          </h3>
          {isDefault ? (
            <span
              data-slot="default-pill"
              className="inline-flex items-center gap-1 rounded-md bg-cami-yellow-3 px-1.5 py-0.5 text-xs font-medium text-cami-yellow-11"
            >
              <CheckCircle2Icon className="size-3" strokeWidth={2.5} />
              {t.defaultBadge}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{role.description}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            aria-label={t.options(role.name)}
            className="shrink-0"
          >
            {t.optionsLabel}
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={onEdit}>
            <PencilIcon />
            {t.editPermissions}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onManageMembers}>
            <UsersIcon />
            {t.manageMembers}
            <Badge variant="secondary" className="ms-auto font-normal">
              WIP
            </Badge>
          </DropdownMenuItem>
          {!isSystem && onRename ? (
            <DropdownMenuItem onSelect={onRename}>
              <PencilLineIcon />
              {t.rename}
            </DropdownMenuItem>
          ) : null}
          {onDuplicate ? (
            <DropdownMenuItem onSelect={onDuplicate}>
              <CopyIcon />
              {t.duplicate}
            </DropdownMenuItem>
          ) : null}
          {!isDefault && onSetDefault ? (
            <DropdownMenuItem onSelect={onSetDefault}>
              <CheckCircle2Icon />
              {t.setDefault}
            </DropdownMenuItem>
          ) : null}
          {!isSystem && onDelete ? (
            <DropdownMenuItem onSelect={onDelete} variant="destructive">
              <TrashIcon />
              {t.delete}
              <Badge variant="secondary" className="ms-auto font-normal">
                WIP
              </Badge>
            </DropdownMenuItem>
          ) : null}
          {showMoveGroup ? (
            <>
              <DropdownMenuSeparator />
              {onMoveUp ? (
                <DropdownMenuItem onSelect={onMoveUp} disabled={!canMoveUp}>
                  <ArrowUpIcon />
                  {t.moveUp}
                </DropdownMenuItem>
              ) : null}
              {onMoveDown ? (
                <DropdownMenuItem onSelect={onMoveDown} disabled={!canMoveDown}>
                  <ArrowDownIcon />
                  {t.moveDown}
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  )
}
