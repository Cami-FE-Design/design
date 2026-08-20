# Interview Snapshot: Queenie (SOTA Salon, Front Desk)

**Date:** 2026-07-28 (analyzed 2026-08-02)
**Interviewer:** Michelle + Christine (Cami)
**Duration:** ~1 session (AI Inbox prototype co-design)
**Context:** Live prototype walkthrough of the Cami AI Inbox with SOTA's receptionist. Goal was requirements gathering for the inbox / booking / triage flows ahead of SOTA go-live (10 Aug). Doubled as a discovery interview into how a real Tier 2 front desk actually operates.
**Source file:** [ai-inbox-design-queenie-2026-07-28.md](work/discovery/inputs/ai-inbox-design-queenie-2026-07-28.md)

## Connection to Your Context

- **Persona match:** Strong match to **Layla, the Receptionist (Champion User)**. Queenie is a real-world Layla: solo-ish front desk, lives in WhatsApp, reschedules from memory, chases deposits, squeezes walk-ins. Confirms the persona and adds operational depth the persona file flagged as 🔴 (Collection backlog, "have one real Receptionist read the narrative and correct it").
- **Account:** SOTA Salon, Tier 2 anchor (go-live 10 Aug 2026), churning from **Fresha**. Referenced in personas.md tiers and goals.md as the first Tier 2 win.
- **Known issues mentioned (product.md):** WhatsApp copy-paste pain, deposit-on-booking, no-show reduction, AI Receptionist / conversational scheduling, multi-service booking, reminders. All map to v0.2 / v1 roadmap.
- **New patterns not yet in context:** Reschedule/duplicate management as the dominant workload, multi-channel booking collisions (Instagram + direct-to-stylist), consultation-gated pricing, staff calendar autonomy as a data-quality risk, variable deposit rules by service.
- **Competitors mentioned:** Fresha (incumbent being replaced; online payment ~3%). Instagram as a booking channel. Network International vs NeoPay (payments decision, not a product competitor).

## Participant Profile

- **Role:** Front-desk operator / receptionist. Handles all inbound WhatsApp, phone, booking, rescheduling, deposits, staff coordination.
- **Company:** SOTA Salon, UAE. Multi-service beauty (hair, nails, facials, makeup, SPMU), multiple stylists/technicians incl. senior "hair directors" and 3 nail masters.
- **Tenure:** Experienced operator; references prior salons and prior booking software. Recognized by Cami team as high-skill ("she's really good, it takes an eye").

## Key Jobs-to-be-Done

- "When a client messages me, I want to instantly know who they are and what they usually get, so I can suggest and book without digging."
- "When my schedule is full, I want to squeeze a valuable client in, so I don't turn away revenue."
- "When a client wants to change an appointment, I want to reshuffle staff and slots and confirm everyone, so nobody is double-booked or dropped."
- "When someone books across channels (WhatsApp, Instagram, direct-to-stylist), I want to catch duplicates, so the same person isn't booked twice."
- "When a service has no fixed price (extensions, color), I want to route the client to a consultation, so I don't over-promise a price."

## Goals

- Convert every inquiry, and maximize one client doing multiple services in one visit (cross-sell hair + nails + facial).
- Keep the calendar full (close the gaps), especially for back-to-back senior staff.
- Protect bookings with deposits, without alienating VIPs.
- Never drop or double-book a conversation, even covering for a colleague on her day off.

## Frustrations

- **Reschedule volume is the real job.** Most conversation is modifying existing appointments, not new bookings. Each change is a manual chain: message client → wait for yes → move → notify staff., New insight, extends Layla persona.
- **Rescheduling means physically walking to the stylist** because staff don't reply on WhatsApp fast enough when it's urgent.
- **Duplicate bookings happen "many times."** Clients book on Instagram (different person handles it), direct with the hair director, and WhatsApp, and don't mention existing bookings. No dedup, no future-appointments view., Matches nothing in current product.md; net-new.
- **Consultation-gated services can't be booked cleanly.** Extensions/color have no exact price; she sends a padded "starts from" range + price list + pushes a consultation., Net-new complexity.
- **Copy-paste tax:** ~1.5 to 2.5 min per booking moving info between Fresha/notebook/WhatsApp., Matches product.md WhatsApp pain.
- **Staff autonomy creates noise:** stylists can book, discount to zero, comp friends, block/"drag" time. Prices altered on their mood., Data-quality risk, net-new.
- **Multi-service sequencing is hard to represent:** service (not stylist) dictates order; hair primary, 15 min before nails; parallel vs sequential. Prototype only showed one start time., Matches multi-venue calendar gap.
- **Last-minute + walk-in "squeeze" requests** require asking staff to extend hours; hard every evening when all are booked.

## Current Solutions

- WhatsApp as primary channel, plus phone, plus Instagram (separate handler), plus direct-to-stylist.
- Fresha + notebook/notes for records; global search + notes hacks ("times 2" for mom/sister on one number; family/friends comps).
- Manual reschedule: walk upstairs to the stylist, or forward the client message.
- Deposit rules held in her head: hair/nails 25%, facials/makeup/SPMU 50%, VIPs often waived.
- Standard templates pasted from notes (extension price breakdown, consultation ask).
- Manual duplicate-catching by eye ("you already booked next week, want me to reschedule?").

## Opportunities Identified

