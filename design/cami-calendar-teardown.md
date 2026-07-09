# Cami Calendar: Front Desk Teardown

Shipping-grade inventory for the Cami calendar surface (grid and popovers), scoped to scheduling.

> **Scope update (v2).** Check-in and check-out are out of scope for the front desk view. Those will be owned by individual professionals. The front desk still *sees* those states but does not act on them.

---

## Part 1. Foundations

### 1.1 Context and translation

Source: Fresha multi-stylist salon calendar.
Target: Cami, an AI operating system for pet businesses.
Role in scope: front desk.
Surface in scope: Calendar grid and popovers across Calendar, Daycare, and Boarding modes.
Primary job in scope: scheduling (create, modify, find, cancel, hold, waitlist, recur).

Key translation shifts from salon to pet:

- "Client" becomes "pet parent" (plus one or more pets). Every booking has three entities: parent, pet(s), service(s).
- Services range across 1:1 (grooming, vet, training) and N:1 (daycare, boarding). The calendar must support both.
- Service duration depends on breed and size, not just service type.
- Vaccinations, medications, and behavior flags are safety-critical and affect scheduling (compatibility checks, prerequisites).
- First-time boarding or daycare often requires a meet-and-greet before a real booking is accepted.
- Waitlists are native. Popular groomers run long waitlists. Cancellations trigger an offer cascade.
- Recurring bookings are the norm (weekly daycare, monthly groom), not the exception.

### 1.2 Three calendar modes (same atom, different visualization)

The atomic unit is the **booking**. What changes across service shapes is how bookings are visualized and aggregated.

| Mode | Use | Axis | Lives in |
|---|---|---|---|
| **People grid** | 1:1 services (grooming, vet, training) | Staff columns × time rows | Calendar tab |
| **Roster view** | Daycare | List of enrollments per session | Daycare tab |
| **Room grid** | Boarding | Rooms × days | Boarding tab |

Three modes mean context switching for the front desk. Switching has a cost. Design the mode switch deliberately. The left nav carries most of it, but a parent on the phone asks "can you fit Luna in next Tuesday" without naming grooming, daycare, or boarding. A mode-agnostic quick-find or quick-create is the glue.

### 1.3 Scope boundaries (what's in, what's out)

**In scope (scheduling):**
- Creating, modifying, rescheduling, cancelling bookings
- Placing and managing holds
- Managing the waitlist
- Creating and editing recurring bookings
- Creating blocked time for staff
- Safety checks at booking time (vaccination, behavior, compatibility)
- Multi-pet family bookings
- Meet-and-greet prerequisites
- Capacity visibility across modes

**Out of scope (professional view will own):**
- Checking pets in on arrival
- Starting / in-progress tracking
- Completing services
- Checking pets out at pickup
- Taking payment at check-out

The calendar still **displays** in-progress states (so the front desk knows a groom is live and not to interrupt). They just don't act on them.

---

## Part 2. Job stories

Format: *When [trigger], I want to [motivation], so I can [outcome].*

### Situational awareness
- **JS-01** When a parent calls about today, I want to see today's appointments with pet names, so I can answer without asking them to spell their name.
- **JS-02** When the phone rings, I want to see the day at a glance, so I can answer "can you fit us in today" without putting the caller on hold.
- **JS-03** When my manager asks how busy we are, I want to see capacity across staff and facilities, so I can answer without counting.
- **JS-04** When I'm looking at the calendar, I want to see what's happening right now versus what's upcoming, so I prioritize correctly.

### Finding a slot
- **JS-05** When I need to find a slot in the next few days, I want to scan multiple days quickly, so I can offer three or four options on a phone call.
- **JS-06** When I'm offering a slot, I want to see each staff member's availability side by side, so I can pick the right match without switching views.
- **JS-07** When a specific staff is requested, I want to filter to their column only, so I'm not distracted.
- **JS-08** When a caller doesn't know which service, I want a mode-agnostic search (any service, any day), so I don't force them to decide "grooming or daycare" first.

