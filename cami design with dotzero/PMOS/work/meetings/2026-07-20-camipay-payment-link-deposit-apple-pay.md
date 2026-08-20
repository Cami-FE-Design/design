---
id: 01KZADSE7RSR47BAPVR3QYPBMY
type: meeting
title: "CamiPay: payment link lifecycle, deposit policy, and Apple Pay"
meeting_date: 2026-07-20
created_at: 2026-08-06T02:17:42Z
participants:
  - Michelle
  - Maaz
  - GNK
  - Owais
work_area: strategy
tags:
  - camipay
  - payment-link
  - deposit
  - apple-pay
  - neopay
  - otp
  - draft-sale
  - sota
---

# Meeting: CamiPay Payment Link Lifecycle, Deposit Policy, and Apple Pay

**Date:** 2026-07-20
**Participants:** Michelle, Maaz, GNK, Owais (Marlon absent, sick, owns architecture diagram)
**Purpose:** Lock down the CamiPay online payment-link flow: link lifetime, regeneration/cancellation, draft-sale behavior, the merchant deposit/no-show policy, OTP behavior, and Apple Pay as a launch blocker. Feeds the CamiPay build and a Linear ticket.

---

## Payment link lifecycle

- **Link lifetime is 12 hours** (confirmed against Fresha), or until paid or cancelled. Keep it long. Terminal is separate, not 12h.
- **Links are never updated, only created, deleted, or expired.** NeoPay has no update-in-place. To change anything, delete/invalidate the old link and generate a new one.
- **Reminders reuse the same link.** If a valid link already exists, the backend returns that same link (a reminder is just a nudge, not a new link). Repeated clicks must not spawn multiple links.
- **A new link is generated only when config changes** (amount, description, service, data). That invalidates and deletes the previous link.
- **Expired link must show an "expired" screen, not a blank page.** Copy: link expired, ask the business to regenerate. Prevents "your link doesn't work" complaints to SOTA.

## Draft sale and cart lock

- **Sending a payment link creates a sale in draft/unpaid status on the backend.** Amount and payment method are locked to that link.
- **Once a link is generated the cart/card is locked.** The only action shown is Cancel, which deletes/invalidates the link. There is no editing behind an active link.
- **If unpaid after 12h,** the link expires and the sale stays in draft.
- **Fixing a mistake (wrong amount/service):** cancel the draft sale's link, then rebuild the cart from scratch and generate a new link. **Decision:** on cancel, restart the cart flow from Sales or the Appointment (resume from tip step, not from a locked card screen), because the reason for cancelling is usually a wrong service/package/voucher or a tip change. Do not force a whole new appointment.
- Appointment vs sale: the appointment stays as-is; entering checkout creates the sale. A cart/link failure lives in draft sales and is fixable there. Only a wrong appointment (wrong client/service) means cancelling the appointment itself.

## Cancel-link UI

- Reuse the existing payment-complete component: a full-drawer "payment in progress" takeover with a **Cancel button at the bottom**, blown out over the drawer. Not the current dev lock screen. Cancel deletes the link and resumes the journey. (Michelle to have Hussein update.)

## Deposit / no-show policy (merchant-level, Settings > Payments)

Three configurable options:
1. **No payment policy** — no link sent.
2. **Requires deposit upfront** — a percentage (e.g. SOTA 25%); 100% = full prepay to confirm. Deposit is always a percentage. Per-service override supported.
3. **Capture card details (authorization only, no charge)** — **DROPPED for MVP.** Cami does not store/manage cards, so this half-baked middle ground is cut. Add later with authorize-and-capture.

- Refundable/reschedule window is merchant-set (e.g. non-refundable, reschedule up to 48h before).
- **Cami does not auto-charge no-show/late-cancel fees** (no card stored). Business decides and charges manually. Auto-fee would require a Cami payment-support team and is out of scope.
- Book→Confirmed is **manual**. Reminders are automated; the decision to confirm or cancel an appointment is not. SOTA works the calendar each morning nudging booked (blue) appointments to confirm-with-deposit, and cancels unconfirmed ones at 6pm end of day.

## Deposit-unpaid-then-pays-in-store

- If the customer never paid the deposit link and pays at reception, **generate a new link for the full 100% amount** and expire the old deposit link.
- **Terminal never takes a deposit.** Online links collect deposits; terminal/offline collects remaining or full amount. Exception: terminal can take an upfront payment for packages.

## OTP behavior (bank / NeoPay default, not a Cami rule)

Triggers to document for SOTA reception training:
1. First-time card add (new customer onboarding).
2. Amount above a threshold (~1000 AED, varies by bank and card).
3. Charging outside the appointment time window (future-dated appointment charged now). Authorization = OTP now, capture later.

- OTP applies to payment link and the custom pet-parent flow, not really the terminal.
- OTP screen carries the bank/provider branding, which helps reduce customer confusion. Reception should tell customers "it's your bank asking, not Cami or SOTA."

## Apple Pay (launch blocker)

- **Apple Pay is mandatory.** The manual card-add screen kills adoption ("no one will add a card"). A client left a provider purely to get Apple Pay.
- NeoPay fast-click methods: Mastercard, Google Pay, Apple Pay. **Remove Blackberry Pay.**
- Apple Pay setup: Cami Apple **merchant** account → register domains → certificate configured on the NeoPay hosted page → domain verified per charge.
- **Action:** create the Cami Apple merchant account now (currently blocking). GNK to share account details; Michelle to action.

## CamiPay scenario deck (Maaz, weekend)

- **Online:** (1) pet-parent books, pays 100% upfront to confirm (a deposit); (2) card-on-file no-show authorization, no charge now; (3) WhatsApp/SMS deposit link; (4) 100% invoice link to protect a high-value future booking; (5) storefront/Sunday-Bazaar QR menu purchase (products/vouchers); (6) tip (future, after service, in the rating flow).
- **Offline:** (1) Apple Pay / physical card via POS terminal (~90% of payments); (2) QR menu order, pay in-store via terminal.
- **Split payment:** checkout needs cash + payment link + terminal + gift card (prototype only had card + cash).

## Open / follow-ups

- [ ] Create/update the Linear ticket covering link lifecycle, cancel/regenerate, draft-sale behavior, and the payment policy config; tag Maaz (he will trim scope, e.g. drop capture-card-details).
- [ ] Create the Cami Apple merchant account (blocking Apple Pay).
- [ ] Marlon to produce the CamiPay architecture diagram when back; needs high-level sketch + merchant Apple account requirements.
- [ ] Document all payment-failure scenarios (declined, expired, cancelled) — the real risk area. "No 1% bugs" on payments.
- [ ] Confirm the exact OTP amount/time-window thresholds with NeoPay for reception training (likely bank/card dependent).
- [ ] Payment policy config screens: Michelle to design; maps to Ahsan's settings work once done.
