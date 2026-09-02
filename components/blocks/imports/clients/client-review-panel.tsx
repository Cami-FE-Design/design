"use client"

// The client and pet review screen (DSG-84).
//
// Same skeleton as the product review, and now the same parts: `CountLedger`,
// `IssueSummary`, `LookupsPanel`, `SegmentedToggle` and every string from
// `copy.ts`. This screen used to restate that copy inline and hand-roll its own
// lookups card, which is how one wizard ended up saying "We'll also add 13 new
// brands and 14 new categories" on one step and "We'll also add 27 things to
// your account" on another — and how it lost the status filter the product
// screen has.
//
// What is genuinely specific here: a client's counts (seven) and a pet's
// (eleven), a row that can carry a pet as well as its owner, and name matching,
// which products have no equivalent of.

import { XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { CountLedger, type LedgerEntry } from "@/components/blocks/imports/redesign/count-ledger"
import { IssueSummary } from "@/components/blocks/imports/redesign/issue-summary"
import { LookupsPanel } from "@/components/blocks/imports/redesign/lookups-panel"
import { Button } from "@/components/ui/button"
import { SegmentedToggle, type SegmentedToggleOption } from "@/components/ui/segmented-toggle"
import type {
  ClientImportPreview,
  ClientImportRow,
  PetImportPreview,
  PetImportRow,
} from "@/lib/imports/client-pet-types"
import {
  CLIENT_PET_STATUS_COPY,
  CLIENT_PET_STATUSES,
  OUTCOME_LABELS,
  REVIEW_COPY,
} from "@/lib/imports/copy"
import { groupIssues, type IssueGroup } from "@/lib/imports/issues"
import { clientPetLookupGroups } from "@/lib/imports/lookups"
import type { ConfirmOverrides } from "@/lib/imports/types"
import { CLIENT_GRID, ClientReviewRow, PET_GRID } from "./client-review-row"

type Props = {
  preview: ClientImportPreview | PetImportPreview
  entity: "clients" | "pets"
  onConfirm: (overrides: ConfirmOverrides) => void
  onCancel: () => void
}

const isPet = (p: ClientImportPreview | PetImportPreview): p is PetImportPreview =>
  "petsToCreate" in p

/** The same filter the product screen has, including the view it opens on. */
type Filter =
  | { kind: "all" }
  | { kind: "attention" }
  | { kind: "status"; status: string }
  | { kind: "issue"; code: string; label: string; rowNumbers: number[] }

/** Seven counts for a client import, eleven for a pet one — one ledger either way. */
function ledgerEntries(preview: ClientImportPreview | PetImportPreview): LedgerEntry[] {
  const owner = isPet(preview) ? "owners " : ""
  const shared: LedgerEntry[] = [
    { value: preview.clientsToCreate, label: `${owner}${OUTCOME_LABELS.added}` },
    { value: preview.clientsToUpdate, label: `${owner}${OUTCOME_LABELS.updated}` },
    {
      value: preview.clientsToReview,
      label: OUTCOME_LABELS.pickPerson,
      tone: "text-cami-yellow-11",
    },
    { value: preview.clientsNoChange, label: `${owner}${OUTCOME_LABELS.upToDate}` },
    { value: preview.skippedByMode, label: OUTCOME_LABELS.leftOut },
    { value: preview.rejectedCount, label: OUTCOME_LABELS.cantImport, tone: "text-destructive" },
  ]

  if (!isPet(preview)) return shared

  // A pet import writes two subjects, so the pet counts are named and the owner
  // counts keep the shared labels below them.
  return [
    { value: preview.petsToCreate, label: "pets will be added" },
    { value: preview.petsToUpdate, label: "pets will be updated" },
    { value: preview.standalonePets, label: "pets with no owner we could find" },
    ...shared,
  ]
}

/** Rows that cannot be written, or that are waiting on the operator. */
const needsAttention = (status: string) => status === "reject" || status === "review"

export function ClientReviewPanel({ preview, entity, onConfirm, onCancel }: Props) {
  const rows = preview.rows as (ClientImportRow | PetImportRow)[]
  const [overrides, setOverrides] = useState<ConfirmOverrides>({})
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const attentionCount = rows.filter((r) => needsAttention(r.status)).length
  const [filter, setFilter] = useState<Filter>(
    attentionCount > 0 ? { kind: "attention" } : { kind: "all" },
  )

  const issues = useMemo(() => groupIssues(rows), [rows])
  const lookupGroups = clientPetLookupGroups(preview)

  // A name match the operator has resolved no longer needs them, and a rescued
  // duplicate will be written after all — so both move the totals.
  const resolvedMatches = Object.values(overrides).filter((o) => o.nameMatch).length
  const rescued = Object.values(overrides).filter((o) => o.importWithoutDuplicate).length
  const willImport = preview.clientsToCreate + preview.clientsToUpdate + resolvedMatches + rescued
  const willSkip = preview.rejectedCount - rescued

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1
    return counts
  }, [rows])

  const presentStatuses = CLIENT_PET_STATUSES.filter((s) => (statusCounts[s] ?? 0) > 0)
  const filterOptions = [
    ...(attentionCount > 0
      ? [{ value: "attention", label: REVIEW_COPY.needsYou(attentionCount) }]
      : []),
    { value: "all", label: `Everything (${rows.length})` },
    ...presentStatuses.map((s) => ({
      value: s as string,
      label: `${CLIENT_PET_STATUS_COPY[s].filter} (${statusCounts[s]})`,
    })),
  ] as [
    SegmentedToggleOption<string>,
    SegmentedToggleOption<string>,
    ...SegmentedToggleOption<string>[],
  ]

  const visible =
    filter.kind === "issue"
      ? rows.filter((r) => filter.rowNumbers.includes(r.rowNumber))
      : filter.kind === "status"
        ? rows.filter((r) => r.status === filter.status)
        : filter.kind === "attention"
          ? rows.filter((r) => needsAttention(r.status))
          : rows

  const grid = entity === "pets" ? PET_GRID : CLIENT_GRID
  const plural = entity === "pets" ? "pets" : "clients"
  const singular = entity === "pets" ? "pet" : "client"

  const everythingBlocked = rows.length > 0 && willImport === 0 && willSkip === rows.length
  const nothingToImport = willImport === 0 && !everythingBlocked

  const toggleExpand = (rowNumber: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })

  const showCause = (group: IssueGroup) =>
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

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {everythingBlocked
              ? REVIEW_COPY.allBlockedTitle
              : nothingToImport
                ? REVIEW_COPY.upToDateTitle
                : REVIEW_COPY.headline(willImport, preview.rowCount, plural)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {everythingBlocked
              ? REVIEW_COPY.allBlockedBody
              : nothingToImport
                ? REVIEW_COPY.upToDateBody(preview.rowCount)
                : REVIEW_COPY.reassurance}
          </p>
        </div>

        <CountLedger entries={ledgerEntries(preview)} />

        <IssueSummary
          groups={issues.blocking}
          severity="blocking"
          title={REVIEW_COPY.blockingTitle(preview.rejectedCount)}
          blockedRowCount={preview.rejectedCount}
          activeCode={filter.kind === "issue" ? filter.code : null}
          onShowRows={showCause}
          onDownloadFailed={() => {
            /* Design repo: the real flow downloads the failed rows as a sheet. */
          }}
        />

        <IssueSummary
          groups={issues.advisory}
          severity="advisory"
          title={REVIEW_COPY.advisoryTitle}
          activeCode={filter.kind === "issue" ? filter.code : null}
          onShowRows={showCause}
        />

        <div className="flex flex-col gap-3">
          <div className="flex min-h-9 flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {visible.length === rows.length
                ? REVIEW_COPY.showingAll(rows.length)
                : filter.kind === "attention"
                  ? REVIEW_COPY.showingAttention(visible.length, rows.length)
                  : REVIEW_COPY.showingFiltered(visible.length, rows.length)}
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
            {(presentStatuses.length > 1 ||
              (attentionCount > 0 && attentionCount < rows.length)) && (
              <SegmentedToggle
                ariaLabel="Filter rows"
                className="ms-auto"
                options={filterOptions}
                value={
                  filter.kind === "status"
                    ? filter.status
                    : filter.kind === "attention"
                      ? "attention"
                      : "all"
                }
                onValueChange={(v) =>
                  setFilter(
                    v === "all"
                      ? { kind: "all" }
                      : v === "attention"
                        ? { kind: "attention" }
                        : { kind: "status", status: v },
                  )
                }
              />
            )}
          </div>

          <div className="border-y border-border/60 [&>div:last-child]:border-b-0">
            <div
              className="sticky top-0 z-10 grid gap-3 border-b border-border/60 bg-sand-3 px-3 py-2.5 text-xs font-medium text-muted-foreground"
              style={{ gridTemplateColumns: grid }}
            >
              <span>{REVIEW_COPY.tableHeaders.row}</span>
              <span>{REVIEW_COPY.tableHeaders.status}</span>
              <span>Client</span>
              {entity === "pets" && <span>Pet</span>}
              <span>{REVIEW_COPY.tableHeaders.outcome}</span>
              <span />
            </div>
            {visible.length === 0 && (
              <p className="px-3 py-6 text-sm text-muted-foreground">{REVIEW_COPY.emptyFilter}</p>
            )}
            {visible.map((row) => (
              <ClientReviewRow
                key={row.rowNumber}
                row={row}
                entity={entity}
                expanded={expanded.has(row.rowNumber)}
                onToggleExpand={() => toggleExpand(row.rowNumber)}
                override={overrides[row.rowNumber] ?? {}}
                onOverrideChange={(next) =>
                  setOverrides((prev) => ({ ...prev, [row.rowNumber]: next }))
                }
              />
            ))}
          </div>
        </div>

        <LookupsPanel groups={lookupGroups} />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        {willImport > 0 ? (
          <>
            <Button variant="ghost" radius="full" onClick={onCancel}>
              {REVIEW_COPY.cancel}
            </Button>
            <div className="flex items-center gap-3">
              {willSkip > 0 && (
                <span className="text-sm text-muted-foreground">
                  {REVIEW_COPY.leftOutNote(willSkip)}
                </span>
              )}
              <Button radius="full" size="lg" onClick={() => onConfirm(overrides)}>
                {REVIEW_COPY.confirm(willImport, singular, plural)}
              </Button>
            </div>
          </>
        ) : (
          // Nothing will be written, so there is no commit action to offer —
          // one way out instead of a disabled primary button.
          <Button radius="full" size="lg" variant="outline" className="ms-auto" onClick={onCancel}>
            Back to my {plural}
          </Button>
        )}
      </div>
    </div>
  )
}
