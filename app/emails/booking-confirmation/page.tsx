import type { Metadata } from "next"

import { ConfirmationEmail } from "@/components/blocks/booking/confirmation-email"
import { resolveBooking } from "@/lib/booking"
import { getPublicBusiness } from "@/lib/public-business"

export const metadata: Metadata = {
  title: "Email · Booking confirmation",
  robots: { index: false, follow: false },
}

// Preview surface for the booking confirmation email (E3-5). Renders the
// template on an email-client-style backdrop for visual sign-off.
export default function BookingConfirmationEmailPreview() {
  const business = getPublicBusiness("shampooch-jvc")!
  const booking = resolveBooking(business, "CAMI-4821")

  return (
    <main className="flex min-h-dvh justify-center bg-sand-2 px-5 py-12">
      <ConfirmationEmail business={business} booking={booking} />
    </main>
  )
}
