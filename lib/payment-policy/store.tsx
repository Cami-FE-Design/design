"use client"

// Business-level payment policy state (Fresha parity). Same pattern as
// lib/demo-business.tsx: React context + localStorage persistence, with a
// safe default returned outside a provider so isolated surfaces (playground,
// tests) still render. No backend — mutations are local and survive reload.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_PAYMENT_POLICY, type PaymentPolicy, type ServiceOverride } from "./types"

// v2: bumped so stale demo data from the pre-release toggle (which persisted
// type "none") resets everyone to the populated default.
const STORAGE_KEY = "cami-payment-policy-v2"

type PaymentPolicyValue = {
  policy: PaymentPolicy
  /** Shallow-merge a patch into the policy and persist it. */
  updatePolicy: (patch: Partial<PaymentPolicy>) => void
  /** Replace the whole policy (editor Save). */
  setPolicy: (next: PaymentPolicy) => void
  /** Merge a patch into one service's override; pass null fields explicitly to set "Off". */
  setServiceOverride: (serviceId: string, override: ServiceOverride) => void
  /** Remove a service's override (back to Default). */
  clearServiceOverride: (serviceId: string) => void
  reset: () => void
}

const PaymentPolicyContext = createContext<PaymentPolicyValue | null>(null)

function readSaved(): PaymentPolicy | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    // Merge over defaults so newly added fields get sane values after a deploy.
    return { ...DEFAULT_PAYMENT_POLICY, ...(JSON.parse(raw) as Partial<PaymentPolicy>) }
  } catch {
    return null
  }
}

export function PaymentPolicyProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so server and first client render match; hydrate
  // the saved value in an effect to avoid an SSR mismatch.
  const [policy, setPolicyState] = useState<PaymentPolicy>(DEFAULT_PAYMENT_POLICY)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setPolicyState(saved)
  }, [])

  const value = useMemo<PaymentPolicyValue>(() => {
    const persist = (next: PaymentPolicy) => {
      setPolicyState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full/unavailable — state still updates for the session.
      }
    }

    return {
      policy,
      updatePolicy: (patch) => persist({ ...policy, ...patch }),
      setPolicy: (next) => persist(next),
      setServiceOverride: (serviceId, override) =>
        persist({
          ...policy,
          serviceOverrides: {
            ...policy.serviceOverrides,
            [serviceId]: { ...policy.serviceOverrides[serviceId], ...override },
          },
        }),
      clearServiceOverride: (serviceId) => {
        const { [serviceId]: _removed, ...rest } = policy.serviceOverrides
        persist({ ...policy, serviceOverrides: rest })
      },
      reset: () => {
        setPolicyState(DEFAULT_PAYMENT_POLICY)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [policy])

  return <PaymentPolicyContext.Provider value={value}>{children}</PaymentPolicyContext.Provider>
}

/**
 * Read the payment policy. Returns the (inert) default outside a provider so
 * any surface rendered in isolation still works.
 */
export function usePaymentPolicy(): PaymentPolicyValue {
  const ctx = useContext(PaymentPolicyContext)
  if (ctx) return ctx
  return {
    policy: DEFAULT_PAYMENT_POLICY,
    updatePolicy: () => {},
    setPolicy: () => {},
    setServiceOverride: () => {},
    clearServiceOverride: () => {},
    reset: () => {},
  }
}
