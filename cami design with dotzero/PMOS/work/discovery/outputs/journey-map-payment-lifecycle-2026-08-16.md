# Journey Map: one payment, both sides

**Scenario:** A single balance payment, from the client tapping a card to Cami recognizing revenue.
**Scope:** Tap → recognized revenue and paid-out merchant.
**Actors:** Client, Layla (front desk), gateway, Cami backend, Omar (owner), HQ ops, Cami finance.
**Date:** 2026-08-16

## Context

This is a **system journey**, not a persona journey. It maps the handoffs where the two JTBD docs meet: [jtbd-owner](jtbd-owner-2026-08-16.md) (merchant side) and [jtbd-camihq](jtbd-camihq-2026-08-16.md) (platform side).

**Adaptation, stated rather than faked:** the skill's emotional axis does not apply to a payment moving through a system. Substituting **divergence risk**, meaning the chance the merchant's ledger and Cami's ledger disagree at that step. Human emotion appears only where a person is actually waiting, which is stages 1 to 3.

**Confidence: High on mechanics** (drawn from state machines §8/§9, ADR-014, PRO-737, PRO-982, and the 06 contract). **Low on frequency.** Nothing here says how often these failures fire, only that the system permits them.

---

## Journey overview

| # | Stage | Owner | Divergence risk | The failure |
|---|---|---|---|---|
| 1 | **Tap** | Client, Layla | 🟢 Low | Bank OTP surprises the customer mid-payment |
| 2 | **Gateway charge** | Provider | 🟡 Medium | Provider approves, Cami never hears |
| 3 | **Report / webhook** | Provider → Cami | 🔴 **High** | Phase 1 trusts a device report with no server-side confirm |
| 4 | **Settle to sale** | Cami backend | 🔴 **High** | Tip not persisted, balance computed without it |
| 5 | **Rate snapshot** | Cami backend | 🟡 Medium | Rate not stored on the transaction |
| 6 | **Merchant ledger** | Omar sees it | 🟢 Low | Figures presented without scope |
| 7 | **HQ ledger** | Cami finance | 🟡 Medium | Revenue recomputed from the current rate card |
| 8 | **Payout** | Cami → bank | 🟡 Medium | No payout run exists |
| 9 | **Recognition** | Finance | 🟡 Medium | Deposits recognized too early |

---

## Stage details

### 1. Tap
Client taps or inserts at the counter. Layla is standing there. The client may hit a bank OTP.

**Human note:** this is the only stage where anyone is watching a screen and waiting. Reception needs to know OTP is the bank's rule, not Cami's, and roughly when it fires (new card, above ~1000 AED, future-dated). Thresholds vary by bank and card, so training beats documentation. EC-24.

**Divergence:** 🟢 nothing has been recorded yet.

### 2. Gateway charge
The terminal runs the **provider's on-device pay screens** (NeoPay today). This is a real provider charge, not a Cami screen.

**Divergence:** 🟡 the provider now knows something Cami does not. Every later stage depends on Cami learning it correctly.

### 3. Report or webhook ← **highest risk in the journey**
Terminal: the Android app posts `{saleId, paidAmount, transactionId, status}` to `POST /terminal/payments/report`. **Phase 1 trusts the report.** No server-side gateway confirm (ADR-014, PRO-982). Online link: NeoPay webhook confirms.

**Divergence:** 🔴 the highest in the system, and it is a **known, deliberate, time-boxed exception to INV-P3**, not an oversight. Three ways it bites:
- Report lost → provider charged, Cami shows unpaid, client charged and merchant chasing.
- Report wrong → Cami's books state an amount the provider did not take.
- Report delayed → merchant sees unpaid while the client stands there paid.

Online has its own version: the NeoPay webhook took 1 to 2 minutes in test and must confirm in seconds (EC-23, 🔴).

**Guard that exists:** idempotent by `transactionId`, validates `0 < paidAmount ≤ outstanding`.
**Guard that does not:** any reconciliation against the provider. Phase 2 is a **planned direction only, with no ticket**.

### 4. Settle to sale
Same settle engine as every other tender. Writes `sale_payments`, method `terminal` or link.

**Divergence:** 🔴 this is where **EC-38** lives. If a tip is passed as request-only data on the payment call, the balance is computed without it and capture fails or under-collects (`PAYMENT_EXCEEDS_BALANCE`). Root cause is a **Scope Rule violation**: tip is invoice-scoped, and was treated as payment-scoped (06 §3, violates INV-M3). Live defect in `/payments`.

Also here: idempotency must cover card capture **plus** gift-card and deposit drawdown as one unit. Partial application on a failed capture is not permitted (06 §8). Retry after a mid-capture terminal disconnect is the expected failure mode, not an edge case (EC-43).

### 5. Rate snapshot
Cami's take is resolved and **stored on the transaction**.

**Divergence:** 🟡 PRO-737 states the rule plainly: reports and settlement read the stored rate and must **never** recompute from the partner's current card. If this column does not exist in the reporting fact tables, every historical month silently re-rates the first time an AM edits a rate. The rule currently protects a mock-data UI. It has to reach the pipeline Faisal is signing off.

