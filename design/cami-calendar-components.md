# Cami Calendar: Component Library Spec

A shipping-grade component inventory for the Cami calendar surface. Companion to `cami-calendar-teardown.md`.

> **How to read this doc.** Components are organized by scale: tokens, primitives, atoms, molecules, organisms. Each component has the same template (Purpose, Anatomy, Variants, States, Interactions, Accessibility, Related), so you can skim or go deep. ASCII anatomy diagrams show layout, not visual style. The point is structure, not skin.

> **Design-thinking prompts** are called out inline in blockquotes. They're questions to interrogate as you move from this spec into Figma. Don't skip them. The spec is a scaffold; the decisions are where the design lives.

---

## Table of contents

1. Design tokens
2. Icons (inventory)
3. Primitives (Pill, Avatar, Badge, Safety Badge, Chip, Swatch, Meter)
4. Atoms (BookingBlock, BlockedTimeBlock, SessionCard, RoomSpan, GridCell, StaffColumnHeader, TimeAxis, CurrentTimeIndicator, CapacityIndicator, DayNavigator, ModeTabs, DayHeader, ConflictMarker, LinkIndicator)
5. Molecules (BookingPopover, BlockedTimePopover, CreationSheet, EditRecurringDialog, CancelReasonDialog, WaitlistEntryCard, WaitlistOfferCard)
6. Organisms (CalendarGrid, RosterView, RoomGrid, WaitlistDrawer, DaySummaryDrawer, QuickFind)
7. Composition patterns
8. Accessibility requirements
9. Motion and interaction principles
10. What to build first (staged sequence)

---

## 1. Design tokens

Tokens are the most copied, least audited part of most design systems. Get them right first. Every block, pill, and border below pulls from this table.

### 1.1 Service-type colors

Used as the primary hue on booking blocks. Not for status. Status is an overlay, not a hue.

| Token | Intent | Usage |
|---|---|---|
| `service/vet` | Medical services | Vet appointments, vaccinations, medication administration |
| `service/grooming` | Grooming services | Full groom, bath, nails, teeth |
| `service/training` | Training services | Obedience, behavior, puppy class |
| `service/daycare` | Daycare summary pill and tab accents | Main calendar daycare summary, daycare tab accent |
| `service/boarding` | Boarding summary pill and tab accents | Main calendar boarding summary, boarding tab accent |
| `service/addon` | Add-ons attached to a stay | Grooming during boarding, extra walks |

> **Design prompt.** Fresha uses status-driven color (booked, arrived, completed). You've chosen service-type color. What's the trade? Service-type color wins on "what kind of day is this", loses on "who's arrived". Your overlays have to do work status used to do. Is the overlay system strong enough? Test by squinting at the grid from six feet back.

### 1.2 Status overlays

Overlays ride on top of the service-type hue. They're visual modifiers, not color replacements.

| Token | Visual treatment | Applied to |
|---|---|---|
| `status/tentative` | 2px dashed border, 60% fill opacity | Tentative bookings, holds |
| `status/confirmed` | Solid fill, 1px border, full opacity | Confirmed bookings |
| `status/deposit` | Confirmed + deposit icon chip | Bookings with a deposit captured |
| `status/waitlisted` | Dashed border + diagonal stripe, muted hue | Waitlist offers (surfaced in the drawer) |
| `status/onhold` | Diagonal stripes over base fill | Manual holds |
| `status/inprogress` | Saturated fill + play glyph (read-only badge) | States owned by pro view |
| `status/completed` | Desaturated to 40%, check glyph | States owned by pro view |
| `status/cancelled` | Strikethrough overlay, 30% opacity | Cancelled |
| `status/noshow` | Red tint on fill, x glyph | No-shows |

### 1.3 Safety accents

Safety is a separate layer from service and status. It must read on any booking.

| Token | Use |
|---|---|
| `safety/critical` | Vaccinations overdue, reactive-dog near-miss, missing meet-and-greet on boarding |
| `safety/warning` | Vaccinations due soon, consent form expired, first visit without profile review |
| `safety/info` | First visit, medication schedule, special instruction |

> **Design prompt.** Safety must be legible when the block is 60px tall and the pet name is already fighting for space. Rule: safety gets a single glyph on the block (critical only). Warning-level shows in the popover. Discuss.

### 1.4 Typography

