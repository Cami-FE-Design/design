# Cami Glossary: Payments & Money Movement (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Payments & money movement domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> **The load-bearing boundary for this whole domain:** Cami owns the **commercial record** (sales, deposits, refunds, liability); the **provider (NeoPay)** moves and settles money (wallet, payout, settlement). CamiPay runs on NeoPay behind a provider abstraction (NI / NeoPay / Stripe). This is why most of Fresha's money-movement vocabulary is cut, not adapted (see gap 3).
>
> **The other load-bearing fact:** NeoPay does **not store card** today. That single constraint cuts the entire card-on-file family (saved card, no-show fee, late-cancel fee, recurring capture). See gaps 1-2.

---

## Confusable cluster: Deposit vs Prepayment vs Card on file

| Term | Money taken at booking | Who decides | What happens later |
|---|---|---|---|
| **Deposit** | Yes, % or fixed part of appointment value | Payment policy, auto on qualifying bookings | Auto-reconciled and redeemed against the sale at checkout |
| **Optional full prepayment** ⚠︎ | Yes, the whole amount | The client, voluntarily | Applied at checkout; refundable before start except any non-refundable portion |
| ~~**Card on file**~~ | None | — | **Not available on NeoPay.** No stored credential, so no later fee charge |

**Cami divergence:** Fresha's card-capture policy stores a card to charge fees later. Cami cannot do this yet, so the only money secured at booking is a **deposit**.

---

## Entries

### CamiPay (Fresha "Fresha Payments")

- **What it is.** Cami's built-in card processing, in person and online.
- **Cami mechanics.** Accepts payments online (payment link, live) and in person (terminal, gated). Runs on the **NeoPay** rail behind a provider abstraction (NI / NeoPay / Stripe), so more rails can be added as preferential rates and ease-of-use warrant. Cami owns the commercial record; the provider collects and settles funds. **Cami's revenue is a percentage of payments processed here.** ⚠︎ NeoPay does not store card, so no encrypted card-on-file for recurring/memberships yet.
- **Reversible.** Not applicable. It is the processing rail.
- **Where you see it.** ⚠︎ Settings, Payments.
- **Don't confuse with.** Manual payment type (real cash logged, not processed), the NeoPay-owned wallet/settlement layer.
- **Status.** Online links: in build, pre-QA. Terminal: in architecture, gated on NeoPay.

### Payment policy

- **What it is.** The rule that decides whether clients must pay a deposit to book.
- **Cami mechanics.** Cami default: **deposit to book, balance at completion** (aggressiveness Medium), and **CamiPay is mandatory for in-platform appointment checkout**. ⚠︎ Only the "require a deposit" policy type is available; the "capture card details" type needs card-on-file (gap 1). ⚠︎ Persona nuance: deposit rules vary by service (hair/nails 25%, facials/makeup/SPMU 50%, VIPs often waived), so the policy needs **per-service percentages and a VIP waiver**.
- **Reversible.** Yes. Editable or removable on an individual appointment.
- **Where you see it.** ⚠︎ Settings, Payments; on an appointment, the payment-policy panel.
- **Don't confuse with.** Optional full prepayment (works independently), the online cancel/reschedule deadline (client self-service, not money).
- **Status.** Live (deposit type). Card-capture type gated.

### Deposit

- **What it is.** A part-payment at booking to lock in the slot, with the rest paid after the service.
- **Cami mechanics.** Charged at booking as a % or fixed amount, **auto-reconciled** into the client invoice and redeemed against the sale at checkout. Reporting distinguishes **deposit collection from deposit redemption** (two transactions). You define whether it is non-refundable or refundable within a set window; a non-refundable deposit can be **retained** at cancellation (a staff decision on the cancel screen, not automatic).
- **Reversible.** Partially. Refundable only within the window you configure; provider processing fees still apply on refund.
- **Where you see it.** ⚠︎ Payment policy settings; the appointment payment panel.
- **Don't confuse with.** Optional full prepayment, part-paid sale, deposit forfeit.
- **Status.** Live. Automated reconciliation ships in v1.

### Collect deposit now (in-store deposit)

- **What it is.** Taking a deposit face to face instead of online at booking.
- **Cami mechanics.** Collected during appointment creation or on a pending booking, via ⚠︎ terminal or link. Confirms the appointment once collected.
- **Reversible.** Partially. Refundable via the deposit refund flow, subject to processing fees.
- **Where you see it.** ⚠︎ Appointment payment panel, Collect deposit now.
- **Don't confuse with.** Online deposit at booking, optional full prepayment.
- **Status.** ⚠︎ Gated on the NeoPay terminal path (terminal in architecture).

### Refund a deposit

- **What it is.** Returning a client's booking deposit.
- **Cami mechanics.** Funds go back to the original method. ⚠︎ NeoPay timing to confirm. Provider processing fees apply, so the refund does not return the original processing cost to you. Can be done while the appointment is scheduled, or as part of cancelling by not retaining the deposit.
- **Reversible.** No. Once issued it stands.
- **Where you see it.** ⚠︎ Appointment payment panel, Refund; or the cancel flow.
- **Don't confuse with.** Refund a sale, retaining a deposit (deposit forfeit).
- **Status.** ⚠︎ Confirm.

