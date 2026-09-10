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
 * The page stays server-rendered and statically generated, and the first paint is
 * still HTML — client components render on the server too. Only the sections
 * whose data an operator can edit re-resolve after hydration: the cover and the
 * address block joined the card, menu and hours once name, street, phone and
 * emirate stopped being a second copy. `about` and the page metadata stay
 * outside, because neither is per-branch and metadata cannot read a store at
 * all.
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

import Link from "next/link"
import { BookingFlow } from "@/components/blocks/booking/booking-flow"

import { PublicBookingCard } from "@/components/blocks/public-booking-card"
import { PublicBranchPicker } from "@/components/blocks/public-branch-picker"
import { PublicCover } from "@/components/blocks/public-cover"
import { PublicHours } from "@/components/blocks/public-hours"
import { PublicLocation } from "@/components/blocks/public-location"
import { PublicServices } from "@/components/blocks/public-services"
import type { LocationContact } from "@/lib/locations/mock"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import type { Location } from "@/lib/locations/types"
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
/**
 * The client-facing view of a live Location. `locationContact` in
 * lib/locations/mock does the same mapping against the seed; this does it
 * against the store, so an address the operator just saved is the one rendered.
 * The two must agree, which is why the field choices are documented there.
 */
function contactOf(location: Location | undefined): LocationContact | undefined {
  if (!location) return undefined
  return {
    name: location.location.district,
    street: location.location.address,
    city: location.location.city,
    emirate: location.location.state,
    phone: location.phone,
  }
}

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
      contactFor={(branchId) => contactOf(byId(branchId))}
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
  const location = byId(branch.id)
  const resolved = branchAsBusiness(business, branch, {
    hours: location?.hours,
    offerings,
    contact: contactOf(location),
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
  const location = byId(branch.id)
  const live = { hours: location?.hours, offerings, contact: contactOf(location) }
  const resolved = branchAsBusiness(business, branch, live)

  // The chain link, computed here because it names the branch it is not.
  const siblings = business.branches.filter((b) => b.isPublished && b.slug !== branch.slug)

  return (
    <>
      <div className="[grid-area:cover] flex flex-col gap-3">
        <PublicCover business={resolved} />
        {siblings.length > 0 ? (
          <Link
            href={`/${business.slug}`}
            className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {siblings.length === 1
              ? `${business.displayName} has another location`
              : `${business.displayName} has ${siblings.length} other locations`}
          </Link>
        ) : null}
      </div>
      <div className="[grid-area:location]">
        <PublicLocation business={resolved} />
      </div>
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
