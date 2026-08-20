# Decision Records
**Last updated:** 2026-08-03 **What this is:** Why we chose what we chose. Append-only. Do not delete a decision, supersede it with a new record that references the old one. Read before reopening a settled call or answering a "why not just..." question.

**Format:** ID, decision, status, context, alternatives, consequences. Status = ✅ active, ⏳ provisional, ⛔ superseded.

**Source:** company.md, product.md, goals.md, competitors.md.

---

### ADR-001 — Payments-led model, OS free, no SaaS floor
**Status:** ✅ Active **Context:** Customers want WhatsApp under control, not an operating system to buy. A subscription floor is a second sale and a churn surface. **Decision:** The OS is free. Revenue is processing margin on payments captured through CamiPay. No SaaS subscription at v1. **Alternatives:** Subscription-led (like Moego); freemium with paid tiers. **Consequences:** Revenue tracks captured GMV, so growth = reducing payment leakage. Makes CamiPay mandatory for checkout (INV-P1). One funnel, no second onboarding to turn on payments.

---

### ADR-002 — CamiPay behind a provider abstraction, launch on NeoPay
**Status:** ✅ Active **Context:** Cami needs local GCC rails and room to chase better rates over time. **Decision:** Route CamiPay through a provider abstraction (NI / NeoPay / Stripe). Launch live on NeoPay. Cami owns the commercial record; providers only move money. **Alternatives:** Hard-couple to one provider (NI or Stripe direct) for speed. **Consequences:** More rails can be added without a rewrite (INV-P3). NeoPay's card-not-stored setup constrains card-on-file and no-show fees (INV-P6). Cami stays the source of truth for the invoice (INV-P2).

---

### ADR-003 — Online-first payments as the interim path; terminal (POS) later
**Status:** ⏳ Provisional (gated on NeoPay) **Context:** As of 31 Jul 2026, online payment links are built and in QA; the card terminal is still in architecture, gated on NeoPay settlement and terminal-app decisions plus a NeoPay approval submission. Marlon reviews it for security and anti-theft. **Decision:** Go live online-first. Ship the terminal once NeoPay decisions land. **Alternatives:** Hold launch until the terminal is ready. **Consequences:** Interim gap: the terminal drives most volume (walk-in, less-digital customers), so early captured volume is understated until POS ships. Revisit when NeoPay unblocks.

---

### ADR-004 — Reminders are status-only, no URLs
**Status:** ✅ Active **Context:** Links in reminders are a spoof/phishing risk, especially over SMS. **Decision:** Reminders carry status updates only, no URLs. SMS (Twilio) and email today; WhatsApp reminders gated on META. Managed links come later. **Alternatives:** Include booking/payment links now for convenience. **Consequences:** Lower fraud surface, but no one-tap link in the reminder yet (INV-C1). Open: per-merchant sender IDs vs Cami-as-sender, and the 160-char SMS limit.

---

### ADR-005 — Lead with Cami Pay + Cami CRM, not "booking software"
**Status:** ✅ Active **Context:** Booking alone does not differentiate and does not sell. WhatsApp on its own is not rich enough. **Decision:** Position on payments and CRM as the wedge. Booking is the front door, not the pitch. **Alternatives:** Sell "WhatsApp booking" or "an operating system." **Consequences:** Marketing and onboarding sell front-desk relief and payment capture. AI scheduling leads acquisition; the OS prevents churn.

---

### ADR-006 — Do not chase clinical vets; Tier 2 pet = boarding businesses
**Status:** ✅ Active **Context:** Full clinical / practice management is ezyVet territory. Cami lacks the clinical depth and cannot win head-on today. **Decision:** Do not spend pipeline on clinical vet accounts. In pet, target boarding businesses (need a boarding calendar, not a clinical system). **Alternatives:** Build clinical workflows and compete with ezyVet now. **Consequences:** Sales focus stays on winnable accounts. Revisit when Cami has vet/clinical workflows and a reason to enter that fight.

---

### ADR-007 — Voucher tax at redemption, not issuance
**Status:** ✅ Active **Context:** Vouchers/gift cards are a Tier 2 revenue driver and need correct VAT treatment. **Decision:** No tax at issuance; tax applies at redemption. **Consequences:** Canonical for CamiPay and invoicing (INV-P8). Reflected in the checkout state machine.

