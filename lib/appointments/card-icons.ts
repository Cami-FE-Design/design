import type { MockBooking, MockBookingStatus } from "@/lib/appointments/mock"

// Which icons a calendar card shows, and which go first when the card is too
// narrow for all of them (DZ-425).
//
// 1. One icon per kind of state. Payment, how the booking came in, the
//    requested team member and the status are separate questions, so an online
//    booking that is partially paid shows both icons.
// 2. Inside a kind, the later state replaces the earlier one. A deposit is
//    collected before checkout; once a sale exists its icon (draft, partially
//    paid, paid) takes the deposit's place. Never both.
// 3. When the row runs out of room, icons keep this order and the rest fold
//    into a "+N" count. Status goes first, because the card's colour already
//    says it.

export type CardIconKey =
  | "sale-draft"
  | "sale-partial"
  | "sale-paid"
  | "deposit"
  | "online"
  | "requested"
  | "pickup"
  | "safety"
  | "note"
  | "package"
  | "recurring"
  | "links"
  | "confirmed"
  | "arrived"
  | "started"
  | "no-show"
  | "cancelled"

export const CARD_ICON_LABEL: Record<CardIconKey, string> = {
  "sale-draft": "Sale open, nothing paid",
  "sale-partial": "Partially paid",
  "sale-paid": "Paid",
  deposit: "Deposit paid",
  online: "Online booking",
  requested: "Requested team member",
  pickup: "Pet address",
  safety: "Safety flag",
  note: "Note",
  package: "Package",
  recurring: "Recurring",
  links: "Linked appointments",
  confirmed: "Confirmed",
  arrived: "Arrived",
  started: "Started",
  "no-show": "No-show",
  cancelled: "Cancelled",
}

// Booked has no icon yet and completed shows its sale's icon instead, as in
// the built product.
const STATUS_ICON: Record<MockBookingStatus, CardIconKey | null> = {
  booked: null,
  confirmed: "confirmed",
  "checked-in": "arrived",
  "ready-for-pickup": "started",
  completed: null,
  cancelled: "cancelled",
  "no-show": "no-show",
}

const SALE_ICON: Record<NonNullable<MockBooking["saleStatus"]>, CardIconKey> = {
  draft: "sale-draft",
  partially_paid: "sale-partial",
  paid: "sale-paid",
}

/** The card's icons, most important first. */
export function cardIconsFor(booking: MockBooking, opts: { hasNote: boolean }): CardIconKey[] {
  const icons: CardIconKey[] = []
  if (booking.saleStatus) icons.push(SALE_ICON[booking.saleStatus])
  else if (booking.hasDeposit) icons.push("deposit")
  if (booking.bookedOnline) icons.push("online")
  if (booking.requestedStaff) icons.push("requested")
  if (booking.needsPickup) icons.push("pickup")
  if (booking.hasSafetyFlag) icons.push("safety")
  if (opts.hasNote) icons.push("note")
  if (booking.packageRedeemed) icons.push("package")
  if (booking.isRecurring) icons.push("recurring")
  if (booking.linkCount && booking.linkCount > 0) icons.push("links")
  const status = STATUS_ICON[booking.status]
  if (status) icons.push(status)
  return icons
}

/**
 * How many icons fit in `slots` icon-sized spaces. With room for all, all
 * show. With room for one, only the first shows. Otherwise one space goes to
 * the "+N" count.
 */
export function fitCardIcons(count: number, slots: number): { shown: number; more: number } {
  if (slots >= count) return { shown: count, more: 0 }
  if (slots <= 0) return { shown: 0, more: 0 }
  if (slots === 1) return { shown: 1, more: 0 }
  return { shown: slots - 1, more: count - (slots - 1) }
}
