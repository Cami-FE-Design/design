import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ThemePreviewStrip } from "@/components/blocks/customer-card/theme-preview-strip"
import { ThemedCustomerCard } from "@/components/blocks/customer-card/themed-customer-card"
import { getCustomerCard } from "@/lib/customer-card/mock"
import { getPublicBusiness } from "@/lib/public-business"

type Params = Promise<{ slug: string }>
type Search = Promise<{ theme?: string | string[] }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const business = getPublicBusiness(slug)
  return {
    title: business ? `Your card at ${business.displayName}` : "Your card",
    // A customer's wallet and preferences. Never indexed, same as /pay/[token].
    robots: { index: false, follow: false },
  }
}

export default async function CustomerCardPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { slug } = await params
  const { theme: themeParam } = await searchParams
  const business = getPublicBusiness(slug)
  const card = business ? getCustomerCard(slug) : undefined

  if (!business?.isLive || !card) {
    notFound()
  }

  // The theme itself is resolved on the client, where the merchant's saved
  // choice lives — the server only passes the `?theme=` override along.
  const themeOverride = Array.isArray(themeParam) ? themeParam[0] : themeParam

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <ThemedCustomerCard business={business} card={card} themeOverride={themeOverride} />
      <ThemePreviewStrip slug={slug} themeOverride={themeOverride} />
    </main>
  )
}
