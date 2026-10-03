# Multi-location · on-screen copy audit

Michelle's note: the multi-location body copy explains too much. A screen should
say what is true and what to do; why it works that way belongs in
[multi-location-foundations.md](multi-location-foundations.md), not in the UI.

This is every multi-location string longer than a label, on every routed
surface, with a verdict. Code comments, `/playground` section descriptions and
`/screens` notes are out of scope — those are the team's documentation.

| Verdict | Count | Meaning |
| --- | --- | --- |
| **Keep** | 30 | A state, a next step, a consequence before an important action, or an error |
| **Shorten** | 111 | The fact stays, the reason clause goes ("because…", "so that…", "— which…") |
| **Cut** | 11 | Rationale, a rule, a requirement id, or a restatement of what the screen already shows |
| **Demo** | 8 | Only there to drive the prototype |

Some strings are shared and counted under more than one area —
`write-target-location.tsx` and `money-by-location.tsx` above all — so one edit
there fixes several rows.

## The rules this audit applied

1. **Say the fact, not the reason.** "Changes apply to future receipts only," not
   "…— an issued receipt keeps the details it was printed with."
2. **Don't narrate what the screen already shows.** A select reading "Same as the
   business · Dubai" needs no helper saying it is inherited. A badge reading
   Paused needs no sentence saying it is paused.
3. **No model words on screen.** grant, inherit, bucket, attribute, trading,
   soft-delete, slug, bind, coexistence, cut-over, cycle, record (as a verb).
4. **Location, never branch.** The ticket's own vocabulary rule. "Branch" still
   leaks in about ten places, including two client-facing ones.
5. **Client pages say less than operator pages.** A client is never told why, and
   never told where else a team member works (BG-06).

## Where the cut meaning goes

Each of these is currently explained on screen and should be stated once in the
foundations doc instead. Most already are.

- Paused and archived locations keep their history and take no new entries (R12)
- An empty grant never means every location (R24)
- A service, deposit, tipping or time zone follows the business until a location sets its own; following is live (R06, R19, INV-13)
- Each location has its own receipt sequence (R25); a receipt keeps the identity it was issued under (INV-12)
- A WhatsApp message never reroutes to another location (R21, KC2.2)
- A card payment books to the machine's location
- A moved appointment's deposit stays where it was taken (R17)
- Stock is counted per location; the total is derived, and nothing transfers (R16)
- Payouts are business-wide in this market; fees and refunds follow the payment's location
- A shift clash across locations is refused; time off covers every location (DW2.2, DW2.4)

## Decisions (2 Oct)

- **Suspended, not Paused.** The built product says Suspend everywhere, so the badge and every state sentence now say "suspended".
- **Manage tab copy stays as-built.** It mirrors `LocationsPanel.tsx` in cami-business, so design and build stay in step. One line is raised with Michelle rather than changed: "Owner can sign in and accept bookings" describes the business, not one location.
- **Archived "deleted, kept 90 days" stays as-built for now.** It contradicts R12 (archived stays readable), and the recommendation is R12 — receipts and client history depend on it — but it is backend behaviour, so it goes to Michelle and Maaz.
- **Business defaults, not Workspace defaults.** Tipping now matches every other inherited setting. The as-built string should change too.

## Found while auditing — not copy

- **Move to another location is half wired.** `appointment-detail-sheet.tsx` never passes `destinationChecks`, so the "no slot" and "not offered there" refusals can never appear, and Move only closes the dialog.
- **Closed and Fully booked look the same** on the client's day chips. The difference is only in the `aria-label` (`slot-picker.tsx`).
- **A disabled button with no reason.** A manager's Edit on a chain-wide deal's Availability (`deal-detail-view.tsx:270`).
- **Inbox, not multi-location:** the matched client pane repeats name and phone against T1-D11, and "Partial — visits failed" shows zeros instead of the error the spec asks for.

---

## Settings

`LF` = `components/blocks/location-form.tsx`