| Token | Size / line / weight | Use |
|---|---|---|
| `type/block-title` | 13 / 16 / 600 | Pet name on booking block |
| `type/block-meta` | 11 / 14 / 400 | Service and parent on block |
| `type/popover-title` | 20 / 24 / 600 | Pet name in popover header |
| `type/popover-label` | 11 / 14 / 500 uppercase tracked | "Owner", "Services", "Pet Info" |
| `type/popover-body` | 14 / 20 / 400 | Values and details |
| `type/column-header` | 13 / 16 / 500 | Staff name in column header |
| `type/column-subhead` | 11 / 14 / 400 | Role under staff name |
| `type/axis-label` | 11 / 14 / 400 tabular | Time-axis labels |
| `type/badge` | 11 / 14 / 600 | Pills, capacity meters |

### 1.5 Spacing

Use a 4px base grid. Calendar grids use a 15-minute = 16px vertical unit by default (user-configurable to 30m = 16px).

| Token | px | Use |
|---|---|---|
| `space/1` | 4 | Inside pills, icon gutter |
| `space/2` | 8 | Block internal padding |
| `space/3` | 12 | Popover section gap |
| `space/4` | 16 | Popover padding, grid row height |
| `space/6` | 24 | Section separators |
| `space/8` | 32 | Column width slack |
| `grid/slot-height` | 16 default, 32 configurable | Vertical unit per 15m |
| `grid/column-width` | 160-220 fluid | Staff column |

### 1.6 Elevation

| Token | Shadow |
|---|---|
| `elev/block` | 0 0 0 1px inner border, no shadow |
| `elev/block-hover` | 0 1px 2px rgba(0,0,0,.06) |
| `elev/popover` | 0 8px 24px rgba(0,0,0,.12), 0 0 0 1px border |
| `elev/drawer` | 0 -4px 16px rgba(0,0,0,.08) |
| `elev/sheet` | 0 12px 32px rgba(0,0,0,.16) |

### 1.7 Motion

| Token | Duration / easing | Use |
|---|---|---|
| `motion/pop` | 120ms / ease-out | Popover open |
| `motion/drag` | 0ms | Live follow |
| `motion/snap` | 160ms / ease-out | Block snaps to slot after drop |
| `motion/tabs` | 200ms / ease | Mode tab switch |
| `motion/drawer` | 240ms / ease-out | Drawer slide |

---

## 2. Icons

A canonical set. One glyph per concept. If a glyph serves two concepts, retire one.

### 2.1 Status icons (shown on block or popover)

- `check-circle` — confirmed
- `card` — deposit paid
- `clock-dashed` — tentative / hold
- `clock-stripes` — on hold
- `play` — in progress (read-only)
- `check` — completed (read-only)
- `arrow-out` — checked out (read-only)
- `x-circle` — cancelled
- `x-triangle` — no-show

### 2.2 Safety icons

- `shield-x` — vaccination overdue (critical)
- `shield-clock` — vaccination due soon (warning)
- `paw-warning` — behavior flag
- `pill` — medication
- `allergy` — allergy flag
- `stethoscope` — medical note
- `handshake` — meet-and-greet required

### 2.3 Relationship / metadata icons

- `star` — VIP
- `sparkle` — first visit
- `heart` — regular
- `refresh` — recurring booking
- `link` — linked / multi-pet family booking
- `note` — has notes
- `doc` — consent form required
- `doc-check` — consent form filled

### 2.4 Communication icons

- `phone` — call
- `message` — SMS
- `mail` — email

### 2.5 System icons

- `plus` — create
- `search` — quick find
- `filter` — filter
- `chevron-left` / `chevron-right` — navigation
- `calendar` — date picker trigger
- `more` — overflow menu
- `drag` — drag handle (6-dot)
- `close` — dismiss
- `edit` — edit entry

### 2.6 Category icons (for service-type chips)

- `paw-scissor` — grooming
- `paw-heart` — vet
- `paw-graduate` — training
- `paw-sun` — daycare
- `paw-bed` — boarding

> **Design prompt.** 26 icons is a lot to draw. The minimum viable set is status (2-3), safety (2), and the category icons. Everything else can start as text or a pill. Consider launching with the minimum and adding as you confirm real need from pilot users.

---

## 3. Primitives

The smallest reusable pieces. No logic, no state beyond visual.

### 3.1 Pill

```
┌─────────────────┐
│  Label          │
└─────────────────┘
```

**Purpose.** Compact label for tags, statuses, and roles. Not a button unless explicitly specified.

**Anatomy.** Fill, border, label. Optional leading icon (12px). Optional trailing dismiss (10px).

**Variants.**

