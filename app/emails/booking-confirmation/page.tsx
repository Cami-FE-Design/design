import type { Metadata } from "next"

import { ConfirmationEmail } from "@/components/blocks/booking/confirmation-email"
import { resolveBooking } from "@/lib/booking"
import { getPublicBusiness } from "@/lib/public-business"

export const metadata: Metadata = {
  title: "Email · Booking confirmation",
  robots: { index: false, follow: false },
}

// Preview surface for the booking confirmation email (E3-5). Renders the
// template on an email-client-style backdrop for visual sign-off. `?pickup=1`
// switches to the collection variant — pet notes row, and the salon address
// replaced by the pickup address.
export default async function BookingConfirmationEmailPreview({
  searchParams,
}: {
  searchParams: Promise<{ pickup?: string }>
}) {
  const { pickup } = await searchParams
  const business = getPublicBusiness("shampooch-jvc")!
  const booking = resolveBooking(business, pickup ? "CAMI-4821-pickup" : "CAMI-4821")

  return (
    <main className="flex min-h-dvh justify-center bg-sand-2 px-5 py-12">
      <ConfirmationEmail business={business} booking={booking} />
    </main>
  )
}
