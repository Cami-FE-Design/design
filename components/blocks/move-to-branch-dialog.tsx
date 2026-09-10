"use client"

/**
 * SCR-06 · Move an appointment to another branch (R07, R17, GB1.1–GB1.3).
 *
 * The destination list is bounded by the actor's grants, so a branch they
 * cannot reach is not offered — a picker that lists it and then refuses is a
 * worse experience and a slower way to learn the same thing (GB1.2).
 *
 * Everything the move depends on is checked *before* Move is pressed, and the
 * result is shown next to the destination rather than after a failure. The
 * reason a receptionist can act on — no slot, service not offered there — is
 * the one they see, and each reason names the thing at fault, because "this
 * move isn't allowed" is what sends them to the phone.
 *
 * The money panel is not decoration. R17 says a sale collected at one branch
 * and fulfilled at another records **both**, and neither is rewritten after
 * completion. So the dialog states plainly that the deposit stays credited to
 * the source while the work moves — an operator who assumes the money follows
 * the appointment will reconcile the month wrong.
 */

import { ArrowRightIcon, CheckCircle2Icon, TriangleAlertIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatAed } from "@/lib/format"
import {
  evaluateMove,
  isSplitAttribution,
  MOVE_DENIAL_COPY,
  type MoveAttribution,
  type MoveContext,
} from "@/lib/locations/cross-branch-move"
import { useLocations } from "@/lib/locations/store"
import { acceptsWrites } from "@/lib/locations/types"

export type MoveTarget = {
  appointmentId: string
  clientName: string
  serviceName: string
  serviceId: string
  when: string
  sourceLocationId: string
  /** Fils already collected. Zero is the common, easy case. */
  depositMinor: number
}

export function MoveToBranchDialog({
  open,
  onOpenChange,
  appointment,
  /**
   * Destination checks the dialog cannot compute. Supplied per branch so the
   * demo — and later the real availability query — can say "no slot at
   * Jumeirah" without this component pretending to know.
   */
  destinationChecks,
  onMoved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: MoveTarget | null
  destinationChecks?: Record<
    string,
    Pick<MoveContext, "destinationOffersService" | "destinationHasSlot" | "paymentResolvable">
  >
  onMoved?: (attribution: MoveAttribution) => void
}) {
  const { locations, granted, locationName } = useLocations()
  const [destinationId, setDestinationId] = useState("")

  if (!appointment) return null

  // Only branches the actor holds, and never the one it is already at.
  const options = granted.filter((l) => l.id !== appointment.sourceLocationId)

  const checks = destinationChecks?.[destinationId] ?? {
    destinationOffersService: true,
    destinationHasSlot: true,
    paymentResolvable: true,
  }

  const decision = destinationId
    ? evaluateMove(
        {
          appointmentId: appointment.appointmentId,
          sourceLocationId: appointment.sourceLocationId,
          destinationLocationId: destinationId,
          serviceId: appointment.serviceId,
          depositMinor: appointment.depositMinor,
        },
        {
          grantedLocationIds: granted.map((l) => l.id),
          writableLocationIds: locations.filter((l) => acceptsWrites(l.status)).map((l) => l.id),
          ...checks,
        },
      )
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Move to another location</DialogTitle>
        <DialogDescription>
          {appointment.clientName} · {appointment.serviceName} · {appointment.when}
        </DialogDescription>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3 text-sm">
            <span className="min-w-0 flex-1 truncate text-foreground">
              {locationName(appointment.sourceLocationId)}
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {destinationId ? locationName(destinationId) : "Pick a location"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="move-destination">Move to</Label>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger
                id="move-destination"
                // `h-12` does not apply to a trigger — it sets its height from
                // `data-[size=default]`, which wins. Same idiom as every other
                // Select that sits among Inputs.
                className="data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"
              >
                <SelectValue placeholder="Pick a location" />
              </SelectTrigger>
              <SelectContent>
                {options.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You're only granted this location, so there's nowhere to move it to.
              </p>
            ) : null}
          </div>

          {decision && !decision.allowed ? (
            <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>{MOVE_DENIAL_COPY[decision.reason]}</span>
            </p>
          ) : null}

          {decision?.allowed && appointment.depositMinor > 0 ? (
            <div className="flex flex-col gap-1.5 rounded-xl bg-cami-green-3 p-3 text-sm text-cami-green-11">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2Icon className="size-4 shrink-0" />
                The deposit travels with the appointment
              </span>
              {/* Both branches, named. The operator has to know the money did
                  not move with the work, or the month reconciles wrong. */}
              <span>
                {formatAed(Math.round(appointment.depositMinor / 100))} stays credited to{" "}
                {locationName(decision.attribution.collectionLocationId)}, where it was taken. The
                work — and the remaining balance — moves to{" "}
                {locationName(decision.attribution.fulfillmentLocationId)}. Neither record changes
                afterwards.
              </span>
            </div>
          ) : null}

          {decision?.allowed && appointment.depositMinor === 0 ? (
            <p className="rounded-xl bg-cami-green-3 p-3 text-sm text-cami-green-11">
              Nothing has been collected yet, so there's no payment to attribute — the appointment
              simply moves.
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              radius="full"
              disabled={!decision?.allowed}
              onClick={() => {
                if (!decision?.allowed) return
                onMoved?.(decision.attribution)
                onOpenChange(false)
              }}
            >
              Move appointment
            </Button>
          </div>

          {decision?.allowed && isSplitAttribution(decision.attribution) ? (
            <p className="text-xs text-muted-foreground">
              Both locations will appear on the sale. Staff at{" "}
              {locationName(decision.attribution.fulfillmentLocationId)} still need telling — that
              notify is manual today, at one location too.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
