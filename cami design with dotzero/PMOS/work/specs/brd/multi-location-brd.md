# BRD: Multi-Location (Multi-Branch Under One Business)

**One question:** What must a chain be able to do that a single-site business cannot?
**Serves objective:** Land Tier 2, and unlock Tier 1 (goals.md). Multi-location is the named gate on Tier 1.
**Unlocks:** Tier 1. Chaps & Co (9 locations), and the multi-site pipeline behind it.
**Companion PRD:** [prd-multi-location-2026-08-16](../prd/prd-multi-location-2026-08-16.md), problem, evidence, decisions, risks, dependencies, sign-off all live there.
**Law:** INV-B4 (single location at v1, this initiative supersedes it), INV-A1, INV-A2, INV-C4, INV-10, INV-12, INV-13, INV-P9, ADR-009
**Law repo:** [cami-feature-docs/business-rules](../../../../cami-feature-docs/business-rules/) · use case IDs in [feature-mappings](../../../../cami-feature-docs/feature-mappings/)
**Anchor project:** [PRD-43](https://linear.app/getcami/issue/PRD-43) · spine [PRO-71](https://linear.app/getcami/issue/PRO-71) · [PRO-159](https://linear.app/getcami/issue/PRO-159) · [PRO-557](https://linear.app/getcami/issue/PRO-557) · [PRO-784](https://linear.app/getcami/issue/PRO-784)
**System register:** `multi-location-business-requirements.docx` (18 system requirements). Cross-checked 2026-08-17, mapping in the appendix.
**Slim version:** [multi-location-brd-slim.md](multi-location-brd-slim.md), TL;DR and the register. For circulating. This file stays the source.
**Register grammar:** two sentence shapes, boundary clause on every row, zero modality, solution-free, falsifiable. See How to read this register.
**Owner:** Michelle You
**Last checked:** 2026-08-17

---

## TL;DR

1. **24 requirements.** Was 10 on 14 Aug. None fully traced to use case IDs.
2. **Location is explicit at the front door, resolved differently per channel.** On the web the **customer picks it** from a business page, with per-location direct URLs alongside (R15). On WhatsApp it is **inferred from the number**, merchant-supplied, cost passed through (R21, R22). Neither path guesses. The WhatsApp half moves the chain go-live gate from build to **migrating nine existing numbers at onboarding**.
3. Hardest: **R09 and R23, money and Tax Identity per Location.** Receipt sequence and ledger attribution are compliance, not preference, and they are the only requirements that flip on UK entry.
4. **R03 Location Scope has zero use case IDs.** The switcher is the surface every other requirement is read through and it does not exist in any feature guide.
5. **One conflict with the system register remains: payout grouping** (its R11). The fiscal identity conflict closed 2026-08-17 in the register's favor, now R23. **The UK gate is now payout grouping alone**, not two things flipping together.
6. **Multi-location is not tier-gated.** Gating it behind a premium tier would be a subscription floor, which contradicts INV-P4 and ADR-001. Revenue comes from the captured volume the extra locations bring, so gating them suppresses the model. ⚠️ **The PRD still says "Availability: Premium tier"** and needs correcting.
7. Blocked until this ships: Tier 1 entirely. The 17 Aug deck moves multi-location to "Later" while keeping Tier 1 in Q4. Both cannot hold.

⚠️ **Evidence:** requirements derived from the shipped spine (PRO-71), PRD-43's deferred scope, Fresha's multi-site model, and the 18-requirement system register. **No chain operator has been interviewed.** Sufficient to scope, not to claim the workflow is right.

---

## Why it is worth doing

| | |
|---|---|
| **Unlocks** | Tier 1, $200K+ monthly GMV per account. Chaps & Co is the named anchor |
| **Costs us if we do not** | Tier 1 stays unsellable. The deck's own legend says Multi-Location "unlocks Tier 1 operators" while listing it as Later |
| **Trigger to start** | Core OS proven on a Tier 2 account. SOTA is waitlisted, so this trigger is currently unmet |
| **Trigger to stop** | Tier 1 pipeline goes cold, or a Tier 2 gate proves more valuable per week of build (boarding calendar has 6 operators waiting) |

Detail and the commercial case live in the PRD. This is the argument in four lines.

---

## Words that matter

Every capitalized noun in the register is defined here. A capitalization is a promise of a definition, so a term that cannot be defined in one line is cut rather than capitalized.

| Term | Means |
|---|---|
| **Business** | The owning entity. One brand, one legal entity, many Locations |
| **Location** | One physical site under one Business. The staff-facing term |
| **Location Scope** | The set of Locations a user is granted, either all or a named selection. Independent of role capability |
| **Client** | The person the Business serves |
| **Pet** | An animal attached to one or more Clients |
| **Appointment** | A booked slot, always resolving to exactly one Location |
| **Service** | A sellable unit of labour, defined at the Business and enabled per Location |
| **Sale** | A completed payment against an invoice (glossary 02) |
| **Receipt** | The issued document for a Sale, carrying a Location prefix and sequence |
| **Tax Identity** | Legal name, tax registration number, invoice address, Receipt prefix and sequence, and local tax defaults |
| **Package / Membership / Gift Card** | Stored value held at the Business, consumed at a Location (glossary 02) |
| **Roll-up** | A derived all-Locations view. Read and reporting, never an operational target |

**"Authorized" resolves to R04 in every row it appears in.** It is not a separate concept.

`branch_id`, `venue`, and `operator` are schema and internal words. They never reach a user and never appear in the register.

---

## Owns / not this

| This initiative owns | Point elsewhere |
|---|---|
| The Location object and its lifecycle | **Payout grouping and settlement rails** → [merchant settlement PRD](../prd/prd-merchant-settlement-2026-08-16.md) |
| Location scoping of access, staff, catalog, calendar, money | **Role definitions themselves** → INV-A1, team-and-access guide |
| **Per-location ledger attribution**, in every market, always | **Tax law and VAT derivation** → 06 Money Composition Contract |
| The cross-location behavior of shared objects | **Pricing and packaging** → commercial, Maaz |
| | **Comms pricing** → Maaz, and open at one location already |

**Boundary correction, 2026-08-17.** The earlier line "payout and settlement point elsewhere" was too wide and contradicted PRD Decision 1. Split it: **ledger attribution per location is this initiative's, in every market.** Only **payout grouping** (which bank account money lands in) belongs to settlement, and it is a business-level setting defaulted by market.

---

## Requirements

### How to read this register

Every row is one of two sentence shapes and nothing else. **Capability:** an actor can do a bounded set of things, with a clause naming what stays true while they do. **Invariant:** a system noun behaves a stated way, with the same kind of clause. A row that fits neither shape is a goal, a task, or a design decision, and it lives outside the register.

| Column | Values |
|---|---|
| **Source** | Who asked, or which artifact, decision, or rule the row came from |
| **Linked** | Use case IDs in the law repo, where they exist |

**An unresolved question never sits inside requirement text.** It goes to Open decisions, and a retired row says so in its own text.

**IDs are zero-padded and never renumbered.** R1 to R23 became R01 to R23 on 2026-08-17, a format change with a one-to-one mapping, so the PRD's citations of R3.4 and R8.3 read as R03.4 and R08.3. A withdrawn row is deleted and its number is not reused, so a gap in the sequence is expected.

The verb cluster in each row is the scope fence: what is listed is in, what is absent is out by omission.

### Map of groups

| Group | What it covers | Requirements |
|---|---|---|
| **A · Structure** | A Location exists, and a chain can be stood up | R01, R02, R11, R12 |
| **B · Who sees what** | Scope, access, staff, and the Client seen across Locations | R03, R04, R05, R13, R14, R24 |
| **C · What we sell, and when** | Catalog, calendar, the front door, stock | R06, R07, R08, R15, R16, R21, R22 |
| **D · Money** | Per-Location money and Tax Identity | R09, R17, R18, R23, R25 |
| **E · Time and data integrity** | Cross-cutting rules that make every other group true | R19, R20 |

### A · Structure

| Req ID | Requirement | Source | Linked |
|---|---|---|---|
| R01 | An authorized owner or manager can create, configure, suspend, archive, and discover Locations under one Business while each Location carries its own name, address, hours, timezone, Tax Identity, and active state | PRO-71, register R01 | BV-B1, BV-B2, BV-C1 |
| R02 | An authorized owner can create every Location of a Business in one setup pass and can add a further Location later, without re-entering or migrating existing Business data | PRD-43 deferred scope | HQ-C1, BV-B2 |
| R11 | Every operational command and query resolves an explicit Location or an explicit granted Location set, and never resolves a default once a Business holds more than one active Location | Faisal brief 2026-08-16, register R02 | — |
| R12 | An archived Location accepts no new operational write while its history, attribution, Receipts, reports, and issued stored value stay readable, and is never deleted | Register R17 | — |

### B · Who sees what

| Req ID | Requirement | Source | Linked |
|---|---|---|---|
| R03 | An authorized user can set and read the active Location Scope of their session across one Location, a subset, or all granted Locations, while filters and date ranges survive a scope change | PRD-43 deferred scope | — |
| R04 | A Business can combine role capability with an independent all-or-selected Location Scope for every staff member, while capability never widens scope and scope never widens capability | INV-A1, register R03 | TA-B1, TA-C1, TA-C3 |
| R05 | Staff identity is held at the Business while work assignment, service capability, schedules, and blocks resolve per Location, and an assignment at one Location grants nothing at another | Register R05 | SA-A1, SA-B1 |
| R13 | An authorized user can identify one Client and Pet across the Business and can read the date, Location, and Service of that Client's Appointments at any Location, while the readable field set is identical for every Location outside the caller's granted Location Scope | EC-1, register R04 | — |
| R14 | Events, jobs, audit records, notifications, exports, and subscriptions carry Location context and never deliver a record outside the recipient's granted Location Scope | Register R15 | — |
| R24 | A staff member holding no granted Location Scope performs no operational read or write, and an empty scope never resolves to all Locations | Negative-space check 2026-08-17 | — |

**R13 state.** The requirement is settled: the readable field set is uniform for every Location outside the caller's scope. **Which fields are in that set is open (Maaz), not decided.** Does branch A see what branch B charged this Client, and B's notes, or only that the visits happened? Revenue integrity (EC-4), not compliance.

### C · What we sell, and when

| Req ID | Requirement | Source | Linked |
|---|---|---|---|
| R06 | An authorized user can enable a Service at a Location and can inherit, override, or reset each supported field independently, while the Location value resolves ahead of the Business value for every field including limits, and a reset returns that field to the Business value | INV-10, INV-12, INV-13, register R06 | SP-A1, SP-B1, SP-C1 |
| R07 | An authorized user can view one, a subset, or all granted Location calendars and can move an Appointment to another Location only after destination scope, availability, and policy checks succeed | Register R08 | CAL-A1, CAL-B1, CAL-D1, SA-C1 |
| R08 | Client, Pet, Package, Membership, and Gift Card records are held at the Business while every Appointment, redemption, and consumption resolves to exactly one Location and never to none | Register R16 | BV-B3, CL-A1, PK-B1, RC-B1 |
| R15 | A Client can choose one Location from the Locations a Business publishes, or arrive at one published Location directly, while both paths yield that Location's offering and availability and bind the resulting Appointment to that Location | Michelle 2026-08-17, register R07 | — |
| R16 | Stock quantity, reorder configuration, movements, depletion, and adjustments resolve per Location while the Business quantity is derived from its Locations and never stored independently | Register R13 | — |
| R21 | Each Location holds its own WhatsApp number, supplied by the Business, while an inbound message resolves its Location from the number it arrived on and never falls back to another Location's number | Michelle 2026-08-17 | — |
| R22 | Conversation and message cost is attributed to the Location that sent or received it while the Business total is derived from its Locations | Michelle 2026-08-17 | — |

**R22 state.** The requirement is settled: cost is attributable to a Location. **The costing and pricing model behind it is in exploration (Maaz), not decided.** The rate and who absorbs it are open.

### D · Money

| Req ID | Requirement | Source | Linked |
|---|---|---|---|
| R09 | Every money view resolves to one Location, a subset, or all granted Locations with a per-Location breakdown, while attribution recorded at the time of the event never changes when the Location set is edited later | INV-01, register R14 | RP-A1, RP-A2, RP-C1 |
| R17 | A Sale collected at one Location and fulfilled at another records both Locations while neither record is rewritten after the Sale completes | INV-01, register R12 | — |
| R18 | An authorized user can run a bounded single-Location or all-granted-Location report with roll-up and drill-down while the result set never exceeds the caller's granted Location Scope and fiscal and timezone bucketing stay unchanged at every level | Register R14 | RP-A1, RP-A2 |
| R23 | Tax Identity resolves from a Business default with per-Location override of legal name, tax registration number, invoice address, Receipt prefix and sequence, and local tax defaults, while the resolved values are copied onto the Receipt at Sale completion and never change afterward | Michelle 2026-08-17, INV-P9, INV-12, register R10 | TX-A1 |
| R25 | Sales completing concurrently at one Location draw contiguous Receipt numbers from that Location's sequence without a gap or a duplicate | Negative-space check 2026-08-17, register R10 | — |

### E · Time and data integrity

| Req ID | Requirement | Source | Linked |
|---|---|---|---|
| R19 | Time is stored in UTC while a Business timezone default and per-Location overrides govern schedules, availability, display, and date bucketing | PRD Decision 3, register R09 | — |
| R20 | Every operational record created before the Location model existed resolves to exactly one Location after backfill, and no record stays locationless | Register R18 | — |

**Traceability finding, unchanged.** No row is fully traced to use case IDs. R03, R11 to R14, and R19 to R25 have none at all. That is the register's largest gap and it is why R03 needs its own feature guide, see Open decisions.

**Rollout sequencing left the register deliberately.** The earlier R20 carried both a system requirement and a delivery plan. The requirement stayed, worded above. Expand, migrate, contract, and the removal of the fallback code path are plan items and now live under Delivery in the PRD, because a register spanning two abstraction levels cannot be signed off as one thing.


---

## Out of scope

Full list in the PRD's Non-Goals. BRD-specific boundary:

| Not in this initiative | Why | Revisit when |
|---|---|---|
| Comms pricing: whether and how the merchant is billed for WhatsApp and SMS | Open at one location already, so it is not a multi-location question. R22 covers attribution only | Maaz settles comms packaging |
| Franchise, multi-brand, cross-legal-entity group | One business, one brand, many sites. A second business is a second workspace | A franchise account enters the pipeline |
| Per-location payout grouping | v-next. **It is now the only thing gated on UK entry**, since per-location tax identity is built from day one (R23) | UK market entry, gated on tax and legal sign-off |
| Cross-location stock transfer | Stock is per location in v0 | After R08 lands |
| Backend spine and schema | Shipped in v0 (PRO-71). This initiative is the surface over it | Never, unless the audit contradicts PRO-71 |

---

## Success criteria

Targets, baselines, and leading indicators live in the PRD. The BRD holds only the pass/fail gates:

| Gate | Fails if |
|---|---|
| A chain onboards with all locations and operates each from day one | Ops needs a workaround for location 2 through N |
| Cross-location data leakage | Any path exists, **including notifications, exports, and realtime**. Zero, not a target |
| Money is clean per location | A VAT filing cannot be produced per location |
| Adding or upgrading to multi-location | Any operator data migration is required |
| Operator always knows which location they are acting on | Any surface is ambiguous about the active location |
| No implicit default location | Any operational write lands somewhere by fallback rather than by instruction |
| The contract step completes | Default-location fallback code is still in the repo after rollout |

---

## Open decisions

The six load-bearing decisions from BRD v1 §5 are **closed** in the PRD's Decisions Locked table (16 Aug), and all eleven BRD v1 open questions are absorbed into the PRD's Open Questions. Do not re-litigate them here.

BRD-owned, still open:

| Decision | Blocks which requirement | Owner | Where it resolves |
|---|---|---|---|
| ✅ ~~How does a WhatsApp booking resolve its location?~~ | | | **Closed 2026-08-17 (Michelle): the number is per location.** Now R21. Still needs an ADR written |
| ✅ ~~Who procures and pays for the numbers?~~ | | | **Closed 2026-08-17 (Michelle): the merchant supplies them.** Locations already have their own numbers. Extra comms cost passes through to the merchant, now R22 |
| ✅ ~~Does branch A see branch B's thread?~~ | | | **Closed 2026-08-17 (Michelle): no.** Not a new rule, it is R04 applied to threads. Owner and HQ see all through all-location scope. Did not need Maaz |
| **Number migration is the chain go-live gate.** Nine existing numbers, each needing an OTP at that branch, a display name approval, and a two-factor PIN, each losing its chat history unless Coexistence runs on it | R21, and every chain's go-live date | Maaz + Customer Success | Onboarding runbook, not a build item. Size it before a chain is sold a date |
| **Comms costing and pricing, in exploration.** Is the merchant billed for WhatsApp and SMS, at what rate, on what bill? Not a multi-location question, it is open at one Location too. Listed here because R22 is where people will look for it | — | **Maaz** | Commercial packaging, alongside the HQ rate card. **Out of scope for this initiative** |
| **EC-17 sender ID is now per location.** Per-merchant versus Cami-as-sender becomes per-location versus per-merchant versus Cami | R21, R22 | Michelle + Maaz | EC-17, reopened at a new grain |
| ✅ ~~Is there a business-level landing page?~~ | | | **Closed 2026-08-17 (Michelle): yes, and it carries the location picker.** Per-location direct URLs stay alongside it |
| **Entry order on the booking page.** Location first then service, or service first then only the locations offering it (R06) | R15, R06 | Michelle | Design, with the booking page work |
| **Per-location URL scheme.** What a branch's shareable link looks like under the business | R15 | Michelle | PRD, with the booking page work |
| **Payout grouping conflict.** System register R11 reads as v0 scope; the PRD gates location-grouped payout on UK entry | R17, R09 | Michelle + Faisal | Annotate the system register: v0 UAE is business-grouped, location-grouped is a config flip |
| ✅ ~~Fiscal identity conflict~~ | | | **Closed 2026-08-17 (Michelle): the register was right, our PRD was wrong.** Tax identity is business-default with per-location override, built from day one, now **R23**. ⚠️ **The PRD's Decisions Locked table still says shared tax identity in v0, and still pairs tax identity with payout as flipping together on UK entry. Both lines need correcting** |
| **Cross-Location client detail.** R13 fixes the readable field set but does not say what is in it. Does branch A see what branch B charged this Client, and B's notes? Or only that the visits happened? | R13 | **Maaz** | Ask him directly. Revenue integrity (EC-4), not compliance. "Privacy-minimized" was imported jargon and has been dropped |
| R03 has no use case IDs. Does location context get its own feature guide, or extend `business-and-venues`? | R03, and every other requirement is read through it | Michelle | New `feature-mappings/set-up/locations.md`, or BV group D |
| **The PRD contradicts this BRD in three places** and carries sign-off, so it is not edited from here: "Availability: Premium tier" (multi-location is not tier-gated), shared tax identity in v0 (superseded by R23), and tax identity flipping with payout on UK entry (only payout flips now) | R23 | Michelle | The PRD's Decisions Locked table |
| Is multi-location in "Later" (17 Aug deck) while Tier 1 stays Q4? | All. The initiative has no start date | Maaz | goals.md open questions |
| Supersede INV-B4 and ADR-009, which both assert single-location as the v1 state | R01 | Michelle | New ADR on v0.3 ship |

---

## Evidence & confidence

- ✅ **Validated:** the spine is partitioned, not attributed (PRO-71, `branch_id` first-class with row-level isolation). Branch CRUD, staff-to-branch, and staff default branch shipped or in flight.
- ⚠️ **Inferred:** requirement shape from Fresha and Mindbody multi-site models, and from PRD-43's explicitly deferred scope.
- ⚠️ **Assumed:** every workflow claim. Chains are assumed to operate the way single sites do, plus a switcher.
- 🔴 **Unknown:** no chain operator interviewed. Chaps & Co has not been asked whether reception books across sites, which is the whole of R08.3.
- 🔴 **Unknown:** as-built status. `cami-domain-model.md` and the glossary still say "attribute, not partition", contradicting PRO-71. Engineer audit owns this (PRD Open Question 1, blocking).
- ✅ **Decided (Michelle, 2026-08-17):** the WhatsApp number is per location (R21). A decision, not evidence. No chain has been asked whether clients accept branch-specific numbers, or whether they message the branch they went to last time.
- ✅ **Decided (Michelle, 2026-08-17):** merchant supplies the number, comms cost passes through (R22), and branch A does not see branch B's thread.
- 🔴 **Unknown:** how long migrating an existing branch number off the WhatsApp Business app actually takes, and whether nine of them fit inside a chain onboarding window. Nobody has done one.
- ⚠️ **Assumed:** that operators accept losing a branch's chat history at cut-over, or will run Coexistence per number to keep it. Not tested with an operator (EC-45).
- ⚠️ **Note on R11 to R20:** these come from a system requirements register, not from an operator. They sharpen what the system must do. They add no evidence that chains work this way.

---

## The front door, per channel

The two channels resolve location differently, and that asymmetry is deliberate.

| Channel | How location resolves | Consequence |
|---|---|---|
| Public booking page | **Customer picks it**, from a business page listing active locations. A direct per-location URL skips the picker | A chain has a business page and N branch URLs. The picker is the default entry, the direct link is the shareable one |
| WhatsApp number | **Inferred from the number** the message arrived on | No picker in the thread, no question asked, no fallback |

**Both satisfy R11 for different reasons.** The web path is explicit because the customer states it; the WhatsApp path is explicit because the number states it. Neither guesses, and guessing is the default-venue fallback R11 exists to delete.

**Design question this opens:** entry order. A customer who starts from a service rather than a location should only be offered locations where that service is enabled (R06). Picking location first, then service, is the simpler build. Picking service first, then location, is what a customer with a specific treatment in mind actually does. Not a BRD call, but it needs one.

**Knock-ons, none of them free:**

| | |
|---|---|
| **Numbers come from the merchant** | Locations already have their own numbers, so Cami procures nothing and there is no per-number cost to argue about. **Decided 2026-08-17** |
| **The gate moved, it did not disappear** | A branch number is almost certainly already live on the WhatsApp Business phone app. Connecting it to the Cloud API needs an **OTP received at that branch**, a **display name approval**, and a **two-factor PIN**, per number. A 9-branch chain go-live is 9 number migrations. Cheaper than procurement, still a gate |
| **History does not come with the number** | Migrating a number off the phone app **loses its chat history** unless Coexistence runs on it. EC-45, once per branch, and worse the longer that branch has been trading |
| **Whose number is it** | Some branch numbers will be a manager's personal mobile. Staff turnover then removes the business's WhatsApp front door. The number must be a business asset before it becomes a location's number. Onboarding check, not a build item |
| **META gate multiplies** | Business Verification is once per business, but each number is registered separately. Cami is at stage 1 of 3 today (INV-C2). Chains multiply the registration tail, not the verification chain |
| **Coexistence** | ADR-025's manual bridge is per number. A 9-branch chain on the bridge is 9 staffed inboxes. It does not scale to chains, which is another argument for not selling Tier 1 on the bridge |
| **Reminders and campaigns** | Send from the location's number, so replies land in the right inbox. EC-17's SMS sender ID question is now **per location**, not per merchant, and sender ID registration is the one comms cost that is genuinely per-sender. WhatsApp itself bills per conversation, not per number |
| **Cost attribution** | Conversation and message cost attributes to the location that sent or received it (R22), so an owner can read spend per branch. **Whether the merchant is billed at all is not this initiative's question**, it is comms pricing, it is Maaz's, and it is already unresolved at one location. There is also no billing surface today: free OS plus processing margin, settlement still a manual Crescent payout |
| **Unassigned number** | A location with no number takes no WhatsApp bookings. Explicit gap, never a silent fallback to another branch |
| **Migration** | An existing single-location business keeps its number, which becomes location 1's. Covered by R20 |
| **Client identity** | Stays business-wide (R13). One client, two branch threads, one record. **Branch A does not see branch B's thread**, because a thread is location data and R04 already governs it. Owner and HQ see all, since they hold all-location scope |
| **How much of B does A see** | ⏳ **Open, Maaz.** The floor is settled: A sees that the client has visits at B, or duplicate detection dies across branches (R13, EC-1). Whether A also sees B's prices, notes, and documents is the open half, see Open decisions |
| **The awkward case this creates** | A client messages branch A about an appointment at branch B. Reception A sees from R13 that the appointment exists, cannot read the B thread, and cannot move it without destination access (R07, R08). So they refer the client to branch B. Real friction, accepted deliberately, and the alternative is cross-branch thread reading |

---

## Appendix · Mapping to the system requirements register

Source: `multi-location-business-requirements.docx`, 18 system requirements. Cross-checked 2026-08-17. That register is the finer-grained system decomposition; this BRD holds priority, done-when, and traceability, which it does not.

| System req | This BRD | Note |
|---|---|---|
| R01 create, configure, suspend, archive, discover | R01, R12 | Archive split out as its own requirement |
| R02 explicit location on every command and query | **R11** | Added |
| R03 role capability × allowed-location scope | R04 | R04 rewritten to state the two axes are independent |
| R04 cross-location customer and pet, privacy-minimized | **R13** | **"Privacy-minimized" is dropped as unfalsifiable.** R13 holds the identity and visit-existence floor and fixes the field set as uniform across Locations. Which fields are in it is an open decision, not a requirement clause |
| R05 staff business-wide, per-location work | R05 | R05 rewritten to lead with business-wide identity |
| R06 enable, inherit, override, reset per field | R06 | Match. Both resolve nearest-wins, so the Location value takes effect for every field including limits (INV-13) |
| R07 customer selects a location | **R15** | ✅ **The register was right.** Reversed 2026-08-17: a location picker is needed. Per-location direct URLs sit alongside it |
| R08 calendar one or all, move with destination checks | R07, R08 | Match |
| R09 UTC, timezone override, date bucketing | **R19** | Added |
| R10 checkout tax, tip, fiscal identity, atomic receipt sequence | R23 | ✅ **Conflict resolved in the register's favor, 2026-08-17.** Per-location fiscal identity is built from day one |
| R11 business- or location-grouped payout | R09, R17 | ⚠️ **Conflict.** v0 UAE is business-grouped. Location-grouped is UK-gated |
| R12 collection versus fulfillment location | **R17** | Added |
| R13 inventory per location with roll-up | **R16** | Added |
| R14 bounded reports, roll-up and drill-down | **R18** | Added |
| R15 location on events, jobs, audit, notifications, realtime | **R14** | Added |
| R16 stored value business-wide, activity attributed | R08 | Match |
| R17 archive preserves history | **R12** | Added |
| R18 migration, expand, migrate, contract | **R20** | Added |
| — | R02 | **Not in the register.** N locations in one onboarding pass |
| — | R03 | **Not in the register.** Persistent location context control preserving in-view state |
| — | R21, R22 | **Not in the register.** WhatsApp number per location, and comms cost pass-through. The register has **no WhatsApp requirement at all**, which is a hole in a WhatsApp-native product. Raise with Faisal |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-14 | Draft v1, for Faisal |
| 2026-08-16 | Slimmed to the requirements register, 219 lines to 165, and prose to tables. Cut §2 problem, §4 audience, §5 decisions, §7 out-of-scope prose, §8 criteria, §9 questions, §10 flow, all superseded by or duplicated in the 16 Aug PRD. Added Priority, Done when, and Use case ID columns. **Finding: zero of 10 requirements are fully traced, and R03 has no IDs at all** |
| 2026-08-17 | **Decision (Michelle): the Location value wins for every field, limits included.** R06's "bookability limits intersect and never override" clause is removed. It invented a stricter-wins rule for one field class, which contradicts **INV-13 nearest-wins**, the precedence law the rest of the platform already follows. One resolution rule now covers every configurable field, and R23's Tax Identity override follows the same shape. Capability intersections are untouched: R04 Location Scope and R05 staff assignment still bound what a Location value can reach |
| 2026-08-17 | **Register rewritten to the requirements grammar.** Every row is now a Capability or an Invariant with a boundary clause, modality and UI nouns stripped, domain entities capitalized and defined in Words that matter. Columns are Req ID, Requirement, Source, Linked. **Priority, verification method, and status columns were dropped**, so the register states what must be true and nothing about sequencing or confidence. **IDs zero-padded** (R1 to R01), a format change with a one-to-one mapping. Three grammar findings acted on: **"privacy-minimized" removed** as unfalsifiable and its open half moved out of the register; **R13.1 removed**, sub-IDs are not a legal shape and an unresolved question belongs in Open decisions; **R20's rollout half moved out**, since expand, migrate, contract is delivery sequencing and a register spanning two abstraction levels cannot be signed off as one thing. Negative-space check added **R24** (actor with no granted scope) and **R25** (concurrent Receipt sequence) |
| 2026-08-17 | **R22 narrowed to attribution.** It previously bundled two things: comms cost tracked per location (a real multi-location requirement) and the merchant being billed for it (comms pricing, true at one location or nine, Maaz's, already unresolved). Kept the first, moved the second to Out of scope. Also noted there is no billing surface today regardless of branch count |
| 2026-08-17 | **R13 split, "privacy-minimized" dropped.** The term was imported from the system register and is not implementable without a field list. **R13** now holds only the settled floor: same client across the business, plus the existence of visits elsewhere, which duplicate detection depends on (EC-1). The open half, whether cross-Location price, notes, and documents are readable, moved to Open decisions rather than becoming a sub-ID. **Parked for Maaz**, because it is a revenue-integrity call (EC-4: staff already discount to zero and comp friends), not a compliance one |
| 2026-08-17 | **Reversal (Michelle): the booking page needs a location picker.** R15 rewritten: a business page lists active locations and the customer picks one, with per-location direct URLs alongside for a branch to share. Supersedes the earlier no-picker wording. The system register's R07 was right. Closes the business-landing-page question, opens the **entry order** one (location first, or service first then only the locations offering it). The web and WhatsApp paths now resolve location differently on purpose: customer states it, or the number states it |
| 2026-08-17 | **Decision (Michelle): tax identity is a business default each location can override**, per field: legal or invoice name, TRN, invoice address, receipt prefix and sequence, local tax defaults. Resolved values are **copied onto the receipt at sale completion** and later config changes never touch an issued receipt (INV-01, INV-12). Split out as **R23**, leaving R09 as money visibility. Closes the fiscal identity conflict **in the system register's favor**, and reduces the UK gate to payout grouping alone. ⚠️ **The PRD contradicts this in two places** and needs correcting |
| 2026-08-17 | **Decisions (Michelle), three:** (1) the WhatsApp number is per location; (2) the **merchant supplies it**, locations already have numbers, and extra comms cost passes through; (3) **branch A does not see branch B's thread**, which is R04 applied to threads, not a new rule. Added **R21** and **R22** and the "front door is per location" section. Closed three open questions, opened three sharper ones: number **migration** as the chain go-live gate (nine OTPs, nine display-name approvals, history lost per branch unless Coexistence), pass-through **pricing and billing surface** (Maaz), and EC-17 sender ID reopened at per-location grain. Corrected: sender ID is an SMS cost, WhatsApp bills per conversation not per number. Needs an ADR, it touches INV-C2 and INV-C4 |
| 2026-08-17 | Cross-checked against the 18-requirement system register (`multi-location-business-requirements.docx`). **Added R11 to R20** (explicit location resolution, archive disposition, privacy-minimized cross-location client view, location on async surfaces, per-location public booking page, per-location inventory, dual-location financial record, bounded reports with drill-down, UTC and timezone, migration). Rewrote R04 (role × location as independent axes), R05 (business-wide identity), R06 (enable and reset). Added group E. Fixed the payout boundary in Owns/not this: ledger attribution is ours, only payout grouping is elsewhere. **Corrected the register's R07: there is no location picker, the public booking page is per location.** Logged two money conflicts with the register and the WhatsApp location-resolution hole. Register carries no priority, done-when, or traceability, so all 18 read as Must |
