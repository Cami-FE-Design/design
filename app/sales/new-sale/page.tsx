import { Suspense } from "react"
import { CartFlow } from "./cart-flow"

// PRO-395 — "Add to cart" point-of-sale flow. Full-screen takeover (no app
// shell), deep-linked from /screens and the sales list "New sale" action.
// CartFlow reads ?dialog / ?step, so it sits behind a Suspense boundary.
export default function NewSalePage() {
  return (
    <Suspense fallback={null}>
      <CartFlow />
    </Suspense>
  )
}
