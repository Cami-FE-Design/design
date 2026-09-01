"use client"

// Cami's terminal fleet (DSG-82).
// Spec: docs/specs/DSG-82-hq-terminal-management.md
//
// The Partner detail modal answers "which terminals does this Partner have".
// This screen answers the question support actually starts from: a ticket
// arrives naming a device — "NP5-2419-8830 won't take a card" — and nobody knows
// whose it is. A per-Partner view can never answer that; you would have to open
// Partners one at a time until you found it.
//
// It is also the only place the fleet as a whole is visible: what is on the
// shelf, what went out and when, what came back, and what was written off.

import { MonitorSmartphoneIcon, MoreHorizontalIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { AdminShell } from "@/components/blocks/admin-shell"
import { BusinessDetailDialog } from "@/components/blocks/business-detail-dialog"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { TERMINAL_STATUS_TILE, TerminalStatus } from "@/components/blocks/hq-terminal-status"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type AdminBusiness, adminBusinesses } from "@/lib/admin-businesses"
import { useAuth } from "@/lib/auth-mock"
import { type HqTerminal, hqTerminalStatus, useHqTerminals } from "@/lib/hq-terminals/store"
import { cn } from "@/lib/utils"

type FleetTab = "all" | "with-partners" | "in-stock" | "returned" | "faulty"

const TABS: { id: FleetTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "with-partners", label: "With Partners" },
  { id: "in-stock", label: "In stock" },
  { id: "returned", label: "Returned" },
  { id: "faulty", label: "Faulty" },
]

function isFleetTab(value: string | null): value is FleetTab {
  return value !== null && TABS.some((t) => t.id === value)
}

function inTab(terminal: HqTerminal, tab: FleetTab): boolean {
  const status = hqTerminalStatus(terminal)
  switch (tab) {
    case "all":
      return true
    case "with-partners":
      return terminal.merchantId !== null
    case "in-stock":
      return status === "in-stock"
    case "returned":
      return status === "returned"
    case "faulty":
      return status === "faulty"
  }
}

function partnerOf(terminal: HqTerminal): AdminBusiness | undefined {
  return terminal.merchantId ? adminBusinesses.find((b) => b.id === terminal.merchantId) : undefined
}

/**
 * Everything a person might type off a device, a courier note or a ticket: the
 * serial, the pairing code, the model, and the Partner by name or by the code
 * on their row (DSG-82). Searching the fleet by Partner is the forward lookup;
 * searching it by serial is the reverse one this screen exists for.
 */
function matchesQuery(terminal: HqTerminal, query: string): boolean {
  if (!query) return true
  const partner = partnerOf(terminal)
  return [
    terminal.serial,
    terminal.id,
    terminal.model,
    terminal.name,
    terminal.location,
    partner?.name,
    partner?.code,
  ]
    .filter(Boolean)
    .some((value) => (value as string).toLowerCase().includes(query))
}

function PartnerCell({
  terminal,
  onOpenPartner,
}: {
  terminal: HqTerminal
  onOpenPartner: (slug: string) => void
}) {
  const partner = partnerOf(terminal)

  // Every unassigned unit reads the same way, because the column answers one
  // question: who has it. It used to say "Returned 06 May 2026" for one kind of
  // unassigned unit and "At Cami HQ" for another, which put an event and a
  // place in the same column. The date is a fact about the status, and moved
  // there.
  if (!partner) {
    return <span className="text-sm text-muted-foreground">At Cami HQ</span>
  }

  return (
    <div className="flex min-w-0 flex-col">
      {/* Opens the Partner over this list rather than navigating to the roster:
          every other listing in the repo — /clients, /pets, /sales/*, the
          Partner roster itself — pops a detail dialog addressed by a query
          param, and leaving the fleet would throw away the tab and search you
          got here with. */}
      <button
        type="button"
        onClick={() => onOpenPartner(partner.slug)}
        className="w-fit cursor-pointer truncate text-left text-sm font-medium text-foreground hover:underline"
      >
        {partner.name}
      </button>
      <span className="truncate font-mono text-xs text-muted-foreground">
        {partner.code}
        {terminal.assignedAt ? ` · since ${terminal.assignedAt}` : ""}
      </span>
    </div>
  )
}

