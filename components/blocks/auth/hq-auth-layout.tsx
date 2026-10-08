import type * as React from "react"
import { cn } from "@/lib/utils"

type HqAuthLayoutProps = {
  children: React.ReactNode
  className?: string
}

export function HqAuthLayout({ children, className }: HqAuthLayoutProps) {
  return (
    <div
      data-slot="hq-auth-layout"
      className={cn(
        "flex min-h-screen w-full justify-center bg-hq-aurora px-3 py-6 lg:py-12",
        className,
      )}
    >
      <div className="relative flex w-full items-center justify-center overflow-y-auto rounded-2xl bg-background lg:max-w-[1292px]">
        {children}
      </div>
    </div>
  )
}
