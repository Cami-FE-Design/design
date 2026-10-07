# Multi-location · the designs, by delivery phase

Engineering delivers multi-location in five phases and thirteen epics. Phase 1 is
planned task by task in the WBS (*Multi-Location — Phase 1 WBS, p1-v3 tracking*);
its Linear projects are `(ML-PH 1-Epic n)` in ENG-NZ-AU. This maps each Phase 1
frontend task to its design, lists the designs that have no frontend task yet, and
places everything else by phase.

All links are on https://design-project-cami.vercel.app. `/screens` groups the same
rows by phase and epic.

## Phase 1 · frontend tasks and their designs

| WBS | Task | Design |
| --- | --- | --- |
| P1.1.2 | Mock responses so frontend can build ahead | No screen |
| P1.2.2 | Hide switcher and Add branch when off; one branch = no switcher | [Switcher, every scope](https://design-project-cami.vercel.app/playground#multi-location-branch-switcher) |
| P1.2.4 | HQ toggle showing whether the check passed | [CamiHQ › Locations](https://design-project-cami.vercel.app/admin/businesses?business=shampooch&section=locations) — the switch for every partner, off until the data check passes, every finding listed when it fails |
| P1.3.4 | Branch list + Add branch form (name, address, hours, timezone, invoice details) | [Locations](https://design-project-cami.vercel.app/shell-demo?settings=locations) · [Hours](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=hours) · [Invoicing](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=invoicing) |
| P1.4.5 | Team › branch access picker per login | [Team access](https://design-project-cami.vercel.app/settings/team?access=m_aziz) · [no location yet](https://design-project-cami.vercel.app/settings/team?access=m_ahmed) — Confirm waits for one |
| P1.4.6 | Access-refused message; empty screen when no branches | Sign in as ahmed@getcami.io (dashed strip under Settings › Locations), then any page · [playground](https://design-project-cami.vercel.app/playground#multi-location-no-location-access) |
| P1.4.7 | Branch required when inviting or editing a team member | [Team](https://design-project-cami.vercel.app/settings/team) → Add member: a location is ticked already; untick it and Add for the error |
| P1.5.1 | Top-bar switcher, desktop and mobile | Topbar on every route; at phone width it sits on its own row and opens the same dropdown |
| P1.6.4 | Assign-to-branches control and branch filter in Team | [Team](https://design-project-cami.vercel.app/settings/team) — the list follows the topbar switcher, no separate filter · Add member → Works at |
| P1.6.5 | Shift, repeating shift and time-off dialogs; shifts per branch | [Scheduled shifts](https://design-project-cami.vercel.app/team/scheduled-shifts) |
| P1.7.4 | Calendar sends branch, reloads on switch | No new design — the existing calendar reloads for the location picked in the switcher |
| P1.7.5 | New/edit booking and availability send branch; appointments list | [New appointment](https://design-project-cami.vercel.app/appointments) · [Busy at another location](https://design-project-cami.vercel.app/playground#multi-location-somebody-working-at-another-location) · [Appointments list](https://design-project-cami.vercel.app/sales/appointments-list) |
| P1.8.4 | Checkout sends and shows branch; that branch's card machines only | [New sale](https://design-project-cami.vercel.app/sales/new-sale) · [Machine at another location](https://design-project-cami.vercel.app/sales/new-sale?terminals=moved) |
| P1.10.2, P1.10.4 | Regression | No screen |

## Phase 1 · designs with no frontend task

These are designed and sit on Phase 1 backend tasks, but the WBS has no frontend
task for them, so the frontend estimate does not cover them.

| Design | Backend task |
| --- | --- |
| [Business time zone](https://design-project-cami.vercel.app/shell-demo?settings=business-details) | P1.3.1 |
| [Tax identity and receipt prefix per location](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jumeirah&lt=invoicing) | P1.3.1.1, P1.8.5, P1.8.10 |
| [Suspend a location](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=manage) | P1.3.6 |
| [Services per location](https://design-project-cami.vercel.app/settings/team?services=m_beth) | P1.6.2, P1.7.6 |
| [Public location pages](https://design-project-cami.vercel.app/shampooch) | P1.7.1, P1.7.7 |
| [Card machines by location](https://design-project-cami.vercel.app/shell-demo?settings=payments&pp=terminal&tp=full) — 'No location' with Set location; Change location for a placed machine | P1.8.3.1 |
| [Sale detail: where each payment was taken](https://design-project-cami.vercel.app/sales/sales-list?sale=18) · [invoice](https://design-project-cami.vercel.app/sales/invoice-document?sale=18) | P1.8.2.1, P1.8.7, P1.8.10, P1.8.11 |
| [Stock per location](https://design-project-cami.vercel.app/products?product=p2) · Add and Remove stock show the chosen location's count | P1.11.2, P1.11.3 |
| [Packages at the till](https://design-project-cami.vercel.app/sales/new-sale) · [gift card history](https://design-project-cami.vercel.app/sales/gift-cards-sold?card=gc-2) | P1.11.4, P1.11.5, P1.11.7 |
| [WhatsApp numbers](https://design-project-cami.vercel.app/shell-demo?settings=whatsapp-numbers) · [which number a reminder leaves from](https://design-project-cami.vercel.app/shell-demo?settings=comms-templates&ct=whatsapp) | P1.12.1, P1.12.2, P1.12.10 |
| [Reports narrowed by the switcher](https://design-project-cami.vercel.app/reports/sales-summary) | P1.13.1 |
| [Loading and error states](https://design-project-cami.vercel.app/playground#multi-location-loading-and-error) | Every list above |

## Phase 1 · proposed for a later phase, not yet decided

The WBS counts these in Phase 1 (nothing is moved yet). Faisal's Phase 1 call
proposes moving them; the ones marked *client decision* need Michelle.

| WBS | What | Proposal |
| --- | --- | --- |
| P1.3.6 | Suspend a location | Later — the client's own story SU1.5 is P2 |
| P1.11.2, P1.11.3, P1.11.6 | Stock per location | Later, client decision — the pilot keeps today's shared stock |
| P1.12.1, P1.12.2, P1.12.10 | WhatsApp number per location | Later, client decision — blocked on the client providing numbers |
| P1.12.3–P1.12.11 | Other notification work | Later — notifications are off in production |

## Phase 2 · Branch customization

| Epic | Design |
| --- | --- |
| 7 · Services and fiscal settings | [Service priced per location](https://design-project-cami.vercel.app/catalogs/service-menu?service=bath-small&ss=locations) · [Deposit per location](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=invoicing) · tipping per location · [Category a location has emptied](https://design-project-cami.vercel.app/catalogs/service-menu) · [Package mismatch at checkout](https://design-project-cami.vercel.app/playground#multi-location-package-mismatch-at-checkout) |
| 8 · Booking refinements | [Already booked elsewhere](https://design-project-cami.vercel.app/playground#multi-location-the-duplicate-caught-before-booking) · [Client history at another location](https://design-project-cami.vercel.app/clients?client=millie-cassidy) |

## Phase 3 · Cross-branch coordination

| Epic | Design |
| --- | --- |
| 9 · Calendars and moving appointments | [All-locations calendar](https://design-project-cami.vercel.app/playground#multi-location-all-branches-calendar) · [Move to another location](https://design-project-cami.vercel.app/sales/appointments-list?ref=b-014) |
| 10 · Stock transfer | No design |

## Phase 4 · Business-wide insights

| Epic | Design |
| --- | --- |
| 11 · Chain performance | [Daily sales by location](https://design-project-cami.vercel.app/sales/daily-summary?d=2026-05-25) · [Account summary](https://design-project-cami.vercel.app/shell-demo?money=summary) · [Money drawer](https://design-project-cami.vercel.app/shell-demo?money=drawer) · [Activity](https://design-project-cami.vercel.app/shell-demo?money=activity) |

## Phase 5 · Larger-chain rollout

| Epic | Design |
| --- | --- |
| 12 · Onboard larger chains | Add several locations in one pass — [Locations](https://design-project-cami.vercel.app/shell-demo?settings=locations) · [Nine locations at once](https://design-project-cami.vercel.app/playground#multi-location-nine-branches-d5) |

## Not in any phase yet

- [Deals per location](https://design-project-cami.vercel.app/shell-demo?settings=deals)

## Open

1. **Permission codes.** The access design marks four location permission codes as proposed; the product has one `venues:read`. Phase 1 builds against `venues:read` and the owner checks unless Michelle and Maaz decide otherwise.
2. **The proposals above** — suspend, stock per location, WhatsApp numbers — need a decision before the Phase 1 frontend starts on them.
3. **Checkout with too little stock at a location.** Does the sale stop (`PRODUCT_STOCK_INSUFFICIENT`) or may the count go below zero? The stock design shows below-zero counts.
