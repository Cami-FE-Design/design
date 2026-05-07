import { ArrowLeftIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"
import { Fragment } from "react"
import { AuthLayout } from "@/components/blocks/auth-layout"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const stepConfig = [
  { label: "About" },
  { label: "Type" },
  { label: "Location" },
  { label: "Invoicing" },
  { label: "Hours" },
] as const

const totalSteps = stepConfig.length

type SetupLayoutProps = {
  stepIndex?: number
  prevHref?: string
  exitHref?: string
  children: React.ReactNode
}

export function SetupLayout({
  stepIndex,
  prevHref,
  exitHref = "/sign-in",
  children,
}: SetupLayoutProps) {
  const current = stepIndex ? stepConfig[stepIndex - 1] : null

  return (
    <AuthLayout splitPane={false}>
      {prevHref ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon-xl"
              radius="full"
              aria-label="Back"
              className="absolute top-6 left-6 z-10 lg:top-8 lg:left-8"
            >
              <Link href={prevHref}>
                <ArrowLeftIcon className="size-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Back</TooltipContent>
        </Tooltip>
      ) : null}

      <Button
        asChild
        variant="outline"
        radius="full"
        className="absolute top-6 right-6 z-10 lg:top-8 lg:right-8"
      >
        <Link href={exitHref}>Save and exit</Link>
      </Button>

      {stepIndex && current ? (
        <>
          <div className="absolute top-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:hidden">
            <span aria-hidden className="size-2 rounded-full bg-cami-violet-8" />
            <span className="text-sm font-semibold text-foreground">{current.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              · {stepIndex}/{totalSteps}
            </span>
          </div>

          <div className="absolute top-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-6 md:flex lg:top-11 lg:gap-8">
            {stepConfig.map((s, i) => {
              const isCompleted = i < stepIndex - 1
              const isCurrent = i === stepIndex - 1
              return (
                <Fragment key={s.label}>
                  {i > 0 ? (
                    <span aria-hidden className="text-muted-foreground">
                      ·
                    </span>
                  ) : null}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckIcon className="size-4 text-green-600" />
                    ) : isCurrent ? (
                      <span aria-hidden className="size-2 rounded-full bg-cami-violet-8" />
                    ) : null}
                    <span
                      className={cn(
                        "text-sm",
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isCompleted
                            ? "font-medium text-foreground"
                            : "font-medium text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </>
      ) : null}

      <div className="flex w-full flex-col items-center self-start px-6 pt-32 pb-12 lg:pt-36 lg:pb-16">
        {children}
      </div>
    </AuthLayout>
  )
}

type SetupCardProps = {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  aside?: React.ReactNode
  ctaHref: string
  ctaLabel?: string
  children: React.ReactNode
  className?: string
}

export function SetupCard({
  title,
  description,
  eyebrow,
  aside,
  ctaHref,
  ctaLabel = "Continue",
  children,
  className,
}: SetupCardProps) {
  return (
    <div
      data-slot="setup-card"
      className={cn("grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:gap-24", className)}
    >
      <div className="flex flex-col gap-4">
        {eyebrow ? <div className="text-sm text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? <div className="text-base text-muted-foreground">{description}</div> : null}
        {aside ? <div className="mt-2">{aside}</div> : null}
      </div>
      <div className="flex flex-col gap-4">
        {children}
        <div className="mt-2 flex justify-end">
          <Button asChild radius="full" size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function WireField({
  label,
  hint,
  className,
}: {
  label: string
  hint?: string
  className?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div
        className={cn(
          "flex min-h-11 items-center rounded-md border border-sand-7 bg-sand-2 px-3 text-xs text-muted-foreground",
          className,
        )}
      >
        {hint ?? `[ ${label} ]`}
      </div>
    </div>
  )
}

export function WireBox({
  label,
  className,
  children,
}: {
  label?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-h-20 items-center justify-center rounded-md border border-dashed border-sand-7 bg-sand-2 px-4 py-3 text-center text-xs text-muted-foreground",
        className,
      )}
    >
      {children ?? label}
    </div>
  )
}
