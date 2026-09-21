// The customer's own view of their client record — Task 2 of the Client Card
// brief.
//
// The brief puts the two faces side by side and says what that is for: "the test
// for whether the underlying data model is actually venue-agnostic before Tech
// commits to a schema." Running that test honestly means the customer card
// cannot have a data source of its own — and the first version of this file
// gave it one, a hand-authored blob keyed by business slug. Two faces drawn from
// two different records prove nothing about a schema, and keying by business
// meant every Sota customer would have seen Maaz's 320 points.
//
// So there is no card data here any more. `buildCustomerCard` is a pure view
// over the same `MockClient` the operator dialog renders, plus that client's
// activity. Change the record and both faces move together; if one face needs a
// field the record has no room for, the test fails loudly instead of quietly.
//
// The other half of the test is which fields may cross. Deliberately NOT read,
// and not to be added:
//
//   no-show appointments   reception's risk signal, not the customer's screen
//   salesAed               lifetime spend is the venue's view of them
//   source                 acquisition data; the customer knows how they found you
//   tags                   operator shorthand, some of it unflattering
//   internal notes         staff-authored, staff-only (lib/client-notes)
//   unpaid balance         a debt is a conversation, not a dashboard tile
//
// Everything below is either the customer's own (wallet, their appointment) or
// staff-maintained-but-customer-visible (preferences). Nothing is
// customer-writable: the brief says preferences are "editable by staff", and the
// card says so out loud with "Maintained by <venue>".

import { MOCK_CLIENTS, type MockClient, patchTestState } from "@/app/clients/mock"
import { type ClientAppointment, getClientActivity } from "@/lib/clients/activity"
import { resolvePublicView } from "@/lib/public-business"

export type WalletTile = {
  id: string
  label: string
  value: string
}

export type CustomerPreference = {
  id: string
  label: string
  value: string
}

export type CustomerCardData = {
  /** First name. The card greets, it doesn't file. */
  firstName: string
  /** The venue's own line, shown under the wordmark. Optional — most venues have none. */
  tagline?: string
  /**
   * Loyalty balance. Null when the VENUE runs no loyalty programme — not when
   * the customer happens to have no points.
   *
   * This is the absent/empty split the empty card is drawn to teach. A client
   * with nothing at a venue that runs loyalty should read "0 — 200 pts to your
   * next reward", which is an invitation; hiding the section instead tells them
   * their salon has no such thing, which is false and unrecoverable.
   */
  loyalty: {
    points: number
    /** Points still to earn before the next reward. 0 = reward available now. */
    toNextReward: number
  } | null
  /**
   * Gift card / package / membership summary.
   *
   * Empty renders an outline, not nothing. Gift cards, packages and memberships
   * are Cami features every venue has, so "you have none" is always the true
   * reading of an empty wallet — where a section that vanished would read as
   * "this venue doesn't show you that", which is the other thing entirely.
   * Loyalty is where that distinction is real: see `loyalty`.
   */
  wallet: ReadonlyArray<WalletTile>
  /** Next booking. Null when there is none — the card then leads with Book again. */
  upcoming: {
    service: string
    staff: string
    dateLabel: string
    timeLabel: string
  } | null
  /**
   * Staff-maintained, customer-visible. Empty array hides the section.
   *
   * Three kinds of row end up here, and only the first is typed: the client's
   * preferences, their allergies, and the state of their patch test. The last
   * two are DERIVED from their records rather than written into this list —
   * "Patch test · On file" typed by hand is a claim with nothing behind it, and
   * a customer told there is a file when there is none is worse than being told
   * nothing.
   */
  preferences: ReadonlyArray<CustomerPreference>
}

/**
 * The customer's wording, which is not the operator's.
 *
 * This is the one row on the card that can stop a booking, so it is written as
 * what happens next rather than as a status. A customer who reads it before
 * they tap Book again can raise it themselves; one who finds out at the chair
 * has wasted the trip. "Expired" is a state; "we'll redo it" is an answer.
 */
const PATCH_TEST_CUSTOMER_LABEL: Record<"pending" | "failed" | "valid" | "expired", string> = {
  valid: "On file",
  pending: "Results due back",
  failed: "We'll talk it through",
  expired: "Out of date — we'll redo it",
}

