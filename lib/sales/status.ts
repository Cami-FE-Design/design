// One label and tint per sale status, shared by the sales list row, the sale
// detail dialog pill and the Sales tab in the client modal.
//
// Step-5/-12 pills, matching the appointment status badges. Paid/completed =
// lime, part-paid = gold, unpaid = cami-yellow step-3/-11 (as the "AED N
// Unpaid" pill in the appointment detail sheet), refunded = olive, draft =
// gray. Voided uses step-8/-12, the same weight as the destructive No-show
// badge: both are terminal "bad" states.
//
// The sales list says "completed" where client activity says "paid"; both are
// kept until the two sale models are merged.

export type SaleStatusKey =
  | "completed"
  | "paid"
  | "part-paid"
  | "unpaid"
  | "refunded"
  | "voided"
  | "draft"

export const SALE_STATUS_LABEL: Record<SaleStatusKey, string> = {
  completed: "Completed",
  paid: "Paid",
  "part-paid": "Part paid",
  unpaid: "Unpaid",
  refunded: "Refunded",
  voided: "Voided",
  draft: "Draft",
}

export const SALE_STATUS_CLASS: Record<SaleStatusKey, string> = {
  completed: "bg-lime-5 text-lime-12",
  paid: "bg-lime-5 text-lime-12",
  "part-paid": "bg-gold-5 text-gold-12",
  unpaid: "bg-cami-yellow-3 text-cami-yellow-11",
  refunded: "bg-olive-5 text-olive-12",
  voided: "bg-tomato-8 text-tomato-12",
  draft: "bg-cami-gray-5 text-cami-gray-12",
}
