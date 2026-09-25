import { FileTextIcon, ImageIcon, UserRoundIcon, VideoIcon } from "lucide-react"

import type { InboxConversation, InboxMessage, MediaKind } from "@/app/messages/inbox/phase-0/mock"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { formatPhone, type InboxCopy } from "./copy"

/** What a pane is doing — the generic states T1 asks every surface to cover. */
export type PaneStatus = "ready" | "loading" | "empty" | "error"

export function customerName(c: InboxConversation): string | null {
  if (!c.customer) return null
  return [c.customer.firstName, c.customer.lastName].filter(Boolean).join(" ")
}

/** A phone number is always LTR, including inside an Arabic sentence. */
export function Phone({ e164, className }: { e164: string; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {formatPhone(e164)}
    </bdi>
  )
}

/** Name when matched, the number when not — never a made-up name. */
export function ConversationTitle({ conversation }: { conversation: InboxConversation }) {
  const name = customerName(conversation)
  return name ?? <Phone e164={conversation.phoneE164} />
}

export function ConversationAvatar({
  conversation,
  size = "md",
}: {
  conversation: InboxConversation
  size?: "md" | "lg"
}) {
  const name = customerName(conversation)
  if (name) {
    return <Avatar size={size} name={name} hashSeed={conversation.customer!.publicId} />
  }
  // No client yet, so no initials: an empty, dashed silhouette — not a phone
  // glyph, which reads as a call button.
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-cami-gray-7 bg-cami-gray-2 text-cami-gray-10",
        size === "lg" ? "size-12" : "size-9",
      )}
      aria-hidden
    >
      <UserRoundIcon className={cn("stroke-[1.5]", size === "lg" ? "size-5" : "size-4")} />
    </span>
  )
}

export function UnmatchedPill({ copy }: { copy: InboxCopy }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cami-yellow-3 px-2 py-0.5 text-[11px] font-medium text-cami-yellow-11">
      <span className="size-1.5 rounded-full bg-cami-yellow-11" aria-hidden />
      {copy.unmatched}
    </span>
  )
}

export const MEDIA_ICON: Record<MediaKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: VideoIcon,
  file: FileTextIcon,
}

export function mediaLabel(kind: MediaKind, copy: InboxCopy) {
  return kind === "image" ? copy.photo : kind === "video" ? copy.video : copy.file
}

/** One-line summary of a message for the list row. */
export function previewOf(
  m: InboxMessage,
  copy: InboxCopy,
): { icon?: typeof ImageIcon; text: string } {
  const media = m.media?.[0]
  if (m.body) return { icon: media ? MEDIA_ICON[media.kind] : undefined, text: m.body }
  if (media) return { icon: MEDIA_ICON[media.kind], text: mediaLabel(media.kind, copy) }
  return { text: "" }
}

/** IX-C4 row 3: a name the client gave in a message — "this is Fatima",
 *  "I'm Rana", "my name is Omar". Latest message first. Only ever a guess the
 *  form marks as one; nothing is guessed from a number. */
export function guessName(messages: InboxMessage[]): string | null {
  const pattern = /\b(?:this is|i'm|i am|my name is|it's|it is|name's)\s+([A-Z][a-z]{1,20})\b/i
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]!
    if (m.direction !== "inbound" || !m.body) continue
    const found = m.body.match(pattern)?.[1]
    if (found) return found.charAt(0).toUpperCase() + found.slice(1).toLowerCase()
  }
  return null
}