- `pill/role` — "Groomer", "Vet". Neutral fill, no border.
- `pill/relationship` — "VIP", "First visit", "Regular". Accent fill.
- `pill/status` — "Tentative", "Deposit paid". Status overlay fill.
- `pill/service` — "Full groom", "Vaccination". Service-type tinted fill.
- `pill/capacity` — "14 / 20". Tabular numerals.

**States.** Default, hover (for interactive pills only), disabled.

**Accessibility.** Sufficient contrast against fill. For removable pills, the dismiss button has an explicit label.

**Related.** Chip, Badge.

### 3.2 Avatar

**Purpose.** Visual identity for pet, parent, or staff.

**Anatomy.** Circular container, image or initials fallback. Optional status dot (top-right), optional ring (safety-critical red ring).

**Variants.**

- `avatar/pet` — pet photo. Size tokens: xs 20, sm 24, md 32, lg 48, xl 64.
- `avatar/parent` — initials default.
- `avatar/staff` — in staff column header.

**States.** Default, loading (skeleton), missing (initials with muted fill), ring-highlighted (when safety critical).

**Interactions.** Click avatar in popover opens the pet or parent profile.

**Accessibility.** Alt text of pet name + breed. Decorative avatars in lists inherit label from row.

### 3.3 Badge

**Purpose.** Tiny numeric or dot indicator layered on a parent element.

**Anatomy.** Small circle or rounded rect, optional number.

**Variants.** Dot only (presence), number (count up to 99+), color-coded (critical, warning, info).

**Related.** Safety Warning Badge (below).

### 3.4 SafetyWarningBadge

**Purpose.** Raises a single critical safety concern to a glance-readable glyph.

**Anatomy.** Icon (12 or 14px) with colored ring or fill. Optional count for multiple concerns.

**Variants.** `critical`, `warning`, `info`.

**States.** Default, hover (tooltip shows which concern).

**Accessibility.** Tooltip content also exposed as `aria-label`. Never icon-only without text equivalent.

### 3.5 Chip

**Purpose.** Selectable option (filter chip, service picker chip). Stateful, unlike Pill.

**Variants.** Single-select, multi-select.

**States.** Default, hover, selected, disabled.

### 3.6 Meter

**Purpose.** Numeric capacity with color-state.

**Anatomy.** Value label (e.g. "14 / 20"), bar track, bar fill. Optional icon.

**Variants.**

- `meter/horizontal` — in day headers.
- `meter/compact` — pill form for narrow spaces.

**States.** Green (< 70%), amber (70-90%), red (>= 90%), overfill (red with indicator).

### 3.7 Swatch (in legend)

Solid rect with service-type token applied. Used in a visible legend strip.

---

## 4. Atoms

Calendar-specific building blocks. Composed from primitives.

### 4.1 BookingBlock

The most important atom in the system.

```
┌─────────────────────────────┐
│ 🐾 Luna • [↻]          ⚠  │  ← title row
│ Full Groom                 │  ← service
│ J. Smith • 10:00-11:30     │  ← parent + time
└─────────────────────────────┘
```

**Purpose.** Represents a single booking on the people grid.

**Anatomy.**
- Fill color: service-type token
- Overlay: status token (border, stripes, opacity)
- Title row: pet name (13/16/600) + recurring icon (if recurring) + safety badge (if critical)
- Meta row 1: service name
- Meta row 2: parent name + time range
- Optional badges on the right edge: link icon (multi-pet), deposit icon

**Variants.**

- `block/standard` — 60+ minute appointment, all rows visible
- `block/compact` — 30-60 minute, drops parent name or compresses
- `block/micro` — <30 minute, pet name + service only, truncated
- `block/linked` — part of a multi-pet family booking, link icon on left edge
- `block/recurring` — recurring icon on title row
- `block/conflict` — offset right with yellow conflict outline

**States.**

- Default
- Hover (elev/block-hover, cursor pointer)
- Selected (blue ring, popover anchored)
- Dragging (60% opacity, cursor grabbing, ghost at origin)
- Resizing (bottom edge highlighted, live duration label)
- Loading (skeleton fill)
- Error (red border, system message in popover)

**Interactions.**

- Click: open popover
- Drag: move to new time / staff (snaps to grid/slot-height)
- Resize from bottom edge: change duration
- Right-click: context menu (Reschedule, Cancel, Duplicate, Add to waitlist)
- Keyboard: arrow keys move selection, enter opens popover, delete triggers cancel flow

**Accessibility.**
- Role: `button` with descriptive label ("Luna, Full Groom with J. Smith, 10 to 11:30, Confirmed")
- Status conveyed in accessible name, not color alone
- Focus ring visible at 3:1 contrast

