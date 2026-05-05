"use client"

import { useEffect } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
import { useAuth } from "@/lib/auth-mock"

const BUSINESS = {
  name: "Acme Grooming",
  ownerName: "Hareem Rehan",
  ownerEmail: "hareem@acmegrooming.com",
}

export default function PortalImpersonationDemoPage() {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isImpersonating) auth.setImpersonating(true)
  }, [auth])

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-cami-yellow-9 lg:h-screen">
      <ImpersonationBanner
        ownerName={BUSINESS.ownerName}
        onExit={() => {
          auth.setImpersonating(false)
          window.close()
        }}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden px-1 pb-1">
        <div className="relative flex h-full w-full overflow-hidden rounded-md">
          <AppShell
            breakpoint="desktop"
            className="h-full"
            header={
              <div className="flex w-full items-center justify-between gap-4">
                <h1 className="font-heading text-base font-medium leading-6 text-foreground">
                  {BUSINESS.name} · Owner view
                </h1>
                <span className="text-xs text-muted-foreground">Partner portal</span>
              </div>
            }
          >
            <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-5 lg:col-span-2">
                <h2 className="text-sm font-medium text-foreground">Today&apos;s bookings</h2>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li>09:00 · Daisy (Goldendoodle) · Wash & dry</li>
                  <li>10:30 · Mochi (Pomeranian) · Full groom</li>
                  <li>13:00 · Rex (Lab) · Nail trim</li>
                  <li>15:30 · Luna (Maltese) · Full groom</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-5">
                <h2 className="text-sm font-medium text-foreground">Today</h2>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-semibold leading-9 text-foreground">
                    12
                  </span>
                  <span className="text-xs text-muted-foreground">appointments</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-semibold leading-9 text-foreground">
                    $1,420
                  </span>
                  <span className="text-xs text-muted-foreground">revenue</span>
                </div>
              </div>
            </div>
          </AppShell>
        </div>
      </div>
    </div>
  )
}
