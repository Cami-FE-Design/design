"use client"

/**
 * What to say about a service the branch in hand does not run (DW3.3).
 *
 * ## Why an operator is told and a client is not
 *
 * The client's own booking page hides a service their branch has turned off —
 * `publicMenuForLocation` drops it, and rightly: there is nothing a client can
 * do with a service they cannot book. Reception is the person who *can* say
 * "not here, but Jumeirah does it", and hiding it from them leaves them to find
 * that out by telephone, in front of the client. Same reading as KC1.5: tell
 * them, do not block them — so the service stays pickable and the sentence
 * rides alongside it.
 *
 * ## Bounded by the grant
 *
 * Only branches the reader holds are named (R18). A receptionist must not learn
 * what a branch they cannot see does or does not run, and "Jumeirah does it"
 * from somebody with no access to Jumeirah is a small leak of exactly the kind
 * BG-06 is pass/fail about.
 *
 * ## One hook, two pickers
 *
 * The appointment sheet and the new-sale cart both ask this question, and both
 * have to answer it the same way — two copies would drift the first time one
 * gained a case.
 */

import { useLocations } from "@/lib/locations/store"
import { isOfferedAt, locationsOffering } from "@/lib/service-catalog/offerings"
import { useLocationOfferings } from "@/lib/service-catalog/offerings-store"

export function useBranchOfferingNote(
  locationId: string | null | undefined,
): (serviceId: string) => string | null {
  const { granted, locationName } = useLocations()
  const { offerings } = useLocationOfferings()

  return (serviceId: string): string | null => {
    // Nothing to say before the branch is named, or in a business with one.
    if (!locationId) return null
    if (isOfferedAt(serviceId, locationId, offerings)) return null

    const elsewhere = locationsOffering(
      serviceId,
      granted.map((l) => l.id).filter((id) => id !== locationId),
      offerings,
    ).map(locationName)

    if (elsewhere.length === 0) {
      // No branch to send them to. A different fact from "not here", and the
      // one an operator would otherwise waste a phone call discovering.
      return `Not offered at ${locationName(locationId)}`
    }

    // Two names, then a count. A list of seven branches is not a sentence
    // anybody reads at a counter with a client waiting.
    const named = elsewhere.slice(0, 2).join(", ")
    const rest = elsewhere.length > 2 ? ` and ${elsewhere.length - 2} more` : ""
    return `Not at ${locationName(locationId)} — ${named}${rest}`
  }
}
