# Boarding & Daycare — Calendar + Booking Detail — Design Spec

**Linear**: TBD (fill ticket)
**Milestone**: Boarding / Daycare module · **Project**: v0 Web OS for a single branch
**Branch**: `feature/boarding-daycare`
**Reference app**: **Cuddles** (`market.cuddlesapp.com/calendar`) — calendar + booking-detail drawer. Screenshots in `docs/specs/refs/` (add).
**Depends on**: resources model (`components/blocks/settings-resources-panel.tsx` — Kennel / Daycare Hall resource types), `lib/scheduling-mock.ts` (per-night service + facility), pets + pet-parent directory (PRO-85).

---

## What ships

Two overnight/day-stay surfaces for **with-pets** businesses that board:

1. **Boarding calendar** — resource-timeline (rooms/kennels × days) showing multi-night stays as spanning bars. Week is default range.
2. **Booking Detail drawer** — right-side panel for one stay: parties, dates, per-night pricing, add-ons, status, checkout.

Boarding is **overnight** (priced per night, spans day columns). Daycare is **same-day** (priced per day/session, single column). Same calendar shell, service-type filter switches domain. This spec covers Boarding; Daycare deltas called out inline.

**Scope gate**: only for partners with `hasPets: true` **and** boarding enabled. Not every pet business boards. Add a `boarding` capability flag alongside `hasPets`.

## Reference read (from Cuddles screenshots)

### Screen 1 — Boarding calendar
- **Toolbar (left→right)**: `Today` · `‹ Jul 05 – 11, 2026 ›` range nav · **service-type filter** (`Boarding`) · **status filter** (`Not yet`) · **facility filter** (`All Facilities`) · **view toggle** (`Week`) · `+ Add` primary.
- **Grid**: columns = days (Sun–Sat), today column highlighted. Rows = **resources grouped by facility**. Collapsible facility group header. Under it an **`Unassigned`** row (stays with no room yet) then one row per room (`Room 1`, …). Each row = name + facility subtitle.
- **Stay bar**: lives in a resource row, spans the nights it occupies. Shows **PET NAME**, service, 🌙 **N Nights**. Unassigned stays sit in the Unassigned row until dragged onto a room.

### Screen 2 — Booking Detail drawer
- Header `Booking Detail` + overflow. Tabs: **Details · Activities · Tasks**.
- **Customer card** (collapsible): name, phone, email, address, message action.
- **Pet card**: avatar, name, breed, **size** (X-Small … XL — drives room fit + pricing tier).
- **Stay block**, dated header:
  - service · **rate `$X/Night`** · **facility – room** (`dfd – Unassigned`) · **status pill** (`Booked ▾`, editable) · overflow.
  - **Check In** date+time · **Check Out** date+time · **Nights** 🌙 N.
  - **Add-ons** row (🍽 feeding No · 🦴 belongings/treats No) · **`Add ▾`** to attach services/add-ons.
- **Late Check Out Fee** toggle · **Booking Notes** free text.
- Sticky footer: **Subtotal $X (N Nights)** · **Check Out** action.

## Domain model (implied)

- **Stay** = { petParent, pet, service, rate, facility, room|null, checkIn(dt), checkOut(dt), nights, addOns[], notes, status, subtotal }.
- **Status lifecycle**: `Booked` (a.k.a. "Not yet" = not arrived) → `Checked In` → `Checked Out`. Plus `Cancelled` / `No-show`. Status pill in drawer + status filter in toolbar share this enum.
- **Resource** = room/kennel (Boarding) or hall/run (Daycare), owned by a **facility**. From resources panel: `ResourceType` includes `Kennel`; Daycare uses `Daycare Hall`. Room has a **size/capacity** that gates which pet sizes fit.
- **Assignment**: a stay is either assigned to a room or sits **Unassigned**. Nights are the spanning unit; overlap on one room = double-book conflict.
- **Pricing**: `nights × per-night rate` + add-ons + optional late-checkout fee = subtotal. Daycare: `days/sessions × per-day rate`.

