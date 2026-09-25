import type { Metadata } from "next"

import { InboxPhase0Screen } from "@/components/blocks/inbox-phase-0/inbox-phase-0-screen"

export const metadata: Metadata = {
  title: "Inbox · Phase 0",
  description: "Inbox CRM Phase 0 prototype — every story row and state, for T1 (ENG3-33)",
}

export default function InboxPhase0Page() {
  return <InboxPhase0Screen />
}
