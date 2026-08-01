# DSG-62 — Terminals: registration, credentials, and sessions

**Supersedes `DSG-62-terminal-management.md`.** That spec described a single
merchant-level PIN shared by every terminal at every location. This one
replaces the security model: terminals are added from the dashboard, each gets
its own pairing code and its own PIN, and staff sign-ins become time-boxed
sessions.

Settings > Payments > **Terminals**.

## Why the model changed

The shared-PIN model had three structural problems, all fixed by going
per-device:

| | Shared PIN | Per-device |
| --- | --- | --- |
| Revoking one terminal | Impossible without signing out every device at every location | Regenerate that device's PIN |
| A staff member fumbling the PIN | Locked pairing everywhere | Locks that one device |
| Knowing what's signed in | One boolean per device | A session list, revocable one at a time |

The previous spec argued against any dashboard-side "add terminal" on the
grounds that pairing begins on the hardware. That objection doesn't apply here:
**the dashboard generates the code**, nothing is read off the device.

## Two credentials, two jobs

This is the distinction the whole surface turns on, and the one that took the
longest to get right.

| | Pairing code | Sign-in PIN |
| --- | --- | --- |
| Looks like | `TRM-7Q4K2M` | `482915` |
| Typed into the device | Once, to bind the hardware to the business | Every sign-in |
| Lifetime | Issued once, never changes | Regenerated whenever the merchant wants |
| Readable later | Yes | Yes |

Both are issued when the terminal is added and both stay readable from the row
afterwards. They are shown together, because that is how a device gets set up,
but labelled apart, because their lifecycles differ.

**The PIN is deliberately not a write-once secret.** An earlier revision showed
it once and stored it hashed. That was wrong for this product: staff sign in
with it daily, so a merchant needs to look it up. The trade is explicit —
anyone who can open Payment settings can read every terminal's PIN, which is
the same trade the shared-PIN card made before this. Flagged as **open
question 1** if security wants to revisit.

## Model

```ts
type Terminal = {
  id: string              // "TRM-7Q4K2M" — generated when added, immutable
  name: string            // merchant-set, required
  locationId: string      // merchant-set, required, editable afterwards
  pin: string             // readable, regenerable
  pairedAt: string | null // null until the device connects with its code
  lockedFor: string | null
  lastSeenAt: string | null
}

type TerminalSession = {
  id: string
  terminalId: string
  device: string          // "Galaxy Tab A9"
  app: string             // "Cami POS 1.4.0 · Android 14"
  ip: string
  startedAt: string
  expiresAt: string       // startedAt + 24h
  lastSeenAt: string
  status: "live" | "expired" | "signed-out"
}
```

**Nothing is capped.** A merchant registers as many terminals as they have
hardware for, and each holds as many concurrent sessions as staff open. In
practice it is one or two devices, which is why neither listing has search or
pagination — a "usually small" assumption rather than a guarantee, so revisit
if a real merchant ever runs a long list.

**Location is required.** A card machine physically sits somewhere, and the
location is what tells two identical tablets apart. It is editable after
registration, because a device moves counters. The immutable field is the code,
not the location: changing that would orphan the paired hardware.

**Sessions are not attributable to a person.** The PIN is shared by whoever
works that counter, so the system cannot know who signed in. That is why a
session is identified by device model, app build, and IP — "Pixel Tablet on
196.20.14.9" is how a merchant recognises a sign-in they didn't expect. Copy
must never imply attribution. Per-staff attribution would need staff
credentials at sign-in, **open question 2**.

## Adding a terminal

One dialog, one step. Name and location in; the credentials come back.

