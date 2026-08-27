"use client"

// The redesigned product import flow (DSG-80 phase 2).
//
// Three steps, not five: Upload → Review → Done. The as-built wizard gave the
// two machine phases their own numbered dots, so the operator watched a five-dot
// stepper to do three things (defect D17). Here the file check runs inside step
// 1 and the write runs inside step 2.
//
// State and the simulated job tick match the as-built replication so the two
// flows behave identically for a reviewer switching between them.

import { ArrowLeftIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { PRODUCT_IMPORT_CONFIG } from "@/lib/product-import/config"
import { PROGRESS_COPY } from "@/lib/product-import/copy"
import { applySummaryFor, getScenario, type ImportScenarioId } from "@/lib/product-import/mock"
import { placeholderSkuRows } from "@/lib/product-import/outcome"
import type { ConfirmOverrides } from "@/lib/product-import/types"
import { cn } from "@/lib/utils"
import { DonePanel } from "./done-panel"
import { ProgressPanel } from "./progress-panel"
import { ReviewPanel } from "./review-panel"
import { UploadPanel } from "./upload-panel"

const STEPS = ["Upload", "Review", "Done"] as const
type Step = 1 | 2 | 3

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
                // Filled like a completed step but ringed, so "you are here"
                // reads at a glance without competing with the check marks.
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

type FlowProps = {
  scenarioId: ImportScenarioId
  /** Which step to open on, so a link can point at a later one. */
  startAt?: "upload" | "review" | "done"
}

/** Map the URL's step name onto this flow's three steps. */
const stepFor = (at: FlowProps["startAt"], hasPreview: boolean): Step => {
  if (!hasPreview) return 1
  if (at === "done") return 3
  if (at === "review") return 2
  return 1
}

export function ProductImportFlow({ scenarioId, startAt }: FlowProps) {
  const config = PRODUCT_IMPORT_CONFIG
  const scenario = getScenario(scenarioId)

  const [step, setStep] = useState<Step>(stepFor(startAt, Boolean(scenario.preview)))
  /** Set while a machine phase runs inside the current step. */
  const [busy, setBusy] = useState<"checking" | "importing" | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)

  const intervals = useRef<ReturnType<typeof setInterval>[]>([])
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of intervals.current) clearInterval(t)
    for (const t of timeouts.current) clearTimeout(t)
    intervals.current = []
    timeouts.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const reset = useCallback(() => {
    clearTimers()
    setStep(1)
    setBusy(null)
    setProgress(null)
    setUploadError(null)
    setJobError(null)
  }, [clearTimers])

  // The compare bar owns the scenario and the skip-the-upload choice; either
  // changing puts the flow back to a clean start for the new case.
  useEffect(() => {
    clearTimers()
    setBusy(null)
    setProgress(null)
    setUploadError(null)
    setJobError(null)
    setStep(stepFor(startAt, Boolean(getScenario(scenarioId).preview)))
  }, [clearTimers, scenarioId, startAt])

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

  const handleUpload = useCallback(() => {
    if (scenario.uploadError) {
      setUploadError(scenario.uploadError)
      return
    }
    setUploadError(null)
    setBusy("checking")
    runJob(() => {
      if (scenario.jobError) {
        setJobError(scenario.jobError)
        return
      }
      setBusy(null)
      setProgress(null)
      setStep(2)
    })
  }, [runJob, scenario])

  const handleConfirm = useCallback(
    (_overrides: ConfirmOverrides) => {
      setBusy("importing")
      runJob(() => {
        setBusy(null)
        setProgress(null)
        setStep(3)
      })
    },
    [runJob],
  )

  const preview = scenario.preview

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          {/* A real way out, as the as-built flow had. The breadcrumb this
              replaced read as decoration and gave the operator no obvious exit. */}
          <Link
            href={config.routes.list}
            className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to {config.plural}
          </Link>
          <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground">
            Import {config.plural}
          </h1>
        </div>
        <Stepper current={step} />
      </div>

      {/* Step 1 — upload, with the file check running inside it. */}
      {step === 1 &&
        (busy === "checking" || jobError ? (
          <ProgressPanel
            title={PROGRESS_COPY.checkTitle}
            body={PROGRESS_COPY.checkBody}
            progress={progress}
            error={jobError}
            onRetry={reset}
          />
        ) : (
          <UploadPanel serverError={uploadError} onSubmit={handleUpload} />
        ))}

      {/* Step 2 — review, with the write running inside it. */}
      {step === 2 &&
        preview &&
        (busy === "importing" ? (
          <ProgressPanel
            title={PROGRESS_COPY.importTitle}
            body={PROGRESS_COPY.importBody}
            progress={progress}
            onRetry={reset}
          />
        ) : (
          <ReviewPanel preview={preview} onConfirm={handleConfirm} onCancel={reset} />
        ))}

      {step === 3 && preview && (
        <DonePanel
          summary={applySummaryFor(preview)}
          preview={preview}
          placeholderSkuCount={placeholderSkuRows(preview).length}
          onImportAnother={reset}
        />
      )}
    </div>
  )
}
