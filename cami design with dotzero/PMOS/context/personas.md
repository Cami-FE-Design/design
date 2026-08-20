# User Personas

**Owner:** Michelle
**Last updated:** 2026-08-16
**Data Sources:** context/company.md, context/product.md, internal PRD (02-personas-jobs, thesis, lead-scoring study), sales video, website extraction. Internal personas: PRO-737 spec, CamiHQ JTBD and journey map (2026-08-16).

**Purpose:** Personas tell you who our users are. This page is for *feeling their day*, so engineers who have never stood at a Dubai grooming salon front desk make the right micro-decisions without asking.

**Evidence level:** ⚠️ Real anonymized material gets added as we collect it. Until then, the reconstructions below are faithful to interview evidence but illustrative. The owner-as-buyer / receptionist-as-champion dynamic and the volume numbers are validated (2026). Cross-vertical generalization beyond pet is inferred.

---

# Feel Their Day

## A day in the life: the Receptionist

7:45am. She unlocks the salon and opens the business WhatsApp. Fourteen messages arrived overnight, that's the 40% after-hours load, every one handled manually today. "Any slots this Saturday?" (sent 11:20pm). "Bella needs a nail trim plz!" (sent 6:50am). "Is Mike free to trim Yumi at 2pm?" A voice note in Arabic. One client confirming, three asking, one canceling.

She answers between walk-ins and the ringing phone. The paper diary is open next to the keyboard; Excel has the package balances; prices are in her head because the owner changes them seasonally. When she quotes a slot, she scrolls the thread to remember whether this is the doodle with the skin allergy or the one that bites. If she books it, she writes it in the diary, then forgets to send the deposit link because a walk-in arrived. That slot no-shows on Thursday. Nobody notices until end of month.

At 6pm she leaves. Messages keep arriving. Her job-to-be-done, verbatim from the PRD: "handle every client conversation without dropping any, even at 11pm." Today that is physically impossible. That impossibility is the product.

## What a real inbound thread looks like

Reconstructed from the sales video opening frame and interviews. This is the raw material the AI Receptionist and Unibox must handle:

