import type * as React from "react"
import { LocationAccessGate, NoLocationAccess } from "@/components/blocks/shell/no-location-access"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// The frame both shells render: sidebar or drawer, topbar, and the page under
// it, as one tree switched by CSS (see app-shell.tsx for why there is only one
// tree). AppShell and AdminShell pass their own chrome and the few ways they
// differ; the layout and the breakpoint logic are written here once.

export type ShellBreakpoint = "desktop" | "mobile"

/** The classes that show or hide each piece of chrome at the current breakpoint. */
export type ShellChromeClasses = {
  sidebar: string
  desktopTopbar: string
  mobileTopbar: string
}

type ShellFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  slot: string
  breakpoint?: ShellBreakpoint
  /** The product's sidebar, topbar and drawer, given the classes that place them. */
  chrome: (classes: ShellChromeClasses) => {
    sidebar: React.ReactNode
    topbar: React.ReactNode
    drawer: React.ReactNode
  }
  header?: React.ReactNode
  headerClassName?: string
  contentClassName?: string
  frameClassName?: string
  /**
   * Gate the header and content on the reader holding a location. The
   * business app does; Cami HQ has no locations to hold.
   */
  locationGate?: boolean
  children?: React.ReactNode
}

export function ShellFrame({
  slot,
  className,
  breakpoint,
  chrome,
  header,
  headerClassName,
  contentClassName,
  frameClassName,
  locationGate = false,
  children,
  ...props
}: ShellFrameProps) {
  const responsive = breakpoint === undefined
  // Which chrome shows, and when. Only the classes differ between the three
  // cases — the tree below is the same in all of them.
  const rootLayout = responsive
    ? "flex-col lg:flex-row lg:items-start"
    : breakpoint === "desktop"
      ? "flex-row items-start"
      : "flex-col"
  const sidebarClass = responsive ? "hidden lg:flex" : breakpoint === "desktop" ? "flex" : "hidden"
  const mobileTopbarClass = responsive
    ? "flex lg:hidden"
    : breakpoint === "desktop"
      ? "hidden"
      : "flex"
  const { sidebar, topbar, drawer } = chrome({
    sidebar: sidebarClass,
    desktopTopbar: sidebarClass,
    mobileTopbar: mobileTopbarClass,
  })

  const headerFallback = (
    <p className="text-base font-medium leading-6 text-muted-foreground">Page Header</p>
  )
  const contentFallback = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center border-2 border-dashed border-border">
      <p className="text-base font-normal leading-6 text-muted-foreground">Main Content</p>
    </div>
  )

  const headerBlock =
    header !== null ? (
      <div className={cn("flex w-full items-center justify-center px-3 py-6", headerClassName)}>
        {header ?? headerFallback}
      </div>
    ) : null
  // Written once. This is the whole point of the frame.
  const content = (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col px-3 pb-9", contentClassName)}>
      {locationGate ? (
        <LocationAccessGate fallback={<NoLocationAccess className="mt-3" />}>
          {children ?? contentFallback}
        </LocationAccessGate>
      ) : (
        (children ?? contentFallback)
      )}
    </div>
  )

  return (
    <Sheet>
      <div
        data-slot={slot}
        data-breakpoint={responsive ? "responsive" : breakpoint}
        className={cn(
          // `h-dvh`, not `h-screen`: on mobile browsers 100vh is the large
          // viewport, so with the URL bar shown the bottom of the shell sits
          // below the fold and cannot be reached. On desktop the two are equal.
          "relative flex h-dvh w-full overflow-clip",
          rootLayout,
          className,
        )}
        {...props}
      >
        {sidebar}
        <div className="relative z-[1] flex h-full w-full min-w-0 flex-1 flex-col">
          {/* The topbar sits on its own layer above the rounded content frame,
              so dropdowns anchored to it render over the page rather than
              under it. */}
          <div className="relative z-[2] w-full">{topbar}</div>
          <div
            className={cn(
              "relative z-[1] flex w-full flex-1 flex-col overflow-hidden bg-background",
              frameClassName,
              responsive
                ? "rounded-t-2xl lg:rounded-tr-none"
                : breakpoint === "desktop"
                  ? "rounded-tl-2xl"
                  : "rounded-t-2xl",
            )}
          >
            {/* Somebody who holds no location has nothing here to act on, so
                the page's header and content give way to one full-page
                state. For everybody else the gate renders nothing of its own. */}
            {locationGate && headerBlock ? (
              <LocationAccessGate fallback={null}>{headerBlock}</LocationAccessGate>
            ) : (
              headerBlock
            )}
            {content}
          </div>
        </div>

        <SheetContent
          side="left"
          showCloseButton={false}
          inline
          className={cn(
            "data-[side=left]:max-w-[311px]",
            mobileTopbarClass === "hidden" ? "hidden" : undefined,
          )}
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {drawer}
        </SheetContent>
      </div>
    </Sheet>
  )
}
