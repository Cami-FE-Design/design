# Money Composition Contract

**Version:** v0.1 **Status:** ⏳ Draft for review **Owner:** Michelle (Product) **Last updated:** 2026-08-07

**What this is:** How money objects compose onto one invoice. Individual feature specs (promotions, gift cards, packages, deposits, tips) define behavior in isolation. This document defines what happens when two or more apply to the same invoice. Every payment-touching ticket cites this document.

**Scope.** How money objects compose into an amount. **Not** how funds move. Settlement, payout, provider reconciliation, and gateway mechanics are out of scope (see [Product Invariants](01-product-invariants.md) INV-P2, INV-P3 and [State Machines](03-state-machines.md) §8, §9).

**Two citable units.** The **Composition Order** (§2) is the sequence. The **Scope Rule** (§3) is whether an object touches the invoice or only the tender record. Tickets cite one or the other by name, plus an invariant ID.

---



## 1. Canonical objects

Each noun defined once. No synonyms permitted in specs, code, or API payloads.

> **Ownership:** the [Glossary](02-glossary.md) owns term definitions. Terms new here (taxable gross, line gross, amount due, line discount, cart discount) are mirrored into 02. Where a term already exists in 02, that definition governs and this table states only its composition role.


| Object                 | Definition                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Line price**         | Price of a single service or product as configured by the merchant. Stored VAT-inclusive.                           |
| **Line discount**      | Reduction applied to one specific line. Reduces taxable gross.                                                      |
| **Cart discount**      | Reduction applied to eligible subtotal across lines. Reduces taxable gross. Allocated back to lines pro-rata.       |
| **Package redemption** | Drawdown against a previously sold package entitlement. Renders the line at zero gross. Not a discount, not tender. |
| **Gift card**          | Stored-value instrument. Tender, not a discount. Never reduces taxable gross.                                       |
| **Deposit**            | Funds collected before service delivery. Held as liability (INV-P10). Becomes tender at capture.                    |
| **Tip**                | Voluntary gratuity, staff-entered at checkout. Invoice-scoped. Outside the tax base.                                |
| **Taxable gross**      | Sum of line gross after all discounts and redemptions. VAT-inclusive.                                               |
| **VAT**                | Derived from taxable gross, not added to it.                                                                        |
| **Amount due**         | Taxable gross + tip. The figure the customer pays.                                                                  |
| **Tender**             | Anything that settles amount due: card, cash, gift card, deposit, credit.                                           |
| **Credit**             | Merchant-issued balance from a refund or adjustment. Tender.                                                        |


---



## 2. The Composition Order

Fixed sequence. No step may be reordered.


| Step | Operation                                                                         |
| ---- | --------------------------------------------------------------------------------- |
| 1    | Line price, VAT-inclusive per Cami storage basis                                  |
| 2    | Line-item discount applied                                                        |
| 3    | Package redemption applied, line gross set to zero                                |
| 4    | Cart discount applied to remaining eligible subtotal                              |
| 5    | Cart discount allocated back to each eligible line, pro-rata by post-step-3 gross |
| 6    | VAT derived per line from final gross: `VAT = gross × 5 / 105`                    |
| 7    | Taxable gross = sum of final line gross                                           |
| 8    | Tip added, outside tax base                                                       |
| 9    | Amount due = taxable gross + tip                                                  |
| 10   | Tender applied against amount due                                                 |


Package-redeemed lines are excluded from cart discount eligibility. A zero-gross line cannot absorb further reduction.

> **Relationship to INV-13.** INV-13 states the coarse precedence (line prices → cart discount → tax). The Composition Order is the full form of that same rule, not a competing one. Cite the Composition Order for anything computing an amount; cite INV-13 for precedence questions outside totals (payment policy resolution, promotion stacking).

> **Vocabulary is closed.** "Waterfall", "pipeline", "money flow", and "totals order" are not synonyms for the Composition Order. One name.

