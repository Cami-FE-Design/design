# PRO-395 — Building cart with items ("Add to cart")

Source of truth: [Linear PRO-395](https://linear.app/getcami/issue/PRO-395/building-cart-with-items).
This doc records the build decisions and what is deferred. Milestone **E5: Invoicing**,
child of PRO-87.

## What this is

Full-screen point-of-sale takeover where a receptionist builds a cart of items
(appointments, services, products) for a client before Tip and Payment. Cart is a
**snapshot** of source data at pull time, not a live reference.

Route: `/sales/new-sale` (no app shell, deep-linked from `/screens`).

## Files

| File | Role |
| --- | --- |
| `app/sales/new-sale/page.tsx` | Route entry → `<CartFlow />`. |
| `app/sales/new-sale/cart-flow.tsx` | Orchestrator: state, two-pane layout, breadcrumb, draft modal, appointment-replace confirm. |
| `app/sales/new-sale/item-picker.tsx` | Left pane: global search, category tiles, Appointments / Services / Products drilldowns, aggregated search results. |
| `app/sales/new-sale/client-panel.tsx` | Right pane top: attach states (none / searching / selected / walk-in). |
| `app/sales/new-sale/cart-summary.tsx` | Cart line list (+ empty state) and expandable VAT footer. |
| `app/sales/new-sale/mock.ts` | Catalog mock + money / VAT helpers + venue config consts. |
| `app/sales/new-sale/types.ts` | Domain + cart types. |

## Money / tax model

- Prices are **tax-inclusive**, stored in fils (minor units).
- Breakdown is **back-calculated**: `subtotal = round(total / (1 + VAT_RATE))`,
  `tax = total - subtotal`. This guarantees `subtotal + tax === total` exactly
  (no rounding mismatch).
- `VAT_RATE` and `CURRENCY` are read from `mock.ts` venue config consts, not hard-coded
  in the UI math. `CLIENT_REQUIRED` toggles the CTA block.

## Built (in scope)

- Two-pane layout, breadcrumb `Cart > Tip > Payment`.
- Item entry: Appointments, Services, Products + global search (Services/Products grouped with counts).
- Client attach: search (2+ chars, matches name/phone/email), Add new client, Walk-In, selected card with Actions.
- Add/remove lines; product qty +/-; service staff dropdown; duplicates stack as separate lines.
- Appointment snapshot auto-attaches its client; replace-confirm (Keep / Replace / Cancel) when another client is attached.
- Footer: collapsed Total + To pay + CTA; expandable Subtotal / Tax (VAT) / Total. Discount rows scaffolded, hidden when none.
- Empty states (cart empty, no search results). Draft modal (Save as draft / Discard) on close with items; silent close when empty.

## Deviations / simplifications (v1)

- **Clients use character-avatar fallback** (our design system), not the letter initials in the Fresha reference screenshots.
- **Services drilldown is a flat searchable list grouped by category**, not a category-count drill-in. Matches the screenshot search behavior; revisit if count-first navigation is wanted.
- **"Add new client"** attaches a placeholder client — real quick-create flow is a sibling ticket.
- **Memberships / Gift cards** tiles render disabled (out of scope per ticket).
- **Quick sale** tile from the screenshots is omitted (out of scope).
- Footer **discounts** are read-only scaffolding (no backend signal yet).
- "Save as draft" closes the flow; Drafts persistence is a sibling ticket.
- Money renders whole AED (matches existing sales list); 2-decimal display deferred.

## Not built (other tickets / later)

Tip flow, payment processing, manual discounts, deposits, receipts, RTL mirroring,
role-based AED hiding, keyboard-nav niceties, large-catalog pagination, network-failure
retry banner.
