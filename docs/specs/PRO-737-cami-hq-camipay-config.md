# PRO-737, Cami HQ: CamiPay settlement config

Anchor: R1, HQ billing spine (PRO-737, PRO-614), scoped to the CamiPay
settlement piece needed now.

Surface: **Cami HQ**, the internal admin console. Not a Business-app screen.
Only Cami staff (Account Managers, ops) touch it.

Status: **UI shipped**, mock data only, no backend. As-built, this spec matches
what is on `/admin/businesses`.

Implementation:

- `components/blocks/hq-camipay-panel.tsx`, the module
- `lib/hq-camipay/store.tsx`, config and rate-card state
- `components/blocks/business-detail-dialog.tsx`, hosts it in the Settings tab

## Problem

Cami charges a different take rate per Partner, per rail, and renegotiates it.
Today there is nowhere in HQ to see or set that, and no model for what happens
to money that has already moved when a rate changes.

Two failures follow from having no surface:

1. **Rails cannot be turned on and off per Partner.** A Partner who has not
   finished settlement onboarding still sees CamiPay in checkout, and a Partner
   who should be on terminal only still sees payment links.
2. **A rate change has no shape.** Left to a single mutable number, every rate
   edit silently re-prices every transaction the Partner has already taken. That
   is the bug this spec exists to prevent.

## Scope

Per Partner: **turn CamiPay rails on and off**, **assign a gateway per rail**,
and **set a rate card** that respects history when it changes.

Everything else the HQ settings area will eventually hold, reminder pricing,
add-on pay-as-you-go, method re-ordering, full method admin flags, is later.

Out of scope for this pass, flagged so the omission is deliberate:

- **Full settlement config**: gateway credentials, payout accounts, batch
  timing. Separate surface, separate spec.
- **Business-app changes.** Covered by the companion spec,
  [PRO-737, CamiPay fee visibility on the Partner side](./PRO-737-camipay-fee-visibility.md):
  a fee breakdown on the sale detail and a read-only rate view in settings.
  Nothing the Partner can change lives there.
- **Per-location rates.** See Inheritance below, the level is declared but
  overrides are not built.
- **Backend.** Store is React context plus localStorage, same pattern as
  `lib/terminals/store.tsx`.

## Where it lives

A dedicated **Settings** tab on the Partner detail dialog, not a feature tab.
The reason is forward-looking: the rest of Partner config grows into this same
tab, so the tab is the container and CamiPay is the first section in it.

Tab order: General, Team, Activity, **Settings**, Manage. Settings sits before
Manage because Manage is the destructive end of the dialog (suspend, archive)
and should stay last.

Route: `/admin/businesses?business=<slug>`, then the Settings tab. The tab is
dialog-local state, there is no `&tab=` param. Deep-linking a tab is worth doing
when a second section lands and someone needs to link to it directly, not
before.

## Model

```ts
type CamiPayRail = "terminal" | "online"
type GatewayId = "neopay" | "tappay" | "ni" | "stripe"

// Mutable per-Partner config. Forward-only (INV-12): toggling never touches
// sales that already exist.
type RailConfig = {
  enabled: boolean
  gatewayId: GatewayId | null
}

// What Cami charges on one transaction. Amounts in fils, never floats.
type CamiPayRate = {
  percent: number             // 3 means 3%
  fixedMinor: number          // 75 means AED 0.75 per transaction
  fixedBelowMinor: number | null // fixed part applies only below this; null = always
}

// Append-only. A rate change writes a NEW row, it never updates one.
type RateRow = {
  id: string
  merchantId: string
  rail: CamiPayRail
  rate: CamiPayRate
  effectiveFrom: string // YYYY-MM-DD, a calendar date, not an instant
  createdBy: string     // INV-08, attributable
  createdAt: string     // ISO timestamp of when the row was written
}
```

### Why the rate is three fields, not one

A take rate in this market is quoted as **percentage plus a fixed amount per
transaction**: Maaz's example is `3% + AED 0.75`. A percentage alone
under-recovers on small tickets, where the gateway's own per-transaction cost is
close to the whole fee.

`fixedBelowMinor` is Firaz's bracket. His framing: under AED 100 the fixed fee
applies, above it a flat percentage is enough. The field is stored as a ceiling
on the fixed component rather than as a second full rate, because that is what
the rule actually is, one fee with a threshold on one of its parts. Two rate
tiers would have to answer what happens to the percentage across the boundary,
and the commercial answer is "nothing".

