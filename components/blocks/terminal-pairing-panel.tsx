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
// error. Locked/error are demo-only states cycled via the bottom toggle.
// Locked behaviour confirmed by Michelle: 15-minute lockout, PIN stays
// visible, regenerating unlocks pairing immediately. The regenerate confirm
// is skipped when zero terminals are paired — it exists to warn that
// regenerating will unpair existing terminals (DSG-62 follow-up).
//
// Paired terminal management (docs/specs/DSG-62-terminal-management.md): each
// row can be renamed, moved to another location, and unpaired on its own.
// Before this, dropping one terminal meant regenerating the PIN and signing
// out every terminal at every location.

import {
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useId, useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import type { BreadcrumbRoot } from "@/components/blocks/sales-settings"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  activeCount,
  DEMO_TERMINALS,
  locationName,
  type PairedTerminal,
  useTerminalPairing,
} from "@/lib/terminal-pairing/store"
import { cn } from "@/lib/utils"

// Reveal auto-hides after this long so a PIN left on screen at the front desk
// re-masks itself (ticket: "define whether the PIN auto-hides").
const REVEAL_TIMEOUT_MS = 30_000

/**
 * Demo-only view override cycled by the prototype toggle / deep-linked from
 * /screens. "no-terminals" is a PIN that exists with nothing paired to it —
 * the paired-terminals empty state on its own, without the regenerate success
 * banner that "success" carries.
 */
export type TerminalPairingDemoState =
  | "active"
  | "no-terminals"
  | "empty"
  | "locked"
  | "error"
  | "success"
  | null

const DEMO_CYCLE: Exclude<TerminalPairingDemoState, null>[] = [
  "active",
  "no-terminals",
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
  /** Deep-link (?tp=no-terminals|empty|locked|error|success): open on a specific demo state. */
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

  // Demo overrides: locked implies terminals are paired; success is the state
  // right after regenerating, so every session shows as expired and waiting to
  // be re-paired; no-terminals is a genuinely empty list. Real flows read the
  // store directly.
  const terminals =
    demoState === "locked"
      ? DEMO_TERMINALS
      : demoState === "success"
        ? // Sessions expire; connectivity is untouched, since regenerating a
          // PIN doesn't power anything off.
          DEMO_TERMINALS.map((t) => ({ ...t, status: "expired" as const }))
        : demoState === "no-terminals"
          ? []
          : pairing.terminals
  // Active sessions, not rows — expired ones are still listed.
  const effectivePaired = activeCount(terminals)

  // A row action while a demo override is active would mutate the store while
  // the list on screen is a fake — clear the override first so the action
  // lands on the rows the user is actually looking at.
  function withRealState(run: () => void) {
    setDemoState(null)
    setJustIssued(null)
    run()
  }

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
        // Column wrapper so the sessions card matches the PIN card's width.
        <div className="flex w-full flex-col gap-6 sm:w-fit">
          <PinCard
            pin={pin}
            // "no-terminals" only changes the list below; the PIN card itself
            // is the ordinary active card with a count of zero.
            view={view === "no-terminals" ? "active" : view}
            pairedTerminals={effectivePaired}
            justIssued={justIssued}
            onCopy={() => {
              navigator.clipboard?.writeText(pin)
              toast.success("PIN copied")
            }}
            // The confirm exists to warn about unpairing existing terminals —
            // with none paired there's nothing to warn about, so skip it.
            onRegenerate={() => (effectivePaired === 0 ? handleRegenerate() : setConfirmOpen(true))}
            onRetry={handleRegenerate}
            onDismissIssued={() => setJustIssued(null)}
          />
          <PairedTerminalsCard
            pin={pin}
            terminals={terminals}
            onRename={(id, name) =>
              withRealState(() => {
                pairing.renameTerminal(id, name)
                toast.success("Terminal renamed")
              })
            }
            onUnpair={(terminal) =>
              withRealState(() => {
                pairing.unpairTerminal(terminal.id)
                // Verb matches the menu item that was clicked.
                toast.success(
                  terminal.status === "expired"
                    ? `${terminal.name} removed`
                    : `${terminal.name} unpaired`,
                )
              })
            }
          />
        </div>
      )}

      {/* Prototype demo controls — cycle the ticket's states, and stand in for
          the one thing that happens off-screen (mirrors the gift-cards
          convention). */}
      <div className="mt-auto flex items-center justify-end gap-4 pt-2">
        {/* Pairing starts on the physical terminal, so nothing in the
            dashboard can trigger it. This is the prototype's stand-in for a
            staff member typing the PIN into a device, so the empty list can be
            walked through to a populated one. Hidden before a PIN exists —
            there'd be nothing to type. */}
        {view !== "empty" ? (
          <button
            type="button"
            onClick={() =>
              // Pair onto the list on screen, not the stored one, so pairing
              // from an empty demo state lands on one terminal rather than
              // resurrecting the stored three.
              withRealState(() => {
                const terminal = pairing.pairTerminal(terminals)
                toast.success(`${terminal.id} paired`)
              })
            }
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Demo: pair a terminal
          </button>
        ) : null}
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
        sessionCount={effectivePaired}
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
        <div className="flex items-start gap-2 rounded-xl bg-cami-green-2 p-3 text-sm leading-5 text-foreground">
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
        <div className="flex items-start justify-between gap-3 rounded-xl bg-tomato-2 p-3 text-sm leading-5 text-foreground">
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
        <div className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground">
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
 * Currently paired terminals — name, location, online/offline, last active.
 * Only active sessions are listed (expired/revoked ones drop off), which is
 * why there is no session-status column. Copy never attributes a pairing to a
 * staff member: the PIN is a shared secret, the system can't know who typed it.
 *
 * The device ID is deliberately off the row and inside the edit dialog: it's
 * nine characters that never change, and the one moment a merchant needs it is
 * while matching a row against the sticker on the hardware — which is exactly
 * when they're renaming it.
 */
