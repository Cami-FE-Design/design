"use client"

// The brief's page 6, as four panels you can look at together.
//
// Trigger → message → branded login → their card. Each of those already exists
// on its own: the templates carry the link, /[slug]/card/[token] is the door,
// /[slug]/card is the card. Four screens that each work is not the same as a
// journey that works, and the brief draws it as one strip for that reason — the
// question it answers is whether a customer who has never heard of Cami can get
// from a WhatsApp notification to their loyalty balance without stopping to
// wonder what any of it is.
//
// Two things this view is for, beyond looking nice in a review:
//
//   - Where the branding starts. The message is now the first branded thing,
//     not the page it opens. Held next to each other, the venue's mark appears
//     in panel 2 and carries through 3 and 4 unbroken. When it did not, panel 2
//     was a grey notification from nobody.
//   - Where the trust is asked for. Panel 3 is the only place the customer is
//     told the link is personal, and panel 4 is everything that link exposes.
//     Seeing them adjacent is the honest way to judge whether the
//     token-as-credential trade is worth it.

import { MOCK_CLIENTS } from "@/app/clients/mock"
import { CustomerCard } from "@/components/blocks/customer-card/customer-card"
import { Avatar } from "@/components/ui/avatar"
import { buildCustomerCard } from "@/lib/customer-card/mock"
import { getCustomerCardTheme, themeVars } from "@/lib/customer-card/theme"
import { getPublicBusiness } from "@/lib/public-business"

export function CardJourney({ slug, clientId }: { slug: string; clientId: string }) {
  const business = getPublicBusiness(slug)
  const client = MOCK_CLIENTS.find((c) => c.id === clientId)
  if (!business || !client) return null

  const card = buildCustomerCard(client, slug)
  const theme = getCustomerCardTheme(slug)
  const first = client.name.split(" ")[0]
  const upcoming = card.upcoming

  return (
    <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Step n={1} label="Trigger">
        <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-border/60 bg-card p-4">
          <p className="text-sm text-foreground">
            {upcoming
              ? `${first} books ${upcoming.service} with ${upcoming.staff}.`
              : `${first} books an appointment.`}
          </p>
          <p className="text-xs text-muted-foreground">
            The same thing happens on a reminder, and on a membership nudge. Nothing here is
            specific to a confirmation — that is the point of one link.
          </p>
        </div>
      </Step>

      <Step n={2} label="Message">
        {/* WhatsApp, because that is the channel the brief draws. The bubble
            takes no palette — the venue's whole brand surface here is the
            business profile above it. The email half of the same message is
            themed, and lives in the Communication templates preview. */}
        <div className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              fallback="initials"
              name={business.businessName}
              src={business.logoUrl}
              hashSeed={business.slug}
            />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-semibold">{business.displayName}</span>
              <span className="text-[10px] text-muted-foreground">Business account</span>
            </div>
          </div>
          <div className="w-fit max-w-full rounded-2xl rounded-tl-sm border border-border/60 bg-card px-3 py-2.5 shadow-sm">
            <p className="text-xs leading-5 text-foreground">
              Hi {first}!{" "}
              {upcoming ? `Your ${upcoming.service} is confirmed for ` : "You're booked "}
              {upcoming ? `${upcoming.dateLabel}, ${upcoming.timeLabel}` : "soon"} at{" "}
              {business.displayName}.
              <br />
              <br />👤 Your {business.displayName} card:
              <br />
              <span className="text-cami-violet-11 underline underline-offset-2">
                getcami.io/{business.slug}/card
              </span>
            </p>
          </div>
        </div>
      </Step>

      <Step n={3} label="Branded login">
        <div
          style={themeVars(theme)}
          className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-shell)] p-5 text-center"
        >
          <Avatar
            size="lg"
            fallback="initials"
            name={business.businessName}
            src={business.logoUrl}
            hashSeed={business.slug}
          />
          <span className="font-heading text-base font-semibold tracking-[0.28em] text-[var(--cc-accent)] uppercase">
            {business.displayName}
          </span>
          <span className="w-full truncate rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-xs text-[var(--cc-text)]">
            {client.email ?? "you@example.com"}
          </span>
          <span className="flex h-9 w-full items-center justify-center rounded-full bg-[var(--cc-accent)] text-[11px] font-semibold tracking-[0.12em] text-[var(--cc-accent-fg)] uppercase">
            Continue
          </span>
          <span className="text-[10px] text-[var(--cc-muted)]">
            No password — the link is personal
          </span>
        </div>
      </Step>

      <Step n={4} label="Their card">
        <div className="h-full overflow-hidden rounded-xl border border-border/60">
          <div className="w-[520px] [zoom:0.45]">
            <CustomerCard business={business} card={card} theme={theme} />
          </div>
        </div>
      </Step>
    </div>
  )
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
          {n}
        </span>
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
