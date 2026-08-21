# Product Context

**Last updated:** 2026-08-16

**Source:** Website + internal PRD via /welcome, enriched via /enhance-context (Tech Roadmap Aug-Dec 2026; Investment Committee update, 1 July 2026)

**Evidence level:** ✅ Metrics and roadmap now grounded in live investor and roadmap materials (July 2026). Feature detail partly from the pet v1 PRD, generalized for the multi-vertical framing.

---

## Overview

Cami is an AI-powered booking and operations platform built natively for WhatsApp. It manages appointments, automates client reminders, and processes payments for appointment-heavy service businesses, all inside the WhatsApp thread where the work already happens, so operators never switch between apps.

## What Cami Is

Cami is one platform an appointment-based service business runs on: a shared WhatsApp inbox, an AI Receptionist that books and takes deposits in-thread, a real-time multi-venue calendar, client and service records, automated reminders and campaigns, and an integrated payments layer (Cami Pay). WhatsApp-native AI scheduling leads acquisition; the operating system underneath prevents churn once scheduling, payments, reminders, and records all live in Cami.

## Architecture vs. Packaging

- **Horizontal CRM layer.** The WhatsApp inbox, client record, and follow-ups are horizontal by nature and serve every vertical unchanged.
- **Vertical OS layer.** Verticalization lives in the OS: service semantics, intake and consent, scheduling rules, and terminology.
- **Packaging, not products.** Cami-Pet and Cami-Business are go-to-market packaging, one platform with different GTM skins, not separate codebases.

## Core Features

