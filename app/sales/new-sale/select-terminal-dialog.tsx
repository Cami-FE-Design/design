"use client"

import { MonitorSmartphoneIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  locationName,
  type Terminal,
  type TerminalSession,
  terminalStatus,
} from "@/lib/terminals/store"
import { cn } from "@/lib/utils"
import { formatAedDecimal } from "./mock"

// Picking the machine before the sale goes to it. The sale is routed to ONE
// device, so the operator says which — a counter with three registers can't
// have a card charge surface on all three.
//
// Only a terminal someone is signed into can take the sale. The other three
// states from DSG-62 (never paired, paired but nobody signed in, locked out on
// failed PINs) are listed rather than filtered out, with the reason on the row:
// a receptionist whose usual register is missing needs to know it's the sign-in
// that's missing, not the terminal.

/** A terminal can only pick up a sale while someone is signed into it. */
export function canTakeSale(terminal: Terminal, sessions: TerminalSession[]): boolean {
  return terminalStatus(terminal, sessions) === "active"
}

/** Why this row can't be picked, or null when it can. */
function blockedReason(terminal: Terminal, sessions: TerminalSession[]): string | null {
  const status = terminalStatus(terminal, sessions)
  if (status === "active") return null
  if (status === "locked")
    return terminal.lockedFor ? `Locked · ${terminal.lockedFor}` : "Locked out"
  if (status === "not-paired") return "Not set up on the device yet"
  return "Nobody signed in"
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
            {formatAedDecimal(amountMinor)} will be charged on the device you pick.
          </p>
        </div>

        {available.length === 0 ? (
          <div className="rounded-xl bg-cami-yellow-2 p-3">
            <p className="text-sm text-foreground leading-5">
              No terminal is signed in right now. Sign in on the device with its PIN, then send this
              sale — or take the payment another way.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {terminals.map((terminal) => {
            const reason = blockedReason(terminal, sessions)
            const disabled = reason !== null
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
                  disabled
                    ? "cursor-not-allowed border-border/60 opacity-60"
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
                  <span className="truncate font-medium text-foreground text-sm leading-5">
                    {terminal.name}
                  </span>
                  <span className="truncate text-muted-foreground text-sm leading-5">
                    {reason ?? locationName(terminal.locationId)}
                  </span>
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
