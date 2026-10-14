# /playground: the full section descriptions

Each section on [/playground](../app/playground/page.tsx) carries a one-line description. The
longer ones it used to show (why the component is built the way it is, which decision each
state answers) are kept here, lane by lane.

## blocks-lane

### Empty state

Centered placeholder for sections with no data. variant='plain' (default) is the borderless, muted in-section treatment. variant='card' wraps the same light line-icon and muted title in a dashed self-framed card — the full-page listing look used by the sales / clients / pets / products / appointments tables when a search or filter returns nothing.

### Recency badge

Recency indicator next to client / pet names. Common labels: 'New' (≤14d since first visit), relative time like '4 weeks' (between), '90+ days' (>90d since last visit).

### Avatar stack

Stacked avatars with overlap + an overflow indicator. Hover any avatar to see the name; the +N chip lists the rest. Used for family / staff / contributor lists where vertical space is tight.

### Linked entity chip

Small avatar + name pill, clickable. Used for Owners list on Pet detail and similar navigation chips.

### Note callout

Notion-style note pill. Lightbulb on a soft sand background. Used inside edit dialogs to flag side-effects ('Once saved...').

### Page header

The title row of a listing page, passed to AppShell or AdminShell as header. Title, one line of description (a count, or what the page is for) and an actions group kept together on the right.

### Inline notice

A tinted box with an icon and one short message, for settings panels, dialogs and card footnotes. No accent border. Anything with a title or buttons is built in place.

### Pickable card grid

Multi-select cards with icon, label, and a check indicator. Used for picking business types in the Edit business type dialog.

### Timeline row

Vertical timeline used by Appointments / Visit history. Date / leading slot on the left, thin connector with a small dot, card on the right. Layout inspired by Luma's event list.

### Section card

Section panel used inside detail surfaces. Title + optional right-aligned action + body.

### KPI card and grid

Static metric tiles for Overview-style headers. KpiGrid is 2-col by default; override className to change.

### Settings card

The card every settings panel is built from: one 146 (584px) footprint from sm up, so a column of cards shares one edge. className sets the inner gap or a row layout, never the width.

### Settings row

Icon + label/value stack used inside settings summary cards. When the value is null the row collapses into a subtle 'Add {label}' pill.

### Sectioned sheet shell

Two-column layout for sectioned add/edit takeovers (FullScreenEditDialog). Vertical sidenav left, scrollable content right. Optional leading slot above the nav for cases where you want identity context (e.g. Edit). Detail surfaces use a different pattern — see the next section.

### Address search field

Search first, structured fields second — picking a place fills the grid, which stays editable because the trade licence is what has to match, not the places result. Manual entry is the first row of the dropdown, not a fallback reached by failing. A picked place stores its placeId and coordinates; edit the text afterwards and the line under the field drops them (PRD-144).

### Add a signature dialog

Standalone signature-capture modal: full name + Title, a Type / Draw segmented toggle — Type renders the scripted preview + Signature ID, Draw is a pointer canvas pad with Clear. Sign is disabled until valid. The public signer flow (/sign) now captures the signature inline in its split layout rather than in this modal; kept here for reuse elsewhere.

### PDF viewer

<PdfViewer> renders PDFs on a canvas (react-pdf / pdf.js) inside our own themed scrolling container — no native viewer chrome. Pages fit the container width; a floating dark toolbar carries zoom (50–250%) and page navigation, tracked as you scroll. Client-only. Used by /sign, the operator 'View form' layout and Files → Preview.

## business-lane

### Inbox Phase 0 — list, composer, client pane

ENG3-33 / T1 — the WhatsApp inbox pieces in the states they can be in: an unmatched number (the number is the title, never a made-up name, dashed person avatar), failed rows, the chat list loading/empty/error, the composer with the window open (one countdown line, colored under 2 hours), closing soon and closed (one sand row, templates only), and the client pane as ClientSummary (Pets with pet notes first, then Upcoming, Last visits and Client notes; new-client and failed-read states) or, unmatched, Match and Add only. Unread is out of Phase 0. The full flows, send, retry, templates, media, match, add, are on /messages/inbox/phase-0; docs/specs/ENG3-33-inbox-phase-0-walkthrough.md walks each one.

### Multi-location — a deal, and where it runs

