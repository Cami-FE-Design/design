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
