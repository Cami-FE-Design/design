"use client"

// Demo-only business identity. Lets a presenter rebrand the whole prototype to a
// prospect's salon name on the fly (e.g. "Shampooch JVC" → "Glow Beauty Lounge").
// Every client surface that shows the business/location name reads from here, so
// one edit propagates app-wide. Persisted to localStorage so it survives navigation
// and reload mid-demo. Pure presentation — no backend, no auth.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { findPublicBusinessByName, listPublicBusinesses } from "@/lib/public-business"

const STORAGE_KEY = "cami-demo-business-name"
const DEFAULT_NAME = "Shampooch JVC"

type DemoBusinessValue = {
  /** Primary business / location name shown across the app. */
  name: string
  setName: (name: string) => void
  /** Back to the default ("Shampooch JVC"). */
  reset: () => void
}

const DemoBusinessContext = createContext<DemoBusinessValue | null>(null)

export function DemoBusinessProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [name, setNameState] = useState(DEFAULT_NAME)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) setNameState(saved)
  }, [])

  const value = useMemo<DemoBusinessValue>(
    () => ({
      name,
      setName: (next) => {
        const trimmed = next.trim() || DEFAULT_NAME
        setNameState(trimmed)
        window.localStorage.setItem(STORAGE_KEY, trimmed)
      },
      reset: () => {
        setNameState(DEFAULT_NAME)
        window.localStorage.removeItem(STORAGE_KEY)
      },
    }),
    [name],
  )

  return <DemoBusinessContext.Provider value={value}>{children}</DemoBusinessContext.Provider>
}

/**
 * Read the demo business name. Returns the default outside a provider so any
 * surface rendered in isolation (tests, playground) still works.
 */
export function useDemoBusiness(): DemoBusinessValue {
  const ctx = useContext(DemoBusinessContext)
  if (ctx) return ctx
  return { name: DEFAULT_NAME, setName: () => {}, reset: () => {} }
}

/** A row in the workspace switcher. Matches `Workspace` in workspace-switcher. */
export type DemoWorkspace = { id: string; name: string; imageSrc?: string }

/**
 * The workspace switcher's list, and what picking a row does.
 *
 * This is the control that looks like the place to change business, so it has
 * to be the place that does. Before this it listed one venue twice — the demo
 * name and the same name with a second location appended — while the real
 * venues sat behind a separate demo-only icon in the same topbar. Two controls
 * for one job, and the one that looked official was the one that could not do
 * it: switching to Sota in the icon left this trigger reading Shampooch.
 *
 * So: every live venue is a row, picking one signs the demo into it, and the
 * signed-in venue is the only one that shows its second branch — the others'
 * branches are not the user's to stand in.
 *
 * The freehand rename is still a real case (a pitch to a prospect), and a name
 * that matches no venue gets a row of its own rather than disappearing.
 *
 * Selection is derived from the business name, not stored beside it. A stored
 * id drifts the moment the name changes some other way, which is exactly how
 * the trigger and the card ended up naming different venues.
 */
export function useDemoWorkspaces(override?: DemoWorkspace[]): {
  workspaces: DemoWorkspace[]
  selectedId: string
  selected: DemoWorkspace
  select: (id: string) => void
} {
  const { name, setName } = useDemoBusiness()
  const [branchPick, setBranchPick] = useState<string | null>(null)

  const venue = findPublicBusinessByName(name)
  const baseId = venue?.slug ?? CUSTOM_ID

  const workspaces = useMemo<DemoWorkspace[]>(() => {
    if (override) return override
    const rows: DemoWorkspace[] = []
    if (!venue)
      rows.push({ id: CUSTOM_ID, name }, { id: branchIdOf(CUSTOM_ID), name: `${name} · Jumeirah` })
    for (const b of listPublicBusinesses()) {
      rows.push({ id: b.slug, name: b.businessName, imageSrc: b.logoUrl })
      if (b.slug === venue?.slug && b.secondLocation) {
        rows.push({
          id: branchIdOf(b.slug),
          name: `${b.displayName} · ${b.secondLocation}`,
          imageSrc: b.logoUrl,
        })
      }
    }
    return rows
  }, [override, venue, name])

  // An override list is somebody else's data, so a pick is all there is to go
  // on. The derived-from-name rule only applies to the venues we own.
  const derivedId = override
    ? (branchPick ?? workspaces[0]?.id)
    : branchPick === branchIdOf(baseId)
      ? branchPick
      : baseId
  const selected = workspaces.find((w) => w.id === derivedId) ?? workspaces[0]
  const selectedId = selected?.id ?? derivedId

  const select = useCallback(
    (id: string) => {
      setBranchPick(id)
      if (override) return
      const slug = id.replace(BRANCH_SUFFIX, "")
      const picked = listPublicBusinesses().find((b) => b.slug === slug)
      if (picked) setName(picked.businessName)
    },
    [override, setName],
  )

  return { workspaces, selectedId, selected, select }
}

const CUSTOM_ID = "custom"
const BRANCH_SUFFIX = ":branch"

function branchIdOf(id: string) {
  return `${id}${BRANCH_SUFFIX}`
}
