"use client"

import { CirclePlusIcon, LinkIcon, MapPinIcon, UserRoundIcon, XIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  clientsOnNumber,
  type DirectoryClient,
  type InboxConversation,
  SALON_TIME_ZONE,
  searchDirectory,
} from "@/app/messages/inbox/phase-0/mock"
import { ClientDetailDialog } from "@/components/blocks/clients/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/clients/client-edit-sheet"
import { ClientSummary } from "@/components/blocks/clients/client-summary"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { formatPhone, type InboxCopy, type Lang } from "./copy"
import { ConversationAvatar, type PaneStatus, Phone } from "./shared"

// ─── Pane 3 — the client (IX-C6, IX-C3, IX-C4) ────────────────────────────────
// The pane is a tab host so IX-F7 (S1) can add Calendar without a rebuild. A
// matched chat renders the existing client profile inside this pane. An
// unmatched chat keeps Match and Add (P9), or the match search.

/** The pane's tabs. Phase 0 has one; IX-F7 (S1) adds "calendar". */
const PANE_TABS: readonly string[] = ["client"]

export type VisitsMode = "normal" | "slow" | "error"
export type PhoneChoice = "save" | "same" | "keep" | "replace"
export type NewClient = {
  firstName: string
  lastName: string
  pet: { name: string; species: AvatarSpecies } | null
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "gray" | "violet" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "gray"
          ? "bg-cami-gray-3 text-cami-gray-11"
          : "bg-cami-violet-3 text-cami-violet-11",
      )}
    >
      {children}
    </span>
  )
}

// ─── Match (IX-C3) ────────────────────────────────────────────────────────────

