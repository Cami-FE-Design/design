"use client"

import { ChevronsDownIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronsUpIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  inline = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay> & { inline?: boolean }) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        inline ? "absolute" : "fixed",
        "inset-0 z-50 bg-sand-7/60 duration-150 ease-out data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

const closeIconBySide = {
  right: ChevronsRightIcon,
  left: ChevronsLeftIcon,
  top: ChevronsUpIcon,
  bottom: ChevronsDownIcon,
} as const

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  inline = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  inline?: boolean
}) {
  const CloseIcon = closeIconBySide[side]
  const sizingClasses = inline
    ? "data-[side=right]:w-[calc(100%-16px)] data-[side=left]:w-[calc(100%-16px)] data-[side=top]:max-h-[calc(100%-16px)] data-[side=bottom]:max-h-[calc(100%-16px)]"
    : "data-[side=right]:w-[calc(100vw-16px)] data-[side=left]:w-[calc(100vw-16px)] data-[side=top]:max-h-[calc(100vh-16px)] data-[side=bottom]:max-h-[calc(100vh-16px)]"
  const body = (
    <>
      <SheetOverlay inline={inline} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          inline ? "absolute" : "fixed",
          "z-50 flex flex-col overflow-hidden rounded-2xl bg-white-a11 text-foreground shadow-overlay supports-backdrop-filter:backdrop-blur-[8px] dark:bg-sand-2/90",
          "data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:max-w-[550px]",
          "data-[side=left]:inset-y-2 data-[side=left]:left-2 data-[side=left]:max-w-[550px]",
          "data-[side=top]:inset-x-2 data-[side=top]:top-2 data-[side=top]:h-auto",
          "data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-2 data-[side=bottom]:h-auto",
          sizingClasses,
          "data-open:animate-in data-open:duration-300 data-open:ease-[cubic-bezier(0.16,1,0.3,1)]",
          "data-closed:animate-out data-closed:duration-200 data-closed:ease-[cubic-bezier(0.7,0,0.84,0)]",
          "data-[side=right]:data-open:slide-in-from-right-full data-[side=right]:data-closed:slide-out-to-right-full",
          "data-[side=left]:data-open:slide-in-from-left-full data-[side=left]:data-closed:slide-out-to-left-full",
          "data-[side=top]:data-open:slide-in-from-top-full data-[side=top]:data-closed:slide-out-to-top-full",
          "data-[side=bottom]:data-open:slide-in-from-bottom-full data-[side=bottom]:data-closed:slide-out-to-bottom-full",
          className,
        )}
        {...props}
      >
        {showCloseButton && (
          <div className="flex min-h-12 items-center gap-3 px-3">
            <SheetPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <CloseIcon />
              </Button>
            </SheetPrimitive.Close>
          </div>
        )}
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </SheetPrimitive.Content>
    </>
  )
  return inline ? body : <SheetPortal>{body}</SheetPortal>
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
