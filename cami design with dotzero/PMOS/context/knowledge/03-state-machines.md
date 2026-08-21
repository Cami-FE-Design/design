# State Machines
**Last updated:** 2026-08-03 **What this is:** The lifecycle states of every core object, and what moves it between them. This is the contract engineering builds against. The checkout machine is the source of truth for payment states (sale / void / refund glossary, pending Sham and Maz sign-off, marked ⚠️).

**Source:** product.md, goals.md, personas.md, interview-snapshot-queenie.

---

## 1\. Booking lifecycle
```mermaid
stateDiagram-v2
    [*] --> Inquiry: message arrives (WhatsApp / IG / direct)
    Inquiry --> SlotHeld: client picks slot (online booker)
    SlotHeld --> Booked: deposit captured OR waived (VIP)
    SlotHeld --> Expired: 5 min hold elapses
    Expired --> Inquiry
    Inquiry --> Booked: staff books directly
    Booked --> Confirmed: auto-confirm 24h before
    Booked --> Rescheduled: client requests change
    Rescheduled --> Confirmed
    Confirmed --> InService: client arrives
    InService --> Completed: service done, balance captured
    Completed --> [*]
    Booked --> NoShow: client does not attend
    Confirmed --> NoShow
    NoShow --> Rebooked: no-show follow-up
    Booked --> Cancelled: client cancels
    Confirmed --> Cancelled
    Rebooked --> Booked
```

<table class="companion-table" style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>State</p></th><th colspan="1" rowspan="1"><p>Meaning</p></th><th colspan="1" rowspan="1"><p>Exit triggers</p></th></tr><tr><td colspan="1" rowspan="1"><p>Inquiry</p></td><td colspan="1" rowspan="1"><p>Message received, no slot held</p></td><td colspan="1" rowspan="1"><p>Slot pick, direct book</p></td></tr><tr><td colspan="1" rowspan="1"><p>SlotHeld</p></td><td colspan="1" rowspan="1"><p>Online booker holding a slot (5 min, INV-B1)</p></td><td colspan="1" rowspan="1"><p>Deposit captured, hold expires</p></td></tr><tr><td colspan="1" rowspan="1"><p>Booked</p></td><td colspan="1" rowspan="1"><p>Slot reserved, deposit taken or waived</p></td><td colspan="1" rowspan="1"><p>Confirm, reschedule, cancel, no-show</p></td></tr><tr><td colspan="1" rowspan="1"><p>Confirmed</p></td><td colspan="1" rowspan="1"><p>Auto-confirmed 24h before</p></td><td colspan="1" rowspan="1"><p>In-service, reschedule, no-show, cancel</p></td></tr><tr><td colspan="1" rowspan="1"><p>InService</p></td><td colspan="1" rowspan="1"><p>Client present, service underway</p></td><td colspan="1" rowspan="1"><p>Completion</p></td></tr><tr><td colspan="1" rowspan="1"><p>Completed</p></td><td colspan="1" rowspan="1"><p>Service done, balance captured, invoice closed</p></td><td colspan="1" rowspan="1"><p>Terminal</p></td></tr><tr><td colspan="1" rowspan="1"><p>Rescheduled</p></td><td colspan="1" rowspan="1"><p>Slot moved, client + staff notified</p></td><td colspan="1" rowspan="1"><p>Back to Confirmed</p></td></tr><tr><td colspan="1" rowspan="1"><p>NoShow</p></td><td colspan="1" rowspan="1"><p>Client did not attend</p></td><td colspan="1" rowspan="1"><p>Rebook follow-up</p></td></tr><tr><td colspan="1" rowspan="1"><p>Cancelled</p></td><td colspan="1" rowspan="1"><p>Client cancelled</p></td><td colspan="1" rowspan="1"><p>Terminal</p></td></tr><tr><td colspan="1" rowspan="1"><p>Rebooked</p></td><td colspan="1" rowspan="1"><p>New booking from a no-show/next-visit prompt</p></td><td colspan="1" rowspan="1"><p>Back to Booked</p></td></tr></tbody></table>

**Overlap:** a staff-created booking may overlap another on the same staff member (allowed, ungated, trust-based, INV-B7 / ADR-023). The online booker offers only non-conflicting slots, so a customer cannot create an overlap.