DW3.4 — the row states Settings → Marketing → Deals can be in, side by side. 'All locations' is a NAMED set that a branch opened next month joins; '3 locations' is today's three and is not. The last was saved with nothing chosen: the dev repo's mapper reads that same empty shape as ALL, while R24 says an empty scope never resolves to all. A deal that reaches nobody can never read Active — an owner believes the badge.

### Multi-location — branch switcher

SCR-04. The control every other multi-location surface is read through: which branch am I acting on? Scope spans one branch, a named subset, or all granted branches (R03), and never resets the filters or date range a user already set (DW1.1). Each frame below is its own scope, so the states sit side by side.

### Multi-location — branch lifecycle

SCR-01's state half (R01, R12). Four states, each named for its consequence: suspended hides the booking page and stops the calendar, archived takes no writes ever again. Live renders nothing on purpose — badging every healthy branch makes the two that need attention harder to find. The full panel, with Suspend / Reactivate / Archive, is at /shell-demo?settings=locations.

### Multi-location — per-branch hours

SCR-01's hours half (R01, R19). Each branch keeps its own week and timezone: JVC closes Sunday, Jumeirah trades seven days, Al Quoz shuts over the middle of the day — which is why a day holds shifts rather than one open and one close. Pinned to a Tuesday afternoon, Al Quoz reads Closed now and its public card says 'opens 4pm'. Editable in settings, and the edit reaches /shampooch-jvc.

### Multi-location — per-branch availability

R15's other half. Day chips come from the branch's hours, so a day it does not open reads Closed rather than Fully booked — different facts, and showing one as the other sends a client back to a day that will never have a slot. Slots are the hours at half-hour steps, so Al Quoz's midday gap is absent rather than filtered. Staff filter by the branches they work at. Friday below, because all three differ there.

### Multi-location — where a promotion runs

DW3.4 (R04, R24). A chain-wide January offer and a quiet branch discounting a Tuesday are both real and must not be the same object. The scope is a named case or a list, never an empty list standing in for 'everywhere' — which is what the dev repo's mapper does, turning allVenues into locationIds: []. One shape, two opposite readings: that is how an offer meant for one branch runs at nine. Rules in lib/locations/promotion-scope.ts.

### Multi-location — the duplicate caught before booking

CL-A1 / RC-B1, R13. The story ends 'duplicate caught BEFORE booking', and only its readable half had shipped — SCR-07 answers the question if reception thinks to ask it, and somebody mid-booking does not. So it arrives unprompted under the client picker. Unbounded by the grant, because the duplicate worth catching is the one at a branch you cannot see. States, never blocks: two appointments in a day is routinely correct.

### Multi-location — who may change what about a branch

Who may change what, as one table, because six surfaces ask the same four questions and six inline answers drift — the one that drifts quietly is the one that lets somebody through. Only the owner creates or suspends a branch, sets who holds which, edits tax details, or assigns a WhatsApp number. A manager changes service settings, and only at the branches they hold; reception and a groomer cannot at all. This table is the rule reference. On the real screens a refused action is absent rather than greyed with a reason, the way the built product gates by permission — the dashed 'sign in as somebody else' strip at the bottom of the Locations panel switches who is reading.

### Multi-location — a category a branch has emptied

One category list belongs to the whole business and a branch cannot re-file a service into another one — all that varies is which services it has turned on, so a category can hold nothing at a branch: three spa services, and no spa room here. The answer depends on who is reading. A CLIENT can do nothing with a category this branch does not run, and a heading over nothing is a dead end that invites them to leave — so it is hidden. RECEPTION is the person who can say 'not here, but Jumeirah does it', and hiding it leaves them to find that out by telephone — so it stays, with the absence said out loud. That is the split `locationsOffering` already makes for a single service, and the same reading as KC1.5: tell the operator, do not burden the client. Add-ons is the control in both frames: partly on, so the two have to agree about it.

### Multi-location — packages at the till

SCR-13 (R08, KC1.5, R11), rebuilt 22 Sep against the as-built. The product applies a client's packages ITSELF — `allocatePackageSessions` spends the remaining sessions across the cart, one per line, in order — so there is no Apply button and never was. A covered line reads 0 with its real price struck beneath it, which the built sheet calls a display device rather than a price anyone typed, and the chip counts down as each line spends its own session. Ours is the branch half the contract has no room for: a package sold at one branch, redeemed at another that prices the service differently, warns and still completes. The warning sits on the line it is about and the decision is recorded, so an owner reading a discount can see why.

