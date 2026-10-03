# Multi-location · the designs, by delivery phase

The design pack was reviewed as one piece: every screen a chain touches. Engineering
delivers it in five phases and thirteen epics (GNK / Faisal's plan, Linear projects
`(ML-PH n-Epic m)` in ENG-NZ-AU). This maps one onto the other, so a frontend ticket
leads straight to its screen and a screen says which phase it belongs to.

Phase 1 is mapped from its FE tickets. Phases 2 to 5 have no tickets yet (Epic 7 and
Epic 9 exist and are empty; 8 and 10–13 do not exist), so they are mapped from the
phase plan's own wording and marked **to confirm**.

All links are on https://design-project-cami.vercel.app.

## Phase 1 · Daily branch operations

### Epic 1 · Agree contracts and release controls

| Ticket | What it asks for | Design |
| --- | --- | --- |
| ENG3-78 (FE) | Hide switcher and Add branch when off; one branch = no switcher | [Switcher, every scope](https://design-project-cami.vercel.app/playground#multi-location-branch-switcher) — single-location renders nothing |

### Epic 2 · Create branches and control access

| Ticket | What it asks for | Design |
| --- | --- | --- |
| ENG3-91 (FE) | Branch list + Add branch form: name, address, hours, timezone, invoice details | [Locations list](https://design-project-cami.vercel.app/shell-demo?settings=locations) · [Hours](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=hours) · [Business time zone](https://design-project-cami.vercel.app/shell-demo?settings=business-details) · Invoicing details card on [Invoicing](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=invoicing) |
| ENG3-86 (FE) | Team › branch access picker per login | [Team access](https://design-project-cami.vercel.app/settings/team?access=m_aziz) |
| ENG3-87 (FE) | Branch selection required when inviting or editing a team member | Settings › Team › Add → **Works at** |
| ENG3-98 (FE) | Access-refused message; empty screen when no branches | Sign in as ahmed@getcami.io on [Locations](https://design-project-cami.vercel.app/shell-demo?settings=locations) — "no locations"; actions a role cannot take are absent |
| ENG3-102 (FE) | Top-bar switcher: granted branches only, remembers choice | Topbar on every route · [playground](https://design-project-cami.vercel.app/playground#multi-location-branch-switcher) |

### Epic 3 · Schedule staff and book the right branch

| Ticket | What it asks for | Design |
| --- | --- | --- |
| ENG3-112 (FE) | Assign-to-branches control and branch filter in Team | Team › Add → Works at · Team list filter |
| ENG3-114 (FE) | Shift, repeating shift and time-off dialogs send branch; shifts table per branch | [Scheduled shifts](https://design-project-cami.vercel.app/team/scheduled-shifts) · [playground](https://design-project-cami.vercel.app/playground#multi-location-scheduled-shifts) |
| ENG3-120 (FE) | Calendar sends branch, reloads on switch | [Appointments](https://design-project-cami.vercel.app/appointments) with the topbar switcher |
| ENG3-122 (FE) | New/edit booking and availability send branch; appointments list uses it | [New appointment → Location first](https://design-project-cami.vercel.app/appointments) · [Busy at another location](https://design-project-cami.vercel.app/playground#multi-location-somebody-working-at-another-location) · [Appointments list](https://design-project-cami.vercel.app/sales/appointments-list) |
| — (BE 7.7) | Public branch list and per-branch booking pages | [Chain page](https://design-project-cami.vercel.app/shampooch) · [One location](https://design-project-cami.vercel.app/shampooch-jvc) · [Suspended → 404](https://design-project-cami.vercel.app/shampooch-al-quoz) |

### Epic 4 · Complete branch checkout

| Ticket | What it asks for | Design |
| --- | --- | --- |
| ENG3-148 (FE) | Checkout sends and shows branch; that branch's card machines only | [New sale](https://design-project-cami.vercel.app/sales/new-sale) · [Machine at another location](https://design-project-cami.vercel.app/sales/new-sale?terminals=moved) · [Card machines](https://design-project-cami.vercel.app/shell-demo?settings=payments&pp=terminal) |
| — (BE 8.7) | Receipt numbers per branch | [Sales list](https://design-project-cami.vercel.app/sales/sales-list) — prefixed receipt numbers |
| — (BE 11.2, 11.4) | Stock read per branch; stored value issued at one branch, redeemed at another | [Stock per location](https://design-project-cami.vercel.app/products?product=p2) · [Package redeemed at the till](https://design-project-cami.vercel.app/sales/new-sale) · [Gift cards](https://design-project-cami.vercel.app/sales/gift-cards-sold) |

### Epic 5 · Preserve existing workflows for the pilot

| Ticket | What it asks for | Design |
| --- | --- | --- |
| — (BE 12.1–12.10) | WhatsApp sender per branch; appointment messages from the appointment's branch | [WhatsApp numbers](https://design-project-cami.vercel.app/shell-demo?settings=whatsapp-numbers) · [Which number a reminder leaves from](https://design-project-cami.vercel.app/shell-demo?settings=comms-templates&ct=whatsapp) |
| — (BE 13.1) | Every existing report runs inside the user's branch access | [Sales summary report](https://design-project-cami.vercel.app/reports/sales-summary) — narrows with the switcher |

### Epic 6 · Migrate and activate the pilot

| Ticket | What it asks for | Design |
| --- | --- | --- |
| ENG3-194 (FE) | HQ partner page toggle, showing whether the check passed | [CamiHQ › Shampooch › Locations](https://design-project-cami.vercel.app/admin/businesses?business=shampooch&section=locations) |

**Not a screen in Phase 1:** loading and error states apply to every Phase 1 list — [playground](https://design-project-cami.vercel.app/playground#multi-location-loading-and-error).

## Phase 2 · Branch customization — to confirm

| Epic | Design |
| --- | --- |
| 7 · Services and fiscal settings | [Service priced per location](https://design-project-cami.vercel.app/catalogs/service-menu?service=bath-small&ss=locations) · [Tax identity and receipt prefix](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jumeirah&lt=invoicing) · [Deposit per location](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-al-quoz&lt=invoicing) · tipping per location · [Category a location has emptied](https://design-project-cami.vercel.app/catalogs/service-menu) · [Services a person does at each location](https://design-project-cami.vercel.app/settings/team?services=m_beth) |
| 7 · Package mismatch handling | [All four states](https://design-project-cami.vercel.app/playground#multi-location-package-mismatch-at-checkout) |
| 8 · Lifecycle and booking refinements | [Manage: suspend, reactivate, delete](https://design-project-cami.vercel.app/shell-demo?settings=locations&loc=shampooch-jvc&lt=manage) · [Client history at another location](https://design-project-cami.vercel.app/clients?client=millie-cassidy) ("historical discovery") |

## Phase 3 · Cross-branch coordination — to confirm

| Epic | Design |
| --- | --- |
| 9 · Calendars and moving appointments | [All-locations calendar](https://design-project-cami.vercel.app/playground#multi-location-all-branches-calendar) · [Move to another location](https://design-project-cami.vercel.app/sales/appointments-list?ref=b-014) · [Already booked elsewhere](https://design-project-cami.vercel.app/appointments) |
| 10 · Stock transfer | **No design.** Stock is per location, and nothing transfers in the current pack |

## Phase 4 · Business-wide insights — to confirm

| Epic | Design |
| --- | --- |
| 11 · Chain performance | [Daily sales by location](https://design-project-cami.vercel.app/sales/daily-summary?d=2026-05-25) · [Account summary](https://design-project-cami.vercel.app/shell-demo?money=summary) · [Money drawer](https://design-project-cami.vercel.app/shell-demo?money=drawer) · [Activity](https://design-project-cami.vercel.app/shell-demo?money=activity) · [Package sales by location](https://design-project-cami.vercel.app/catalogs/packages) · [Manager with one location](https://design-project-cami.vercel.app/playground#multi-location-money-by-branch) |

## Phase 5 · Larger-chain rollout — to confirm

| Epic | Design |
| --- | --- |
| 12 · Onboard larger chains | Add locations, several rows in one pass, all or none — [Locations](https://design-project-cami.vercel.app/shell-demo?settings=locations) · [Nine locations at once](https://design-project-cami.vercel.app/playground#multi-location-nine-branches-d5) |
| 13 · Scale and migration | No screen |

## Not in any phase yet

- **Deals per location** ([Deals](https://design-project-cami.vercel.app/shell-demo?settings=deals)) — DW3.4, in the pack, in no phase.
- **Setup location step** ([setup](https://design-project-cami.vercel.app/setup/location)) — city as a fixed list.

## To confirm with GNK

1. **Tax overrides: Phase 1 or 2?** BE 3.1.1 (P1.E2) adds branch tax overrides, but "fiscal customization" is Phase 2. Is the Invoicing tab's override editing Phase 1?
2. **Suspend: Phase 1 or 2?** BE 3.6 (P1.E2) builds suspended branches, but "lifecycle administration" is Phase 2. Is the Manage tab Phase 1?
3. **Add locations, one row or many?** Phase 1's form adds one branch; "atomic bulk onboarding" is Phase 5. The design adds several in one pass — does Phase 1 ship it as single-row?
4. **"Access-refused message" (ENG3-98).** The designs now hide what a role cannot do rather than refuse it on the button. A route a person has no access to still needs a refusal — is that what this ticket means?
5. **Services per person per location (DW2.1)** — Phase 1 (Epic 3, staff per branch) or Phase 2 (services)?
6. **Stock transfer (Epic 10)** has no design. Needed?
7. **Deals per location** sits in no phase.
