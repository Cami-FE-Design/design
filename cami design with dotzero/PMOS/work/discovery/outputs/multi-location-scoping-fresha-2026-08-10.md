# Multi-Location Scoping, Fresha Point of View

**Owner:** Michelle (Product)
**Date:** 2026-08-10
**Status:** ⏳ Discovery, not a PRD
**Purpose:** Size the multi-location gap using Fresha's shipped model as the reference implementation. Fresha is the incumbent SOTA is churning off and the system a Chaps & Co style chain already expects, so their scoping decisions are the baseline our merchants will compare against.

**Builds on:** `docs/specs/multilocation-fresha-reference.md` (the Fresha competitive reference, pulled 2026-08-10). That doc is the *what Fresha does* record. This doc is the *what it means for Cami* layer: the gating decision, the module-by-module gap, sequencing, and owners.

**Related law:** ADR-009 (single-location v1, multi-location post-SOTA), INV-B4 (single location per business entity at v1), INV-10 (a default beats a setting, every setting declares its Business/Location inheritance level), INV-01 (financial records append-only), INV-A1 (four roles), INV-B3 (deposit rules vary by service), INV-B7 (staff overlap), ADR-007 / ADR-020 / 06 §9.4 (stored value), ADR-024 (reporting pipeline unbuilt).

**Other sources:** Fresha help center (locations, catalog, team, reports, payments, gift cards), `docs/specs/cami-domain-model.md` (open questions 1 and 12), `docs/specs/product-module-erd.md` (Q10).

---

## TL;DR

1. **Two gating decisions, not one.** (a) Is Chaps & Co one business with 9 locations, or 9 workspaces? Fresha ships both models and they are not interchangeable. (b) Is Location an attribute or a partition? Cami's glossary says attribute (a label on the booking). Fresha behaves as a partition. Attribute is free today and expensive at the first two-site customer.
2. **In UAE, (a) is a legal question before it is a product question.** If each branch holds its own trade license and TRN, it needs its own VAT invoice sequence and its own payout, which pushes toward workspaces or toward a very hard location partition. Confirm the Chaps & Co legal structure before designing.
3. **Fresha's split is worth copying: money, inventory, and time are per location. Identity and marketing are shared.** Client DB, campaigns, activity feed, and brand are workspace-wide. Schedules, staff assignment, service allocation, stock, reports, and bank accounts are per location.
4. **Fresha is flat, and that is the gap Cami should beat them on.** Fresha has no general business-default to location-override model (the one exception is advanced pricing for service price and duration, which does have base, override, reset). INV-10 already obliges Cami to declare an inheritance level per setting. Doing that properly is a real differentiator for a 9-site ops manager.
5. **Multi-location is not one feature. It is a scope dimension added to twelve existing modules.** Estimate by module count, not by "add a location switcher."
6. **Two free moves right now, both expiring:** add location to the reporting fact tables before ADR-024's pipeline is built, and bind the terminal to a location rather than a business. Both are small today and breaking changes later.

---

## 1. Two levels of "multi", pick before anything else

From the reference doc. Fresha ships both, and they are different products.

| Level | What | Shared | When used |
|---|---|---|---|
| **Multiple locations in one workspace** | Branches under one business entity | Client DB, catalog, brand, campaigns. Reports roll up. | Same business, many branches |
| **Multiple workspaces** | Separate businesses, same login, switch via Workspaces tab | Nothing | Franchises, separate legal entities |

The reference doc's call: Cami's Tier 1 need is **locations within one business entity**, not separate workspaces. Agreed as the default, with one caveat that has to be checked rather than assumed.

**The UAE caveat.** Multi-branch groups in the UAE frequently hold a separate trade license and TRN per branch. Where that is true, the branch needs its own VAT invoice sequence, its own tax return, and often its own bank account. Fresha's answer to that is workspaces, not locations. If Chaps & Co is 9 legal entities, "one business, 9 locations" is the wrong container and no amount of location scoping fixes it.

**Action:** confirm the legal structure of Chaps & Co (one entity or nine) before the partition decision. It changes the answer.

---

## 2. The gating decision: attribute or partition

`docs/specs/cami-domain-model.md` open question 1. Restating because everything below depends on it.

