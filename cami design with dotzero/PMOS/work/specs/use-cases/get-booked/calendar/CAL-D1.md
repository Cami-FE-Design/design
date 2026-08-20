# CAL-D1 — Squeeze a last-minute / valuable walk-in

**Feature:** [Calendar](../../../../../../cami-feature-docs/feature-mappings/get-booked/calendar.md) · Group **D · Fit the impossible**
**Job:** Squeeze a last-minute / valuable walk-in
**Done when:** Visit on the grid without silent double-book
**Actor:** Reception (main) · Manager · Owner · Staff **?**
**Gate:** **Record** — actor plus reason on any overlap override ([INV-08](../../../../../../cami-feature-docs/business-rules/01-product-invariants.md)). Conflicts with [ADR-023](../../../../../../cami-feature-docs/business-rules/04-decision-records.md), see Open decisions.
**Law:** [01](../../../../../../cami-feature-docs/business-rules/01-product-invariants.md) INV-B7, INV-B1, INV-A1, INV-08 · [03](../../../../../../cami-feature-docs/business-rules/03-state-machines.md) §1, §7 · [04](../../../../../../cami-feature-docs/business-rules/04-decision-records.md) ADR-023 · [05](../../../../../../cami-feature-docs/business-rules/05-edge-case-catalog.md) EC-6, EC-29
**Last checked:** 2026-08-16

> Spec only. What **should** happen. Build state lives in [validations/calendar/CAL-D1.md](../../../../../../cami-feature-docs/feature-mappings/get-booked/validations/calendar/CAL-D1.md).

---

## Starts when

| Trigger | Must already be true |
|---------|----------------------|
| Client asks for a slot today or tomorrow and the day reads full | Day grid loads for the location (CAL-A1) |
| Walk-in arrives with no booking | Client exists or can be quick-created (CL-B1) |
| Reception judges the client worth the disruption | Service and duration known, or consult-gated (EC-2) |

Verbatim intent: *"I don't want to say no, so I always ask them, what could you do, could you stay."*

---

## Main path

| # | Actor does | System must | Law |
|---|------------|-------------|-----|
| 1 | Reception opens the day and looks for a fit | Show every staff column with real load, including time already taken. Busy is visible, not hidden | 03 §1 |
| 2 | Reception finds no clean slot | Offer the squeeze path explicitly, not by letting a save land silently on an occupied column | EC-6 |
| 3 | Reception picks an occupied time, or a time past close, and gives a reason | Accept the overlap because staff booked it from Cami Business. Capture actor plus reason | INV-B7, INV-08 |
| 4 | Reception saves | Create the appointment in **Booked**. Render the overlap as an overlap, never stacked so one visit hides the other | 03 §1 |
| 5 | System notifies the staff member whose day changed | Staff learn from the system, not from someone walking upstairs | EC-7 |
| 6 | Deposit rule resolves | Apply the service deposit or a recorded waiver before the slot counts as held | INV-B2, INV-B3 |

**Ends with:** appointment in **Booked**, overlap recorded, staff notified.

---

## Alternates

**Path** = *Continue at N* · *End, job done another way* · *End, job not done*.

| ID | When | Then | Path | Law |
|----|------|------|------|-----|
| CAL-D1.a1 | Staff will not extend or absorb the overlap | Reception offers the next real slot, or a waitlist entry. No waitlist model exists today | End, job not done | EC-6 |
| CAL-D1.a2 | Service is consult-gated (extensions, color) | Route to a consultation booking with a range, never a squeezed fixed-price slot | End, job done another way | EC-2 |
| CAL-D1.a3 | The target time is a break or time off, not another appointment | Different rule from staff overlap. Block, or require an explicit time-off override | End, job not done | 03 §1 |
| CAL-D1.a4 | The client tries to squeeze themselves from the online booker | Never offered. Online shows only non-conflicting slots | End, job not done | INV-B7, ADR-023 |
| CAL-D1.a5 | A second operator books the same staff time in the same moment | Last write does not silently win. Both visits survive and both are visible as an overlap | Continue at 4 | EC-29 |
| CAL-D1.a6 | Client already holds a future appointment they did not mention | Surface the existing visit before creating a second | Continue at 3 | EC-1, CAL-A2 |
| CAL-D1.a7 | Deposit is required and unpaid at step 6 | Slot does not count as held. Not a silent Booked | Continue at 6 | INV-B2, CAL-B3 |

---

## Must stay true

| Law | Says | Where it bites in this path |
|-----|------|------------------------------|
| INV-B7 | Overlap allowed only when staff book from Cami Business | Steps 3 to 4; kills a4 |
| INV-08 | Every state change is attributable, overrides carry a reason | Step 3 |
| INV-A2 | Service staff scoped out of pricing | Step 6, if Staff may squeeze at all |
| INV-B4 | Single location per business at v1 | Step 1, no cross-venue borrow |
| INV-B1 | 5-minute hold is the online booker's mechanic | Not this path. Desk create goes straight to Booked |

---

## Done when, checkable

| # | Check | Fails if |
|---|-------|----------|
| 1 | Visit appears on the grid at the requested time | Save is rejected with no squeeze path offered |
| 2 | Both the original and the squeezed visit are visible | One hides or replaces the other |
| 3 | An overlap record exists with actor and reason | Overlap is created silently |
| 4 | The affected staff member is notified by the system | Notification is a person walking upstairs |
| 5 | Deposit is captured or a waiver is recorded | Slot sits Booked with neither |

---

## Not this

| Not here | Lives in |
|----------|----------|
| Deposit percentages and VIP waiver rules | [Payment policy](../../../../../../cami-feature-docs/feature-mappings/get-paid/payment-policy.md) |
| Moving an existing visit to make room | [Reschedule / cancel / no-show](../../../../../../cami-feature-docs/feature-mappings/get-booked/reschedule-cancel-no-show.md) |
| Whether the staff member is available at all | [Staff availability](../../../../../../cami-feature-docs/feature-mappings/get-booked/staff-availability.md) |
| Marking the visit InService or Completed | [Appointment status](../../../../../../cami-feature-docs/feature-mappings/do-the-work/appointment-status.md) |
| Taking the money | [Checkout](../../../../../../cami-feature-docs/feature-mappings/get-paid/checkout.md) |

---

## Open decisions

| Decision | Blocks which step | Where |
|----------|-------------------|--------|
| Guide gate says squeeze overrides are **Record**. ADR-023 rules overlap **ungated, trust-based, no warning or audit**. Both cannot hold | 3 | Guide *Who can act* vs ADR-023 |
| May Staff squeeze, or Reception and above only | 3 | INV-A1, EC-4 |
| Is there a waitlist object, or does a1 just end | a1 | No law. Clients ask for it (personas, *"Is there a waitlist?"*) |
| Does the staff notify in step 5 belong to Calendar or to Reschedule | 5 | EC-7 |

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-16 | First write. Surfaced the Record vs ADR-023 gate conflict |
