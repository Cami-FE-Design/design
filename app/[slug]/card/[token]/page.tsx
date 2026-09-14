import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  CustomerCardLinkExpired,
  CustomerCardLogin,
} from "@/components/blocks/customer-card/customer-card-login"
import { resolveCardToken } from "@/lib/customer-card/mock"
import { getCustomerCardTheme } from "@/lib/customer-card/theme"
import { getPublicBusiness } from "@/lib/public-business"

type Params = Promise<{ slug: string; token: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const business = getPublicBusiness(slug)
  return {
    title: business ? `${business.displayName} — open your card` : "Open your card",
    robots: { index: false, follow: false },
  }
}

/**
 * Where the link in a booking confirmation, a reminder, or a membership nudge
 * lands. The token is what the message carries ({{cardLink}} in
 * lib/comms/tokens.ts); it resolves to a customer, and continuing opens that
 * venue's card.
 */
export default async function CustomerCardLoginPage({ params }: { params: Params }) {
  const { slug, token } = await params
  const business = getPublicBusiness(slug)
  const identity = business ? resolveCardToken(slug, token) : undefined

  if (!business?.isLive || !identity) {
    notFound()
  }

  const theme = getCustomerCardTheme(slug)

  return (
    <main className="flex flex-1 flex-col">
      {identity.status === "expired" ? (
        <CustomerCardLinkExpired business={business} theme={theme} />
      ) : (
        <CustomerCardLogin business={business} theme={theme} email={identity.email} />
      )}
    </main>
  )
}
