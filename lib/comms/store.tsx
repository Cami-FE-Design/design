"use client"

// React provider for communication templates. DSG-83.
//
// Same shape as lib/notifications/store.tsx: React context + localStorage, with
// an inert default returned outside a provider so isolated surfaces (playground,
// tests) still render. Types, defaults, and helpers live in templates.ts.
//
// State holds only overrides, never a full copy of every template — see the note
// at the top of templates.ts. That makes `resetTemplate` a delete rather than a
// re-seed, and lets an improved default reach merchants who never edited it.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  type CommsChannel,
  type CommsOverrides,
  type CommsTemplate,
  defaultTemplate,
  isCustomised,
  resolveStoredTemplate,
  templateKey,
} from "@/lib/comms/templates"
import type { ReminderEvent } from "@/lib/notifications/types"

const STORAGE_KEY = "cami-comms-templates-v1"

type CommsTemplatesValue = {
  overrides: CommsOverrides
  /** Effective template — the merchant's edit if there is one, else the shipped default. */
  template: (event: ReminderEvent, channel: CommsChannel) => CommsTemplate
  /** True when this template has been edited away from its default. */
  customised: (event: ReminderEvent, channel: CommsChannel) => boolean
  /**
   * Save an edit. Writing a value identical to the default deletes the override
   * instead of storing it, so a merchant who edits and then types the original
   * copy back is genuinely back at the default rather than permanently pinned to
   * a snapshot of it.
   */
  updateTemplate: (
    event: ReminderEvent,
    channel: CommsChannel,
    next: Pick<CommsTemplate, "subject" | "body">,
  ) => void
  /** Drop the override, restoring the shipped default. */
  resetTemplate: (event: ReminderEvent, channel: CommsChannel) => void
  /** How many templates the merchant has edited. Drives the panel's summary line. */
  customisedCount: number
  reset: () => void
}

const CommsTemplatesContext = createContext<CommsTemplatesValue | null>(null)

function readSaved(): CommsOverrides | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as CommsOverrides
    // Keys are `event:channel` strings whose halves may not exist any more (an
    // event renamed, a channel dropped). Nothing downstream can render such a
    // row, so drop unknown keys here rather than letting them inflate the
    // "edited" count for a template the merchant can no longer see.
    const cleaned: CommsOverrides = {}
    for (const [key, value] of Object.entries(saved)) {
      if (value && typeof value.body === "string") cleaned[key] = value
    }
    return cleaned
  } catch {
    return null
  }
}

export function CommsTemplatesProvider({ children }: { children: React.ReactNode }) {
  // Start empty so server and first client render match; hydrate saved
  // overrides in an effect to avoid an SSR mismatch.
  const [overrides, setOverrides] = useState<CommsOverrides>({})

  useEffect(() => {
    const saved = readSaved()
    if (saved) setOverrides(saved)
  }, [])

  const value = useMemo<CommsTemplatesValue>(() => {
    const persist = (next: CommsOverrides) => {
      setOverrides(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }

    return {
      overrides,
      template: (event, channel) => resolveStoredTemplate(overrides, event, channel),
      customised: (event, channel) => isCustomised(overrides, event, channel),
      customisedCount: Object.keys(overrides).length,
      updateTemplate: (event, channel, next) => {
        const base = defaultTemplate(event, channel)
        const subject = channel === "email" ? next.subject : null
        const key = templateKey(event, channel)
        if (next.body === base.body && subject === base.subject) {
          const { [key]: _dropped, ...rest } = overrides
          persist(rest)
          return
        }
        persist({ ...overrides, [key]: { subject, body: next.body } })
      },
      resetTemplate: (event, channel) => {
        const { [templateKey(event, channel)]: _dropped, ...rest } = overrides
        persist(rest)
      },
      reset: () => {
        setOverrides({})
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [overrides])

  return <CommsTemplatesContext.Provider value={value}>{children}</CommsTemplatesContext.Provider>
}

/**
 * Read communication templates. Returns an inert default outside a provider so
 * any surface rendered in isolation still works — reads resolve to the shipped
 * defaults and writes are no-ops.
 */
export function useCommsTemplates(): CommsTemplatesValue {
  const ctx = useContext(CommsTemplatesContext)
  if (ctx) return ctx
  return {
    overrides: {},
    template: (event, channel) => defaultTemplate(event, channel),
    customised: () => false,
    customisedCount: 0,
    updateTemplate: () => {},
    resetTemplate: () => {},
    reset: () => {},
  }
}
