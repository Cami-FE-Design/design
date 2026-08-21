# Journey Map: the Payer

**One question:** What happens to the person actually handing over money, and where do they stop?
**Persona:** Noor, the client (pet parent or salon customer). **Not in `personas.md`.** They/them until a real person is described.
**Scope:** Asked to pay → paid with a receipt, or gave up.
**Date:** 2026-08-16

## Context

| Source | What it gave this map |
|---|---|
| `03 §8, §9` | Payment link lifecycle, terminal session, the provider's hosted pages |
| `05` EC-20, EC-23, EC-24, EC-26 | Expired link, webhook latency, OTP confusion, missing Apple Pay |
| `01` INV-C4, INV-P11, INV-P12, INV-B2 | Never leave the thread, immutable links, 12h lifetime, auto deposit |
| `04` ADR-018, ADR-016 | Cami never auto-charges; the policy-note-plus-call-button screen |
| Fresha/SOTA account | Confirms the merchant side; **says nothing about the payer** |

**Confidence: Low.** Every stage is derived from Cami's own law and edge cases, not from a payer. **No customer has ever been observed paying.** Treat this as a map of where the system *permits* failure, not where failure *happens*.

⚠️ **All emotions below are Assumed.** None are validated.

---

## Owns / not this

| This map owns | Point elsewhere |
|---|---|
| The payment moment, both rails | **journey-map-omar** — the merchant getting paid |
| Where a payer abandons | **journey-map-payment-lifecycle** — where the ledgers diverge |
| Payer-facing failure screens | **journey-map-layla** — the front desk booking flow |

---

## The two rails have opposite friction

One journey, two paths. This is the finding that matters most.

| | **Online link** | **Terminal** |
|---|---|---|
| Where | WhatsApp → provider's hosted page | At the counter |
| Steps before money moves | **4** | **1 to 2** |
| Failure points | Expired link, no fast-click, OTP, webhook wait | OTP only |
| Familiarity | New every time | The gesture they already know |
| Payer emotion | Uncertain | Neutral, unremarkable |

**Consequence for the roadmap.** ADR-003 ships online first and treats the terminal as later. That decision reaches majority volume slowly, and it also **launches on the harder conversion path**. The merchant preference for the terminal (cheaper, habitual) is well documented. The payer preference points the same way, and nobody has counted it.

---

## Map of stages

| Group | Job | Start here if… |
|---|---|---|
| **A · Asked to pay** | Understand why money is due now | "Why do I pay before you've done anything?" |
| **B · Pay online** | Complete a payment from a link | Link abandonment, low deposit conversion |
| **C · Pay at the counter** | Tap and go | Terminal declines, OTP at the desk |
| **D · Know it worked** | Get confirmation and a receipt | "Did that go through?" |
| **E · Something is wrong** | Refund, cancel, or dispute | Payer chasing the business |

---

## A · Asked to pay

| Stage | What happens | Emotion | Pain |
|---|---|---|---|
| Deposit at booking | Deposit is captured automatically on booking (INV-B2). Rules vary by service, VIPs waived | 😐 | Paying before any service exists. Reads as distrust unless the reason is stated |
| Balance at completion | Asked at the counter, or a fresh link | 😊 | Expected. Service was delivered |

**Pain:** the deposit is the first money moment and the least explained. Fresha's policy text is visible in their booking flow; Cami's equivalent is not specced anywhere I can find.

**Opportunity:** one sentence in the thread at deposit time, saying what it holds and what happens if they cancel. Cheap, and it converts a friction point into a trust signal.

---

## B · Pay online ← where the money is lost

| # | Stage | Emotion | Pain | Law |
|---|---|---|---|---|
| B1 | Link arrives in the WhatsApp thread | 😊 | None. This is Cami's strength | INV-C4 |
| B2 | Tap the link, leave WhatsApp, land on the provider's hosted page | 😐 | **They left the thread.** See below | 03 §8 |
| B3 | Choose a method | 😤 | **No Apple Pay means manual card entry, and "no one adds a card by hand"** | EC-26 🔴 |
| B4 | Bank OTP fires | 😤 | Unexplained, bank-branded, feels like something broke | EC-24 ⚠️ |
| B5 | Wait for confirmation | 😐 | Took 1 to 2 minutes in test. Must be seconds | EC-23 🔴 |
| B6 | Link expired (12h) | 😤 | Blank page today. They blame the business, not the link | EC-20 ⚠️ |

### B2 strains INV-C4

> **INV-C4:** "The customer never has to leave the WhatsApp thread to book, pay, or rebook. No app download, no link to chase." 🔒 Permanent principle.

The online path opens the **provider's hosted page** (03 §8 records NeoPay-hosted as acceptable, with a Cami-hosted page as an optional alternative). That is leaving the thread, onto a page that does not look like Cami or the business.

Not a build bug. It is either an invariant that needs its scope narrowed, or a design direction (in-thread payment) that has not been pursued. **Worth a decision rather than a silent exception**, because INV-C4 is marked permanent and permanent invariants change only via a Decision Record.

### B3 is the single highest-value unvalidated claim in the product

EC-26 says Apple Pay is a launch blocker and manual entry kills adoption. That claim is currently:
- driving a launch gate,
- about the payer,
- supported by no research.

If true, every online payment without fast-click is close to a lost transaction, and Cami's revenue is a percentage of transactions that **complete**. If false, the launch gate is wrong. Either way it should not stay a guess.

---

## C · Pay at the counter

