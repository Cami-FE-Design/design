import type { ReactNode } from "react"
import { ReportsProvider } from "@/lib/reports/store"

// Wraps the Reporting index + all report views in one provider so favourites
// (and the freshness stamp) are shared across the section — local mock state,
// no API. Mirrors app/catalogs/layout.tsx.
export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <ReportsProvider>{children}</ReportsProvider>
}
