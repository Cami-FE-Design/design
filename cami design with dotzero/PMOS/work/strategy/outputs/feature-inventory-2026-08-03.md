# Cami Feature Inventory

**Created:** 2026-08-03
**Owner:** Michelle (Product)
**Sources:** Design repo ([Cami-FE-Design/design](https://github.com/Cami-FE-Design/design.git), 60+ Next.js routes + 15 specs) + Linear **Engineering** team (250 issues, 126 top-level).

**Source tags:** 🎨 in design repo · 📋 tracked in Linear · ✅ both

---

## TL;DR

- **~23 feature modules** across both sources. Heavy overlap on core OS (calendar, sales, catalog, payments, clients).
- **Design repo ahead of Linear** on: boarding/daycare, e-sign consent, setup wizard, email templates. Built, not tracked as feature issues.
- **Linear ahead of design repo** on: WhatsApp two-way/AI agent, reminders, reviews-to-GMB, NL analytics, duplicate-merge. Planned, not designed (many Triage/Duplicate = MOAT backlog, gated on META).
- **War Room project = bugs**, not features. Excluded (31 issues, mostly polish/fixes).

---

## Merged features by module

| Module | Src | Features | Linear refs |
|---|---|---|---|
| Onboarding / Setup | ✅ | Setup wizard (business type, about, hours, location, invoicing), first-time wizard | PRO-787 |
| Auth & identity | ✅ | Sign-in, accept-invite, forgot/reset password, verify, shared OTP, Auth0 dev/prod split | PRO-908, PRO-766 |
| CamiHQ admin | ✅ | Business listing + onboarding, audit log, impersonation mode, RBAC roles/permissions | PRO-155, PRO-772, PRO-770, PRO-827 |
| Calendar / Appointments | ✅ | Multi-resource calendar, appointment popover, block time, statuses/colors, team-member reorder, linked-service group move | PRO-83, PRO-918, PRO-613, PRO-769 |
| Boarding / Daycare | 🎨 | Boarding calendar, daycare, resources view | (spec only) |
| Public booking storefront | ✅ | Branded `[slug]` booking page, existing-customer flow, booking ref, pet-parent booking | PRO-67, PRO-80, PRO-917 |
| Clients & Pets (CRM) | ✅ | Client + pet directory, add/edit, import/migration, sessions-remaining badge, duplicate detect/merge | PRO-85, PRO-767, PRO-914, PRO-935 |
| Service catalog | ✅ | Service menu, categories, packages/memberships, combos, default ordering, promotions & discounts | PRO-816, PRO-768 |
| Products / Inventory | ✅ | Product catalog, stock tracking, complimentary-consumable tracking | PRO-318, PRO-699, PRO-928 |
| Sales / POS / Checkout | ✅ | New sale, sales list, cart, checkout, void/refund, split tender, quick actions, daily summary | PRO-970, PRO-959, PRO-964 |
| Payments (CamiPay) | ✅ | CamiPay core, payment policy, custom payment types, card terminal + online PSP, contactless checkout | PRO-736, PRO-941, PRO-746, PRO-915 |
| Payment links | ✅ | Per-invoice pay link, locked cart | PRO-594, PRO-909 |
| Gift cards / vouchers | ✅ | Sell, redeem, track, gift-cards-sold report | PRO-698 |
| Invoicing | ✅ | Invoice/draft labeling, booking-confirmation email, receipt config | PRO-681, PRO-952 |
| Messaging / WhatsApp inbox | ✅ | Unibox, appointment quick messages, in-calendar messaging + templates, first-visit differentiation | PRO-595, PRO-865, PRO-923 |
| WhatsApp AI agent (MOAT) | 📋 | Two-way after-hours autonomous booking + human takeover | PRO-921 |
| Notifications & Reminders | 📋 | WhatsApp reminders, recurring-customer reminder automation | PRO-611, PRO-931 |
| Reports & analytics | ✅ | Reports module, per-report views, NL analytics over business data | PRO-703, PRO-913 |
| Team & permissions | ✅ | Team members, shifts, RBAC, real-time permission updates | PRO-898, PRO-849 |
| Consent / e-sign | 🎨 | E-sign document flow (`sign/[token]`) | (no Linear feature) |
| Global search | 📋 | Cross-module global search | PRO-955 |
| Reviews / growth | 📋 | Route post-session reviews to Google My Business, source/location tracking | PRO-933, PRO-932 |
| Platform / instrumentation | ✅ | Feature-flag framework, GA, PostHog, app monitoring | PRO-762, PRO-753, PRO-755 |

---

## Notable gaps (design ↔ Linear mismatch)

| Built in design, no Linear feature | In Linear, not yet in design |
|---|---|
| Boarding/daycare calendar | WhatsApp AI agent (PRO-921) |
| E-sign consent (`sign/[token]`) | Reminders automation (PRO-611, PRO-931) |
| Email template system (`app/emails`) | NL analytics (PRO-913) |
| Setup wizard full flow | Reviews→GMB (PRO-933) |

---

## Method / provenance

- **Design repo:** cloned `main`, mapped `app/**/page.tsx` + `app/**/route.ts` (60+ routes) and `docs/specs/*` (15 spec docs). Routes = built/designed surface.
- **Linear:** Engineering team (`PRO`), 250 issues. Top-level (parentId null) = 126. Status split: 103 Done/Live, 30 Ready for QA, 25 Ready for Production, 25 Dev In Progress, rest QA/backlog/triage.
- **Excluded:** War Room bug project, duplicate/invalid issues, sub-issues (rolled into parent module).
- **Not covered here:** Product (`PRD`), MMM (Tech 9.x / H0.x), Dsgn (`DSG`) teams. Scan was scoped to Engineering per request.