---

### ADR-008 — Pet-to-generic domain model; packaging not products
**Status:** ✅ Active **Context:** Cami started pet-first (v0) but felt pull toward other appointment verticals through v0.1. **Decision:** One platform. Cami-Pet and Cami-Business are GTM packaging (skins), not separate codebases. Verticalization lives in the OS layer; the CRM layer is horizontal. **Alternatives:** Fork a separate pet product and a separate beauty product. **Consequences:** The moat stays portable across verticals (INV-X1, INV-X2). Drives the H0.x pet-to-generic domain-model hardening track.

---

### ADR-009 — Single-location at v1; multi-location deferred to post-SOTA
**Status:** ⏳ Provisional **Context:** Multi-location is the named next priority but not required to prove the OS on SOTA. **Decision:** Ship single-location at v1. Sequence post-SOTA: multi-location, then group bookings, then boarding calendar. **Alternatives:** Build multi-location before the Tier 2 foundation is proven. **Consequences:** Tier 1 (Chaps & Co, 9 locations) is gated until multi-location lands (INV-B4). Unlocks pilates, boarding, group-booking categories when it ships.

---

### ADR-010 — RTL-ready, not RTL-shipped at v1
**Status:** ⏳ Provisional **Context:** Full Arabic UI localization is heavy; the region is served today by conversational Arabic. **Decision:** Build RTL-ready but do not ship full Arabic UI at v1. The AI still replies in Arabic when messaged in Arabic. **Consequences:** Faster to v1 (INV-X3). Full localization is a later track.

---

### ADR-011 — Move from outsourced engineering to in-house
**Status:** ⏳ In progress **Context:** Outsourced delivery is slower and less agile than the roadmap needs. **Decision:** Build an in-house product and engineering function (OS Team + MOAT Team), bring commercial capacity in earlier. **Open question:** How to internalize without slowing delivery (tracked in goals.md). **Consequences:** Hiring 2x Senior Full-Stack, 1x SDR, 1x Customer Success.

---

### ADR-012 — CamiPay mandatory for in-platform appointment checkout
**Status:** ✅ Active **Context:** Revenue is processing margin; payment routing around Cami breaks the model. **Decision:** CamiPay is mandatory for in-platform appointment checkout. Payment aggressiveness Medium (deposit to book, balance at completion). **Consequences:** Directly enforces INV-P1 and INV-P5. An account steering clients to cash/off-platform shows up as a captured-volume gap, the signal to watch.

---

### ADR-013 — Deposit is deferred revenue, tax invoice at service render
**Status:** ✅ Active **Context:** A deposit is money taken before the service exists. Treating it as recognized revenue at capture would misstate the books and the VAT position. **Decision:** A deposit is deferred revenue (a business liability), not a rendered sale. The invoice sits part-paid; the VAT tax invoice is generated when the service is rendered, not when the deposit is captured. It behaves like a voucher (money owed back as service). **Alternatives:** Recognize the deposit as revenue at capture. **Consequences:** Aligns with voucher tax logic (ADR-007, INV-P8). Reporting must distinguish captured-but-unrendered from recognized revenue. Open for the accountant: tax vs non-tax treatment of the deposit line (GNK to confirm). Source: [[2026-07-23-camipay-deposit-terminal-checkout]].

---

### ADR-014 — Balance capture offers both terminal and online link, terminal preferred
**Status:** ✅ Active **Context:** Conflict on how the remaining balance is collected after a deposit. One view: offline only (terminal + cash). Other view: allow an online link too. **Decision:** Offer both an online payment link and the CamiPay terminal for the balance; the terminal is the default/preferred option. It is cheaper (~1.9% vs ~2.5% online) and matches reception habit (hand over the card machine). Card is not stored, so the online balance is a fresh link, not a charge-on-file. **Alternatives:** Terminal-only, or online-only, for the balance. **Consequences:** Reception steers to the cheaper rail; captured volume stays on Cami either way. Depends on the terminal shipping (ADR-003). **Reconciliation:** terminal Phase 1 settles via a **trusted device report** (`POST /terminal/payments/report`, PRO-982). The card is charged on the provider's on-device pay screens (NeoPay today), but the backend trusts the report rather than confirming server-side ("no MPGS in Phase 1"). A later server-side gateway confirm is a **planned direction only** (no ticket; the `retrieveOrder`/MPGS mechanism is not committed). Gateway refunds for CamiPay-captured tenders are **not built yet** (eng check #6 Fail) and are now a **pilot blocker** (Michelle, 2026-08-06, camipay rule 6, superseding the earlier "leave open / ops-manual" note). Source: [[2026-07-23-camipay-deposit-terminal-checkout]], Linear PRO-982.

