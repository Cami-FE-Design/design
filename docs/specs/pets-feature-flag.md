# Pet feature flag

This doc records the **pet feature flag**: a single account-level toggle that turns all
pet-related features and modules on or off. It governs what front-end surfaces render.

## What this is

One binary flag — `hasPets: boolean` in code.

- **Flag ON** — every pet feature and module shows (pet nav, pet appointment fields,
  pet audience taxonomy, Pet Parent copy).
- **Flag OFF** — pet items hide / route-off / swap (see branch behaviors below).

This is a **feature flag, nothing more**. It is **not** a business-type setting and is
**not derived from category** (`businessType`). Whether an account is a groomer, salon,
or spa is irrelevant — the only thing that decides pet surfaces is this flag.

> Shorthand: "with-pets / without-pets" = flag ON / OFF, for readability only. Don't
> read business-type meaning into it. Code uses `hasPets` (boolean). Not "pet mode",
> not "vertical", not "business type".

## Source of control

**The flag is owned by the Cami HQ admin panel** — set per account/tenant when the
business is onboarded or later. It is **account configuration**, not a user preference
and not a runtime UI toggle.

Exact location: **Cami HQ → Pet Businesses → [partner] dialog → Features tab** (new tab,
sits after Manage). Feature flags — pet features included — are toggled here per partner.
The partner-app account config reads these flags at bootstrap.

**Names (canonical):**

| Layer | Name |
| --- | --- |
| HQ feature key (backend / Features tab) | `pets_enabled` |
| HQ switch label (Features tab UI) | **Pet features** |
| Front-end boolean | `hasPets` (derived from `pets_enabled` at bootstrap) |

Use these exactly — `pets_enabled` is the source-of-truth key, `hasPets` is the FE
alias. Don't introduce other names (`petMode`, `petsOn`, `is_pet_business`).

**Features-tab switch row** (same title + helper + toggle pattern as the Manage tab):

> **Pet features**  `[ On / Off ]`
> Show pet profiles, pet booking fields, and Boarding & Day Care for this partner.

Default ON for existing pet partners at migration; new partners default per onboarding.

| Layer | Role |
| --- | --- |
| Cami HQ → partner dialog → **Features** tab | **Authoritative.** Toggles `hasPets` on the account. |
| Account config (API) | Carries `hasPets` to the client at session/bootstrap. |
| Front-end | **Read-only consumer.** Reads `hasPets` from account config, never writes it. |

Implication: the front-end must treat `hasPets` as **given, not chosen**. No end-user
control surfaces, no settings screen to flip it. Toggling the flag is an HQ-only action.

## Prototype stand-ins (current code)

The design repo has no account-config plumbing yet, so surfaces fake the flag for
demo. These are **scaffolding, to be replaced by the account-config read**, not the
intended architecture:

| Surface | Current stand-in | Target |
| --- | --- | --- |
| `/clients` | URL param `?mode=with-pets\|without-pets` | account-config `hasPets` |
| `/appointments` | local `useState(hasPets)` toggle | account-config `hasPets` |
| Block components | `hasPets?: boolean` prop, defaults `true` | prop fed from one read at the surface root |

When real plumbing lands: one read at each route root (or a thin `useAccount()` /
provider), passed down. Components keep accepting `hasPets?: boolean` so they stay
testable in the playground, but production value originates from account config — never
from URL or local state.

## Navigation — pet-only routes

Some routes exist **only** for with-pets. Hidden from the sidebar when
`hasPets === false`, and the routes themselves should refuse/redirect (not just
visually hidden — a without-pets account has no boarding/daycare domain).

| Nav item | with-pets | without-pets |
| --- | --- | --- |
| Schedules › Appointments | shown | shown |
| Schedules › **Boarding** | shown | **hidden + route off** |
| Schedules › **Day Care** | shown | **hidden + route off** |
| Clients › **Pets** | shown | **hidden + route off** |
| Clients › **Pet Parents** | label "Pet Parents" | **relabel "Clients"** |

Appointments stays for both; only Boarding and Day Care are pet-domain. If Schedules
has no remaining children besides Appointments for a without-pets account, Schedules
may collapse to a single link (no submenu) — confirm with design.

**Clients group:** with-pets shows a submenu (Pets + Pet Parents). without-pets has no
pets, so the submenu collapses to a single top-level **Clients** link — the "Pet
Parents" surface *is* the clients surface, just renamed. This is the canonical
person-noun swap: **Pet Parent → Client** everywhere copy references the owner (nav,
headings, breadcrumbs, empty states). Pairs with the terminology rule below.

