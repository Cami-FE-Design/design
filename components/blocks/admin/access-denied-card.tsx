"use client"

import { ShieldXIcon } from "lucide-react"
import type * as React from "react"
import { CamiMark } from "@/components/brand/cami-mark"
import { Button } from "@/components/ui/button"

type AccessDeniedCardProps = {
  /** URL the user attempted to reach. Stored so they can be deep-linked back if their permissions change. */
  intendedUrl?: string
  onBackToDashboard?: () => void
  onSignOut?: () => void
}

export function AccessDeniedCard({
  intendedUrl,
  onBackToDashboard,
  onSignOut,
}: AccessDeniedCardProps) {
  return (
    <div
      data-slot="access-denied-card"
      className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-background px-8 py-10 text-center shadow-overlay"
    >
      <div className="flex h-11 items-center gap-2 rounded-full bg-cami-sage-4 px-3 text-sm font-medium text-foreground">
        <CamiMark size={20} />
        Cami HQ
      </div>

      <div className="flex size-14 items-center justify-center rounded-full bg-tomato-3 text-tomato-11">
        <ShieldXIcon className="size-6" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          You don&apos;t have access to this page
        </h1>
        <p className="text-sm leading-5 text-muted-foreground">
          Your account doesn&apos;t include permission for this section. If you think this is a
          mistake, contact engineering.
        </p>
      </div>

      {intendedUrl ? (
        <div className="w-full rounded-xl bg-muted/40 px-3 py-2 text-left">
          <p className="text-xs font-normal leading-4 text-muted-foreground">Intended URL</p>
          <p className="mt-0.5 truncate font-mono text-xs leading-4 text-foreground">
            {intendedUrl}
          </p>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-2">
        <Button size="lg" className="w-full" onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="self-center text-muted-foreground"
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
