"use client"

// One Partner's terminals (DSG-82), in the Settings tab of the HQ Partner
// detail dialog, under the CamiPay card.
// Spec: docs/specs/DSG-82-hq-terminal-management.md
//
// Cami buys the hardware and leases it out, so this card is about *assignment*:
// which of our units this Partner has, since when, and getting them back. The
// fleet-wide view of the same data — stock, and the reverse lookup "who has
// this serial" — is /admin/terminals.
//
// Two things HQ deliberately cannot do here. It cannot read a terminal's PIN:
// that is the merchant's credential for their own staff, and a reveal button on
// an HQ screen would make every support call an invitation to read it out. And
// it cannot rename a unit or set its location, because those describe the
// merchant's counter, not our asset.

import {
  BanIcon,
  CirclePlusIcon,
  InfoIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { TERMINAL_STATUS_TILE, TerminalStatus } from "@/components/blocks/hq-terminal-status"
import { SectionCard } from "@/components/blocks/section-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { AdminBusiness } from "@/lib/admin-businesses"
import { useAuth } from "@/lib/auth-mock"
import { merchantConfig, useCamiPay } from "@/lib/hq-camipay/store"
import {
  availableTerminals,
  type HqTerminal,
  hqTerminalStatus,
  merchantTerminals,
  useHqTerminals,
} from "@/lib/hq-terminals/store"
import { cn } from "@/lib/utils"

/**
 * The read-only notice, matching the footnote treatment on the CamiPay card
 * directly above. It is the card's only footnote: a paragraph explaining what
 * Block does belongs in the Block confirm dialog, not above it permanently.
 */
function FootNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-3 px-3 py-2.5 text-xs leading-4 text-cami-yellow-11">
      <InfoIcon className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/**
 * Merchant-level terminal access, as a control on the card that is named after
 * it. Writes `rails.terminal.enabled` — the same flag as the CamiPay Terminal
 * switch one card up. One flag, two views, not two flags.
 *
 * This card first only *stated* the flag and linked up to the switch, so there
 * would be exactly one control. That link could not be made to work: the scroll
 * lives on the Partner dialog's body so `scrollIntoView` did nothing, and once
 * that was worked around the click's own focus pulled the view straight back.
 * Three attempts in, the honest read is that a pointer which doesn't move you
 * is worse than showing one flag in both places people look for it — so the
 * switch is here, and the row says it is the same switch, so nobody hunts for a
 * second flag to explain a Partner who cannot transact.
 */
function AccessRow({
  business,
  railEnabled,
  canEditRail,
}: {
  business: AdminBusiness
  railEnabled: boolean
  canEditRail: boolean
}) {
  const camipay = useCamiPay()

  function handleToggle(next: boolean) {
    camipay.setRailEnabled(business.id, "terminal", next)
    toast.success(`Terminal access ${next ? "on" : "off"} for ${business.name}`)
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        railEnabled ? "bg-muted/50" : "bg-cami-yellow-3",
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium leading-4",
            railEnabled ? "text-foreground" : "text-cami-yellow-11",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              railEnabled ? "bg-cami-green-9" : "bg-cami-yellow-9",
            )}
          />
          Terminal access {railEnabled ? "on" : "off"}
          {/* Not a sentence: naming the relationship is a one-time realisation,
              and a line of prose apologising for the duplicated control would
              sit here permanently. */}
          <span className="font-normal text-muted-foreground">· Same as CamiPay Terminal</span>
        </span>
        {/* Only the off state earns a second line — that one is a warning, and
            it is the answer to "why can this Partner not take payments". A
            switch labelled "Terminal access" explains its on state by itself. */}
        {railEnabled ? null : (
          <span className="text-xs leading-4 text-cami-yellow-11">
            No device can sign in or take payments, whatever its status below.
          </span>
        )}
      </span>
      <Switch
        checked={railEnabled}
        onCheckedChange={handleToggle}
        disabled={!canEditRail}
        aria-label={`Terminal access, ${railEnabled ? "on" : "off"}`}
      />
    </div>
  )
}

