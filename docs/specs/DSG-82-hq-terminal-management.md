# DSG-82 — HQ terminal management

Cami buys the card machines and leases them to Partners. That one fact sets the
model: **a terminal is an asset HQ owns and assigns**, not a device a merchant
registered. DSG-62 (`docs/specs/DSG-62-terminal-registration.md`) is what the
merchant does with a unit once it arrives — name it, pair it, hand out its PIN.
This spec is Cami's side: the fleet, who has what, and cutting access off.

Ticket: DSG-82, milestone "A · Get settle-ready", related DSG-62.

> **Course correction, recorded on purpose.** This was first built as a
> read-only card inside the Partner detail modal, on the assumption that
> merchants register their own hardware and HQ merely watches. The ticket's word
> is "terminals **assigned** to each merchant", and assignment implies an owner
> handing something over — Cami ships and leases the units. The model below
> replaced that first pass; what survived it is the status vocabulary, the
> no-PIN rule, and Block.

## Problem

Three gaps, one per ticket bullet, read against the leasing model.

1. **Nobody at HQ can see the fleet.** Cami owns hardware that is out with
   Partners, on the shelf, or written off, and there is no screen that says
   which is which. Worse, the question support actually starts from is the
   *reverse* one: a ticket arrives naming a device ("NP5-2419-8830 won't take a
   card") and nothing maps a serial to a Partner. A per-Partner view can never
   answer it — you would open Partners one at a time until you found it.
2. **A Partner has no identity you can say out loud.** `id` (`biz_shampooch`) is
   internal and never rendered; `slug` is public and changeable from the General
   tab. Neither survives a phone call.
3. **Access is all-or-nothing at the wrong altitude.** HQ could disable the
   whole CamiPay Terminal rail. There was nothing between that and asking the
   merchant to stop using a device.

## Model

One flat fleet in `lib/hq-terminals/store.tsx`. A Partner's terminals are a
**filter over the fleet**, not a collection of their own, because the reverse
lookup is a first-class question rather than an afterthought.

Each unit carries two identifiers, deliberately:

| Field | What it is |
| --- | --- |
| `serial` | Printed on the back of the device. What a courier note, a lease schedule and a repair ticket all carry. Never changes. |
| `id` | The DSG-62 pairing code (`TRM-7Q4K2M`) the merchant types into the device once. Travels with the unit, so it survives a reassignment. |

No `pin` anywhere in the HQ model. That is the merchant's credential for their
own staff, and a reveal button on an HQ screen would make every support call an
invitation to read it out.

Lifecycle, and the verbs that move a unit through it:

```
In stock ──assign──▶ With Partner ──return──▶ Returned ──restock──▶ In stock
                          │                       │
                          └───── mark faulty ─────┴──▶ Faulty (kept, never re-assigned)
```

- **Assign** sends a unit out and stamps the date. The Partner pairs it on
  arrival with the code that ships with it.
- **Return** ends the assignment and clears everything the merchant set — name,
  location, pairing, sessions. Those described their counter, not our asset, and
  the next Partner must never inherit a signed-in device.
- **Restock** puts a returned unit back on the shelf, e.g. after a repair.
- **Mark faulty** writes a unit off. It stays in the fleet as a record rather
  than being deleted, because leased hardware written off is a thing finance
  asks about later. Faulty stock is never offered for assignment.

Status, first match wins, and the order is the order support cares about —
where the unit physically is, then whether HQ stopped it, then what the device
is doing:

| Status | Meaning |
| --- | --- |
| `faulty` | Written off |
| `returned` | Back at Cami, not yet restocked |
| `in-stock` | On the shelf, assignable |
| `blocked` | HQ has blocked this unit (this spec) |
| `locked` | Device locked itself out on failed PINs (DSG-62) |
| `not-paired` | Shipped, never switched on. Shown as "Not set up" |
| `active` | Paired, at least one live session |
| `no-sessions` | Paired, nobody signed in right now |

"Not set up", "Locked" and "Active" are the merchant's own words from DSG-62 —
HQ and the merchant looking at one device should read the same status. The three
fleet states above them are ours alone. The vocabulary lives once, in
`components/blocks/hq-terminal-status.tsx`, so the card and the fleet table
cannot drift.

## Surfaces

### 1. Fleet listing — `/admin/terminals`

Sidebar item under Partners. Tabs: All / With Partners / In stock / Returned /
Faulty, with counts. Columns: Terminal (serial, then model · the merchant's name
for it · pairing code), Partner (name + `CM-####` + since-date, linking to that
Partner's Settings tab), Status, Location, Last seen, and a Manage menu whose
items are only the ones the unit's state allows — a machine on the shelf can
only go out, one at a Partner can only be controlled or come back.

Search covers serial, pairing code, model, the merchant's device name, location,
Partner name and Partner code. That is the reverse lookup: paste a serial off a
ticket, get the Partner.

Tab and search live in the URL (`?tab=`, `?q=`), the way the Partner roster keeps
them. Not for deep-linking's own sake: a filtered fleet view is a thing people
send each other — "here is the faulty pile", "here is that serial" — and a state
with no address cannot be listed on `/screens` either.

Clicking a Partner opens the Partner detail dialog **over the fleet**, at
`?partner=<slug>`, on the Settings tab where the Terminals card lives. Not a
navigation to the roster: every listing in this repo — `/clients`, `/pets`,
`/sales/*`, the Partner roster itself — pops a detail dialog addressed by a query
param, and leaving the fleet would throw away the tab and search you arrived
with.

Assignment from here picks a **Partner** for a known unit; assignment from the
Partner card picks a **unit** for a known Partner. Same write, opposite starting
point, because both are real: "this box is going to Shampooch" and "Shampooch
needs a third machine".

### 2. Partner detail card — Settings tab

Under the CamiPay card, because terminals are a fact about the Terminal rail
directly above them. The header states how many are assigned and carries Assign;
rows are that Partner's units with serial, location, and either the signed-in
count or last seen.

Per row: Copy serial, Sign out devices, Block / Allow, Return to Cami. HQ cannot
rename a unit or set its location here — those describe the merchant's counter,
not our asset — and cannot see the PIN.

- **Block / Allow** stops one unit signing in, and its live sessions end with it
  (a session left running on a device you just blocked is not blocked).
  Reversible, and the row keeps saying who blocked it and when.
- **Sign out devices** ends sessions without blocking — for "someone left it
  signed in at the counter", where a block is too much.
- **Return to Cami** is the destructive item, not Block: a block is undone from
  the same menu, a return ends the assignment.

### 3. Merchant code

`AdminBusiness.code`, format `CM-####`, e.g. `CM-4821`.

- **Immutable.** That is the point of a third identifier: the slug already
  exists and already changes. A re-issuable code is a slug with extra steps, so
  there is no edit affordance anywhere.
- **Assigned at creation.** Seeded Partners carry theirs in
  `lib/admin-businesses.ts`; a Partner created from the New Partner sheet is
  issued one by `generateMerchantCode()` and shown it in the success toast.
- **Four digits, no letters.** It gets read down a phone and typed into a
  ticket. `CM-` prefixes it so a bare number in a support thread is still
  recognisable as a Partner; the digits carry no meaning (not sequential, not
  year-scoped) so nobody reads a ranking into them.
- **Where it shows:** the Partner roster row under the business name (inline, no
  button — one per row would be twelve buttons nobody asked for), the detail
  modal header next to the slug as a click-to-copy chip, and the Partner column
  of the fleet table. Once per surface: it was briefly repeated in the Terminals
  card header, two inches under the same chip in the modal header, and that slot
  now carries the assigned count instead.

Roster search matches the code, so a support thread quoting `CM-4821` is one
paste from the Partner.

## Merchant-level terminal access

The existing `rails.terminal.enabled` flag from PRO-737 **is** the
merchant-level switch. No second flag was added: a separate `terminalAccess`
would have bought nothing but two switches on one tab that ops has to read
against each other, which is how an outage gets misdiagnosed.

The Terminals card renders that one flag as a switch of its own, alongside the
CamiPay Terminal switch that already writes it. **One flag, two views** —
`setRailEnabled(id, "terminal", …)` in both places, so they cannot disagree.

That is a reversal worth recording. The card first only *stated* the flag
("Terminal access on") and linked up to the single switch, so there would be
exactly one control on the tab. The link could not be made to work: the scroll
lives on the Partner dialog's body, so `scrollIntoView` did nothing; walking up
for the scroll container fixed that and then the click's own focus pulled the
view straight back to the link; focusing the target switch instead did not land
either. Three attempts in, a pointer that does not move you is worse than one
flag shown in both places people look for it.

The row names the relationship — "Terminal access on · Same as CamiPay
Terminal" — because the risk this design carries is someone hunting for a second
flag to explain a Partner who cannot transact. It is a suffix rather than a
sentence: that is a one-time realisation, and a line of prose apologising for
the duplicated control would sit there permanently. Only the off state gets a
second line, and that one is a warning rather than an explanation of a boolean.

Per-unit Block still works while access is off — access coming back on should
not un-block a device that was blocked for cause.

## Permissions

- `merchants.edit` — assign, return, restock, mark faulty, block/allow, sign
  out. Moving and stopping hardware is operational, not financial.
- `billing.camipay.rails.edit` — the Terminal access switch, on both cards. It
  writes the rail flag, so it keeps the grant that already guarded it.

Without `merchants.edit` both surfaces are read-only, and the card says so in a
footnote. That footnote is the card's only one: a standing paragraph explaining
what Block does was cut, because it explained a control before anyone touched it
and says the same thing in the Block confirm dialog, where the decision is made.
Archived Partners are read-only, matching every other tab, and are not offered
as assignment targets — sending hardware to an account nobody will sign into is
a mistake, not a choice.

## Data

`lib/hq-terminals/store.tsx`, modelled on `lib/hq-camipay/store.tsx`: React
context + localStorage, inert default outside a provider. Mounted in
`app/admin/layout.tsx` alongside `CamiPayProvider`.

It does **not** read `lib/terminals/store.tsx`. That store is the demo
merchant's own localStorage on the merchant side of the product; wiring the two
would make an HQ screen change because a reviewer clicked something on a
merchant route, which reads as a bug even when it is deliberate. Two mocks,
joined by the real API later.

Seeded so every status is reachable without editing data:

| Partner | Units |
| --- | --- |
| Shampooch JVC | 3 — active (2 signed in), no sessions, and one shipped but never switched on |
| Pawhaus Boarding | 2 — active, one blocked by HQ |
| Doggos Daycare (suspended) | 1 — locked out on failed PINs |
| Furry Tales (archived) | 1 — Terminal rail off, so hardware in hand and no access |
| Velvet Paw Spa (onboarding) | 0 — the empty state |
| — at Cami HQ | 2 in stock, 1 returned, 1 faulty |

## Out of scope, deliberately

- **Stock intake.** There is no way to add a newly bought unit to the fleet:
  seeded stock is all the stock there is. That is deliberate, not an oversight.
  Intake never arrives alone — a PO number, the supplier, per-unit cost,
  warranty, lease start — and none of those are answered anywhere yet, so
  building the form now means guessing at fields and reworking them later. The
  three bullets in DSG-82 are all reachable against seeded stock.
- **Lease billing.** Cami leases these units, so there is a monthly charge per
  terminal somewhere. It belongs with the other ledgers (`/admin/billing`), not
  in an inventory screen.

  Intake and lease billing are one coherent follow-up — procurement, in one
  ticket, with someone who knows the commercial fields. Assign / return /
  mark-faulty already move a unit through its life; what is missing is where it
  came from and what it costs.
- **Shipping detail.** No courier, tracking number or delivery confirmation.
  `assignedAt` currently means "sent out"; if ops needs "assigned" and "arrived"
  as separate facts, that is a field and a state, not a redesign.
- **Reconciling DSG-62's "Add terminal".** The merchant panel still lets a
  merchant *create* a terminal, generating a code and a PIN. Under the leasing
  model that cannot happen: the unit arrives from Cami, and all the merchant
  does is pair it and name it. The merchant panel should therefore list the
  units HQ assigned and offer "Set up" rather than "Add terminal". That is a
  DSG-62 change on a shipped surface, so it is named here rather than done
  quietly as part of this ticket.
- **Merchant-side visibility of a block.** A blocked unit just stops working on
  the merchant's own panel; it does not say "Blocked by Cami HQ". Leaning
  towards showing it so support is not debugging a silent failure, but that is a
  DSG-62 panel change.
- **Audit-log writes.** Assign, return and block should all land on the
  Partner's audit feed. That feed is seeded data with no writer today, so it
  lands when something else needs to write to it too.
