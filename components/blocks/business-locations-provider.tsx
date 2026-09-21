"use client"

/**
 * The estate, belonging to the business the demo is signed into.
 *
 * The layout seeded one fixed list, so picking Sota in the workspace switcher
 * left the LocationSwitcher beside it offering Shampooch's nine branches under
 * a Sota heading. The layout's own comment already claimed the opposite —
 * "a branch is scoped by the business, never the other way round" — which makes
 * this a rule the code asserted and did not keep.
 *
 * ## Why a key, and not a prop
 *
 * `initialLocations` is a seed: the provider copies it into state once, so
 * handing it a different array later changes nothing. Remounting on the
 * business's slug is the honest way to say what actually happens — a different
 * business is a different estate, not an edit to this one. It also drops the
 * session's scope, which is right: the branch you were looking at does not
 * exist here.
 *
 * ## A name that matches no venue
 *
 * Renaming the business freehand is a real case — a pitch to a prospect — and
 * the estate has to stay usable through it. That name resolves to no venue, so
 * the branches stay whatever they were: the presenter renamed the business, not
 * moved to another one.
 */

import { useMemo, useRef } from "react"
import { useDemoBusiness } from "@/lib/demo-business"
import { locationsForBusiness } from "@/lib/locations/from-business"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider } from "@/lib/locations/store"
import type { Location } from "@/lib/locations/types"
import { findPublicBusinessByName } from "@/lib/public-business"

export function BusinessLocationsProvider({ children }: { children: React.ReactNode }) {
  const { name } = useDemoBusiness()
  const business = findPublicBusinessByName(name)

  // Held across a freehand rename, so the estate does not vanish the moment
  // somebody types a prospect's name over the business.
  const lastResolved = useRef<{ slug: string; estate: Location[] } | null>(null)
  const resolved = useMemo(() => {
    if (business) {
      const next = { slug: business.slug, estate: locationsForBusiness(business) }
      lastResolved.current = next
      return next
    }
    return lastResolved.current ?? { slug: "shampooch", estate: [...NINE_BRANCH_ESTATE] }
  }, [business])

  return (
    <LocationsProvider key={resolved.slug} initialLocations={resolved.estate}>
      {children}
    </LocationsProvider>
  )
}