---



## 3. The Scope Rule

Every object is either invoice-scoped or payment-scoped. This table is the root fix for the `PAYMENT_EXCEEDS_BALANCE` class of defect.


| Object             | Scope       | Mutates balance | Persisted on invoice |
| ------------------ | ----------- | --------------- | -------------------- |
| Line price         | Invoice     | Yes             | Yes                  |
| Line discount      | Invoice     | Yes             | Yes                  |
| Cart discount      | Invoice     | Yes             | Yes                  |
| Package redemption | Invoice     | Yes             | Yes                  |
| **Tip**            | **Invoice** | **Yes**         | **Yes**              |
| Gift card          | Payment     | No              | As tender record     |
| Deposit            | Payment     | No              | As tender record     |
| Credit             | Payment     | No              | As tender record     |
| Card / cash        | Payment     | No              | As tender record     |


**Rule.** An invoice-scoped object must be written to the invoice before any payment request is made. A payment request may not introduce an invoice-scoped object as request-only data. Any endpoint accepting a tip must persist it and recompute amount due before capture.

**Rule.** Tender never alters taxable gross or VAT. Applying a gift card does not change what the merchant owes the tax authority.

---



## 4. Tax base

- Storage basis is VAT-inclusive. VAT is derived, never appended.
- Standard rate 5 percent. Derivation: `VAT = gross × 5 / 105`.
- Discounts reduce the base before derivation.
- Package redemption renders the line at zero gross. VAT treatment at point of package sale is an open decision (§9.3).
- Voluntary tip is outside the scope of VAT and is excluded from the base.
- Gift card sale is not a supply. No VAT at sale. VAT arises on redemption against a taxable supply (INV-P8, ADR-007).

**Two totals must be reported separately at all times.** Amount due and taxable gross are different figures whenever a tip exists. Receipts, exports, settlement reports, and tax returns must expose both. A single "total" field is insufficient and will produce an incorrect return (INV-P9).

---



## 5. Invariants (INV-M1 to INV-M8)

Machine-checkable. Any endpoint capable of violating one of these has a defect regardless of what the ticket says. Registered in [01 Product Invariants](01-product-invariants.md); defined here.


| ID     | Invariant                                                   |
| ------ | ----------------------------------------------------------- |
| INV-M1 | `taxable_gross = Σ line_gross_final`                        |
| INV-M2 | `vat_total = Σ round(line_gross_final × 5 / 105)`           |
| INV-M3 | `amount_due = taxable_gross + tip`                          |
| INV-M4 | `Σ tender = amount_due` (at settled state)                  |
| INV-M5 | `tip ∉ tax_base`                                            |
| INV-M6 | `line_gross_final ≥ 0` for every line                       |
| INV-M7 | `Σ discounts ≤ Σ eligible_line_gross_pre_discount`          |
| INV-M8 | `gift_card_redeemed ≤ gift_card_balance_at_time_of_capture` |


**INV-M3 is the invariant the current** `/payments` **implementation violates.** It reads a balance computed without the tip. This is a Scope Rule violation, not a Composition Order violation: the tip was treated as payment-scoped.

---



## 6. Refund, void, partial

Direction of return is governed by [INV-05, INV-06](01-product-invariants.md) and the reversal decision flowchart in [State Machines §14](03-state-machines.md). This section states only what the Composition Order does on reversal. It does not restate reversal law.


| Object               | On full refund                                     | On partial refund                                            |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Line gross           | Returned to original tender                        | Pro-rata by refunded lines                                   |
| Line / cart discount | Reversed proportionally                            | Pro-rata, recompute the Composition Order on remaining lines |
| VAT                  | Reversed with the line, credit note issued         | Recomputed on the remaining taxable gross                    |
| Package redemption   | Entitlement restored to the package                | Entitlement restored per redeemed unit                       |
| Gift card            | Returned as gift card balance, never cash (INV-05) | Same                                                         |
| Deposit              | Returned per merchant cancellation policy          | Per policy                                                   |
| **Tip**              | **Open decision (§9.2)**                           | Open decision                                                |


