import Link from "next/link"

import { Avatar } from "@/components/ui/avatar"

import type { CustomerCardData } from "@/lib/customer-card/mock"
import { type CustomerCardTheme, themeVars } from "@/lib/customer-card/theme"
import type { PublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"

/**
 * The customer's own card — Task 2 of the Client Card brief.
 *
 * Same record as the operator's client profile, ordered for the other reader.
 * A customer opens this to check one of four things before booking again: what
 * they have (wallet), when they're next in, what the salon knows about them,
 * and how to book. Nothing else earns a place, and everything reception-only
 * is excluded at the type level — see the header of lib/customer-card/mock.ts.
 *
 * The wallet is a summary, and stays one. The brief points at Fresha's
 * customer-side Activity tab — separate lists behind Appointments / Gift Cards /
 * Memberships / Products / Packages — and calls it the right interaction model.
 * It isn't being built: those tabs are Fresha's feature surface, not Cami's, and
 * the same call was made on My Profile. A customer checks a balance before
 * rebooking; they do not audit which three of six visits they spent. If that
 * turns out to be wrong, it arrives as its own ticket with a reason, not as
 * five tabs copied off a screenshot.
 *
 * Colour comes entirely from CSS variables set by `themeVars`, so this
 * component is written once and every venue is a different set of values: the
 * component tree is shared, the palette is picked, and typography never varies.
 *
 * The brief's Sota mockup is a letter-spaced *serif* wordmark over an italic
 * pull-quote; this renders it in Cami's Manrope. That difference is the agreed
 * trade (see lib/customer-card/theme.ts), not an approximation to be closed
 * later — so the wordmark is built to carry a venue's identity on letter-spacing
 * and colour alone, because those are the only two levers it gets.
 */
export function CustomerCard({
  business,
  card,
  theme,
}: {
  business: PublicBusiness
  card: CustomerCardData
  theme: CustomerCardTheme
}) {
  return (
    <div
      style={themeVars(theme)}
      className="flex flex-1 flex-col items-center bg-[var(--cc-shell)] px-5 py-10 text-[var(--cc-text)] sm:py-16"
    >
      <div className="w-full max-w-[420px]">
        <article className="flex flex-col gap-7 rounded-3xl bg-[var(--cc-surface)] px-6 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8">
          <Masthead business={business} card={card} />
          {/* Loyalty is the only section here a venue can not have. Wallet and
              Upcoming always render — empty, they say "you have nothing yet",
              and gone, they would say "this venue doesn't show you that". Only
              one of those is true of a customer who simply hasn't bought
              anything, and it is the one a first-time client sees. */}
          {card.loyalty ? <Loyalty loyalty={card.loyalty} /> : null}
          <Wallet card={card} />
          <Upcoming card={card} />
          {card.preferences.length > 0 ? <Preferences card={card} business={business} /> : null}
          <Link
            href={`/${business.slug}/book`}
            className="flex h-12 items-center justify-center rounded-full bg-[var(--cc-accent)] text-sm font-semibold tracking-[0.14em] text-[var(--cc-accent-fg)] uppercase transition-opacity hover:opacity-90"
          >
            Book again
          </Link>
        </article>
        <p className="mt-6 text-center text-xs text-[var(--cc-muted)]">
          {business.displayName} runs on Cami
        </p>
      </div>
    </div>
  )
}

/**
 * The venue's mark, then its name, then the greeting.
 *
 * The logo and the wordmark both render rather than one replacing the other.
 * Most salon marks are a symbol that doesn't say the name, and a customer
 * arriving from a WhatsApp link needs to read which business this is — so the
 * name is never dropped. `<Avatar>` carries the fallback for a venue with no
 * logo on file: initials in the theme's own accent, which is a deliberate
 * brand mark rather than a broken image.
 */
function Masthead({ business, card }: { business: PublicBusiness; card: CustomerCardData }) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <Avatar
        size="xl"
        fallback="initials"
        name={business.businessName}
        src={business.logoUrl}
        hashSeed={business.slug}
        className="border border-[var(--cc-border)]"
      />
      <span className="font-heading text-2xl font-semibold tracking-[0.32em] text-[var(--cc-accent)] uppercase">
        {business.displayName}
      </span>
      {card.tagline ? (
        <p className="text-xs text-[var(--cc-muted)] italic">“{card.tagline}”</p>
      ) : null}
      <p className="text-sm text-[var(--cc-text)]">Welcome back, {card.firstName}</p>
    </header>
  )
}

