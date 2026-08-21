# Cami Glossary (adapted from Fresha)

**Last updated:** 2026-08-03
**Source:** Adapted from the Fresha partner glossary (July 2026) against Cami context (company.md, product.md, goals.md, personas.md) and the Jul 31 2026 payments notes.
**Status:** Draft. Feeds the Cami sale/void/refund checkout-state glossary that is pending Sham and Maz sign-off. Mechanics marked ⚠︎ need product confirmation.

> Note on naming: the source doc spelled it "Kami." Correct product name is **Cami**, used throughout.

---

## TL;DR

- Cami adopts Fresha's **operating model** (free OS, payments-led, deposit-to-book), so most of the **sales, checkout, appointment, catalog, client, and CRM** vocabulary ports over cleanly.
- Four big families get **cut** because Cami does not have them: the **Fresha marketplace** (gift-card marketplace, new-client fee, online profile, reviews), the **Fresha-owned money stack** (wallet, payout, top-up, transfer, Capital, credits) which NeoPay owns not Cami, **card-on-file** and everything it unlocks (saved card, no-show fee, late-cancellation fee, recurring membership), and **parked roadmap** items (loyalty, pay runs/commission, group bookings, multi-location closed periods).
- The single most consequential gap: **no card-on-file on NeoPay today**, so Cami cannot charge **no-show fees** or **late-cancellation fees** or run **recurring memberships**. Cami's only late-money lever right now is **deposit forfeiture**.
- One deliberate naming flip from Fresha: Cami uses **"voucher"** (Fresha calls voucher "not a product term" and says gift card). Keep voucher, and carry Cami's tax rule: **no tax at issuance, tax at redemption**.
- Cami has a chance to **define gross/net/total sales cleanly once**, where Fresha's own definitions conflict across three reports.

---

## Disposition summary

| Domain | Keep / adapt | Rename | Cut now (gap) | Cut (never) |
|---|---|---|---|---|
| Sales & checkout | Raise/draft/unpaid/part-paid sale, outstanding balance, void, refund (sale/items/amount), split payment, discount, price override, manual payment type | Self checkout → WhatsApp payment link | Pay now (no card-on-file leg), tip, edit-sale/edit-window, quick payment/quick sale items | Surcharge (region rule, not UAE-live) |
| Payments & money movement | CamiPay, payment policy, deposit, in-store deposit, refund deposit, cancellation window, awaiting confirmation, chargeback | Fresha Payments → CamiPay | Capture card details, saved card, no-show fee, late-cancel fee, auto-cancel, optional full prepayment | Klarna, merchant, wallet, payout, top-up, transfer, negative balance, Fresha Capital, Fresha credits, marketplace new-client fee |
| Appointments & calendar | Booked, confirmed, completed, cancelled, no-show, cancellation reason, delete service, reschedule, walk-in, double book, preferred team member, blocked time, time off, resources | — | Group appointment, recurring appointment, waitlist, custom status, business closed period | — |
| Online booking | Lead time, booking window, cancel deadline, upselling, booking link | Booking link (WhatsApp/online booker, not marketplace) | Dynamic reassignment, gap controls, online waitlist | Fresha marketplace, online profile, unlist, book-now button |
| Service catalog | Service, menu, category, variant, add-on, add-on group, price type, advanced pricing, extra/processing time, availability, sequence, archive/delete | — | — | Treatment type (marketplace search) |
| Products & inventory | Product, category, brand, supplier | — | Track stock (tracks, does not deduct until phase 2), stocktake, stock order/transfer, internal use | Online product store |
| Clients | Client profile, notifications, tags, note, staff alert, allergy/patch-test (as intake), files, form/template/signature, segments, delete, merge | — | Block client, client wallet | — |
| Loyalty | — | — | — | Points, tier, reward, referrals (all parked) |
| Bundles/memberships/vouchers | Service bundle, membership (one-time), memberships sold, pause/cancel/delete, voucher (gift card), extend | Business gift card → Voucher | Recurring membership (needs card-on-file), client wallet balance | Fresha gift card (marketplace) |
| Team & permissions | Team member, archive/suspend/delete, scheduled shift, permission role, assign/delete role, report access | — | Timesheet, commission (open Q), enriched profile | Pay run, pay period, pay adjustment, wages (parked), job title depth |
| Marketing | WhatsApp broadcast, automation, appointment reminders, rebook reminder, segments, campaign metrics, text balance | Blast campaign → WhatsApp broadcast | Win-back, birthday, deals/promotions/flash/smart pricing | Client review (no marketplace) |
| Reports & metrics | Gross/net/total sales (define cleanly), discounts, VAT, refunds, voucher sales, sale-vs-payment date, deposit collection vs redemption, liability, EOD revenue, by service/staff, walk-ins | — | Occupancy, upsell%, new/returning/rebooked, dashboards, custom reports, data connector | — |
| Account & setup | Workspace, business location, opening hours | — | Multi-location (parked) | Fresha plan subscription, billing add-ons, Fresha verified |

