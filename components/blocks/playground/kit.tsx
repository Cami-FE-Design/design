"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Shared by every lane of /playground: the section and row frames, and the
// fixtures more than one lane renders.

export type SectionProps = {
  title: string
  description?: string
  /**
   * Defer the demo until it is scrolled near. For the sections whose content is
   * expensive — report views, the PDF viewer, the people grid, the invoice and
   * import frames. The heading and anchor always render.
   */
  lazy?: boolean
  children: React.ReactNode
}

// Section titles double as anchors so a review message can deep-link straight
// to one section instead of asking the reader to scroll and hunt for it.
// "Appointments — pickup & pet notes" → #appointments-pickup-pet-notes
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function Lane({
  id,
  label,
  blurb,
  children,
}: {
  id: string
  label: string
  blurb: string
  children: React.ReactNode
}) {
  return (
    <div id={`lane-${id}`} data-nav-lane={id} data-nav-label={label} className="scroll-mt-6">
      <div className="flex flex-col gap-1 border-b-2 border-foreground/15 pt-10 pb-2">
        <h2 className="font-heading text-xl font-semibold text-foreground">{label}</h2>
        <p className="text-xs text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </div>
  )
}

/**
 * Mounts its children only once they are near the viewport.
 *
 * The page rendered every section eagerly — five full report views, the PDF
 * viewer, sixteen invoice previews, two import frames — which is why one URL
 * shipped 2.7 MB of HTML and took over a second to render. The heavy sections
 * keep their heading and anchor (so a deep link still lands and scrolls); only
 * the demo inside waits until it is scrolled to.
 */
export function LazyMount({
  minHeight,
  children,
}: {
  minHeight: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return
    // No IntersectionObserver (older browser, jsdom) → render immediately
    // rather than leaving the section permanently empty.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown(true)
      },
      { rootMargin: "600px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div ref={ref} style={shown ? undefined : { minHeight }}>
      {shown ? children : null}
    </div>
  )
}

export function Section({ title, description, lazy, children }: SectionProps) {
  const slug = sectionSlug(title)
  return (
    <section
      id={slug}
      data-nav-section
      data-nav-title={title}
      data-search={description ?? ""}
      className="scroll-mt-20 border-t border-border py-10 first:border-t-0 first:pt-0"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-base font-medium text-foreground">
          <a href={`#${slug}`} className="hover:underline">
            {title}
          </a>
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {/* On a phone a demo wider than the screen scrolls inside the section
          instead of widening the page. */}
      <div className="min-w-0 max-sm:overflow-x-auto">
        {lazy ? <LazyMount minHeight={420}>{children}</LazyMount> : children}
      </div>
    </section>
  )
}

/**
 * One demo, several states, and chips to switch between them. A section that
 * drew the same full surface once per state ran to fifteen screens of scroll;
 * every state is still one click away, and only the chosen one is mounted.
 */
export function StatePicker({
  label = "State",
  states,
}: {
  label?: string
  states: ReadonlyArray<{ label: string; note?: string; content: React.ReactNode }>
}) {
  const [active, setActive] = useState(states[0]?.label ?? "")
  const current = states.find((s) => s.label === active) ?? states[0]
  if (!current) return null
  return (
    <div className="flex flex-col gap-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {states.map((s) => (
          <button
            key={s.label}
            type="button"
            aria-pressed={s.label === current.label}
            onClick={() => setActive(s.label)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              s.label === current.label
                ? "border-foreground/30 bg-background font-medium text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {current.note ? <p className="text-sm text-muted-foreground">{current.note}</p> : null}
      <div key={current.label} className="min-w-0">
        {current.content}
      </div>
    </div>
  )
}

export function Row({
  label,
  align = "center",
  children,
}: {
  label: string
  /** `start` for tall demo frames, where a centred label floats halfway down. */
  align?: "center" | "start"
  children: React.ReactNode
}) {
  const top = align === "start"
  return (
    <div
      // minmax(0, 1fr): a demo wider than the column (the 11-staff people
      // grid) scrolls inside its own frame instead of widening the page.
      className={cn(
        // The label sits above the demo on a phone, where 140px of it would
        // leave the demo almost nothing.
        "grid grid-cols-1 gap-2 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6",
        top ? "items-start" : "items-center",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wide text-muted-foreground",
          top && "pt-0.5",
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-wrap gap-4 max-sm:overflow-x-auto",
          top ? "items-start" : "items-center gap-3",
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Pickup & pet notes demos ─────────────────────────────────────────────────