---

### ADR-015 — Drop capture-card-details (authorization-only) policy for MVP
**Status:** ✅ Active **Context:** A third payment-policy mode, capture card details to enforce a no-show policy without charging, was considered. Cami does not store or manage cards (INV-P6), so this is half-baked. **Decision:** Ship two policy modes only: no payment policy, and requires-deposit-upfront. Cut the authorization-only mode for MVP. **Alternatives:** Build authorize-and-capture now. **Consequences:** No auto no-show fee, no card-on-file (consistent with INV-P6, EC-15). Revisit when a card-storing rail is added. Reaffirmed by business-rules-v2 payment-policy (capture-card-details out of scope for pilot; no-show-fee controls hidden, no "coming soon" badge, until card storage lands). Source: [[2026-07-20-camipay-payment-link-deposit-apple-pay]].

---

### ADR-016 — Payment links are immutable and single-active
**Status:** ✅ Active **Context:** NeoPay links cannot be updated in place. Repeated reception clicks or reminders risk spawning duplicate links or a stale amount. **Decision:** Payment links are create/delete/expire only, never updated. One valid link per sale; the backend returns the existing valid link on repeat (reminders reuse the same link). A new link is generated only when config changes (amount, description, service), which invalidates and deletes the old one. Lifetime is 12h, or until paid or cancelled. **Alternatives:** Update the link amount in place; allow multiple concurrent links. **Consequences:** Fixing a mistake means cancel the link and rebuild the cart, not edit it (EC-25). An expired link must show an expired screen, not a blank page (EC-20). Source: [[2026-07-20-camipay-payment-link-deposit-apple-pay]].

---

### ADR-017 — Package and recurring policy measured at redemption, not booking
**Status:** ✅ Active **Context:** A package is paid upfront; its appointments are redeemed later, sometimes far in the future. Measuring policy from the booked time gives the wrong answer. **Decision:** For packages and recurring series, refundability and policy are measured at redemption time, not the booked time. No deposit link is sent for a package redemption (already paid); the terminal may take the upfront package payment. **Alternatives:** Apply policy from the booking date. **Consequences:** Consistent with consumption-on-completion (see [[2026-07-31-sales-refund-void]]). Full recurring/package payment logic needs a dedicated workshop with Sham. Source: [[2026-07-23-camipay-deposit-terminal-checkout]].

---

### ADR-018 — Cami never auto-charges no-show or cancellation fees
**Status:** ✅ Active **Context:** No card is stored (INV-P6), and Cami is an enabler, not a marketplace holding the customer's money. Auto-charging fees would pull Cami into disputes and require a payment-support team. **Decision:** Cami never automatically charges no-show or late-cancellation fees. The merchant decides and charges manually. Outside a non-refundable window, the pet-parent screen shows the policy note plus a Call/WhatsApp-the-business button, routing the customer to the merchant. **Alternatives:** Auto-charge on trigger like Fresha. **Consequences:** Keeps Cami out of payment disputes. Deposit forfeit stays manual (EC-15). The disclaimer + call button is a required screen (Anum, ticket PRD-60). Source: [[2026-07-23-camipay-deposit-terminal-checkout]].

---

> **Sales-domain decision records (PDR series).** The three records below are incorporated from Michelle's sales-domain PDR set (Slite draft, 2026-07-31). They keep their original `PDR-` IDs, which are cited in Linear and rule tables. Status is as authored: **Proposed, pending Maaz** as decision-maker. They sit alongside the ADR series above; where they overlap, both IDs are cross-referenced.

