"use client"

// The five-step product import wizard, replicated from cami-business
// `ImportWizard` for DSG-80 phase 1. See docs/specs/DSG-80-product-import.md.
//
// Production drives the steps off a polled job (`?jobId=&phase=`); this repo has
// no backend, so the two machine phases run on a simulated progress tick and the
// preview comes from lib/product-import/mock.ts. Everything the operator sees is
// production copy, including the wording the ticket exists to replace.
//
// The scenario to replicate is chosen in the shell's compare bar and arrives as
// a prop, so switching between this flow and the redesign keeps the same case on
// screen.

import { ArrowLeftIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { PRODUCT_IMPORT_CONFIG } from "@/lib/product-import/config"
import { applySummaryFor, getScenario, type ImportScenarioId } from "@/lib/product-import/mock"
import type { ConfirmOverrides } from "@/lib/product-import/types"
import { cn } from "@/lib/utils"
import { DoneStep } from "./done-step"
import { PreviewStep } from "./preview-step"
import { ProgressStep } from "./progress-step"
import { UploadStep } from "./upload-step"

const STEP_LABELS = ["Upload", "Analyze", "Review", "Import", "Done"] as const

type Step = 1 | 2 | 3 | 4 | 5

/** Five dots for three operator steps — spec defect D17. */
function Stepper({ current }: { current: Step }) {
  return (
    <ol className="mx-auto flex w-full max-w-2xl items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <CheckIcon className="size-3.5" /> : step}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:inline",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

type WizardProps = {
  scenarioId: ImportScenarioId
  /** Land straight on the review step, skipping the file picker. */
  startAtReview?: boolean
}

export function ProductImportWizard({ scenarioId, startAtReview }: WizardProps) {
  const config = PRODUCT_IMPORT_CONFIG

  const [step, setStep] = useState<Step>(1)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)

  const scenario = getScenario(scenarioId)
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
    setProgress(null)
    setUploadError(null)
    setJobError(null)
  }, [clearTimers])

  // The compare bar owns the scenario and the skip-the-upload choice; either
  // changing puts the flow back to a clean start for the new case.
  useEffect(() => {
    clearTimers()
    setProgress(null)
    setUploadError(null)
    setJobError(null)
    setStep(startAtReview && getScenario(scenarioId).preview ? 3 : 1)
  }, [clearTimers, scenarioId, startAtReview])

  /** Run a machine phase: tick to 100 over ~1.5s, then hand off. */
  const runJob = useCallback(
    (onDone: () => void) => {
      clearTimers()
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = (prev ?? 0) + 12
          if (next >= 100) {
            clearInterval(interval)
            // Let the bar reach 100 before the step changes.
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
    setStep(2)
    runJob(() => {
      if (scenario.jobError) {
        setJobError(scenario.jobError)
        return
      }
      setStep(3)
    })
  }, [runJob, scenario])

  const handleConfirm = useCallback(
    (_overrides: ConfirmOverrides) => {
      setStep(4)
      runJob(() => setStep(5))
    },
    [runJob],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link
          href={config.routes.list}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to {config.plural}
        </Link>
        <h1 className="text-2xl font-medium leading-8">Import {config.plural}</h1>
        <Stepper current={step} />
      </div>

      <section className="mx-auto w-full max-w-5xl flex-1">
        {step === 1 && <UploadStep serverError={uploadError} onSubmit={handleUpload} />}

        {step === 2 && (
          <ProgressStep
            status={jobError ? "FAILED" : "PROCESSING"}
            progress={progress}
            title="Analyzing your file…"
            description="We're checking every row. This usually takes a few moments."
            error={jobError}
            onRetry={reset}
          />
        )}

        {step === 3 && scenario.preview && (
          <PreviewStep preview={scenario.preview} onConfirm={handleConfirm} onCancel={reset} />
        )}

        {step === 4 && (
          <ProgressStep
            status="PROCESSING"
            progress={progress}
            title={`Importing your ${config.plural}…`}
            description="Writing the data and building your outcome report."
            onRetry={reset}
          />
        )}

        {step === 5 && scenario.preview && (
          <DoneStep summary={applySummaryFor(scenario.preview)} onImportAnother={reset} />
        )}
      </section>
    </div>
  )
}
