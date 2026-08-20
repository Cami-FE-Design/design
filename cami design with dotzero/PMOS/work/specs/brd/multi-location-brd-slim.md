# Multi-Location · Requirements Register

**One question:** What must a chain be able to do that a single-site business cannot?
**Full version:** [multi-location-brd.md](multi-location-brd.md) · sources, evidence, open decisions, knock-ons, and the mapping to the 18-requirement system register live there.
**Companion PRD:** [prd-multi-location-2026-08-16](../prd/prd-multi-location-2026-08-16.md)
**Owner:** Michelle You · **Last checked:** 2026-08-17

---

## Requirements

### A · Structure

| Req ID | Requirement |
|---|---|
| R01 | An authorized owner or manager can create, configure, suspend, archive, and discover Locations under one Business while each Location carries its own name, address, hours, timezone, Tax Identity, and active state |
| R02 | An authorized owner can create every Location of a Business in one setup pass and can add a further Location later, without re-entering or migrating existing Business data |
| R11 | Every operational command and query resolves an explicit Location or an explicit granted Location set, and never resolves a default once a Business holds more than one active Location |
| R12 | An archived Location accepts no new operational write while its history, attribution, Receipts, reports, and issued stored value stay readable, and is never deleted |

### B · Who sees what

| Req ID | Requirement |
|---|---|
| R03 | An authorized user can set and read the active Location Scope of their session across one Location, a subset, or all granted Locations, while filters and date ranges survive a scope change |
| R04 | A Business can combine role capability with an independent all-or-selected Location Scope for every staff member, while capability never widens scope and scope never widens capability |
| R05 | Staff identity is held at the Business while work assignment, service capability, schedules, and blocks resolve per Location, and an assignment at one Location grants nothing at another |
| R13 | An authorized user can identify one Client and Pet across the Business and can read the date, Location, and Service of that Client's Appointments at any Location, while the readable field set is identical for every Location outside the caller's granted Location Scope |
| R14 | Events, jobs, audit records, notifications, exports, and subscriptions carry Location context and never deliver a record outside the recipient's granted Location Scope |
| R24 | A staff member holding no granted Location Scope performs no operational read or write, and an empty scope never resolves to all Locations |

**R13 state.** The requirement is settled: the readable field set is uniform for every Location outside the caller's scope. **Which fields are in that set is open (Maaz), not decided.** Does branch A see what branch B charged this Client, and B's notes, or only that the visits happened? Revenue integrity (EC-4), not compliance.

### C · What we sell, and when

| Req ID | Requirement |
|---|---|
| R06 | An authorized user can enable a Service at a Location and can inherit, override, or reset each supported field independently, while the Location value resolves ahead of the Business value for every field including limits, and a reset returns that field to the Business value |
| R07 | An authorized user can view one, a subset, or all granted Location calendars and can move an Appointment to another Location only after destination scope, availability, and policy checks succeed |
| R08 | Client, Pet, Package, Membership, and Gift Card records are held at the Business while every Appointment, redemption, and consumption resolves to exactly one Location and never to none |
| R15 | A Client can choose one Location from the Locations a Business publishes, or arrive at one published Location directly, while both paths yield that Location's offering and availability and bind the resulting Appointment to that Location |
| R16 | Stock quantity, reorder configuration, movements, depletion, and adjustments resolve per Location while the Business quantity is derived from its Locations and never stored independently |
| R21 | Each Location holds its own WhatsApp number, supplied by the Business, while an inbound message resolves its Location from the number it arrived on and never falls back to another Location's number |
| R22 | Conversation and message cost is attributed to the Location that sent or received it while the Business total is derived from its Locations |

**R22 state.** The requirement is settled: cost is attributable to a Location. **The costing and pricing model behind it is in exploration (Maaz), not decided.** The rate and who absorbs it are open.

### D · Money

| Req ID | Requirement |
|---|---|
| R09 | Every money view resolves to one Location, a subset, or all granted Locations with a per-Location breakdown, while attribution recorded at the time of the event never changes when the Location set is edited later |
| R17 | A Sale collected at one Location and fulfilled at another records both Locations while neither record is rewritten after the Sale completes |
| R18 | An authorized user can run a bounded single-Location or all-granted-Location report with roll-up and drill-down while the result set never exceeds the caller's granted Location Scope and fiscal and timezone bucketing stay unchanged at every level |
| R23 | Tax Identity resolves from a Business default with per-Location override of legal name, tax registration number, invoice address, Receipt prefix and sequence, and local tax defaults, while the resolved values are copied onto the Receipt at Sale completion and never change afterward |
| R25 | Sales completing concurrently at one Location draw contiguous Receipt numbers from that Location's sequence without a gap or a duplicate |

### E · Time and data integrity

| Req ID | Requirement |
|---|---|
| R19 | Time is stored in UTC while a Business timezone default and per-Location overrides govern schedules, availability, display, and date bucketing |
| R20 | Every operational record created before the Location model existed resolves to exactly one Location after backfill, and no record stays locationless |

---

## Fails if

| Gate | Fails if |
|---|---|
| Chain onboarding | Ops needs a workaround for Location 2 through N |
| Data leakage | Any cross-Location path exists, including notifications, exports, and subscriptions. Zero, not a target |
| Money per Location | A VAT filing cannot be produced per Location |
| Upgrade path | Any operator data migration is required |
| Ambiguity | Any surface is unclear about the active Location, or any write lands somewhere by fallback |
| Rollout | Default-Location fallback code is still in the repo after rollout |
