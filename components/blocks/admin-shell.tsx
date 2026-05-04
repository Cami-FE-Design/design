import type * as React from "react"
import { AdminSidebar } from "@/components/blocks/admin-sidebar"
import { AdminTopbar } from "@/components/blocks/admin-topbar"
import { cn } from "@/lib/utils"

type AdminShellProps = React.ComponentProps<"div"> & {
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  header?: React.ReactNode
}

/**
 * Cami HQ application shell — for the ops-admin tool.
 *
 * Mirrors `AppShell` (Pet Business) in structure: sidebar + topbar + content,
 * with the same upward shadow and rounded-tl-2xl on the content card. Differs
 * in branding (Cami HQ pill vs workspace switcher), nav items (admin menu),
 * and the surrounding background (cami-sage-4).
 */
export function AdminShell({
  className,
  children,
  sidebar,
  topbar,
  header,
  ...props
}: AdminShellProps) {
  return (
    <div
      data-slot="admin-shell"
      className={cn("flex h-screen w-full items-start overflow-clip bg-cami-sage-4", className)}
      {...props}
    >
      {sidebar ?? <AdminSidebar />}
      <div className="relative z-[1] flex h-full min-w-0 flex-1 flex-col">
        <div className="relative z-[2] w-full">{topbar ?? <AdminTopbar />}</div>
        <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]">
          {header !== null ? (
            <div className="flex w-full items-center justify-center bg-background px-3 py-6">
              {header ?? (
                <p className="text-base font-medium leading-6 text-muted-foreground">Page Header</p>
              )}
            </div>
          ) : null}
          <div className="flex min-h-0 w-full flex-1 flex-col bg-background px-3 pb-9">
            {children ?? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center border-2 border-dashed border-border">
                <p className="text-base font-normal leading-6 text-muted-foreground">
                  Main Content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