- **Multi-venue calendar**: real-time grid across staff, venues, rooms, and equipment. Online booker holds a slot for 5 minutes.
- **WhatsApp unibox**: a single two-way inbox for every thread, assignable to staff with lead tagging. Appointment cards render inline in the thread.
- **AI Receptionist**: conversational scheduling that runs fully autonomously after hours and drafts responses for human approval during business hours. Core IP, not a phase-2 add.
- **WhatsApp-native reminders**: auto-confirm 24h before, 1h reminder with location pin, and no-show rebook follow-ups. High no-show reduction, so high payment-capture impact.
- **POS and invoicing**: offline and online checkout, unique link per invoice, VAT-compliant templates, deposits, split tender, and refunds. Receipt sent over WhatsApp in one tap.
- **Deposits and payment links**: per-booking deposit capture auto-reconciled into the client invoice.
- **Client and service records**: first-class client profiles plus individual and package/membership services with consumption tracking. Note: the current NeoPay setup does not store card, so card-on-file, recurring capture, and automatic no-show fees are not available yet.
- **Consent and intake forms**: digital capture e-signed over WhatsApp, stored on the relevant record. Templates configurable per business type (Cami ships defaults, business overrides).
- **Marketing campaigns**: segmented WhatsApp broadcasts from inside the OS with template approval, opt-outs, and campaign reporting. Drives rebookings.
- **Financial reports and permissions**: EOD revenue, revenue by service/staff, VAT owed, accountant export, plus role-based access (Staff / Reception / Manager / Owner) with read/write granularity. The module is **two report types**: (1) table-format CSV/Excel downloads locked to the Michelle/Linear designs, for finance/compliance tally; (2) analytics-dashboard views with flexible datapoints, Fresha-derived and being optimized from Sham + customer feedback. **Ship strategy (Maaz, Jul 2026):** speed first, ship 3-4 must-have CSV/Excel reports now (sales log detailed, payments log, tips collected), dashboards as v2. **Two audiences:** merchant-facing reports AND a CamiHQ cross-merchant BI view (a Periscope/Sisense-style Partner Dashboard, like Fresha's Account Manager portfolio view), architected on the same data pipeline from day one so internal reporting is not retrofitted. **Scope boundary:** POS + booking analytics, not full accounting. Cancellation fees, gift-card breakage, staff commissions, payroll, supplier POs, processing fees, and general opex (rent, utilities) are out of scope; opex lives in an accounting system (QuickBooks/Xero). Reporting architecture (event-grain fact tables + Redis cache, embedded per-tenant reporting split from cross-merchant BI) is in design, not finalized as of Aug 2026.

## AI Capabilities (MVP)

- Conversational scheduling, autonomous after hours, drafted during business hours.
- Auto-suggestion for rescheduling.
- Next-visit recommendation based on service history.
- Consent form auto-population from profile.
- Campaign segmentation (for example, active in the last 60 days).

## Users

**Target audience:** Appointment-heavy service businesses in the UAE and GCC (beauty, spa, wellness, clinics, barbershops, fitness, pet, and other schedule-dense verticals). On the ground, the champion user is the receptionist or front-desk operator; the buyer is the owner. The end customer lives in WhatsApp and never has to leave it to book or pay.

## Key Metrics

Website product-outcome claims (to validate against live accounts): ~30% reduction in no-shows, ~12% increase in bookings, ~7 days to operational efficiency.

**Live business metrics (as of the July 2026 investor update):**

- Live since July 1, 2026; monetizing from month 1.
- **7 signed, 2 Tier-3 live** (17 Aug 2026 deck; the July figure was "4 operators onboarding, roughly $250K total monthly transaction value" across the cohort). ~30 pet operator meetings held.
- **SOTA runs at roughly 3x the Tier 2 GMV floor**, single operator, 30 staff, and is **waitlisted in the pipeline until key features are built** (17 Aug deck). The earlier investor figure (~2x the floor) is superseded.
- Take rates: 1.8 to 3% on card, 3 to 3.5% online (varies by operator; one Tier 1-scale operator at a 2.5% blend).
- Reforecast: 36 active businesses by end of year (up from 12), 12-month revenue $94.6K (up 17%), 12-month burn improved to $389K (from $411K).
- Assumptions revised down: average transaction value $50 (from $75), transactions per business 500 (from 600); WhatsApp and reminder monetization added.

## Current Roadmap Priorities

**Commercial model (v1):** Cami Pay mandatory for in-platform appointment checkout; payment aggressiveness Medium (deposit to book, balance at completion). Automated reconciliation ships in v1. CamiPay runs on **NeoPay**, behind a provider abstraction (NI / NeoPay / Stripe) so more rails can be added later.

**Payments state (Jul 31 2026):** CamiPay ships in two parts. Online payment links are built and in testing (pre-QA), the go-live path. The card terminal (POS) is still in architecture, gated on NeoPay decisions (settlement, terminal-app design) and a NeoPay approval submission; Marlon reviews it for security and anti-theft. Terminal drives most volume (walk-in, less-digital customers), so online-first is interim. A sale/void/refund glossary (pending Sham and Maz sign-off) is the source of truth for checkout states; voucher tax logic: no tax at issuance, tax at redemption.

**Settlement state (31 Jul 2026 meeting, added 2026-08-16):** custody is **split by rail**. Online money settles same-day from NeoPay into **Crescent Enterprise** (Cami's designated account, D+1), and Crescent then pays each merchant **manually**; merchants receive money roughly 5 days later or weekly. **Terminal money comes from NeoPay directly to the merchant.** The Crescent manual payout is explicitly an **interim solution to protect launch timing** and needs to change. GNK is building the payment log; the reconciliation loop must let the financier see payout per merchant ID and date, and let Cami billing confirm the merchant was paid. **Next payment provider is Noon** (~3 to 4 weeks, easier than CCAvenue); do not change the current online path meanwhile. Open: how Cami collects its take on terminal, since Cami never holds that money. See [merchant settlement PRD](../work/specs/prd/prd-merchant-settlement-2026-08-16.md).

**Reminders state:** SMS (Twilio) + email today; WhatsApp reminders gated on META. UAE SMS needs business verification (in progress). Policy: reminders are status-update only, no URLs (spoof risk); managed links come later. Open: per-merchant sender IDs vs Cami-as-sender, and the 160-character limit.

**WhatsApp Unibox and two-way conversational comms (plus the AI Receptionist) land across August to September (v0.2)**, gated on META verification, not a build gap.

**META state (Maaz, 8 Aug 2026):** Cami's **WABA is no longer restricted** and shows active in Business Manager. That is progress, but it resets the clock: Cami is **back to step 1 of a three-stage chain, Business Verification → WhatsApp Verification → Tech Provider verification**. Maaz is working two META contacts to try to get META verification first. The August "Unibox live" date in goals.md is not credible against a freshly restarted three-stage chain.

**Coexistence (proposed bridge, not decided).** Coexistence lets the ordinary WhatsApp Business **phone app** and the **Cloud API** share one number with two-way chat sync. The phone-app side needs **no Business Manager verification**, so a UAE-based team member could run real customer conversations manually on the live number today, and flip Coexistence on when verification clears so the API inherits history instead of starting cold. **Limits:** ~20 messages/sec cap, manual or semi-manual only (no bulk automation at that tier), and some app features drop out. A bridge for continuity and history, not a scale path, and it does **not** unblock the AI Receptionist or Unibox automation (INV-C2 stands). Source: Maaz, #C0BMX71U5J8, 8 Aug 2026.

### Build roadmap (from Linear, Product team)

| Version | Scope | Window |
|---|---|---|
| v0 | Web OS, single branch | Apr to Jun 2026 (in progress) |
| v0.1 | Land first paying operator (SOTA) via CamiPay + WhatsApp reminders | Jun to Jul 2026 |
| v0.2 | Win the switch from Fresha: conversational WhatsApp + AI Receptionist | Aug to Sep 2026 |
| v0.3 | Premium tier, multi-branch (unlock Tier 1 chains) | Sep to Nov 2026 |
| v1 | General Availability (ungated, broad market) | Dec 2026 |

**Architecture tracks (Tech 9.x):** Agentic AI platform (orchestrator, tool registry, policy engine, RAG, evals, memory, audit), Core OS backend, WhatsApp/comms runtime, Payments and invoicing (Cami owns the commercial record, providers move money), Data sovereignty (multi-region; KSA gated on a Saudi-resident stack), Frontend (Next.js 16 persona model: Public / CamiHQ / Business / Staff), Infrastructure and delivery. **Hardening (H0.x):** canonical stack consolidation, pet-to-generic domain model, WhatsApp booking thin slice, delivery hardening (CI/CD, auth, secrets). Pilot bug and feature reports triage through a dedicated Pilot Feedback team (P0 to P3 SLAs, synthesized weekly into the backlog).

### Current plan (17 Aug 2026 priorities deck)

**Reconciled 2026-08-16** from three sources that disagreed: the 17 Aug PDF deck, a **newer roadmap image** (supersedes the PDF on bucket placement), and Michelle's decision to date multi-location. Where they conflicted, the resolution is noted in the row.

| Bucket | Items |
|---|---|
| **Completed** | Calendar Scheduling · Online Bookings · Inventory · Team Controls · Invoicing · Clients & Pets · Catalog · Auto-Reminders |
| **August** | CamiPay Online · CamiPay POS Terminal · **CamiPay Settlements** · Reporting · Cami-HQ Rate Card · **Agentic AI Platform** |
| **September** | **Boarding Calendar** · **Migration** · **Inbox, CRM** · Smart Marketing · **Two-Way Intelligence** · **AI Reporting** |
| **Q4 (v0.3, Sep to Nov)** | **Multi-Location** → Tier 1 go-live Q4 |
| **Later** | Group Bookings · Loyalty/Memberships · Custom Branding · Custom Mobile App · Finance Integration · Vet Workflows · GA tracking · CamiPay EU/APAC |

Deck annotations: Multi-Location "unlocks Tier 1 operators"; Boarding Calendar "unlocks T2 pet boarding operators, **6 in the pipeline**"; Smart Marketing is loyalty-based marketing and the MOAT feature.

**Three conflicts and how each resolved:**

| Conflict | PDF said | Newer image said | Resolution |
|---|---|---|---|
| **Multi-Location** | Later, undated | September | **Q4 (v0.3, Sep to Nov), Tier 1 go-live Q4.** Michelle's call, 2026-08-16. Matches the [multi-location PRD](../work/specs/prd/prd-multi-location-2026-08-16.md) and the version track. Now **OBJ-P6** |
| **Boarding Calendar, Migration** | Later | September | **September**, per the newer image. Boarding is the only item with named demand (6 operators); Migration makes leaving Fresha frictionless |
| **MOAT (Agentic AI, Two-Way Intelligence, AI Reporting)** | Aug / Sept | Later | **Holds Aug / Sept** (Michelle, 2026-08-16). The META gate is on *shipping*, not on *building* (INV-C2), so the substrate is built ahead of the gate and switched on when the chain clears |

> ⚠️ **Open after reconciliation.** (1) **Inbox, CRM** moved out of Completed into September; the deck showing it Completed has been used externally, so the reason needs to be ready. (2) **Dynamic Pricing** was in the PDF's September and is absent from the newer image; confirm dropped or just unlisted. It traces to no objective, persona job, or decision record either way. (3) **Self-serve onboarding (OBJ-P3), v1 GA (December), and KSA data sovereignty** are in the version track and on neither roadmap. See [roadmap-changes-2026-08-16](../work/strategy/outputs/roadmap-changes-2026-08-16.md) and the [initiative register](../nodes/initiatives.md).

> **ADR-009 needs superseding.** Its trigger was "post-SOTA", and SOTA is waitlisted, so the trigger cannot fire. The trigger is now v0.3. **INV-B4 lifts on v0.3 ship, not before.**

**Post-SOTA priority: multi-location.** After the core OS is proven on SOTA, the named next priority is multi-location (multiple venues/addresses under one business entity; single-location today, Chaps & Co has 9). Multi-location, then group bookings, then boarding calendar, unlocks new categories (pilates, boarding, group-booking) and enterprise, and proves the scheduling engine generic across pet and non-pet.

**90-day plan (July activates the loop, August deepens the MOAT, Sept to Dec scales):**

| Phase | Focus |
|---|---|
| **July (live now)** | 3 operators live on MVP, NeoPay activated, SDR pipeline ramping, UAE pet + non-pet ads, data migration tooling in onboarding |
| **August** | WhatsApp Unibox live (once META unblocked), two-way comms, first Tier 2 win (SOTA Salon), in-house engineering onboarded, local commercial AE hired |
| **Sept to Dec** | Advanced MOAT integrations shipped in-house, 3 to 5 Tier 2 operators signed, non-pet verticals live (beauty, clinics, spas), A/B marketing to an inbound funnel, Cami 2.0 roadmap defined for Tier 1 |

**Roadmap swimlanes** split into two tracks: **Core OS** (calendar, invoicing, online bookings, inventory, team controls, catalog, clients/pets, CamiPay online + POS terminal) and **CRM & AI features (the MOAT)** (WhatsApp inbox/unibox, two-way intelligence, auto-reminders, smart marketing, AI reporting, agentic AI platform). Later/parked items: multi-location, new markets, custom branding, enterprise mobile app, accounting integration, group bookings, boarding calendar, loyalty/memberships, vet workflows, commissions, wages and tip bands, CamiPay ROW.

**Phase 2:** offline / storefront POS for walk-in and standalone retail; alternative gateways and wallets with per-transaction routing; full inventory deduction at POS (v1 tracks stock but does not deduct).
