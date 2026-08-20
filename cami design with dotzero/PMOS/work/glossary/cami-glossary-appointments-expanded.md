# Cami Glossary: Appointments & Calendar (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Appointments & calendar domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> The five statuses (Booked, Confirmed, Completed, Cancelled, No-show) must align exactly with the Cami sale/void/refund checkout-state glossary pending **Sham and Maz**. Completed is the hinge between the calendar and a sale.

---

## Confusable cluster: Cancel vs No-show vs Delete

| Term | When it can be used | Slot and record | Reversible |
|---|---|---|---|
| **Cancel** | Today or future appointments only | Frees the slot, optionally notifies the client, stores a reason, keeps a record | No undo. Rebooking is the path |
| **No-show** | After the start time | Slot stays consumed, recorded on the client profile | Status yes (Undo no-show). **No chargeable fee today** |
| **Delete** | One service line inside an appointment, before checkout | Removes that service and its duration | No |

**Cami divergence from Fresha:** Cami's **No-show carries no fee** until card-on-file lands (see gaps 1-2). Today it is a status plus an automated rebook follow-up, and any money kept is deposit retention only.

---

## Statuses

### Booked

- **What it is.** The default status on any new appointment.
- **Cami mechanics.** Set automatically on creation. Occupies the slot and blocks it from online booking. ⚠︎ Note: the online booker holds a slot for **5 minutes** before it is confirmed or released.
- **Reversible.** Yes. The baseline state other statuses move away from.
- **Where you see it.** ⚠︎ Appointment view, status control.
- **Don't confuse with.** Confirmed (Booked is not client-confirmed), Awaiting confirmation (a payment-policy state, not a status).
- **Status.** Live.

### Confirmed

- **What it is.** The client has confirmed the booking.
- **Cami mechanics.** In Cami's **deposit-to-book** model, an appointment becomes Confirmed when the client **pays the deposit** (or ⚠︎ stores a card, once card-on-file exists). Can also be set manually. Does not change slot occupancy.
- **Reversible.** Yes. Status can change again.
- **Where you see it.** ⚠︎ Appointment view, status dropdown.
- **Don't confuse with.** Booked, Awaiting confirmation.
- **Status.** Live.

### Completed

- **What it is.** The appointment was delivered and checked out.
- **Cami mechanics.** Set automatically when the appointment is **checked out through CamiPos**, not from a dropdown. Payment is not required, so free consultations still need a checkout to complete. This is the **hinge to a sale**. ⚠︎ Once Completed, whether the appointment locks from edits needs confirming (Fresha locks it).
- **Reversible.** ⚠︎ Fresha: no. Cami to confirm.
- **Where you see it.** ⚠︎ Appointment view, Checkout.
- **Don't confuse with.** Paid/payment status (a separate axis), the Arrived/Started statuses (parked, see cut list).
- **Status.** Live.

### Cancelled

- **What it is.** The appointment was called off before it happened.
- **Cami mechanics.** Frees the slot, **optionally notifies the client** via a checkbox, stores a cancellation reason, keeps a record on the appointment list and client profile. If a deposit policy applies and the cancellation falls inside the window, **deposit retention** is offered (⚠︎ a chargeable late-cancel fee is not available, see gaps 1-2). Only for today or future appointments.
- **Reversible.** No undo documented. Rebooking is the path.
- **Where you see it.** ⚠︎ Appointment view, status, Cancel, or Actions.
- **Don't confuse with.** No-show (post-start-time), deleting a service, business closed period (parked).
- **Status.** Live, ⚠︎ deposit-retention flow to confirm.

### No-show