### Multi-location — scheduled shifts

SCR-10 (R05, DW2.3, DW2.4). The built product's grid, per branch: members against Mon–Sun, hours per person and per day. A schedule belongs to one location, so somebody assigned to two appears on both with the hours they work there. Lena is JVC mornings and Jumeirah evenings — no conflict. Tala is rostered at both over the same hours, the one clash DW2.4 names. Leave is the person's and shows at both; shifts and block time stay at their own branch. Read-only — the writes are on /team/scheduled-shifts.

### Multi-location — per-branch stock

SCR-11 (R16, R18, DW4.1–DW4.2). Quantity and reorder configuration resolve per location and the business quantity is derived, never stored — which is what makes 'I never reconcile it by hand' true by construction. Rows first, total after: 18 at one branch and -2 at another add up to a healthy-looking 16. Empty and negative stay apart — zero is a reorder, below zero is a stock take. Healthy branches fold and the rest cap at five worst-first. Thresholds summarise until you press Edit reorder points.

### Multi-location — nine branches (D5)

The designs at the scale the PRD assumes. Three branches is the demo; nine is where the layouts fail, the same way every time — most rows say nothing and the one that matters is below the fold. Both states are drawn so the call can be made by looking: collapsed folds the inheriting branches into one line that names them, expanded is the nine cards. Under four quiet branches nothing collapses. The switcher and the money roll-up are here at nine too.

### Multi-location — chain setup

SCR-02 (R02, SU1.2). N branches in one pass, because growth must not be a second onboarding. All or none — submit with one bad row and nothing is created, since a partial create leaves the owner unable to tell which of nine landed. Try two rows with the same name for the link collision, or 'Shampooch JVC' for a taken slug. Isolated, so creating here does not touch the app's own estate.

### Multi-location — branch access grants

SCR-03 (R04, R24). Two independent axes: role capability is what, the location grant is where, and neither widens the other. The owner's list is untickable — an owner holds every branch including ones added later, stored as 'all' rather than today's ids. Ahmed's empty grant is said out loud: no access, never 'every branch'. Four of the five location permission codes are marked Proposed.

### Multi-location — a write names one branch

G1 and R11. Every operational write lands on exactly one branch, with no default — the PRD's release criterion takes that fallback out of the repo. Three sentences, not one styled three ways: one branch in scope is resolved and stated, several is a required choice, none says no write is possible (R24). A suspended branch is listed and badged rather than hidden (R12). Live on the appointment sheet, where Save waits for the branch and the service picker reads against it (DW3.3).

### Multi-location — client visits at another branch

SCR-07 (R13, R18, G1). Millie: four visits and three sales across three branches. The read is never narrowed — one business, one owner, one P&L. The grant narrows what you may DO: as the owner every visit carries its actions, as JVC reception the Jumeirah visit still reads in full, price included, with its buttons replaced by the reason. Al Quoz is suspended, so it takes writes from nobody. Overview gains 'Visits by branch'.

### Multi-location — per-branch service pricing

SCR-09 (R06, DW3.1–DW3.3). One service defined once, configured per branch. Type over a price to override that field; the marker under it says whose value it is, and Reset returns only that field to inheriting. Then press 'Raise the business default' — the inherited branches follow, the overridden field does not. That divergence is the requirement.

### Multi-location — public branch picker

SCR-08 (R15, GB3.1). A chain's public page asks where before it shows anything branch-shaped, because it has N addresses, hours and menus rather than one. The branch's own link skips it (GB3.2), and neither path guesses. Only published branches are listed — the suspended one is absent rather than greyed out. 'Open now' is pinned to a Tuesday 11am so the row is deterministic.

### Multi-location — branch WhatsApp numbers

SCR-14 (R21, R22, KC2.2, KC2.4). Inbound resolves from the number it arrived on and never falls back, so per branch the number is what decides whose message it is. Three states: JVC connected, Jumeirah stuck on the OTP (the step that needs a person standing in that branch), Al Quoz with no number at all, which says so in words. Contrast SMS, where an unapproved sender ID falls back to CAMI — a generic sender still reaches the right person, a wrong WhatsApp number reaches the wrong branch.

