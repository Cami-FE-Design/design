"use client"

// Terminal pairing PIN panel (DSG-62) — lives under Business Settings >
// Payments, alongside payment methods. Dashboard-side view/copy/regenerate
// for the merchant-level pairing PIN. The PIN is one per merchant, shared by
// every terminal at every location, and gates pairing only (never refunds,
// voids, or discounts). Because it's a shared secret the system cannot tell
// which staff member paired a device — copy must never imply attribution.
//
// States (per ticket): empty (no PIN yet), active (masked, reveal/copy/
// regenerate), regenerate confirm (names the exact session count), regenerate
// success (new PIN surfaced + re-pair instruction), rate-limited/locked, and
// error. Locked/error are demo-only states cycled via the bottom toggle,
// pending open question 1 (lockout duration/behaviour).

import {
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MonitorSmartphoneIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/blocks/empty-state"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import type { BreadcrumbRoot } from "@/components/blocks/sales-settings"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useTerminalPairing } from "@/lib/terminal-pairing/store"
import { cn } from "@/lib/utils"

// Reveal auto-hides after this long so a PIN left on screen at the front desk
// re-masks itself (ticket: "define whether the PIN auto-hides").
const REVEAL_TIMEOUT_MS = 30_000

/** Demo-only view override cycled by the prototype toggle / deep-linked from /screens. */
export type TerminalPairingDemoState = "active" | "empty" | "locked" | "error" | "success" | null

const DEMO_CYCLE: Exclude<TerminalPairingDemoState, null>[] = [
  "active",
  "empty",
  "locked",
  "error",
  "success",
]

export function TerminalPairingPanel({
  onBack,
  breadcrumbRoot,
  initialState = null,
}: {
  onBack: () => void
  breadcrumbRoot: BreadcrumbRoot
  /** Deep-link (?tp=empty|locked|error|success): open on a specific demo state. */
  initialState?: TerminalPairingDemoState
}) {
  const pairing = useTerminalPairing()
  const [demoState, setDemoState] = useState<TerminalPairingDemoState>(initialState)
  // Set right after a regenerate/generate so the new PIN is surfaced
  // immediately with the re-pair instruction. Cleared when the user hides it.
  const [justIssued, setJustIssued] = useState<{ signedOut: number } | null>(
    initialState === "success" ? { signedOut: 3 } : null,
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Demo override wins over store state so /screens can deep-link each state
  // without mutating the persisted demo PIN.
  const view: Exclude<TerminalPairingDemoState, null> = demoState
    ? demoState
    : pairing.pin === null
      ? "empty"
      : justIssued
        ? "success"
        : "active"

  const pin = pairing.pin ?? "482913"

  function handleGenerate() {
    pairing.generatePin()
    setDemoState(null)
    setJustIssued({ signedOut: 0 })
  }

  function handleRegenerate() {
    const { signedOut } = pairing.regeneratePin()
    setConfirmOpen(false)
    setDemoState(null)
    setJustIssued({ signedOut })
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex shrink-0 flex-col gap-4">
        <NotionBreadcrumb
          segments={[
            { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
            { label: "Terminal pairing" },
          ]}
        />
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Terminal pairing
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Pair card terminals with a verification PIN. One PIN covers every terminal across all
            your locations.
          </p>
        </header>
      </div>

      {view === "empty" ? (
        <section className="flex w-full flex-col rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146">
          <EmptyState
            icon={MonitorSmartphoneIcon}
            title="No pairing PIN yet"
            description="Generate a PIN, then enter it on a card terminal to pair it with your business. Terminals can't take payments until they're paired."
            action={
              <Button type="button" variant="secondary" radius="full" onClick={handleGenerate}>
                Generate PIN
              </Button>
            }
          />
        </section>
      ) : (
        <PinCard
          pin={pin}
          view={view}
          // Demo overrides: locked implies terminals are paired; success means
          // they were just signed out. Real flows read the store directly.
          pairedTerminals={
            demoState === "locked" ? 3 : demoState === "success" ? 0 : pairing.pairedTerminals
          }
          justIssued={justIssued}
          onCopy={() => {
            navigator.clipboard?.writeText(pin)
            toast.success("PIN copied")
          }}
          onRegenerate={() => setConfirmOpen(true)}
          onRetry={handleRegenerate}
          onDismissIssued={() => setJustIssued(null)}
        />
      )}

      {/* Prototype demo toggle — cycles through the ticket's states so the
          team can review each one (mirrors the gift-cards convention). */}
      <div className="mt-auto flex justify-end pt-2">
        <button
          type="button"
          onClick={() => {
            const current = demoState ?? view
            const next = DEMO_CYCLE[(DEMO_CYCLE.indexOf(current) + 1) % DEMO_CYCLE.length]
            setJustIssued(next === "success" ? { signedOut: 3 } : null)
            setDemoState(next)
          }}
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          Demo: next state ({view})
        </button>
      </div>

      <RegenerateConfirmDialog
        open={confirmOpen}
        sessionCount={demoState === "locked" ? 3 : pairing.pairedTerminals}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRegenerate}
      />
    </div>
  )
}

function PinCard({
  pin,
  view,
  pairedTerminals,
  justIssued,
  onCopy,
  onRegenerate,
  onRetry,
  onDismissIssued,
}: {
  pin: string
  view: "active" | "locked" | "success" | "error"
  pairedTerminals: number
  justIssued: { signedOut: number } | null
  onCopy: () => void
  onRegenerate: () => void
  /** Retry after a failed regenerate — no re-confirm, the user already confirmed. */
  onRetry: () => void
  onDismissIssued: () => void
}) {
  // Success surfaces the new PIN immediately; otherwise masked by default.
  const [revealed, setRevealed] = useState(view === "success")

  // Auto re-mask so a revealed PIN isn't left readable on a front-desk screen.
  useEffect(() => {
    if (!revealed) return
    const t = window.setTimeout(() => setRevealed(false), REVEAL_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [revealed])

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146">
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Pairing PIN
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {pairedTerminals === 1
              ? "1 terminal currently paired."
              : `${pairedTerminals} terminals currently paired.`}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onRegenerate}>
          <RefreshCwIcon />
          Regenerate
        </Button>
      </header>

      {view === "success" && justIssued ? (
        <div className="flex items-start gap-2 rounded-xl border-l-2 border-cami-green-8 bg-cami-green-2 p-3 text-sm leading-5 text-foreground">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-cami-green-11" aria-hidden />
          <span>
            New PIN generated.{" "}
            {justIssued.signedOut > 0
              ? `${justIssued.signedOut === 1 ? "1 terminal was" : `${justIssued.signedOut} terminals were`} signed out — enter this PIN on each one to pair it again.`
              : "Enter this PIN on a terminal to pair it."}
          </span>
        </div>
      ) : null}

      {/* Regenerate failed. The card stays fully functional — the current PIN
          is still valid, so hiding it behind a full-screen error would read as
          "your PIN is gone" when nothing actually changed. */}
      {view === "error" ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border-l-2 border-tomato-8 bg-tomato-2 p-3 text-sm leading-5 text-foreground">
          <div className="flex items-start gap-2">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-tomato-11" aria-hidden />
            <span>
              <span className="font-medium">Couldn't regenerate the PIN.</span> Nothing changed —
              this PIN still works and paired terminals stay connected.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="shrink-0 bg-transparent"
            onClick={onRetry}
          >
            <RefreshCwIcon />
            Try again
          </Button>
        </div>
      ) : null}

      {view === "locked" ? (
        <div className="flex items-start gap-2 rounded-xl border-l-2 border-cami-yellow-8 bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
          <span>
            <span className="font-medium">Pairing temporarily locked.</span> Too many incorrect PIN
            entries on a terminal. Pairing new terminals is blocked for 15 minutes — already paired
            terminals keep working. Regenerating the PIN unlocks pairing right away.
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <PinDigits pin={pin} revealed={revealed} />
        <p className="text-sm leading-5 text-muted-foreground">
          Enter this PIN on a card terminal to pair it. It works for any terminal at any location,
          and anyone with access to these settings can view it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          radius="full"
          onClick={() => {
            if (revealed && view === "success") onDismissIssued()
            setRevealed((r) => !r)
          }}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
          {revealed ? "Hide" : "Reveal"}
        </Button>
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onCopy}>
          <CopyIcon />
          Copy
        </Button>
      </div>
    </section>
  )
}

/**
 * Read-only 6-digit display — same tile footprint as the OtpInput used on the
 * terminal side, so the dashboard PIN visually matches what staff will type.
 */
function PinDigits({ pin, revealed }: { pin: string; revealed: boolean }) {
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={revealed ? `Pairing PIN: ${pin.split("").join(" ")}` : "Pairing PIN hidden"}
    >
      {pin.split("").map((digit, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: stable index for fixed-length PIN slot
          key={i}
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-2xl font-medium text-foreground",
            !revealed && "text-muted-foreground",
          )}
        >
          {revealed ? digit : "•"}
        </span>
      ))}
    </div>
  )
}

