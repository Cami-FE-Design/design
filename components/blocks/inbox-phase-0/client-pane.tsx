"use client"

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CirclePlusIcon,
  HourglassIcon,
  LinkIcon,
  MapPinIcon,
  MessageCircleReplyIcon,
  ScissorsIcon,
  SparklesIcon,
  UserRoundIcon,
  UserRoundSearchIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { formatAed } from "@/app/appointments/mock"
import {
  CLIENT_HISTORY,
  type ClientNote,
  clientsOnNumber,
  type DirectoryClient,
  type InboxConversation,
  searchDirectory,
  type Visit,
} from "@/app/messages/inbox/phase-0/mock"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { dayLabel, formatPhone, type InboxCopy, type Lang, whenLabel } from "./copy"
import { ConversationAvatar, customerName, guessName, type PaneStatus, Phone } from "./shared"

// ─── Pane 3 — the client (IX-C6, IX-C3, IX-C4; FND-4 `ClientSummary`) ─────────
// The pane is a tab host so IX-F7 (S1) can add Calendar without a rebuild. Its
// body is one of: `ClientSummary` for a matched chat (the customer module will
// own it — the inbox never builds its own client view, P13); for an unmatched
// chat, Match and Add and nothing else (P9); or the match search.

/** The pane's tabs. Phase 0 has one; IX-F7 (S1) adds "calendar". */
const PANE_TABS: readonly string[] = ["client"]

/** p95 budget for the visits read on staging (contract.md, latency). */
const VISITS_LATENCY_MS = 450
const VISITS_SLOW_MS = 3000

export type VisitsMode = "normal" | "slow" | "error"
export type PhoneChoice = "save" | "same" | "keep" | "replace"
export type NewClient = {
  firstName: string
  lastName: string
  pet: { name: string; species: AvatarSpecies } | null
}
/** `repliedAt`: the client has written since — the name may now be in the chat. */
export type Waiting = { askedAt: string; sent: boolean; repliedAt?: string }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-medium text-muted-foreground">{children}</h3>
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

// ─── ClientSummary ────────────────────────────────────────────────────────────

/** The second read. Name, pet and last service came with the thread read and
 *  are already painted; this only fills visits and notes in. */
function useClientHistory(customerId: string, mode: VisitsMode) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; visits: Visit[]; notes: ClientNote[] }
  >({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setState({ status: "loading" })
    const id = window.setTimeout(
      () => {
        if (mode === "error" && attempt === 0) return setState({ status: "error" })
        const h = CLIENT_HISTORY[customerId] ?? { visits: [], notes: [] }
        setState({ status: "ready", visits: h.visits.slice(0, 3), notes: h.notes })
      },
      mode === "slow" ? VISITS_SLOW_MS : VISITS_LATENCY_MS,
    )
    return () => window.clearTimeout(id)
  }, [customerId, mode, attempt])

  return { state, retry: () => setAttempt((a) => a + 1) }
}

