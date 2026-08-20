# Multi-location — Fresha competitive reference

**Purpose:** How Fresha (incumbent, closest structural analog) handles multi-location, as the business-requirements baseline for Cami's multi-location design.
**Status:** Reference only. Not a Cami spec. Source: Fresha public help center + blog, pulled 2026-08-10.
**Related:** ADR-009 (single-location v1, multi-location post-SOTA), INV-B4 (single location per business entity at v1), INV-10 (default beats a setting / inheritance level), competitors.md (Fresha).

---

## Fresha's two levels of "multi"

| Level | What | When used |
|---|---|---|
| **Multiple locations in one workspace** | Branches under one business entity. Shared client DB, catalog, brand. Reports roll up. | Same business, many branches. **This is Cami's Tier 1 target (Chaps & Co, 9 locations).** |
| **Multiple workspaces** | Separate businesses. Same login, switch via Workspaces tab. No shared data. | Franchises / separate legal entities |

Design decision for Cami: Tier 1 need is **locations within one business entity**, not separate workspaces.

---

## Scope: what is per-location vs shared

### Per-location (independent per branch)
- Schedules / opening hours
- Team member assignment (staff assigned to specific locations)
- Services allocation (which services offered at which location)
- Product sales + stock
- Reports (per-location performance)
- Bank account (payouts can route to different accounts per location)
- Online booking page (each branch has its own bookable page)
- Location profile: display name (public), internal name (team-only), contact number, email, address, business type (main + secondary)

### Shared (one record across all branches)
- Client database (one client, visible at any branch)
- Marketing / blast campaigns (segment across all locations)
- Activity feed / client history
- Brand / marketplace identity (the booking page itself is per location, above)

---

## Cross-cutting capabilities

| Capability | Fresha behavior |
|---|---|
| **Switch context** | One-button location switch, desktop + mobile. Sets active branch. |
| **Calendar** | Per-location grid. Owner gets bird's-eye across all branches OR deep-dive into one. |
| **Permissions** | Access levels set per team member, per location (booking / checkout / client data). |
| **Reporting** | Whole-business roll-up OR single-location drill-down. |

---

## Location creation flow (Fresha)
Settings → Business setup → Locations → Add (+) → fill name / contact / type / hours → then assign team members, allocate services, set marketplace profile.

---

## Gaps in Fresha docs (open questions for Cami)
- **Inheritance / override rules** not documented. Fresha appears flat (config per location), no explicit business-default → location-override. Cami has INV-10 ("a default beats a setting", every setting declares its Business/Location inheritance level) — so Cami should be sharper here than Fresha.
- **Memberships / gift-card / package scope across locations** not stated. Open for Cami too: does a gift card sold at branch A redeem at branch B? Ties to ADR-020 (package entitlement), ADR-007 / 06 §9.4 (gift-card scope).
- **Deposit rules, payment policy per location** — Fresha silent. Cami INV-B3 deposit rules already vary by service; add location dimension?

---

## Sources
- [Create and manage business locations](https://www.fresha.com/help-center/knowledge-base/workspace-settings/244-create-and-manage-business-locations)
- [Easy ways to manage multiple locations](https://www.fresha.com/blog/easy-ways-to-manage-multiple-locations)
- [Separate bank accounts for multiple locations](https://www.fresha.com/help-center/knowledge-base/payments/217-set-up-separate-bank-accounts-for-multiple-locations)
- [Create a new workspace](https://www.fresha.com/help-center/knowledge-base/workspace-settings/40-create-a-new-workspace)
