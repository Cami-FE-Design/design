# DSG-62 follow-up — Paired terminal management

> **SUPERSEDED** by `DSG-62-terminal-registration.md`. This spec describes a
> single merchant-level PIN shared by every terminal. The model has since moved
> to per-device registration, per-device PINs, and time-boxed sessions. Kept for
> the reasoning it records — the row anatomy, destructive-confirm copy, and
> rename-dialog decisions carried over; the shared-PIN model did not.

Extends the terminal pairing panel (Business Settings > Payments > Terminal
pairing) from a read-only list of paired terminals to a managed one.

Ships alongside the existing PIN card. The PIN behaviour (reveal, copy,
regenerate, locked, error) is unchanged by this spec.

## Problem

The `Paired terminals` card shipped read-only. Two consequences:

1. **Terminals have no human identity.** Rows are labelled by device ID
   (`T-4F91-88C2`). The card copy says terminals come "from all your
   locations", but no row shows a location. A merchant with three terminals
   across two sites cannot tell which row is the front desk and which is the
   grooming counter.
2. **A single terminal cannot be removed.** The only way to drop one is
   regenerating the PIN, which signs out every terminal at every location.
   That is the wrong instrument for "this one was stolen", "we returned the
   lease unit", or "this one moved to the other branch".

## Scope

Per-terminal: **rename** and **unpair**, against a list that now distinguishes
**active from expired** pairing sessions.

Location is **displayed, never chosen**. A terminal belongs to wherever it was
paired, so the value arrives with the pairing and the dashboard reads it. An
editable location control would have implied the merchant could move a device
between sites from a desk, which is not what happens — the device physically
moves, and re-pairs.

Out of scope for this pass, flagged so the omission is deliberate:

- Search / filter over the terminal list. Not worth the chrome under ~8
  terminals; revisit when a real merchant crosses that.
- A terminal detail view (model, serial, paired-on date, last transaction).
  Would need mock data we do not have a source for yet.
- Grouping the list by location. With a handful of terminals a flat list with
  the location on each row reads faster than section headers.

## Model

```ts
type PairedTerminal = {
  id: string                          // device ID, immutable, printed on the device
  name: string                        // merchant-set; defaults to "Terminal N" at pair time
  locationId: string                  // set by the pairing
  lastSeenAt: string                  // backend field name
  status: "active" | "expired"        // pairing-session state, stored
  online: boolean                     // derived from lastSeenAt; only meaningful when active
}
```

### Backend field mapping

Answers to the three points raised on the API side.

| UI | Backend | Status |
| --- | --- | --- |
| Device ID | `id` | Being added — confirmed. Shown on every row and in the rename dialog. |
| Status | `status: "active" \| "expired"` | **Needed.** See correction below. |
| Last active | `lastSeenAt` | Already available. Formatted for display in the UI layer. |

**Correction — status does need a field.** An earlier revision of this spec
argued it didn't: the list was active-only, so a session-status enum would be
constant on every row, and the real question ("is this reachable right now")
was already answerable from `lastSeenAt`.

That reasoning depended on expired sessions dropping off the list. They don't.
Keeping them visible is what tells a merchant *which* devices need re-pairing
after a PIN regeneration, so `status` is a real, varying value and has to be
stored.

Connectivity is still derived and still needs no field: `online` is
`lastSeenAt` within `ONLINE_THRESHOLD_MINUTES` (currently 5). Two consequences
worth stating: the threshold is a UI constant, so tuning it takes no migration;
and a row can never show `Online` next to a stale `lastSeenAt`, because the
same field drives both.

### Session status and connectivity are independent

They answer different questions and vary independently. All four combinations
occur, and each implies a different next action:

| Session | Connectivity | What it means |
| --- | --- | --- |
| Active | Online | Working. |
| Active | Offline | Paired, but switched off or off the network. |
| Expired | Online | Sitting there powered on, ready to re-pair. The common case straight after a regenerate. |
| Expired | Offline | Find it first, then re-pair. |

An earlier revision of this spec claimed these were nested, on the assumption
that an expired session stops checking in. It doesn't: a powered-on terminal
with a dead session still reaches the server, which is how it knows to prompt
for re-pairing. Both halves are shown, always.

`name` gets a readable default at pair time (`Terminal 3`), numbered by pairing
order. Every terminal is legible from the moment it appears, so renaming is an
improvement rather than a repair, and no row is ever headed by a serial number
nobody can read across a counter. Numbering takes the highest existing
`Terminal N` rather than the row count, so removing one doesn't hand its number
to the next device.