---

## Naming translations (Fresha → Cami)

| Fresha | Cami | Why |
|---|---|---|
| Fresha | Cami | Brand |
| Fresha Payments | **CamiPay** | Cami's checkout, on the **NeoPay** rail behind a provider abstraction (NI / NeoPay / Stripe) |
| Self checkout / payment link (SMS, 12h) | **WhatsApp payment link** | Per-invoice unique link, sent in-thread. Online link is Cami's live go-live path; SMS/email are interim, WhatsApp gated on META |
| Blast campaign | **WhatsApp broadcast** | Segmented WhatsApp broadcast with template approval and opt-outs |
| Business gift card | **Voucher** | Cami keeps "voucher." Tax rule: no tax at issuance, tax at redemption |
| Business wallet / payout / settlement | (owned by NeoPay) | Cami owns the **commercial record**; the provider moves money. Do not port wallet vocabulary as Cami's own |
| Merchant (booth renter, multi-merchant split) | — | No self-employed-split model at v1 |
| Fresha marketplace / online profile | — | Cami's front door is the **WhatsApp thread + AI Receptionist**, not a consumer marketplace |

---

## Gaps to decide (flagged for product)

These are Fresha concepts Cami needs an explicit position on. Ranked by commercial weight.

| # | Gap | Why it matters | Fresha's answer | Cami's current state |
|---|---|---|---|---|
| 1 | **Card-on-file** (capture card details / saved card) | Unlocks no-show fees, late-cancel fees, recurring memberships, one-tap Pay now. Highest-leverage missing lever | Stores card at booking (not a hold), charges fees later | **Not available** on NeoPay. Card not stored. Deposit forfeit is the only late-money lever |
| 2 | **No-show fee / late-cancellation fee** | No-shows are the core pain (15-25% UAE rate, ~AED 22.5K/mo leak). Fee is the monetized fix | Deduct from deposit or charge saved card, whole % | Gated on gap 1. Today: retain deposit only, plus no-show rebook follow-up |
| 3 | **Settlement / payout vocabulary boundary** | Reconciliation and "where's my money" support questions. Cami owns the record, NeoPay owns the money | Wallet, available vs pending, payout schedule | Undefined. Need a clear line: what Cami reports vs what NeoPay settles |
| 4 | **Gross vs net vs total sales** | Fresha's definitions conflict across 3 reports. Cami can define once, cleanly, and win on trust | Conflicting, tax treatment varies by workspace | Undefined. Opportunity to set canonical formulas in the Cami reporting spec |
| 5 | **Tip and commission handling** | Open question in goals: pass-through vs margin applied. Affects take-rate and staff pay | Tips split by service value, auto into pay runs; tiered/fixed commission | Open. Pay runs and commission parked |
| 6 | **Terminal (POS) checkout states** | Terminal drives most volume (walk-in, less-digital). Still in architecture, gated on NeoPay | Void for cash/manual, refund for card | Online-first interim. Terminal void/refund states pending NeoPay + Marlon security review |
| 7 | **Waitlist** | Validated demand ("Is there a waitlist?") with no system | Waitlist entry, type, priority | Not built. Opportunity, not a port |
| 8 | **Auto-cancel on unpaid deposit** | Deposit-to-book implies a hold-then-drop rule | 1-72h after booking or before start | Only the 5-min online-booker slot hold is documented. Define the deposit auto-cancel window |
| 9 | **Recurring membership** | Membership consumption tracking exists; recurring billing does not | Charges saved card on renewal | Gated on gap 1. One-time memberships only for now |
| 10 | **Inventory deduction at POS** | Retail sold through checkout | Deducts stock at sale | v1 **tracks** stock but does **not deduct** until phase 2 |
| 11 | **Add-on pricing vocabulary** | Cami monetizes WhatsApp and reminders on top of processing margin. Fresha has no equivalent | n/a (subscription + marketplace) | Needs its own terms (WhatsApp add-on, reminder add-on, text balance) |
| 12 | **Chargeback flow ownership** | Will happen on card. Who fights it, what deadline | Bank-initiated, 5-day evidence, fee + penalty from wallet | Undefined. NeoPay mechanics + Cami's merchant-facing flow to define |

