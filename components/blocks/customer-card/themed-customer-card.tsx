"use client"

// The card, wearing whatever theme the merchant actually saved.
//
// The route is a server component, so it cannot read a choice that lives in the
// browser. Without this the loop was broken in the most embarrassing way: a
// merchant picks Cool sage in Branding, saves, opens their card — and it is
// still gold. A Save that changes nothing you can go and look at is worse than
// no Save at all.
//
// Order of precedence, and each step earns its place:
//   1. `?theme=` — the prototype's own preview switcher, so a reviewer can walk
//      all five without touching anybody's saved setting.
//   2. what the merchant saved.
//   3. the venue's seeded default, for a venue nobody has set up.

import { CustomerCard } from "@/components/blocks/customer-card/customer-card"
import type { CustomerCardData } from "@/lib/customer-card/mock"
import { useResolvedCardTheme } from "@/lib/customer-card/store"
import type { PublicBusiness } from "@/lib/public-business"

export function ThemedCustomerCard({
  business,
  card,
  themeOverride,
}: {
  business: PublicBusiness
  card: CustomerCardData
  /** From `?theme=`. Wins, so previewing never disturbs the saved choice. */
  themeOverride?: string
}) {
  const theme = useResolvedCardTheme(business.slug, themeOverride)
  return <CustomerCard business={business} card={card} theme={theme} />
}
