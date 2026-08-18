import { Avatar } from "@/components/ui/avatar"
import type { BookingDetail } from "@/lib/booking"
import { petNoteLabel } from "@/lib/pet-notes"
import { formatDuration, formatPriceAed, type PublicBusiness } from "@/lib/public-business"

// Booking confirmation email (E3-5). Cami-branded but the PET BUSINESS leads —
// their name and identity sit at the top; Cami is a quiet footer signature.
// Rendered here with the design system for visual sign-off; production swaps to
// inline-styled email HTML, this is the spec of record.

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="py-2.5 align-top text-sm text-muted-foreground">{label}</td>
      <td className="py-2.5 text-right align-top text-sm font-medium text-foreground">{value}</td>
    </tr>
  )
}

export function ConfirmationEmail({
  business,
  booking,
}: {
  business: PublicBusiness
  booking: BookingDetail
}) {
  const fullAddress = [business.street, business.city, business.emirate].filter(Boolean).join(", ")

  return (
    <div className="mx-auto w-full max-w-[600px] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-overlay">
      {/* Brand band — pet business leads */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-8 py-6">
        <Avatar
          size="md"
          shape="square"
          fallback="initials"
          name={business.businessName}
          src={business.logoUrl}
          hashSeed={business.slug}
        />
        <span className="text-base font-semibold text-foreground">{business.displayName}</span>
      </div>

      <div className="flex flex-col gap-6 px-8 py-8">
        {/* Headline */}
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cami-green-3 px-2.5 py-1 text-xs font-medium text-cami-green-11">
            <span className="size-1.5 rounded-full bg-cami-green-9" />
            Confirmed
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            You&apos;re booked, {booking.customerName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {business.displayName} is expecting you. Here are your details.
          </p>
        </div>

        {/* Details */}
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-border/60">
            <Row label="Service" value={booking.serviceName} />
            <Row
              label="When"
              value={
                <span className="tabular-nums">
                  {booking.dayLabel} · {booking.timeLabel}
                </span>
              }
            />
            <Row label="Duration" value={formatDuration(booking.durationMinutes)} />
            <Row label="With" value={booking.staffName} />
            {booking.petName ? <Row label="Pet" value={booking.petName} /> : null}
            {booking.petNotes?.map((note) => (
              <Row key={note.category} label={petNoteLabel(note.category)} value={note.detail} />
            ))}
            {/* On a pickup booking the salon address is not where the parent
                needs to be, so the collection address takes the "Where" row. */}
            {booking.pickupAddress ? (
              <Row label="Pet Address" value={booking.pickupAddress} />
            ) : (
              <Row label="Where" value={fullAddress} />
            )}
            <Row
              label="Total"
              value={<span className="tabular-nums">{formatPriceAed(booking.priceAed)}</span>}
            />
          </tbody>
        </table>

        {/* Primary action */}
        <a
          href={`/${business.slug}/booking/${booking.ref}`}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          Manage your booking
        </a>

        <p className="text-center text-xs text-muted-foreground">
          Need to change something? Reschedule or cancel free up to 24 hours before. Reference{" "}
          <span className="font-medium tabular-nums text-foreground">{booking.ref}</span>.
        </p>
      </div>

      {/* Cami signature footer */}
      <div className="border-t border-border/60 px-8 py-5 text-center">
        <p className="text-xs text-muted-foreground">
          Booked with <span className="font-semibold text-foreground">Cami</span> · the easiest way
          to book {business.displayName}.
        </p>
      </div>
    </div>
  )
}
