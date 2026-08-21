# PRD: Multi-Location (Multi-Branch Under One Business)

**ID:** PRD-MULTI-LOCATION · **Owner:** Michelle You (Product) · **Date:** 2026-08-20 · **Status:** ⏳ Draft, solution review
**Serves objective:** OBJ-P6 (ship multi-location, v0.3 Sep to Nov 2026) → OBJ-B1 (land Tier 2, unlock Tier 1)
**Law cited:** INV-B4, INV-A1 to INV-A4, INV-01, INV-08, INV-10, INV-12, INV-13, INV-P3, INV-P4, INV-P9, INV-C1, INV-C2, INV-C4, ADR-001, ADR-009, ADR-025, 06 §2, §4, §7
**Use cases minted:** cites existing (`BV-*`, `TA-*`, `SA-*`, `SP-*`, `CAL-*`, `CL-*`, `PK-*`, `RC-*`, `RP-*`, `TX-*`, `HQ-*`). **Proposes** a location-context group for R03, which has none today. See Open question 11
**Related:** [BRD](../brd/multi-location-brd.md) (R01 to R25 register, 17 Aug, newer than the previous version of this PRD) · [slim BRD](../brd/multi-location-brd-slim.md) · [Fresha scoping](../../discovery/outputs/multi-location-scoping-fresha-2026-08-10.md) · [primer](../../strategy/multilocation-primer.md) · [merchant settlement PRD](../prd/prd-merchant-settlement-2026-08-20.md) · `docs/specs/cami-multi-location-decisions.md` · Faisal's architecture brief, 16 Aug · Linear PRD-43, PRO-71, PRO-159, PRO-557, PRO-784

> **Copy.** The canonical file is [`work/specs/prd/prd-multi-location-2026-08-16.md`](../prd/prd-multi-location-2026-08-16.md). Edit there, then mirror.

---

## TL;DR

1. **Location becomes the mandatory operating scope for time, money, inventory, and comms.** Identity, catalog definitions, and stored value stay business-shared. 25 requirements, ~12 modules, not a feature.
2. **Now, because Tier 1 has no other gate.** Chaps & Co is 9 locations and $250K+ monthly GMV. Multi-location is the only thing between that account and Cami rails, and OBJ-P6 dates it v0.3, Sep to Nov 2026.
3. **What could kill it: nobody knows what is built.** Three documents describe the spine differently, and every phase boundary depends on the answer. Second kill risk: nine WhatsApp number migrations are now the chain go-live gate, and no one has done one.

⚠️ **Evidence:** requirements are derived from the shipped spine, a system register, Fresha's model, and named-account demand. **No chain operator has been interviewed.** Enough to scope and to build the isolation layer. Not enough to claim the chain workflow is right.

🔴 **Three corrections to the 16 Aug version of this PRD**, all from the 17 Aug BRD. They changed what ships, not just the wording: multi-location is **not tier-gated**; per-location **tax identity ships in v0**, not v-next; and **payout grouping alone** flips on UK entry. Details in Decisions locked.

---

## Context

| What changed | When | So what |
|---|---|---|
| OBJ-P6 opened, dating multi-location v0.3 (Sep to Nov) with Tier 1 go-live Q4 | 2026-08-16 | The initiative has a goal-layer owner and a date. The 17 Aug deck's "Later" placement is superseded |
| SOTA waitlisted, so "post-SOTA" is no longer a date | 17 Aug deck | ADR-009's trigger cannot fire. The trigger is now v0.3 ship, and INV-B4 lifts then, not before |
| Tier bands reset: Tier 1 is $250K+ and means **multi-location shape**, not just volume | 2026-08-16, from the 17 Aug deck | Multi-location is definitionally the Tier 1 gate. SOTA at ~$300K is still Tier 2 because it is one site |
| BRD register grew 10 → 25 requirements and added the WhatsApp layer (R21, R22) | 2026-08-17 | The chain go-live gate moved from build to **onboarding**: nine number migrations, each with an OTP at that branch |
| Booking page reversal: a business page with a location picker, plus per-location direct URLs | 2026-08-17 | R15. The public front door is in scope, and entry order (location first or service first) is now a live design question |
| Tax identity resolved in the system register's favor | 2026-08-17 | Per-location tax identity is built from day one (R23), reducing the UK gate to payout grouping alone |

---

## Problem

A business running more than one site cannot run on Cami. One calendar, one team, one catalog, one till, one number.

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Omar (Owner)** | No per-branch end-of-day number, so he calls each location | Daily, and every month close | The buying reason itself. He buys cross-branch visibility and cannot get it |
| **Omar (Owner)** | Cannot stand up location 2 without re-entering the business | Once per opening, high stakes | Growth becomes a second onboarding, or an ops workaround |
| **Layla (Receptionist)** | Cannot move an appointment to another branch without losing the deposit | Reschedules dominate her day | She says no, or she does it manually and the money attribution breaks |
| **Layla (Receptionist)** | Cannot see that a client already has an appointment at another branch | "Happens a lot, many times" at one site, worse across N | Duplicate bookings multiply by branch count (EC-1) |
| **Khalid (Branch Manager)** | Accountable for a branch number that does not exist, and manages staff, catalog, and money that are all business-wide | Continuous, in one place | **Nothing they manage is scoped to them.** The role Cami has no concept of |
| **Khalid (Branch Manager)** | Covering a second site means holding two contexts in their head | While covering | No location context, so no switching |
| **Dana (Account Manager)** | Cannot onboard a chain from HQ; no location lifecycle surface | Per new chain account | The Tier 1 account's first week is an ops workaround |

**Four structural breaks:** time (staff scheduled at the wrong site, availability computed merchant-wide), money (no per-branch split, no per-branch VAT filing, INV-P9), compliance (one receipt sequence across two branches), visibility (no authorized roll-up).

