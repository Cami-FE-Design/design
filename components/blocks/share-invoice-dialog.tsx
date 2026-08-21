"use client"

// "Share invoice" from the sale detail dialog (DSG-72).
//
// Behaviour is matched to the shipped implementation, not to a screenshot:
// cami-business `src/modules/invoice/components/ShareInvoiceDialog.tsx`, read
// 2026-08-21. Where the two differ the product wins — the point of this file is
// that the design repo and the live app show the same share sheet.
//
// The link here is the ticket's "unique invoice link", so this modal is the
// doorway to the document. Share invoice must never navigate away from the sale.

import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { GmailGlyphIcon, WhatsAppGlyphIcon } from "@/components/blocks/social-icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * The link is fetched — the backend mints the share token — so it has real
 * loading and failure states. Exposed as a prop rather than internal state so
 * the playground can show all three without a network.
 */
export type ShareLinkState = "ready" | "loading" | "error"

function buildEmailSubject(merchantName: string, saleNumber: string, isRefund: boolean) {
  return `Your invoice from ${merchantName} (${isRefund ? "Refund" : "Sale"} ${saleNumber})`
}

function buildGmailHref(publicUrl: string, defaultEmail: string, subject: string) {
  const to = defaultEmail ? encodeURIComponent(defaultEmail) : ""
  const body = encodeURIComponent(`View your invoice: ${publicUrl}`)
  // fs=1 keeps Gmail in full-screen compose, which is where the body param
  // actually pre-fills.
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(
    subject,
  )}&body=${body}`
}

export function ShareInvoiceDialog({
  open,
  onOpenChange,
  invoiceUrl,
  merchantName,
  saleNumber,
  isRefund = false,
  defaultEmail = "",
  linkState = "ready",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The public invoice URL. Ignored unless `linkState` is "ready". */
  invoiceUrl: string
  merchantName: string
  saleNumber: string
  /** Drives "Refund N" instead of "Sale N" in the subject line. */
  isRefund?: boolean
  /** Client email on file, prefilled as the Gmail recipient. */
  defaultEmail?: string
  linkState?: ShareLinkState
}) {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) setCopied(false)
  }, [open])

  // Clear the revert timer on unmount, or it fires against a gone component.
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    },
    [],
  )

  const publicUrl = linkState === "ready" ? invoiceUrl : null
  const disabled = !publicUrl
  const subject = buildEmailSubject(merchantName, saleNumber, isRefund)

  function handleCopy() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      // Restart the countdown rather than letting an earlier copy's timer cut
      // this one short.
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  /**
   * Gmail alone gets the copy-and-toast. Its compose URL drops the prefilled
   * body often enough that the operator would otherwise send an empty email
   * without noticing, so the copy turns a silent failure into a paste.
   * WhatsApp's text param is reliable and needs neither.
   */
  function handleGmailClick() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    toast.info(
      "Invoice link copied — paste it into the email body if it doesn't appear automatically.",
      { duration: 5000 },
    )
  }

  function handleWhatsApp() {
    if (!publicUrl) return
    const text = encodeURIComponent(`${subject}\n${publicUrl}`)
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer")
  }

  function handleMore() {
    if (!publicUrl) return
    navigator.share({ url: publicUrl, title: subject }).catch(() => {})
  }

  // Only offered where the browser actually has it — a dead "More options" row
  // is worse than no row.
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  const rowClass =
    "flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogDescription className="sr-only">
          Copy the invoice link or share it with the client.
        </DialogDescription>
        <DialogTitle className="text-xl font-semibold">Share invoice</DialogTitle>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Copy link</p>
          <div className="flex items-center gap-2">
            {linkState === "loading" ? (
              <Skeleton className="h-10 flex-1 rounded-2xl" />
            ) : (
              <div className="flex min-w-0 flex-1 items-center rounded-2xl border bg-muted px-3 py-2">
                <span className="truncate text-sm text-muted-foreground">
                  {publicUrl ?? "Failed to generate link"}
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              radius="full"
              className="shrink-0"
              onClick={handleCopy}
              disabled={disabled}
              aria-label={copied ? "Copied" : "Copy link"}
            >
              {copied ? (
                <CheckIcon className="size-4 text-cami-green-11" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">Share via</p>
          <div className="flex flex-col divide-y overflow-hidden rounded-2xl border">
            {publicUrl ? (
              <a
                href={buildGmailHref(publicUrl, defaultEmail, subject)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGmailClick}
                className={rowClass}
              >
                <GmailGlyphIcon className="size-5 shrink-0" />
                Gmail
              </a>
            ) : (
              <span
                className="flex cursor-not-allowed items-center gap-3 px-4 py-3 text-sm font-medium text-foreground opacity-50"
                aria-disabled="true"
              >
                <GmailGlyphIcon className="size-5 shrink-0 opacity-50" />
                Gmail
              </span>
            )}

            <button
              type="button"
              className={cn(rowClass, "disabled:cursor-not-allowed disabled:opacity-50")}
              onClick={handleWhatsApp}
              disabled={disabled}
            >
              <WhatsAppGlyphIcon className="size-5 shrink-0 text-[#25D366]" />
              WhatsApp
            </button>

            {canNativeShare ? (
              <button
                type="button"
                className={cn(rowClass, "disabled:cursor-not-allowed disabled:opacity-50")}
                onClick={handleMore}
                disabled={disabled}
              >
                <Share2Icon className="size-5 shrink-0 text-muted-foreground" />
                More options
              </button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