### Creating a booking
- **JS-09** When I need to book a multi-pet family, I want to create linked appointments across adjacent slots, so the family arrives and leaves together.
- **JS-10** When a parent hasn't paid yet, I want to place a tentative hold that looks different from a confirmed booking, so I don't oversell and don't lose the slot either.
- **JS-11** When a regular books the same slot every week, I want to create a recurring booking, so I don't rebuild it each week.
- **JS-12** When a first-time boarder books, I want the system to prompt a meet-and-greet prerequisite, so we don't accept a dog we've never met.

### Changing a booking
- **JS-13** When an appointment needs to move, I want to drag the block to a new time or staff, so rescheduling takes seconds.
- **JS-14** When a recurring booking needs a one-time change, I want to edit just that instance without breaking the series.
- **JS-15** When a recurring booking needs a permanent change, I want to edit the series from a given date forward.
- **JS-16** When a booking has to be cancelled, I want a reason code captured, so cancellations are meaningful data and not just a delete.

### Waitlist
- **JS-17** When a regular's preferred staff is fully booked, I want to add them to a waitlist with preferences (time window, days, staff), so I don't lose the booking.
- **JS-18** When a booking is cancelled, I want to see who's waitlisted for that slot, so I can offer it to them before opening it publicly.
- **JS-19** When I send a waitlist offer, I want the offer to expire automatically if not accepted, so the slot doesn't sit dead.
- **JS-20** When I view the calendar, I want to see the waitlist count for each day, so I know where demand is hottest.

### Safety and compatibility
- **JS-21** When I'm about to book a dog I know is reactive, I want a compatibility warning if incompatible pets are booked nearby, so I don't create a fight risk.
- **JS-22** When a pet is due or overdue for vaccinations, I want a warning at booking time, so we catch it before the pet arrives.
- **JS-23** When a pet has medical or behavioral notes, I want a preview in the popover so I don't have to open a separate profile.

### Capacity and blocks
- **JS-24** When the team is approaching capacity, I want the day header to show utilization, so I can decide whether to accept a walk-in call.
- **JS-25** When I need to block off time for a staff meeting, lunch, or sick day, I want to create an unavailable block, so nothing gets booked there.

### Daycare and boarding
- **JS-26** When a parent wants daycare for Tuesday, I want to enroll their pet in Tuesday's session, so the booking joins the roster and counts against capacity.
- **JS-27** When a parent books boarding, I want to assign a specific room for the date range, so the booking reflects real capacity.
- **JS-28** When I view a day, I want to see a daycare summary (pets enrolled / capacity) on the main calendar, so the day picture is complete without tabbing away.
- **JS-29** When I view a day with boarding, I want to see arrivals and departures surfaced, so I know turnover at a glance.

---

## Part 3. User stories

Format: *As a front desk, I want to [action], so that [reason].*

### 3.1 Cross-mode navigation
- See today's date prominently, and move day-by-day, so I can answer "tomorrow" questions fast.
- Jump to today from any date in one click.
- Pick any date from a date picker, so I can quote availability a month out.
- Switch Day / Week / Month views, so I can answer at multiple horizons.
- Refresh without losing position, so online bookings appear without disruption.
- Switch between Calendar, Daycare, and Boarding tabs cleanly.
- Use a mode-agnostic quick-find (search by parent, pet, or phone) from anywhere.

### 3.2 People grid (Calendar tab)
- See all staff as columns, with role (Groomer, Vet, Trainer) shown under the name.
- Scroll horizontally if more staff than fit.
- Filter to scheduled team versus all team.
- See a current-time indicator on today's view.
- See each booking as a block with time, pet name, parent name, service, and status color.
- See icons on the block for: notes, deposit paid, first visit, VIP, vaccination warning, behavior flag, medical alert, recurring, multi-pet link.
- See a day-header utilization indicator.
- See conflict treatment when two bookings overlap on the same staff.

