import type { Metadata } from "next"
import { AdminShell } from "@/components/blocks/admin-shell"

export const metadata: Metadata = {
  title: "Dashboard · Cami HQ",
}

export default function AdminDashboardPage() {
  return (
    <AdminShell
      header={
        <div className="flex w-full items-center">
          <h1 className="font-heading text-base font-medium leading-6 text-foreground">
            Dashboard
          </h1>
        </div>
      }
    >
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active businesses", value: "1,284" },
          { label: "MRR", value: "$214,902" },
          { label: "Open tickets", value: "27" },
          { label: "New signups (7d)", value: "63" },
        ].map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-5"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </span>
            <span className="font-heading text-3xl font-semibold leading-9 text-foreground">
              {tile.value}
            </span>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
