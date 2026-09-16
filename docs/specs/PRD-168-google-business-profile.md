# Google Business Profile link — one place to set it, one message that uses it

> **Built.** Field: `components/blocks/google-review-link-field.tsx`, shared by
> Business Settings › Business details (`business-profile-form.tsx`) and
> onboarding's About step (`app/setup/about/page.tsx`). Link model and
> validation in `lib/business-links/links.ts`, provider in
> `lib/business-links/store.tsx`. Line-scoped token behaviour in
> `lib/comms/tokens.ts`; the merged Thank You copy in `lib/comms/templates.ts`.
> HQ backfill on the Partner profile in `business-detail-dialog.tsx`.
> Reviewable from `/screens` under onboarding and "Pet Business, notifications
> and templates", and from `/playground` → "Google review link (PRD-168)".
> Open items are marked in place below.

Ticket: [PRD-168](https://linear.app/getcami/issue/PRD-168/google-my-business-backlog) —
"Google My Business backlog". Michelle → Hussain, Product, Backlog.

Two other tickets are the same problem from different ends, and neither
references the others:

- [DZ-263](https://linear.app/getcami/issue/DZ-263/notifications-invoice-via-email-invoice-gmb-link-is-missing)
  — **Urgent, In Progress, @ahsan.raza.** "Invoice + GMB link is missing for
  EVERY appointment being booked."
- [PILOT-30](https://linear.app/getcami/issue/PILOT-30/route-post-session-reviews-to-google-my-business)
  — **Triage.** The design-partner session this all came from. Carries the why.

## Problem

The Thank You email already has a Google review line. It has always had one. It
ships as a label with nothing after it, because no merchant has anywhere to put
a link. This is DZ-263's screenshot, verbatim:

```
Subject: Your invoice from Test Pet Business

Hi Maaz Shaffi! 💛
We had the absolute best time with your pet today — they left looking incredible!

📋 Your invoice:                    ← blank
⭐ Rate your pet's experience:       ← blank   (this is the GMB link)
📅 Book your pet's next visit: https://business.getcami.io/s/YosECHLj7M8

Thank you for trusting us with your pet!
🌿 Test Pet Business
```

So DZ-263 is not really a notifications bug. The template is fine; the
configuration surface behind it was never built. PRD-168 is that surface, and
until it exists DZ-263 cannot actually be closed — there is no value to render.

### Why it matters more than a blank line looks

From PILOT-30, the Jun 8 Pet Loft session with Aziz:

> Reviews are Aziz's #1 acquisition channel — **"95% of new customers come from
> Google reviews"**. His current tool (Cuddles) keeps reviews on its own profile
> and Yelp; its "link to Google" never worked, and he estimates **~50 reviews
> were lost**. Customers don't realise the review didn't land on Google.

That last sentence is the one to design against. The failure is silent on both
sides: the customer thinks they reviewed the business, the business never sees
it. A dangling `⭐ Rate your pet's experience:` is the same silence with worse
manners — and we are currently shipping it to every completed appointment.

## Scope

| | In | Out |
| --- | --- | --- |
| The link | One review URL per business, merchant-level | **Per-location links.** Multi-location merchants have one Google profile per venue, so this is a real gap — named under Open items rather than hidden. |
| Where it's set | Business details › External links (source of truth), onboarding, Cami HQ backfill | A Google account integration. We store a URL the merchant pastes; we do not authenticate against Google or read review counts back. |
| Where it's used | The Thank You (completed-appointment) notification | **Send timing.** PILOT-30 wants ~30 min after handback or batched end of day. Real, separate, flagged below. |
| Granularity | Merchant-level | **Per-service opt-out.** The dev repo makes `aftercareInstructions` and `reminderToRebook` per-service; a review ask could follow. Nobody has asked. Named below. |

## The decision that decides whether this works

### A Business Profile link is not a review link

PRD-168 says "Google Business Profile link". That phrasing, taken literally,
ships the Cuddles failure again.

| What the merchant pastes | What the customer gets |
| --- | --- |
| `google.com/maps/place/Sunny+Paws/...` | The listing. Must scroll, find Reviews, tap "Write a review". Most won't. |
| `g.page/r/<id>/review` | The review dialog, open, cursor in the box. |
| `search.google.com/local/writereview?placeid=<id>` | Same. |

The link we need is the **write-a-review** URL, not the profile URL. Google
gives merchants this exact link under *Business Profile → Ask for reviews*.
A merchant asked for "your Google Business Profile link" will overwhelmingly
paste the Maps URL, because that is the one they know how to find — and the
result is a review request that technically works and converts near zero, which
is precisely what Aziz has been living with.

**So:**

1. The field is labelled **Google review link**, not Google Business Profile.
2. Help text names the exact path: *Business Profile → Ask for reviews → copy
   link*, with a link to that page.
3. Validation recognises the three shapes above. A `maps/place` or
   `goo.gl/maps` URL is **not** rejected — it is accepted with a visible
   warning that it opens the listing rather than the review box, because a
   listing link is better than nothing and a hard block sends the merchant away
   to never come back. A non-Google URL is rejected.

This is the whole ticket. Everything below is plumbing.

### Fallback: omit the line, not the value

Today's behaviour *is* the no-link fallback, and it is the bug in the
screenshot: the label prints, the URL doesn't.

`resolveTemplate()` in `lib/comms/tokens.ts` substitutes per token and every
token has a readable fallback — right for `{{client}}` (`Hi there` beats
`Hi ,`), wrong here. There is no readable prose that stands in for a URL: the
sentence is an instruction to click something.

So the review token is the first **line-scoped** one: when it resolves empty,
the whole line is dropped. A merchant with no link set sends a clean Thank You
with two bullets instead of a broken one with three. No fallback phrase, no
empty label, and — importantly — no visible difference that would make a
customer wonder what they were supposed to see.

This needs a small, explicit addition to the token model rather than a regex at
the call site: a token flagged `lineScoped`, and one pass in `resolveTemplate`
that drops any line left with nothing but punctuation and an emoji once its
line-scoped tokens come back empty.

### One Thank You email, not `receipt` + `review-request`

Production sends **one** completed-appointment email carrying invoice, review
and rebook links. This repo models that as two separate `ReminderEvent`s —
`receipt` ("Payment receipt after checkout") and `review-request` ("Asks for a
review once the visit is complete"). Neither matches what customers receive.

The dev repo settles the naming. `NewServiceSheet.tsx:1874` ships a per-service
toggle reading *"Provide aftercare instructions to clients in **thank you
notifications**"*. "Thank you notification" is the product's own term for the
completed-appointment message. PRD-168's "Thank You" is that, and DZ-263's
screenshot is what it looks like.

So `receipt` becomes the Thank You notification and carries all three links;
`review-request` is retired as a separate event. Consequences, taken
deliberately:

- The Reminders matrix loses a row. It gains accuracy: it stops offering a
  toggle for a message that is not sent separately.
- `lib/comms/templates.ts` loses one email body and one WhatsApp body, and the
  Thank You bodies absorb the review paragraph.
- Anyone reading `/screens` or the templates panel sees the set of messages the
  product actually sends. That was not true before.

The counter-argument, recorded because it may win later: PILOT-30 says Aziz
sends the review ask **~30 minutes after handback**, not at checkout. If send
timing is built, the review ask separates from the receipt again on its own
schedule, and `review-request` comes back. Retiring it now is reversible —
re-adding an event is an entry in `REMINDER_EVENTS` and two default bodies.

## Where the field goes

PRD-168 asks for onboarding and a merchant setting. Both, plus a third the
ticket's last-but-one bullet implies:

**1. Business details › External links — the source of truth.**
A fifth row beside Facebook, X, Instagram, Website, in
`components/blocks/business-profile-form.tsx`. It is a merchant-level public
link and this is the one card where a merchant already looks for "our links".
The section exists in both repos with the same idiom, so it costs a row.

One caveat, from the dev repo: `externalLinks` is a **closed four-key object**
in `src/types/business-profile.ts` (`facebook`, `x`, `instagram`, `website`),
validated `.url().max(255)`, and repeated in `business-setup.ts` and
`public-business.ts`. A fifth key is a backend contract change, not a UI change.
Worth knowing before this is quoted as "just add a field".

**2. Onboarding — a field on `/setup/about`, not a step of its own.**
The setup POST already carries `externalLinks`
(`BusinessProfileSetupRequestSchema`), and the About page renders only
displayName, phone and email — so the plumbing exists and is unused. The field
is optional and never blocks Continue.

Not its own step, despite reviews being the #1 acquisition channel. A merchant
mid-signup usually does not have their review URL to hand — it lives three taps
deep in a different Google product — so a dedicated step buys a high skip rate
on a page everyone must pass through, and teaches them that setup steps are
skippable. Asking once, cheaply, in a form they are already filling is the
better trade.

**3. The empty state does the real work.**
Because fill rate at onboarding will be low whatever we do, the place that
matters is the place where the absence has a consequence: the Thank You
template editor shows an inline notice — *"No Google review link set. The review
line won't send."* — linking straight to the setting. Same for `/setup/done`.

This is the part worth arguing for. A field in a settings form is a place to put
a link; a notice on the message that is silently shipping without it is what
actually gets it filled in. It is also the direct fix for DZ-263's class of bug:
the product stops rendering a blank label and starts saying which setting is
missing.

**4. Cami HQ — backfill for existing merchants.**
PRD-168: *"For current merchants, collect and manually configure their links."*
The field goes on the business record in `app/admin/businesses` so ops can set
it per merchant without impersonating. Collection itself is an ops task, not a
build.

## Handoff constraints

Things that will bite whoever integrates this, all found in the dev repo:

1. **`externalLinks` is closed at four keys**, in three schemas. See above.
2. **The email bodies are not in the frontend repo.** No template copy, no
   DZ-263 branch — they are backend-side, which is why DZ-263 sits with
   @ahsan.raza and not a frontend dev. Our template surfaces are design-side
   until that contract exists.
3. **The dev settings dialog has no Notifications and no Communication
   templates panel.** Its seven are profile, business-details, locations,
   language, sales, payments, roles. This repo is ahead of dev on exactly the
   surfaces PRD-168 touches, so "add it next to the templates panel" is not yet
   an instruction dev can follow.
4. **i18n is en + ar** (`src/messages/en/business.json`). Any new label and its
   help text needs both. This repo does not model that, so the copy here is the
   English half of a pair.

## Open items

1. **Send timing.** PILOT-30 specifies ~30 min after handback, or batched at end
   of day. Out of scope here; it is the reason `review-request` might return as
   its own event. Should be its own ticket against the Reminders matrix.
2. **Per-location links.** One Google profile per venue is the normal case for a
   multi-location merchant. This spec stores one link per business. Moving it to
   the location record later is a migration, so if multi-location is close, say
   so now.
3. **Per-service opt-out.** The dev repo already makes aftercare and rebook
   per-service. A review ask could follow the same pattern. Not modelled —
   nobody has asked, and a Google profile is per-business, so the link would be
   the same on every service. Only the *ask* would vary.
4. **Whether we can verify the link at all.** We accept a pasted string. A
   wrong-but-valid URL — the merchant's competitor, a personal listing, a dead
   place ID — is indistinguishable from a right one. A "send yourself a test"
   action on the template editor is the cheap mitigation and is not specced
   here.
5. **PRD-168 does not link DZ-263 or PILOT-30.** All three should be related in
   Linear before this is picked up, or the next person re-derives this page.