| # | Stage | Emotion | Pain |
|---|---|---|---|
| C1 | Reception hands over the machine | 😊 | None. Familiar gesture |
| C2 | Tap or insert on the provider's on-device screens | 😊 | None |
| C3 | OTP, sometimes | 😐 | Same surprise as B4, but a human is standing there to explain it |
| C4 | Approved | 😊 | Done |
| C5 | Declined | 😐 | Recoverable in the moment. Try another card, or cash |

**Why this path barely has pain:** a person is present. Every failure gets explained and retried immediately. That is the thing the online path cannot replicate, and it is why the terminal converts.

---

## D · Know it worked

| Stage | Emotion | Pain |
|---|---|---|
| Receipt over WhatsApp | 😊 | Strong. Back in the thread, one tap |
| Waiting between paying and confirmation | 😐 | The gap in B5. Silence reads as failure |

**Opportunity:** an in-thread acknowledgement the moment the provider approves, before the receipt is generated. Removes the silence without waiting on the webhook.

---

## E · Something is wrong

| Stage | Emotion | Pain | Law |
|---|---|---|---|
| Cancel inside the refundable window | 😐 | Handled | Payment policy |
| Cancel outside it | 😤 | Sees a policy note plus a Call/WhatsApp button, and is routed to the business | ADR-018, PRD-60 |
| Wants a refund | 😤 | **Gateway refunds are not built.** Pilot blocker | ADR-014 🔴 |
| Paid but the record says unpaid | 😤 | Terminal Phase 1 trusts an unconfirmed device report | ADR-014 🔴 |

**ADR-018 is deliberate and correct:** Cami never auto-charges a no-show fee, and routes the customer to the merchant instead. It keeps Cami out of disputes. But it means the payer's worst moment is handled by a phone call, and nobody has checked whether that screen reads as fair or as a brush-off.

---

## Emotional journey, online path

```
High  | ●                             ●
      |    ●                       ●
      |       ●              ●
Low   |          ●     ●
      +--------------------------------
        B1  B2  B3  B4  B5  D
      Link  Leave Method OTP Wait Receipt
```

Starts high (the thread is the strength), collapses through the middle three steps, recovers only at the receipt. **Cami owns the good ends and a third party owns the bad middle.**

---

## Moments of truth

| Moment | Stage | Impact | State | Evidence |
|---|---|---|---|---|
| **The method screen** | B3 | Decides whether the payment completes at all | 🔴 Apple Pay not enabled | EC-26 |
| OTP fires unexplained | B4 | Payer thinks it broke | ⚠️ Bank behavior, not Cami's | EC-24 |
| Silence after paying | B5 | Reads as failure | 🔴 1 to 2 min in test | EC-23 |
| Expired link opens blank | B6 | Payer blames the business | ⚠️ Expired screen planned | EC-20 |
| Refund requested | E | No path exists | 🔴 Pilot blocker | ADR-014 |

---

## Priority opportunities

| Opportunity | Stage | Impact | Effort | Evidence |
|---|---|---|---|---|
| Enable Apple Pay and fast-click | B3 | **High** | Medium, mostly account and cert setup | EC-26 |
| Expired-link screen with regenerate | B6 | Medium | **Low** | EC-20 |
| In-thread acknowledgement on approval | B5, D | Medium | **Low** | EC-23 |
| One line explaining the deposit | A | Medium | **Low** | Inferred |
| Reception script for OTP | B4, C3 | Low-medium | **Very low**, training not build | EC-24 |
| Decide INV-C4 scope, or build in-thread payment | B2 | High | High | INV-C4 |

Four of these are cheap. None are on the roadmap.

---

## Connection to roadmap

| Finding | Initiative | Status |
|---|---|---|
| Apple Pay missing | CamiPay Online (August) | 🔴 Named launch blocker, EC-26 |
| Webhook latency | CamiPay Online (August) | 🔴 EC-23 unresolved |
| Expired-link screen | — | ⚠️ Planned, no ticket found |
| Gateway refunds | CamiPay | 🔴 Pilot blocker |
| Terminal converts better | CamiPay POS Terminal (August) | Supports pulling terminal forward, not back |
| In-thread payment | — | Not on any roadmap. INV-C4 says it should be |

---

## Assumptions to validate

- ⚠️ **Every emotion here.** No payer has been observed or asked.
- ⚠️ **EC-26's core claim**, that manual card entry kills adoption. It is driving a launch gate on zero evidence.
- ⚠️ That leaving WhatsApp for a provider-branded page costs conversion. Plausible, unmeasured.
- ⚠️ That the deposit request reads as friction rather than as normal. Fresha's customers accept it; Cami's may too.
- ⚠️ OTP thresholds. "New card, above ~1000 AED, future-dated" is approximate and varies by bank and card.
- ⚠️ That the ADR-018 policy screen reads as fair.

## Next steps

1. **Watch five people pay.** Three online, two on a terminal. Half a day, and it closes most of the ⚠️ rows above.
2. **Instrument the online link** for drop-off by step: opened, method chosen, OTP entered, confirmed. Turns EC-26 from a belief into a number.
3. **Ask NeoPay for their fast-click conversion data.** They have it across their book; Cami does not need to gather it first-hand.
4. **Take the INV-C4 question to a decision.** Narrow the invariant's scope or put in-thread payment on the roadmap. Do not leave a permanent invariant quietly contradicted.
5. Ship the three cheap fixes: expired-link screen, in-thread acknowledgement, deposit explainer.
