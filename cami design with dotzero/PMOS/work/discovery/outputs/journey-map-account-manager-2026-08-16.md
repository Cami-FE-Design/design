# Journey Map: Account Manager, signed partner to settling account

**Persona:** Account Manager (CamiHQ). **Not in `personas.md`.** Named in PRO-737 as one of two roles who touch HQ, with Ops.
**Scenario:** Taking a signed partner from contract to an account that captures and settles reliably.
**Scope:** Contract signed → account healthy and monitored.
**Date:** 2026-08-16

## Context

| Source | What it gave this map |
|---|---|
| `docs/specs/PRO-737-cami-hq-camipay-config.md` | The only built HQ money surface. Rails, gateways, rate card. UI shipped, **mock data, no backend** |
| [jtbd-camihq-2026-08-16.md](jtbd-camihq-2026-08-16.md) | The 11-row inversion; 2 built, 9 not |
| `personas.md` | Tier definitions and the captured-vs-booked heuristic |
| Knowledge docs | INV-12 forward-only config, INV-08 attributable, INV-P3 per-rail provider |

**Confidence: Low-Medium.** Stages 3 to 5 are grounded in a real spec. Everything else is inferred from the absence of a surface, which tells you work happens somewhere but not how. **No AM has been interviewed.** The whole map is a hypothesis to walk through with one.

---

## Journey overview

| # | Stage | Tool today | Emotion | Pain |
|---|---|---|---|---|
| 1 | **Signed** | CRM, Slack | 😊 | Deal energy, nothing broken yet |
| 2 | **KYC / settle-readiness** | ⚠️ Unknown, likely spreadsheet + email | 😐 | No surface. No definition of "ready to settle" |
| 3 | **Gateway assigned** | ✅ PRO-737 | 😊 | Works. Non-NeoPay options carry an `Onboarding` badge |
| 4 | **Rate card set** | ✅ PRO-737 | 😊 | Works, and is the best-designed money surface in the product |
| 5 | **Rails on** | ✅ PRO-737 | 😐 | Toggle is not attributed. No audit of who turned money on |
| 6 | **First capture** | 🔴 Nothing | 😤 | Cannot see whether money is flowing. Asks engineering |
| 7 | **First payout clears** | 🔴 Nothing | 😤 | The moment of truth, and it is invisible |
| 8 | **Monitoring** | 🔴 Nothing | 😤 | No revenue view, no captured-vs-booked flag, no portfolio |

Three green stages in the middle, surrounded by five with no surface at all.

---

## Stage details

### 1. Signed
**Actions:** deal closes, handoff from sales.
**Emotion:** positive. ⚠️ Assumed.
**Pain:** none yet.

### 2. KYC and settle-readiness
**Actions:** collect legal entity, VAT TRN, address, bank account. Verify them. Decide the partner can be paid.
**Thoughts:** *"Do we have everything? Who checks the bank account is real?"*
**Emotion:** neutral, with hidden risk. ⚠️ Assumed.
**Touchpoints:** ⚠️ unknown. No HQ surface exists, so this is happening in a spreadsheet, email, or someone's head.
**Pain:**
- **No definition of settle-ready.** PRO-737 explicitly defers "gateway credentials, payout accounts, batch timing" to a separate spec that does not exist.
- Fresha gates a bank-account change behind "additional information and documents for Fresha to verify". That implies a review queue on their side. Cami has no equivalent, and payout destination is the highest-risk write in the system (jtbd-camihq OP3, opportunity 19).

**Opportunity:** a settle-readiness checklist on the partner record. Even a static one beats a spreadsheet, because it makes the gate explicit before money moves.

### 3. Gateway assigned ✅
**Actions:** pick a gateway per rail. NeoPay live; TapPay, NI, Stripe carry a muted `Onboarding` badge so nobody assigns a rail that cannot route.
**Emotion:** positive, this works.
**Note:** the two rails are independent including their gateway (INV-P3). Pawhaus in the mock data is deliberately configured split so this is visible rather than theoretical.

### 4. Rate card set ✅
**Actions:** set a rate per rail with an effective-from date. Appends a row, never edits one.
**Emotion:** positive, and this is the strongest surface in the product. Four refusals enforce it: no editable rate field exists, the only write is "Change", past rows have no affordance, backdating is blocked at the input.
**Pain:** none in the flow. One real gap: **no rate-band validation**, nothing stops 0.01% or 99% (PRO-737 known gap).
**Worth copying:** rate edits carry their own permission (`billing.camipay.rates.edit`), separate from rails (`billing.camipay.rails.edit`), because turning a rail on is operational and changing a rate is commercial, and the same person does not necessarily do both.

### 5. Rails on ✅ with a gap
**Actions:** toggle terminal and online. Immediate, no save, no deploy.
**Emotion:** neutral. The act is easy; the consequence is unverifiable from here.
**Pain:**
- **Rail toggles are not attributed.** Rate rows record `createdBy`, rail and gateway changes do not. Both move money and both need audit from day one (INV-08, PRO-737 known gap).
- The sequence 2 → 5 is **deliberately not enforced**. A rail on with no gateway shows an amber "this rail is on but has no gateway, so nothing will route", a warning rather than a block, because the two settings are set by different people at different times. Correct design decision, and it means the journey has no built-in gate between "configured" and "actually working".