Maaz, on why it exists before the commercials are settled: *"from a technical
perspective, we should build the % + Value brackets so we have flexibility.
Commercially, we can figure this out offline."* The model carries the bracket;
the default is `null`, so nobody has to use it.

### Missing rate means zero, and the UI says so

Maaz, on a rail with no configured fee: *"fee needs to be treated as Zero."*

`effectiveRateValue` resolves an unconfigured rail to `ZERO_RATE` rather than to
a platform default. No rate is seeded at onboarding. The consequence is that a
Partner can be live and charged nothing, so three surfaces state it rather than
letting it pass silently:

- The rate-card empty state reads "With no rate set, Cami charges this Partner
  nothing on CamiPay payments."
- A rail that is **enabled with no rate row** carries an amber line: "This rail
  is live with no rate, so Cami earns nothing on these payments."
- The Partner's own settings screen shows "No fee" rather than a dash.

Seeding the platform defaults (2% terminal, 3.5% online) instead was considered
and rejected: a seeded rate is indistinguishable from a negotiated one once it
is on the card, and the person who would have caught the mistake is the one
reading the card.

### Fee arithmetic lives in one function

`computeFee(rate, amountMinor)` returns `{ percentMinor, fixedMinor, totalMinor,
netMinor, fixedApplied }`. HQ's dialog preview, the Partner's sale breakdown,
and settlement all call it. Three implementations of the same rounding is how
the number on the invoice stops matching the number in the app.

The percentage rounds half-up to the nearest fil. The fixed part is added after,
never rounded. `fixedApplied` is false when the bracket excluded it, which is
what lets the breakdown explain a fee the Partner expected to be higher.

`effectiveFrom` and `createdAt` are deliberately different fields. When a rate
was agreed is not when it starts applying, and the history list shows both.

### The store shape is the invariant

`lib/hq-camipay/store.tsx` exposes `setRailEnabled`, `setRailGateway`, and
`addRate`. There is **no** `updateRate` and **no** `removeRate`. The missing
actions are the point: if the API cannot express "edit a past rate", no screen
can accidentally offer it.

### Rate resolution

The rate in force on a date is the newest row whose `effectiveFrom` is on or
before it:

```ts
effectiveRate(state, merchantId, rail, onIso)
  // newest row where effectiveFrom <= onIso
```

This takes a date rather than assuming "now" on purpose, because it is the same
resolution a capture runs to snapshot a rate onto a transaction.

Rows dated after today are **scheduled**, not effective. They render distinctly
and do not affect the current rate.

## Load-bearing rule: rates are date-locked, forward-only

This is INV-12 (config applies forward-only) made concrete, and the part most
likely to be built wrong.

> When Cami changes a Partner's rate, every transaction **already processed**
> stays billed at the rate in force when it happened. Only transactions from the
> effective date forward use the new rate.

Maz, verbatim: *"everything before that was transacted is at 2%, and the moment
we change the rate, anything going forward is charged a slightly lower rate."*

**Engineering consequence, do not skip.** The rate Cami earns is **snapshotted
onto each transaction at capture time** and stored on the sale/payment record.
Reports and settlement read that stored rate. They must **never** recompute
revenue from the Partner's current rate, that retroactively re-rates history the
moment anyone edits the card. A rate card is an append-only list of
`(rail, rate, effective_from)` rows, not one mutable number.

Mirrors the ledger invariants: config is mutable, financial records are
append-only (INV-01). A processed transaction's rate is a financial fact.

### How the UI enforces it

Four decisions, all of them refusals:

1. **No editable rate field exists on the surface.** Not a disabled one, not one
   behind a pencil. The current rate renders as text.
2. **The only write is "Change"**, which opens a dialog that collects a rate and
   an effective-from date and appends a row.
3. **Past rows have no affordance.** The history list is an `<ol>` of read-only
   rows, no menu, no edit, no delete.
4. **Backdating is blocked at the input.** The date picker passes
   `disableBefore={today}`, so a rate cannot be given an effective date that
   would reach payments already captured.

Plus one disclosure: the dialog states the consequence in plain language before
you save, and the card carries a permanent footnote saying the same thing.

## One card, one section per rail

Header: `CamiPay`, with a right-aligned hint `Set at Business level`, which is
the INV-10 inheritance declaration made visible. Two sections, divided, terminal
first.