⚠️ **Persona note.** [Khalid, the Branch Manager](../../../context/personas.md#persona-khalid-the-branch-manager) was written on 2026-08-20 because this initiative had no persona to hang its operational jobs from. **Six jobs, none of them from a person.** Every `JOB-MGR-*` below is derived from a requirement in the register, which is the reverse of how a job should be evidenced. One manager interview is the cheapest de-risking available and it is listed in the leading indicators. The **ops lead** named alongside them in Tier 1's user list is still unwritten, assumed to be Omar's delegate.

---

## Jobs served

| Job ID | Persona | Job (short) | Evidence | Source | This PRD advances it by |
|---|---|---|---|---|---|
| **JOB-OWN-KNOW1** | Omar | Per-branch EOD revenue without calling each location | ✅ Validated | `personas.md` | R09, R18: per-location money views with roll-up and drill-down, bounded by granted scope |
| **JOB-OWN-SET1** | Omar | A new location stands up with its own hours, staff, and prices, no second onboarding | ⚠️ Inferred, nobody asked | `personas.md` | R01, R02: full location lifecycle, all N in one setup pass, no data migration |
| **JOB-OWN-SET2** | Omar | Someone working at one branch reaches only that branch's clients and money | ⚠️ Inferred, nobody asked | `personas.md` | R04, R05, R14, R24: role × location scope enforced in queries, events, exports, and subscriptions |
| **JOB-RCP-BOOK2** | Layla | Rebook in the thread and notify client and staff, without losing the slot | ✅ Validated (Queenie) | `jtbd-receptionist` | R07: cross-location move with destination scope, availability, and policy checks, deposit attribution preserved |
| **JOB-RCP-BOOK3** | Layla | Know if the client already has an appointment, so I do not double-book | ✅ Validated (Queenie) | `jtbd-receptionist` | R13: one client across the business, visit existence readable at every location (EC-1 floor) |
| **JOB-OWN-KNOW3** | Omar | Month close reconciles to the bank | ⚠️ Inferred | `personas.md` | R23, R25: per-location tax identity, contiguous receipt sequence per location |
| **JOB-AMG-ONB1** | Dana | Know a signed partner is operable before money is expected to move | ⚠️ Assumed, no AM interviewed | `jtbd-camihq` | R02 in HQ: chain onboarding as an ops-driven pass. ⚠️ Surface undecided, Open question 7 |
| **JOB-MGR-KNOW1** | Khalid | Close the day at my branch and hand over without a discrepancy | ⚠️ Inferred from R09, R18 | `personas.md` | R09, R18: a per-branch take, bounded to the caller's scope |
| **JOB-MGR-SET1** | Khalid | Roster my site without touching another branch's roster | ⚠️ Inferred from R05 | `personas.md` | R05: staff identity business-wide, assignment and schedule per location |
| **JOB-MGR-WORK1** | Khalid | Switch to the site I am covering and back, without losing my filters and dates | ⚠️ Inferred from R03 | `personas.md` | R03: session location scope that survives a change. **This is the switcher, and it has no use-case ID** |
| **JOB-MGR-BOOK1** | Khalid | Know whether a sister branch can take a client my branch cannot | ⚠️ Assumed | `personas.md` | R13, R07. **This job is what makes Open question 8's field set concrete**: availability yes, another branch's money no |
| **JOB-MGR-SET2** | Khalid | Set my own price or duration without forking the menu | ⚠️ Inferred from R06 | `personas.md` | R06: per-field inherit and override |

⚠️ **Read the evidence column before the requirement column.** Two validated jobs (both Layla's), ten inferred or assumed. **Every `JOB-MGR-*` was derived from a requirement rather than from a person**, which is backwards, and is why one manager interview sits in the leading indicators. The strongest demand signal for this initiative is a **named account**, not a researched job.

---

## Applicability

| Axis | This PRD covers | Explicitly not | Why |
|---|---|---|---|
| **Business type** | Both with-pets and without-pets | | Chaps & Co is without-pets, the pet chains behind it are with-pets. Location is a business-shape axis, orthogonal to the pet flag |
| **Tier** | T1 primarily, T2 on its second site | T3, T4 | A single-location operator sees no switcher at all (R03). The feature must be invisible to them |
| **Location scope** | This PRD **creates** the axis. Per-location: time, money, inventory, comms, tax identity, stock. Business-shared: client and pet identity, staff identity, catalog definitions, stored value, marketing audiences | Cross-business, cross-brand, cross-legal-entity | One Business, one brand, many Locations. A second business is a second workspace |
| **Surface** | Business (switcher, calendar, catalog, money), Staff (per-location schedule), Public (business page + per-location URLs, R15), CamiHQ (chain onboarding, ⚠️ undecided) | | Four of four surfaces. That is the honest size of it |
| **Market** | UAE v0 | UK, KSA | UK flips payout grouping only (R11 conflict, below). KSA is gated on a Saudi-resident stack (INV-A3) regardless |

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| Chaps & Co is a named Tier 1 target, 9 locations, gated on multi-location | ✅ Validated | `personas.md`, `goals.md` |
| Tier 1 means multi-location **shape**, not only $250K+ GMV | ✅ Validated | 17 Aug priorities deck p15 to p17, via `personas.md` |
| Omar's per-branch EOD job is per-branch by construction | ✅ Validated | `personas.md` JOB-OWN-KNOW1 |
| Current backend falls back to a default venue when a workflow is unsure | ✅ Validated (eng) | Faisal architecture brief, 16 Aug. Public booking, Services, Authorization, Events/reporting marked **Gap**; Sales, Inventory, Staff **Partial** |
| Settlement granularity is market-driven: UAE per business, UK per location | ✅ Validated | Maaz |
| Fresha, Mindbody, and Moego all hold multi-site; Fresha runs a booking page per location | ✅ Validated | `competitors.md`, Fresha scoping doc |
| Branch numbers already exist and belong to the merchant | ✅ Decided, not evidenced | Michelle, 2026-08-17. No chain asked whether clients accept branch-specific numbers |
| Chains want shared client identity rather than per-branch privacy | ⚠️ Assumed | Reasonable for one brand. Chaps & Co not interviewed |
| Every revenue and adoption target in Success criteria | ⚠️ Assumed | No chain has onboarded, so no baseline exists |
| Operators accept losing a branch's chat history at number cut-over | ⚠️ Assumed | EC-45. Not tested with an operator |
| How long one number migration takes, and whether nine fit in an onboarding window | 🔴 Unknown | Nobody has done one |
| Whether a UK location can hold an independent tax registration | 🔴 Unknown | Tax and legal, per market |
| **What is actually built** | 🔴 **Contradiction** | BRD says the spine is partitioned (PRO-71, `branch_id` first-class). `cami-domain-model.md` and the glossary say "attribute, not partition". Faisal's brief (newest) says the aggregate exists but authorization, services, booking, and reporting are merchant-wide with a hidden fallback. **These cannot all be true.** Engineer's audit owns it, Open question 1, blocking |

---

## Decisions locked

### The seven architecture questions

| # | Question | Decision | Who, when |
|---|---|---|---|
| **1** | Settlement model | **Two layers.** Layer 1, per-location **ledger attribution**, constant in every market, always built, owned by this initiative. Layer 2, **payout grouping** (which bank account money lands in), a business-level setting defaulted by market, owned by [merchant settlement](../prd/prd-merchant-settlement-2026-08-20.md). UAE v0 is per business | Product + market, 16 Aug |
| **2** | Role, or role × location | **Role × location**, independent axes. Capability never widens scope, scope never widens capability (R04). Backend enforces; the switcher is context, not security | Already directed, domain model §2.5, INV-A1 |
| **3** | Timezone | **UTC storage, business default + per-location override** (R19). Appointment and reporting math use the location timezone. Reuse PRO-737's calendar-date handling, where the Dubai UTC+4 midnight bug is already solved | Already solved elsewhere |
| **4** | Local service inheritance | **Inherit, override, reset, per field** (R06). Location value resolves ahead of business value for **every** field including limits, per INV-13 nearest-wins. Reset is manual and per field. Resolved price and duration are snapshotted at book or sell | Michelle, 17 Aug, correcting a stricter-wins clause that contradicted INV-13 |
| **5** | Cross-location deposit accounting | **A consequence of Q1, not a separate choice.** The ledger retains both original-collection and final-fulfillment attribution (R17), in both markets. Neither record is rewritten after the sale completes | Consequence of Q1 |
| **6** | Packages and memberships scope | **Business-wide in v0** (R08). Stored value is business-scoped; consumption attributes to the fulfilling location. Per-location restriction is a later additive | Product, ⏳ **pending Maaz** |
| **7** | Receipt numbering and tax identity | **Business default with per-location override, built from day one** (R23): legal name, TRN, invoice address, receipt prefix and sequence, local tax defaults. Resolved values are copied onto the receipt at sale completion and never change after (INV-01, INV-12) | Michelle, 17 Aug |

### Corrections to the 16 Aug version of this PRD

| Was | Now | Why it matters |
|---|---|---|
| "Availability: Premium tier. Base tier stays single-location" | **Multi-location is not tier-gated** | A paid gate on locations is a subscription floor, which contradicts INV-P4 and ADR-001. Revenue is processing margin on the captured volume the extra locations bring, so gating them suppresses the model. PRD-43's title ("Capture the Premium Tier") is stale naming, not a pricing decision. ⚠️ Packaging remains Maaz's call, Open question 6 |
| "Shared tax identity in v0, per-location tax registration is v-next" | **Per-location tax identity ships in v0** (R23) | The system register was right. Receipt prefix and sequence, legal name, TRN, and invoice address are all per-location-overridable from day one |
| "Payout grouping and tax identity flip together on UK entry" | **Payout grouping alone flips** | Tax identity is built now, so the UK gate is one thing, not two |

### The v0 / v-next line

| Area | v0 (UAE) | v-next (UK entry) |
|---|---|---|
| Ledger attribution | Per location | Unchanged |
| **Payout grouping** | **Per business, one account** | **Per location, separate accounts.** The only flip |
| Tax identity | Business default + per-location override, per field | Unchanged (already built) |
| Permissions, timezone, service config | Role × location · UTC + override · inherit + per-field override | Unchanged |
| Stored value | Business-wide | Optional per-location restriction |
| Stock | Per location, business quantity derived | Cross-location transfer |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-A1 | Four roles with read/write granularity. R04 adds an orthogonal location axis, it does not redefine roles |
| INV-A2 | Service staff stay scoped out of pricing and reports at every location |
| INV-A3 | KSA stays gated on a Saudi-resident stack, independent of this work |
| INV-A4 | Any chain-wide analysis of client data is anonymized before ingest |
| INV-01 | Financial records are append-only, so location attribution recorded at the event never changes when the location set is edited (R09, R17) |
| INV-08 | Every location grant change, tax identity change, and cross-location move is attributable |
| INV-10 | A default beats a setting. Each location-overridable field declares its inheritance level before shipping |
| INV-12 | Config changes are forward-only. An issued receipt never changes when tax identity changes (R23) |
| INV-13 | Nearest-wins precedence. The location value resolves ahead of the business value for every field (R06) |
| INV-P3 | Provider abstraction must keep settlement destination resolution flexible, or per-location payout becomes a rewrite |
| INV-P4 | Free OS, no subscription floor. This is why multi-location is not tier-gated |
| INV-P9 | VAT-compliant invoices. Per-location receipt sequence and tax identity are compliance, not preference |
| INV-C1 | Reminders stay status-only, no URLs, when sent from a location's number |
| INV-C4 | The customer never leaves the thread. The per-location number must not force a channel switch |
| ADR-001 | Processing margin is the model, so suppressing captured volume to sell a tier is self-defeating |
| ADR-025 | Coexistence is per number, so a 9-branch chain on the bridge is 9 staffed inboxes |
| 06 §2, §4, §7 | The Composition Order does not change. Location is an attribution dimension on the objects, not a new step |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| **INV-B4** | "Single location per business entity at v1" 🕒 | Lifts **on v0.3 ship**, not on approval of this PRD | 🔴 ADR needed at ship |
| **ADR-009** | Multi-location deferred "to post-SOTA" ⏳ | Supersede. SOTA is waitlisted, so post-SOTA is not a date. The trigger is v0.3 | 🔴 ADR needed now |
| **EC-17** | SMS sender ID: per-merchant vs Cami-as-sender | Regrained: per-location vs per-merchant vs Cami | 🔴 Reopened, Michelle + Maaz |
| **New** | No rule on WhatsApp number-to-location binding | The number is per location, merchant-supplied, inbound resolves from the number with no fallback (R21, R22) | 🔴 ADR needed. Touches INV-C2 and INV-C4 |
| **New** | No rule on stored value across locations | Stored value is business-wide, consumption attributes to the fulfilling location (R08) | ⏳ Pending Maaz, then ADR |
| **GC-E9 / OPEN-09** | "Gift card redeemed at a different location" is Open | Resolved by R08: permitted, attributed to the fulfilling location | Lands in `05` on approval |

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Tier 1 chains signed | 0 | 1 (Chaps & Co, 9 locations) | Q4 2026 |
| Multi-location businesses live | 0 | 3 | End Q1 2027 |
| Captured GMV from multi-location accounts | 0 | $250K+/month from Tier 1 | 90 days post go-live |
| Cross-location data leakage incidents | n/a | **0. A hard gate, not a target** | Ongoing |
| Owner opens the all-branches roll-up | 🔴 no baseline | Weekly, per owner | 60 days post go-live |
| Receipt sequence defects at VAT filing | 0 today (one sequence) | 0 after per-location sequences | First filing after go-live |

**Leading** (pre-launch signals)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| A chain stands up all N locations in one setup pass | Internal dry run on Chaps & Co's real shape | 1 chain, zero ops workarounds |
| Locationless operational writes | Data-quality check (must be built first) | 0 in staging over 7 days |
| Cross-location read paths | Pen test against a single-branch manager account, including notifications, exports, and realtime | 0 paths |
| Time to answer "what did branch X take today" | Time it on SOTA today, then on the roll-up | Under 30 seconds, no phone call |
| Cross-location move preserves the deposit and both attributions | Test suite | 100% |
| **One branch manager interviewed**, and Khalid's six jobs corrected from it | 45-minute session at a multi-site operator | 1, before phase 2 design |
| **One WhatsApp number migrated end to end** | Time a real migration: OTP at branch, display name approval, 2FA PIN | 1 completed, duration recorded, **before a chain is sold a date** |
| Receipt sequence under concurrency | Load test, concurrent sales at one location | 0 gaps, 0 duplicates (R25) |

💡 **These are correctness gates, not adoption signals.** Multi-location fails silently, by writing to the wrong branch or leaking the wrong data, so the pre-launch bar is correctness rather than usage.

---

## Proposed solution

### How it works

One structural move: **location becomes a consistently authorized, persisted, and propagated operating dimension.** Not a filter, not a label, not a UI switcher.

| Plane | What lives here | Rule |
|---|---|---|
| **Business-shared** | Client and pet identity plus cross-location history, staff identity, service and product **definitions**, marketing audiences and templates, stored value | Shared identities are never copied because a second branch uses them |
| **Location-configured** | Profile, address, hours, timezone, staff assignments, service **offerings** (enabled, price, duration), booking page, WhatsApp number, tax identity, receipt sequence, tipping, inventory settings | Business default → location override, per field, with inherited vs overridden visible |
| **Location-operational** | Every appointment, sale, refund, tip, receipt, payment attribution, stock movement, conversation, event | Resolves to **exactly one** location, never none. A transfer may name source and destination, never neither |

**The memorable pattern:** money, inventory, time, and comms are **per location**. Identity and demand-gen are **shared**. Catalog is defined once, then configured per location.

**Six non-negotiables**

1. Operational writes require one **explicit** location. No default-venue fallback (R11).
2. The location must belong to the business **and** be granted to the actor (R04). The switcher is context, not security.
3. An all-branches query aggregates an **authorized location set**, never an unfiltered one (R18).
4. Price, duration, tax, and invoice values are **snapshotted** at book or sell time (R23, INV-12).
5. Archived locations keep all history and stay readable, and accept no new writes (R12).
6. Events, jobs, notifications, exports, and subscriptions carry location, because they have no request context (R14).

**The front door resolves differently per channel, on purpose.** Web: the customer picks a location from the business page, or arrives on a per-location URL (R15). WhatsApp: the location is inferred from the number the message arrived on (R21). Neither guesses, which is the same rule R11 states, satisfied two ways.

### User stories (the feature-level use cases)

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `RP-A1`, `RP-C1` | JOB-OWN-KNOW1 | Owner | An EOD view per branch and a business total in one place | I stop calling each location | The roll-up shows a **per-location breakdown side by side**, not a merged total (R09). A single number destroys the job | Report scoped to the caller's granted set |
| `TA-C1` + 🔴 proposed | JOB-OWN-SET2 | Branch manager granted only Marina | To run my branch's schedule, staff, and takings | Other branches stay private | Manually passing another location's identifier is **rejected** by the backend. No notification, subscription, export, or report leaks another branch. The switcher is hidden entirely for single-location users (R03, R14, R24) | Session scope = one location |
| `CAL-D1`, `SA-C1` | JOB-RCP-BOOK2 | Receptionist granted two branches | To move a client from Marina to JLT without losing the deposit | I never turn them away | Both branches authorized, destination service, staff, and slot revalidated, deposit retains **both** original-collection and final-fulfillment attribution (R07, R17), published to both calendars | Appointment at destination, sale records two locations |
| `SP-B1`, `SP-C1` | JOB-OWN-SET1 | Chain owner | Dog Wash defined once at AED 60 / 45 min, with my busy branch at AED 75 / 60 min | I can raise the default to AED 65 without touching the branch that deliberately differs | Per field: the busy branch inherits AED 65 and keeps its 60-minute override. UI shows which is which. Reset is manual (R06) | Location offering with mixed inherited and overridden fields |
| `BV-B1`, `BV-B2`, `HQ-C1` | JOB-OWN-SET1, JOB-AMG-ONB1 | Owner or Account Manager | To create all N locations in one setup pass, and add one later | Growth is not a second onboarding | No re-entry of business data, no operator data migration (R02) | N active locations under one business |
| 🔴 **propose** (R15 has no IDs) | JOB-OWN-KNOW1 | Client | To pick a branch from the business page, or open a branch link directly | I book at the site I actually go to | Both paths yield that location's offering and availability and bind the appointment to it (R15) | Appointment bound to the chosen location |
| 🔴 **propose** (R21 has no IDs) | JOB-RCP-BOOK2 | Client | To message the branch I visit, on its own number | I reach the people who know me | Inbound resolves its location from the number, never falls back to another branch's number (R21). An unassigned number takes no bookings, and never silently reroutes | Conversation attributed to one location |
| `CL-A1` + `RC-B1` | JOB-RCP-BOOK3 | Receptionist | To see that this client already has an appointment somewhere in the business | I do not double-book them | Date, location, and service of visits at any location are readable, with an identical field set for every location outside my scope (R13) | Duplicate caught before booking |

⚠️ **Two stories carry `🔴 propose` and R03 has no use-case IDs at all.** The location switcher is the surface every other requirement is read through, and it exists in no feature guide. Open question 11 decides where it is minted. **Mint before build, never during.**

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Every operator surface | Single location | **No switcher at all** | R03. A T3 operator must not pay attention to a concept they do not have |
| Every operator surface | Multi-location, scope = one | Active location named persistently, filters and date ranges survive a scope change | R03 |
| Every operator surface | Scope = subset or all | Roll-up with per-location breakdown, drill-down inside the granted set only | R09, R18 |
| Any create action | Scope = all | **Target location required before the write** | R11. All-locations is read-only for operational surfaces, Open question 3 |
| Catalog | Inherited vs overridden | Per-field state visible, reset per field is deliberate and manual | R06, INV-10 |
| Location settings | Tax identity | Business default shown, override per field, with a warning that issued receipts never change | R23, INV-12 |
| Location settings | No WhatsApp number assigned | Explicit "this location takes no WhatsApp bookings", never a silent fallback | R21 |
| Location lifecycle | Archived | History, receipts, reports, and issued stored value readable. No new writes. Never deleted | R12 |
| Staff with empty scope | No grants | No operational read or write. An empty scope is **not** all locations | R24 |

### Operational workflows

| Flow | Actors in order | Trigger | Handoff point | State machine | Manual step remaining |
|---|---|---|---|---|---|
| **Cross-location move** | Client → Reception A → system → Reception B → Staff B | Client asks to move branches | Destination revalidation, then both calendars publish | §1 Booking (Rescheduled), §2 Checkout (deposit stays applied) | Staff notify at the destination branch (EC-7, still manual at one site) |
| **Chain onboarding** | Commercial → Account Manager (HQ) → Owner → per-branch staff | Signed chain account | HQ creates N locations, owner configures each, staff get grants | none, this is lifecycle | ⚠️ Surface undecided (Open question 7). Nine number migrations sit inside this flow |
| **WhatsApp number migration, per branch** | Customer Success → branch staff (receives OTP) → META → Cami | Chain go-live | Number bound to one location | none | **Entirely manual, per number, and unsized.** OTP at that branch, display name approval, 2FA PIN, history lost unless Coexistence runs (EC-45) |
| **Client picks a branch** | Client → business page → location → availability | Public booking | Location bound at slot selection | §1 Booking (SlotHeld), §7 Slot hold | Entry order undecided: location first, or service first then only the locations offering it (Open question 12) |
| **Cross-branch reference** | Client → Reception A → Reception B | Client messages branch A about a branch B appointment | A sees the visit exists (R13), cannot read B's thread, cannot move without destination access | §1 Booking | **Accepted friction.** Reception A refers the client to branch B. The alternative is cross-branch thread reading |

---

## Money composition

The Composition Order does not change. Location is an **attribution dimension** on money objects, plus a per-location tax identity that feeds VAT.

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Line price, line discount, cart discount | Invoice, resolved from the **location** offering | 1, 2, 4, 5 | INV-13 nearest-wins, snapshotted at sell (R06) |
| Package redemption | Invoice. Entitlement is **business-shared**, consumption attributes to the fulfilling location | 3 | R08, INV-03, INV-07. Resolves GC-E9 / OPEN-09 |
| VAT derivation | Derived per line from the **location's** resolved tax identity | 6 | INV-M2, INV-P9, R23. VAT is derived, never appended |
| Taxable gross, tip, amount due | Unchanged. Both figures still reported separately | 7, 8, 9 | INV-M1, INV-M3, INV-M5 |
| Tender (card, cash, gift card, deposit) | Payment. Gift card balance is **business-wide**; the tender record carries the collecting location | 10 | INV-M4, INV-M8, R08 |
| Sale record | Carries **collection** location and **fulfillment** location where they differ | after 10 | R17, INV-01. Neither is rewritten after completion |
| Receipt | Location prefix and sequence, tax values copied at completion | after 10 | R23, R25, INV-12 |

**One new failure mode this creates:** a concurrent-sale gap or duplicate in a location's receipt sequence (R25). That is a VAT defect, not a display bug. It goes in the release criteria as a load test, not a unit test.

---

## Automation and messaging rules

| Trigger | Audience | Channel | Template | Opt-out honored | Quiet hours | Dedupe rule | Law |
|---|---|---|---|---|---|---|---|
| Appointment auto-confirm, 24h | Client | The **appointment's location** number | Existing reminder | Yes, business-wide (one client, one preference) | Existing policy, per location timezone (R19) | One per appointment, even after a cross-location move | INV-C1, R21 |
| 1h reminder | Client | Same location number | Existing reminder | Yes | Per location timezone | One per appointment | INV-C1 |
| **Cross-location move confirmation** | Client, and staff at both branches | Destination location number | 🔴 new, needs copy | Yes | Client message respects quiet hours, staff notify does not | One per move, not one per branch | R07, R14 |
| No-show rebook follow-up | Client | Location of the missed appointment | Existing | Yes | Per location timezone | One per no-show | INV-C1 |
| Campaign send | Audience segment, **business-shared** | Sending location's number | Existing | Yes, and an opt-out at one branch suppresses every branch | Per location timezone | One send per client per campaign, even if they match at two branches | R14, R22 |
| Any notification, export, or realtime subscription | Staff | In-product | n/a | n/a | n/a | **Never delivers a record outside the recipient's granted scope** | R14, R24 |

**Rules that fall out of this table:**

- **Cost attributes to the location** that sent or received; the business total is derived, never stored (R22). Whether the merchant is billed at all is comms pricing, is Maaz's, is open at one location already, and is **out of scope here**.
- **An opt-out is business-wide, not per branch.** One client, one preference. Anything else is the same client opting out three times.
- **A campaign that matches a client at two branches sends once.** Dedupe at the client, not the location.
- **EC-17 is reopened at a new grain:** SMS sender ID becomes per-location vs per-merchant vs Cami-as-sender. Sender ID registration is the one genuinely per-sender comms cost; WhatsApp bills per conversation, not per number.
- Nothing here lifts **INV-C2**. Per-location numbers multiply the registration tail, they do not shorten the three-stage verification chain.

---

## Permissions and roles

| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|
| Create, configure, archive a location | ✕ | ✕ | ✕ | ✅ | Yes |
| Grant or change a location scope | ✕ | ✕ | ✕ | ✅ | Yes, and it is the privilege-escalation surface |
| Switch active scope, within grants | ✅ | ✅ | ✅ | ✅ | No, it is a view |
| Read another location's money | ✕ | ✕ | Only if granted | ✅ | n/a, enforced by query |
| Move an appointment cross-location | ✕ | Both branches granted | Both branches granted | ✅ | Yes |
| Override a service field at a location | ✕ | ✕ | ✅ | ✅ | Yes |
| Edit a location's tax identity | ✕ | ✕ | ✕ | ✅ | Yes. It changes every future receipt |
| Assign or change a location's WhatsApp number | ✕ | ✕ | ✕ | ✅ | Yes. It is the front door |
| Run an all-branches report | ✕ | ✕ | Within grants | ✅ | n/a |

**Two rules that are not in the grid.** Capability never widens scope and scope never widens capability (R04): a manager granted all locations is still not an owner, and an owner with one grant still sees one branch. And an actor with **no** grant performs no operational read or write; empty never resolves to all (R24).

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| **EC-1** | Duplicate bookings across channels, now multiplied by branch | ✅ R13 gives the cross-location visit-existence floor duplicate detection needs | Full dedup UX stays with the AI platform |
| **EC-4** | Staff discount to zero, comp friends | ⚠️ Partly. R13's open half is exactly this: does branch A see what branch B charged? | ⏳ Maaz, Open question 8 |
| **EC-7** | Reschedule staff-notify chain is manual | ⚠️ Cross-location move notifies both branches, but the underlying manual gap persists | Comms |
| **EC-17** | SMS sender ID choice | ⚠️ Reopened at per-location grain | Michelle + Maaz |
| **EC-19** | Captured vs booked volume gap | ✅ Becomes readable per branch through R09 and R18 | Automated flag still unbuilt |
| **EC-29** | Staff overlap booking | ✅ Unchanged. INV-B7 applies per location, and the online booker still offers only non-conflicting slots | — |
| **EC-44** | Coexistence capacity | 🔴 Worsens: the bridge is per number, so 9 branches is 9 staffed inboxes. An argument against selling Tier 1 on the bridge | ADR-025 decision |
| **EC-45** | Thread history at cut-over | 🔴 Per branch, and worse the longer that branch has traded | Onboarding runbook |
| **GC-E9 / OPEN-09** | Gift card redeemed at a different location | ✅ **Resolved:** permitted, balance is business-wide, consumption attributes to the fulfilling location (R08) | Lands in `05` on approval |
| **PKG-E6** | Two packages covering one service, which draws first | ✕ Unchanged by location | Packages capability |
| 🔴 **new, propose** | A location is archived with future appointments and unsettled sales | 🔴 Undefined today. Disposition must be specified in the location lifecycle (R12, PRO-557) | Phase 1, Open question 10 |
| 🔴 **new, propose** | An operational write lands with no location | 🔴 The failure mode R11 exists to delete. Needs a data-quality check that can detect it | Phase 1 |
| 🔴 **new, propose** | Concurrent sales draw a gapped or duplicate receipt number at one location | 🔴 A VAT defect (R25) | Phase 3, load test |
| 🔴 **new, propose** | A branch's WhatsApp number is a manager's personal mobile, and they leave | 🔴 The business loses its front door. Onboarding check, not a build item | Onboarding runbook |

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `location_id` on every fact row | Event, at write | Every money and booking report | **New, and load-bearing.** If facts are not location-keyed at write, roll-up is a retrofit |
| Collection location + fulfillment location | Sale | Sales log, payments log, settlement reconciliation | New (R17) |
| Location tax identity snapshot | Receipt | VAT summary, per-location filing | New (R23) |
| Receipt prefix and sequence | Receipt | VAT summary, audit | New (R25) |
| Granted location set of the caller | Query time | Every report, as a bound | New (R18). A report must never exceed the caller's scope |
| Conversation and message cost | Conversation | Per-branch comms spend | New (R22) |
| Stock movement location | Movement | Inventory per branch, business quantity derived | New (R16) |
| Fiscal and timezone bucketing | Location | Every dated report | Existing shape, per-location resolution (R19) |

⚠️ **Raise this now, not after.** The reporting architecture is still open (`goals.md`), and reporting is shipping CSV-first under ADR-024. If location does not enter the fact tables from day one, both merchant reports and the CamiHQ cross-merchant view need rebuilding.

---

## Non-functional requirements

| Requirement (stated as an outcome) | Type | Applies to | Law cited |
|---|---|---|---|
| No user reads, receives, or exports a record outside their granted location scope, through any path including notifications, realtime subscriptions, and exports | security | Every surface | R14, R24, INV-A1 |
| No operational record exists without exactly one location, and the system can prove it | correctness | Every operational write | R11, R20 |
| An issued receipt never changes when configuration changes | compliance | Receipts, tax identity | INV-12, INV-P9, R23 |
| A location's receipt sequence is contiguous under concurrent sales, with no gap and no duplicate | compliance | Checkout | R25, INV-P9 |
| Every location grant change, tax identity change, and cross-location move is attributable to an actor with a timestamp | security | Settings, moves | INV-08 |
| An archived location's history, receipts, reports, and issued stored value stay readable indefinitely, and are never deleted | retention | Location lifecycle | R12, INV-02 |
| Time is stored in UTC and displayed and bucketed in the location's timezone | correctness | Everything dated | R19 |
| Client PII is anonymized before any cross-location or chain-wide analysis | privacy | Discovery, reporting | INV-A4 |
| An opt-out at one location suppresses sends at every location | privacy | Comms | R14 |
| KSA locations do not go live before a Saudi-resident data stack exists | residency | Market entry | INV-A3 |
| A 9-location all-branches query returns inside the calendar and report interaction budget | scale | Roll-up, calendar | 🔴 No number set. Open question 9 |
| WhatsApp throughput per location stays inside the rail's ceiling, and the Coexistence bridge (~20 msg/sec, manual) is not sold as chain-capable | scale | Comms | EC-44, ADR-025 |

**Outcomes only.** How any of these is met (schema, policy layer, index strategy, sequence implementation) is the engineer's call and is deliberately absent.

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Franchise or independent P&L per franchisee | Multiple businesses means multiple workspaces | A second workspace. Revisit when a franchise account enters the pipeline |
| Multi-brand under one login | A workspace holds exactly one business | Dropped |
| Cross-legal-entity group above the business | Outside the one-business, many-branches frame | Dropped |
| **Per-location payout grouping** | v-next, and the **only** thing gated on UK entry | [Merchant settlement PRD](../prd/prd-merchant-settlement-2026-08-20.md), as a business-level setting defaulted by market |
| Per-location restriction of stored value | Business-wide is the v0 rule | Later additive, after Maaz signs Decision 6 |
| Cross-location stock transfer | Stock is per location in v0 | After R16 lands |
| Routine cross-location booking **creation** | Move and reschedule are in scope. Routine creation into another branch is not | Open question 4, decided before phase 2 scope freeze |
| Shared public branding across locations | Each location carries its own photo and profile | Dropped |
| Full independent per-location catalogs | Shared definition plus per-location override is the model | Dropped. A full per-branch catalog changes R06 materially |
| **Comms pricing:** whether and how the merchant is billed for WhatsApp and SMS | Open at one location already, so it is not a multi-location question. R22 covers attribution only | Maaz, alongside the HQ rate card |
| Tier gating of locations | Contradicts INV-P4 and ADR-001 | Removed. Packaging stays Maaz's call |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| Backend authorization and query isolation (role × location) | 🔴 Gap, per Faisal's readiness table | Every visible surface. Hard gate |
| Location lifecycle (create, configure, suspend, archive) | ⚠️ Partial. Venue aggregate exists, lifecycle does not | Everything |
| PRO-71 data spine | 🔴 **Disputed.** Determines whether phase 1 is a backfill or a build | Estimation itself. Open question 1 |
| PRO-737 CamiPay HQ config | ✅ Shipped | Supplies the inheritance shape (INV-10) and the calendar-date handling reused for timezone |
| Money Composition Contract (06) | ⚠️ Draft v0.1 in review | Every money object gains location attribution |
| Reporting pipeline, event-grain fact tables | 🔴 Architecture unfinalized | Roll-up and drill-down. A retrofit risk, not a blocker to start |
| CamiPay terminal | ⚠️ In architecture | A per-location terminal is a per-location money surface. Terminals bind to a location, not a business |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| Engineering | Build-state audit resolving partition vs attribute vs fallback, then technical design | Faisal. **Needed now, blocks phasing** |
| Commercial | Maaz sign-off on Decision 6 (stored value), the packaging call, comms pricing, and R13's readable field set | Maaz. Four separate answers |
| Design | Location switcher, all-branches calendar, inherited vs overridden catalog UI, booking page entry order | Michelle. Follows the phase-1 gate |
| Customer Success | Number-migration runbook, sized against a real migration | Maaz + CS. **Before a chain is sold a date** |
| Tax and legal, per market | Whether a UK location can hold an independent tax registration | Per market. **Must not block UAE v0** |
| Research | One chain owner and **one branch manager** interviewed. The Khalid persona exists but is entirely derived, not evidenced | Michelle. Before phase 2 design |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| META | Number registration per branch, on top of the three-stage chain Cami restarted 8 Aug | 🔴 None | Chain go-live slips branch by branch. Coexistence is per number and does not scale to nine |
| NeoPay, via the provider abstraction | Settlement destination resolution stays flexible (INV-P3) | n/a for v0 | Low risk in UAE (one account). High for UK if the abstraction hard-codes per-business |
| UK market entry | Triggers per-location payout grouping | Not on the v0 path | It is the v-next trigger, not a dependency |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | Engineering build-state audit | Nothing can be phased or sized until it lands |
| 2 | Backend authorization and query isolation | No visible surface ships before it |
| 3 | Location lifecycle plus backfill of every existing record (R20) | No operational write is safe before it |
| 4 | Time and catalog, then money and inventory, then reporting and hardening | Each opens the next |
| 5 | Number-migration runbook, sized | Runs in parallel, but gates the **go-live date**, not the build |

**Sequencing rule, adopted from Faisal:** do not expose a location switcher before backend authorization and query isolation are in place. **The UI must not imply an isolation the backend cannot enforce.** Release blocker, not a preference.

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Single-location business, live | Backfilled to exactly one location, its current default venue. **No switcher appears.** Nothing visibly changes | Nobody. A silent migration is the success condition |
| Single-location business's WhatsApp number | Becomes location 1's number. No migration, no OTP | Nobody |
| Historical records with no location | Resolve to exactly one location after backfill. **Zero stay locationless** (R20) | n/a, verified by the data-quality check |
| Default-venue fallback code | Expand, migrate, then **contract**. The fallback is deleted from the repo after rollout, not left behind a flag | Engineering owns the contract step. It is a completion criterion |
| Existing pilot operators (Pet Loft, Posh, Fetch) | No action, no data migration, no upgrade step | Customer Success, only if anything is visible |
| A chain onboarding after go-live | N locations in one setup pass, then N number migrations | Customer Success, from the runbook |

**Gate:** adding multi-location must require **zero operator data migration**. If an existing operator has to do anything, the rollout has failed, regardless of whether the feature works.

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| Build state is genuinely unknown, so every estimate is unfounded | F | High | The initiative is sized wrong and the date is fiction | Audit before any phasing commitment. Do not size until it lands | Faisal |
| Hidden default-venue fallbacks silently write to the wrong branch | F | High | Money and reports are wrong, and nobody notices for weeks | Remove fallbacks from all operational writes, keep only time-boxed logged migration compatibility, add a locationless-fact check | Engineering |
| Cross-branch data leakage through notifications, exports, or realtime | F | Medium | The isolation promise breaks, at a Tier 1 account, publicly | Enforce scope in policies, repository queries, subscriptions, notifications, and exports, not controllers. Pen test pre-launch | Engineering |
| UI ships ahead of backend isolation | U | Medium | Operators trust a separation that does not exist | Hard sequencing gate, treated as a release blocker | Product + Eng |
| Reporting facts not location-keyed at write | F | Medium | Roll-up becomes a retrofit across both merchant and HQ reporting | Location enters fact tables from day one. Raise while the architecture is still open | Faisal + Anum |
| **Nine number migrations do not fit the onboarding window** | B | **High, and unmeasured** | The chain go-live date slips after the build is done, which is the worst place to discover it | Time one real migration before selling a date. Size the runbook now | Maaz + CS |
| Historical drift: issued receipts change when settings change | B | Low | A VAT defect | Snapshot at transaction, non-negotiable under INV-P9 and INV-12 | Engineering |
| Receipt sequence gaps under concurrency | B | Medium | A VAT defect, discovered at filing | Load test as a release criterion (R25) | Engineering |
| Chain onboarding assumption untested: we assume N locations at setup | V | Medium | The first Tier 1 week is an ops workaround | Internal dry run on Chaps & Co's real shape before Q4 | Commercial |
| No chain operator has been interviewed, and **all six manager jobs are derived from requirements** | V | **Certain, it has not happened** | Requirements are right about the system and possibly wrong about the workflow | One manager and one owner interview before phase 2 design. Khalid's entry gets corrected from it | Michelle |
| Scope is ~12 modules and reads as a feature | F | High | Phase 1 gets cut to "ship the switcher" | Phase 1 is isolation only, with no visible switcher. Resist shipping the switcher to show progress | Product |
| Packaging boundary undefined | B | Medium | Gating UI cannot be designed, or worse, a subscription floor sneaks back in | Tier gating is ruled out here on INV-P4. Maaz owns what remains | Maaz |

**Cagan status**

| Risk | Question | Status |
|---|---|---|
| **Value** | Will chains want it? | ✅ Named blocker on a named account. Table stakes against Fresha. ⚠️ Zero chain-operator research |
| **Usability** | Can operators tell which branch they are acting on? | ⬜ Untested. Low-fi mockups exist, no operator has used them |
| **Feasibility** | Can we build it? | ⬜ **Unknown until the audit lands.** The largest open risk |
| **Business viability** | Does it work commercially? | ⚠️ Revenue case strong, packaging undefined, and the go-live gate now includes an unsized onboarding task |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | **What is actually built?** Partition (BRD, PRO-71) vs attribute (domain model, glossary) vs aggregate-with-fallback (Faisal, newest) | All phasing and every estimate | Faisal | **Now. Blocking** |
| 2 | Staff working two sites in one day: one unified timeline, or one roster per branch? | Calendar and availability design | Michelle, with a chain ops lead | Before phase 2 |
| 3 | Is "all locations" valid for **operational** surfaces, or read-only? | The switcher's behavior | Michelle | Before the switcher ships |
| 4 | Cross-location booking **creation**, not just move: in or out for v0.3? | Phase 2 scope | Michelle, ask Chaps & Co | Phase 2 scope freeze |
| 5 | Stored value business-wide, confirmed? | Catalog and packages work | **Maaz** | Before catalog work |
| 6 | Packaging: tier gating is ruled out, so what, if anything, is the commercial boundary? | Any gating UI, and the pitch | **Maaz** | Before phase 2 |
| 7 | Chain onboarding surface: CamiHQ (ops-driven, like PRO-737), partner self-serve, or both? | Phase 1 UI, and Dana's workflow | Michelle | Before phase 1 UI |
| 8 | **R13's readable field set:** does branch A see what branch B charged this client, and B's notes? Or only that visits happened? **`JOB-MGR-BOOK1` sharpens this**: a manager needs a sister branch's *availability* to keep a booking, which is a different field set from its money | R13 implementation. It is revenue integrity (EC-4), not compliance | **Maaz** | Before phase 2 |
| 9 | What is the performance ceiling for a 9-branch all-locations query, as a number? | The NFR row has no target | Faisal | PRD-43 definition of ready |
| 10 | Archiving a location with future appointments and unsettled sales: what is the disposition? | Location lifecycle (R12, PRO-557) | Michelle | Phase 1 |
| 11 | **Where does location context get its use-case IDs?** A new `feature-mappings/set-up/locations.md`, or a BV group D? R03 has none, and R15 and R21 have none | Every story keyed to the switcher, the booking page, or the number | Michelle | **Before build. Mint once, never renumber** |
| 12 | Booking page entry order: location first, or service first then only the locations offering it? | R15 design | Michelle | With the booking page work |
| 13 | Can a UK location hold an independent tax registration? | v-next only | Tax and legal | **UK entry only. Must not block UAE v0** |
| 14 | How long does one WhatsApp number migration actually take? | The chain **go-live date**, not the build | Maaz + CS | Before a chain is sold a date |
| 15 | Payout grouping conflict: the system register's R11 reads as v0 scope, this PRD gates it on UK entry | R09, R17 alignment with settlement | Michelle + Faisal | Annotate the register |

---

## Before finalizing

*(gates the document leaving draft)*

- [x] Competitors have this? Yes, Fresha, Mindbody, and Moego. Table stakes, not a differentiator. Sell the WhatsApp and payments wedge on top, do not sell multi-location as the story
- [x] Recent feedback contradicting the approach? None found. Queenie is single-site, so she neither supports nor contradicts
- [x] Three 16 Aug contradictions corrected: tier gating removed, tax identity moved into v0, UK gate narrowed to payout grouping
- [ ] **Maaz answers four things:** Decision 6 (stored value), packaging boundary, R13's field set, comms pricing scope
- [ ] **ADR written superseding ADR-009**, with v0.3 as the trigger
- [ ] **ADR written for the per-location WhatsApp number** (touches INV-C2, INV-C4)
- [ ] Use-case IDs minted for R03, R15, and R21 (Open question 11)
- [ ] `cami-domain-model.md` and the glossary reconciled against the audited build state (Open question 1)

## Release criteria

*(gates the feature reaching an operator. The test plan is the engineer's)*

| # | Must be true to ship | Keys to | Proven by | Blocking |
|---|---|---|---|---|
| 1 | Zero cross-location read paths, including notifications, exports, and realtime subscriptions | R14, R24, INV-A1 | Pen test against a single-branch manager account | Yes |
| 2 | Zero locationless operational records in staging over 7 days | R11, R20 | Data-quality check | Yes |
| 3 | Default-venue fallback code is removed from the repo, not flagged off | R11 | Code search at the contract step | Yes |
| 4 | Every existing record resolves to exactly one location after backfill | R20 | Migration report | Yes |
| 5 | A receipt sequence has no gap and no duplicate under concurrent sales at one location | R25, INV-P9 | Load test | Yes |
| 6 | A cross-location move preserves the deposit with both attributions, and neither record is rewritten | R07, R17, INV-01 | Test suite | Yes |
| 7 | An issued receipt is unchanged after its location's tax identity is edited | R23, INV-12 | Test suite | Yes |
| 8 | A single-location operator sees no switcher and no behavior change | R03 | Manual pass on a live pilot account | Yes |
| 9 | A per-location VAT figure can be produced for a filing | R23, INV-P9 | Report output reviewed by finance | Yes |
| 10 | A chain stands up N locations in one setup pass with no ops workaround | R02 | Internal dry run on Chaps & Co's shape | Yes |
| 11 | An opt-out at one location suppresses sends at every location | R14 | Test suite | Yes |
| 12 | One WhatsApp number migration completed end to end, with its duration recorded | R21 | Runbook execution | **Gates the go-live date, not the build** |
| 13 | A 9-branch all-locations query returns inside the agreed budget | scale NFR | Load test | Blocked on Open question 9 setting the number |

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | | ⬜ |
| Engineering | Faisal | | ⬜ |
| Commercial | Maaz | | ⬜ |
| Design | Michelle You | | ⬜ |

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Seven architecture decisions locked, v0 / v-next line drawn, 10 open questions |
| 2026-08-20 | **Khalid, the Branch Manager, written** in `personas.md`, with role code `MGR` added to the job scheme. Five `JOB-MGR-*` jobs wired into Jobs served, and the persona-gap note replaced with the honest version: every manager job is derived from a requirement, not from a person. Added a manager interview to the leading indicators and the team dependencies. **Removed the boarding-calendar priority comparison** from Evidence and Risks; sequencing belongs in the roadmap review, not inside this PRD |
| 2026-08-20 | **Rewritten to the updated PRD template.** Added Jobs served (7 jobs by ID, with the evidence split shown), Applicability, Law touched (depends vs changes), Money composition, Automation and messaging rules, Permissions and roles, Edge cases, Reporting and data, Non-functional requirements, Operational workflows, Rollout and migration, and Release criteria as a ship gate separate from Before finalizing. **Absorbed the 17 Aug BRD**, which was newer: requirements R01 to R25, the WhatsApp layer (R21, R22), the booking-page location picker (R15), and R24 and R25 from the negative-space check. **Corrected three things the BRD flagged:** multi-location is not tier-gated (INV-P4, ADR-001), per-location tax identity ships in v0 (R23), and payout grouping alone flips on UK entry. Corrected Tier 1 GMV to $250K+ per the 17 Aug bands. Added five open questions (11 to 15) covering use-case ID minting, booking entry order, number-migration duration, and the payout-grouping register conflict |
| 2026-08-20 | Companion settlement PRD reference repointed to `prd-merchant-settlement-2026-08-20`; the 2026-08-16 settlement draft it cited is superseded. E2E test tickets cut in Linear (PRD-72 to PRD-79) against the 13 release criteria |