### 3.3 Roster view (Daycare tab)
- See today's session(s) as cards (time, capacity, room, attendants).
- See each enrolled pet in the roster, with parent name, drop-off and pick-up windows, notes.
- Add a pet to a session with minimal friction.
- Remove a pet from a session.
- See capacity utilization (e.g., 14 / 20) with warning at near-capacity.
- Create a new session, or rely on a recurring template for weekly sessions.
- See the waitlist for full sessions.

### 3.4 Room grid (Boarding tab)
- See rooms as columns (or rows), days as the other axis.
- See each stay as a span across its date range.
- See turnover days clearly (pet A leaves, pet B arrives, same room).
- Book a room for a date range with availability checking.
- See a warning for incompatible overlaps or missing meet-and-greet for first-timers.
- See arrivals and departures expected per day.

### 3.5 Booking popover (shared across modes)
- See pet photo, pet name, breed, size, age at the top.
- See the pet parent name with tap-to-call and tap-to-text on the phone.
- See the service, staff (or session or room), date, time, duration.
- See status prominently (Tentative, Confirmed, Deposit paid, Waitlisted, On hold, In progress, Completed, Cancelled, No-show). Front desk only *acts on* the scheduling-relevant ones.
- See price, deposit status, balance due.
- See safety icons prominently (vaccination, behavior, medication, allergy).
- See consent forms status (required, filled, expired, pre-filled-from-record).
- See tags and relationship pills (first visit, regular, VIP, high spender).
- See a link to the pet's full profile.
- See "recurring booking" indicator with links to edit instance vs series.
- See linked bookings if part of a multi-pet family booking.
- Actions: Edit, Reschedule, Cancel (with reason), Duplicate, Add to waitlist, Send offer.

### 3.6 Creating a booking
- Click or tap an empty cell (people grid), or an Add button (daycare, boarding).
- Search for pet parent, with create-new fallback.
- Pick the pet from the parent's pets, or add a new pet.
- Pick the service (with breed-aware duration defaults).
- Assign staff (people grid), session (daycare), or room (boarding).
- Add multiple pets to one booking for family groups.
- Save as Tentative or Confirmed.
- Capture a deposit (optional but surfaced).
- Add notes.

### 3.7 Changing a booking
- Drag a block in the people grid to move in time or swap staff.
- Resize a block to change duration.
- Open the popover and edit any field.
- For recurring bookings, choose "this instance only" vs "this and future" vs "entire series" at edit time.
- Cancel with a reason code.

### 3.8 Waitlist
- Open a waitlist drawer or sidebar from the calendar.
- Add a parent and pet to the waitlist with preferences: preferred staff, days of week, time window, service, expiry date.
- When a slot opens, see matching waitlist entries suggested.
- Send a waitlist offer (text or email) with expiry.
- See status of open offers (sent, accepted, declined, expired).
- Auto-promote the next match if an offer expires.

### 3.9 Recurring bookings
- Create a recurring booking (weekly, biweekly, monthly, custom).
- Set end date or "no end."
- See recurring bookings marked with a distinct icon on every instance.
- Edit single instance, this-and-future, or entire series.
- Pause a series (skip N weeks) without deleting.

### 3.10 Blocked time
- Create blocked time on any staff column.
- Label it (Lunch, Break, Meeting, Training, Sick, Annual leave).
- Distinct visual treatment from bookings.
- Delete or edit blocked time.

### 3.11 Safety checks at booking time
- Warn at booking creation if vaccinations are overdue.
- Warn if a pet is first-time-boarding and no meet-and-greet is on file, with a shortcut to book one first.
- Warn if a reactive dog is being booked near an incompatible pet.
- Allow override with a reason (not blocking, but intentional).

---

## Part 4. UI element inventory

Full component list in the separate design-system spec (`cami-calendar-components.md`). What follows is a quick index.

### 4.1 Grid primitives
Time axis, staff column header, grid cell, current-time line, overflow arrow, stripe background (unavailable), capacity badge.

