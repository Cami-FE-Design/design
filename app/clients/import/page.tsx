"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { DesignRepoBar } from "@/components/blocks/design-repo-bar"
import { ClientPetFlow } from "@/components/blocks/imports/clients/client-pet-flow"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CLIENT_PET_SCENARIOS,
  type ClientPetScenarioId,
  DEFAULT_CLIENT_PET_SCENARIO,
  getClientPetScenario,
} from "@/lib/imports/client-pet-mock"

/**
 * The client and pet import (DSG-84). One route serves both, because production
 * serves them from one component set too.
 *
 * The case and the step live in the query string so a link can open a specific
 * one. Without that every /screens entry lands on the same default — which is
 * exactly what went wrong on the product import.
 */
type StartAt = "upload" | "review" | "done"

/** Every step reachable from the bar, so none of them needs an import run. */
const STEP_OPTIONS = [
  { value: "upload", label: "Upload" },
  { value: "review", label: "Review" },
  { value: "done", label: "Outcome" },
] as const

function ClientImportIndex() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // `?case=` names a specific case. `?entity=pets` is what the Pets list links
  // to — it asks for the pet import without knowing the design repo's case ids,
  // so it resolves to the first pet case. Without this the Pets entry point
  // opened the client import.
  const caseParam = searchParams.get("case")
  const entityParam = searchParams.get("entity")
  const firstPetCase = CLIENT_PET_SCENARIOS.find((s) => s.entity === "pets")?.id
  const scenarioId: ClientPetScenarioId = CLIENT_PET_SCENARIOS.some((s) => s.id === caseParam)
    ? (caseParam as ClientPetScenarioId)
    : entityParam === "pets" && firstPetCase
      ? firstPetCase
      : DEFAULT_CLIENT_PET_SCENARIO
  const scenario = getClientPetScenario(scenarioId)
  const atParam = searchParams.get("at")
  const startAt = atParam === "review" || atParam === "done" ? atParam : "upload"

  const setStep = (next: StartAt) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "upload") params.delete("at")
    else params.set("at", next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const setCase = (next: ClientPetScenarioId) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === DEFAULT_CLIENT_PET_SCENARIO) params.delete("case")
    else params.set("case", next)
    // An explicit case wins, so the entity hint has done its job.
    params.delete("entity")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 pt-6 pb-6">
        <DesignRepoBar label="pick the case and the step to review" note={scenario.note}>
          <Select value={scenarioId} onValueChange={(v) => setCase(v as ClientPetScenarioId)}>
            <SelectTrigger size="sm" className="w-80">
              <SelectValue>{scenario.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CLIENT_PET_SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SegmentedToggle
            ariaLabel="Which step to open on"
            options={STEP_OPTIONS}
            value={startAt}
            onValueChange={(next) => setStep(next as StartAt)}
          />
        </DesignRepoBar>

        <ClientPetFlow key={`${scenarioId}-${startAt}`} scenario={scenario} startAt={startAt} />
      </div>
    </div>
  )
}

export default function ClientImportPage() {
  return (
    <AppShell header={null} contentClassName="pb-0">
      {/* The case picker reads the query string, so it needs a boundary. */}
      <Suspense fallback={null}>
        <ClientImportIndex />
      </Suspense>
    </AppShell>
  )
}
