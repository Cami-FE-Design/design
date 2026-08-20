# Competitors

**Last updated:** 2026-08-16
**Source:** Internal thesis + context files via /welcome, enriched via /enhance-context (Investment Committee update, 1 July 2026). Fresha pricing corrected 2026-08-16 from SOTA's live account.

**Evidence level:** ⚠️ Capability matrix and named competitors (Fresha, ezyVet) are from the July 2026 investor deck. Positioning is still partly inferred, not from win/loss data. Validate feature and pricing claims before using in sales. **The Fresha pricing correction below is the only competitor claim here grounded in a real invoice, and it is a single account.** Deepen any one competitor with /competitive-profile-builder.

---

## How We Think About It

**Cami = Fresha + Vertical OS features + CRM.** Fresha proved the model (mature booking, payments margin, marketplace demand) but stops at generic booking. **Correction, 2026-08-16:** Fresha was described here as a free, payments-led OS and Cami's structural analog on business model. On the one real account we can see, that is wrong, see the Fresha entry below. Cami adds the vertical OS layer (service semantics, intake and consent, scheduling rules, terminology) and a WhatsApp-native CRM (unibox, client record, follow-ups) on top, routed through local GCC rails. Competitors cluster by vertical: the pet field is Moego, Digitail, and ezyVet; the salon and spa field is Fresha; the broader beauty, wellness, and fitness field adds Mindbody.

> Note: SOTA is a customer (Tier 2 pipeline, August), not a competitor. It appears here only because it is churning off Fresha, which is the competitive signal.

### Capability matrix (from the July 2026 investor update)

| Capability | Fresha | Cami | ezyVet |
|---|---|---|---|
| WhatsApp CRM & Unibox | None | In build (Aug) | None |
| Payment integrated to POS | Online only | NeoPay (live Jul) | No integrations |
| Pet-first OS architecture | No | Yes | Advanced APIs |
| UAE / GCC focus | Global priorities | UAE-first | Not localized |
| Non-pet verticals | Yes (wider reach) | Yes (Q4: beauty vs clinics) | Yes (wider reach) |
| Operator win (Aug) | SOTA churning | SOTA pipeline live | Pipeline: Kare, Circle, Ark |

## Landscape

Cami's wedge is WhatsApp-native AI scheduling with payment capture on local GCC rails. No incumbent occupies that exact intersection: booking tools are not WhatsApp-native, and vet SaaS owns clinical records but ignores the client experience. The investor deck names Fresha and ezyVet as the two "real competitors" Cami is already taking share from.

### Pet vertical

| Competitor | Category | Geography | WhatsApp-native | Where they pressure Cami |
|---|---|---|---|---|
| **Moego** | Pet grooming / boarding SaaS | US-focused | No | Feature depth for grooming ops |
| **Digitail** | Vet practice SaaS | Global | No | Owns clinical record, vet workflows |
| **ezyVet** | Vet practice SaaS (enterprise) | Global | No | Deep clinical, enterprise vet chains |

### Salon / spa / beauty / wellness / fitness vertical

| Competitor | Category | Geography | WhatsApp-native | Where they pressure Cami |
|---|---|---|---|---|
| **Fresha** | Salon/spa booking + marketplace | Global, thin GCC | No | Brand, free-tier gravity, marketplace demand |
| **Mindbody** | Wellness / fitness / beauty booking + management | Global, US-strong | No | Entrenched in fitness and wellness, enterprise-grade tooling |

### CRM / conversational messaging

| Competitor | Category | Geography | WhatsApp-native | Where they pressure Cami |
|---|---|---|---|---|
| **respond.io** | Omnichannel business messaging / conversational CRM | Global | Yes | Owns the WhatsApp inbox + automation layer Cami's CRM competes with |

---

## Fresha

- **Positioning:** Global salon and spa booking with a consumer marketplace and integrated card processing. Markets itself on a free core monetized through payments and marketplace. **On the one account we have visibility into, it is sold as a subscription.**

