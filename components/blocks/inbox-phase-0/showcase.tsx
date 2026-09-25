"use client"

import { useState } from "react"

import {
  buildConversations,
  buildDirectory,
  DEMO_NOW,
  type InboxConversation,
} from "@/app/messages/inbox/phase-0/mock"

import { ClientPane, type PaneMode } from "./client-pane"
import { Composer } from "./composer"
import { ConversationList } from "./conversation-list"
import { COPY } from "./copy"

// ─── Playground: the Inbox Phase 0 pieces, state by state ─────────────────────
// The full flows live on /messages/inbox/phase-0 (and its walkthrough); this is
// the design-system view of the parts, each in the states it can be in.

const copy = COPY.en
const noop = () => {}

function useSeed() {
  const [seed] = useState(() => {
    const chats = buildConversations()
    return { chats, directory: buildDirectory(chats) }
  })
  const chat = (id: string) => seed.chats.find((c) => c.publicId === id) as InboxConversation
  return { ...seed, chat }
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

export function InboxPhase0Showcase() {
  const { chats, directory, chat } = useSeed()
  const [mode, setMode] = useState<PaneMode>("summary")
  const listSubset = ["unmatched-saturday", "layla", "noura", "omar"].map(chat)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-6">
        <Frame label="Chat list — unmatched, unread, failed">
          <div className="flex h-96">
            <ConversationList
              status="ready"
              conversations={listSubset}
              selectedId="layla"
              onSelect={noop}
              onRetry={noop}
              copy={copy}
              lang="en"
              now={DEMO_NOW}
            />
          </div>
        </Frame>
        <Frame label="Chat list — loading, empty, error">
          <div className="flex h-96 gap-3">
            {(["loading", "empty", "error"] as const).map((s) => (
              <ConversationList
                key={s}
                status={s}
                conversations={[]}
                selectedId={null}
                onSelect={noop}
                onRetry={noop}
                copy={copy}
                lang="en"
                now={DEMO_NOW}
              />
            ))}
          </div>
        </Frame>
      </div>

      <div className="flex flex-col gap-4">
        {(
          [
            ["Composer — window open", "layla"],
            ["Composer — closing soon", "maryam"],
            ["Composer — window closed, templates only", "sara"],
          ] as const
        ).map(([label, id]) => (
          <Frame key={id} label={label}>
            <div className="max-w-2xl overflow-hidden rounded-2xl border border-border">
              <Composer
                conversation={chat(id)}
                now={DEMO_NOW}
                copy={copy}
                lang="en"
                onSendText={noop}
                onSendTemplate={noop}
                onMatch={noop}
              />
            </div>
          </Frame>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        {(
          [
            ["Client pane — ClientSummary", "layla"],
            ["Client pane — unmatched: Match and Add only", "unmatched-saturday"],
          ] as const
        ).map(([label, id]) => (
          <Frame key={id} label={label}>
            <div className="flex h-[36rem]">
              <ClientPane
                status="ready"
                conversation={chat(id)}
                directory={directory}
                mode={id === "layla" ? "summary" : mode}
                onModeChange={setMode}
                waiting={null}
                windowOpen
                hasPets
                visitsMode="normal"
                canEdit
                now={DEMO_NOW}
                copy={copy}
                lang="en"
                onMatch={noop}
                onCreate={noop}
                onAskName={noop}
                onSendAskTemplate={noop}
                onStopWaiting={noop}
              />
            </div>
          </Frame>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {chats.length} seeded chats. Every flow, with links:
        docs/specs/ENG3-33-inbox-phase-0-walkthrough.md · route /messages/inbox/phase-0
      </p>
    </div>
  )
}