function VisitRows({ visits, now, lang }: { visits: Visit[]; now: number; lang: Lang }) {
  return (
    <ul className="flex flex-col divide-y divide-border/60 rounded-xl ring-1 ring-border/60">
      {visits.map((v) => (
        <li key={v.publicId} className="flex items-start justify-between gap-3 px-3 py-2.5">
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{v.service}</span>
            <span className="text-xs text-muted-foreground">
              {v.staffName} · {dayLabel(v.at, now, lang)}
            </span>
          </span>
          <span className="shrink-0 text-sm tabular-nums text-foreground">
            {formatAed(v.amountMinor)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function ClientSummary({
  conversation,
  directoryClient,
  hasPets,
  now,
  visitsMode,
  copy,
  lang,
  onChangeMatch,
}: {
  conversation: InboxConversation
  directoryClient: DirectoryClient | undefined
  hasPets: boolean
  now: number
  visitsMode: VisitsMode
  copy: InboxCopy
  lang: Lang
  onChangeMatch: (() => void) | null
}) {
  const customer = conversation.customer!
  const { state, retry } = useClientHistory(customer.publicId, visitsMode)
  const isNew =
    state.status === "ready" &&
    state.visits.length === 0 &&
    state.notes.length === 0 &&
    !customer.lastService

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Painted with the messages — no spinner where the name should be. */}
      <div className="flex items-center gap-3">
        <ConversationAvatar conversation={conversation} size="lg" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-lg font-semibold text-foreground">
            {customerName(conversation)}
          </span>
          <Phone e164={conversation.phoneE164} className="text-sm text-muted-foreground" />
          {directoryClient?.archived || directoryClient?.homeLocation ? (
            <span className="flex flex-wrap gap-1 pt-0.5">
              {directoryClient.archived ? <Badge tone="gray">{copy.archived}</Badge> : null}
              {directoryClient.homeLocation ? (
                <Badge tone="violet">
                  <MapPinIcon className="size-3" aria-hidden />
                  {copy.atLocation(directoryClient.homeLocation)}
                </Badge>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      {hasPets && customer.pets.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionTitle>{copy.pets}</SectionTitle>
          <ul className="flex flex-col gap-2">
            {customer.pets.map((pet) => (
              <li key={pet.name} className="flex items-center gap-2.5">
                <Avatar size="sm" fallback="species" species={pet.species} shape="square" />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">{pet.name}</span>
                  <span className="text-xs text-muted-foreground">{pet.breed}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isNew ? (
        // IX-C6 row 5: a clean empty panel — not a broken one, not a spinner.
        <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/40 px-4 py-6 text-center">
          <SparklesIcon className="size-6 stroke-[1.5] text-muted-foreground/70" aria-hidden />
          <p className="text-sm font-medium text-foreground">{copy.newClientTitle}</p>
          <p className="text-balance text-xs text-muted-foreground">{copy.newClientBody}</p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-1.5">
            <SectionTitle>{copy.lastService}</SectionTitle>
            {customer.lastService ? (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <ScissorsIcon className="size-4 text-muted-foreground" aria-hidden />
                <span className="font-medium">{customer.lastService.name}</span>
                <span className="text-muted-foreground">
                  · {dayLabel(customer.lastService.at, now, lang)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.noLastService}</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>{copy.lastVisits}</SectionTitle>
            {state.status === "loading" ? (
              <div className="flex flex-col gap-2" aria-hidden>
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : state.status === "error" ? (
              // The partial state: the name and pet stay; only this read failed.
              <div className="flex items-center justify-between gap-3 rounded-xl bg-tomato-2 p-3 text-sm">
                <span className="flex items-center gap-2 text-tomato-11">
                  <AlertTriangleIcon className="size-4" aria-hidden />
                  {copy.visitsError}
                </span>
                <Button type="button" variant="outline" size="sm" radius="full" onClick={retry}>
                  {copy.retry}
                </Button>
              </div>
            ) : state.visits.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.noLastService}</p>
            ) : (
              <VisitRows visits={state.visits} now={now} lang={lang} />
            )}
          </section>

          {state.status === "ready" ? (
            <section className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <SectionTitle>{copy.notes}</SectionTitle>
                <p className="text-[11px] text-muted-foreground/80">{copy.teamOnly}</p>
              </div>
              {state.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{copy.noNotes}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {state.notes.map((n) => (
                    <li key={n.publicId} className="rounded-xl bg-cami-yellow-2 p-3 text-sm">
                      <p className="text-foreground" dir="auto">
                        {n.body}
                      </p>
                      <p className="pt-1 text-[11px] text-muted-foreground">
                        {n.authorName} · {dayLabel(n.at, now, lang)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      )}

      {onChangeMatch ? (
        <button
          type="button"
          onClick={onChangeMatch}
          className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {copy.changeMatch}
        </button>
      ) : null}
    </div>
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
        <Avatar size="md" name={name} hashSeed={client.publicId} />
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
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label={copy.back}
          onClick={onCancel}
        >
          <ArrowLeftIcon className="size-4 rtl:-scale-x-100" aria-hidden />
        </Button>
        <h3 className="text-sm font-semibold text-foreground">{copy.matchTitle}</h3>
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
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
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
  copy,
  lang,
  onBack,
  onConfirm,
}: {
  conversation: InboxConversation
  client: DirectoryClient
  copy: InboxCopy
  lang: Lang
  onBack: () => void
  onConfirm: (choice: PhoneChoice) => void
}) {
  const name = [client.firstName, client.lastName].filter(Boolean).join(" ")
  const phoneCase: PhoneChoice =
    client.phoneE164 === null
      ? "save"
      : client.phoneE164 === conversation.phoneE164
        ? "same"
        : "keep"
  const [choice, setChoice] = useState<"keep" | "replace">("keep")

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label={copy.back}
          onClick={onBack}
        >
          <ArrowLeftIcon className="size-4 rtl:-scale-x-100" aria-hidden />
        </Button>
        <Avatar size="lg" name={name} hashSeed={client.publicId} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-base font-semibold text-foreground">
            {name}
          </span>
          {client.archived ? (
            <span>
              <Badge tone="gray">{copy.archived}</Badge>
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">{copy.confirmMatchTitle(name)}</p>
      <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3 text-sm">
        {phoneCase === "save" ? (
          <p>
            {copy.phoneWillSave} <Phone e164={conversation.phoneE164} className="font-medium" />
          </p>
        ) : phoneCase === "same" ? (
          <p>{copy.phoneAlreadyOn}</p>
        ) : (
          <>
            <p>
              {copy.phoneDifferent} <Phone e164={client.phoneE164!} className="font-medium" />
            </p>
            <RadioGroup
              dir={lang === "ar" ? "rtl" : "ltr"}
              value={choice}
              onValueChange={(v) => setChoice(v as "keep" | "replace")}
              className="gap-2 pt-1"
            >
              <Label className="flex items-center gap-2 font-normal">
                <RadioGroupItem value="keep" />
                {copy.keepExisting}
              </Label>
              <Label className="flex items-center gap-2 font-normal">
                <RadioGroupItem value="replace" />
                <span>
                  {copy.replacePhone} (<Phone e164={conversation.phoneE164} />)
                </span>
              </Label>
            </RadioGroup>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{copy.historyStays}</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" radius="full" onClick={onBack}>
          {copy.back}
        </Button>
        <Button
          type="button"
          radius="full"
          className="gap-1.5"
          onClick={() => onConfirm(phoneCase === "keep" ? choice : phoneCase)}
        >
          <LinkIcon className="size-4" aria-hidden />
          {copy.confirmMatch}
        </Button>
      </div>
    </div>
  )
}

// ─── Add client (IX-C4) ───────────────────────────────────────────────────────

function AddClientDialog({
  open,
  onOpenChange,
  conversation,
  directory,
  hasPets,
  windowOpen,
  waiting,
  now,
  copy,
  lang,
  onSave,
  onAskName,
  onMatchInstead,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: InboxConversation
  directory: DirectoryClient[]
  hasPets: boolean
  windowOpen: boolean
  waiting: Waiting | null
  now: number
  copy: InboxCopy
  lang: Lang
  onSave: (c: NewClient) => void
  onAskName: () => void
  onMatchInstead: () => void
}) {
  const guess = useMemo(() => guessName(conversation.messages), [conversation.messages])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isGuess, setIsGuess] = useState(false)
  const [petName, setPetName] = useState("")
  const [species, setSpecies] = useState<AvatarSpecies>("dog")
  const [fullOpen, setFullOpen] = useState(false)
  const existing = clientsOnNumber(directory, conversation.phoneE164)

  // A name in the message fills in, marked as a guess (IX-C4 row 3).
  useEffect(() => {
    if (!open) return
    setFirstName(guess ?? "")
    setIsGuess(!!guess)
    setLastName("")
    setPetName("")
  }, [open, guess])

  function save() {
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pet: hasPets && petName.trim() ? { name: petName.trim(), species } : null,
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"} className="gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.addTitle}</DialogTitle>
            <DialogDescription>{copy.addBody}</DialogDescription>
          </DialogHeader>

          {existing.length > 0 ? (
            // IX-C4 row 5: never a second client on one number from here.
            <div className="flex flex-col gap-3 rounded-xl bg-cami-yellow-2 p-3 text-sm">
              <p className="font-medium text-foreground">
                {copy.alreadyClientTitle(existing.length)}
              </p>
              <p className="text-muted-foreground">{copy.alreadyClientBody}</p>
              <Button
                type="button"
                radius="full"
                className="gap-1.5 self-start"
                onClick={onMatchInstead}
              >
                <LinkIcon className="size-4" aria-hidden />
                {copy.matchInstead}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-phone">{copy.phone}</Label>
                <Input
                  id="add-phone"
                  value={formatPhone(conversation.phoneE164)}
                  readOnly
                  dir="ltr"
                  // Digits stay LTR; the box still aligns to the form's start.
                  className={cn("h-10 bg-muted/40", lang === "ar" && "text-right")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-first">{copy.firstName}</Label>
                <Input
                  id="add-first"
                  value={firstName}
                  autoFocus
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    setIsGuess(false)
                  }}
                  className={cn("h-10", isGuess && "border-cami-violet-7 bg-cami-violet-2")}
                />
                {isGuess ? (
                  <span className="flex items-center gap-1 text-xs text-cami-violet-11">
                    <SparklesIcon className="size-3" aria-hidden />
                    {copy.guessed}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-last">
                  {copy.lastName}{" "}
                  <span className="font-normal text-muted-foreground">({copy.optional})</span>
                </Label>
                <Input
                  id="add-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10"
                />
              </div>
              {hasPets ? (
                // IX-C4 edge case: with pets, the form offers a first pet; without, it does not.
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-pet">
                    {copy.firstPet}{" "}
                    <span className="font-normal text-muted-foreground">({copy.optional})</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="add-pet"
                      value={petName}
                      placeholder={copy.petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="h-10 flex-1"
                    />
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      value={species}
                      onValueChange={(v) => setSpecies(v as AvatarSpecies)}
                    >
                      <SelectTrigger className="h-10 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["dog", "cat", "rabbit", "bird", "other"] as const).map((s) => (
                          <SelectItem key={s} value={s}>
                            {copy.species[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              {!firstName.trim() ? (
                // IX-C4 row 4: no name and I do not know it — ask once, never invent one.
                // Once asked, the button is gone: one question, not one per click.
                waiting && !waiting.repliedAt ? (
                  <div className="flex items-start gap-2 rounded-xl bg-cami-violet-2 p-3 text-sm">
                    <HourglassIcon
                      className="mt-0.5 size-4 shrink-0 text-cami-violet-11"
                      aria-hidden
                    />
                    <p className="text-muted-foreground">
                      {copy.alreadyAsked(whenLabel(waiting.askedAt, now, lang))}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3 text-sm">
                    <p className="text-muted-foreground">
                      {windowOpen ? copy.askNameBody : copy.waitingClosedBody}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      radius="full"
                      className="self-start"
                      onClick={onAskName}
                    >
                      {copy.askName}
                    </Button>
                  </div>
                )
              ) : null}

              <button
                type="button"
                onClick={() => setFullOpen(true)}
                className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {copy.fullForm}
              </button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              {copy.cancel}
            </Button>
            {existing.length === 0 ? (
              <Button type="button" radius="full" disabled={!firstName.trim()} onClick={save}>
                {copy.saveClient}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IX-C4 edge case: full intake from the same entry — the existing client
          form, not a copy. Same outcome on save. */}
      <ClientEditSheet
        open={fullOpen}
        onOpenChange={setFullOpen}
        mode="add"
        hasPets={hasPets}
        initial={{
          firstName,
          lastName,
          phoneCode: "+971",
          phone: conversation.phoneE164.replace(/^\+971/, ""),
        }}
        onSave={(v) => {
          setFullOpen(false)
          onSave({ firstName: v.firstName, lastName: v.lastName, pet: null })
        }}
      />
    </>
  )
}

// ─── Unmatched ────────────────────────────────────────────────────────────────

/** IX-C6 edge case: an unmatched chat's pane offers Match and Add, nothing else (P9). */
function UnmatchedPane({
  conversation,
  waiting,
  windowOpen,
  now,
  copy,
  lang,
  onMatch,
  onAdd,
  onSendAskTemplate,
  onStopWaiting,
}: {
  conversation: InboxConversation
  waiting: Waiting | null
  windowOpen: boolean
  now: number
  copy: InboxCopy
  lang: Lang
  onMatch: () => void
  onAdd: () => void
  onSendAskTemplate: () => void
  onStopWaiting: () => void
}) {
  const repliedName = waiting?.repliedAt ? guessName(conversation.messages) : null
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-cami-yellow-3 text-cami-yellow-11">
        <UserRoundSearchIcon className="size-6 stroke-[1.5]" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{copy.notMatchedTitle}</p>
        <Phone e164={conversation.phoneE164} className="text-sm text-muted-foreground" />
        <p className="mt-1 text-balance text-sm text-muted-foreground">{copy.notMatchedBody}</p>
      </div>
      {waiting?.repliedAt ? (
        // The reply is in. Say so, and offer the form with the name it gave —
        // still a guess the form marks as one.
        <div className="flex w-full flex-col gap-2 rounded-xl bg-cami-sage-2 p-3 text-start text-sm">
          <p className="flex items-center gap-1.5 font-medium text-cami-sage-11">
            <MessageCircleReplyIcon className="size-4" aria-hidden />
            {copy.repliedTitle}
          </p>
          <p className="text-muted-foreground">
            {repliedName ? copy.repliedWithName(repliedName) : copy.repliedNoName}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" radius="full" className="gap-1.5" onClick={onAdd}>
              <CirclePlusIcon className="size-3.5" aria-hidden />
              {repliedName ? copy.addNamed(repliedName) : copy.add}
            </Button>
            <Button type="button" variant="ghost" size="sm" radius="full" onClick={onStopWaiting}>
              {copy.stopWaiting}
            </Button>
          </div>
        </div>
      ) : waiting ? (
        // IX-C4 row 4 / P10: the form waits. With the window closed nothing
        // was sent; the question can go as a template (verified under IX-A4).
        <div className="flex w-full flex-col gap-2 rounded-xl bg-cami-violet-2 p-3 text-start text-sm">
          <p className="flex items-center gap-1.5 font-medium text-cami-violet-11">
            <HourglassIcon className="size-4" aria-hidden />
            {copy.waitingTitle}
          </p>
          <p className="text-muted-foreground">
            {waiting.sent
              ? copy.waitingBody(whenLabel(waiting.askedAt, now, lang))
              : copy.waitingClosedBody}
          </p>
          <div className="flex flex-wrap gap-2">
            {!waiting.sent && !windowOpen ? (
              <Button type="button" size="sm" radius="full" onClick={onSendAskTemplate}>
                {copy.sendAsTemplate}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" radius="full" onClick={onStopWaiting}>
              {copy.stopWaiting}
            </Button>
          </div>
        </div>
      ) : null}
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
  waiting,
  windowOpen,
  hasPets,
  visitsMode,
  canEdit,
  now,
  copy,
  lang,
  onMatch,
  onCreate,
  onAskName,
  onSendAskTemplate,
  onStopWaiting,
}: {
  status: PaneStatus
  conversation: InboxConversation | null
  directory: DirectoryClient[]
  mode: PaneMode
  onModeChange: (mode: PaneMode) => void
  waiting: Waiting | null
  windowOpen: boolean
  hasPets: boolean
  visitsMode: VisitsMode
  /** inbox:reply. Matching and adding change the record, so read-only hides them. */
  canEdit: boolean
  now: number
  copy: InboxCopy
  lang: Lang
  onMatch: (client: DirectoryClient, choice: PhoneChoice) => void
  onCreate: (client: NewClient) => void
  onAskName: () => void
  onSendAskTemplate: () => void
  onStopWaiting: () => void
}) {
  const [picked, setPicked] = useState<DirectoryClient | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const chatId = conversation?.publicId

  // A different chat, or leaving the search, forgets the half-made pick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on chat change
  useEffect(() => {
    setPicked(null)
    setAddOpen(false)
  }, [chatId])
  useEffect(() => {
    if (mode === "summary") setPicked(null)
  }, [mode])

  const directoryClient = conversation?.customer
    ? directory.find((c) => c.publicId === conversation.customer?.publicId)
    : undefined

  let body: React.ReactNode = null
  if (status === "loading") body = <PaneSkeleton />
  else if (status === "ready" && conversation) {
    if (mode === "match" && picked) {
      body = (
        <MatchConfirm
          conversation={conversation}
          client={picked}
          copy={copy}
          lang={lang}
          onBack={() => setPicked(null)}
          onConfirm={(choice) => {
            onMatch(picked, choice)
            onModeChange("summary")
          }}
        />
      )
    } else if (mode === "match") {
      body = (
        <MatchSearch
          conversation={conversation}
          directory={directory}
          hasPets={hasPets}
          copy={copy}
          onPick={setPicked}
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
      )
    } else if (conversation.customer) {
      body = (
        <ClientSummary
          key={conversation.customer.publicId}
          conversation={conversation}
          directoryClient={directoryClient}
          hasPets={hasPets}
          now={now}
          visitsMode={visitsMode}
          copy={copy}
          lang={lang}
          onChangeMatch={canEdit ? () => onModeChange("match") : null}
        />
      )
    } else if (!canEdit) {
      body = (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.notMatchedTitle}</p>
          <Phone e164={conversation.phoneE164} className="text-sm text-muted-foreground" />
        </div>
      )
    } else {
      body = (
        <UnmatchedPane
          conversation={conversation}
          waiting={waiting}
          windowOpen={windowOpen}
          now={now}
          copy={copy}
          lang={lang}
          onMatch={() => onModeChange("match")}
          onAdd={() => setAddOpen(true)}
          onSendAskTemplate={onSendAskTemplate}
          onStopWaiting={onStopWaiting}
        />
      )
    }
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
        <TabsContent value="client" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {body ?? <PanePlaceholder copy={copy} />}
        </TabsContent>
      </Tabs>
      {conversation && !conversation.customer ? (
        <AddClientDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          conversation={conversation}
          directory={directory}
          hasPets={hasPets}
          windowOpen={windowOpen}
          waiting={waiting}
          now={now}
          copy={copy}
          lang={lang}
          onSave={(c) => {
            onCreate(c)
            setAddOpen(false)
          }}
          onAskName={() => {
            onAskName()
            setAddOpen(false)
          }}
          onMatchInstead={() => {
            setAddOpen(false)
            onModeChange("match")
          }}
        />
      ) : null}
    </aside>
  )
}
