"use client"

import { LogOutIcon, TimerIcon, UserCogIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

type ImpersonationBannerProps = {
  /** The business owner being impersonated. */
  ownerName: string
  /** Total length of the impersonation session in seconds. Default 30 min. */
  durationSeconds?: number
  /** Called when "Exit impersonation" is clicked. Default closes the window. */
  onExit?: () => void
  className?: string
}

function formatRemaining(seconds: number) {
  const m = Math.max(0, Math.floor(seconds / 60))
  const s = Math.max(0, seconds % 60)
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function ImpersonationBanner({
  ownerName,
  durationSeconds = 30 * 60,
  onExit,
  className,
}: ImpersonationBannerProps) {
  const auth = useAuth()
  const impersonator = auth.impersonatedBy
  const [remaining, setRemaining] = useState(durationSeconds)

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
    auth.setImpersonating(false)
    window.close()
  }

  return (
    <div
      role="alert"
      data-slot="impersonation-banner"
      className={cn(
        "flex w-full items-center justify-between gap-4 bg-cami-yellow-9 px-4 py-2 text-cami-yellow-12",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cami-yellow-12 text-cami-yellow-3">
          <UserCogIcon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">
            You&apos;re signed in as {ownerName}
          </span>
          {impersonator ? (
            <span className="truncate text-xs font-normal opacity-80">
              Impersonated by {impersonator.name} · {impersonator.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-cami-yellow-12/15 px-2.5 py-1 text-xs font-medium tabular-nums">
          <TimerIcon className="size-3.5" aria-hidden />
          <span role="timer" aria-label="Time remaining">
            {formatRemaining(remaining)}
          </span>
        </div>
        <Button
          variant="default"
          size="sm"
          className="bg-cami-yellow-12 text-cami-yellow-3 hover:bg-cami-yellow-12/90"
          onClick={handleExit}
          data-icon="inline-start"
        >
          <LogOutIcon />
          Exit impersonation
        </Button>
      </div>
    </div>
  )
}
