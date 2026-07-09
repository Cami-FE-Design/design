"use client"

// Demo-only file stores. There are two distinct libraries here:
//
// 1. The SHARED library (`useDemoFiles`) — the business-level "Form templates"
//    managed in Settings. These are the ONLY documents available to send for
//    signature, so both the Settings panel and the consent-form send picker
//    read this same list. Mirrors `useDemoBusiness`: a context shared across
//    client-side navigation, with a self-contained fallback so a surface
//    rendered in isolation (playground, tests) still works on its own.
//
// 2. A per-profile PERSONAL store (`useLocalFilesStore`) — uploads made on a
//    single client/pet profile. These stay on that profile only: they never
//    reach the shared template library and are never sendable.
//
// Session-scoped only. Session uploads carry object URLs that can't survive a
// full reload, so nothing is persisted — matching the prototype's mock nature.

import { createContext, useContext, useMemo, useState } from "react"

export type UploadedFile = {
  id: string
  name: string
  /** Object URL for a session-picked file — lets the operator open it. Absent for seeded demo rows. */
  url?: string
  /** ISO date the file was added. */
  uploadedAt: string
}

// A couple of sendable templates shown by default so the Settings library (not
// the empty state) is what operators see first. Session uploads are prepended
// above these.
const SEED_FILES: UploadedFile[] = [
  { id: "seed-file-1", name: "Signed_consent_form.pdf", uploadedAt: "2026-07-02" },
  { id: "seed-file-2", name: "Grooming_liability_waiver.pdf", uploadedAt: "2026-06-18" },
]

// A personal document seeded on every profile's Files section so it isn't empty
// in the demo. Kept separate from the shared templates above — these never sync.
const PROFILE_SEED_FILES: UploadedFile[] = [
  { id: "profile-file-1", name: "Vaccination_record.pdf", uploadedAt: "2026-06-28" },
]

type DemoFilesValue = {
  /** The shared library, newest-first. */
  files: UploadedFile[]
  /** Prepend freshly-picked files to the top of the library. */
  addFiles: (files: UploadedFile[]) => void
  /** Rename a file in place, keeping its id and upload date. */
  renameFile: (id: string, name: string) => void
  /** Remove a file and revoke its object URL if it had one. */
  deleteFile: (id: string) => void
}

const DemoFilesContext = createContext<DemoFilesValue | null>(null)

/** The actual store implementation, reused by the provider and the fallback. */
function useFilesStore(seed: UploadedFile[]): DemoFilesValue {
  const [files, setFiles] = useState<UploadedFile[]>(seed)

  return useMemo<DemoFilesValue>(
    () => ({
      files,
      addFiles: (added) => setFiles((prev) => [...added, ...prev]),
      renameFile: (id, name) =>
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f))),
      deleteFile: (id) =>
        setFiles((prev) => {
          const target = prev.find((f) => f.id === id)
          if (target?.url) URL.revokeObjectURL(target.url)
          return prev.filter((f) => f.id !== id)
        }),
    }),
    [files],
  )
}

export function DemoFilesProvider({ children }: { children: React.ReactNode }) {
  const value = useFilesStore(SEED_FILES)
  return <DemoFilesContext.Provider value={value}>{children}</DemoFilesContext.Provider>
}

/**
 * Read the shared template library (the Settings "Form templates"). Inside a
 * provider every caller shares one list; outside one (playground, tests) each
 * caller gets its own working store so the surface still functions in isolation.
 */
export function useDemoFiles(): DemoFilesValue {
  const ctx = useContext(DemoFilesContext)
  // Always called to keep hook order stable; only used when there's no provider.
  const fallback = useFilesStore(SEED_FILES)
  return ctx ?? fallback
}

/**
 * A self-contained files store for a single profile's PERSONAL uploads. It's
 * never wired to the shared provider, so each client/pet dialog gets its own
 * list — uploads here stay on that profile and never reach the template library
 * or the send picker.
 */
export function useLocalFilesStore(): DemoFilesValue {
  return useFilesStore(PROFILE_SEED_FILES)
}