### 4.2 Booking primitives
Booking block, multi-day span block, blocked-time block, session card, room lane, stay span, link indicator, recurring indicator.

### 4.3 Popovers and sheets
Booking popover, blocked-time popover, creation sheet, edit-recurring-choice dialog, cancel-reason dialog.

### 4.4 Drawers and sidebars
Waitlist drawer, day-summary drawer.

### 4.5 Icons
Status, safety, relationship, metadata, communication, system, category (see component doc for the canonical set).

### 4.6 Tokens
Service-type colors (Vet, Grooming, Training, Daycare, Boarding), status overlays, safety accents, typography, spacing, elevation.

---

## Part 5. State matrix

### 5.1 Booking states (front desk acts on *scheduling-relevant* states only)

| State | Trigger | Visual | Front desk action | Pro view action |
|---|---|---|---|---|
| Tentative / hold | Created without full info or deposit | Dashed border, muted fill | Confirm, Collect deposit, Cancel | - |
| Confirmed | Parent confirmed (auto or manual) | Solid fill, status color | Reschedule, Cancel | Check in |
| Deposit paid | Deposit captured | Solid fill + card icon | Reschedule, Cancel | Check in |
| Waitlisted | Added to waitlist, not booked | Dashed, waitlist color | Send offer, Promote, Remove | - |
| On hold | Manual hold, reason attached | Striped fill | Release, Convert to booking | - |
| Checked in | Pet arrived | Saturated fill + check icon | *Observe only* | Start |
| In progress | Service started | Brighter fill + play icon | *Observe only* | Complete |
| Completed | Service done | Muted fill + check | *Observe only* | Check out, Payment |
| Checked out | Pet left | Muted + "out" icon | *Observe only* | - |
| Cancelled | Cancelled w/ reason | Strikethrough fill | Rebook, View reason | - |
| No-show | Past start, marked no-show | Red tint + x | Rebook, View reason | - |

### 5.2 Popover variants (scheduling-scope only)
1. Tentative popover (Confirm, Collect deposit, Edit, Cancel)
2. Confirmed popover (Reschedule, Edit, Cancel, Add tag)
3. Waitlisted popover (Send offer, Promote, Remove)
4. On-hold popover (Convert to booking, Release)
5. Recurring instance popover (with edit-scope picker)
6. Multi-pet linked popover (tabs or list per pet)
7. Read-only popover for states the pro view owns (checked in, in progress, completed, checked out)
8. Cancelled / no-show popover (reason, rebook)
9. Blocked-time popover (Edit label, Edit time, Delete)

### 5.3 Grid states
Empty (hover reveals +), loading (skeleton), conflict on same staff (offset + warning), intentional double-book (confirm dialog), staff off (stripe column), after-hours (lighter), today indicator (week view), capacity warning (near limit).

---

## Part 6. The tricky parts

### 6.1 Daycare session model

**Entities**
- **Session**: id, date, open time, close time, room, capacity, attendants.
- **Enrollment**: session id, pet id, parent id, drop-off window, pick-up window, status, notes.

**Rules**
- A daycare booking is an enrollment. It does not claim a staff column or a discrete time slot.
- Sessions are usually created from a recurring template (every weekday 7am-6pm).
- Capacity is room-based, not staff-based. An attendant-to-pet ratio may gate capacity.
- Cancellations free a slot; the waitlist fills it.

**On the main Calendar (people grid)**
- Daycare does **not** render as individual blocks per pet. That would clutter every column with twenty identical 7am-6pm bars.
- The day header shows a daycare summary pill: "Daycare: 14 / 20, Room A."
- Tapping the pill opens a peek into the Daycare tab for that day.

**In the Daycare tab**
- Session cards at top (one per session, usually one per day).
- Roster list below: pet, parent, drop-off window, pick-up window, notes, safety flags.
- Capacity meter visible. Color shifts green > amber > red as capacity fills.
- Add-pet shortcut from the session card.
- Waitlist panel for full sessions.

### 6.2 Boarding room model

