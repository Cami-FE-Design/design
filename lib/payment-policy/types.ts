// Payment policy configuration (Fresha parity — see docs/specs, Linear ticket
// "Payment Policy Configuration"). Business-level only for v1: the
// Business-vs-Location scope decision is blocked pending Malen/Maaz, and the
// "Capture card details" policy type is explicitly out of scope (Fresha ships
// it disabled too).

export type PaymentPolicyType = "none" | "deposit"

export type AmountMode = "percent" | "fixed"

/** A percent (0–100) or fixed whole-AED amount. */
export type AmountValue = {
  mode: AmountMode
  value: number
}

export const POLICY_TYPE_OPTIONS: {
  value: PaymentPolicyType
  label: string
  description: string
}[] = [
  {
    value: "none",
    label: "No payment policy",
    description: "No policy is applied to clients when booking an appointment",
  },
  {
    value: "deposit",
    label: "Require a deposit upfront",
    description:
      "Clients are required to pay a non refundable deposit when booking to confirm their appointment. This allows you to capture the card and enforce no-show, and late cancellation policy.",
  },
]

// Full option list pending design confirmation (Michelle) — Fresha screenshots
/** Shared time-window ladder (minutes → label) — the reference product uses
 * the same list for both the refund and reschedule dropdowns. */
const TIME_WINDOWS: { min: number; label: string }[] = [
  { min: 30, label: "30 minutes" },
  { min: 60, label: "1 hour" },
  { min: 120, label: "2 hours" },
  { min: 180, label: "3 hours" },
  { min: 240, label: "4 hours" },
  { min: 300, label: "5 hours" },
  { min: 360, label: "6 hours" },
  { min: 480, label: "8 hours" },
  { min: 720, label: "12 hours" },
  { min: 1440, label: "24 hours" },
  { min: 2880, label: "48 hours" },
  { min: 4320, label: "72 hours" },
]

/** "non-refundable", or minutes before the appointment until which the deposit is refundable. */
export type RefundRule = "non-refundable" | number

export const REFUND_OPTIONS: { value: RefundRule; label: string; helper: string }[] = [
  {
    value: "non-refundable",
    label: "Non-refundable",
    helper: "Clients who attempt to cancel their appointments online will not be refunded",
  },
  ...TIME_WINDOWS.map((t) => ({
    value: t.min,
    label: `${t.label} before appointment`,
    helper: `Deposits are refunded if clients cancel online at least ${t.label} before their appointment`,
  })),
]

export function refundLabel(rule: RefundRule): string {
  return REFUND_OPTIONS.find((o) => o.value === rule)?.label ?? "Non-refundable"
}

/** Reschedule window in minutes before the appointment; null = cannot reschedule online. */
export const RESCHEDULE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Clients cannot reschedule online" },
  ...TIME_WINDOWS.map((t) => ({ value: t.min, label: `${t.label} before appointment` })),
]

/**
 * When the late-cancellation / no-show fee applies (DSG-57): on no-show only,
 * or when the client cancels less than N minutes before the appointment.
 */
export type LateFeeTrigger = "no-show" | number

export const LATE_FEE_TRIGGER_OPTIONS: { value: LateFeeTrigger; label: string }[] = [
  { value: "no-show", label: "When appointment is marked as no-show" },
  ...TIME_WINDOWS.map((t) => ({
    value: t.min,
    label: `When client cancels less than ${t.label} before appointment`,
  })),
]

/** Auto-cancel timing (DSG-57): unpaid-deposit window is measured from booking or before start. */
export type AutoCancelReference = "after-booking" | "before-start"

export const AUTO_CANCEL_WINDOW_OPTIONS: { value: number; label: string }[] = TIME_WINDOWS.map(
  (t) => ({ value: t.min, label: t.label }),
)

export const AUTO_CANCEL_REFERENCE_OPTIONS: { value: AutoCancelReference; label: string }[] = [
  { value: "after-booking", label: "After booking appointment" },
  { value: "before-start", label: "Before appointment start time" },
]

export function rescheduleLabel(min: number | null): string {
  return RESCHEDULE_OPTIONS.find((o) => o.value === min)?.label ?? "48 hours before appointment"
}