**Rule.** A refund never returns more to a tender type than that tender contributed.

**Rule.** Void before capture releases the invoice with no ledger entry. Refund after capture always produces a credit note with its own document number (INV-04).

---



## 7. Rounding and precision

- AED, 2 decimal places, fils.
- Rounding applied once, per line, at VAT derivation. Never at subtotal, never twice.
- Half-up.
- Pro-rata cart discount allocation leaves a residue of one or more fils. **The residue is assigned deterministically to the line with the largest post-discount gross.** Ties broken by lowest line ID.

This rule exists so two systems computing the same invoice produce byte-identical output.

---



## 8. Idempotency

- Every payment request carries a client-generated idempotency key.
- A retry with the same key returns the original result. It never creates a second tender record.
- Terminal disconnect mid-capture is the expected failure mode, not an edge case. Reconciliation reads by key, never by amount plus timestamp.
- Gift card and deposit drawdown are part of the same idempotent unit as the card capture. Partial application on a failed capture is not permitted.

---



## 9. Open decisions

Blocking. Each needs an owner and a date. **Each becomes an ADR in [04 Decision Records](04-decision-records.md) when it lands.** A decision does not resolve inside this document.


| #   | Decision                                                                                                                | Why it blocks                                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9.1 | **Mandatory service charge.** Two distinct objects, or one object with a taxable flag set at business config level?     | A voluntary tip is outside VAT scope; a mandatory service charge is consideration for a supply and is taxable. One generic "tip" field means a merchant uses it for a mandatory charge and output tax is understated. Requires tax confirmation before build |
| 9.2 | **Tip on refund.** Returned to the customer, or retained because already distributed to staff?                          | Payout timing determines the answer. Already deferred by owner 2026-08-06 (04, Deferred list)                                                                                                                                                                |
| 9.3 | **VAT timing on package sale.** At sale, or at redemption?                                                              | If charged at sale, redemption must not charge again. If at redemption, the package sale is a liability like a deposit. Pick one, make redemption consistent                                                                                                 |
| 9.4 | **Gift card scope constraint.** Amount-denominated only, or service-specific permitted?                                 | Service-specific cards can change VAT timing. Constraining to amount-denominated removes the ambiguity entirely                                                                                                                                              |
| 9.5 | **Tip on package-only invoice.** If taxable gross is zero, is a tip permitted, and against what does it settle?         | Interacts with INV-09 (zero-amount invoice is valid)                                                                                                                                                                                                         |
| 9.6 | **Discount eligibility flags.** Which line types may be discounted; do promotions stack or are they mutually exclusive? | Overlaps the open precedence question in [05 Edge Cases](05-edge-case-catalog.md) INVC-E3, INVC-E4, MBR-E5                                                                                                                                                   |


---



## 10. How this document is used

- **Every Linear ticket touching amount due links here and cites the specific rule:** the **Composition Order** (step N), the **Scope Rule**, or an **invariant ID** (INV-M1 to INV-M8). "Links to the Money Composition Contract" without a citation does not satisfy INV-11.
- Any spec introducing a new money object must add a row to §1 and §3 before it can reach Definition of Ready.
- Invariants in §5 become automated tests. A failing invariant is a release blocker.
- Vocabulary is closed. See the note under §2.

---



## Change log


| Date       | Change                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-07 | Initial v0.1. Adopted from the Money Contract draft. Named the two load-bearing rules (Composition Order §2, Scope Rule §3), renumbered I1-I8 as INV-M1 to INV-M8 and registered them in 01, added the scope boundary (composition not movement), pointed §6 reversal direction at INV-05/INV-06 and State Machines §14 instead of restating, routed the six open decisions to 04. |


