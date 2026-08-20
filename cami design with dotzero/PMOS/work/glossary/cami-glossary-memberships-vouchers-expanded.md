# Cami Glossary: Bundles, Memberships & Vouchers (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Bundles, memberships & vouchers domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> **Two Cami specifics anchor this domain.** (1) **Vouchers and gift cards are a named Tier 2 revenue driver** (goals). (2) Cami keeps the word **"voucher"** (Fresha calls voucher "not a product term") and carries a distinct tax rule: **no tax at issuance, tax at redemption**. (3) The **card-on-file gap** caps memberships to one-time payment, no recurring billing (gaps 1, 9).

---

## Confusable cluster: Bundle vs Membership vs Voucher

| Term | What the client buys | How it is redeemed | Billing |
|---|---|---|---|
| **Service bundle** | Several services delivered together in one appointment | One menu item, run in sequence or parallel | One-off |
| **Membership** | Services across multiple separate appointments, session-counted | Selected at checkout; sessions decrement (consumption tracking) | **One-time only today** (recurring needs card-on-file) |
| **Voucher** | Stored monetary value with a code | Chosen as a payment method at checkout; partial redemption supported | Tax at redemption, not at issuance |

---

## Entries

### Service bundle

- **What it is.** A set of services grouped so they are booked together in one appointment.
- **Cami mechanics.** Appears in the menu like a service, with a breakdown, total price, and duration. Pricing: sum of standard prices, custom fixed price, percentage discount, or free. Schedule type is **sequence** (one after another) or **parallel** (simultaneous across team members). ⚠︎ Same-or-separate resources and an online-booking toggle. Constraint: remove a service from the bundle before archiving or deleting it. Archiving a bundle hides only the bundle; component services stay active.
- **Reversible.** Partially. Archive reversible; permanent delete not.
- **Where you see it.** ⚠︎ Catalog, Service menu, New bundle.
- **Don't confuse with.** Membership (multiple appointments over time, session-counted), add-on group.
- **Status.** ⚠︎ Confirm bundles ship at v1.

### Membership

- **What it is.** A set of services a client buys up front, redeemable across multiple separate appointments.
- **Cami mechanics.** Configured with included services, a **limited or unlimited session count** (consumption tracking, which Cami has), validity, price, tax rate, and terms. At checkout the client's membership is selected and applied, covering or discounting the matching service line and **decrementing sessions**. ⚠︎ **Cami divergence: one-time payment only.** Recurring billing needs card-on-file, not available on NeoPay (gaps 1, 9). "Enable online sales" and "enable booking against it" ⚠︎ to confirm.
- **Reversible.** Partially. The catalog template can be deleted only if unsold; sold memberships pause/resume, cancellation is permanent.
- **Where you see it.** ⚠︎ Catalog, Memberships; the client's Items.
- **Don't confuse with.** Service bundle (single appointment, no session balance), voucher (money, not entitlements).
- **Status.** Live for one-time; recurring gated on card-on-file.

### Memberships sold / Active membership

- **What it is.** An individual membership instance a client owns after purchase.
- **Cami mechanics.** Tracked with sessions remaining, covered services, type, expiry, and client. ⚠︎ Available redemption (in store / online / both). An activity log records sale, pause, resume, cancel. Surfaced in a membership report. ⚠︎ Requires the Memberships permission.
- **Reversible.** Not applicable for the record; state changes differ (see pause/cancel).
- **Where you see it.** ⚠︎ Sales, Memberships sold; the client's Items.
- **Don't confuse with.** Membership (the catalog template, not the sold instance).
- **Status.** ⚠︎ Confirm.

### Pause / Resume membership

- **What it is.** Temporarily freezing a client's membership without losing benefits.
- **Cami mechanics.** Suspends the sold membership; the client keeps the plan. ⚠︎ Optional note to the client. Only the business can pause.
- **Reversible.** Yes. Resume restores it (unlike cancel).
- **Where you see it.** ⚠︎ Memberships sold, Options; the client's Items.
- **Don't confuse with.** Cancel (irreversible), delete (removes the template).
- **Status.** ⚠︎ Confirm.

### Cancel membership

- **What it is.** Permanently ending a client's active membership.
- **Cami mechanics.** Terminates the sold membership; cannot be reactivated. ⚠︎ Optional note to the client.
- **Reversible.** No.
- **Where you see it.** ⚠︎ Memberships sold, Options; the client's Items.
- **Don't confuse with.** Pause, delete.
- **Status.** ⚠︎ Confirm.

### Delete membership

- **What it is.** Removing a membership offering from the catalog.
- **Cami mechanics.** Removes the template so it can no longer be sold, only if unsold. Sold instances are out of scope (pause or cancel those). No archive option for memberships.
- **Reversible.** No.
- **Where you see it.** ⚠︎ Catalog, Memberships, Delete.
- **Don't confuse with.** Cancel (acts on a client's sold membership), archive (services only).
- **Status.** ⚠︎ Confirm.

### Voucher (Fresha "business gift card")

- **What it is.** A prepaid stored-value credit the business sells, spendable only with that business.
- **Cami mechanics.** Carries a code and a value. ⚠︎ Setup: preset values plus optional custom amounts with min/max. **Tax rule (Cami-specific): no tax at issuance, tax at redemption.** Sold in store or online (online requires verified CamiPay). **Revenue and tax recognition:** ⚠︎ confirm the accounting split, the tax lands at redemption. At redemption the voucher is selected as a payment method and the amount to redeem is entered; **partial redemption supported**, the client pays any remainder another way. If a sale paid with a voucher is **voided**, credit returns to the voucher automatically; if **refunded**, ⚠︎ decide whether the refund is cash or voucher credit (Fresha issues cash).
- **Reversible.** Partially. Void restores voucher credit; refund does not. Expiry extendable before expiry.
- **Where you see it.** ⚠︎ Settings/Catalog, Vouchers; Vouchers sold; checkout payment methods.
- **Don't confuse with.** Membership (service entitlement, not money), client wallet (aggregates voucher balance).
- **Status.** ⚠︎ Tier 2 revenue driver. Confirm build and the tax/refund rules.

### Extend (voucher)

- **What it is.** Pushing out a voucher's expiration date.
- **Cami mechanics.** Sets a new expiry, logged in the voucher activity. Only before expiry; an expired voucher cannot be extended.
- **Reversible.** Partially. Extendable again while unexpired.
- **Where you see it.** ⚠︎ Vouchers sold, Actions, Extend.
- **Don't confuse with.** Nothing directly. ⚠︎ No void/deactivate action for vouchers is defined; decide if one is needed.
- **Status.** ⚠︎ Confirm.

---

## Cut from this domain (do not port)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Recurring membership** | Recurring billing needs card-on-file, not available on NeoPay | When gap 1 closes (gap 9) |
| **Fresha gift card** (marketplace-issued, any-venue) | No Cami consumer marketplace, so no marketplace-issued stored value | n/a |

---

## Product decisions surfaced by this domain

| Decision | Why |
|---|---|
| **Voucher tax and revenue recognition** | Cami rule is "no tax at issuance, tax at redemption." Confirm how revenue posts at purchase vs how tax posts at redemption, and reflect it in liability and VAT reporting |
| **Voucher refund: cash or credit** | Fresha refunds a gift-card-paid sale as cash. Cami should state one rule, it affects reconciliation |
| **One-time vs recurring membership** | One-time only until card-on-file. Name recurring as a fast follow so sales does not over-promise |
| **Voucher void/deactivate action** | Fresha documents none. Decide whether Cami needs one for fraud/error handling |
