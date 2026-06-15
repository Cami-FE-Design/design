import type { ReactNode } from "react"
import { ServiceCatalogProvider } from "@/lib/service-catalog/store"

// Shared catalog state for the Service menu + Categories screens. Wrapping
// both routes in one provider means a category/service added on one screen is
// immediately reflected on the other — all backed by local mock state, no API.
export default function CatalogsLayout({ children }: { children: ReactNode }) {
  return <ServiceCatalogProvider>{children}</ServiceCatalogProvider>
}