| Where | Now | Verdict | Proposed |
| --- | --- | --- | --- |
| LF:345 Add locations, row error | "That name has no letters or numbers to make a link from" | Shorten | "Use at least one letter or number." |
| LF:382 Add locations subtitle | "…Everything else — tax details, invoicing, country — is inherited from the business, and each location can override it later." | Shorten | "Add one or more locations. Each starts with the business's tax and invoicing details." |
| LF:472 Add locations, time zone | "Appointments and reports at this location bucket by its own day." | Shorten | "Bookings and reports use this time zone." |
| LF:948 Hours card | "When this location accepts bookings. Time zone X, inherited from the business." | Shorten | "Time zone: X (business default)" |
| LF:1026 Invoicing notice | "…future receipts only — an issued receipt keeps the details it was printed with." | Shorten | "Changes apply to future receipts only." |
| LF:1203 Manage, live | "Owner can sign in and accept bookings" | Shorten | "Taking bookings" |
| LF:1216 Manage, suspended | "This location is currently suspended — its public booking page is hidden. Unsuspending makes it bookable again." | Shorten | "Booking page hidden. Unsuspend to take bookings again." |
| LF:1217 Manage, suspend row | "…Owner can re-enable any time. Bookings, services, and staff are preserved." | Shorten | "Hides this location's booking page and calendar. Bookings, services and staff are kept." |
| LF:1238 Manage, delete (suspended) | "…A suspended location can't be moved straight to archive." | Shorten | "Unsuspend this location before deleting it." |
| LF:1239, LF:1278 Delete row and dialog | "Soft-deletes the location… The slug frees up after 90 days." | Shorten | "Deletes this location. Its data is kept for 90 days, then permanently removed." |
| LF:1757 Business type | "…We'll use this to suggest service templates and shape the public booking page." | Shorten | "Pick all that apply." |
| LF:2008 Invoicing details | "These follow the location's own address. Untick to give this branch its own invoicing entity — …" | Shorten | "Untick to use different invoicing details for this location." |
| LF:2401 Hours, time zone (inherited) | "Inherited. Change the business time zone and this location follows." | Cut | — |
| LF:2402 Hours, time zone (own) | "This location keeps its own time zone. The business is X." | Shorten | "Business time zone: X." |
| LF:2403 Hours, time zone | "Bookings, rotas and takings are bucketed by the day this location experiences." | Cut | — |
| LF:2676 Receipt sequence preview | "…This sequence is this location's own, so no two branches can issue the same number." | Shorten | "The next sale here prints SHP-…" |
| LF:2776–2777 Deposit helper | "…It will not follow a later change to the business default." / "…Change the business and this location follows." | Shorten | "Set for this location. Business changes won't apply." / "Follows the business default, shown below." |
| LF:2897 Tipping option | "Workspace defaults" | Shorten | "Business defaults" |
| LF:2904–2905 Tipping helper | same pattern as deposit | Shorten | same as deposit |
| `whatsapp-numbers-panel.tsx:84` header | "…A message reaches the branch it was sent to, and never another one." | Shorten | "Each location has its own WhatsApp number." |
| `whatsapp-numbers-panel.tsx:97` info box | "You supply the numbers — … Each migration needs an OTP received at that branch, a display-name approval, and a two-factor PIN." | Shorten | "Use each location's existing number. Connecting it needs someone at that location to receive a one-time code." |
| `lib/locations/whatsapp.ts:74` no number | "…Messages never reroute to another branch." | Shorten | "This location takes no WhatsApp bookings." |
| `lib/locations/whatsapp.ts:79` waiting for OTP | "The six-digit code goes to the number itself, so someone has to be at that branch." | Shorten | "Someone at this location needs to receive the six-digit code." |
| `lib/locations/whatsapp.ts:89` waiting for PIN | "Verified with META. The PIN finishes the bind." | Shorten | "Verified by Meta. Waiting for the two-factor PIN." |
| `whatsapp-numbers-panel.tsx:222` coexistence | "Coexistence is off for this number, so migrating it will lose… ask before the cut-over…" | Shorten | "Moving this number will erase its chat history. Ask Customer Success first if you need to keep it." |
| `whatsapp-numbers-panel.tsx:236` total | "Business total, this period — the sum of every location" | Shorten | "All locations, this period" |
| `comms-templates-panel.tsx:689` | "…so a reply lands with that branch." | Shorten | "Sent from the WhatsApp number of the appointment's location." |
| `comms-templates-panel.tsx:694` | "…— they are never sent from another branch's." | Shorten | "No WhatsApp reminders for X, Y until a number is connected." |
| `payments-settings-panel.tsx:136` deposit | "…and one that has not follows this policy — including any change made here." | Shorten | "Business default. Locations without their own deposit follow it." |
| `team-access-dialog.tsx:157–158` role line | "…Where they can do it is the question below." | Shorten | "Can open location settings." / "Can't change location settings." |
| `team-access-dialog.tsx:172`, `add-team-member-dialog.tsx:918` owner | "…Change the role to grant a named set instead." | Shorten | "Owners can access every location, including new ones." |
| `team-access-dialog.tsx:177`, `add-team-member-dialog.tsx:923` none | "…an empty grant never means every location." | Shorten | "No location selected. This member can't see or do anything until you add one." |
| LF:826, LF:1871 | "Map preview with pin at selected address" | Demo | placeholder for a map |
| `signed-in-as.tsx:59` | "Demo: signed in as" — prints raw role ids | Demo | keep, but show role names |

