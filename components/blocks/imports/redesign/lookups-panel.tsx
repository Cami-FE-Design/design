"use client"

// What else the import adds to the account — a plain card, not a tint: it is
// neutral information, and a second sage block under the advisories merged with
// them into one slab.
//
// Two earlier attempts were too big. A flat wall of 27 chips gave no way to tell
// a brand from a category; grouping them into labelled rows fixed that but spent
// six lines on five names. Names as inline text keep the grouping and fit in one
// line.
//
// Shared by all three entities: this lived inside the product panel, so the
// client screen grew a different card saying "27 things to your account".

import { useState } from "react"
import { REVIEW_COPY } from "@/lib/imports/copy"
import { describeNewLists, type LookupGroup } from "@/lib/imports/lookups"

const LOOKUP_NAME_CAP = 5

export function LookupsPanel({
  groups,
  title = REVIEW_COPY.lookupsTitle,
}: {
  groups: LookupGroup[]
  /** Defaults to the review step's wording; the outcome passes the past tense. */
  title?: (parts: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  if (groups.length === 0) return null

  const anyCapped = groups.some((g) => g.names.length > LOOKUP_NAME_CAP)

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card px-4 py-3">
      <p className="text-sm font-medium text-foreground">{title(describeNewLists(groups))}</p>
      <p className="text-sm leading-6 text-muted-foreground">
        {groups.map((group, i) => {
          const shown = expanded ? group.names : group.names.slice(0, LOOKUP_NAME_CAP)
          const hidden = group.names.length - shown.length
          return (
            <span key={group.label}>
              {i > 0 && <span className="px-1.5 text-border">&middot;</span>}
              <span className="font-medium text-foreground">{group.label}</span> {shown.join(", ")}
              {hidden > 0 && ` +${hidden}`}
            </span>
          )
        })}
        {anyCapped && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ms-2 cursor-pointer font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {expanded ? "Show fewer" : "Show all"}
          </button>
        )}
      </p>
    </div>
  )
}