**Entities**
- **Room**: id, name, type (run, suite, cat condo, meet-and-greet room), capacity (usually 1, sometimes 2 for shared stays), notes.
- **Stay** (the boarding booking): parent, pet, check-in date, check-out date, room assigned, add-ons (walks, meds, grooming add-on), notes.

**Rules**
- Stays are multi-day and span columns (or rows) in the room grid.
- Turnover is explicit: a departing stay and an arriving stay on the same room on the same day should be visually separable (color split, or left-half / right-half cells).
- First-time boarders require a completed meet-and-greet. System blocks booking without it, with override.
- Room compatibility is hard-gated for species (a cat condo is not for dogs).

**In the Boarding tab**
- Rows are rooms (or columns, your choice). Days are the other axis.
- Each stay shows as a span with pet name and room number.
- Arrival / departure counts in the day header for that column.
- Warning icons on stays with unmet prerequisites (missing vaccination, no meet-and-greet, expiring shots mid-stay).

**On the main Calendar (people grid)**
- Boarding does not render in staff columns (no individual-staff assignment at this granularity).
- A day-header summary: "Boarding: 8 in, 3 arriving, 2 departing."
- Boarding add-ons that do require a staff (e.g., a bath on day 3) render as normal bookings on the people grid.

### 6.3 Waitlist system

**Entities**
- **Waitlist entry**: parent, pet, service, preferred staff (optional), preferred window, earliest date, latest date, priority, expiry, notes, created-by.
- **Offer**: waitlist entry id, slot detail, sent timestamp, expiry timestamp, status (pending, accepted, declined, expired), channel (SMS, email).

**Rules**
- When a slot opens (cancellation, or new availability), match the waitlist by preferred staff, window, and service.
- Offers go out with an expiry (e.g., 2 hours). If not accepted, auto-promote the next match.
- Offers are exclusive at a given time (one offer per slot), unless you explicitly enable concurrent offers.
- Waitlist entries expire automatically if the latest-date passes.

**UI surfaces**
- **Waitlist drawer** on the calendar (toggle icon in the top bar). Shows all entries, filterable by date range, service, staff.
- **On cancel**, a confirmation modal offers "send to waitlist matches" with pre-selected candidates.
- **Open offers tracker** (badge on the drawer toggle shows open offers awaiting response).

### 6.4 Recurring bookings

**Rules**
- Patterns: weekly, biweekly, monthly (by day of month or by ordinal: "first Tuesday"), custom.
- End behavior: ends on date, ends after N occurrences, or open-ended.
- Edit scopes: single instance, this-and-future, entire series.
- Pause: skip the next N occurrences (goes to lunch for a month).
- Deletion: delete this instance, this-and-future, or entire series.

**UI behaviors**
- Distinct recurring icon on every instance block.
- Edit-scope picker appears whenever a recurring instance is modified.
- Series summary in the popover (e.g., "Weekly, Tuesdays 10am, since Jan 2026").
- A pause action visible in the popover's overflow menu.

---

## Part 7. Gap analysis against your current prototype

Based on the screens you shared (petverse-nine.vercel.app).

### 7.1 What's working
- **Pet-forward naming.** Pet name is the title of the popover. Correct for pet businesses.
- **Service-type color coding.** Vet vs Grooming distinction in the legend is more useful than Fresha's status-only coloring.
- **Consent forms as first-class.** "Forms Required" badge with per-form fill-out is a pet-industry-specific move Fresha doesn't have.
- **Separate nav for modes.** Calendar, Daily Ops, Boarding, Daycare in the left nav anticipates the three-mode reality.
- **Clear role labels under staff.** Veterinarian, Senior Groomer, Boarding Attendant shown under names. Useful for multi-discipline teams.
- **Restrained visual system.** Clean and legible. Easy foundation to build on.

### 7.2 Gaps to close