## Components that branch on the flag

| File | Behavior when `hasPets` |
| --- | --- |
| `app/clients/page.tsx` | Pets column + pet sections render (true) / hidden (false). |
| `components/blocks/client-detail-dialog.tsx` | Pets section in client detail. |
| `components/blocks/client-edit-sheet.tsx` | Pet fields in add/edit. |
| `components/blocks/appointment-block.tsx` | Pet name/species line on the block. |
| `components/blocks/appointments-toolbar.tsx` | Pet-scoped filters. |
| `components/blocks/appointment-popover.tsx` | Pet detail in popover (required prop). |
| `components/blocks/new-appointment-sheet.tsx` | See appointment flow below. |
| `components/blocks/people-grid.tsx` | Pet column in staff/people grid. |

## Appointment flow — pet surfaces (from live app)

When `hasPets === false`, the appointment build flow drops every pet affordance:

| Element | with-pets | without-pets |
| --- | --- | --- |
| Detail drawer: **Add pet** button (under Services) | shown | **hidden** |
| Sub-screen title | "Select pet **and** service" | "Select service" |
| Sub-screen: **Select pet** dropdown | shown | **hidden** |
| Service rows | unchanged (services exist in both) | unchanged |

The appointment must remain saveable without-pets — pet is **not** a required attach.
Services stay the gating requirement ("Add a service to save the appointment").

## Clients list — pet surfaces (from live app)

The Clients table (`/clients`) drops its pet column when the flag is off:

| Element | Flag ON | Flag OFF |
| --- | --- | --- |
| **Pets** column (pet chips per row) | shown | **hidden** |
| Column set | Client · Pets · Mobile · Sales · Created | Client · Mobile · Sales · Created |
| Page heading | "Pet Parents" / "Clients" per nav | "Clients" |

Row layout reflows to close the gap — not a blank column. The top-right `Mode: with
pets` dropdown is a **prototype stand-in** (see Prototype stand-ins); production reads
the HQ flag and has no such dropdown.

## Service settings — "Available for" semantics

Service online-booking config has an **Available for** dropdown. The label and option
set swap by business type — same control, different audience taxonomy:

| | with-pets | without-pets |
| --- | --- | --- |
| Default option | "All types & breed" | "All genders" |
| Options model | pet species + breed | client gender |

Same field/storage shape (an audience filter on the service); only the taxonomy
behind it changes with `hasPets`. Do not render pet types/breed for without-pets, and
do not render genders for with-pets.

## Default behavior

- Default `true` (with-pets) in component props is a **playground convenience**, so a
  component renders its richest state in isolation.
- **Production has no default** — every surface gets `hasPets` from account config.
  A missing/unknown value is a bootstrap error, not silently `true`.

## Copy / terminology swap

without-pets is not only *hidden* surfaces — owner-facing nouns **swap**. One canonical
map, applied to all copy (nav, headings, breadcrumbs, empty states, dropdowns):

| with-pets | without-pets |
| --- | --- |
| Pet Parent(s) | Client(s) |
| Pet / Pets | _(removed — no equivalent)_ |
| "All types & breed" | "All genders" |
| type & breed (audience) | gender (audience) |

Three branch behaviors recur — tag each surface with which it is:

1. **Hide** — element has no without-pets equivalent (Add pet, Select pet, Pets nav).
2. **Hide + route-off** — whole domain absent (Boarding, Day Care, Pets routes).
3. **Swap** — same control, person taxonomy replaces pet taxonomy (Pet Parent →
   Client, breed → gender).

## Not business type, not category

The pet flag is **independent** of both business type and `businessType` category.

`location-form.tsx` tracks `businessType: string[]` (grooming, wellness, spa…) —
categorical tagging only. **Never derive `hasPets` from it.** Two accounts with the
same category can sit on opposite flag values; the flag alone decides pet surfaces.
Don't infer the flag from vertical, plan, location count, or any other account trait.

## Not built / deferred

- Account-config API field + bootstrap read (backend ticket).
- `useAccount()` / provider on the front-end (lands with the API field).
- HQ admin-panel control UI (HQ ticket, separate repo).
- Mid-session business-type change handling (re-fetch / re-render). Assume set at
  bootstrap for v1.
