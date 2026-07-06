import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ManageBooking } from "@/components/blocks/booking/manage-booking"
import { resolveBooking } from "@/lib/booking"
import { getPublicBusiness } from "@/lib/public-business"

type Params = Promise<{ slug: string; ref: string }>

export const metadata: Metadata = {
  title: "Manage booking",
  robots: { index: false, follow: false },
}

export default async function ManageBookingPage({ params }: { params: Params }) {
  const { slug, ref } = await params
  const business = getPublicBusiness(slug)

  if (!business?.isLive) {
    notFound()
  }

  const booking = resolveBooking(business, ref)

  return <ManageBooking business={business} booking={booking} />
}
