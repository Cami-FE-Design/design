"use client"

import {
  CheckIcon,
  CreditCardIcon,
  HeadsetIcon,
  LockIcon,
  type LucideIcon,
  ShieldCheckIcon,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-mock"
import { ROLES, type Role } from "@/lib/roles-mock"

type RolePermissionsTableProps = {
  roles?: Role[]
}

const ROLE_ICONS: Record<string, LucideIcon> = {
  hq_admin: ShieldCheckIcon,
  hq_support: HeadsetIcon,
  hq_billing: CreditCardIcon,
}

function roleInitial(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length > 1 && words[0].toUpperCase() === "HQ") {
    return words[1].charAt(0).toUpperCase()
  }
  return words[0]?.charAt(0).toUpperCase() ?? "?"
}

type RoleCardProps = {
  role: Role
  isCurrent: boolean
}

function RoleCard({ role, isCurrent }: RoleCardProps) {
  const Icon = ROLE_ICONS[role.roleCode]

  return (
    <AccordionItem value={role.roleCode}>
      <AccordionTrigger>
        <span className="relative shrink-0 lg:self-center">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground"
          >
            {Icon ? (
              <Icon className="size-4" />
            ) : (
              <span className="text-sm font-semibold">{roleInitial(role.name)}</span>
            )}
          </span>
          {role.isSystemRole ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  role="img"
                  aria-label="System role"
                  className="absolute -right-0.5 -bottom-0.5 flex size-3 items-center justify-center rounded-full bg-foreground text-background"
                >
                  <LockIcon className="size-2" strokeWidth={2.5} />
                </span>
              </TooltipTrigger>
              <TooltipContent>System role</TooltipContent>
            </Tooltip>
          ) : null}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold leading-6 text-foreground">{role.name}</span>
            {isCurrent ? (
              <Badge
                variant="secondary"
                className="border-cami-yellow-5 bg-cami-yellow-3 font-normal text-cami-yellow-11 max-lg:hidden"
              >
                <CheckIcon data-icon="inline-start" strokeWidth={3} />
                You
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-2 text-xs leading-4 text-muted-foreground lg:truncate">
            {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
            <span aria-hidden className="mx-1.5 text-sm leading-none">
              •
            </span>
            {role.description}
          </p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul aria-label={`${role.name} permissions`} className="flex flex-col gap-px lg:pl-12">
          {role.permissions.map((perm) => (
            <li key={perm.code} className="flex gap-2.5 py-1 max-lg:items-start lg:items-center">
              <Checkbox
                checked
                disabled
                aria-label={perm.code}
                className="shrink-0 max-lg:mt-0.5"
                tabIndex={-1}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:flex-row lg:items-center lg:gap-2.5">
                <span className="shrink-0 font-mono text-xs text-foreground">{perm.code}</span>
                <span className="min-w-0 flex-1 text-xs text-muted-foreground lg:truncate">
                  {perm.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  )
}

export function RolePermissionsTable({ roles = ROLES }: RolePermissionsTableProps) {
  const auth = useAuth()
  const currentRoleCode = auth.roleCodes[0]

  return (
    <Accordion data-slot="role-permissions-list" type="multiple" className="flex flex-col gap-2">
      {roles.map((role) => (
        <RoleCard key={role.roleCode} role={role} isCurrent={role.roleCode === currentRoleCode} />
      ))}
    </Accordion>
  )
}