**Related.** GridCell, BookingPopover, BlockedTimeBlock.

> **Design prompt.** The 60px-tall block fights for 5+ pieces of information. Prioritize ruthlessly. My pick: pet name, safety, service, parent. Time is redundant (the grid shows it). Recurring icon earns its keep by predicting future edits. Challenge this order. What would you cut first if a block has to work at 40px?

### 4.2 BlockedTimeBlock

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓ Lunch              ▓
▓ 12:00-13:00        ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

**Purpose.** Non-booking time (lunch, break, meeting, PTO, sick).

**Anatomy.** Diagonal stripe fill, label (Lunch / Meeting / Sick), time range.

**Variants.** `blocked/lunch`, `blocked/meeting`, `blocked/training`, `blocked/pto`, `blocked/sick`, `blocked/custom`.

**States.** Default, hover, selected, editing.

**Interactions.** Click opens BlockedTimePopover. Drag to move. Not resizable on free-form blocks unless explicitly needed.

**Accessibility.** Non-interactive to keyboard booking flows. Labeled as "Blocked time, Lunch, 12 to 1".

### 4.3 SessionCard (Daycare tab)

```
┌───────────────────────────────────────┐
│ Tuesday Daycare                        │
│ 7:00 AM - 6:00 PM • Room A             │
│ ━━━━━━━━━━━━━━━━━━━━━━  14 / 20      │
│ Attendants: Sam, Riley      [+ Add pet]│
└───────────────────────────────────────┘
```

**Purpose.** Summary of a daycare session. Hosts the roster.

**Anatomy.** Title, time range, room, capacity meter, attendants, add-pet action, roster list (below).

**Variants.** `session/open`, `session/near-capacity`, `session/full`, `session/closed`.

**States.** Default, editing, hover on roster row.

### 4.4 RoomSpan (Boarding tab)

```
[----Buddy (S. Lee)----]
Apr 18 → Apr 22
```

**Purpose.** Multi-day stay on the room grid.

**Anatomy.** Horizontal span across date cells, pet name, optional parent, start / end pips, safety badge.

**Variants.** `span/confirmed`, `span/tentative`, `span/turnover-day` (split cell with incoming / outgoing), `span/meet-and-greet-required`.

**States.** Default, hover, selected, editing endpoints (drag left / right).

### 4.5 GridCell

**Purpose.** Empty slot target in the people grid.

**Anatomy.** Invisible by default. On hover, a + affordance appears. On focus, a 2px dashed outline.

**States.** Default, hover, focus, busy (contains a block), unavailable (stripe column when staff off), after-hours (lighter fill).

**Interactions.** Click to open CreationSheet prefilled with staff and start time.

### 4.6 StaffColumnHeader

```
┌─────────────────┐
│ [👤] Sarah K.   │
│      Groomer    │
└─────────────────┘
```

**Purpose.** Identifies a staff column in the people grid.

**Anatomy.** Avatar, name, role, optional utilization pill (8 bookings / 10 slots).

**Variants.** Default, unscheduled (muted), today-off (stripe).

### 4.7 TimeAxis

**Purpose.** Vertical time reference on the left of the grid.

**Anatomy.** Labeled hour marks (bold), 15/30 minute sub-lines (muted). Tabular numerals.

**States.** Default, scrolling-fixed.

### 4.8 CurrentTimeIndicator

**Purpose.** A horizontal line + dot showing right-now on today's grid.

**Anatomy.** 2px solid line across grid, filled circle on the time axis with current HH:MM label.

**Variants.** Visible only on day-view-of-today or week-view-including-today.

### 4.9 CapacityIndicator

See Meter (3.6). Variants: day-header (people grid), session-card (daycare), room-count (boarding).

### 4.10 DayNavigator

```
[<]  Monday Apr 20, 2026  [>]    [Today]   [Date picker]
```

**Purpose.** Move through dates.

**Anatomy.** Prev button, date label, next button, today button, optional date picker.

### 4.11 ModeTabs

```
 Day | Week | Month
```

**Purpose.** Switch view horizon.

**States.** Default, selected, hover, focus. Keyboard: arrow keys move within the group.

### 4.12 DayHeader (people grid)

```
 Monday 20                          Daycare: 14/20    Boarding: 8 in, 3↓ 2↑
```

**Purpose.** Per-day summary strip above the grid. Carries the context that doesn't belong inside columns.

**Anatomy.** Day label, daycare summary pill, boarding summary pill, utilization pill.

