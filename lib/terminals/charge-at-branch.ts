/**
 * A sale is charged on a machine at its own branch, or not at all (GP1.4).
 *
 * ## Why the scoped picker is not enough
 *
 * The checkout grid already offers only the machines of the branch the sale
 * names, which is the half GNK's §15 states as settled. This is the other half
 * they asked for: a refusal, so money is never recorded against the wrong
 * branch — a guarantee rather than a tidy list.
 *
 * The picker is not the only way a sale reaches a machine. §15 says the
 * merchant links each machine to a branch **and can move it to another**, so a
 * draft sale reopened after that move is holding one that was the right machine
 * when it was chosen. The rule therefore sits where the charge is sent, not
 * where it is picked — the same shape as R11, where the control asks for a
 * branch *and* the write refuses without one.
 *
 * Moving an appointment is NOT one of these cases, and it looks like one: the
 * move sets the booking's branch to the destination, so the sale is taken there
 * and the destination's own machines are what the grid offers. Only the deposit
 * stays credited at the source (R17).
 *
 * ## Why a refusal rather than a reattribution
 *
 * A card payment is recorded against the branch its machine belongs to. Sending
 * it anyway and booking it at the sale's branch would make the money say one
 * thing and the terminal's own settlement say another, and nothing on either
 * screen would look wrong. Refusing is the only outcome that leaves one answer.
 */

import type { Terminal } from "@/lib/terminals/store"

export type ChargeRefusal = {
  /** The machine's branch, for the message — never the sale's. */
  machineLocationId: string
  saleLocationId: string
}

/**
 * Nothing to say when the machine belongs to the sale's branch, or when the
 * business has one branch and there is no wrong branch to land on.
 *
 * A sale with no branch named cannot be charged at all (R11), and that refusal
 * belongs to the sale rather than to the machine — Save is already shut, so
 * this returns nothing rather than inventing a second sentence for it.
 */
export function refuseCharge(
  terminal: Pick<Terminal, "locationId">,
  saleLocationId: string | null,
  isMultiLocation: boolean,
): ChargeRefusal | null {
  if (!isMultiLocation) return null
  if (!saleLocationId) return null
  if (terminal.locationId === saleLocationId) return null
  return { machineLocationId: terminal.locationId, saleLocationId }
}

/**
 * What to say, in the words the operator can act on.
 *
 * Names both branches, because "wrong location" sends them to look for which.
 * The way out is stated too — a machine at this branch, or another tender —
 * since the client is standing there either way.
 */
export function refusalMessage(
  refusal: ChargeRefusal,
  locationName: (id: string) => string,
): string {
  return `That card machine is at ${locationName(refusal.machineLocationId)}, and this sale is at ${locationName(refusal.saleLocationId)}. A card payment is recorded against the machine's location, so it would land at the wrong branch. Use a machine at ${locationName(refusal.saleLocationId)}, or take the payment another way.`
}