### ADR-019 / PDR-001 — Package refund valuation: retail clawback by default
**Status:** ⏳ Proposed (needs Maaz) **Decided by:** open, needs Maaz. **Consulted:** Michelle, Haroon. **Context:** A customer buys a 10-session package at a bundle discount, redeems 3, then requests a refund. Without a rule, engineering picks a direction and it is wrong wherever it costs a merchant money. **Options:** (A) pro-rata at package rate, customer keeps the bundle discount on what they consumed; (B) retail clawback, refund = paid minus (sessions used × full retail), customer forfeits the discount on exit; (C) no refund once any session is redeemed. **Decision:** Option B (retail clawback) as platform default; Option A available as merchant configuration where local policy or brand requires it; Option C rejected. **Rationale:** Option A creates a clean arbitrage (buy the 10-pack, use 3 at bundle rate, refund the rest = 3 retail services at bundle pricing). Option B matches Fresha and Mindbody, so migrating merchants carry the expectation. Making it configurable is a deliberate exception to INV-10, justified because refund policy is a brand/legal position, not a preference. **Consequences:** Merchant protected by default; refund amount is not obvious to the customer, so the refund UI must show the calculation, not just the number. **Revisit:** if >5% of package refunds escalate as disputes, or a GCC consumer-protection ruling constrains clawback. **Related:** INV-05, INV-06, rule PKG-06, EC PKG-E3/E8. **⚠️ Conflict, unresolved and widening.** Two live positions: (a) PDR-001 (this record, Slite 2026-07-31) = **retail clawback** default; (b) the current product-law docs = **unconsumed-value-only** default. The [[2026-07-31-sales-refund-void]] meeting set unconsumed-only, and the newer `docs/business-rules-v2/sales-payments/6. refunds-and-voids.md` (agreed 2026-08-04) **reaffirms** it (rule 6 cut, held in out-of-scope: refund unconsumed value only, consumed sessions non-refundable unless their redemption invoices are voided first, merchant may refund a custom amount up to unconsumed). So PDR-001's clawback appears **not adopted**. Needs Maaz to rule which is law before any package-refund code ships. Held for a future packages capability card.

---

### ADR-020 / PDR-002 — Package entitlement model: entitlement list
**Status:** ✅ Active **Decided by:** Michelle, 2026-08-07 (confirmed at the Hunain meeting), superseding the earlier "Proposed, needs Maaz". **Consulted:** Michelle, Haroon, Faisal, Maaz. **Context:** Does one "session" equal one service or one appointment? The question is a symptom of an undefined data model. **Options:** (A) generic session count, one appointment consumes one session regardless of services; (B) entitlement list, package holds service-ID + quantity pairs, each covered service line item consumes one session of its matching service; (C) value wallet, package holds currency value drawn down at service price. **Decision:** Option B (entitlement list). An appointment covering three package-covered services consumes three sessions, one per line item. "Session" = one unit of package entitlement consumed by one covered service line item; "redemption" names the act. **Rationale:** Option A lets a customer bundle three services into one appointment and extract triple value for one session, the rational strategy once discovered. Option B also makes revenue attribution, staff commission, and the INV-09 zero-amount invoice line items all work. Option C is a genuinely different product (spend-any credit), deferred. **Consequences:** Pricing and redemption unambiguous; merchants who think in "10 visits" must be onboarded into sessions-per-service; "any service" packages are not supported at MVP. **Revisit:** a material-volume merchant needs an any-service or value package, at which point Option C ships as a second package type. **Related:** INV-09, glossary Session/Redemption/Entitlement list, rules PKG-01 to PKG-08, ADR-017 (redemption-time policy). **✅ Confirmed (Michelle, 2026-08-07):** worked example, a customer buys a 5-session grooming package, then comes in for one visit with several covered services. That visit consumes **1 session per covered service line, not 1 per appointment**. Ratified at the Hunain meeting. This resolves the FE/BE ambiguity Mike's code review flagged (money-contract review, thread 2026-08-06), where "Proposed, needs Maaz stamp" let FE and BE allocate coverage differently for mixed visits. Source: #C0BJC1X7UCE thread, Michelle 2026-08-07.

---

