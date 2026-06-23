# PRO-396 — CamiPay: contactless customer checkout

Source of truth: [Linear PRO-396](https://linear.app/getcami/issue/PRO-396) (placeholder — update once the issue exists).
Milestone **E5: Invoicing**, child of PRO-87. Sibling to PRO-395 (operator cart) and PRO-86 (public `/[slug]` pages).

## What this is

A **customer-facing** pay page. The client opens it on their own phone, sees their bill from a
finished sale, optionally tips, optionally joins a membership, and pays contactlessly (Apple Pay /
Google Pay / card). This is the half qlub owns — the operator builds the cart in `/sales/new-sale`
(PRO-395); CamiPay is what the *customer* touches.

This is **not** restaurant table-pay. Cami is a service business (groom, vet, spa, fitness). The
customer just had an appointment, they are not seated at a table. We keep qlub's contactless-checkout
mechanics and drop the restaurant-isms (item-level split between diners, "Table N", "Pay the bill").

### Reference

qlub (attached screenshots): tip presets, order summary sheet, Apple Pay + new card block,
membership upsell row, payable-amount footer. We borrow the *shape*, recontextualize the *content*.

## Entry points (both ship)

1. **WhatsApp / email link** — operator finishes a sale and triggers a pay link sent over Cami's
   channels (WhatsApp + Email per `project_cami_notification_channels`). Customer taps, pays remotely.
   Async; bill may be paid minutes or hours later.
2. **QR at counter** — customer scans a QR on the receipt/terminal, pays on their own phone in-store.

Both resolve to the same route with a signed token: `/[slug]/pay/[token]`. Token encodes the sale id
and is single-use-ish (re-openable until paid). No login required to pay.

## Scope decisions (locked with design)

| Decision | Choice | Why |
| --- | --- | --- |
| Split bill | **Single payer only** | One client pays for their pet's services. Item-level split (qlub screen 3) is restaurant-specific; dropped. |
| Tip | **In** | Presets + custom. Reuse `tipForPreset` / preset pattern from `tip-view.tsx`. Goes to service team. |
| Order summary | **In** | Expandable breakdown of services + products + tax, qlub "Order Summary" sheet recontextualized. |
| Membership upsell | **In (secondary)** | qlub "Subscribe now and save" → surface Cami **Packages** catalog inline. Lightweight; "Save AED X on this bill by joining." Not the focal action. |
| Pet attribution | **Conditional on `hasPets`** | With-pets businesses show pet name per service line ("Full groom — Bella"); without-pets hide it. One component, flag-driven (`project_cami_business_types`). |

## Money / tax model

Inherit PRO-395 exactly — do not re-derive:

- Prices **tax-inclusive**, stored in fils. `subtotal = round(total / (1 + VAT_RATE))`, `tax = total − subtotal`.
- `VAT_RATE`, `CURRENCY` from venue config consts, never hardcoded in UI math.
- Tip is added **on top** of the tax-inclusive total (qlub model): `payable = total + tip`.
- Membership discount, when applied, reduces the line/bill before tip: `payable = (total − membershipDiscount) + tip`.
- Display: 2-decimal AED throughout (`formatAedDecimal`) — checkout always shows cents, unlike the
  whole-AED sales list.

## Screen flow

Single scrollable page, sectioned top → bottom. No app shell, no operator chrome. Pet-parent
aesthetic (`project_cami_pet_parent_aesthetic`): single narrow column (~560px max), mobile-first DNA
at every viewport, no marketing furniture.

1. **Business header** — square business avatar (`feedback_avatar_shape`), business name, "Powered by Cami" / CamiPay mark. Optional "View menu" equivalent → service catalog link (deferred unless trivial).
2. **Sale summary** — line items (service + product), each row: name, optional pet pill (if `hasPets`), staff, qty, price. Expandable for full tax breakdown. Mirrors `cart-summary.tsx` read-only mode.
3. **Membership upsell** (if a relevant package exists) — checkbox row: "Join and save AED X on this bill", price/term beneath. Soft violet card. Dismissible. Toggling re-computes payable live.
4. **Tip** — "Say thanks to the team" heading, presets + custom (numpad). Selected state = violet-3 bg / violet-8 outline, matching `tip-view.tsx`.
5. **Payable amount** — sticky footer: payable total (2-decimal), "Inclusive of all taxes and charges", breakdown link.
6. **Payment** — Apple Pay / Google Pay primary (black button), "New card" block (number / CVV / expiry) secondary, "Secure payments powered by CamiPay" trust line + lock icon.
7. **Success / receipt** — paid confirmation, amount, optional emailed/WhatsApp receipt.

## States

- **Unpaid** — full flow as above.
- **Already paid** — "This bill has been paid" terminal state (link re-opened after payment).
- **Expired / void** — sale voided or token dead: neutral message, no payment UI.
- **Partial** — sale marked part-paid upstream: show "Left to pay" vs total (qlub screen 3 footer language), single payer covers remainder. (v0 may defer if no partial signal exists yet.)

## Files (proposed)

Customer-facing, lives under the public `/[slug]` tree, not `/app/sales`.

| File | Role |
| --- | --- |
| `app/[slug]/pay/[token]/page.tsx` | Route entry → `<CheckoutFlow />`. Resolves token → sale snapshot. |
| `components/blocks/checkout/checkout-flow.tsx` | Orchestrator: state, sticky footer, section scroll. |
| `components/blocks/checkout/checkout-summary.tsx` | Sale line list + expandable VAT breakdown (read-only, pet-aware). |
| `components/blocks/checkout/checkout-tip.tsx` | Tip presets + custom (reuse preset helpers from sales). |
| `components/blocks/checkout/checkout-membership.tsx` | Inline package upsell card. |
| `components/blocks/checkout/checkout-payment.tsx` | Apple/Google Pay + new-card block + trust line. |
| `components/blocks/checkout/mock.ts` | Customer-facing sale snapshot mock + reused money/VAT helpers. |

Reuse, don't fork: `formatAedDecimal`, `totals()`, tip preset system, character/initials avatar
rules. If a helper lives in `app/sales/new-sale/mock.ts`, lift shared bits to a neutral module rather
than copy.

## Terminology (per `project_cami_terminology`)

- "Sale" not "Invoice" / "Bill" in our copy where we control it; customer-facing surface may say "your bill" colloquially.
- "Team" not "staff" in tip copy.
- No "Table N", no "Pay the bill" — use "Pay" / "Pay AED X".

## Out of scope (v0)

Item-level split, split-evenly, multi-payer, real payment-gateway integration (Apple Pay sandbox
only / mock), saved cards / wallet, partial-payment chaining, refunds, currency other than AED, RTL
mirroring, receipt PDF, loyalty points, full membership purchase flow (upsell only surfaces the
offer; actual subscription is a sibling ticket).

## Open questions

1. Payment provider — Stripe? Checkout.com? Determines the Apple/Google Pay + card SDK and the trust mark. (Engineering call; blocks real integration, not the UI mock.)
2. Does the membership discount apply per-bill or recur? qlub shows "AED 15 / month" + "save AED 15 this bill". Need the Packages catalog's discount model.
3. Receipt delivery channel — auto WhatsApp, email, both, or on-demand?
4. Tip destination — pooled team vs the specific groomer/stylist on the sale?

## Acceptance for this spec

- [ ] Entry-point routing (WhatsApp link + QR) and token model agreed.
- [ ] Single-payer scope confirmed (no split UI).
- [ ] Section order and the membership-upsell prominence approved.
- [ ] Pet-attribution flag behavior confirmed against `hasPets` businesses.
- [ ] Money model inherits PRO-395 (tip-on-top, membership-before-tip) confirmed.