**Interactions.** Click daycare pill to peek at Daycare tab. Click boarding pill to peek at Boarding tab. Peek opens as a temporary drawer, not a full tab switch.

> **Design prompt.** The day header is where the three-mode architecture earns its keep. A front desk person on a call says "can you fit Luna tomorrow". If the day header shows grooming has slots, daycare is full, and boarding has three arrivals, the answer comes without tabs. Design the pill-to-peek interaction with this in mind.

### 4.13 ConflictMarker

**Purpose.** Flag overlapping blocks on the same staff column.

**Anatomy.** Small warning glyph in the top-right corner of offset blocks, yellow border on both.

**Variants.** `conflict/soft` (warn, allow confirm), `conflict/hard` (block creation, for room collision).

### 4.14 LinkIndicator

**Purpose.** Mark multi-pet family bookings.

**Anatomy.** A small link glyph on the left edge of each linked block, optional hairline connecting line drawn between blocks if they're adjacent.

**Interactions.** Click opens the linked popover (tabs per pet).

---

## 5. Molecules

Composed from atoms and primitives. Own layout and interaction patterns.

### 5.1 BookingPopover

The surface the front desk spends the most eye-time on. Worth over-investing here.

```
┌─────────────────────────────────────────┐
│ [photo]  Luna                    [x]    │  ← header
│          Golden Retriever • Large • 4y  │
│          ⚠ Vax due    ★ VIP   ♻ Weekly  │  ← flags
├─────────────────────────────────────────┤
│ OWNER                                    │
│ Jane Smith                               │
│ 📞 (555) 123-4567    ✉ jane@...         │
├─────────────────────────────────────────┤
│ BOOKING                                  │
│ Full Groom • Sarah K.                    │
│ Mon Apr 20 • 10:00-11:30                 │
│ Status: Confirmed • Deposit: $25 paid    │
├─────────────────────────────────────────┤
│ NOTES                                    │
│ Reactive with other large dogs. Crate   │
│ dry, not in line of sight.               │
├─────────────────────────────────────────┤
│ CONSENT                                  │
│ [✓] General waiver  [✓] Vaccination proof│
├─────────────────────────────────────────┤
│ [ Edit ] [ Reschedule ] [ Cancel ▾ ]     │
│                            [ More ▾ ]    │
└─────────────────────────────────────────┘
```

**Purpose.** Single-booking detail and primary scheduling actions.

**Anatomy.**

1. **Header.** Avatar, pet name (title), breed/size/age subline, relationship + safety + recurring flags.
2. **Owner block.** Parent name, tap-to-call phone, tap-to-message phone, email.
3. **Booking block.** Service, staff/session/room, date, time, duration, status, deposit status, balance due.
4. **Notes.** Freeform pet notes, medication schedule if any.
5. **Consent.** Per-form status (required / filled / expired), pre-filled indicator.
6. **Tags row.** First visit, VIP, etc. (shown in header too, duplicated is ok).
7. **Linked pets** (if multi-pet). Tabs or a list at the top of the booking block.
8. **Actions row.** Primary: Edit, Reschedule, Cancel (with dropdown for reasons). Overflow: Duplicate, Add note, Add to waitlist, Mark no-show, Pause series (if recurring).

**Variants.** (Also listed in teardown 5.2)

- `popover/tentative` (primary: Confirm, Collect deposit)
- `popover/confirmed` (primary: Reschedule)
- `popover/waitlisted` (primary: Send offer)
- `popover/onhold` (primary: Convert to booking)
- `popover/recurring-instance` (edit scope picker appears on Edit)
- `popover/multi-pet` (tabs or list)
- `popover/read-only` (pro-view states: checked in, in progress, completed, checked out)
- `popover/cancelled` (primary: Rebook)

**States.** Opening, open, loading booking detail, network error (retry), action in-flight (button disabled + spinner).

**Interactions.**

- Open: click block or keyboard enter
- Close: Esc, click outside, click x
- Edit: opens CreationSheet in edit mode
- Reschedule: inline drag handle plus text fields
- Cancel: opens CancelReasonDialog
- Edit on a recurring instance: opens EditRecurringDialog first

**Accessibility.** Focus trap on open, return focus to origin on close. All actions reachable by keyboard. Status announced via `aria-live`.

### 5.2 BlockedTimePopover

**Purpose.** Edit or delete a blocked time entry.

**Anatomy.** Label, time range, repeat (if recurring), actions (Edit, Delete).

### 5.3 CreationSheet