### Multi-location — no location access

P1.4.6. A person holding no location sees this in place of every operational page. Sign in as ahmed@getcami.io from the dashed strip under Settings › Locations to see it live.

### Multi-location — somebody working at another location

SCR-10, reception's side (DW2.3, DW2.4). The Team member list is this location's people only. Somebody rostered here but working at another location over the slot moves to 'Busy at another location' with where and until when, and is refused — blocked, never warned. Somebody not at this location is not offered at all; already on the line, they get a different sentence. The client's flow drops the same slot and names nothing (BG-06). Open the Team member list in the first frame.

### Multi-location — loading and error

PRD-169's Done-means: every screen drawn empty, loading and error. Empty is each surface's own sentence because the facts differ — no branches granted (R24) is not no deals. Loading keeps the rows' shape so nothing jumps. Error says what failed and that nothing changed, and never shows a partial list: six branches that should be nine reads as a smaller business (G7), so stock drops its total rather than summing what arrived. Team access also refuses Confirm and never claims 'No location granted' before the grant has loaded.

### Multi-location — money by branch

SCR-15 (R09, R18, KH1.1–KH1.3). Side by side, never merged: an owner asking how the day went is asking which branch had a bad one. The total sits after the rows and is labelled as their sum. The second frame is the same component for a manager granted only Jumeirah — one row, roll-up equal to it, their real number rather than an error (KH1.3). The bound is a grant, not a filter, so the wider result is never fetched.

### Multi-location — cross-branch move

SCR-06 (R07, R17, GB1.1–GB1.3). The one operation that touches both branches at once, and every way it fails is a way money or access fails. Destinations are bounded by grants. Pick Jumeirah for the allowed case — the deposit stays credited where it was taken while the work moves, because R17 records both and rewrites neither. Al Quoz is suspended and refused (R12). The third frame's payment cannot be resolved, so the move is rejected whole (GB1.3).

### Multi-location — all-branches calendar

SCR-05 (R07, R11). The filter half of 'per-branch columns or filter', and a filter on purpose: a day grid is already staff × time, so a third axis turns 11 columns into 99. Click a branch to narrow the day to it, click it again to go back. The counts are why it is a strip and not a dropdown — an owner opening the calendar across branches is asking which branch is busy. With more than one in view, a new booking needs one chosen first.

### Multi-location — package mismatch at checkout

SCR-13 (R08, KC1.5), corrected 2026-09-03 off Chaps & Co's real Fresha account — the earlier design had it backwards. Gift cards and memberships travel across branches; a package is sold against one specific priced service and does not. Warn, never block: operators already work around a block by hand, so blocking does not prevent the outcome, it makes reception do it slowly in front of the client. Both figures are shown, and the choice is recorded on the sale.

### Appointments — booking block

Booking card rendered on the People grid. Color carries service category, fill saturation and border style overlay status. All content elements (time, price, name, service, icons) render at every size; truncation handles the squeeze.

### Appointments — toolbar and people grid

Calendar toolbar (Today, date, view mode, filters, new) above an 11-column staff × time grid. Right-side filters are placeholders pending tighter Figma reference.

### Appointments — pickup & pet notes

Pet-address capture on the staff sheet (<PickupFields>) and its read-only rendering on the calendar card. The field is the same map search as billing, so a picked place stores a pin and the line beneath says whether this one has it. Pet notes sit outside the tick — allergies and handling matter on every appointment. The card below is the ONE hover card: identity once, every service with its performer and price, the note rows, and the branch, because staff do not settle it — Lena Petrov works JVC and Jumeirah both.

### Client notes (Staff Alert)

DZ-209 — three note kinds share these surfaces and telling them apart is the point: client notes travel with the person, the appointment note is the occasion, pet notes travel with the animal. The card is a PREVIEW, not the archive, and the bound is on the content (two notes at two lines) so nothing is cut mid-glyph. Deliberately not an amber warning slab — ClientNote carries no severity, and that treatment marked every written-about client as a hazard.

### Pet notes — structured categories

