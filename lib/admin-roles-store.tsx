"use client"

import type * as React from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { type HqUser, initialHqUsers } from "@/lib/hq-users-mock"
import { type Role, SEED_ROLES } from "@/lib/roles-mock"

/**
 * Mock store for the editable HQ role catalog (PRO-138).
 *
 * Holds roles + the HQ user → role assignment in React state so the prototype
 * can demonstrate Add/Edit/Delete/Rename/Duplicate/Move ordering plus member
 * moves without a backend. State resets on full page reload, which is the
 * intended demo behaviour.
 */

export type DefaultRoleId = string

type AdminRolesState = {
  roles: Role[]
  members: HqUser[]
  /** Custom-role default — surfaces "Set as default" affordance from the Options menu. */
  defaultRoleId: DefaultRoleId | null
}

export type AdminRolesContextValue = AdminRolesState & {
  getRoleById: (id: string) => Role | undefined
  getMembersByRoleId: (id: string) => HqUser[]
  addRole: (input: { name: string; description: string; permissionCodes: string[] }) => Role
  updateRolePermissions: (id: string, permissionCodes: string[]) => void
  renameRole: (id: string, name: string, description?: string) => void
  duplicateRole: (id: string) => Role | undefined
  deleteRole: (id: string) => { ok: boolean; reason?: "system" | "has_members" }
  setAsDefault: (id: string) => void
  moveRole: (id: string, direction: "up" | "down") => void
  /** Move a member between roles. */
  reassignMember: (memberId: string, toRoleCode: string) => void
}

const AdminRolesContext = createContext<AdminRolesContextValue | null>(null)

function slugify(name: string, existing: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "role"
  let candidate = `hq_${base}`
  let i = 2
  while (existing.has(candidate)) {
    candidate = `hq_${base}_${i++}`
  }
  return candidate
}

function freshId(existing: Set<string>): string {
  let i = 1
  while (existing.has(`role_${Date.now()}_${i}`)) i++
  return `role_${Date.now()}_${i}`
}

export function AdminRolesProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>(() =>
    SEED_ROLES.map((r) => ({ ...r, permissionCodes: [...r.permissionCodes] })),
  )
  const [members, setMembers] = useState<HqUser[]>(() => initialHqUsers.map((u) => ({ ...u })))
  const [defaultRoleId, setDefaultRoleId] = useState<DefaultRoleId | null>("role_hq_support")

  const getRoleById = useCallback((id: string) => roles.find((r) => r.id === id), [roles])

  const getMembersByRoleId = useCallback(
    (id: string) => {
      const role = roles.find((r) => r.id === id)
      if (!role) return []
      return members.filter((m) => m.roleCode === role.roleCode)
    },
    [roles, members],
  )

  const addRole = useCallback<AdminRolesContextValue["addRole"]>(
    ({ name, description, permissionCodes }) => {
      const id = freshId(new Set(roles.map((r) => r.id)))
      const roleCode = slugify(name, new Set(roles.map((r) => r.roleCode)))
      const next: Role = {
        id,
        roleCode,
        name: name.trim(),
        description: description.trim(),
        isSystemRole: false,
        permissionCodes: [...permissionCodes],
      }
      setRoles((prev) => [...prev, next])
      return next
    },
    [roles],
  )

  const updateRolePermissions = useCallback<AdminRolesContextValue["updateRolePermissions"]>(
    (id, permissionCodes) => {
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, permissionCodes: [...permissionCodes] } : r)),
      )
    },
    [],
  )

  const renameRole = useCallback<AdminRolesContextValue["renameRole"]>((id, name, description) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              name: name.trim(),
              description: description !== undefined ? description.trim() : r.description,
            }
          : r,
      ),
    )
  }, [])

  const duplicateRole = useCallback<AdminRolesContextValue["duplicateRole"]>(
    (id) => {
      const source = roles.find((r) => r.id === id)
      if (!source) return undefined
      const newId = freshId(new Set(roles.map((r) => r.id)))
      const newCode = slugify(`${source.name} copy`, new Set(roles.map((r) => r.roleCode)))
      const copy: Role = {
        id: newId,
        roleCode: newCode,
        name: `${source.name} (copy)`,
        description: source.description,
        isSystemRole: false,
        permissionCodes: [...source.permissionCodes],
      }
      setRoles((prev) => {
        const idx = prev.findIndex((r) => r.id === id)
        const next = [...prev]
        next.splice(idx + 1, 0, copy)
        return next
      })
      return copy
    },
    [roles],
  )

  const deleteRole = useCallback<AdminRolesContextValue["deleteRole"]>(
    (id) => {
      const role = roles.find((r) => r.id === id)
      if (!role) return { ok: false }
      if (role.isSystemRole) return { ok: false, reason: "system" }
      const memberCount = members.filter((m) => m.roleCode === role.roleCode).length
      if (memberCount > 0) return { ok: false, reason: "has_members" }
      setRoles((prev) => prev.filter((r) => r.id !== id))
      if (defaultRoleId === id) setDefaultRoleId(null)
      return { ok: true }
    },
    [roles, members, defaultRoleId],
  )

  const setAsDefault = useCallback<AdminRolesContextValue["setAsDefault"]>((id) => {
    setDefaultRoleId(id)
  }, [])

  const moveRole = useCallback<AdminRolesContextValue["moveRole"]>((id, direction) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === id)
      if (idx < 0) return prev
      const swapWith = direction === "up" ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= prev.length) return prev
      // Don't reorder past system roles into the "Other" section.
      if (prev[swapWith].isSystemRole) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }, [])

  const reassignMember = useCallback<AdminRolesContextValue["reassignMember"]>(
    (memberId, toRoleCode) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, roleCode: toRoleCode as HqUser["roleCode"] } : m,
        ),
      )
    },
    [],
  )

  const value = useMemo<AdminRolesContextValue>(
    () => ({
      roles,
      members,
      defaultRoleId,
      getRoleById,
      getMembersByRoleId,
      addRole,
      updateRolePermissions,
      renameRole,
      duplicateRole,
      deleteRole,
      setAsDefault,
      moveRole,
      reassignMember,
    }),
    [
      roles,
      members,
      defaultRoleId,
      getRoleById,
      getMembersByRoleId,
      addRole,
      updateRolePermissions,
      renameRole,
      duplicateRole,
      deleteRole,
      setAsDefault,
      moveRole,
      reassignMember,
    ],
  )

  return <AdminRolesContext.Provider value={value}>{children}</AdminRolesContext.Provider>
}

export function useAdminRoles(): AdminRolesContextValue {
  const ctx = useContext(AdminRolesContext)
  if (!ctx) throw new Error("useAdminRoles must be used inside <AdminRolesProvider>")
  return ctx
}
