# Cami Glossary: Service Catalog (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Service catalog domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> **Why this domain matters most for verticalization.** Cami's architecture is a horizontal CRM layer plus a **vertical OS layer**, and the vertical part lives here: service semantics, intake, scheduling rules, and terminology. Pet vs beauty vs clinic differences show up as different catalog configs, not different codebases (Cami-Pet and Cami-Business are GTM packaging). Keep the catalog vocabulary vertical-neutral.

---

## Confusable cluster: Service variant vs Add-on vs Advanced pricing

| Term | Additive or exclusive | Who chooses | Effect on price and duration |
|---|---|---|---|
| **Service variant** | Exclusive. Replaces the base config | The client, during booking | Each variant carries its own price type and duration |
| **Service add-on** | Additive | The client, as an extra booking step | Extra price and duration stack on the parent service |
| **Advanced pricing and duration** | Override | Nobody at booking. Config, per team member and per location | Replaces base price and duration for that person or site |

---

## Entries

### Service

- **What it is.** A bookable treatment clients book in the WhatsApp thread or online, and staff add when booking in store.
- **Cami mechanics.** The core bookable unit. Carries a name, menu category, description, price type and price, and duration. Bookable only when three things hold at once: it can be delivered at the selected **location**, has an **available team member**, and any required **resources** are free. Drives the appointment length on the calendar and the checkout line-item price. ⚠︎ **Cami divergence:** no marketplace listing (Fresha's third driver); the front door is the WhatsApp thread + AI Receptionist.
- **Reversible.** Partially. Fields editable, archive reversible, permanent delete not.
- **Where you see it.** ⚠︎ Catalog, Service menu.
- **Don't confuse with.** Service bundle, service variant.
- **Status.** Live.

### Service menu

- **What it is.** The full ordered list of categories, services, and bundles a business offers.
- **Cami mechanics.** The container for the catalog. Its order is what clients see on the **online booker / in-thread booking flow** (⚠︎ not a marketplace). Reorderable and exportable. ⚠︎ Relevant to onboarding: **data migration tooling** imports an operator's existing menu (for example from Fresha) into this structure.
- **Reversible.** Yes. Ordering and export are non-destructive.
- **Where you see it.** ⚠︎ Catalog, Service menu.
- **Don't confuse with.** The whole Catalog (also holds Products, Memberships).
- **Status.** Live.

### Category (field label "Menu category")

- **What it is.** A named grouping of related services and bundles that organizes the menu.
- **Cami mechanics.** Organizational and presentational: sets menu grouping and the client-facing booking order. Has a name, an assigned **color used to identify appointments on the calendar**, and an optional description. **Destructive coupling:** archiving or deleting a category also removes the services and bundles grouped within it.
- **Reversible.** Partially. Archive reversible via Unarchive; permanent delete not.
- **Where you see it.** ⚠︎ Catalog, Service menu, left panel.
- **Don't confuse with.** Product category (separate object), add-on group. "Service group" is not a term.
- **Status.** Live.

### Service variant

- **What it is.** A different version of the same service with its own price and duration, for example short hair vs long hair, or small dog vs large dog.
- **Cami mechanics.** Mutually exclusive options nested under one parent service. Each variant carries its own price type and duration, so selecting one sets both the appointment length and the charge. Keeps the menu short. ⚠︎ **Persona hook:** for **consultation-gated services** (extensions, hair color) that have no fixed price, a variant with a **"From" price type** sends a range rather than a firm price. Pairs with the "book consult / send range" path (see Price type).
- **Reversible.** Yes. Add, edit, remove.
- **Where you see it.** ⚠︎ Service, Pricing and duration, Options.
- **Don't confuse with.** Add-on (additive, optional), advanced pricing (staff/location override, not a client choice).
- **Status.** ⚠︎ Confirm variants ship at v1.

### Service add-on

- **What it is.** An optional extra linked to a service that a client can select at booking, such as conditioner or nail art.
- **Cami mechanics.** Additive. Each option has a name, description, additional price, and additional duration that stack on the parent, extending the slot and the checkout total. Add-ons live in an **add-on group** that appears as an extra booking step. A group can be hidden from online booking while still printing on confirmations and receipts. Limits (min/max/quantity) and Linked services (one group across many services) apply to the group.
- **Reversible.** Partially. Remove and Edit reversible; permanent delete not.
- **Where you see it.** ⚠︎ Service, Service add-ons.
- **Don't confuse with.** Service variant, upselling (whole services/memberships at checkout).
- **Status.** ⚠︎ Confirm.

### Add-on group

- **What it is.** A named container holding related add-on options, attached to one or more services.
- **Cami mechanics.** The unit that appears as a booking-flow step, and the unit Limits and Linked services apply to. The only "group" concept in the catalog; not a service grouping.
- **Reversible.** Partially. Remove differs from permanent delete.
- **Where you see it.** ⚠︎ Service, Service add-ons.
- **Don't confuse with.** Category (the actual service grouping).
- **Status.** ⚠︎ Confirm.

### Price type

- **What it is.** The pricing model on a service, variant, or bundle.
- **Cami mechanics.** Three values. **Fixed** charges a set amount. **From** shows a minimum starting price with the final set at checkout. **Free** means no charge. Determines what shows on the online menu and pre-fills at checkout. ⚠︎ **"From" is the mechanism for consultation-gated pricing:** extensions and color have no fixed price, so the receptionist pads a range and routes to a consult. Pair "From" with a **book-consult path** so staff do not over-promise a price.
- **Reversible.** Yes.
- **Where you see it.** ⚠︎ Service, Pricing and duration.
- **Don't confuse with.** Advanced pricing, bundle pricing options.
- **Status.** ⚠︎ Confirm the consult-routing path exists (persona need, not a given).

### Advanced pricing and duration

- **What it is.** Per-team-member and per-location overrides of a service's price and duration.
- **Cami mechanics.** Overrides the base for specific staff or locations, so the same service can cost and take different amounts by who performs it and where. Applies to variants too. **Per-location matters for the multi-venue calendar** and for the multi-location roadmap. Reset restores base values.
- **Reversible.** Yes, via Reset / Reset all.
- **Where you see it.** ⚠︎ Service, Pricing and duration, Advanced.
- **Don't confuse with.** Service variant (client-selectable, not an override).
- **Status.** ⚠︎ Confirm depth at v1.

### Extra time (blocked / processing / extra servicing)

- **What it is.** Additional time attached to a service beyond the core duration.
- **Cami mechanics.** Three kinds. **Blocked:** client not present, team member unavailable, slot fully consumed. **Processing:** client present but the team member is free to take another appointment, slot partially open. **Extra servicing:** the team member returns to the client during the processing period. Do not call any of this "buffer time."
- **Reversible.** Yes. Edit or remove on the service or per appointment.
- **Where you see it.** ⚠︎ Service settings; also per appointment.
- **Don't confuse with.** Calendar blocked time (a separate object, staff unavailability), an add-on's added duration (billable service time, not a gap).
- **Status.** ⚠︎ Confirm which of the three ship.

### Processing time

- **What it is.** Passive time inside a service where the client is occupied but the treatment is hands-off, for example color developing or a dog drying.
- **Cami mechanics.** Client present, team member free, calendar shows a partially open slot. Counts into online slot calculation: a 1h service with 15m processing is treated as 1h 15m, which can create short gaps near shift ends.
- **Reversible.** Yes. Configurable on the service.
- **Where you see it.** ⚠︎ Service settings, extra time.
- **Don't confuse with.** Extra servicing time, calendar blocked time.
- **Status.** ⚠︎ Confirm.

### Service availability

- **What it is.** The locations, team members, and resources that decide whether a service can be booked.
- **Cami mechanics.** Tick each team member and location, and add resource requirements (rooms, equipment). Removing a location or member stops the service appearing for new bookings there; existing appointments are unaffected. ⚠︎ **Cami divergence:** online visibility does not require a marketplace profile; it flows through the online booker / WhatsApp booking.
- **Reversible.** Yes. Re-tick to restore.
- **Where you see it.** ⚠︎ Service, Team members / Locations / Resources.
- **Don't confuse with.** Limit service availability (dates/times), the online-booking on/off toggle.
- **Status.** Live (multi-venue).

### Limit service availability

- **What it is.** Date-range and day/time restrictions on when a service can be booked online.
- **Cami mechanics.** Limits between dates and to specific days/times, aligned to shifts. Bookable online only where the limit **overlaps** shifts, locations, and required resources (it intersects, does not override). Applies to new bookings only.
- **Reversible.** Yes. Untick, no effect on existing appointments.
- **Where you see it.** ⚠︎ Service, Online booking section.
- **Don't confuse with.** Service availability (who/where), booking window, closed periods (parked).
- **Status.** ⚠︎ Confirm.

### Set booking sequence

- **What it is.** A fixed order for scheduling selected services when a client books several online.
- **Cami mechanics.** Services in the sequence always schedule in the set order regardless of client selection order; others append by client choice. Affects appointment construction, not price.
- **Reversible.** Yes.
- **Where you see it.** ⚠︎ Catalog, Service menu.
- **Don't confuse with.** A bundle's internal "booked in sequence" type.
- **Status.** ⚠︎ Confirm.

### Archive (service menu item)

- **What it is.** Removing a service, bundle, or category from the live menu without deleting it.
- **Cami mechanics.** Archived items stop appearing and stop being bookable. **Existing appointments are honored** either way. Note the doc conflict Fresha carries: a **category** archive/delete cascades to its services and bundles, while a **bundle** archive hides only the bundle. Resolve this explicitly for Cami.
- **Reversible.** Yes. Unarchive restores it.
- **Where you see it.** ⚠︎ Service menu, Actions, Archive / Unarchive.
- **Don't confuse with.** Permanent delete, the online-booking toggle (hides from clients but stays bookable in store).
- **Status.** ⚠︎ Confirm, and resolve the category-vs-bundle cascade.

### Permanently delete (service menu item)

- **What it is.** Removing a service, bundle, or category from the menu entirely.
- **Cami mechanics.** Removes the item. Existing appointments still honored. ⚠︎ Resolve the same category-cascade-vs-bundle-hide conflict as Archive.
- **Reversible.** No. No restore path.
- **Where you see it.** ⚠︎ Service menu, Actions, Permanently delete.
- **Don't confuse with.** Archive.
- **Status.** ⚠︎ Confirm.

---

## Cut from this domain (do not port)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Treatment type** | A marketplace search/discovery classifier. Cami has no consumer marketplace, so no discovery taxonomy to feed | If Cami ever builds a discovery surface |

---

## Product decisions surfaced by this domain

| Decision | Why |
|---|---|
| **Consult-routing path for "From"-priced services** | Validated persona need (Layla: extensions/color have no fixed price, she routes to a consult). Needs a "book consult / send range" flow distinct from fixed-price booking. Not a Fresha port, a Cami build |
| **Resolve the category-cascade vs bundle-hide conflict** | Fresha's own docs disagree. Cami should state one rule for archive/delete cascade before it ships |
| **Keep catalog vocabulary vertical-neutral** | Same terms serve pet, beauty, clinic. Verticalization is config (service semantics), not new terms |
