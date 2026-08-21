# Cami Glossary: Gaps Decision Doc

**Last updated:** 2026-08-03
**Purpose:** Turn the 12 gaps from [cami-glossary.md](cami-glossary.md) into decisions for sign-off. Pairs with the Cami sale/void/refund checkout-state glossary pending **Sham and Maz**.
**How to use:** Each gap is a decision, not a discussion. Options, a recommendation, the owner, the dependency, and the urgency. Fill the **Decision** column in the sign-off.

> Owners marked ⚠︎ are inferred and need confirming. Sham, Maz (checkout states), Marlon (terminal security) are from the Jul 31 notes; the rest are placeholders.

---

## TL;DR

- **Decide now (blocks v1 vocabulary):** gaps 1, 2, 4, 6, 8 (card-on-file stance, no-show/cancel fee stance, sales-metric formulas, terminal states, auto-cancel window).
- **Decide next (Tier 2 window):** gaps 3, 5, 9, 12 (settlement boundary, tip/commission, recurring membership, chargeback flow).
- **Backlog (opportunity, not a blocker):** gaps 7, 10, 11 (waitlist, inventory deduction, add-on pricing vocabulary).
- The chain that matters: **gap 1 (card-on-file) unblocks gaps 2 and 9**. Until NeoPay stores card, no-show fees, late-cancel fees, and recurring memberships stay off the table, and deposit forfeit is the only late-money lever. Prioritize the NeoPay card-storage conversation.

---

## Decide now

### Gap 1. Card-on-file stance

- **Question:** Do we commit to card-on-file on NeoPay, and by when?
- **Why:** Highest-leverage missing lever. Unlocks no-show fees, late-cancel fees, recurring memberships, one-tap Pay now.
- **Options:** (a) Push NeoPay for card storage now, accept the timeline. (b) Wait for a provider in the abstraction (NI / Stripe) that stores card, route card-on-file there. (c) Ship v1 without it, deposit-only, revisit post-SOTA.
- **Recommendation:** (a) + (b) in parallel. Open the NeoPay card-storage ask immediately; keep Stripe as the fallback rail for card-on-file if NeoPay stalls.
- **Owner:** ⚠︎ Tech + Commercial (NeoPay relationship).
- **Dependency:** NeoPay product roadmap.
- **Urgency:** Now. Everything downstream waits on this.

### Gap 2. No-show fee and late-cancellation fee stance

- **Question:** What is our late-money lever at v1, and how do we say it to operators?
- **Why:** No-shows are the core pain (15-25% UAE, ~AED 22.5K/mo leak). Fee is the monetized fix, and it is what SOTA-tier operators expect from Fresha.
- **Options:** (a) Deposit forfeit only, no fee, until gap 1 closes. (b) Deposit forfeit now + roadmap the fee as a fast follow once card-on-file lands. (c) Hold the whole no-show story until fees work.
- **Recommendation:** (b). Ship deposit forfeit + no-show rebook follow-up now, name the fee as "coming with card-on-file" so sales does not over-promise.
- **Owner:** ⚠︎ Product + Sales (positioning).
- **Dependency:** Gap 1.
- **Urgency:** Now. Sales needs the honest line for the SOTA go-live.

### Gap 4. Gross vs net vs total sales

- **Question:** What are the canonical formulas?
- **Why:** Fresha's definitions conflict across three reports. Cami can define once and win on reconciliation trust. Owner reports live or die on this.
- **Options:** (a) Adopt one formula set and enforce it across every report. (b) Match Fresha's labels for familiarity, inherit the ambiguity. (c) Defer to the accountant-export spec.
- **Recommendation:** (a). Propose: **Gross** = total sale value before deductions (state tax treatment explicitly). **Net** = gross minus refunds, discounts, taxes. **Total payments** = cash received after refunds, dated by payment date. Never reuse "total sales" for four things.
- **Owner:** ⚠︎ Product + Finance.
- **Dependency:** None. Pure definition.
- **Urgency:** Now. Blocks the reporting spec.

### Gap 6. Terminal (POS) checkout states

- **Question:** What are the void/refund/settlement states for the card terminal?
- **Why:** Terminal drives most volume (walk-in, less-digital). Still in architecture, gated on NeoPay settlement and terminal-app design, and Marlon's security review.
- **Options:** (a) Mirror the online void/refund states on the terminal. (b) Terminal-specific states if NeoPay settlement differs.
- **Recommendation:** (a) as the default, confirm against NeoPay settlement mechanics before locking. Keep the tender-type rule (void cash/manual, refund card) identical online and on terminal.
- **Owner:** Sham + Maz (states), Marlon (security/anti-theft), ⚠︎ Tech (NeoPay terminal).
- **Dependency:** NeoPay terminal decisions, NeoPay approval submission.
- **Urgency:** Now for the glossary, even if the build is interim online-first.

