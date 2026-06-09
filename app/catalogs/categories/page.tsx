"use client"

import { AppShell } from "@/components/blocks/app-shell"
import { CategoriesPage } from "@/components/blocks/service-menu/CategoriesPage"

export default function CategoriesRoute() {
  return (
    <AppShell header={null}>
      {/* CategoriesPage manages its own sticky header + scroll area, so it just
          needs to fill the AppShell content region. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CategoriesPage />
      </div>
    </AppShell>
  )
}