`id` and `locationId` are never editable. The ID is how the merchant matches a
row to the physical device, so it must survive renames; the location is set by
the pairing. `name` is the only merchant-writable field on a terminal.

Locations are a static two-entry demo list (`Shampooch JVC`, `Shampooch
Marina`) held in the terminal pairing store. Two, not one, so the row's
location line is visibly carrying information rather than repeating a constant.
**Known gap:** this does not read from `components/blocks/location-form.tsx`'s
`LOCATIONS`, and does not follow the demo business rename in
`lib/demo-business.tsx`. Both should collapse into one locations source when
that source exists.

Store gains `renameTerminal(id, name)` and `unpairTerminal(id)`.
`pairedTerminals` becomes derived from the count of **active** sessions rather
than a stored number, so the list and the PIN card's "N terminals currently
paired" can no longer disagree. Regenerating the PIN expires every active
session rather than clearing the list.

Storage key bumps to `cami-terminal-pairing-v3`, and `readSaved()` now
normalises each row. The merge is a shallow spread, so a saved `terminals`
array replaces the default wholesale — including rows written before a field
existed. Left alone, an undefined `status` renders as neither active nor
expired and silently zeroes the paired count.

## Row

```
┌──────────────────────────────────────────────────────────────────────┐
│ [▣]  Front desk                                    ● Active      ⋯   │
│      T-4F91-88C2 · Shampooch JVC · Last active just now · Online     │
│                                                                      │
│ [▣]  Back office                                   ● Expired     ⋯   │
│      T-9B15-3E7A · Shampooch Marina · Last active 1 min ago · Online  │
└──────────────────────────────────────────────────────────────────────┘
```

- Primary line: the terminal name.
- Secondary line: device ID, location, last active, and connectivity, joined by
  `·` and truncated as one string when the card is narrow.
- Connectivity sits on the detail line rather than in its own column, next to
  the timestamp it is derived from, and with no indicator dot. It reads as one
  more fact about the device.
- The device ID also appears in the rename dialog under the name field, which is
  the moment the merchant is matching the row against the sticker on the
  hardware.
- Square rounded device tile on the left, per the avatar-shape convention
  (subject is an object, not a person).
- Session state is the only right-aligned status, with the `⋯` menu after it.
  Fixed width so `Active` / `Expired` line up down the list.
- Dots: `Active` green, `Expired` cami-yellow — it needs someone to act, where
  an `Offline` device may just be switched off for the night.
- The text carries the status, never the dot colour alone.

## Menu

| Item | Active session | Expired session |
| --- | --- | --- |
| Rename | Opens the rename dialog. | Same — the name is worth keeping, it's restored if the device re-pairs. |
| Destructive | `Unpair`, opens the confirm. | `Remove`, no confirm. |

An expired session is already signed out, so `Unpair` would name something that
has already happened, and a confirm would guard an action that loses nothing.
`Remove` just clears the row.

### Unpair vs expire

Two different things end a session, and they leave different traces:

- **Regenerating the PIN expires** every active session. The rows stay, flipped
  to `Expired`, because the merchant now needs to know exactly which devices to
  walk over to and re-pair. An empty list would throw that away.
- **Unpairing removes** the row outright. Expiry is something the system did
  and the merchant still has to act on; unpairing is the merchant saying "take
  this off my list", and leaving a tombstone behind would ignore that.

Re-pairing a device that expired reactivates its existing row rather than
adding a second one, and keeps the name the merchant gave it. That name
surviving is the main practical reason expired rows stay visible at all.

## Rename dialog

A compact dialog, not a `FullScreenEditDialog`. The takeover convention exists
for multi-section records; a one-field form in a full-screen takeover reads as
a rendering bug.

```
┌─────────────────────────────────┐
│ Rename terminal             ✕   │
│                                 │
│ Name                            │
│ ┌─────────────────────────────┐ │
│ │ Front desk                  │ │
│ └─────────────────────────────┘ │
│ T-4F91-88C2                     │
│                                 │
│           [Cancel] [Save]       │
└─────────────────────────────────┘
```

- Device ID sits under the name field as muted helper text. It is the answer to
  "which one is this", asked at the moment you are naming it.
- Save is disabled while the name is empty. Trimmed on save, so a
  whitespace-only name can't produce a blank row.
- Toast on save: `Terminal renamed` — same verb as the menu item that opened it.

## Unpair confirm

Same shape as the existing regenerate confirm, scaled down to one device.

- Title: `Unpair Front desk?` — names the terminal, so a mis-click on the wrong
  row is visible before it is committed.
