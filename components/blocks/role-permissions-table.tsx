"use client"

import { ChevronDownIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROLES, type Role, type RolePermission } from "@/lib/roles-mock"
import { cn } from "@/lib/utils"

type RolePermissionsTableProps = {
  roles?: Role[]
}

type GroupedPermissions = Record<string, RolePermission[]>

function groupByModule(permissions: RolePermission[]): GroupedPermissions {
  return permissions.reduce<GroupedPermissions>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = []
    acc[perm.module].push(perm)
    return acc
  }, {})
}

type PermissionPillsProps = {
  permissions: RolePermission[]
  pinnedCode?: string
  onPillClick: (code: string) => void
}

function PermissionPills({ permissions, pinnedCode, onPillClick }: PermissionPillsProps) {
  const grouped = useMemo(() => groupByModule(permissions), [permissions])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  function toggleModule(module: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(module)) next.delete(module)
      else next.add(module)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(grouped).map(([module, perms]) => {
        const expanded = expandedModules.has(module)
        return (
          <div key={module} className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleModule(module)}
              aria-expanded={expanded}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/70",
              )}
            >
              {module}
              <span className="text-muted-foreground">{perms.length}</span>
              <ChevronDownIcon
                className={cn(
                  "size-3 text-muted-foreground transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
            {expanded
              ? perms.map((perm) => (
                  <button
                    key={perm.code}
                    type="button"
                    onClick={() => onPillClick(perm.code)}
                    title={perm.description}
                    className={cn(
                      "inline-flex h-6 items-center rounded-md border border-border/60 bg-background px-2 font-mono text-xs font-medium text-foreground transition-colors hover:bg-muted",
                      pinnedCode === perm.code && "border-foreground bg-foreground text-background",
                    )}
                  >
                    {perm.code}
                  </button>
                ))
              : null}
          </div>
        )
      })}
    </div>
  )
}

export function RolePermissionsTable({ roles = ROLES }: RolePermissionsTableProps) {
  const [query, setQuery] = useState("")
  const [pinnedCode, setPinnedCode] = useState<string | undefined>()

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase()
    return roles.filter((role) => {
      if (pinnedCode && !role.permissions.some((p) => p.code === pinnedCode)) return false
      if (!q) return true
      if (role.roleCode.toLowerCase().includes(q)) return true
      if (role.name.toLowerCase().includes(q)) return true
      if (role.description.toLowerCase().includes(q)) return true
      return role.permissions.some(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.module.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    })
  }, [roles, query, pinnedCode])

  const isEmpty = filteredRoles.length === 0
  const pinnedPermission = pinnedCode
    ? roles.flatMap((r) => r.permissions).find((p) => p.code === pinnedCode)
    : undefined

  function clearFilters() {
    setQuery("")
    setPinnedCode(undefined)
  }

  return (
    <div data-slot="role-permissions-table" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder="Search roles or permissions"
          aria-label="Search roles or permissions"
          defaultValue={query}
          onValueChange={setQuery}
          className="w-72"
        />
        {pinnedPermission ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Filtering by:
            <Badge variant="default" className="gap-1 font-mono" data-icon="inline-end">
              {pinnedPermission.code}
              <button
                type="button"
                onClick={() => setPinnedCode(undefined)}
                aria-label="Clear permission filter"
                className="-mr-0.5 rounded-sm p-0.5 hover:bg-foreground/10"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          </div>
        ) : null}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background py-16 text-center">
          <p className="text-sm font-medium text-foreground">No roles match your search</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Role</TableHead>
              <TableHead className="w-[280px]">Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => (
              <TableRow key={role.roleCode} className="align-top">
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-5 text-foreground">
                      {role.name}
                    </span>
                    <span className="font-mono text-xs leading-4 text-muted-foreground">
                      {role.roleCode}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm leading-5 text-muted-foreground">
                  {role.description}
                </TableCell>
                <TableCell className="py-4">
                  <PermissionPills
                    permissions={role.permissions}
                    pinnedCode={pinnedCode}
                    onPillClick={(code) => setPinnedCode(code === pinnedCode ? undefined : code)}
                  />
                </TableCell>
                <TableCell className="py-4">
                  {role.isSystemRole ? (
                    <Badge variant="secondary">System</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
