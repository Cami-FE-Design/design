import type * as React from "react"
import { AdminAuthProvider } from "@/components/blocks/admin-auth-provider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
