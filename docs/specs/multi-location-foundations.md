# Multi-location · the design pass (SCR-01–06, SCR-08, SCR-09, SCR-12–16)

The design side of multi-location, built bottom-up: one definition of a branch,
the scope control every other screen is read through, and the branch lifecycle
those two make legible. It starts by removing an ambiguity rather than adding a
feature — before this, four different files each had their own idea of what a
location was.

Covered here: **SCR-04** branch switcher, **SCR-01** branch list, state, hours
and lifecycle, **SCR-02** chain setup, **SCR-03** branch access grants, **SCR-09**
per-branch service pricing, **SCR-08** the public branch picker, **SCR-05**
the all-branches calendar, **SCR-06** the cross-branch move, **SCR-12** branch
tax identity, **SCR-13** the package mismatch at checkout, **SCR-14** branch
WhatsApp numbers, **SCR-15** money by branch, and **SCR-16** the CamiHQ chain view.

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

### A branch's profile persists, on one seam (SCR-01)

The profile tabs pre-dated this work and were never wired: every field was an
uncontrolled `defaultValue`, and Save closed the dialog and changed nothing.
Basic info, business type, address and invoicing now write through the store.

The reason this could not wait: hours started persisting in the slice above, and
a reviewer who finds Hours surviving a reload and Address not concludes the
feature is broken. They are not wrong to.

Persistence had also grown a key per surface — statuses first, then hours, and
the profile would have been a third. Whether an edit survived a reload would
have depended on which tab you were in. It is one seam now:
`updateLocation(id, patch)`, one stored key, and `setStatus` and `setHours` are
two-line wrappers over it. Branches created in chain setup persist too, which
they did not before.

Stored as a **patch per branch**, not a copy of the location. Add a field to
`Location` and every stored edit stays valid, where a stored copy would be
missing it — and editing the address does not drop yesterday's hours.

Three decisions inside the forms are worth naming, because each is a place the
obvious behaviour is the wrong one:

- **Renaming a branch does not rename its slug.** The slug is the branch's
  public URL and the id every operational record carries. Renaming "Shampooch
  JVC" must not break a link a client already has. A slug change is its own
  decision, with a redirect.
- **The map pin is not re-derived from the typed address.** Geocoding is a real
  service; a pin quietly moved to the wrong side of a road is worse than one
  left where the operator put it.
- **"Same as business location" stores the tick, not a copy of today's
  address.** A copy would silently stop following when the address changed,
  which is the one thing ticking it promised.

### The last three dialogs, and two shapes of inheritance

Tax defaults, receipt sequencing and tipping were the last dialogs whose Save
closed and changed nothing. Not an oversight of the same kind as the profile
tabs: those write a field, while these write an **override**, which needs
somewhere for "no opinion" to live. `undefined` is that place, and
`BranchSettingsProvider` is where it lives — one provider, because the three are
cards on one tab all answering the same question, and three would let two of
them disagree about which branch is open.

**Reset deletes the key.** Writing today's business value in its place leaves the
field looking inherited while no longer following a later change to the default,
which is G5's failure mode rather than its behaviour. And a branch with nothing
left holds no row at all, so "9 branches inherit everything" stays a fact about
the data. Both rules are `applyTaxOverride` in `tax-identity.ts`, pure and
tested, because they are the easy ones to get wrong in a reducer.

**Two shapes, deliberately.** The tax identity resolves **per field**: a branch
really does differ on one alone — its receipt prefix while sharing a legal
entity, or a boarding branch setting its own services rate while keeping the
business products rate. Tipping resolves **per block**, and the dialog said so
before anything was wired: its first control is "Workspace defaults" or "Custom
for this location". An operator does not want this branch's percentages with the
business's cart rules; they want "this branch tips differently", and then they
configure it. Field-level markers there would name six states nobody asked for.

**On Workspace defaults the tipping controls are disabled, not hidden.** Hidden,
an operator has to switch to Custom to find out what they would be changing
from.

**Receipt sequencing has two fields that look alike and are not.** The prefix is
inherited, so it carries a marker and a Reset. The next number is not: every
branch has its own sequence and there is no business-level "next receipt number"
to inherit from, so a marker there would name a state that cannot exist. Save is
refused on a number that is not a whole number above zero — 0 would leave the
branch's first receipt unnumbered.