Keep: the empty Locations list, the Add locations error, the suspend / unsuspend
confirm dialogs, the 90-day archived line (pending the R12 decision), the public
name helper, the tax tip, the Request-a-number toast, the deal with no locations,
the Edit team member subtitle, the business time zone helper, the role descriptions.

## Appointments and team

`WTL` = `components/blocks/write-target-location.tsx`, shared with sales, stock and products.

| Where | Now | Verdict | Proposed |
| --- | --- | --- | --- |
| WTL:161 no access | "You have no location access, so {action} cannot be recorded anywhere." | Shorten | "You don't have access to any location." |
| WTL:169 nothing live | "No location in view is trading… A paused or archived location keeps its history and takes no new entries." | Shorten | "No live location in view. Switch to a live location to add {action}." |
| WTL:196 one location | "{action} will be recorded at **X**" | Shorten | "**X**" on a read-only row |
| WTL:251 paused picked | "X is paused — it keeps its history and takes no new entries. Pick a trading location…" | Shorten | "X is paused. Pick a live location." |
| `move-to-branch-dialog.tsx:151` | "You're only granted this location, so there's nowhere to move it to." | Shorten | "No other location to move to." |
| `move-to-branch-dialog.tsx:167` heading | "The deposit travels with the appointment" — contradicts its own body | Shorten | "Deposit stays at {source}" |
| `move-to-branch-dialog.tsx:172` | "…Neither record changes afterwards." | Shorten | "AED X stays at {source}. The remaining balance moves to {dest}." |
| `move-to-branch-dialog.tsx:183` | "Nothing has been collected yet, so there's no payment to attribute — the appointment simply moves." | Cut | — |
| `move-to-branch-dialog.tsx:213` | "…that notify is manual today, at one location too." | Shorten | "Let the team at {dest} know." |
| `lib/locations/cross-branch-move.ts:138` | "…so this move is blocked." | Shorten | "You don't have access to that location." |
| `lib/locations/cross-branch-move.ts:143` | "The payment already taken can't be attributed across this move…" | Shorten | "The payment can't move to that location. Nothing has changed." |
| `branch-day-strip.tsx:126` (playground only) | "…an appointment belongs to exactly one location, and this view can't choose for you." | Shorten | "Pick one location to add a booking." |
| `scheduled-shifts.tsx:228` empty | "…— a person can be assigned to more than one." | Shorten | "Nobody is assigned to X yet. Assign a team member to see their shifts." |
| `scheduled-shifts.tsx:260` clash | "…so booking refuses those hours at both." | Shorten | "X is also at Y 2–6pm. Not bookable at either." |
| `scheduled-shifts.tsx:508` paused | "…The hours stand — they are still worked and still owed." | Shorten | "X is paused. This week can't be edited or booked." |
| `scheduled-shifts.tsx:519` footnote | "…booking offers a team member here only during these hours, never the location's opening hours. Time off is left out, block times are kept." | Shorten | "{hours} this week at X" |
| `shifts/add-shift-dialog.tsx:218` | "…A shift cannot run across it, at this location or any other." | Shorten | "Time off 9–5. Shifts can't overlap it." |
| `shifts/add-shift-dialog.tsx:231` | "…One person cannot be in two places, so these hours cannot be saved until one of them moves." | Shorten | "Already at X 2–6pm. Change these hours to save." |
| `shifts/add-time-off-dialog.tsx:207` | "Applies wherever X works. Recorded at Y." | Cut | — |
| `shifts/set-repeating-shifts-dialog.tsx:144` | "…— the other locations this person works keep their own pattern." | Shorten | "…Other locations aren't affected." |
| `shifts/set-repeating-shifts-dialog.tsx:209` | "Team members are not scheduled on this location's closed periods. Other locations close on their own days." | Cut | — |
| `shifts/team-member-filter-dialog.tsx:75` | "…— this is what the grid shows, not who works where." | Shorten | "Choose who appears on this week. Hidden members stay bookable." |
| `app/team/scheduled-shifts/page.tsx:213` | "…so there are no shifts to show. Ask an owner to grant you a location." | Shorten | "You don't have access to any locations. Ask an owner for access." |
| `app/appointments/page.tsx:45` | "Edit existing appointment (demo)" + "…status pill visible, CTA = Checkout." | Demo | the only way to reach edit mode |

