import type { Metadata } from "next"
import { AdminShell } from "@/components/blocks/admin-shell"

export const metadata: Metadata = {
  title: "Dashboard · Cami HQ",
}

export default function AdminDashboardPage() {
  return <AdminShell />
}