This was originally **two** cards, `CamiPay rails` and `Rate card`, each listing
the same two rails in the same order. The split was modelled on the write
semantics: mutable flags in one, an append-only ledger in the other. That is a
fact about the store, not about the question being asked. Ops asks "how is
Terminal set up for this Partner", and the answer was spread across two places
that had to be read against each other.

The coupling was already visible in the code: the "live with no rate" warning
belongs to the rate but reads the rail's `enabled` flag. A warning that has to
reach into the other card to know whether to fire is the shape telling you the
cards were one thing.

The append-only model is unchanged, and still enforced the same way: there is no
editable rate field on the surface at all.

Each rail section:

| Element | Behaviour |
| --- | --- |
| Icon tile | `CreditCardIcon` (terminal) / `LinkIcon` (online). Violet-3 tile when the rail is on, muted when off. The tile is the fastest on/off read in the card. |
| Label | `CamiPay Terminal` / `CamiPay Online` |
| Description | "Card machine payments taken in person, at the counter." / "Payment links and checkout on the public booking page." |
| Switch | Enable / disable. Immediate, no save button, no redeploy. Toasts `CamiPay Terminal enabled for Shampooch JVC`. |
| Gateway row | Only rendered when the rail is on. An off rail has no gateway question to answer. |
| Rate row | Always rendered, see below. |

Gateway and Rate share one label-and-control row shape, indented under the rail
header, so the section reads as a list of settings for that rail rather than two
kinds of thing that happen to be adjacent.

**The rate stays visible when the rail is off**, unlike the gateway. A gateway is
operational and an off rail has no routing to configure; a rate is a commercial
term and it outlives the switch. Doggos is the case: suspended, and its terms
still stand.

**Two permissions on one card.** `billing.camipay.rails.edit` gates the switch
and the gateway select; `billing.camipay.rates.edit` gates the Change button.
They are gated per control rather than per card, because turning a rail on is an
operational act and changing a rate is a commercial one, and the same person
does not necessarily do both.

Gateway options are NeoPay, TapPay, Network International, Stripe. Everything
except NeoPay carries a muted `Onboarding` badge inside the option, so nobody
assigns a Partner to a rail that cannot route yet.

The two rails are independent, including their gateway. Per INV-P3 the rail is
not hard-coupled to a provider, so links can sit on one gateway and terminals on
another. Pawhaus in the mock data is set up that way precisely so this is
visible rather than theoretical.

**On but unrouted.** A rail that is enabled with no gateway assigned shows an
amber line under the select: "This rail is on but has no gateway, so nothing
will route." It is a warning, not a block, because the two settings are set by
different people at different times and blocking one on the other would just
mean the rail never gets turned on.

**Guardrail footnote**, always present, muted, one block rather than two:

> Turning a rail off removes it from this Partner's checkout, nothing more. Cash
> and off-rail card payments still record to the sale ledger. Changing a rate
> never re-prices past payments, so a change only applies from its effective
> date forward.

The first half is INV-P1: "turn off CamiPay" reads like "stop recording this
Partner's money", and it does not. Disabling a rail turns off a tender path, not
Cami's ownership of the commercial record. The second half is the forward-only
rule. Both answer the same question, "this change is narrower than it looks",
which is why they share one block. Two stacked grey notes read as boilerplate
where one reads as a rule.

### The rate row

One per rail section:

| Element | Content |
| --- | --- |
| Label | `Rate`, matching the `Gateway` row above it |
| Value | `1.8%` or `3% + AED 0.75`, tabular nums, or `Not set` in muted when the rail has no rows |
| Action | `Change`, or `Set rate` when there is no current rate |
| Provenance | `From 01 May 2026, set by Maz Khan`. Omitted entirely when there is no rate, since the value already reads `Not set` and "No rate set" under it says it twice |
| Bracket | Line under the provenance when one is set: `AED 0.75 applies under AED 100.00, 3% alone at or above` |
| Warning | Amber line when the rail is **enabled with no rate**: "This rail is live with no rate, so Cami earns nothing on these payments." |

Percentages trim trailing zeros, `2%` not `2.00%`, because the extra digits read
as precision that is not there. Money never trims: `AED 0.75`, and `AED 100.00`
for a round threshold.

The bracket is a separate line rather than part of the headline rate. A rate has
to be sayable in one breath, and "3% + AED 0.75 on sales under AED 100" is not
that.