Keep: both refusals on Edit service, the Add shift description, and "Applies
everywhere X works — A and B" on time off.

**Client-facing:**

| Where | Now | Verdict | Proposed |
| --- | --- | --- | --- |
| `booking/slot-picker.tsx:124` | "X isn't at this branch on this day…" — hints they work elsewhere | Shorten | "X isn't available on this day. Pick another day or team member." |
| `public-branch-picker.tsx:96` | "…Calling is the way to reach them until one is back." | Shorten | "Online booking isn't available right now. Call to book." |
| `public-branch-picker.tsx:123` | "…Each one has its own team, hours and prices. Pick the one you want to book at." | Shorten | "{Business} has {n} locations." |

## Sales, money and packages

Most of the long text in this area is code comments. The screens are mostly tight.

| Where | Now | Verdict | Proposed |
| --- | --- | --- | --- |
| `money/money-by-location.tsx:86` footnote, also in CamiHQ | "Fees and refunds sit with the location that took the payment. Payouts are business-level in this market… so they are not broken out per location." | Cut | — (or "Payouts aren't split by location." if a hint is wanted) |
| `money/money-by-location.tsx:78` | "Each location's own takings, biggest first, and the business total summed from them." | Cut | — |
| `money/money-by-location.tsx:79` | "Your location's takings for this period." | Cut | — |
| `money/money-by-location.tsx:225`, `daily-summary/page.tsx:306` | "Business total — the sum of {n} locations" | Shorten | "Business total" |
| `money/money-by-location.tsx:151` | "No takings at any of your locations in this period." | Shorten | "No takings in this period." |
| `daily-summary/page.tsx:238` | "No takings anywhere in your locations on this day." | Shorten | "No takings on this day." |
| `lib/terminals/charge-at-branch.ts:82` | "…A card payment books at the machine's location, so use a machine at X…" | Shorten | "That machine is at Y. Use a machine at X or take the payment another way." |
| `lib/terminals/charge-at-branch.ts:79` | "This sale has no location yet, and a card payment books at the machine's…" | Shorten | "Choose a location for this sale first." |
| `package-branch-warning.tsx:80` | "…Choose how to handle it and it'll be recorded on the sale." | Shorten | "You can still complete this sale." |
| `expired-package-warning.tsx:44` | "…{n} sessions remain from the last active cycle…" | Shorten | "…expired on {date} with {n} sessions left. Charge the normal price or apply it manually." |
| `expired-package-warning.tsx:45` | "No sessions remain from the last active cycle." | Shorten | "No sessions left." |
| `package-detail-dialog.tsx:295` | "…{n} more were sold at locations you do not hold." | Shorten | "Showing sales at X. {n} more at other locations." |
| `package-detail-dialog.tsx:282` | "It has sold elsewhere in the business." | Shorten | "Sold at other locations only." |
| `new-sale/terminal-lock.tsx:73` | "…The sale updates itself the moment the card clears — you don't need to refresh." | Shorten | "…This screen updates when the card clears." |
| `new-sale/terminal-lock.tsx:108` | "…so you can take cash or another card. If the card has already gone through, stay here instead — the payment lands on its own." | Shorten | "The machine stops waiting for this sale. If the card has already gone through, keep waiting." |
| `money/money-activity.tsx:268` | "There is money in this period, but none of it matches what you have filtered to." | Shorten | "Try changing or clearing your filters." |
| `daily-summary/page.tsx:428` | "Nothing has been sold since, so this is your last trading day." | Demo | the seed stops before today |
| `new-sale/terminal-lock.tsx:96` | "Mark as paid (for demonstration only)" | Demo | |
| `app/catalogs/packages/page.tsx:154` | "Reset demo packages" | Demo | |

Keep: the three package mismatch facts (priced differently, booked longer, not
offered), and the "No takings this period at X" quiet-locations line.

## Catalog, stock, clients, public and CamiHQ

