"use client"

import { MonitorSmartphoneIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { locationName } from "@/lib/locations/mock"
import { formatMoney } from "@/lib/money/format"
import { terminalFix, terminalStatusText } from "@/lib/terminals/status"
import { type Terminal, type TerminalSession, terminalStatus } from "@/lib/terminals/store"
import { cn } from "@/lib/utils"

// Picking the machine before the sale goes to it. The sale is routed to ONE
// device, so the operator says which — a counter with three registers can't
// have a card charge surface on all three.
//
// Only a terminal someone is signed into can take the sale. The other three
// states from DSG-62 (never paired, paired but nobody signed in, locked out on
// failed PINs) are listed rather than filtered out, with the status and its fix
// on the row (BUG-65): a receptionist whose usual register is
// missing needs to know it's the sign-in that's missing, not the terminal.

/** A terminal can only pick up a sale while someone is signed into it. */
export function canTakeSale(terminal: Terminal, sessions: TerminalSession[]): boolean {
  return terminalStatus(terminal, sessions) === "active"
}

type SelectTerminalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  terminals: Terminal[]
  sessions: TerminalSession[]
  /** What the machine will collect — stated up front, since it can't be edited after. */
  amountMinor: number
  onSend: (terminal: Terminal) => void
}

export function SelectTerminalDialog({
  open,
  onOpenChange,
  terminals,
  sessions,
  amountMinor,
  onSend,
}: SelectTerminalDialogProps) {
  const available = terminals.filter((t) => canTakeSale(t, sessions))
  // Usable machines first. On a short list the order barely matters; on the
  // long one — which is the only reason this dialog exists, since three or
  // fewer are tiles in the grid — it is the difference between picking the
  // register in front of you and reading past four you can't use.
  const ordered = [...terminals].sort(
    (a, b) => Number(canTakeSale(b, sessions)) - Number(canTakeSale(a, sessions)),
  )
  // Pre-select when there is exactly one usable machine, so the dialog is a
  // confirmation rather than a task. The caller skips it entirely in that case
  // for a merchant with a single terminal; this covers "one of four is signed
  // in", where naming the device still tells the operator something.
  const [selectedId, setSelectedId] = useState<string | null>(
    available.length === 1 ? available[0].id : null,
  )
  const selected = terminals.find((t) => t.id === selectedId) ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-5 sm:max-w-md">
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="font-heading font-semibold text-2xl">
            Send to terminal
          </DialogTitle>
          <p className="text-muted-foreground text-sm leading-5">
            {formatMoney(amountMinor)} will be charged on the device you pick.
          </p>
        </div>

        {available.length === 0 ? (
          <div className="rounded-xl bg-cami-yellow-2 p-3">
            <p className="text-sm text-foreground leading-5">
              No terminal is ready right now. Take the payment another way, or fix one below and
              send this sale again.
            </p>
          </div>
        ) : null}

        {/* Scrolls rather than growing: the dialog is capped by the viewport
            and clips what overflows, so a merchant with eight machines would
            otherwise lose the rows AND the Send button off the bottom. */}
        <div className="-mx-1 flex max-h-72 flex-col gap-2 overflow-y-auto px-1">
          {ordered.map((terminal) => {
            const status = terminalStatus(terminal, sessions)
            const disabled = status !== "active"
            const isSelected = terminal.id === selectedId
            return (
              <button
                key={terminal.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedId(terminal.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                  // No fade on a blocked row: its status and fix are the
                  // reason it's listed at all, so they stay readable (BUG-65).
                  disabled
                    ? "cursor-not-allowed border-border/60 bg-muted/30"
                    : isSelected
                      ? "cursor-pointer border-cami-violet-8 bg-cami-violet-2"
                      : "cursor-pointer border-border/60 hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    disabled
                      ? "bg-muted text-muted-foreground"
                      : "bg-cami-green-2 text-cami-green-11",
                  )}
                >
                  <MonitorSmartphoneIcon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "truncate font-medium text-sm leading-5",
                      disabled ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {terminal.name}
                  </span>
                  {disabled ? (
                    // The fix sits on its own row, not in a footnote under the
                    // list: past the cap the blocked rows sort to the bottom,
                    // out of view, and a note about them read as being about
                    // the rows on screen.
                    <span className="text-muted-foreground text-sm leading-5">
                      <span className="font-medium text-foreground">
                        {terminalStatusText(status, terminal.lockedFor)}
                      </span>
                      {" · "}
                      {terminalFix(status)}
                    </span>
                  ) : (
                    <span className="truncate text-muted-foreground text-sm leading-5">
                      {locationName(terminal.locationId) || "No location"}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            radius="full"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            className="flex-1"
            disabled={!selected}
            onClick={() => {
              if (!selected) return
              onOpenChange(false)
              onSend(selected)
            }}
          >
            Send to terminal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