---

## The Cami glossary

### Confusable clusters (read these first)

#### 1. Void vs Refund vs Cancel

| Term | State of the money | In reports | Reversible |
|---|---|---|---|
| **Void a sale** | Nothing returned to client. Cancels out a completed **cash/manual** sale. Voucher credit returns to voucher | Removed from totals; sale stays visible in the list | No. Correcting action is a new sale |
| **Refund a sale** | Money already processed goes back. **Card** refund reaches client in a few working days ⚠︎ (NeoPay timing to confirm) | Stays as its own transaction, dated by refund date | No. You would take a new payment |
| **Cancel an appointment** | No sale yet. Money moves only via deposit retention | Feeds cancellation/no-show reporting; no sales impact | No undo; rebooking is the path |

Void is chosen by **tender type, not timing**: void for cash/manual, refund for card. This split is the spine of Cami's pending checkout-state glossary.

#### 2. Draft vs Unpaid vs Part-paid sale

| Term | Sale raised | Money captured | Editable after |
|---|---|---|---|
| **Draft sale** ⚠︎ confirm | No, saved cart only | None | Fully editable until checkout |
| **Unpaid sale** | Yes | Zero; full amount sits as balance | No. Refund and re-raise |
| **Part-paid sale** | Yes | Deposit taken; remainder open | No. Captured portion needs refunding |
| **Split payment** (contrast) | Yes | Full total across methods, one receipt | Settles in full, no balance |

Cami's core commercial model (**deposit to book, balance at completion**) is the part-paid sale made mandatory.

#### 3. Cancel vs No-show vs Delete

| Term | When | Slot & record | Reversible |
|---|---|---|---|
| **Cancel** | Today or future appointments | Frees slot, notifies client ⚠︎, stores reason, keeps record | No undo |
| **No-show** | After start time | Slot stays consumed, recorded on client profile | Status yes (undo no-show). **No fee today** |
| **Delete** | One service line, before checkout | Removes that service and its duration | No |

Note the divergence from Fresha: Cami's **No-show has no chargeable fee** until card-on-file exists. Today it is a status plus an automated rebook follow-up.

#### 4. Deposit forfeit (Cami's only late-money lever)

| Term | Trigger | Collected how | Reversible |
|---|---|---|---|
| **Deposit forfeit** | Cancellation outside the refund window on a non-refundable deposit | No new charge. Existing deposit kept, a staff decision on the cancel screen | No, but refunding it anyway is a separate deliberate action |
| ~~No-show fee~~ | — | Requires card-on-file. **Not available** | — |
| ~~Late-cancellation fee~~ | — | Requires card-on-file or deposit retention. **Deposit retention only** today | — |

#### 5. Deposit vs Prepayment vs Voucher

| Term | Taken at booking | Who decides | Later |
|---|---|---|---|
| **Deposit** | Yes, % or fixed part of appointment value | Payment policy, auto on qualifying bookings | Auto-reconciled and redeemed against the sale at checkout |
| **Optional full prepayment** ⚠︎ confirm | Yes, the whole amount | Client, voluntary | Applied at checkout; refundable before start except any non-refundable portion |
| **Voucher** | n/a (bought separately) | Client buys stored value | Redeemed at checkout. **No tax at issuance, tax at redemption** |

#### 6. Bundle vs Membership vs Voucher

| Term | What the client buys | Redeemed | Billing |
|---|---|---|---|
| **Service bundle** | Several services in one appointment | One menu item, run in sequence or parallel | One-off |
| **Membership** | Services across multiple appointments, session-counted | Selected at checkout; sessions decrement (consumption tracking) | **One-time only today** (recurring needs card-on-file) |
| **Voucher** | Stored monetary value with a code | Chosen as a payment method; partial redemption supported | Revenue recognized per Cami tax rule (tax at redemption) |

