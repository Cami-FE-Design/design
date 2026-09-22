"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ServiceMenuPage } from "@/components/blocks/service-menu/ServiceMenuPage"

const SERVICE_SECTIONS = [
  "basic",
  "team",
  "locations",
  "online-booking",
  "portfolio",
  "settings",
] as const
type ServiceSection = (typeof SERVICE_SECTIONS)[number]

function ServiceMenuRouteInner() {
  // ?new=1 deep-links straight into the add-service takeover. ?service=<id>
  // opens that service's editor, and ?ss=<section> picks the section it lands
  // on — a link about per-branch pricing has to open Locations, not drop the
  // reader on a menu of forty services with no sign of which one to press.
  const params = useSearchParams()
  const openNew = params.get("new") === "1"
  const serviceId = params.get("service")
  const sectionParam = params.get("ss")
  const section = SERVICE_SECTIONS.includes(sectionParam as ServiceSection)
    ? (sectionParam as ServiceSection)
    : "basic"
  return (
    <AppShell header={null} contentClassName="pb-0">
      {/* AppShell's content area doesn't scroll on its own — give the page its
          own scroll container so long service lists don't clip. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ServiceMenuPage
          initialNewService={openNew}
          initialEditServiceId={serviceId}
          initialEditSection={section}
        />
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