> ### 🔴 Correction, 2026-08-16: Fresha is not free at the tier SOTA is on
>
> Read directly off SOTA's live Fresha account summary, **16 days of August 2026**:
>
> | Fresha revenue line | Share of Fresha's total take |
> |---|---|
> | **Subscription & add-ons** | **~58%** |
> | Card payment fees | ~22% |
> | New Fresha client fees (marketplace) | ~15% |
> | Message credits | ~5% |
> | **Total** | **100%** |
>
> **Subscription is 2.6x processing.** On this account Fresha is primarily a subscription business that also takes a processing margin, not a free OS funded by payments.
>
> **What this changes.** Cami's free OS (ADR-001, INV-P4) is a **genuine differentiator against Fresha as actually sold**, not a copy of Fresha's model. That is a sales asset. It also means the switching pitch has a hard number in it: all-in, Fresha extracts roughly **1.3% of SOTA's monthly GMV**.
>
> **The warning in the same number.** To match that extraction at a 2.5% blend, Cami must capture about **51% of SOTA's GMV**. Deposits alone run ~8%. Replacing Fresha's revenue on this account requires the terminal, not the payment link.
>
> **Scope, stated honestly.** This is **one account**. Fresha may well have a genuinely free tier that other operators sit on, and this may be an enterprise or add-on-heavy plan. What is disproven is the unqualified claim that Fresha is a free, payments-led OS. What is confirmed is the marketplace half: "New Fresha client fees" is real marketplace monetization, and it is also a **switching cost**, since leaving Fresha means losing that acquisition channel (~15% of Fresha's take here).
>
> Source: [jtbd-owner-2026-08-16](../work/discovery/outputs/jtbd-owner-2026-08-16.md).

- **Where they win:** Brand recognition, marketplace demand generation, mature booking UX, and a monetization mix (subscription + processing + marketplace) that is broader than Cami's single processing-margin line.
- **Where Cami wins:** Fresha is not WhatsApp-native (booking lives in an app/portal, not the thread the customer already uses), has minimal GCC traction, and no local-rail payment advantage. Cami meets the GCC customer on WhatsApp and routes payment through local partnerships.
- **Watch:** Fresha is the closest **product** analog, but no longer assume it is the closest **business-model** analog. If they invest in WhatsApp or GCC, the product overlap sharpens. On pricing, Cami and Fresha are diverging rather than converging, and that is Cami's ground to fight on.

## Moego

- **Positioning:** Pet grooming and boarding SaaS, subscription-led, strong in the US.
- **Where they win:** Deep grooming-specific operational features, mature product for US pet businesses.
- **Where Cami wins:** US-focused with no local GCC payment play and not WhatsApp-native. Subscription-led rather than payments-led, so no free-OS gravity. Cami's wedge (conversational scheduling + local capture) is absent.
- **Watch:** Relevant only if Moego expands to GCC; low near-term threat.

## Digitail

- **Positioning:** Modern vet practice SaaS, owns the clinical record and vet workflows, global.
- **Where they win:** Clinical depth (records, medical workflows), a system of record vets trust.
- **Where Cami wins:** Ignores the client-facing conversational experience. Cami owns the WhatsApp touchpoint, booking, reminders, and payment capture that Digitail treats as secondary.
- **Watch:** In pure-vet accounts, clinical depth may outweigh client-experience gains. Cami's answer is complement-or-coexist, not head-on clinical replacement.

## ezyVet

- **Positioning:** Enterprise-grade vet practice management, deep clinical, global, larger chains. Strong advanced-API surface for integrations.
- **Where they win:** Enterprise clinical feature depth, established in large vet organizations, integration APIs.
- **Where Cami wins:** No WhatsApp CRM, no integrated POS payments, and not localized for UAE/GCC. Client experience and conversational booking are not their game; their weight is clinical and enterprise back-office. Cami is actively taking share here (ezyVet pipeline names: Kare, Circle, Ark).
- **Watch:** One of the two named "real competitors" (with Fresha) in the investor deck. Overlap is at enterprise vet chains that conflate clinical PMS with client engagement. **Deliberate stance (Jul 2026):** Cami is not chasing full-clinical vet accounts now, they want the ezyVet clinical feature set Cami does not have, so competing head-on is not winnable yet. In pet, Cami targets boarding businesses (boarding calendar), not clinical vets.

## Mindbody

- **Positioning:** Global wellness, fitness, and beauty booking and business-management platform, US-strong. Entrenched incumbent as Cami expands into beauty, wellness, and fitness.
- **Where they win:** Deep, mature tooling for fitness and wellness operators, brand and scale in those verticals.
- **Where Cami wins:** Not WhatsApp-native, not UAE/GCC-first, and no in-thread payment capture on local rails. Cami's conversational front door and local capture are absent from Mindbody's model.
- **Watch:** Becomes directly relevant as Cami moves into beauty, wellness, and fitness (Q4 and beyond). Validate its actual GCC footprint before treating it as a live threat.

---

## respond.io

- **Positioning:** Omnichannel business-messaging and conversational-CRM platform, WhatsApp Business API plus other channels, shared inbox, automation, and broadcasts. Global, horizontal, sold to any business that manages customers over chat.
- **Where they win:** The one competitor that is genuinely WhatsApp-native. Mature inbox, automation flows, and broadcast tooling. Horizontal reach across industries and channels.
- **Where Cami wins:** respond.io is a horizontal messaging layer, not an appointment OS. No booking calendar, no deposit-at-booking capture, no vertical service semantics, no payments margin model. It is the "+ CRM" term in the equation without the "Fresha + Vertical OS" terms. Cami fuses the inbox to scheduling and payment capture; respond.io leaves booking and money off-platform.
- **Watch:** The sharpest CRM-layer comparison, and WhatsApp-native like Cami. If respond.io moved toward vertical booking and payments it would close distance, but that is a large step away from its horizontal model.

## Cami's Structural Edge

Cami is the only platform that (1) unifies the operational stack, (2) owns the client-facing WhatsApp touchpoint, (3) routes payment through local GCC rails, and (4) is native to the conversational channel the region already uses. Anyone can bolt on a WhatsApp integration or wire up a local processor; the moat is that the wedge produces the revenue: AI scheduling creates bookings, bookings create deposits, deposits create processing margin, with no second onboarding to turn on payments.

## Data Gaps To Fill
- [ ] **Fresha's actual tier and pricing structure.** One account shows a subscription 2.6x its processing fees. Is there a genuinely free tier, and what puts an operator on a paid one? This changes the switching pitch
- [ ] What SOTA's Fresha subscription actually buys (add-ons, plan level), so Cami knows what it must replace as well as what it undercuts
- [ ] Fresha's actual GCC traction and any WhatsApp roadmap signals
- [ ] Win/loss notes from the ezyVet deals in play (Kare, Circle, Ark) and SOTA's move off Fresha
- [ ] Mindbody's real GCC footprint before treating it as a live threat
- [ ] Non-pet competitors as verticals broaden (beauty, fitness, wellness booking tools)