**Gaps (see** [**Edge Cases**](05-edge-case-catalog.md "05-edge-case-catalog.md")**):** no cross-channel duplicate detection before Booked (EC-1); reschedule staff-notify chain is manual (EC-7); staff overlaps have no warning or audit (EC-29).

---

## 2\. Checkout / payment lifecycle ⚠️
> Source of truth for payment states. Definitions pending Sham and Maz sign-off. Voucher tax logic is settled: no tax at issuance, tax at redemption.

```mermaid
stateDiagram-v2
    [*] --> Draft: invoice created
    Draft --> DepositDue: deposit required to book
    DepositDue --> DepositPaid: CamiPay captures deposit
    DepositPaid --> BalanceDue: service completed
    BalanceDue --> Sale: balance captured
    Draft --> Sale: full payment at once
    Draft --> Void: cancelled before settlement
    DepositDue --> Void: booking abandoned pre-settlement
    Sale --> Refund: settled funds returned
    Sale --> [*]
    Void --> [*]
    Refund --> [*]
```

<table class="companion-table" style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>State</p></th><th colspan="1" rowspan="1"><p>Meaning</p></th><th colspan="1" rowspan="1"><p>Money moved?</p></th></tr><tr><td colspan="1" rowspan="1"><p>Draft</p></td><td colspan="1" rowspan="1"><p>Invoice open, nothing captured</p></td><td colspan="1" rowspan="1"><p>No</p></td></tr><tr><td colspan="1" rowspan="1"><p>DepositDue</p></td><td colspan="1" rowspan="1"><p>Deposit required to hold booking</p></td><td colspan="1" rowspan="1"><p>No</p></td></tr><tr><td colspan="1" rowspan="1"><p>DepositPaid</p></td><td colspan="1" rowspan="1"><p>Deposit captured, auto-reconciled to invoice (INV-P7)</p></td><td colspan="1" rowspan="1"><p>Yes (partial)</p></td></tr><tr><td colspan="1" rowspan="1"><p>BalanceDue</p></td><td colspan="1" rowspan="1"><p>Service complete, remainder outstanding</p></td><td colspan="1" rowspan="1"><p>No (pending)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Sale ⚠️</p></td><td colspan="1" rowspan="1"><p>Payment complete against the invoice</p></td><td colspan="1" rowspan="1"><p>Yes (settled)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Void ⚠️</p></td><td colspan="1" rowspan="1"><p>Cancelled before settlement, nothing settled</p></td><td colspan="1" rowspan="1"><p>No</p></td></tr><tr><td colspan="1" rowspan="1"><p>Refund ⚠️</p></td><td colspan="1" rowspan="1"><p>Settled funds returned after a Sale</p></td><td colspan="1" rowspan="1"><p>Yes (reversed)</p></td></tr></tbody></table>

**Constraint:** No card stored (INV-P6), so no auto-charge of a no-show fee and no card-on-file recapture. A no-show cannot be auto-billed today (EC-15).

---

## 3\. Deposit lifecycle
<table class="companion-table" style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>State</p></th><th colspan="1" rowspan="1"><p>Meaning</p></th><th colspan="1" rowspan="1"><p>Notes</p></th></tr><tr><td colspan="1" rowspan="1"><p>Required</p></td><td colspan="1" rowspan="1"><p>Service has a deposit rule</p></td><td colspan="1" rowspan="1"><p>Per-service %: hair/nails 25%, facials/makeup/SPMU 50%</p></td></tr><tr><td colspan="1" rowspan="1"><p>Waived</p></td><td colspan="1" rowspan="1"><p>VIP waiver applied</p></td><td colspan="1" rowspan="1"><p>Who authorizes the waiver is an open question (EC-3)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Captured</p></td><td colspan="1" rowspan="1"><p>CamiPay took the deposit at booking (INV-B2)</p></td><td colspan="1" rowspan="1"><p>Automatic, not a manual link</p></td></tr><tr><td colspan="1" rowspan="1"><p>Reconciled</p></td><td colspan="1" rowspan="1"><p>Deposit applied against the client invoice</p></td><td colspan="1" rowspan="1"><p>Automated in v1 (INV-P7)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Forfeited</p></td><td colspan="1" rowspan="1"><p>No-show, deposit retained</p></td><td colspan="1" rowspan="1"><p>Manual today; no auto-fee (INV-P6)</p></td></tr></tbody></table>

---