/**
 * Destructive confirm for regeneration. Names the exact number of active
 * terminal sessions that will be signed out — not a generic warning — because
 * regenerating mid-shift interrupts staff taking payments.
 */
function RegenerateConfirmDialog({
  open,
  sessionCount,
  onCancel,
  onConfirm,
}: {
  open: boolean
  sessionCount: number
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            Regenerate pairing PIN?
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={onCancel}
            className="-mr-2 -mt-1 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </div>
        <DialogDescription className="mt-4 text-sm leading-5 text-foreground">
          {sessionCount > 0 ? (
            <>
              This signs out{" "}
              <span className="font-semibold">
                {sessionCount === 1 ? "1 paired terminal" : `${sessionCount} paired terminals`}
              </span>{" "}
              across all locations, immediately. Each terminal stops taking payments until it's
              re-paired with the new PIN — avoid doing this mid-shift.
            </>
          ) : (
            <>
              No terminals are currently paired, so nothing will be signed out. The current PIN
              stops working and a new one is generated.
            </>
          )}
        </DialogDescription>
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" size="lg" radius="full" onClick={onConfirm}>
            {sessionCount > 0
              ? `Sign out ${sessionCount === 1 ? "1 terminal" : `${sessionCount} terminals`} & regenerate`
              : "Regenerate PIN"}
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
