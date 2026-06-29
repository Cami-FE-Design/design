import type { Metadata } from "next"

import { MessagesInboxScreen } from "@/components/blocks/messages-inbox"

export const metadata: Metadata = {
  title: "Inbox · Messages",
  description: "WhatsApp conversations inbox",
}

export default function MessagesInboxPage() {
  return <MessagesInboxScreen />
}