**Scheduled rows.** A future-dated row renders as an amber strip under its rail:
a `Scheduled` badge plus `1.9% from 01 Sep 2026, set by Hareem Adil`. It stays
there until its effective date passes, at which point it becomes the current
rate and the strip disappears. There is no cancel action, deliberately: a
scheduled row is a committed commercial term, and undoing one is a new row, not
a delete.

**Rate history**, collapsed by default: `Show rate history (4)`. Expanded, one
row per rate row, newest effective date first, both rails interleaved:

```
CamiPay Online, 3% + AED 0.75                        From 01 May 2026
AED 0.75 applies under AED 100.00, 3% alone at or above
Set by Maz Khan on 22 Apr 2026
```

Future rows read `Starts 01 Sep 2026` instead of `From`. History sits at the
foot of the card rather than inside either rail section, and stays scoped to the
Partner, not the rail, because the question ops actually asks is "what has this
Partner been charged", not "what has this rail been".

## Change rate dialog

Title: `Change CamiPay Terminal rate` / `Change CamiPay Online rate`. Not
lowercased, because CamiPay is a product name before it is a word in a sentence
and "change camipay terminal rate" reads as a typo.

Description carries the current state and the model in one line:

> Shampooch JVC is on **1.8%** since 01 May 2026. A change is added to the rate
> card, it does not overwrite what came before.

Fields:

1. **Percentage** and **Fixed per transaction**, side by side with a `+` between
   them. They are one rate, not two settings, and stacking them read as a
   choice. `%` suffix inside the first, `AED` prefix inside the second.
2. **Drop the fixed fee on larger sales**, a switch that only appears once a
   fixed fee has been entered, since a bracket with nothing to gate is
   meaningless. Switching it on reveals **Fixed fee applies below**.
3. **Effective from.** `DatePicker`, defaults to today, `disableBefore` today.

Validation: both amounts are optional individually and blank counts as zero, but
at least one must be above zero. A `0% + AED 0` row would look like a decision
and behave like an absence, and absence is already expressible by leaving the
rail unconfigured. Percentage caps at 100. Nothing constrains the rate to the
1.8 to 3.5% band from the glossary, since that is a commercial norm and not a
system rule.

**Consequence preview**, appears once a rate has been entered:

> Payments captured before **01 Sep 2026** stay at **1.8%**. From that date,
> Cami charges **2.5% + AED 0.75**.

Under it, worked examples run through `computeFee`:

```
On AED 120.00, 2.5% of AED 120.00 + AED 0.75          AED 3.75
```

With a bracket set, two examples appear, one either side of the threshold:

```
On AED 50.00, 2.5% of AED 50.00 + AED 0.75            AED 2.00
On AED 150.00, 2.5% of AED 150.00                     AED 3.75
```

Two rather than one because the whole reason a bracket exists is that the two
behave differently, and nobody setting a rate should have to take that on trust.
Until the threshold has a value the rate is treated as unbracketed, so the
examples never describe a rule that is half-entered.

Submit label switches on the date: `Apply change` for today, `Schedule change`
for a future date. Toast matches, either `CamiPay Terminal rate is now 1.9%` or
`CamiPay Terminal rate scheduled for 01 Sep 2026`.

Saving appends a row stamped with the signed-in HQ user and the current
timestamp.

## Permissions

The spec's open question was who can edit rates versus only view. Answer: **rate
edits get their own permission**, not blanket HQ-staff write, because a rate
change reprices every future transaction for that Partner.

Two codes, both under the Billing area in `lib/hq-permissions-catalog.ts` so
they appear in the PRO-138 role editor, and both in `PermissionKey` so
`PermissionGate` and `useAuth().has()` can gate on them:

| Code | Grants |
| --- | --- |
| `billing.camipay.rails.edit` | Toggle rails, assign gateways |
| `billing.camipay.rates.edit` | Append rate-card rows |

They are independent. Turning a rail on is an operational act, changing a rate
is a commercial one, and the same person does not necessarily do both.

`billing.read` alone gives a fully read-only view: switches disabled, selects
disabled, no Change buttons, history still expandable. With neither edit code
the panel shows an amber note at the top:

> You have view-only access to settlement config. Ask an HQ admin for CamiPay
> edit rights.

The existing `hq_billing` preset in the demo controls has `billing.read` and
`billing.edit` but neither CamiPay code, so it demonstrates the read-only state
without any extra setup.

