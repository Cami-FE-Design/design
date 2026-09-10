/**
 * A branch's WhatsApp number (R21, R22, KC2.1–KC2.4, SCR-14).
 *
 * WhatsApp is the front door, and multi-location makes it per branch: an
 * inbound message resolves its location from the number it arrived on, and
 * **never** falls back to another branch's number. That is the same rule R11
 * states — a location is stated, never guessed — satisfied by the channel
 * rather than by a picker.
 *
 * ## The fallback that must not exist here
 *
 * SMS is the opposite case, and the contrast is worth keeping in mind while
 * reading this file. `effectiveSenderId()` in lib/notifications/types.ts
 * deliberately falls back to `CAMI` when a merchant has no approved sender ID,
 * because an SMS with a generic sender still reaches the right person.
 *
 * A WhatsApp number is an address, not a label. Falling back would deliver one
 * branch's conversation to another branch's inbox, which is a cross-branch
 * leak (BG-06) rather than a cosmetic downgrade. So an unassigned branch takes
 * no WhatsApp bookings at all, and says so (KC2.2).
 *
 * ## Numbers come from the merchant
 *
 * Decided 2026-08-17: branches already have their own numbers, so Cami procures
 * nothing. What that leaves is a migration, per number, and it is the chain's
 * go-live gate rather than a build item — an OTP received *at that branch*, a
 * display-name approval, and a two-factor PIN. History does not travel with the
 * number unless Coexistence runs on it (EC-45).
 */

/**
 * Where a branch is in the migration. Not a progress bar for its own sake —
 * each step is a real gate that fails in its own way, and the one that
 * surprises operators is `otpPending`, because the code arrives at the branch
 * and somebody has to be standing there.
 */
export type WhatsAppStatus =
  /** No number. This branch takes no WhatsApp bookings, and nothing reroutes. */
  | "unassigned"
  /** Waiting on the six-digit code delivered to the number itself. */
  | "otpPending"
  /** META is reviewing the display name shown to clients. */
  | "nameReview"
  /** Verified with META, waiting on the two-factor PIN that finishes the bind. */
  | "pinPending"
  /** Bound. Inbound on this number resolves to this branch. */
  | "connected"

export type BranchWhatsApp = {
  locationId: string
  /** E.164, merchant-supplied. Absent while unassigned. */
  number?: string
  /** What clients see as the sender. META reviews it, so it can differ from the branch name. */
  displayName?: string
  status: WhatsAppStatus
  /**
   * Whether Coexistence is running on this number. Without it, migrating the
   * number off the WhatsApp Business app loses that branch's chat history, and
   * the longer the branch has been trading the worse that is (EC-45, ADR-025).
   */
  coexistence: boolean
  /** Conversations this branch sent or received in the period. Attribution only (R22). */
  conversations: number
  /** AED, attributed to the branch that sent or received. The business total is derived. */
  cost: number
}

export const WHATSAPP_STATUS_COPY: Record<
  WhatsAppStatus,
  { label: string; detail: string; tone: "neutral" | "pending" | "good" }
> = {
  unassigned: {
    label: "No number",
    detail: "This location takes no WhatsApp bookings. Messages never reroute to another branch.",
    tone: "neutral",
  },
  otpPending: {
    label: "Waiting for OTP",
    detail: "The six-digit code goes to the number itself, so someone has to be at that branch.",
    tone: "pending",
  },
  nameReview: {
    label: "Display name in review",
    detail: "META is reviewing the name clients will see on this number.",
    tone: "pending",
  },
  pinPending: {
    label: "Waiting for two-factor PIN",
    detail: "Verified with META. The PIN finishes the bind.",
    tone: "pending",
  },
  connected: {
    label: "Connected",
    detail: "Messages to this number reach this location.",
    tone: "good",
  },
}

/** Only a connected number takes bookings. Everything else is an explicit gap. */
export function takesWhatsAppBookings(binding: BranchWhatsApp): boolean {
  return binding.status === "connected" && Boolean(binding.number)
}

/**
 * Resolve an inbound message to exactly one branch, or to nothing.
 *
 * There is no third answer on purpose. Returning a "default" branch here is the
 * silent misroute R21 exists to delete, so an unrecognised number resolves to
 * `undefined` and the caller has to handle not knowing.
 */
export function resolveInboundLocation(
  bindings: ReadonlyArray<BranchWhatsApp>,
  fromNumber: string,
): string | undefined {
  const match = bindings.find((b) => b.number === fromNumber && takesWhatsAppBookings(b))
  return match?.locationId
}

/** The business total is derived from its branches, never stored (R22). */
export function businessCommsTotals(bindings: ReadonlyArray<BranchWhatsApp>): {
  conversations: number
  cost: number
} {
  return bindings.reduce(
    (acc, b) => ({
      conversations: acc.conversations + b.conversations,
      cost: acc.cost + b.cost,
    }),
    { conversations: 0, cost: 0 },
  )
}

/**
 * Seeded to show the states that carry a rule rather than a tidy all-connected
 * list: one live branch, one mid-migration, and one with no number at all.
 */
export const BRANCH_WHATSAPP: BranchWhatsApp[] = [
  {
    locationId: "shampooch-jvc",
    number: "+971 50 123 4567",
    displayName: "Shampooch JVC",
    status: "connected",
    coexistence: true,
    conversations: 412,
    cost: 168.92,
  },
  {
    locationId: "shampooch-jumeirah",
    number: "+971 50 771 8820",
    displayName: "Shampooch Jumeirah",
    // Mid-migration, and stuck on the step that needs a person at the branch.
    status: "otpPending",
    coexistence: false,
    conversations: 0,
    cost: 0,
  },
  {
    locationId: "shampooch-al-quoz",
    status: "unassigned",
    coexistence: false,
    conversations: 0,
    cost: 0,
  },
]