## 4\. Reschedule loop (the dominant workload)
```mermaid
stateDiagram-v2
    [*] --> ChangeRequested: client asks to move
    ChangeRequested --> AwaitingClient: propose new slot
    AwaitingClient --> SlotMoved: client says yes
    AwaitingClient --> ChangeRequested: client counters
    SlotMoved --> ClientNotified: confirm to client
    ClientNotified --> StaffNotified: notify the stylist/staff
    StaffNotified --> [*]
```

**Reality gap:** the StaffNotified step is manual, Queenie walks upstairs because staff do not reply fast on WhatsApp (EC-7). The target is a built-in client-notify plus internal staff-notify chain.

---

## 5\. Consent / intake form
<table class="companion-table" style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>State</p></th><th colspan="1" rowspan="1"><p>Meaning</p></th></tr><tr><td colspan="1" rowspan="1"><p>Template</p></td><td colspan="1" rowspan="1"><p>Default per business type, business can override</p></td></tr><tr><td colspan="1" rowspan="1"><p>Sent</p></td><td colspan="1" rowspan="1"><p>Delivered over WhatsApp</p></td></tr><tr><td colspan="1" rowspan="1"><p>Signed</p></td><td colspan="1" rowspan="1"><p>E-signed by the client</p></td></tr><tr><td colspan="1" rowspan="1"><p>Stored</p></td><td colspan="1" rowspan="1"><p>Attached to the relevant record</p></td></tr><tr><td colspan="1" rowspan="1"><p>Prefilled</p></td><td colspan="1" rowspan="1"><p>AI auto-populates from the client profile before send</p></td></tr></tbody></table>

---

## 6\. Reminder cadence
<table class="companion-table" style="min-width: 100px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Step</p></th><th colspan="1" rowspan="1"><p>Timing</p></th><th colspan="1" rowspan="1"><p>Channel (today)</p></th><th colspan="1" rowspan="1"><p>Constraint</p></th></tr><tr><td colspan="1" rowspan="1"><p>Auto-confirm</p></td><td colspan="1" rowspan="1"><p>24h before</p></td><td colspan="1" rowspan="1"><p>SMS (Twilio) / email</p></td><td colspan="1" rowspan="1"><p>Status-only, no URLs (INV-C1)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Reminder</p></td><td colspan="1" rowspan="1"><p>1h before</p></td><td colspan="1" rowspan="1"><p>SMS / email</p></td><td colspan="1" rowspan="1"><p>Location pin allowed; WhatsApp version gated on META</p></td></tr><tr><td colspan="1" rowspan="1"><p>No-show rebook</p></td><td colspan="1" rowspan="1"><p>After a miss</p></td><td colspan="1" rowspan="1"><p>SMS / email</p></td><td colspan="1" rowspan="1"><p>Drives rebooking</p></td></tr></tbody></table>

**Open:** per-merchant sender IDs vs Cami-as-sender; the 160-character SMS limit (EC-17). WhatsApp reminders unblock on META verification.

---

## 7\. Slot hold
`Available -> Held (5 min) -> Booked` on deposit/confirm, or `Held -> Available` on expiry. Prevents double-hold from the online booker (INV-B1).

---

## 8\. Payment link lifecycle
> Links are immutable and single-active (INV-P11). Create/delete/expire only, never updated. Sending a link creates the sale in draft and locks the cart (amount + method).

```mermaid
stateDiagram-v2
    [*] --> Draft: link generated, sale created, cart locked
    Draft --> Active: link sent to customer
    Active --> Active: reminder resends SAME link
    Active --> Paid: customer pays (webhook confirms)
    Active --> Expired: 12h elapses (INV-P12)
    Active --> Cancelled: business cancels (link deleted, draft sale kept)
    Cancelled --> DraftSale: cart closes, hand off to the draft
    DraftSale --> [*]: checkout resumes at the Tip step
    Expired --> [*]: show expired screen, regenerate on request
    Paid --> Sale: invoice converts (see checkout machine)
    Paid --> [*]
```