/**
 * Per-service override. A missing key on either field means "use the default";
 * an AmountValue means a custom amount. `noShowFee: null` means explicitly Off.
 */
export type ServiceOverride = {
  deposit?: AmountValue
  noShowFee?: AmountValue | null
}

export type PaymentPolicy = {
  type: PaymentPolicyType
  deposit: AmountValue
  refundRule: RefundRule
  /** Minutes before appointment; null = cannot reschedule online. */
  rescheduleWindowMin: number | null
  lateFeeEnabled: boolean
  lateFee: AmountValue
  /** When the late/no-show fee applies (DSG-57). */
  lateFeeTrigger: LateFeeTrigger
  autoCancelUnpaid: boolean
  /** Auto-cancel when the deposit is unpaid within this many minutes… (DSG-57) */
  autoCancelWithinMin: number
  /** …measured from booking, or before the appointment start. */
  autoCancelReference: AutoCancelReference
  customizePerService: boolean
  /** Keyed by service id from the service catalog. */
  serviceOverrides: Record<string, ServiceOverride>
  // v1: client groups don't exist in Cami yet — checkbox renders disabled
  // ("coming soon") until Michelle confirms the model.
  limitToClientGroups: boolean
  limitByValue: boolean
  /** Whole AED threshold; policy applies only to appointments above it. */
  minValueAed: number
  /** Client-facing "Additional terms and conditions" (600 chars max). */
  terms: string
  /** "Allow clients the option to prepay in full before their appointment". */
  prepayEnabled: boolean
}

export const TERMS_MAX_LENGTH = 600

// Seeded to mirror the captured Fresha reference (25% non-refundable deposit,
// 48h reschedule window) so every surface demos with a live policy.
export const DEFAULT_PAYMENT_POLICY: PaymentPolicy = {
  type: "deposit",
  deposit: { mode: "percent", value: 25 },
  refundRule: "non-refundable",
  rescheduleWindowMin: 2880,
  lateFeeEnabled: false,
  lateFee: { mode: "percent", value: 50 },
  lateFeeTrigger: "no-show",
  autoCancelUnpaid: false,
  autoCancelWithinMin: 120,
  autoCancelReference: "after-booking",
  customizePerService: false,
  serviceOverrides: {},
  limitToClientGroups: false,
  limitByValue: false,
  minValueAed: 0,
  terms:
    "Deposits are non-refundable, you can reschedule your appointment and your deposit will be transferred over to your future booking. If you are unable to reschedule, please contact us at least 48 hours before your appointment.",
  prepayEnabled: true,
}

export function formatAmount(amount: AmountValue): string {
  return amount.mode === "percent"
    ? `${amount.value}%`
    : `AED ${amount.value.toLocaleString("en-US")}`
}

/** Auto-generated client-facing example line, e.g. shown at booking and in Settings. */
export function examplePolicyText(policy: PaymentPolicy, businessName: string): string {
  if (policy.type === "none")
    return `${businessName} has no payment policy — no deposit is required to book.`
  const refundable = policy.refundRule === "non-refundable" ? "non-refundable" : "refundable"
  return `${businessName} requires a ${refundable} deposit of ${formatAmount(policy.deposit)}.`
}

/** Deposit for one service, respecting a per-service override when active. */
export function depositForService(
  policy: PaymentPolicy,
  serviceId: string,
  priceMinor: number,
): number {
  if (policy.type !== "deposit") return 0
  const override = policy.customizePerService
    ? policy.serviceOverrides[serviceId]?.deposit
    : undefined
  const amount = override ?? policy.deposit
  return amount.mode === "percent"
    ? Math.round((priceMinor * amount.value) / 100)
    : Math.round(amount.value * 100)
}

/** Total deposit (minor units) for a set of booked services. */
export function depositForServices(
  policy: PaymentPolicy,
  services: { serviceId: string; priceMinor: number }[],
): number {
  if (policy.type !== "deposit") return 0
  const totalMinor = services.reduce((sum, s) => sum + s.priceMinor, 0)
  if (policy.limitByValue && totalMinor < policy.minValueAed * 100) return 0
  return services.reduce((sum, s) => sum + depositForService(policy, s.serviceId, s.priceMinor), 0)
}

export function overrideCount(policy: PaymentPolicy): number {
  return Object.keys(policy.serviceOverrides).length
}