### The fifth copy: name, address and phone

`PublicBranch` carried its own `name`, `street`, `city`, `emirate` and `phone`
— the same five facts an operator edits in settings. So the round trip above
worked for hours and prices and silently did not for an address: change a
branch's street in settings, open its public page, nothing.

The values matched to the character, which is what made it invisible. Two
copies that agree are not a smaller problem than two that disagree, they are
the same problem before anyone has noticed.

All five resolve from `lib/locations` now, and the fields are optional as a set:
a branch either carries its own profile or resolves one. Both paths are live —
the chain's three branches resolve, and Purr Palace keeps its own literals
because it is a second business with no location record.

Two mappings needed a decision, because the two sides name the same fact
differently:

- **`emirate` reads `state`.** The Location form says State because the field
  serves every country; the public page says what a client in the UAE would.
- **The public name reads `district`, not `Location.name`.** A branch's public
  name is the area ("JVC"); its operator-facing name carries the brand too
  ("Shampooch JVC"), and the page composes the brand back on — so using the
  full name would have read "Shampooch Shampooch JVC". District is what an
  operator already types and it matched all three labels exactly. Where the
  area is not the label, that needs a real field; listed under Known gaps
  rather than guessed at.

The cover and the address block moved inside `PublicBranchLive` with this,
since a name and an address are now things an operator can change. Only
`about` and the page metadata stay on the server — neither is per-branch, and
metadata cannot read a client store at all.

### The round trip to the client page

The operator side and the client side already shared one definition — a branch's
hours live in `lib/locations`, its menu in the service catalog, and the public
page resolved both rather than carrying copies. What it did not have was the
round trip: `/{branchSlug}` is a static server component, so it rendered the
seed. An operator could change a price or an opening time, see it in settings,
and find the client page unchanged. That is the shape of bug where the screen
looks like it works.

`branchAsBusiness()` and `publicMenuForLocation()` now take the live values as
an argument instead of reading them. Omitted, both fall back to the seed, which
is exactly what a server render has — so the static HTML is byte-identical for a
branch nobody has edited.

`PublicBranchLive` supplies them. Only the three sections an operator can edit
sit inside it (booking card, menu, hours); cover, about, address and the page
metadata stay on the server, and because the sections land in their own
`[grid-area:...]` slots the layout does not care that they arrive together. Both
stores seed from the module the server read, so the first client render matches
the server byte for byte and the saved values arrive on the effect after — no
mismatch, no flash.

The chain page's picker gets the same treatment. Each row states that branch's
hours today, and comparing branches on stale hours is exactly the comparison the
picker exists to get right.

**This wrapper is scaffolding, not the design.** A real client's browser holds
none of the operator's storage; in the product the page reads an API. It exists
so a reviewer can check the thing they could not check before — edit in
settings, open the client page, see it.

### Per-branch hours and timezone (SCR-01)

`HoursTab()` used to take no location and print "9:00 AM – 9:00 PM, Time zone
Asia/Dubai" for every branch. That is not a cosmetic gap: if all three branches
show one week, per-branch hours do not exist, and R01 is the requirement the
whole screen is for.

Three hour models were in the repo, which is why this took a model decision
before it took a component change:

| Where | Shape |
| --- | --- |
| The operator's edit dialog | per day, **multiple shifts**, 12-hour labels |
| The public `WeekSchedule` | per day, one `open`/`close`, 24-hour |
| `cami-business` venue | one `startTime`/`endTime` for the entire week |