- "Can I book a grooming appt?" (no pet name, no service, no time)
- "Is Mike free to trim Yumi at 2pm?" (staff-specific request, pet-to-professional affinity in action)
- "Bella needs a nail trim plz!" (which Bella? multi-pet household)
- "Any slots this Saturday?" (sent 11pm Tuesday)
- "Can I bring 2 dogs?" (parallel booking, multi-pet)
- "Is there a waitlist?" (demand exists, system doesn't)

Note what's absent: nobody asks for an app. Nobody fills a form. The thread IS the interface.

## The numbers behind the feeling

- 70% of booking inquiries arrive on WhatsApp; 40% of those after hours (lead-scoring study, ~1,000 UAE pet businesses, Mar 2026)
- 15 to 25% no-show rate is industry standard in the UAE; roughly AED 22,500/month leaks from a 20-appointment business
- 30 to 40% of the wedge still runs on paper diaries, Excel, and loose WhatsApp threads
- Pet Parents rarely switch groomers once paired; the pet, not the parent, carries that relationship

## Why the Owner buys (and why the pitch describes her day)

The Owner (2 to 5 locations) rarely touches the front desk, but he experiences her chaos as dropped bookings, unhappy clients, and lost revenue. Validated 2026: Owners understand the Receptionist's pain directly and purchase to solve it. When you build an Owner-facing report, remember its emotional job: proving the chaos is gone.

## Watch and read

- Sales Video (transcribed), in Sources under the Cami PRD: the full end-to-end narrative, frame by frame. Ten minutes, best single artifact we have.
- 02 Personas and Jobs: the structured version of everything above.

## Collection backlog (make this page real)

| Item | Owner | Status |
|------|-------|--------|
| 3 to 5 anonymized real WhatsApp booking threads (screenshots, names/numbers redacted) | Maaz via pilot businesses; Michelle redacts | 🔴 |
| Pilot interview recordings or clips (Receptionist + Owner) | Michelle | 🔴 |
| Site visit photos: front desk, diary, the WhatsApp screen | Michelle / Maaz on next pilot visit | 🔴 |
| Sota clinic walkthrough notes (60% balance-at-clinic flow) | Michelle | 🔴 |
| Day-in-the-life validation: have one real Receptionist read the narrative above and correct it | Michelle | 🟡 In progress, Queenie (SOTA) session done Jul 28; still want her to read the narrative and correct it directly |
| **Observe 5 real payments** (3 online link, 2 terminal), including an OTP and a no-fast-click case | Michelle / Maaz at a pilot site | 🔴 Nothing exists. Noor is entirely unresearched |
| Sota clinic walkthrough / squeeze + reschedule flow observation (shadow live WhatsApp) | Michelle / Cami | 🟡 Weekly Tue co-design sessions agreed with Queenie |

---

# Customer Tiers

Cami's revenue is processing margin on payments captured through Cami Pay, so accounts are tiered by **monthly GMV** (and the Cami revenue that follows). Tier 3 is live; Tier 2 and Tier 1 come online as the product gates unlock. **Bands updated 2026-08-16 from the 17 Aug priorities deck (p15, p16, p17), superseding the July 2026 investor update bands.**

| | Tier 3 | Tier 2 | Tier 1 |
|---|---|---|---|
| **Shape** | 2 to 5 staff operators | Pet and non-pet multi-staff operators (10 to 30+ staff), real front desk | Multi-location group or chain |
| **Monthly GMV** | $10K to $99K | $100K to $249K | $250K+ |
| **Cami revenue** | $50 to $100 / partner | $100 to $300 | $500 to $3,000 |
| **Observable signal** | WhatsApp is the booking system, cash heavy | Has a receptionist, uses a spreadsheet or Fresha/SOTA | Has an ops manager, incumbent system, brand guidelines |
| **Users** | Owner, staff | Owner, front desk, staff | Ops lead, managers, front desk, staff |
| **Gate to win** | Current MVP; self-serve onboarding for low-CAC volume | WhatsApp + payments to onboard | Multi-location, self-serve migration, AI reporting, expense management, custom branding |
| **Anchor** | Pet Loft + Posh (Jul 1), Fetch (Jul 15), ~$35K combined GMV | SOTA (~$300K/mo, ~3x the Tier 2 GMV floor, 2.5% blend, churning from Fresha) | Chaps & Co |
| **Status** | Live now | ⚠️ **Waitlisted.** The 10 Aug go-live did not happen; SOTA is held "until key features built" (17 Aug deck p16). No dated anchor | Q4 2026 |

**Tier 4 (below Tier 3): $0 to $9K/mo, explicitly Non-ICP** in the commercial blueprint (deck p17). This is the [anti-persona](#anti-persona-the-solo-single-location-hobbyist) with a band attached, and the prospecting funnel disqualifies it.

**Tier heuristics:**
- Tier tracks captured volume, so moving an account up is the same motion as reducing payment leakage (keep the money on Cami rails).
- An account can have high booking volume but low *captured* volume if it steers clients to cash or off-platform rails. That gap is the signal to watch.
- The Users row maps directly to the personas below: Tier 3 has Owner + Staff, Tier 2 adds a real front desk (Receptionist), Tier 1 adds an ops lead and managers.
- **GMV sets the band, shape can override it.** SOTA runs ~$300K/mo, inside the Tier 1 GMV band, but the deck classes it **T2** because it is a single location with one operator and 30 staff. Tier 1 means multi-location group or chain, not just a bigger number. When GMV and shape disagree, shape wins, because the Tier 1 gate is multi-location, not volume.
- **Cross-check against the deck's segment map (p15, p16).** Pet Tier 1 is multi-chain vet operators (⚠️ conflicts with ADR-006, see goals.md open questions); pet Tier 2 is vet and pet boarding (gate: boarding calendar); pet Tier 3 is groomers. Non-pet Tier 1 is multi-chain operators needing a custom app; Tier 2 is salons, spas, and pilates needing group bookings; Tier 3 is barbershops with 5+ staff.

---

# Persona: Omar, the Owner (Buyer)

**Role:** Owner / operator of an appointment-based service business (often 2 to 5 locations)
**Segment:** Appointment-heavy service business, UAE/GCC
**Persona Type:** Buyer (Economic + Functional)

## Overview
Omar approves the spend on Cami but rarely touches it day to day. His operation runs on a patchwork of WhatsApp, paper diaries, Excel, and basic booking tools. He does not wake up wanting an operating system, he wakes up wanting WhatsApp under control.

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Omar | See which branch, staff, and service make money | Data scattered across tools and cash | Daily / EOD |
| Omar | Trust that no booking or payment slips through | Front desk runs on memory and WhatsApp threads | Continuous |
| Omar | Produce VAT-ready books without a scramble | Manual reconciliation across rails | Monthly |

## Jobs-to-be-Done

> **IDs are load-bearing (added 2026-08-16).** Format `JOB-<ROLE>-<STAGE>#`, scheme in [chain.md](../work/_templates/chain.md). BRDs and PRDs cite these. **Never renumber**, a renumber silently unlinks an initiative from its demand case. Local numbering in the discovery outputs ("Opportunity 12") stays there as a scoring rank; this page owns the ID.

| ID | Job | Evidence | Serves |
|----|-----|----------|--------|
| **JOB-OWN-KNOW1** | "When I check on the business, I want an end-of-day revenue view per branch, so I can see what is working without calling each location." | ✅ Validated | `multi-location` |
| **JOB-OWN-KNOW2** | "When a client is unhappy about a dropped booking, I want to know it will not happen again, so I stop losing revenue to chaos." | ✅ Validated | — |
| **JOB-OWN-KNOW3** | **Month close.** "When I close the month, I want card payments, refunds, fees, and payouts to reconcile to my bank balance, so my accountant does not rebuild it from scratch." *(Opportunity 16. Needs a payouts line, which settlement owns.)* | ⚠️ Inferred | `reporting`, `merchant-settlement` |
| **JOB-OWN-KNOW4** | **Leakage visibility.** "When most of my money does not run on Cami, I want to see that gap, so a report that looks complete is not covering a fraction of my business." *(Opportunity 17, satisfaction 1 out of 10. The same query as `JOB-AMG-OPS2`, two audiences.)* | ⚠️ Inferred (EC-19) | `reporting` |
| **JOB-OWN-KNOW5** | **VAT legibility.** "When I hand a figure to the tax authority, I want VAT stated separately from the amount the customer paid, so a tip does not corrupt my return." *(Opportunity 18. Already law, and `RP-B2` is Broken.)* | ✅ Validated as law (INV-P9, INV-M5, 06 §4) | `reporting` |
| **JOB-OWN-PAY1** | **Float visibility.** "When money has come in but has not reached my bank yet, I want to see what is being held and exactly when it leaves, so I can plan cash flow without calling anyone." *(Opportunity 12. The daily-open job: he will look at this more often than any report.)* | ⚠️ Inferred | `merchant-settlement` |
| **JOB-OWN-PAY2** | **Fee legibility.** "When I read a fee, I want to feel it was disclosed rather than discovered, so I do not suspect I am being skimmed." *(Opportunity 10. On a free OS the fee is the entire commercial relationship.)* | ⚠️ Inferred | `merchant-settlement` |
| **JOB-OWN-PAY3** | **Payout-destination integrity.** "When my payout destination changes, I want it to be hard for anyone to redirect my money, including my own staff, so I am not exposed to a mistake or to fraud." *(Opportunity 11. A security job wearing a settings-screen costume. Sits next to EC-4, staff revenue-integrity risk.)* | ⚠️ Inferred | `merchant-settlement` |
| **JOB-OWN-SET1** | "When I open another location, I want it to stand up with its own hours, staff, and prices without re-entering the business, so growth is not a second onboarding." | ⚠️ Inferred | `multi-location` |
| **JOB-OWN-SET2** | "When someone works at one branch, I want them to reach only that branch's clients and money, so opening a second site does not widen who can see everything." | ⚠️ Inferred | `multi-location` |

**PAY1 to PAY3 (added 2026-08-16), the payments-led jobs.** A booking-tool persona does not have these. They appear the moment the platform holds the owner's money. Source: [jtbd-owner-2026-08-16](../work/discovery/outputs/jtbd-owner-2026-08-16.md). ⚠️ Read from a competitor's live money surfaces, **not from any owner's words**.

**SET1 and SET2 (added 2026-08-16), the multi-location jobs.** ⚠️ **Nobody has been asked.** Derived from the multi-location BRD's requirements, Chaps & Co's 9-location shape, and Fresha's multi-site model, then written back as jobs. They exist so the initiative is not building against a blank node 2, not because they are evidenced. **First chain-operator interview either confirms or kills them.**

✅ **Half-closed, 2026-08-20.** [Khalid, the Branch Manager](#persona-khalid-the-branch-manager) is now written, so multi-location's operational jobs have a persona to hang from and `JOB-MGR-*` exists. **SET1 and SET2 stay on Omar deliberately**, because opening a site and deciding who reaches what are owner acts. What moved to Khalid is running one site day to day. ⚠️ The **ops lead** is still unwritten, and is assumed to be Omar's delegate until a chain account says otherwise.

## Goals
- EOD revenue per branch, staff performance, VAT-ready reports
- Payment reconciliation he can trust
- WhatsApp booking chaos under control
- Know what is held versus already paid out, and when the next payout lands
- Understand what Cami costs him without reconstructing it from a bank statement

## Frustrations
- Dropped bookings, unhappy clients, lost revenue, felt through the front desk
- No visibility across branches
- Reconciling payments across cash, card, and transfer
- Cannot tell held money from paid-out money; a reconciliation that omits payouts does not tie to the bank
- Most of his money never touches the platform, so a report that looks complete covers a fraction of the business (EC-19)
- No VAT figure in the money view, on a VAT-registered entity (INV-P9)

## Behaviors
- **Triggers:** A revenue dip, a client complaint, month-end books
- **Workflow:** Reviews reports, approves spend, rarely in the day-to-day tool
- **Frequency:** Light daily glance, heavier at month-end

## Buying Process

| Stage | Behavior | Criteria | Influencers |
|-------|----------|----------|-------------|
| **Awareness** | Feels front-desk pain, sees ads describing his day | "Tired of juggling bookings?" resonates | Receptionist, peers |
| **Evaluation** | Weighs whether staff will actually adopt it | Ease for the receptionist, payment economics | Receptionist, manager |
| **Decision** | Signs up because OS is free and payments are the model | No SaaS floor, clear no-show protection | Owner (final) |
| **Implementation** | Wants fast onboarding, low support burden | ~7 days to operational efficiency | Manager, Cami onboarding |

## Evidence
- ✅ **Validated:** Owner-as-buyer, emotionally bought in, wants WhatsApp under control not an OS (interviews + sales meetings 2026)
- ⚠️ **Assumed:** Dynamic holds identically outside pet verticals
- ⚠️ **Inferred from competitor build decisions (2026-08-16):** the three payments-led jobs above come from reading a mature competitor's money surfaces on a live SOTA account, not from interviewing an owner. Job existence is high-confidence; the opportunity scores are a hypothesis. **No owner has been asked about any of them.**

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| Buys on the receptionist's pain, not features | Sell and onboard around front-desk relief |
| Needs cross-branch money visibility | EOD revenue, per-branch and per-staff reporting |
| An Owner-facing report's real job is emotional | Design reports to prove the chaos is gone. Never summarize the day away, keep the itemized feed under the number |
| Wants to see held money, not just earned money | A wallet surface: one balance, the payout rule in one sentence, a feed with daily subtotals |
| A money figure without a scope is a defect | Never a bare "balance" or "total". Amount due and taxable gross are different numbers whenever a tip exists (06 §4) |
| The fee is the commercial relationship | State the take rate in-product and attach every fee line to its appointment |
| Payout destination is the fraud surface | Gate the change: real friction for the owner, review step for HQ |
| Reconciliation must tie to the bank | Include a payouts line and a VAT figure, or the month cannot be closed (INV-P9) |

---

# Persona: Layla, the Receptionist (Champion User)

**Role:** Front-desk operator handling WhatsApp, phone, and walk-ins
**Segment:** Single branch, often the only person on the desk during a shift (Tier 2+)
**Persona Type:** User (Champion)

## Overview
Layla is the front line. She handles every inbound conversation, reschedules by memory, takes payment, and answers questions, often solo. Her job gets dramatically better with the AI Receptionist, the unibox, and auto-reminders. If she does not adopt Cami, the owner's spend evaporates. Her full day is in *Feel Their Day* above.

**Validated by a real operator (Queenie, SOTA front desk, Jul 2026).** The single biggest correction: her core job is managing *change*, not first-time booking. Reschedules, duplicate-catching, and squeeze requests dominate her conversation volume ("rescheduling shifting is mostly happening"). She also fields bookings across multiple channels (WhatsApp, Instagram handled by a separate person, and clients going direct to the stylist), which is where double-bookings are born. See [interview-snapshot-queenie](../work/discovery/outputs/interview-snapshot-queenie-2026-08-02.md).

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Layla | Handle every client conversation without dropping any | WhatsApp threads never stop, even at 11pm | Continuous |
| Layla | Reschedule and reshuffle staff/slots to fit clients | Manual chain: message client, wait, move, then walk upstairs to tell the stylist | Most of her day (dominant workload) |
| Layla | Catch duplicate bookings before they clash | Same client books across WhatsApp, Instagram, and direct-to-stylist without saying so | Many times |
| Layla | Quote and route consultation-gated services | Extensions and hair color have no fixed price, so she pads a range and pushes a consult | Daily |
| Layla | Close out an appointment and get paid | Payment friction, cash leakage | Every appointment |

## Jobs-to-be-Done

> **IDs minted 2026-08-16.** Format `JOB-RCP-<STAGE>#`, scheme in [chain.md](../work/_templates/chain.md). Full scoring and the AI-scoping finding live in [jtbd-receptionist](../work/discovery/outputs/jtbd-receptionist-2026-08-16.md); this page owns the ID. **Never renumber.**

| ID | Job | Evidence | Serves |
|----|-----|----------|--------|
| **JOB-RCP-BOOK1** | "Handle every client conversation without dropping any, even at 11pm." *(verbatim, PRD. Opportunity 18, the highest on the board and physically impossible today.)* | ✅ Validated | `agentic-ai-platform` |
| **JOB-RCP-BOOK2** | "When a client wants to move an appointment, I want to rebook in the thread and notify both the client and the stylist, so I do not lose the slot or the booking." *(Opportunity 17. The dominant workload.)* | ✅ Validated (Queenie) | `agentic-ai-platform` |
| **JOB-RCP-BOOK3** | "When someone books, I want to know if they already have an appointment, so I do not double-book them." *(Opportunity 16.)* | ✅ Validated (Queenie: "happens a lot, many times") | `agentic-ai-platform` |
| **JOB-RCP-BOOK4** | "When a valuable client asks last-minute, I want to squeeze them in by reshuffling or asking staff to extend, so I never say no." *(Verbatim intent: "I don't want to say no, so I always ask them, what could you do, could you stay.")* | ✅ Validated | — |
| **JOB-RCP-BOOK5** | "When a service has no fixed price, I want to route the client to a consultation, so I do not over-promise a price." | ✅ Validated (Queenie) | — |
| **JOB-RCP-BOOK6** | "When I cover for a colleague, I want the thread they were working, so the client does not have to repeat themselves." *(EC-14. The retention argument for the Unibox that nobody makes.)* | ✅ Validated (Queenie) | `agentic-ai-platform` |
| **JOB-RCP-BOOK7** | "When a message arrives in Arabic or as a voice note, I want a usable reply path, so language is not the reason a booking is lost." | ⚠️ Inferred (EC-12) | `agentic-ai-platform` |
| **JOB-RCP-PAY1** | "When the visit ends, I want to take the money at the counter in one motion, so the next client is not waiting." | ⚠️ Inferred (ADR-014) | `camipay-terminal` |
| **JOB-RCP-PAY2** | "When I book, I want the deposit taken without me remembering to send anything, so an interruption does not become a no-show on Thursday." *(Opportunity 15. INV-B2 exists for exactly this.)* | ✅ Validated (EC-13) | `camipay-online` |
| **JOB-RCP-PAY3** | "When a deposit rule does not fit this client, I want a waiver I am allowed to use, so a VIP is not made to pay to hold a slot." *(Blocked: EC-3 does not say who authorizes it.)* | ✅ Validated (Queenie) | — |
| **JOB-RCP-KNOW1** | "When I close the shift, I want the day's take to match what is in the drawer and on the machine, so I can hand over without a discrepancy to explain." | 🔴 **Unknown. No source at all** | `reporting` |

🔴 **KNOW1 is the one row here with no evidence behind it.** It exists because Reception's permitted depth in reports is an open decision that cannot be answered without it. Ask Queenie before building against it.

## Goals
- Never drop a client conversation
- Reschedule and reshuffle fast without clashes or duplicates
- Maximize one client doing multiple services in one visit (cross-sell)
- Frictionless checkout

## Frustrations
- WhatsApp threads that never stop, across multiple channels (WhatsApp, Instagram, direct-to-stylist)
- Rescheduling by memory, prices held in her head; staff do not reply fast on WhatsApp so she walks upstairs
- Duplicate bookings she has to catch by eye; covering staff lack the original conversation context on her day off
- Consultation-gated services (extensions, color) she cannot price or book cleanly
- Deposit rules that vary by service (hair/nails 25%, facials/makeup/SPMU 50%, VIPs often waived)
- Staff autonomy noise: stylists can book, discount to zero, comp friends, and block or "drag" time
- Forgetting the deposit link when a walk-in interrupts, then a Thursday no-show

## Behaviors
- **Triggers:** Every inbound message, walk-in, or phone call
- **Workflow:** Lives in the unibox and calendar, approves AI drafts during hours
- **Frequency:** Continuous through the shift

## Evidence
- ✅ **Validated:** Receptionist is the champion user; her adoption is load-bearing for retention (interviews + sales meetings 2026)
- ✅ **Validated (Jul 2026):** Day-in-the-life, reschedule-loop, and multi-channel duplicate patterns confirmed by Queenie, a real SOTA front-desk operator (beauty vertical)
- ⚠️ **Assumed:** Role shape and title are identical across non-pet verticals (front desk, coordinator, host); reschedule/duplicate/consult-gating patterns validated in beauty, not yet in pet, clinics, or fitness

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| Champion user, adoption drives retention | Optimize the unibox and AI drafts for her speed |
| Works solo and after hours | AI Receptionist autonomous after hours, drafts during hours |
| Forgets deposit link under interruption | Make deposit capture automatic on booking, not a separate step |
| Core job is managing change, not new bookings | Reschedule from the conversation, with client-notify + internal staff-notify built in |
| Duplicate bookings across channels | Duplicate detection + future-appointments view + alerts |
| Consultation-gated services cannot be booked clean | A "book consult / send range" path separate from fixed-price booking |
| Deposit rules vary by service, VIPs waived | Per-service deposit % rules with a VIP waiver |
| Staff can discount to zero and comp freely | Permission guardrails and logging on price/discount/comp actions |

---

# Persona: Sami, the Service Staff

**Role:** Executes the appointment (for example stylist, therapist, trainer, technician, groomer)
**Segment:** On the floor at a single location (present in all tiers)
**Persona Type:** User (Executor)

## Overview
Sami delivers the service. He needs today's schedule, the client and service notes that matter for the appointment, and a fast closeout. He does not handle pricing or reports and should not need to.

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Sami | Know today's schedule at a glance | Schedule changes not reflected where he works | Daily |
| Sami | See the client and service notes he needs | Allergies, history, preferences scattered or missing | Per appointment |
| Sami | Close out an appointment cleanly | Manual handoff to the front desk for payment | Per appointment |

## Jobs-to-be-Done
- "When I start my day, I want to see my schedule and my clients' notes, so I am prepared for each appointment."
- "When I finish a service, I want to close it out fast, so the next client is not waiting."

## Goals
- Clear daily schedule
- The client and service context needed to deliver well
- Fast, low-friction closeout

## Frustrations
- Schedule changes he learns about late
- Missing or scattered client notes (is this the doodle with the allergy or the one that bites?)
- Payment and closeout friction that eats into service time

## Behaviors
- **Triggers:** Start of shift, each appointment
- **Workflow:** Checks today's schedule and notes, delivers, closes out
- **Frequency:** Continuous through the shift

## Evidence
- ✅ **Validated:** Service staff execute appointments and are scoped out of pricing/exports (PRD role model)
- ⚠️ **Assumed:** Note and closeout needs generalize across verticals; some clinical/consent depth is vertical-specific

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| High-frequency, narrow scope | Bundle staff surfaces into primary flows, not standalone tools |
| Needs context, not admin | Surface client/service notes; hide pricing and reports |
| Delivers, then hands off | One-tap closeout that flows to checkout |

---

# Persona: Khalid, the Branch Manager

**Role:** Runs one site day to day, and is accountable for its numbers
**Segment:** Tier 1 chains, and Tier 2 operators the moment they open a second site
**Persona Type:** User (Operator)

> ⚠️ **Written 2026-08-20 because multi-location had no persona to hang from.** Tier 1's user list has named an ops lead and branch managers since the tier table was written, and neither had an entry, so the multi-location jobs were parked on Omar. **Nobody in this role has been interviewed.** Every job below is derived from the multi-location requirements register, Omar's delegation gap, and Layla's day one level down. Treat each as a question to ask a real manager, not a finding. Pronouns they/them until a real person is described.

## Overview

Khalid is the missing middle. Omar owns the business and looks at it weekly; Layla owns the desk and looks at the next hour. Khalid owns **one branch, continuously**, which is a scope Cami does not currently have a concept for. They hire and roster for their site, cover the desk when it is short, answer to Omar for the branch's take, and are the person another branch calls.

Their defining constraint is **bounded scope**: they need real depth inside one site and nothing outside it. That is not a permission preference, it is the shape of the job. A manager who can read every branch's takings is an owner with a different title, and a manager who can only read their own is what the org chart actually says.

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Khalid | Close the day at my branch and hand over clean | No per-branch take. The day's number is business-wide or nothing | Daily |
| Khalid | Roster my site for the week | Staff are business-wide, so an assignment is not scoped to a site | Weekly |
| Khalid | Cover a second site without losing my place | No location context, so no switching, so no filters to lose | While covering |
| Khalid | Answer "can your branch take this client" | No visibility into what a sister branch has free | Several times a week |
| Khalid | Price for my site's demand without forking the menu | Catalog is business-wide, all or nothing | Occasional, high stakes |

## Jobs-to-be-Done

> **IDs minted 2026-08-20.** Format `JOB-MGR-<STAGE>#`, scheme in [chain.md](../work/_templates/chain.md), role code `MGR` added at the same time. **Never renumber.**

| ID | Job | Evidence | Serves |
|----|-----|----------|--------|
| **JOB-MGR-KNOW1** | "When I close the day at my branch, I want my branch's take and what it is made of, so I can hand over without a discrepancy to explain." *(The same shape as `JOB-RCP-KNOW1`, one level up and with accountability attached.)* | ⚠️ Inferred from R09, R18 | `multi-location`, `reporting` |
| **JOB-MGR-SET1** | "When I roster my site for the week, I want to assign the people who work here without touching another branch's roster." | ⚠️ Inferred from R05 | `multi-location` |
| **JOB-MGR-WORK1** | "When I cover a second site, I want to switch to it and back without losing the filters and dates I was working in." *(The switcher job. R03 is the surface every other requirement is read through, and it has no use-case ID today.)* | ⚠️ Inferred from R03 | `multi-location` |
| **JOB-MGR-BOOK1** | "When my branch cannot take a client, I want to know whether a sister branch can, so the business keeps the booking instead of the branch losing it." | ⚠️ Assumed. **This is the job that makes R13's open field set concrete** | `multi-location` |
| **JOB-MGR-SET2** | "When my site's demand differs, I want my own price or duration for a service without forking the menu." | ⚠️ Inferred from R06 | `multi-location` |
| **JOB-MGR-KNOW2** | "When Omar compares my branch to another, I want the comparison computed the same way for both, so I am not defending a reporting artifact." | 🔴 **Unknown. No source at all** | `reporting` |

🔴 **KNOW2 has no evidence behind it whatsoever.** It exists because cross-branch comparison is what a roll-up is *for*, and being measured by it is a manager's experience of the feature, not an owner's. Ask before designing against it.

## Goals

- The branch's day closes clean, and the number is defensible
- The right people, at the right site, this week
- Depth inside one branch, and no exposure outside it
- Enough sight of the wider business to keep a booking that their site cannot serve

## Frustrations

- No per-branch number, so "how did we do" is answered by feel or by a spreadsheet
- Staff, catalog, and money are all business-wide, so nothing they manage is actually theirs
- Covering a second site means holding two contexts in their head
- Being compared to another branch on a basis they cannot see

## Behaviors

- **Triggers:** shift start, shift close, a staffing gap, a client their site cannot take
- **Workflow:** lives in the calendar and the day's takings, drops into the desk when short-handed
- **Frequency:** continuous, in one place

## Evidence

- ✅ **Validated:** the role is named as a Tier 1 user in the tier table, and Chaps & Co's 9 locations imply it structurally
- ⚠️ **Inferred:** every job above except KNOW2, each derived from a multi-location requirement rather than from a person
- 🔴 **Unknown:** whether branch managers in this market hire, discount, or hold budget, which decides how much of Omar's permission set is really theirs
- 🔴 **Unknown:** whether one person managing two sites is common or rare. `JOB-MGR-WORK1` and the whole subset-scope design assume it happens

## Product Implications

| Insight | Design Implication |
|---------|-------------------|
| Bounded scope is the job, not a preference | Role × location as independent axes. Capability never widens scope, scope never widens capability |
| They are accountable for a number that does not exist yet | Per-branch take is the first thing multi-location must produce, before any switcher |
| They cover more than one site | Scope is a set, not a single value, and a scope change must not destroy the view they were in |
| They need a sister branch's availability, not its money | This is exactly the open half of the cross-location client and calendar visibility question. Decide it as a manager's need, not as a privacy abstraction |
| They sit between two personas that already exist | Do not design them a separate product. They need Layla's surfaces with Omar's numbers, bounded to one site |

**Related:** [multi-location PRD](../work/specs/prd/prd-multi-location-2026-08-16.md), [multi-location BRD](../work/specs/brd/multi-location-brd.md) R03, R05, R06, R09, R13, R18.

**Still not written:** the **ops lead** named alongside branch managers in Tier 1's user list. Assumed for now to be Omar's delegate rather than a distinct persona. Confirm with the first chain account.

---

# Persona: Noor, the Payer (End Customer)

**Role:** The merchant's customer. Books, attends, and pays
**Segment:** Every vertical, every tier. Pays by WhatsApp link or at the counter
**Persona Type:** User (indirect), and the source of all revenue

> **Different class from the three above.** Omar, Layla, and Sami work *at* the business. Noor is the business's *customer*. They never chose Cami, mostly do not know Cami exists, and touch it for about ninety seconds. **They are the only persona whose friction costs a transaction rather than efficiency**, which on a processing-margin model makes them the persona closest to revenue.

> ⚠️ **Zero research.** No customer has been observed paying. Everything below is derived from Cami's own edge-case catalog and state machines, not from a person. Pronouns they/them until a real payer is described.

## Overview
Noor messages a business on WhatsApp, gets a slot, and is asked for a deposit. Later they pay a balance, usually at the counter. The WhatsApp part feels effortless. The payment part is where it can fall apart, and when it does they blame the business, not the platform.

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Noor | Pay a deposit to hold a slot | Asked for money before anything has happened, with no reason given | Per booking |
| Noor | Pay online in one tap | No fast-click means manual card entry (EC-26) | Per online payment |
| Noor | Get through a bank OTP | Unexplained, bank-branded, feels like a failure (EC-24) | Unpredictable |
| Noor | Know the payment worked | Silence between paying and confirmation (EC-23) | Every payment |
| Noor | Pay at the counter | Barely a problem. A person is there to fix anything | Per visit |
| Noor | Get money back | Gateway refunds not built (ADR-014) | Rare, high stakes |

## Jobs-to-be-Done

> **IDs minted 2026-08-16.** Format `JOB-CLI-<MOMENT>#`. Declared exception in [chain.md](../work/_templates/chain.md): Noor lives in one operator stage, so the group slot uses their own lifecycle (`BOOK` / `PAY` / `AFTER`) instead. Full scoring in [jtbd-payer](../work/discovery/outputs/jtbd-payer-2026-08-16.md); this page owns the ID. **Never renumber.**

| ID | Job | Evidence | Serves |
|----|-----|----------|--------|
| **JOB-CLI-BOOK1** | "When I am asked to pay before the service happens, I want to understand what the money is holding, so it does not feel like I am being distrusted." *(The first and least explained money moment.)* | ⚠️ Assumed | `camipay-online` |
| **JOB-CLI-BOOK2** | "When I cannot pay right now, I want the hold to survive long enough for me to come back, so asking a question does not cost me the slot." *(The 5-minute slot hold and the 12-hour link do not reconcile.)* | ⚠️ Inferred (INV-B1 vs INV-P12) | `camipay-online` |
| **JOB-CLI-PAY1** | "When I pay, I want it done in one tap with the method already on my phone, so I do not have to go find my card." *(Opportunity 17. **Gating launch on a belief**, EC-26.)* | ⚠️ Assumed, load-bearing | `camipay-online` |
| **JOB-CLI-PAY2** | "When I have paid, I want to know straight away that it worked, so I am not left wondering whether to pay again." *(Opportunity 16. Cheapest high-value fix on the board.)* | ⚠️ Inferred (EC-23) | `camipay-online` |
| **JOB-CLI-PAY3** | "When my bank interrupts with a code, I want to have been told it was coming, so it does not read as a failure." | ⚠️ Inferred (EC-24) | `camipay-online` |
| **JOB-CLI-PAY4** | "When I open a link that no longer works, I want to be told what to do next, so I do not conclude the business is broken." | ⚠️ Inferred (EC-20) | `camipay-online` |
| **JOB-CLI-PAY5** | "When I pay at the counter, I want it over in one tap on a machine I recognize, so I am not the reason a queue forms." | ⚠️ Assumed | `camipay-terminal` |
| **JOB-CLI-AFTER1** | "When I need proof I paid, I want to find the receipt in the thread I already use, so I am not searching an inbox." | ⚠️ Inferred (INV-C4) | — |
| **JOB-CLI-AFTER2** | "When something goes wrong with my money, I want to reach a person at the business, not a system." | ✅ Validated as product intent (ADR-018) | `camipay-online`, `camipay-terminal` |

**The asymmetry these jobs expose:** the online rail has **four** payer failure points (PAY1 to PAY4) and nobody to fix them. The terminal has **one**, with a person holding the machine. That is a payer-conversion argument for pulling the terminal forward, sitting alongside the merchant-cost argument, and both point the same way.

## Goals
- Book and pay without leaving the conversation
- One tap, familiar method
- Immediate certainty the payment landed
- A receipt they can find later

## Frustrations
- Manual card entry. **"No one adds a card by hand"** (EC-26, unvalidated but load-bearing)
- An OTP nobody warned them about
- Silence after paying
- An expired link that opens a blank page, which reads as the business being broken (EC-20)
- Leaving the WhatsApp thread for a provider-branded page that looks like neither Cami nor the business

## Behaviors
- **Triggers:** wants an appointment, or is standing at the counter after one
- **Workflow:** WhatsApp thread → link or terminal → back to the thread for the receipt
- **Frequency:** every booking and every visit, ninety seconds at a time
- **Channel:** WhatsApp first, always. Never an app

## Evidence
- ✅ **Validated:** the payment mechanics, states, and failure modes exist as described (03 §8, §9; 05 EC-20, EC-23, EC-24, EC-26)
- ⚠️ **Assumed:** every emotion, preference, and abandonment claim
- ⚠️ **Assumed and load-bearing:** EC-26's claim that manual card entry kills adoption. It is currently gating launch on no research
- 🔴 **Unknown:** actual drop-off by step. Nothing is instrumented

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| Their friction costs the transaction, not just time | Treat payer conversion as a revenue metric, not a UX nicety |
| Online has 4 failure points, terminal has 1 | The terminal converts better for the payer too, not only for the merchant. Supports pulling it forward |
| They blame the business for platform failures | Every failure screen protects the merchant's relationship, not Cami's |
| They leave the thread to pay | Strains INV-C4, which says they never have to. Needs a decision, not a silent exception |
| A person at the counter fixes any failure instantly | Online must replace that reassurance with speed and clear copy |
| The deposit is the first and least explained money moment | One sentence in-thread on what it holds and what happens if they cancel |

**Related:** [journey-map-payer](../work/discovery/outputs/journey-map-payer-2026-08-16.md).

---

# Internal Personas (CamiHQ)

> **Scope note.** Everything above this line is a **customer**. Everything below is a **Cami employee** using CamiHQ, the internal admin console (one of the four surfaces in the frontend persona model: Public / CamiHQ / Business / Staff). They are here because CamiHQ is a real product surface with real users who need designing for, and because the CamiHQ jobs are the mirror image of Omar's. Keep the two groups separate when reading: a customer persona justifies revenue, an internal persona justifies operating cost.

---

# Persona: Dana, the Account Manager (Internal)

**Role:** Owns a portfolio of Partner accounts from signed contract through operating life
**Segment:** CamiHQ, internal. Named in PRO-737 as one of two roles who touch the admin console, with Ops
**Persona Type:** User (Internal operator)

> ⚠️ **This persona is a hypothesis, not research.** No Account Manager has been interviewed. It is reconstructed from one shipped spec (PRO-737), the surfaces that are conspicuously absent around it, and the merchant-side jobs it must mirror. Treat every line as a question to ask a real AM, not a finding. Pronouns they/them until a real person is described.

## Overview
Dana is measured on captured volume, because Cami's revenue is processing margin (ADR-001) and an account that books heavily but captures little earns nothing. They configure a Partner's commercial terms in HQ, then spend most of their time trying to work out whether those terms are producing anything. The configuration half of their job is well supported. The operating half has almost no surface at all.

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| Dana | Take a signed Partner live on CamiPay | No settle-readiness definition; KYC and payout accounts live outside HQ | Per new account |
| Dana | Renegotiate a rate without re-pricing history | Solved (PRO-737), and the model to copy elsewhere | Occasional, high stakes |
| Dana | Know whether an account is actually capturing | No revenue view, no captured-vs-booked flag | Continuous, unmet |
| Dana | Answer "where is my payout" | No payout run; asks engineering or waits for the Partner to complain | Weekly ⚠️ |
| Dana | Decide which account in the portfolio needs them this week | No portfolio ranking | Weekly ⚠️ |

## Jobs-to-be-Done

> Dana's stage axis is **account phase**, not operator stage (`ONB` onboard · `OPS` operate · `NEG` negotiate · `RES` resolve). Declared exception in [chain.md](../work/_templates/chain.md): internal personas live in one operator stage, so the group slot uses their own lifecycle instead.

| ID | Job | Evidence | Serves |
|----|-----|----------|--------|
| **JOB-AMG-OPS1** | "When I open a Partner, I want to see what Cami earns from them and whether it is growing, so I know if the account is working." | ⚠️ Assumed | — |
| **JOB-AMG-OPS2** | "When a Partner's captured volume falls far below their booking volume, I want to be told, so I can go win the balance back onto our rails." | ⚠️ Assumed | — |
| **JOB-AMG-NEG1** | "When I renegotiate a rate, I want it to apply forward only, so I never re-price what a Partner has already been billed." | ✅ Validated (Maz verbatim, PRO-737) | — |
| **JOB-AMG-RES1** | "When a Partner asks where their payout is, I want to answer from one screen instead of asking engineering." | ⚠️ Assumed | `merchant-settlement` |
| **JOB-AMG-ONB1** | "When a signed Partner is about to take money, I want to know they are settle-ready before the first payout is due, so the relationship is not lost on the first transfer." | ⚠️ Assumed | `merchant-settlement` |

⚠️ **No Account Manager has been interviewed.** Every row above except NEG1 is reconstructed from PRO-737 and from the surfaces that are conspicuously absent around it. The IDs make them citable, not true.

## Goals
- Captured volume up, per account and across the portfolio
- Every account settle-ready before money is expected to move
- Commercial terms recorded accurately and attributably
- No surprises the Partner discovers first

## Frustrations
- The account goes quiet after setup. Configuration is supported; operation is not
- Cannot see a Partner's transactions, though the Partner can see them
- The first payout, the moment the relationship is won or lost, is invisible from HQ
- Rail and gateway toggles are not attributed, so there is no record of who turned money on (INV-08 gap, PRO-737)
- Nothing flags the captured-vs-booked gap, which is the one number the job is measured on (EC-19)

## Behaviors
- **Triggers:** new signed account, a rate renegotiation, a Partner complaint
- **Workflow:** configure in HQ (supported), then monitor by asking people (unsupported)
- **Frequency:** bursty at onboarding, then thin and reactive

## Evidence
- ✅ **Validated:** The role exists and touches HQ. PRO-737 names Account Managers and ops as the only users of the admin console
- ✅ **Validated:** Rate changes are forward-only and date-locked, per Maz verbatim in PRO-737
- ⚠️ **Assumed:** Every goal, frustration, emotion, and frequency above
- ⚠️ **Assumed:** That onboarding and account management are one role rather than a handoff. If they split, most surfaces below serve two different people
- ⚠️ **Assumed:** That stages with no HQ surface happen in spreadsheets and Slack. They may have tooling nobody documented

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| Measured on captured volume | Surface captured-vs-booked per Partner; it is the job's core metric (EC-19) |
| Configuration is solved, operation is not | Invest in the operating life of an account, not more setup screens |
| First payout is the moment of truth | Payout run view: who is due, how much, cleared or failed, why |
| Rate change moves money | PRO-737's shape is the model: append-only, forward-only, backdating blocked, own permission |
| Commercial and operational acts differ | Keep `rates.edit` separate from `rails.edit`; the same person does not necessarily do both |
| Sees a Partner's money | Reads the rate stored on each transaction, never recomputed from the current card |

**Related:** [jtbd-camihq](../work/discovery/outputs/jtbd-camihq-2026-08-16.md), [journey-map-account-manager](../work/discovery/outputs/journey-map-account-manager-2026-08-16.md), `docs/specs/PRO-737-cami-hq-camipay-config.md`.

**Not yet written:** **Ops/Support** (payout failures, verification queue) and **Cami Finance** (float liability, revenue recognition, month close) are named in the CamiHQ JTBD with jobs scoring 17 to 19. They are distinct from Dana and should get their own entries once someone has spoken to them.

---

# Anti-Persona: The Solo Single-Location Hobbyist

**Who:** A solo operator with one location and low online-booking demand, or pure retail with no appointment density (below Tier 3).
**Why Not:** Cami's value compounds with booking volume, multi-branch coordination, and payment capture. A hobbyist with a handful of walk-ins does not feel the day-0 WhatsApp pain sharply enough to adopt, and the captured volume does not clear the processing-margin model.
**Risk if We Target Them:** Low activation, low payment volume, and support cost that outweighs the thin capture.

# Non-Target (for now): Clinical Vets

**Who:** Veterinary clinics wanting full clinical / practice management (patient records, medical workflows, the ezyVet feature set).
**Why Not (now):** Cami does not have the clinical depth these accounts require, and competing head-on with ezyVet is not winnable today. Sales time spent building a vet pipeline is deprioritized. In the pet space, the Tier 2 target is **boarding businesses** (they need a boarding calendar, not a clinical system), not vets.
**Revisit When:** Cami has clinical/vet workflows and a reason to enter that fight.

---

## Persona Comparison (customers)
| Attribute | Omar (Owner) | Khalid (Branch Manager) | Layla (Receptionist) | Sami (Staff) | Noor (Payer) | Anti-Persona |
|-----------|--------------|--------------------------|----------------------|--------------|--------------|--------------|
| Works at the business | Yes | Yes | Yes | Yes | **No, is the customer** | N/A |
| Scope | The business | **One site, sometimes two** | One site | Their own day | Their own visit | N/A |
| Primary goal | Know what makes money | Close my branch clean | Drop no conversations | Deliver each appointment prepared | Pay in one tap and know it worked | Casual, occasional bookings |
| Key pain | No cross-branch visibility | **Nothing they manage is scoped to them** | Endless WhatsApp threads | Late schedule changes, missing notes | Friction between "pay" and "paid" | Not enough volume to feel pain |
| Frequency | Light daily, heavy month-end | Continuous, in one place | Continuous | Continuous | ~90 seconds per booking and visit | Rare |
| Sees pricing/reports | Yes (full + billing) | Their branch only | Partial | No | Their own price only | N/A |
| Cost of their friction | Lost visibility | **Lost accountability** | Lost efficiency | Lost preparation | **A lost transaction** | N/A |
| Exists on Cami today | Yes | 🔴 **No.** Multi-location creates them | Yes | Yes | Yes | N/A |

Dana (Account Manager) is deliberately not in this table. They are internal, sit on the other side of the same money, and comparing them against customers on "sees pricing" is meaningless: they set it.

## Suggested Next Steps
- [ ] Work the Collection backlog above to replace reconstructions with real material
- [ ] Validate the cross-vertical generalization with interviews in beauty, wellness, and fitness
- [x] ~~Add a Manager persona if operational depth across branches is needed~~ **Written 2026-08-20 (Khalid).** Now the highest-value interview on the list: six jobs, zero of them from a person
- [ ] **Interview one branch manager and correct the Khalid entry.** Hire, discount, and budget authority are unknown, and they decide how much of Omar's permission set is really theirs
- [ ] Decide whether the **ops lead** is a distinct persona or Omar's delegate. Confirm with the first chain account
- [ ] **Watch five people pay.** Three online, two on a terminal. Noor is the persona closest to revenue and the only one with zero research. Half a day closes most of it
- [ ] **Instrument the online payment link** for drop-off by step (opened → method chosen → OTP → confirmed). Turns EC-26 from a belief into a number
- [ ] **Validate Omar's three payments-led jobs with a real owner.** They are inferred from a competitor's product decisions, not from anyone's words. Ask which money screens he opens and when
- [ ] **Interview one Account Manager and correct the Dana entry.** It is currently reconstructed from specs, not people. The spreadsheets they open are the real spec
- [ ] Add Ops/Support and Cami Finance as internal personas once interviewed
