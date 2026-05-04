import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  backHref?: string
  onBack?: () => void
  backLabel?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  icon,
  backHref,
  onBack,
  backLabel = "Back",
  children,
  footer,
  className,
}: AuthCardProps) {
  const backTrigger = backHref ? (
    <Button
      asChild
      variant="ghost"
      size="icon-xl"
      radius="full"
      aria-label={backLabel}
      className="absolute top-6 left-6 lg:top-8 lg:left-8"
    >
      <Link href={backHref}>
        <ArrowLeftIcon className="size-6" />
      </Link>
    </Button>
  ) : onBack ? (
    <Button
      type="button"
      variant="ghost"
      size="icon-xl"
      radius="full"
      aria-label={backLabel}
      onClick={onBack}
      className="absolute top-6 left-6 lg:top-8 lg:left-8"
    >
      <ArrowLeftIcon className="size-6" />
    </Button>
  ) : null

  return (
    <>
      {backTrigger ? (
        <Tooltip>
          <TooltipTrigger asChild>{backTrigger}</TooltipTrigger>
          <TooltipContent side="bottom">{backLabel}</TooltipContent>
        </Tooltip>
      ) : null}
      <div
        data-slot="auth-card"
        className={cn("flex w-full max-w-md flex-col gap-8 px-6 py-12 lg:px-10", className)}
      >
        {icon ? (
          <div className="flex flex-col gap-6">
            {icon}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl leading-9 font-medium tracking-tight text-foreground">
                {title}
              </h1>
              {description ? (
                <div className="text-sm text-muted-foreground">{description}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl leading-9 font-medium tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <div className="text-sm text-muted-foreground">{description}</div>
            ) : null}
          </div>
        )}
        {children}
        {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </>
  )
}
