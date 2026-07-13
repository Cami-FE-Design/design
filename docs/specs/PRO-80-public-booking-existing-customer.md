# PRO-80 — Public booking: existing-customer pet selection

Status: in progress · Owner: Michelle · Surface: `components/blocks/booking/booking-flow.tsx` (step 3, Identify)

## Problem

The public booking flow's identify step opened with a "Is this your first
visit?" Yes/No fork. The "No" (returning) path verified a phone number, then
jumped straight to review — it never loaded the customer's record and never let
them pick which of their pets the booking is for. Returning pet parents had no
way to choose a saved pet.

## Decision

Remove the Yes/No fork. Phone + OTP becomes the single entry to the identify
step. After verification we resolve the caller by phone and branch on whether a
client record exists. Pet selection is **embedded in the post-verify details
view**, not a separate step — the progress bar stays 4 steps, matching the
existing single-column architecture.

## Flow

```
Step 3 · Identify
  phone  →  OTP  →  [verified]  →  details view
                                     │
        ┌────────────────────────────┴────────────────────────────┐
    client found                                          client not found
    (returning)                                              (new)
  · name/email pre-filled, editable                 · empty name/email form
  · phone shown, DISABLED                            · phone pre-filled, DISABLED
  · pet picker: saved pets (single-select)          · inline pet capture
    + "Add a new pet" → name + species                (name + species)
Step 4 · Review
```

Rules:
- **Phone is unique per customer** (duplicates already cleaned up in data). It is
  the lookup key, and it is shown but disabled once verified — never editable in
  the details view.
- **One pet per booking.** The saved-pet picker is single-select. Multi-pet is a
  separate booking journey, out of scope here.
- **Non-pet businesses skip pet selection entirely.** Gated by
  `businessHasPets()`; the details view shows no pet UI and goes direct to review.

## Demo resolver (mock)

`findClientByPhone(phone)` in `lib/booking.ts`: a mobile number ending in an
**even** digit resolves to a returning client on file (`RETURNING_CLIENT` +
`RETURNING_PETS`); **odd** = new. Mirrors the existing OTP demo convention (a
code starting with `0` fails). Production swaps this for the real lookup.

## Open question — pet module feature flag

The pet-vs-non-pet gate is currently derived from business categories in
`businessHasPets()` (`PET_CATEGORIES` set). How the pet module flag is truly
implemented is **not fully documented**. Owais owns this and is on leave from
Mon; call to be scheduled. Product needs the pet vs non-pet flows specced
accurately before this hardens — this doc + the flow diagram above are the
starting point for that conversation.
