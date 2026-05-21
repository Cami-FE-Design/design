# PRO-68: Appointment Foundations — Design Spec

**Linear**: [PRO-68](https://linear.app/getcami/issue/PRO-68/epic-4-appointment-management)
**Milestone**: E4 — Appointment Management · **Project**: v0 Web OS for a single branch
**Branch**: `michelle/pro-68-appointment-foundations` (worktree at `~/cami-design-pro-68-appointment-foundations`)
**Blocks**: future tickets for Appointment Popover, Today Agenda, Create-booking Sheet, Daycare Roster, Boarding Rooms, Waitlist Drawer

## Implementation slice order (decided 2026-05-11)

1. **Foundations** (this spec, no UI)
2. **People grid** (Calendar tab, current ticket scope) — designs ready in Figma, building first
3. **Today agenda + booking popover**
4. **Create-booking sheet**
5. **Daycare roster**, **Boarding rooms**, **Waitlist drawer** (parallel after the above)

Original order was foundations → today-agenda → create → grid; reordered because grid designs were ready first.
**Blocked by**: PRO-85 (Pet Parent + Pet Directory), PRO-73 (Pet parent data model), PRO-74 (Pet data model), PRO-87 (Services catalog)

---

## What ships

A foundations document. No UI surfaces in this ticket. This spec is the canonical reference every downstream appointment ticket inherits from. It locks:

1. **Booking entity** (TypeScript-flavored shape, with-pets and without-pets variants on one type)
2. **State machine** (canonical states, transitions, who acts, who observes)
3. **Service taxonomy + colors** (anchored in cami brand scales)
4. **Mode taxonomy** (People grid, Daycare roster, Boarding rooms, same atom, different visualization)
5. **Safety vocabulary** (canonical icon set, severity, blocking vs warning)
6. **Relationship vocabulary** (canonical pill set, how each is computed)
7. **Multi-pet linkage model** (family bookings as first-class)
8. **Recurring model** (pattern types, edit scopes, defaults)
9. **Waitlist hooks** (reference fields only, full waitlist spec is separate)
10. **Decisioned answers** to the 15 open questions from the calendar teardown
11. **Out-of-scope deferrals** (what other specs own)

**Source teardown** (read first, not duplicated here): `/design/cami-calendar-teardown.md` + `/design/cami-calendar-components.md` (Google Drive, not in repo). This spec is the engineering-inheritable distillation.

## Reference apps

- **Fresha** = baseline UX + state model + scheduling flows
- **Moego** = pet-specific additive layer (safety flags, multi-pet linkage, breed-aware durations, meet-and-greet gate)

## Cross-cutting decisions

### Three modes, one atom

The atomic unit is the **booking**. What changes across service shapes is how bookings are visualized and aggregated.

| Mode | Use | Axis | Lives in | Aggregation |
|---|---|---|---|---|
| **People grid** | 1:1 services (Grooming, Vet, Training, Details Job) | Staff columns × time rows | Calendar tab | One block per booking |
| **Daycare roster** | Daycare enrollments | List of pets in a session | Daycare tab | Bookings collapse into a session roster |
| **Boarding rooms** | Multi-day stays | Rooms × days | Boarding tab | Each stay spans columns |

Mode switching has a cost. The left nav carries it, but a parent on the phone says "can you fit Luna in next Tuesday" without naming Grooming, Daycare, or Boarding. A **mode-agnostic quick-find** is the glue (separate spec, deferred).

### With-pets vs without-pets

One booking entity, conditional fields. Same rule as PRO-85: gated per partner by `hasPets: boolean`.

| | With pets *(`hasPets: true`)* | Without pets *(`hasPets: false`)* |
|---|---|---|
| Service categories | Grooming, Vet, Day Care, Boarding, Details Job, Welcome | Service categories scoped to the business (haircut, massage, training session, etc.) |
| Subject of the booking | Client + 1..n Pets + Service(s) + Staff | Client + Service + Staff |
| Booking title | Pet name (primary) | Client name (primary) |
| Safety surface | Vaccinations, behavior flags, medications | Not shown |
| Breed-aware duration | Yes | No |
| Meet-and-greet gate | Yes (Boarding, Daycare first-timers) | Not applicable |
| Multi-pet linkage | First-class | Not applicable (multi-client family bookings out of v0) |

Code: `petIds: string[]` is optional, present only when `hasPets`. UI copy uses **Client** universally (per terminology rule, never Customer).

### Service taxonomy + colors

Categories observed in current data plus teardown additions:

| Category | Code | With-pets only? | Color anchor | Notes |
|---|---|---|---|---|
| Grooming | `grooming` | Yes | brand violet | Bath, full groom, deshedding, etc. |
| Vet | `vet` | Yes | brand green | Consultation, vaccination, dental, surgery prep |
| Day Care | `daycare` | Yes | brand sage | Renders as enrollment, not staff-column block |
| Boarding | `boarding` | Yes | brand yellow | Renders as room-span, not staff-column block |
| Details Job | `details` | Mixed | brand pink | Quick add-ons (nail clip, ear clean). Front desk often books these |
| Welcome | `welcome` | Yes | brand gray | Meet-and-greet, intake, behavioral assessment. Prerequisite for first-time Boarding/Daycare |
| Other (without-pets) | `service` | No | partner-defined | Salons, fitness, spa, wellness map their own categories here |

**Palette constraint** (per avatar treatment memory): violet, green, sage, yellow, pink, gray. **No warm peach.**

Color carries category, **not** status. Status is overlaid via fill saturation, border style, and icons (see state machine).

### Booking entity

```ts
type Booking = {
  id: string                              // ULID
  partnerId: string                       // tenant scope
  branchId: string                        // single-branch v0 but still scoped

  // Subject
  clientId: string                        // always present
  petIds: string[]                        // empty when !hasPets; length >= 2 when multi-pet
  primaryPetId?: string                   // when multi-pet, the "anchor" pet for sorting/display

  // Service
  serviceId: string                       // FK to services catalog (PRO-87)
  serviceCategory: ServiceCategory        // denormalized for color/icon/grouping
  variantId?: string                      // e.g. "1st Dog" vs "Add'l Dog"
  addOnIds: string[]                      // bath during boarding stay, walks, etc.

  // Resource
  staffId?: string                        // null for daycare (session-based) and boarding (room-based)
  sessionId?: string                      // daycare enrollment target
  roomId?: string                         // boarding room

  // Time
  start: ISODateTime                      // local-time in branch tz
  end: ISODateTime                        // computed from service.defaultDuration + breed/size factors
  durationMin: number                     // denormalized for rendering
  allDay: boolean                         // true for daycare and boarding (block-level)

  // State
  status: BookingStatus                   // see state machine
  cancelReason?: CancelReason
  noShowReason?: NoShowReason

  // Money
  priceMinor: number                      // AED fils for v0 (UAE market)
  currency: 'AED'                         // hardcoded v0; multi-currency deferred
  depositStatus: 'none' | 'required' | 'paid' | 'waived'
  depositMinor?: number
  balanceMinor: number                    // computed

  // Linkage
  linkedBookingIds: string[]              // multi-pet family group (siblings share a group)
  familyGroupId?: string                  // shared id across linked bookings, lets us treat the group as one entity
  recurringSeriesId?: string              // parent series; null for one-off
  recurringInstanceOverrides?: Partial<Booking>  // when this instance diverges from the series

  // Source
  source: 'walk-in' | 'phone' | 'pet-parent-app' | 'partner-app' | 'recurring'
  createdBy: StaffId                      // null when source = 'pet-parent-app'
  createdAt: ISODateTime
  updatedAt: ISODateTime

  // Notes and flags
  notes?: string                          // free text from booking creator
  internalFlags: BookingFlag[]            // computed safety/relationship overlays, denormalized for fast render
}
```

**Why each field is here**:
- `petIds[]` not `petId`: multi-pet family bookings are first-class (CSV shows pairing-via-notes today; v0 makes it a real link).
- `primaryPetId` distinct from `petIds[0]`: the "anchor" pet drives display order in the popover and grid block.
- `serviceCategory` denormalized: needed at every render (color, grouping, mode routing). Updating service catalog must propagate.
- `staffId | sessionId | roomId` as discriminated resource: one of the three is required, but which depends on serviceCategory. Validation lives in the entity, not the UI.
- `linkedBookingIds[]` + `familyGroupId`: redundant on purpose. Linked-ids is direction-agnostic per booking; familyGroupId lets the group be queried as a unit.
- `recurringInstanceOverrides`: lets "this instance only" edits diverge without breaking the series. Editing the series resets these on future instances.
- `internalFlags[]`: precomputed safety + relationship flags. Recomputed on relevant entity changes (pet vaccinations updated, client first-visit threshold crossed). Renderers never recompute on the fly.

### State machine

Canonical state set. Revised 2026-05-13 after Fresha + Moego reference study: collapsed from 11 universal states to 6 universal + 1 pet-context, matching Moego's operator-validated state set. CSV's `Scheduled` maps to `confirmed`.

| State | Code | Fill | Foreground | Stroke | Trigger | Forward action |
|---|---|---|---|---|---|---|
| Booked | `booked` | blue/5 | blue/12 | blue/11 | Created, not yet confirmed (online-booked default for new clients, manual default for receptionist-created) | Confirm |
| Confirmed | `confirmed` | lime/5 | lime/12 | lime/11 | Client confirmed (auto on online booking with prior history, manual otherwise) | Check in |
| Checked in | `checked-in` | teal/5 | teal/12 | teal/11 | Pet / client arrived; service is happening | with-pets: Mark as ready · without-pets: Complete |
| Ready for pickup *(with-pets only)* | `ready-for-pickup` | amber/5 | amber/12 | amber/11 | Pet done, awaiting owner. Fires pickup notification (WhatsApp + Email) | Check out |
| Completed | `completed` | gray/6 | gray/12 | gray/11 | Booking closed, everyone gone, payment captured or owed | (terminal) |
| Cancelled | `cancelled` | olive/5 | olive/12 | olive/11 | Cancelled with reason | Rebook |
| No-show | `no-show` | tomato/8 | tomato/12 | tomato/11 | Past start, marked no-show with reason | Rebook |

**Forward path**:
- Without-pets: `booked → confirmed → checked-in → completed`
- With-pets: `booked → confirmed → checked-in → ready-for-pickup → completed`

**Terminal states**: `completed`, `cancelled`, `no-show`. No further forward action.

### What changed from the original 11-state set

The original spec proposed 11 states; reference study revealed redundancy and out-of-scope concepts. Changes:

- **`tentative` → `booked`** (rename): "Booked" is more neutral, matches Fresha + receptionist mental model. The state itself is unchanged.
- **`deposit-paid` removed**: deposit is a payment fact orthogonal to lifecycle. Lives on the booking entity as `depositStatus: 'none' | 'required' | 'paid' | 'waived'`, rendered as a credit-card icon in the header bar. A booking can be `booked + deposit-paid` or `confirmed + deposit-paid`; deposit is not a lifecycle stage.
- **`waitlisted` removed**: per the original spec "not yet on the calendar." Waitlist entries are a separate entity. They get *promoted* into `booked` calendar bookings when offered. Waitlist itself remains in scope for a future spec.
- **`on-hold` removed**: no workflow surfaces this in either reference. Express as `booked` + a staff note. Revisit in v1.
- **`in-progress` removed**: collapsed into `checked-in`. The "service is happening" signal lives on the staff member's status (not the booking). Moego operates this way and validates the simplification.
- **`checked-out` removed**: merged into `completed`. The post-service tail is fully covered by `ready-for-pickup → completed` for pets, or `checked-in → completed` directly without pets.
- **`ready-for-pickup` added**: new pet-context state between `checked-in` and `completed`. Triggers pickup notification.

**Front desk rule**: receptionists own every state in this set. There is no separate "pro view" gate in v0 since `in-progress` collapsed away.

**Deposit tracking** (now a flag, was a state):

```ts
type DepositStatus = 'none' | 'required' | 'paid' | 'waived'
```

The flag is set on the booking entity and rendered as a visual element in the popover header bar (credit-card icon + amount), not as a state transition.

### Safety vocabulary

Icons appear in the popover header (and block, where space allows). Rendered only when `hasPets`.

| Flag | Icon | Severity | What it means | Source |
|---|---|---|---|---|
| Vaccinations overdue | shield-warn | Warning at booking | Pet's required vaccination dates have passed or expire mid-stay | Pet record |
| Vaccinations missing | shield-x | Block at booking (overridable) | Required vaccinations not on file | Pet record |
| Reactive / behavior flag | alert-triangle | Warning at booking | Pet flagged for reactivity, separation anxiety, or specific triggers | Pet record |
| Medication | pill | Info | Active medication on file, dosage notes in booking | Pet record |
| Allergy | leaf-x | Info | Food, grooming product, or environmental allergy | Pet record |
| Meet-and-greet required | handshake | Block at booking (overridable) | First-time Boarding or Daycare and no Welcome booking on file | Booking history |
| Incompatibility nearby | users-x | Warning at booking | Reactive pet booked adjacent to a known incompatible pet | Pet relationships (deferred, see open questions) |

**Severity rule**:
- *Block* shows a hard stop modal on save, with override-with-reason CTA. Overrides are logged.
- *Warning* surfaces in the create flow and the popover but doesn't block save.
- *Info* renders the icon, no flow interruption.

### Relationship vocabulary

Pills appear in the popover header (under pet name) and in the create-booking search results. Computed, not user-entered.

| Pill | Computed from | Threshold (default, partner-tunable) |
|---|---|---|
| First visit | No completed bookings | 0 completed |
| New | Days since first completed booking | ≤ 14 days |
| Regular | Completed bookings in last 90 days | ≥ 3 |
| VIP | Lifetime spend OR completed count | top 10% OR ≥ 24 completed |
| Lapsed | Days since last completed booking | > 90 days |
| High spender | Lifetime spend percentile | top 5% |
| At risk | Was Regular, now trending toward Lapsed | > 60 days since last booking AND was Regular last quarter |

A booking can carry multiple pills. Display rule: max 3 pills, priority order First visit > VIP > Regular > New > Lapsed > At risk > High spender.

### Multi-pet family bookings

A family booking is two or more bookings sharing a `familyGroupId`, typically same client, adjacent times, same drop-off. Created together, edited together by default.

**Rules**:
- Created via "Add another pet" in the create-booking sheet. Each pet gets its own booking row (different services, durations, staff allowed).
- Editing one instance can propagate or stay local. Default: propagate time changes, local for service/staff/notes.
- Cancelling one prompts "also cancel linked?" with default Yes.
- Popover shows linked bookings as tabs or sub-rows (popover spec decides which).

### Recurring bookings

**Patterns**: weekly, biweekly, monthly (by day of month or by ordinal: "first Tuesday"), custom.
**End behavior**: ends on date, ends after N occurrences, open-ended.
**Edit scopes**: this instance only, this and future, entire series.
**Default edit scope**: **this instance only** (safer; explicit opt-in to series edits). See decisioned questions below.
**Pause**: skip the next N occurrences. Series resumes automatically.
**Deletion**: same three scopes as edit.

An edited single instance stores divergent fields in `recurringInstanceOverrides`. The series template is unaffected. "This and future" applies a new template version from the edited instance forward; older instances keep the original template.

### Waitlist hooks

Full waitlist spec is separate (deferred). For foundations, the booking entity references:
- A `waitlistEntryId?: string` (when a booking was created from a waitlist promotion)
- An `offeredAt?: ISODateTime` and `offerExpiresAt?: ISODateTime` (for offers in flight against this slot)

The waitlist entity, drawer UI, and offer flow live in a future ticket.

---

## Decisioned answers to teardown's 15 open questions

Each marked **Decided** or **Deferred (→ ticket)**. The teardown listed these as open; locking them now prevents downstream surface specs from rediscovering the same arguments.

1. **Consent forms, fresh per booking or carry from pet record?** **Decided**: carry from pet record with expiry. Re-prompt only when expired or when the service explicitly requires a service-specific form (e.g. surgical consent). Pre-fill, never re-collect identical data.
2. **Deposit on booked-not-confirmed holds, capture or not?** **Decided**: `booked` supports an optional deposit. Deposit is a payment-axis flag (`depositStatus: 'paid'`), independent of lifecycle state. `booked` without deposit expires after a partner-configurable window (default 48 hours), then auto-cancels with reason "booking expired".
3. **Meet-and-greet, hard gate or soft warning?** **Decided**: hard block at first-time Boarding or Daycare booking creation, with override-with-reason. Override is logged. Soft warning is insufficient for safety surface.
4. **Conflict definition, which overlaps count, allowed with confirm?** **Decided**: three conflict types, distinct treatments.
   - *Staff double-book on same column*: blocked unless explicit override with reason.
   - *Pet-on-pet incompatibility nearby*: warning, never blocks.
   - *Room over-capacity (boarding)*: blocked, hard. Cannot override.
5. **Pet-on-pet compatibility, does Cami store pet relationships?** **Deferred** (→ separate ticket, post-v0). Foundations supports the flag and warning surface; the relationship entity itself is post-v0. v0 surfaces only "behavior flag set on pet" warnings.
6. **Staff specializations, warn on breed-mismatched groomer?** **Deferred** (→ post-v0). Out of foundations scope; revisit when partners ask for it.
7. **Recurring edit scope default, "this instance" or "this and future"?** **Decided**: "this instance only" as default. Safer. The picker is required, not skippable, on every recurring edit.
8. **Daycare drop-off windows, enforced or guidance?** **Decided**: guidance only in v0. Surfaced in the popover and create-sheet but not enforced by the system. Enforcement is a partner-configurable rule for a future ticket.
9. **Boarding turnover, cleanup time between stays?** **Decided**: configurable per partner, default 30 min cleanup buffer between departing stay and next arriving stay in the same room. Visually rendered as a striped buffer on the room grid.
10. **Waitlist concurrency, one offer per slot or many?** **Decided**: one active offer per slot in v0. Concurrent offers (first-accept-wins) deferred until we see real waitlist load.
11. **Online bookings, land as Booked or Confirmed?** **Decided**: partner-configurable. Default = `booked` for new clients, `confirmed` for clients with at least one completed booking. The `depositStatus` flag is set independently when a deposit is captured during the online flow.
12. **Calls and texts, logged against the booking?** **Decided** (lightweight): yes, the booking entity carries an `interactions: BookingInteraction[]` field, populated when a call or text is initiated from the popover's tap-to-call / tap-to-text. Full call logging out of foundations.
13. **Vaccinations mid-stay, warn at boarding-time if shots expire during the range?** **Decided**: yes, blocking at booking creation. Same severity as vaccinations overdue.
14. **Time zones, ignore or design for multi-location?** **Decided** for v0: all times are local to the single branch. Multi-branch and multi-tz deferred to E5 (multi-location).
15. **Walk-ins with no appointment, quick-add path?** **Decided**: walk-ins are first-class, distinct from regular bookings only by `source: 'walk-in'`. Quick-add lands in the People grid at the current time on the chosen staff column, status `checked-in` directly (skips `booked` and `confirmed`).

---

## People grid implementation decisions (added during slice 2)

- **Time scale**: 95px per hour. CSS variable `--cami-grid-px-per-min: 1.583` (95÷60). Retunable later for denser week views without rewriting block math.
- **Block sizing**: blocks are absolute-positioned within their staff column. `top = (booking.start − dayStart) × pxPerMin`. `height = booking.durationMin × pxPerMin`.
- **Block content density**: every content element (time range, price chip, pet/client name, service line, status/safety icons) is rendered at every block size; truncation and compression handle the squeeze. No progressive hiding by height.
- **Column width**: 148.5px from Figma; in code, columns flex to fill available width with `min-width: 120px`.
- **Block click**: every block is a `<button>` opening the popover. Until the popover ships in slice 3, click logs to console.
- **Multi-pet linkage on the grid**: small `+1` indicator on linked blocks. Cross-column visual grouping (lines, brackets) deferred to popover spec.

## Open questions (genuinely undecided)

Surface in the next spec touching these:

- **Popover variants count**: teardown lists 9. Some can collapse (cancelled and no-show share). Final variant count gets locked in the popover spec.
- **Block icon density limit**: how many safety/relationship icons fit on a grid block before they're hidden behind a "more" affordance? Decided in grid spec.
- **Family group identity in popover**: tabs per pet, or sub-rows, or stacked? Decided in popover spec.
- **Cancel reason taxonomy**: the teardown calls for reason codes. The list itself (no-show, reschedule, illness, partner-side, etc.) needs a partner-configurable enum. Decided in cancel-flow spec.
- **No-show grace window**: how long after start before "no-show" auto-suggests? Probably 15 minutes, partner-tunable. Decided in pro-view spec.

---

## Out of scope (this spec)

Other specs own these. Listed so they don't get pulled in:

- All UI surfaces (popover, today agenda, create-sheet, people grid, daycare roster, boarding room grid, waitlist drawer). Each gets its own spec.
- Detailed payment capture surfaces (E5 Invoicing / Checkout, separate epic). Status transitions live here; payment UI does not.
- Daily Ops view (separate surface).
- Reporting and analytics on bookings (separate workstream).
- Daycare session entity full spec (referenced here, locked in Daycare spec).
- Boarding room entity full spec (referenced here, locked in Boarding spec).
- Waitlist entity, drawer, offer flow (referenced here, locked in Waitlist spec).
- Pet-on-pet relationship entity (post-v0).
- Mode-agnostic quick-find (separate spec).

---

## Glossary (Cami terminology)

Per terminology memory. Use these exactly, in code and copy:

- **Client** (not Customer, not User). The human who books. Has zero or more pets when `hasPets`.
- **Pet Parent** acceptable in pet-side copy where emotional register matters. **Client** in operator-facing UI.
- **Booking** (not Appointment in code). Top-level entity. "Appointment" remains in user-facing copy where natural.
- **Sales** (not Invoices) for the revenue surface.
- **Detail** = centered `Dialog` (modeled on `<BusinessDetailDialog>`).
- **Add / Edit** = full-screen takeover `<FullScreenEditDialog>`.
- **With pets / Without pets** (not pet-business / salon). Code: `hasPets: boolean`.

---

## Acceptance for this spec (not the feature)

- [ ] Engineering can implement the booking entity directly from this doc.
- [ ] Every downstream appointment spec links here and inherits the state machine and vocabulary verbatim.
- [ ] No surface spec needs to rediscover any of the 15 teardown questions.
- [ ] Terminology is consistent with PRO-85 and the terminology memory.
