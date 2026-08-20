---
id: 01KZ1K46GQ4XGF42YN7Q194T1V
type: meeting
title: "Sales, refund, and void rules: gift cards, packages, sessions"
meeting_date: 2026-07-31
created_at: 2026-08-02T15:57:48Z
participants:
  - Hunain
  - Maaz
  - Ahsan
  - Michelle
work_area: strategy
tags:
  - checkout
  - refund
  - void
  - gift-cards
  - packages
  - sota
---

# Meeting: Sales, Refund, and Void Rules

**Date:** 2026-07-31
**Participants:** Hunain, Maaz, Ahsan, Michelle
**Purpose:** Work through checkout business logic (sale, void, refund) for gift cards, packages/memberships, and sessions. Feeds the sale/void/refund glossary that is the source of truth for the checkout workstream (pending Sham and Maz sign-off).

---

## Void vs. refund (working definitions)

- **Void** undoes a mistaken or mistyped checkout. Credit is returned automatically and no cash moves (the invoice is reversed, not settled).
- **Refund** moves money back to the customer.
- If void adds no value over refund for a given case, drop the void option; it only creates trouble.

## Gift cards

- **Expired gift card: refund only, no void.** Voiding an expired gift card creates system trouble. Optionally, restrict all gift-card transactions to refund-only for simplicity (team's call), but expired is a hard rule.
- **Cannot disable or remove the gift-card feature while any active gift card exists.** Existing vouchers must stay redeemable. "Disable" must mean stop issuance/sales of new gift cards, not remove the feature or invalidate outstanding vouchers.
- **Cannot hard-delete an active voucher that has an active redemption.** Replace the current hard-delete option with disable/hide.
- **Pending gift-card sale while the merchant disables gift cards:** still honor it. If the feature is now off, honor by refunding the money (same pattern as buying an out-of-stock product, you refund). Pending means the sale has not gone through, so removal is allowed, but any in-flight or paid amount must be made whole.

## Packages and memberships

- **Package and membership are the same infrastructure.** Drop "membership" as terminology, it confuses the team; the front end already does not use "membership" language. Align on "packages." A true recurring/benefits membership (monthly payment, member discounts) is a separate future concept, park it with Mesh; discounts are handled as discount codes for now.
- **Consumption reduces on invoice completion (redemption / checkout commit), not at booking.** Booking places a hold so a customer cannot book beyond entitlement; checkout commits the consumption.
- **Per-service value inside a package:** each service consumes its own configured value (for example 30 and 60, not a flat per-session amount). Remaining = total minus the sum of consumed service values.
- **Refunding a package refunds only the unconsumed amount by default.** Consumed sessions are not refundable unless their redemption invoices are voided first; voiding them makes that value unconsumed and refundable. **⚠️ Superseded/conflict:** PDR-001 (ADR-019) later set the default to *retail clawback* (paid minus used × full retail), not pro-rata unconsumed. Confirm with Maaz which default holds.
- **Merchant can refund a custom amount** up to the unconsumed value (or less, per shop policy, for example a penalty). This is merchant-to-customer relationship dependent and directly addresses a Fresha complaint (Fresha forced full-membership refunds).
- **Refund of a sale paid by gift card:** default returns to the original tender (gift card), but give the option to refund by cash, bank transfer, or another method. Flexibility is preferred, and refunding by card requires the transaction to reverse back to the bank.
- **Zero-amount invoice** (service fully covered by the package, nothing left to pay): valid, correct behavior.
- **Buying the same package again:** do not issue a duplicate code; stack/add the sessions (or extend) under the existing package code.

## Sessions

- A **session is a unit of a package** (a package can be 2, 5, 10 sessions, etc.).
- **One session does not have to equal one service.** A session can be a combo that consumes multiple services together (for example blow dry + hair color = one session).
- Two implementation paths: (1) allow a combo, one combo = one line item = one session that consumes its configured services, or (2) force the merchant to create a single combined service (this is how Fresha handles it). Cami can support combos; selecting a combo consumes the configured services in one session.
- If the merchant wants services forced together (must take them in the same visit or lose them), model it as a combo/single service.

## Open / follow-ups

- Finalize the glossary and get Sham and Maz sign-off before it guides checkout fixes.
- Confirm the packages-only terminology change is reflected everywhere (front end already aligned).
- Revisit true "membership" (recurring payment + member discounts) separately with Mesh.
