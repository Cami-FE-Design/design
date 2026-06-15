"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { CategoriesPage } from "@/components/blocks/service-menu/CategoriesPage"

function CategoriesRouteInner() {
  // ?add=1 deep-links straight into the add-category dialog.
  const openAdd = useSearchParams().get("add") === "1"
  return (
    <AppShell header={null}>
      {/* CategoriesPage manages its own sticky header + scroll area, so it just
          needs to fill the AppShell content region. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CategoriesPage initialAddOpen={openAdd} />
      </div>
    </AppShell>
  )
}

export default function CategoriesRoute() {
  return (
    <Suspense>
      <CategoriesRouteInner />
    </Suspense>
  )
}