---

### Terms by domain

#### Sales & checkout

- **Raise a sale.** Ring up a transaction so payment and items record against the client. Builds a cart, takes payment, creates a completed sale plus a receipt sent over WhatsApp in one tap. Reversible: partially (refund or void).
- **Draft sale.** ⚠︎ confirm Cami supports. A saved, unfinished cart, no money captured, excluded from financials until checkout. Reversible: yes.
- **Unpaid sale.** A raised sale with zero collected; full amount sits as an outstanding balance. Not editable; refund and re-raise to change. Settle later.
- **Part-paid sale.** Deposit captured, remainder open on the same sale. Cami's default checkout shape.
- **Outstanding balance.** Money still owed on a sale not paid in full. Cleared when the balance is collected.
- **WhatsApp payment link** (Fresha "self checkout"). Per-invoice unique link sent in-thread; client pays from their phone. Cami's **live online path**. Interim over SMS/email; WhatsApp delivery gated on META. Reversible: unpaid link expires; once paid it is a card payment needing a refund.
- **Split payment / split tender.** One sale paid with more than one method, one receipt, settles in full.
- **Void a sale.** Cancel a completed **cash/manual** sale so it stops counting. Stays visible in the list, removed from totals, voucher credit returns to the voucher. Not reversible.
- **Refund a sale / Refund items / Refund amount.** Give money back on a processed sale, whole or itemized or as a goodwill sum. Creates a new transaction; original status becomes Refunded. Not reversible.
- **Discount (at checkout).** Fixed or % off an item or the whole cart. Recalculates VAT and charges. ⚠︎ Persona guardrail: staff can discount to zero and comp friends, so this needs **permission limits and logging** (see permission role).
- **Price override.** Type a different item price instead of a %. Recalculates VAT.
- **Manual payment type.** Log money taken outside CamiPay (cash, transfer) for records. **Cash matters** for Tier 3 cash-heavy operators. Cash sales are the ones eligible for **void, not refund**.
- ~~Surcharge~~ (cut): passing card-processing cost to the client is a US/CA/AU/NZ rule, not UAE-live.
- **Pay now** ⚠︎ adapt: one-tap charge from the appointment. Fresha's version can charge a saved card; Cami's cannot (no card-on-file), so Cami Pay now = terminal or link only until gap 1 closes.
- **Tip** ⚠︎ open: pass-through vs margin is an open commercial question (goals). Do not finalize the definition yet.

#### Payments & money movement

- **CamiPay** (Fresha "Fresha Payments"). Cami's card processing, in person and online, on the **NeoPay** rail behind a provider abstraction (NI / NeoPay / Stripe). Cami owns the commercial record; the provider moves and settles money.
- **Payment policy.** The rule that decides whether clients pay a deposit to book. Cami default: **deposit to book, balance at completion** (aggressiveness Medium). ⚠︎ "Capture card details" policy type not available (no card-on-file).
- **Deposit.** Part-payment at booking, % or fixed, auto-reconciled and redeemed against the sale at checkout. Refundable only within the window you set.
- **Collect deposit now (in-store deposit).** Deposit taken face to face. ⚠︎ Terminal is still in architecture, so in-store capture is gated on the NeoPay terminal path.
- **Refund a deposit.** Return a booking deposit; provider processing fees still apply. Not reversible.
- **Cancellation window.** Grace period before an appointment during which cancelling is free; doubles as the deposit refund window.
- **Appointment awaiting confirmation.** A booking pending the deposit being paid. ⚠︎ Define the **auto-cancel** window (gap 8); today only the 5-min online-booker slot hold is documented.
- **Chargeback** ⚠︎ gap. Client disputes a card charge via their bank. NeoPay mechanics and Cami's merchant-facing evidence flow to be defined.
- ~~Capture card details, saved card, no-show fee, late-cancellation fee, auto-cancel-on-card, optional-full-prepayment-via-saved-card~~ (cut now, gaps 1-2): all depend on card-on-file, not available on NeoPay.
- ~~Klarna, merchant, business wallet, available/pending balance, payout, transfer, top-up, negative balance, wallet adjustment, Fresha Capital, Fresha credits, marketplace new-client fee~~ (cut): marketplace or Fresha-owned money-stack concepts. Wallet/payout/settlement belong to NeoPay, not Cami's glossary (gap 3).

