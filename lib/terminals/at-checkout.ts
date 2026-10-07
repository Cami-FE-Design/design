import type { Terminal } from "@/lib/terminals/store"

/**
 * The card machines a sale is offered.
 *
 * A single-location business has one place a machine can be, so a machine with
 * no location (`locationId` "") is that location's machine and is offered as
 * before. A chain never offers one: its payments would be booked at no
 * location. It shows in Payment settings as "No location" until someone sets
 * one.
 *
 * For a chain with the sale's location named, only that location's machines.
 * `keepPlaced` skips the location filter for the `?terminals=moved` review
 * state, which stands for a machine already attached to the sale and moved
 * since — the charge refusal is what catches that one.
 */
export function machinesForSale<T extends Pick<Terminal, "locationId">>(
  terminals: T[],
  saleLocationId: string | null,
  isMultiLocation: boolean,
  { keepPlaced = false }: { keepPlaced?: boolean } = {},
): T[] {
  if (!isMultiLocation) return terminals
  const placed = terminals.filter((t) => !isUnassigned(t))
  if (keepPlaced || !saleLocationId) return placed
  return placed.filter((t) => t.locationId === saleLocationId)
}

/**
 * Every machine the merchant has, counted the way Payment settings lists them:
 * placed at a location this person holds, or with no location. A machine at a
 * location they do not hold, or from another business, is not theirs.
 */
export function merchantMachines<T extends Pick<Terminal, "locationId">>(
  terminals: T[],
  heldLocationIds: readonly string[],
): T[] {
  return terminals.filter((t) => isUnassigned(t) || heldLocationIds.includes(t.locationId))
}

/** A machine with no location. */
export function isUnassigned(terminal: Pick<Terminal, "locationId">): boolean {
  return terminal.locationId === ""
}
