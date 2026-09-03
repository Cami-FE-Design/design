# Terminal checkout — locked cart

Adopts [PRO-909](./PRO-909-payment-link-locked-cart.md)'s locked cart for the
card-present rail. Raised by Michelle as a P1 on terminal checkout, ahead of
terminal go-live: this is the receptionist's main path.

## Problem

The shipped flow routes the sale to the machine and then does nothing. In
`NewSaleSheet.payByTerminal()` the sale is saved, `POST payment-intent
{ method: "terminal" }` fires, a toast says "Sale sent to the card terminal",
and the drawer stays on the payment grid. The link rail polls the sale and
settles itself; the terminal rail has no equivalent, so nothing brings the
result back.

What the receptionist sees, from Michelle's repro (Test Pet Business, sale 138,
walk-in, AED 150):

- The card clears on the machine. The sales list behind the drawer refreshes to
  **Completed** — the drawer stays on "Select payment", "To pay 150.00", with
  **Save unpaid** still live. A paid sale reading as unpaid.
- Tapping **POS Terminal** again is refused by the backend: `Sale cannot be
  routed to a collection method in status 'completed'`. The UI offered an
  action the sale could not take.
- Closing the drawer opens **"Discard draft sale?"** — on a sale that has taken
  the client's money.

All three are the same missing thing. The drawer has no state for "this sale is
on the machine", so it keeps offering the states it had before.

## Decision

Lock the sale the moment it is routed, exactly as a live payment link locks it.
The cart is frozen — amount and method both — because the machine is about to
charge a figure the cart must not move underneath. The drawer body is replaced
by a full-panel locked screen: no step breadcrumb, no cart editing, no Save
unpaid, no second tap to refuse. Settlement lands on the existing
`ConfirmationScreen`.

| Topic | Decision |
| --- | --- |
| Trigger | The **POS Terminal** tile. It opens the machine picker, unless exactly one machine is signed in — then it sends, since that is not a choice. |
| Target | One chosen device. The operator picks it; the locked screen names it. |
| Amount | The whole remaining balance. The terminal settles against the backend's outstanding figure; the amount shown is what the operator was told the client owes at the moment of sending. |
| Cart while routed | **Locked** — same rule as a live link. |
| Only action while routed | **Collect another way** (cancel), with a confirm. |
| Cancel semantics | Sale comes off the machine, cart intact, back to the payment methods. |
| After settlement | Existing `ConfirmationScreen` ("Payment complete"). |
| Method label | `POS Terminal` on the payment row — already how a settled terminal sale reads on the sale detail. |
| Tile visibility | Hidden when the merchant has no registered terminal. Sign-in state is not part of that — a signed-out device is still a terminal, and the picker is where the operator learns it needs signing in. |

### Why the picker is skipped for a single machine

Asking a question with one answer is a tap that teaches nothing. The locked
screen names the device either way, so the operator still sees where the sale
went — they just don't confirm it first. The picker returns the moment there is
a second signed-in machine.

### Why cancel returns to the grid, and does not hand off to a draft

PRO-909 closes the cart on cancel and hands the operator to the draft sale the
link created, because the draft is what survived the cancellation and the client
is somewhere else with their phone.

Card-present inverts that. The client is at the counter, and the reason the
operator is cancelling is to take the money a different way — a declined card,
a switch to cash. Closing the drawer and making them find a draft would put two
navigations between the decline and the cash. So the lock releases in place.

### Why the confirm names the risk instead of asking "are you sure"

Cancelling is the one place in this flow where money can be lost: a card that
has already gone through while the operator was reaching for the button. The
confirm says that, and says what to do about it — stay here, the payment lands
on its own. An "are you sure" would carry none of that.

## Flow

1. Payment step → **POS Terminal** tile → **Send to terminal** dialog, stating
   the amount and listing the merchant's machines.
2. Only a signed-in terminal can be picked. The other three DSG-62 states are
   listed rather than filtered out, each with its reason on the row — "Nobody
   signed in", "Not set up on the device yet", "Locked · 12 min". A receptionist
   whose usual register is missing needs to know it is the sign-in that is
   missing, not the hardware. With none signed in, the dialog leads with a
   notice saying so.
3. Send → sale is routed, cart locks.
4. Locked screen: sent to *that machine*, at its location, payer's first name,
   amount, and the promise the sale updates itself.
5. Operator's only action is **Collect another way** → confirm → back to the
   payment grid, cart intact.
6. When the card clears, the sale settles to **Payment complete**.

## Deliberately absent

- **No progress beats.** Same reason PRO-909 dropped them: the operator cannot
  act on "processing", and the machine is in their hand anyway.
- **No expiry / countdown.** Nothing expires; the machine either takes the card
  or it doesn't.
- **No progress on the machine's own screen.** What the card reader shows is
  the device's business; the drawer says only where the sale went.

## Mock scaffolding

- `Mark as paid` sits at the bottom as a muted text link, not a button —
  identical treatment to the link lock screen. It exists so the paid outcome is
  reachable from the prototype; its visual weight says it is scaffolding.

## Real-build replacements

| Mock | Real |
| --- | --- |
| Local `terminalCharge` state | Sale state from the backend, so the lock survives refresh and reopen — the link lock already derives from `sale.paymentLink` this way |
| `Mark as paid` | The settlement acknowledgment the sale is currently missing (socket or poll), which is the actual fix |
| `Collect another way` | An un-route endpoint — **does not exist today**, open question 1 |
| `terminalAvailable` prop | `useTerminalAvailability()`, failing closed on anything that is not `available === true` |
| Terminal list read from `lib/terminals/store` (falling back to the demo set when unconfigured) | The merchant's registered terminals and their live sessions, from the backend |
| Chosen terminal held in local state | A terminal id on the payment-intent call — the shipped call carries only `{ method: "terminal" }` |

## Open questions (with GNK)

1. **Can a sale be pulled back off the terminal?** There is no counterpart to
   `sendToTerminal` in the service today. If none is coming, the locked screen
   needs a different exit — but it needs one: without it a declined card strands
   the operator.
2. ~~**Does the sale reach a chosen device?**~~ **Answered** (Owais, standup):
   the operator picks a terminal and the sale goes to that terminal. Designed
   accordingly. Still to confirm with the backend: what happens when the chosen
   device signs out or drops off the network between send and settlement.

## Out of scope

- Clear-added-payments confirm before routing (as-built behaviour, unchanged:
  the terminal settles the whole balance so it cannot sit alongside in-session
  tenders).
- Terminal registration, PINs and sessions — [DSG-62](./DSG-62-terminal-registration.md).
- The machine's own screens.
