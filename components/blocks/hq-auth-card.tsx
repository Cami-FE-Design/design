import type * as React from "react"
import { CamiMark } from "@/components/brand/cami-mark"
import { cn } from "@/lib/utils"

export function CamiHQBrand({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-fit items-center gap-2 rounded-full bg-cami-sage-4 px-3 text-sm font-medium text-foreground",
        className,
      )}
    >
      <CamiMark size={20} />
      Cami HQ
    </div>
  )
}

type HQAuthCardProps = {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function HQAuthCard({
  icon,
  title,
  description,
  children,
  footer,
  className,
}: HQAuthCardProps) {
  return (
    <div
      data-slot="hq-auth-card"
      className={cn(
        "flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-background px-8 py-10 text-center shadow-overlay",
        className,
      )}
    >
      <CamiHQBrand />
      {icon}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold leading-8 text-foreground">{title}</h1>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex w-full flex-col gap-3">{children}</div> : null}
      {footer ? <div className="text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  )
}
