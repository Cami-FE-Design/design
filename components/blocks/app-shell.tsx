import type * as React from "react"
import { AppSidebar } from "@/components/blocks/app-sidebar"
import { AppTopbar } from "@/components/blocks/app-topbar"
import { cn } from "@/lib/utils"

type AppShellProps = React.ComponentProps<"div"> & {
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  header?: React.ReactNode
}

export function AppShell({
  className,
  children,
  sidebar = <AppSidebar />,
  topbar = <AppTopbar />,
  header,
  ...props
}: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex h-screen w-full items-start overflow-clip bg-sand-3", className)}
      {...props}
    >
      {sidebar}
      <div className="relative z-[1] flex h-full min-w-0 flex-1 flex-col">
        <div className="relative z-[2] w-full">{topbar}</div>
        <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]">
          <div className="flex w-full items-center justify-center bg-background px-3 py-6">
            {header ?? (
              <p className="text-base font-medium leading-6 text-muted-foreground">Page Header</p>
            )}
          </div>
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