#### Appointments & calendar

- **Booked / Confirmed / Completed / Cancelled / No-show.** Appointment statuses. Align these exactly with the checkout-state glossary. Confirmed is reached when the deposit is paid.
- **Cancellation reason.** Stored on cancel; feeds reporting.
- **Delete (a service from an appointment).** Removes one service line before checkout.
- **Reschedule.** ⚠︎ **Highest-value flow for the champion user (Layla).** Her core job is managing change, not new bookings. Reschedule from the thread with **client-notify plus internal staff-notify** built in.
- **Walk-in.** In-person, unbooked. Tier 3 is cash-heavy walk-ins; terminal drives most walk-in volume.
- **Double book.** ⚠︎ Validated need: same client books across WhatsApp, Instagram, and direct-to-stylist. Needs **duplicate detection + future-appointments view + alerts**.
- **Preferred team member.** Pet/client-to-professional affinity ("Is Mike free to trim Yumi").
- **Blocked time / Time off.** Hide a slot for one team member (blocked time) or a whole day (time off).
- **Resources.** Bookable rooms and equipment on the multi-venue calendar.
- ~~Group appointment, recurring appointment, waitlist, custom status, business closed period~~ (cut now, gaps 7 and roadmap): group bookings and multi-location are parked; waitlist is unbuilt demand.

#### Online booking

- **New appointment lead time / Booking window / Cancellation deadline.** Notice period, future-booking limit, and the client self-service cancel/reschedule cutoff.
- **Service / membership upselling.** Cross-sell at booking; maps to Cami's AI **next-visit recommendation** and cross-sell goal.
- **Booking link.** Cami's booker link (WhatsApp thread + online booker), **not** a marketplace listing.
- ~~Fresha marketplace, online profile, unlist, book-now button, dynamic reassignment, gap controls, online waitlist~~ (cut): no consumer marketplace.

#### Service catalog

- **Service / Service menu / Category.** The bookable menu and its groupings; category color identifies appointments on the calendar.
- **Service variant / add-on / add-on group.** Variant replaces the base config (exclusive); add-on stacks on top (additive). ⚠︎ Relevant to **consultation-gated services** (extensions, color) that have no fixed price: a "book consult / send range" path separate from fixed-price booking.
- **Price type / Advanced pricing and duration.** Per-item price model, plus per-staff and **per-location** overrides (multi-venue).
- **Extra time / Processing time.** Gaps within a service (color developing, grooming drying) that free the staff member.
- **Service availability / Set booking sequence / Archive / Delete.** Availability windows, ordering, and non-destructive archive vs permanent delete.
- ~~Treatment type~~ (cut): a marketplace search classifier.

#### Products & inventory

- **Product / Product category / Brand / Supplier.** Retail catalog basics.
- **Track stock** ⚠︎: v1 **tracks** stock levels but does **not deduct at POS** (phase 2, gap 10).
- ~~Stocktake, stock order, stock transfer, internal use, online product store~~ (cut now / never): mostly phase 2; no online retail store.

#### Clients

- **Client profile.** First-class client record. Horizontal CRM layer, serves every vertical unchanged.
- **Appointment / marketing notifications.** Per-client consent and opt-outs.
- **Client tags.** Labels including lead tagging in the unibox.
- **Client note / Staff alert.** Context the service staff (Sami) needs: "the doodle with the allergy, or the one that bites." Alerts surface at booking and checkout.
- **Allergy / patch test** (as **intake**). Generalize across verticals: pet allergy, salon patch test, clinic intake. Captured via consent forms.
- **Client form / Consultation form / Form template / Signature.** Digital intake and consent, **e-signed over WhatsApp**, stored on the record, templates configurable per business type (Cami ships defaults, business overrides).
- **Client segments.** Behavioral segments for campaigns (for example active in the last 60 days).
- **Delete client / Merge profiles.** Remove or de-duplicate. ⚠︎ Merge is directly tied to the cross-channel double-book problem.
- ~~Block client, client wallet~~ (gap): define later.

#### Loyalty

- ~~Loyalty points, tier, reward, referrals~~ (cut, parked): the whole loyalty family is parked. Revisit post-Tier-2.

#### Bundles, memberships & vouchers