Replaces the single free-text box, which gets skipped or filled with prose nobody can filter on. Multi-select chips keep it fast for the parent and give groomers comparable data; the specifics field is required once a chip is on, because a selected chip with nothing typed is no better than the blank box it replaced. 'Other' is a genuine fallback, not the default catch-all. Same component on the public flow and the staff sheet.

### Navigate to address

The driver's half of PRD-144, wherever a pet address is shown read-only. Opens Google Maps in directions mode rather than search mode: on a phone that hands off to the native app with the trip already loaded. A picked address routes to its stored coordinates; a typed one falls back to a text query and says 'Search in Maps' instead of 'Navigate', because a query that lands on the wrong side of a villa cluster should not look like a promise.

### Product pickers — brand, category, supplier

One dialog, three configs. Search a list, pick one, or add a new one in a second dialog and have it picked. Suppliers show no product count and ask for a short description when added.

### Service menu — cards & sidebar

Presentational building blocks for the catalog screens. Full interactive screens (drag-reorder, add/edit, archive) live at /catalogs/service-menu and /catalogs/categories. Prices render in AED. Combos come back from the same endpoint as single services, so the card marks them with a tinted Combo badge (layers icon) plus a count of the services they bundle — PRD-143.

### Online booking — promo code

DZ-352. The booking Review step's promo code, with every state produced by the real rule (`evaluateBookingCode` in lib/deals/online.ts) running against the seeded JVC codes. The review states show where the code lands: line captions, the Promo code row, VAT on the discounted total, and the AED 0 case. "Two codes" is one promotion per line (D6): SPA20 on the teeth brushing and WELCOME15 on the groom, each line naming its code. Refusals has one row per reason, including a code already applied and one whose services another code already covers. Field also has the two states a server check brings: "Re-checking after a change", where each card reads "checking" with no amount and Confirm waits, and "Couldn't check", where the request failed and the code stays in the field for another try. "No longer applies" is a code applied before the booking changed under it.

### Deals — redeemable on your booking page

DZ-200 D10. The deal wizard's details step with the online-booking switch. Off, the code is optional. On without a code, the step shows the error and Continue is disabled. On with a code, the step is ready to continue.

### Deals — list statuses

Synced to the dev repo's `promotion-discount-ui` (12 Oct). Expired is its own status, apart from Inactive: Inactive is a deal switched off by hand, Expired is one past its end date, and its Activate is disabled. The row menu's Delete archives the deal, with a "Deal deleted" toast; activate, deactivate and duplicate toast too.

### Deals — at the till

Synced to the dev repo's checkout. A promotion on a line shows as a green "Promotion · name" chip with a ×. The summary has one row per promotion, summed across its lines and carrying the rule ("- 20%"), then the order-level "Cart discount". On Tip and Payment, the discounts sit before Subtotal and VAT, because VAT is worked out on the discounted total and the tip is not taxed. In the line's edit dialog, one promotion per line: the select locks once one is picked and the × clears it. A limit greys an option, with its reason on hover. Before Pay, Save unpaid or Save draft, any promotion that stopped applying comes off with a toast, and the save stops so the new total is seen first.

### Combos across surfaces

PRD-143 — a combo is a bundle sold as one catalog entry. While it is being CHOSEN the row carries a Combo badge and a bundled-services count; once PICKED it becomes its component services, each named 'Combo - Service' with the standalone price struck through. The cart footer states the saving as a Bundle discount rather than subtracting it twice. docs/specs/catalogs-service-menu-combo.md.

### New sale — Gift cards in checkout

Selling a gift card from the POS drawer (/sales/new-sale → Gift cards). The Add/Edit gift card dialog sets value, price, expiration, an optional custom code, the is-a-gift + confirmation-email toggles, and the attributed team member. On the payment step a notice blocks paying for a gift card with another gift card; the Gift card method otherwise opens a redeem-by-code dialog.

### New sale — Payment link (self checkout)

The operator half of CamiPay (PRO-396, reworked in PRO-909). 'Payment link' texts the client a link they pay on their own phone. Sending it creates a draft sale and locks the cart — amount and method frozen so the link and the sale cannot drift apart — so the drawer body becomes the lock screen rather than narrating progress the operator cannot act on. Links live 12 hours. Cancel invalidates the link and hands off to the draft it created; Mark as paid is the manual settle path.

