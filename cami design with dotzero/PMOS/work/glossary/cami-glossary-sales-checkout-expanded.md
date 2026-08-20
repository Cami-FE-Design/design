# Cami Glossary: Sales & Checkout (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Sales & checkout domain, expanded from [cami-glossary.md](cami-glossary.md). This is the domain that feeds the Cami sale/void/refund checkout-state glossary pending **Sham and Maz**.
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

---

## How to read an entry

Each entry gives: **What it is** (plain meaning), **Cami mechanics** (what the system does), **Reversible** (can you undo it), **Where you see it** (UI path, ⚠︎ where unconfirmed), **Don't confuse with** (near neighbors), and **Status** (live / in build / gated / not yet). Where Cami diverges from Fresha, the entry says so.

---

## Confusable cluster: Void vs Refund vs Cancel

| Term | State of the money | In reports | Reversible | Receipt effect |
|---|---|---|---|---|
| **Void a sale** | Nothing returned. A completed cash/manual sale is cancelled out. Voucher credit returns to the voucher. Products return to inventory ⚠︎ (no deduction until phase 2) | Removed from totals; sale stays visible in the list | No. Raise a new sale to correct | Payment removed from the invoice |
| **Refund a sale** | Processed money goes back. Card refund reaches the client in a few working days ⚠︎ NeoPay timing | Stays as its own transaction, dated by refund date | No. Take a new payment instead | Original receipt stands, status becomes Refunded, refund is a new row |
| **Cancel an appointment** | No sale yet. Money moves only via deposit retention | Feeds cancellation/no-show reporting; no sales impact | No undo; rebooking is the path | No receipt; a record is kept |

**The rule:** void is chosen by **tender type, not timing**. Void for cash and manual payment types, refund for card, because a card transaction has already been processed through NeoPay.

---

## Entries

### Raise a sale

- **What it is.** Ringing up a transaction in Cami so the payment and the items record against the client.
- **Cami mechanics.** Builds a cart from appointment items and any added items, takes payment through CamiPay (or a manual type), and creates a completed sale plus a receipt. The **receipt is sent over WhatsApp in one tap**. Deposits already taken are auto-reconciled into the sale.
- **Reversible.** Partially. A completed sale can be refunded (card) or voided (cash/manual). ⚠︎ Which fields stay editable afterward is not defined for Cami (Fresha allows staff-attribution edits only).
- **Where you see it.** ⚠︎ Checkout from the appointment. Exact path unconfirmed.
- **Don't confuse with.** Draft sale, WhatsApp payment link, Pay now.
- **Status.** Live (online path).

### Draft sale

- **What it is.** A saved, unfinished cart you can keep editing before taking any money.
- **Cami mechanics.** No payment captured, no receipt, excluded from financial records until checkout completes. Items, discounts, and charges stay editable.
- **Reversible.** Yes. Nothing has moved financially, so the draft can be edited or abandoned.
- **Where you see it.** ⚠︎ Sales list, Drafts. Unconfirmed for Cami.
- **Don't confuse with.** Unpaid sale (which carries a recorded payment obligation), part-paid sale.
- **Status.** ⚠︎ Confirm Cami supports drafts at v1.

### Unpaid sale

- **What it is.** A sale completed on paper that the client has not paid anything toward yet.
- **Cami mechanics.** The sale is raised with zero collected; the full amount sits as an outstanding balance until settled. Unlike a draft it is a raised sale and cannot be modified afterward.
- **Reversible.** Partially. Not editable; refund and re-raise to change it. Settle later by collecting the balance.
- **Where you see it.** ⚠︎ Created at checkout by skipping full payment; settled from the sale record.
- **Don't confuse with.** Draft sale, part-paid sale, "unpaid sales (current period)" reporting metric.
- **Status.** ⚠︎ Confirm.

### Part-paid sale

- **What it is.** A sale where the client paid some of the total and still owes the rest.
- **Cami mechanics.** A partial payment (typically the **deposit**) is captured; the remainder stays open on the same sale for later collection. This is Cami's **default commercial shape: deposit to book, balance at completion**. Cannot be edited once raised.
- **Reversible.** Partially. The captured portion is a real payment and would need refunding; the unpaid remainder simply stays open.
- **Where you see it.** ⚠︎ Checkout, then the sale record to collect the balance.
- **Don't confuse with.** Unpaid sale, split payment, deposit.
- **Status.** Live (core model).

