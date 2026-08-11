"use client"

// React provider for notification settings.
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// Same shape as lib/terminals/store.tsx: React context + localStorage, with an
// inert default returned outside a provider so isolated surfaces (playground,
// tests) still render. The types, defaults, and helpers live in types.ts.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_EVENTS,
  DEFAULT_GRANT,
  DEFAULT_NOTIFICATIONS_STATE,
  DEFAULT_PERIOD_USAGE,
  DEFAULT_SENDER_ID,
  DEMO_LOG,
  DEMO_SENDER_IDS,
  type EventMatrix,
  type NotificationChannel,
  type NotificationsState,
  REMINDER_EVENTS,
  type ReminderEvent,
  type SenderIdStatus,
} from "@/lib/notifications/types"

// Bumped to v2: the demo log's appointmentId values changed (apt-N → real
// booking ids), so a v1 blob restored a log that matched no appointment and the
// activity timeline silently showed no sends. Same reason the terminals store
// carries a version in its key.
const STORAGE_KEY = "cami-notifications-v2"

type NotificationsValue = NotificationsState & {
  /** Submit a merchant-entered Sender ID — moves straight to `submitted`. */
  submitSenderId: (value: string) => void
  /** Drop back to the CAMI fallback and clear any registration. */
  clearSenderId: () => void
  /** Demo-only: stand in for the HQ decision on a pending registration. */
  setSenderIdStatus: (status: SenderIdStatus) => void
  /** Flip one cell of the merchant's intent. */
  toggleEvent: (event: ReminderEvent, channel: NotificationChannel, next: boolean) => void
  /** Demo-only: stand in for the HQ master switch this panel reads. */
  setGrant: (channel: NotificationChannel, next: boolean) => void
  reset: () => void
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

function readSaved(): NotificationsState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<NotificationsState>
    // Shallow spread — a saved object replaces the default wholesale, including
    // records written before an event or channel existed. Fill the gaps per key
    // rather than letting an undefined cell render as a state that isn't real.
    const events = {} as EventMatrix
    for (const { id } of REMINDER_EVENTS) {
      const savedRow = saved.events?.[id]
      events[id] = {
        email: savedRow?.email ?? DEFAULT_EVENTS[id].email,
        sms: savedRow?.sms ?? DEFAULT_EVENTS[id].sms,
        whatsapp: savedRow?.whatsapp ?? DEFAULT_EVENTS[id].whatsapp,
      }
    }
    return {
      senderId: { ...DEFAULT_SENDER_ID, ...saved.senderId },
      events,
      grant: { ...DEFAULT_GRANT, ...saved.grant },
      periodUsage: { ...DEFAULT_PERIOD_USAGE, ...saved.periodUsage },
      // Always the fixture, never the saved copy. Nothing in the UI writes to
      // the log, so persisting it buys nothing and guarantees that any future
      // change to the demo sends is invisible until someone clears storage.
      log: DEMO_LOG,
    }
  } catch {
    return null
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [state, setState] = useState<NotificationsState>(DEFAULT_NOTIFICATIONS_STATE)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setState(saved)
  }, [])

  const value = useMemo<NotificationsValue>(() => {
    const persist = (next: NotificationsState) => {
      setState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }

    return {
      ...state,
      submitSenderId: (value) =>
        persist({
          ...state,
          // Registration is decided at HQ, so the merchant's save lands on
          // `submitted` and never on `approved`. rejectionReason is dropped:
          // it described the previous attempt.
          senderId: { value: value.trim(), status: "submitted", submittedAt: "just now" },
        }),
      clearSenderId: () =>
        persist({ ...state, senderId: { value: null, status: "not-submitted" } }),
      setSenderIdStatus: (status) =>
        persist({ ...state, senderId: { ...DEMO_SENDER_IDS[status] } }),
      toggleEvent: (event, channel, next) =>
        persist({
          ...state,
          events: {
            ...state.events,
            [event]: { ...state.events[event], [channel]: next },
          },
        }),
      setGrant: (channel, next) =>
        persist({ ...state, grant: { ...state.grant, [channel]: next } }),
      reset: () => {
        setState(DEFAULT_NOTIFICATIONS_STATE)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [state])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

/**
 * Read notification settings. Returns the (inert) default outside a provider so
 * any surface rendered in isolation still works.
 */
export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_NOTIFICATIONS_STATE,
    submitSenderId: () => {},
    clearSenderId: () => {},
    setSenderIdStatus: () => {},
    toggleEvent: () => {},
    setGrant: () => {},
    reset: () => {},
  }
}
