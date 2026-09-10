"use client"

/**
 * SCR-14 · A branch's WhatsApp number (R21, R22, KC2.1–KC2.4).
 *
 * One row per branch, and the row's whole job is to make the answer to "can a
 * client message this branch?" unambiguous. A branch with no number says so in
 * words rather than showing an empty field, because the consequence — no
 * WhatsApp bookings here, and nothing rerouted elsewhere — is not something an
 * operator should have to infer (KC2.2).
 *
 * Migration is shown as the sequence it actually is, not as a spinner. The step
 * that surprises people is the OTP: the code goes to the number, so somebody
 * has to be standing in that branch. A nine-branch chain is nine of those, and
 * that is the go-live gate rather than a build item — which is why this panel
 * states the step and who has to do it instead of offering a "retry" button
 * that cannot help.
 */

import { CirclePlusIcon, InfoIcon, MessageCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { Button } from "@/components/ui/button"
import { useLocations } from "@/lib/locations/store"
import {
  BRANCH_WHATSAPP,
  type BranchWhatsApp,
  businessCommsTotals,
  WHATSAPP_STATUS_COPY,
} from "@/lib/locations/whatsapp"
import { cn } from "@/lib/utils"

const TONE_CLASS: Record<"neutral" | "pending" | "good", string> = {
  neutral: "bg-muted text-muted-foreground",
  pending: "bg-cami-yellow-3 text-cami-yellow-11",
  good: "bg-cami-green-3 text-cami-green-11",
}

export function WhatsAppNumbersPanel() {
  const { locations } = useLocations()
  const totals = businessCommsTotals(BRANCH_WHATSAPP)

  function bindingFor(locationId: string): BranchWhatsApp {
    return (
      BRANCH_WHATSAPP.find((b) => b.locationId === locationId) ?? {
        locationId,
        status: "unassigned",
        coexistence: false,
        conversations: 0,
        cost: 0,
      }
    )
  }

  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            WhatsApp numbers
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Each location has its own number. A message reaches the branch it was sent to, and never
            another one.
          </p>
        </header>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Numbers are the merchant's, so the panel says so rather than
            offering to buy one. Decided 2026-08-17: branches already have
            numbers, and what is left is a migration per number. */}
        <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            You supply the numbers — a branch's existing number can be migrated so clients keep
            messaging the one they know. Each migration needs an OTP received at that branch, a
            display-name approval, and a two-factor PIN.
          </span>
        </p>

        {locations.map((loc) => {
          const binding = bindingFor(loc.id)
          const copy = WHATSAPP_STATUS_COPY[binding.status]
          return (
            <div
              key={loc.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <MessageCircleIcon className="size-4" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {loc.name}
                      </span>
                      <LocationStatusBadge status={loc.status} />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {binding.number ?? "No number assigned"}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium leading-4",
                    TONE_CLASS[copy.tone],
                  )}
                >
                  {copy.label}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{copy.detail}</p>

              {/* A handoff, not a wizard. Migration is an OTP received at that
                  branch, a display-name approval and a two-factor PIN, per
                  number — the PRD calls it "entirely manual, per number, and
                  unsized", and it gates the go-live date rather than the build.
                  A self-serve flow would promise the owner control they do not
                  have; a request that reaches the people who do the work is the
                  honest affordance, and it stops the panel being a dead end. */}
              {binding.status === "unassigned" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="full"
                  className="gap-1.5 self-start"
                  onClick={() =>
                    toast.success(`Migration requested for ${loc.name}.`, {
                      description:
                        "Customer Success will confirm the steps and when someone needs to be at the branch for the OTP.",
                    })
                  }
                >
                  <CirclePlusIcon className="size-4" />
                  Request a number
                </Button>
              ) : binding.status !== "connected" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="full"
                  className="self-start"
                  onClick={() =>
                    toast.success(`Asked Customer Success to check ${loc.name}.`, {
                      description: "They will chase the outstanding step on this number.",
                    })
                  }
                >
                  Chase this migration
                </Button>
              ) : null}

              {binding.status === "connected" ? (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Display name{" "}
                    <span className="text-foreground">{binding.displayName ?? loc.name}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Conversations <span className="text-foreground">{binding.conversations}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Cost <span className="text-foreground">AED {binding.cost.toFixed(2)}</span>
                  </span>
                </div>
              ) : null}

              {binding.number && !binding.coexistence && binding.status !== "unassigned" ? (
                // Names who acts rather than telling the operator to turn it on:
                // there is no control here, and copy that instructs without one
                // is a dead end.
                <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
                  Coexistence is off for this number, so migrating it will lose this location's chat
                  history. Customer Success turns it on during the migration — ask before the
                  cut-over if you need the history kept.
                </p>
              ) : null}
            </div>
          )
        })}

        {/* Derived, never stored (R22). Whether the merchant is billed for it
            at all is comms pricing, which is open at one location too and is
            deliberately not answered here. */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Business total, this period — the sum of every location
          </span>
          <span className="font-medium text-foreground">
            {totals.conversations} conversations · AED {totals.cost.toFixed(2)}
          </span>
        </div>
      </div>
    </SettingsPanel>
  )
}