/**
 * Loyalty leads the card because it is the one number a customer checks without
 * being prompted. "80 pts to your next reward" is doing the real work — a
 * balance with no distance to the reward is a number, not a reason to rebook.
 */
function Loyalty({ loyalty }: { loyalty: NonNullable<CustomerCardData["loyalty"]> }) {
  return (
    <section className="flex flex-col items-center gap-1">
      <span className="font-heading text-5xl leading-none font-semibold text-[var(--cc-accent)]">
        {loyalty.points.toLocaleString()}
      </span>
      <span className="text-[11px] font-medium tracking-[0.18em] text-[var(--cc-muted)] uppercase">
        Loyalty points
      </span>
      <span className="mt-1 text-xs text-[var(--cc-muted)]">
        {loyalty.toNextReward > 0
          ? `${loyalty.toNextReward} pts to your next reward`
          : "A reward is ready to use"}
      </span>
    </section>
  )
}

/**
 * Gift card, package, membership. A fixed 3-up grid would leave a hole for the
 * many venues that run one or two of the three, so the row wraps and each tile
 * takes an equal share of whatever is there.
 *
 * With nothing in it the section stays, as the same outline the upcoming band
 * uses — a customer with an empty wallet is the normal first visit, not a
 * customer whose venue sells nothing.
 */
function Wallet({ card }: { card: CustomerCardData }) {
  if (card.wallet.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--cc-border)] px-4 py-5 text-center">
        <p className="text-sm text-[var(--cc-muted)]">
          No packages or gift cards yet — ask us next time you&apos;re in.
        </p>
      </section>
    )
  }
  return (
    <section className="flex flex-wrap gap-2">
      {card.wallet.map((tile) => (
        <div
          key={tile.id}
          className="flex min-w-[30%] flex-1 flex-col items-center gap-1.5 rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface-muted)] px-3 py-3.5 text-center"
        >
          <span className="text-[10px] font-medium tracking-[0.12em] text-[var(--cc-muted)] uppercase">
            {tile.label}
          </span>
          <span className="text-sm font-semibold">{tile.value}</span>
        </div>
      ))}
    </section>
  )
}

/**
 * The one filled band on the card. With nothing booked it stays — as an outline
 * rather than a fill — because an absent section reads as "this salon doesn't
 * show you that", where an empty one reads as "you have nothing booked".
 */
function Upcoming({ card }: { card: CustomerCardData }) {
  if (!card.upcoming) {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--cc-border)] px-4 py-5 text-center">
        <p className="text-sm text-[var(--cc-muted)]">Nothing booked yet.</p>
      </section>
    )
  }
  const { service, staff, dateLabel, timeLabel } = card.upcoming
  return (
    <section className="flex flex-col gap-1.5 rounded-2xl bg-[var(--cc-band)] px-4 py-4 text-[var(--cc-band-fg)]">
      <span className="text-[10px] font-medium tracking-[0.16em] uppercase opacity-70">
        Upcoming
      </span>
      <p className="text-sm font-medium">
        {service} — {dateLabel}, {timeLabel}
      </p>
      <p className="text-sm opacity-80">with {staff}</p>
    </section>
  )
}

/**
 * Staff-maintained, customer-visible. `Maintained by` is not decoration: it is
 * the answer to "why can't I edit this", and without it the rows read as a form
 * the customer has failed to fill in.
 */
function Preferences({ card, business }: { card: CustomerCardData; business: PublicBusiness }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-medium tracking-[0.16em] text-[var(--cc-muted)] uppercase">
        Your preferences
      </h2>
      <dl className="flex flex-col">
        {card.preferences.map((pref, index) => (
          <div
            key={pref.id}
            className={cn(
              "flex items-baseline justify-between gap-4 py-2.5 text-sm",
              index > 0 && "border-t border-dashed border-[var(--cc-border)]",
            )}
          >
            <dt className="text-[var(--cc-muted)]">{pref.label}</dt>
            <dd className="text-right font-medium">{pref.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-[var(--cc-accent)]">Maintained by {business.displayName}</p>
    </section>
  )
}
