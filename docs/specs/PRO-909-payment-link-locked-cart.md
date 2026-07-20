# PRO-909 — Payment link: locked cart, no progress theatre

Supersedes the operator half of [PRO-396](./PRO-396-camipay-contactless-checkout.md).

## Problem

The shipped operator flow (PRO-396) plays a four-beat progress sequence inside a
small dialog: `sending → adding-card → processing → paid`. Each beat is a guess
about what the client is doing on their own phone. The operator cannot act on
any of it, the beats are mock timings rather than real socket events, and the
cart underneath stays fully editable while a live link is out in the world.

That last part is the real bug: the amount on the link and the amount in the
cart can drift apart.

## Decisions

From the payment-link decision log.

| Topic | Decision |
| --- | --- |
| Link lifetime | Valid 12 hours, then expires automatically |
| Cancel | Link is **deleted / invalidated**, never edited. Links are not editable. |
| Backend | Generating a link creates a **draft sale**. Unpaid + expired leaves the sale draft/unpaid. |
| Cart while active | **Locked** — amount and payment method are both frozen |
| Only action while active | Cancel payment link |
| Cancel semantics | Invalidates the link only. Does **not** cancel the draft sale. Re-enables other payment methods. |
| After cancel | Close the cart and hand off to the **draft sale** the link created. Checkout from there resumes the journey at the **Tip** step. |
| Regeneration, config unchanged | Backend returns the **existing valid link**. No duplicates. |
| Regeneration, config changed | Old link invalidated, new link generated. Config = services, description, price. |

## Flow

1. Payment step → **Payment link** tile → `SelfCheckoutDialog`.
2. Dialog collects client name + mobile, states the 12-hour lifetime, sends.
3. Dialog closes. The drawer body is **replaced** by the full-panel
   `PaymentLinkLockScreen`. No two-pane cart, no step breadcrumb actions.
4. Lock screen shows: link sent, recipient, amount. No expiry countdown — the
   operator cannot act on the deadline and the backend expires the link on its
   own, so surfacing it only adds anxiety.
5. Operator's only action is **Cancel payment link** → confirm → link
   invalidated, cart closes, and they land on the draft sale it created
   (Sales → Drafts, detail dialog open). **Checkout** there reopens the cart on
   the Tip step with the draft's line and client loaded.

   Handing back to the draft rather than restoring the cart keeps one truth:
   the draft is what actually survived the cancellation, so that is what the
   operator should be looking at.
6. When the client pays, the server settles the sale and the drawer moves to the
   existing `ConfirmationScreen` ("Payment complete").

## Why full-panel and not a dialog

The lock is a state of the sale, not a modal moment. A dialog implies "dismiss
me and carry on"; there is nothing to carry on to. Reusing the
`ConfirmationScreen` shape makes the drawer read as terminal, which is exactly
what a locked cart is.

## Mock scaffolding

The client's side is real (`/[slug]/pay/[token]`), the operator's side can only
observe. Until the payment socket exists:

- No timed beats. The lock screen is static.
- **Mark as paid** sits at the bottom of the screen as a muted text link, not a
  button. It exists so the paid outcome is reachable from the prototype; it is
  scaffolding, and its visual weight says so. Cancel is the only real action.

## Real-build replacements

| Mock | Real |
| --- | --- |
| Local `paymentLink` state | Draft sale + link record from the backend |
| `draftRef` minted client-side, passed back on the query string | Draft ref from the created sale, looked up by the Sales list |
| Mark as paid | `payment.succeeded` socket event settles the sale |
| Cancel button | `DELETE /payment-links/:id`, then unlock |

## Out of scope

- Client-facing `/[slug]/pay/[token]` page (shipped, unchanged).
- Regeneration dedupe — backend concern; the UI cannot produce a second link
  while the cart is locked.
- Expired-link recovery from the Sales list. Separate ticket.
