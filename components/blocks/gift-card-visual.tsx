"use client"

import { CopyIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type GiftCardVisualProps = {
  /** Pre-formatted amount, e.g. "AED 2,300". */
  amount: string
  code: string
  /** Pre-formatted expiry, e.g. "12 May 2027". */
  expires: string
  /** Optional line under the amount — typically the business name. */
  subtitle?: string
  /** Show a copy-to-clipboard button next to the code. */
  copyableCode?: boolean
  className?: string
}

/**
 * The gradient gift-card visual, sized to real payment-card proportions (~1.6:1)
 * so it reads as a physical card rather than a full-width banner. Shared across
 * the gift-card detail and redeem flows — change it here to update every surface.
 */
export function GiftCardVisual({
  amount,
  code,
  expires,
  subtitle,
  copyableCode = false,
  className,
}: GiftCardVisualProps) {
  return (
    <div
      className={cn(
        "flex aspect-[1.6/1] w-full max-w-[360px] flex-col justify-between rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-3xl">{amount}</span>
        {subtitle ? <span className="text-sm text-white/80">{subtitle}</span> : null}
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-white/70 text-xs">Code</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            {code}
            {copyableCode ? (
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(code)}
                aria-label="Copy code"
                className="text-white/80 transition-colors hover:text-white"
              >
                <CopyIcon className="size-3.5" />
              </button>
            ) : null}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-white/70 text-xs">Expires</span>
          <span className="font-medium">{expires}</span>
        </div>
      </div>
    </div>
  )
}
