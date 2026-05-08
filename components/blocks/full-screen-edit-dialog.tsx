"use client"

import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type * as React from "react"
import { useContext, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { AuthContext } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

const COPY = {
  en: { close: "Close", save: "Save" },
  ar: { close: "إغلاق", save: "حفظ" },
}

/**
 * Override the Dialog primitive's centered modal sizing so it fills the
 * viewport. Mirrors `fullScreenDialogClass` in cami-design's
 * `business-profile-form.tsx`. The `!` suffix wins over the primitive's
 * `sm:max-w-md` defaults.
 */
const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col p-0"

type FullScreenEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Page title — also rendered (small, fading in) inside the sticky header on scroll. */
  title: string
  /** One-line subtitle below the big title. */
  subtitle?: string
  /** Optional Save handler. Omit to render only the Close button. */
  onSave?: () => void
  saveDisabled?: boolean
  saveLabel?: string
  closeLabel?: string
  /**
   * Max-width Tailwind utility for the centered content column. Header inner
   * + body inner share this width so action buttons align with body content.
   * Defaults to `max-w-3xl`.
   */
  contentClassName?: string
  children: React.ReactNode
}

/**
 * Dialog version of the full-screen takeover. Use when the takeover should
 * stack on top of an existing dialog (e.g. an edit flow opened from the
 * Settings dialog) rather than being a deep-linked route. Visual structure
 * mirrors `<FullScreenEditShell>` exactly — same sticky header, scroll-fading
 * title, pill Close+Save buttons, big page title.
 */
export function FullScreenEditDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  onSave,
  saveDisabled,
  saveLabel,
  closeLabel,
  contentClassName,
  children,
}: FullScreenEditDialogProps) {
  // Read locale from AuthContext directly so the dialog is usable outside
  // <AuthProvider> (e.g. /settings/team, where there's no admin auth scope).
  const auth = useContext(AuthContext)
  const t = COPY[auth?.locale ?? "en"]
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)

  // Re-attach the scroll listener every time the dialog opens — refs to the
  // DOM nodes only exist while the dialog is mounted.
  useEffect(() => {
    if (!open) {
      setShowHeaderTitle(false)
      return
    }
    let cleanup: (() => void) | undefined
    const setup = () => {
      const el = scrollRef.current
      const header = titleRef.current
      if (!el || !header) {
        const id = window.requestAnimationFrame(setup)
        cleanup = () => window.cancelAnimationFrame(id)
        return
      }
      const update = () => {
        const titleRect = header.getBoundingClientRect()
        const containerRect = el.getBoundingClientRect()
        setShowHeaderTitle(titleRect.bottom < containerRect.top)
      }
      update()
      el.addEventListener("scroll", update, { passive: true })
      cleanup = () => el.removeEventListener("scroll", update)
    }
    setup()
    return () => cleanup?.()
  }, [open])

  const widthClass = contentClassName ?? "max-w-3xl"

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenDialogClass}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{subtitle ?? title}</DialogDescription>

        <header className="sticky top-0 z-10 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
          <div className={cn("mx-auto flex items-center justify-between gap-3", widthClass)}>
            <span
              className={cn(
                "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
                showHeaderTitle ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!showHeaderTitle}
            >
              {title}
            </span>
            <div className="ms-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                radius="full"
                aria-label={closeLabel ?? t.close}
                onClick={() => onOpenChange(false)}
                className="lg:hidden"
              >
                <XIcon className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                radius="full"
                onClick={() => onOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                {closeLabel ?? t.close}
              </Button>
              {onSave ? (
                <Button
                  type="button"
                  size="lg"
                  radius="full"
                  disabled={saveDisabled}
                  onClick={onSave}
                  className="hidden lg:inline-flex"
                >
                  {saveLabel ?? t.save}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 lg:px-10">
          <div className={cn("mx-auto flex w-full flex-col gap-10", widthClass)}>
            <div className="flex flex-col gap-3">
              <h1
                ref={titleRef}
                className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="max-w-2xl text-base leading-6 text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
