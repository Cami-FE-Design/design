# PRO-83 / PRO-231: Appointment Popover — Design Spec

**Linear**: [PRO-83 Detail Panel](https://linear.app/getcami/issue/PRO-83/e4-2-appointment-detail-panel-lifecycle-edit-and-audit) · [PRO-231 Quick Panel](https://linear.app/getcami/issue/PRO-231/e4-9-appointment-booking-quick-panel)
**Milestone**: E4 — Appointment Management · **Project**: v0 Web OS for a single branch
**Branch / worktree**: `michelle/pro-68-appointment-foundations` at `~/cami-design-pro-68-appointment-foundations` (this spec rides on the foundations branch alongside Slice 2 work)
**Inherits from**: `PRO-68-appointment-foundations.md` (state machine, booking entity, safety vocab, relationship pills, service categories + colors)
**Blocks**: PRO-227 (E4-5 Appointment Card — already in Slice 2), PRO-232 (E4-10 Payment Section), PRO-233 (E4-11 View Pet Parent profile from appointment)

## Status

First-pass spec from Fresha screenshots only (without-pets baseline). The pet-additive layer is stubbed in the With-Pets Layer section below; full Moego pass arrives in a second batch and gets layered in before sign-off.

---

## What ships

Two anchored-popover surfaces, sibling variants of one component family.

| Surface | Linear | Trigger | Shape | Purpose |
|---|---|---|---|---|
| Quick Panel | PRO-231 | Hover (desktop) / tap-and-hold (mobile) | Compact card, ~280px wide | At-a-glance peek: status, time, identity, pills, payment dot |
| Detail Panel | PRO-83 | Click | Wider card, ~380px wide | Full booking surface: lifecycle, edit, audit, all sections |

Both are **anchored popovers** floating next to the clicked / hovered calendar block, not centered Dialogs and not side drawers. They share a base primitive, status header bar, identity block, and pill row. The Detail Panel extends with services list, payment, notes, sub-drawers, and action buttons.

---

## Why popover, not Dialog

The cami memory rule says "Detail = centered Dialog (BusinessDetailDialog)." That rule was set for **directory detail** (clients, pets, businesses), where the user lands on a record from a long list with no spatial anchor. Appointment detail is different:

1. **Spatial context is load-bearing.** The block on the calendar has a position (staff column × time row) that the operator wired into muscle memory before clicking. A centered Dialog throws that away. A popover preserves it: the operator's eye stays on the same grid coordinate.
2. **Calendar density requires fast in-and-out.** Reception clicks an appointment to confirm one fact ("did the deposit clear?") and dismisses it in seconds. A Dialog modal-traps the page; click-outside on a popover is faster and more reversible.
3. **Sub-modal nesting gets ugly with Dialogs.** Activity log, payment policy, repeating options are sub-views of the appointment. As a popover with content-swap sub-views (Fresha's pattern), nesting is natural. Dialog-on-Dialog stacking would work but feels heavier than the action warrants.
4. **Fresha agrees.** 27 reference screens confirm the popover pattern is well-fit for the operational frequency of appointment interactions.

This is the **only** cami detail surface that diverges from the Dialog rule. Client detail, pet detail, business detail all stay on Dialog. Appointment detail is the exception, documented here so it does not propagate.

---

## Reference apps

- **Fresha** = without-pets UX baseline (this pass). Generic appointments, salon / wellness vertical.
- **Moego** = with-pets additive layer (next pass). Pet-specific extensions: safety icons, multi-pet linkage, breed-aware data.

---

## Shared primitives

Both panels share these blocks. Spec'd here once, referenced from each panel section.

### Status header bar

Full-width inside the popover top, rounded top corners matching the popover radius. Background = saturated status color. Foreground = high-contrast text + status icon.

| Status | Fill | Foreground | Stroke | Icon (Lucide) | Label |
|---|---|---|---|---|---|
| `booked` | blue/5 | blue/12 | blue/11 (dashed) | `clock-3` | Booked |
| `confirmed` | lime/5 | lime/12 | lime/11 | `thumbs-up` | Confirmed |
| `checked-in` | teal/5 | teal/12 | teal/11 | `arrow-right-to-line` | Checked in |
| `ready-for-pickup` | amber/5 | amber/12 | amber/11 | `bell-ring` | Ready for pickup *(with-pets only)* |
| `completed` | gray/6 | gray/12 | gray/11 | `check` | Completed |
| `cancelled` | olive/5 | olive/12 | olive/11 | `x` | Cancelled |
| `no-show` | tomato/8 | tomato/12 | tomato/11 | `eye-off` | No-show |

**Content of the bar** (left to right):
- Time range (e.g. `9:00am – 10:00am`), font-mono, tabular-nums
- Status label + icon (right-aligned)

**State set rationale** (revised 2026-05-13 after Fresha + Moego reference study): collapsed from 11 universal to 6 universal + 1 pet-context. See foundations spec for the full "what changed" history. Key collapses: `tentative → booked` (rename), `deposit-paid` is now a payment flag (`depositStatus`) not a state, `waitlisted` / `on-hold` removed (out of scope or separate entity), `in-progress → checked-in` (one state for "service is happening"), `checked-out → completed` (single terminal state).

**Deposit visual treatment** (now a flag, not a state): when `depositStatus === 'paid'`, render a credit-card icon + amount in the header bar next to the status pill. Independent of state — works on `booked`, `confirmed`, `checked-in`, etc.

### Identity block

Below the status bar.

- **Avatar** (left): 40px, square-with-radius for businesses, circle-with-character for clients, per memory. With-pets variant uses pet avatar primary, client avatar secondary (linked, smaller).
- **Name** (right of avatar): primary client name (without-pets) or pet name (with-pets, deferred to Moego pass).
- **Phone** (under name): mono font, `text-muted-foreground`, tap-to-call on mobile.
- **Secondary identity line** (with-pets only, deferred): client name + relationship to pet (e.g. "Owner · Millie Cassidy").

### Tag / badge row

Horizontal flex, wraps after 3 pills.

- **Computed pills**: pulled from foundations relationship vocab (First visit, New, Regular, VIP, Lapsed, At risk, High spender) PLUS Fresha-inspired behavior signals (`N no-shows`, `N cancellations`). Auto-computed, never user-edited. Visual: filled bg pink-3 / blue-3 / violet-3 per pill type.
- **Manual tags**: free-form labels added via `+ Add tag` chip. Visual: outline pill, sand-7 border. Click to remove.
- **`+ Add tag` chip**: always last in the row, opens inline tag-add popover (re-uses [components/blocks/playground tag-add pattern if exists, else build minimal]).

Max 3 visible pills + `+ Add tag`. Overflow collapses to `+N more` chip that opens the full list inline.

**v0 manual-tag entity**: new, scoped to appointment record. Distinct from client-level tags (those live on client, propagate to every appointment). Booking-level tags are one-shot.

### Service row(s)

Below identity / pills, vertical stack.

Each service row:
- **Left bar**: 3px wide, full-row height, color = service category anchor (violet for grooming, green for vet, sage for daycare, yellow for boarding, pink for details, gray for welcome).
- **Service name** (top line, font-medium): e.g. "Full Grooming MD"
- **Price** (top-right, right-aligned, font-medium): `formatAed(priceMinor)`
- **Meta line** (under, `text-muted-foreground text-[12px]`): duration · staff name · ❤ if booked-with-favorite
- **Warning chips** (inline, below meta if present): yellow-3 bg, yellow-11 text. Examples: "2 warnings", "Team member is not available", "Team member doesn't provide this service". Click expands to list.
- **`+ Add service`** button at end of stack (Detail Panel only, not Quick Panel).

For with-pets multi-pet bookings, each pet's services are grouped under a pet sub-header (deferred to Moego pass).

### Staff alert block

Appears when the booking has any flag from the safety vocab (with-pets) or a manual staff alert (without-pets).

Visual:
- `bg-yellow-2 border-l-2 border-yellow-9` block
- `triangle-alert` icon left
- Bold all-caps message (truncates with ellipsis at 2 lines)
- Optional note chip below (free-text staff comment, e.g. "paid 200aed deposit thru link x")

In Quick Panel: shows the most-severe single alert.
In Detail Panel: shows all alerts stacked.

### Payment block

Below services.

- **Deposit row** (when `depositStatus !== 'none'`): credit-card icon + status text. Variants:
  - `required`: "AED X deposit required"
  - `paid`: "AED X deposit paid"
  - `paid` + refunded: "AED X deposit (source) Refunded" in pink-11 strikethrough
  - `waived`: "AED X deposit waived"
- **Total** row (right-aligned): `Total · AED X`
- **To pay** row (right-aligned, below total): `To pay · AED X` (only shown if Total ≠ To pay, i.e. partial payment exists)

In Quick Panel: just the deposit row, no Total breakdown.
In Detail Panel: full block.

### Notes section

`Notes` heading + content block.

- `bg-stripe-gold` background (per memory, gold stripe pattern utility)
- Free-text content
- Click-to-edit inline (replaces content with textarea, save/cancel)
- Empty state: "+ Add note" chip

Quick Panel: shows notes inline (truncated to 2 lines).
Detail Panel: full notes section, editable.

### Action row (Detail Panel only)

Fixed at the popover bottom. Contains:

- Primary action button (varies by status, see Status workflow below)
- Triple-dot `...` for quick actions menu
- `Checkout` (for `completed`) or `Save` (when in edit mode)

---

## Surface 1: Quick Panel (PRO-231)

**Trigger**: 200ms hover delay on desktop. Tap-and-hold (300ms) on mobile.
**Dismissal**: pointer-leave (desktop, 100ms grace), tap-outside (mobile).
**Dimensions**: 280px wide, height adapts to content (typically 180–240px).
**Position**: anchored to clicked block, prefer right side, flip to left if no room.

**Content** (in this order, all required):
1. Status header bar
2. Identity block (no demographic rows)
3. Tag / badge row (computed pills only, no `+ Add tag`)
4. **One** service line (the primary; if multi-service, show service count e.g. "Full Grooming + 2 more")
5. Staff alert (most severe only, single line)
6. Notes preview (truncated to 1 line if present, else hide)
7. Footer: `Click for details →` micro-affordance, right-aligned, `text-[10px] text-muted-foreground`

**Not in Quick Panel**: edit affordances, `+ Add` buttons, status dropdown, action buttons, quick-actions menu, sub-drawer triggers.

**Acceptance** (from PRO-231):
- Hover/tap triggers Quick Panel ✓
- Shows time, status, icons, tags, notes, service, payment ✓
- Click "Open detail" (we'll re-bind to clicking anywhere on the panel since the affordance is the panel itself) opens Detail Panel ✓
- Click outside dismisses ✓
- Add tag from Quick Panel: **moved to Detail Panel only** (Quick stays read-only)
- Error state on load failure ✓

**Deviation from PRO-231 acceptance**: tag-add lives in Detail Panel, not Quick. Reason: Quick Panel is for *peeking*, not acting. Allowing edits in Quick muddles the mental model. PRO-231 spec is ambiguous on this; calling it explicitly.

## Surface 2: Detail Panel (PRO-83)

**Trigger**: click on calendar block (or click on Quick Panel).
**Dismissal**: click-outside, ESC key, X button in header bar.
**Dimensions**: 380px wide, max-height 80vh (scrollable internally).
**Position**: same anchoring rules as Quick Panel.

**Content** (top to bottom):
1. Status header bar with status dropdown (click status pill to open dropdown)
2. Identity block (avatar + name + phone + secondary identity if with-pets)
3. Tag / badge row (with `+ Add tag`)
4. Staff alert block (all alerts)
5. Services list (all services, `+ Add service`)
6. Notes section (editable)
7. Payment block (full)
8. Date / repeat line: `Doesn't repeat` or `Repeats weekly · Series of 12` etc. Click opens Edit Repeating sub-drawer.
9. Action row (sticky bottom):
   - Primary status action (varies, see below)
   - Triple-dot quick actions menu
   - Secondary action (Checkout / Save / View sale)

### Status workflow — primary action button

Each status has a default forward action surfaced as the primary button. Status moves via dropdown override.

| Current status | Primary button | Result |
|---|---|---|
| `booked` | Confirm | → `confirmed` |
| `confirmed` | Check in | → `checked-in` |
| `checked-in` (with-pets) | Mark as ready | → `ready-for-pickup` (opens pickup-message confirm modal) |
| `checked-in` (without-pets) | Complete | → `completed` (triggers invoice + email per PRO-83) |
| `ready-for-pickup` | Check out | → `completed` |
| `completed` | none (read-only) | — |
| `cancelled` | Rebook | (opens create-booking sheet, deferred to Slice 4) |
| `no-show` | Rebook | (opens create-booking sheet, deferred to Slice 4) |

**Status dropdown** opens from clicking the status pill in the header bar. Shows all valid transitions per the foundations state machine. Forward / standard transitions = neutral text. Destructive (`cancelled`, `no-show`) = pink-11 text. Restricted transitions (e.g. cannot go from `completed` back to `checked-in`) are hidden.

Every status change is audit-logged with actor + timestamp + before/after.

### Quick actions menu

Triple-dot opens a contextual menu. Contents vary by status, matching Fresha's pattern.

**For all statuses (top section)**:
- Add a note (or Edit note if present)
- Add a form *(deferred — forms entity post-v0; show disabled with tooltip "Coming soon")*
- Edit payment policy (opens Payment Policy sub-drawer)
- Set as repeating (opens Edit Repeating sub-drawer)
- Add to group appointment *(deferred — group bookings post-v0)*
- Rebook (opens create-booking sheet, deferred to Slice 4)
- **Add incident** *(with-pets only; opens Incident modal — see Incident Flow below)*

*Note: `View appointment activity` is intentionally NOT in the kebab. Update history is promoted to a permanent left-rail tab per Moego pattern.*

**Separator**

**Destructive bottom section** (only visible for editable statuses, i.e. `booked`, `confirmed`, `checked-in`):
- Reschedule (opens reschedule flow)
- Mark No-show, in pink-11 text → `no-show` with required reason code
- Cancel, in pink-11 text → `cancelled` with required reason code

For terminal statuses (`completed`, `cancelled`, `no-show`): destructive section hidden.

### Cancel / No-show reason codes

Required selection on transition to `cancelled` or `no-show`. Modal opens with:
- Reason dropdown (partner-configurable enum, default set TBD in cancel-flow spec)
- Optional comment field
- Confirm + Back buttons

Submission with no reason fails (PRO-83 acceptance). Cancel reason taxonomy is a separate spec / cancel-flow spec; this spec assumes the enum exists.

### Edit pattern

Inline-edit for:
- Tags (add / remove)
- Notes (click to edit, save / cancel)
- Status (via dropdown)

**Open full edit takeover** for:
- Time / date (reschedule)
- Service (swap / add / remove)
- Staff
- Price (permission-gated, see below)
- Client / pet

The takeover is the existing `<FullScreenEditDialog>` from PRO-101 era (per memory at `components/blocks/full-screen-edit-dialog.tsx`), deep-linked to the relevant section. Closes back to the Detail Panel on save.

### Permission gating

Per PRO-83 acceptance: price field is read-only for users without edit-price permission. The spec defers permission system itself to a separate ticket. For v0, all roles can edit; the read-only treatment is implemented but gated by a flag that defaults to true (edit-allowed). Once permissions ship, flag flips per role.

---

## Sub-drawers

Three sub-drawers slide in to replace the Detail Panel content. Same popover footprint, content swaps with a back-arrow header.

### Activity log (audit)

Trigger: `View appointment activity` from quick actions menu.

Content:
- Vertical timeline (left rail line + circle markers)
- Each entry: title + timestamp + detail
- Entry types:
  - `Appointment created` (e.g. "Booked by Shannon, reference 8B66CF37")
  - `Appointment confirmed` (e.g. "Sofia confirmed appointment")
  - `Appointment status updated` (e.g. "Status updated to Started by Sofia")
  - `Appointment rescheduled` (e.g. "Rescheduled by Fifi from 13 May 11:30am to 13 May 11:45am with Fifi")
  - `Notification sent` / `Notification failed to send` (e.g. "Reminder WhatsApp Message failed to send" — clickable to view details)
  - `Sale created` (e.g. "Checked out by Sofia with sale receipt 22063" — clickable to sale)
- Footer: "Activity for this appointment in the last 12 months"
- Back arrow at top returns to Detail Panel

Notifications are WhatsApp + Email only (per memory, SMS dropped from v0). Failed notification entries are clickable to view the message body / retry.

### Edit repeating options

Trigger: clicking the date / repeat line in Detail Panel, OR `Set as repeating` from quick actions.

Content:
- `Frequency` dropdown: `Doesn't repeat` (default), `Every day`, `Every week`, `Every month`, `Custom`
- When set to a repeating value, additional fields appear:
  - End behavior: `Ends on date`, `Ends after N occurrences`, `Open-ended`
  - Edit scope (required, no default): `This instance only`, `This and future`, `Entire series`
- `Apply changes` button (sticky bottom)
- Back arrow at top

**Edit scope default**: `This instance only`, per foundations spec decision (safer; explicit opt-in to series edits).

### Payment policy

Trigger: `Edit payment policy` from quick actions, OR clicking the deposit row in the payment block.

Content (matches Fresha's structure):
- `Require a deposit upfront` dropdown: `No deposit`, `Require a deposit upfront`, `Require full payment upfront`
- When require deposit: amount input (AED) with coin / % toggle, helper text `Deposit amount: AED X.XX`
- `Refundable until` dropdown: `Non-refundable`, `30 minutes before`, `1 hour before`, `2 hours before`, ... `72 hours before`
- `Clients can reschedule online` dropdown: same time options + `Clients cannot reschedule online`
- `Automatically cancel appointments for clients that did not pay a deposit` checkbox
- `Apply no-show fee` checkbox + % input + helper text `No-show fee amount: AED X.XX`
- Cancel + Apply buttons (sticky bottom)
- Triple-dot for additional payment actions (deferred to Payment Section spec PRO-232)

This spec captures the UI surface; the policy data model and partner-default override behavior lives in PRO-232.

---

## With-Pets Layer (Moego pass)

When `hasPets: true`, the Detail Panel structurally reorganizes around **pet cards**, each containing its own service stack. Fresha's flat service list is replaced. Quick Panel additions are smaller (it's a peek surface).

### Pet card (Detail Panel)

For each pet in the booking, render a card containing:

**Pet header row**:
- Pet avatar (40px, circle, photo if available, else species line-art icon per `project_cami_avatar_fallback_rule` memory)
- Pet name (font-medium, primary)
- **Species chip** (small icon, color = species accent — red for dog, blue for cat, etc.)
- **Intake form chip** — icon-only badge, filled state = submitted, hollow + dot = required, hollow = not required
- **Agreement chip** — same visual pattern as intake form chip, separate entity
- Edit pencil icon (top-right): opens pet record edit takeover
- Trash icon (top-right, after edit): removes pet from booking with confirm

**Pet meta line** (below header, `text-[12px] text-muted-foreground`):
`{breed} · {weight} · {coat} · {spayedNeutered}` — comma-elided when missing.

**Services nested under pet card**:
Each service row contains:
- Service name (font-medium)
- Start time (right-aligned secondary, e.g. `10:00 am`)
- Price + duration (`AED 90.00  60 mins`)
- Staff avatar + name (right-aligned)
- Inline warning chips if any (yellow-3 bg)

**Per-pet footer**:
- `Grooming report` chip (with-pets, grooming/welcome category only): opens grooming report modal. State indicators: empty, Draft, Sent.

### Multi-pet booking

Pet cards stack vertically inside the Detail Panel. Below the last card:
- **`+ Add pet`** link → opens pet selection sub-panel (deep-links to create-sheet flow if booking is editable)
- **`Multi pets start at the same time`** checkbox — when checked, services for added pets begin at the same start time rather than serially; matches Moego's pattern

### Pet-context relationship pills

Adds to the foundations relationship vocab. Computed against the pet record, not the client.

| Pill | Computed from | Threshold | Tooltip |
|---|---|---|---|
| Grooming cadence (e.g. `4 weeks`) | Median spacing of completed grooming bookings | ≥ 3 completed | "Grooming frequency: N weeks" |
| Overdue groom | Days since last groom vs cadence | > 1.5× cadence | "Last groom: N weeks ago" |
| First visit | No completed bookings for this pet | 0 | — |
| Behavior flag | Pet has any behavior note on file | any | "Behavior notes on file — review" |

Cadence pill shows as `N weeks` (no descriptor), hover reveals tooltip. Per Moego pattern.

### Last appointment hover

Hover the client name (or a dedicated "Last appointment" chip) reveals a small popover:
- Pet that visited last
- Service performed
- Date (e.g. "4 weeks ago")
- **`Book again`** button → opens create-booking-sheet with prior visit pre-filled (deferred to Slice 4 wire-up; UI element ships now)

Pattern matches Moego screenshot 3. Lightweight, surfaces high-frequency rebook action without leaving the Detail Panel.

### Quick Panel additions (with-pets)

The Quick Panel stays minimal. Pet-context additions:
- Pet name is **primary** in the identity block (client name moves to secondary, prefixed `Owner · `)
- Species icon next to pet name
- Cadence pill in the tag row if computed
- Service row shows pet attribution prefix only when multi-pet (e.g. `Max · Full groom`)
- Safety vocab icons (if any flagged) inline after pet name — limit to 2 max in Quick Panel; full list lives in Detail Panel
- Multi-pet booking footer: `+N more pets` chip when count > 1

### Agreement gate banner

When the client has an unsigned **required** agreement (Service Agreement is the v0 universal one), the Detail Panel renders a **red banner** at the top, above the identity block:

```
[!] Agreement hasn't been signed. Check details              [X]
```

- `bg-pink-2 border-pink-7 text-pink-12`
- Click "Check details" opens **Sign Agreement modal** (centered Dialog)
- X dismisses for this session only; banner reappears on next open if still unsigned
- Banner blocks no other functionality but flags the gap prominently

**Sign Agreement modal** (centered Dialog):
- Title: `Sign Agreement`
- `Unsigned:` section lists each unsigned agreement
- Each row: agreement name + status (`Signature required once` / `Signature required each visit`) + action buttons (email link / SMS link — *for cami, WhatsApp link instead of SMS* / `Sign now` primary)
- "Sign now" opens the agreement content in-line for signature capture

Forms entity itself is post-v0 per foundations; the banner + modal **shell** ships in v0 with a stub list of agreements (just Service Agreement). Signature capture is a Slice 5 spec.

### Incident flow (quick action — with-pets only)

`Add incident` from quick actions menu opens a **centered Dialog** (not a sub-drawer; incident reporting needs full-screen focus). Matches Moego's structure exactly:

**Fields**:
- `Pet(s)` — chip multi-select, pre-populated with the booking's pets
- `Business` — dropdown (single-branch v0, so single option)
- `Incident type` — dropdown (partner-configurable enum: bite, escape, fall, allergic reaction, illness, equipment failure, other)
- `Date of incident` — date picker, defaults to today
- `Time of incident` — time picker, defaults to now
- `Was a staff member injured?` — radio No / Yes
- `Was any pet injured?` — radio No / Yes
- `Did a vet visit occur?` — radio No / Yes
- `Incident description` — textarea, 3000 char limit, counter visible
- `Attachment` — file upload (photos, vet receipts, etc.)

**Buttons**: Cancel + Save

**Audit**: every incident is logged with creator + timestamp + booking link, appears in the appointment activity log as `Incident reported`.

**Why dialog, not sub-drawer**: incidents are serious / high-stakes / longer-form input. Modal-trapping the page focuses attention. Matches Moego's choice.

### Ready-for-pickup confirmation modal (with-pets only)

When the primary action `Mark as ready` is clicked from the `checked-in` state (with-pets only), a small centered Dialog opens before the transition fires:

- Title: `Mark this appointment as ready?`
- Checkbox (default checked): `Also send ready for pickup message`
- Channel radios (when checkbox checked):
  - `Send by WhatsApp` (default)
  - `Send by Email`
  - *Note: SMS not offered per cami notification channel memory*
- Buttons: Cancel + Confirm

On Confirm: status moves to `ready-for-pickup`, notification fires through the selected channel, audit log records the transition + notification dispatch.

---

## Comments & Notes (left-rail tab, all variants)

The Detail Panel has a left rail with three icons: `Info` (default Detail content), `Comments & Notes`, `Update history`. Clicking the second icon swaps panel content to Comments & Notes.

Three sub-tabs inside Comments & Notes, scoped distinctly:

### Ticket comments
- Scope: **this appointment only**
- Audience: private to business (staff-internal)
- Visual: textarea at top with placeholder "Leave a general comment for this appointment, e.g. appointment updates, client interactions"
- Helper: "Private to business only" under textarea
- Below: `Latest comments` section with chronological list

### Pet notes (with-pets only — tab hidden when `hasPets: false`)
- Scope: **per-pet, persists across all appointments**
- Audience: private to business
- Sub-tab strip per pet in the booking (e.g. `Max` / `Mini`)
- Per-pet textarea with char counter (e.g. `0/3000`)
- Below: existing notes list with author + timestamp (e.g. "Max is awesome. · Created: 04/09/2026 11:51 am by you")
- Matches `project_cami_pet_ownership_model` memory: pet notes travel with the pet, not the booking

### Client notes
- Scope: **per-client, persists across all appointments**
- Audience: private to business
- Single textarea + list
- Matches `project_cami_client_detail_pattern` memory: client notes travel with the client

**Why three tabs not one**: different lifetimes, different searchability. Conflating them loses the distinction between "this visit's quirk" (ticket), "this pet's quirks always" (pet), "this person's quirks always" (client). Moego confirms the split.

---

## Update history (left-rail tab)

Third left-rail icon. Promoted from kebab quick-action (Fresha's pattern) to a permanent left-rail tab (Moego's pattern). The audit log is consulted often enough to deserve a one-click affordance.

Content matches the Activity Log sub-drawer spec above (same entry types). The sub-drawer triggered from the kebab is the *same view* as this tab — keep one implementation, two entry points.

**Decision**: drop the `View appointment activity` item from the kebab quick-actions menu now that it has a left-rail tab. Redundant.

---

## Out of scope (this spec)

Listed so they do not get pulled in:

- **Boarding / Daycare popover variants** — those modes visualize differently (rooms, sessions) per foundations. Slice 5.
- **Walk-in / business-created bookings** — that's PRO-84 / Slice 4 (create-booking sheet). The popover is for *existing* bookings.
- **Today Agenda** — separate surface in Slice 3 (dashboard-style overview); not a popover.
- **Cancel reason code taxonomy** — separate spec / cancel-flow spec.
- **Notification template content** — separate spec under E5.
- **Sale receipt rendering** — links out to E5 Invoicing.
- **Forms entity** + signature capture — banner + Sign Agreement modal *shell* ships v0; full forms entity is post-v0.
- **Grooming report templating** — chip + open-modal hook ships v0; full template editor is its own spec.
- **Group appointments** — post-v0.
- **Pet-on-pet compatibility** — post-v0 per foundations decision 5.
- **Print appointment** (Moego kebab item) — defer to v1.
- **Color code per appointment** (Moego feature) — defer to v1.
- **Pet quick-create from inside booking** — Slice 4 (create-booking sheet) territory.

---

## Open questions (resolve during sign-off)

1. **Quick Panel hover delay**: 200ms feels right for desktop; test with real bookings.
2. **Popover transition**: slide-in vs fade-in. Lean fade-in to avoid drawing attention away from the calendar.
3. **Status icon set**: Lucide consistently across all 7 statuses. `bell-ring` for ready-for-pickup may want a paw glyph variant in with-pets context — open question.
4. **Manual tag entity scope**: per-appointment vs. per-client propagating. Spec says per-appointment for v0. Confirm.
5. **Permission flag implementation**: hardcoded edit-allowed = true for v0, or wire to a stub role check? Recommend hardcode true with a TODO comment.
6. **Status dropdown UX**: open from clicking the colored header pill, or from a dedicated chevron? Fresha uses the pill itself (whole status badge clickable). Lean toward matching Fresha.
7. **Empty notes affordance**: `+ Add note` chip vs always-visible textarea placeholder. Recommend chip (lower visual noise on a panel that already has a lot).
8. **Incident type enum** — Moego uses a partner-configurable list. v0 default set TBD: bite, escape, fall, allergic reaction, illness, equipment failure, other. Confirm with veterinary / industry references.
9. **Grooming report scope** — Moego ships a templated grooming report (sent via email/WhatsApp with photos + notes). For v0 cami, does this ship as a stub chip + future hook, or full templating? Recommend stub chip for popover; full grooming report spec is its own ticket.
10. **Without-pets `ready-for-pickup` skip** — locked: `checked-in → completed` directly when `hasPets: false`, and `checked-in → ready-for-pickup → completed` when `hasPets: true`.
11. **Intake / agreement chip status icons** — pin exact glyphs and colors. Moego uses small text indicators (`5f` / `4f` look like version codes). Cami should use clearer status: filled-check for signed, hollow-dot for unsigned-required, hollow for not-required.
12. **Last appointment hover** — should this fire on hovering the client name, or on a dedicated chip in the tag row? Recommend a `Last visit · 4 weeks ago` chip in the tag row (more discoverable than name hover).

---

## Acceptance for this spec (not the feature)

- [ ] Engineering can implement Quick Panel + Detail Panel from this doc with no additional design calls.
- [ ] State machine + status colors + status icons defined for all 12 statuses (11 universal + `ready-for-pickup` pet-context).
- [ ] Quick actions menu contents enumerated for every status, including with-pets-only `Add incident`.
- [ ] Sub-drawer behavior defined for all three (activity log, repeating, payment policy).
- [ ] Edit pattern (inline vs takeover) defined per field.
- [x] With-pets layer is fully specified (Fresha baseline + Moego additive layer). Pet cards, agreement gate, incident flow, comments / notes 3-tab split, update history left-rail tab, ready-for-pickup state all captured.
- [ ] Terminology consistent: Client (not Customer), Sales (not Invoices), `hasPets: boolean`.
- [ ] Notifications scoped to WhatsApp + Email only (no SMS).
- [ ] Out-of-scope deferrals explicitly listed.

## Spec status — 2026-05-13

Both reference passes complete (Fresha 27 screens + Moego 30 screens). Ready for sign-off review.