<table class="companion-table" style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>State</p></th><th colspan="1" rowspan="1"><p>Meaning</p></th><th colspan="1" rowspan="1"><p>Notes</p></th></tr><tr><td colspan="1" rowspan="1"><p>Draft</p></td><td colspan="1" rowspan="1"><p>Link generated, sale created, cart locked (amount + method)</p></td><td colspan="1" rowspan="1"><p>Repeat clicks return the same link, no duplicates</p></td></tr><tr><td colspan="1" rowspan="1"><p>Active</p></td><td colspan="1" rowspan="1"><p>Link sent, awaiting payment</p></td><td colspan="1" rowspan="1"><p>Reminders reuse the same link (INV-P11)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Paid</p></td><td colspan="1" rowspan="1"><p>Customer paid, webhook confirmed</p></td><td colspan="1" rowspan="1"><p>Converts to Sale; webhook must confirm in seconds (EC-23)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Expired</p></td><td colspan="1" rowspan="1"><p>12h window elapsed unpaid</p></td><td colspan="1" rowspan="1"><p>Sale stays in draft; show expired screen, not blank (EC-20)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Cancelled</p></td><td colspan="1" rowspan="1"><p>Business cancelled, link deleted</p></td><td colspan="1" rowspan="1"><p>Cart unlocks; rebuild from Sales/Appointment (EC-25)</p></td></tr></tbody></table>

**Config change** (amount, description, service) invalidates and deletes the active link and generates a new one (INV-P11). **Cancel UI (PRO-909):** the drawer body is replaced by a full-panel `PaymentLinkLockScreen` (reuses the ConfirmationScreen shape, not a dismissable dialog, no expiry countdown). The only action is Cancel; **anyone who can take a sale** can cancel, not owner-only, no dedicated cancel permission (same shape as payment policy), and the cancel **records the actor** (real gate parked to a permissions card, PRO-404). Cancel invalidates the **link only**, not the draft sale, re-enables other methods, closes the cart, and hands off to the draft sale (Sales > Drafts); checkout there resumes at the **Tip** step with the draft's line and client loaded. When the client pays, a `payment.succeeded` socket settles the sale (mock "Mark as paid" stands in until the socket exists). Source: `docs/specs/PRO-909-payment-link-locked-cart.md`. **Resolved (2026-08-06):** the pet parent pays on the **provider's hosted page**; NeoPay-hosted is acceptable for the NeoPay integration, and the Cami-hosted `/[slug]/pay/[token]` page is a design alternative, not required for the NeoPay rail.

---

## 9\. Terminal (POS) session
> Canonical source: design spec `docs/specs/DSG-62-terminal-registration.md` (**supersedes** the merchant-wide-PIN model in `DSG-62-terminal-management.md`). Two credentials per device: a **pairing code** (`TRM-7Q4K2M`, issued once, immutable) binds the hardware to the business; a **sign-in PIN** (`482915`, regenerable, readable) is entered every sign-in. Diverges from the Jul 23 meeting's email-login proposal, and from the Linear backend tickets' merchant-wide HMAC PIN (see note).

`Registered -> Paired` when the device enters its own pairing code (once). `Paired -> SignedIn` when staff enter that terminal's sign-in PIN, opening a `Session` (24h, `SESSION_HOURS`, revocable per session, not person-attributable). `SignedIn -> Idle` (pending-sales list) between sales. Staff set `intended_payment_method = terminal` on a sale in the business app; it stays unpaid but surfaces in the device's pending-sales list (`GET /terminal/sales`, forced to terminal-routed sales, PRO-983), so `Idle -> SaleSelected -> Tap/Insert -> Approved | Declined`. Repeated wrong PINs move the device to `Locked` (that device only). Regenerating a terminal's PIN revokes that terminal's live sessions; the pairing code does not change. The PIN gates sign-in only, not refunds/voids/discounts. While a terminal charge is in progress the sale is **fully locked** (amount + method), matching the payment-link lock (§8); other tenders return only after cancel (Michelle, 2026-08-06).

> **Terminal Phase 1 is "trust the device report", but the provider does charge.** The terminal runs the **provider's on-device pay screens (NeoPay today)**, so the card charge is a real provider charge. The Android app then `POST /terminal/payments/report` with `{saleId, paidAmount, transactionId, status}`, and Phase 1 Cami's backend **trusts** the report rather than confirming server-side: validates `0 < paidAmount ≤ outstanding`, idempotent by `transactionId`, writes `sale_payments` method=`terminal`, runs the same settle engine as other tenders. Decline logs only, sale stays unpaid. Pilot risk: a wrong, delayed, or lost report can make the books diverge from the provider until reconciled. A later server-side gateway confirm is a **planned direction only** (no ticket yet; the `retrieveOrder`/MPGS mechanism is a discussion-doc guess, not committed). Provider is swappable (NeoPay → TapPay → Network International) behind the abstraction (INV-P3). Source: Linear PRO-982 (Phase 1 trusted settlement callback).

