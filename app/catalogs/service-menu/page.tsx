"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ServiceMenuPage } from "@/components/blocks/service-menu/ServiceMenuPage"

function ServiceMenuRouteInner() {
  // ?new=1 deep-links straight into the add-service takeover.
  const openNew = useSearchParams().get("new") === "1"
  return (
    <AppShell header={null} contentClassName="pb-0">
      {/* AppShell's content area doesn't scroll on its own — give the page its
          own scroll container so long service lists don't clip. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ServiceMenuPage initialNewService={openNew} />
      </div>
    </AppShell>
  )
}

export default function ServiceMenuRoute() {
  return (
    <Suspense>
      <ServiceMenuRouteInner />
    </Suspense>
  )
}