### New sale — POS Terminal (card present)

The card-present adoption of PRO-909's locked cart: once a sale is sent to a machine the drawer body is replaced, so the operator cannot re-charge it or discard a sale that already took the money. Mark as paid stands in for the terminal callback; Collect another way is the only exit and keeps the cart. Only a signed-in machine can be picked, and every other state carries its reason.

### Payment policy — deposit & no-show config

Payment policy (DSG-51) inside the Settings dialog (?settings=payments). Summary panel → policy editor takeover, with the customise-by-service table and the client-facing terms editor. The configured policy drives the appointment sheet's Payment policy card — deposit from the percent/fixed default plus per-service overrides, hidden entirely when no policy is set. Shown here: the shared percent/AED input and the generated example line.

### Terminals (DSG-62)

Per-device terminals: each unit registers with its own code and PIN, and a session is time-boxed. The superseded model shared one merchant PIN, so removing a terminal signed out every location. Rows lead with the device name, carry the session state, and the menu offers only what that state allows. The faint demo controls walk one unit through Not paired → No sessions → Active.

### Notifications settings

Three cards: Sender ID (with 'Customers currently see CAMI' only when the two differ, and Edit disabled while a registration is pending), Reminders (6 events × 3 channels with per-message rates, event labels linking into their template editor), and Usage this month (share-of-cost meter and a month-end estimate off a period aggregate rather than the paginated log). Three faint demo controls walk the Sender ID states and the WhatsApp grant.

### Communication templates

DSG-83 — Notifications decides whether an event sends, this decides its wording, so there is no send toggle here. Per-channel tabs over one card of 6 rows, keyed on the same event list the Reminders matrix uses. The editor is form left, sticky preview right, with clickable {{placeholder}} chips; an unknown token sends as written, because a typo has to be visible here and not in a customer's inbox. {{cardLink}} is line-scoped like the review link, so a venue without a card drops the whole line.

### Google review link (PRD-168)

PRD-168. A Google Business Profile URL and a Google review URL are different things: the first drops the customer on the listing to hunt for 'Write a review', the second opens the review box. PILOT-30 exists because the previous tool got that wrong and the merchant lost ~50 reviews without noticing. So a listing URL saves with a warning rather than being rejected, and anything non-Google is refused. With nothing set, the review line drops out of the Thank You message (DZ-263).

### Money — account summary (DSG-77)

Split custody made legible: terminal money is held and paid by NeoPay, online money by Cami. Every figure is derived from one ledger (lib/money), so the breakdown arrives at the headline instead of asserting it — the defect the benchmark shows at 9.3x. D6 is undecided, so both layouts are here.

### Money — activity and detail (DSG-78)

The itemised feed under the number. Day groups carry a NET subtotal rather than takings, so a heavy fee day cannot read as a good one. Rows carry direction in the icon and colour before the sign. Open any row for the detail panel; open a payout row to drill into what it carried and watch the contents sum to the payout figure.

### Money — bank account (DSG-75)

The one control that can redirect every dirham the business takes, so changing it is a multi-step flow and never an inline edit. The reference version is a masked account and an Edit button; this adds a verification state, both senders shown against the single account they pay into, and a change log that keeps failed attempts. The state worth clicking is the gateway failure — it must leave the old account untouched and say so.

### Money — invoices and fees (DSG-76)

What Cami charged, per period, with the current month pending. Cami's statement is a different document from the benchmark's: no subscription line (the OS is free), the rate stated on screen rather than only inside a download, and every fee expandable to the sale that caused it. Each line renders the rate snapshotted at capture, so a past statement never re-rates after a renegotiation.

### Money — billing details (DSG-74)

Four values, held once, printed on every tax invoice the merchant sends and every invoice Cami sends them. Missing fields collapse into an Add pill rather than a blank row, and the no-TRN state names its consequence: ordinary invoices with no tax wording. Edit says changes apply forward only, and takes the registered address through the address search field rather than a free-text box.

### CamiPay fee breakdown — Partner side

PRO-737. What the Partner sees on their own sale detail (/sales/sales-list, open a sale paid by CamiPay): Sale amount → Cami fee → Net, with the calculation spelled out under the fee so the number is never a black box. The gateway's processing fee is deliberately absent — the Partner pays Cami's fee and nothing else. The rate is snapshotted at capture, so a later change never restates it.