> **✅ Resolved (Michelle, 2026-08-06): per-device terminal PIN is law (ADR-022).** Each terminal has its own pairing code + its own sign-in PIN (design `DSG-62-terminal-registration.md`). Eng Phase 1 (`feature/camipay`) shipped a single **merchant-wide** PIN and is the stale side to migrate (eng check 2026-08-02 marks the per-device rule **Fail**; "next: per-device terminals"). Still-open sub-questions: PIN readability (retrievable by any Payment-settings user), session attribution (device vs staff), lockout trigger (PIN vs code), 24h fixed vs configurable.

---

> **Sales-domain state machines (sections 10 to 14).** Incorporated from Michelle's sales-domain state-machine draft (Slite, 2026-07-31). Canonical for the sales/ledger objects. Every new state or transition needs a corresponding business rule.

## 10\. Invoice
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending: submit
    Draft --> [*]: discard
    Pending --> Completed: capture payment
    Pending --> [*]: abandon (releases all holds)
    Completed --> Voided: void (pre-settlement only)
    Completed --> Refunded: refund (full)
    Completed --> PartiallyRefunded: refund (partial)
    PartiallyRefunded --> Refunded: refund remainder
    Voided --> [*]
    Refunded --> [*]
```
- `Completed` is the commit point: stock decrements, sessions redeem, gift-card holds convert to redemptions, revenue recognizes (INV-07).
- Zero-amount invoices follow the identical path, `Pending -> Completed` with tender = Package (INV-09).
- `Voided` and `Refunded` are terminal; a refund cannot be refunded (rule REV-08).
- Void is pre-settlement only; window policy is open (OPEN-01).

> **Reconciliation (business-rules-v2 refunds-and-voids, agreed 2026-08-04).** The Aug-4 product law says there is **no separate `PartiallyRefunded` status** (rule 15): a partially-refunded sale stays `Completed` and carries a refunded-to-date figure plus still-refundable. Treat `PartiallyRefunded` in the diagram as a derived view, not a stored status. Also settled: void is **same-calendar-day only** (rule 13) and **requires a reason** (rule 12); a voided sale is **retained, never deleted**, keeps rendering with a voided marker, and Edit/Share/Email drop away (rule 14); a refund is a **separate negatively-signed document** above the original (rule 8), apportioned across the tenders that paid, defaulting to each original method, may be returned as cash except a **gift-card tender never returns as cash** (rule 9, matches INV-05), and carries back the **tax component** (rule 10). Refund eligibility has three states: nothing captured, fully refunded, partial-refundable-up-to-remaining (rule 4). Every void/refund is audited beyond the 90-day window (rule 11, INV-08).

## 11\. Gift card
Two things move independently: the **card** has a lifecycle, the **balance** is derived from ledger events (INV-03). Do not conflate them.

**Card lifecycle**
```mermaid
stateDiagram-v2
    [*] --> PendingSale
    PendingSale --> Active: sale completed
    PendingSale --> [*]: sale abandoned
    Active --> Depleted: balance reaches zero
    Active --> Expired: expiry date passes
    Depleted --> Active: refund restores balance
    Active --> Archived: merchant archives product
    Archived --> Active: still redeemable, blocked from new sale
    Expired --> [*]
```
Archiving the product affects new sales only; issued cards stay redeemable (INV-02, rule GC-01). A `PendingSale` card still completes if the product is archived mid-flow.

> **Reconciliation (business-rules-v2 gift-cards, agreed 2026-08-04).** Sold-card status set is **Unpaid / Active / Redeemed / Expired** (rule 8); a card is **not redeemable until its sale is fully paid** (`PendingSale`/Unpaid), and staff are warned before saving such a sale. Turning gift cards off **stops selling, not redeeming** (rule 7). Face value and price paid are separate (rule 11); redemption applies at most the lesser of balance and amount owed, surplus stays on the card (rule 13); a gift card cannot buy another gift card (rule 5). **Reverse of a gift-card tender** goes back to the **same card** (replacement if expired/archived), **never cash**. **Voiding the sale that sold a card** kills the card if untouched, but is **blocked once it has been redeemed against** (refund instead).

**Balance ledger events**
```mermaid
stateDiagram-v2
    [*] --> issue
    issue --> hold: applied to cart
    hold --> release: cart abandoned
    hold --> redeem: payment captured
    redeem --> refund: sale refunded
    redeem --> void: sale voided
    release --> hold: reapplied
    issue --> expire: expiry reached
    issue --> adjust: manual correction (reason required)
