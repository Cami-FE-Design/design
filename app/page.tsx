import { redirect } from "next/navigation"

// The root has no product surface of its own; the screens index is the
// map of every routed surface, so send visitors there.
export default function Home() {
  redirect("/screens")
}