### Invoice document — A4 downloadable

DSG-72. One component renders the PDF download, the email attachment and the unique invoice link, so field order is identical across the three by construction. Paper, not app chrome: white-with-dark-ink in dark mode and no badge chips — payment state is carried by the Balance, and only Refunded and Voided get a line of prose. Previews scale to 34%; open /sales/invoice-document?state=<id> for full size.

### Invoice document — share & email actions

DSG-72. The two modals behind the sale detail dialog's actions, matched to the shipped implementation in cami-business rather than to a screenshot. Neither navigates away from the sale — that is the shape every production action on this dialog shares. Share invoice hands out the unique invoice link, which renders the same document as the PDF and the email attachment.

### Product import — review states (DSG-80)

The redesigned bulk-import review. Aya's migration from the Slack thread is the reference case: 100 rows, 83 added, 17 blocked for a missing SKU. The complaint was that those 17 shared one cause and the shipped UI made you expand each row to find it — so causes are grouped and stated once, and the last column says what happens in words rather than counting errors. Compare with what ships today via the compare bar.

### Clients and pets import — review states (DSG-84)

The same wizard on the other two entities. Production serves all three from one component set, so these are the product import's parts with different counts. What is genuinely specific: name matching — a row matched on first name alone, which products have no equivalent of — and a pet row, which carries an owner and a pet with separate outcomes. The reference cases are Aya's 100-row client file and Maaz's 873-row pet file. Compare at /clients/import.

### Performance dashboard — chart primitives

The four marks the Performance dashboard (DSG-79) is built from, plus the categorical palette they share. Colours come from the --chart-cat-* tokens; both the light and dark sets pass the dataviz validator, so check this section in both themes.

### Reporting module (DSG-43 / PRO-703)

The shared view templates that render every report from lib/reports/registry.ts. Config-driven — columns, group-by, filters and date control come from each report's definition. All amounts AED.

### Customer card — per-venue theming

Task 2 + 3 of the Client Card brief, drawn from the same client row the operator dialog renders — one record, two faces. Wallet, loyalty, next appointment, staff-maintained preferences, and one path back to booking. Reception-only fields are excluded where the view is built, so they cannot leak by a careless prop spread. Theming is five palettes and Cami's Manrope throughout. The empty card teaches the two kinds of nothing: an outlined wallet with none yet, against a loyalty section absent because that venue runs no programme. Live at /sota/card.

### Client card — the two faces

The brief's own side-by-side, runnable. Both halves come from one client row (Maaz Shaffi) through the same resolver: identity, wallet, last/next appointment and preferences appear on both, and nothing about the layout, type or colour crosses between them. That is the test for whether the record is venue-agnostic before Tech commits to a schema, and the asymmetries it caught are why preferences exist on the operator side at all.

### Client card — message to card

The brief's page 6, runnable: trigger → message → branded login → their card. Four working screens is not the same as a journey that works. The venue's mark now appears in panel 2 and carries through unbroken — before, the message was a grey notification from nobody and the branded page was the first branded thing a customer met, one tap too late. Panel 3 tells the customer the link is personal; panel 4 is everything that link exposes.

## detail-views-lane

### Client detail dialog

Centered Dialog modelled on <BusinessDetailDialog>, ~630px, sticky header with Book now + Actions, underline tabs with a 'More' overflow for Documents and Settings. Overview leads with identity chips over a lifetime strip, then Visits (Next above Last, one-tap Rebook), Wallet, Preferences, Pets, Notes. Every field is the client's own, so open several from /clients rather than judging it on one.

### Pet detail dialog

Same shell as Client detail. Stacks over the client dialog when opened from inside it. Tabs: Overview · Family · Visit history · Pet details · Documents. Multi-owner aware — chip row in the header. Actions menu has Edit pet details + Delete pet.

### Team member detail dialog

The Client / Pet detail shell for a team member. Sticky header (avatar, permission access, email, phone, Edit, Actions) over two tabs: Overview (KPIs, Works at, Services, Notes) and Details (profile, role, addresses, emergency contacts). Owner rows lock profile and role edits; a pending invite shows an empty Overview. Add uses the full-screen takeover instead.

