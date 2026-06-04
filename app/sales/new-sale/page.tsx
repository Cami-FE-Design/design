import { CartFlow } from "./cart-flow"

// PRO-395 — "Add to cart" point-of-sale flow. Full-screen takeover (no app
// shell), deep-linked from /screens and the sales list "New sale" action.
export default function NewSalePage() {
  return <CartFlow />
}
