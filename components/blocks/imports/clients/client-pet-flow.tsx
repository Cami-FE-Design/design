"use client"

// The client and pet import, end to end (DSG-84).
//
// Three steps like the product flow, and the same components: the upload panel
// takes an entity config rather than being copied, and the progress panel is
// already entity-agnostic. Only the review step and the outcome are specific.
//
// The route used to open on the review, which meant clicking Import dropped the
// operator straight into a result for a file they had not chosen yet.

import { ArrowLeftIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import type { LedgerEntry } from "@/components/blocks/imports/redesign/count-ledger"
import { OutcomePanel } from "@/components/blocks/imports/redesign/outcome-panel"
import { ProgressPanel } from "@/components/blocks/imports/redesign/progress-panel"
import { type UploadConfig, UploadPanel } from "@/components/blocks/imports/redesign/upload-panel"
import type { ClientPetScenario } from "@/lib/imports/client-pet-mock"
import { DONE_COPY, DONE_LABELS, PROGRESS_COPY } from "@/lib/imports/copy"
import { groupIssues } from "@/lib/imports/issues"
import { clientPetLookupGroups } from "@/lib/imports/lookups"
import { cn } from "@/lib/utils"
import { ClientReviewPanel } from "./client-review-panel"

const STEPS = ["Upload", "Review", "Done"] as const
type Step = 1 | 2 | 3

/**
 * Clients and pets take a 30 MB / 7,000-row file, offer three modes and have no
 * price threshold — the product caps and the stock-sync mode do not apply.
 */
function uploadConfigFor(entity: "clients" | "pets"): UploadConfig {
  return {
    plural: entity,
    maxFileSizeMb: 30,
    maxRows: 7000,
    templatePaths: {
      csv: "/templates/product-template.csv",
      xlsx: "/templates/product-template.xlsx",
    },
    modes: ["UPSERT", "CREATE_ONLY", "UPDATE_ONLY"],
    showPriceThreshold: false,
  }
}

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="flex w-full max-w-md items-center gap-3">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-cami-violet-9 text-white",
                active && "bg-cami-violet-9 text-white ring-3 ring-cami-violet-3",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckIcon className="size-3.5" /> : step}
            </span>
            <span
              className={cn(
                "text-xs",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Turns a client or pet preview into the shared outcome panel's inputs.
 *
 * The ledger has to add up to the file: an earlier version showed only "added"
 * and "left behind", so Aya's 100-row import read 79 + 19 and left two rows
 * unaccounted for. Every status the file produced gets a line, and the lists the
 * import created come from the same builder the product Done step uses.
 */
export function clientPetOutcome(scenario: ClientPetScenario) {
  const p = scenario.preview
  const pets = "petsToCreate" in p ? p : null
  const singular = pets ? "pet" : "client"
  const plural = pets ? "pets" : "clients"

  const entries: LedgerEntry[] = [
    // A pet import writes two subjects and they often land on the same number —
    // one pet per row, one owner per row. Both are named, or the ledger reads as
    // "826 added, 826 owners added" and looks like the same count twice.
    ...(pets
      ? [
          { value: pets.petsToCreate, label: "pets added" },
          { value: pets.petsToUpdate, label: "pets updated" },
          { value: pets.standalonePets, label: "pets with no owner we could find" },
          { value: p.clientsToCreate, label: "owners added" },
          { value: p.clientsToUpdate, label: "owners updated" },
        ]
      : [
          { value: p.clientsToCreate, label: DONE_LABELS.created },
          { value: p.clientsToUpdate, label: DONE_LABELS.updated },
        ]),
    // Name matches are resolved before the import runs, so by this screen they
    // are not still waiting on anyone: a row the operator did not merge simply
    // was not written. "2 left for you to answer" on a finished import read like
    // an outstanding task with nowhere to do it.
    {
      value: p.clientsToReview + p.clientsNoChange + p.skippedByMode,
      label: DONE_LABELS.skipped,
    },
    { value: p.rejectedCount, label: DONE_LABELS.rejected, tone: "text-destructive" },
  ]

  const created = pets ? pets.petsToCreate : p.clientsToCreate
  const updated = pets ? pets.petsToUpdate : p.clientsToUpdate

  return {
    title: DONE_COPY.title(created, updated, singular, plural),
    body:
      p.rejectedCount > 0
        ? DONE_COPY.bodyWithLeftovers
        : DONE_COPY.bodyClean(`Your ${singular} list`),
    entries,
    leftBehind: p.rejectedCount,
    lookups: clientPetLookupGroups(p),
    causes: groupIssues(p.rows).blocking,
    listHref: pets ? "/pets" : "/clients",
    listLabel: plural,
  }
}

type FlowProps = {
  scenario: ClientPetScenario
  /** Which step a link opens on. */
  startAt?: "upload" | "review" | "done"
}

const stepFor = (at: FlowProps["startAt"]): Step => (at === "done" ? 3 : at === "review" ? 2 : 1)

export function ClientPetFlow({ scenario, startAt }: FlowProps) {
  const [step, setStep] = useState<Step>(stepFor(startAt))
  const [busy, setBusy] = useState<"checking" | "importing" | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const intervals = useRef<ReturnType<typeof setInterval>[]>([])
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of intervals.current) clearInterval(t)
    for (const t of timeouts.current) clearTimeout(t)
    intervals.current = []
    timeouts.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /**
   * Always back to Upload — this is "Import another file" and Cancel, not
   * "return to where the link opened". Sending it to `stepFor(startAt)` meant a
   * link carrying `?at=review` bounced the operator back to a review of a file
   * they had just finished with.
   */
  const reset = useCallback(() => {
    clearTimers()
    setStep(1)
    setBusy(null)
    setProgress(null)
  }, [clearTimers])

  // No reset-on-scenario-change effect: the route keys this component on the
  // case and step, so switching either remounts it clean.

  const runJob = useCallback(
    (onDone: () => void) => {
      clearTimers()
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = (prev ?? 0) + 12
          if (next >= 100) {
            clearInterval(interval)
            timeouts.current.push(setTimeout(onDone, 320))
            return 100
          }
          return next
        })
      }, 160)
      intervals.current.push(interval)
    },
    [clearTimers],
  )

  const label = scenario.entity === "pets" ? "pets" : "clients"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href={scenario.entity === "pets" ? "/pets" : "/clients"}
            className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to {label}
          </Link>
          <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground">
            Import {label}
          </h1>
        </div>
        <Stepper current={step} />
      </div>

      {step === 1 &&
        (busy === "checking" ? (
          <ProgressPanel
            title={PROGRESS_COPY.checkTitle}
            body={PROGRESS_COPY.checkBody}
            progress={progress}
            onRetry={reset}
          />
        ) : (
          <UploadPanel
            uploadConfig={uploadConfigFor(scenario.entity)}
            onSubmit={() => {
              setBusy("checking")
              runJob(() => {
                setBusy(null)
                setProgress(null)
                setStep(2)
              })
            }}
          />
        ))}

      {step === 2 &&
        (busy === "importing" ? (
          <ProgressPanel
            title={PROGRESS_COPY.importTitle}
            body={PROGRESS_COPY.importBody}
            progress={progress}
            onRetry={reset}
          />
        ) : (
          <ClientReviewPanel
            preview={scenario.preview}
            entity={scenario.entity}
            onConfirm={() => {
              setBusy("importing")
              runJob(() => {
                setBusy(null)
                setProgress(null)
                setStep(3)
              })
            }}
            onCancel={reset}
          />
        ))}

      {step === 3 && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-5">
          {/* The panel itself does not stretch, so a short outcome has no gap
            above its footer. The scroll lives here instead — without it a long
            outcome ran off the bottom of the frame. */}
          <OutcomePanel {...clientPetOutcome(scenario)} onImportAnother={reset} />
        </div>
      )}
    </div>
  )
}