### Gap 8. Auto-cancel window on unpaid deposit

- **Question:** How long does an awaiting-confirmation booking hold before it auto-drops?
- **Why:** Deposit-to-book implies a hold-then-drop rule. Only the 5-min online-booker slot hold is documented today.
- **Options:** (a) Fixed window (Fresha uses 1-72h after booking or before start). (b) No auto-cancel, manual only. (c) Per-service window.
- **Recommendation:** (a). Pick one default (for example 24h after booking), make it a payment-policy setting later.
- **Owner:** ⚠︎ Product.
- **Dependency:** None to define; build ties to payment policy.
- **Urgency:** Now for the appointment-status vocabulary.

---

## Decide next (Tier 2 window)

### Gap 3. Settlement / payout vocabulary boundary

- **Question:** Where is the line between what Cami reports and what NeoPay settles?
- **Why:** "Where's my money" support questions. Cami owns the record, NeoPay owns the money.
- **Recommendation:** State plainly: Cami reports sales, deposits, refunds, and liability. NeoPay owns wallet, payout schedule, and settlement. Do not surface wallet vocabulary as Cami's own.
- **Owner:** ⚠︎ Product + Commercial. **Dependency:** NeoPay. **Urgency:** Before Tier 2 volume.

### Gap 5. Tip and commission handling

- **Question:** Pass-through or margin applied?
- **Why:** Open question in goals. Affects take-rate and staff pay. Pay runs and commission are parked, but tips flow through checkout now.
- **Recommendation:** Decide tip as **pass-through** at v1 (no margin on tips), park commission with pay runs. Revisit when pay runs are built.
- **Owner:** ⚠︎ Commercial + Finance. **Dependency:** Pay-run roadmap. **Urgency:** Before tips ship at checkout.

### Gap 9. Recurring membership

- **Question:** One-time only, or recurring at v1?
- **Recommendation:** One-time only until gap 1. Name recurring as a fast follow. **Owner:** ⚠︎ Product. **Dependency:** Gap 1. **Urgency:** With gap 1.

### Gap 12. Chargeback flow ownership

- **Question:** Who fights a card dispute, on what deadline, and how is the merchant told?
- **Recommendation:** Map NeoPay's dispute mechanics first, then define Cami's merchant-facing evidence flow and notification. **Owner:** ⚠︎ Product + Commercial. **Dependency:** NeoPay. **Urgency:** Before card volume scales.

---

## Backlog (opportunity, not a blocker)

### Gap 7. Waitlist

- Validated demand ("Is there a waitlist?") with no system. This is a **build opportunity**, not a port. Scope after multi-location. **Owner:** ⚠︎ Product.

### Gap 10. Inventory deduction at POS

- v1 tracks stock but does not deduct until phase 2. Keep the vocabulary honest: "tracks, does not deduct." **Owner:** ⚠︎ Product. **Urgency:** Phase 2.

### Gap 11. Add-on pricing vocabulary

- Cami monetizes WhatsApp and reminders on top of processing margin. Fresha has no equivalent. Needs its own terms (WhatsApp add-on, reminder add-on, text balance). **Owner:** ⚠︎ Commercial. **Urgency:** As add-on pricing formalizes.

---

## Sign-off grid

| # | Gap | Recommendation | Decision | Owner | Sign-off |
|---|---|---|---|---|---|
| 1 | Card-on-file | Push NeoPay now + Stripe fallback | | | |
| 2 | No-show / cancel fee | Deposit forfeit now, fee as fast follow | | | |
| 4 | Sales metrics | Adopt canonical gross/net/total formulas | | | |
| 6 | Terminal states | Mirror online states, confirm vs NeoPay | | Sham + Maz + Marlon | |
| 8 | Auto-cancel window | Fixed default (e.g. 24h) | | | |
| 3 | Settlement boundary | Cami reports, NeoPay settles | | | |
| 5 | Tip / commission | Tip pass-through, park commission | | | |
| 9 | Recurring membership | One-time only until gap 1 | | | |
| 12 | Chargeback flow | Map NeoPay first, then merchant flow | | | |
| 7 | Waitlist | Backlog, post multi-location | | | |
| 10 | Inventory deduction | Phase 2, keep vocab honest | | | |
| 11 | Add-on pricing | Define WhatsApp/reminder add-on terms | | | |
