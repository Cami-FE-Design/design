---
id: 01KZ1KMQXEAJCGYADHDD9BPW1F
type: meeting
title: "Roadmap: settlement, payments, reporting, and team scaling"
meeting_date: 2026-07-31
created_at: 2026-08-02T16:06:50Z
participants:
  - Maaz
  - Michelle
work_area: strategy
tags:
  - settlement
  - camipay
  - neopay
  - reporting
  - team
  - hiring
  - positioning
---

# Meeting: Roadmap, Settlement, Reporting, and Team Scaling

**Date:** 2026-07-31
**Participants:** Maaz, Michelle

---

## Settlement and payments

- **Settlement flow (NeoPay to Crescent Enterprise):** regardless of the online payment journey, once money hits NeoPay's account they same-day settle to a designated bank account. For Cami that account is **Crescent Enterprise**, where all online-payment money lands the next day (D+1). Crescent Enterprise then pays out to each merchant (a manual process). GNK is already creating the payment log for this.
- **Reconciliation loop to close:** the online payment log must let the financier (Veal) see, when money hits the Crescent Enterprise account, the payout per merchant ID and the date, then Cami billing shows those payouts were successfully paid to the merchant. Grace/reporting needs access to that settlement log (the settlement review).
- **Merchant expectation management:** merchants receive money roughly 5 days later or on a weekly basis; Cami manages this with customers so no one is chasing "where's the money."
- **Interim vs. change:** the current Crescent-based manual payout is an interim solution to not lose launch time; Crescent's process adds slowness and needs to change. Payments are already logged in the backend.
- **Terminal payments** are simpler: money comes from NeoPay directly.
- **Next payment provider: Noon.** Immediate next step after the current online setup is to add Noon Payments (easier than CCAvenue, whose interface is poor). Estimated 3 to 4 weeks. Do not change anything on the current online path meanwhile.
- **Documentation gap:** need written docs/emails from NeoPay; a critical integration cannot run on ad-hoc phone calls (the Fresha/Francis experience was chaos). This is why outside payment experts were brought in.
- **Finance/ownership:** Veal is now the official manager/financier for Cami (as of June to July), expected to speed the process. Payroll is currently slow (first-time international-bank process; Marlon, Mike, Faisal not yet paid; timesheets required; Cami's own bank account not ready).

## Go-live priorities

- **Four critical issues:** checkout, activate reminders, complete reporting, plus online bookings (not yet in QA).
- **QA discipline:** keep no more than ~3 items in QA (Marlon's guidance); pause shipping new work to help Harun move QA items to done. CamiPay and reporting need real brain power.
- **Reporting sequencing:** reporting can come after checkout, reminders, and payments, but is needed by ~the 25th (Aziz), and SOTA needs daily reporting (their accountant / Sophie checks day by day). Go live on the basics first (a good Fresha baseline), reporting follows.
- **Mobile:** staff check out on mobile (Pet Loft, Posh groomers); SOTA views the calendar. Ask Hussain to audit and optimize the mobile screens as a workaround, not a full mobile app, for now.
- **Meta is the only fully out-of-control blocker** (WhatsApp).
- Pushing timelines protects against churn; aim to wrap up in August.

## Reporting and the home page (differentiator)

- **Home page = insights/analytics dashboard**, used as a differentiator against Fresha (whose home page is weak) and as a demo and design-partner tool.
- Maaz's pitch metrics (from his Fresha partner-success experience): **no-show protection, increasing average ticket, new vs. existing customers, and client retention/growth.**
- The reports engine feeds the home page (home is an advanced front end over the built-in reports). Sequence: design wraps the Linear reporting work, then the visual analytics layer on top. Anam keeps shipping reports; the home-page tickets come after.
- **Multi-merchant reporting layer:** extract key data points (sales log, appointment history) into a table / BI layer outside, per the Cami-business-to-merchant relationship, for an account-management dashboard. Faisal to design the data architecture. Consider plugging Claude/ChatGPT into the data for internal, question-based reporting ("how many appointments booked on average") rather than raw tables. Postgres backs this.

## Team and org

- **Dot zero (outsourced agency):** milestone-driven and currently behind (passed the July deadline, not paid until done). Plan knowledge transfer to Mike, aim to have everything in hand by ~Aug 15. GNK to hand over CamiPay/payments to Mike (Mike gets into it next week, ask the week after).
- **DevOps (Shardul) is separate, not fully under dot zero, pay-as-you-go.** Quality is poor (claims work done that is not: integration tests, pipelines). Action: a checklist / risk register and a complete-then-handover step; absorb some tech debt.
- **Mike (Michael):** contractor via Marlon's network, full-time at Woolworths Australia (ex-Datacom), part-time on Cami (~10 to 15 hrs, can flex up). Ran a Linear agent sweeping ~1,000 issues to map requirements vs. code vs. design gaps. Strong product-to-engineering translator; did large data migrations. Long-term: Principal / VP Engineering for the "OS" segment; could ship a full CRM version in about a week if given the time.
- **Faisal:** long-term VP Engineering for the "conversation" (WhatsApp/AI) segment.
- **Sham:** bulletproofs business logic (accounting/checkout/reporting); may scale down later.
- **Anam:** owns reporting, wants full front + back ownership, taking accountability (ex-Westpac/NAB); candidate to move in-house.
- **Ken (Kenny):** strong quiet engineer (ex-Datacom, ultra-marathoner); candidate for the first full-time senior full-stack hire. Consider canceling the external recruitment funnel in favor of Marlon's vetted network.
- **Armando:** potential scrum master / QA lead (more experienced than Harun), to run standups and estimates (~$70 USD rate); budget ~$7,000 for Armando plus a UX designer. Not in a hurry, prefers freelance.
- **Design:** Hussain is the current designer; the studio also needs broader graphic design; Pavel is an equally strong alternative.
- **Model:** scale the tech team in and out via Marlon's network as subject-matter experts for the 12-month Cami budget (2 full-stack-engineer budget, one earmarked for Michelle's allocation), rather than rushing full-time hires. Crescent's standing concern is IP retention via an in-house team eventually; acceptable to run on contractors through the 12-month lock.
- **People note:** both Michelle and Maaz are burnt out; delegation is the theme. Michelle to build the budget case for the studio (Armando + UX); no firm timeline yet.

## Commercial and positioning

- **Competitive heat:** Fresha onboards ~10 businesses/month/rep across 3 reps; Cami is struggling to bring in 1. Posh Pets already got a competitor call. Competition is on Cami's neck.
- **Positioning shift: not "booking software."** Cami is **"Cami Pay" or "Cami CRM."** CRM is the messaging anchor. WhatsApp is not rich enough on its own; Cami fixes a problem WhatsApp cannot fix itself, using its rich data intelligently. This is a core reason CRM matters (even though CRM build is parked until the core OS is solid).
- **SOTA / Fresha migration:** the key unlock is migrating existing member packages and sessions out of Fresha; cracking Fresha's data columns makes churning Fresha customers repeatable. Mike's data-migration background is the asset here.
- **Backing:** Crescent Enterprise (CEO "brother Jafar") backs Cami; the vision is to help SMBs (refinancing, better payment-processing rates). The venture-studio structure means Cami is unlikely to shut down (may pivot).
- **Tech vision (Marlon):** build a platform where merchants configure their own workflows rather than Cami building per-customer custom features, handling auth, security, database, and isolation around them (a "vibe-coding-proof" platform), with an AI-first parallel build stream.
- **Marketing:** Yara on content, plus an ad budget.

## Items that may warrant context/roadmap updates (not yet applied)

- Noon as the next payment provider after the current online path (payments roadmap).
- Crescent Enterprise as the settlement bank + the reconciliation-loop requirement (product/payments).
- Positioning as "Cami Pay / Cami CRM," not booking software (company/product messaging). **Folded into company.md.**
- Home-page analytics as a Fresha differentiator (product).
