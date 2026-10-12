"use client"

import type * as React from "react"

import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type LinkedEntityChipProps = {
  name: string
  /**
   * Avatar config. Pass `src` for a real photo; `species` for a pet species
   * icon fallback; otherwise the chip falls back to initials.
   */
  avatar?: {
    src?: string
    species?: AvatarSpecies
    /** Stable identifier used as the avatar hash seed. Falls back to name. */
    hashSeed?: string
    fallback?: "initials" | "character" | "species"
  }
  onClick?: () => void
  className?: string
}

/**
 * Small avatar + name chip, clickable. Used for navigation between linked
 * entities — e.g. the Owners list on Pet detail (each chip pops to that
 * client's detail), pet rows on appointment cards, etc.
 */
export function LinkedEntityChip({ name, avatar, onClick, className }: LinkedEntityChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-slot="linked-entity-chip"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted/60 py-0.5 pr-2.5 pl-0.5 text-xs font-medium transition-colors hover:bg-muted",
        className,
      )}
    >
      <Avatar
        size="xs"
        name={name}
        src={avatar?.src}
        species={avatar?.species}
        hashSeed={avatar?.hashSeed}
        fallback={avatar?.fallback ?? "initials"}
      />
      <span className="truncate">{name}</span>
    </button>
  )
}