```
Every event is a new row, nothing mutated (INV-03). `hold` prevents two terminals double-spending one card (INV-07). `adjust` is permission-gated and needs a reason (INV-08).

## 12\. Package session
```mermaid
stateDiagram-v2
    [*] --> Available: package purchased
    Available --> Held: appointment booked
    Held --> Available: appointment cancelled
    Held --> Redeemed: appointment invoice completed
    Redeemed --> Available: appointment invoice voided or refunded
    Available --> Expired: package expiry reached
    Available --> Revoked: package purchase refunded
    Expired --> [*]
    Revoked --> [*]
```
- Sessions are per service, not generic (ADR-020 / PDR-002).
- `Redeemed -> Available` never returns cash; the appointment invoice was AED 0.00 (INV-06).
- Refunding the **package purchase** revokes all remaining sessions; refunding an **appointment** restores one session. Different operations on different invoices.
- Restoring a session to an expired package is open (OPEN-04, EC PKG-E5).

## 13\. Product stock
```mermaid
stateDiagram-v2
    [*] --> OnHand
    OnHand --> Held: added to pending invoice
    Held --> OnHand: invoice abandoned
    Held --> Sold: invoice completed
    Sold --> OnHand: void (automatic full restore)
    Sold --> OnHand: refund with return-to-stock ON
    Sold --> WrittenOff: refund with return-to-stock OFF
    WrittenOff --> [*]
```
Void restores unconditionally; refund restores optionally, per line item, quantity-aware, default ON (rules PROD-02, PROD-03). Every movement writes an inventory record linked to the triggering invoice or refund ID.

## 14\. Reversal decision (cross-object)
The rule that governs all four objects above.
```mermaid
flowchart TD
    A[Reversal requested] --> B{Settled?}
    B -->|No, same day| C[Void available]
    B -->|Yes| D[Refund only]
    C --> E[Full automatic reversal, no credit note, no user choice]
    D --> F{What did the customer pay with?}
    F -->|Cash or card| G[Return to original tender, credit note issued]
    F -->|Gift card| H[Restore gift card balance, never cash]
    F -->|Package session| I[Restore one session, no cash moves]
```
The bottom branch is INV-06 made concrete: exactly one outcome fires. Split tender refunds proportionally across each tender (rule REV-05). Highest-risk correctness test: EC REV-E5.

> **Direction vs amount.** This flowchart is canonical for **where** money returns. It says nothing about **how much**. The amount is recomputed by re-running the Composition Order over the remaining lines, see [06 Money Composition Contract](06-money-composition-contract.md) §6. Tip on refund is an open decision (06 §9.2), so this chart has no tip branch yet.

---

## Change log
<table class="companion-table" style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Date</p></th><th colspan="1" rowspan="1"><p>Change</p></th></tr><tr><td colspan="1" rowspan="1"><p>2026-08-03</p></td><td colspan="1" rowspan="1"><p>Initial set. Checkout machine flagged pending Sham/Maz sign-off.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Added section 8 (payment link lifecycle) and section 9 (terminal POS session) from the Jul 20 and Jul 23 CamiPay meetings.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Incorporated sections 10 to 14 (invoice, gift card, package session, product stock, reversal decision) from Michelle's sales-domain Slite draft.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Reconciled §8 (link cancel → draft → Tip, PRO-909), §9 (terminal trust-device Phase 1, per-device vs merchant-wide open), §10 (no PartiallyRefunded status), §11 (gift-card statuses + reverse rules) against the design repo and business-rules-v2 docs.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Corrected §9 terminal to the provider's on-device pay screens (NeoPay today, swappable NeoPay → TapPay → NI); Phase 1 trusts the device report, Phase 2 confirms server-side.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Added §1 overlap note (staff-side overlap allowed, online non-conflicting only) per ADR-023; softened the §9/ADR-014 Phase-2 claim to planned-only.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-09</p></td><td colspan="1" rowspan="1"><p>Added a direction-vs-amount note to §14: this layer owns where money returns, 06 Money Composition Contract §6 owns how much. No tip branch until 06 §9.2 resolves.</p></td></tr></tbody></table>
