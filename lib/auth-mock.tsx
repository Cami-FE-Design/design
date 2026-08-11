"use client"

import type * as React from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type PermissionKey =
  | "dashboard.view"
  | "merchants.view"
  | "merchants.edit"
  | "merchants.impersonate"
  | "billing.read"
  | "billing.edit"
  // CamiPay settlement config (PRO-737). Split from `billing.edit` on purpose:
  // a rate change moves real money, so it is its own grant, not blanket
  // HQ-staff write. `billing.read` alone gives a read-only view of both.
  | "billing.camipay.rails.edit"
  | "billing.camipay.rates.edit"
  | "support.read"
  | "audit.read"
  | "analytics.read"
  | "hq_users.read"
  | "hq_users.edit"
  | "roles.read"

export type AuthUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export type AuthState = {
  user: AuthUser
  roleCodes: string[]
  permissions: Set<PermissionKey>
  isImpersonating: boolean
  impersonatedBy?: { name: string; email: string }
  locale: "en" | "ar"
}

export type AuthContextValue = AuthState & {
  setPermissions: (next: Set<PermissionKey>) => void
  setImpersonating: (next: boolean) => void
  setLocale: (next: AuthState["locale"]) => void
  has: (permission: PermissionKey) => boolean
}

const ALL_PERMISSIONS: PermissionKey[] = [
  "dashboard.view",
  "merchants.view",
  "merchants.edit",
  "merchants.impersonate",
  "billing.read",
  "billing.edit",
  "billing.camipay.rails.edit",
  "billing.camipay.rates.edit",
  "support.read",
  "audit.read",
  "analytics.read",
  "hq_users.read",
  "hq_users.edit",
  "roles.read",
]

const defaultUser: AuthUser = {
  id: "u_michelle",
  name: "Michelle You",
  email: "michelle@cami.app",
}

export const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: React.ReactNode
  initialPermissions?: PermissionKey[]
  initialRoleCodes?: string[]
  initialUser?: AuthUser
  initialImpersonating?: boolean
  initialLocale?: AuthState["locale"]
}

export function AuthProvider({
  children,
  initialPermissions = ALL_PERMISSIONS,
  initialRoleCodes = ["hq_admin"],
  initialUser = defaultUser,
  initialImpersonating = false,
  initialLocale = "en",
}: AuthProviderProps) {
  const [permissions, setPermissions] = useState<Set<PermissionKey>>(
    () => new Set(initialPermissions),
  )
  const [isImpersonating, setImpersonating] = useState(initialImpersonating)
  const [locale, setLocale] = useState<AuthState["locale"]>(initialLocale)

  const has = useCallback((permission: PermissionKey) => permissions.has(permission), [permissions])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      roleCodes: initialRoleCodes,
      permissions,
      isImpersonating,
      impersonatedBy: isImpersonating
        ? { name: initialUser.name, email: initialUser.email }
        : undefined,
      locale,
      setPermissions,
      setImpersonating,
      setLocale,
      has,
    }),
    [initialUser, initialRoleCodes, permissions, isImpersonating, locale, has],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }
  return ctx
}

type PermissionGateProps = {
  permission?: PermissionKey
  permissions?: PermissionKey[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  permissions,
  fallback = null,
  children,
}: PermissionGateProps) {
  const auth = useAuth()
  const required = permissions ?? (permission ? [permission] : [])
  const allowed = required.every((p) => auth.permissions.has(p))
  return <>{allowed ? children : fallback}</>
}

export const ALL_HQ_PERMISSIONS = ALL_PERMISSIONS
