"use client"

import { Maximize2Icon, Minimize2Icon, TriangleAlertIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

type ImpersonationBannerProps = {
  /** The business owner being impersonated. */
  ownerName: string
  /** Optional partner name shown after the owner: "as Maz Khan within Shampooch JVC". */
  businessName?: string
  /** Total length of the impersonation session in seconds. Default 30 min. */
  durationSeconds?: number
  /** Threshold (in seconds) below which the banner enters its expiring-soon state. */
  expiringThresholdSeconds?: number
  /** Called when "Stop" is clicked. Default closes the window. */
  onExit?: () => void
  /** Render the banner in its collapsed state. Useful for showcases. */
  defaultCollapsed?: boolean
  className?: string
}

export function ImpersonationBanner({
  ownerName,
  businessName,
  durationSeconds = 30 * 60,
  expiringThresholdSeconds = 5 * 60,
  onExit,
  defaultCollapsed = false,
  className,
}: ImpersonationBannerProps) {
  const auth = useContext(AuthContext)
  const [remaining, setRemaining] = useState(durationSeconds)
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const expiring = remaining > 0 && remaining <= expiringThresholdSeconds
  const expired = remaining <= 0
  const alarm = expiring || expired

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [remaining])

  function handleExit() {
    if (onExit) {
      onExit()
      return
    }
    auth?.setImpersonating(false)
    window.close()
  }

  const surface = alarm ? "bg-tomato-9 text-white" : "bg-cami-yellow-9 text-cami-yellow-12"
  const accent = alarm
    ? "bg-white text-tomato-11 hover:bg-white/90"
    : "bg-cami-yellow-12 text-cami-yellow-3 hover:bg-cami-yellow-12/90"

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Expand impersonation banner"
        onClick={() => setCollapsed(false)}
        data-slot="impersonation-banner-collapsed"
        data-state={expired ? "expired" : expiring ? "expiring" : "active"}
        className={cn("flex rounded-t-md p-1.5 transition-colors", surface, className)}
      >
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md transition-colors",
            accent,
          )}
        >
          {alarm ? (
            <TriangleAlertIcon className="size-4" />
          ) : (
            <Maximize2Icon className="size-3.5" />
          )}
        </span>
      </button>
    )
  }

  return (
    <div
      role="alert"
      data-slot="impersonation-banner"
      data-state={expired ? "expired" : expiring ? "expiring" : "active"}
      className={cn(
        "flex max-w-full flex-col gap-1.5 rounded-t-md px-3 py-1.5 text-sm transition-colors",
        "sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2",
        surface,
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2 sm:flex-1">
        {alarm ? <TriangleAlertIcon className="size-3.5 shrink-0" /> : null}
        <span className="min-w-0">
          {expired ? (
            <>Session expired, close this window</>
          ) : (
            <>
              You are impersonating <strong className="font-semibold">{ownerName}</strong>
              {businessName ? (
                <>
                  {" within "}
                  <strong className="font-semibold">{businessName}</strong>
                </>
              ) : null}
            </>
          )}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={handleExit}
          className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", accent)}
        >
          {expired ? "Close" : "Stop"}
        </button>
        <button
          type="button"
          aria-label="Collapse impersonation banner"
          onClick={() => setCollapsed(true)}
          className={cn(
            "flex size-6 items-center justify-center rounded-md transition-colors",
            accent,
          )}
        >
          <Minimize2Icon className="size-3.5" />
        </button>
      </span>
    </div>
  )
}