| Opportunity | Evidence | Strength | Notes |
|-------------|----------|----------|-------|
| Front desk needs to see who a client is + their usual service/staff the instant they message | "Last three appointments... usual staff"; wants notes + history in-thread | Strong | Confirms AI Inbox link-to-profile flow (v0.2). "Usual staff" = simple count of same staff, most recent wins |
| Front desk needs to catch duplicate/cross-channel bookings before they clash | "Duplicates... happens many times"; wants future-appointments tab + alert | Strong | Net-new. Multi-channel (Insta + direct-to-stylist + WhatsApp). Not on current roadmap |
| Front desk needs to reschedule + notify client and staff from the conversation | "Rescheduling shifting is mostly happening"; walks upstairs to reach staff | Strong | Reschedule > new booking. Biggest real workload. Needs client + internal-staff notify chain |
| Multi-service bookings need service-driven sequencing (parallel + sequential) in the UI | "Service dictates, not stylist... hair 15 min before nails"; only one start time shown | Strong | UI problem per Cami; engine unchanged. Surface previously-bundled services as rebook suggestion |
| Consultation-gated services need a "book consult / send range" path, not a fixed price | Extensions/color: "I could not give exact... always ask for consultation" | Strong | Net-new. Extensions ~1250 to 1550 AED/pack + fitting + color. Padded quote is "an art" |
| Deposit capture needs per-service % rules + VIP waiver | Hair/nails 25%, facials/makeup/SPMU 50%, VIPs waived | Medium | Extends product.md deposit feature. Higher no-show → higher % |
| Message triage needs AI ranking by urgency (unanswered, deposit due, cancel window, complaints) | Cami proposed; Queenie receptive | Medium | Confirms triage flow. Not deeply stress-tested yet |
| Owner/ops needs guardrails on staff price/discount/comp autonomy | Stylists discount to zero, comp friends, alter price by mood | Medium | Data-quality + revenue-leak risk. Net-new; ties to permissions (goals.md 30-staff roles) |
| Recurring/standing bookings need to be modeled | "Book me until December"; nails every 3 to 4 weeks; months-ahead standing slots | Medium | Recurring appointment pattern. Rebook cadence suggestion (3-week nails) |

## Key Quotes

> "Rescheduling shifting is mostly happening."
> Context: Confirming that modifying existing appointments, not new bookings, is the dominant workload.

> "It's the service. Not the stylist... if it's hair and nails, we need 15 minutes first before they do the nails."
> Context: Explaining what dictates multi-service scheduling order.

> "Duplicates... this happens a lot, many times."
> Context: On clients booking across WhatsApp, Instagram, and direct-to-stylist without saying they already have a booking.

> "I could not give exact... you need to really depend on our hair director, so that's why we always ask them for a consultation plus the price."
> Context: Why extensions and color can't be booked with a fixed price.

> "Our goal is to maximize one client doing everything in the salon."
> Context: Why simple 'usual staff' beats a rigid preferred-stylist field; cross-sell is the strategy.

> "I don't want to say no, so I always ask them, what could you do, could you stay."
> Context: Handling last-minute/evening squeeze requests by asking staff to extend.

## Patterns & Themes

- **Confirms Layla persona and upgrades it.** The champion-user thesis holds; the biggest correction is that the core workload is reschedule/duplicate management, not first-time booking. The journey map's Stage 4 (deposit) and Stage 7 (rebook) are real, but a whole reschedule-loop layer sits on top.
- **Multi-channel is a bigger problem than modeled.** Cami's WhatsApp-native thesis assumes the thread is the interface; SOTA also runs Instagram + direct-to-stylist, which is exactly where duplicates and collisions are born. Unibox value is higher if it can reconcile channels.
- **Verticalization shows up in pricing + sequencing, not just terminology.** Consultation-gated services and service-dictated ordering are OS-layer (product.md "vertical OS layer") requirements, concrete and non-pet.
- **Staff autonomy is a revenue-integrity theme** that connects to the Owner (Omar) persona and permissions on the goals.md 30-staff roadmap.
- **82% book-to-confirm** proposed as the north-star metric (roughly half of inbound converted to bookings, and the large majority of those confirmed). Worth adopting as the AI Inbox success measure.

## Follow-up Questions

- [ ] How often do duplicate/cross-channel bookings actually occur per week, and how many no-shows do they cause? (Size the problem.)
- [ ] Walk through 3 to 5 real reschedule conversations end-to-end: what triggers, who she contacts, how long each takes.
- [ ] For multi-service: what share of bookings are 2+ services, and how often parallel vs sequential?
- [ ] What is the exact deposit-waiver rule for VIPs, and who decides?
- [ ] How should Instagram bookings flow in, redirect to WhatsApp, or ingest directly?
- [ ] Which staff-autonomy actions (discount to zero, comp, block/drag) should be permission-gated vs logged-only?
- [ ] Standing bookings ("until December"): how should recurring series be created, edited, and ended?

## Suggested Next Steps

- [ ] Weekly Tuesday co-design sessions with Queenie (agreed in session); shadow live WhatsApp booking + squeeze/reschedule flows.
- [ ] Export + anonymize SOTA WhatsApp history to mine patterns; prioritize VIP / high-revenue / difficult conversations. Anonymize all client PII before ingest.
- [ ] Update **personas.md** Layla with the reschedule-loop, multi-channel duplicate, and consultation-gating insights; mark the Collection-backlog validation item as in progress.
- [ ] Update **product.md** roadmap consideration: duplicate detection + future-appointments view, service-driven multi-service sequencing, consultation-booking path, per-service deposit rules, staff-permission guardrails.
- [ ] Feed opportunities into `/prioritization-engine` for the AI Inbox scope.
- [ ] Refresh the Layla journey map (v2) using Queenie's real quotes, add a reschedule-loop stage.

---

## Raw Notes

Full transcript and structured summary in the source input: [ai-inbox-design-queenie-2026-07-28.md](work/discovery/inputs/ai-inbox-design-queenie-2026-07-28.md)
