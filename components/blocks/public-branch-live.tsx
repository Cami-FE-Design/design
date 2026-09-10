"use client"

/**
 * The branch-shaped half of a branch page, resolved against what the operator
 * has actually saved (R06, R15).
 *
 * ## The gap this closes
 *
 * `/{branchSlug}` is a static server component, so it renders the module seed.
 * A branch's hours and its per-service overrides both live in client stores —
 * that is where the settings dialog writes them — which meant an operator could
 * change a price or an opening time, see it in settings, and find the client
 * page still showing the seeded value. The definition was already shared; the
 * round trip was not.
 *
 * ## Why a wrapper rather than a client page
 *
 * The page stays server-rendered and statically generated: metadata, cover,
 * about and address are unchanged, and the first paint is still HTML. Only the
 * three sections whose data an operator can edit re-resolve after hydration.
 *
 * Both stores seed from the same module the server read, so the first client
 * render matches the server's output exactly and the hydrated values arrive on
 * the effect that follows — no mismatch, and no flash for a branch that has
 * never been edited.
 *
 * ## Grid areas, not source order
 *
 * The three sections are returned as siblings in one fragment and land in their
 * own `[grid-area:...]` slots, so the page's layout does not care that they
 * arrive together while `about` and `location` stay on the server.
 *
 * ## What this is not
 *
 * A real client's browser holds none of the operator's storage, so in the
 * product this page reads an API and none of this wrapper survives. It exists
 * so a prototype can demonstrate the round trip — edit in settings, see it on
 * the client page — which is the thing a reviewer needs to check and could not.
 */

import { BookingFlow } from "@/components/blocks/booking/booking-flow"
import { PublicBookingCard } from "@/components/blocks/public-booking-card"
import { PublicBranchPicker } from "@/components/blocks/public-branch-picker"
import { PublicHours } from "@/components/blocks/public-hours"
import { PublicServices } from "@/components/blocks/public-services"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { branchAsBusiness, type PublicBranch, type PublicBusiness } from "@/lib/public-business"
import { bookingCatalogForLocation, publicMenuForLocation } from "@/lib/public-offering"
import {
  LocationOfferingsProvider,
  useLocationOfferings,
} from "@/lib/service-catalog/offerings-store"

/**
 * The chain page's picker, for the same reason: each row states that branch's
 * hours today, and comparing branches on stale hours is the comparison the
 * picker exists to make right.
 */
export function PublicChainPickerLive({
  business,
  branches,
  intent,
}: {
  business: PublicBusiness
  branches: ReadonlyArray<PublicBranch>
  intent?: "view" | "book"
}) {
  return (
    <LocationsProvider>
      <PickerRows business={business} branches={branches} intent={intent} />
    </LocationsProvider>
  )
}

function PickerRows({
  business,
  branches,
  intent,
}: {
  business: PublicBusiness
  branches: ReadonlyArray<PublicBranch>
  intent?: "view" | "book"
}) {
  const { byId } = useLocations()
  return (
    <PublicBranchPicker
      business={business}
      branches={branches}
      intent={intent}
      hoursFor={(branchId) => byId(branchId)?.hours}
    />
  )
}

/**
 * The branch's booking flow, priced against what that branch actually charges
 * (R15).
 *
 * The branch page resolved per branch while the flow read the business default
 * straight off the module, so an operator could set JVC's full groom to 240,
 * see 240 on the branch page, press Book now, and be quoted 260. A page and a
 * flow disagreeing about the same branch is worse than either being wrong on
 * its own — the client has already been told a price by the time they notice.
 */
export function PublicBookingFlowLive({
  business,
  branch,
}: {
  business: PublicBusiness
  branch: PublicBranch
}) {
  return (
    <LocationsProvider>
      <LocationOfferingsProvider>
        <Flow business={business} branch={branch} />
      </LocationOfferingsProvider>
    </LocationsProvider>
  )
}

function Flow({ business, branch }: { business: PublicBusiness; branch: PublicBranch }) {
  const { byId } = useLocations()
  const { offerings } = useLocationOfferings()
  const resolved = branchAsBusiness(business, branch, {
    hours: byId(branch.id)?.hours,
    offerings,
  })
  return (
    <BookingFlow business={resolved} catalog={bookingCatalogForLocation(branch.id, offerings)} />
  )
}

export function PublicBranchLive({
  business,
  branch,
}: {
  business: PublicBusiness
  branch: PublicBranch
}) {
  return (
    <LocationsProvider>
      <LocationOfferingsProvider>
        <Sections business={business} branch={branch} />
      </LocationOfferingsProvider>
    </LocationsProvider>
  )
}

function Sections({ business, branch }: { business: PublicBusiness; branch: PublicBranch }) {
  const { byId } = useLocations()
  const { offerings } = useLocationOfferings()

  // A branch with no location record keeps whatever the seed gave it, rather
  // than losing its hours to an undefined lookup.
  const live = { hours: byId(branch.id)?.hours, offerings }
  const resolved = branchAsBusiness(business, branch, live)

  return (
    <>
      <div className="[grid-area:card] lg:sticky lg:top-12 lg:self-start">
        <PublicBookingCard business={resolved} />
      </div>
      <div className="[grid-area:services]">
        {/* Grouped by category for a branch of the chain, so the price list
            reads the same way the booking flow does. A branch carrying its own
            hand-written list keeps it. */}
        <PublicServices
          business={resolved}
          groups={branch.services ? undefined : publicMenuForLocation(branch.id, offerings)}
        />
      </div>
      <div className="[grid-area:hours]">
        <PublicHours business={resolved} />
      </div>
    </>
  )
}
