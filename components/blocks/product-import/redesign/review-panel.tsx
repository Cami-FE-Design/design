"use client"

// The redesigned review screen (DSG-80 phase 2). Reading order is the fix:
//
//   1. what you're about to get          (outcome strip — hierarchy, D15)
//   2. what's going wrong and why        (grouped blocking causes — D1–D4, D6)
//   3. what to know but not worry about  (grouped advisories — D3)
//   4. what else we'll create for you    (lookups, framed as informational — D9, D11)
//   5. the rows themselves               (only if you want them)
//
// The as-built order was the reverse: counts, then two undifferentiated amber
// panels, then a table that made you click every row to learn one fact.

import { XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { SegmentedToggle, type SegmentedToggleOption } from "@/components/ui/segmented-toggle"
import { PRODUCT_STATUSES } from "@/lib/product-import/config"
import {
  describeLookups,
  LOOKUP_GROUP_LABELS,
  REVIEW_COPY,
  STATUS_COPY,
} from "@/lib/product-import/copy"
import { groupIssues, type IssueGroup, taxAdvisoryGroup } from "@/lib/product-import/issues"
import { reviewCounts } from "@/lib/product-import/outcome"
import type {
  ConfirmOverrides,
  ProductImportPreview,
  ProductRowStatus,
} from "@/lib/product-import/types"
import { IssueSummary } from "./issue-summary"
import { OutcomeStrip } from "./outcome-strip"
import { REVIEW_GRID_TEMPLATE, ReviewRow } from "./review-row"

type Filter =
  | { kind: "all" }
  | { kind: "status"; status: ProductRowStatus }
  | { kind: "issue"; code: string; label: string; rowNumbers: number[] }

type Props = {
  preview: ProductImportPreview
  onConfirm: (overrides: ConfirmOverrides) => void
  onCancel: () => void
}

export function ReviewPanel({ preview, onConfirm, onCancel }: Props) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" })
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [overrides, setOverrides] = useState<ConfirmOverrides>({})

  const counts = reviewCounts(preview, overrides)
  const issues = useMemo(() => groupIssues(preview.rows), [preview.rows])
  const advisoryGroups = useMemo(() => {
    const tax = taxAdvisoryGroup(preview)
    return tax
      ? [...issues.advisory, tax].sort(
          (a, b) =>
            b.definition.weight - a.definition.weight || b.rowNumbers.length - a.rowNumbers.length,
        )
      : issues.advisory
  }, [issues.advisory, preview])

  const statusCounts = useMemo(() => {
    const c = {} as Record<ProductRowStatus, number>
    for (const s of PRODUCT_STATUSES) c[s] = 0
    for (const r of preview.rows) c[r.status] += 1
    return c
  }, [preview.rows])

  const filteredRows = useMemo(() => {
    if (filter.kind === "all") return preview.rows
    if (filter.kind === "status") return preview.rows.filter((r) => r.status === filter.status)
    const wanted = new Set(filter.rowNumbers)
    return preview.rows.filter((r) => wanted.has(r.rowNumber))
  }, [preview.rows, filter])

  const lookupsPhrase = describeLookups(preview.lookupsToCreate)
  const nothingToImport = counts.willImport === 0 && counts.rescuable === 0
  const everythingBlocked = counts.blocked === counts.total && counts.total > 0

  // Statuses with no rows are dropped from the filter — the as-built toggle
  // showed "Skipped (0)" and "Update (0)" on every first-time import.
  const presentStatuses = PRODUCT_STATUSES.filter((s) => statusCounts[s] > 0)
  const filterOptions = [
    { value: "all", label: `Everything (${preview.rows.length})` },
    ...presentStatuses.map((s) => ({
      value: s,
      label: `${STATUS_COPY[s].filter} (${statusCounts[s]})`,
    })),
  ] as [
    SegmentedToggleOption<string>,
    SegmentedToggleOption<string>,
    ...SegmentedToggleOption<string>[],
  ]

  const filterValue = filter.kind === "status" ? filter.status : "all"

  const showIssueRows = (group: IssueGroup) => {
    setFilter((prev) =>
      prev.kind === "issue" && prev.code === group.definition.code
        ? { kind: "all" }
        : {
            kind: "issue",
            code: group.definition.code,
            label: group.definition.title,
            rowNumbers: group.rowNumbers,
          },
    )
  }

  const toggleExpand = (rowNumber: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })

  return (
    // The panel fills the frame and scrolls in its body, so the confirm bar is
    // the panel's real bottom edge and the table's column header sticks to the
    // top of the scroll area rather than to the page.
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
        {/* 1 — the headline. One shape for every outcome: title + one line. */}
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {everythingBlocked
              ? REVIEW_COPY.allBlockedTitle
              : nothingToImport
                ? REVIEW_COPY.upToDateTitle
                : REVIEW_COPY.headline(counts.willImport, counts.total)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {everythingBlocked
              ? REVIEW_COPY.allBlockedBody
              : nothingToImport
                ? REVIEW_COPY.upToDateBody(preview.rows.length)
                : REVIEW_COPY.reassurance}
          </p>
        </div>

        {/* 2 — the ledger. Always here, whatever the file turned out to be. */}
        <OutcomeStrip counts={counts} />

        {/* 2 — what's blocked, grouped by cause */}
        <IssueSummary
          groups={issues.blocking}
          severity="blocking"
          title={REVIEW_COPY.blockingTitle(counts.blocked)}
          blockedRowCount={counts.blocked}
          activeCode={filter.kind === "issue" ? filter.code : null}
          onShowRows={showIssueRows}
          onDownloadFailed={() => {
            /* Design repo: the real flow downloads the failed rows as a sheet. */
          }}
        />

        {/* 3 — advisories, stated once instead of on every row. Unresolved tax
             rates join them rather than getting a third notice block. */}
        <IssueSummary
          groups={advisoryGroups}
          severity="advisory"
          title={REVIEW_COPY.advisoryTitle}
          activeCode={filter.kind === "issue" ? filter.code : null}
          onShowRows={showIssueRows}
        />

        {/* 4 — what else the import creates. A plain card, not a tint: it is
             neutral information, and a second sage block under the advisories
             merged with them into one slab. The names collapse, because 27
             chips is a wall nobody reads. */}
        {lookupsPhrase && <LookupsPanel phrase={lookupsPhrase} lookups={preview.lookupsToCreate} />}

        {/* 5 — the rows */}
        <div className="flex flex-col gap-3">
          {/* Always present, so the table always has the same frame. What sits
            inside it adapts: the status toggle only earns its place when there
            is more than one status to switch between — on a file where every
            row is blocked, "Everything (8)" and "Can't import (8)" are the same
            eight rows. */}
          <div className="flex min-h-9 flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredRows.length === preview.rows.length
                ? REVIEW_COPY.showingAll(preview.rows.length)
                : REVIEW_COPY.showingFiltered(filteredRows.length, preview.rows.length)}
            </span>
            {filter.kind === "issue" && (
              <button
                type="button"
                onClick={() => setFilter({ kind: "all" })}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-cami-yellow-3 px-2.5 py-1 text-xs font-medium text-cami-yellow-11"
              >
                {filter.label}
                <XIcon className="size-3" />
              </button>
            )}
            {presentStatuses.length > 1 && (
              <SegmentedToggle
                ariaLabel="Filter rows"
                className="ms-auto"
                options={filterOptions}
                value={filterValue}
                onValueChange={(v) =>
                  setFilter(
                    v === "all"
                      ? { kind: "all" }
                      : { kind: "status", status: v as ProductRowStatus },
                  )
                }
              />
            )}
          </div>

          {/* A band, not a rounded card, and the panel body is the only scroll
            area. Two scrollbars sat side by side when the table scrolled inside
            the already-scrolling body; and a sticky header inside a rounded,
            fully bordered box left gaps at the corners as the box scrolled past
            it, which read as the header breaking apart. Square edges have
            nothing to gap. */}
          <div className="border-y border-border/60 [&>div:last-child]:border-b-0">
            <div
              className="sticky top-0 z-10 grid gap-3 border-b border-border/60 bg-sand-3 px-3 py-2.5 text-xs font-medium text-muted-foreground"
              style={{ gridTemplateColumns: REVIEW_GRID_TEMPLATE }}
            >
              <span>{REVIEW_COPY.tableHeaders.row}</span>
              <span>{REVIEW_COPY.tableHeaders.status}</span>
              <span>{REVIEW_COPY.tableHeaders.product}</span>
              <span>{REVIEW_COPY.tableHeaders.outcome}</span>
              <span />
            </div>
            {filteredRows.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                {REVIEW_COPY.emptyFilter}
              </p>
            ) : (
              // One page scroll, no nested scroll region (defect D16).
              filteredRows.map((row) => (
                <ReviewRow
                  key={row.rowNumber}
                  row={row}
                  preview={preview}
                  expanded={expanded.has(row.rowNumber)}
                  onToggleExpand={() => toggleExpand(row.rowNumber)}
                  override={overrides[row.rowNumber] ?? {}}
                  onOverrideChange={(next) =>
                    setOverrides((prev) => ({ ...prev, [row.rowNumber]: next }))
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Footer — the button carries the number, so the commitment is explicit. */}
      </div>

      {/* Pinned by the flex column, not sticky. As a sticky overlay it needed a
          z-index to beat SegmentedToggle's `relative z-[1]` segments, which had
          painted straight through it and over the Import button; sitting outside
          the scroll area, there is nothing to overlap in the first place. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        {counts.willImport > 0 ? (
          <>
            <Button variant="ghost" radius="full" onClick={onCancel}>
              {REVIEW_COPY.cancel}
            </Button>
            <div className="flex items-center gap-3">
              {counts.willSkip > 0 && (
                <span className="text-sm text-muted-foreground">
                  {REVIEW_COPY.leftOutNote(counts.willSkip)}
                </span>
              )}
              <Button radius="full" size="lg" onClick={() => onConfirm(overrides)}>
                {REVIEW_COPY.confirm(counts.willImport)}
              </Button>
            </div>
          </>
        ) : (
          // Nothing will be written, so there is no commit action to offer —
          // one way out instead of a disabled primary button.
          <Button radius="full" size="lg" variant="outline" className="ms-auto" onClick={onCancel}>
            Back to my products
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * "We'll also add 2 new brands, 2 new categories and 1 new supplier", with the
 * names on the line below.
 *
 * Two earlier attempts were too big. A flat wall of 27 chips gave no way to tell
 * a brand from a category; grouping them into labelled rows fixed that but spent
 * six lines on five names — title, subtitle and a grid row per kind. The subtitle
 * only restated the title, and md-sized chips are mostly padding. Names as inline
 * text keep the grouping and fit in one line.
 */
const LOOKUP_NAME_CAP = 5

function LookupsPanel({
  phrase,
  lookups,
}: {
  phrase: string
  lookups: ProductImportPreview["lookupsToCreate"]
}) {
  const [expanded, setExpanded] = useState(false)
  const groups = (Object.keys(LOOKUP_GROUP_LABELS) as (keyof typeof LOOKUP_GROUP_LABELS)[])
    .map((key) => ({ key, label: LOOKUP_GROUP_LABELS[key], names: lookups[key] }))
    .filter((g) => g.names.length > 0)

  const anyCapped = groups.some((g) => g.names.length > LOOKUP_NAME_CAP)

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card px-4 py-3">
      <p className="text-sm font-medium text-foreground">{REVIEW_COPY.lookupsTitle(phrase)}</p>
      <p className="text-sm leading-6 text-muted-foreground">
        {groups.map((group, i) => {
          const shown = expanded ? group.names : group.names.slice(0, LOOKUP_NAME_CAP)
          const hidden = group.names.length - shown.length
          return (
            <span key={group.key}>
              {i > 0 && <span className="px-1.5 text-border">·</span>}
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