### Boarding & daycare booking drawers

Right-side Sheet drawers on the <AppointmentDetailSheet> model. Boarding is night-based (rate/night, check-in/out, Subtotal by nights); daycare is duration-based ('Full Day · Up to 8 hours', Subtotal by minutes). Both share the collapsible customer card, pet card, editable status pill, add-on chips + Add menu, late-checkout toggle, notes and a sticky Check Out.

### My profile (settings panel)

Personal info for the signed-in user, scoped to DSG-63's 'view and edit contact details': one Contact card with legal name and masked mobile/email behind a single Edit takeover. A new mobile goes through a 6-digit OTP, a new email through a 'Check your inbox' dialog with a 30s resend — the link click itself is the faint demo control bottom-right. Pending changes show as a badge on the affected row.

### Add / Edit takeovers

<FullScreenEditDialog> + sectioned sidenav. Quick-create rule: only the first name (client) or name + species (pet) are required. Edit mode pre-populates fields and deep-links to the relevant section.

### Global search takeover

Full-screen search from the topbar magnifier or Cmd/Ctrl+K, reusing <FullScreenEditDialog>. Searches clients by name, mobile, email or pet, and bookings by client name or reference (try 'B-77342'). An empty query shows upcoming appointments and recently added clients. A result opens its detail dialog or sheet, stacked over the takeover.

## hq-lane

### Cami HQ — CamiPay settlement config

PRO-737. The Settings tab of the HQ Partner detail dialog: one card, one section per rail — whether it is on, where it routes, and what Cami charges. A rate is a percentage plus a fixed per-transaction amount, optionally with a ceiling above which the fixed part drops off. Rates are append-only, so the only write is Change, which adds a row with an effective-from date. A live rail with no rate row earns Cami nothing and says so.

### Cami HQ — terminal fleet, Partner card

DSG-82 — Cami owns the machines and leases them, so a terminal is an asset HQ assigns, not a device a merchant registered. Rows lead with the serial, which is what is printed on the box and quoted in a ticket. Return to Cami is the destructive item, not Block, because a block is undone from the same menu. The access switch writes the same rails.terminal.enabled flag as CamiPay Terminal.

### Terminal status — one vocabulary, two surfaces

DSG-82. The fleet table and the Partner card both read components/blocks/admin/hq-terminal-status.tsx, so they cannot drift. The first three are fleet states only HQ sees; Not set up, Locked, Active and No sessions are the merchant's own words from DSG-62. Order is first-match-wins: where the unit physically is, then whether HQ stopped it, then what the device is doing.

### Partner code — CM-####

DSG-82. The identifier a human says out loud. `id` is internal and never rendered, the slug is public and changeable, and this one is issued at creation and immutable — which is why there is no edit affordance anywhere. Chip variant on the detail header and the Terminals card, click to copy; inline variant in dense listing rows, where a button per row would be twelve buttons nobody asked for.

### Notifications, Cami HQ control plane

The HQ half of the same store the merchant panel reads: Sender ID registrations to approve or reject, per-Partner channel grants, and rate overrides against the global rate card. Four Partners cover the states — Shampooch approved with a negotiated override, Pawhaus pending, Doggos rejected with SMS off, Furry Tales with no config at all.

### Impersonation banner

Bottom-anchored pill on the Partner portal during a Cami HQ impersonation session. Yellow active state, tomato expiring/expired states, plus a collapsed toggle that doubles as a re-open affordance.

## primitives-lane

### Button

Variants, sizes, with icon, and disabled. Hover and focus are live.

### Badge

Compact inline labels for status, counts, and tags.

### Avatar

Person, pet, and business avatars. Photo wins when present; otherwise renders a deterministic fallback (initials, character face, or species icon) on a hashed pastel background.

### Input and Textarea

Text inputs with label and error state.

### Checkbox, Radio, Switch

Selection controls.

### Search input

Search field with clearable value. Three sizes for different surfaces.

### Segmented toggle

Pill toggle with sliding active capsule. Neutral default + primary tone (cami-violet pill on dark track) for switch-style on/off.

### Select

Single-select dropdown.

### Tabs

Segmented content switcher with four variants.

### Dialog

Centered modal. Per cami terminology, Detail surfaces use this; Add / Edit use the full-screen takeover instead.
