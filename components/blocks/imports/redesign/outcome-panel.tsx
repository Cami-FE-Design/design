"use client"

// The outcome step, shared by all three imports (DSG-80 / DSG-84).
//
// Products and clients each had their own version for a while, and they drifted
// immediately: one offered the full report and the other did not, and one put
// its follow-up action inside the tinted block while the other put it outside.
// That is the same failure this work exists to fix, so there is one component
// and the entities pass their own numbers and copy into it.

import { ArrowRightIcon, CheckCircle2Icon, DownloadIcon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DONE_COPY } from "@/lib/imports/copy"
import type { IssueGroup } from "@/lib/imports/issues"
import type { LookupGroup } from "@/lib/imports/lookups"
import { CountLedger, type LedgerEntry } from "./count-ledger"
import { IssueSummary } from "./issue-summary"
import { LookupsPanel } from "./lookups-panel"

/**
 * Something the import left for the operator to come back to — products', a
 * generated SKU to replace. Rendered as a tinted block with its action inside.
 */
export type OutcomeFollowUp = {
  title: string
  body: string
  actionLabel: string
  href: string
}

type Props = {
  /** "83 products added" — the entity states its own result. */
  title: string
  body: string
  entries: LedgerEntry[]
  /** Rows that did not make it, and why. Empty when everything landed. */
  leftBehind: number
  causes: IssueGroup[]
  followUp?: OutcomeFollowUp
  /** Lists this import created in the account. Their own card, not ledger chips. */
  lookups?: LookupGroup[]
  /** Where "Go to my …" points, and what it is called. */
  listHref: string
  listLabel: string
  onImportAnother: () => void
}

export function OutcomePanel({
  title,
  body,
  entries,
  leftBehind,
  causes,
  followUp,
  lookups = [],
  listHref,
  listLabel,
  onImportAnother,
}: Props) {
  return (
    // Not stretched: the outcome is short, and filling the frame left a large
    // gap between the last block and the footer.
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
          <CheckCircle2Icon className="size-5" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </div>

      <CountLedger entries={entries} />

      {followUp && (
        <div className="flex flex-col gap-2 rounded-xl bg-cami-yellow-2 p-4">
          <p className="text-sm font-medium text-foreground">{followUp.title}</p>
          <p className="text-sm text-muted-foreground">{followUp.body}</p>
          <Button variant="outline" size="sm" radius="full" className="w-fit" asChild>
            <Link href={followUp.href}>{followUp.actionLabel}</Link>
          </Button>
        </div>
      )}

      {leftBehind > 0 && (
        <div className="flex flex-col gap-3">
          <IssueSummary
            groups={causes}
            severity="blocking"
            title={`${leftBehind} ${leftBehind === 1 ? "row was" : "rows were"} left behind`}
            showRowAction={false}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" radius="full">
              <DownloadIcon />
              Download the {leftBehind} {leftBehind === 1 ? "row" : "rows"} that failed
            </Button>
            <span className="text-sm text-muted-foreground">
              Fix what's listed above and import just those.
            </span>
          </div>
        </div>
      )}

      {/* After what went wrong, not before it: the lists are neutral
          information, and the same order the review step uses. */}
      <LookupsPanel groups={lookups} title={DONE_COPY.lookupsTitle} />

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
        <Button variant="ghost" radius="full">
          <DownloadIcon />
          Download the full report
        </Button>
        <Button variant="outline" radius="full" onClick={onImportAnother}>
          <RotateCcwIcon />
          Import another file
        </Button>
        <Button radius="full" size="lg" className="ms-auto" asChild>
          <Link href={listHref}>
            {DONE_COPY.goToList(listLabel)}
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </div>
  )
}