### ADR-021 / PDR-003 — Membership concurrency: one active per type
**Status:** ⛔ Proposed, blocked **Decided by:** open, needs Maaz. **Consulted:** Michelle. **Context:** Can a customer hold more than one of the same membership? Two active of the same type produce undefined benefit maths (stacking, summing, draw order). **Options:** (A) unlimited; (B) one active per type, second purchase while active is blocked and offers Extend (pushes end date, no second record); (C) one active per type, second purchase queues a future-dated membership. **Decision:** Option B, with gifting to another customer as a separate permitted flow. **Rationale:** Option A ships an ambiguity that needs a rule per stacking question. Option B keeps one record per customer per type, making benefits deterministic, and Extend is what customers actually want. Option C adds a scheduling concept for an unseen case. **Blocked on:** whether memberships are auto-renewing subscriptions or fixed-term prepaid. Extend means different things in each; in auto-renew the second purchase may be invalid. **Cannot be accepted until that is answered.** **Consequences:** Deterministic benefits, one record to reason about; the blocked purchase needs good UI (a hard error is wrong when a customer is trying to pay). **Revisit:** multi-location merchants requesting per-location memberships would make "same type" location-scoped. **Related:** rules MBR-01 to MBR-03, open question OPEN-02, EC MBR-E1/E2.

---

### ADR-022 — Terminal auth: per-device PIN
**Status:** ✅ Active **Decided by:** Michelle, 2026-08-06. **Context:** Three models were in play, the Jul 23 meeting's email/password, eng Phase 1's single merchant-wide PIN, and the design spec's per-device credentials. A single merchant-wide PIN cannot revoke or lock one device without signing out every terminal at every location. **Decision:** Per-device terminal auth is law: each terminal has its own immutable pairing code plus its own readable, regenerable sign-in PIN, opening a 24h revocable session (design `DSG-62-terminal-registration.md`). **Alternatives:** email/password (rejected, kills adoption), one merchant-wide PIN (rejected, no per-device revoke/lock). **Consequences:** Eng Phase 1 shipped merchant-wide and must migrate to per-device (eng check 2026-08-02 marks it Fail). Still open, not blocking: PIN readability, session attribution, lockout trigger, 24h fixed vs configurable. **Related:** state machine §9, EC-27, glossary Terminal (POS). Source: [[2026-07-23-camipay-deposit-terminal-checkout]].

---

### ADR-023 — Overlapping appointments: staff-side only, channel-gated
**Status:** ✅ Active **Decided by:** Michelle, 2026-08-06. **Context:** The overlap rule flip-flopped during delivery. PRO-79 (23 Apr) prohibited double-booking; PRO-489 (8 Jun) expected a 409 slot-conflict; PRO-528 (22 Jun) was cancelled with overlap "allowed as per requirement"; DSG-60/61 (29 Jul) improved the double-booking interaction. The code now allows overlap for everyone with no setting, approval step, capacity limit, or audit reason. **Decision:** Overlapping appointments for one staff member are allowed **only when staff book from Cami Business**. The online booking page never offers a conflicting slot, it shows only non-conflicting times as available, so a customer cannot create an overlap. Staff-side overlap is deliberate: in practice it happens often (squeeze-ins, last-minute reshuffles), so the front desk needs to be able to force it. It is **ungated** (no warning, approval, capacity limit, or audit today) and **trust-based**, staff handle the consequences manually. **Options:** (A) no overlap, reject with a 409/conflict message; (B) controlled override, named roles + warning + reason + audit; (C) capacity model, allow up to a configured staff/resource limit; (D) unlimited overlap everywhere (current code effect). **Chosen:** channel-gated overlap, staff-side like D but scoped to the staff channel with no online overlap. Rejected A (blocks real squeeze-ins), rejected pure D (customers must not self-serve conflicts online). B and C are deferred, layer later if needed. **Consequences:** Front desk can force squeeze-ins and reshuffles; the online booker stays clean. Risk: no audit or warning on staff overlaps, the highest operational and reporting risk of the options. **Revisit:** if overlap abuse or reporting problems appear, add B (warning + reason + audit) or C (capacity). **Related:** INV-B7, state machine §1 (booking), EC-29. Tickets: PRO-79, PRO-489, PRO-528 (cancelled), DSG-60/61.

---

