"use client"

/**
 * "This client is already booked" — said while the booking is being made
 * (R13, EC-1, CL-A1 / RC-B1).
 *
 * Sits under the client picker, beside the notes banner, and renders nothing
 * until there is something to say. Same placement and the same rule: a fact
 * that changes what gets booked belongs before the booking, not on a record
 * somebody would have to think to go and open.
 *
 * It states and never blocks. Two appointments on one day is routinely correct
 * — a second pet, a partner on the same account — and the receptionist has the
 * client in front of them while the system does not. That is KC1.5's shape,
 * applied to a different fact.
 *
 * Tinted, no accent border: the house idiom for an inline notice.
 */

import { CalendarClockIcon } from "lucide-react"

import type { OpenAppointment } from "@/lib/clients/open-appointments"
import { spansOtherBranches } from "@/lib/clients/open-appointments"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

/** Beyond this the list stops being a glance and becomes a second screen. */
const VISIBLE = 3

export function ClientOpenAppointmentsBanner({
  open,
  bookingAt,
  className,
}: {
  open: ReadonlyArray<OpenAppointment>
  /** The branch this booking will land on, if it has been chosen yet. */
  bookingAt?: string | null
  className?: string
}) {
  const { locationName, isMultiLocation } = useLocations()
  if (open.length === 0) return null

  const elsewhere = spansOtherBranches(open, bookingAt)
  const visible = open.slice(0, VISIBLE)
  const remaining = open.length - visible.length

  return (
    <div
      role="note"
      aria-label="Existing appointments"
      className={cn("flex items-start gap-2.5 rounded-xl bg-cami-yellow-2 p-3", className)}
    >
      <CalendarClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* The sentence changes with the branch, because the two facts are not
            equally useful: a booking on your own calendar you can see, and one
            at another branch is the one you cannot — which is what this is for. */}
        <p className="font-medium text-foreground text-sm leading-5">
          {elsewhere
            ? "Already booked at another location"
            : open.length === 1
              ? "This client already has an appointment"
              : `This client already has ${open.length} appointments`}
        </p>
        <ul className="flex flex-col gap-0.5">
          {visible.map((a) => (
            <li key={a.id} className="text-muted-foreground text-sm leading-5">
              {/* Date, location, service — R13's field set, and identical
                  whether or not the branch is one you hold. */}
              {a.when} · {a.time}
              {isMultiLocation && a.locationId ? ` · ${locationName(a.locationId)}` : ""}
              {a.services ? ` · ${a.services}` : ""}
            </li>
          ))}
        </ul>
        {remaining > 0 ? (
          <p className="text-muted-foreground text-sm leading-5">
            and {remaining} more on their record.
          </p>
        ) : null}
      </div>
    </div>
  )
}