function TerminalRow({
  terminal,
  canEdit,
  onOpenPartner,
  onAssign,
  onBlock,
  onAllow,
  onSignOut,
  onReturn,
  onRestock,
  onFaulty,
}: {
  terminal: HqTerminal
  canEdit: boolean
  onOpenPartner: (slug: string) => void
  onAssign: (terminal: HqTerminal) => void
  onBlock: (terminal: HqTerminal) => void
  onAllow: (terminal: HqTerminal) => void
  onSignOut: (terminal: HqTerminal) => void
  onReturn: (terminal: HqTerminal) => void
  onRestock: (terminal: HqTerminal) => void
  onFaulty: (terminal: HqTerminal) => void
}) {
  const status = hqTerminalStatus(terminal)
  const assigned = terminal.merchantId !== null

  function copySerial() {
    navigator.clipboard
      .writeText(terminal.serial)
      .then(() => toast.success(`Copied ${terminal.serial}`))
      .catch(() => {})
  }

  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl border",
              TERMINAL_STATUS_TILE[status],
            )}
          >
            <MonitorSmartphoneIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            {/* Serial first, because that is what is printed on the box and
                quoted in the ticket. The merchant's name for it, when they have
                set one, reads underneath with the pairing code. */}
            <span className="truncate font-mono text-sm font-medium text-foreground">
              {terminal.serial}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {terminal.model}
              {terminal.name ? ` · ${terminal.name}` : ""} · {terminal.id}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <PartnerCell terminal={terminal} onOpenPartner={onOpenPartner} />
      </TableCell>

      <TableCell>
        <TerminalStatus
          status={status}
          suffix={status === "returned" ? terminal.returnedAt : terminal.lockedFor}
          className="w-auto"
        />
        {terminal.blocked ? (
          <span className="block text-xs text-tomato-11">
            by {terminal.blocked.by} on {terminal.blocked.at}
          </span>
        ) : null}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">{terminal.location ?? "—"}</TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {terminal.liveSessions > 0
          ? `${terminal.liveSessions} signed in`
          : (terminal.lastSeenAt ?? "Never")}
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* The same icon-only trigger the Partner card rows use. This was
                a ghost button reading "Manage", which put the word on every row
                and in the column header, and still read as text rather than
                something you could press. */}
            <Button
              variant="ghost"
              size="icon-sm"
              radius="full"
              className="text-muted-foreground"
              aria-label={`Manage ${terminal.serial}`}
            >
              <MoreHorizontalIcon className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={copySerial}>Copy serial</DropdownMenuItem>
            {canEdit ? (
              <>
                {/* The menu offers what this unit's state allows and nothing
                    else: a machine on the shelf can only go out, one at a
                    Partner can only be controlled or come back. */}
                {!assigned && !terminal.faulty ? (
                  <DropdownMenuItem onSelect={() => onAssign(terminal)}>
                    Assign to a Partner
                  </DropdownMenuItem>
                ) : null}
                {!assigned && terminal.returnedAt && !terminal.faulty ? (
                  <DropdownMenuItem onSelect={() => onRestock(terminal)}>
                    Put back in stock
                  </DropdownMenuItem>
                ) : null}
                {assigned && terminal.liveSessions > 0 && !terminal.blocked ? (
                  <DropdownMenuItem onSelect={() => onSignOut(terminal)}>
                    {terminal.liveSessions === 1
                      ? "Sign out 1 device"
                      : `Sign out ${terminal.liveSessions} devices`}
                  </DropdownMenuItem>
                ) : null}
                {assigned ? (
                  terminal.blocked ? (
                    <DropdownMenuItem onSelect={() => onAllow(terminal)}>
                      Allow terminal
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => onBlock(terminal)}>
                      Block terminal
                    </DropdownMenuItem>
                  )
                ) : null}
                <DropdownMenuSeparator />
                {assigned ? (
                  <DropdownMenuItem variant="destructive" onSelect={() => onReturn(terminal)}>
                    Return to Cami
                  </DropdownMenuItem>
                ) : null}
                {terminal.faulty ? null : (
                  <DropdownMenuItem variant="destructive" onSelect={() => onFaulty(terminal)}>
                    Mark faulty
                  </DropdownMenuItem>
                )}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

/** Pick the Partner a unit goes out to. The mirror of the card's stock picker. */
function AssignToPartnerDialog({
  terminal,
  onOpenChange,
  onAssign,
}: {
  terminal: HqTerminal | null
  onOpenChange: (open: boolean) => void
  onAssign: (merchantId: string) => void
}) {
  const [merchantId, setMerchantId] = useState("")

  // Archived Partners are not offered: sending hardware to an account nobody is
  // going to sign into is a mistake, not a choice.
  const eligible = adminBusinesses.filter((b) => b.state !== "archived")

  return (
    <ConfirmDialog
      open={terminal !== null}
      onOpenChange={(next) => {
        if (!next) setMerchantId("")
        onOpenChange(next)
      }}
      title={`Assign ${terminal?.serial ?? "terminal"}`}
      description={
        <span className="flex flex-col gap-3">
          <span>
            {terminal?.model} · pairing code {terminal?.id}. The Partner pairs it on arrival using
            that code.
          </span>
          <Select value={merchantId} onValueChange={setMerchantId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick a Partner" />
            </SelectTrigger>
            <SelectContent>
              {eligible.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name} · {b.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      }
      confirmLabel="Assign terminal"
      onConfirm={() => {
        if (!merchantId) return
        onAssign(merchantId)
        setMerchantId("")
      }}
    />
  )
}

function TerminalFleet() {
  const auth = useAuth()
  const store = useHqTerminals()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canEdit = auth.has("merchants.edit")

  // Tab and search live in the URL, the same way the Partner roster keeps
  // them. Not for deep-linking's own sake: a filtered fleet view is a thing
  // people send each other ("here is the faulty pile", "here is that serial"),
  // and /screens can only list a state it can address.
  const tabParam = searchParams.get("tab")
  const tab: FleetTab = isFleetTab(tabParam) ? tabParam : "all"
  const query = searchParams.get("q") ?? ""
  // `?partner=<slug>` pops the Partner over the fleet, matching how every other
  // listing here addresses its detail view.
  const openSlug = searchParams.get("partner")

  const updateParams = useCallback(
    (next: Partial<{ tab: string; q: string; partner: string }>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(next)) {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  // Partner edits made from the dialog are local, the way the roster keeps
  // them: adminBusinesses is a module-level mock, not a store.
  const [overrides, setOverrides] = useState<Record<string, Partial<AdminBusiness>>>({})

  const [assigning, setAssigning] = useState<HqTerminal | null>(null)
  const [blocking, setBlocking] = useState<HqTerminal | null>(null)
  const [signingOut, setSigningOut] = useState<HqTerminal | null>(null)
  const [returning, setReturning] = useState<HqTerminal | null>(null)
  const [faulty, setFaulty] = useState<HqTerminal | null>(null)

  const counts = useMemo(() => {
    const base: Record<FleetTab, number> = {
      all: store.terminals.length,
      "with-partners": 0,
      "in-stock": 0,
      returned: 0,
      faulty: 0,
    }
    for (const terminal of store.terminals) {
      for (const t of TABS) {
        if (t.id !== "all" && inTab(terminal, t.id)) base[t.id] += 1
      }
    }
    return base
  }, [store.terminals])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.terminals.filter((terminal) => inTab(terminal, tab) && matchesQuery(terminal, q))
  }, [store.terminals, tab, query])

  function handleAssign(merchantId: string) {
    if (!assigning) return
    const partner = adminBusinesses.find((b) => b.id === merchantId)
    store.assignTerminal(assigning.id, merchantId)
    toast.success(`${assigning.serial} assigned to ${partner?.name ?? "Partner"}`, {
      description: `Pairing code ${assigning.id}`,
    })
    setAssigning(null)
  }

  const openPartner = useMemo(() => {
    const found = openSlug ? adminBusinesses.find((b) => b.slug === openSlug) : undefined
    if (!found) return null
    return overrides[found.id] ? { ...found, ...overrides[found.id] } : found
  }, [openSlug, overrides])

  function handleRestock(terminal: HqTerminal) {
    store.restockTerminal(terminal.id)
    toast.success(`${terminal.serial} back in stock`)
  }

  function handleAllow(terminal: HqTerminal) {
    store.allowTerminal(terminal.id)
    toast.success(`${terminal.serial} can sign in again`)
  }

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Terminals</h1>
            <p className="text-sm text-muted-foreground">
              {counts.all} units · {counts["with-partners"]} out with Partners ·{" "}
              {counts["in-stock"]} in stock
            </p>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Tabs
          value={tab}
          onValueChange={(next) => updateParams({ tab: next === "all" ? "" : next })}
        >
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                {TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                    <span
                      className={cn(
                        "text-sm font-normal text-muted-foreground",
                        tab === t.id && "text-foreground/70",
                      )}
                    >
                      {counts[t.id]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            }
            actions={
              <SearchInput
                placeholder="Search serial or Partner"
                aria-label="Search terminals"
                // Keyed by the URL value so a link that arrives with ?q=
                // shows its own term rather than an empty box.
                key={query}
                defaultValue={query}
                onValueChange={(next) => updateParams({ q: next })}
              />
            }
          />

          {TABS.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              {visible.length === 0 ? (
                <EmptyState
                  variant="card"
                  icon={MonitorSmartphoneIcon}
                  title="No terminals match"
                  description="Try another tab, or clear the search."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Terminal</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last seen</TableHead>
                      <TableHead className="w-12 text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((terminal) => (
                      <TerminalRow
                        key={terminal.id}
                        terminal={terminal}
                        canEdit={canEdit}
                        onOpenPartner={(slug) => updateParams({ partner: slug })}
                        onAssign={setAssigning}
                        onBlock={setBlocking}
                        onAllow={handleAllow}
                        onSignOut={setSigningOut}
                        onReturn={setReturning}
                        onRestock={handleRestock}
                        onFaulty={setFaulty}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <BusinessDetailDialog
        business={openPartner}
        open={openPartner !== null}
        onOpenChange={(next) => {
          if (!next) updateParams({ partner: "" })
        }}
        onUpdate={(patch) => {
          if (!openPartner) return
          setOverrides((prev) => ({
            ...prev,
            [openPartner.id]: { ...prev[openPartner.id], ...patch },
          }))
        }}
        actor={`Cami HQ (${auth.user.name.split(" ")[0]})`}
        // The Terminals card is on this tab, so the dialog opens where the fleet
        // row's own subject lives.
        initialTab="settings"
        onSlugChange={(_oldSlug, newSlug) => updateParams({ partner: newSlug })}
      />

      <AssignToPartnerDialog
        terminal={assigning}
        onOpenChange={(next) => {
          if (!next) setAssigning(null)
        }}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={blocking !== null}
        onOpenChange={(next) => {
          if (!next) setBlocking(null)
        }}
        title={`Block ${blocking?.serial ?? "terminal"}?`}
        description="Staff cannot sign in on this device until it is allowed again, and its live sessions end now. The unit stays with the Partner, and their other terminals are unaffected."
        confirmLabel="Block terminal"
        destructive
        onConfirm={() => {
          if (!blocking) return
          store.blockTerminal(blocking.id, auth.user.name)
          toast.success(`${blocking.serial} blocked`)
          setBlocking(null)
        }}
      />

      <ConfirmDialog
        open={signingOut !== null}
        onOpenChange={(next) => {
          if (!next) setSigningOut(null)
        }}
        title={`Sign out ${signingOut?.serial ?? "terminal"}?`}
        description="Anyone working that counter will need to sign in again with the terminal PIN. The device stays paired and is not blocked."
        confirmLabel="Sign out"
        destructive
        onConfirm={() => {
          if (!signingOut) return
          const ended = store.signOutTerminal(signingOut.id)
          toast.success(ended === 1 ? "1 device signed out" : `${ended} devices signed out`)
          setSigningOut(null)
        }}
      />

      <ConfirmDialog
        open={returning !== null}
        onOpenChange={(next) => {
          if (!next) setReturning(null)
        }}
        title={`Return ${returning?.serial ?? "terminal"} to Cami?`}
        description="The unit comes off the Partner's list and goes back into stock, and its pairing is cleared so the next Partner never inherits a signed-in device."
        confirmLabel="Return to Cami"
        destructive
        onConfirm={() => {
          if (!returning) return
          store.returnTerminal(returning.id)
          toast.success(`${returning.serial} returned to Cami`)
          setReturning(null)
        }}
      />

      <ConfirmDialog
        open={faulty !== null}
        onOpenChange={(next) => {
          if (!next) setFaulty(null)
        }}
        title={`Mark ${faulty?.serial ?? "terminal"} faulty?`}
        description="The unit leaves the Partner it is with, stops being offered for assignment, and stays in the fleet as a record. Written-off hardware is a thing finance asks about later, so the row is kept rather than deleted."
        confirmLabel="Mark faulty"
        destructive
        onConfirm={() => {
          if (!faulty) return
          store.markFaulty(faulty.id)
          toast.success(`${faulty.serial} marked faulty`)
          setFaulty(null)
        }}
      />
    </AdminShell>
  )
}

export default function TerminalFleetPage() {
  return (
    <Suspense fallback={null}>
      <TerminalFleet />
    </Suspense>
  )
}
