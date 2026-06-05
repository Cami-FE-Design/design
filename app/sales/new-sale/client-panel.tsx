"use client"

import {
  ArrowLeftIcon,
  ChevronDownIcon,
  PersonStandingIcon,
  PlusIcon,
  UserPlusIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { CLIENTS } from "./mock"
import type { CatalogClient, ClientAttachment } from "./types"

type ClientPanelProps = {
  attachment: ClientAttachment
  onAttachClient: (client: CatalogClient) => void
  onWalkIn: () => void
  onAddNew: () => void
  onClear: () => void
  /** Reports whether the client search list is open, so the parent can hide the cart placeholder. */
  onSearchingChange?: (searching: boolean) => void
}

export function ClientPanel({
  attachment,
  onAttachClient,
  onWalkIn,
  onAddNew,
  onClear,
  onSearchingChange,
}: ClientPanelProps) {
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState("")

  // Searching only applies in the unattached state; report the effective flag up.
  const effectiveSearching = searching && attachment.type === "none"
  useEffect(() => {
    onSearchingChange?.(effectiveSearching)
  }, [effectiveSearching, onSearchingChange])

  // Attached (client or walk-in) → collapsed identity card with Actions.
  if (attachment.type === "client" || attachment.type === "walk-in") {
    const isWalkIn = attachment.type === "walk-in"
    const name = isWalkIn ? "Walk-In" : attachment.client.name
    const phone = isWalkIn ? undefined : attachment.client.phone

    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2">
          {isWalkIn ? (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
              <PersonStandingIcon className="size-6" />
            </span>
          ) : (
            <Avatar
              name={attachment.client.name}
              hashSeed={attachment.client.id}
              src={attachment.client.photoUrl}
              fallback="character"
              size="lg"
            />
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold text-base text-foreground">{name}</span>
            {phone ? <span className="truncate text-muted-foreground text-sm">{phone}</span> : null}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" radius="full" className="w-fit gap-1">
              Actions
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {!isWalkIn ? <DropdownMenuItem>View profile</DropdownMenuItem> : null}
            <DropdownMenuItem
              onSelect={() => {
                onClear()
                setSearching(true)
              }}
            >
              Change client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onClear}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // No client + searching → search field, quick actions, alphabetical list.
  if (searching) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          radius="full"
          className="mb-3 w-fit gap-1.5"
          onClick={() => setSearching(false)}
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <SearchInput
          size="lg"
          autoFocus
          placeholder="Search clients"
          onValueChange={setQuery}
          containerClassName="mb-3"
        />
        <ClientQuickAction
          icon={PlusIcon}
          label="Add new client"
          onClick={() => {
            onAddNew()
            setSearching(false)
          }}
        />
        <ClientQuickAction
          icon={PersonStandingIcon}
          label="Walk-In"
          onClick={() => {
            onWalkIn()
            setSearching(false)
          }}
        />
        <div className="my-2 border-border/60 border-t" />
        <ClientResults
          query={query}
          onPick={(client) => {
            onAttachClient(client)
            setSearching(false)
          }}
        />
      </div>
    )
  }

  // No client, collapsed → "Add client" prompt card (appointment-sheet style:
  // plus-circle on the left, label, chevron on the right).
  return (
    <button
      type="button"
      onClick={() => setSearching(true)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
        <UserPlusIcon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold leading-5 text-foreground">Add client</span>
        <span className="text-xs text-muted-foreground">Leave empty for walk-ins</span>
      </div>
      <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground" />
    </button>
  )
}

function ClientQuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof PlusIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
        <Icon className="size-5" />
      </span>
      <span className="text-base font-medium text-foreground">{label}</span>
    </button>
  )
}

function ClientResults({
  query,
  onPick,
}: {
  query: string
  onPick: (client: CatalogClient) => void
}) {
  const results = useMemo(() => {
    const sorted = [...CLIENTS].sort((a, b) => a.name.localeCompare(b.name))
    // Filter only once the receptionist has typed 2+ chars (ticket rule).
    if (query.trim().length < 2) return sorted
    const q = query.trim().toLowerCase()
    return sorted.filter((c) =>
      [c.name, c.phone, c.email].some((field) => field?.toLowerCase().includes(q)),
    )
  }, [query])

  if (results.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        No clients match “{query}”
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {results.map((client) => (
        <li key={client.id}>
          <button
            type="button"
            onClick={() => onPick(client)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
          >
            <Avatar
              name={client.name}
              hashSeed={client.id}
              src={client.photoUrl}
              fallback="character"
              size="md"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{client.name}</span>
              {client.phone ? (
                <span className="truncate text-xs text-muted-foreground">{client.phone}</span>
              ) : null}
              {client.email ? (
                <span className="truncate text-xs text-muted-foreground">{client.email}</span>
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
