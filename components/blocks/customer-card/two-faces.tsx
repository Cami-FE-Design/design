"use client"

// The brief's side-by-side, as a thing you can actually look at.
//
// Page 4 of the Client Card brief puts the operator's overview and the
// customer's card next to each other and says what that is for: "Task 1 and
// Task 2 mockups share the same information — identity, wallet, last/next
// appointment, preferences — but nothing about the layout, type, or colour
// transfers between them. That's the test for whether the underlying data model
// is actually venue-agnostic before Tech commits to a schema."
//
// Two links in an index cannot run that test. The point is the comparison, and
// a comparison needs both halves on one screen — so this renders both, from one
// client row, with nothing between them.
//
// What it is showing, and why it is worth a component rather than a screenshot:
// both sides call the same resolver on the same record. Change Maaz's loyalty
// points and both move. If a field ever appears on one side that the record
// cannot supply, this view is where it shows up as a hole rather than as a
// number somebody typed twice.

import { MOCK_CLIENTS } from "@/app/clients/mock"
import { ClientOverview, resolveProfile } from "@/components/blocks/client-detail-dialog"
import { CustomerCard } from "@/components/blocks/customer-card/customer-card"
import { getClientActivity } from "@/lib/clients/activity"
import { buildCustomerCard } from "@/lib/customer-card/mock"
import { getCustomerCardTheme } from "@/lib/customer-card/theme"
import { getPublicBusiness } from "@/lib/public-business"

export function TwoFaces({ clientId, slug }: { clientId: string; slug: string }) {
  const client = MOCK_CLIENTS.find((c) => c.id === clientId)
  const business = getPublicBusiness(slug)
  if (!client || !business) return null

  const profile = resolveProfile({
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
  })
  const activity = getClientActivity(client.id)
  const upcoming = activity.appointments.filter(
    (a) => a.status === "booked" || a.status === "confirmed" || a.status === "arrived",
  )
  const card = buildCustomerCard(client, slug)
  const theme = getCustomerCardTheme(slug)

  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <Face
        label="Reception"
        note={`${business.displayName} staff, opening ${client.name}'s profile`}
      >
        {/* The dialog's own chrome — header, tabs — is deliberately absent. It
            is not part of what is being compared, and including it would make
            one side look like a screenshot and the other like a screen. */}
        <div className="rounded-2xl border border-border/60 bg-background p-4">
          <ClientOverview
            clientId={client.id}
            profile={profile}
            hasPets={client.pets.length > 0}
            appts={activity.appointments.length}
            salesMinor={profile.salesMinor}
            noShows={activity.appointments.filter((a) => a.status === "no-show").length}
            upcoming={upcoming.length}
            lastVisit={activity.appointments.find((a) => a.status === "completed") ?? null}
            nextAppointment={upcoming[0] ?? null}
          />
        </div>
      </Face>

      <Face label="The client" note={`${client.name}, opening the link in their confirmation`}>
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <CustomerCard business={business} card={card} theme={theme} />
        </div>
      </Face>
    </div>
  )
}

function Face({
  label,
  note,
  children,
}: {
  label: string
  note: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>
      {children}
    </div>
  )
}
