"use client"

import { ChevronDownIcon, PersonStandingIcon, UserIcon } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ClientAttachment } from "./types"

/**
 * Read-only client card shown on the Tip / Payment steps — avatar, name, phone,
 * relationship tags + Add tag, and an Actions menu (Figma 2686-24022 header).
 */
export function ClientSummaryCard({
  attachment,
  onRemove,
  onChangeClient,
}: {
  attachment: ClientAttachment
  onRemove: () => void
  onChangeClient: () => void
}) {
  // Empty cart client is treated as a Walk-In on the Tip / Payment steps.
  const isWalkIn = attachment.type !== "client"
  const name = isWalkIn ? "Walk-In" : attachment.client.name
  const phone = isWalkIn ? undefined : attachment.client.phone
  const tags = isWalkIn ? [] : (attachment.client.tags ?? [])

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2">
        {attachment.type === "client" ? (
          <Avatar
            name={attachment.client.name}
            hashSeed={attachment.client.id}
            src={attachment.client.photoUrl}
            fallback="character"
            size="lg"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
            <PersonStandingIcon className="size-6" />
          </span>
        )}
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-semibold text-base text-foreground">{name}</span>
          {phone ? <span className="truncate text-muted-foreground text-sm">{phone}</span> : null}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            // Matches the client-tag pill in the client detail modal's
            // Additional info section (violet pill + user icon).
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-cami-violet-3 px-2.5 py-1 font-medium text-cami-violet-11 text-sm"
            >
              <UserIcon className="size-3.5" strokeWidth={1.75} />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" radius="full" className="w-fit gap-1">
            Actions
            <ChevronDownIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {!isWalkIn ? <DropdownMenuItem>View profile</DropdownMenuItem> : null}
          <DropdownMenuItem onSelect={onChangeClient}>Change client</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