### Outstanding balance

- **What it is.** The money a client still owes on a sale not paid in full.
- **Cami mechanics.** Recorded against the sale and cleared when the remaining amount is collected. Applies to both unpaid and part-paid sales.
- **Reversible.** Not applicable. It is a receivable, not a movement of funds.
- **Where you see it.** ⚠︎ Sale record, pending balance.
- **Don't confuse with.** Liability (deposits and vouchers held), which is money you owe the client, not money owed to you.
- **Status.** Live.

### WhatsApp payment link (Fresha "self checkout")

- **What it is.** A secure per-invoice link the client pays from their own phone, sent in the thread.
- **Cami mechanics.** Unique link per invoice. Client enters card details; on success the sale is marked completed. This is **Cami's live online go-live path**. Sent over WhatsApp where unblocked; **SMS/email interim, WhatsApp delivery gated on META**. ⚠︎ Link expiry window not confirmed (Fresha uses 12h).
- **Reversible.** Partially. An unpaid link expires; once paid it is a processed card payment needing a refund.
- **Where you see it.** Cart, payment methods, send link over WhatsApp.
- **Don't confuse with.** Pay now (Fresha says its Pay now is explicitly not a link), terminal payment.
- **Status.** In build, pre-QA (built and in testing).

### Split payment / split tender

- **What it is.** Paying one sale with more than one method, for example part card and part cash.
- **Cami mechanics.** Each partial amount is added against the remaining balance; all process together, producing one receipt. Settles in full, so it leaves no balance.
- **Reversible.** Partially. Each captured tender is real, so reversing means refunding the sale.
- **Where you see it.** ⚠︎ Checkout, payment methods, split.
- **Don't confuse with.** Part-paid sale (which leaves a balance while a split settles in full).
- **Status.** Live (context: split tender supported).

### Void a sale

- **What it is.** Cancelling a completed cash/manual sale so it stops counting toward takings.
- **Cami mechanics.** Updates the sale status and removes the amount from all report totals; the sale stays visible in the list for record-keeping. The related payment is removed from the invoice, voucher credit returns to the voucher automatically. ⚠︎ Product return to inventory does not apply until phase 2 deduction. A void **disappears from reports**, unlike a refund, which appears as a line.
- **Reversible.** No. Un-voiding is not documented; raise a new sale to correct.
- **Where you see it.** ⚠︎ Sale record, quick actions, Void.
- **Don't confuse with.** Refund a sale (the card equivalent), cancelling an appointment (a booking action), delete.
- **Status.** ⚠︎ Definition pending Sham + Maz sign-off. Source of truth for checkout states.

### Refund a sale

- **What it is.** Giving money back on a sale already processed through CamiPay.
- **Cami mechanics.** Reverses all or part of the sale. Creates a **new transaction** rather than erasing the original; the original status becomes Refunded. ⚠︎ Card refund timing on NeoPay to confirm (Fresha: a few working days). Voucher-paid sales: ⚠︎ define whether refund returns cash or voucher credit.
- **Reversible.** No. The refund cannot be undone; take a new payment instead.
- **Where you see it.** ⚠︎ Sale record, quick actions, Refund, choose type/method/reason.
- **Don't confuse with.** Void a sale, chargeback, refund a deposit.
- **Status.** In build. ⚠︎ Pending Sham + Maz.

### Refund items

- **What it is.** Refunding specific services or products from a sale rather than the whole thing.
- **Cami mechanics.** The refund is itemized against the chosen line items on the original transaction.
- **Reversible.** No, as with any refund.
- **Where you see it.** ⚠︎ Refund dialog, Refund items.
- **Don't confuse with.** Refund amount.
- **Status.** ⚠︎ Confirm Cami itemizes refunds at v1.

### Refund amount

- **What it is.** Giving back a sum without tying it to particular items, for goodwill.
- **Cami mechanics.** Returns full or partial value without specifying items.
- **Reversible.** No.
- **Where you see it.** ⚠︎ Refund dialog, Refund amount.
- **Don't confuse with.** Refund items; discount, which reduces price before payment while a refund amount returns money after.
- **Status.** ⚠︎ Confirm.

