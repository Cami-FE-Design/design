"use client"

import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"
import type * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// The frame for the two long reference pages, /screens and /playground: a
// sticky sidebar that lists every lane and section, keeps the one in view
// highlighted, and a search box that narrows the page as you type.
//
// The sidebar is read from the page itself rather than from a list kept
// beside it. Mark the content up and it appears:
//
//   data-nav-lane="id" data-nav-label="Label"     a lane (a group of sections)
//   data-nav-section data-nav-title="Title" id=…  a section, inside a lane
//   data-search="text to match"                   something search can hide
//
// A section with its own data-search is matched as a whole (playground). A
// section without one is matched on its title, or narrowed to the
// data-search rows inside it (screens).

type NavSection = { id: string; title: string; hidden: boolean }
type NavLane = { id: string; label: string; sections: NavSection[] }

function terms(q: string) {
  return q.toLowerCase().split(/\s+/).filter(Boolean)
}

function matches(text: string, words: string[]) {
  const t = text.toLowerCase()
  return words.every((w) => t.includes(w))
}

/**
 * A section title as the sidebar shows it: the ticket references in brackets
 * ("(PRO-96)", "(DSG-80 / DSG-84)") are dropped, since they are noise in a
 * one-line list. The full title stays on hover and on the section itself.
 */
function navLabel(title: string) {
  return title.replace(/\s*\([^)]*\b[A-Z]{2,}[0-9]*-[A-Za-z0-9]+[^)]*\)\s*$/, "") || title
}

function show(el: HTMLElement, visible: boolean) {
  // Inline style rather than `hidden`: a display class on the element (flex,
  // grid) would beat the attribute.
  el.style.display = visible ? "" : "none"
}