/**
 * Which client each venue's card is showing.
 *
 * A card belongs to a client *at* a venue, never to the venue — so this map
 * stands in for "who the link identified", not for a property of the business.
 * The real thing resolves it from the token.
 */
/** The one token the demo treats as live. Everything else reads as dead. */
const VALID_DEMO_TOKEN = "demo"

const CARD_CUSTOMER_BY_SLUG: Readonly<Record<string, string>> = {
  sota: "maaz-shaffi",
  "shampooch-jvc": "millie-cassidy",
  // Deliberately a client with nothing: no wallet, no booking, one preference.
  // It is what most customers see on a first visit, and the layout most likely
  // to be wrong if only the full card is ever looked at.
  "purr-palace": "charmaine-hayes",
}

/** Venue lines that belong to the business, not to the client. */
const VENUE_TAGLINE: Readonly<Record<string, string>> = {
  sota: "Beauty begins the moment you decide to be yourself.",
}

/**
 * Rewards ladder, per venue, because it is the venue's programme rather than a
 * property of the customer: 320 points is 80 short at Sota and would be a
 * different distance somewhere else.
 */
const REWARD_EVERY: Readonly<Record<string, number>> = {
  sota: 400,
  "shampooch-jvc": 200,
}

/**
 * Points still to earn before the next reward.
 *
 * Zero means a reward is ready, so a brand-new customer must not land on it:
 * `0 % 400` is 0, which would have congratulated someone who has never earned
 * a point. Nothing earned yet is the full distance, not the finish line.
 */
function distanceToReward(points: number, every: number): number {
  const remainder = points % every
  return points > 0 && remainder === 0 ? 0 : every - remainder
}

function nextAppointment(appointments: ClientAppointment[]): ClientAppointment | null {
  return (
    appointments.find(
      (a) => a.status === "booked" || a.status === "confirmed" || a.status === "arrived",
    ) ?? null
  )
}

/**
 * The customer's face of one client record.
 *
 * Pure, and handed the record rather than fetching it, so it can be pointed at
 * any client — which is what makes the side-by-side an actual test rather than
 * two drawings that happen to agree.
 */
export function buildCustomerCard(client: MockClient, slug: string): CustomerCardData {
  const activity = getClientActivity(client.id)
  const next = nextAppointment(activity.appointments)

  const wallet: WalletTile[] = []
  if (client.giftCardAed && client.giftCardAed > 0) {
    wallet.push({
      id: "gift-card",
      label: "Gift card",
      value: `AED ${client.giftCardAed.toLocaleString("en-AE")}`,
    })
  }
  // The package with the most left is the one worth a tile. A customer checking
  // before they rebook wants "have I got one", not an inventory — the same call
  // as not rebuilding Fresha's per-category tabs.
  const topPackage = (client.packages ?? [])
    .map((pkg) => ({ pkg, left: Math.max(pkg.totalVisits - pkg.usedVisits, 0) }))
    .sort((a, b) => b.left - a.left)[0]
  if (topPackage && topPackage.left > 0) {
    wallet.push({
      id: "package",
      label: "Package",
      value: `${topPackage.left} of ${topPackage.pkg.totalVisits} left`,
    })
  }
  if (client.membershipTier) {
    wallet.push({ id: "membership", label: "Membership", value: client.membershipTier })
  }

  const points = client.loyaltyPoints ?? 0
  const every = REWARD_EVERY[slug]

  return {
    firstName: client.name.split(" ")[0],
    tagline: VENUE_TAGLINE[slug],
    // `every` is the venue's programme; `points` is this customer's balance.
    // Keyed on the first, never the second.
    loyalty: every ? { points, toNextReward: distanceToReward(points, every) } : null,
    wallet,
    upcoming: next
      ? {
          service: next.services.map((s) => s.name).join(" + "),
          staff: Array.from(new Set(next.services.map((s) => s.staff))).join(", "),
          dateLabel: `${next.weekday.slice(0, 3)}, ${next.dayMonth}`,
          timeLabel: next.time,
        }
      : null,
    preferences: [
      ...(client.preferences ?? []),
      // "No known allergies" is worth a row of its own. Showing nothing tells a
      // customer their salon has no record; showing this tells them their
      // salon asked. Those are different, and only one of them is reassuring.
      ...(client.allergies?.status === "none-known"
        ? [{ id: "allergies-none", label: "Allergies", value: "None known" }]
        : (client.allergies?.items ?? []).map((allergy) => ({
            id: `allergy-${allergy.id}`,
            label: "Allergy",
            value: [allergy.name, allergy.reaction].filter(Boolean).join(" — "),
          }))),
      ...(client.patchTest
        ? [
            {
              id: "patch-test",
              label: "Patch test",
              value: PATCH_TEST_CUSTOMER_LABEL[patchTestState(client.patchTest)],
            },
          ]
        : []),
    ],
  }
}

