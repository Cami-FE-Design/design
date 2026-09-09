# Service menu — Combo (create / edit)

Branch: `feature/catalogs/service-menu/combo`
Reference: Fresha "New bundle" (`partners.fresha.com/catalogue/services/package/add/new`)

## Terminology

Fresha calls this a **bundle / package**. Cami calls it a **Combo**. A combo is two or
more services grouped and sold/booked together, optionally at a combined or discounted
price. Use "Combo" everywhere in UI copy. (See [[project_cami_terminology]].)

## Surface

Full-screen takeover (route-based, mirrors `app/products/new`), not a route-less dialog —
matches the product create takeover so catalog create flows feel consistent. Entered from
**Service menu → Add → Combo**.

- Route: `/catalogs/service-menu/combos/new`
- Header: fade-in title "New combo" (big h1 fades to topbar on scroll), **Close** (returns
  to `/catalogs/service-menu`) + **Save** pills, top right.
- Single centered column (`max-w-3xl`), sectioned as cards.

## Sections

1. **Basic info** — Combo name (required), Category (select), Description (optional, 0/1000).
2. **Services** — Add service (opens picker modal), selected services list, Schedule type.
3. **Pricing** — Price type, Retail price.
4. **Online booking** — toggle, Available for.
5. **Portfolio images** — image dropzone.

---

## User stories

### Entry
- **US-1** As an operator, from the Service menu I can choose **Add → Combo** and land on a
  full-screen "New combo" takeover, so I can build a multi-service offer.
- **US-2** As an operator, I can **Close** the takeover to return to the Service menu without
  saving, and **Save** to persist the combo.

### Basic info
- **US-3** As an operator, I must give the combo a **name** (e.g. "Cut and blow-dry"); Save is
  the only required field gate. Placeholder shows an example.
- **US-4** As an operator, I can assign the combo to a **category** from my existing service
  categories (shown with their colour dot), so it groups with related services for me and for
  clients online. Helper: "The category displayed to you, and to clients online."
- **US-5** As an operator, I can add an optional **description** up to 1000 characters, with a
  live character count.

### Services
- **US-6** As an operator, I can **Add service** to open a picker listing my services grouped
  by category, each showing duration and price, searchable by name.
- **US-7** As an operator, I can select multiple services; each selected service appears in the
  combo with its duration and price, and I can remove any of them.
- **US-8** As an operator, I can set the **Schedule type** — *Booked in sequence* (one after
  another) or *Booked in parallel* (at the same time) — so booking knows how to allocate time.

### Pricing
- **US-9** As an operator, I can choose a **Price type**:
  - *Service pricing* — combo price = sum of included service prices (retail price read-only).
  - *Custom pricing* — I set a fixed combo price; included services are free within it.
  - *Percentage discount* — I set a % off the summed service price.
  - *Free* — combo is free.
- **US-10** As an operator, when a price type allows it, I can enter a **retail price** in the
  business currency (AED); the field is disabled for *Service pricing*, with "No discount
  applied" shown when none applies.

### Online booking
- **US-11** As an operator, I can toggle **Online booking** on/off to control whether clients
  can book the combo via Marketplace, socials, and custom booking links. Default on.
- **US-12** As an operator, I can set **Available for** (All genders / Female / Male) so the
  combo only surfaces to the right clients online.

### Portfolio images
- **US-13** As an operator, I can add **portfolio images** (jpg/png/avif/webp, max 10mb) shown
  to clients when booking online, via drag-drop or file picker.

---

## Open questions
- PRO ticket number for this work (doc named by feature until assigned).
- Currency: hardcoded AED for now (matches product form); pull from business settings later.
- Categories source — reuse service categories store once it exists; mocked for now.

---

## PRD-143 — telling a combo apart, everywhere it appears

> Shipped on `prd-143-add-icon-for-combo-items-in-service-list`. The ask was one
> icon in the service list; the icon exposed that a combo was unrecognisable —
> and in places unusable — on every other surface it travelled to.

### Why an icon was not enough on its own

Combos come back from the same endpoint as single services and sit in the same
lists, so before this the only tell was the name. Adding a badge to the service
menu made the gap obvious: a combo could be saved but not booked, booked but
not sold, sold but not seen by the payer. The rules below are what makes a
combo read as the same thing from the catalog through to the customer's bill.

### The two marks, and when each applies

- **Being chosen** — the row carries a tinted badge (cami-violet, the same
  treatment as the membership chip), a layers icon, the word *Combo*, and a
  bundled-services count where the row has room. Used on the service-menu card,
  the reorder sheet, both appointment service pickers, the POS item picker, and
  the pet-parent booking card.
- **Chosen or booked** — the combo is no longer one row, so the badge's word
  would be said twice. Each line is named `Combo name - Service name` (the
  as-built format, matching `SalesAppointmentDetailSheet` and the calendar in
  cami-business) and led by the layers glyph alone. Used on the appointment
  sheet's selected-services list, the booked appointment, the calendar hover
  card, the POS cart, the pet-parent summary and Review step, and the payer's
  bill.

An earlier pass dropped the mark entirely once a combo was booked, on the
grounds that the name already says it. That left the appointment surfaces with
no glyph a minute after the picker had one, which is the exact complaint the
ticket opened with.

### Booking a combo books its components

Picking a combo expands it on the spot — a row per component — rather than
adding a single combo line. This mirrors the as-built `AddAppointmentSheet`,
and it is what keeps the create sheet and the booked appointment the same
shape; before it, one appointment was one row on one surface and three on
another.

- Components run back-to-back from the combo's start, **or all at the same
  time** when the combo's schedule type is `parallel` — different team members
  working at once is the point of that setting, and a parallel combo queued in
  sequence books the wrong slot.
- The combo's price is split across components in proportion to what they cost
  alone, with the remainder on the last line, so the lines always sum to the
  combo's price. Each line keeps its standalone price, struck through.
- Every component shares one `comboGroupId`. Removing any line removes the
  combo: the price covers the bundle, and half a bundle is not what it covers.
- Editing a component keeps it attached. The edit panel rebuilds a service from
  its own fields, so the row is spread over rather than replaced — a plain
  replace dropped the group id and detached the component.

### Money on the POS cart

The saving already sits inside each line's price, so the footer **states** it
rather than subtracting it twice: `Total amount (excl. discounts)`, one
`Bundle discount` row per discounted line, then `To pay`.

### What a combo stores

Beyond the service fields, a combo carries `serviceType: "combo"`, its
`components`, its `scheduleType`, and the pricing rule it was saved with
(`comboPriceType` plus `comboDiscountPercent`). The last two exist so the
builder can be reopened on the same choice — without them an edit had only a
total to guess from, and a percentage combo silently became a fixed one.

### Editing

A combo edits at `/catalogs/service-menu/combos/[id]/edit`, not in the
single-service takeover, which has no field for components, schedule type or
combo pricing — editing a combo through it quietly flattened it into a service.
Combos have no **Duplicate** action, matching the as-built menu.

### Deliberately excluded

- **Packages.** A package counts sessions against individual services, and a
  combo already prices its own bundle, so the package builder's service picker
  omits combos — the as-built `SelectPackageServicesDialog` filters them out
  for the same reason.
- **Invoices.** The printed document carries the combo in the line description
  (`Combo - Service`); the violet glyph has no business on an A4 PDF.
- **Boarding / daycare.** Those drawers have their own service catalogs;
  combos are a grooming-side product.

### Not wired in this repo

Combo pricing beyond the proportional split, the combo group travelling into
the invoice payload, and the builder's Online booking / Portfolio images
sections.