| | Attribute (Cami today) | Partition (Fresha's effective behavior) |
|---|---|---|
| Data shape | `location` is a label on the appointment. No Branch object. | Hard FK on appointment, sale, stock, shift, service price, resource. |
| Stock | Shared across sites | Per site |
| Till / payouts | One | One per location, separate bank accounts |
| Reporting split | Filter with no index behind it | Native dimension |
| Cross-location reschedule | Trivially possible | Not supported by Fresha |
| Cost to change later | High. Requires backfilling location onto append-only financial records (INV-01) | n/a |

Fresha gates location deletion on no future appointments, no pending stock orders, and no unpaid invoices. That gate is only necessary if those objects carry a hard location key, which is the tell that Fresha is a partition regardless of how the help docs phrase it.

**Recommendation:** partition, with a short deliberate list of workspace-scoped exceptions (section 3). The cross-location reschedule advantage is preservable under a partition model as an explicit move operation. It is not preservable in reverse: you cannot retro-add a partition to append-only ledger rows.

**Why this is urgent and not post-SOTA.** INV-01 makes every sale, payment, and refund append-only. Each week the decision stays open is another week of financial history with no location dimension. Chaps & Co in Q4 does not just need the feature, it needs history that splits by site.

---

## 3. What Fresha scopes where

Merged from the reference doc plus the catalog, team, reports, and gift-card help pages.

### Per location

| Object | Notes |
|---|---|
| Schedules and opening hours | Closed periods selectable per location |
| Team member assignment | Staff assigned to selected locations or all. Has a **primary location** (in Fresha this drives which billing profile is charged for their seat). |
| Service allocation | Which services are offered at which location |
| Service price and duration | Fresha's "advanced pricing": base is the default, location and team member create overrides, explicit Reset returns to default. **The one place Fresha does model inheritance.** |
| Smart pricing / promotions | Selectable by location, service, and team member |
| Product sales and stock | Managed independently per location |
| Reports | Native dimension. Performance summary and performance over time both split by location or team member. |
| Bank account and payout | Multiple billing profiles, payouts route per location |
| Location profile | Display name (public), internal name (team-only), contact number, email, address, business type (main and secondary). Name and address appear on receipts and in online booking. |

### Shared across the workspace

| Object | Notes |
|---|---|
| Client database | One client, visible at any branch. Auto-merged on matching phone or email. |
| Client history and activity feed | Follows the client, not the branch |
| Marketing and blast campaigns | Segment across all locations |
| Brand and online booking presence | One public identity |
| Team member record | The person is workspace-level; the assignment is per location |
| Service catalog definition | Defined once, allocated and priced per location |

### Cross-cutting behavior

| Capability | Fresha |
|---|---|
| Context switch | One-button location switch, desktop and mobile, sets the active branch |
| Calendar | Per-location grid. Owner gets a bird's-eye view across all branches or a deep dive into one. |
| Permissions | Access levels set per team member **per location** (booking, checkout, client data). Not just a global role. |
| Reporting | Whole-business roll-up or single-location drill-down |
| Location creation | Settings, Business setup, Locations, Add, fill name / contact / type / hours, then assign team, allocate services, set marketplace profile |
| Cross-location reschedule | **Not supported** |

**The pattern:** money, inventory, and time are location-scoped. Identity (client, team member) and demand generation (brand, campaigns) are workspace-scoped. Catalog is workspace-defined and location-configured.

---

## 4. Where Fresha is weak, and Cami is already obliged to be better

The reference doc flags this and it is the sharpest strategic point in it.

**Fresha has no general inheritance model.** Config is flat: you set it per location. The single exception is advanced pricing (price and duration), which has a real base, override, and reset. Everything else appears to be per-location entry with no declared default.

**Cami is already committed to better.** INV-10 requires every setting to declare its Business or Location inheritance level before it ships. For a 9-site ops manager, flat config means changing a policy nine times and discovering the ninth was missed a month later. A declared inheritance level per setting, with a visible "inherited from business" state and an explicit override and reset, is a concrete migration reason, not a nicety.

**Cost of getting this right:** every settings surface needs a third state (inherited, overridden, reset) and every settings row needs an inheritance level declared. That is a design-system-level change, not a per-screen one. Worth costing early.

---

## 5. Where Cami breaks today, module by module

Current state: single location per business entity (INV-B4). `location` exists only as a label on `AppointmentItem`. No Branch object. Every row is a scoping decision that does not exist yet.

| # | Module | Breaks how | Fresha answer | Cami decision needed |
|---|---|---|---|---|
| 1 | Calendar | One grid, no site dimension. Staff double-booked across sites is invisible. | Per-location grid plus an all-branch bird's-eye view | Does INV-B7 staff overlap apply across locations, or is cross-site overlap a hard block? A person cannot be in two buildings. |
| 2 | Catalog | Business-level services and prices only | Workspace catalog, per-location allocation, per-location price and duration override with reset | Adopt the advanced-pricing inheritance model. Highest value per unit of effort in this doc. |
| 3 | Team | No location assignment | Assigned to selected or all locations, one primary | What does "primary location" drive in Cami? Fresha uses it for per-seat billing, which Cami does not have. Either give it a job (default calendar, report attribution) or drop it. |
| 4 | Product stock | Single stock per business (ERD Q10) | Per location | Per-location stock, or shared stock with per-location movement records? Blocks inventory reporting. |
| 5 | Payments and payouts | One merchant, one rail | Separate bank accounts per location, multiple billing profiles | Does CamiPay settle per location? Drives NeoPay merchant setup and take-rate reporting. Interacts with the legal-entity question in §1. |
| 6 | Terminal (POS) | Per-device pairing code and PIN bound to a business (ADR-022) | n/a | Terminal must bind to a location. Otherwise a device at site A shows site B's pending sales (`GET /terminal/sales`). **Small change now, breaking change later.** |
| 7 | Reports | No location dimension. Registry is per business. | Native split plus roll-up | Location as a fact-table dimension from day one. ADR-024's pipeline is unbuilt, so this is free today and a migration later. |
| 8 | Permissions | Four roles, no location scope (INV-A1) | Access level per team member **per location** | Two-dimensional model: role x location. A Manager at site A must not see site B's revenue. Fresha is more granular here than Cami's current four roles. |
| 9 | Online booking | One business, one page | Location choice in the flow, address shown, one brand | Does the client pick a location first, or pick a service and see location-filtered slots? Materially different funnel. |
| 10 | Marketing and campaigns | Business-scoped by default | Shared, segmented across all locations | Confirm shared is right for Cami. A campaign that fills site A and empties site B is a real failure mode. |
| 11 | Comms / Unibox | One WhatsApp number per business | Fresha has no inbox at all | One number for the chain or one per site? Routing, assignment, and after-hours AI all inherit this. See §7. |
| 12 | VAT invoicing | Sequence per business | Not documented publicly | Does the tax invoice number sequence per business or per location, and can it reset? Domain model open question 12. Hard compliance blocker, and §1's legal-entity answer decides it. |

---

## 6. Stored value across locations

Separated out because it is the class of decision that silently loses money, and both Fresha's docs and Cami's are currently silent.

| Object | Question | Fresha | Risk if unanswered |
|---|---|---|---|
| Gift card | Redeemable at any site, or only where sold? | Business-issued cards are venue-scoped. Marketplace cards are cross-business. Ties to ADR-007 and 06 §9.4. | Customer buys at site A, refused at site B. Or accepted, and the revenue lands on the wrong site's books. |
| Package sessions | Redeemable at any site? | Not documented. Ties to ADR-020 (entitlement list). | Same, plus entitlement drawdown racing across two tills. The INV-07 hold must be workspace-scoped even if redemption is location-scoped. |
| Deposit | Taken for site A, appointment moves to site B | n/a, Fresha cannot move across locations | A deposit is a liability (INV-P10). Moving the appointment must move the liability, or one site carries a liability against another site's revenue. |
| Payment policy and deposit rules | Do they vary per location? | Fresha silent | INV-B3 already varies deposit rules by service. Adding a location dimension makes it service x location, which needs the §4 inheritance model to stay usable. |
| Credit | Refund credit issued at site A | Not documented | Same shape as gift card. |

**Recommendation:** stored value is issued at a location and redeemable across the business by default, with the inter-site value transfer written as an explicit ledger event so each site still reconciles. Merchant-configurable only if a real merchant objects (INV-10).

---

## 7. Two places Cami beats Fresha

Worth designing for deliberately rather than discovering later.

**Cross-location reschedule.** Fresha cannot do it. Layla's dominant workload is managing change, and in a 9-site chain "can you fit me at the Marina branch instead" is routine. Under a partition model this is an explicit move operation: reassign location, reassign staff, move the deposit liability, notify both sites' staff. Buildable, and a named migration reason for a chain leaving Fresha.

**Cross-location conversational routing.** Fresha has no inbox, so there is no incumbent behavior to match. Open: does the chain run one WhatsApp number with location routing, or one per site? One number is better for the customer (they message the brand) and harder to build (the AI must resolve which site before offering slots). One per site is easier and matches how these businesses run today. **This is a discovery question for Chaps & Co, not a desk decision.**

---

## 8. Suggested sequencing

Not a commitment, a shape. Assumes one business with many locations, and partition.

| Phase | Scope | Rationale |
|---|---|---|
| 0, now, pre-SOTA | Add the location dimension to the data model and the reporting fact tables. Bind terminal to location. No UI. | Append-only history (INV-01). Reporting pipeline unbuilt (ADR-024), so the dimension is free today. Both moves expire. |
| 1 | Location entity and profile, location switcher, per-location calendar plus all-branch view, team location assignment, service allocation, per-location catalog pricing | Fresha parity, the visible core |
| 2 | Per-location stock, payouts, VAT sequencing, permissions x location, the §4 inheritance model across settings | The money, compliance, and control layer. Gate Chaps & Co on this, not on phase 1. |
| 3 | Cross-location reschedule, cross-location stored value, chain-level roll-up reporting | The beat-Fresha layer |
| 4 | Unibox routing model | Depends on phase 3 discovery with a real chain |

---

## 9. Open questions, needs owners

| # | Question | Blocks | Suggested owner |
|---|---|---|---|
| Q0 | Is Chaps & Co one legal entity with 9 branches, or 9 entities? Locations or workspaces? | Q1, Q2, Q4. Wrong container invalidates the whole design. | Michelle + Commercial |
| Q1 | Location: attribute or partition? | Everything | Michelle + Faisal |
| Q2 | Does the VAT tax invoice number sequence per business or per location, and can it reset? | Compliance, cannot ship multi-site without it | Michelle + accountant (GNK) |
| Q3 | Is stored value (gift card, package, deposit, credit) redeemable across locations? | Checkout, ledger, per-site reconciliation | Michelle + Sham |
| Q4 | Does CamiPay settle per location or per business? | NeoPay merchant setup, take-rate reporting | Maaz + NeoPay |
| Q5 | Permission model: role x location, or Fresha-style per-member per-location access levels? | INV-A1 extension | Michelle |
| Q6 | Per-location stock, or shared stock with per-location movements? | Inventory, ERD Q10 | Product + eng |
| Q7 | One WhatsApp number per chain or per site? | Unibox architecture, AI Receptionist | Discovery with Chaps & Co |
| Q8 | Does cross-location staff overlap follow INV-B7, or is it a hard block? | Calendar rules | Michelle |
| Q9 | Do payment policy and deposit rules gain a location dimension on top of service (INV-B3)? | Checkout config, inheritance model | Michelle |
| Q10 | What inheritance states does the design system need (inherited, overridden, reset), and on which settings? | §4 differentiator, design-system-level cost | Michelle + design |

---

## 10. What to do next

1. Answer Q0 with Commercial. It is a phone call and it invalidates the rest if wrong.
2. Run Q1 to a decision and write it as an ADR. It gets more expensive every week it stays open.
3. Land the two expiring free moves: location on the reporting fact tables, terminal bound to location.
4. Book a Chaps & Co discovery session against sections 3, 5, 6, and 7. Nine sites is the real requirements document. This file is a hypothesis about it.

---

## Sources

**Internal**
- `docs/specs/multilocation-fresha-reference.md` (Fresha competitive reference, 2026-08-10)
- `docs/specs/cami-domain-model.md` (open questions 1, 12)
- `docs/specs/product-module-erd.md` (Q10)

**Fresha help center**
- [Create and manage business locations](https://www.fresha.com/help-center/knowledge-base/workspace-settings/244-create-and-manage-business-locations)
- [Manage business locations](https://www.fresha.com/help-center/knowledge-base/workspace-settings/100677-manage-business-locations-1)
- [Create a new workspace](https://www.fresha.com/help-center/knowledge-base/workspace-settings/40-create-a-new-workspace)
- [Set advanced pricing and durations](https://www.fresha.com/help-center/knowledge-base/catalog/76-set-advanced-pricing-and-durations-)
- [Separate bank accounts for multiple locations](https://www.fresha.com/help-center/knowledge-base/payments/217-set-up-separate-bank-accounts-for-multiple-locations)
- [Manage team permissions](https://www.fresha.com/help-center/knowledge-base/team/49-manage-team-permissions-and-access-levels)
- [Manage report access for team members](https://www.fresha.com/help-center/knowledge-base/reports/192-manage-report-access-for-team-members)
- [How clients use gift cards](https://www.fresha.com/help-center/knowledge-base/packages-memberships-and-gift-cards/97-understand-how-clients-use-gift-cards)
- [Fresha clients](https://www.fresha.com/help-center/knowledge-base/clients)
- [Easy ways to manage multiple locations](https://www.fresha.com/blog/easy-ways-to-manage-multiple-locations)
