# Multi-location · the design pass (SCR-01–06, SCR-08, SCR-09, SCR-12–15)

The design side of multi-location, built bottom-up: one definition of a branch,
the scope control every other screen is read through, and the branch lifecycle
those two make legible. It starts by removing an ambiguity rather than adding a
feature — before this, four different files each had their own idea of what a
location was.

Covered here: **SCR-04** branch switcher, **SCR-01** branch list, state and
lifecycle, **SCR-02** chain setup, **SCR-03** branch access grants, **SCR-09**
per-branch service pricing, **SCR-08** the public branch picker, **SCR-05**
the all-branches calendar, **SCR-06** the cross-branch move, **SCR-12** branch
tax identity, **SCR-13** the package mismatch at checkout, **SCR-14** branch
WhatsApp numbers, **SCR-15** money by branch.

Four are not done, and three of those are not startable — see
[Screen coverage](#screen-coverage-against-the-prds-6-reference) and
[Blocked on a decision](#blocked-on-a-decision).

## Read the built product before designing against a doc

The blueprint summarises the shipped Roles & Permissions editor, and the
summary is lossy in ways that changed this work:

| The docs said | `cami-business` actually ships |
| --- | --- |
| "Five shipped roles" (Owner/Admin, Manager, Receptionist, Stylist, Marketing) | Three seeded role codes, read-only on the backend: `merchant_owner`, `receptionist`, `staff`. Everything else is a **custom role the merchant created** — `modules/rbac` ships add, rename, edit and delete for exactly that. So the five are one account's catalog, not the product's roles |
| Five per-role location toggles | One permission code: `venues:read`, "view and manage business locations". The other four exist nowhere. They are a **proposal**, and the dialog labels them as such |
| — | "Works at" is already a per-venue checkbox list against `assignedVenueIds`, with loading, error-and-retry and empty states, and the whole list disabled for an owner |
| — | A **venue slice already exists** (`store/slices/venue.slice.ts`: `activeVenueId` + `venueList`) and feeds an `x-venue-id` header on every request via `lib/http/interceptors.ts`. **Nothing dispatches `setActiveVenue` or `setVenueList`** — see [What is actually built](#what-is-actually-built) |
| — | The service catalog carries one `priceType`, `price` and `duration` per service, business-level. No venue dimension, no inheritance — SCR-09 is a proposal, not a mirror |
| — | Suspend, unsuspend and delete already ship in `LocationsPanel.tsx` against `useChangeVenueState()`, each taking a **reason code plus an optional internal note**, and suspend/delete are mutually exclusive moves |

Two things were rebuilt after reading it rather than before: the lifecycle
actions (wrong copy, missing reason codes, wrong disabled rules) and the role
model (invented five fixed roles with invented capability defaults). The
lesson generalises — check `d:/laragon/www/cami-business` for the as-built
before designing a surface that already exists there.

## What is actually built

PRD §16's first and only **blocking** question is "what is actually built?
Partition (PRO-71) versus attribute (domain model and glossary) versus
aggregate-with-fallback (Faisal's brief). These cannot all be true."

From the frontend, the answer today is **none of the three**:

- `store/slices/venue.slice.ts` holds `activeVenueId?: string` and
  `venueList: VenueSummary[]`, and `store/bootstrap.ts` wires `activeVenueId`
  into an `x-venue-id` request header for every service.
- **No code dispatches `setActiveVenue` or `setVenueList`.** So
  `activeVenueId` is always `undefined`, the header is never sent, and every
  request is implicitly business-wide.
- Consumers already read it as though it were set: `useCalendar`,
  `useCalendarPage` (which falls back to `activeVenueId ?? ""`) and
  `EditSaleDetailsDialog`.

So the venue dimension exists as plumbing and carries no value. That is worth
saying to Faisal plainly, because it also settles a design question: **there is
no shipped branch switcher to match**, and the header shape can express one
active venue but not a subset or a roll-up. SCR-04's subset and all-branches
scopes need an API shape the header does not have.

## Where the real documents live

Slite, not this repo. They move faster than any copy of them, so read them there
rather than trusting a mirror — `cami design with dotzero/PMOS/` already went
two weeks stale, and the user-stories file its own header names is not in it.

| Doc | Slite id |
| --- | --- |
| PRD: Multi-Location — supersedes the separate BRD and PRD; §5 is the single home for R01–R25 | `5hKLTw-Tfm0psh` |
| BRD: Multi-Location | `LDBT5aVEuHKAdP` |
| User Stories: Multi-Location — the same 49 stories, grouped by journey area | `7pg149CiWujY8B` |

The web URLs are a client-rendered SPA behind auth, so fetching one gets an
empty shell. Read them through the API instead, with a personal key from
Slite → Settings → API (turn off "can write" — nothing here needs it):

```bash
curl -H "Authorization: Bearer $SLITE_KEY" \
  "https://api.slite.com/v1/notes/5hKLTw-Tfm0psh?format=md"
```

There is also a **Multi-Location Blueprint** artifact (architecture brief, §01
mental model through §12 appendix). Useful for §02's field-level data-ownership
planes and §03's authorization model, both of which the PRD does not restate.
Treat it as older than the PRD: see [Where the blueprint is stale](#where-the-blueprint-is-stale).

## What these slices implement

| Rule | Where |
| --- | --- |
| R03 · scope is one branch, a subset, or all granted, and filters survive a change | `lib/locations/store.tsx`, `components/blocks/location-switcher.tsx` |
| R04 · capability and location scope are independent axes | `grants` in the store, separate from any role |
| R11 · no operational write resolves a default location | `requiresTargetLocation` / `activeLocation` |
| R24 · no grant means no access, and never means all | `hasNoAccess`, and the switcher's locked state |
| DW1.1 · switching branch never costs the user their place | the switcher never navigates and holds no view state |
| DW1.2 · a single-branch business sees no switcher at all | `isMultiLocation`, read from `granted` not `locations` |
| R12 · a suspended or archived branch is readable but takes no writes | `acceptsWrites()`, and `activeLocation` skipping non-live branches |
| R04 · capability and scope are independent axes | `lib/team/roles.ts`, and `TeamAccessDialog`’s two asymmetric halves |
| R06 · enable per branch, and inherit / override / reset per field | `lib/service-catalog/offerings.ts`, `ServiceLocationsSection` |
| R07 · view one / subset / all calendars, and move with destination checks | `lib/locations/calendar-scope.ts`, `lib/locations/cross-branch-move.ts` |
| R08 · stored value is business-wide, consumption resolves to one branch | `lib/service-catalog/package-branch-check.ts` (the warn-never-block half) |
| R09 / R18 · per-branch money breakdown, bounded by the grant | `lib/money/by-location.ts`, `MoneyByLocationView` |
| R15 · a client picks a branch, or arrives on its own link | `resolvePublicView()`, `PublicBranchPicker` |
| R17 · a sale records collection and fulfilment, and rewrites neither | `MoveAttribution` in `cross-branch-move.ts` |
| R20 · every pre-existing record resolves to one branch | `locationId` required on `MockBooking`, backfilled in the seed |
| R21 / R22 · a branch's own number, no fallback, cost attributed | `lib/locations/whatsapp.ts`, `WhatsAppNumbersPanel` |
| R23 / R25 · tax identity per field, receipts prefixed per branch | `lib/locations/tax-identity.ts`, the Invoicing tab |
| R01 · create, configure, suspend, archive, discover | `setStatus` / `addLocations` in the store, `ManageTab` and `AddLocationsTakeover` |
| R02 · every branch in one setup pass, and one more later, with no migration | `AddLocationsTakeover` — one `addLocations` call, so all-or-none by construction |
| SU1.4 / SU1.5 · archive is a close-out, suspend is a reversible pause | two separate actions with separate copy, and `StateBanner` naming the consequence |

### Branch lifecycle (SCR-01)

Suspend and archive were already described correctly in the copy but wired to
nothing. Both work now, and one copy line was wrong: Delete said data is
"permanently removed" after 90 days, which contradicts R12 — a branch is never
deleted and its history stays readable forever. Only the **slug** frees up. The
action is now called Archive, and the confirmation says what survives it.

Archiving is one-way in this build. It is not a soft delete waiting to be
undone; history is permanent, so there is nothing to restore to.

**Deliberately not invented:** what happens to a branch's future appointments
and unsettled sales when it is archived. That disposition is undecided (PRD
§16, Michelle, and PRO-557), so the dialog states the settled rules and implies
nothing about the unsettled ones.

### Branch access grants (SCR-03)

Two axes, owned at different levels, and the screen is asymmetric because of it
(R04). **Role** is defined once for the business, so its capabilities are shown
read-only — editing them here would change what every holder of that role may
do. **Locations** are granted per person, and that is the half an owner changes.

**An owner's list is not editable**, matching the shipped section. An owner
holds every branch by definition, *including branches added later*, so the grant
is stored as `"all"` rather than as today's ids. A ticked set would silently
exclude branch ten.

**An empty grant is named, not blank.** It is a real state with a real
consequence (R24): the member reads and writes nothing, and it must never
resolve to every branch. Left as an unticked list it reads as an unfinished
form rather than a decision.

**The roster gained Role and Locations columns.** A grant nobody can see is a
grant nobody audits, and nine branches with one wrong scope is exactly BG-06's
failure mode.

The four proposed `venues:*` codes are labelled Proposed in the dialog. The
substance of the proposal is splitting `venues:read`: an area manager who may
set a branch's hours must not thereby be able to edit its tax identity, which
changes every future receipt (R23), or archive it (R01). One code cannot say
that.

### Per-branch service pricing (SCR-09)

One service definition, an offering per branch. A branch that charges more does
not get a second Dog Wash; it gets an override on one field of the shared one.

**Overrides are sparse, and that is load-bearing.** DW3.1 — "raising the
business default leaves an overridden branch untouched" — only holds if a
branch stores *what it deliberately differs on*. Copy the whole service per
branch and a business-wide price change silently stops reaching nine branches,
which is the failure the requirement is written against. So an absent field
means inherited, and inherited means **live**.

**Reset deletes the key rather than writing today's default.** That is the
difference between inheriting and coincidentally matching: write the value and
the branch stops following the next change. Clearing a field in the UI is the
same operation, for the same reason.

**Reset is per field and manual** (DW3.2). There is no "reset this branch"
button, which would throw away decisions the operator never mentioned.

**The marker is on the field, not the row.** A branch can differ on price while
still following the business duration, and a row-level badge would hide which
is which.

**An offering that says nothing is not stored.** Enabled with no overrides is
the default, so the row is dropped — otherwise every branch accumulates a row
meaning "no opinion", and reasoning about a default change means reading rows
that do nothing.

It lives on the **service's** sheet, next to Team members, not in each branch's
settings: the question is "where do I sell this, and for how much", asked once
per service. The other way round, a nine-branch chain opens nine settings
panels per service.

Resolution, reset and counting are pure functions in
`lib/service-catalog/offerings.ts`, unit-tested in `offerings.test.ts` —
including the default-raise divergence, and that a branch price of `0` is an
override rather than an absent value.

### Public branch picker (SCR-08)

Two entry paths, and the asymmetry is the point — the BRD's "front door, per
channel". A **branch** slug is the link a branch shares and it skips the
picker, because the client already stated where (GB3.2). A **business** slug is
the undecided client's entry, and it asks (GB3.1). Neither guesses, which is
R11 satisfied two ways.

**Two open decisions were settled here, both assigned to "design, with the
booking page work".**

*Entry order — location first.* Price, duration and whether a service exists at
all are per branch (R06), so service-first means listing a union across
branches and showing a price that is a range or wrong until a branch is chosen.
The client who already knows what they want has a better door anyway: the
branch's own link. So this page's job is the undecided client, and what they
are undecided about is where. Service-first is a later additive — a "find a
service" entry that narrows to the branches offering it — and it needs
per-branch availability to be real first.

*URL scheme — flat, one namespace.* `cami.app/shampooch` is the chain page,
`cami.app/shampooch-jvc` is the branch. Not nested, because Settings →
Locations already shows `cami.app/{slug}` per location, so branches already
believe they have a top-level link, and nesting would lengthen the thing a
branch actually shares. The cost is a shared namespace where a business slug
and a branch slug can collide — which is why chain setup checks slug
collisions and archiving frees a slug only after 90 days.

**A branch slug wins over a business slug.** For a single-site business the two
are the same string, and resolving to the branch is what makes its page the
branch page with no picker in it — the public half of DW1.2.

**Only published branches appear.** A suspended branch is in the record and on
no public surface: absent from the picker, and its direct URL 404s. Not greyed
out — offering a client a place they cannot book is worse than not mentioning
it (SU1.5, R12).

**`branchAsBusiness()` is why nothing else changed.** It returns the business
with the branch's address, hours, phone and menu resolved in, so the page's
existing sections never learned about branches. That is also what the real
thing does: resolve the location, then render its offering.

**`/{businessSlug}/book` 404s on purpose.** Booking without a branch is the
default-venue fallback R11 deletes, so there is no such page — only
`/{branchSlug}/book`.

### One catalog for the client side

The public page used to carry its own hand-written service list, and the
booking flow read a second one. The page's five services were an **exact subset
of the flow's ids**, copied across by hand — so the two agreed only while
somebody kept them in step, and a branch's price override had to be written
twice to be visible in both.

R15 says both entry paths "yield that Location's offering", singular. So the
page now resolves its menu from the one catalog, per branch
(`lib/public-offering.ts`), and the branch deviations are data in
`lib/service-catalog/offerings.ts` rather than a filter-and-map in the public
mock. Jumeirah's higher wash price and its lack of daycare are written once.

Two consequences worth knowing:

**The page lists the whole offering, grouped by category.** The curated five
was itself a shortcut — a client comparing branches is comparing what each one
*does*, and five of nineteen answers that wrongly. Grouping is how the booking
flow already presents it, so a client sees the same shape before and after
they press Book now. Combos are excluded from the price list because a combo
books as its components, which are listed individually (PRD-143).

**A branch may still carry its own list.** `PublicBranch.services` is optional
now: absent means "resolve from the catalog", which is what the chain's branches
do. Purr Palace keeps a literal list because it is a second business and only
one catalog is modelled in this repo.

### Chain setup (SCR-02)

Three fields per branch — name, city, timezone — and everything else inherited
from the business. That is the whole point of BG-03's "zero operator migration
steps": asking for tax identity and invoicing per branch would make standing up
nine branches feel like nine onboardings, when R23 already says those are a
business default with a per-field override.

**All or none.** Submit with one bad row and nothing is created. A partial
create is worse than a rejection: the owner cannot tell which of the nine
landed, and retrying duplicates the ones that did. It is one `addLocations`
call, so atomicity is structural rather than defended.

**Two collisions are checked, not one.** A name colliding with an existing
branch's slug, and two rows in the same batch resolving to the same slug — the
second is the one an owner cannot see coming, so it is named on the later row
rather than silently overwriting the earlier.

**New branches land as `draft`.** Created is not trading; hours and staff still
have to be set. `activeLocation` skips non-live branches, so a draft is never
the target an operational write falls onto.

Not implemented, and deliberately: every other screen in the reference.

### All-branches calendar (SCR-05)

"Per-branch columns or filter, drill into one" — this is the **filter** half,
and it is a filter on purpose. A day grid is already staff × time; adding branch
as a third axis turns 11 columns into 99, and nobody reads that.

**The counts are why it is a strip and not a dropdown.** An owner opening the
calendar across branches is asking which branch is busy, and a dropdown makes
them try each one to find out. Clicking a branch narrows to it; clicking it
again returns to all, so drilling in and back out is one gesture.

**An all-branches view is read-only for creating.** `calendarWriteTarget()`
returns a reason rather than a boolean, so the grid cannot resolve a target by
picking whichever branch is first (R11). The strip says a booking needs one
branch chosen, at the point where someone would otherwise try to drag one in.

**Every seeded booking now carries a `locationId`, and the field is required.**
That is the R20 backfill done rather than deferred: an operational record with no
location is the state R20 exists to eliminate, and an optional field would let
one back in every time someone adds to the seed.

### Cross-branch move (SCR-06)

The one operation that touches both branches at once, and every way it fails is
a way money or access fails. `evaluateMove()` returns a decision **with a
reason**, because reception has to be able to tell a client why not — "this move
isn't allowed" is what sends them to the phone.

**The money keeps both branches, forever.** The deposit was genuinely taken at
the source, and the work now happens at the destination; both are facts, so both
are recorded (R17, INV-01). Overwriting the collection location would be simpler
and would quietly credit the destination for money it never took, which is the
reconciliation failure BG-04 measures.

**Both ends are checked, not just the destination.** A receptionist holding the
destination but not the source is moving something they cannot see.

**A fixable reason is reported before an unfixable one.** No slot and an
unresolvable payment are both wrong; reception can act on the slot, so that is
what they are told. And an unresolvable payment rejects the move **whole** —
nothing partial, the client keeps their appointment and their payment where they
were (GB1.3).

**Availability is an input, not a computation.** There is no per-branch
availability model yet, so `destinationHasSlot` is supplied. Pretending to
compute it would be the more misleading choice.

### Branch tax identity (SCR-12)

Every inheritable row says whose value it is, because "business default with a
per-field override" is invisible otherwise: two branches showing
"Shampooch Trading LLC" look identical whether one of them means it or is merely
following along, and the difference decides what happens when the default
changes.

The seed carries both real cases — JVC overrides only its receipt prefix,
Jumeirah is a separate registered company with its own TRN. That is what
"let's keep this flexible, it will allow us to add unique tax numbers/VAT"
asked for.

**The forward-only warning is the load-bearing copy.** Editing here changes
every future receipt and no issued one (INV-12, R23). An operator who expects a
correction to fix last month's invoices will be wrong in a way that matters at
filing.

**The receipt number is shown as it prints, prefix included.** "21857" alone
does not show that two branches at the same number cannot collide; "JVC-021857"
next to "JUM-021857" does (R25).

### Package mismatch at checkout (SCR-13)

**Warn, never block** — and the earlier design had this backwards, as did the
blueprint's §07 "can only be redeemed there". Corrected 2026-09-03 from Maaz's
live walkthrough of Chaps & Co's real Fresha account: gift cards and memberships
travel across branches, packages do not, because a package is sold against one
specific priced service.

Blocking does not prevent the outcome. Operators already work around it by hand
— a 100% discount, a gift-card credit — so a block only makes reception do it
slowly in front of the client. `canCompleteSale()` is a function that always
returns true rather than an omitted check, because somebody reading the module
needs to see that completion is not conditional.

**Both figures are in the warning.** "This package may not apply here" sends
reception to the phone; "sold at AED 60, AED 75 here" lets them decide there and
then. The two offered choices are the two things businesses already do by hand.

**The decision is recorded**, and not out of suspicion. Staff already discount
to zero and comp friends (EC-4); the point is that an owner reading a branch's
numbers can see why a package redeemed below its value rather than finding an
unexplained hole at month end.

⚠️ **Not wired to a host flow.** There is no package redemption at checkout in
this repo — only gift cards — so building one to hang a warning on would have
been the packages feature rather than multi-location work. The rule and the
warning are built and tested; the cart line that triggers them is not.

### Branch WhatsApp numbers (SCR-14)

WhatsApp is the front door, and per branch it becomes what decides which branch
a message belongs to: inbound resolves from the number it arrived on, and
`resolveInboundLocation()` returns `undefined` rather than a default, because a
third answer is the silent misroute R21 exists to delete.

**The contrast with SMS is deliberate and worth keeping in mind.**
`effectiveSenderId()` falls back to `CAMI` on purpose — a generic sender still
reaches the right person. A WhatsApp number is an address, not a label, so
falling back would deliver one branch's conversation to another branch's inbox,
which is a cross-branch leak (BG-06) rather than a cosmetic downgrade.

**Migration is shown as the sequence it is, not a spinner.** The step that
surprises people is the OTP, because the code goes to the number and somebody
has to be standing in that branch. Nine branches is nine of those, and that
gates the go-live date rather than the build — so the panel states the step and
who has to do it instead of offering a retry that cannot help.

**Coexistence is flagged while it is still avoidable.** Migrating a number off
the WhatsApp Business app loses that branch's chat history without it, and the
longer the branch has traded the worse that is (EC-45).

### Money by branch (SCR-15)

**Side by side, never merged.** KH1.1 is unusually explicit, and the reason is
that the obvious implementation destroys the job: an owner asking how the day
went across nine branches is asking *which branch* had a bad one. So the total
is rendered as what it is — the sum of the rows, placed after them and labelled
as derived — rather than a headline with a breakdown hidden underneath.

**Bounded by the grant, not filtered by it.** `allowed` bounds the result before
anything is summed, so "run a report on everything" can never exceed what the
caller holds (R18), and the roll-up cannot leak a branch the rows withheld. A
filter narrows a wider result; this never has the wider result.

**A quiet branch is named, not dropped.** "No takings at Al Quoz today" and
"Al Quoz is missing from this report" are different answers, and an owner needs
the first.

**Payouts are not branch rows.** UAE v0 settles per business into one account
(GP1.4), so attributing a payout to a branch would double-count against takings
already attributed on the sale. The footnote says so rather than leaving a
suspicious gap. ⚠️ This is the line the neopay clarification may move — see
Known gaps.

**The seed was spread across branches without moving any money.** `locationFor()`
derives a branch from the row index rather than drawing from the generator's
random stream, because that stream is a fixture other tests assert exact figures
against. Spreading money across branches must not change how much money there
is.

**A fee, tip or refund carries its payment's branch.** Resolved once per payment
and reused, so the breakdown never shows a cost with no matching sale — and a
refund keeps the branch the money was taken at, not the branch doing the
refunding (R17, INV-01).

## What the first review round changed

Six defects, and the three the reviewer found were all real:

| Found | Cause, and the fix |
| --- | --- |
| The public booking card read the same on every branch | `branchAsBusiness()` overrode `businessName`, but the card, cover and title all read `displayName`. Both are resolved now, and a single-site business is left alone so Purr Palace does not become "Purr Palace Al Quoz" |
| The branch switcher sat in the middle of the topbar | The bar is `justify-between` with two children; a third was distributed to the centre. Both switchers now sit in one left-hand group |
| The Add locations form did not look like a settings form | Rebuilt on the `sales-settings.tsx` idiom: section heading, fields at `max-w-md` rather than full width, helper line under the field, `hr` between sections, circled-plus pill for the add action. It had a bordered card per row, which is what the read-mode summaries use |
| About copy named a branch on every branch page | `longDescription` said "Shampooch JVC is a boutique…", and `shortDescription` "in the heart of JVC" — brand-level copy naming one of three. Both are brand-level now |
| The topbar named a branch where the business belonged | `DEFAULT_NAME` was "Shampooch JVC". The same conflation the fabricated second workspace row had |
| A branch page had no way to the other branch | A client who followed a branch link never saw the picker. One line back to the chain page, and only for a chain |

And four the review prompted:

- **"Set for this location" looked like a link** — violet, under the field,
  where the eye looks for an action, while Reset (the only interactive thing)
  was small and grey by the label. The status is a quiet "Custom" chip beside
  the label now.
- **Price and Duration side by side broke their own alignment** — "Duration
  (min)" wrapped, and a wrapped header in one column pushed its input out of
  line with the other. Stacked at `max-w-md`, like every other settings form,
  and the unit moved to the helper line.
- **A bare switch beside a branch name did not say what it switched**, and "on"
  next to a Paused badge read as "bookable here". It is labelled *Offered here*
  now, and a paused branch says nothing is bookable there yet.
- **The roles dialog showed `venues:read` and four "Proposed" rows** —
  engineering detail in a merchant's dialog, and a product promise to anyone
  who had not followed the thread. It lists only what exists; the proposal is
  in this spec and in `lib/team/roles.ts`.
- **The money share bar was decoration** — no scale, and nine of them would be
  a texture rather than a comparison. The share is a figure, and the rows are
  ordered biggest-first so the ordering carries the answer.
- **The WhatsApp panel was a page you could only read**, while its own copy told
  the operator to turn Coexistence on. A migration is nine OTPs received at nine
  branches; a self-serve wizard would promise control the owner does not have.
  There is a request that reaches Customer Success instead, and the copy names
  who acts.

## The four sources this replaced

`lib/locations/mock.ts` is now the only place a branch is defined.

| Was | Held | Now |
| --- | --- | --- |
| `LOCATIONS` in `components/blocks/location-form.tsx` | one rich branch, module const, no store | moved to `lib/locations/mock.ts`, types to `lib/locations/types.ts` |
| `TERMINAL_LOCATIONS` in `lib/terminals/store.tsx` | "Downtown Clinic", "Field team" — names that existed nowhere else | deleted; seeded terminals remapped onto real branch ids |
| the topbar's second workspace row | `` `${businessName} · Jumeirah` `` — a branch dressed as a workspace | deleted; branches live in `LocationSwitcher`, on their own axis |
| `const LOCATION = BUSINESS_NAME` in `lib/money/mock.ts` | every transaction attributed to the *business* | points at a branch; see [Known gaps](#known-gaps) |

That third row is the one worth remembering. A workspace holds exactly one
business (blueprint §01), and multi-brand under one login is explicitly out of
scope — so a branch listed as a workspace is not a shortcut, it is the exact
confusion multi-location exists to remove.

## Switcher design decisions

**One interaction, not two.** Every row is a toggle, and the scope *kind* falls
out of what ends up selected: everything is `all`, one is `one`, anything
between is a subset. The alternative — a mode picker plus a checkbox list —
makes the user hold a concept the product does not need them to hold.

**The last selected branch cannot be unchecked.** A scope of nothing is not a
view of nothing, it is a broken session. R24's empty state comes from a missing
grant, never from a user clearing a menu.

**The menu stays open while toggling.** Building a subset takes more than one
click.

**Absent, not disabled, for a single branch.** DW1.2 is a real requirement, not
a nicety, and it reads the granted set — so a manager holding one branch of nine
gets the same nothing an owner of one shop does.

**`persist={false}` on a nested provider.** The playground shows five scopes at
once; a showcase must not write the scope the operator is working in.

## Screen coverage, against the PRD's §6 reference

The design definition of done is "SCR-01 to SCR-16 drawn including empty,
loading, and error, with the single-branch case showing no switcher at all".

| Screen | State |
| --- | --- |
| SCR-01 branch list, state and lifecycle | **built** — four states badged, suspend / unsuspend / delete with reason codes, matching the shipped panel |
| SCR-02 chain setup | **built** — N branches in one pass, all-or-none |
| SCR-03 branch access grants | **built** — role × location, roster columns, grants dialog |
| SCR-04 branch switcher | **built** — one / subset / all, absent for a single branch |
| SCR-05 all-branches calendar | **built** — branch strip with counts, drill-down, all-branches read-only for creating |
| SCR-06 cross-branch move | **built** — destination bounded by grants, dual attribution, whole-move rejection |
| SCR-08 public business page | **page built** — picker, per-branch pages, published-only. The booking *flow* is not branch-scoped |
| SCR-09 branch service catalog | **built** — per-field inherit / override / reset, per-branch enablement |
| SCR-12 branch tax identity | **built** — per-field source, forward-only warning, prefixed receipt number |
| SCR-13 checkout, package mismatch | **rule and warning built, not wired** — there is no package redemption at checkout to attach it to |
| SCR-14 branch WhatsApp number | **built** — bound / migrating / unassigned, cost attribution |
| SCR-15 money by branch | **built** — side by side, roll-up as a sum, grant-bounded |
| SCR-07 client record, visits elsewhere | **blocked** — the readable field set is undecided |
| SCR-10 branch roster | **blocked** — one unified timeline or one roster per branch is undecided |
| SCR-11 branch stock | **not started** — there is no stock quantity in the product model to make per-branch |
| SCR-16 CamiHQ chain view | **not started** — entirely P2, cuttable whole without failing a gate |

### Blocked on a decision

Three of these were deliberately not designed, because designing them means
inventing the answer to a question somebody else owns.

| Screen | The question, and whose it is |
| --- | --- |
| **SCR-07** visits elsewhere | R13 fixes the readable field set as *uniform* across branches but does not say what is in it. Does branch A see what branch B charged this client, and B's notes, or only that the visits happened? It is a revenue-integrity call (EC-4), **Maaz's**, and PRD §16 lists it. Guessing narrow hides money from an owner; guessing wide leaks a branch's pricing. |
| **SCR-10** branch roster | Does a staff member working two sites in a day get one unified timeline or one roster per branch? DW2.3 assumes per-branch, DW2.4 assumes the roster is authoritative. **Michelle's**, with a chain ops lead. The two answers produce different screens, not different styling. |
| **SCR-11** branch stock | Not blocked on a decision — blocked on a feature. `Product` in components/blocks/products-table.tsx carries no quantity at all, so there is no stock to make per-branch. R16's content (per-branch balances, business total derived and never stored) is a page of inventory work first. |

## Where the blueprint is stale

The blueprint is dated 17 Aug and compiled 30 Aug; the PRD was last checked
4 Sep. Five places disagree, and the PRD wins:

| Blueprint | Current |
| --- | --- |
| §07 receipt numbering and tax identity, **open** | decided 17 Aug: per-location tax identity ships in v0, per-field override (R23). Confirmed again in `#multi-location` — "let's keep this flexible, it will allow us to add unique tax numbers/VAT" |
| §07 settlement model, **open** | decided: ledger attribution per branch in every market, payout grouping a business-level setting |
| §07 timezone, **open** | decided: UTC storage, business default plus per-location override (R19) |
| §07 a package "can only be redeemed there" — a hard block | **inverted.** KC1.5, corrected 2026-09-03 from Maaz's walkthrough of Chaps & Co's real Fresha account: warn, never block. Checkout must complete, staff decide case by case |
| §08 products "hold centrally in a warehouse and transfer stock out" | central warehouse is out of scope (2026-09-02 workshop); cross-branch transfer is v-next |

Two things the blueprint has that the PRD does not, and that are worth keeping:
§02's field-level assignment of every object to a plane, and §03's note that the
per-role location toggles (view/access all locations, manage venue hours,
manage venue invoice, change venue state, update venues) **need to exist for
every role, not just Manager**. That last one appears in no SCR- screen.

## Known gaps

- **Payout grouping may be moving, and SCR-15 shows the current line.** The PRD
  says payout is per business, one account, and GP1.4 says there is "no
  location-level payout configuration in Cami" — so the money breakdown does not
  break payouts out per branch and says why. But in `#multi-location`, Maaz:
  "neopay just confirmed that their terminals can pay into separate business
  bank accounts if the multiple locations do receive money in multiple banks."
  If the v0 line changes, that footnote and the seed's business-level payout
  rows change with it. **Confirm with Michelle before designing anything else in
  payments.**
- **SCR-13 has no host flow**, and SCR-11 has no feature to attach to. Both are
  described in Screen coverage rather than pretended to be done.
- **The full test suite needs `--no-file-parallelism` on this machine.** Running
  `npm test` alongside the dev server exhausted V8's heap mid-run and reported a
  partial pass (12 of 21 files) with errors, which looks like a failure and is
  not one. `npx vitest run --no-file-parallelism` gives 21 files / 286 tests
  green.

- **There are two catalogs, and that is the one thing left in the way of SCR-09
  reaching a client.** The operator's service sheet edits
  `lib/service-catalog/mock-data.ts`, whose seed is a **hair salon**
  (`svc-1` … "Hair Color"). The client side — the public page and the booking
  flow — reads `lib/booking.ts`, which is **pet grooming** with semantic ids
  (`full-groom`, `bath-small`). Offerings are keyed by service id, so an
  override made on the operator sheet cannot reach the ids the client sees.

  The public page's own duplication is gone (it derives from the client catalog
  now), so the visible symptom is fixed. What remains is the decision: unify on
  one catalog and one id space, or accept that the operator demo and the client
  demo describe different businesses. Unifying touches PRD-143's shipped combo
  work, `app/appointments/mock.ts` and the booking flow, so it is a slice of
  its own rather than a tidy-up. `combo.test.tsx` looks `svc-1` up by id and
  asserts nothing about its name, which is the one piece of good luck available.
- **The booking flow's staff and slots are still business-wide.**
  `BOOKING_STAFF`, `BOOKING_DAYS` and `SLOT_GROUPS` carry no branch dimension,
  so R15's "that Location's offering **and availability**" is met on the
  offering and not on the availability.
- **The per-branch catalog does not collapse.** With nine branches the Locations
  section is nine cards, most of them identical, and the one that differs is
  below the fold. Recommended: collapse the branches that inherit everything
  into one line and expand only what differs. Not built — it needs a demo seam
  to seed more than three branches, or it ships unreviewable.

- **The session's grant is not the signed-in member's grant.** `LocationsProvider.grants`
  is a demo control, and the roster's per-member grants are separate data.
  Linking them needs a signed-in-member concept this prototype does not have:
  `lib/current-user.tsx` holds a profile (Michelle You) that matches no roster
  row, so there is nothing honest to join on. Until it exists, SU2.3 —
  revoking a branch narrows every surface immediately — can be reasoned about
  but not demonstrated end to end.
- **`permission: "High" | "Medium" | "Low"`** is still on the roster type
  because the reporting module and the older team surfaces read it. New
  surfaces should read `roleId` and `locationGrants`.

- **Hours are location-agnostic.** `HoursTab()` in `location-form.tsx` takes no
  location, so every branch shows the same hours. R01 requires per-branch hours
  and R19 per-branch timezone; `timezone` is set at creation and stored per
  branch, but no scheduling or display surface reads it yet.
- **An operator's per-branch override does not reach the client page yet.**
  The offerings round-trip on the operator side —
  `lib/service-catalog/offerings-store.tsx` reads them into the service sheet
  and writes them back on save, persisted. But `publicMenuForLocation()` runs
  in a server component, so `/{branchSlug}` renders the module seed rather than
  the store. The seeded deviation (Jumeirah's higher wash price, no daycare) is
  what a client sees; a fresh edit is not. Making it end-to-end means the public
  page reading a client-side store, which is its own slice.
- **A branch's profile is seed data.** Only the lifecycle state and newly added
  branches are persisted. Editing an address or tax field in the takeovers still
  does not survive a reload — those dialogs pre-date this work and were never
  wired to a store.