function PairedTerminalsCard({
  pin,
  terminals,
  onRename,
  onUnpair,
}: {
  pin: string
  terminals: PairedTerminal[]
  onRename: (id: string, name: string) => void
  onUnpair: (terminal: PairedTerminal) => void
}) {
  const [editing, setEditing] = useState<PairedTerminal | null>(null)
  const [unpairing, setUnpairing] = useState<PairedTerminal | null>(null)
  const [pairOpen, setPairOpen] = useState(false)

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 p-5 sm:min-w-146">
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Paired terminals
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Card terminals that are paired with your business right now, from all your locations.
          </p>
        </div>
        {/* Only when the list has rows — the empty state carries the same
            action, and two identical buttons an inch apart is noise. */}
        {terminals.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            radius="full"
            className="shrink-0"
            onClick={() => setPairOpen(true)}
          >
            <PlusIcon />
            Pair a terminal
          </Button>
        ) : null}
      </header>
      {terminals.length === 0 ? (
        <EmptyState
          icon={MonitorSmartphoneIcon}
          title="No terminals paired yet"
          // The how-to moved into the Pair a terminal dialog, where it can be
          // the full sequence instead of a compressed one-liner. Leaving both
          // would have the description and the button say the same thing.
          description="Terminals show up here once they're paired with your business."
          className="py-8"
          action={
            <Button
              type="button"
              variant="secondary"
              radius="full"
              onClick={() => setPairOpen(true)}
            >
              Pair a terminal
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border/60">
          {terminals.map((terminal) => (
            <li key={terminal.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
                  <MonitorSmartphoneIcon className="size-5" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium leading-5 text-foreground">
                    {terminal.name}
                  </span>
                  {/* Connectivity reads as one more detail on this line, next
                      to the timestamp it's derived from — no indicator dot,
                      that treatment is reserved for session state on the
                      right. */}
                  <span className="truncate text-sm leading-5 text-muted-foreground">
                    {[
                      terminal.id,
                      locationName(terminal.locationId),
                      `Last active ${terminal.lastSeenAt}`,
                      terminal.online ? "Online" : "Offline",
                    ].join(" · ")}
                  </span>
                </div>
              </div>
              {/* Two independent columns, fixed-width so they line up down the
                  list. Session state is whether the pairing is still valid;
                  connectivity is whether the device is reachable. They vary
                  independently — Expired + Online is a device sitting there
                  powered on, ready to re-pair, which is the common case right
                  after a regenerate. */}
              <div className="flex shrink-0 items-center gap-1">
                <StatusDot
                  label={terminal.status === "expired" ? "Expired" : "Active"}
                  // Yellow rather than grey: an expired session needs someone
                  // to act, where an offline device may just be switched off.
                  dotClass={terminal.status === "expired" ? "bg-cami-yellow-9" : "bg-cami-green-9"}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      radius="full"
                      className="text-muted-foreground"
                      aria-label={`Manage ${terminal.name}`}
                    >
                      <MoreHorizontalIcon className="size-4" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditing(terminal)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* An expired session is already signed out, so "Unpair"
                        would name something that already happened, and a
                        confirm would guard an action that loses nothing. */}
                    {terminal.status === "expired" ? (
                      <DropdownMenuItem variant="destructive" onSelect={() => onUnpair(terminal)}>
                        Remove
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setUnpairing(terminal)}
                      >
                        Unpair
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PairTerminalDialog open={pairOpen} pin={pin} onClose={() => setPairOpen(false)} />

      <RenameTerminalDialog
        terminal={editing}
        onCancel={() => setEditing(null)}
        onSave={(name) => {
          if (editing) onRename(editing.id, name)
          setEditing(null)
        }}
      />

      {/* Unpairing is recoverable — the confirm names the terminal so a
          mis-click on the wrong row is caught before it's committed, and says
          how to get the device back rather than implying it's gone. */}
      <ConfirmDialog
        open={unpairing !== null}
        onOpenChange={(open) => !open && setUnpairing(null)}
        title={unpairing ? `Unpair ${unpairing.name}?` : ""}
        description="This terminal stops taking payments immediately. To use it again, enter the pairing PIN on the terminal."
        confirmLabel="Unpair terminal"
        destructive
        onConfirm={() => {
          if (unpairing) onUnpair(unpairing)
          setUnpairing(null)
        }}
      />
    </section>
  )
}

/**
 * Rename one terminal. A compact dialog rather than the FullScreenEditDialog
 * takeover: that convention is for multi-section records, and a one-field form
 * rendered full-screen reads as a bug.
 *
 * Location is deliberately not editable here — it arrives with the pairing, so
 * the merchant reads it on the row rather than setting it.
 */
function RenameTerminalDialog({
  terminal,
  onCancel,
  onSave,
}: {
  terminal: PairedTerminal | null
  onCancel: () => void
  onSave: (name: string) => void
}) {
  const nameId = useId()
  const [name, setName] = useState("")

  // Re-seed each time a different row opens the dialog.
  useEffect(() => {
    if (!terminal) return
    setName(terminal.name)
  }, [terminal])

  if (!terminal) return null

  const trimmed = name.trim()

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            Rename terminal
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

        <div className="mt-6 flex flex-col gap-2">
          <Label htmlFor={nameId}>Name</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Front desk"
            autoFocus
          />
          {/* The device ID answers "which one is this?" — asked at exactly the
              moment you're naming it, so it belongs here as well as the row. */}
          <p className="text-sm leading-5 text-muted-foreground">{terminal.id}</p>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            disabled={trimmed.length === 0}
            onClick={() => onSave(trimmed)}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

/**
 * Read-only 6-digit display — same tile footprint as the OtpInput used on the
 * terminal side, so the dashboard PIN visually matches what staff will type.
 * Six tiles come to 376px, so this fits the max-w-md dialog unchanged.
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
 * Session state on a terminal row. Same dot-and-label treatment as the
 * connectivity readout on the detail line, because the two are peers rather
 * than a primary and a qualifier — a dead session on a powered-on device is
 * Expired + Online, and both halves are things the merchant acts on. Fixed
 * width so it lines up down the list; the text carries the meaning, never the
 * dot colour alone.
 */
function StatusDot({ label, dotClass }: { label: string; dotClass: string }) {
  return (
    <span className="flex w-[5.25rem] shrink-0 items-center gap-1.5 text-sm leading-5 text-muted-foreground">
      <span aria-hidden className={cn("size-2 rounded-full", dotClass)} />
      {label}
    </span>
  )
}

/**
 * The PIN, big, with the one instruction that matters. Not an action — nothing
 * in the dashboard can start a pairing, it begins on the hardware.
 *
 * This was three numbered steps; the middle one was the only one carrying
 * information. Step 1 named a device menu path nobody had confirmed against
 * real hardware, and step 3 described what the list visibly does on its own.
 */
function PairTerminalDialog({
  open,
  pin,
  onClose,
}: {
  open: boolean
  pin: string
  onClose: () => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            Pair a terminal
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 -mt-1 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </div>

        {/* Revealed, unlike the card: you're mid-task with a device in hand,
            and a masked PIN here would just be a second click. */}
        <div className="mt-6">
          <PinDigits pin={pin} revealed />
        </div>

        <p className="mt-4 text-sm leading-5 text-foreground">Enter this PIN on your terminal.</p>

        {/* Answers the question a second terminal raises: is there a different
            PIN for this one? The PIN card says so too, but it's behind this
            dialog while you're reading. */}
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          The same PIN works for every terminal, at every location.
        </p>

        <div className="mt-8 flex items-center justify-end">
          <Button type="button" size="lg" radius="full" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
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
          This signs out{" "}
          <span className="font-semibold">
            {sessionCount === 1 ? "1 paired terminal" : `${sessionCount} paired terminals`}
          </span>{" "}
          across all locations, immediately. Each terminal stops taking payments until it's
          re-paired with the new PIN — avoid doing this mid-shift.
        </DialogDescription>
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" size="lg" radius="full" onClick={onConfirm}>
            {`Sign out ${sessionCount === 1 ? "1 terminal" : `${sessionCount} terminals`} & regenerate`}
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