Shifts win, and PRO-363 ("user is unable to add more than 2 shifts in business
hours for a day") is the evidence — a bug filed *because* shifts are the real
concept. `lib/locations/hours.ts` is now the one model: a day is
`{ closed: true }` or `{ closed: false, ranges: [...] }`, in 24-hour time, in
the branch's own zone. `DAYS_FULL` in `location-form.tsx` was a fourth copy of
the seven days and is gone.

Consequences worth reviewing:

- **A closed day says "Closed"**, rather than being dropped from the list. A
  missing row reads as an oversight; the word is a fact.
- **"Open until" names the shift running now**, not the last close of the day.
  A branch open 9–1 and 4–8 closes at 1pm at noon — saying 8pm sends a client
  away at ten past one. Likewise "opens 4pm" instead of naming tomorrow, which
  is `closingTime()` and `nextOpeningTime()` in the same module.
- **Unticking a day stores closed**, not an empty range list — a day with no
  ranges would render as open with nothing in it.
- **A new branch inherits the business default** rather than an empty week,
  because that is what inheriting means: an owner adjusts the days this branch
  actually differs on.

The seeded estate is deliberately three different weeks (JVC closed Sunday,
Jumeirah seven days, Al Quoz split 8–1 and 4–8) because identical hours cannot
demonstrate that hours are per branch.

**One definition, like the menu.** `PublicBranch.hours` is now optional and a
branch resolves its hours from `lib/locations` rather than carrying a copy, so
there is one place a branch's week is defined. Only a business with no location
record still carries its own.

And now the round trip too, in one slice covering hours and service overrides
together — see [The round trip to the client page](#the-round-trip-to-the-client-page).

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

### The chain, seen from CamiHQ (SCR-16)

E15's two stories decide this screen, and they decide it against building one:

- **HQ1.1** — "HQ-assisted setup produces the same result as if the owner had
  done it themselves. **There is no lesser HQ-only path.**"
- **HQ1.2** — "Viewing from HQ shows **the same** per-branch breakdown and
  roll-up an owner would see."

A bespoke HQ chain dashboard would be a second implementation of both, and the
second one is the one that drifts. So the Locations tab on a partner reads the
estate from `lib/locations` and renders the per-branch money with
`MoneyByLocationView` — the owner's component, not a copy of it. What HQ adds is
the two things it genuinely has: which partner am I looking at, and that this is
not my data.

**CamiHQ modelled a partner as a single site.** `AdminBusiness` carried one
`street`, one `phone`, and the demo partner was named **"Shampooch JVC"** — the
name of a branch. An Account Manager could not tell a chain from a single site,
which is the first thing they need about a signed account. The partner is
`Shampooch` now, with `locationIds` into the estate rather than copies, and the
list badges a chain. The badge is absent for a single site rather than reading
"1 location", because a badge on every row stops being information.

**No write path, deliberately.** Standing a chain up happens *as the owner*, in
an impersonation session, which is what puts an actor on the record (INV-08). A
create-and-configure surface here would be exactly the lesser HQ-only path
HQ1.1 rules out. The section says so and links into a session.

**Single-site partners see no chain view at all** — G3 read in the HQ plane.
Four of the five seeded partners trade from one address, and a tab full of chain
concepts would make an Account Manager reason about branches for an account that
has none.

**Still open, and Michelle's** (PRD §16): whether chain onboarding is
CamiHQ-ops-driven like PRO-737, partner self-serve, or both — and whether E15
being entirely P2 is *confirmed* deferrable rather than assumed so. Neither
changes what is drawn here: HQ1.1's "same result, no lesser path" holds under
every answer.

### What nine branches actually broke

Seeding nine was supposed to expose the layouts that only hold at three. It did,
and five of the six things it found were mine — four of them invisible until the
estate got bigger. Reviewed off screenshots rather than reasoned about, which is
the only way this class of defect surfaces.

- **A draft branch was told it would "reopen".** The service catalog's row had
  two states where the model has three, so `draft` fell into the `suspended`
  sentence. A branch being set up and a branch that stopped trading are not the
  same fact, and the one word separating them was the wrong one.
- **The calendar strip truncated the word that identifies a branch.** Every name
  in a chain starts with the business, so nine cards spent their width on
  "Shampooch " and cut what came after: "Shampooch Al Quoz" rendered as
  "Shampooch…". It shows the branch's own label now, with the full name on hover
  and for a screen reader. Inside the business the prefix is already known.
- **The strip's last row stretched one card across the full width.** A wrapped
  flex row with `flex-1` made Yas Island three times the size of every other
  branch, which reads as importance. A grid with equal columns instead.
- **"No takings this period at …" became seven names in one sentence.** The
  count is the fact an owner wants; seven names inline hide it. Up to three it
  stays a sentence, after that it is a count above a list.
- **"Business total — the sum of 1 location"** restated the single row above it,
  and told a manager granted one branch that their branch is the business. Their
  number was right; the label was not. The roll-up row is absent below two rows.
- **The availability chips read "T W T F S S M"** — two T and two S, so Friday
  and Sunday, the two days these branches differ on most, could not be picked
  out. Three letters now.

Two empty states were missing entirely, both reachable. The public picker with
every branch paused (a chain closed for Eid) would have read "Shampooch has 0
locations. Each one has its own team, hours and prices." above nothing; it now
says it is not taking bookings and offers the phone. And the service catalog's
Locations section with no branches yet — a service can exist before anywhere to
sell it does — promised inheritance above an empty space.

**Loading is drawn once, on purpose.** The design definition of done asks for
empty, loading and error, and the only branch surface with a loading state worth
drawing is the money roll-up: a grant-bounded query summing a row per branch,
and the one the product has a budget for — `PRD-78` is an E2E whose subject is
that this query stays inside it. It renders a placeholder per branch in scope,
because the count is known before the money is; an owner on nine branches should
see nine rows coming rather than a spinner that could resolve to anything. Every
other branch surface reads data it already has, and a skeleton there would be a
wait that never happens.

### Nine branches, and the collapse (D5)

Three branches is the demo. Nine is what the PRD assumes, and it is where the
layouts fail — always the same way: most rows say nothing, and the one that
matters is below the fold. That could be argued about indefinitely without a way
to see it, so `NINE_BRANCH_ESTATE` in `lib/locations/mock.ts` seeds nine and
`LocationsProvider` takes an `initialLocations` seam to mount it.

The estate is deliberately mostly-identical. Nine branches sharing a menu with
one exception is the honest shape of a chain, and a seed where every branch was
interestingly different would make the collapse look unnecessary — when the
collapse exists precisely because most rows say nothing. Three of the nine are
the real seed, so nothing reading the estate changes shape; the other six are
generated, because six more hand-written profiles add no information. One is a
draft and two are in other emirates, which is what makes per-branch tax identity
(R23) more than a hypothetical.

**What counts as saying something.** A branch deviates when a field is
overridden, the service is off there, or its lifecycle state changes what
"offered here" means. Everything else is a card repeating the business default
back at you.

**The collapse has a floor.** Under four quiet branches nothing collapses:
folding three cards into a line you have to click is a worse screen than three
cards. The summary names the branches it hides, because "6 branches inherit"
without saying which is a fact the operator cannot check.

**D5, decided 10 Sep 2026 (Hussain): collapsed stays the default.** Both states
were built so the call could be made by looking, and it was. The reason: at nine
branches the branch that differs is the only one worth reading, and a default
that puts it below the fold loses the thing the screen is for. The click is paid
by the operator who wants to audit a branch that has nothing to say, which is
the rarer errand.

The floor stays at four quiet branches, so a three-branch business — which is
most of them — never sees a collapse at all.

**Found at nine, fixed:** the switcher had no height cap — at three nothing
needed one. Its branch list scrolls on its own now while "All locations" stays
put, since a roll-up you have to scroll back up to reach is the row an owner
uses most.

### Availability per branch, not just the offering (R15)

R15 asks that both entry paths yield "that Location's offering **and
availability**". The offering was done; availability was one hardcoded week and
all twelve staff, shown on every branch's page.

**Days come from the branch's hours.** A day it does not open is `closed`, which
is deliberately not `full`. "Fully booked" invites a client to check back;
"closed on Sundays" is a fact about the branch. Rendering one as the other sends
people back to a day that will never have a slot. `full` still exists for the
days the seed marks busy, but only where the branch is actually open.

**Slots are the hours at half-hour steps.** They used to be a fixed
Morning/Afternoon grid, which contradicted the hours printed on the same page —
Al Quoz shuts 1pm to 4pm and was still offering 1:30pm. Deriving them means the
two cannot disagree, a shift contributes its own slots so the midday gap is
absent rather than filtered out afterwards, and the last slot of a range is half
an hour before it closes because a slot at closing time is not one.

Which slots read as taken is hashed from the day and the time. Deterministic on
purpose: a demo that reshuffles between renders — or between server and client —
is a demo nobody can point at.

**Staff filter by the branches they work at.** The rail offered a client someone
who is not there, which is the same error as a business-wide catalog. Absent
`locationIds` means every branch, so a single-site business is untouched, and
somebody covering two sites appears at both rather than forcing the operator to
invent a duplicate person.

Fourteen tests in `lib/booking-availability.test.ts`, including the two that
would have caught the old behaviour: no open day is left with nothing bookable,
and JVC and Jumeirah resolve to different weeks and different last slots.

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

#### Both entry paths, not just one

R15 says both entry paths "yield that Location's offering", and only one of them
did. The branch page resolved per branch; the booking flow read the business
default straight off the module. So an operator could set JVC's full groom to
240, see 240 on the branch page, press **Book now**, and be quoted **260**.

A page and a flow disagreeing about the same branch is worse than either being
wrong alone — by the time the client notices, they have already been told a
price.

`bookingCatalogForLocation()` is the flow's resolver, sitting beside the price
list's. Same resolution, different shape: the flow needs combos, the qualifier
next to a duration, and the component ids a bundle books as, so it returns
`ServiceCategory[]` rather than dropping those. `findCatalogService`,
`bookingLines` and `serviceTotals` all take the catalog now and default to the
business's, and the flow threads it to the picker, the sticky summary **and** the
review step — a flow that quotes one price and confirms another is the failure
this was meant to fix, not a smaller version of it.

**A combo goes only where every component goes.** A bundle whose parts a branch
does not do is not a cheaper option, it is an unfulfillable one, and offering it
books work the branch cannot deliver.

#### The operator's side was reading a different business

Found in review, and worse than a duplicate. `lib/service-catalog/mock-data.ts`
— the only source for the Service menu and Categories screens — held a **hair
salon**: Hair Color, Brazilian Blowout, "Color treatments", ids `svc-1`…
Everything client-facing read `SERVICE_CATEGORIES` in `lib/booking.ts`, a **pet
groomer**: Full groom, Bath & brush, ids `full-groom`, `bath-small`…

So the two lists were not copies of each other that had drifted. They were
different businesses, and the consequence landed squarely on SCR-09: setting a
branch price on "Hair Color" wrote an override keyed `svc-1`, and
`publicMenuForLocation()` never looks that id up. The per-branch pricing screen
could not reach a client page **at all** — the seeded deviations worked
(`bath-small`, `daycare-day` are catalog ids), so the gap was invisible until
someone made an override themselves.

The as-built settles the shape. `src/types/service-catalog.ts` has one `Service`
record carrying a `showInPublicBooking` flag — "this only hides the service from
the public booking widget" — and `src/types/booking.ts`'s
`CatalogService.serviceId` is documented as *"the underlying service UUID"*. One
record set, two projections; the operator's menu and the client's catalog cannot
disagree because they are the same rows.

`seedServices` and the merchant categories are now **derived** from
`SERVICE_CATEGORIES` rather than written again. Derived rather than retyped for
the same reason `lib/public-offering.ts` exists: two lists agree only while
somebody keeps them in step. The `admin-*` system categories stay hand-written —
those are the platform's business types, not this merchant's menu.

Two things this changed that a reviewer should expect: the Service menu lists
the nineteen services a client sees (Full groom, not Hair Color), and the
seeded per-branch overrides are now editable in the sheet that owns them. Tests
and playground rows that named `svc-8` now find a combo **by kind**, because
pinning an id ties them to which service happens to sit where.

One seeded row was arguing with itself, found while checking the above:
Jumeirah's wash override was **75** against the business's 120, while both its
own comment and this spec said "charges more". The branch rendered as the
cheaper one. It is 145 now.

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

## The seven sources this replaced

`lib/locations/mock.ts` is now the only place a branch is defined.

| Was | Held | Now |
| --- | --- | --- |
| `LOCATIONS` in `components/blocks/location-form.tsx` | one rich branch, module const, no store | moved to `lib/locations/mock.ts`, types to `lib/locations/types.ts` |
| `TERMINAL_LOCATIONS` in `lib/terminals/store.tsx` | "Downtown Clinic", "Field team" — names that existed nowhere else | deleted; seeded terminals remapped onto real branch ids |
| the topbar's second workspace row | `` `${businessName} · Jumeirah` `` — a branch dressed as a workspace | deleted; branches live in `LocationSwitcher`, on their own axis |
| `const LOCATION = BUSINESS_NAME` in `lib/money/mock.ts` | every transaction attributed to the *business* | points at a branch; see [Known gaps](#known-gaps) |
| the public page's own service list | five services, hand-copied from the flow's nineteen | resolved per branch from the one catalog (`lib/public-offering.ts`) |
| three hour models | shifts on the operator side, one range on the public side, one week in the dev repo's venue | one model in `lib/locations/hours.ts`, shifts everywhere |
| `PublicBranch`'s name, street, city, emirate, phone | the same five facts an operator edits in settings, agreeing to the character | resolved from the branch's record (`locationContact`) |

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
| SCR-01 branch list, state and lifecycle | **built** — four states badged, suspend / unsuspend / delete with reason codes, matching the shipped panel; hours and timezone are per branch and persist |
| SCR-02 chain setup | **built** — N branches in one pass, all-or-none |
| SCR-03 branch access grants | **built** — role × location, roster columns, grants dialog |
| SCR-04 branch switcher | **built** — one / subset / all, absent for a single branch |
| SCR-05 all-branches calendar | **built** — branch strip with counts, drill-down, all-branches read-only for creating |
| SCR-06 cross-branch move | **built** — destination bounded by grants, dual attribution, whole-move rejection |
| SCR-08 public business page | **page built** — picker, per-branch pages, published-only. The booking *flow* is not branch-scoped |
| SCR-09 branch service catalog | **built** — per-field inherit / override / reset, per-branch enablement |
| SCR-12 branch tax identity | **built** — per-field source, forward-only warning, prefixed receipt number; tax defaults, receipt sequencing and tipping all save |
| SCR-13 checkout, package mismatch | **rule and warning built, not wired** — there is no package redemption at checkout to attach it to |
| SCR-14 branch WhatsApp number | **built** — bound / migrating / unassigned, cost attribution |
| SCR-15 money by branch | **built** — side by side, roll-up as a sum, grant-bounded |
| SCR-07 client record, visits elsewhere | **blocked** — the readable field set is undecided |
| SCR-10 branch roster | **blocked** — one unified timeline or one roster per branch is undecided |
| SCR-11 branch stock | **not started** — there is no stock quantity in the product model to make per-branch |
| SCR-16 CamiHQ chain view | **built** — a Locations tab on the partner, reusing the owner's estate and money roll-up; chain badged in the list; no HQ write path |

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

- ~~**There are two catalogs.**~~ Closed — `lib/service-catalog/mock-data.ts`
  derives its services from `lib/booking.ts` rather than holding a second set,
  so an override made on the operator's sheet lands on the id the client page
  and the booking flow look up. See
  [The operator's side was reading a different business](#the-operators-side-was-reading-a-different-business).
- **The bookable roster and the team roster are two lists.** `BOOKING_STAFF` is
  twelve groomers; `lib/team/mock.ts` is five people including an owner and a
  pending invite. Which team members are bookable is a product question — an
  owner is on the roster and is not a slot — so they were not collapsed. Branch
  assignment lives on `BOOKING_STAFF` for now, which means a grant changed in
  SCR-03 does not change who a client can pick.
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

- **Nothing schedules against a branch's timezone yet.** Hours and timezone are
  per branch and read everywhere they are displayed, but availability and date
  bucketing still run on one clock. R19's display half is done; its scheduling
  half needs the booking engine, which is not a design surface.
- **A branch's public label is its district.** `locationContact` maps
  `location.district` onto the name a client reads, because the two matched
  exactly on all three branches and the operator already types it. A branch
  wanting a public name its district does not describe — "Marina Walk" for a
  branch whose district is "Dubai Marina" — needs a real field for it. Not
  invented, because which of the two an operator expects to edit is a product
  question, not a modelling one.