- Body: `This terminal stops taking payments immediately. To use it again,
  enter the pairing PIN on the terminal.` States the consequence and the way
  back, since unpairing is recoverable and the confirm should not imply
  otherwise.
- Actions: `Cancel` / `Unpair terminal` (destructive).
- Toast on success: `Front desk unpaired`. The verb matches the button.

## Empty states

There are two, and they are not interchangeable.

| | Reached by | Copy |
| --- | --- | --- |
| **No PIN yet** (whole panel) | Never generated a PIN | `No pairing PIN yet` + Generate PIN action |
| **No terminals paired** (list only) | PIN exists, nothing paired to it, or the last terminal was just unpaired | `No terminals paired yet` / `To pair one, enter the PIN above on the terminal.` |

The second sits under a live PIN card and points back up at it, so the next
action is on screen rather than described. The same wording is correct whether
the merchant has never paired anything or just unpaired their last terminal.

Reviewable on its own at `?tp=no-terminals` and as its own playground row —
previously it could only be reached by unpairing everything by hand, or as a
side effect of `tp=success`, which stacks the regenerate banner on top of it.

## Getting from empty to paired

Pairing starts on the hardware: a staff member types the PIN into the terminal,
and the row appears here as a result. **Nothing in the dashboard can trigger a
pairing**, and the Stripe-style inversion — the device shows a code, you type it
into the dashboard — is explicitly not proposed. It needs a second identifier
the merchant has to find on the box, and it leaves the PIN with no job.

### Pair a terminal

That does not mean the dashboard has nothing to offer here. `Pair a terminal`
opens the instructions, with the PIN in them. It performs nothing.

Two problems it fixes:

- The `No terminals paired` empty state had **no action at all**, while the
  no-PIN state directly above it offers `Generate PIN`. An empty screen should
  be an invitation to act.
- *"Enter the PIN above on the terminal"* doesn't say **where** on the
  terminal. That sentence is exactly where an unfamiliar device strands
  someone.

The dialog holds the PIN at full size and revealed — you're mid-task with a
device in hand, and masking it here is just a second click — then:

> Enter this PIN on your terminal.
>
> The same PIN works for every terminal, at every location.

This started as three numbered steps and was cut to one line. Only the middle
step carried information. Step 1 named a device menu path (*"open Settings →
Pair with business"*) that nobody had confirmed against real hardware, and
step 3 described what the list visibly does on its own. Cutting them also
removes the one thing in this spec that was blocked on hardware.

The second line stays because it answers the question a *second* terminal
raises — is there a different PIN for this one? The PIN card says so too, but
it's behind the dialog while you're reading.

Placement: in the `Paired terminals` card header, mirroring `Regenerate` on the
PIN card, and as the empty state's action. Never both at once — when the list is
empty the header button is suppressed, so two identical buttons never sit an
inch apart.

The empty state's description drops to *"Terminals show up here once they're
paired with your business."* The how-to moved into the dialog, where it can be
the full sequence rather than a compressed one-liner; leaving it in both would
have the description and the button saying the same thing.

### Demo control

Separate from all of the above: the event that populates the list happens on
another device, so a reviewer could never walk the empty list to a populated
one. A `Demo: pair a terminal` control sits next to the state toggle at the
bottom of the panel and stands in for that keypress. Same convention as
`Demo: open confirmation link` in `edit-my-profile-dialog.tsx`, which stands in
for a click inside an email client.

- Appends one terminal, unnamed, so its name is its device ID — landing the
  reviewer directly on the state that Rename exists for.
- Pairs onto the list currently on screen rather than the stored one, so
  pairing from `?tp=no-terminals` gives exactly one terminal instead of
  resurrecting the stored three.
- Hidden while no PIN exists. There would be nothing to type.

Full loop a reviewer can now walk: `?tp=no-terminals` → pair → rename and
assign a location → unpair → back to the empty state.

## Demo states

The panel's demo toggle cycles active / no-terminals / empty / locked / error /
success. The list derives from the store, with these overrides:

- `locked` shows the full demo terminal set (pairing is blocked, existing
  terminals keep working).
- `success` shows every row flipped to `Expired` — the state immediately after
  regenerating, where the banner's "N terminals were signed out, enter this PIN
  on each one" is answerable by looking at the list underneath it.
- `no-terminals` shows an empty list with an ordinary active PIN card — the
  list empty state with no banner over it.

Acting on a row while a demo override is active clears the override first, so
the row action always mutates real store state rather than silently failing
against a fake list.