### 6. First capture 🔴
**Actions:** wait. Hope. Ask engineering or the partner whether anything came through.
**Thoughts:** *"Is it working? Has anyone paid yet?"*
**Emotion:** frustration. First unsupported stage after three good ones, which makes the drop sharper. ⚠️ Assumed.
**Pain:** no HQ view of a partner's transactions. The merchant can see their own wallet; the AM who configured the account cannot see whether their configuration works.

**Opportunity:** partner transaction view, the same event stream the merchant sees, opposite sign.

### 7. First payout clears ← **moment of truth** 🔴
**Actions:** find out whether money reached the partner's bank. Usually by the partner saying so, or not saying so.
**Thoughts:** *"Did it land? If it didn't, who do I ask?"*
**Emotion:** high stress, entirely avoidable. ⚠️ Assumed.
**Pain:** no payout run, no failure list, no reason codes. jtbd-camihq OP1 and OP2 score 16 and 17 against a satisfaction of 2 and 1.

**Opportunity:** payout run view. Who is due, how much, cleared or failed, why. Answers the single most common inbound question without engineering.

### 8. Monitoring 🔴
**Actions:** ⚠️ unknown. Probably nothing systematic.
**Thoughts:** *"Is this account working? Which of mine needs me this week?"*
**Emotion:** frustration or, worse, false calm. ⚠️ Assumed.
**Pain:**
- No per-partner revenue view reading the stored rate.
- **No captured-vs-booked flag.** `personas.md` calls this gap "the signal to watch"; EC-19 is 🔴 with no automated flag. SOTA on Fresha is the worked example, ~8% of GMV captured, and nobody would have known without reading a competitor's screen.
- No portfolio ranking, so no way to decide where the week goes.

**Opportunity:** the captured-vs-booked flag is the highest-opportunity job in the HQ doc (AM2, score 19) and among the cheapest. Both numbers already exist in Cami's data.

---

## Emotional journey

```
High  | ●     ●  ●
      |          
      |    ●        ●
Low   |              ●  ●  ●
      +--------------------------
        1  2  3  4  5  6  7  8
```

The shape matters more than the levels: **it ends low.** The AM's experience improves through configuration and then falls away exactly when the account starts producing revenue. Everything PRO-737 built is front-loaded into setup; nothing supports the operating life of the account.

---

## Moments of truth

| Moment | Stage | Impact | State | Evidence |
|---|---|---|---|---|
| **First payout clears** | 7 | Decides whether the partner trusts Cami with money | 🔴 Invisible to HQ | jtbd-camihq OP1/OP2 |
| Payout destination verified | 2 | Fraud surface. One field redirects every future payout | 🔴 No queue | Fresha gates it, Cami does not |
| Rate agreed and recorded | 4 | Every future transaction prices off this | ✅ Well built | PRO-737 |
| Capture gap noticed | 8 | The revenue model working or not | 🔴 No flag | EC-19 |

---

## Priority opportunities

| Opportunity | Stage | Impact | Effort | Evidence |
|---|---|---|---|---|
| Captured-vs-booked flag | 8 | High | **Low**, data exists | EC-19, AM2 score 19 |
| Payout run view | 7 | High | Medium | OP1/OP2 |
| Payout-destination review gate | 2 | High | Low-medium | OP3 score 19 |
| Attribute rail and gateway toggles | 5 | Medium | **Low** | PRO-737 known gap, INV-08 |
| Partner transaction view | 6 | Medium | Medium | Inferred |
| Settle-readiness checklist | 2 | Medium | Low | PRO-737 deferred scope |

Three of these are genuinely cheap: the capture flag, toggle attribution, and the readiness checklist.

---

## Connection to roadmap

| Finding | Initiative | Status |
|---|---|---|
| Rails, gateways, rate card | PRO-737 | ⚠️ UI shipped, mock data, **no backend** |
| Settlement config, payout accounts, batch timing | "Separate surface, separate spec" | 🔴 Spec does not exist |
| Cross-merchant revenue view | Partner Dashboard / CamiHQ BI | 🟡 In design, architecture unsigned |
| Captured-vs-booked flag | EC-19 | 🔴 No flag |
| Toggle attribution | PRO-737 known gap | 🔴 Waiting on the audit spine |

---

## Assumptions to validate

- ⚠️ **That this journey has these stages at all.** Inferred from absent surfaces, not observed.
- ⚠️ Every emotion. No AM has been interviewed.
- ⚠️ That stages 2, 6, 7, 8 happen in spreadsheets and Slack. They might have tooling nobody documented.
- ⚠️ That one AM owns a partner end to end, rather than a handoff between onboarding and account management. Changes who each surface is for.
- ⚠️ That PRO-737's mock-data state has not moved. It is dated as UI-only; confirm before treating stages 3 to 5 as solved.

## Next steps

1. **Interview one AM and walk this map.** The spreadsheets they open are the spec. Everything else here is a guess dressed as a stage.
2. Spec the captured-vs-booked flag. Highest impact, lowest cost, data already exists.
3. Add attribution to rail and gateway toggles. Small change, closes an INV-08 gap on an action that moves money.
4. Decide whether the deferred settlement spec (payout accounts, batch timing) gets written now or the gap is accepted for the pilot with a named review date.
5. Add Account Manager and Ops to `personas.md`, or record deliberately that HQ personas live elsewhere.
