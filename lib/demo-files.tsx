"use client"

// Demo-only shared file library. Every surface that lists uploaded documents —
// the Settings "Files" panel and the Files section inside the client/pet detail
// dialogs — reads and writes the SAME list from here, so a file uploaded in one
// place shows up everywhere. Mirrors `useDemoBusiness`: a context shared across
// client-side navigation, with a self-contained fallback so a surface rendered
// in isolation (playground, tests) still works on its own.
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

// A couple of files shown by default so the list (not the empty state) is what
// operators see first. Session uploads are prepended above these.
const SEED_FILES: UploadedFile[] = [
  { id: "seed-file-1", name: "Signed_consent_form.pdf", uploadedAt: "2026-07-02" },
  { id: "seed-file-2", name: "Grooming_liability_waiver.pdf", uploadedAt: "2026-06-18" },
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
function useFilesStore(): DemoFilesValue {
  const [files, setFiles] = useState<UploadedFile[]>(SEED_FILES)

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
  const value = useFilesStore()
  return <DemoFilesContext.Provider value={value}>{children}</DemoFilesContext.Provider>
}

/**
 * Read the shared file library. Inside a provider every caller shares one list;
 * outside one (playground, tests) each caller gets its own working store so the
 * surface still functions in isolation.
 */
export function useDemoFiles(): DemoFilesValue {
  const ctx = useContext(DemoFilesContext)
  // Always called to keep hook order stable; only used when there's no provider.
  const fallback = useFilesStore()
  return ctx ?? fallback
}
