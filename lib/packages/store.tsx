"use client"

/**
 * The package catalog an operator can actually change.
 *
 * Save on both the create and the edit form closed and changed nothing, which
 * is the same defect the branch settings had: a form that says it saved and
 * does not is worse than one that says it cannot, because the next screen
 * quietly disagrees with it.
 *
 * Shaped after `lib/locations/branch-settings`: seeded, hydrated in an effect
 * so the server and the first client render agree, and written through one
 * function. Edits live in localStorage, which is where this prototype keeps
 * demo state.
 *
 * ## What is stored
 *
 * The whole list, not a diff. A package is a record an operator creates and
 * edits, not an override over a business default — there is no "inheriting"
 * state for it to fall back to, unlike a branch's tax identity. R08 is why it
 * stays that way: the package belongs to the business, and the only branch it
 * resolves to is the one that does the work.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import type { Package } from "@/lib/packages/catalog"
import { PACKAGES } from "@/lib/packages/mock"

const STORAGE_KEY = "cami.packages.v1"

type PackagesValue = {
  packages: Package[]
  byId: (id: string | null | undefined) => Package | undefined
  /** Creates it and returns it, so the caller can route to what it just made. */
  create: (input: Omit<Package, "id" | "createdAt" | "updatedAt">) => Package
  update: (id: string, patch: Partial<Package>) => void
  remove: (id: string) => void
  /** Back to the seeded catalog. Shown once the operator has changed something. */
  reset: () => void
  dirty: boolean
}

const PackagesContext = createContext<PackagesValue | null>(null)

function readStored(): Package[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Package[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `package-${Date.now()}`
  )
}

export function PackagesProvider({
  children,
  persist = true,
}: {
  children: React.ReactNode
  /** False for a showcase, so a demo edit is not written over the real one. */
  persist?: boolean
}) {
  const [packages, setPackages] = useState<Package[]>(PACKAGES)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!persist) return
    const saved = readStored()
    if (saved) {
      setPackages(saved)
      setDirty(true)
    }
  }, [persist])

  const write = useCallback(
    (mutate: (current: Package[]) => Package[]) => {
      setPackages((current) => {
        const next = mutate(current)
        if (persist) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      setDirty(true)
    },
    [persist],
  )

  const value = useMemo<PackagesValue>(
    () => ({
      packages,
      byId: (id) => (id ? packages.find((p) => p.id === id) : undefined),
      create: (input) => {
        const created: Package = {
          ...input,
          id: slug(input.name),
          createdAt: today(),
          updatedAt: today(),
          sales: [],
        }
        write((current) => [...current, created])
        return created
      },
      update: (id, patch) => {
        write((current) =>
          current.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: today() } : p)),
        )
      },
      remove: (id) => write((current) => current.filter((p) => p.id !== id)),
      reset: () => {
        if (persist) window.localStorage.removeItem(STORAGE_KEY)
        setPackages(PACKAGES)
        setDirty(false)
      },
      dirty,
    }),
    [packages, write, persist, dirty],
  )

  return <PackagesContext.Provider value={value}>{children}</PackagesContext.Provider>
}

/**
 * Falls back to the seeded catalog outside a provider, so a component rendered
 * in isolation — a playground row, a test — reads the same packages without
 * every caller having to mount one.
 */
export function usePackages(): PackagesValue {
  const ctx = useContext(PackagesContext)
  if (ctx) return ctx
  return {
    packages: PACKAGES,
    byId: (id) => (id ? PACKAGES.find((p) => p.id === id) : undefined),
    create: (input) => ({ ...input, id: slug(input.name), createdAt: today(), updatedAt: today() }),
    update: () => {},
    remove: () => {},
    reset: () => {},
    dirty: false,
  }
}
