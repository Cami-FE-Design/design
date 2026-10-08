"use client"

import { ChevronLeftIcon, ChevronRightIcon, FileWarningIcon, Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

import { cn } from "@/lib/utils"

// Wire the pdf.js worker. It's served from /public rather than bundled: pdfjs-dist
// is a transitive dep of react-pdf (not hoisted), so Turbopack can't resolve the
// bare `pdfjs-dist/build/...` specifier via `new URL(..., import.meta.url)`. The
// worker is a plain static asset at a same-origin URL instead — no bundler
// resolution, no CSP/cross-origin issues.
//
// NOTE: public/pdf.worker.min.mjs must match react-pdf's bundled pdfjs-dist
// version. If you upgrade react-pdf/pdfjs, re-copy it:
//   cp node_modules/.pnpm/pdfjs-dist@*/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
// A version skew surfaces loudly as a pdf.js "worker version mismatch" error.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

/** What react-pdf can be handed: a URL, raw bytes, or a `{ data }` wrapper. */
export type PdfSource = string | Uint8Array | { data: Uint8Array } | { url: string }

type PdfViewerProps = {
  /** URL (object URL or path) or raw bytes of the PDF to render. */
  file: PdfSource
  /** Extra classes for the scroll container. */
  className?: string
  /** Cap the rendered page width so pages don't blow up on very wide panes. */
  maxPageWidth?: number
}

// Zoom is expressed relative to fit-to-width (100% = the page filling the
// available column). Buttons step by 25%, clamped to a sane range.
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.5
const ZOOM_STEP = 0.25

/**
 * In-app PDF renderer built on react-pdf (pdf.js). Renders every page to a
 * canvas sized to the container width, inside our own scroll area — no browser
 * chrome or native viewer toolbar — so it matches the rest of the UI and themes
 * cleanly. A floating toolbar carries zoom and page navigation. Shows loading
 * and error states in the app's own styling.
 */
export function PdfViewer({ file, className, maxPageWidth = 900 }: PdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Array<HTMLDivElement | null>>([])
  const [containerWidth, setContainerWidth] = useState(0)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1)

  // Track the available width so pages render crisp at the container size.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(Math.floor(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Horizontal padding (px-4 = 16px each side) is subtracted so a fit-to-width
  // page (scale 1) sits inside without a horizontal scrollbar; zooming past 100%
  // is what triggers horizontal scroll.
  const fitWidth = containerWidth > 0 ? Math.min(containerWidth - 32, maxPageWidth) : undefined
  const pageWidth = fitWidth ? Math.round(fitWidth * scale) : undefined

  // react-pdf accepts a URL string, Blob/ArrayBuffer, or a `{ data }`/`{ url }`
  // Source — but not a bare Uint8Array, so wrap raw bytes. Memoized so react-pdf
  // doesn't re-open the document on every render.
  const normalizedFile = useMemo(() => (file instanceof Uint8Array ? { data: file } : file), [file])

  // Silence pdf.js's console noise about missing standard fonts on some PDFs;
  // memoized so react-pdf doesn't treat it as a new document each render.
  const options = useMemo(() => ({ verbosity: 0 }), [])

  // Track the page most in view so the counter reflects where the reader is.
  useEffect(() => {
    const root = scrollRef.current
    if (!root || numPages === 0) return
    const ratios = new Map<number, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.page)
          ratios.set(n, e.intersectionRatio)
        }
        let best = 1
        let bestRatio = -1
        for (const [n, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r
            best = n
          }
        }
        setCurrentPage(best)
      },
      { root, threshold: [0.1, 0.25, 0.5, 0.75, 1] },
    )
    for (const el of pageRefs.current) {
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [numPages])

  const goToPage = useCallback((n: number) => {
    const el = pageRefs.current[n - 1]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const zoomOut = () => setScale((s) => Math.max(ZOOM_MIN, Math.round((s - ZOOM_STEP) * 100) / 100))
  const zoomIn = () => setScale((s) => Math.min(ZOOM_MAX, Math.round((s + ZOOM_STEP) * 100) / 100))

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative flex max-h-[70vh] flex-col items-center gap-4 overflow-auto rounded-2xl border border-border/60 bg-muted/30 px-4 py-4",
        className,
      )}
    >
      {/* Document renders its loading / error / noData node until the file
          loads; Pages only mount on success, once numPages is set. */}
      <Document
        file={normalizedFile}
        options={options}
        onLoadSuccess={({ numPages }) => {
          pageRefs.current = new Array(numPages).fill(null)
          setNumPages(numPages)
          setCurrentPage(1)
        }}
        loading={
          <PdfState
            icon={<Loader2Icon className="size-5 animate-spin" />}
            text="Loading document…"
          />
        }
        error={
          <PdfState
            icon={<FileWarningIcon className="size-5" />}
            text="This document couldn’t be displayed."
          />
        }
        noData={
          <PdfState icon={<FileWarningIcon className="size-5" />} text="No document to display." />
        }
        className="flex flex-col items-center gap-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div
            // Pages are fixed and never reorder, so a page-number key is stable.
            // biome-ignore lint/suspicious/noArrayIndexKey: page order is invariant
            key={`page-${i + 1}`}
            ref={(el) => {
              pageRefs.current[i] = el
            }}
            data-page={i + 1}
          >
            <Page
              pageNumber={i + 1}
              width={pageWidth}
              className="overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
              // Canvas-only: skip the text + annotation overlays. They add a
              // selectable-text layer that react-pdf positions absolutely, and
              // it misaligns here; the visual render is all a viewer needs.
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>

      {/* Floating toolbar — zoom + page navigation. Sticky so it stays pinned to
          the bottom of the scroll area as the document scrolls; mt-auto keeps it
          at the bottom when the document is shorter than the viewport. */}
      {numPages > 0 ? (
        <div className="sticky bottom-2 z-10 mt-auto flex shrink-0 items-center gap-1 rounded-full bg-neutral-900/95 px-1.5 py-1.5 text-sm text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
          <ToolbarButton onClick={zoomOut} disabled={scale <= ZOOM_MIN} label="Zoom out">
            <span className="text-lg leading-none">−</span>
          </ToolbarButton>
          <span className="w-11 text-center tabular-nums">{Math.round(scale * 100)}%</span>
          <ToolbarButton onClick={zoomIn} disabled={scale >= ZOOM_MAX} label="Zoom in">
            <span className="text-lg leading-none">+</span>
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            label="Previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </ToolbarButton>
          <span className="px-1 tabular-nums text-white/90">
            Page <span className="font-semibold text-white">{currentPage}</span> / {numPages}
          </span>
          <ToolbarButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            label="Next page"
          >
            <ChevronRightIcon className="size-4" />
          </ToolbarButton>
        </div>
      ) : null}
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-white/20" />
}

function PdfState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  )
}
