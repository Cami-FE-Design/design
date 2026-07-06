import type { Metadata } from "next"

import { PetParentAccount } from "@/components/blocks/booking/pet-parent-account"

export const metadata: Metadata = {
  title: "Your Cami account",
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return <PetParentAccount />
}
