---
id: 01KZADSE7REV161E6S6BNH3GR0
type: meeting
title: "CamiPay: deposit policy, balance capture, and terminal checkout"
meeting_date: 2026-07-23
created_at: 2026-08-06T02:17:42Z
participants:
  - Michelle
  - Maaz
  - GNK
  - Owais
work_area: strategy
tags:
  - camipay
  - deposit
  - terminal
  - pos
  - neopay
  - accounting
  - refund
  - packages
  - sota
---

# Meeting: CamiPay Deposit Policy, Balance Capture, and Terminal Checkout

**Date:** 2026-07-23
**Participants:** Michelle, Maaz, GNK, Owais. To be pulled in: Sham (CamiPay reporting + policy), Chime/accountant (accounting integration), Harun (edge/failure cases), Taha (added to daily scrum).
**Purpose:** Demo the working online payment-link flow, resolve the deposit-vs-balance conflict, settle deposit accounting treatment and refund policy, and review the terminal (POS) checkout wireframe. Daily standup on CamiPay going forward.

---

## Working flow (demoed)

- Sale created → payment link at full amount → amount + method locked → NeoPay confirms via webhook → appointment marked completed, invoice paid/closed.
- **Webhook latency is too slow** in test (1–2 min on a local OS server). Must be within seconds; the customer is waiting for the receipt. Whatever server is used must match SOTA-grade speed. Action item.

## Apple Pay / fast-click (critical, carried from Jul 20)

- The whole manual-card flow drops adoption. Confirm Apple Pay / fast-click is enabled in NeoPay **test mode**; if not, escalate a ticket to NeoPay to enable it. GNK owns; ~30 min if already allowed. Blocker for SOTA (Christine won't migrate hundreds of stored cards).

## Deposit + balance (conflict resolved)

- Merchant configures a deposit % (25% / 50%, per-service). The payment link auto-detects the configured % of the sale amount.
- **Conflict:** GNK wanted the remaining 75% collected offline only (terminal + cash); Owais/Michelle wanted an online link allowed too.
- **Resolution: offer both** an online payment link and the terminal for the balance. **Terminal is the preferred/bold option** because it is cheaper (~1.9% vs ~2.5% online) and reception is used to handing over the card machine. Card is not stored (storage is NeoPay's responsibility), so the online balance is a fresh link, not a charge-on-file.

## Deposit accounting treatment

- A deposit is **deferred revenue / a liability**, not a rendered sale. It behaves like a voucher: money owed back as service.
- The invoice starts as **part-paid**; the **tax invoice is generated when the service is rendered**, not at deposit capture.
- **Open for the accountant (Chime / Honain):** is the deposit a tax invoice or a non-tax deposit? GNK to share the current sale/invoice definitions and process with the accountant for sign-off.

## Deposit rules and scope

- **Percentage or fixed amount** both supported. If the fixed deposit exceeds the bill, take the whole service amount.
- **Deposits are for appointments only.** Standalone product or gift-card sales get a full-amount runtime link, no deposit.
- **Mixed cart (appointment + products + gift card):** the appointment's deposit is already handled at booking; the cart charges the full remaining sum. Do not generate a separate deposit link from a mixed cart.

## Refund / cancellation policy

- Configurable merchant-side: cancel-with-refund vs cancel-without-refund, plus a refundable window (24h / 48h / 30 min, etc.).
- Layered logic: merchant policy → per-service refundable flag → an appointment is non-refundable if any included service is non-refundable.
- **Cami never auto-charges** no-show/cancellation fees (no card stored). The merchant decides; Cami is not booking.com holding money.
- **Outside the refundable window (non-refundable):** show the policy note plus a **Call / WhatsApp the business** button on the pet-parent manage-appointment screen. Keeps Cami out of disputes. Anum owns that screen (public pet-parent booking + manage appointment); add a disclaimer.

## Packages and recurring

- **No deposit link for package redemption** — already paid upfront. Terminal may take the upfront package payment.
- **Redemption time is the standard, not booked time.** Refundability and policy are measured at redemption, not when the future appointment was booked.
- A recurring, non-package appointment follows the normal reminder cadence with an optional manual deposit request. Full recurring/package payment logic needs a **separate workshop** with Sham (edge-case heavy).

## Terminal (POS) checkout wireframe

- **Login:** email/password (not a bare PIN), via a dedicated **terminal RBAC role** that returns only terminal-needed data. Same auth as Cami Business.
- **Session:** authenticate once, persistent session, never re-login daily. Idle/listening screen when not in use. A **PIN screen** handles quick re-entry after idle/logout. Reset by manager/owner via email (e.g. Christine at SOTA). It authenticates the terminal, not per-transaction, so a groomer carrying the machine is not blocked.
- **Terminal ↔ sale connection:** a **draft sale initiated from Cami Business sends a signal; the terminal receives the amount.** No invoice list on the terminal (reception should not hunt for an invoice at checkout).
- **Screens:** login → idle/listening → amount + Pay Now → tap/insert → loading → approved/declined.

## Business logic / policy documentation

- Sham (ramping on CamiPay reporting) and Chime (accounting integration) both need a **central policy + data-point document**. Reports get built around it.
- Michelle owns it. Approach: reverse-extract the business rules already implemented to find the gaps vs what's planned. Mullen already extracted some into a doc. Share terminology and every data point captured (appointment → invoice → part payment → payment).

## Open / follow-ups

- [ ] Fix webhook confirmation latency to seconds (server choice).
- [ ] Confirm/enable Apple Pay in NeoPay test mode; escalate if blocked.
- [ ] GNK: share sale/invoice definitions with the accountant; confirm tax vs non-tax on deposits.
- [ ] Build the central policy + data-point document (Michelle) for Sham and Chime.
- [ ] Pull Harun in early on payment failure/edge cases (void, refund, cancel, declined).
- [ ] Terminal wireframes: dedicated session next day.
- [ ] Anum: add non-refundable disclaimer + Call/WhatsApp button to the pet-parent manage-appointment screen.
- [ ] Post use cases and flows in the CamiPay Slack channel; keep async there.
