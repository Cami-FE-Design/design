"use client"

// Terminals (DSG-62) — Settings > Payments > Terminals.
// Spec: docs/specs/DSG-62-terminal-registration.md
//
// Replaces the merchant-level shared-PIN panel. Terminals are registered from
// here, each gets its own code and PIN, and staff sign in with both to open a
// 24-hour session. Sessions are not listed separately: at a ceiling of four
// terminals the history was mostly dead rows, so what remains is the live
// count feeding a row's Active status and a Sign out action in its menu.
//
// Both credentials stay readable. The code is issued once and never changes;
// the PIN can be re-read whenever staff need to sign a device in, and
// regenerated when the merchant wants it changed. Deliberately not a
// write-once secret — anyone who can open Payment settings can read it.

import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useId, useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import type { BreadcrumbRoot } from "@/components/blocks/sales-settings"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogTitle } from "@/components/ui/dialog"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DEMO_SESSIONS,
  DEMO_TERMINALS,
  generatePin,
  generateTerminalCode,
  liveSessions,
  locationName,
  SESSION_HOURS,
  TERMINAL_LOCATIONS,
  type Terminal,
  type TerminalSession,
  type TerminalStatus,
  TYPICAL_SESSIONS,
  TYPICAL_TERMINALS,
  terminalStatus,
  useTerminals,
} from "@/lib/terminals/store"
import { cn } from "@/lib/utils"

// Match Input's h-12 / rounded-2xl so the location Select doesn't sit shorter
// than the name field above it.
const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

/**
 * Demo-only view override, deep-linked from /screens as
 * ?tp=typical|full|empty. Without one the panel reads the store, which starts
 * empty — where a real merchant starts. "typical" is two terminals, "full"
 * shows every status at once for review.
 */
export type TerminalsDemoState = "typical" | "full" | "empty" | null

/**
 * Deep-linked dialog (?td=). The two dialogs carry most of this feature's
 * design decisions but sit behind a row menu, so a reviewer handed a bare URL
 * would never reach them. Opens on the first terminal in view.
 */
export type TerminalsDemoDialog = "credentials" | "sessions" | "add" | null

// The two setup states are amber because they are waiting on someone; the two
// running states are green or neutral because nothing is owed.
const STATUS_LABEL: Record<TerminalStatus, string> = {
  locked: "Locked",
  "not-paired": "Not paired",
  active: "Active",
  "no-sessions": "No sessions",
}

const STATUS_DOT: Record<TerminalStatus, string> = {
  locked: "bg-tomato-9",
  "not-paired": "bg-cami-yellow-9",
  active: "bg-cami-green-9",
  "no-sessions": "bg-sand-8",
}

