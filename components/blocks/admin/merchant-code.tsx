"use client"

// The Partner code, everywhere it appears (DSG-82).
// Spec: docs/specs/DSG-82-hq-terminal-management.md
//
// `CM-4821`. Every use of it ends with someone pasting it into a ticket or a
// chat, so the chip is a copy button rather than text — there is no other verb
// available on a code that can never be edited.

import { CheckIcon, CopyIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function MerchantCode({
  code,
  className,
  /**
   * "chip" is the interactive one, for surfaces with room for a copy
   * affordance — the detail modal header and the Terminals card. "inline" is
   * plain text for dense rows, where a button per row would be twelve buttons
   * nobody asked for.
   */
  variant = "chip",
}: {
  code: string
  className?: string
  variant?: "chip" | "inline"
}) {
  const [copied, setCopied] = useState(false)

  // Revert the tick on its own. Without this the chip stays "copied" forever,
  // which stops meaning anything after the second copy.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  if (variant === "inline") {
    return (
      <span className={cn("font-mono text-xs text-muted-foreground tabular-nums", className)}>
        {code}
      </span>
    )
  }

  function handleCopy(event: React.MouseEvent) {
    // These sit inside clickable rows and dialog headers; copying the code is
    // not "open the Partner".
    event.stopPropagation()
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy Partner code ${code}`}
      className={cn(
        "flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 py-0.5 pl-2.5 pr-2 font-mono text-xs text-muted-foreground tabular-nums transition-colors hover:text-foreground",
        className,
      )}
    >
      {code}
      {copied ? (
        <CheckIcon className="size-3 shrink-0 text-cami-green-11" aria-hidden />
      ) : (
        <CopyIcon className="size-3 shrink-0" aria-hidden />
      )}
    </button>
  )
}