### Refunded (sale status)

- **What it is.** The label on a sale showing money has been sent back.
- **Cami mechanics.** Status changes to Refunded once a refund is issued; the refund also exists as its own transaction row.
- **Reversible.** No.
- **Where you see it.** ⚠︎ Sales list status column and sale detail.
- **Don't confuse with.** Voided status, Unpaid.
- **Status.** ⚠︎ Pending checkout-state glossary.

### Discount (manual, at checkout)

- **What it is.** Knocking money off an item or the whole cart at the till.
- **Cami mechanics.** Fixed or percentage, on one item or the whole cart. The total recalculates with **VAT** and charges adjusted. ⚠︎ **Guardrail needed:** persona evidence shows staff can discount to zero and comp friends, so discount must be gated by permission role and logged (see Team & permissions).
- **Reversible.** Yes, while still in the cart before checkout completes.
- **Where you see it.** ⚠︎ Checkout, quick actions.
- **Don't confuse with.** Price override, refund amount, promotions (parked).
- **Status.** Live, ⚠︎ guardrails to define.

### Price override (item price edit)

- **What it is.** Typing a different price for an item instead of a percentage off.
- **Cami mechanics.** Enter a new item value to override the original; VAT and charges recalculate on the new value.
- **Reversible.** Yes, editable in the cart until checkout completes.
- **Where you see it.** ⚠︎ Checkout, item, price field.
- **Don't confuse with.** Discount. ⚠︎ Confirm whether Cami reports overrides through the same path as discounts.
- **Status.** ⚠︎ Confirm.

### Manual payment type

- **What it is.** Logging money taken outside CamiPay, such as cash or bank transfer, so records add up.
- **Cami mechanics.** Records payments taken outside CamiPay for tracking and reporting only; no funds process through Cami. **Cash is significant for Tier 3 (cash-heavy walk-ins).** Sales recorded against a manual type are the ones eligible for **void rather than refund**.
- **Reversible.** Yes for the payment-type configuration. Sales against it are voidable.
- **Where you see it.** ⚠︎ Settings, payment methods.
- **Don't confuse with.** CamiPay (real processing), the void-vs-refund eligibility rule.
- **Status.** Live.

### Pay now ⚠︎ adapt

- **What it is.** A one-tap way to take payment straight from the appointment.
- **Cami mechanics.** ⚠︎ **Diverges from Fresha.** Fresha's Pay now can charge a **saved card**; Cami has **no card-on-file** on NeoPay, so Cami's one-tap options are the **terminal or a WhatsApp payment link** only. Revisit once card-on-file lands (gap 1).
- **Reversible.** Partially. The resulting sale can be refunded (card) or voided (cash/manual).
- **Where you see it.** ⚠︎ Appointment, Pay now. Terminal path gated.
- **Don't confuse with.** WhatsApp payment link, split payment.
- **Status.** Partial. Terminal gated on NeoPay; no saved-card leg.

### Tip ⚠︎ open

- **What it is.** An optional extra the client adds for staff.
- **Cami mechanics.** ⚠︎ Open commercial question (goals): **pass-through vs margin applied**, and how tips split across staff. Do not finalize until decided (gap 5). Recommendation on file: pass-through at v1.
- **Reversible.** ⚠︎ TBD with the model.
- **Where you see it.** ⚠︎ Checkout tip screen / terminal / payment link.
- **Don't confuse with.** Service charge, commission (parked).
- **Status.** ⚠︎ Undecided.

---

## Cut from this domain (do not port)

| Fresha term | Why cut |
|---|---|
| **Surcharge** | Passing card cost to the client is a US/CA/AU/NZ region rule, not UAE-live |
| **Edit sale details / Sale edit window (6 months)** | ⚠︎ Cami's post-sale edit policy is undefined; do not inherit Fresha's 6-month window without a decision |
| **Quick payment / Quick sale items** | ⚠︎ Not documented for Cami; Fresha's own definition is unverified. Revisit if till-shortcuts are built |
| **Service charge** | ⚠︎ Low priority at v1; keep out until there is a Cami use case beyond VAT-compliant line items |
