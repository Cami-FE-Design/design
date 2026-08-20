# What changed: roadmap, 2 Aug → 16 Aug

**Compares:** [roadmap-2026-08-02.md](roadmap-2026-08-02.md) → [roadmap-2026-08-16.md](roadmap-2026-08-16.md)
**Source of change:** `Cami_Priorities_August.pptx.pdf` (17 Aug deck) and the [31 Jul meeting](../../meetings/2026-07-31-roadmap-settlement-reporting-team.md)
**14 days apart.**

---

## Shipped

| Item | Was |
|---|---|
| Auto-Reminders (SMS + email) | Now |
| Calendar Scheduling | Now |
| Online Bookings | Now |
| Inventory | Now |
| Team Controls | Now |
| Invoicing | Now |
| Clients & Pets | Now |
| Catalog | Now |
| Inbox, CRM | Next |

---

## Moved down

| Item | Was | Now | Note |
|---|---|---|---|
| **Multi-location** | Next | **Later**, no date | Aug 2 said it was the prerequisite for Tier 1 in Q4 |
| **Boarding calendar** | Next | **Later** | 6 operators in the pipeline waiting for it |
| **Group bookings** | Next | **Later** | Followed multi-location down |

## Moved up

| Item | Was | Now |
|---|---|---|
| **Settlement** | A dependency, not an initiative | August initiative |
| **Reporting** | Buried in "SOTA off-Fresha must-haves" | August initiative |
| **Agentic AI Platform** | A dependency of v0.2 | August initiative |

## New

| Item | Note |
|---|---|
| Cami-HQ Rate Card | Shipped as UI between the two roadmaps (PRO-737) |
| Dynamic Pricing | **Cannot trace it.** No objective, no persona job, no ADR |
| CamiPay EU/APAC | Took the geographic slot KSA used to hold |
| GA tracking | — |

## Dropped

| Item | Was | Why it matters |
|---|---|---|
| **Self-serve onboarding** | Next | It is Product Goal 3 in `goals.md`, the low-CAC engine for reaching 36 partners |
| **v1 GA (December)** | Later | Still the v1 milestone in `product.md` |
| **KSA / data sovereignty** | Later | INV-A3 still gates KSA on a Saudi-resident stack |
| Checkout/refund hardening | Now | Partly shipped. Gateway refunds still unbuilt and still a pilot blocker |
| In-house eng hiring | Now | Reality went the other way, see below |

---

## The three that matter

**1. SOTA flipped from anchor to queue.**

| | Aug 2 | Aug 16 |
|---|---|---|
| SOTA | "Live and transacting by 10 Aug". The whole Now section was built around it | **"Waitlisted until key features built"** |

The date passed. Every plan in both roadmaps assumes SOTA lands.

**2. Multi-location demotion breaks a chain Aug 2 wrote down.**

Aug 2 said Tier 1 (Chaps & Co) was gated on multi-location, and put multi-location in Next to make Q4 work. Aug 16 moves it to Later with no date and keeps Tier 1 in Q4. The deck's own legend still says Multi-Location "Unlocks Tier 1 Operators". Either Tier 1 slips or multi-location comes back.

**3. Capacity got worse, plan stayed the same size.**

| | Aug 2 | Aug 16 |
|---|---|---|
| Team story | Hiring 2x senior full-stack, SDR, CS, AE | dot zero behind and unpaid; handover to a **part-time** contractor (10-15 hrs); QA capped at ~3 items; both leads burnt out |
| Items in Now | 8 | 6 |

---

## Numbers that changed

| Figure | Aug 2 | Aug 16 | Action |
|---|---|---|---|
| SOTA GMV | ~2x the Tier 2 GMV floor (investor deck, canonical) | **~3x the floor** (deck p16) | Close EC-18 at ~3x. Deck, Jul 31 call, and market slide now agree |
| Operators | 4 onboarding | **7 signed, 2 live** | Update `goals.md` |

**Knock-on:** the higher GMV figure corrects arithmetic published on 16 Aug. Deposits as share of SOTA's GMV move from ~8% to **~5.4%**, and the capture needed to match Fresha moves from ~51% to **~34%**. Target is easier than stated; the off-rail gap is worse.

---

## One thing to confirm

Aug 2 said clinical vets are not winnable and not to spend pipeline there (ADR-006). The Aug 16 deck lists **Vet Workflows** in Later *and* maps "Multi-chain Vet Operators" as a Tier 1 segment. That reopens a settled decision, or it is an accident. Worth asking which.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version |
