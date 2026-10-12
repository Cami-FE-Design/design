"use client"

import { Loader2Icon } from "lucide-react"
import dynamic from "next/dynamic"

export type { PdfSource } from "./pdf-viewer"

// pdf.js touches browser-only APIs (DOMMatrix, canvas) and pulls in a ~400KB
// dependency, so the viewer is loaded client-only and on demand. Import this
// wrapper — never ./pdf-viewer directly — so SSR is always skipped.
export const PdfViewer = dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex max-h-[70vh] min-h-[40vh] items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      Loading viewer…
    </div>
  ),
})
