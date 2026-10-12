"use client"

/**
 * The full-page "no access" state (P1.4.6, R24).
 *
 * The signed-in person holds no locations at all. Every operational page reads
 * through a location, so each one shows this in place of its content. Wired
 * once, in the app shell, through `LocationAccessGate`. A link to a location
 * the person does not hold is not this state: it falls through to the list,
 * the same as a link to a location that does not exist.
 *
 * Copy is a fact and a next step. The person reading it cannot fix it, and the
 * account owner can, so that is who the step names.
 */

import { LockIcon } from "lucide-react"
import type * as React from "react"

import { EmptyState } from "@/components/blocks/shared/empty-state"
import { useLocations } from "@/lib/locations/store"
import { cn } from "@/lib/utils"

export const NO_ACCESS_TITLE = "You don't have access to any location"

export const NO_ACCESS_NEXT_STEP = "Ask the account owner to give you access."

export function NoLocationAccess({ className }: { className?: string }) {
  return (
    <EmptyState
      variant="card"
      icon={LockIcon}
      title={NO_ACCESS_TITLE}
      description={NO_ACCESS_NEXT_STEP}
      className={cn("flex-1", className)}
    />
  )
}

/**
 * Renders its children for anybody who holds a location, and `fallback` for
 * somebody who holds none. Renders nothing of its own otherwise, so a page is
 * identical for everyone with access.
 */
export function LocationAccessGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  const { hasNoAccess } = useLocations()
  return <>{hasNoAccess ? fallback : children}</>
}
