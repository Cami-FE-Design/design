"use client"

// Hosts both product-import flows behind one control bar (DSG-80).
//
// The point of keeping the as-built flow around is that "the screens don't look
// like the other modules" and "the rejection reasons aren't readable" are
// comparative claims. A reviewer picks a case — Aya's migration by default — and
// flips between the redesign and what ships today with the same data on screen.
//
// The bar is design-repo-only scaffolding and is marked as such. Neither flow
// knows it exists; both take the scenario as a prop.
//
// The view and the scenario live in the URL, so a link can open a specific one:
// /products/import                              → the redesign, Aya's migration
// /products/import?view=as-built                 → what ships today
// /products/import?scenario=placeholder-skus     → the After-PRD-63 case
//
// The query string is the only source of truth — no mirrored useState. A first
// attempt read window.location once on mount and wrote back with
// history.replaceState (which is what production's wizard does). It failed for
// the /screens links: navigating between two URLs that share a route does not
// remount the client subtree, so the mount-only read never ran again and every
// link landed on the default. useSearchParams reacts to the navigation instead.

import { FlaskConicalIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { unmappedSentences } from "@/lib/product-import/issues"
import {
  DEFAULT_SCENARIO_ID,
  getScenario,
  IMPORT_SCENARIOS,
  type ImportScenarioId,
} from "@/lib/product-import/mock"
import { ProductImportWizard } from "./import-wizard"
import { ProductImportFlow } from "./redesign/import-flow"

type View = "redesign" | "as-built"

const VIEW_OPTIONS = [
  { value: "redesign" as View, label: "Redesign (DSG-80)" },
  { value: "as-built" as View, label: "As it ships today" },
] as const

const isScenarioId = (value: string | null): value is ImportScenarioId =>
  IMPORT_SCENARIOS.some((s) => s.id === value)

export function ProductImportCompareShell() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const view: View = searchParams.get("view") === "as-built" ? "as-built" : "redesign"
  const scenarioParam = searchParams.get("scenario")
  const scenarioId: ImportScenarioId = isScenarioId(scenarioParam)
    ? scenarioParam
    : DEFAULT_SCENARIO_ID
  const startAtReview = searchParams.get("at") === "review"

  /** Write the bar's state back to the URL so it stays shareable. Defaults are
      omitted, which keeps the plain path clean. */
  const go = (next: { view?: View; scenario?: ImportScenarioId; atReview?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString())
    const resolved = {
      view: next.view ?? view,
      scenario: next.scenario ?? scenarioId,
      atReview: next.atReview ?? startAtReview,
    }
    if (resolved.view === "as-built") params.set("view", "as-built")
    else params.delete("view")
    if (resolved.scenario !== DEFAULT_SCENARIO_ID) params.set("scenario", resolved.scenario)
    else params.delete("scenario")
    if (resolved.atReview) params.set("at", "review")
    else params.delete("at")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const scenario = getScenario(scenarioId)
  // Backend sentences the copy shim doesn't own yet (spec Q1) — surfaced rather
  // than hidden, so the gap is visible while reviewing.
  const unmapped = scenario.preview ? unmappedSentences(scenario.preview.rows) : []

  return (
    // The page itself no longer scrolls: each step's panel fills the frame and
    // scrolls inside its own body, so there is exactly one scrollbar on screen
    // and a panel's header and footer stay put. The as-built flow opts out below
    // — it is a replication, and production scrolls the whole page.
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 pt-6 pb-6">
        <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <FlaskConicalIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Design repo only — compare the redesign against what ships today
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedToggle
              ariaLabel="Which version to show"
              options={VIEW_OPTIONS}
              value={view}
              onValueChange={(next) => go({ view: next })}
            />
            <Select
              value={scenarioId}
              onValueChange={(v) => go({ scenario: v as ImportScenarioId })}
            >
              <SelectTrigger size="sm" className="w-67">
                {/* Children, not a bare <SelectValue />: Radix reads the label
                    from the matching item, and the items only mount once the
                    menu opens, so the trigger rendered blank until first use. */}
                <SelectValue>{scenario.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {IMPORT_SCENARIOS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {scenario.preview && (
              <Button
                variant={startAtReview ? "secondary" : "outline"}
                size="sm"
                onClick={() => go({ atReview: !startAtReview })}
              >
                {startAtReview ? "Starting at review" : "Skip the upload step"}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{scenario.note}</p>

          {unmapped.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Not yet rewritten (spec Q1):</span>{" "}
              {unmapped.join(" · ")}
            </p>
          )}
        </div>

        {view === "redesign" ? (
          <ProductImportFlow
            key={`${scenarioId}-${startAtReview}`}
            scenarioId={scenarioId}
            startAtReview={startAtReview}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ProductImportWizard scenarioId={scenarioId} startAtReview={startAtReview} />
          </div>
        )}
      </div>
    </div>
  )
}