| # | Gap | Story not yet served | Fix |
|---|---|---|---|
| 1 | No pet photo in popover or block | JS-22, 3.5 (pet photo) | Add a circular thumbnail to the popover header. Pet name stays the title. |
| 2 | Owner buried under Employee in the hierarchy | 3.5 (owner visibility) | Promote Owner above Employee. For scheduling, the parent is who you call. |
| 3 | No safety preview (vaccinations, behavior, medications, allergies) | JS-21, 22, 23 | Add a safety icon row under the pet name. Red badge if any are overdue or flagged. |
| 4 | No tap-to-call or tap-to-text on the phone number | 3.5 | Make phone number interactive, with call and text affordances. |
| 5 | No tags or relationship pills | JS-20 (waitlist), 3.5 | Add first-visit, VIP, regular, high-spender pills near the title. |
| 6 | No recurring booking indicator | JS-11, 14, 15 | Icon on the block + "Series: weekly, Tuesdays 9am" in the popover with "edit series" option. |
| 7 | No waitlist surface | JS-17, 18, 19, 20 | Add a waitlist drawer triggered from the calendar top bar. |
| 8 | No deposit / balance visibility | 3.5 | Show price, deposit status, balance due in the popover. |
| 9 | Status is minimal (only Confirmed) | 3.5, 5.1 | Expand to the full state set: Tentative, Confirmed, Deposit paid, Waitlisted, On hold, etc. Front desk acts only on scheduling-relevant ones. |
| 10 | Conflict color is in the legend but undefined | 5.3 | Define what counts: same staff double-booked, pet-on-pet incompatibility, overbooked room. Different warnings, different treatments. |
| 11 | No day-level capacity indicator | JS-24 | Utilization pill in the day header (people grid). Capacity meter (daycare). Arrivals / departures count (boarding). |
| 12 | Consent forms re-prompt every booking? | Open question | Pre-fill from pet record if valid. Only prompt if expired or service-specific. |
| 13 | Primary action "Mark as Completed" is in the front desk popover | Scope conflict | Completion is a professional-view action. Remove from front desk. |
| 14 | Meet-and-greet gate not visible | JS-12 | Show "meet-and-greet required" warning when creating boarding for a new pet. |
| 15 | No linked multi-pet family booking | JS-09 | Show a "2 pets" badge on linked blocks, tabs or list in the popover. |
| 16 | No mode-agnostic quick-find | 3.1 | Add a search that returns across grooming, daycare, boarding by parent / pet / phone. |

---

## Part 8. Open questions to resolve before shipping

1. **Consent forms**, fresh per booking or carry from pet record (with expiry)?
2. **Deposit on tentative holds**, capture or not?
3. **Meet-and-greet**, hard gate or soft warning?
4. **Conflict definition**, which overlaps count, and which are allowed with confirm?
5. **Pet-on-pet compatibility**, does Cami store pet relationships (friends, enemies, housemates) and use them at booking time? Category-defining feature if yes.
6. **Staff specializations**, warn on breed-mismatched groomer assignment?
7. **Recurring edit scope default**, should the default be "this instance" or "this and future"? One is safer, the other is faster.
8. **Daycare drop-off windows**, are they enforced (offer two 30-minute windows) or guidance-only?
9. **Boarding turnover treatment**, cleanup time blocked between departures and arrivals?
10. **Waitlist concurrency**, one active offer per slot or multiple concurrent (first-accept-wins)?
11. **Online bookings**, do they land as Tentative, Confirmed, or Deposit-paid by default?
12. **Calls and texts**, logged against the booking record? (Probably yes, design the hook.)
13. **Vaccinations mid-stay**, warn at booking time if shots expire during a boarding range?
14. **Time zones**, ignore for now or design for multi-location businesses?
15. **Walk-ins with no appointment**, a quick-add path that lands in People grid now?

---

## Appendix. What we're explicitly not designing yet

- Check-in and check-out flows (professional view)
- In-progress status tracking (professional view)
- Payment capture at check-out (professional view)
- Daily Ops view (separate surface, not the calendar)
- Client profile screens (linked from popover, not designed here)
- Reporting and analytics (separate workstream)