export function DirectoryLayout({
  searchPlaceholder,
  children,
}: {
  searchPlaceholder: string
  children: React.ReactNode
}) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState("")
  const [lanes, setLanes] = useState<NavLane[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [openLanes, setOpenLanes] = useState<Set<string>>(() => new Set())
  const [resultCount, setResultCount] = useState<number | null>(null)

  // Apply the query to the content, then read back what is left for the nav.
  const sync = useCallback(() => {
    const root = contentRef.current
    if (!root) return
    const words = terms(query)
    const next: NavLane[] = []
    let visibleSections = 0

    for (const laneEl of root.querySelectorAll<HTMLElement>("[data-nav-lane]")) {
      const lane: NavLane = {
        id: laneEl.id || `lane-${laneEl.dataset.navLane}`,
        label: laneEl.dataset.navLabel ?? laneEl.dataset.navLane ?? "",
        sections: [],
      }
      for (const sec of laneEl.querySelectorAll<HTMLElement>("[data-nav-section]")) {
        const title = sec.dataset.navTitle ?? ""
        let visible = true
        if (words.length > 0) {
          if (sec.hasAttribute("data-search")) {
            visible = matches(`${title} ${sec.dataset.search}`, words)
          } else if (matches(title, words)) {
            for (const row of sec.querySelectorAll<HTMLElement>("[data-search]")) show(row, true)
          } else {
            let any = false
            for (const row of sec.querySelectorAll<HTMLElement>("[data-search]")) {
              const hit = matches(row.dataset.search ?? "", words)
              show(row, hit)
              any ||= hit
            }
            visible = any
          }
        } else {
          for (const row of sec.querySelectorAll<HTMLElement>("[data-search]")) show(row, true)
        }
        show(sec, visible)
        if (visible) visibleSections++
        lane.sections.push({ id: sec.id, title, hidden: !visible })
      }
      const laneVisible = lane.sections.some((s) => !s.hidden)
      show(laneEl, laneVisible)
      next.push(lane)
    }
    setLanes(next)
    setResultCount(words.length > 0 ? visibleSections : null)
  }, [query])

  useEffect(() => {
    sync()
  }, [sync])

  // Sections can mount late (lazy demos, client data); rebuild when they do.
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    let frame = 0
    const observer = new MutationObserver((records) => {
      const structural = records.some((r) =>
        [...r.addedNodes, ...r.removedNodes].some(
          (n) =>
            n instanceof HTMLElement &&
            (n.matches("[data-nav-section],[data-nav-lane]") ||
              n.querySelector("[data-nav-section],[data-nav-lane]")),
        ),
      )
      if (!structural) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [sync])

  // The section in view: the last one whose top has passed the top of the window.
  useEffect(() => {
    let frame = 0
    const update = () => {
      const root = contentRef.current
      if (!root) return
      let current: string | null = null
      for (const sec of root.querySelectorAll<HTMLElement>("[data-nav-section]")) {
        if (sec.style.display === "none") continue
        if (sec.getBoundingClientRect().top <= 120) current = sec.id
        else break
      }
      setActiveId(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Keep the highlighted entry visible in a long sidebar.
  useEffect(() => {
    if (!activeId) return
    document
      .querySelector(`[data-nav-link="${CSS.escape(activeId)}"]`)
      ?.scrollIntoView?.({ block: "nearest" })
  }, [activeId])

  // "/" jumps to search from anywhere on the page; Escape clears it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (e.key === "/" && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const search = (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("")
            e.currentTarget.blur()
          }
        }}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="h-10 w-full rounded-full border border-border/60 bg-background pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("")
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border/60 px-1.5 text-[11px] text-muted-foreground">
          /
        </kbd>
      )}
    </div>
  )

  const visibleLanes = lanes.filter((lane) => lane.sections.some((s) => !s.hidden))
  const activeLane = lanes.find((lane) => lane.sections.some((s) => s.id === activeId))?.id

  return (
    <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      {/* Wide screens: search and the index stay beside the content. */}
      <aside className="hidden border-border/40 border-r lg:block">
        <div className="sticky top-0 flex max-h-dvh flex-col gap-4 py-6 pr-5">
          {search}
          <nav
            aria-label="Sections"
            className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-6 [scrollbar-width:thin]"
          >
            {visibleLanes.map((lane) => {
              const sections = lane.sections.filter((s) => !s.hidden)
              // One lane open at a time keeps the list short: the one you are
              // reading, any you opened, or every lane a search reached.
              const open = Boolean(query) || lane.id === activeLane || openLanes.has(lane.id)
              return (
                <div key={lane.id} className="border-border/40 border-b py-1 last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenLanes((prev) => {
                        const next = new Set(prev)
                        if (next.has(lane.id)) next.delete(lane.id)
                        else next.add(lane.id)
                        return next
                      })
                    }
                    className="flex w-full items-center gap-2 rounded-md py-2 text-left text-sm font-medium text-foreground hover:text-foreground/80"
                  >
                    <ChevronRightIcon
                      className={cn(
                        "size-3.5 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-90",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{lane.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {sections.length}
                    </span>
                  </button>
                  {open ? (
                    <ul className="mb-2 ml-1.75 flex flex-col border-border/60 border-l">
                      {sections.map((s) => {
                        const active = activeId === s.id
                        return (
                          <li key={s.id}>
                            <a
                              href={`#${s.id}`}
                              data-nav-link={s.id}
                              title={s.title}
                              aria-current={active ? "location" : undefined}
                              className={cn(
                                "-ml-px block truncate border-l py-1 pl-3 text-[13px] leading-5 transition-colors",
                                active
                                  ? "border-foreground font-medium text-foreground"
                                  : "border-transparent text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {navLabel(s.title)}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Narrow screens: search and a jump menu pinned above the content. */}
        <div className="sticky top-0 z-20 -mx-6 mb-6 flex flex-col gap-2 border-b border-border/40 bg-background/95 px-6 py-3 backdrop-blur lg:hidden">
          {search}
          <select
            aria-label="Jump to section"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                document.getElementById(e.target.value)?.scrollIntoView()
                history.replaceState(null, "", `#${e.target.value}`)
              }
            }}
            className="h-9 w-full rounded-full border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">Jump to section…</option>
            {visibleLanes.map((lane) => (
              <optgroup key={lane.id} label={lane.label}>
                {lane.sections
                  .filter((s) => !s.hidden)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {resultCount !== null ? (
          <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
            {resultCount === 0
              ? `Nothing matches “${query}”.`
              : `${resultCount} ${resultCount === 1 ? "section matches" : "sections match"} “${query}”.`}
          </p>
        ) : null}

        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  )
}
