// The merchant's Google review link — what counts as one, and what to say when
// it isn't one. Pure helpers; the React provider lives alongside in store.tsx
// (same split as lib/comms and lib/notifications).
// Spec: docs/specs/PRD-168-google-business-profile.md
//
// The decision this file exists to enforce: **a Business Profile link is not a
// review link.** PRD-168 asks for a "Google Business Profile link", and taken
// literally that ships the failure PILOT-30 was raised about — Aziz's previous
// tool linked to Google in a way that never landed a review, and he estimates
// ~50 were lost without anyone noticing.
//
// The difference is entirely in which URL the merchant pastes:
//
//   google.com/maps/place/…            → the listing. Scroll, find Reviews,
//                                        tap "Write a review". Most won't.
//   g.page/r/<id>/review               → the review box, open, ready to type.
//   search.google.com/local/writereview → the same.
//
// A merchant asked for "your Google Business Profile link" will paste the Maps
// URL, because that is the one they know how to find. So we ask for the review
// link by name, tell them where Google keeps it, and — crucially — recognise a
// listing URL and say what it will do rather than silently accepting it.

/**
 * What a pasted string turns out to be.
 *
 * `listing` is not an error. A listing link is worse than a review link and far
 * better than nothing, and a hard rejection at this point sends a merchant off
 * to find the right URL — which, in practice, means never coming back and the
 * review line never sending at all. So it saves, with a warning that says what
 * the customer will actually see.
 */
export type GoogleLinkKind = "empty" | "review" | "listing" | "invalid"

export type GoogleLinkCheck = {
  kind: GoogleLinkKind
  /** Message for the field. Null when there is nothing to say (empty or good). */
  message: string | null
}

/** Where Google actually keeps the link, for the field's help text. */
export const GOOGLE_REVIEW_HELP_URL = "https://support.google.com/business/answer/3474122"

/** The path through Google's UI, named in full so nobody has to hunt for it. */
export const GOOGLE_REVIEW_HELP_PATH = "Business Profile → Ask for reviews"

const REVIEW_PATTERNS = [
  // g.page/r/<id>/review — what "Ask for reviews" hands out.
  /^g\.page$/i,
  // search.google.com/local/writereview?placeid=<id>
  /^search\.google\.[a-z.]+$/i,
]

const LISTING_HOSTS = [
  /^(www\.)?google\.[a-z.]+$/i,
  /^maps\.google\.[a-z.]+$/i,
  /^maps\.app\.goo\.gl$/i,
  /^goo\.gl$/i,
  /^business\.google\.[a-z.]+$/i,
]

/**
 * Parse leniently. Merchants paste without a scheme far more often than they
 * paste a malformed URL, and refusing `g.page/r/x/review` for want of `https://`
 * would be a validation error about nothing.
 */
function parse(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }
}

export function checkGoogleReviewLink(raw: string): GoogleLinkCheck {
  if (!raw.trim()) return { kind: "empty", message: null }

  const url = parse(raw)
  if (!url) {
    return { kind: "invalid", message: "That doesn't look like a web address." }
  }

  const host = url.hostname
  const isReviewHost = REVIEW_PATTERNS.some((p) => p.test(host))

  if (isReviewHost) {
    // g.page also serves plain profile links (g.page/sunny-paws), which are
    // listings wearing a review link's hostname. The /review suffix is the
    // whole difference, so it is checked rather than assumed.
    const looksLikeReview =
      /\/review\/?$/i.test(url.pathname) ||
      /writereview/i.test(url.pathname) ||
      url.searchParams.has("placeid")
    if (looksLikeReview) return { kind: "review", message: null }
    return {
      kind: "listing",
      message:
        "This opens your Google profile, not the review box. Customers will have to find “Write a review” themselves — far fewer will.",
    }
  }

  if (LISTING_HOSTS.some((p) => p.test(host))) {
    return {
      kind: "listing",
      message:
        "This is your Maps listing, not your review link. It still works, but customers land on the listing and have to find “Write a review” themselves.",
    }
  }

  return {
    kind: "invalid",
    message: "That isn't a Google link. Paste the review link from your Google Business Profile.",
  }
}

/** Whether a stored value will actually render in a message. */
export function hasGoogleReviewLink(link: string | null | undefined): boolean {
  return Boolean(link?.trim())
}

/**
 * Display form for a settings row — scheme stripped, because `https://` is
 * noise in a summary column and every other external link row reads bare.
 */
export function displayGoogleReviewLink(link: string | null | undefined): string | null {
  const trimmed = link?.trim()
  if (!trimmed) return null
  return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "")
}