### 6. Merchant ledger
Omar sees a fee row paired to its deposit, with a clickable appointment reference.

**Divergence:** 🟢 low mechanically, but this is where the **presentation** defect surfaces: figures shown without naming their scope. See the two-balances finding in the Owner doc.

### 7. HQ ledger
The same event, opposite sign, as Cami revenue.

**Divergence:** 🟡 if HQ builds its own revenue pipeline rather than reading the same fact tables, the two drift and nobody can say which is right. goals.md Product Goal 4 already calls for one pipeline serving merchant reports and CamiHQ BI from day one. Also: **event loss** between OLTP commit and the reporting queue silently understates both sides (EC-37, 🔴, fix is a transactional outbox, not built). And **duplicate line items in one sale break the current idempotency key** (EC-36).

### 8. Payout
Money moves to the merchant's bank.

**Divergence:** 🟡 no payout run exists in HQ. Nobody can answer "where is my payout" from a screen, and the merchant reconciliation has no payouts line to tie to.

### 9. Recognition
Finance recognizes revenue.

**Divergence:** 🟡 a deposit is **deferred revenue, a liability**, and the VAT tax invoice issues at service render, not at capture (INV-P10, ADR-013). For a deposit-heavy partner, processed volume and recognized revenue are structurally different numbers. Recognizing at capture misstates both the books and the VAT position.

---

## Divergence profile

```
High  |           ●  ●
      |        ●        ●     ●  ●  ●
Low   |  ●  ●
      +--------------------------------
        1  2  3  4  5  6  7  8  9
```

Risk is concentrated in the middle: **stages 3 to 5, where the payment becomes a record.** Once it is a correct record, later stages mostly risk presenting it badly rather than losing it.

---

## Moments of truth

| Moment | Stage | Impact | State | Evidence |
|---|---|---|---|---|
| **Cami learns the card was charged** | 3 | Everything downstream is wrong if this is wrong | ❌ Phase 1 trusts the device | ADR-014, PRO-982 |
| **Tip reaches the invoice before capture** | 4 | Live defect, under-collects or fails | ❌ Known bug | EC-38, INV-M3 |
| **Rate lands on the transaction** | 5 | Protects all revenue history | ⚠️ Specced, pipeline unconfirmed | PRO-737 |
| **One event reaches both ledgers** | 7 | Merchant and Cami must agree | ❌ Outbox not built | EC-37 |
| **A refund goes back through the gateway** | post-9 | Pilot blocker | ❌ Not built | ADR-014, camipay rule 6 |

---

## Priority opportunities

| Opportunity | Stage | Impact | Effort | Evidence |
|---|---|---|---|---|
| Fix the tip Scope Rule violation | 4 | High | **Low** | EC-38, live defect |
| Transactional outbox | 7 | High | Medium | EC-37 |
| Ticket the Phase 2 gateway confirm | 3 | High | High | ADR-014, no ticket exists |
| Gateway refunds | post-9 | High | Medium | Pilot blocker |
| `rate_at_capture` in the fact tables | 5 | High | Low **if done now** | PRO-737 |
| Reconciliation job, Cami vs provider | 3 | Medium-high | Medium | Phase 1 exposure |

Two are cheap and unambiguous: the tip fix and the rate column. Both get expensive the longer they wait, the tip because it is losing money now, the rate because retrofitting means rewriting history.

---

## Connection to roadmap

| Finding | Initiative | Status |
|---|---|---|
| Phase 1 trusts the device report | Terminal Phase 2 | 🔴 Planned direction, no ticket |
| Tip not persisted before capture | `/payments` | 🔴 Live defect |
| Event loss to reporting | Transactional outbox | 🔴 Not built |
| Gateway refunds | CamiPay | 🔴 Pilot blocker (Michelle, 2026-08-06) |
| Rate snapshot | PRO-737 | ⚠️ UI shipped, mock data, no backend |
| Webhook latency | NeoPay integration | 🔴 EC-23 unresolved |

---

## Assumptions to validate

- ⚠️ Frequency of every failure above. The system permits them; nobody has measured them.
- ⚠️ That the tip defect is still live in `/payments`. Confirm against current code before ticketing.
- ⚠️ That the reporting fact-table design has not already added a stored-rate column. Check with Anum before raising it.
- ⚠️ That Phase 1's trusted-report window is short. If the terminal ships to more partners before Phase 2, exposure scales with volume.

## Next steps

1. Confirm the tip defect against current code, then ticket it citing 06 §3 and INV-M3.
2. Ask Anum whether `rate_at_capture` is in the fact-table design. If not, raise it before Faisal signs off.
3. Ticket the Phase 2 gateway confirm, or record explicitly that Phase 1 is accepted for the pilot with a named review date.
4. Ask what reconciles Cami against NeoPay today. If the answer is nothing, that is the real Phase 1 exposure.