- **What it is.** The client did not turn up for a booked appointment.
- **Cami mechanics.** Status and calendar color update; the no-show is recorded on the client profile. Optional client notification. **Cami divergence:** today this triggers the **automated no-show rebook follow-up**, not a fee. Deposit can be **retained**; there is **no charge to a stored card** (no card-on-file). Only available after the start time. ⚠︎ Define the upper time bound (Fresha's own articles conflict).
- **Reversible.** Partially. Status reversible via Undo no-show. Any retained deposit is a separate deliberate action.
- **Where you see it.** ⚠︎ Appointment view, status, No-show.
- **Don't confuse with.** Cancelled (pre-start-time), the no-show fee (not built).
- **Status.** Live for status + rebook follow-up. Fee gated on card-on-file.

### Cancellation reason

- **What it is.** A business-defined reason a team member picks when cancelling.
- **Cami mechanics.** Selected during the cancel flow and stored for reporting. Internal only; clients cannot pick one. ⚠︎ Whether it can be added retroactively to confirm (Fresha: no).
- **Reversible.** ⚠︎ Fresha: no.
- **Where you see it.** ⚠︎ Settings, scheduling.
- **Don't confuse with.** Blocked time types, time-off types.
- **Status.** ⚠︎ Confirm Cami has a managed reason list at v1.

---

## Calendar objects and actions

### Delete (a service from an appointment)

- **What it is.** Removing one service line from an appointment, not the appointment itself.
- **Cami mechanics.** Removes the service and its duration from the booking. There is no permanent delete for a whole appointment; **cancellation is the removal method** and it preserves a record.
- **Reversible.** No. Requires confirmation, no undo.
- **Where you see it.** ⚠︎ Appointment view, the service, remove.
- **Don't confuse with.** Cancel, which removes the whole booking and keeps an audit record. Key distinction.
- **Status.** ⚠︎ Confirm.

### Reschedule

- **What it is.** Moving an existing appointment to a new time, date, or team member.
- **Cami mechanics.** ⚠︎ **Highest-value flow for the champion user (Layla).** Her core job is managing change, not new bookings. Reschedule keeps all other details and must fire **both a client notification and an internal staff notification** (persona: today she messages the client, waits, moves it, then walks upstairs to tell the stylist). No notification if the time is unchanged. **Cami constraint:** cannot reschedule to a different location (single-location today anyway); ⚠︎ resource and working-hours conflicts should raise an overridable warning.
- **Reversible.** Yes. Can be rescheduled again to the original slot.
- **Where you see it.** ⚠︎ Calendar drag-and-drop; Appointment view, Actions, Reschedule.
- **Don't confuse with.** Cancel-and-rebook (loses the record), dynamic reassignment (parked).
- **Status.** Live (core), ⚠︎ dual-notify to confirm as built.

### Walk-in

- **What it is.** An appointment created without a client record attached.
- **Cami mechanics.** Occupies the slot without linking to client history until a client is added. **Tier 3 is cash-heavy walk-ins**, and the **card terminal drives most walk-in volume** (walk-in, less-digital customers), which is why terminal is the majority-volume path.
- **Reversible.** Yes. A client can be added or replaced later.
- **Where you see it.** ⚠︎ Add appointment, client selector, Walk-in.
- **Don't confuse with.** Blocked time (a slot with no client but not a booking), the Walk-ins report metric, Walk-in as a client-source value.
- **Status.** Live (calendar). Terminal checkout gated on NeoPay.

### Double book

- **What it is.** Two appointments in the same slot for the same team member.
- **Cami mechanics.** ⚠︎ **Cami divergence, and a real product problem.** Fresha permits internal double-booking on purpose. Cami's pain is the **opposite**: unintentional duplicates when the same client books across **WhatsApp, Instagram, and direct-to-stylist**, which is where double-bookings are born (validated, Queenie/SOTA). Cami needs **duplicate detection + a future-appointments view + alerts** at booking, not a permissive double-book toggle.
- **Reversible.** Yes. Either appointment can be rescheduled out.
- **Where you see it.** ⚠︎ Calendar, and ideally an alert surfaced in the unibox at booking time.
- **Don't confuse with.** Group appointment (intentional multi-client, parked), resource conflict warnings.
- **Status.** ⚠︎ Duplicate detection is a build need, not a port. See gap-adjacent (Merge profiles).

### Preferred team member

- **What it is.** The specific team member a client asked for.
- **Cami mechanics.** Flagged on the booking. Captures the **client-to-professional affinity** ("Is Mike free to trim Yumi at 2pm"). ⚠︎ Appointments without a preference would be the ones eligible for any future auto-reassignment.
- **Reversible.** Yes. Can be added or updated on the service.
- **Where you see it.** ⚠︎ Appointment service details; a calendar filter.
- **Don't confuse with.** Assigned team member (workload-balanced default).
- **Status.** ⚠︎ Confirm Cami captures preference at v1.

### Blocked time

- **What it is.** A calendar block marking when one team member is unavailable.
- **Cami mechanics.** Hides the slot from online booking; staff can still book into it manually. Clients never see blocked time. ⚠︎ Recurrence and paid/unpaid typing (Fresha's blocked-time types) to confirm for Cami.
- **Reversible.** Yes. Delete the entry (recurring: this / this-and-future / all).
- **Where you see it.** ⚠︎ Calendar, Add, Blocked time.
- **Don't confuse with.** Time off (day-level, restores shifts on delete), business closed period (whole business, parked), extra/processing time on a service (same word, different concept).
- **Status.** ⚠︎ Confirm scope at v1.

### Time off

- **What it is.** Days a specific team member is unavailable to take bookings.
- **Cami mechanics.** Blocks that member's bookings across those dates. Deleting the entry **restores the member's original scheduled shifts**. ⚠︎ Customizable categories (holiday, sick, personal) to confirm.
- **Reversible.** Yes. Deleting restores shifts.
- **Where you see it.** ⚠︎ Team scheduled shifts, or the calendar.
- **Don't confuse with.** Blocked time (partial-day), business closed period (business-wide, parked).
- **Status.** ⚠︎ Confirm.

### Resources

- **What it is.** Rooms, equipment, or spaces booked alongside a service.
- **Cami mechanics.** Part of the **multi-venue calendar** (staff, venues, rooms, equipment). Assigning a resource makes it unavailable for the appointment duration, preventing conflicts. When no resource is free, the service is unbookable online while staff can override in store. ⚠︎ Auto-assign order and linked-resource blocking to confirm.
- **Reversible.** Yes. Reassign or remove from services.
- **Where you see it.** ⚠︎ Settings, scheduling, resources; assigned on the service.
- **Don't confuse with.** Team members, locations, blocked time.
- **Status.** Live (multi-venue grid).

### Calendar filters (status / channel / type / saved)

- **What it is.** Filters to narrow the calendar view.
- **Cami mechanics.** ⚠︎ Filter axes to confirm. Likely useful: **status** (Booked/Confirmed/Completed/Cancelled/No-show), **channel** (⚠︎ note Cami's real channel problem is WhatsApp vs Instagram vs direct-to-stylist, richer than online/offline), **type**, and **saved** presets.
- **Reversible.** Yes. Filters clear.
- **Where you see it.** ⚠︎ Calendar, filters.
- **Don't confuse with.** Payment-status filter.
- **Status.** ⚠︎ Confirm which filters ship.

---

## Cut from this domain (do not port yet)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Group appointment** | Parked. Named post-multi-location priority (multi-location, then group bookings, then boarding calendar) | After multi-location |
| **Repeat / recurring appointment** | ⚠︎ Not documented for Cami; low priority vs reschedule | When there is a use case |
| **Waitlist** (entry / type / priority) | Validated demand ("Is there a waitlist?") but unbuilt. A build opportunity, not a port (gap 7) | Post multi-location |
| **Custom status (Arrived, Started)** | ⚠︎ Not confirmed for Cami; keep to the five system statuses at v1 | Tier 2 if operators ask |
| **Business closed period** | Multi-location construct; single-location today | With multi-location |
| **Dynamic reassignment** | ⚠︎ System-initiated reassignment not built; depends on preference capture | Later |
