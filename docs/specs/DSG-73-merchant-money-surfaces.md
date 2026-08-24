# DSG-73 — Merchant money surfaces

**Linear:** [DSG-73](https://linear.app/getcami/issue/DSG-73/merchant-money-surfaces-ui) · High · Dsgn · project *Merchant settlement*
**Sub-tickets:** [DSG-77](https://linear.app/getcami/issue/DSG-77/account-summary) Account summary · [DSG-78](https://linear.app/getcami/issue/DSG-78/transaction-activity-and-transaction-detail) Activity + detail · [DSG-75](https://linear.app/getcami/issue/DSG-75/settings-bank-account-payout-destination) Bank account · [DSG-76](https://linear.app/getcami/issue/DSG-76/invoices-and-fees) Invoices and fees · [DSG-74](https://linear.app/getcami/issue/DSG-74/settings-billing-details) Billing details
**Requirements:** [merchant-settlement BRD](../../cami%20design%20with%20dotzero/PMOS/work/specs/brd/merchant-settlement-brd.md) (`SET-`) · [PRD](../../cami%20design%20with%20dotzero/PMOS/work/specs/prd/prd-merchant-settlement-2026-08-16.md) · [tickets doc](../../cami%20design%20with%20dotzero/PMOS/work/specs/tickets-merchant-money-surfaces-2026-08-20.md)
**Law:** INV-P2, INV-P4, INV-P9, INV-01, INV-03, INV-08, INV-12 · [06 Money Composition Contract](../../cami%20design%20with%20dotzero/PMOS/context/knowledge/06-money-composition-contract.md) §4, §7 · ADR-001, ADR-002, ADR-014
**Benchmark:** 19 Fresha screenshots from SOTA's live account, 16 Aug 2026 — see §1
**Last updated:** 2026-08-24

---

## TL;DR

| | |
|---|---|
| **What** | Five merchant-facing money screens: account summary, transaction activity, bank account, invoices and fees, billing details |
| **Why** | Cami captures money and has no surface telling a merchant where it is, when it lands, or what Cami charged |
| **The delta that drives every layout** | **Split custody.** Terminal money is paid to the merchant by the gateway; online money is held and paid by Cami. One merchant, two payouts, two senders, two schedules. Fresha has one wallet |
| **The defect not to copy** | Fresha's breakdown omits payouts, so two figures both readable as "balance" disagree ~9.3x in one session. Measured, §2 |
| **Where** | Topbar wallet drawer (glance) → `/money` pages (summary · activity · fees); Settings dialog › Billing (bank account, billing details) |
| **Not here** | CamiHQ payout run view (`SET-C8`), payout engine, gateway integration, subscription or add-on billing (the OS is free, INV-P4) |

---

## 1. Benchmark assets

SOTA Salon's live Fresha account, captured 16 Aug 2026. Saved under [`assets/`](assets/).

⚠️ **Live data.** Real amounts, VAT number `104169608700003`, IBAN, RAK Bank last-4, client name. Team-internal only — redact before any external share.

### The eight Michelle named

| File | Shows |
|---|---|
| [`fresha-account-summary-top.png`](assets/fresha-account-summary-top.png) | Period selector, headline "Current balance", three tiles, breakdown start |
| [`fresha-account-summary-bottom.png`](assets/fresha-account-summary-bottom.png) | Full deductions and adjustments, Total |
| [`fresha-wallet-activity.png`](assets/fresha-wallet-activity.png) | Wallet drawer: header figure, payout-schedule card, activity feed with daily subtotal |
| [`fresha-transaction-detail-fee.png`](assets/fresha-transaction-detail-fee.png) | Fee transaction detail modal |
| [`fresha-transaction-detail-deposit.png`](assets/fresha-transaction-detail-deposit.png) | Deposit detail modal, linked client |
| [`fresha-invoices-and-fees.png`](assets/fresha-invoices-and-fees.png) | Period-grouped fee activity and invoice list, pending state |
| [`fresha-bank-account.png`](assets/fresha-bank-account.png) | Masked payout destination |
| [`fresha-billing-details.png`](assets/fresha-billing-details.png) | Legal entity, VAT, address |

### Extras from the same capture

| File | Why it earns its place |
|---|---|
| [`fresha-account-summary-mid.png`](assets/fresha-account-summary-mid.png) | Breakdown mid-scroll — confirms no payouts line exists anywhere between top and total |
| [`fresha-wallet-activity-day-grouping.png`](assets/fresha-wallet-activity-day-grouping.png) | Day heading with subtotal (`Aug 15, 2026 · AED 1,500.50`) — DSG-78 T5-1 |
| [`fresha-wallet-filters-type.png`](assets/fresha-wallet-filters-type.png) | Their full transaction-type list — DSG-78 T5-6 |
| [`fresha-wallet-filters-daterange.png`](assets/fresha-wallet-filters-daterange.png) | Custom date range picker |
| [`fresha-wallet-entry-point.png`](assets/fresha-wallet-entry-point.png) | Wallet opens as a drawer over whatever screen you were on |
| [`fresha-payout-schedule.png`](assets/fresha-payout-schedule.png) | From / Send to, the payout schedule editor — DSG-75 T2-9 |
| [`fresha-bank-account-change.png`](assets/fresha-bank-account-change.png) | "Replace bank account" + verification copy — DSG-75 T2-4, and a real precedent for D3 |
| [`fresha-payment-methods-rate.png`](assets/fresha-payment-methods-rate.png) | `3.00% + AED 0.75 per transaction` — where their rate is discoverable, and where it is not |
| [`fresha-billing-payment-methods.png`](assets/fresha-billing-payment-methods.png) | Card used to pay Fresha's own fees |
| [`fresha-transaction-detail-message-credits.png`](assets/fresha-transaction-detail-message-credits.png) | Non-appointment fee detail — fewer fields, no reference row |
| [`fresha-transaction-detail-topup.png`](assets/fresha-transaction-detail-topup.png) | Money-in-from-merchant detail variant |

---

## 2. What the benchmark actually proves

Five findings that change what we draw. Four are measured off the assets above; the fifth (§2.6) surfaced while building against them.

### 2.1 The two-balance defect, quantified

Same account, same session:

| Surface | Figure | Label |
|---|---|---|
| Wallet drawer header | `AED 2,742.26` | *Sota Salon · Business wallet* |
| Account summary | `AED 25,457.46` | *Current balance* |

**9.3x apart, both labelled as a balance.** The breakdown is internally consistent —

```
Total card payments      AED 30,269.92
Total deductions       − AED  4,812.46
Total adjustments        AED      0
─────────────────────────────────────
Total                    AED 25,457.46   ← equals the headline
```

— and still wrong, because **it never subtracts what already left for the bank.** It reconciles to itself, not to the merchant's bank account. That is `SET-D5`: the payouts line is not a nice-to-have, it is what makes the arithmetic mean anything.

**Cami's rule:** the breakdown ends at the figure the merchant is still owed, with payouts as an explicit subtracted line. One headline per screen (G2).

### 2.2 Our deductions list is a third the length of theirs

Fresha itemises eight lines. Two of the four non-zero ones cannot exist for Cami:

| Their line | Amount | Cami |
|---|---|---|
| Card payment fees | − 1,063.80 | → **Cami fee** |
| New Fresha client fees | − 724.51 | ✗ no marketplace. Do not design a slot |
| Message credits | − 252.00 | → **messaging / add-on usage** |
| Subscription & add-ons | − 2,772.15 | ✗ **the OS is free** (INV-P4, ADR-001) |
| Online booking · No-show protection · Card terminal purchase · Blast messages | 0 | not applicable or later |
| **Total deductions** | **− 4,812.46** | |

Subscription plus marketplace is **73% of their deductions** (3,496.66 of 4,812.46). Cami's version of this block is three lines: Cami fee, messaging or add-on usage, refunds. The screen's lower half is therefore much emptier than the benchmark and has to be designed, not copied.

### 2.3 They state a scope they don't explain

Their card-payments block reads:

```
Sales                    AED      0
Client tips              AED      0
Deposits             AED 30,428.42
Card payments refunds  − AED 158.50
Total card payments  AED 30,269.92
```

A merchant sees thirty thousand dirhams sitting under a line that says **Sales: 0**. Nothing on the screen says the figure covers card money only, or why sales are zero while deposits are not. This is `SET-D7` / EC-19 in the wild, and it matters more for Cami than for them: ~92% of SOTA's money is currently off-rail.

**Cami's rule (T4-8):** a scope statement in words on the surface — what this figure counts, and plainly what it does not (cash, off-rail money).

### 2.4 Field sets we can adopt as-is

Their transaction detail is the right shape, and it already encodes custody in two rows:

| Row | Fee variant | Deposit variant |
|---|---|---|
| Date | Today, 1:28 PM | Today, 1:28 PM |
| Appointment reference | `5E846E75` (linked) | `5E846E75` (linked) |
| Channel | Offline | Offline |
| Team members | Multiple | — |
| Location | Sota Salon | Sota Salon |
| Payment method | Wallet | Fresha online – Visa \*6892 |
| Billing period | August 2026 | August 2026 |
| **From** | Sota Salon | **Gabi Barras** (linked client) |
| **To** | Fresha | Sota Salon |

`From` / `To` do for them by accident what G3 requires of us on purpose. Cami keeps the pair and adds an explicit **rail + custodian** row (T5-5), because with two custodians "To: Cami" and "To: NeoPay" are different facts.

Day grouping with a subtotal is confirmed working (`Today · AED 579.87`, `Aug 15, 2026 · AED 1,500.50`) — adopt.

### 2.5 Two things they have no equivalent of

- **No rail filter.** Their filter list is Card payments, Fees, Payouts, Top-ups, Purchases, Adjustments, Refunds, Credits, Transfers, Business loans. One wallet, so no rail axis exists. We add one.
- **No payout rows visible in the feed.** Type exists in the filter list; none appear in any captured feed. Payout rows and payout drill-in (T5-7) are ours to design from scratch.

### 2.6 A balance under a period selector needs an opening figure

Found while building, not in the benchmark — but it is the benchmark's shape that hides it.

Fresha puts **Current balance**, a point-in-time figure, at the top of a screen governed by a **period selector**, above rows that are all period flows. Those are two different kinds of number, and the screen never says which it is showing.

Build it that way and it breaks measurably. Scope everything to month-to-date and August's payouts carry money earned in late July, so the outflow exceeds the inflow and the "balance" for one rail renders as **`- AED 332.90`** — a negative amount of money held for a merchant, which is not a state their money can be in. It was arithmetically consistent with its own rows and still nonsense.

The fix is one row: the reconciliation opens at what was already held and closes at what is held now.

```
Held when this period started    AED  1,174.53   ← balance
  + money in                     AED 33,680.00   ← flows
  − what Cami charged          - AED  1,113.83
  ± adjustments                  AED    590.67
  − paid to your bank          - AED 31,127.19
Still held for you               AED  3,204.18   ← balance
```

Two consequences worth carrying into the other four screens:

- **Held is never a period figure.** Month-to-date and all-time close on the same day, so they must report the same held figure while their flows differ entirely. Pinned in `ledger.test.ts`.
- **A negative held figure is a bug, not a state.** Also pinned, and it caught a second one: a returned payout whose reversal was left unassigned got swept by the next run and paid out twice.

---

## 3. Global rules

Applies to all five tickets. From the pack ticket, restated here so a screen file can cite one source.

| # | Rule | Source |
|---|---|---|
| G1 | **No bare "Balance" or "Total".** Every money figure names what it is and over what period. "Held by Cami, arriving Thu 22 Aug", not "Balance" | `SET-D2`, 06 §4 |
| G2 | **One headline figure per screen.** Two figures on one surface that could both be read as the balance is a defect, not a layout choice | `SET-D1`, §2.1 |
| G3 | **Every rail-scoped figure is labelled by custodian.** Cami-held vs gateway-held is never inferred from context | Split custody |
| G4 | **Amount due and taxable gross are different numbers whenever a tip exists.** Never collapse them | 06 §4, EC-39 |
| G5 | **Nothing is editable in place on a money record.** Corrections are new rows | INV-01 |
| G6 | Any state change on a money setting shows actor and timestamp | INV-08 |
| G7 | Amounts AED, **2dp**, thousands separator. Negatives render `- AED 1,464.09`, never parenthesised | 06 §7 |
| G8 | Terminology: **Client**, **Sales**, **Payout**, **Fee**. Never Customer, Invoice (for a sale), Settlement (merchant-facing) | Glossary |

**Merchant-facing vocabulary.** The BRD's `float` and `settle-ready` are engineering words. Merchants see: float → "On the way to your bank"; settle-ready → "Ready to get paid"; take → "Cami fee".

---

## 4. The money model

One reconciling model behind all five screens, in `lib/money/`. Per-screen hardcoded figures are how §2.1 happens; a single model is the structural fix.

### 4.1 Composition

```
      held when the period opened   ← a BALANCE, brought forward
    + card payments in              (sales, tips, deposits)
    − deductions                    (Cami fee, messaging/add-ons, refunds)
    ± adjustments
    − payouts already sent          ← the line Fresha omits
    ────────────────────────────────
    = held, not yet paid out        ← the headline figure (G2)
```

Computed per rail, then summed. `heldMinor` is never a stored constant — it is derived, so the breakdown cannot drift from the headline.

**The opening line is not decoration, see §2.6.**

### 4.2 Rails

| | Cami rail (online) | Gateway rail (terminal) |
|---|---|---|
| Custodian | Cami holds the money | NeoPay holds and pays it |
| Schedule | Cami-controlled, editable | Gateway-controlled, **read-only** (`SET-B7`) |
| Sender on the merchant's bank statement | Cami | NeoPay |
| Cami's take | deducted before payout | pending **D1** |

Merchant states that must render complete, non-broken screens: **both rails** · **terminal-only** (`SET-X7`) · **online-only** (`SET-X8`).

### 4.3 Rounding

AED, 2dp, half-up, fils. Rounding applied once per line at VAT derivation, never at subtotal, never twice (06 §7). `formatMoney` in [`lib/money/format.ts`](../../lib/money/format.ts). It lives there, not in `lib/format.ts`, because that file's `formatAed` takes whole AED and is what Reporting renders — two same-named formatters with different units is how a figure quietly loses its fils.

---

## 5. Where each screen lives

**The entry point is the topbar wallet.** The pack ticket leaves this to design and states the constraint: *steps 1 to 4 must be reachable from the topbar wallet in two clicks or fewer.* A wallet icon in the topbar opens a drawer — held money per custodian, the last few days of activity, and a way into the full screens.

| Ticket | Surface | Reached by |
|---|---|---|
| — | Wallet drawer (glance) | topbar wallet icon, **1 click** from anywhere |
| DSG-77 Account summary | Full-screen takeover | drawer → *Open account summary* |
| DSG-78 Activity + detail | Full-screen takeover | drawer → *See all* |
| DSG-76 Invoices and fees | Settings dialog › **Billing** | panel |
| DSG-75 Bank account | Settings dialog › **Billing** | panel |
| DSG-74 Billing details | Settings dialog › **Billing** | panel |

**There is no routed Money section.** One existed briefly — `/money`, `/money/activity`, with a tab row — and it was an orphan: nothing in the sidebar linked to it, so the only way in was the wallet drawer anyway, while Invoices and fees sat in Settings. Two containers, no relationship between them, and a section a merchant could not find on purpose.

The wallet is now the single door to the money surfaces, and Settings › Billing the single door to the billing records. Account summary and Activity open as **full-screen takeovers with a Close**, which is both the benchmark's shape and the honest one: these are read-and-close surfaces, not places you navigate to and stay. Deep links for `/screens` ride on query params (`?money=summary`), exactly as the settings panels already do (`?settings=billing&bp=fees`).

**Billing is its own settings section, not part of Payments.** The benchmark carries Business setup, Payments and Billing as three separate cards, and the split is a good one:

| Section | Holds |
|---|---|
| **Business setup** | How you trade — trading name, currency, tax calculation |
| **Payments** | How your **clients** pay **you** — policy, methods, terminals, rates |
| **Billing** | Who you are legally, and **your** money with the platform |

The first attempt filed the bank account and the legal entity under Payments, which collides with Business details — both then read as "my business's information", and the difference has to be explained rather than being obvious. Under Billing there is nothing to explain.

**Drawer for the glance, page for the close.** A drawer answers "did yesterday land?" without navigating the merchant off what they were doing — Fresha's shape, and right for that job. It does not suit the month-close job (`JOB-OWN-KNOW3`), where the merchant sits with the reconciliation, the VAT figures and an accountant, so those live on a page behind it. Bank account stays in Settings because friction is the feature there (`JOB-OWN-PAY3`).

**Invoices and fees is a settings panel, not a page.** It first shipped as `/money/fees` with a card in Billing that closed the dialog to reach it — a settings menu card that teleports you out of the dialog is disorienting, and every sibling card opens a panel in place. Fresha keeps its equivalent in this same group. The screen itself is unchanged; only its frame is.

**The drawer is not allowed to be a second opinion.** Fresha's drawer header and their account summary are two different figures both readable as "balance" (§2.1). Cami's drawer renders the same `summarize()` output the summary page renders, per custodian, so the two surfaces cannot disagree — and it shows one card per sender rather than one blended number with two schedules hiding behind it.

**Reuse, do not rebuild:** [`lib/format.ts`](../../lib/format.ts) · [`camipay-rates-panel.tsx`](../../components/blocks/payment-policy/camipay-rates-panel.tsx) and [`lib/hq-camipay/store.tsx`](../../lib/hq-camipay/store.tsx) (take rate already in-product, PRO-737 — satisfies T3-5 and gives rate-at-capture for T3-6) · [`invoice-document.tsx`](../../components/blocks/invoice-document.tsx) (DSG-72 — Cami's own tax invoice for T3-2 renders through it) · [`lib/terminals/`](../../lib/terminals/) (DSG-62 — terminal rail context) · [`lib/reports/`](../../lib/reports/) (period filter and export idiom) · settings dialog conventions per [`sales-settings.tsx`](../../components/blocks/sales-settings.tsx).

---

## 5b. What is scaffolding, and what is not

Worth stating plainly, because the review controls sit inside the product components and a developer picking this up needs to know which half to keep.

**No state picker exists on any of these screens.** One did briefly, in the takeover header, and it was a second mechanism for a job the links already do: `/screens` lists a link per state and the review message hands them out individually. A picker would also have sat inside the product UI waiting to be deleted. The query params below carry the states and leave nothing to remove.

**Goes away when the settlement API lands:**

| Thing | Why it exists | Replaced by |
|---|---|---|
| [`lib/money/mock.ts`](../../lib/money/mock.ts) | A deterministic ledger, so a screenshot in a review and an assertion in CI describe the same money | The settlement API's rows |
| [`lib/money/scenarios.ts`](../../lib/money/scenarios.ts) | Composes rails × state for review | Nothing |
| `?money=` `?state=` `?rails=` `?variant=` `?d1=` `?bd=` `?bl=` `?loading=` | Deep links for `/screens`, hosted on `/shell-demo` — none of these surfaces has a route, so the links open them over the bare app shell rather than over an unrelated page | Nothing |

**Stays, and is the point:**

| Thing | Why |
|---|---|
| [`lib/money/ledger.ts`](../../lib/money/ledger.ts) | The derivation. Every figure on every screen comes from here, and §2.1 and §2.6 are the reason it must stay the only source. API rows feed straight into it |
| [`lib/money/types.ts`](../../lib/money/types.ts) | The model — signed amounts, split custody, the opening balance |
| [`lib/money/fees.ts`](../../lib/money/fees.ts), [`fee-invoice.ts`](../../lib/money/fee-invoice.ts), [`billing-details.ts`](../../lib/money/billing-details.ts), [`bank-account.ts`](../../lib/money/bank-account.ts) | Derivations and shapes, not fixtures. The demo constants at the bottom of each go; the functions above them do not |
| Every component in [`components/blocks/money/`](../../components/blocks/money/) | The screens |
| The tests | They pin the rules, not the fixtures — "the breakdown arrives at the headline" holds whatever the ledger contains |

**A merchant never picks any of this.** The states are stages they pass through: no activity → not settle-ready → unverified, payouts paused → verification pending → healthy, with *below minimum* recurring on any run where the balance is short. Rails are configuration and sit still while all of that happens — which is why the two are separate controls here and separate concepts in the model.

---

## 6. Open decisions

| # | Decision | Blocks | Owner | How we proceed |
|---|---|---|---|---|
| **D6** | Blended view or two separate rails | DSG-77 layout | Product + design | **Both drawn**, decided at design review. Recommendation to test: one headline for Cami-held money (the only timing Cami controls), gateway money as a labelled secondary section — blending two custodians into one number recreates §2.1 from the other direction |
| **D1** | How Cami collects its take on terminal | DSG-76 one card, DSG-77 deductions | Maaz + finance, needs NeoPay | **Both built** at `/money/fees?d1=gateway|invoice`. Worth knowing before the call: it changes *presentation only*. Under either outcome a terminal fee is Cami's fee, at the same rate, in the same period — what differs is who collects it and therefore what the screen says. The derivation takes no D1 parameter, deliberately |
| **D3** | What verifies a payout destination | DSG-75 copy | Ops + compliance | **States built, method deliberately vague.** The paused banner says verification is under way and that we will make contact if anything is needed — true under any D3 outcome. Fresha's precedent: *"You will need to provide additional information and documents… to verify any new bank account"* — document verification |
| **D5** | One payout destination per merchant or per location | DSG-75 data shape | Product | Structure stays forward-compatible with OBJ-P6; single destination for now |
| **—** | Does DSG-74 duplicate PRD-9's TRN/address screen | DSG-74 scope | Michelle | Asked, still unanswered — PRD-9 is not reachable from our Linear workspace. **Built anyway**, because the duplicate risk turned out not to be in this repo: see §6c. If PRD-9 owns the surface, this becomes the design for it rather than a second one |

---

## 6a. What DSG-75 adds that the benchmark has not got

[`fresha-bank-account.png`](assets/fresha-bank-account.png) is a masked account, an Edit button, and nothing else. Four additions, each earning its place:

| Addition | Why it cannot be dropped |
|---|---|
| **Verification state on the account** | An account can be on file and not yet usable. Without the state, "why has no money arrived" has no answer on the screen it belongs on (`SET-A3`) |
| **Both senders, against one account** | Two custodians pay in on two schedules. A merchant seeing a deposit from a name they do not recognise otherwise reads it as an error (`SET-B1`, `SET-B2`) |
| **A change flow, not an Edit button** | Four steps: consequences → details → review → result. Used perhaps twice in a company's life, and it can redirect every dirham the business takes. Fast would be the wrong optimisation (`JOB-OWN-PAY3`) |
| **A permanent change log with failed attempts** | "Did someone try to redirect my money?" is not answered by a log that keeps only the attempts that worked (`SET-B5`, INV-08, INV-01) |

**The both-or-neither commit is modelled, not just drawn.** `commitDestination` in [`lib/money/bank-account.ts`](../../lib/money/bank-account.ts) returns either a new destination or a refusal carrying `nothingChanged: true` — there is no partial outcome in the type, because a partial state must never exist (`SET-B3`). The failure screen names the system that refused and restates the account still in force. Reachable at `?bd=gateway-failed`.

**Two states carry copy that must not read as an error.** A paused payout and a below-minimum roll-forward are both "no money arrived", and neither is a fault. Both say what is happening to the money instead of apologising for it.

---

## 6b. DSG-76, and why Cami's fee statement is a different document

Fresha's shape works and is adopted wholesale: period headings newest first, two documents per period, a pending row for the month still running with the date it arrives. The content is where it diverges.

| | Fresha | Cami |
|---|---|---|
| Biggest line | **Subscription and add-ons**, 58% of the statement | Does not exist. The OS is free (INV-P4, ADR-001) |
| Marketplace fees | *New Fresha client fees*, `AED 724.51` | No marketplace, no slot for one |
| Where the rate lives | A Payment methods page, three clicks away, or inside a download | **On this screen** (`SET-D9`, T3-5) |
| Fee → cause | Not traceable from the screen | Every fee expands to the sale, with the working: `3% of AED 240.00 + AED 0.75` (T3-4) |
| VAT on the fee | Absent | Stated, and reclaimable (INV-P9, T3-8) |

**Two documents, one source.** The itemised fee activity and Cami's tax invoice are both derived from the same `FeePeriod`, so they cannot disagree about the total. The tax invoice renders through DSG-72's [`invoice-document.tsx`](../../components/blocks/invoice-document.tsx) rather than a second renderer — two documents both claiming to be tax invoices, with their own layouts and their own rounding, is §2.1 one level up.

**The rate is snapshotted on the transaction** (`SET-C2`, QA `SET-X5`). A fee line renders `tx.rateSnapshot`, never the live rate card, so a renegotiation cannot restate a statement the merchant already filed. Pinned in `fees.test.ts`.

**Caught while building:** the first version of Cami's tax invoice billed messaging twice — once inside the rail subtotal it was charged on, once as its own line — so the invoice and the statement disagreed by `AED 128.00` on the same period. The test that compares the two documents is what found it.

---

## 6c. DSG-74, and the duplicate that was not there

The ticket says to check for a duplicate before creating. Two candidates, both checked:

| Candidate | Verdict |
|---|---|
| Settings › **Business details** (in repo today) | **Not a duplicate.** It holds trading name, country, currency and tax calculation. No legal name, no TRN, no registered address — despite its own category description promising "legal entity" |
| **PRD-9** (Linear) | Unresolved. The issue is not reachable from this workspace and Michelle has not answered yet |

The real finding is neither: **nobody owns these fields today.** [`lib/invoice/from-sale.ts`](../../lib/invoice/from-sale.ts) holds the issuer's legal name, address and TRN as a hardcoded constant, under a comment reading *"come from invoicing settings in production — PRD-9 owns the fields, this is the shape the document needs from them."* DSG-72 already defined the shape and left the owner blank.

So DSG-74 is built as that owner, in exactly that shape. [`issuerFrom()`](../../lib/money/billing-details.ts) returns an `InvoiceIssuer`, which is the wiring point whenever PRD-9 resolves — the document keeps snapshotting what it is given at issue, so the connection stays forward-only.

**`from-sale.ts` is deliberately left alone.** Its Pet Loft constant is load-bearing for DSG-72's before/after story (§0.0 of that spec is the same business with no TRN). Repointing it is a DSG-72 change, not a DSG-74 one.

Three details the screen carries that a settings form would not:

- **A missing TRN is a state with a consequence, not a blank row.** Without one the merchant's documents are ordinary invoices with no tax wording anywhere. Worded as a fact, since plenty of businesses are simply not VAT-registered. The test checks that claim against DSG-72's own `documentTitle` gate rather than trusting the copy.
- **Forward-only is stated in the edit dialog**, where the wrong expectation forms: a merchant fixing a typo in their legal name assumes their existing invoices get fixed too (T1-5, INV-01, INV-12).
- **No empty-string TRN.** An empty string would make the document believe it has a registration number and print a tax invoice with a blank one on it.

### Where it lives, and why not Payments

First attempt put Billing details and Bank account under Settings › **Payments**. That collided with Settings › **Business details** — both then read as "my business's information", and nothing on either screen explained the difference.

The benchmark had already solved it. Fresha's workspace settings carry **Business setup**, **Payments** and **Billing** as three separate cards ([`fresha-wallet-entry-point.png`](assets/fresha-wallet-entry-point.png)), and its Billing section holds billing details, bank account, payment methods, communication balance, invoices and fees, and subscriptions ([`fresha-billing-details.png`](assets/fresha-billing-details.png)).

The split is a good one and Cami adopts it:

| Section | Answers |
|---|---|
| **Business details** | How you trade — trading name, country, currency, tax calculation |
| **Payments** | How your *clients* pay *you* — policy, methods, terminals, CamiPay rates |
| **Billing** | Who you are legally, and your money with Cami — billing details, bank account, invoices and fees |

With that boundary there is nothing to explain: Business details is what clients see you as, Billing is what the taxman and the bank see you as. Invoices and fees keeps its routed page (it is a fuller surface than the benchmark's download list) and the Billing section links into it.

---

## 7. Pack acceptance criteria

1. A merchant can answer "what is held, when does it land, what was in it, what did Cami charge" without leaving these five screens.
2. The account summary breakdown **arrives at the headline figure**, payouts included.
3. No screen shows two figures that could both be read as the balance.
4. Every money figure is scoped in words.
5. Two rails are distinguishable everywhere money is shown.
6. A VAT figure appears on the reconciliation and on Cami's fee invoice.
7. The bank-account change flow has a drawn state for "gateway write failed, nothing changed".
8. Terminal-only and online-only merchants both have complete, non-broken screens.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-24 | Whole pack built (DSG-77, 78, 75, 76, 74). Entry point moved to the topbar wallet; Billing separated from Payments as its own settings section; the orphan `/money` routes dropped for full-screen takeovers (§5). |
| 2026-08-24 | First draft. Benchmark captured and analysed (§1, §2); route home, money model, and global rules fixed. DSG-77 built against it — §2.6 is what the build found |
| 2026-08-24 | DSG-78 built (activity, transaction detail, payout drill-in). Entry point settled on the topbar wallet drawer (§5) after review |
| 2026-08-24 | DSG-75 built (bank account, change flow, both-or-neither commit) — see §6a |
| 2026-08-24 | DSG-76 built (fee statements, Cami's own tax invoice, both D1 outcomes) — see §6b |
| 2026-08-24 | DSG-74 built (billing details). Pack complete — all five tickets have a built surface |
| 2026-08-24 | Billing moved out of Payments into its own settings section after review — see §6c. Payout schedule editor added (the Change button was dead) |
