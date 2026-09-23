# PRD-169 review comment — draft, 23 Sep 2026

Rewritten off the 22 Sep parked version. Every link below was checked against
the route or the query param that reads it, and the packages lines were redrawn
after the module was rebuilt on `allocatePackageSessions` — the earlier ones
described an Apply button the product does not have. Corrected again on 23 Sep
against the screens themselves: two lines described columns that are not there
(packages' Sold at, the appointments list's branch), and the card-machine line
described a refusal that could not be reached by clicking until `?terminals=moved`
was added for it.

Playground links are kept to the four cases that have no route: a grid that is
not on `/appointments` yet, the nine-branch estate, a grant nothing in the app
can switch, and the four mismatch states side by side. Everywhere else the link
opens the real screen, and where a link cannot set the state (a cart, a branch
switcher) the line says exactly what to press.

The deep-link params `?loc=&lt=`, `?access=`, `?services=`, `?service=&ss=`,
`?s=` are on `prd-169-multi-location-surfaces-ui`. The links resolve once it is
merged.

---

@michelle @maaz — the multi-location pack is ready for review, on a **9-branch Shampooch**, so you are reading it at real chain size.

Below is every place a branch changes something, with what to do on each one. [Everything, indexed](https://design-project-cami.vercel.app/screens#multi-location-prd-43-pro-71) if you would rather browse.

**Setting the estate up**
[Locations list](https://design-project-cami.vercel.app/shell-demo?settings=locations) — nine branches; a paused one says what it stops rather than disappearing. Press **Add locations**: put the same name in two rows and the second says so, and one bad row creates nothing
[Who may change what](https://design-project-cami.vercel.app/shell-demo?settings=locations) — at the bottom of that panel is **Demo: signed in as**, standing in for signing in as somebody else. Pick **Aziz**, who holds Jumeirah only: the estate narrows from nine branches to his one, and Add locations, Manage and the three Invoicing cards refuse with their reason rather than vanishing. Pick **ahmed@getcami.io**, invited and granted nothing: no branches, said out loud rather than shown as an empty list. Pick **Maz Khan** and it all comes back
[Hours per branch](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=hours) — Al Quoz shuts over the middle of the day, which is why a day holds shifts rather than one open and one close
[Suspending a branch](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=manage) — press **Suspend location**: the public page goes, the records stay readable, and it takes no writes
[Tax details and receipt numbers](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jumeirah&lt=invoicing) — Jumeirah is its own registered company: own legal name, own TRN, own prefix. [JVC](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=invoicing) inherits all of it and keeps only its prefix, so the two read side by side
[Deposit per branch](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=invoicing) — Al Quoz takes its own; the rest follow the business, and follow means live
[WhatsApp numbers](https://design-project-cami.vercel.app/shell-demo?settings=whatsapp-numbers) — one number per branch; the branch with none says so, because nothing reroutes to a sister branch
[Which number a reminder leaves from](https://design-project-cami.vercel.app/shell-demo?settings=comms-templates&ct=whatsapp) — the wording is the business's, the number is the branch's, so a reply lands with the people who know the client
[Card machines](https://design-project-cami.vercel.app/shell-demo?settings=payments&pp=terminal) — registered per branch
[Team access](https://design-project-cami.vercel.app/settings/team?access=m_aziz) — Aziz holds Jumeirah only. Role and branches are two separate axes, and neither widens the other
[What a person does at each branch](https://design-project-cami.vercel.app/settings/team?services=m_beth) — Beth works two sites. Turn off **Same services at every location** and each branch gets its own list

**Appointments**
[A booking names its branch](https://design-project-cami.vercel.app/appointments) — **New appointment**: Location is asked first, because the service list is read against it and there is no default
[Already booked elsewhere](https://design-project-cami.vercel.app/appointments) — **New appointment** → pick **Millie Cassidy**. Her open appointment at another branch arrives under the picker, unprompted, and states rather than blocks
[Moving to another branch](https://design-project-cami.vercel.app/sales/appointments-list?ref=b-014) — opens one appointment. Bottom-left of that panel, the round **Quick actions** button → **Move to another location**. Branches you cannot reach are never offered, and the deposit stays credited where it was taken while the work moves
[Who can work where](https://design-project-cami.vercel.app/shampooch-jvc) — press **Book**: day chips and slots come from that branch's own hours, so a day it does not open reads Closed rather than Fully booked
[Rotas and time off](https://design-project-cami.vercel.app/team/scheduled-shifts) — edit a shift at one branch and the other is untouched; book time off and it closes every branch that person works

**Packages**
[The package list](https://design-project-cami.vercel.app/catalogs/packages) — open **Bath & Brush 5+1** → **Sales**. Each row names the branch that sold it under the client, with sessions left, expiry and status. The list is bounded by the branch switcher before it counts, so a manager sees their own branches' sales and is told how many are withheld. Abrar's row reads **Active** and **Expired** at once — two sessions left on a package that ran out of time
[Online sales](https://design-project-cami.vercel.app/catalogs/packages/bath-brush-5/edit?s=online) — two switches, and that is the whole section. R08 is the only branch axis packages have and it is about redemption; where a package sells is not per branch
[A package redeemed where it was sold](https://design-project-cami.vercel.app/sales/new-sale) — pick **Aaishah Vaza**, add **Blow Dry & Style**. No Apply button: the product applies what a client holds. The line reads AED 0 with the real price struck beneath, and the chip counts the client's whole balance rather than the one package that paid
[The same package, priced differently here](https://design-project-cami.vercel.app/sales/new-sale) — pick **Abbey Mcdermaid**, add **Blow Dry & Style**, then set Location to **Shampooch Jumeirah**. Sold at 120 at JVC, 145 here. Both figures shown, two ways to settle it, and checkout completes either way — it warns, it never blocks
[The same package, booked longer here](https://design-project-cami.vercel.app/sales/new-sale) — same pair at **Shampooch Dubai Marina**: same money, 60 minutes against the 45 it was sold as. A different sentence, because it is a different conversation
[A service that branch does not do](https://design-project-cami.vercel.app/sales/new-sale) — pick **Abbie Connelly**, add **Deep Tissue Massage**, Location **Shampooch Mirdif**, which has no massage room. Still addable, because reception is the person who can say "not here, but Jumeirah does it"
[A package out of time, not out of sessions](https://design-project-cami.vercel.app/sales/new-sale) — pick **Abrar Mohammed**, add **Blow Dry & Style**: two sessions left on a package that expired in January. It charges in full and says why, because "you have none left" is the wrong sentence for somebody holding two
[All four mismatch states at once](https://design-project-cami.vercel.app/playground#multi-location-package-mismatch-at-checkout) — including the one where nothing renders, because the terms match

**Checkout and sales**
[New sale](https://design-project-cami.vercel.app/sales/new-sale) — the sale names its branch before anything is added to it
[A charge that would land at the wrong branch](https://design-project-cami.vercel.app/sales/new-sale?terminals=moved) — the picker only ever offers this branch's machines, so this pins the case §15 names: a machine linked to Jumeirah after the sale was drafted. Add a service and tap **Front Desk Register**. Leave Location alone and it is refused because the sale belongs nowhere; set it to **Shampooch JVC** and it is refused with both branches named and a way out; set it to **Shampooch Jumeirah** and it goes through. On the screen rather than in a toast, because nothing moves until it is answered
[Sales list](https://design-project-cami.vercel.app/sales/sales-list) — branch under every sale, prefixed receipt numbers, and counts that match the rows
[Appointments list](https://design-project-cami.vercel.app/sales/appointments-list) — the branch under the team member rather than in a column of its own: a booking resolves its branch through whoever is doing it, and a tenth column pushes this table into a horizontal scroll
[Gift cards](https://design-project-cami.vercel.app/sales/gift-cards-sold) — sold anywhere, spent anywhere

**Money**
[Daily sales](https://design-project-cami.vercel.app/sales/daily-summary?d=2026-05-25) — branches first, total underneath and labelled as their sum. A branch that took nothing is named rather than dropped
[Money drawer](https://design-project-cami.vercel.app/shell-demo?money=drawer) — says which branches it is counting
[Account summary](https://design-project-cami.vercel.app/shell-demo?money=summary) — money by branch inside it
[Activity](https://design-project-cami.vercel.app/shell-demo?money=activity) — filter by branch, and a branch on every row
[Sales summary report](https://design-project-cami.vercel.app/reports/sales-summary) — narrow the switcher in the topbar and the report narrows with it

**Catalog, deals and stock**
[A service, priced per branch](https://design-project-cami.vercel.app/catalogs/service-menu?service=bath-small&ss=locations) — Jumeirah charges 145 for the wash the business prices at 120. Type over a field to override it, press Reset and only that field goes back to inheriting
[A category a branch has emptied](https://design-project-cami.vercel.app/catalogs/service-menu) — set the switcher to **Shampooch Mirdif**, which runs no spa. **Spa add-ons** keeps its heading with the absence said out loud, and the counts follow the branch. On [Mirdif's own page](https://design-project-cami.vercel.app/shampooch-mirdif) the category is gone entirely: reception can say "not here, but Jumeirah does it", and a client can do nothing with a heading over nothing
[Deals](https://design-project-cami.vercel.app/shell-demo?settings=deals) — Settings → Marketing → Deals, as the product has it. Each row says where the deal runs: all locations, a named few, or none — **Spring refresh** has none, so it reads Inactive and refuses Activate. **Add deal** walks details → limits → locations, grouped by city
[One deal in full](https://design-project-cami.vercel.app/shell-demo?settings=deals&deal=abu-dhabi-launch) — open **Availability**: the Locations row counts the branches, and Edit changes them
[Stock per branch](https://design-project-cami.vercel.app/products?product=p2) — the deshedding tool: low at JVC, empty at Jumeirah. Same product, two different problems, and the business total is the sum of the rows rather than a number of its own

**Clients**
[A client's history](https://design-project-cami.vercel.app/clients?client=millie-cassidy) — four visits and three sales across five branches, each naming where

**What a client sees**
[The chain page](https://design-project-cami.vercel.app/shampooch) — it asks where before it shows anything branch-shaped
[One branch's own page](https://design-project-cami.vercel.app/shampooch-jvc) — arriving straight at a branch skips the picker; its menu and prices are its own
[The suspended branch](https://design-project-cami.vercel.app/shampooch-al-quoz) — 404: in the record, on no public surface

**Setup and HQ**
[Setup — location step](https://design-project-cami.vercel.app/setup/location) — city as a fixed list, so "Dubai" is one city and not three
[CamiHQ, the same chain from our side](https://design-project-cami.vercel.app/admin/businesses?business=shampooch&section=locations) — the owner's own components, read-only

**Only in the playground, because there is no route yet**
[The calendar across branches](https://design-project-cami.vercel.app/playground#multi-location-all-branches-calendar) — click a branch to narrow the day, again for all, and the counts say which branch is busy. The day grid is not on `/appointments` yet — that route carries the toolbar and the booking sheet
[Nine branches at once](https://design-project-cami.vercel.app/playground#multi-location-nine-branches-d5) — where the layouts fail: most rows say nothing and the one that matters is below the fold
[A manager who holds one branch](https://design-project-cami.vercel.app/playground#multi-location-money-by-branch) — one row, and a roll-up equal to it: their real number, not an error
[Every scope side by side](https://design-project-cami.vercel.app/playground#multi-location-branch-switcher) — including a single-branch business, which renders nothing at all, and a staff member granted none

All 16 screens in the PRD's §6 reference are drawn, and 44 of the 49 user stories are covered. The 5 that are not are each waiting on something outside the design — happy to walk through those if useful.

cc @armando