/** The client whose card this venue's link opens. */
export function getCardCustomer(slug: string): MockClient | undefined {
  const id = CARD_CUSTOMER_BY_SLUG[slug]
  return id ? MOCK_CLIENTS.find((c) => c.id === id) : undefined
}

export function getCustomerCard(slug: string): CustomerCardData | undefined {
  const client = getCardCustomer(slug)
  return client ? buildCustomerCard(client, slug) : undefined
}

/**
 * A branch whose card can stand in for the whole business, for a surface that
 * has to show *a* card rather than a particular one — the Branding preview.
 *
 * Branding is the business's, so which branch this picks does not change what
 * the merchant is looking at; it only has to be a branch that resolves. A
 * chain's own slug resolves to a picker rather than to a branch, so asking for
 * its card directly returns nothing — which is exactly what left the Branding
 * preview an empty box for Shampooch while working for the two single-site
 * venues, whose business and branch slugs happen to be the same string.
 *
 * Published *and* carrying card data, in that order: the demo seeds a card at
 * some branches and not others, and a branch without one would blank the
 * preview again for a different reason.
 */
export function previewCardSlugForBusiness(slug: string): string | undefined {
  const view = resolvePublicView(slug)
  if (!view) return undefined
  const candidates = view.kind === "branch" ? [view.branch] : view.branches
  return candidates.find((branch) => getCustomerCard(branch.slug))?.slug
}

/**
 * What a link token resolves to.
 *
 * The token in the URL is the credential (settled — see the header of
 * customer-card-login.tsx), which is only acceptable because the card is
 * read-only and because the link stops working. Expiry is the second half of
 * that bargain, so it is modelled here rather than left as a line in a spec: a
 * link that never expires is a permanent credential sitting in every WhatsApp
 * thread the customer has ever forwarded.
 */
export type CardTokenResult =
  | { status: "valid"; email: string }
  | { status: "expired"; email: string }

/**
 * Resolve a link token to the customer it belongs to. The real implementation
 * verifies a signed token and checks its age; the prototype keeps the shape
 * (token in, identity + validity out) so the screens are built against the
 * right seam.
 *
 * `demo` is the one valid seeded token; everything else reads as dead, which
 * is how /sota/card/demo-expired gets its screen — the same way /pay/demo-expired
 * and /sign/consent-signed seed theirs — one URL per state, so every screen is
 * reachable without clicking through to it.
 *
 * The seeded tokens are `demo` and `demo-expired`, deliberately not anything
 * derived from the customer. A real token has to be opaque and random: under the
 * settled model the token IS the credential, so a token you can infer from a
 * name is a credential you can guess. Demo URLs get read as a sketch of the real
 * scheme, so they should not sketch a guessable one.
 */
export function resolveCardToken(slug: string, token: string): CardTokenResult | undefined {
  const client = getCardCustomer(slug)
  if (!client?.email) return undefined
  // Anything that isn't a token we issued is treated as a dead one rather than
  // as a valid link or as a 404. Two reasons, and they point the same way: the
  // person holding it tapped what their salon sent them and deserves the
  // venue's own screen, and a card that answers "no such token" differently
  // from "expired token" tells anyone guessing which guesses were close.
  if (token !== VALID_DEMO_TOKEN) return { status: "expired", email: client.email }
  return { status: "valid", email: client.email }
}