- **Service bundle.** Several services booked together in one appointment; sequence or parallel.
- **Membership.** Services redeemable across multiple appointments with **session decrement** (consumption tracking, which Cami has). ⚠︎ **One-time payment only** today; recurring billing needs card-on-file (gap 9).
- **Memberships sold / Pause / Cancel / Delete.** The sold instance and its lifecycle; delete removes the catalog template, only if unsold.
- **Voucher** (Fresha "business gift card"). Stored value with a code, spendable only at the business, partial redemption supported. **Cami keeps the word "voucher."** Tax rule: **no tax at issuance, tax at redemption**. If a sale paid with a voucher is voided, credit returns to the voucher; if refunded, ⚠︎ define whether cash or voucher (Fresha issues cash).
- **Extend (voucher).** Push out the expiry, before it expires.
- ~~Fresha gift card~~ (cut): marketplace-issued.

#### Team & permissions

- **Team member / Archive / Suspend / Delete.** Staff records and non-destructive vs permanent removal.
- **Scheduled shift.** What drives availability (not opening hours).
- **Permission role.** Cami's access model: **Staff / Reception / Manager / Owner** with read/write granularity. ⚠︎ **Tier 2 goal: permission sets for 30-staff roles.** ⚠︎ Persona guardrail: stylists can book, discount to zero, comp friends, block/drag time, so roles need **guardrails and logging** on price/discount/comp actions.
- **Assign / Delete role / Report access level.** Role assignment and the second reporting-access layer (full / edit / view / none).
- ~~Timesheet, commission, pay run, pay period, pay adjustment, wages, enriched profile~~ (cut now / parked): pay runs, commission, wages, and tip bands are parked; commission handling is an open commercial question (gap 5).

#### Marketing

- **WhatsApp broadcast** (Fresha "blast campaign"). Segmented WhatsApp broadcast with template approval, opt-outs, and campaign reporting. Drives rebookings. Part of the MOAT.
- **Automation / Messaging automation.** Rule-driven messages: reminders and rebook follow-ups.
- **Appointment reminders.** 24h auto-confirm, 1h reminder with location pin, no-show rebook follow-up. ⚠︎ **SMS (Twilio) and email today; WhatsApp gated on META.** Policy: reminders are **status-update only, no URLs** (spoof risk); managed links come later.
- **Reminder to rebook.** No-show and lapsed rebook nudges.
- **Client segments** (see Clients).
- **Campaign performance metrics.** Delivered, opened, clicked, attributed appointments and sales.
- **Text balance.** SMS credit; ties to reminder-monetization add-on pricing (gap 11).
- ~~Win-back, birthday offer, loyalty-reward automation, deal, promotion, flash sale, last-minute offer, smart pricing, client review~~ (gap / cut): promotions engine and marketplace reviews are not core at v1.

#### Reports & metrics

- **Gross / Net / Total sales.** ⚠︎ **Define once, cleanly** (gap 4). Fresha's definitions conflict across three reports; Cami should set canonical formulas: gross before deductions, net = gross minus refunds/discounts/taxes, and pick one meaning for total.
- **Discounts / VAT / Refunds / Voucher sales (report metrics).** Cami has a **VAT owed** report and **accountant export**.
- **Sale date vs Payment date.** Accrual vs cash basis; the axis reconciliation runs on.
- **Deposit collection vs Deposit redemption.** Two separate transactions; **automated reconciliation ships in v1**.
- **Liability (deposits and vouchers).** Money held but not yet earned.
- **EOD revenue, revenue by service, revenue by staff, walk-ins.** Owner-facing reporting. ⚠︎ Remember the emotional job: an Owner report exists to **prove the chaos is gone**.
- ~~Occupancy, upsell%, new/returning/rebooked, dashboards, standard/premium/custom reports, data connector~~ (cut now): Fresha reporting-product depth beyond Cami's v1 set.

#### Account & business setup

- **Workspace.** The business entity in Cami.
- **Business location.** A venue. ⚠︎ **Single location today; multi-location is the named post-SOTA priority** (Chaps & Co has 9), then group bookings, then boarding calendar.
- **Business opening hours.** A location's weekly pattern. Note (as in Fresha): scheduled shifts drive availability, not opening hours.
- ~~Fresha plan subscription, billing add-ons, Fresha verified~~ (cut): Cami has **no SaaS subscription floor** (free OS, payments-led). Cami's own add-on pricing (WhatsApp, reminders) needs separate vocabulary (gap 11).