## Inheritance

Declared for v1 (INV-10): the rate card is set at the **Business** level, and
labelled as such in the card header. Not per-location.

When multi-location lands, a location inherits its Business rate. A per-location
override is a separate spec, and would need its own answer for which level a
capture resolves against.

## Archived and suspended Partners

**Archived** renders the whole tab read-only, matching how General, Team, and
Manage already treat archived Partners. Note at the top: "This Partner is
archived, settlement config is read-only."

**Suspended** stays editable. Suspension is a lifecycle state and the commercial
terms outlive it, so ops can still renegotiate a rate on a suspended account
before it comes back.

## Timezone handling, carry this into the backend

`effectiveFrom` is a **calendar date, not an instant**, and must never go
through the default `new Date("2026-06-01")` path, which parses as UTC midnight.
Two failures that causes:

- In any timezone behind UTC it renders as the previous day, so a rate that
  starts 01 Jun displays as 31 May.
- In any timezone ahead of UTC, local midnight today is before UTC midnight
  today, so the date picker disables **today** and the earliest selectable
  effective date becomes tomorrow. In Dubai, UTC+4, this happens every day.

`parseEffectiveDate` and `formatEffectiveDate` in the store parse and format as
local. `createdAt` is a real instant and keeps using the shared `formatDate`.

## Demo states

Seeded in `DEFAULT_CAMIPAY_STATE`, all five reachable from `/screens`.

| Partner | State |
| --- | --- |
| Shampooch JVC | Both rails on NeoPay. Terminal cut 2% to 1.8%, online 3.5% to **3% + AED 0.75 under AED 100**, both effective 01 May. Four history rows. |
| Pawhaus | Terminal on TapPay, online on NeoPay. Online is 3.25% + AED 1.00 under AED 100. 1.9% terminal **scheduled** for 01 Sep. |
| Velvet Paw | Onboarding. Both rails off, no rate card, empty state. |
| Doggos | Suspended. Both rails on NeoPay, but no online rate, so that row reads `Not set` and carries the "live with no rate" warning. The only seeded Partner in that state. |
| Furry Tales | Archived. Whole tab read-only. |

Shampooch's change is dated 01 May rather than 01 Jun so that it sits **before**
the demo sales on 25 May. The Partner-side breakdown snapshots its rate at
capture, and a change dated after the sales would have left the two halves of
the feature telling different stories on the same screen pair.

The playground section shows five of these side by side: Shampooch JVC, Pawhaus,
Velvet Paw, Shampooch JVC again under `billing.read` only for the view-only
treatment, and Furry Tales. Doggos is `/screens` only. All playground rows share
one `CamiPayProvider`, so a change made in one is reflected in the others.

State persists to localStorage under `cami-hq-camipay-v2`. `reset()` clears it.
The key moved from `v1` when the rate stopped being a bare number: the old
payload cannot be read as the new shape, and a half-migrated rate card is worse
than a reset one.

## Known gaps

- **Rail toggles are not attributed.** Rate rows record `createdBy`, rail and
  gateway changes do not. Both should write to the Partner's activity feed
  (`AdminBusiness.audit`) once the audit spine is real. Rate and rail changes
  move money and need audit from day one (INV-08).
- **Rate history is unpaginated.** Fine at mock volume, needs a cap or a "show
  more" once a Partner accumulates years of rows.
- **No rate-band validation.** Nothing stops someone typing 0.01% or 99%. A
  confirm step above a threshold is probably the right shape, once there is a
  real number to set the threshold at.
- **The Settings tab is not deep-linkable.** Dialog-local state. Worth a `&tab=`
  param when a second section lands.
- **One gateway per rail, not several.** GNK asked about multi-select gateway
  selection. Maaz's answer settled it for now: NeoPay for terminals, Tap Pay for
  online, one each. The rail-to-gateway field already allows a different
  provider per rail (INV-P3), which is the flexibility that was actually asked
  for. A rail routing to two gateways at once would need a split rule, and there
  is no rule to encode yet.
- **The bracket has no commercial owner.** Firaz and Maaz agreed to build it and
  settle the numbers offline. Every seeded default uses `fixedBelowMinor: null`
  except the two Partners that demo it, so the feature exists without asserting
  a price.
- **Rates are not per-transaction-type.** One rate per rail covers cards; if
  wallets or bank transfers land on the same rail with different economics, the
  rate would need to hang off the tender, not the rail.