```
┌─────────────────────────────────────────┐
│ New booking                      [x]     │
├─────────────────────────────────────────┤
│ PARENT                                   │
│ [ Search or add new          ▾ ]         │
│                                          │
│ PET                                      │
│ [ Luna (Golden Retriever) ▾ ] [+ new ]   │
│                                          │
│ SERVICE                                  │
│ [ Full Groom  ▾ ]  Duration: 90m         │
│                                          │
│ ASSIGN                                   │
│ Staff: [ Sarah K. ▾ ]                    │
│ Start: [ Mon Apr 20, 10:00 ▾ ]           │
│                                          │
│ DEPOSIT (optional)                       │
│ [ $25 ]   [ Collect now ]                │
│                                          │
│ REPEAT                                   │
│ [ Does not repeat  ▾ ]                   │
│                                          │
│ NOTES                                    │
│ [                                    ]   │
├─────────────────────────────────────────┤
│ ⚠ Luna's vaccinations expire May 3.      │
│ ⚠ No meet-and-greet on file for boarding.│
├─────────────────────────────────────────┤
│ [ Save as Tentative ] [ Confirm booking ]│
└─────────────────────────────────────────┘
```

**Purpose.** Create a new booking, or edit an existing one.

**Anatomy.**

1. Parent picker (search, fuzzy, with "add new" fallback)
2. Pet picker (filtered to parent's pets, "add new" fallback)
3. Service picker (breed-aware duration defaults)
4. Assignment (staff / session / room, auto-branches by service type)
5. Deposit (optional)
6. Repeat (dropdown with weekly / biweekly / monthly / custom / none)
7. Notes
8. **Safety preflight row.** Warns before save for vaccinations, missing meet-and-greet, conflicts, breed-staff mismatch
9. Actions: Save as Tentative, Confirm booking (primary). Also Cancel.

**Variants.** `sheet/people-grid` (default), `sheet/daycare` (session picker replaces staff), `sheet/boarding` (room picker, date range).

**States.** Empty, partially filled, validation errors, conflict warning, saving, saved.

**Interactions.** Inline validation, warning before save, soft block if hard-gated safety (species mismatch).

> **Design prompt.** Your current prototype seems to run a forms-first flow. Consider a calendar-first flow where clicking a grid cell prefills staff + start + duration and drops the sheet into the rest of the form. The difference shows up when creating 12 bookings in a row on a Monday morning.

### 5.4 EditRecurringDialog

```
┌───────────────────────────────────┐
│ Edit recurring booking             │
├───────────────────────────────────┤
│ Luna, Weekly Tuesdays 10:00        │
│ Since Jan 13, 2026                 │
│                                    │
│ ( ) This instance only             │
│ ( ) This and future instances      │
│ ( ) Entire series                  │
│                                    │
│ [ Cancel ]           [ Continue ]  │
└───────────────────────────────────┘
```

**Purpose.** Disambiguate the scope of edits on recurring bookings.

**Variants.** Also used for Delete on recurring instances.

**Accessibility.** Radio group with clear labels. Default selection is the safer option (single instance).

### 5.5 CancelReasonDialog

**Purpose.** Capture a cancellation reason. Cancellations without reasons are lost signal.

**Anatomy.** Required reason picker (parent cancel, business cancel, weather, pet sick, no-show, other), optional free text, send-notification toggle, trigger-waitlist-offer toggle.

**States.** Default, submitting, confirmation of waitlist offer sent.

### 5.6 WaitlistEntryCard

**Purpose.** A single waitlist entry in the drawer.

**Anatomy.** Pet avatar, pet name, parent, preferred service, preferred staff, preferred window, expiry. Actions: Send offer, Edit, Remove.

**States.** Pending, offer-sent (chip shows "Offer pending (1h 23m)"), accepted, expired.

### 5.7 WaitlistOfferCard

**Purpose.** A live offer the front desk has sent.

**Anatomy.** Target slot detail, channel (SMS / email), countdown, status.

**States.** Sending, sent / pending, accepted, declined, expired.

---

## 6. Organisms

The surfaces. Compose molecules and atoms into the things users see.

### 6.1 CalendarGrid (people grid)

```
          Sarah K.     Ben T.       Riley L.
          Groomer      Vet          Boarding Att.
        ┌──────────┬──────────┬──────────┐
8:00    │          │ [RoomCheck]│          │
        │          │  Max, vax  │          │
9:00    │ [Luna    │────────────│          │
        │  groom]  │            │ ▓Lunch▓ │
10:00   │──────────│            │ ▓▓▓▓▓▓  │
        │          │ [Cooper    │          │
11:00   │          │  vaccine]  │          │
        └──────────┴──────────┴──────────┘
```

**Purpose.** Primary calendar for 1:1 services.

**Anatomy.** DayHeader (top), TimeAxis (left), StaffColumnHeaders (top row), grid of cells, blocks and blocked-time positioned by time and staff, CurrentTimeIndicator on today.

**Variants.** Day view, week view (staff columns repeat per day or collapse by day depending on staff count), month view (heatmap by day).

**States.** Default, loading (skeleton columns), empty (onboarding state), filtered (subset of staff visible with filter indicator).

**Interactions.**

- Scroll horizontally / vertically
- Click empty cell: create
- Click block: select + popover
- Drag block: reschedule
- Drag on empty cells: create-by-drag (pre-fills duration)

### 6.2 RosterView (Daycare tab)

**Purpose.** The canonical daycare day.

**Anatomy.** DayNavigator, SessionCard(s), roster list under each session (columns: pet, parent, drop-off window, pick-up window, notes, safety, actions), waitlist section.

**Interactions.** Add pet from session card. Remove from row. Reorder is not typically needed.

### 6.3 RoomGrid (Boarding tab)

**Purpose.** The canonical boarding view.

**Anatomy.** Rows = rooms (with room type badge), columns = days (7 or 14 default window), RoomSpan atoms plotted across ranges. Day column headers show arrivals / departures count.

**Variants.** 7-day, 14-day, 30-day (condensed).

**Interactions.** Drag endpoints to extend / shorten stay. Click span to open popover. Click empty cell-range to create.

### 6.4 WaitlistDrawer

**Purpose.** Waitlist management overlay from the calendar.

**Anatomy.** Header (count, filters), list of WaitlistEntryCards, separator, open offers list (WaitlistOfferCards), add-entry button.

**States.** Open, closed, filtering, offer in-flight.

**Interactions.** Toggle from top-bar icon. Send offer from any entry. Offer status updates live.

### 6.5 DaySummaryDrawer

**Purpose.** A "peek" into non-active modes without leaving the current tab.

**Anatomy.** Tabs: People grid summary, Daycare summary, Boarding summary. Each a compact read-only view for the selected day.

**States.** Open, closed.

**Interactions.** Opens from DayHeader pills.

### 6.6 QuickFind

```
┌──────────────────────────────────────┐
│ 🔍 Search anyone, anywhere            │
├──────────────────────────────────────┤
│ "luna"                                │
│ ──────────────────                    │
│ RESULTS                               │
│ 🐾 Luna (Smith) • Grooming • Tue 10:00│
│ 🐾 Luna (Brown) • Daycare  • enrolled │
│ 🐾 Luna Bell (Park) • Boarding • Apr 20-22│
└──────────────────────────────────────┘
```

**Purpose.** Mode-agnostic search by pet, parent, or phone. JS-08, the unnamed hero of the front desk.

**Anatomy.** Input, grouped results (by service type), selectable row, each row shows pet + parent + context + next upcoming.

**Interactions.** Up / down to navigate, enter to open popover of the next upcoming, or command-return to open creation sheet prefilled from the parent.

---

## 7. Composition patterns

### 7.1 Block density tiers

A block's content tier depends on rendered height:

| Height | Shown |
|---|---|
| >= 80px | Title, service, parent + time, all icons |
| 60-80px | Title, service, parent or time (pick one), safety + recurring icons only |
| 40-60px | Title, service, safety icon only |
| <40px | Title only, tooltip on hover |

### 7.2 Safety precedence

Only one safety glyph visible on a block:

Critical > Warning > Info.

All concerns list in the popover. Never stack multiple safety glyphs on the block itself.

### 7.3 Status overlay precedence

Status overlay wins over service-type color in contrast, but hue is the service. Example: a cancelled grooming booking is grooming-hued, desaturated, with a strikethrough and x glyph. A reader still sees "grooming" first, "cancelled" second. Debate this order.

### 7.4 Popover versus sheet

- **Popover** for reading and light action. Anchored to the origin.
- **Sheet** for creation and multi-field edit. Takes the screen seriously.

### 7.5 Empty states

Each organism needs a dedicated empty state:

- CalendarGrid: "No bookings yet. Click any cell to create one."
- RosterView: "No daycare today. Create a session or enable recurring."
- RoomGrid: "All rooms empty. Create a boarding."
- WaitlistDrawer: "No waitlist entries."

---

## 8. Accessibility requirements

Not a nice-to-have in front-desk tooling. The people running this software are on the phone, squinting at a sun-glared screen, and keyboard-driving a lot of what they do.

- **Keyboard.** Every action reachable without a mouse. Grid cells are focusable. Arrow keys move selection by slot.
- **Focus rings.** 2px, 3:1 contrast, never removed.
- **Color contrast.** All text on blocks passes 4.5:1 at the given size. Test service-type color + status overlay combinations (dashed borders on light fills are a common fail).
- **Announcements.** `aria-live` polite on time changes, status changes, and waitlist offer updates.
- **Color alone.** Never. Status must have a glyph. Safety must have a glyph. Conflict must have a glyph.
- **Reduced motion.** Respect `prefers-reduced-motion`. Replace slide and snap with simple opacity.
- **Screen reader labels.** Every block announces like a natural sentence: "Luna, Full Groom with Sarah K., Monday April 20, 10 to 11:30. Confirmed. Deposit paid. Recurring weekly."

---

## 9. Motion and interaction principles

1. **Drag is 1:1.** No lag, no tween while dragging. Snap on drop.
2. **Popover opens fast.** `motion/pop` is 120ms. Anything slower feels sticky.
3. **Never animate reveals longer than 240ms.** Calendar is a working tool, not a homepage.
4. **Time-indicator moves silently.** The red line crawls every minute. No pulse.
5. **Waitlist offers update live.** Countdown timers tick in seconds. Status transitions use brief color pulses to catch the eye.

---

## 10. What to build first

A designer's worst outcome here is gold-plating atoms nobody uses. Stage the build.

### Sprint 1: The thin slice

Ship the people grid for a single day with these components only:

- Tokens (service-type, status/confirmed, status/tentative, typography)
- Primitives: Pill, Avatar, Meter
- Atoms: BookingBlock (standard + compact), GridCell, StaffColumnHeader, TimeAxis, CurrentTimeIndicator, DayNavigator
- Molecules: BookingPopover (confirmed variant), CreationSheet (people-grid variant)
- Organism: CalendarGrid (day view)

That's enough for a usable front desk demo on grooming and vet.

### Sprint 2: Safety and states

- All status overlays
- SafetyWarningBadge, safety icons
- Popover variants (tentative, cancelled, recurring-instance)
- EditRecurringDialog, CancelReasonDialog

### Sprint 3: Daycare and boarding

- SessionCard, RoomSpan
- RosterView, RoomGrid
- DayHeader summary pills, DaySummaryDrawer

### Sprint 4: Waitlist and quick-find

- WaitlistEntryCard, WaitlistOfferCard
- WaitlistDrawer
- QuickFind

### Sprint 5: Polish and edge

- Link indicator + multi-pet popover variant
- Conflict marker + hard/soft variants
- Week and month views of CalendarGrid
- Reduced motion, high-contrast mode, RTL check

> **Design prompt.** A five-sprint plan is a decision trap if you let the sprint boundary dictate scope. The real question: at which sprint do you invite three front-desk people to click through a real-data demo? My answer: end of Sprint 2. Earlier than feels comfortable. Later, you've baked too many assumptions to change cheaply.

---

## Appendix. Figma file structure suggestion

Organize the Figma file to mirror this doc:

```
00 — Foundations
  Color, Typography, Spacing, Elevation, Motion
01 — Icons
02 — Primitives
03 — Atoms
04 — Molecules
05 — Organisms
06 — Patterns and templates
  Day view, Daycare day, Boarding week
07 — Playground
  Density tests, worst-case data, accessibility checks
```

Each component page carries: variant grid, states row, anatomy callout, do/don't examples, linked Notion or README entry.

---

## Appendix. Hand-off checklist

Before calling a component "done":

1. All variants + states in the Figma file
2. Tokens applied (no hard-coded colors)
3. Worst-case data tested (long pet name, 6+ safety flags, 10-minute booking)
4. Keyboard interaction documented
5. Accessibility name documented
6. Motion spec documented
7. Engineering stub PR or Storybook entry
8. One real screen consumes the component

---

> **Closing design prompt.** The teardown told you *what the surface needs to do*. This spec tells you *what to build*. The hardest call you'll make in the next month: which components you simplify versus which you invest in. My bet: over-invest in BookingBlock, BookingPopover, and DayHeader. Under-invest in icons (launch with the minimum and expand). Waitlist can be a Sprint 4 surprise. Multi-pet linked bookings are worth more than they look. Test that with real customers before you believe me.