| Where | Now | Verdict | Proposed |
| --- | --- | --- | --- |
| `product-branch-stock.tsx:118` | "This product is not counted, so there is nothing to track per location…" | Shorten | "Stock isn't tracked for this product." |
| `lib/inventory/branch-stock.ts:179` | "…A location below zero has sold more than it received, which a stock take fixes rather than a reorder." | Shorten | "1 location is below zero. Do a stock take." |
| `lib/inventory/branch-stock.ts:183` | "…so nothing can be sold there until they are restocked." | Shorten | "2 locations are out of stock." |
| `lib/inventory/branch-stock.ts:187` | "…so it is worth ordering before they run out." | Shorten | "2 locations are at or below their reorder point." |
| `lib/inventory/branch-stock.ts:195` | "…which a stock take fixes rather than a reorder" | Shorten | "{n} below zero (needs a stock take)" |
| `product-branch-stock.tsx:353` chip | "Count is wrong" | Shorten | "Below zero" |
| `product-branch-stock.tsx:275` | "Business quantity — the sum of {n} locations" | Shorten | "Total ({n} locations)" |
| `product-branch-stock.tsx:285` | "A sale, adjustment or delivery changes only the location it happened at. Stock is not moved between locations." | Cut | — |
| `product-branch-stock.tsx:286` | "A sale, adjustment or delivery changes this location's count." | Cut | — |
| `surface-states.tsx:80` | "Couldn't load X. Nothing has been changed — try again, and if it keeps happening, check your connection." | Shorten | "Couldn't load X. Nothing was changed." |
| `product-form.tsx:617` | "Each location keeps its own count… the business quantity is the sum of them and is never set directly." | Shorten | "Stock is counted per location. Use Add or Remove stock to change it." |
| `product-form.tsx:649` | "…takes its own deliveries — the business quantity is the sum of them, never set directly." | Shorten | "Other locations start at 0." |
| `product-form.tsx:671` | "…— a busy location and a quiet one rarely reorder at the same number." | Shorten | "Set per location on the Stock by location card." |
| `product-form.tsx:672` | "…; every other location sets its own." | Shorten | "These apply to the location above." |
| `ServiceLocationsSection.tsx:126` | "This service is defined for the business and will apply everywhere…" | Shorten | "Add a location in Settings to set prices per location." |
| `ServiceLocationsSection.tsx:136` | "This service is defined once for the business. Each location inherits it, and can differ on any field…" | Shorten | "Business default: AED 120 · 60 min." |
| `ServiceLocationsSection.tsx:182` | "This location is archived and takes no bookings. Its menu is kept for its history." | Shorten | "Takes no bookings." |
| `ServiceLocationsSection.tsx:183` | "This location is paused, so nothing is bookable here yet…" | Shorten | "Changes apply when it reopens." |
| `ServiceLocationsSection.tsx:353` | "Set for this location" / "Inherited from the business. In minutes" | Shorten | drop when Custom; "Business default" otherwise; unit as a suffix |
| `ServiceLocationsSection.tsx:267` | "{n} branches inherit the business default" | Shorten | "{n} locations use the business default" |
| `NewServiceSheet.tsx:445` | "Save this service first, then reopen it to set its price, duration and availability per location." | Shorten | "Save the service first to set prices per location." |
| `CategorySection.tsx:134`, `category-at-branch-preview.tsx:69` | "Not offered at X. The business has {n} in this category, all turned off here." | Shorten | "Not offered at X." |
| `lib/locations/visit-access.ts:92` | "Read-only — X is paused and takes no changes." | Shorten | "Read-only — X is paused." |
| `client-detail-dialog.tsx:1852` | "Visits by branch" | Shorten | "Visits by location" |
| `admin/business-locations-section.tsx:72` | "…trades from one location, so there is no chain to view. The owner can add branches themselves at any time." | Shorten | "One location." |
| `admin/business-locations-section.tsx:163` | "Off. X sees no branch switcher and nothing per-branch until this is on." | Shorten | "Off. Locations are hidden from X." |
| `admin/business-locations-section.tsx:185` | "Data check passed — every record resolves to a location (R20)." | Shorten | "Data check passed." |
| `admin/business-locations-section.tsx:210` | "{live} trading, {n} not. Everything here is the owner's own record, read live." | Shorten | "{live} of {n} live" ("All live." when none are paused) |
| `admin/business-locations-section.tsx:282` | "Branches are added and configured inside the account, as the owner — the same setup they would use themselves…" | Shorten | "Add locations from inside the account. Changes are recorded against you." |
| `category-at-branch-preview.tsx:48`, `:79` | "Emptied categories hidden / shown", "{n} category not shown." | Demo | playground only; also missing plural |

Also changed after review: every "Inherited from the business" on the Invoicing tab and its edit dialogs now reads "Business default", the same words as the service editor, and the receipt prefix drops "Type to give this location its own."

Keep: no access to a visit's location ("An owner can grant it"), a visit at a
deleted location, the client 404, the HQ "On since…" line and the failed data check.
The setup location step has no multi-location copy.