```
┌──────────────────────────────────┐      ┌────────────────────────────────────┐
│ Add a terminal                   │      │ Set up Front Desk Register     ✕   │
│ Give the device a name your staff│      │ Downtown Clinic                    │
│ will recognise. We'll generate a │  →   │ Enter the code on the terminal to  │
│ pairing code to enter on the     │      │ pair it, then the PIN to sign in.  │
│ hardware.                        │      │                                    │
│                                  │      │ PAIRING CODE                       │
│ Device name                      │      │ ┌────────────────────────────────┐ │
│ [ Front Desk Register          ] │      │ │ TRM-7Q4K2M              ⧉      │ │
│                                  │      │ └────────────────────────────────┘ │
│ Location                         │      │ SIGN-IN PIN                        │
│ [ Downtown Clinic            ⌄ ] │      │ ┌────────────────────────────────┐ │
│                                  │      │ │ • • • • • •        👁  ⧉       │ │
│        [Cancel] [Add terminal]   │      │ └────────────────────────────────┘ │
└──────────────────────────────────┘      │ Regenerate PIN                     │
                                          │                          [Done]    │
                                          └────────────────────────────────────┘
```

This was briefly two numbered steps, with the code on step one and the PIN on
step two. That was wrong: staff type both into the device, so splitting them
made the merchant copy the code, move on, and then need it again beside the
PIN. It was also briefly the reverse — registration issuing only a code, with
the PIN as a separate task — which left a "needs PIN" state nobody wanted.

- Save is disabled until both name and location are filled.
- The code is generated on submit, not shown on the form. It isn't something
  the merchant provides or reviews; it's half of the credential.
- **Regenerate PIN is a link under the field**, not a fourth icon. Show and
  Copy are ways of getting at the value that's already there; regenerate
  *replaces* it, and shouldn't carry the same weight as the harmless pair.
- Values are set at `text-2xl` with loose tracking. They get read off a screen
  and typed into a keypad from a few feet away, so tracking matters as much as
  size — adjacent digits must not run together.

### The same dialog, three ways in

| Opened from | Title | PIN starts |
| --- | --- | --- |
| After adding | `Set up {name}` | masked |
| Row → Show code & PIN | `Code & PIN for {name}` | masked |
| After regenerating | `New PIN for {name}` | revealed |

A regenerated PIN is pre-revealed: the merchant just made it, so hiding it
would be one click for nothing. The regenerated variant also says *"The device
stays paired — its code hasn't changed"*, or someone will go hunting for a new
code.

The bare device name was the title at one point. It didn't say whether
something had just been created, changed, or merely looked up.

## Listing

List rows, not a data table. A columns layout put five equal-weight cells on
every row with no hierarchy, so the merchant had to read all of them to find
the device.

```
┌───────────────────────────────────────────────────────────────────────┐
│ [▣]  Front Desk Register                          ● Active        ⋯   │
│      TRM-7Q4K2M · Downtown Clinic · Last seen 3 min ago               │
│                                                                       │
│ [▣]  Mobile Grooming Van                          ● Not paired    ⋯   │
│      TRM-9F2W6C · Field team · Never connected                        │
└───────────────────────────────────────────────────────────────────────┘
```

- Name at full weight; code, location, and last seen drop to one muted line, so
  status is the only thing competing with the name.
- The device tile carries the status tint, so a row reads at a glance before
  you reach the label.
- `Add terminal` sits in the card header when the list has rows, and as the
  empty state's action when it doesn't — never both at once.

### Status

One value per row, first match wins:

| Status | When | Dot |
| --- | --- | --- |
| `Locked · 12 min` | Failed PIN entries on the device | Red |
| `Not paired` | Code issued, device has never connected | Amber |
| `Active` | One or more live sessions | Green |
| `No sessions` | Paired, nothing signed in | Muted |

`Not paired` and `No sessions` are states the source mockup had no room for —
it showed only Active and Locked. Between them they cover most of a working
morning, when devices are added but nobody has signed in yet.

This also resolves an inconsistency in the mockup, where `Mobile Grooming Van`
showed `PIN: Not set` alongside `Locked · 12 min` and `Last seen: Never`. A
device that has never connected has nothing to fail a sign-in against. If
lockout is meant to count wrong *code* attempts too, that row is valid and the
rule needs stating — **open question 3**.

### Row menu