### Cancellation window (Fresha "cancellation timeframe")

- **What it is.** The grace period before an appointment during which cancelling is free.
- **Cami mechanics.** Defines the window after which cancelling triggers **deposit retention**, and doubles as the **deposit refund window**. ⚠︎ A chargeable late-cancel fee is not available (needs card-on-file), so inside the window the lever is retain-the-deposit, not charge-a-fee.
- **Reversible.** Yes. It is a setting.
- **Where you see it.** ⚠︎ Payment policy settings.
- **Don't confuse with.** Auto-cancel, the online cancel/reschedule deadline.
- **Status.** ⚠︎ Confirm.

### Auto-cancel (on unpaid deposit)

- **What it is.** Automatically dropping a booking if the client never pays the deposit.
- **Cami mechanics.** ⚠︎ **To define (gap 8).** Deposit-to-book implies a hold-then-drop rule. Today only the **5-minute online-booker slot hold** is documented. Recommendation: a fixed default window (for example 24h after booking), later a payment-policy setting. Fresha uses 1-72h after booking or before start.
- **Reversible.** Not automatically. The appointment is cancelled; rebooking is manual.
- **Where you see it.** ⚠︎ Payment policy settings, once built.
- **Don't confuse with.** Cancellation window, the 5-minute slot hold.
- **Status.** ⚠︎ Undefined. Decide before locking appointment-status vocabulary.

### Appointment awaiting confirmation

- **What it is.** A booking not locked in yet because the client has not paid the deposit.
- **Cami mechanics.** Sits pending the payment policy being satisfied. Staff can send a reminder, view, edit, or strip the policy (removing it confirms the appointment without payment). ⚠︎ How long the client has, whether the slot is held beyond 5 min, and the auto-cancel behavior tie to gap 8.
- **Reversible.** Yes. The policy can be removed, which confirms without payment.
- **Where you see it.** ⚠︎ Appointment payment panel, Actions.
- **Don't confuse with.** Unpaid sale (post-checkout, this is pre-appointment), Booked and Confirmed statuses.
- **Status.** Live (deposit-to-book), ⚠︎ hold/auto-cancel to define.

### Optional full prepayment

- **What it is.** Letting a client choose to pay the whole appointment up front when booking.
- **Cami mechanics.** ⚠︎ Confirm Cami supports. Works like a 100% deposit and needs no stored card, so it is feasible without card-on-file. Applied at checkout; any remaining balance (added services) collected then.
- **Reversible.** Partially. Refundable before the appointment starts, except any non-refundable deposit portion.
- **Where you see it.** ⚠︎ Payment settings toggle.
- **Don't confuse with.** Deposit (mandatory, partial).
- **Status.** ⚠︎ Confirm feasibility and priority.

### Chargeback

- **What it is.** A client disputes a card charge with their bank instead of coming to you.
- **Cami mechanics.** ⚠︎ **Gap 12.** Will happen on card volume. The dispute mechanics (instant bank refund, deduction from the merchant, evidence deadline, penalty fee) are **NeoPay's** to run; Cami needs to define the **merchant-facing evidence and notification flow** on top. Map NeoPay first.
- **Reversible.** Partially. Only by winning the dispute with evidence in time.
- **Where you see it.** ⚠︎ TBD (NeoPay + Cami surface).
- **Don't confuse with.** Refund (you initiate; a chargeback is bank-initiated), void.
- **Status.** ⚠︎ Undefined. Decide before card volume scales.

---

## Cut from this domain (do not port)

### Cut now, gated on card-on-file (gaps 1-2)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Capture card details / card on file** | NeoPay does not store card | When gap 1 closes |
| **Saved card** | No stored credential to charge | With gap 1 |
| **No-show fee** | Needs a deposit deduction or saved-card charge; today deposit retention only | With gap 1 |
| **Late-cancellation fee** | Same. Inside the window Cami retains the deposit, cannot charge a fee | With gap 1 |
| **Card-on-file hold / pre-authorization** | Not a thing Cami (or Fresha) does; do not invent it | n/a |

### Cut, not Cami's model or provider-owned

| Fresha term | Why cut |
|---|---|
| **Business wallet, available vs pending balance** | NeoPay-owned. Cami owns the record, not the wallet (gap 3) |
| **Payout, transfer / send money, top-up, negative balance, wallet adjustment** | Settlement and money movement belong to the provider |
| **Merchant (booth-renter split, multi-merchant routing)** | No self-employed-split model at v1 |
| **Klarna (pay later)** | Not a Cami payment method |
| **Fresha Capital (cash advance)** | Not a Cami product |
| **Fresha credits (fee-offset currency)** | No Cami equivalent |
| **Marketplace new-client fee** | No consumer marketplace, so no discovery-attribution fee |

> Note for the Cami add-on model (gap 11): Cami monetizes **WhatsApp and reminders** on top of processing margin. That needs its own vocabulary (WhatsApp add-on, reminder add-on, text balance), which has no Fresha equivalent to port.
