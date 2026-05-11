"use client"

import type * as React from "react"

import { Avatar, type AvatarFallbackVariant, type AvatarSpecies } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type AvatarStackItem = {
  id: string
  name: string
  src?: string
  fallback?: AvatarFallbackVariant
  hashSeed?: string
  species?: AvatarSpecies
}

type AvatarStackSize = "xs" | "sm" | "md" | "lg"

type AvatarStackProps = {
  items: AvatarStackItem[]
  /** Number of avatars rendered before the overflow chip kicks in. Defaults to 3. */
  max?: number
  /** Avatar size used for each item. Defaults to "sm". */
  size?: AvatarStackSize
  onSelect?: (id: string) => void
  className?: string
}

const SIZE_OVERLAP_CLASS: Record<AvatarStackSize, string> = {
  xs: "-ml-1",
  sm: "-ml-1.5",
  md: "-ml-2",
  lg: "-ml-2.5",
}

const OVERFLOW_SIZE_CLASS: Record<AvatarStackSize, string> = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
}

/**
 * Stacked avatar group with overlap and an overflow indicator. Hover any
 * avatar to see the name (tooltip); the overflow chip shows the remaining
 * names. Used for family / staff / contributor-style lists where vertical
 * space is tight.
 */
export function AvatarStack({
  items,
  max = 3,
  size = "sm",
  onSelect,
  className,
}: AvatarStackProps) {
  const visible = items.slice(0, max)
  const overflow = items.slice(max)
  const overlap = SIZE_OVERLAP_CLASS[size]

  return (
    <div data-slot="avatar-stack" className={cn("flex items-center", className)}>
      {visible.map((item, i) => (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              style={{ zIndex: visible.length - i }}
              className={cn(
                "relative inline-flex rounded-full focus-visible:outline-none",
                i > 0 && overlap,
              )}
              aria-label={item.name}
            >
              <Avatar
                size={size}
                name={item.name}
                src={item.src}
                hashSeed={item.hashSeed}
                species={item.species}
                fallback={item.fallback ?? "initials"}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>{item.name}</TooltipContent>
        </Tooltip>
      ))}
      {overflow.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative ml-1 inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
                OVERFLOW_SIZE_CLASS[size],
              )}
              aria-label={`${overflow.length} more`}
            >
              +{overflow.length}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px] text-left text-xs">
            {overflow.map((item) => item.name).join(", ")}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
