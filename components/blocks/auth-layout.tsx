import type * as React from "react"
import { AuthMarketingPanel } from "@/components/blocks/auth-marketing-panel"
import { cn } from "@/lib/utils"

type AuthLayoutProps = {
  children: React.ReactNode
  splitPane?: boolean
  className?: string
}

export function AuthLayout({ children, splitPane = true, className }: AuthLayoutProps) {
  return (
    <div
      data-slot="auth-layout"
      data-split-pane={splitPane}
      className={cn(
        "flex min-h-screen w-full justify-center gap-3 bg-sand-3 px-3 py-6 lg:py-12",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-y-auto rounded-2xl bg-background",
          splitPane ? "lg:max-w-[640px]" : "lg:max-w-[1292px]",
        )}
      >
        {children}
      </div>
      {splitPane ? <AuthMarketingPanel className="hidden flex-1 lg:flex lg:max-w-[640px]" /> : null}
    </div>
  )
}