| Item | Behaviour |
| --- | --- |
| Show code & PIN | Opens the credentials dialog. |
| Rename terminal | Name only; the code identifies the row. |
| Change location | Location only; the name identifies the row. |
| *N* devices signed in | Opens the sessions dialog. Paired terminals only. |
| Regenerate PIN | Destructive confirm naming the live sessions it ends. |
| Unlock now | Only while locked. |
| Remove terminal | Destructive confirm, separated. |

Rename and Change location were one `Edit` item. "Edit" didn't say what it
edits. Splitting them means the menu item, the dialog title, and the toast all
use the same word.

## Sessions

A modal per terminal, not a second listing on the page. Sessions were briefly
their own card; at typical volumes it was mostly dead `Signed out` rows, and
what matters is *which devices are on this terminal right now*.

```
┌──────────────────────────────────────────────┐
│ Front Desk Register                     ✕    │
│ Downtown Clinic · Devices signed in on code  │
│ TRM-7Q4K2M                                   │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ ▣  Galaxy Tab A9          ● Live         │ │
│ │    Cami POS 1.4.0 · Android 14           │ │
│ │    IP address        Last seen           │ │
│ │    196.20.14.7       3 min ago           │ │
│ │    Signed in         Expires             │ │
│ │    Today 09:02       Tomorrow 09:02      │ │
│ │    [ Revoke session ]                    │ │
│ └──────────────────────────────────────────┘ │
│ ⓘ Regenerating this terminal's PIN revokes   │
│   all its sessions at once — use it if a     │
│   device is lost.                            │
└──────────────────────────────────────────────┘
```

- Live sessions first: a revoked row is history, a live one may need acting on.
- Each fact is labelled. An IP or a bare timestamp is unreadable without one.
- **Revoke is per session.** The footer names the blunt instrument for a lost
  device, so the merchant isn't left working out which control they want.
- Sessions run for `SESSION_HOURS` (24). Fixed or per-merchant is
  **open question 4**.

## Empty state

The default. A merchant opening this for the first time has no terminals, so
that is where the demo starts too.

> **No terminals yet**
> Add a card machine to give it a pairing code and a PIN.
> `[ Add terminal ]`

## Naming

`Terminals`, not `Terminal pairing`. It matches the noun pattern of its
siblings (Payment methods, Payment links, Payment policy, Taxes & fees), and
"pairing" described the old model's central act, which no longer exists.

`Add terminal` for the action, `Registered terminals` for the card heading —
the heading describes what the rows are, the button what you do to get one.

## Prototype scaffolding

Three demo controls at the bottom right, following the gift-cards convention.
Two of them stand in for things that happen on the hardware, where nothing in
the dashboard can trigger them:

- `Demo: pair a device` — someone typing the code into a terminal.
- `Demo: sign in on a terminal` — staff entering the PIN, opening a session.
- `Demo: live | typical | all statuses` — swaps the store for the demo sets.
  `live` reflects what you've actually added.

Deep links: `?tp=typical|full|empty` for the list, and `?td=add|credentials|sessions`
for the dialogs — they hold most of this feature's design decisions but sit
behind a row menu, so a reviewer handed a bare URL would never reach them.

## Open questions

1. **PIN readability** — retrievable by anyone with Payment settings access.
   Correct for the product, worth a security nod.
2. **Session attribution** — device sign-in (current, unattributable) or staff
   sign-in? Only the second can name a person.
3. **Lockout trigger** — failed PIN attempts only, or failed code attempts too?
4. **Session expiry** — is 24h fixed, or configurable per merchant?
5. **Locations source** — `TERMINAL_LOCATIONS` is a static two-entry demo list
   in the pairing store. It does not read from
   `components/blocks/location-form.tsx`'s `LOCATIONS`, nor follow the demo
   business rename in `lib/demo-business.tsx`. Should collapse into one
   locations source when that source exists.

### Resolved since the first draft

- **Terminal ID origin** — generated by the dashboard, not read off hardware.
- **Re-sign-in after expiry** — same PIN, no regeneration needed.
- **Terminal cap** — briefly 4, now uncapped.