### ADR-024 — Reports: ship CSV-first, dashboards as v2
**Status:** ✅ Active (sequencing) **Decided by:** Maaz + Michelle synced, 2026-07-29 (2 ✅ in #reports, no objections). **Context:** Two report types are in build, table-format CSV/Excel downloads and analytics-dashboard views. Sham has a richer dashboard prototype and a Top-5 user-story doc; Anum has existing dashboard screens on mock data. Shipping everything at once is slow, and Tier 2 (SOTA, churning off Fresha) needs a finance/compliance export from day one. **Decision:** Ship 3-4 must-have CSV/Excel reports now (sales log detailed, payments log, tips collected) for finance to tally. Ship the existing dashboard screens as basics. Sham's optimized dashboard set is a **v2 iteration**. **Alternatives:** (A) hold reporting until dashboards are polished (too slow, misses the Tier 2 gate); (B) dashboards-first (wrong, compliance tally is the hard requirement, dashboards are nice-to-have). **Consequences / conditions (Michelle, 2026-08-07):** the sequencing is right, but "compliance-ready" is only true once three things close, do not ship the CSV as compliance-grade before them:
> 1. **Formula sign-off first.** Tax inclusive vs exclusive (EC-32) and cancellation-fee-as-revenue (EC-30) are unresolved. A wrong VAT export is worse than none, it breaks the compliance pitch (INV-P9).
> 2. **The must-have set must reconcile.** Sales log + payments log + tips do not close a day without a **refund/void log** and a **VAT summary**. Add them to the 3-4.
> 3. **Reconcile ship-dashboards-now vs wait-on-architecture.** Maaz says ship the existing screens; Anum is holding backend integration until Faisal signs off the (unfinalized) reporting architecture. If dashboards ship on a pipeline that gets replaced, the work is throwaway. Pick one.
>
> **Also:** run Sham's "show SOTA both, see what they like" dashboard A/B in parallel (cheap de-risk before Anum builds the wrong set); and give v2 a real trigger (e.g. post-SOTA), an untriggered "v2 iteration" slips. The reporting **architecture** decision (Option 2, embedded vs BI boundary, scaling, data lake) is separate and still open, tracked in goals.md, not settled by this record. **Related:** product.md reporting, goals.md Product Goal 4, glossary Reports module, EC-30/EC-32/EC-33. Source: #reports channel, Maaz 2026-07-29.

---

### ADR-025 — WhatsApp Coexistence as the interim comms bridge
**Status:** ⏳ Proposed, needs a decision **Proposed by:** Maaz, 2026-08-08 (Slack #C0BMX71U5J8) **Context:** Cami's WABA is no longer restricted, but verification restarted at stage 1 of three (Business Verification → WhatsApp Verification → Tech Provider verification) with no ETA. The v0.2 build is done; the block is external (INV-C2). Meanwhile Tier 2 comms, the SOTA pitch, and the 40% after-hours inbound (EC-11) all wait. **Proposal:** turn on Meta's Coexistence so the WhatsApp Business phone app and the Cloud API share one number with two-way chat sync. The app side needs no Business Manager verification, so a UAE-based team member runs real conversations manually on the live number now, and when verification clears the API inherits history rather than starting cold. **Alternatives:** (A) wait for verification, ship nothing conversational; (B) Coexistence bridge, this proposal; (C) run comms on a separate throwaway number and migrate later, which loses number continuity and history. **Limits:** ~20 messages/sec, manual or semi-manual only, no bulk automation at that tier, some app features drop out. **Consequences if adopted:** buys thread history and continuity into the API cut-over (EC-45) and lets Cami hold live conversations, at the cost of a staffed manual inbox. It does **not** lift INV-C2, so Unibox automation and the AI Receptionist (INV-C3) stay gated, and it must not be sold to operators as the Unibox being live. **Open before this can be accepted:** who staffs the inbox and during which hours, whether pilot operators are told the human is manual, and whether Cami has verified Meta's history-sync behavior rather than assuming it. **Related:** INV-C2, INV-C3, EC-11, EC-44, EC-45, goals.md open questions.

---

### Deferred by owner, 2026-08-06 (kept open on purpose, do not re-litigate)
- **Tip refundability** (can a tip be refunded, by which mode) — open, Product + Finance. See refunds-and-voids open questions, and [06 Money Composition Contract](06-money-composition-contract.md) §9.2.
- **Membership model** (auto-renewing vs fixed-term prepaid) — open, blocks ADR-021. Left open.

---

### Open from the Money Composition Contract (06 §9), each becomes an ADR when it lands
> These are **blocking** and each needs an owner and a date. A decision does not resolve inside 06; when one lands it gets an ADR number here and 06 §9 points at it. 9.1 requires tax confirmation before build.

| 06 § | Decision | Status |
|---|---|---|
| 9.1 | Mandatory service charge: separate taxable object, or one tip object with a taxable flag | ⏳ Open, needs tax confirmation. Understates output tax if unresolved |
| 9.2 | Tip on refund: returned to customer, or retained because already paid out to staff | ⏳ Open, same item as the deferred entry above |
| 9.3 | VAT timing on package sale: at sale, or at redemption | ⏳ Open. Interacts with ADR-007 (voucher tax at redemption) and ADR-020 |
| 9.4 | Gift card scope: amount-denominated only, or service-specific permitted | ⏳ Open. Constraining to amount-denominated removes the VAT-timing ambiguity |
| 9.5 | Tip on a package-only (zero taxable gross) invoice: permitted, and settling against what | ⏳ Open. Interacts with INV-09 |
| 9.6 | Discount eligibility flags, and whether promotions stack | ⏳ Open. Same question as EC INVC-E3, INVC-E4, MBR-E5 |

> **Note:** terminal/gateway refunds were briefly deferred here, then reversed on 2026-08-06 — CamiPay-captured refunds must go through the gateway and are now a **pilot blocker** (ADR-014, camipay rule 6). No longer deferred.

---

## Change log
<table class="companion-table" style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Date</p></th><th colspan="1" rowspan="1"><p>Change</p></th></tr><tr><td colspan="1" rowspan="1"><p>2026-08-03</p></td><td colspan="1" rowspan="1"><p>Initial 12 records, populated from context files.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Added ADR-013 to ADR-018 from the Jul 20 and Jul 23 CamiPay meetings (deposit accounting, balance rails, capture-card drop, immutable links, redemption-time policy, no auto-fee).</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Incorporated PDR-001/002/003 (package refund valuation, entitlement model, membership concurrency) as ADR-019/020/021 from Michelle's sales-domain Slite draft. Flagged the PDR-001 vs Jul 31 meeting-note refund-default conflict.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Reconciled against business-rules-v2 (agreed 2026-08-04): widened the ADR-019 refund-default conflict (unconsumed-only reaffirmed vs PDR-001 clawback); added terminal trust-device Phase 1 + gateway-refund-gap note to ADR-014; reaffirmed ADR-015 capture-card drop.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Owner rulings: ADR-022 per-device terminal PIN is law (resolves the §9 conflict). Tip refundability, terminal gateway refunds, and the membership model kept deliberately open.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-06</p></td><td colspan="1" rowspan="1"><p>Added ADR-023: staff-side-only overlapping appointments (channel-gated), online offers only non-conflicting slots. Also softened the terminal Phase-2 claim to planned-only (PRO-982 is the Phase-1 evidence); provider abstraction is per-rail.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-07</p></td><td colspan="1" rowspan="1"><p>Added ADR-024: ship Reports CSV-first, dashboards as v2 (Maaz + Michelle, Jul 29). Recorded three conditions before CSV counts as compliance-ready (formula sign-off, add refund/void + VAT to the must-have set, reconcile ship-dashboards-now vs wait-on-architecture). Reporting architecture kept separate and open.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-07</p></td><td colspan="1" rowspan="1"><p>ADR-020 / PDR-002 confirmed by Michelle (Hunain meeting): status ⏳ Proposed → ✅ Active, 1 session per covered service line, not per appointment. Resolves the FE/BE mixed-visit ambiguity flagged in Mike's money-contract code review.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-16</p></td><td colspan="1" rowspan="1"><p>Added ADR-025 (WhatsApp Coexistence as the interim comms bridge), proposed by Maaz 8 Aug 2026, pending a decision.</p></td></tr><tr><td colspan="1" rowspan="1"><p>2026-08-09</p></td><td colspan="1" rowspan="1"><p>Registered the six open decisions from 06 Money Composition Contract §9 (service charge, tip on refund, package VAT timing, gift card scope, tip on zero-gross invoice, discount eligibility). Each becomes an ADR when it lands; none resolve inside 06.</p></td></tr></tbody></table>
