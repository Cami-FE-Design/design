# PRD-167: Appointment notes on the calendar — Design Spec

**Linear**: [PRD-167](https://linear.app/getcami/issue/PRD-167/appointment-notes-on-the-calendar-ui) · dev tickets [DZ-209 appointment note icon](https://linear.app/getcami/issue/DZ-209/calendar-appointment-cart-specific-appointment-notes-appointment-note) · [DZ-210 client notes / Staff Alert](https://linear.app/getcami/issue/DZ-210/calendar-appointment-windowcart-client-notes-staff-alert-in-fresha)
**Preview**: <https://design-project-cami.vercel.app> — `/playground`, `/appointments`, `/sales/appointments-list`
**Benchmark**: Fresha calendar hover popup (screenshots on DZ-209 / DZ-210), and Cami's own as-built `EventDetailPopup` · `AppointmentDetailSheet` · `ClientNoteBanner` (`cami-business`, 7 Sep 2026)
**Supersedes**: `PRO-83-appointment-popover.md` — its two-surface model. See the supersede note at the top of that file.

## Status

Built. Every state below is live on the preview.

---

## Three note kinds

The whole point. Nothing in the product told them apart, and two of the three had no home on the calendar at all.

| Kind | Belongs to | Lives for | Where it comes from |
|---|---|---|---|
| **Appointment note** | this booking | one occasion | staff, on the booking |
| **Pet notes** | the animal | every appointment for that pet | structured category + detail |
| **Client notes** (Fresha: *Staff Alert*) | the person | every appointment for that client | staff, or imported history |

So no surface says a bare **"Notes"**. DZ-210 states the distinction as the differentiator, and its use cases are why: remaining packages, credits, voucher codes typed in from a previous system, imported client history.

---

## What ships

| # | Item | Ticket |
|---|---|---|
| 1 | Client notes on the hover card, the create sheet and the detail sheet | DZ-210 |
| 2 | A marker on both note kinds, and on the calendar block when either is present | DZ-209 |
| 3 | The appointment note on the detail sheet, which never rendered it | DZ-209 |
| 4 | One hover card instead of two popovers; click opens the detail sheet | — |
| 5 | All services on the booking, not just the first | — |
| 6 | Payment policy and Checkout on the detail sheet | — |

4–6 fell out of comparing this repo with the as-built app. They are not in either dev ticket.

---

## Client notes: a preview, not the archive

Mirrors the as-built `ClientNoteBanner`, including the reasons it settled on this shape — they were paid for in rejected passes and should not be re-litigated here.

- **Bounded on the CONTENT, not the container.** Two notes at two lines each; one note at one line on a glance surface. Nothing scrolls, nothing is cut mid-glyph, the height is predictable. Bounding the box instead — by note count, by characters, by a fixed scrolling height — sliced text at a container edge every time and still could not fit one long note.
- **Not a hazard slab.** DZ-210 asks for Fresha's hazard sign, and it is here, but as a muted outline glyph rather than the amber block. `ClientNote` carries no severity field, so an amber treatment marks every client who has ever been written about as dangerous. What the field actually holds is routine context.
- **The full history lives on the client profile.** A `+N more on the client profile` line points there; it is deliberately not a control, because "View profile" already sits in the same client row.

---

## One rule for labels and markers

Five different treatments of the same note had accumulated across three surfaces. One rule replaces them:

> **Full sheets label. Glance cards mark. The glyph is the same everywhere — only its position follows the surface.**

| | Full sheet (detail, create) | Glance card (hover, calendar block) |
|---|---|---|
| Heading | `h2` outside the card | none |
| Note block | plain card | tinted band, flush to the edges |
| Icon | **leading**, inside the card | **trailing**, on the label row |

Leading in a sheet matches the pin on *Your Pet Address* and the card on *Payment policy*, which already carried an icon under a heading. Trailing on a 320px card is not a preference: a leading icon there costs a word per line.

---

## Surfaces

### Calendar block

A document glyph in the icon row when the booking carries **either** note kind. One glyph, not a taxonomy — the card has room for a marker, and the hover card it opens says which. This is DZ-209's literal ask: reception scans the grid without hovering every appointment.

### Hover card (320px)

Order, top to bottom:

1. Status header — a flat label. Changing status belongs to the sheet.
2. Identity — pet first, owner beneath, phone, breed, intake badge. **Once.**
3. Client notes — label row with the marker, then one clamped line.
4. Your Pet Address — tinted block with Navigate ([PRD-144](https://linear.app/getcami/issue/PRD-144/check-google-maps-integration-for-pickup-address)).
5. Pet notes — one clamped summary line.
6. Services — every item, each with performer, duration, price, duration-modifier pills, membership chip. **The list scrolls at `max-h-30`; nothing else does.**
7. Service count and total.
8. **Appointment note — last, always.** Tinted band, `Note:` prefix, trailing glyph.

Two things are load-bearing. **The card is one height** whatever it holds — it is dismissed by moving the pointer, so a card that reflows to its content moves its own edges out from under the cursor. And the **note is last** because it is free text of unknown length: anything after it moves by an unpredictable amount, while the count and total are fixed-width facts.

### Detail sheet

Reached by clicking a calendar block, from the sales list, from reports, and from global search — one component, so the surfaces cannot drift apart.

Client → **Client notes** (its own section, not nested in the client card) → Your Pet Address → Services → Pet notes → Payment policy → Sale total → **Appointment note, last** → Checkout.

### Create sheet

Client notes appear under the client picker, as soon as a client with notes is selected — a package balance changes what gets booked.

---

## States

| State | Behaviour |
|---|---|
| Client has no notes | The banner returns `null`. No empty card, no heading, no vertical cost |
| Client has more notes than fit | `+N more on the client profile` |
| Booking has no appointment note | No band, no section |
| One or two services | Nothing scrolls |
| Three or more services | The service list scrolls; header, note band and footer stay put |
| No deposit policy configured | The Payment policy section does not render |

---

## Not here

- [PRD-141](https://linear.app/getcami/issue/PRD-141/client-profile-from-the-appointment-sheet-ui) — client profile from the calendar. Being built in `cami-business` and mirrored here once it deploys.
- [PRD-144](https://linear.app/getcami/issue/PRD-144/check-google-maps-integration-for-pickup-address) — pickup address to Google Maps. Same branch, its own spec.

---

## Change log

| Date | Change |
|---|---|
| 2026-09-08 | First version. Design built in `projects-cami` for DZ-209 + DZ-210, with the popover realignment that came out of it |