## User stories

### Front desk / reception (operator)
1. As reception, I see the **week of stays across all rooms** so I know occupancy at a glance.
2. As reception, I **filter by service type** (Boarding vs Daycare) so the board shows only the domain I'm working.
3. As reception, I **filter by status** ("Not yet" arrivals) so I can see today's expected check-ins.
4. As reception, I **filter by facility** when the business runs more than one location/building.
5. As reception, I switch **Day / Week / Month** range to plan near-term vs look ahead.
6. As reception, I **`+ Add` a booking** picking pet parent, pet, service, check-in/out dates, and room.
7. As reception, I see **unassigned stays in their own row** and **drag them onto a room** to assign.
8. As reception, I read a stay bar's **pet name + nights** without opening it.
9. As reception, I **click a stay to open Booking Detail** and see parties, dates, price, add-ons.
10. As reception, I **change stay status** (Booked → Checked In → Checked Out) from the drawer pill.
11. As reception, I **check a pet out** from the drawer footer, seeing the running **subtotal (nights × rate)** before taking payment.
12. As reception, I **add add-ons** (feeding, extra services, belongings) to a stay, updating the subtotal.
13. As reception, I toggle a **late-checkout fee** when a pet leaves after the cutoff.
14. As reception, I leave **booking notes** (care instructions, meds) visible to whoever handles the pet.
15. As reception, I **message the pet parent** from the customer card.

### Manager / owner
16. As owner, I detect **double-booked / overlapping** room assignments (conflict indicator on the bar).
17. As owner, I see **occupancy and unassigned counts** to manage capacity.
18. As owner, I configure **rooms/kennels and facilities** (resources panel) that the calendar rows come from.
19. As owner, I set **per-night rates** and add-on prices (service menu / scheduling settings).

### Daycare deltas
20. As reception, a Daycare booking is **same-day** (no night span) — bar occupies one column, priced per day/session; the "Nights" concept becomes "Sessions/Days".
21. As reception, I run a **daycare roster** (who's in today) rather than a room-timeline, since daycare is often capacity-per-hall not one-pet-per-room. (See `design/cami-calendar-components.md` — Roster view / Daycare tab, Room grid / Boarding tab.)

## Open questions

1. **Room vs capacity**: Boarding = one pet per room bar; Daycare = many pets per hall. Two different row semantics — one calendar with a mode switch, or a Boarding-timeline + a Daycare-roster (the teardown doc leans two tabs)? **Recommend two tabs**, shared toolbar.
2. **"Not yet" filter label** — confirm it means *not-yet-arrived* (Booked, check-in date ≤ today). Rename to `Arriving` / `Not arrived` for clarity vs Cuddles' terse copy.
3. **Add-on taxonomy** — feeding / belongings / meds / extra services: fixed set or drawn from service menu? Affects the `Add ▾` menu.
4. **Check-in/out time defaults** — Cuddles uses `12:00 AM`. Set business default check-in/out times in scheduling settings; late-checkout fee keys off checkout cutoff.
5. **Assignment conflict rule** — hard-block overlapping room bookings or warn-and-allow?
6. **Terminology**: use **Stay** (not "Booking") in code to disambiguate from appointment bookings? Confirm against `terminology discipline` (Client not Customer; note Cuddles says "Customer" — we say **Pet Parent**).

## Cross-cutting (inherit from existing patterns)

- **Terminology**: Pet Parent (not Customer), per project convention. Cuddles copy says Customer — do not copy it.
- **Drawer**: reuse the side-drawer detail shell (same family as client detail); Edit/Manage = takeover `FullScreenEditDialog`, detail = drawer.
- **Avatars**: pet = species icon fallback; person = character face / initials per subject rule.
- **Resources**: rows are sourced from `settings-resources-panel.tsx` (Kennel / Daycare Hall), not hardcoded.
