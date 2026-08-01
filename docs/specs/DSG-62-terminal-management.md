# DSG-62 follow-up — Paired terminal management

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

Per-terminal: **rename** and **unpair**.

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
  id: string          // device ID, immutable, printed on the device
  name: string        // merchant-set; defaults to the device ID at pair time
  locationId: string
  lastSeenAt: string  // backend field name
  online: boolean     // derived from lastSeenAt, not stored
}
```

### Backend field mapping

Answers to the three points raised on the API side.

| UI | Backend | Status |
| --- | --- | --- |
| Device ID | `id` | Being added — confirmed. Shown on every row and in the edit dialog. |
| Status | *(none needed)* | Derived, see below. |
| Last active | `lastSeenAt` | Already available. Formatted for display in the UI layer. |

**Status needs no field.** This list only ever contains active pairing
sessions — expired and revoked ones drop off — so a session-status enum would
be the same value on every row. What the merchant actually asks is "is this
terminal reachable right now", which is `lastSeenAt` within
`ONLINE_THRESHOLD_MINUTES` (currently 5). Online / Offline is computed from
the timestamp that already exists.

Two consequences worth stating: the threshold is a UI constant, so tuning it
takes no migration; and a row can never show `Online` next to a stale
`lastSeenAt`, because the same field drives both.

`name` defaults to the device ID rather than being nullable. Every terminal
therefore always has a label, and there is no "unnamed terminal" branch in the
UI. Renaming is an edit, never a required completion step.

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
`pairedTerminals` becomes derived from `terminals.length` rather than a stored
count, so the list and the PIN card's "N terminals currently paired" can no
longer disagree. Regenerating the PIN clears `terminals` to `[]`, same as
before. Storage key bumps to `cami-terminal-pairing-v2`.

## Row

```
┌──────────────────────────────────────────────────────────────┐
│ [▣]  Front desk                            ● Online      ⋯   │
│      T-4F91-88C2 · Shampooch JVC · Last active just now      │
└──────────────────────────────────────────────────────────────┘
```

- Primary line: the terminal name.
- Secondary line: device ID, location, last active, separated by `·`, truncated
  as one string when the card is narrow.
- The device ID is dropped from the secondary line when it equals the name —
  i.e. on a terminal nobody has renamed yet — so it never prints twice.
- The device ID also appears in the edit dialog under the name field, which is
  the moment the merchant is matching the row against the sticker on the
  hardware.
- Square rounded device tile on the left, per the avatar-shape convention
  (subject is an object, not a person).
- Status dot and label stay right-aligned; the `⋯` menu sits after them. The
  text label carries the status, not the dot colour alone.

## Menu

| Item | Behaviour |
| --- | --- |
| Rename | Opens the rename dialog. |
| Unpair | Destructive, separated. Opens the unpair confirm. |

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
- `success` shows an empty list (regenerating just signed everything out).
- `no-terminals` shows an empty list with an ordinary active PIN card — the
  list empty state with no banner over it.

Acting on a row while a demo override is active clears the override first, so
the row action always mutates real store state rather than silently failing
against a fake list.