function TerminalRow({
  terminal,
  canEdit,
  onBlock,
  onAllow,
  onSignOut,
  onReturn,
  onCopySerial,
}: {
  terminal: HqTerminal
  canEdit: boolean
  onBlock: (terminal: HqTerminal) => void
  onAllow: (terminal: HqTerminal) => void
  onSignOut: (terminal: HqTerminal) => void
  onReturn: (terminal: HqTerminal) => void
  onCopySerial: (terminal: HqTerminal) => void
}) {
  const status = hqTerminalStatus(terminal)

  // The serial leads: it is printed on the device, and it is what a courier
  // note, a lease schedule and a repair ticket all carry.
  const detail = [
    terminal.serial,
    terminal.location,
    terminal.liveSessions > 0
      ? `${terminal.liveSessions} signed in`
      : terminal.lastSeenAt
        ? `Last seen ${terminal.lastSeenAt}`
        : "Never switched on",
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border",
            TERMINAL_STATUS_TILE[status],
          )}
        >
          {status === "blocked" ? (
            <BanIcon className="size-4" />
          ) : (
            <MonitorSmartphoneIcon className="size-4" />
          )}
        </span>
        <div className="flex min-w-0 flex-col">
          {/* Falls back to the model: a unit shipped but never switched on has
              no merchant-set name yet, and "Untitled" would be a worse answer
              than what the thing physically is. */}
          <span className="truncate text-sm font-medium leading-5 text-foreground">
            {terminal.name ?? terminal.model}
          </span>
          <span className="truncate text-xs leading-5 text-muted-foreground">{detail}</span>
          {/* A block outlives the person who applied it, so the row says who
              and when rather than leaving support to guess at the audit log. */}
          {terminal.blocked ? (
            <span className="truncate text-xs leading-5 text-tomato-11">
              Blocked by {terminal.blocked.by} on {terminal.blocked.at}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <TerminalStatus status={status} suffix={terminal.lockedFor} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              className="text-muted-foreground"
              aria-label={`Manage ${terminal.name ?? terminal.serial}`}
            >
              <MoreHorizontalIcon className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onCopySerial(terminal)}>Copy serial</DropdownMenuItem>
            {canEdit ? (
              <>
                {/* Only offered when there is something to end. "Sign out
                    devices" on a terminal nobody is signed in to is a control
                    that does nothing. */}
                {terminal.liveSessions > 0 && !terminal.blocked ? (
                  <DropdownMenuItem onSelect={() => onSignOut(terminal)}>
                    {terminal.liveSessions === 1
                      ? "Sign out 1 device"
                      : `Sign out ${terminal.liveSessions} devices`}
                  </DropdownMenuItem>
                ) : null}
                {terminal.blocked ? (
                  <DropdownMenuItem onSelect={() => onAllow(terminal)}>
                    Allow terminal
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => onBlock(terminal)}>
                    Block terminal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {/* The destructive item is taking the hardware back, not
                    blocking it: a block is reversible from this same menu,
                    while a return ends the assignment and clears the pairing. */}
                <DropdownMenuItem variant="destructive" onSelect={() => onReturn(terminal)}>
                  Return to Cami
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

/**
 * Assign a unit from stock. A picker, not a form: HQ chooses which physical box
 * goes out, and everything else about it — serial, model, pairing code — already
 * exists, because we bought the unit before this Partner asked for one.
 */
function AssignTerminalDialog({
  open,
  onOpenChange,
  business,
  stock,
  onAssign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  stock: HqTerminal[]
  onAssign: (terminalId: string) => void
}) {
  const [selected, setSelected] = useState("")

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelected("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign a terminal</DialogTitle>
          <DialogDescription>
            The unit goes out to {business.name} and appears in their dashboard, where they pair it
            using the code that ships with it.
          </DialogDescription>
        </DialogHeader>

        {stock.length === 0 ? (
          <EmptyState
            icon={MonitorSmartphoneIcon}
            title="No terminals in stock"
            description="Every unit is out with a Partner or written off. Returned units go back into stock from the fleet list."
            className="py-6"
          />
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick a unit from stock" />
            </SelectTrigger>
            <SelectContent>
              {stock.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.model} · {unit.serial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <DialogFooter>
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button radius="full" disabled={!selected} onClick={() => onAssign(selected)}>
            Assign terminal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type HqTerminalsPanelProps = {
  business: AdminBusiness
  /** Archived Partners render read-only, matching the other detail tabs. */
  disabled?: boolean
}

export function HqTerminalsPanel({ business, disabled = false }: HqTerminalsPanelProps) {
  const auth = useAuth()
  const camipay = useCamiPay()
  const store = useHqTerminals()

  const terminals = merchantTerminals(store, business.id)
  const stock = availableTerminals(store)
  const railEnabled = merchantConfig(camipay, business.id).terminal.enabled
  // Two grants on one card, matching the split the CamiPay card makes. Moving
  // and blocking hardware is operational, so merchants.edit; the access switch
  // writes the rail flag, so it keeps the grant that guards it one card up.
  const canEdit = auth.has("merchants.edit") && !disabled
  const canEditRail = auth.has("billing.camipay.rails.edit") && !disabled

  const [assignOpen, setAssignOpen] = useState(false)
  const [blocking, setBlocking] = useState<HqTerminal | null>(null)
  const [signingOut, setSigningOut] = useState<HqTerminal | null>(null)
  const [returning, setReturning] = useState<HqTerminal | null>(null)

  function handleCopySerial(terminal: HqTerminal) {
    navigator.clipboard
      .writeText(terminal.serial)
      .then(() => toast.success(`Copied ${terminal.serial}`))
      .catch(() => {})
  }

  function handleAssign(terminalId: string) {
    const unit = stock.find((t) => t.id === terminalId)
    store.assignTerminal(terminalId, business.id)
    toast.success(`${unit?.model ?? "Terminal"} assigned to ${business.name}`, {
      description: unit ? `${unit.serial} · pairing code ${unit.id}` : undefined,
    })
    setAssignOpen(false)
  }

  function handleBlock() {
    if (!blocking) return
    store.blockTerminal(blocking.id, auth.user.name)
    toast.success(`${blocking.name ?? blocking.serial} blocked`)
    setBlocking(null)
  }

  function handleAllow(terminal: HqTerminal) {
    store.allowTerminal(terminal.id)
    toast.success(`${terminal.name ?? terminal.serial} can sign in again`)
  }

  function handleSignOut() {
    if (!signingOut) return
    const ended = store.signOutTerminal(signingOut.id)
    toast.success(ended === 1 ? "1 device signed out" : `${ended} devices signed out`)
    setSigningOut(null)
  }

  function handleReturn() {
    if (!returning) return
    store.returnTerminal(returning.id)
    toast.success(`${returning.serial} returned to Cami`, {
      description: "Back in stock, and off this Partner's list.",
    })
    setReturning(null)
  }

  return (
    <>
      <SectionCard
        title="Terminals"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {terminals.length === 1 ? "1 assigned" : `${terminals.length} assigned`}
            </span>
            {/* Suppressed while empty — the empty state carries the same
                button, and two of them an inch apart is noise. */}
            {canEdit && terminals.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                radius="full"
                onClick={() => setAssignOpen(true)}
              >
                <CirclePlusIcon />
                Assign
              </Button>
            ) : null}
          </div>
        }
      >
        <AccessRow business={business} railEnabled={railEnabled} canEditRail={canEditRail} />

        {terminals.length === 0 ? (
          <EmptyState
            icon={MonitorSmartphoneIcon}
            title="No terminals assigned"
            description="Cami has not sent this Partner a card machine yet."
            className="py-6"
            action={
              canEdit ? (
                <Button variant="secondary" radius="full" onClick={() => setAssignOpen(true)}>
                  <CirclePlusIcon />
                  Assign terminal
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {terminals.map((terminal) => (
              <TerminalRow
                key={terminal.id}
                terminal={terminal}
                canEdit={canEdit}
                onBlock={setBlocking}
                onAllow={handleAllow}
                onSignOut={setSigningOut}
                onReturn={setReturning}
                onCopySerial={handleCopySerial}
              />
            ))}
          </ul>
        )}

        {/* Only the read-only case gets a footnote. The "what Blocking does"
            paragraph that used to sit here explained a control before anyone
            touched it; it lives in the Block confirm dialog, where the decision
            is actually being made. */}
        {canEdit ? null : (
          <FootNote>
            {disabled
              ? "This Partner is archived, terminals are read-only."
              : "You have view-only access to terminals. Ask an HQ admin for Partner edit rights."}
          </FootNote>
        )}
      </SectionCard>

      <AssignTerminalDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        business={business}
        stock={stock}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={blocking !== null}
        onOpenChange={(next) => {
          if (!next) setBlocking(null)
        }}
        title={`Block ${blocking?.name ?? blocking?.serial ?? "terminal"}?`}
        description={
          blocking?.liveSessions
            ? `Staff cannot sign in on this device until it is allowed again, and ${
                blocking.liveSessions === 1 ? "its live session ends" : "its live sessions end"
              } now. The unit stays with the Partner, and their other terminals are unaffected.`
            : "Staff cannot sign in on this device until it is allowed again. The unit stays with the Partner, and their other terminals are unaffected."
        }
        confirmLabel="Block terminal"
        destructive
        onConfirm={handleBlock}
      />

      <ConfirmDialog
        open={signingOut !== null}
        onOpenChange={(next) => {
          if (!next) setSigningOut(null)
        }}
        title={`Sign out ${signingOut?.name ?? signingOut?.serial ?? "terminal"}?`}
        description="Anyone working this counter will need to sign in again with the terminal PIN. The device stays paired and is not blocked."
        confirmLabel="Sign out"
        destructive
        onConfirm={handleSignOut}
      />

      <ConfirmDialog
        open={returning !== null}
        onOpenChange={(next) => {
          if (!next) setReturning(null)
        }}
        title={`Return ${returning?.serial ?? "terminal"} to Cami?`}
        description={`The unit comes off ${business.name}'s list and goes back into stock, and its pairing is cleared so the next Partner never inherits a signed-in device. If it is coming back broken, mark it faulty from the fleet list instead.`}
        confirmLabel="Return to Cami"
        destructive
        onConfirm={handleReturn}
      />
    </>
  )
}
