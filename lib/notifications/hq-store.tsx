"use client"

// Platform-wide notification rates, owned by Cami HQ.
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// Separate from lib/notifications/store.tsx because the two answer to different
// people: that store is one merchant's own settings, this is the price list
// every merchant inherits. A merchant can never write here.
//
// Same shape as the other stores: React context + localStorage, with an inert
// default returned outside a provider so isolated surfaces (the playground,
// which sits outside /admin) still render.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type NotificationChannel, PLATFORM_DEFAULT_RATES } from "@/lib/notifications/types"

const STORAGE_KEY = "cami-hq-notification-rates-v1"

export type HqRates = Record<NotificationChannel, number>

type HqNotificationsValue = {
  /** AED per message, per channel, before any per-merchant override. */
  rates: HqRates
  setRate: (channel: NotificationChannel, amount: number) => void
  reset: () => void
}

const HqNotificationsContext = createContext<HqNotificationsValue | null>(null)

function readSaved(): HqRates | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<HqRates>
    // Per-key merge, so a channel added after a save doesn't come back
    // undefined and render as a free channel.
    return { ...PLATFORM_DEFAULT_RATES, ...saved }
  } catch {
    return null
  }
}

export function HqNotificationsProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate the
  // saved value in an effect to avoid an SSR mismatch.
  const [rates, setRates] = useState<HqRates>(PLATFORM_DEFAULT_RATES)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setRates(saved)
  }, [])

  const value = useMemo<HqNotificationsValue>(() => {
    const persist = (next: HqRates) => {
      setRates(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }
    return {
      rates,
      setRate: (channel, amount) => persist({ ...rates, [channel]: amount }),
      reset: () => {
        setRates(PLATFORM_DEFAULT_RATES)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [rates])

  return <HqNotificationsContext.Provider value={value}>{children}</HqNotificationsContext.Provider>
}

/**
 * Read the platform rate list. Returns the (inert) defaults outside a provider,
 * so a surface rendered in isolation shows real prices rather than zeroes.
 */
export function useHqRates(): HqNotificationsValue {
  const ctx = useContext(HqNotificationsContext)
  if (ctx) return ctx
  return {
    rates: PLATFORM_DEFAULT_RATES,
    setRate: () => {},
    reset: () => {},
  }
}