function ResultRow({
  client,
  hasPets,
  copy,
  onPick,
}: {
  client: DirectoryClient
  hasPets: boolean
  copy: InboxCopy
  onPick: () => void
}) {
  const name = [client.firstName, client.lastName].filter(Boolean).join(" ")
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-start transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
      >
        <Avatar size="md" fallback="character" name={name} hashSeed={client.publicId} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">{name}</span>
            {client.archived ? <Badge tone="gray">{copy.archived}</Badge> : null}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {client.phoneE164 ? <Phone e164={client.phoneE164} /> : (client.email ?? "—")}
            {hasPets && client.pets.length ? ` · ${client.pets.map((p) => p.name).join(", ")}` : ""}
          </span>
          {client.homeLocation ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-cami-violet-11">
              <MapPinIcon className="size-3" aria-hidden />
              {copy.atLocation(client.homeLocation)}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

function MatchSearch({
  conversation,
  directory,
  hasPets,
  copy,
  onPick,
  onAddInstead,
  onCancel,
}: {
  conversation: InboxConversation
  directory: DirectoryClient[]
  hasPets: boolean
  copy: InboxCopy
  onPick: (c: DirectoryClient) => void
  onAddInstead: (() => void) | null
  onCancel: () => void
}) {
  const [query, setQuery] = useState("")
  const current = conversation.customer?.publicId
  const results = useMemo(
    () => searchDirectory(directory, query).filter((c) => c.publicId !== current),
    [directory, query, current],
  )
  const onNumber = clientsOnNumber(directory, conversation.phoneE164).filter(
    (c) => c.publicId !== current,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <DialogTitle className="flex-1 text-base font-semibold text-foreground">
          {copy.matchTitle}
        </DialogTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label={copy.close}
          onClick={onCancel}
        >
          <XIcon className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="p-3">
        <SearchInput
          size="default"
          containerClassName="w-full"
          className="h-9 w-full"
          autoFocus
          placeholder={copy.matchPlaceholder}
          onValueChange={setQuery}
        />
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!query.trim() ? (
          onNumber.length > 1 ? (
            // IX-C3 edge case: the same number on two records — show both, I pick.
            <div className="flex flex-col gap-1">
              <p className="px-2 pb-1 text-xs text-muted-foreground">
                {copy.onThisNumber(onNumber.length)}
              </p>
              <ul>
                {onNumber.map((c) => (
                  <ResultRow
                    key={c.publicId}
                    client={c}
                    hasPets={hasPets}
                    copy={copy}
                    onPick={() => onPick(c)}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <p className="px-2 text-sm text-muted-foreground">{copy.matchHint}</p>
          )
        ) : results.length === 0 ? (
          <div className="flex flex-col items-start gap-2 px-2">
            <p className="text-sm text-muted-foreground">{copy.noMatches}</p>
            {onAddInstead ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                radius="full"
                className="gap-1.5"
                onClick={onAddInstead}
              >
                <CirclePlusIcon className="size-3.5" aria-hidden />
                {copy.addInstead}
              </Button>
            ) : null}
          </div>
        ) : (
          <ul>
            {results.map((c) => (
              <ResultRow
                key={c.publicId}
                client={c}
                hasPets={hasPets}
                copy={copy}
                onPick={() => onPick(c)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** The pick, and what happens to the number (IX-C3 row 2). The rule for a
 *  different number is Michelle's open decision; this is the proposal:
 *  empty → save, same → nothing, different → Keep (default) or Replace. */
function MatchConfirm({
  conversation,
  client,
  hasPets,
  copy,
  onCancel,
  onConfirm,
}: {
  conversation: InboxConversation
  client: DirectoryClient
  hasPets: boolean
  copy: InboxCopy
  onCancel: () => void
  onConfirm: (choice: PhoneChoice) => void
}) {
  const name = [client.firstName, client.lastName].filter(Boolean).join(" ")
  const phoneCase: PhoneChoice =
    client.phoneE164 === null
      ? "save"
      : client.phoneE164 === conversation.phoneE164
        ? "same"
        : "keep"
  // Keep is the default (IX-C3): a family or second phone must not overwrite
  // the number on record unless reception asks for it.
  const [update, setUpdate] = useState(false)

  // Same shell as the search step and Add: a title bar, the body, the actions.
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <DialogTitle className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
          {copy.matchTo(name)}
        </DialogTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label={copy.close}
          onClick={onCancel}
        >
          <XIcon className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* The client picked, as the search row showed them. */}
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Avatar size="md" fallback="character" name={name} hashSeed={client.publicId} />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{name}</span>
              {client.archived ? <Badge tone="gray">{copy.archived}</Badge> : null}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {client.phoneE164 ? <Phone e164={client.phoneE164} /> : (client.email ?? "—")}
              {hasPets && client.pets.length
                ? ` · ${client.pets.map((p) => p.name).join(", ")}`
                : ""}
            </span>
          </span>
        </div>

        {/* What happens to this chat's number (IX-C3 row 2). */}
        {phoneCase === "save" ? (
          <p className="text-sm text-foreground">
            <Phone e164={conversation.phoneE164} className="font-medium" />{" "}
            <span className="text-muted-foreground">{copy.phoneWillSave}</span>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">{copy.onRecord}</dt>
              <dd
                className={cn(
                  "font-medium text-foreground",
                  update && "text-muted-foreground line-through",
                )}
              >
                <Phone e164={client.phoneE164!} />
              </dd>
              <dt className="text-muted-foreground">{copy.thisChat}</dt>
              <dd className="font-medium text-foreground">
                <Phone e164={conversation.phoneE164} />
              </dd>
            </dl>
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox checked={update} onCheckedChange={(v) => setUpdate(v === true)} />
              {copy.updateNumber}
            </Label>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" radius="full" onClick={onCancel}>
            {copy.cancel}
          </Button>
          <Button
            type="button"
            radius="full"
            className="gap-1.5"
            onClick={() =>
              onConfirm(phoneCase === "keep" ? (update ? "replace" : "keep") : phoneCase)
            }
          >
            <LinkIcon className="size-4" aria-hidden />
            {phoneCase === "keep" && update ? copy.matchAndUpdate : copy.confirmMatch}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Add client ───────────────────────────────────────────────────────────────
// The inbox opens the existing client form on Profile. The number is already
// known, so the phone is filled. A name is not guessed from the message.

function threadPhone(e164: string): { phoneCode: string; phone: string } {
  if (e164.startsWith("+971") && e164.length === 13) {
    return {
      phoneCode: "+971",
      phone: `${e164.slice(4, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`,
    }
  }
  return { phoneCode: "+971", phone: e164 }
}

/** IX-C4: a short dialog over the chat. First name is all that is required and
 *  the phone is the chat's. Nothing is prefilled: reception types the name. */
function AddClientDialog({
  open,
  onOpenChange,
  conversation,
  directory,
  copy,
  lang,
  onCreate,
  onMatchInstead,
  onFullForm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: InboxConversation
  directory: DirectoryClient[]
  copy: InboxCopy
  lang: Lang
  onCreate: (client: NewClient) => void
  onMatchInstead: () => void
  onFullForm: () => void
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  // Reopening starts clean.
  useEffect(() => {
    if (open) {
      setFirstName("")
      setLastName("")
    }
  }, [open])
  const existing = clientsOnNumber(directory, conversation.phoneE164)
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="gap-0 p-0 sm:max-w-md"
        aria-describedby={undefined}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <DialogTitle className="flex-1 text-base font-semibold text-foreground">
            {copy.addTitle}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label={copy.close}
            onClick={close}
          >
            <XIcon className="size-4" aria-hidden />
          </Button>
        </div>

        {existing.length > 0 ? (
          // Row 5: never a second client on one number from here.
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm font-medium text-foreground">
              {copy.alreadyClientTitle(existing.length)}
            </p>
            <p className="text-sm text-muted-foreground">{copy.alreadyClientBody}</p>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" radius="full" onClick={close}>
                {copy.cancel}
              </Button>
              <Button
                type="button"
                radius="full"
                className="gap-1.5"
                onClick={() => {
                  close()
                  onMatchInstead()
                }}
              >
                <LinkIcon className="size-4" aria-hidden />
                {copy.match}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!firstName.trim()) return
              onCreate({ firstName: firstName.trim(), lastName: lastName.trim(), pet: null })
              close()
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-first">
                  {copy.firstName} <span aria-hidden>*</span>
                </Label>
                <Input
                  id="add-first"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-last">{copy.lastName}</Label>
                <Input
                  id="add-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{copy.phone}</Label>
              {/* The chat's number, read only: this client is for this chat. */}
              <div className="flex h-12 items-center rounded-xl bg-muted/60 px-3 text-sm text-foreground">
                <Phone e164={conversation.phoneE164} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                close()
                onFullForm()
              }}
              className="self-start text-sm text-foreground underline underline-offset-2 hover:text-foreground/80"
            >
              {copy.fullForm}
            </button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" radius="full" onClick={close}>
                {copy.cancel}
              </Button>
              <Button type="submit" radius="full" disabled={!firstName.trim()}>
                {copy.saveClient}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Unmatched ────────────────────────────────────────────────────────────────

/** IX-C6 edge case: an unmatched chat's pane offers Match and Add, nothing else (P9). */
function UnmatchedPane({
  conversation,
  copy,
  onMatch,
  onAdd,
}: {
  conversation: InboxConversation
  copy: InboxCopy
  onMatch: () => void
  onAdd: () => void
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <UnmatchedBand conversation={conversation} copy={copy} />
      <div className="flex flex-col gap-4 border-t border-border/60 p-4">
        <div className="flex w-full flex-col gap-2">
          <Button radius="full" className="w-full gap-1.5" onClick={onMatch}>
            <LinkIcon className="size-4" aria-hidden />
            {copy.match}
          </Button>
          <Button variant="outline" radius="full" className="w-full gap-1.5" onClick={onAdd}>
            <CirclePlusIcon className="size-4" aria-hidden />
            {copy.add}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** The linked card's identity band, for a number with no client yet: the
 *  dashed avatar where the face goes, the number where the name goes. */
function UnmatchedBand({
  conversation,
  copy,
}: {
  conversation: InboxConversation
  copy: InboxCopy
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <ConversationAvatar conversation={conversation} size="lg" unmatchedLabel={copy.unmatched} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-lg font-semibold leading-tight text-foreground">
          <Phone e164={conversation.phoneE164} />
        </span>
      </div>
    </div>
  )
}

/** No chat open, or the chat's read failed: say what the pane is for, rather
 *  than leave a blank card that reads as broken. */
function PanePlaceholder({ copy }: { copy: InboxCopy }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <UserRoundIcon className="size-8 stroke-[1.25] text-muted-foreground/40" aria-hidden />
      <p className="text-balance text-sm text-muted-foreground/80">{copy.paneEmpty}</p>
    </div>
  )
}

function PaneSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-8 w-full rounded-xl" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-44" />
    </div>
  )
}

// ─── The pane ─────────────────────────────────────────────────────────────────

export type PaneMode = "summary" | "match"

export function ClientPane({
  status,
  conversation,
  directory,
  mode,
  onModeChange,
  hasPets,
  visitsMode,
  canEdit,
  now,
  copy,
  lang,
  onMatch,
  onCreate,
  addOpen,
  onClose,
  hidden = false,
  className,
  onAddOpenChange: setAddOpen,
}: {
  /** Overlay sizing below 1280, where the pane is a sheet over the chat. */
  className?: string
  /** The add form. Held by the screen, since the thread header opens it too. */
  addOpen: boolean
  /** Hides the pane, like the toggle in the thread header. */
  onClose: () => void
  /** Hidden, but still mounted so its Match and Add dialogs open from the thread header. */
  hidden?: boolean
  onAddOpenChange: (open: boolean) => void
  status: PaneStatus
  conversation: InboxConversation | null
  directory: DirectoryClient[]
  mode: PaneMode
  onModeChange: (mode: PaneMode) => void
  hasPets: boolean
  visitsMode: VisitsMode
  /** inbox:reply. Matching and adding change the record, so read-only hides them. */
  canEdit: boolean
  now: number
  copy: InboxCopy
  lang: Lang
  onMatch: (client: DirectoryClient, choice: PhoneChoice) => void
  onCreate: (client: NewClient) => void
}) {
  const [picked, setPicked] = useState<DirectoryClient | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [fullFormOpen, setFullFormOpen] = useState(false)
  const addInitial = useMemo(
    () => ({ firstName: "", ...threadPhone(conversation?.phoneE164 ?? "") }),
    [conversation?.phoneE164],
  )
  const chatId = conversation?.publicId

  // A different chat, or leaving the search, forgets the half-made pick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on chat change
  useEffect(() => {
    setPicked(null)
    setProfileOpen(false)
  }, [chatId])
  useEffect(() => {
    if (mode === "summary") setPicked(null)
  }, [mode])

  const directoryClient = conversation?.customer
    ? directory.find((c) => c.publicId === conversation.customer?.publicId)
    : undefined

  // Match is a modal over the inbox, not a mode of the pane: it works with the
  // pane hidden and has room for search results.
  const matchDialog =
    conversation && status === "ready" ? (
      <Dialog open={mode === "match"} onOpenChange={(open) => !open && onModeChange("summary")}>
        <DialogContent
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={cn("gap-0 p-0 sm:max-w-md", !picked && "h-[min(560px,80vh)]")}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Straight into the search field, not the close button.
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).querySelector("input")?.focus()
          }}
        >
          {picked ? (
            <MatchConfirm
              conversation={conversation}
              client={picked}
              hasPets={hasPets}
              copy={copy}
              onCancel={() => onModeChange("summary")}
              onConfirm={(choice) => {
                onMatch(picked, choice)
                onModeChange("summary")
              }}
            />
          ) : (
            <MatchSearch
              conversation={conversation}
              directory={directory}
              hasPets={hasPets}
              copy={copy}
              onPick={(c) => {
                // The number is already on their record: nothing to decide, so
                // picking them is the match.
                if (c.phoneE164 === conversation.phoneE164) {
                  onMatch(c, "same")
                  onModeChange("summary")
                } else setPicked(c)
              }}
              onAddInstead={
                conversation.customer
                  ? null
                  : () => {
                      onModeChange("summary")
                      setAddOpen(true)
                    }
              }
              onCancel={() => onModeChange("summary")}
            />
          )}
        </DialogContent>
      </Dialog>
    ) : null

  let body: React.ReactNode = null
  if (status === "loading") body = <PaneSkeleton />
  else if (status === "ready" && conversation) {
    if (conversation.customer) {
      const customer = conversation.customer
      body = (
        <div key={customer.publicId} className="flex min-h-full shrink-0 grow flex-col">
          <ClientSummary
            className="bg-transparent"
            initial={{
              customerId: customer.publicId,
              name: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
              phone: formatPhone(conversation.phoneE164),
              pets: customer.pets,
              lastService: customer.lastService,
              archived: directoryClient?.archived ?? false,
              homeLocation: directoryClient?.homeLocation ?? null,
            }}
            hasPets={hasPets}
            now={now}
            lang={lang}
            timeZone={SALON_TIME_ZONE}
            simulate={visitsMode === "normal" ? undefined : visitsMode}
            onViewProfile={() => setProfileOpen(true)}
          />
          {profileOpen ? (
            <ClientDetailDialog
              open
              onOpenChange={(next) => {
                if (!next) setProfileOpen(false)
              }}
              hasPets={hasPets}
              client={{
                id: customer.publicId,
                name: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
                phone: formatPhone(conversation.phoneE164),
                email: directoryClient?.email ?? undefined,
                pets: customer.pets.map((pet) => ({
                  id: pet.name,
                  name: pet.name,
                  species: pet.species,
                })),
              }}
            />
          ) : null}
        </div>
      )
    } else if (!canEdit) {
      body = (
        <div className="flex min-h-full flex-1 flex-col">
          <UnmatchedBand conversation={conversation} copy={copy} />
        </div>
      )
    } else {
      body = (
        <UnmatchedPane
          conversation={conversation}
          copy={copy}
          onMatch={() => onModeChange("match")}
          onAdd={() => setAddOpen(true)}
        />
      )
    }
  }

  return (
    <aside
      data-inbox-profile
      className={cn(
        // 26rem with room to spare; gives way only after the thread is at its
        // minimum, and never below 20rem (T1-D1).
        "flex w-[26rem] min-w-80 shrink flex-col overflow-hidden rounded-2xl border border-border shadow-sm",
        "bg-card",
        hidden && "hidden",
        className,
      )}
    >
      {/* Same shell as the thread and list headers, so the bottom borders line up. */}
      <header className="flex min-w-0 items-center gap-2 border-b border-border bg-card px-4 py-3">
        <h2 className="flex min-h-9 min-w-0 flex-1 items-center truncate text-base font-semibold text-foreground">
          {copy.clientTab}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.hideClientPane}
          className="shrink-0 rounded-full text-foreground"
          onClick={onClose}
        >
          <XIcon aria-hidden className="size-5" />
        </Button>
      </header>
      <Tabs
        defaultValue="client"
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        {/* A tab bar with one tab is noise, so it shows from the second tab on
            (IX-F7's Calendar, S1). The host is already tabs, so that is an entry
            in PANE_TABS, not a rebuild. */}
        {PANE_TABS.length > 1 ? (
          <div className="border-b border-border px-4">
            <TabsList variant="underline">
              {PANE_TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t === "client" ? copy.clientTab : t}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        ) : null}
        <TabsContent
          value="client"
          className={cn(
            "no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto",
            // The grey lives on the scroll area, so it runs to the bottom
            // however tall the content is.
            status === "ready" && conversation && "bg-muted/40",
          )}
        >
          {body ?? <PanePlaceholder copy={copy} />}
        </TabsContent>
      </Tabs>
      {matchDialog}
      {conversation && !conversation.customer ? (
        <AddClientDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          conversation={conversation}
          directory={directory}
          copy={copy}
          lang={lang}
          onCreate={onCreate}
          onMatchInstead={() => onModeChange("match")}
          onFullForm={() => setFullFormOpen(true)}
        />
      ) : null}
      {/* The IX-C4 full-intake edge case: the existing client form, same outcome on save. */}
      {conversation && !conversation.customer ? (
        <ClientEditSheet
          open={fullFormOpen}
          onOpenChange={setFullFormOpen}
          mode="add"
          initialSection="profile"
          hasPets={hasPets}
          initial={addInitial}
          onSave={(v) => {
            onCreate({
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              pet: null,
            })
          }}
        />
      ) : null}
    </aside>
  )
}
