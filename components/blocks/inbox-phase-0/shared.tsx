import { FileTextIcon, ImageIcon, UserRoundIcon, VideoIcon } from "lucide-react"

import type { InboxConversation, InboxMessage, MediaKind } from "@/app/messages/inbox/phase-0/mock"
import { Avatar } from "@/components/ui/avatar"

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

/** Named chats use the same pet-parent character avatar as Clients.
 *  An unmatched chat gets a dashed person, never digit initials and never
 *  a search icon beside the number. */
export function ConversationAvatar({
  conversation,
  size = "md",
  unmatchedLabel,
}: {
  conversation: InboxConversation
  size?: "md" | "lg" | "empty"
  unmatchedLabel?: string
}) {
  const name = customerName(conversation)
  if (!name) {
    // "empty" is the unmatched pane mark, about 96px. List rows stay "md".
    const box = size === "empty" ? "size-24" : size === "lg" ? "size-12" : "size-9"
    const icon = size === "empty" ? "size-10" : size === "lg" ? "size-5" : "size-4"
    return (
      <span
        className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground`}
        title={unmatchedLabel}
      >
        <UserRoundIcon className={`${icon} stroke-[1.5]`} aria-hidden />
        {unmatchedLabel ? <span className="sr-only">{unmatchedLabel}</span> : null}
      </span>
    )
  }
  return (
    <Avatar
      size={size === "empty" ? "lg" : size}
      fallback="character"
      name={name}
      hashSeed={conversation.customer?.publicId ?? conversation.publicId}
    />
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

/** One-line summary of a message for the list row. A file attachment keeps
 *  its text and does not get a document icon. */
export function previewOf(
  m: InboxMessage,
  copy: InboxCopy,
): { icon?: typeof ImageIcon; text: string } {
  const media = m.media?.[0]
  const icon = media && media.kind !== "file" ? MEDIA_ICON[media.kind] : undefined
  if (m.body) return { icon, text: m.body }
  if (media) return { icon, text: mediaLabel(media.kind, copy) }
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
