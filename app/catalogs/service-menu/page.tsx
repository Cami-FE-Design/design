"use client"

import { AppShell } from "@/components/blocks/app-shell"
import { ServiceMenuPage } from "@/components/blocks/service-menu/ServiceMenuPage"

export default function ServiceMenuRoute() {
  return (
    <AppShell header={null}>
      {/* AppShell's content area doesn't scroll on its own — give the page its
          own scroll container so long service lists don't clip. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ServiceMenuPage />
      </div>
    </AppShell>
  )
}