export function TerminalsPanel({
  onBack,
  breadcrumbRoot,
  initialState = null,
  initialDialog = null,
}: {
  onBack: () => void
  breadcrumbRoot: BreadcrumbRoot
  initialState?: TerminalsDemoState
  initialDialog?: TerminalsDemoDialog
}) {
  const store = useTerminals()
  const [demoState, setDemoState] = useState<TerminalsDemoState>(initialState)

  const [registerOpen, setRegisterOpen] = useState(initialDialog === "add")
  // Credentials on screen: after registering, after regenerating, or just
  // because someone asked to see them. All three show the same thing.
  const [credentials, setCredentials] = useState<{
    terminal: Terminal
    mode: CredentialsMode
  } | null>(null)
  const [viewingSessions, setViewingSessions] = useState<Terminal | null>(null)
  // Which field the edit dialog opens on. "Edit" alone didn't say what it
  // edits, so the menu names the two things a merchant actually changes.
  const [editing, setEditing] = useState<{ terminal: Terminal; field: EditField } | null>(null)
  const [regenerating, setRegenerating] = useState<Terminal | null>(null)
  const [removing, setRemoving] = useState<Terminal | null>(null)

  const terminals =
    demoState === "empty"
      ? []
      : demoState === "full"
        ? DEMO_TERMINALS
        : demoState === "typical"
          ? TYPICAL_TERMINALS
          : store.terminals
  const sessions =
    demoState === "empty"
      ? []
      : demoState === "full"
        ? DEMO_SESSIONS
        : demoState === "typical"
          ? TYPICAL_SESSIONS
          : store.sessions

  // Open a deep-linked dialog once, on the first terminal in view. Guarded by
  // its own flag rather than an effect so it can't reopen after being closed.
  const [dialogOpened, setDialogOpened] = useState(false)
  if (!dialogOpened && initialDialog && terminals.length > 0) {
    setDialogOpened(true)
    if (initialDialog === "credentials") {
      setCredentials({ terminal: terminals[0], mode: "viewing" })
    } else if (initialDialog === "sessions") {
      setViewingSessions(terminals[0])
    }
  }

  // Any real action drops the demo override, so it can't mutate the store while
  // a fake list is on screen.
  function withRealState(run: () => void) {
    setDemoState(null)
    run()
  }

  return (
    <SettingsPanel
      header={
        <>
          <NotionBreadcrumb
            segments={[
              { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
              { label: "Terminals" },
            ]}
          />
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              Terminals
            </h2>
            <p className="max-w-xl text-sm leading-5 text-muted-foreground">
              Add the card machines that take Terminal/POS payments. Each device is paired once with
              its code, then staff sign in with its 6-digit PIN for 24 hours at a time.
            </p>
          </header>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <RegisteredTerminalsCard
          terminals={terminals}
          sessions={sessions}
          onRegister={() => setRegisterOpen(true)}
          onShowCredentials={(terminal) => setCredentials({ terminal, mode: "viewing" })}
          onViewSessions={setViewingSessions}
          onRename={(terminal) => setEditing({ terminal, field: "name" })}
          onChangeLocation={(terminal) => setEditing({ terminal, field: "location" })}
          onRegenerate={setRegenerating}
          onRemove={setRemoving}
          onUnlock={(terminal) =>
            withRealState(() => {
              store.unlockTerminal(terminal.id)
              toast.success(`${terminal.name} unlocked`)
            })
          }
        />
      </div>

      {/* Prototype demo controls (gift-cards convention). Signing in happens on
          the hardware, so nothing in the dashboard can trigger it — the first
          control stands in for that keypress. */}
      <div className="mt-auto flex shrink-0 items-center justify-end gap-4 pt-2">
        {terminals.some((t) => !t.pairedAt) ? (
          <button
            type="button"
            onClick={() =>
              withRealState(() => {
                const target = store.terminals.find((t) => !t.pairedAt)
                if (!target) return
                store.pairDevice(target.id)
                toast.success(`${target.name} paired`)
              })
            }
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Demo: pair a device
          </button>
        ) : null}
        {terminals.some((t) => t.pairedAt && !t.lockedFor) ? (
          <button
            type="button"
            onClick={() =>
              withRealState(() => {
                const target = store.terminals.find((t) => t.pairedAt && !t.lockedFor)
                if (!target) return
                store.startSession(target.id)
                toast.success(`Signed in on ${target.name}`)
              })
            }
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Demo: sign in on a terminal
          </button>
        ) : null}
        <button
          type="button"
          onClick={() =>
            setDemoState(demoState === null ? "typical" : demoState === "typical" ? "full" : null)
          }
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          Demo: {demoState === null ? "live" : demoState === "typical" ? "typical" : "all statuses"}
        </button>
      </div>

      <RegisterTerminalDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onCreate={(input) =>
          withRealState(() => {
            const terminal: Terminal = {
              ...input,
              pin: generatePin(),
              pairedAt: null,
              lockedFor: null,
              lastSeenAt: null,
            }
            store.registerTerminal(terminal)
            // Step 2: both credentials, which is everything the merchant walks
            // over to the hardware with.
            setCredentials({ terminal, mode: "registered" })
          })
        }
      />

      <CredentialsDialog
        issued={credentials}
        // Hand off to the same confirm the row menu uses rather than stacking a
        // second modal on top of this one; it reopens here with the new PIN.
        onRegenerate={(terminal) => {
          setCredentials(null)
          setRegenerating(terminal)
        }}
        onDone={() => setCredentials(null)}
      />

      <TerminalSessionsDialog
        terminal={viewingSessions}
        sessions={
          viewingSessions ? sessions.filter((x) => x.terminalId === viewingSessions.id) : []
        }
        onRevoke={(session) =>
          withRealState(() => {
            store.revokeSession(session.id)
            toast.success(`${session.device} revoked`)
          })
        }
        onDone={() => setViewingSessions(null)}
      />

      <EditTerminalDialog
        editing={editing}
        onCancel={() => setEditing(null)}
        onSave={(patch) =>
          withRealState(() => {
            if (!editing) return
            store.updateTerminal(editing.terminal.id, patch)
            toast.success(editing.field === "name" ? "Terminal renamed" : "Location updated")
            setEditing(null)
          })
        }
      />

      {/* Names the sessions it will end, and scoped to one device — the whole
          point of the per-device model is that this leaves the others alone. */}
      <ConfirmDialog
        open={regenerating !== null}
        onOpenChange={(open) => !open && setRegenerating(null)}
        title={regenerating ? `Regenerate the PIN for ${regenerating.name}?` : ""}
        description={regenerating ? regenerateWarning(sessions, regenerating.id) : ""}
        confirmLabel="Regenerate PIN"
        destructive
        onConfirm={() =>
          withRealState(() => {
            if (!regenerating) return
            const { pin } = store.regeneratePin(regenerating.id)
            setCredentials({ terminal: { ...regenerating, pin }, mode: "regenerated" })
            setRegenerating(null)
          })
        }
      />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={removing ? `Remove ${removing.name}?` : ""}
        description="The device stops taking payments and its sessions end. To use it again you'd register it as a new terminal with a new code."
        confirmLabel="Remove terminal"
        destructive
        onConfirm={() =>
          withRealState(() => {
            if (!removing) return
            store.removeTerminal(removing.id)
            toast.success(`${removing.name} removed`)
            setRemoving(null)
          })
        }
      />
    </SettingsPanel>
  )
}

/** Names the exact sessions this will end, rather than warning in the abstract. */
function regenerateWarning(sessions: TerminalSession[], terminalId: string): string {
  const n = liveSessions(sessions, terminalId).length
  const subject = n === 1 ? "1 live session is" : `${n} live sessions are`
  const clause =
    n === 0
      ? "No sessions are signed in, so nothing is interrupted."
      : `${subject} signed out immediately.`
  return `${clause} Other terminals are unaffected. The new PIN is shown once.`
}

/**
 * "Registered terminals" stays as the heading even though the action reads
 * "Add terminal" — the heading describes what the rows are, the button what
 * you do to get one.
 *
 * List rows, not a data table. The columns were five equal-weight cells with no
 * hierarchy — the merchant had to read all of them to find the device. A row
 * puts the name first and demotes code, location, and last seen to one muted
 * line, leaving status as the only thing competing with the name.
 */
function RegisteredTerminalsCard({
  terminals,
  sessions,
  onRegister,
  onShowCredentials,
  onViewSessions,
  onRename,
  onChangeLocation,
  onRegenerate,
  onRemove,
  onUnlock,
}: {
  terminals: Terminal[]
  sessions: TerminalSession[]
  onRegister: () => void
  onShowCredentials: (terminal: Terminal) => void
  onViewSessions: (terminal: Terminal) => void
  onRename: (terminal: Terminal) => void
  onChangeLocation: (terminal: Terminal) => void
  onRegenerate: (terminal: Terminal) => void
  onRemove: (terminal: Terminal) => void
  onUnlock: (terminal: Terminal) => void
}) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Registered terminals
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Card machines registered to your business, across all your locations.
          </p>
        </div>
        {/* The action lives on the list it adds to. Suppressed while empty —
            the empty state carries the same button, and two of them an inch
            apart is noise. */}
        {/* Suppressed while empty — the empty state carries the same button,
            and two of them an inch apart is noise. */}
        {terminals.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            radius="full"
            className="shrink-0"
            onClick={onRegister}
          >
            <PlusIcon />
            Add terminal
          </Button>
        ) : null}
      </header>

      {terminals.length === 0 ? (
        <EmptyState
          icon={MonitorSmartphoneIcon}
          title="No terminals yet"
          description="Add a card machine to give it a pairing code and a PIN."
          className="py-8"
          action={
            <Button type="button" variant="secondary" radius="full" onClick={onRegister}>
              Add terminal
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border/60">
          {terminals.map((terminal) => (
            <TerminalRow
              key={terminal.id}
              terminal={terminal}
              sessions={sessions}
              onShowCredentials={onShowCredentials}
              onViewSessions={onViewSessions}
              onRename={onRename}
              onChangeLocation={onChangeLocation}
              onRegenerate={onRegenerate}
              onRemove={onRemove}
              onUnlock={onUnlock}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function TerminalRow({
  terminal,
  sessions,
  onShowCredentials,
  onViewSessions,
  onRename,
  onChangeLocation,
  onRegenerate,
  onRemove,
  onUnlock,
}: {
  terminal: Terminal
  sessions: TerminalSession[]
  onShowCredentials: (terminal: Terminal) => void
  onViewSessions: (terminal: Terminal) => void
  onRename: (terminal: Terminal) => void
  onChangeLocation: (terminal: Terminal) => void
  onRegenerate: (terminal: Terminal) => void
  onRemove: (terminal: Terminal) => void
  onUnlock: (terminal: Terminal) => void
}) {
  const status = terminalStatus(terminal, sessions)
  const liveCount = liveSessions(sessions, terminal.id).length
  const location = locationName(terminal.locationId)

  // One muted line, joined by · — the code first, since it is the thing that
  // identifies the hardware.
  const detail = [
    terminal.id,
    location,
    terminal.lastSeenAt ? `Last seen ${terminal.lastSeenAt}` : "Never connected",
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            status === "locked"
              ? "border-tomato-5 bg-tomato-2 text-tomato-11"
              : status === "not-paired"
                ? "border-cami-yellow-5 bg-cami-yellow-2 text-cami-yellow-11"
                : status === "active"
                  ? "border-cami-green-5 bg-cami-green-2 text-cami-green-11"
                  : "border-border/50 bg-background text-muted-foreground",
          )}
        >
          <MonitorSmartphoneIcon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-5 text-foreground">
            {terminal.name}
          </span>
          <span className="truncate text-sm leading-5 text-muted-foreground">{detail}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="flex w-[7.5rem] shrink-0 items-center gap-1.5 text-sm leading-5 text-muted-foreground">
          <span aria-hidden className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[status])} />
          <span className="truncate">
            {STATUS_LABEL[status]}
            {status === "locked" && terminal.lockedFor ? ` · ${terminal.lockedFor}` : ""}
          </span>
        </span>

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
            {/* The code is re-openable rather than one-shot: a device can be
                unpaired and re-paired, and the code never changes. */}
            {/* Both credentials, any time. Staff sign in with the PIN daily,
                so hiding it behind a one-shot reveal would be hostile. */}
            <DropdownMenuItem onSelect={() => onShowCredentials(terminal)}>
              Show code &amp; PIN
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRename(terminal)}>Rename terminal</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onChangeLocation(terminal)}>
              Change location
            </DropdownMenuItem>
            {/* Which devices are signed in, and revoking them one at a time.
                Only offered once the terminal has actually been paired. */}
            {terminal.pairedAt ? (
              <DropdownMenuItem onSelect={() => onViewSessions(terminal)}>
                {liveCount === 1 ? "1 device signed in" : `${liveCount} devices signed in`}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={() => onRegenerate(terminal)}>
              Regenerate PIN
            </DropdownMenuItem>
            {terminal.lockedFor ? (
              <DropdownMenuItem onSelect={() => onUnlock(terminal)}>Unlock now</DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onRemove(terminal)}>
              Remove terminal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

/**
 * Registration, and only registration. It ends with the device existing and
 * carrying its code; issuing a PIN is a separate task from the row.
 *
 * The two were briefly bundled — first as two numbered steps, then as one
 * screen handing over both. Both were wrong for the same reason: the code is
 * permanent identity that stays readable on the row forever, while the PIN is
 * a rotating secret that exists once. Tying them together implied they share a
 * lifecycle, and left no honest place for "registered but not set up yet",
 * which is a real state a merchant sits in.
 */
function RegisterTerminalDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: { id: string; name: string; locationId: string }) => void
}) {
  const nameId = useId()
  const [name, setName] = useState("")
  const [locationId, setLocationId] = useState<string>("")

  const trimmed = name.trim()

  function close() {
    onClose()
    setName("")
    setLocationId("")
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
          Add a terminal
        </DialogTitle>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          Give the device a name your staff will recognise. We&rsquo;ll generate a pairing code to
          enter on the hardware.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>Device name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Front Desk Register"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {TERMINAL_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            disabled={trimmed.length === 0 || locationId === ""}
            onClick={() => {
              onCreate({
                id: generateTerminalCode(),
                name: trimmed,
                locationId,
              })
              close()
            }}
          >
            Add terminal
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

/**
 * Why the credentials dialog is open. The title has to say it — "Front Desk
 * Register" alone left the reader to guess whether something had just been
 * created, changed, or merely looked up.
 */
type CredentialsMode = "registered" | "viewing" | "regenerated"

const CREDENTIALS_TITLE: Record<CredentialsMode, (name: string) => string> = {
  registered: (name) => `Set up ${name}`,
  viewing: (name) => `Code & PIN for ${name}`,
  regenerated: (name) => `New PIN for ${name}`,
}

/**
 * Both credentials, any time. Reached three ways — straight after registering,
 * after a regenerate, and from "Show code & PIN" on any row — because they are
 * the same two facts in every case.
 *
 * They are shown together because that is how a device is set up: the code
 * pairs the hardware, the PIN signs staff in. But they are labelled apart,
 * because their lifecycles differ — the code is issued once and never changes,
 * while the PIN can be regenerated whenever the merchant wants it changed.
 *
 * The PIN is masked until asked for. It is readable, not secret, but this
 * panel is often open on a screen the counter can see.
 */
function CredentialsDialog({
  issued,
  onRegenerate,
  onDone,
}: {
  issued: { terminal: Terminal; mode: CredentialsMode } | null
  onRegenerate: (terminal: Terminal) => void
  onDone: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  // Re-mask whenever a different terminal (or a fresh regenerate) opens this.
  const [seededFor, setSeededFor] = useState<string | null>(null)
  const key = issued ? `${issued.terminal.id}:${issued.terminal.pin}` : null
  if (key !== seededFor) {
    setSeededFor(key)
    // A PIN the merchant just generated is theirs to read straight away;
    // one they came back to look at gets masked until asked for.
    setRevealed(issued?.mode === "regenerated")
  }

  return (
    <DialogPrimitive.Root open={issued !== null} onOpenChange={(o) => !o && onDone()}>
      <DialogContent className="max-w-md gap-0 p-6">
        {issued ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
                {CREDENTIALS_TITLE[issued.mode](issued.terminal.name)}
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                radius="full"
                aria-label="Close"
                onClick={onDone}
                className="-mr-2 -mt-1 text-muted-foreground"
              >
                <XIcon className="size-5" />
              </Button>
            </div>
            {/* The location is the difference between two identical tablets on
                two counters, so it belongs anywhere the device is identified. */}
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {locationName(issued.terminal.locationId)}
            </p>
            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              {issued.mode === "regenerated"
                ? "The device stays paired — its code hasn't changed. Staff sign in again with the new PIN."
                : "Enter the code on the terminal to pair it, then the PIN to sign in. Sessions last 24 hours."}
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <CredentialField
                label="Pairing code"
                value={issued.terminal.id}
                onCopy={() => {
                  navigator.clipboard?.writeText(issued.terminal.id)
                  toast.success("Code copied")
                }}
              />

              {/* Regenerating belongs on the field it changes — the hint says
                  the PIN can be replaced any time, so the control for it should
                  be here rather than only in the row menu behind this dialog. */}
              <CredentialField
                label="Sign-in PIN"
                value={revealed ? issued.terminal.pin : "••••••"}
                masked={!revealed}
                onReveal={() => setRevealed((r) => !r)}
                revealed={revealed}
                onRegenerate={() => onRegenerate(issued.terminal)}
                onCopy={() => {
                  navigator.clipboard?.writeText(issued.terminal.pin)
                  toast.success("PIN copied")
                }}
              />
            </div>

            <div className="mt-8 flex items-center justify-end">
              <Button type="button" size="lg" radius="full" onClick={onDone}>
                Done
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

/**
 * Icon-only control. The tooltip is the verb alone — it appears anchored to the
 * button, so the field it belongs to is already obvious and repeating it read
 * as clutter. The aria-label keeps the subject, because a screen reader
 * announces these out of that spatial context.
 */
function IconAction({
  action,
  subject,
  onClick,
  children,
}: {
  action: string
  subject: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          className="text-muted-foreground"
          aria-label={`${action} ${subject.toLowerCase()}`}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action}</TooltipContent>
    </Tooltip>
  )
}

/** One credential: what it is, how long it lasts, and how to get it out. */
function CredentialField({
  label,
  value,
  masked = false,
  revealed,
  onReveal,
  onRegenerate,
  onCopy,
}: {
  label: string
  value: string
  masked?: boolean
  revealed?: boolean
  onReveal?: () => void
  onRegenerate?: () => void
  onCopy: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {/* Sized to be read off a screen and typed into a keypad a few feet
          away, with the tracking loose enough that adjacent digits don't run
          together. */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-4">
        <span
          className={cn(
            "truncate font-mono text-2xl font-semibold tracking-[0.12em]",
            masked ? "tracking-[0.35em] text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
        {/* Icon-only: the field label already says what each control acts on,
            so the words were repeating context the row supplies. */}
        <span className="flex shrink-0 items-center gap-1">
          {onReveal ? (
            <IconAction action={revealed ? "Hide" : "Show"} subject={label} onClick={onReveal}>
              {revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </IconAction>
          ) : null}
          <IconAction action="Copy" subject={label} onClick={onCopy}>
            <CopyIcon className="size-4" />
          </IconAction>
        </span>
      </div>
      {/* Regenerating replaces the value rather than reading it out, so it sits
          apart from Show and Copy — those two are ways of getting at what's
          already there. A link underneath keeps it available without giving a
          destructive action the same weight as the harmless pair above. */}
      {onRegenerate ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto w-fit p-0 text-sm"
          onClick={onRegenerate}
        >
          Regenerate PIN
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Which devices are signed in on one terminal, and how to throw one off.
 *
 * A session belongs to hardware, not a person — the PIN is shared by whoever
 * works that counter, so there is no name to show. Device model, app build and
 * IP are what a merchant actually recognises a sign-in by, and what tells them
 * an unexpected one apart from their own tablet.
 *
 * Revoking is per session on purpose. Regenerating the PIN is the blunt
 * instrument for a lost device, and the footer says so rather than leaving the
 * merchant to work out which control they want.
 */
function TerminalSessionsDialog({
  terminal,
  sessions,
  onRevoke,
  onDone,
}: {
  terminal: Terminal | null
  sessions: TerminalSession[]
  onRevoke: (session: TerminalSession) => void
  onDone: () => void
}) {
  // Live first: a signed-out row is history, a live one may need acting on.
  const ordered = [...sessions].sort(
    (a, b) => Number(b.status === "live") - Number(a.status === "live"),
  )

  return (
    <DialogPrimitive.Root open={terminal !== null} onOpenChange={(o) => !o && onDone()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        {terminal ? (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-border/60 p-6">
              <div className="flex flex-col gap-1">
                <DialogTitle className="font-heading text-xl font-semibold text-foreground">
                  {terminal.name}
                </DialogTitle>
                <p className="text-sm leading-5 text-muted-foreground">
                  {locationName(terminal.locationId)} · Devices signed in on code{" "}
                  <span className="font-mono text-foreground">{terminal.id}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                radius="full"
                aria-label="Close"
                onClick={onDone}
                className="shrink-0 text-muted-foreground"
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-6">
              {ordered.length === 0 ? (
                <EmptyState
                  icon={MonitorSmartphoneIcon}
                  title="No devices signed in"
                  description={`Staff sign in with this terminal's PIN. Sessions last ${SESSION_HOURS} hours.`}
                  className="py-6"
                />
              ) : (
                ordered.map((session) => (
                  <SessionCard key={session.id} session={session} onRevoke={onRevoke} />
                ))
              )}

              <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-4 text-sm leading-5 text-muted-foreground">
                <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Regenerating this terminal&rsquo;s PIN revokes all its sessions at once — use it
                  if a device is lost.
                </span>
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

const SESSION_STATUS: Record<TerminalSession["status"], { label: string; className: string }> = {
  live: { label: "Live", className: "bg-cami-green-3 text-cami-green-11" },
  expired: { label: "Expired", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  "signed-out": { label: "Revoked", className: "bg-muted text-muted-foreground" },
}

function SessionCard({
  session,
  onRevoke,
}: {
  session: TerminalSession
  onRevoke: (session: TerminalSession) => void
}) {
  const meta = SESSION_STATUS[session.status]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground"
        >
          <MonitorSmartphoneIcon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold leading-5 text-foreground">
              {session.device}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                meta.className,
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {meta.label}
            </span>
          </span>
          <span className="truncate text-sm leading-5 text-muted-foreground">{session.app}</span>
        </div>
      </div>

      {/* Two columns of facts, each labelled — an IP or a timestamp on its own
          is unreadable without one. */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <SessionFact label="IP address" value={session.ip} mono />
        <SessionFact label="Last seen" value={session.lastSeenAt} />
        <SessionFact label="Signed in" value={session.startedAt} />
        <SessionFact label="Expires" value={session.expiresAt} />
      </dl>

      {session.status === "live" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          radius="full"
          className="w-fit border-tomato-6 text-tomato-11 hover:bg-tomato-2"
          onClick={() => onRevoke(session)}
        >
          Revoke session
        </Button>
      ) : null}
    </div>
  )
}

function SessionFact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-sm leading-5 text-muted-foreground">{label}</dt>
      <dd
        className={cn("truncate text-sm leading-5 text-foreground", mono ? "font-mono" : undefined)}
      >
        {value}
      </dd>
    </div>
  )
}

/** Which single thing the dialog changes. */
type EditField = "name" | "location"

/**
 * One field at a time, named by what it changes. A shared "Edit" dialog left
 * the merchant to work out which of two things they were there for; splitting
 * it means the menu item, the title, and the toast all say the same word.
 *
 * The code is shown but never editable: it is what the hardware was paired
 * with, so changing it would orphan the device.
 */
function EditTerminalDialog({
  editing,
  onCancel,
  onSave,
}: {
  editing: { terminal: Terminal; field: EditField } | null
  onCancel: () => void
  onSave: (patch: { name: string; locationId: string }) => void
}) {
  const nameId = useId()
  const [name, setName] = useState("")
  const [locationId, setLocationId] = useState<string>("")
  const [seededFor, setSeededFor] = useState<string | null>(null)

  if (!editing) return null
  const { terminal, field } = editing

  // Re-seed when a different row or field opens the dialog, without an effect.
  const key = `${terminal.id}:${field}`
  if (seededFor !== key) {
    setSeededFor(key)
    setName(terminal.name)
    setLocationId(terminal.locationId)
  }

  const trimmed = name.trim()
  const canSave = field === "name" ? trimmed.length > 0 : locationId !== ""

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            {field === "name" ? "Rename terminal" : "Change location"}
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

        {/* Whichever field isn't being changed still identifies the device. */}
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {field === "name" ? <span className="font-mono">{terminal.id}</span> : terminal.name}
        </p>

        {field === "name" ? (
          <div className="mt-6 flex flex-col gap-2">
            <Label htmlFor={nameId}>Device name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Front Desk Register"
              autoFocus
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {TERMINAL_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            disabled={!canSave}
            onClick={() =>
              onSave({
                name: trimmed || terminal.name,
                locationId,
              })
            }
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
