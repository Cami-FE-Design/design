import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BookingFlow } from "@/components/blocks/booking/booking-flow"
import { getPublicBusiness, listPublicBusinessSlugs } from "@/lib/public-business"

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return listPublicBusinessSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const business = getPublicBusiness(slug)
  if (!business?.isLive) {
    return { title: "Page not found", robots: { index: false, follow: false } }
  }
  return {
    title: `Book · ${business.displayName}`,
    description: `Book an appointment at ${business.displayName}.`,
    robots: { index: false, follow: false },
  }
}

export default async function BookingPage({ params }: { params: Params }) {
  const { slug } = await params
  const business = getPublicBusiness(slug)

  if (!business?.isLive) {
    notFound()
  }

  return <BookingFlow business={business} />
}
