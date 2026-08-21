# Multi-location — primer

**Owner:** Michelle (Product) · **Updated:** 2026-08-11 · **For:** engineers joining multi-location · **Read:** 5 min
**Status:** Orientation, high-level.

---

## What "multi-location" means

One business running **multiple branches** (venues/addresses) under a single business entity. Example: a salon chain with 9 shops. Today Cami assumes **one location per business**. Multi-location lifts that.

Not the same as multiple *businesses* (separate companies each with their own login). That's a different, simpler case. Our target is **many branches, one business**.

Workspace holds one business (Chaps & Co), which contains nine location branches; what is shared vs owned per location

---



## Why it matters to Cami

- Named the **next big priority after we prove the product on SOTA** (our first Tier 2 win).
- It's the gate to **Tier 1** — chains like Chaps & Co (9 locations), our biggest-revenue accounts.
- It also unlocks new categories (group bookings, boarding) and proves the scheduling engine is generic.

---



## Jobs to be done

Who needs multi-location, and the job each is trying to do (multi-location framed).


| Role             | Job to be done                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Owner**        | "When I check on the business, I want end-of-day revenue per branch, so I can see what's working without calling each location."                                   |
| **Manager**      | "When I run my branch, I want to manage its schedule, staff, and takings without seeing other branches, so I stay focused and each branch's numbers stay private." |
| **Receptionist** | "When a client wants a slot at another branch, I want to move or book it there in the thread without losing the deposit, so I never turn them away."               |
| **Receptionist** | "When someone books, I want their full history even if they usually visit another branch, so I don't treat them as new or double-book them."                       |
| **Staff**        | "When I start my shift, I want my schedule and client notes for this branch, so I'm ready for each appointment."                                                   |


---



## Workspace, business, location

Three nested levels in Cami


| Level         | What it is                                                                                        | Example                   |
| ------------- | ------------------------------------------------------------------------------------------------- | ------------------------- |
| **Workspace** | The account container. Holds **exactly one business** (1:1).                                      | Chaps & Co's Cami account |
| **Business**  | The operator, the paying customer. Owns the catalog, clients, staff, and all its branches.        | Chaps & Co                |
| **Location**  | A physical branch under the business. Where the calendar, checkout, stock, and booking page live. | Chaps & Co Marina         |


**For Chaps & Co:** one workspace → one business → nine locations.

Because a workspace holds only one business, **multiple businesses means multiple workspaces** (each with its own login) — that's the franchise / separate-brands case, not Chaps & Co. Multi-location lives entirely inside **one business, many locations**.

---



## Where we are today

Cami runs **one location per business** today. Multi-location is not built.

This is not "add a location switcher." It's **a location dimension across ~12 modules**: calendar, catalog, team, stock, payments, terminal, reports, permissions, online booking, marketing, comms, VAT invoicing. Each is a place the product has to answer "which branch?".

Below is what the business and a location are **configured with today** (from Cami Business settings), the visible current state. What sits beneath that config in the data model, and the gaps, are yours to map (see "The core question").

### What the business holds (set once, shared across branches)

- **Business name**
- **Country** and **currency** (e.g. UAE, AED)
- **Tax calculation method** (retail prices include vs exclude tax)
- **Default languages** (team + client), each overridable per user
- **External links** (website, Facebook, Instagram, X)
- Plus the shared records: **clients, team members, service catalog, marketing, stored value**

**Inheritance to notice:** the tax **method** (inclusive vs exclusive) is set once for the business, while the tax **rate defaults** (VAT 5%) are set per location. Business default → location setting is exactly the pattern to model deliberately.

Website and social links are shared, but there is still **no shared public logo** (branding not in scope yet); each location carries its own photo.

### What a location holds (its own settings)

From the current Cami location settings, a location carries its own:

- **Basic info**: location name, phone, email (shown on receipts, booking confirmations, and the public booking page)
- **Business type** (multi-select, e.g. Pet grooming, Boarding, Daycare, Dog walking; shapes service templates and the public booking page)
- **Opening hours** (when this location accepts bookings)
- **Address** (business location / map)
- **Invoicing details**: company name, billing address, **VAT number**, invoice note
- **Tax defaults**: VAT 5% on services and products
- **Receipt sequencing**: own prefix + next receipt number
- **Tipping**: options, default values, tip calculation

---



## Business requirements


| Scope                                             | What lives here                                                                                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per-location** (each branch independent)        | Appointments, opening hours, assigned staff, assigned services (with price/duration), product stock, bank account/payout, **online booking page**, location profile (name, address, contact, own photo) |
| **Shared** (one record across the whole business) | Client database + history, marketing campaigns, the staff member record itself, the service catalog definition                                                                                          |


**Pattern to remember:** money, inventory, and time are **per-location**. Identity (clients, staff) and demand-gen (campaigns) are **shared**. Catalog is defined once, then configured per location.

**Booking page is per location:** each branch has its own booking page (Fresha does the same). **No shared public branding yet** — there is no shared logo facing the public; each location carries its own representative photo.

**Cross-cutting capabilities** a chain expects: switch active location in one click, per-location calendar plus an all-branches view, permissions set **per staff per location** (a manager at branch A shouldn't see branch B's revenue), reporting that both rolls up across the business and drills into one branch, and an owner able to oversee every branch from one dashboard.

**Views vs data:** calendar and reports are business-wide **views filtered by location**; the appointments and money underneath live **per branch**. (Staff and services follow the same shape: the team member and the catalog are defined once at the business, then **assigned** to locations.)

---



## The core question: how should location be modeled?

**The product need:** money, stock, staff time, and reports must split cleanly by branch, while one client and one shared catalog span all branches (see the diagram attached). Making location structural enough to guarantee that split is the work.

**The ask:** propose the location architecture, then map it against the current build to find the gap.

---



## Open questions

- Does **CamiPay settle per branch or per business**?
- **Permissions** — role only, or role × location?

---



## Non-goals

- Separate businesses / franchises (that's multiple workspaces, not this).
- Shared public branding / logos (not in scope yet).



## References

- Eng artifacts from Ahsan & GNK (awaiting)

